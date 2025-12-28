from handle_db import connect_db,  fetch_component_data, fetch_all_component_ids, fetch_suitable_stirigma, fetch_max_wall_bracket, fetch_suitable_door_ids
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
     'Platos_freatiou': data_from_api.get('shaftwidth'),
     'Vathos_freatiou': data_from_api.get('shaftdepth'),
     'Diadromi_Anelkystira': travel,
     'Onomasthiko_Varos': data_from_api.get('qLoad'),
     'Anartisi_Sasi': anartisi_sasi,
     'Vathos_Puthmena': vathos_puthmena,
     'Ypsos_Telikou_Orofou': ipsos_tel_orofou,
     'Yliko_Freatiou': yliko_freatiou,
     'Anoigma_portas': anoigma_portas,
     'Tupos_portas': tupos_portas,
     'Thesi_Sassi': data_from_api.get('thesi_sassi'),
     'Arithmos_Fyllon': arithmos_fyllon if tupos_portas == 'Αυτόματη' else None,
     'Tupos_Anoigmatos': tupos_anoigmatos if tupos_portas == 'Αυτόματη' else None
    }
    

    
    
    db = connect_db()
    if not db:
        return "Connection Failed"
    thesi_sassi = user_inputs.get('Thesi_Sassi')
    try:
        apply_constraints = get_constraint_solver(thesi_sassi)
    except ValueError as e:
        print(f"Σφάλμα: {e}")
        db.close()
        return "Constraint Load Error"

    print(" Φόρτωση διαθέσιμων εξαρτημάτων...")
    door_type = user_inputs.get('Tupos_portas')
    required_opening_type = user_inputs.get('Tupos_Anoigmatos') 
    thesi_sassi = user_inputs.get('Thesi_Sassi')
    arithmos_fyllon = user_inputs.get('Arithmos_Fyllon')

    required_opening_type = user_inputs.get('Tupos_Anoigmatos')


    if thesi_sassi == 'Πίσω' and door_type == 'Αυτόματη':    
        required_opening_type = 'Κεντρικό'
    
    elif thesi_sassi in ['Αριστερά', 'Δεξιά'] and door_type == 'Αυτόματη':
        required_opening_type = 'Πλαϊνό'

    
    try:
        sassi_options = fetch_all_component_ids(db, 'Sassi', 'Sassi_ID')
        emvolo_options = fetch_all_component_ids(db, 'Emvola', 'Tupos_Emvolou')
        odhgoi_options = fetch_all_component_ids(db, 'Odhgoi', 'Tupos_Odhgou')
        anoigma_portas = user_inputs['Anoigma_portas']
        door_options = fetch_suitable_door_ids(db, anoigma_portas, door_type, user_inputs.get('Arithmos_Fyllon'), required_opening_type)
   
    except Exception as e:
        print(f"Σφάλμα φόρτωσης ID εξαρτημάτων: {e}")
        db.close()
        return "ID Fetch Error"
    
    if not door_options:
        return "unsat - Δεν βρέθηκε κατάλληλη πόρτα για το άνοιγμα."

    # Δημιουργία όλων των πιθανών συνδυασμών 
    all_combinations = itertools.product(sassi_options, emvolo_options, odhgoi_options, door_options)
    
    # Αρχικοποίηση για την καλύτερη λύση
    best_solution = None
    max_cabin_area = -1
    best_combination = None
    
    total_combinations = len(sassi_options) * len(emvolo_options) * len(odhgoi_options)
    print(f" Βρέθηκαν {total_combinations} πιθανοί συνδυασμοί για δοκιμή.")

    # Επαναληπτική Επίλυση 
    for sassi_id, emvolo_id, odhgoi_id, door_id in all_combinations:
        
        
        current_inputs = user_inputs.copy()
        current_inputs['Sassi_ID'] = sassi_id
        current_inputs['Tupos_Emvolou'] = emvolo_id
        current_inputs['Tupos_Odhgou'] = odhgoi_id
        current_inputs['Porta_ID_for_Solver'] = door_id
        
        
      
        result = solve_elevator_design(db, current_inputs, apply_constraints) 
        
        
        if result != "unsat" and result['cabin_area'] > max_cabin_area:
            max_cabin_area = result['cabin_area']
            best_solution = result
            best_combination = (sassi_id, emvolo_id, odhgoi_id)
            
    db.close()
    return {"best_solution": best_solution, "combination": best_combination, "max_area": max_cabin_area}
    



    
