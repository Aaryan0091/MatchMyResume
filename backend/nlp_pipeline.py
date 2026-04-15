"""
Complete NLP Pipeline for Resume Analysis.
This module contains the entire NLP processing logic for resume and job description analysis.
"""

import io
import re
from typing import Dict, List, Tuple, Optional
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


def extract_experience_level(text: str) -> Dict[str, any]:
    """
    Extract experience level indicators from text.
    Returns estimated years of experience, seniority level, and confidence.

    Args:
        text: Resume or job description text

    Returns:
        Dictionary with experience level information
    """
    text_lower = text.lower()

    # Extract years of experience
    years_patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|work)',
        r'experience:\s*(\d+)\+?\s*years?',
        r'worked\s*for\s*(\d+)\+?\s*years?',
        r'(\d+)\s*years?\s*(?:professional|total)?\s*experience',
    ]

    years_of_experience = None
    for pattern in years_patterns:
        match = re.search(pattern, text_lower)
        if match:
            years_of_experience = int(match.group(1))
            break

    # Determine seniority level from titles and descriptions
    seniority_keywords = {
        'executive': ['ceo', 'cto', 'cfo', 'chief', 'executive', 'vp', 'vice president'],
        'senior': ['senior', 'lead', 'principal', 'staff', 'architect', 'head of'],
        'mid': ['mid-level', 'midlevel', 'experienced', 'software engineer ii', 'engineer ii'],
        'junior': ['junior', 'entry', 'entry-level', 'associate', 'intern', 'trainee']
    }

    detected_seniority = None
    seniority_scores = {'executive': 4, 'senior': 3, 'mid': 2, 'junior': 1}

    for level, keywords in seniority_keywords.items():
        for keyword in keywords:
            if keyword in text_lower:
                # More specific patterns get priority
                if f'{keyword} ' in text_lower or f' {keyword}' in text_lower:
                    detected_seniority = level
                    break
        if detected_seniority:
            break

    # Infer seniority from years if not explicitly stated
    if not detected_seniority and years_of_experience:
        if years_of_experience >= 10:
            detected_seniority = 'senior'
        elif years_of_experience >= 5:
            detected_seniority = 'mid'
        elif years_of_experience >= 1:
            detected_seniority = 'junior'

    # Look for quantified achievements (indicates stronger experience)
    achievement_patterns = [
        r'increased\s+\w+\s+by\s+\d+%',
        r'reduced\s+\w+\s+by\s+\d+%',
        r'managed\s+\d+\s+people',
        r'led\s+a\s+team\s+of\s+\d+',
        r'built\s+\w+\s+from\s+scratch',
        r'deployed\s+to\s+\d+\s+users',
        r'saved\s+\$\d+',
        r'\$\d+\s+budget',
    ]

    achievement_count = sum(1 for pattern in achievement_patterns if re.search(pattern, text_lower))

    return {
        'years_of_experience': years_of_experience,
        'seniority_level': detected_seniority,
        'seniority_score': seniority_scores.get(detected_seniority, 0),
        'achievement_count': achievement_count,
        'has_quantified_achievements': achievement_count >= 3
    }


def analyze_skill_depth(text: str, skills: List[str]) -> Dict[str, int]:
    """
    Analyze how extensively each skill is mentioned in the text.
    Returns a dictionary mapping each skill to a depth score (1-5).

    Args:
        text: Resume text to analyze
        skills: List of skills to analyze

    Returns:
        Dictionary with skill depth scores
    """
    text_lower = text.lower()
    skill_depth = {}

    for skill in skills:
        skill_lower = skill.lower()

        # Count occurrences
        count = text_lower.count(skill_lower)

        # Check for context indicators of depth
        context_patterns = {
            5: [r'expert\s+in', r'specialist\s+in', r'architect', r'led.*team'],
            4: [r'senior.*developer', r'years?\s*of.*experience', r'proficient\s+in'],
            3: [r'experience\s+with', r'worked\s+with', r'used.*for', r'built.*using'],
            2: [r'familiar\s+with', r'knowledge\s+of', r'understanding\s+of'],
            1: [r'learning', r'interested\s+in', r'want\s+to\s+learn']
        }

        depth_score = 1  # Default: minimal depth

        # Check context patterns (higher patterns override lower)
        for depth, patterns in context_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    depth_score = max(depth_score, depth)
                    break

        # Adjust based on count
        if count >= 5:
            depth_score = max(depth_score, 4)
        elif count >= 3:
            depth_score = max(depth_score, 3)
        elif count >= 2:
            depth_score = max(depth_score, 2)

        skill_depth[skill] = min(5, depth_score)

    return skill_depth


