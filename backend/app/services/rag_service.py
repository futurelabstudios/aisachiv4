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

        # 4. Vector Storage (in a single batch)
        print(f"Ingesting {len(all_chunks)} chunks into Supabase for {filename}...")
        try:
            supabase.table("documents").insert(all_chunks).execute()
            print(f"Successfully ingested {filename}")
        except Exception as e:
            print(f"Error ingesting {filename}: {e}")


def query_rag(query: str):
    """
    Queries the RAG pipeline to get an answer for a given query.
    """
    # 1. Query Embedding
    query_embedding = get_embedding(query)
    
    # 2. Retrieval
    # Use a stored procedure (rpc call) for similarity search
    retrieved_docs = supabase.rpc(
        "match_documents",
        {"query_embedding": query_embedding, "match_threshold": 0.78, "match_count": 20}
    ).execute().data
    
    if not retrieved_docs:
        return "I couldn't find any relevant information in the documents."

    # 3. Re-ranking
    cross_inp = [[query, doc['content']] for doc in retrieved_docs]
    cross_scores = rerank_model.predict(cross_inp)
    
    # Combine scores and documents
    for doc, score in zip(retrieved_docs, cross_scores):
        doc['rerank_score'] = score
        
    # Sort by new rerank score
    reranked_docs = sorted(retrieved_docs, key=lambda x: x['rerank_score'], reverse=True)
    
    # Select top 3-5 documents
    top_k = 5
    final_context = "\n---\n".join([doc['content'] for doc in reranked_docs[:top_k]])

    # 4. Prompt Formulation & 5. Generation
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
