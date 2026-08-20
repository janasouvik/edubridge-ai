import json
import re
from models.models import Student
from ai.llm import generate_text

def generate_study_materials(student: Student, level: str = "school") -> list[dict]:
    """
    Generates tailored study materials based on the student's grade/stream using Gemini.
    """
    grade = student.grade or "10"
    stream = student.learning_level or "General"
    
    if level == "higher_ed":
        target_audience = "an Undergraduate / Postgraduate university student"
    else:
        target_audience = f"a student in Grade: '{grade}' and Stream/Domain: '{stream}'"
    
    # We ask the LLM to output Wikipedia titles directly. 
    prompt = f"""You are an educational AI creating a curriculum study guide.
Based on {target_audience}, recommend exactly 6 highly relevant, fundamental study topics across core subjects.
For each topic, provide a title, the subject name, a brief 1-sentence summary, and the exact Wikipedia article title that covers this topic.

Format the output STRICTLY as a raw JSON array of objects, with NO Markdown wrapping (no ```json).
Each object must have exactly these keys:
"title" (string, the title of the material)
"subject" (string, the subject category)
"summary" (string, 1-2 sentence description)
"wikipedia_title" (string, the exact Wikipedia page title for this topic)
"topics" (array of 2-3 short string tags/keywords)
"""
    
    try:
        raw_response = generate_text(prompt)
        match = re.search(r'\[.*\]', raw_response, re.DOTALL)
        if not match:
            raise ValueError("Failed to find JSON array in LLM response.")
            
        materials = json.loads(match.group(0))
        
        for idx, mat in enumerate(materials):
            mat["id"] = idx + 1
            mat["source"] = "Wikipedia"
            wiki_title = mat.get("wikipedia_title", "").replace(" ", "_")
            mat["url"] = f"https://en.wikipedia.org/wiki/{wiki_title}"
            mat["chapter"] = mat["title"]
            mat["book_url"] = "https://ncert.nic.in/" if level == "school" else "https://openstax.org/"
            
        return materials
    except Exception as e:
        print(f"LLM generation failed, using Wikipedia fallback: {e}")
        from ai.web_search import _get_wikipedia_summary
        
        fallback_queries = []
        if level == "higher_ed":
            fallback_queries = [stream, f"History of {stream}", f"Glossary of {stream}", "Scientific method", "Research", "Statistics"]
        else:
            fallback_queries = [f"Grade {grade} Mathematics", f"Grade {grade} Science", "Basic English", "World History", "Geography", "Grammar"]
            
        # Clean up fallback queries to make them better for Wikipedia
        fallback_queries = [q for q in fallback_queries if q]
        
        fallback_materials = []
        for idx, q in enumerate(fallback_queries[:6]):
            wiki = _get_wikipedia_summary(q)
            if wiki:
                fallback_materials.append({
                    "id": idx + 1,
                    "title": wiki["title"],
                    "subject": "General Core",
                    "summary": wiki["extract"][:180] + "...",
                    "url": wiki["url"],
                    "source": "Wikipedia",
                    "chapter": wiki["title"],
                    "topics": [q],
                    "book_url": "https://ncert.nic.in/" if level == "school" else "https://openstax.org/"
                })
        
        if fallback_materials:
            return fallback_materials
            
        raise ValueError("Failed to generate materials via LLM and Fallback.")
