from z3 import *




# ΣΤΑΘΕΡΟΙ ΓΕΝΙΚΟΙ ΚΑΝΟΝΙΣΜΟΙ
CONSTANT_rules = {
'Apostasi_thalamou_toixou_x_ar_min' : 100.0,
'Apostasi_thalamou_toixou_x_dek_min' :  100.0,
'LAMPA_Y_SEMI_MIN' : 120.0,
'LAMPA_Y_SEMI_MAX' : 200.0,
'LAMPA_Y_AUTO' : 50.0
}

def apply_constraints(solver, user_inputs, sassi_data, sthrigma_data, odhgoi_data, door_data, 
                      DOOR_SIDE_BRACKET, OPPOSITE_SIDE_BRACKET, Apostasi_ar_lampa, Apostasi_dek_lampa, 
                      Anoigma_odhgwn_const, Apostasi_lampa_y, Apostasi_toixou_odhgou_x, 
                      Apostasi_toixou_odhgou_y_1, Apostasi_toixou_odhgou_y_2, Apostasi_thalamou_odhgou, 
                      Platos_thalamou, Vathos_Thalamou, Eks_ipsos_thalamou, 
                      Apostasi_thalamou_toixou_x, Apostasi_thalamou_toixou_y, 
                      Use_normal_bracket, PAHOS_PORTAS_CONST,
                      G_portas, CO_portas, pahos_sthrigmatos_door_var, pahos_sthrigmatos_opp_var,
                      Apostasi_thalamou_toixou_ar_rear, Apostasi_thalamou_toixou_dek_rear, Apostasi_toixou_odhgou_y_rear,
                      Apostasi_thalamou_odhgou_rear, Apostasi_toixou_odhgou_x_dek_rear, Apostasi_toixou_odhgou_x_ar_rear, 
                      DEKSIA_SIDE_BRACKET, ARISTERA_SIDE_BRACKET, pahos_sthrigmatos_rear):
    
    current_inputs = user_inputs.copy()

    # fixed area logic 
    if current_inputs.get('scenario') == 'fixed_area':
        req_area = current_inputs.get('required_area', 0)
        if req_area > 0:
            int_req_area = int(req_area)
            int_max_area = int(req_area * 1.05)
            solver.add(Platos_thalamou * Vathos_Thalamou >= int_req_area)
            solver.add(Platos_thalamou * Vathos_Thalamou <= int_max_area)
    
    THE_SASSI_POSITION = user_inputs.get('Thesi_Sassi')
    Tupos_Anoigmatos = user_inputs.get('Tupos_Anoigmatos')
    DOOR_TYPE = current_inputs.get('Tupos_Portas')
    min_tolerance_door_s = 40.0
    min_tolerance_opposite_s = 0.0
    min_tolerance_c = 40.0
    anoigma_portas = current_inputs.get('Anoigma_Portas')
    cabin_doors = current_inputs.get('Arithmos_Portwn')
    second_door_pos = current_inputs.get('Thesi_Deuteris_Portas')
    dir_first_door = current_inputs.get('Kateuthinsi_anoigmatos')
    dir_second_door = current_inputs.get('Kateuthinsi_Deuteris_Portas')
    
    solver.add(Anoigma_odhgwn_const <= Platos_thalamou)

    Pahos_portas = PAHOS_PORTAS_CONST
    Platos_freatiou = user_inputs['Platos_freatiou']
    Vathos_freatiou = user_inputs['Vathos_freatiou']

    diff = Platos_thalamou - Vathos_Thalamou
    abs_diff = If(diff >= 0, diff, -diff)

    if current_inputs.get('scenario') == 'fixed_area':
        
        solver.add(abs_diff <= 800) 
    else:
        solver.add(abs_diff <= 600)




    solver.add(pahos_sthrigmatos_rear >= DEKSIA_SIDE_BRACKET['Pahos_Min'])
    solver.add(pahos_sthrigmatos_rear <= DEKSIA_SIDE_BRACKET['Pahos_Max'])
    



    muth_odhgou_dek = float(odhgoi_data['h1']) # ΕΝΗΜΕΡΩΣΗ: ΟΡΙΖΟΥΜΕ apostasi_toixou_odhgou κλπ.. την απόσταση από τον τοίχο μέχρι την βάση του στηρίγματος, δηλαδη χωρίς την μύτη
    muth_odhgou_aristera = float(odhgoi_data['h1'])
    pahos_sthrigmatos_rear = pahos_sthrigmatos_rear 
    
    
    # gia kentrarisma sthrigmatwn sthn kampina
    symmetry_diff_1 = Apostasi_toixou_odhgou_x_ar_rear - Apostasi_thalamou_toixou_ar_rear
    abs_1 = If(symmetry_diff_1 >= 0, symmetry_diff_1, -symmetry_diff_1)

    symmetry_diff_2 = Apostasi_toixou_odhgou_x_dek_rear - Apostasi_thalamou_toixou_dek_rear
    abs_2 = If(symmetry_diff_2 >=0 , symmetry_diff_2, -symmetry_diff_2)

    symmetry_diff_3 = abs_2 - abs_1
    abs_3 = If(symmetry_diff_3 >= 0, symmetry_diff_3, -symmetry_diff_3)
    solver.minimize(abs_3)

    solver.add(Apostasi_toixou_odhgou_x_ar_rear >= 90)
    solver.add(Apostasi_toixou_odhgou_x_dek_rear >= 90)


    
    
    MIN_DGC = sassi_data['Distance_guiderail_cabin_min']
    MAX_DGC = sassi_data['Distance_Guiderail_cabin']
    
    MIN_DGW = sassi_data['Distance_wall_guiderail_min']
    MAX_DGW = sthrigma_data['max_wgd']

    solver.add(Apostasi_thalamou_odhgou_rear >= MIN_DGC)
    solver.add(Apostasi_thalamou_odhgou_rear <= MAX_DGC)
    # Όριο από το Σασί
    solver.add(Apostasi_toixou_odhgou_y_rear >= sassi_data['Distance_wall_guiderail_min'])

    # Όρια από το Στήριγμα
    solver.add(Apostasi_toixou_odhgou_y_rear <= sthrigma_data['max_wgd'])
    solver.add(Platos_thalamou == Platos_freatiou - Apostasi_thalamou_toixou_ar_rear - Apostasi_thalamou_toixou_dek_rear)
    solver.add(Vathos_Thalamou <= Vathos_freatiou - Apostasi_thalamou_odhgou_rear - Apostasi_toixou_odhgou_y_rear - Apostasi_lampa_y)
    solver.add(Platos_freatiou == Anoigma_odhgwn_const + muth_odhgou_aristera + muth_odhgou_dek + Apostasi_toixou_odhgou_x_ar_rear + Apostasi_toixou_odhgou_x_dek_rear + 2*pahos_sthrigmatos_rear)
    solver.add(Apostasi_thalamou_toixou_ar_rear >= CONSTANT_rules['Apostasi_thalamou_toixou_x_ar_min'] )
    solver.add(Apostasi_thalamou_toixou_dek_rear >= CONSTANT_rules['Apostasi_thalamou_toixou_x_dek_min'] )
    
    
    if cabin_doors == '1':
        solver.add(Apostasi_thalamou_toixou_ar_rear == Apostasi_thalamou_toixou_dek_rear)

    

    lampa_diff = Apostasi_ar_lampa - Apostasi_dek_lampa
    abs_lampa_diff = If(lampa_diff >= 0, lampa_diff, -lampa_diff)
    
    if DOOR_TYPE == 'Αυτόματη':
        required_opening = CO_portas
        #solver.add(Platos_thalamou >= required_opening)
       
 
         
        if Tupos_Anoigmatos == 'Πλαϊνό':
            solver.add(required_opening <= Platos_freatiou - G_portas - min_tolerance_door_s - min_tolerance_opposite_s - 120.0)
            solver.add(Apostasi_ar_lampa >= G_portas + 40.0) 
            solver.add(Apostasi_dek_lampa >= 120.0) # 120 είναι το ελάχιστο μήκος της κολώνας
            solver.add(Apostasi_ar_lampa + Apostasi_dek_lampa + required_opening == Platos_freatiou)
            solver.add(Apostasi_lampa_y == Pahos_portas + 50.0)
            
            #solver.add(Apostasi_ar_lampa + Apostasi_dek_lampa + required_opening == Platos_freatiou)

        else:
            solver.add(required_opening <= Platos_freatiou - G_portas - G_portas - min_tolerance_c - min_tolerance_c)
            solver.add(Apostasi_ar_lampa >= G_portas + min_tolerance_c)
            solver.add(Apostasi_dek_lampa >= G_portas + min_tolerance_c)
            solver.add(Apostasi_ar_lampa + Apostasi_dek_lampa + required_opening == Platos_freatiou)
            solver.add(Apostasi_lampa_y == Pahos_portas + 50.0)

            #solver.add(Apostasi_ar_lampa + Apostasi_dek_lampa + required_opening == Platos_freatiou)

        


    
    else: # Ημιαυτόματη πόρτα
        required_opening = CO_portas
        #solver.add(Platos_thalamou >= required_opening) 
        solver.add(required_opening == Platos_freatiou - Apostasi_ar_lampa - Apostasi_dek_lampa)
        solver.add(Apostasi_ar_lampa >= 120.0)
        solver.add(Apostasi_dek_lampa >= 120.0)
        solver.add(Apostasi_lampa_y >= CONSTANT_rules['LAMPA_Y_SEMI_MIN'])
        solver.add(Apostasi_lampa_y <= CONSTANT_rules['LAMPA_Y_SEMI_MAX'])

    if cabin_doors == '2_gwniako':
        
        if DOOR_TYPE == 'Αυτόματη':
            if second_door_pos == 'left' and dir_first_door == 'Αριστερά' and dir_second_door == 'panw':
                solver.add(Apostasi_lampa_y + CO_portas + G_portas + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_ar_rear == Pahos_portas + 50.0)
                solver.add(Apostasi_toixou_odhgou_x_ar_rear >= Pahos_portas + 60.0)

            elif second_door_pos == 'left' and dir_first_door == 'Αριστερά' and dir_second_door == 'katw':
                solver.add(300 + CO_portas + G_portas + Apostasi_lampa_y + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_ar_rear == Pahos_portas + 50.0)
                solver.add(Apostasi_toixou_odhgou_x_ar_rear >= Pahos_portas + 60.0)
                
            elif second_door_pos == 'left' and dir_first_door == 'Δεξιά' and dir_second_door == 'panw':
                solver.add(CO_portas + G_portas + Apostasi_lampa_y + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_ar_rear == Pahos_portas + 50.0)
                solver.add(Apostasi_toixou_odhgou_x_ar_rear >= Pahos_portas + 60.0)
            
            elif second_door_pos == 'left' and dir_first_door == 'Δεξιά' and dir_second_door == 'katw':
                solver.add(300 + CO_portas + G_portas + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_ar_rear == Pahos_portas + 50.0)
                solver.add(Apostasi_toixou_odhgou_x_ar_rear >= Pahos_portas + 60.0)

            elif second_door_pos == 'right' and dir_first_door == 'Δεξιά' and dir_second_door == 'panw':
                solver.add(Apostasi_lampa_y + CO_portas + G_portas + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_dek_rear == Pahos_portas + 50.0)
                solver.add(Apostasi_toixou_odhgou_x_dek_rear >= Pahos_portas + 60.0)
            
            elif second_door_pos == 'right' and dir_first_door == 'Δεξιά' and dir_second_door == 'katw':
                solver.add(Apostasi_lampa_y + CO_portas + G_portas + 300.0 + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_dek_rear == Pahos_portas + 50.0)
                solver.add(Apostasi_toixou_odhgou_x_dek_rear >= Pahos_portas + 60.0)

            elif second_door_pos == 'right' and dir_first_door == 'Αριστερά' and dir_second_door == 'katw':
                solver.add(300 + CO_portas + G_portas + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_dek_rear == Pahos_portas + 50.0)
                solver.add(Apostasi_toixou_odhgou_x_dek_rear >= Pahos_portas + 60.0)
            
            elif second_door_pos == 'right' and dir_first_door == 'Αριστερά' and dir_second_door == 'panw':
                solver.add(Apostasi_lampa_y + CO_portas + G_portas + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_dek_rear == Pahos_portas + 50.0)
                solver.add(Apostasi_toixou_odhgou_x_dek_rear >= Pahos_portas + 60.0)



                

            
        elif DOOR_TYPE == 'Ημιαυτόματη':
            if second_door_pos == 'left':
                solver.add(Apostasi_thalamou_toixou_ar_rear >= 120.0)
                solver.add(Apostasi_thalamou_toixou_ar_rear <= 200.0)
            else:
                solver.add(Apostasi_thalamou_toixou_dek_rear >= 120.0)
                solver.add(Apostasi_thalamou_toixou_dek_rear <= 200.0)


    
   
    #solver.add(Apostasi_toixou_odhgou_x_ar_rear <= (Platos_freatiou - Anoigma_odhgwn_const - muth_odhgou_aristera - muth_odhgou_dek - 2*pahos_sthrigmatos_rear)/2)

    # Emvadon_guro = (Apostasi_thalamou_toixou_ar_rear + Apostasi_thalamou_toixou_dek_rear) * Vathos_freatiou + (Apostasi_thalamou_odhgou_rear + Apostasi_toixou_odhgou_y_rear + Apostasi_lampa_y) * Platos_thalamou 
    threshold = 190.0
    combined_apostasi = (Platos_freatiou - Anoigma_odhgwn_const)/2

    Large_constraints = And(
        muth_odhgou_aristera == muth_odhgou_dek,
        Apostasi_toixou_odhgou_x_ar_rear >= 90
    )

    Small_constraints = And(
        Apostasi_toixou_odhgou_x_ar_rear == 0,
        Apostasi_toixou_odhgou_x_dek_rear == 0,
        muth_odhgou_aristera == muth_odhgou_dek
    )

    solver.add(Implies(combined_apostasi < threshold, Small_constraints))
    solver.add(Implies(combined_apostasi >= threshold, Large_constraints))
   
    solver.minimize(abs_lampa_diff)
  


      
        