def extract_soft_skills(text: str) -> Dict[str, List[str]]:
    """
    Extract soft skills indicators from text.
    Returns categorized soft skills with evidence.

    Args:
        text: Resume or job description text

    Returns:
        Dictionary with soft skill categories and detected skills
    """
    text_lower = text.lower()

    soft_skills = {
        'leadership': ['led', 'managed', 'supervised', 'directed', 'head of', 'team lead',
                      'mentor', 'coached', 'guided', 'oversaw', 'responsible for'],
        'communication': ['presented', 'communicated', 'collaborated', 'coordinated',
                         'negotiated', 'interfaced', 'liaised', 'explained', 'documented'],
        'problem_solving': ['solved', 'resolved', 'troubleshooted', 'fixed', 'debugged',
                            'optimized', 'improved', 'streamlined', 'reduced', 'increased'],
        'teamwork': ['collaborated', 'team', 'cooperated', 'worked with', 'paired',
                    'cross-functional', 'agile', 'scrum', 'sprint'],
        'initiative': ['initiated', 'proposed', 'created', 'founded', 'launched',
                      'developed', 'implemented', 'introduced', 'pioneered'],
        'adaptability': ['adapted', 'learned', 'mastered', 'quickly', 'fast learner',
                        'versatile', 'flexible', 'pivoted']
    }

    detected = {category: [] for category in soft_skills}

    for category, keywords in soft_skills.items():
        for keyword in keywords:
            # Look for the keyword as a whole word
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, text_lower):
                detected[category].append(keyword)

    # Remove duplicates
    for category in detected:
        detected[category] = list(set(detected[category]))

    return detected


