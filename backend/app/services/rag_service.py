# app/services/rag_service.py

import os
import fitz  # PyMuPDF
from app.core.config import settings
from supabase import create_client, Client
from openai import OpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import CrossEncoder
import numpy as np

# Initialize Supabase and OpenAI clients
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Initialize the re-ranking model
rerank_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

def get_embedding(text, model="text-embedding-3-small"):
   text = text.replace("\n", " ")
   return openai_client.embeddings.create(input = [text], model=model).data[0].embedding

def ingest_pdfs_from_directory(directory_path: str):
    """
    Ingests all PDF documents from a specified directory into Supabase using batch processing.
    """
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    
    for filename in os.listdir(directory_path):
        if not filename.lower().endswith(".pdf"):
            continue

        filepath = os.path.join(directory_path, filename)
        print(f"Processing {filename}...")
        
        # 1. Document Loading
        doc = fitz.open(filepath)
        
        all_chunks = []
        
        for page_num, page in enumerate(doc):
            text = page.get_text()
            if not text.strip():
                continue

            # 2. Text Chunking
            chunks = text_splitter.split_text(text)
            
            for i, chunk_text in enumerate(chunks):
                all_chunks.append({
                    "content": chunk_text,
                    "metadata": {"source": filename, "page": page_num + 1, "chunk": i}
                })
        
        doc.close()

        if not all_chunks:
            print(f"No text found in {filename}. Skipping.")
            continue

        # 3. Embedding Generation (in batches)
        print(f"Generating embeddings for {len(all_chunks)} chunks from {filename}...")
        chunk_contents = [chunk['content'] for chunk in all_chunks]
        
        try:
            embeddings_response = openai_client.embeddings.create(input=chunk_contents, model="text-embedding-3-small")
            embeddings = [item.embedding for item in embeddings_response.data]
            
            # Add embeddings to our chunks
            for i, chunk in enumerate(all_chunks):
                chunk['embedding'] = embeddings[i]

        except Exception as e:
            print(f"Error generating embeddings for {filename}: {e}")
            continue # Skip to the next file

        # 4. Vector Storage (in batches)
        print(f"Ingesting {len(all_chunks)} chunks into Supabase for {filename}...")
        batch_size = 100
        total_batches = (len(all_chunks) + batch_size - 1) // batch_size

        try:
            for i in range(0, len(all_chunks), batch_size):
                batch = all_chunks[i:i + batch_size]
                current_batch_num = (i // batch_size) + 1
                print(f"  - Ingesting batch {current_batch_num} of {total_batches} for {filename}...")
                supabase.table("documents").insert(batch).execute()
            
            print(f"Successfully ingested {filename}")
        except Exception as e:
            print(f"Error ingesting data for {filename}: {e}")


def get_rag_context(query: str, top_k: int = 5) -> str | None:
    """
    Retrieves and re-ranks context from documents based on a query.
    Returns a formatted context string or None if no relevant documents are found.
    This function is more robust and includes detailed logging.
    """
    try:
        # 1. Query Embedding
        query_embedding = get_embedding(query)
        print(f"RAG DEBUG: {query} Query embedding: {query_embedding[0]}")
        # 2. Retrieval from Supabase
        retrieved_docs = supabase.rpc(
            "match_documents",
            {"query_embedding": query_embedding, "match_threshold": 0.5, "match_count": 100}
        ).execute().data
        
        # Log the retrieved documents
        print(f"RAG DEBUG: Retrieved {len(retrieved_docs)} docs from Supabase.")

        if not retrieved_docs or not isinstance(retrieved_docs, list):
            print("RAG DEBUG: No valid documents returned from Supabase.")
            return None

        # 3. Re-ranking
        cross_inp = [[query, doc.get('content', '')] for doc in retrieved_docs]
        cross_scores = rerank_model.predict(cross_inp)
        
        for doc, score in zip(retrieved_docs, cross_scores):
            doc['rerank_score'] = score
            
        reranked_docs = sorted(retrieved_docs, key=lambda x: x.get('rerank_score', 0), reverse=True)
        
        # 4. Format final context from top K documents
        top_docs = reranked_docs[:top_k]
        final_context = "\n---\n".join([doc['content'] for doc in top_docs if doc.get('content')])

        # Final check to ensure we return a non-empty string or None
        if final_context.strip():
            print(f"RAG DEBUG: Final context length: {len(final_context)}")
            return final_context
        else:
            print("RAG DEBUG: Final context is empty after processing.")
            return None
            
    except Exception as e:
        print(f"RAG ERROR: An unexpected error occurred in get_rag_context: {e}")
        return None


def query_rag(query: str):
    """
    Queries the RAG pipeline to get a direct answer for a given query.
    This is now a wrapper around get_rag_context and the OpenAI API.
    """
    # 1. Retrieve RAG context
    final_context = get_rag_context(query)
    
    # 2. Handle case where no context is found
    if final_context is None:
        return "I couldn't find any relevant information in the documents."

    # 3. Prompt Formulation & Generation
    prompt = f"""
    You are an expert assistant. Use the following context to answer the question at the end. 
    If you don't know the answer from the context provided, just say that you don't know. Do not make up an answer.

    Context:
    ---
    {final_context}
    ---

    Question: {query}

    Answer:
    """
    
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content
