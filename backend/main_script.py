from handle_db import connect_db,  fetch_component_data, fetch_all_component_ids, fetch_suitable_stirigma, fetch_max_wall_bracket, fetch_suitable_door_ids, fetch_sassi_by_weight, fetch_bracket_by_id
from z3 import *
import itertools

def get_allowed_guide_rails(persons):
    p = int(persons)

    hierarchy = ["T75", "T89/A", "T90/A", "T125/A", "T127-2/B"]
    if p<=5:
        return hierarchy[0:]
    elif p<=8:
        return hierarchy[1:]
    elif p<=12:
        return hierarchy[2:]
    elif p<=15:
        return hierarchy[3:]
    else:
        return hierarchy[4:]




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
    door_type = data_from_api.get('tupos_portas')
    leaf_input = data_from_api.get('arithmos_fyllon')
    atoma = data_from_api.get('atoma')
    user_inputs = {
        'Platos_freatiou': float(data_from_api.get('shaftwidth', 0)),
        'Vathos_freatiou': float(data_from_api.get('shaftdepth', 0)),
        'Atoma': atoma,
        'Thesi_Sassi': data_from_api.get('thesi_sassi'),
        'Anoigma_portas': float(data_from_api.get('anoigma_portas', 0)),
        'Tupos_Portas': door_type,
        # Διόρθωση: Αν είναι ημιαυτόματη και δώσεις 1, το κρατάμε. Αν δεν δώσεις τίποτα, βάζουμε 1.0
        'Arithmos_Fyllon': float(leaf_input) if leaf_input is not None else (1.0 if door_type == 'Ημιαυτόματη' else 2.0),
        'Tupos_Anoigmatos': data_from_api.get('tupos_anoigmatos'),
        'Kateuthinsi_anoigmatos': data_from_api.get('kateuthinsi_anoigmatos'),
        'Arithmos_Portwn': data_from_api.get('cabin_doors'),
        'Thesi_Deuteris_Portas': data_from_api.get('thesi_second_door'),
        'Kateuthinsi_Deuteris_Portas': data_from_api.get('dir_second_door'),
        'Vathos_puthmena': float(data_from_api.get('vathos_puthmena', 0)),
        'Ipsos_tel_orofou': float(data_from_api.get('ipsos_tel_orofou', 0)),
        'Diadromi_anelkistira': float(data_from_api.get('diadromi_anelkistira', 0)),
        'staseis': int(data_from_api.get('staseis', 0))
    }

   
    raw_thesi = data_from_api.get('thesi_sassi')
    anoigma_portas = user_inputs['Anoigma_portas']



    db = connect_db()
    if not db: return "Connection Failed"

    try:
        apply_constraints = get_constraint_solver(raw_thesi)
    except ValueError as e:
        db.close()
        return f"Constraint Load Error: {e}"
    
    requested_opening = user_inputs.get('Tupos_Anoigmatos')
    
    if door_type == 'Ημιαυτόματη':
        required_opening_type = 'Ημιαυτόματη'
        user_inputs['Tupos_Anoigmatos'] = 'Ημιαυτόματη'
    
    elif door_type == 'Αυτόματη':
        
        if requested_opening in ['Κεντρικό', 'Πλαϊνό']:
            required_opening_type = requested_opening
            user_inputs['Tupos_Anoigmatos'] = required_opening_type


    # 3. Ανάκτηση Πόρτας και Προσδιορισμός Πάχους
    door_options = fetch_suitable_door_ids(db, anoigma_portas, door_type, user_inputs['Arithmos_Fyllon'], required_opening_type)
    actual_thickness = 180
    if door_options:
        sample_door_data = fetch_component_data(db, 'Portes', door_options[0], 'Tupos_Portas_ID')
        if isinstance(sample_door_data, dict):
            if door_type == 'Ημιαυτόματη':
                actual_thickness = 0
            else:
                actual_thickness = float(sample_door_data.get('Pahos_Portas', 180))

    Platos = user_inputs['Platos_freatiou']
    Vathos = user_inputs['Vathos_freatiou']
    shaft_area = (Platos * Vathos) 
    
    # βάζουμε μικρό περιθώριο για το σασί (π.χ. 200). Αλλιώς πάμε στο ασφαλές 350.
    sassi_margin = 200 if shaft_area <= 1750000 else 350
    
    if raw_thesi == 'side':
        est_w = max(0, Platos - sassi_margin) 
        est_d = max(0, Vathos - actual_thickness - 50) # ο αέρας ανάμεσα στην αυτόματη πόρτα και την καμπίνα
    else:
        est_w = max(0, Platos - 200)
        est_d = max(0, Vathos - actual_thickness - sassi_margin)
    estimated_area = (est_w * est_d) / 1000000

    # 5. Υπολογισμός Ατόμων
    def get_area_from_standard(n):
        std = {1:37, 2:58, 3:70, 4:90, 5:117, 6:130, 7:145, 8:160, 10:186, 12:220, 15:250, 20:310}
        area_val = std.get(int(n), 24) * 10000
        return area_val

    if atoma:
        user_inputs['scenario'] = 'fixed_area'
        theoretical_atoma = int(atoma)
        user_inputs['required_area'] = get_area_from_standard(theoretical_atoma)
    else:
        user_inputs['scenario'] = 'max_area'
        if estimated_area < 0.37: theoretical_atoma = 1
        elif estimated_area < 0.58: theoretical_atoma = 2
        elif estimated_area < 0.70: theoretical_atoma = 3
        elif estimated_area < 0.90: theoretical_atoma = 4
        elif estimated_area < 1.17: theoretical_atoma = 5
        elif estimated_area < 1.30: theoretical_atoma = 6
        elif estimated_area < 1.45: theoretical_atoma = 7
        elif estimated_area < 1.60: theoretical_atoma = 8
        elif estimated_area < 1.75: theoretical_atoma = 9
        elif estimated_area < 1.86: theoretical_atoma = 10
        elif estimated_area < 2.20: theoretical_atoma = 12
        elif estimated_area < 2.50: theoretical_atoma = 15
        elif estimated_area < 2.80: theoretical_atoma = 18
        elif estimated_area < 3.10: theoretical_atoma = 20
        else: theoretical_atoma = 24

    
    # 6. Φιλτράρισμα Σασί (Αρχικό από τη βάση)
    sassi_options = fetch_sassi_by_weight(db, theoretical_atoma)
    temp_atoma = theoretical_atoma
    while not sassi_options and temp_atoma > 1:
        temp_atoma += 1
        sassi_options = fetch_sassi_by_weight(db, temp_atoma)

    # Φτιάχνουμε το cache ΜΙΑ φορά στην αρχή για να υπάρχει και στα δύο σενάρια
    if 'sassi_cache' not in locals():
         sassi_cache = {s: fetch_component_data(db, 'Sassi', s, 'Sassi_ID') for s in sassi_options}

    efficient_filtered_sassi = []

   
    # HARD SPLIT: MAX AREA vs FIXED AREA
    

    if user_inputs.get('scenario') != 'fixed_area':
        
        # ΣΕΝΑΡΙΟ A: MAX AREA 
        
        if raw_thesi == 'side':
            hosting_dim = user_inputs['Vathos_freatiou']
            t_anoigmatos = user_inputs.get('Tupos_Anoigmatos') # Το παίρνουμε μια φορά σωστά
            vathos = user_inputs['Vathos_freatiou']

            if door_type == 'Ημιαυτόματη':
                min_margin = 150 
                max_logic_limit = hosting_dim * 0.55 
            
            # --- ΑΥΤΟΜΑΤΕΣ - ΠΛΑΪΝΟ ΑΝΟΙΓΜΑ ---
            elif door_type == 'Αυτόματη' and t_anoigmatos == 'Πλαϊνό':
                min_margin = 250
                if vathos <= 1350:
                    max_logic_limit = hosting_dim * 0.48
                else: 
                    max_logic_limit = hosting_dim * 0.50 

            # --- ΑΥΤΟΜΑΤΕΣ - ΚΕΝΤΡΙΚΟ ΑΝΟΙΓΜΑ ---
            elif door_type == 'Αυτόματη' and t_anoigmatos == 'Κεντρικό':
                min_margin = 200
                if vathos <= 1300:
                    max_logic_limit = hosting_dim * 0.48
                else:
                    max_logic_limit = hosting_dim * 0.52

        
        else: # REAR
            hosting_dim = user_inputs['Platos_freatiou']
            if door_type == 'Ημιαυτόματη':
                min_margin = 100 
                max_logic_limit = hosting_dim * 0.60
            else: 
                min_margin = 150
                max_logic_limit = hosting_dim * 0.60

            

        for s_id in sassi_options:
            s_data = sassi_cache.get(s_id)
            if s_data:
                s_size = float(s_data.get('Size', 0))
                # Ο δικός σου έλεγχος
                if s_size <= (hosting_dim - min_margin) and s_size <= max_logic_limit:
                    efficient_filtered_sassi.append(s_id)

    else:
        
        # ΣΕΝΑΡΙΟ B: FIXED AREA 
        
        
        # 1. Hosting Dimension & Margins (Κρατάμε τα ίδια για συνέπεια)
        if raw_thesi == 'side':
            hosting_dim = user_inputs['Vathos_freatiou']
            if door_type == 'Ημιαυτόματη':
                min_margin = 150  
            else:
                min_margin = 200
        else: # REAR
            hosting_dim = user_inputs['Platos_freatiou']
            min_margin = 200

        # 2. ΟΡΙΟ ΑΤΟΜΩΝ (People Limit)
        # Αυτό είναι το ΚΛΕΙΔΙ για να μην σου βγάζει τεράστιο σασί σε λίγα άτομα
        t_atoma = int(theoretical_atoma)
        
        if t_atoma <= 3:
            max_people_limit = 600   # Μικρό σασί για μικρή καμπίνα
        elif t_atoma <= 5:
            max_people_limit = 900   # Μεσαίο σασί
        elif t_atoma <= 8:
            max_people_limit = 950  # Μεγάλο σασί
        else:
            max_people_limit = 99999 # Απεριόριστο

        for s_id in sassi_options:
            s_data = sassi_cache.get(s_id)
            if s_data:
                s_size = float(s_data.get('Size', 0))
                
                # Εδώ ελέγχουμε να χωράει (Margin) ΚΑΙ να μην ξεπερνά το όριο ΑΤΟΜΩΝ
                if s_size <= (hosting_dim - min_margin) and s_size <= max_people_limit:
                    efficient_filtered_sassi.append(s_id)


    
    # ΚΟΙΝΗ ΛΟΓΙΚΗ ΤΑΞΙΝΟΜΗΣΗΣ (Ισχύει και για τα δύο)
    
    if efficient_filtered_sassi:
        # Ταξινομούμε φθίνουσα 
        efficient_filtered_sassi.sort(key=lambda x: float(sassi_cache[x].get('Size', 0)), reverse=True)
        
        
        final_selection = []
        size_counts = {} 
        
        for s_id in efficient_filtered_sassi:
            size = float(sassi_cache[s_id].get('Size', 0))
            if size not in size_counts: size_counts[size] = 0
            
            if size_counts[size] < 2: 
                final_selection.append(s_id)
                size_counts[size] += 1
            
            if len(final_selection) >= 5: break
        
        sassi_options = final_selection
    else:
        # Fallback
        sassi_options.sort(key=lambda x: float(sassi_cache[x].get('Size', 0)))
        sassi_options = sassi_options[:3]

    # 7. Επίλυση Συνδυασμών
    try:
        all_odhgoi_ids = fetch_all_component_ids(db, 'Odhgoi', 'Tupos_odhgou_ID')
        allowed_guides = get_allowed_guide_rails(theoretical_atoma)
        odhgoi_options = [g for g in all_odhgoi_ids if g in allowed_guides]
        
        if not door_options: return {"status": "unsat", "error": "No suitable door found"}
        sassi_cache = {s: fetch_component_data(db, 'Sassi', s, 'Sassi_ID') for s in sassi_options}
        odhgoi_cache = {o: fetch_component_data(db, 'Odhgoi', o, 'Tupos_odhgou_ID') for o in odhgoi_options}
        door_cache = {d: fetch_component_data(db, 'Portes', d, 'Tupos_Portas_ID') for d in door_options}          


        all_combinations = itertools.product(sassi_options, odhgoi_options, door_options)
        best_solution, max_area, best_sassi_size = None, -1, 0
        last_causes = []

        for s_id, o_id, d_id in all_combinations:
            curr = user_inputs.copy() # curr = current 
            curr.update({'Sassi_ID': s_id, 'Tupos_Odhgou': o_id, 'Porta_ID_for_Solver': d_id})
            
            curr['cached_sassi'] = sassi_cache[s_id]
            curr['cached_odhgoi'] = odhgoi_cache[o_id]
            curr['cached_door'] = door_cache[d_id]

           
            s_data = sassi_cache[s_id]
            o_data = odhgoi_cache[o_id]
            d_data = door_cache[d_id]


            # ΕΞΑΛΕΙΨΗ PARSER ERROR: Σιγουρευόμαστε ότι δεν περνάει None στον Z3
            if curr['Tupos_Anoigmatos'] is None:
                curr['Tupos_Anoigmatos'] = "Ημιαυτόματη" if door_type == "Ημιαυτόματη" else "Πλαϊνό"

            if curr.get('Arithmos_Fyllon') is None:
                curr['Arithmos_Fyllon'] = 1.0

            res = solve_elevator_design(db, curr, apply_constraints)

            if isinstance(res, dict) and res.get("status") != "unsat":
                s_size = float(s_data.get('Size', 0))
                c_area = float(res.get('cabin_area', 0))

                if c_area > max_area or (abs(c_area - max_area) < 0.01 and s_size > best_sassi_size):
                    max_area, best_sassi_size, best_solution = c_area, s_size, res

            elif isinstance(res, dict):
                last_causes = res.get("causes", [])


        if best_solution:
            # 1. Βρίσκουμε την πόρτα που επέλεξε ο Solver (από το ID της)
            win_door_id = best_solution.get('Porta_ID_for_Solver')
            win_door_data = door_cache.get(win_door_id, {})


            db.close()
            
            # Επιστρέφουμε το αντικείμενο καθαρό
            return {
                "status": "success",
                "best_solution": best_solution,
                "max_area": float(max_area)
            }

    except Exception as e:
        if 'db' in locals(): db.close()
        return {"status": "error", "message": f"Process Error: {e}"}

    