def solve_elevator_design(db, user_inputs, apply_constraints):
    current_inputs = user_inputs.copy()
    sassi_data = fetch_component_data(db, 'Sassi', current_inputs['Sassi_ID'], 'Sassi_ID')
    emvolo_data = fetch_component_data(db, 'Emvola', current_inputs['Tupos_Emvolou'], 'Tupos_Emvolou')
    odhgoi_data = fetch_component_data(db, 'Odhgoi', current_inputs['Tupos_Odhgou'], 'Tupos_Odhgou')
    door_data = fetch_component_data(db, 'Portes', current_inputs['Porta_ID_for_Solver'], 'Tupos_Portas_ID')
    sthrigma_data = fetch_suitable_stirigma(db, sassi_data['Distance_wall_guiderail_min'])


    if not sassi_data or not emvolo_data or not odhgoi_data or not door_data:
        return "unsat"
    
    # Επιλογή στηρίγματος
    DOOR_TYPE = current_inputs.get('Tupos_Portas')
    MIN_DIST_SASSI = sassi_data['Distance_wall_guiderail_min']


    G_portas = door_data['G_portas']
    CO_portas= door_data['CO_portas']
    PAHOS_PORTAS_CONST_DB = door_data['Pahos']
    Vathos_freatiou = current_inputs['Vathos_freatiou']
    Anoigma_odhgwn = sassi_data['Anoigma_odhgwn']
    h1 = sassi_data['h1'] 
    APOSTASI_Y_CRITERIA = (Vathos_freatiou - Anoigma_odhgwn) / 2 # είναι η απόσταση μέχρι την μύτη του οδηγού
    APOSTASI_Y_CRITERIA_AUTOMATH= (Vathos_freatiou - PAHOS_PORTAS_CONST_DB - Anoigma_odhgwn) / 2 
    threshold = 190.0

    normal_bracket_data = fetch_suitable_stirigma(db, MIN_DIST_SASSI)
    wall_bracket_data = fetch_max_wall_bracket(db, APOSTASI_Y_CRITERIA) 

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
            

    

    solver = Optimize()
    

    # Ορισμός SMT μεταβλητών (οι άγνωστοι)
    Apostasi_ar_lampa = Real('Apostasi_ar_lampa')
    Apostasi_dek_lampa = Real('Apostasi_dek_lampa')
    Apostasi_toixou_odhgou_x = Real('Apostasi_toixou_odhgou_x')
    Apostasi_toixou_odhgou_y_1 = Real('Apostasi_toixou_odhgou_y_1')
    Apostasi_toixou_odhgou_y_2 = Real('Apostasi_toixou_odhgou_y_2')
    Apostasi_thalamou_odhgou = Real('Apostasi_thalamou_odhgou')
    Platos_thalamou = Real('Platos_thalamou')
    Vathos_Thalamou = Real('Vathos_Thalamou')
    Eks_ipsos_thalamou = Real('Eks_ipsos_thalamou')
    Apostasi_thalamou_toixou_x = Real('Apostasi_thalamou_toixou_x')
    Apostasi_thalamou_toixou_y = Real('Apostasi_thalamou_toixou_y')
    Emvadon_thalamou = Real('Emvadon_thalamou')
    Vathos_puthmena = user_inputs['Vathos_Puthmena'] 
    Ipsos_tel_orofou = user_inputs['Ypsos_Telikou_Orofou']
    Use_normal_bracket = Bool('Use_normal_braket')
    Anoigma_portas = Real('Anoigma_portas')
    Apostasi_lampa_y = Real('Apostasi_lampa_y')
    Emvadon_guro = Real('Emvadon_guro')
    pahos_sthrigmatos_door_var = Real('pahos_sthrigmatos_door_var')
    pahos_sthrigmatos_opp_var = Real('pahos_sthrigmatos_opp_var')
    Apostasi_thalamou_toixou_ar_rear = Real('Apostasi_thalamou_toixou_ar_rear') # το πρώτο χρησιμοποιώ στ script, το δεύτερο δίνει ο z3 στη μεταβλητή μέσα στον εγκέφαλο και με αυτο θα μου επιστρέψει τιμή
    Apostasi_thalamou_toixou_dek_rear = Real('Apostasi_thalamou_toixou_dek_rear')
    Apostasi_toixou_odhgou_y_rear = Real('Apostasi_toixou_odhgou_y_rear')
    Apostasi_thalamou_odhgou_rear = Real('Apostasi_thalamou_odhgou_rear')
    Apostasi_toixou_odhgou_x_dek_rear = Real('Apostasi_toixou_odhgou_x_dek_rear') # είναι μέχρι την βάση του στηρίγματος
    Apostasi_toixou_odhgou_x_ar_rear = Real('Apostasi_toixou_odhgou_x_ar_rear')
    pahos_sthrigmatos_rear = Real('pahos_sthrigmatos_rear')


    
   
    
    solver.add(Emvadon_thalamou == Platos_thalamou * Vathos_Thalamou)

    apply_constraints(solver, current_inputs, sassi_data, sthrigma_data, emvolo_data, odhgoi_data, door_data, DOOR_SIDE_BRACKET, OPPOSITE_SIDE_BRACKET,
                      Apostasi_ar_lampa, Apostasi_dek_lampa, sassi_data['Anoigma_odhgwn'], Apostasi_lampa_y,
                      Apostasi_toixou_odhgou_x, Apostasi_toixou_odhgou_y_1, 
                      Apostasi_toixou_odhgou_y_2, Apostasi_thalamou_odhgou, 
                      Platos_thalamou, Vathos_Thalamou, Eks_ipsos_thalamou, 
                      Apostasi_thalamou_toixou_x, Apostasi_thalamou_toixou_y, 
                      Emvadon_thalamou, Emvadon_guro, Use_normal_bracket, PAHOS_PORTAS_CONST, G_portas, CO_portas,
                      pahos_sthrigmatos_door_var, pahos_sthrigmatos_opp_var, anoigma_portas, Apostasi_thalamou_toixou_ar_rear, 
                      Apostasi_thalamou_toixou_dek_rear, Apostasi_toixou_odhgou_y_rear, Apostasi_thalamou_odhgou_rear, 
                      Apostasi_toixou_odhgou_x_dek_rear, Apostasi_toixou_odhgou_x_ar_rear, DEKSIA_SIDE_BRACKET, ARISTERA_SIDE_BRACKET, 
                      pahos_sthrigmatos_rear
                    )
    
    solver.maximize(Emvadon_thalamou)
    

    # Επίλυση και εξαγωγή αποτελεσμάτων 
    if solver.check() == sat:
        model = solver.model()
        
        
        result = {
            "cabin_area": model.evaluate(Emvadon_thalamou).as_decimal(2),
            "Platos_thalamou": model.evaluate(Platos_thalamou).as_decimal(2),
            "Vathos_Thalamou": model.evaluate(Vathos_Thalamou).as_decimal(2),
            "Apostasi_toixou_odhgou_y1": model.evaluate(Apostasi_toixou_odhgou_y_1).as_decimal(2),
            "Apostasi_toixou_odhgou_y2": model.evaluate(Apostasi_toixou_odhgou_y_2).as_decimal(2),
            "Anoigma_odhgwn": model.evaluate(Anoigma_odhgwn).as_decimal(2),
            "Apostasi_thalamou_odhgou": model.evaluate(Apostasi_thalamou_odhgou).as_decimal(2),
            "Apostasi_toixou_odhgou_x": model.evaluate(Apostasi_toixou_odhgou_x).as_decimal(2),
            "Emvadon_guro": model.evaluate(Emvadon_guro).as_decimal(2),
            
        }
        return result
        
    else:
        return "unsat"

    