def check_experience_match(resume_exp: Dict, jd_exp: Dict) -> float:
    """
    Calculate how well the candidate's experience matches job requirements.
    Returns a score between 0 and 1.

    Args:
        resume_exp: Experience level extracted from resume
        jd_exp: Experience level extracted from job description

    Returns:
        Experience match score (0-1)
    """
    if not jd_exp['seniority_level'] or not resume_exp['seniority_level']:
        return 0.5  # Neutral if can't determine

    resume_score = resume_exp['seniority_score']
    jd_score = jd_exp['seniority_score']

    # Perfect match or one level higher is ideal
    if resume_score >= jd_score:
        return 1.0 if resume_score == jd_score else 0.9
    # One level lower is okay but not ideal
    elif resume_score == jd_score - 1:
        return 0.7
    # Two levels lower is concerning
    elif resume_score == jd_score - 2:
        return 0.3
    # More than two levels lower is a mismatch
    else:
        return 0.1


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
    Enhanced main pipeline function that runs comprehensive resume analysis.
    Now includes experience level matching, skill depth analysis, and soft skills.

    Args:
        resume_pdf_bytes: Raw bytes of the resume PDF file
        job_description: Job description text

    Returns:
        Dictionary containing analysis results with keys:
        - match_score: int (0-100)
        - matched_skills: List[str]
        - missing_skills: List[str]
        - suggestions: List[str]
        - resume_entities: Dict[str, List[str]]
        - jd_entities: Dict[str, List[str]]
        - experience_analysis: Dict with experience level info
        - skill_depth_analysis: Dict with skill depth scores
        - soft_skills: Dict with soft skill categories
        - confidence_level: str (low, medium, high)
    """
    # Step 1: Extract text from PDF
    resume_raw_text = extract_text_from_pdf(resume_pdf_bytes)

    if not resume_raw_text:
        raise ValueError("Unable to extract text from the uploaded PDF. Please ensure it's a valid PDF file.")

    # Step 2: Clean both texts
    jd_cleaned = clean_text(job_description)

    if not jd_cleaned:
        raise ValueError("Job description cannot be empty. Please provide a valid job description.")

    # Step 3: Extract skills from both texts
    resume_skills = extract_skills(resume_raw_text)
    jd_skills = extract_skills(job_description)

    # Step 4: Extract experience levels
    resume_experience = extract_experience_level(resume_raw_text)
    jd_experience = extract_experience_level(job_description)

    # Step 5: Analyze skill depth
    resume_skill_depth = analyze_skill_depth(resume_raw_text, resume_skills)

    # Step 6: Extract soft skills
    resume_soft_skills = extract_soft_skills(resume_raw_text)
    jd_soft_skills = extract_soft_skills(job_description)

    # Step 7: Calculate skill overlap with WEIGHTED and DEPTH-AWARE scoring
    matched_skills, missing_skills = analyze_skill_gap(jd_skills, resume_skills)

    def get_skill_weight(skill: str) -> float:
        """Return weight for a skill based on its importance."""
        skill_lower = skill.lower()

        # CRITICAL: Core programming languages - 3.0 weight
        critical_keywords = [
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust',
            'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql'
        ]
        if any(lang in skill_lower for lang in critical_keywords):
            return 3.0

        # HIGH: Core frameworks and databases - 2.0 weight
        high_keywords = [
            'django', 'flask', 'fastapi', 'spring boot', 'spring', 'ruby on rails',
            'rails', 'laravel', 'express', 'react', 'angular', 'vue', 'svelte',
            'next.js', 'nuxt.js', 'postgresql', 'mongodb', 'mysql', 'redis',
            'elasticsearch', 'cassandra', 'oracle'
        ]
        if any(hi in skill_lower for hi in high_keywords):
            return 2.0

        # MEDIUM: Specific technical tools - 1.0 weight
        medium_keywords = [
            'graphql', 'kafka', 'rabbitmq', 'spark', 'hadoop', 'tensorflow',
            'pytorch', 'pandas', 'numpy', 'hibernate', 'jpa', 'entity framework',
            'prisma', 'sequelize', 'typeorm', 'mongoose', 'docker', 'kubernetes'
        ]
        if any(med in skill_lower for med in medium_keywords):
            return 1.0

        # LOW: Generic infrastructure/tools - 0.5 weight
        low_keywords = [
            'git', 'github', 'gitlab', 'aws', 'azure', 'gcp', 'rest api', 'rest',
            'webpack', 'vite', 'npm', 'yarn', 'maven', 'gradle', 'jenkins'
        ]
        if any(lo in skill_lower for lo in low_keywords):
            return 0.5

        return 1.0

    # Calculate weighted scores with depth consideration
    jd_weighted_total = 0
    matched_weighted_total = 0

    for skill in jd_skills:
        skill_weight = get_skill_weight(skill)
        jd_weighted_total += skill_weight

    for skill in matched_skills:
        skill_weight = get_skill_weight(skill)
        # Adjust weight by skill depth (1-5 scale)
        depth_multiplier = resume_skill_depth.get(skill, 1) / 2.5  # Normalize to 0.2-2.0 range
        matched_weighted_total += skill_weight * depth_multiplier

    # Calculate base weighted match percentage
    base_score = (matched_weighted_total / jd_weighted_total * 100) if jd_weighted_total > 0 else 0

    # Step 8: Calculate experience match score
    experience_match_score = check_experience_match(resume_experience, jd_experience)

    # Step 9: Calculate soft skills match
    soft_skill_categories = ['leadership', 'communication', 'problem_solving', 'teamwork', 'initiative', 'adaptability']
    soft_skill_matches = 0
    soft_skill_total = 0

    for category in soft_skill_categories:
        if jd_soft_skills.get(category):  # JD requires this soft skill
            soft_skill_total += 1
            if resume_soft_skills.get(category):  # Candidate has it
                soft_skill_matches += 1

    soft_skill_match_ratio = soft_skill_matches / soft_skill_total if soft_skill_total > 0 else 0.5

    # Step 10: Calculate FINAL COMPREHENSIVE SCORE
    # Components:
    # - Technical skills (depth-aware): 50% weight
    # - Experience level match: 30% weight
    # - Soft skills: 20% weight

    if len(jd_skills) == 0 and len(jd_skills) == 0:
        # No technical skills in JD - score based on experience/soft skills only
        technical_score = 50  # Neutral baseline
    elif len(matched_skills) == 0:
        technical_score = 0
    else:
        # Apply skill ratio ranges with depth-aware scoring
        skills_matched_ratio = len(matched_skills) / len(jd_skills)

        if skills_matched_ratio == 1.0:
            technical_score = 100
        elif skills_matched_ratio >= 0.8:
            technical_score = int(round(85 + (base_score * 0.15)))
        elif skills_matched_ratio >= 0.5:
            technical_score = int(round(50 + (base_score * 0.34)))
        elif skills_matched_ratio >= 0.2:
            technical_score = int(round(20 + (base_score * 0.30)))
        else:
            technical_score = int(round(10 + (base_score * 0.10)))

        technical_score = max(0, min(100, technical_score))

    # Apply depth penalty if skills are shallow
    if matched_skills and len(matched_skills) > 0:
        avg_depth = sum(resume_skill_depth.get(skill, 1) for skill in matched_skills) / len(matched_skills)
        if avg_depth < 2.5:  # Skills are shallow
            technical_score = int(technical_score * 0.8)  # 20% penalty
        elif avg_depth < 3.5:  # Skills are moderate
            technical_score = int(technical_score * 0.95)  # 5% penalty

    # Calculate final composite score
    final_score = (
        (technical_score * 0.50) +
        (experience_match_score * 100 * 0.30) +
        (soft_skill_match_ratio * 100 * 0.20)
    )
    match_score = int(round(final_score))
    match_score = max(0, min(100, match_score))

    # CRITICAL FIX: Never allow 100% if there are missing skills
    if missing_skills and len(jd_skills) > 0:
        # Calculate how many skills are missing as a percentage
        missing_ratio = len(missing_skills) / len(jd_skills)
        # Cap the maximum score based on missing skills
        # If 20% of skills are missing, max score is 80%
        # If 50% of skills are missing, max score is 50%
        max_possible_score = int(round((1 - missing_ratio) * 100))
        # Ensure the score doesn't exceed the max possible
        match_score = min(match_score, max_possible_score)
        # Also ensure at least some score is given (minimum 10% if any skills match)
        if len(matched_skills) > 0:
            match_score = max(match_score, 10)

    # Step 11: Determine confidence level
    if resume_experience['has_quantified_achievements'] and len(matched_skills) >= 5:
        confidence = 'high'
    elif resume_experience['years_of_experience'] and len(matched_skills) >= 3:
        confidence = 'medium'
    else:
        confidence = 'low'

    # Debug output with enhanced information
    print(f"=== ENHANCED DEBUG ====")
    print(f"Job Description (first 150 chars): {job_description[:150]}")
    print(f"\n--- SKILLS ---")
    print(f"JD Skills ({len(jd_skills)}): {jd_skills}")
    print(f"Matched Skills ({len(matched_skills)}): {matched_skills}")
    print(f"Missing Skills ({len(missing_skills)}): {missing_skills}")
    print(f"Skill Depth Analysis:")
    for skill, depth in list(resume_skill_depth.items())[:5]:
        print(f"  {skill}: depth={depth}/5")
    print(f"\n--- EXPERIENCE ---")
    print(f"Resume: {resume_experience['seniority_level']} ({resume_experience['years_of_experience']} years)")
    print(f"JD: {jd_experience['seniority_level']}")
    print(f"Experience Match: {experience_match_score:.0%}")
    print(f"\n--- SCORING ---")
    print(f"Technical Score: {technical_score}%")
    print(f"Experience Contribution: {experience_match_score * 100 * 0.30:.1f}%")
    print(f"Soft Skills Contribution: {soft_skill_match_ratio * 100 * 0.20:.1f}%")
    print(f"FINAL SCORE: {match_score}%")
    print(f"Confidence Level: {confidence}")
    print(f"=== ENHANCED DEBUG ====")

    # Step 12: Extract entities using spaCy
    resume_entities = extract_entities_with_spacy(resume_raw_text)
    jd_entities = extract_entities_with_spacy(job_description)

    # Step 13: Generate suggestions
    suggestions = generate_suggestions(match_score, missing_skills, matched_skills)

    # Return comprehensive results
    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions,
        "resume_entities": resume_entities,
        "jd_entities": jd_entities,
        "experience_analysis": {
            "resume": resume_experience,
            "job": jd_experience,
            "match_score": experience_match_score
        },
        "skill_depth_analysis": resume_skill_depth,
        "soft_skills": {
            "resume": resume_soft_skills,
            "job": jd_soft_skills
        },
        "confidence_level": confidence
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
