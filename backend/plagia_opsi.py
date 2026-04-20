from handle_db import connect_db,  fetch_component_data, fetch_all_component_ids, fetch_suitable_stirigma, fetch_max_wall_bracket, fetch_suitable_door_ids, fetch_sassi_by_weight, fetch_bracket_by_id
from z3 import *

def calculate_plagia_opsi(data_from_api, katopsi_results):

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
        'Vathos_puthmena': float(data_from_api.get('vathos_puthmena')),
        'Ekswteriko_ipsos_thalamou': float(data_from_api.get('ekswteriko_ipsos_thalamou')),
        'Diadromi_anelkistira': float(data_from_api.get('diadromi_anelkistira')),
        'staseis': int(data_from_api.get('staseis', 0))
    }

    db = connect_db()
    if not db :
        return "Connection failed"
    

    vathos_puthmena = user_inputs['Vathos_puthmena']
    ekswteriko_ipsos_thalamou = user_inputs['Ekswteriko_ipsos_thalamou']
    diadromi_anelkistira = user_inputs['Diadromi_anelkistira']
    staseis = user_inputs['staseis']

    if atoma:
        user_inputs['scenario'] = 'fixed_area'


    constant_rules = {
        'dapedo_min' : 50,
        'aeras_min' : 80,
        'aeras_max' : 120
    }

    



    platos_thalamou = float(katopsi_results.get('Platos_thalamou'))
    vathos_thalamou = float(katopsi_results.get('Vathos_Thalamou'))
    emvadon_kampinas = (platos_thalamou*vathos_thalamou)/1000000.0


    if emvadon_kampinas < 0.37: theoretical_atoma = 1
    elif emvadon_kampinas < 0.58: theoretical_atoma = 2
    elif emvadon_kampinas < 0.70: theoretical_atoma = 3
    elif emvadon_kampinas < 0.90: theoretical_atoma = 4
    elif emvadon_kampinas < 1.17: theoretical_atoma = 5
    elif emvadon_kampinas < 1.30: theoretical_atoma = 6
    elif emvadon_kampinas < 1.45: theoretical_atoma = 7
    elif emvadon_kampinas < 1.60: theoretical_atoma = 8
    elif emvadon_kampinas < 1.75: theoretical_atoma = 9
    elif emvadon_kampinas < 1.86: theoretical_atoma = 10
    elif emvadon_kampinas < 2.20: theoretical_atoma = 12
    elif emvadon_kampinas < 2.50: theoretical_atoma = 15
    elif emvadon_kampinas < 2.80: theoretical_atoma = 18
    elif emvadon_kampinas < 3.10: theoretical_atoma = 20
    else: theoretical_atoma = 24

    user_persons = data_from_api.get('atoma')
    final_persons = max(theoretical_atoma, user_persons) if user_inputs.get('scenario') == 'fixed_area' else theoretical_atoma
    
    
    
    candidate_sassi = fetch_sassi_by_weight(db, final_persons)


    

    best_vertical_solution = None

    cursor = db.cursor(dictionary=True)
    query = """
        SELECT * FROM Sassi 
        WHERE Atoma_limit >= %s 
        ORDER BY Cantilever_size DESC
    """
    cursor.execute(query, (final_persons,))
    candidate_sassi = cursor.fetchall()
    
    cursor.close()
    


    for sassi in candidate_sassi:

        solver = Optimize()

        
        provolos = float(sassi['Cantilever_size'])

        dapedo = Int('dapedo')
        solver.add(dapedo >= constant_rules['dapedo_min'])

        aeras = Int('aeras')
        solver.add(aeras >= constant_rules['aeras_min'])
        solver.add(aeras <= constant_rules['aeras_max'])

        ipsos_tel_orofou = Int('ipsos_tel_orofou')
        
        solver.add(diadromi_anelkistira/(staseis-1) >= ekswteriko_ipsos_thalamou + 100)
        
    



        solver.add(vathos_puthmena > dapedo + aeras + provolos)

        solver.add(ipsos_tel_orofou == ekswteriko_ipsos_thalamou + aeras + 100)
        solver.minimize(ipsos_tel_orofou)


        

        if solver.check() == sat:
            model = solver.model()
            best_vertical_solution = {
                'Sassi_ID': sassi['Sassi_ID'],
                'Dapedo': model[dapedo].as_long(),
                'Aeras': model[aeras].as_long(),
                'Provolos': provolos,
                'Ipsos_tel_orofou': model[ipsos_tel_orofou].as_long()
            }
            break

        
        
    db.close()
    return best_vertical_solution



    


  