def solve_elevator_design(db, user_inputs, apply_constraints):
    current_inputs = user_inputs.copy()
    sassi_data = current_inputs['cached_sassi']
    odhgoi_data = current_inputs['cached_odhgoi']
    door_data = current_inputs['cached_door']
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


    G_portas = float(door_data.get('G_portas', 0.0) or 0.0)
    CO_portas = float(door_data.get('CO_portas', 0.0) or 0.0)


    try:
    # Το or 0.0 προστατεύει αν η στήλη στη βάση είναι NULL
    # Το float() προστατεύει αν είναι string
        PAHOS_PORTAS_CONST_DB = float(door_data.get('Pahos_Portas', 0.0) or 0.0)
    except (TypeError, ValueError):
        PAHOS_PORTAS_CONST_DB = 0.0


    Vathos_freatiou = float(current_inputs['Vathos_freatiou'])
    Anoigma_odhgwn = float(sassi_data['Size'])
    h1 = float(odhgoi_data['h1']) 
    pahos_sthrigmatos_min = sthrigma_data['Pahos_Min']
    pahos_sthrigmatos_max = sthrigma_data['Pahos_Max']
    APOSTASI_Y_CRITERIA = (Vathos_freatiou - Anoigma_odhgwn) / 2 # είναι η απόσταση μέχρι την μύτη του οδηγού
    APOSTASI_Y_CRITERIA_AUTOMATH = (Vathos_freatiou - PAHOS_PORTAS_CONST_DB - Anoigma_odhgwn) / 2 
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


    #if Vathos_freatiou <= 1200 and DOOR_TYPE == 'Ημιαυτόματη' and thesi_sassi == 'side' and current_inputs.get('scenario') != 'fixed_area':
        #l75_bracket = fetch_bracket_by_id(db, 'L75') 
        
        #if l75_bracket:
            #normal_bracket_data = l75_bracket
            #wall_bracket_data = l75_bracket

    #if 1200 < Vathos_freatiou <= 1230 and DOOR_TYPE == 'Ημιαυτόματη' and thesi_sassi == 'side':
        #l75_bracket = fetch_bracket_by_id(db, 'L75') 
        
        #if l75_bracket:
            #normal_bracket_data = l75_bracket
            #wall_bracket_data = l75_bracket
    
    #if Vathos_freatiou <= 1130 and DOOR_TYPE == 'Αυτόματη' and thesi_sassi == 'side' and current_inputs.get('scenario') != 'fixed_area':
        #l50_bracket = fetch_bracket_by_id(db, 'L50') 
        
        #if l50_bracket:
            #wall_bracket_data = l50_bracket


    if Vathos_freatiou <= 1110 and DOOR_TYPE == 'Αυτόματη' and thesi_sassi == 'side' and current_inputs.get('scenario') == 'fixed_area':
        l50_bracket = fetch_bracket_by_id(db, 'L50') 
        
        if l50_bracket:
            wall_bracket_data = l50_bracket

    if Vathos_freatiou <= 1130 and DOOR_TYPE == 'Αυτόματη' and thesi_sassi == 'side' and current_inputs.get('scenario') == 'fixed_area':
        l75_bracket = fetch_bracket_by_id(db, 'L75') 
        
        if l75_bracket:
            wall_bracket_data = l75_bracket
    
    

    

    

    #if Vathos_freatiou <= 1140 and DOOR_TYPE == 'Αυτόματη' and thesi_sassi == 'side':
        #l75_bracket = fetch_bracket_by_id(db, 'L75') 
        
        #if l75_bracket:
            #wall_bracket_data = l75_bracket

    #if Platos_freatiou <= 1200 and DOOR_TYPE == 'Ημιαυτόματη' and thesi_sassi == 'rear' and current_inputs.get('scenario') != 'fixed_area':
        #l50_bracket = fetch_bracket_by_id(db, 'L50')

        #if l50_bracket:
            #normal_bracket_data = l50_bracket
            #wall_bracket_data = l50_bracket
            


 

    
    


    
    #if 1200 < Platos_freatiou <= 1350 and DOOR_TYPE == 'Αυτόματη' and user_inputs['scenario'] == 'max_area':
        #l75_bracket = fetch_bracket_by_id(db, 'L75') 
        
        #if l75_bracket:
            #wall_bracket_data = l75_bracket

    
    if thesi_sassi == 'rear':
    
        
        APOSTASI_X_CRITERIA_REAR = (Platos_freatiou - Anoigma_odhgwn) / 2 

    
        if APOSTASI_X_CRITERIA_REAR >= threshold and DOOR_TYPE == 'Αυτόματη':
            DEKSIA_SIDE_BRACKET = normal_bracket_data
            ARISTERA_SIDE_BRACKET = normal_bracket_data
            PAHOS_PORTAS_CONST = PAHOS_PORTAS_CONST_DB

        elif APOSTASI_X_CRITERIA_REAR >= threshold and DOOR_TYPE == 'Ημιαυτόματη':
            DEKSIA_SIDE_BRACKET = normal_bracket_data
            ARISTERA_SIDE_BRACKET = normal_bracket_data
            PAHOS_PORTAS_CONST = 0

        elif APOSTASI_X_CRITERIA_REAR < threshold and DOOR_TYPE == 'Αυτόματη':
            DEKSIA_SIDE_BRACKET = wall_bracket_data
            ARISTERA_SIDE_BRACKET = wall_bracket_data
            PAHOS_PORTAS_CONST = PAHOS_PORTAS_CONST_DB
        
        elif APOSTASI_X_CRITERIA_REAR < threshold and DOOR_TYPE == 'Ημιαυτόματη':
            DEKSIA_SIDE_BRACKET = wall_bracket_data
            ARISTERA_SIDE_BRACKET = wall_bracket_data
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
                OPPOSITE_SIDE_BRACKET = wall_bracket_data #if wall_bracket_data else normal_bracket_data
                PAHOS_PORTAS_CONST = PAHOS_PORTAS_CONST_DB
            

    if thesi_sassi == 'rear':
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
    
    
    diff = Int('diff')
    solver.add(diff >= Platos_thalamou - Vathos_Thalamou)
    solver.add(diff >= Vathos_Thalamou - Platos_thalamou)
    solver.add(Platos_thalamou >= 100) 
    solver.add(Vathos_Thalamou >= 100) 
    solver.add(diff <= 600)

    
    if current_inputs.get('scenario') == 'fixed_area':
        solver.minimize(diff)
        solver.maximize(Platos_thalamou + Vathos_Thalamou)
    else:
        solver.maximize(Platos_thalamou + Vathos_Thalamou)
    

    # Επίλυση και εξαγωγή αποτελεσμάτων 
    if solver.check() == sat:
        model = solver.model()
        
        
        def get_exact_val(var):
            val = model.evaluate(var)
            # Αν ο Z3 δεν έδωσε τιμή (σπάνιο), επιστρέφουμε 0
            if str(val) == str(var): return 0.0
            
            try:
                # Αν είναι κλάσμα (Rational), κάνουμε διαίρεση
                if hasattr(val, 'numerator_as_long'):
                    return float(val.numerator_as_long()) / float(val.denominator_as_long())
                # Αλλιώς μετατροπή σε float
                return float(str(val))
            except:
                return 0.0

        
        if current_inputs.get('Thesi_Sassi') == 'rear':
            result = {
                "Sassi_Model": current_inputs['Sassi_ID'],        
                "Odhgoi_Type": current_inputs['Tupos_Odhgou'],    
                "Door_Model": current_inputs['Porta_ID_for_Solver'], 
                "cabin_area": get_exact_val(Emvadon_thalamou),
                "Platos_thalamou": get_exact_val(Platos_thalamou),
                "Vathos_Thalamou": get_exact_val(Vathos_Thalamou),
                "Apostasi_toixou_odhgou_y_rear": get_exact_val(Apostasi_toixou_odhgou_y_rear),
                "Anoigma_odhgwn": str(sassi_data['Size']), # Σταθερή τιμή από τη βάση
                "Apostasi_thalamou_odhgou_rear": get_exact_val(Apostasi_thalamou_odhgou_rear),
                "Apostasi_toixou_odhgou_x_dek_rear": get_exact_val(Apostasi_toixou_odhgou_x_dek_rear),
                "Apostasi_toixou_odhgou_x_ar_rear": get_exact_val(Apostasi_toixou_odhgou_x_ar_rear),
                "Apostasi_ar_lampa": get_exact_val(Apostasi_ar_lampa), 
                "Apostasi_dek_lampa": get_exact_val(Apostasi_dek_lampa),
                "Apostasi_lampa_y": get_exact_val(Apostasi_lampa_y),
                "Apostasi_thalamou_toixou_ar_rear": get_exact_val(Apostasi_thalamou_toixou_ar_rear),
                "Apostasi_thalamou_toixou_dek_rear": get_exact_val(Apostasi_thalamou_toixou_dek_rear),
                "Apostasi_toixou_odhgou_y_rear": get_exact_val(Apostasi_toixou_odhgou_y_rear),
                "Bracket_Deksia_Side": DEKSIA_SIDE_BRACKET['Sthrigma_ID'] if DEKSIA_SIDE_BRACKET else "None",
                "Bracket_Aristera_Side": ARISTERA_SIDE_BRACKET['Sthrigma_ID'] if ARISTERA_SIDE_BRACKET else "None",
                "G_portas_val": float(G_portas),
                "pahos_sthrtigmatos_rear": get_exact_val(pahos_sthrigmatos_rear)

                
                
            }
        else: 
            result = {
                "Sassi_Model": current_inputs['Sassi_ID'],        
                "Odhgoi_Type": current_inputs['Tupos_Odhgou'],    
                "Door_Model": current_inputs['Porta_ID_for_Solver'], 
                "cabin_area": get_exact_val(Emvadon_thalamou),
                "Platos_thalamou": get_exact_val(Platos_thalamou),
                "Vathos_Thalamou": get_exact_val(Vathos_Thalamou),
                "Apostasi_toixou_odhgou_y1": get_exact_val(Apostasi_toixou_odhgou_y_1),
                "Apostasi_toixou_odhgou_y2": get_exact_val(Apostasi_toixou_odhgou_y_2),
                "Anoigma_odhgwn": str(sassi_data['Size']), # Σταθερή τιμή από τη βάση
                "Apostasi_thalamou_odhgou": get_exact_val(Apostasi_thalamou_odhgou),
                "Apostasi_toixou_odhgou_x": get_exact_val(Apostasi_toixou_odhgou_x),
                "Apostasi_ar_lampa": get_exact_val(Apostasi_ar_lampa),
                "Apostasi_dek_lampa": get_exact_val(Apostasi_dek_lampa),
                "Apostasi_toixou_odhgou_x": get_exact_val(Apostasi_toixou_odhgou_x),
                "Apostasi_lampa_y": get_exact_val(Apostasi_lampa_y),
                "Apostasi_thalamou_toixou_y": get_exact_val(Apostasi_thalamou_toixou_y),
                "Apostasi_thalamou_toixou_x": get_exact_val(Apostasi_thalamou_toixou_x),
                "Bracket_Door_Side": DOOR_SIDE_BRACKET['Sthrigma_ID'] if DOOR_SIDE_BRACKET else "None",
                "Bracket_Opposite_Side": OPPOSITE_SIDE_BRACKET['Sthrigma_ID'] if OPPOSITE_SIDE_BRACKET else "None",
                "G_portas_val": float(G_portas),
                "pahos_sthrigmatos_door": get_exact_val(pahos_sthrigmatos_door_var),
                "pahos_sthrigmatos_opposite": get_exact_val(pahos_sthrigmatos_opp_var)
                  
                 
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


    


