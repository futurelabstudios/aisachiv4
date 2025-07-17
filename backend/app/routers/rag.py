# app/routers/rag.py

from fastapi import APIRouter, HTTPException, Body
from app.services.rag_service import query_rag, ingest_pdfs_from_directory
import os

router = APIRouter()

# Define the path to your local PDF directory
# Make sure this directory exists and contains your PDF files.
PDF_DIRECTORY = os.path.join(os.path.dirname(__file__), "..", "..", "data")

@router.post("/query")
async def query_endpoint(query: str = Body(..., embed=True)):
    """
    Accepts a query and returns a RAG-generated answer.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    try:
        answer = query_rag(query)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@router.post("/ingest")
async def ingest_endpoint():
    """
    Triggers the ingestion process for PDF documents in the local 'data' directory.
    """
    if not os.path.exists(PDF_DIRECTORY) or not os.path.isdir(PDF_DIRECTORY):
         raise HTTPException(status_code=404, detail=f"Directory not found: {PDF_DIRECTORY}")

    try:
        ingest_pdfs_from_directory(PDF_DIRECTORY)
        return {"message": "Ingestion process started successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start ingestion: {str(e)}")