if __name__ == "__main__":
    print("Καλωσήρθατε στον σχεδιαστή ανελκυστήρων!")
    print("Παρακαλώ εισάγετε τις απαιτούμενες διαστάσεις και προδιαγραφές.")


    # Αρχικοποίηση για αποφυγή NameError
    arithmos_fyllon = None
    tupos_anoigmatos = None
    

    try:
      platos_freatiou = int(input("  > Εισάγετε Πλάτος Φρεατίου (mm): "))
      vathos_freatiou = int(input("  > Εισάγετε Βάθος Φρεατίου (mm): "))
      travel = int(input("  > Εισάγετε Διαδρομή Ανελκυστήρα (mm): "))
      topothesia_emvolou = int(input("  > Εισάγετε Τοποθεσία Εμβόλου (mm από το δάπεδο του φρεατίου): "))
      rated_weight = int(input("  > Εισάγετε Ονομαστικό Βάρος (kg): "))
      elevator_speed = float(input("  > Εισάγετε Ταχύτητα Ανελκυστήρα (m/s): "))
      anartisi_sasi = int(input("  > Εισάγετε Αναλογία Ανάρτησης: "))
      apovaro = int(input("  > Εισάγετε Απόβαρο (kg): "))
      vathos_puthmena = int(input("  > Εισάγετε Βάθος Πυθμένα (mm): "))
      ipsos_tel_orofou = int(input("  > Εισάγετε Ύψος Τελικού Ορόφου (mm): "))
      yliko_freatiou = input("  > Εισάγετε Υλικό Φρεατίου: ")
      tupos_portas = input("  > Εισάγεται Τύπο Πόρτας: ")
      thesi_sassi = input("  > Θέση Σασί (Αριστερά/Δεξιά/Πίσω): ")
      anoigma_portas = int(input("  > Εισάγετε Άνοιγμα Πόρτας (mm): "))
      
      if thesi_sassi not in ['Αριστερά', 'Δεξιά', 'Πίσω']:
          print("\nΣΦΑΛΜΑ: Η θέση Σασί πρέπει να είναι 'Αριστερά', 'Δεξιά' ή 'Πίσω'.")
          exit()

      if tupos_portas == 'Αυτόματη':
        arithmos_fyllon = int(input("  > Αριθμός φύλλων πόρτας (2/3/4): "))
        tupos_anoigmatos = input("  > Τύπος ανοίγματος (Κεντρικό/Πλαϊνό): ")
    
    except ValueError: 
        print("\nΣΦΑΛΜΑ: Παρακαλώ εισάγετε μόνο αριθμούς για τις διαστάσεις.") 
        exit()


    user_inputs_test = {
        'shaft_width': platos_freatiou,
        'shaft_depth': vathos_freatiou,
        'thesi_sassi': 'side' if thesi_sassi in ['Αριστερά', 'Δεξιά'] else 'rear',
        'q_load': rated_weight,
        'p_weight': apovaro,
        'door_id': 1  # Προσωρινό ID για τη δοκιμή
    }


    results = find_optimal_design(user_inputs_test)
    print("\n--- ΑΠΟΤΕΛΕΣΜΑΤΑ ΣΧΕΔΙΑΣΜΟΥ ---")
    print(results) 



