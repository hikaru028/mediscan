type Categories = {
    [key: string]: string[]
};

export const categories: Categories = {
    "Brand": [
        "Brand A", "Brand B", "Brand C", "Brand D", "Brand E", "Brand F", "Brand G", "Brand H",
    ],
    "Therapeutic": [
        "Analgesics", "Antibiotics", "Antivirals", "Antifungals", "Antihistamines", "Antidepressants", "Antipsychotics", "Antihypertensives", "Diuretics", "Antidiabetics", "Statins", "Bronchodilators", "Corticosteroids", "Anticoagulants", "Immunosuppressants"
    ],
    "Formulation": [
        "Tablets", "Capsules", "Syrups", "Injections", "Creams/Ointments", "Inhalers", "Suppositories"
    ],
    "Systemic": [
        "Cardiovascular System", "Respiratory System", "Digestive System", "Nervous System", "Musculoskeletal System", "Endocrine System", "Urinary System", "Reproductive System", "Immune System"
    ],
    "Usage Duration": [
        "Acute", "Chronic", "PRN"
    ],
    "Prescription Status": [
        "Prescription-Only Medicines (POM)", "Over-The-Counter Medicines (OTC)", "Controlled Substances"
    ],
    "Target Population": [
        "Adults", "Paediatrics", "Geriatrics", "Pregnant/Breastfeeding Women"
    ],
    "Drug Classes": [
        "Beta-blockers", "ACE Inhibitors", "SSRIs", "NSAIDs", "Benzodiazepines", "Opioids"
    ]
};