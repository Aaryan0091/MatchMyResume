# Smart Resume Analyzer

A production-ready NLP-based web application that analyzes resumes against job descriptions and provides actionable insights. Built with React, TypeScript, FastAPI, and advanced NLP libraries.

## Features

- **PDF Resume Upload**: Drag and drop PDF resume files for analysis
- **Job Description Input**: Paste job descriptions to compare against your resume
- **NLP-Powered Analysis**:
  - TF-IDF vectorization for similarity scoring
  - Named Entity Recognition (NER) for skill extraction
  - Custom skills database for comprehensive coverage
  - Match score calculation (0-100%)
- **Visual Results**:
  - Donut chart showing match percentage
  - Green badges for matched skills
  - Red badges for missing skills
  - Actionable improvement suggestions
- **Analysis History**: Store and review past analyses (with Supabase)
- **Fully Responsive**: Professional, clean design with Tailwind CSS

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Vite** - Build tool

### Backend
- **FastAPI** - Web framework
- **pdfplumber** - PDF text extraction
- **NLTK** - Text preprocessing (tokenization, stopwords, punctuation removal)
- **spaCy** - Named Entity Recognition (NER)
- **scikit-learn** - TF-IDF vectorization and cosine similarity
- **Python** - Programming language

### Database (Optional)
- **Supabase** - PostgreSQL-based backend for storing analysis history

## Project Structure

```
/
├── frontend/              # React TypeScript application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── SkillBadge.tsx
│   │   │   ├── ScoreChart.tsx
│   │   │   ├── UploadPanel.tsx
│   │   │   ├── ResultsDashboard.tsx
│   │   │   └── HistoryTable.tsx
│   │   ├── pages/         # Page components
│   │   │   └── Home.tsx
│   │   ├── api/           # API layer
│   │   │   ├── axios.ts
│   │   │   ├── analysis.ts
│   │   │   └── supabase.ts
│   │   ├── types/         # TypeScript interfaces
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env
│
└── backend/              # FastAPI Python application
    ├── main.py           # FastAPI app with routes and CORS
    ├── nlp_pipeline.py   # Complete NLP processing pipeline
    ├── skills_list.py    # Custom skills database
    └── requirements.txt  # Python dependencies
```

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Python 3.9+
- pip (Python package manager)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**

   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

   On Windows:
   ```bash
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Download spaCy English model:**
   ```bash
   python -m spacy download en_core_web_sm
   ```

6. **Start the FastAPI server:**
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`

   API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` if needed:
   ```
   VITE_API_URL=http://localhost:8000
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   **Note**: Supabase is optional. Without it, the app works but history won't persist.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Supabase Setup (Optional - for History Feature)

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project

2. **Create the `analyses` table:**
   - Go to the SQL Editor in Supabase dashboard
   - Run this SQL:
   ```sql
   CREATE TABLE analyses (
     id BIGSERIAL PRIMARY KEY,
     resume_name TEXT NOT NULL,
     match_score INTEGER NOT NULL,
     matched_skills TEXT[] NOT NULL,
     missing_skills TEXT[] NOT NULL,
     suggestions TEXT[] NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Get your credentials:**
   - Go to Project Settings → API
   - Copy your Project URL and anon/public key

4. **Update `.env` in the frontend:**
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Usage

1. **Start both servers:**
   - Backend: `cd backend && python main.py` (port 8000)
   - Frontend: `cd frontend && npm run dev` (port 5173)

2. **Open your browser:**
   - Navigate to `http://localhost:5173`

3. **Analyze a resume:**
   - Drag and drop a PDF resume
   - Paste the job description
   - Click "Analyze Resume"

4. **View results:**
   - Match score as a donut chart
   - Matched skills (green badges)
   - Missing skills (red badges)
   - Actionable suggestions

5. **View history:**
   - Click "View History" to see past analyses
   - Click on any entry to view details

## How It Works

### NLP Pipeline

1. **Text Extraction**: pdfplumber extracts raw text from the PDF resume

2. **Text Cleaning**: NLTK preprocesses text by:
   - Converting to lowercase
   - Tokenizing words
   - Removing stopwords
   - Removing punctuation

3. **Entity Extraction**: spaCy's NER identifies:
   - Organizations
   - Persons
   - Locations
   - Dates

4. **Skill Extraction**: Combined approach using:
   - Custom skills list (comprehensive database)
   - spaCy entities
   - Text matching

5. **Similarity Calculation**: scikit-learn computes:
   - TF-IDF vectors for both texts
   - Cosine similarity between vectors
   - Match score as percentage (0-100)

6. **Gap Analysis**: Set operations identify:
   - Matched skills (intersection)
   - Missing skills (difference)

7. **Suggestions Generation**: Rule-based system provides:
   - Score-based feedback
   - Skill gap recommendations
   - Actionable improvements

## API Endpoints

### `POST /api/analyze`

Analyze a resume against a job description.

**Request:**
- `resume`: PDF file (multipart/form-data)
- `job_description`: Text string

**Response:**
```json
{
  "match_score": 74,
  "matched_skills": ["Python", "React", "MongoDB"],
  "missing_skills": ["Docker", "Kubernetes", "AWS"],
  "suggestions": [
    "Add Docker and Kubernetes to your skills section",
    "Mention any cloud platform experience"
  ],
  "resume_name": "resume.pdf",
  "timestamp": "2024-01-01T12:00:00"
}
```

### `GET /api/analyze/sample`

Returns sample analysis for testing.

### `GET /`

API information and available endpoints.

### `GET /health`

Health check endpoint.

## Development

### Backend Development

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

The server auto-reloads on code changes.

### Frontend Development

```bash
cd frontend
npm run dev
```

Vite provides hot module replacement (HMR).

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

This creates a `dist` folder with optimized production files.

**Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Troubleshooting

### Backend Issues

**"Module not found" errors:**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

**spaCy model error:**
```bash
python -m spacy download en_core_web_sm
```

**PDF extraction fails:**
- Ensure PDF is text-based (not scanned images)
- Check PDF is not corrupted

### Frontend Issues

**"Module not found" errors:**
- Run `npm install`
- Check node_modules exists

**CORS errors:**
- Ensure backend is running
- Check `VITE_API_URL` in `.env`
- Verify CORS settings in `main.py`

**Build errors:**
- Run `npm run build` to see detailed errors
- Check TypeScript types in components

### Supabase Issues

**History not saving:**
- Check credentials in `.env`
- Verify `analyses` table exists
- Check browser console for errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with React, TypeScript, FastAPI, and modern NLP libraries
- Uses spaCy, NLTK, and scikit-learn for text processing
- Styled with Tailwind CSS
- Icons from Heroicons
