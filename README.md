Ο πίνακας ου έσβησα από την βάση 



CREATE TABLE Elevator_Designs (
Design_ID INT PRIMARY KEY AUTO_INCREMENT,
Elevator_type VARCHAR(30) NOT NULL,
Elevator_speed DECIMAL(3,1) NOT NULL,
Rated_Weight INT NOT NULL,
Apovaro INT  NOT NULL,
Anartisi_sasi ENUM('Amesi', '1:1', '2:1 panw', '2:1 katw', '4:1'),
Topothesia_emvolou VARCHAR(30) NOT NULL,
-- STOIXEIA FREATIOU
Platos_freatiou INT NOT NULL,
Vathos_freatiou INT NOT NULL,
Vathos_puthmena INT NOT NULL,
Ipsos_tel_orofou INT NOT NULL,
Diadromi_elevator INT NOT NULL,
Arithmos_stasewn INT NOT NULL,
Yliko_freatiou VARCHAR(20) NOT NULL,
Apostasi_ar_lampa INT NOT NULL,
Apostasi_dek_lampa INT NOT NULL,
-- STOIXEIA SASSI
Sassi_ID VARCHAR(50) NOT NULL,
Anoigma_odhgwn INT NOT NULL,
Tupos_odhgou VARCHAR(10) NOT NULL,
Apostasi_toixou_odhgou_x INT NOT NULL,
Apostasi_toixou_odhgou_y_1 INT NOT NULL,
Apostasi_toixou_odhgou_y_2 INT NOT NULL,
Apostasi_thalamou_odhgou INT NOT NULL,
-- STOIXEIA THALAMOU
Platos_thalamou INT NOT NULL,
Vathos_Thalamou INT NOT NULL,
Eks_ipsos_thalamou INT NOT NULL,
Apostasi_thalamou_toixou_x INT NOT NULL,
Apostasi_thalamou_toixou_y INT NOT NULL,
Emvadon_thalamou INT NOT NULL,
-- STOIXEIA EMVOLOU
Tupos_emvolou VARCHAR(20) NOT NULL,
-- Foreign Keys
FOREIGN KEY (Sassi_ID) REFERENCES Sassi(Sassi_ID),
FOREIGN KEY (Tupos_emvolou) REFERENCES Emvola(Tupos_Emvolou),
FOREIGN KEY (Tupos_odhgou) REFERENCES Odhgoi(Tupos_Odhgou)
);





παραμετροι json για το execute 
  "shaftwidth": 3000,
  "shaftdepth": 3000,
  "qLoad": 450,
  "thesi_sassi": "side",
  "anoigma_portas": 800,
  "tupos_portas": "Αυτόματη",
  "arithmos_fyllon": 2,
  "tupos_anoigmatos": "Κεντρικό"


δουλεύει για φρεάτιο 1400 και πάνω κολλαει στα εξαρτήματα

  from handle_db import connect_db,  fetch_component_data, fetch_all_component_ids, fetch_suitable_stirigma, fetch_max_wall_bracket, fetch_suitable_door_ids, fetch_sassi_by_weight
from z3 import *
import itertools




def get_constraint_solver(thesi_sassi):
    if thesi_sassi == 'side':
        from solver_constraints_side import apply_constraints as side_apply_constraints
        return side_apply_constraints
    
    # Ελέγχουμε για 'rear' γιατί αυτό στέλνει η JavaScript
    elif thesi_sassi == 'rear':
        from solver_constraints_rear import apply_constraints as rear_apply_constraints
        return rear_apply_constraints
    
    else:
        # Προσθέτουμε την τιμή στο μήνυμα σφάλματος για να ξέρεις τι πήγε λάθος
        raise ValueError(f"Μη έγκυρη θέση Σασί: {thesi_sassi}")



