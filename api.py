from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from main_script import find_optimal_design
from handle_db import connect_db, fetch_all_component_ids

app = FastAPI()

# ΡΥΘΜΙΣΗ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Στην παραγωγή βάζουμε το συγκεκριμένο URL του site
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "online", "message": "Elevator API is running"}

# endpoint για πόρτες
@app.get("/get-doors")
def get_doors():
    db = connect_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    
    doors = fetch_all_component_ids(db, "Portes", "Tupos_Portas_ID")
    db.close()
    return {"available_doors": doors}

# endpoint για τον solver με error handling
@app.post("/solve")
def solve_elevator(user_data: dict):
    try:
        result = find_optimal_design(user_data)
        
        if result is None or result == "unsat":
            return {
                "status": "no_solution",
                "message": "Δεν βρέθηκε βέλτιστη λύση. Δοκιμάστε να αλλάξετε τις διαστάσεις ή τον τύπο πόρτας."
            }
        
        return {"status": "success", "data": result}

    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail="Εσωτερικό σφάλμα διακομιστή.")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)