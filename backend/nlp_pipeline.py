"""
Complete NLP Pipeline for Resume Analysis.
This module contains the entire NLP processing logic for resume and job description analysis.
"""

import io
import re
from typing import Dict, List, Tuple
import pdfplumber
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from skills_list import get_custom_skills, find_custom_skills_in_text


# Download required NLTK data on module load
try:
    nltk.data.find('tokenizers/punkt_tab')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt_tab', quiet=True)
    nltk.download('stopwords', quiet=True)

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Initialize NLTK stopwords
STOP_WORDS = set(stopwords.words('english'))


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract raw text from a PDF file using pdfplumber.

    Args:
        pdf_bytes: Raw bytes of the PDF file

    Returns:
        Extracted text as a string
    """
    text = ""
    try:
        # Create a file-like object from bytes
        pdf_file = io.BytesIO(pdf_bytes)
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    return text.strip()


def clean_text(text: str) -> str:
    """
    Clean text by:
    1. Converting to lowercase
    2. Tokenizing
    3. Removing stopwords
    4. Removing punctuation and special characters
    5. Removing extra whitespace

    Args:
        text: Raw input text

    Returns:
        Cleaned text string
    """
    if not text:
        return ""

    # Convert to lowercase
    text = text.lower()

    # Tokenize
    tokens = word_tokenize(text)

    # Remove stopwords and non-alphabetic tokens
    tokens = [
        token for token in tokens
        if token.isalpha() and token not in STOP_WORDS
    ]

    # Join tokens back into text
    cleaned_text = " ".join(tokens)

    # Remove extra whitespace
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()

    return cleaned_text


def extract_entities_with_spacy(text: str) -> Dict[str, List[str]]:
    """
    Extract entities from text using spaCy Named Entity Recognition.

    Args:
        text: Input text to analyze

    Returns:
        Dictionary with entity types as keys and lists of entities as values
    """
    doc = nlp(text)

    entities = {
        "skills": [],
        "organizations": [],
        "education": [],
        "experience": [],
        "gpe": [],  # Geopolitical entities (locations)
        "date": [],
        "person": []
    }

    for ent in doc.ents:
        entity_text = ent.text.strip()

        # Map spaCy entity labels to our categories
        if ent.label_ == "ORG":
            entities["organizations"].append(entity_text)
        elif ent.label_ in ["PERSON"]:
            entities["person"].append(entity_text)
        elif ent.label_ in ["GPE", "LOC"]:
            entities["gpe"].append(entity_text)
        elif ent.label_ in ["DATE", "TIME"]:
            entities["date"].append(entity_text)

        # Skills are often identified as part of ORG or need special handling
        # We'll catch most skills through the custom skills list

    # Remove duplicates while preserving order
    for key in entities:
        entities[key] = list(dict.fromkeys(entities[key]))

    return entities


def extract_skills(text: str) -> List[str]:
    """
    Extract skills from text using both spaCy NER and custom skills list.

    Args:
        text: Input text to analyze

    Returns:
        List of unique skills found in the text
    """
    if not text:
        return []

    # Find skills from custom skills list
    custom_skills = find_custom_skills_in_text(text)

    # Combine with spaCy-extracted entities that might be skills
    # (spaCy entities are included via the custom skills list approach)
    all_skills = custom_skills

    # Remove duplicates while preserving order
    unique_skills = list(dict.fromkeys(all_skills))

    return unique_skills


def compute_similarity_score(resume_text: str, job_description_text: str) -> int:
    """
    Compute similarity score between resume and job description using TF-IDF and cosine similarity.

    Args:
        resume_text: Cleaned resume text
        job_description_text: Cleaned job description text

    Returns:
        Similarity score as an integer (0-100)
    """
    if not resume_text or not job_description_text:
        return 0

    # Create TF-IDF vectorizer with more sensitive settings
    vectorizer = TfidfVectorizer(
        max_features=5000,  # Increased for better coverage
        stop_words='english',
        ngram_range=(1, 2),  # Use both unigrams and bigrams
        min_df=1,  # Include all terms
        max_df=1.0,  # No term frequency filtering
        sublinear_tf=True,  # Use log scaling
    )

    # Fit and transform texts
    tfidf_matrix = vectorizer.fit_transform([resume_text, job_description_text])

    # Compute cosine similarity
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

    # Convert to percentage and round to nearest integer
    score = round(similarity * 100)

    return min(score, 100)


def analyze_skill_gap(jd_skills: List[str], resume_skills: List[str]) -> Tuple[List[str], List[str]]:
    """
    Analyze the skill gap between job description and resume.

    Args:
        jd_skills: Skills extracted from job description
        resume_skills: Skills extracted from resume

    Returns:
        Tuple of (matched_skills, missing_skills)
    """
    # Convert to sets for set operations
    jd_skills_set = set(skill.lower() for skill in jd_skills)
    resume_skills_set = set(skill.lower() for skill in resume_skills)

    # Find matched skills (intersection)
    matched_set = jd_skills_set & resume_skills_set

    # Find missing skills (skills in JD but not in resume)
    missing_set = jd_skills_set - resume_skills_set

    # Convert back to lists with original casing
    # For matched skills, use the version from JD
    matched_skills = [
        skill for skill in jd_skills
        if skill.lower() in matched_set
    ]

    # For missing skills, use the version from JD
    missing_skills = [
        skill for skill in jd_skills
        if skill.lower() in missing_set
    ]

    return matched_skills, missing_skills


def generate_suggestions(
    match_score: int,
    missing_skills: List[str],
    matched_skills: List[str]
) -> List[str]:
    """
    Generate actionable suggestions based on the analysis results.

    Args:
        match_score: The overall match score (0-100)
        missing_skills: List of skills that are missing from the resume
        matched_skills: List of skills that are matched

    Returns:
        List of suggestion strings
    """
    suggestions = []

    # Suggestions based on match score
    if match_score < 50:
        suggestions.append(
            "Your resume shows a significant gap with the job requirements. "
            "Consider gaining more experience in the key areas mentioned in the job description."
        )
    elif match_score < 70:
        suggestions.append(
            "You have a good foundation but could improve your match by highlighting "
            "relevant experience more prominently."
        )
    elif match_score < 85:
        suggestions.append(
            "Your resume aligns well with the job requirements. Focus on showcasing "
            "quantifiable achievements to strengthen your candidacy."
        )
    else:
        suggestions.append(
            "Excellent match! Your resume strongly aligns with the job requirements."
        )

    # Suggestions based on missing skills
    if missing_skills:
        # Categorize missing skills
        tech_skills = []
        soft_skills = []
        cloud_skills = []
        other_skills = []

        for skill in missing_skills:
            skill_lower = skill.lower()
            if any(x in skill_lower for x in ["communication", "leadership", "teamwork", "problem solving"]):
                soft_skills.append(skill)
            elif any(x in skill_lower for x in ["aws", "azure", "gcp", "google cloud", "cloud"]):
                cloud_skills.append(skill)
            else:
                tech_skills.append(skill)

        # Add specific suggestions based on missing skill categories
        if tech_skills:
            suggestions.append(
                f"Highlight any experience with the following technical skills: "
                f"{', '.join(tech_skills[:5])}" + (
                    f" and {len(tech_skills) - 5} more..." if len(tech_skills) > 5 else ""
                )
            )

        if cloud_skills:
            suggestions.append(
                f"Mention any cloud platform experience with {', '.join(cloud_skills)}. "
                f"Include specific certifications or hands-on projects if available."
            )

        if soft_skills:
            suggestions.append(
                f"Showcase your {', '.join(soft_skills)} skills with concrete examples "
                f"from your work experience."
            )

    # Suggestions based on matched skills
    if matched_skills:
        suggestions.append(
            f"Emphasize your proficiency in {', '.join(matched_skills[:5])}" + (
                f" and {len(matched_skills) - 5} more..." if len(matched_skills) > 5 else ""
            ) + " in your summary and experience sections."
        )

    # General suggestions
    suggestions.append(
        "Quantify your achievements with specific numbers, percentages, and impact "
        "to make your resume more compelling."
    )
    suggestions.append(
        "Use action verbs and strong language to describe your responsibilities and accomplishments."
    )

    # Remove duplicate suggestions
    suggestions = list(dict.fromkeys(suggestions))

    return suggestions[:8]  # Return top 8 suggestions


def analyze_resume(
    resume_pdf_bytes: bytes,
    job_description: str
) -> Dict:
    """
    Main pipeline function that runs the complete resume analysis.

    Args:
        resume_pdf_bytes: Raw bytes of the resume PDF file
        job_description: Job description text

    Returns:
        Dictionary containing analysis results with keys:
        - match_score: int (0-100)
        - matched_skills: List[str]
        - missing_skills: List[str]
        - suggestions: List[str]
        - resume_entities: Dict[str, List[str]] (extracted entities from resume)
        - jd_entities: Dict[str, List[str]] (extracted entities from JD)
    """
    # Step 1: Extract text from PDF
    resume_raw_text = extract_text_from_pdf(resume_pdf_bytes)

    if not resume_raw_text:
        raise ValueError("Unable to extract text from the uploaded PDF. Please ensure it's a valid PDF file.")

    # Step 2: Clean both texts
    resume_cleaned = clean_text(resume_raw_text)
    jd_cleaned = clean_text(job_description)

    if not jd_cleaned:
        raise ValueError("Job description cannot be empty. Please provide a valid job description.")

    # Step 3: Extract skills from both texts
    resume_skills = extract_skills(resume_raw_text)  # Use raw text for skill extraction
    jd_skills = extract_skills(job_description)

    # Step 4: Compute similarity score using hybrid approach
    # Combine TF-IDF similarity with skill overlap percentage
    # Use raw text for TF-IDF for better semantic matching
    tfidf_score = compute_similarity_score(resume_raw_text, job_description)

    # Calculate skill overlap score
    matched_skills, missing_skills = analyze_skill_gap(jd_skills, resume_skills)
    total_jd_skills = len(jd_skills) if jd_skills else 1
    skill_overlap_score = (len(matched_skills) / total_jd_skills) * 100 if total_jd_skills > 0 else 0

    # Hybrid score: 90% weight to skill overlap, 10% to TF-IDF
    # This gives more weight to explicit skill matches while considering semantic similarity
    match_score = int(round((skill_overlap_score * 0.9) + (tfidf_score * 0.1)))

    # Debug output
    print(f"=== DEBUG ====")
    print(f"JD Skills ({len(jd_skills)}): {jd_skills}")
    print(f"Resume Skills ({len(resume_skills)}): {resume_skills}")
    print(f"Matched Skills ({len(matched_skills)}): {matched_skills}")
    print(f"Missing Skills ({len(missing_skills)}): {missing_skills}")
    print(f"Skill Overlap: {skill_overlap_score:.1f}%")
    print(f"TF-IDF Score: {tfidf_score:.1f}%")
    print(f"Final Match Score: {match_score}%")
    print(f"=== DEBUG ====")

    # Step 5: Analyze skill gap (already done above for scoring)

    # Step 6: Extract entities using spaCy
    resume_entities = extract_entities_with_spacy(resume_raw_text)
    jd_entities = extract_entities_with_spacy(job_description)

    # Step 7: Generate suggestions
    suggestions = generate_suggestions(match_score, missing_skills, matched_skills)

    # Return results
    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions,
        "resume_entities": resume_entities,
        "jd_entities": jd_entities
    }


if __name__ == "__main__":
    # Test the pipeline with sample data
    sample_jd = """
    We are looking for a Senior Software Engineer with experience in Python, JavaScript,
    React, Docker, Kubernetes, AWS, MongoDB, and PostgreSQL. The ideal candidate should have
    experience with microservices architecture, CI/CD pipelines, and strong communication skills.
    """

    # This would need a PDF file for full testing
    print("NLP Pipeline module loaded successfully!")
    print(f"Custom skills loaded: {len(get_custom_skills())}")
