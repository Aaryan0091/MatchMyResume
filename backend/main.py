"""
FastAPI Backend for Smart Resume Analyzer.
This module provides REST API endpoints for resume analysis.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
from datetime import datetime
import traceback

from nlp_pipeline import analyze_resume

# Initialize FastAPI app
app = FastAPI(
    title="Smart Resume Analyzer API",
    description="NLP-based resume analysis and job matching API",
    version="1.0.0"
)

# Configure CORS to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev server ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "message": "Smart Resume Analyzer API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "POST /api/analyze": "Analyze resume against job description",
            "GET /": "API information"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/analyze")
async def analyze_resume_endpoint(
    resume: UploadFile = File(..., description="Resume PDF file"),
    job_description: str = Form(..., description="Job description text")
):
    """
    Analyze a resume against a job description.

    Args:
        resume: PDF file upload containing the resume
        job_description: Text of the job description

    Returns:
        JSON response containing:
        - match_score: Integer (0-100)
        - matched_skills: List of matched skills
        - missing_skills: List of missing skills
        - suggestions: List of improvement suggestions
        - resume_name: Name of the uploaded resume file
        - timestamp: ISO format timestamp of analysis

    Raises:
        HTTPException: If PDF cannot be read or job description is empty
    """
    try:
        # Validate file type
        if not resume.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Please upload a PDF file."
            )

        # Validate job description
        if not job_description or job_description.strip() == "":
            raise HTTPException(
                status_code=400,
                detail="Job description cannot be empty."
            )

        # Read PDF file content
        pdf_bytes = await resume.read()

        # Validate PDF content
        if not pdf_bytes or len(pdf_bytes) < 100:
            raise HTTPException(
                status_code=400,
                detail="PDF file appears to be empty or corrupted."
            )

        # DEBUG: Log the job description received
        print(f"\n{'='*60}")
        print(f"NEW ANALYSIS REQUEST")
        print(f"{'='*60}")
        print(f"Resume File: {resume.filename}")
        print(f"Job Description (first 200 chars): {job_description[:200]}...")
        print(f"Job Description Length: {len(job_description)} chars")
        print(f"{'='*60}\n")

        # Run NLP analysis pipeline
        analysis_result = analyze_resume(pdf_bytes, job_description)

        # Prepare response with enhanced analysis
        response = {
            "match_score": analysis_result["match_score"],
            "matched_skills": analysis_result["matched_skills"],
            "missing_skills": analysis_result["missing_skills"],
            "suggestions": analysis_result["suggestions"],
            "experience_analysis": analysis_result.get("experience_analysis", {}),
            "skill_depth_analysis": analysis_result.get("skill_depth_analysis", {}),
            "soft_skills": analysis_result.get("soft_skills", {}),
            "confidence_level": analysis_result.get("confidence_level", "low"),
            "resume_name": resume.filename,
            "timestamp": datetime.now().isoformat()
        }

        return response

    except ValueError as e:
        # Handle known validation errors
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        # Handle unexpected errors with detailed logging
        error_details = traceback.format_exc()
        print(f"Unexpected error: {error_details}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during analysis: {str(e)}"
        )


@app.get("/api/analyze/sample")
async def sample_analysis():
    """
    Returns a sample analysis response for testing purposes.
    This endpoint can be used to test the frontend without uploading files.
    """
    return {
        "match_score": 74,
        "matched_skills": [
            "Python",
            "JavaScript",
            "React",
            "MongoDB",
            "REST API",
            "Git",
            "Docker"
        ],
        "missing_skills": [
            "Kubernetes",
            "AWS",
            "TypeScript",
            "GraphQL",
            "CI/CD"
        ],
        "suggestions": [
            "Add Docker and Kubernetes experience to your skills section",
            "Mention any cloud platform experience with AWS or GCP",
            "Consider learning TypeScript as it's commonly used with React",
            "Include GraphQL in your backend experience section",
            "Highlight any CI/CD pipeline experience you have",
            "Quantify your achievements with numbers and impact"
        ],
        "resume_name": "sample_resume.pdf",
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn

    # Run the development server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