def find_optimal_design(data_from_api):
   
    user_inputs = {
     'Platos_freatiou': float(data_from_api.get('shaftwidth', 0)),
     'Vathos_freatiou': float(data_from_api.get('shaftdepth', 0)),
     'Onomasthiko_Varos': float(data_from_api.get('qLoad', 0)),
     'Thesi_Sassi': data_from_api.get('thesi_sassi'),
     'Anoigma_portas': float(data_from_api.get('anoigma_portas')),
     'Tupos_Portas': data_from_api.get('tupos_portas'),
     'Arithmos_Fyllon': float(data_from_api.get('arithmos_fyllon')) if data_from_api.get('tupos_portas') == 'Αυτόματη' else None,
     'Tupos_Anoigmatos': data_from_api.get('tupos_anoigmatos') if data_from_api.get('tupos_portas') == 'Αυτόματη' else None
    }
    
    door_type = user_inputs.get('Tupos_Portas')
    required_opening_type = user_inputs.get('Tupos_Anoigmatos') 
    thesi_sassi = user_inputs.get('Thesi_Sassi')
    arithmos_fyllon = user_inputs.get('Arithmos_Fyllon')
    raw_thesi = data_from_api.get('thesi_sassi') 
    
    
    if raw_thesi == 'side':
        thesi_sassi = 'Αριστερά' 
    elif raw_thesi == 'rear':
        thesi_sassi = 'Πίσω'
    else:
        thesi_sassi = raw_thesi
    
    db = connect_db()
    if not db:
        return "Connection Failed"
    
    try:
        apply_constraints = get_constraint_solver(raw_thesi)
    except ValueError as e:
        print(f"Σφάλμα: {e}")
        db.close()
        return "Constraint Load Error"

    print(" Φόρτωση διαθέσιμων εξαρτημάτων...")
    

    required_opening_type = user_inputs.get('Tupos_Anoigmatos')


    if thesi_sassi == 'Πίσω' and door_type == 'Αυτόματη':    
        required_opening_type = 'Κεντρικό'
    
    elif thesi_sassi in ['Αριστερά', 'Δεξιά'] and door_type == 'Αυτόματη':
        required_opening_type = 'Πλαϊνό'

    

    # Προσδιορισμός Σεναρίου
    # Αν το API στέλνει 'atoma', τότε πάμε στο Σενάριο 1
    atoma = data_from_api.get('atoma') 

    def get_area_from_standard(atoma):

        standards = {
            1: 370000,   
            2: 580000,   
            3: 700000,   
            4: 900000,   
            5: 1170000,  
            6: 1300000,  
            7: 1450000,
            8: 1600000,
            9: 1750000,
            10: 1860000,
            11: 1920000,
            12: 2200000,
            13: 2400000,
            14: 2500000,
            15: 2650000,
            16: 2800000,
            18: 3100000,
            19: 3250000,
            20: 3400000,
            21:3560000,
            24: 3880000
       }
        return standards.get(int(atoma), 0)
    
    if atoma:
        # Σενάριο 1: Σταθερό εμβαδόν βάσει προτύπου 
        user_inputs['scenario'] = 'fixed_area'
        user_inputs['required_area'] = get_area_from_standard(atoma) 
        sassi_options = fetch_sassi_by_weight(db, atoma)
    else:
        # Σενάριο 2: Μέγιστη δυνατή καμπίνα
        user_inputs['scenario'] = 'max_area'
        sassi_options = fetch_all_component_ids(db, 'Sassi', 'Sassi_ID')


    try:
        odhgoi_options = fetch_all_component_ids(db, 'Odhgoi', 'Tupos_odhgou_ID')
        anoigma_portas = user_inputs['Anoigma_portas']
        door_options = fetch_suitable_door_ids(db, anoigma_portas, door_type, user_inputs.get('Arithmos_Fyllon'), required_opening_type)
   
    except Exception as e:
        print(f"Σφάλμα φόρτωσης ID εξαρτημάτων: {e}")
        db.close()
        return "ID Fetch Error"
    
    if not door_options:
        return "unsat - Δεν βρέθηκε κατάλληλη πόρτα για το άνοιγμα."


    # Δημιουργία όλων των πιθανών συνδυασμών 
    all_combinations = itertools.product(sassi_options, odhgoi_options, door_options)
    
    # Αρχικοποίηση για την καλύτερη λύση
    best_solution = None
    max_cabin_area = -1
    best_combination = None
    
    total_combinations = len(sassi_options) * len(odhgoi_options)
    print(f" Βρέθηκαν {total_combinations} πιθανοί συνδυασμοί για δοκιμή.")

    last_unsat_causes = []
    # Επαναληπτική Επίλυση 
    for sassi_id, odhgoi_id, door_id in all_combinations:
        
        
        current_inputs = user_inputs.copy()
        current_inputs['Sassi_ID'] = sassi_id
        current_inputs['Tupos_Odhgou'] = odhgoi_id
        current_inputs['Porta_ID_for_Solver'] = door_id
        
        
      
        result = solve_elevator_design(db, current_inputs, apply_constraints) 
        
        best_sassi_size = 0 
        this_sassi_data = fetch_component_data(db, 'Sassi', current_inputs['Sassi_ID'], 'Sassi_ID')
    # Μέσα στο loop (μετά το result = solve_...)
        if isinstance(result, dict) and result.get("status") != "unsat":
            current_area = float(result.get('cabin_area', 0))
            current_sassi_size = float(this_sassi_data['Size'])
        
        # Αν η νέα καμπίνα είναι μεγαλύτερη ή ΙΔΙΑ αλλά με μεγαλύτερο σασί
            if current_area > max_cabin_area or \
                (abs(current_area - max_cabin_area) < 100 and current_sassi_size > best_sassi_size):
                max_cabin_area = current_area
                best_sassi_size = current_sassi_size
                best_solution = result
                best_combination = (sassi_id, odhgoi_id)
        
        # Έλεγχος αν ΔΕΝ βρέθηκε λύση (UNSAT) για να πάρουμε την αιτία
        elif isinstance(result, dict) and result.get("status") == "unsat":
            last_unsat_causes = result.get("causes", []) # Αποθήκευσε το core για το swagger
        
        
    db.close()
    final_output =  {"best_solution": best_solution, "combination": best_combination, "max_area": max_cabin_area, "unsat_causes": last_unsat_causes}
    return final_output
    



    
