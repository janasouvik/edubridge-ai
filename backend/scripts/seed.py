"""
Seed script — populates initial scholarship records and study materials.
Run from the backend/ root directory:
    python3 scripts/seed.py
"""
import sys
import os
import json
from datetime import date

# Ensure backend root is on path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.db import SessionLocal
from models.models import Scholarship, StudyMaterial, DocumentChunk
from ai.embeddings import generate_embedding

db = SessionLocal()

# ------------------------------------------------------------------ #
# 1. Scholarships
# ------------------------------------------------------------------ #

scholarships_data = [
    {
        "name": "National Means-cum-Merit Scholarship (NMMS)",
        "provider": "Ministry of Education, Government of India",
        "description": "Scholarship for meritorious students from economically weaker sections to prevent dropout at Class 8.",
        "eligibility": "Class 8 students with minimum 55% marks. Annual family income must not exceed ₹1,50,000.",
        "income_limit": 150000.0,
        "minimum_grade": "8",
        "category": "General",
        "state": "All",
        "deadline": date(2026, 11, 30),
        "application_url": "https://scholarships.gov.in/",
    },
    {
        "name": "Central Sector Scheme of Scholarships (CSSS)",
        "provider": "Ministry of Education, Government of India",
        "description": "Scholarship for college and university students who have passed Class 12.",
        "eligibility": "Scored above 80th percentile in Class 12. Family income less than ₹4,50,000 per annum.",
        "income_limit": 450000.0,
        "minimum_grade": "12",
        "category": "General",
        "state": "All",
        "deadline": date(2026, 10, 31),
        "application_url": "https://scholarships.gov.in/",
    },
    {
        "name": "Pre-Matric Scholarship for Minorities",
        "provider": "Ministry of Minority Affairs, Government of India",
        "description": "Financial assistance to minority community students studying in Classes 1 to 10.",
        "eligibility": "Students from Muslim, Christian, Sikh, Buddhist, Jain, or Zoroastrian communities. Income below ₹1,00,000.",
        "income_limit": 100000.0,
        "minimum_grade": "1",
        "category": "Minority",
        "state": "All",
        "deadline": date(2026, 9, 30),
        "application_url": "https://scholarships.gov.in/",
    },
    {
        "name": "Post-Matric Scholarship for SC Students",
        "provider": "Ministry of Social Justice & Empowerment",
        "description": "Scholarship for Scheduled Caste students pursuing post-matriculation education.",
        "eligibility": "SC students. Family income less than ₹2,50,000 per annum.",
        "income_limit": 250000.0,
        "minimum_grade": "10",
        "category": "SC",
        "state": "All",
        "deadline": date(2026, 10, 15),
        "application_url": "https://scholarships.gov.in/",
    },
    {
        "name": "Inspire Scholarship (SHE)",
        "provider": "Department of Science and Technology, Government of India",
        "description": "Scholarship for students pursuing Natural/Basic Sciences at BSc and MSc level.",
        "eligibility": "Top 1% in Class 12 board exams. Pursuing BSc/MSc in Natural Science.",
        "income_limit": None,
        "minimum_grade": "12",
        "category": "General",
        "state": "All",
        "deadline": date(2026, 12, 31),
        "application_url": "https://online-inspire.gov.in/",
    },
    {
        "name": "Pragati Scholarship (AICTE) for Girls",
        "provider": "AICTE",
        "description": "Scholarship to support girl students pursuing technical education.",
        "eligibility": "Girl students admitted to AICTE-approved degree or diploma programme. Family income less than ₹8,00,000 per annum.",
        "income_limit": 800000.0,
        "minimum_grade": "12",
        "category": "General",
        "state": "All",
        "deadline": date(2026, 11, 15),
        "application_url": "https://www.aicte-india.org/schemes/students-development-schemes/Pragati-Scholarship",
    },
    {
        "name": "Swami Vivekananda Merit-cum-Means Scholarship (West Bengal)",
        "provider": "Government of West Bengal",
        "description": "State scholarship for meritorious students from economically backward families in West Bengal.",
        "eligibility": "West Bengal domicile. Minimum 60% in Class 12 or equivalent. Income below ₹2,50,000.",
        "income_limit": 250000.0,
        "minimum_grade": "12",
        "category": "General",
        "state": "West Bengal",
        "deadline": date(2026, 10, 31),
        "application_url": "https://svmcm.wbhed.gov.in/",
    },
    {
        "name": "Vidyadhan Scholarship",
        "provider": "Sarojini Damodaran Foundation",
        "description": "Scholarship for Class 10 pass students from financially challenged backgrounds.",
        "eligibility": "Class 10 passed with 80%+. Family income below ₹2,00,000.",
        "income_limit": 200000.0,
        "minimum_grade": "10",
        "category": "General",
        "state": "All",
        "deadline": date(2026, 9, 15),
        "application_url": "https://vidyadhan.org/",
    },
]

