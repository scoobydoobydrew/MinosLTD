from z3 import *






# ΣΤΑΘΕΡΟΙ ΓΕΝΙΚΟΙ ΚΑΝΟΝΙΣΜΟΙ
CONSTANT_rules = {
'Apostasi_thalamou_toixou_x_min' : 100,
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
    solver.add(Apostasi_thalamou_odhgou <= 150)
    solver.add(Apostasi_toixou_odhgou_x <= 150)


    if current_inputs.get('scenario') == 'fixed_area':
        req_area = current_inputs.get('required_area', 0)
        if req_area > 0:
            # Μετατρέπουμε σε int για να μην μπερδευτεί ο Solver με floats
            int_req_area = int(req_area)
            int_max_area = int(req_area * 1.10)

            # Επιβάλλουμε το εμβαδόν
            solver.add(Platos_thalamou * Vathos_Thalamou >= int_req_area)
            solver.add(Platos_thalamou * Vathos_Thalamou <= int_max_area)



    THE_SASSI_POSITION = user_inputs.get('Thesi_Sassi')
    Tupos_Anoigmatos = user_inputs.get('Tupos_Anoigmatos')
    DOOR_TYPE = current_inputs.get('Tupos_Portas')
    min_tolerance_door_s = 40.0 # περίπτωση πλαϊνού ανοίγματος (door = αριστερά, _s = side opening door)
    min_tolerance_opposite_s = 0.0 # περίπτωση πλαϊνού ανοίγματος (opposite = δεξιά, _s = side opening door)
    min_tolerance_c = 40.0 # περίπτωση κεντρικού ανοίγματος (_c = central opening door, ίδια ανοχή και στις δύο πλευρές)
    anoigma_portas = current_inputs.get('Anoigma_Portas')
    kateuthinsi_anoigmatos = current_inputs.get('Kateuthinsi_anoigmatos')
    cabin_doors = str(current_inputs.get('Arithmos_Portwn'))
    second_door_pos = current_inputs.get('Thesi_Deuteris_Portas')
    dir_first_door = current_inputs.get('Kateuthinsi_anoigmatos')
    dir_second_door = current_inputs.get('Kateuthinsi_Deuteris_Portas')

    solver.add(Anoigma_odhgwn_const <= Vathos_Thalamou)

    Pahos_portas = PAHOS_PORTAS_CONST
    Platos_freatiou = user_inputs['Platos_freatiou']
    Vathos_freatiou = user_inputs['Vathos_freatiou']
    diff= Platos_thalamou - Vathos_Thalamou

    abs_diff = If(diff >= 0, diff, -diff)

    if current_inputs.get('scenario') == 'fixed_area':
        solver.add(abs_diff <= 800) 
    else:
        solver.add(abs_diff <= 400)

        
    solver.add(Apostasi_toixou_odhgou_y_1 >= 0)
    solver.add(Apostasi_toixou_odhgou_y_2 >= 0)
    #solver.add(Platos_thalamou % 10 == 0)
    #solver.add(Vathos_Thalamou % 10 == 0)
    solver.add(pahos_sthrigmatos_door_var >= DOOR_SIDE_BRACKET['Pahos_Min'])
    solver.add(pahos_sthrigmatos_door_var <= DOOR_SIDE_BRACKET['Pahos_Max'])
    solver.add(pahos_sthrigmatos_opp_var >= OPPOSITE_SIDE_BRACKET['Pahos_Min'])
    solver.add(pahos_sthrigmatos_opp_var <= OPPOSITE_SIDE_BRACKET['Pahos_Max'])

    muth_odhgou_door = odhgoi_data['h1'] # ΕΝΗΜΕΡΩΣΗ: ΟΡΙΖΟΥΜΕ apostasi_toixou_odhgou_y1 κλπ.. την απόσταση από τον τοίχο μέχρι την βάση του στηρίγματος, δηλαδγ χωρίς την μύτη
    muth_odhgou_opposite = odhgoi_data['h1']
    pahos_sthrigmatos_door = pahos_sthrigmatos_door_var
    pahos_sthrigmatos_opposite = pahos_sthrigmatos_opp_var


    
    
    MIN_DGC = sassi_data['Distance_guiderail_cabin_min']
    MAX_DGC = sassi_data['Distance_Guiderail_cabin']
    
    MIN_DGW = sassi_data['Distance_wall_guiderail_min']
    MAX_DGW = sthrigma_data['max_wgd']

    solver.add(Apostasi_thalamou_odhgou >= MIN_DGC)
    solver.add(Apostasi_thalamou_odhgou <= MAX_DGC)
    # Όριο από το Σασί
    solver.add(Apostasi_toixou_odhgou_x >= sassi_data['Distance_wall_guiderail_min'])

    # Όρια από το Στήριγμα

    solver.add(Platos_thalamou == Platos_freatiou - Apostasi_thalamou_odhgou - Apostasi_toixou_odhgou_x - Apostasi_thalamou_toixou_x)
    solver.add(Vathos_Thalamou == Vathos_freatiou - Apostasi_thalamou_toixou_y - Apostasi_lampa_y)
    solver.add(Vathos_freatiou == Anoigma_odhgwn_const + muth_odhgou_door + muth_odhgou_opposite + Apostasi_toixou_odhgou_y_1 + Apostasi_toixou_odhgou_y_2 + pahos_sthrigmatos_door + pahos_sthrigmatos_opposite)

    threshold = 190.0
    combined_apostasi_semi = (Vathos_freatiou - Anoigma_odhgwn_const)/2
    combined_apostasi_auto = (Vathos_freatiou - Anoigma_odhgwn_const - Pahos_portas)/2
    if DOOR_TYPE == 'Αυτόματη':
        required_opening = CO_portas
        #solver.add(required_opening <= Platos_freatiou)
        #if 1270 <= Vathos_freatiou <= 1313 and Tupos_Anoigmatos == 'Πλαϊνό' and current_inputs.get('scenario') != 'fixed_area' and Pahos_portas == 233:
            #solver.add(Anoigma_odhgwn_const == 650)
        #if Vathos_freatiou <= 1220 and Tupos_Anoigmatos == 'Πλαϊνό' and current_inputs.get('scenario') != 'fixed_area' and Pahos_portas == 233:
            #solver.add(combined_apostasi_auto <= 190.0)
        #if Vathos_freatiou < 1263 and Vathos_freatiou != 1262 and Tupos_Anoigmatos == 'Πλαϊνό' and current_inputs.get('scenario') != 'fixed_area' and Pahos_portas == 233:
            #solver.add(combined_apostasi_auto <= 190.0)
        #if Vathos_freatiou == 1262 and Tupos_Anoigmatos == 'Πλαϊνό' and current_inputs.get('scenario') != 'fixed_area' and Pahos_portas == 233:
           # solver.add(Apostasi_thalamou_toixou_y >= 80.0)
        #if Vathos_freatiou == 1263 and Tupos_Anoigmatos == 'Πλαϊνό' and current_inputs.get('scenario') != 'fixed_area' and Pahos_portas == 233:
            #solver.add(Anoigma_odhgwn_const == 600)
    
        

       

 
         
        if Tupos_Anoigmatos == 'Πλαϊνό':

            if kateuthinsi_anoigmatos == 'Αριστερά':
                solver.add(required_opening <= Platos_freatiou - min_tolerance_door_s - G_portas - 120 - min_tolerance_opposite_s) # 120 είναι το μήκος της κολώνας
                solver.add(Apostasi_ar_lampa >= G_portas + 40)
                solver.add(Apostasi_dek_lampa >= 120 + 20) # 120 είναι το ελάχιστο μήκος της κολώνας και 20 είναι μία δικλείδα ασφαλείας
                solver.add(Apostasi_ar_lampa + Apostasi_dek_lampa + required_opening == Platos_freatiou)
            
            elif kateuthinsi_anoigmatos == 'Δεξιά':
                solver.add(required_opening <= Platos_freatiou - min_tolerance_door_s - G_portas - 120 - min_tolerance_opposite_s)
                solver.add(Apostasi_ar_lampa >= 300)
                solver.add(Apostasi_dek_lampa >= G_portas + 40)
                solver.add(Apostasi_ar_lampa + Apostasi_dek_lampa + required_opening == Platos_freatiou)
            

          
                 

        else:
            solver.add(required_opening <= Platos_freatiou - min_tolerance_c - min_tolerance_c - G_portas - G_portas)
            solver.add(Apostasi_ar_lampa >= G_portas + min_tolerance_c)
            solver.add(Apostasi_dek_lampa >= G_portas + min_tolerance_c) 
            solver.add(Apostasi_ar_lampa + Apostasi_dek_lampa + required_opening == Platos_freatiou)

            #elif THE_SASSI_POSITION == 'Δεξιά':
                #solver.add(Apostasi_dek_lampa >= G_portas + min_tolerance_door)
                #solver.add(Apostasi_ar_lampa >= 120 + min_tolerance_opposite)

    


    else: # Ημιαυτόματη πόρτα
        lampa_semi_diff_ar = Apostasi_ar_lampa - 300
        lampa_semi_diff_dek = Apostasi_dek_lampa - 100
        lampa_semi_diff = lampa_semi_diff_ar - lampa_semi_diff_dek
        abs_lampa_semi_diff = If(lampa_semi_diff >= 0, lampa_semi_diff, -lampa_semi_diff)
        required_opening = CO_portas
        solver.add(required_opening <= Platos_freatiou - min_tolerance_c - min_tolerance_c - 240)
        solver.add(Platos_freatiou == required_opening + Apostasi_ar_lampa + Apostasi_dek_lampa)
        solver.add(Apostasi_dek_lampa >= 140)
        solver.add(Apostasi_ar_lampa >= Apostasi_toixou_odhgou_x + Apostasi_thalamou_odhgou)
        solver.minimize(abs_lampa_semi_diff)


    if cabin_doors == '2_opposite':
        
        if DOOR_TYPE == 'Αυτόματη':
            solver.add(Apostasi_thalamou_toixou_y == Pahos_portas + 50.0)
            solver.add(Apostasi_toixou_odhgou_y_2 >= Pahos_portas + 50.0)
            
        else:
            solver.add(Apostasi_thalamou_toixou_y >= 120.0)
            solver.add(Apostasi_thalamou_toixou_y <= 200.0)

    if cabin_doors == '2_gwniako':
        
        if DOOR_TYPE == 'Αυτόματη':
            solver.add(Apostasi_dek_lampa >= Apostasi_thalamou_toixou_x + 20)

            if dir_first_door == 'Αριστερά' and dir_second_door == 'panw':
                solver.add(Apostasi_lampa_y + CO_portas + G_portas + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_x == Pahos_portas + 50.0)
            
            elif dir_first_door == 'Αριστερά' and dir_second_door == 'katw':
                solver.add(300 + CO_portas + G_portas + Apostasi_lampa_y + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_x == Pahos_portas + 50.0)

            elif dir_first_door == 'Δεξιά' and dir_second_door == 'panw':
                solver.add(Apostasi_lampa_y + CO_portas + G_portas + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_x == Pahos_portas + 50.0)
            
            elif dir_first_door == 'Δεξιά' and dir_second_door == 'katw':
                solver.add(300 + CO_portas + G_portas + Apostasi_lampa_y + 20.0 <= Vathos_freatiou)
                solver.add(Apostasi_thalamou_toixou_x == Pahos_portas + 50.0)

        
        elif DOOR_TYPE == 'Ημιαυτόματη':
            solver.add(Apostasi_thalamou_toixou_x >=120.0)
                

        


    
        
    if current_inputs.get('scenario') == 'fixed_area':
        solver.add(Apostasi_dek_lampa >= Apostasi_thalamou_toixou_x + 20)
        

   
 
    
    solver.add(Apostasi_thalamou_toixou_y >= 100.0)
    solver.add(Apostasi_thalamou_toixou_x >= CONSTANT_rules['Apostasi_thalamou_toixou_x_min'] )

    # Emvadon_guro = (Apostasi_thalamou_odhgou + Apostasi_toixou_odhgou_x) * Vathos_freatiou + Apostasi_thalamou_toixou_y * Platos_thalamou + Apostasi_thalamou_toixou_x * Vathos_freatiou + Apostasi_lampa_y * Platos_freatiou
    
   
    symmetry_diff = Apostasi_toixou_odhgou_y_1 - Apostasi_toixou_odhgou_y_2
    
    
    Is_Y1_SEMI_Large = Bool('Is_Y1_Large')
    solver.add(Is_Y1_SEMI_Large == (combined_apostasi_semi > 190.0))
    
    semi_diff_katw = Apostasi_toixou_odhgou_y_1 - Apostasi_lampa_y
    semi_diff_panw = Apostasi_toixou_odhgou_y_2 - Apostasi_thalamou_toixou_y
    semi_diff = Int('semi_diff')
    solver.add(semi_diff == semi_diff_katw - semi_diff_panw)
    
    Large_Y_SEMI_Constraints = And(
    Apostasi_toixou_odhgou_y_2 >= 90,
    Apostasi_toixou_odhgou_y_1 >= Apostasi_toixou_odhgou_y_2 + 40,   
    semi_diff >= -70,
    semi_diff <= 70,
    #Apostasi_toixou_odhgou_y_1 <= Apostasi_toixou_odhgou_y_2 + 60,
    Apostasi_lampa_y >= CONSTANT_rules['LAMPA_Y_SEMI_MIN'],
    Apostasi_lampa_y <= CONSTANT_rules['LAMPA_Y_SEMI_MAX'],
    pahos_sthrigmatos_door == pahos_sthrigmatos_opposite, 
    muth_odhgou_door == muth_odhgou_opposite,
    #Apostasi_toixou_odhgou_y_1 == (Vathos_freatiou - Anoigma_odhgwn_const - muth_odhgou_door - muth_odhgou_opposite - 2*pahos_sthrigmatos_door)/2 
    )
    

    Small_Y_SEMI_Constraints = And(
    symmetry_diff >= -1,
    symmetry_diff <= 1,
    Apostasi_lampa_y >= CONSTANT_rules['LAMPA_Y_SEMI_MIN'],
    Apostasi_lampa_y <= CONSTANT_rules['LAMPA_Y_SEMI_MAX'],
    pahos_sthrigmatos_door == pahos_sthrigmatos_opposite,
    muth_odhgou_door == muth_odhgou_opposite,
    Apostasi_toixou_odhgou_y_1 == 0
    )


    Is_Y1_AUTO_Large = Bool('Is_Y1_AUTO_Large')
    solver.add(Is_Y1_AUTO_Large == ((combined_apostasi_auto > 190.0)))
    
    # για να κεντράρω τα μηχανήματα στο μέσο της καμπίνας στην περίπτωση που το combined_apostasi είναι μεγάλο
    panw_diff_large = Apostasi_toixou_odhgou_y_2 - Apostasi_thalamou_toixou_y
    katw_diff_large = Apostasi_toixou_odhgou_y_1 - Pahos_portas - 50
    balance_diff_large = Int('balance_diff_large')
    solver.add(balance_diff_large == panw_diff_large - katw_diff_large)

    Large_Y_AUTO_Constraints = And(
    Apostasi_toixou_odhgou_y_2 >= 110,
    Apostasi_lampa_y == Pahos_portas + 50,
    balance_diff_large >= -40,
    balance_diff_large <= 40,
    pahos_sthrigmatos_door == pahos_sthrigmatos_opposite,
    muth_odhgou_door == muth_odhgou_opposite,
    #Apostasi_toixou_odhgou_y_1 <= (Vathos_freatiou - muth_odhgou_door - muth_odhgou_opposite - 2*pahos_sthrigmatos_door)/2,
    Apostasi_toixou_odhgou_y_1 > (Pahos_portas + 60)

    )

    
    # για να κεντράρω τα μηχανήματα στο μέσο της καμπίνας στην περίπτωση που το combined_apostasi είναι μικρό
    panw_diff_small = pahos_sthrigmatos_opposite - Apostasi_thalamou_toixou_y 
    katw_diff_small = Apostasi_toixou_odhgou_y_1 + pahos_sthrigmatos_door - Pahos_portas - 50
    balance_diff_small = Int('balance_diff_small')
    solver.add(balance_diff_small == panw_diff_small - katw_diff_small)
    
    
    Small_Y_AUTO_Constraints = And(
    Apostasi_toixou_odhgou_y_2 == 0,
    Apostasi_lampa_y == Pahos_portas + 50,
    #panw_diff >= katw_diff + 50,
    balance_diff_small >= -50,
    balance_diff_small <= 50,
    Apostasi_toixou_odhgou_y_1 == (Vathos_freatiou - Anoigma_odhgwn_const - muth_odhgou_door - muth_odhgou_opposite - pahos_sthrigmatos_opposite - pahos_sthrigmatos_door),
    #Apostasi_toixou_odhgou_y_2 <= (Vathos_freatiou - Anoigma_odhgwn_const - muth_odhgou_door - muth_odhgou_opposite - pahos_sthrigmatos_opposite - pahos_sthrigmatos_door),
    Apostasi_toixou_odhgou_y_1 > (Pahos_portas + 55)
   

    )
    
    
    
    if DOOR_TYPE == 'Ημιαυτόματη':
        solver.add(Implies(Is_Y1_SEMI_Large, Large_Y_SEMI_Constraints))
        solver.add(Implies(Not(Is_Y1_SEMI_Large), Small_Y_SEMI_Constraints))
    elif DOOR_TYPE == 'Αυτόματη':
        

        solver.add(Implies(Is_Y1_AUTO_Large, Large_Y_AUTO_Constraints))
        solver.add(Implies(Not(Is_Y1_AUTO_Large), Small_Y_AUTO_Constraints))
        

    