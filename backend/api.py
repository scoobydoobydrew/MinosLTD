from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from main_script import find_optimal_design
from handle_db import connect_db, fetch_all_component_ids
from pydantic import BaseModel
from typing import Optional
from plagia_opsi import calculate_plagia_opsi
import traceback
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os 



app = FastAPI()

# 1. Ορισμός Μοντέλου Δεδομένων
class ElevatorRequest(BaseModel):
    shaftwidth: float
    shaftdepth: float
    atoma: Optional[int] = None
    thesi_sassi: str
    anoigma_portas: float
    tupos_portas: str
    arithmos_fyllon: Optional[int] = None
    tupos_anoigmatos: Optional[str] = None
    kateuthinsi_anoigmatos: Optional[str] = None
    cabin_doors : Optional[str] = None
    thesi_second_door : Optional[str] = None
    dir_second_door : Optional[str] = None
    vathos_puthmena : float
    ekswteriko_ipsos_thalamou : float
    diadromi_anelkistira : float
    staseis : int


# 2. ΡΥΘΜΙΣΗ CORS
# Επιτρεπόμενες origins από το .env (CORS_ORIGINS, χωρισμένες με κόμμα). Όταν το site καλεί το API μέσω proxy
# στο ίδιο domain, δεν χρειάζεται CORS καθόλου.
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:5000").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

@app.get("/get-doors")
def get_doors():
    db = connect_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
    doors = fetch_all_component_ids(db, "Portes", "Tupos_Portas_ID")
    db.close()
    return {"available_doors": doors}

# 3. ΤΟ ΕΝΙΑΙΟ SOLVE ENDPOINT
@app.post("/solve")
async def solve_elevator(user_data: ElevatorRequest):
    try:
        # Μετατροπή του Pydantic model σε dictionary
        payload = user_data.model_dump()
        
        # Κλήση του Solver
        result = find_optimal_design(payload)
        
        # Έλεγχος αν βρέθηκε λύση (το result περιέχει το best_solution)
        if result and result.get("best_solution"):

            best_katopsi = result["best_solution"]
            
            # Περνάμε ΤΟΣΟ τα user_data ΟΣΟ ΚΑΙ τη best_katopsi στην Πλάγια Όψη!
            plagia_opsi_result = calculate_plagia_opsi(payload, best_katopsi)
            
            
            return {
                "status": "success",
                "data": {
                    "best_solution": result["best_solution"],
                    "plagia_opsi": plagia_opsi_result
                }
            }
        else:
            return {
                "status": "error",
                "message": "Δεν βρέθηκε εφικτή λύση για αυτές τις παραμέτρους.",
                "unsat_causes": result.get("unsat_causes", []) if result else []
            }

    except Exception as e:
        print("====== ΑΝΑΛΥΤΙΚΟ ΣΦΑΛΜΑ ======")
        traceback.print_exc()  # Αυτό θα τυπώσει την ακριβή γραμμή!
        print("==============================")
        raise HTTPException(status_code=500, detail=str(e))

current_dir = os.path.dirname(os.path.abspath(__file__))

# 2. Ψάχνουμε τον φάκελο "frontend" στο ίδιο επίπεδο (αν το api.py είναι στο root)
if os.path.exists(os.path.join(current_dir, "frontend")):
    FRONTEND_DIR = os.path.join(current_dir, "frontend")
# 3. Αν δεν τον βρει, πάει έναν φάκελο πίσω (αν το api.py είναι μέσα στο "backend")
else:
    FRONTEND_DIR = os.path.join(os.path.dirname(current_dir), "frontend")

print(f"[*] Ξεκινάω τον Server! Ο φάκελος Frontend βρέθηκε εδώ: {FRONTEND_DIR}")

# Κάνουμε mount τον φάκελο χρησιμοποιώντας την απόλυτη διαδρομή!
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.get("/")
def read_root():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

if __name__ == "__main__":
    # Η θύρα 8000 είναι του vLLM στο μηχάνημα του agent: προεπιλογή 8002, ρυθμίζεται με API_PORT.
    uvicorn.run(app, host=os.environ.get("API_HOST", "127.0.0.1"), port=int(os.environ.get("API_PORT", "8002")))




    