for s in scholarships_data:
    existing = db.query(Scholarship).filter(Scholarship.name == s["name"]).first()
    if not existing:
        db.add(Scholarship(**s))

db.commit()
print(f"✅ Seeded {len(scholarships_data)} scholarships")


# ------------------------------------------------------------------ #
# 2. Study Materials + DocumentChunks with Embeddings
# ------------------------------------------------------------------ #

study_materials_data = [
    {
        "title": "NCERT Science Class 8 — Chapter 1: Crop Production and Management",
        "source_name": "NCERT",
        "source_url": "https://ncert.nic.in/textbook.php?hesc1=0-6",
        "subject": "Science",
        "topic": "Agriculture",
        "chapter": "Crop Production and Management",
        "content": """Agricultural practices involve careful preparation of soil, sowing seeds, adding manure and fertilizers, irrigation, weeding, harvesting, and storage.
Kharif crops are sown during summer/rainy season (June–September). Examples: paddy, maize, soybean, groundnut.
Rabi crops are sown in winter (October–November) and harvested in March–April. Examples: wheat, gram, peas, mustard.
Soil preparation: Ploughing loosens and turns the soil. It allows roots to penetrate and increases water retention. A ploughed field is broken into smaller clumps using a leveller.
Seeds of good quality that are clean and healthy are selected for sowing. Germination percentage should be high.
Irrigation is the supply of water to crops at appropriate intervals. Methods: moat, chain pump, dhekli, rahat (for traditional), and sprinkler and drip systems (for modern).
Fertilizers are chemical substances rich in nitrogen, phosphorus, and potassium. Manure is natural organic matter from plants and animal waste, which improves soil texture.
Harvesting is the cutting of mature crop. It is done manually with sickle or by combine harvester machine.""",
    },
    {
        "title": "NCERT Mathematics Class 10 — Quadratic Equations",
        "source_name": "NCERT",
        "source_url": "https://ncert.nic.in/textbook.php?jemh1=0-15",
        "subject": "Mathematics",
        "topic": "Quadratic Equations",
        "chapter": "Quadratic Equations",
        "content": """A quadratic equation is an equation of the form ax² + bx + c = 0, where a ≠ 0 and a, b, c are real numbers.
The discriminant of a quadratic equation ax² + bx + c = 0 is D = b² - 4ac.
If D > 0: two distinct real roots. If D = 0: two equal real roots. If D < 0: no real roots (complex roots).
The quadratic formula for roots is: x = (-b ± √(b² - 4ac)) / 2a.
Factorisation method: Split the middle term. For x² + 5x + 6 = 0, find two numbers that multiply to 6 and add to 5 → 2 and 3. So (x+2)(x+3) = 0. Roots are x = -2 and x = -3.
Completing the square: x² + bx + c = 0 → (x + b/2)² = b²/4 - c.
A quadratic equation always has exactly two roots (counting multiplicity) by the fundamental theorem of algebra.
Word problems involving quadratic equations often involve area, speed-distance, or number problems.""",
    },
    {
        "title": "NCERT Mathematics Class 10 — Probability",
        "source_name": "NCERT",
        "source_url": "https://ncert.nic.in/textbook.php?jemh1=0-15",
        "subject": "Mathematics",
        "topic": "Probability",
        "chapter": "Probability",
        "content": """Probability is the measure of the likelihood that an event will occur.
P(E) = Number of favourable outcomes / Total number of outcomes. It always lies between 0 and 1.
P(E) = 0 means the event is impossible. P(E) = 1 means the event is certain.
Complementary events: P(not E) = 1 - P(E). For example, if P(rain) = 0.3, then P(no rain) = 0.7.
A die has 6 faces numbered 1 to 6. A fair coin has two outcomes: Head (H) or Tail (T).
If a coin is tossed once: P(Head) = 1/2, P(Tail) = 1/2.
If a die is rolled once: P(getting a 6) = 1/6. P(getting an even number) = 3/6 = 1/2.
A deck of cards has 52 cards: 4 suits (♠ ♥ ♦ ♣), each with 13 cards (Ace, 2–10, Jack, Queen, King).
Equally likely outcomes have the same probability of occurring.
Empirical (experimental) probability: P(E) = Number of times E occurred / Total number of trials.""",
    },
    {
        "title": "NCERT Science Class 10 — Chapter 6: Life Processes — Photosynthesis",
        "source_name": "NCERT",
        "source_url": "https://ncert.nic.in/textbook.php?jesc1=0-16",
        "subject": "Biology",
        "topic": "Photosynthesis",
        "chapter": "Life Processes",
        "content": """Photosynthesis is the process by which green plants, algae, and some bacteria manufacture food using sunlight.
The chemical equation for photosynthesis: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ (glucose) + 6O₂.
Chlorophyll is the green pigment found in chloroplasts that absorbs light energy (mainly red and blue wavelengths).
The two stages of photosynthesis are: (1) Light reactions (Light-dependent): occur in thylakoids, water is split, ATP and NADPH are produced, oxygen is released. (2) Dark reactions (Calvin Cycle/Light-independent): occur in stroma, CO₂ is fixed using ATP and NADPH to produce glucose.
Factors affecting photosynthesis: light intensity, CO₂ concentration, temperature, water availability, and chlorophyll content.
Stomata are small pores on leaves that allow CO₂ to enter and O₂ to exit. Guard cells control the opening and closing of stomata.
Leaves are adapted for photosynthesis: they are flat (large surface area), have a thin transparent epidermis, and contain numerous chloroplasts.""",
    },
    {
        "title": "NCERT Science Class 10 — Newton's Laws of Motion",
        "source_name": "NCERT",
        "source_url": "https://ncert.nic.in/textbook.php?jesc1=0-16",
        "subject": "Physics",
        "topic": "Laws of Motion",
        "chapter": "Laws of Motion",
        "content": """Newton's First Law (Law of Inertia): An object at rest stays at rest, and an object in motion stays in motion at constant velocity unless acted upon by an external net force. Inertia is the tendency to resist change in motion.
Newton's Second Law: Force = mass × acceleration (F = ma). The acceleration of an object is directly proportional to the net force and inversely proportional to its mass.
Newton's Third Law: For every action, there is an equal and opposite reaction. Forces always come in pairs.
Momentum (p) = mass (m) × velocity (v). Unit: kg·m/s. Newton's second law can also be written as F = Δp/Δt (rate of change of momentum).
Law of conservation of momentum: Total momentum of a closed system remains constant if no external force acts on it.
Applications: Rocket propulsion (Newton's third law), seatbelts reduce force during collision by increasing time, friction, braking distance.
Weight (W) = mg where g = 9.8 m/s² (acceleration due to gravity). Mass is a scalar; weight is a vector (force).""",
    },
]

for mat_data in study_materials_data:
    existing = db.query(StudyMaterial).filter(StudyMaterial.title == mat_data["title"]).first()
    if existing:
        print(f"⏭️  Already seeded: {mat_data['title'][:50]}")
        continue

    material = StudyMaterial(**mat_data)
    db.add(material)
    db.flush()

    # Chunk the content into paragraphs and embed
    paragraphs = [p.strip() for p in mat_data["content"].split("\n") if p.strip()]
    for para in paragraphs:
        try:
            embedding_vec = generate_embedding(para)
            chunk = DocumentChunk(
                study_material_id=material.id,
                chunk_text=para,
                embedding=json.dumps(embedding_vec),
            )
            db.add(chunk)
        except Exception as e:
            print(f"  ⚠️  Embedding failed for chunk: {e}")

    db.commit()
    print(f"✅ Seeded material: {mat_data['title'][:60]} ({len(paragraphs)} chunks)")

db.close()
print("\n🎉 Seed complete!")