def solve_elevator_design(db, user_inputs, apply_constraints):
    current_inputs = user_inputs.copy()
    sassi_data = fetch_component_data(db, 'Sassi', current_inputs['Sassi_ID'], 'Sassi_ID')
    odhgoi_data = fetch_component_data(db, 'Odhgoi', current_inputs['Tupos_Odhgou'], 'Tupos_odhgou_ID')
    door_data = fetch_component_data(db, 'Portes', current_inputs['Porta_ID_for_Solver'], 'Tupos_Portas_ID')
    sthrigma_data = fetch_suitable_stirigma(db, sassi_data['Distance_wall_guiderail_min'])

    PAHOS_PORTAS_CONST = 0
    DOOR_SIDE_BRACKET = None
    OPPOSITE_SIDE_BRACKET = None
    DEKSIA_SIDE_BRACKET = None
    ARISTERA_SIDE_BRACKET = None

    
    if not sassi_data or not door_data or not odhgoi_data:
        return "unsat"
    
    # Επιλογή στηρίγματος
    DOOR_TYPE = current_inputs.get('Tupos_Portas')
    MIN_DIST_SASSI = float(sassi_data['Distance_wall_guiderail_min'])


    G_portas = float(door_data['G_portas'])
    CO_portas= float(door_data['CO_portas'])
    PAHOS_PORTAS_CONST_DB = float(door_data['Pahos_Portas'])
    Vathos_freatiou = float(current_inputs['Vathos_freatiou'])
    Anoigma_odhgwn = float(sassi_data['Size'])
    h1 = float(odhgoi_data['h1']) 
    pahos_sthrigmatos_min = sthrigma_data['Pahos_Min']
    pahos_sthrigmatos_max = sthrigma_data['Pahos_Max']
    APOSTASI_Y_CRITERIA = (Vathos_freatiou - Anoigma_odhgwn) / 2 # είναι η απόσταση μέχρι την μύτη του οδηγού
    APOSTASI_Y_CRITERIA_AUTOMATH= (Vathos_freatiou - PAHOS_PORTAS_CONST_DB - Anoigma_odhgwn) / 2 
    threshold = 190.0
    apostasi_gia_wall_bracket_min = (h1 + pahos_sthrigmatos_min)
    apostasi_gia_wall_bracket_max = (h1 + pahos_sthrigmatos_max)

    normal_bracket_data = fetch_suitable_stirigma(db, MIN_DIST_SASSI)
    wall_bracket_data = fetch_max_wall_bracket(db, apostasi_gia_wall_bracket_min, apostasi_gia_wall_bracket_max) 

    if not normal_bracket_data:
        return "unsat"
    

    current_inputs = user_inputs.copy()

    Platos_freatiou = current_inputs['Platos_freatiou'] 
    Vathos_freatiou = current_inputs['Vathos_freatiou']
    thesi_sassi = current_inputs.get('Thesi_Sassi')

    
    if thesi_sassi == 'Πίσω':
    
        
        APOSTASI_X_CRITERIA_REAR = (Platos_freatiou - Anoigma_odhgwn) / 2 

    
        if APOSTASI_X_CRITERIA_REAR >= threshold:
            DEKSIA_SIDE_BRACKET = normal_bracket_data
            ARISTERA_SIDE_BRACKET = normal_bracket_data
        else:
            DEKSIA_SIDE_BRACKET = wall_bracket_data
            ARISTERA_SIDE_BRACKET = wall_bracket_data
    
        if DOOR_TYPE == 'Αυτόματη':
            PAHOS_PORTAS_CONST = PAHOS_PORTAS_CONST_DB
        else:
            PAHOS_PORTAS_CONST = 0
    
   
    else:


        if normal_bracket_data:
            if DOOR_TYPE == 'Ημιαυτόματη' and APOSTASI_Y_CRITERIA >= threshold:
                DOOR_SIDE_BRACKET = normal_bracket_data
                OPPOSITE_SIDE_BRACKET = normal_bracket_data
                PAHOS_PORTAS_CONST = 0
        

            elif DOOR_TYPE == 'Ημιαυτόματη' and APOSTASI_Y_CRITERIA < threshold:
                DOOR_SIDE_BRACKET = wall_bracket_data
                OPPOSITE_SIDE_BRACKET = wall_bracket_data
                PAHOS_PORTAS_CONST = 0
             

           
            elif DOOR_TYPE == 'Αυτόματη' and APOSTASI_Y_CRITERIA_AUTOMATH >= threshold:
                DOOR_SIDE_BRACKET = normal_bracket_data 
                OPPOSITE_SIDE_BRACKET = normal_bracket_data
                PAHOS_PORTAS_CONST = PAHOS_PORTAS_CONST_DB
            

        
            elif DOOR_TYPE == 'Αυτόματη' and APOSTASI_Y_CRITERIA_AUTOMATH < threshold:
                DOOR_SIDE_BRACKET = normal_bracket_data
                OPPOSITE_SIDE_BRACKET = wall_bracket_data
                PAHOS_PORTAS_CONST = PAHOS_PORTAS_CONST_DB
            

    if thesi_sassi == 'Πίσω':
        if DEKSIA_SIDE_BRACKET is None or ARISTERA_SIDE_BRACKET is None:
            return {"status": "unsat", "causes": ["No suitable Rear Brackets found"]}
    else:
        if DOOR_SIDE_BRACKET is None or OPPOSITE_SIDE_BRACKET is None:
            return {"status": "unsat", "causes": ["No suitable Side Brackets found"]}
    

    solver = Optimize()
    

    # Ορισμός SMT μεταβλητών (οι άγνωστοι)
    Apostasi_ar_lampa = Int('Apostasi_ar_lampa')
    Apostasi_dek_lampa = Int('Apostasi_dek_lampa')
    Apostasi_toixou_odhgou_x = Int('Apostasi_toixou_odhgou_x')
    Apostasi_toixou_odhgou_y_1 = Int('Apostasi_toixou_odhgou_y_1')
    Apostasi_toixou_odhgou_y_2 = Int('Apostasi_toixou_odhgou_y_2')
    Apostasi_thalamou_odhgou = Int('Apostasi_thalamou_odhgou')
    Platos_thalamou = Int('Platos_thalamou')
    Vathos_Thalamou = Int('Vathos_Thalamou')
    Eks_ipsos_thalamou = Int('Eks_ipsos_thalamou')
    Apostasi_thalamou_toixou_x = Int('Apostasi_thalamou_toixou_x')
    Apostasi_thalamou_toixou_y = Int('Apostasi_thalamou_toixou_y')
    Emvadon_thalamou = Int('Emvadon_thalamou')
    Use_normal_bracket = Bool('Use_normal_braket')
    Apostasi_lampa_y = Int('Apostasi_lampa_y')
    pahos_sthrigmatos_door_var = Int('pahos_sthrigmatos_door_var')
    pahos_sthrigmatos_opp_var = Int('pahos_sthrigmatos_opp_var')
    Apostasi_thalamou_toixou_ar_rear = Int('Apostasi_thalamou_toixou_ar_rear') # το πρώτο χρησιμοποιώ στ script, το δεύτερο δίνει ο z3 στη μεταβλητή μέσα στον εγκέφαλο και με αυτο θα μου επιστρέψει τιμή
    Apostasi_thalamou_toixou_dek_rear = Int('Apostasi_thalamou_toixou_dek_rear')
    Apostasi_toixou_odhgou_y_rear = Int('Apostasi_toixou_odhgou_y_rear')
    Apostasi_thalamou_odhgou_rear = Int('Apostasi_thalamou_odhgou_rear')
    Apostasi_toixou_odhgou_x_dek_rear = Int('Apostasi_toixou_odhgou_x_dek_rear') # είναι μέχρι την βάση του στηρίγματος
    Apostasi_toixou_odhgou_x_ar_rear = Int('Apostasi_toixou_odhgou_x_ar_rear')
    pahos_sthrigmatos_rear = Int('pahos_sthrigmatos_rear')


    
   
    
    solver.add(Emvadon_thalamou == Platos_thalamou * Vathos_Thalamou)

    apply_constraints(solver, current_inputs, sassi_data, sthrigma_data, odhgoi_data, door_data, DOOR_SIDE_BRACKET, OPPOSITE_SIDE_BRACKET,
                      Apostasi_ar_lampa, Apostasi_dek_lampa, sassi_data['Size'], Apostasi_lampa_y,
                      Apostasi_toixou_odhgou_x, Apostasi_toixou_odhgou_y_1, 
                      Apostasi_toixou_odhgou_y_2, Apostasi_thalamou_odhgou, 
                      Platos_thalamou, Vathos_Thalamou, Eks_ipsos_thalamou, 
                      Apostasi_thalamou_toixou_x, Apostasi_thalamou_toixou_y, 
                      Use_normal_bracket, PAHOS_PORTAS_CONST, G_portas, CO_portas,
                      pahos_sthrigmatos_door_var, pahos_sthrigmatos_opp_var, Apostasi_thalamou_toixou_ar_rear, 
                      Apostasi_thalamou_toixou_dek_rear, Apostasi_toixou_odhgou_y_rear, Apostasi_thalamou_odhgou_rear, 
                      Apostasi_toixou_odhgou_x_dek_rear, Apostasi_toixou_odhgou_x_ar_rear, DEKSIA_SIDE_BRACKET, ARISTERA_SIDE_BRACKET, 
                      pahos_sthrigmatos_rear
                    )
    
    
    solver.maximize(Platos_thalamou + Vathos_Thalamou)
    

    # Επίλυση και εξαγωγή αποτελεσμάτων 
    if solver.check() == sat:
        model = solver.model()
        
        
        def safe_val(var):
            evaluated = model.evaluate(var)
            # Αν η Z3 επέστρεψε την ίδια τη μεταβλητή (σημαίνει ότι δεν έχει τιμή στο μοντέλο)
            if str(evaluated) == str(var):
                return "0.00"
            try:
                return evaluated.as_decimal(2)
            except:
                return str(evaluated)

        
        if current_inputs.get('Thesi_Sassi') == 'rear':
            result = {
                "cabin_area": safe_val(Emvadon_thalamou),
                "Platos_thalamou": safe_val(Platos_thalamou),
                "Vathos_Thalamou": safe_val(Vathos_Thalamou),
                "Apostasi_toixou_odhgou_y_rear": safe_val(Apostasi_toixou_odhgou_y_rear),
                "Anoigma_odhgwn": str(sassi_data['Size']), # Σταθερή τιμή από τη βάση
                "Apostasi_thalamou_odhgou_rear": safe_val(Apostasi_thalamou_odhgou_rear),
                "Apostasi_toixou_odhgou_x_dek_rear": safe_val(Apostasi_toixou_odhgou_x_dek_rear),
                "Apostasi_toixou_odhgou_x_ar_rear": safe_val(Apostasi_toixou_odhgou_x_ar_rear),
                "Apostasi_ar_lampa": safe_val(Apostasi_ar_lampa), 
                "Apostasi_dek_lampa": safe_val(Apostasi_dek_lampa),
                "Apostasi_lampa_y": safe_val(Apostasi_lampa_y),
                "Apostasi_thalamou_toixou_ar_rear": safe_val(Apostasi_thalamou_toixou_ar_rear),
                "Apostasi_thalamou_toixou_dek_rear": safe_val(Apostasi_thalamou_toixou_dek_rear),
                "Apostasi_toixou_odhgou_y_rear": safe_val(Apostasi_toixou_odhgou_y_rear),
                "Bracket_Door_Side": DOOR_SIDE_BRACKET['Sthrigma_ID'] if DOOR_SIDE_BRACKET else "None",
                "Bracket_Opposite_Side": OPPOSITE_SIDE_BRACKET['Sthrigma_ID'] if OPPOSITE_SIDE_BRACKET else "None"
                
                
                
            }
        else: 
            result = {
                "cabin_area": safe_val(Emvadon_thalamou),
                "Platos_thalamou": safe_val(Platos_thalamou),
                "Vathos_Thalamou": safe_val(Vathos_Thalamou),
                "Apostasi_toixou_odhgou_y1": safe_val(Apostasi_toixou_odhgou_y_1),
                "Apostasi_toixou_odhgou_y2": safe_val(Apostasi_toixou_odhgou_y_2),
                "Anoigma_odhgwn": str(sassi_data['Size']), # Σταθερή τιμή από τη βάση
                "Apostasi_thalamou_odhgou": safe_val(Apostasi_thalamou_odhgou),
                "Apostasi_toixou_odhgou_x": safe_val(Apostasi_toixou_odhgou_x),
                "Apostasi_ar_lampa": safe_val(Apostasi_ar_lampa),
                "Apostasi_dek_lampa": safe_val(Apostasi_dek_lampa),
                "Apostasi_toixou_odhgou_x": safe_val(Apostasi_toixou_odhgou_x),
                "Apostasi_lampa_y": safe_val(Apostasi_lampa_y),
                "Apostasi_thalamou_toixou_y": safe_val(Apostasi_thalamou_toixou_y),
                "Apostasi_thalamou_toixou_x": safe_val(Apostasi_thalamou_toixou_x),
                "Bracket_Door_Side": DOOR_SIDE_BRACKET['Sthrigma_ID'] if DOOR_SIDE_BRACKET else "None",
                "Bracket_Opposite_Side": OPPOSITE_SIDE_BRACKET['Sthrigma_ID'] if OPPOSITE_SIDE_BRACKET else "None"
                
                
                
            }
        return result
        
    else:
        # πρόσθεσα flush=True για να εμφανιστεί ΑΜΕΣΩΣ στο terminal
        print("\n" + "="*30)
        print(f"!!! UNSAT CORE FOUND !!!")
        print(f"Sassi: {current_inputs['Sassi_ID']}, Door: {current_inputs['Porta_ID_for_Solver']}")
        print(f"Conflict: {solver.unsat_core()}")
        print("="*30 + "\n", flush=True) # Το flush είναι κλειδί εδώ
        return "unsat"


    

