from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from main_script import find_optimal_design
from handle_db import connect_db, fetch_all_component_ids
from pydantic import BaseModel
from typing import Optional

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

# 2. ΡΥΘΜΙΣΗ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "online", "message": "Elevator API is running"}

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
            
            
            return {
                "status": "success",
                "data": {
                    "best_solution": result["best_solution"]
                }
            }
        else:
            return {
                "status": "error",
                "message": "Δεν βρέθηκε εφικτή λύση για αυτές τις παραμέτρους.",
                "unsat_causes": result.get("unsat_causes", []) if result else []
            }

    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
    