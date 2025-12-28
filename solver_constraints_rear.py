from z3 import *




# ΣΤΑΘΕΡΟΙ ΓΕΝΙΚΟΙ ΚΑΝΟΝΙΣΜΟΙ
CONSTANT_rules = {
'Apostasi_thalamou_toixou_x_ar_min' : 70,
'Apostasi_thalamou_toixou_x_dek_min' :  70,
'LAMPA_Y_SEMI_MIN' : 120.0,
'LAMPA_Y_SEMI_MAX' : 200.0,
'LAMPA_Y_AUTO' : 50.0
}

def apply_constraints(solver, user_inputs, sassi_data, sthrigma_data, emvolo_data, odhgoi_data, door_data, 
                      DOOR_SIDE_BRACKET, OPPOSITE_SIDE_BRACKET, Apostasi_ar_lampa, Apostasi_dek_lampa, 
                      Anoigma_odhgwn_const, Apostasi_lampa_y, Apostasi_toixou_odhgou_x, 
                      Apostasi_toixou_odhgou_y_1, Apostasi_toixou_odhgou_y_2, Apostasi_thalamou_odhgou, 
                      Platos_thalamou, Vathos_Thalamou, Eks_ipsos_thalamou, 
                      Apostasi_thalamou_toixou_x, Apostasi_thalamou_toixou_y, 
                      Emvadon_thalamou, Emvadon_guro, Use_normal_bracket, PAHOS_PORTAS_CONST,
                      G_portas, CO_portas, pahos_sthrigmatos_door_var, pahos_sthrigmatos_opp_var, anoigma_portas, 
                      Apostasi_thalamou_toixou_ar_rear, Apostasi_thalamou_toixou_dek_rear, Apostasi_toixou_odhgou_y_rear,
                      Apostasi_thalamou_odhgou_rear, Apostasi_toixou_odhgou_x_dek_rear, Apostasi_toixou_odhgou_x_ar_rear, 
                      DEKSIA_SIDE_BRACKET, ARISTERA_SIDE_BRACKET, pahos_sthrigmatos_rear):
    
    current_inputs = user_inputs.copy()
    
    THE_SASSI_POSITION = user_inputs.get('Thesi_Sassi')
    Tupos_Anoigmatos = user_inputs.get('Tupos_Anoigmatos')
    DOOR_TYPE = current_inputs.get('Tupos_Portas')
    min_tolerance_door = 40.0
    min_tolerance_opposite = 0.0
    
    

    Pahos_portas = PAHOS_PORTAS_CONST
    Platos_freatiou = user_inputs['Platos_freatiou']
    Vathos_freatiou = user_inputs['Vathos_freatiou']
    Travel = user_inputs['Diadromi_Anelkystira']
    Rated_weight = user_inputs['Onomasthiko_Varos']
    Speed = user_inputs['Taxytita_Anelkystira']
    Vathos_puthmena = user_inputs['Vathos_Puthmena'] 
    Ipsos_telikou_orofou = user_inputs['Ypsos_Telikou_Orofou']


    solver.add(pahos_sthrigmatos_rear >= DEKSIA_SIDE_BRACKET['Pahos_Min'])
    solver.add(pahos_sthrigmatos_rear <= DEKSIA_SIDE_BRACKET['Pahos_Max'])
    



    muth_odhgou_dek = odhgoi_data['h1'] # ΕΝΗΜΕΡΩΣΗ: ΟΡΙΖΟΥΜΕ apostasi_toixou_odhgou κλπ.. την απόσταση από τον τοίχο μέχρι την βάση του στηρίγματος, δηλαδη χωρίς την μύτη
    muth_odhgou_aristera = odhgoi_data['h1']
    pahos_sthrigmatos_rear = pahos_sthrigmatos_rear 
    

    solver.add(Emvadon_thalamou  ==  Platos_thalamou * Vathos_Thalamou)
    
    
    MIN_DGC = sassi_data['Distance_guiderail_cabin_min']
    MAX_DGC = sassi_data['Distance_Guiderail_cabin']
    
    MIN_DGW = sassi_data['Distance_wall_guiderail_min']
    MAX_DGW = sthrigma_data['max_wgd']

    solver.add(Apostasi_thalamou_odhgou_rear >= MIN_DGC)
    solver.add(Apostasi_thalamou_odhgou_rear <= MAX_DGC)
    # Όριο από το Σασί
    solver.add(Apostasi_toixou_odhgou_y_rear >= sassi_data['Distance_wall_guiderail_min'])

    # Όρια από το Στήριγμα
    solver.add(Apostasi_toixou_odhgou_y_rear >= sthrigma_data['min_wgd'])
    solver.add(Apostasi_toixou_odhgou_y_rear <= sthrigma_data['max_wgd'])
    solver.add(Platos_thalamou <= Platos_freatiou - Apostasi_thalamou_toixou_ar_rear - Apostasi_thalamou_toixou_dek_rear)
    solver.add(Vathos_Thalamou <= Vathos_freatiou - Apostasi_thalamou_odhgou_rear - Apostasi_toixou_odhgou_y_rear - Apostasi_lampa_y)
    solver.add(Platos_freatiou >= Anoigma_odhgwn_const + muth_odhgou_aristera + muth_odhgou_dek + Apostasi_toixou_odhgou_x_ar_rear + Apostasi_toixou_odhgou_x_dek_rear + 2*pahos_sthrigmatos_rear)

    if DOOR_TYPE == 'Αυτόματη':
        required_opening = CO_portas
        solver.add(Platos_thalamou >= required_opening)
        solver.add(Apostasi_lampa_y == Pahos_portas + CONSTANT_rules['LAMPA_Y_AUTO'])
 
         
        if Tupos_Anoigmatos == 'Πλαϊνό':
            solver.add(Platos_freatiou >= min_tolerance_door + G_portas + required_opening + 120 + min_tolerance_opposite) # 120 είναι το μήκος της κολώνας

            if THE_SASSI_POSITION == 'Αριστερά':
                solver.add(Apostasi_ar_lampa >= G_portas + min_tolerance_door)
                solver.add(Apostasi_dek_lampa >= 120 + min_tolerance_opposite) # 120 είναι το ελάχιστο μήκος της κολώνας

            elif THE_SASSI_POSITION == 'Δεξιά':
                solver.add(Apostasi_dek_lampa >= G_portas + min_tolerance_door)
                solver.add(Apostasi_ar_lampa >= 120 + min_tolerance_opposite)

    
    else: # Ημιαυτόματη πόρτα
        required_opening = anoigma_portas
        solver.add(Platos_thalamou >= required_opening) 
        solver.add(required_opening <= Platos_freatiou - Apostasi_ar_lampa - Apostasi_dek_lampa)
        solver.add(Apostasi_lampa_y >= CONSTANT_rules['LAMPA_Y_SEMI_MIN'])
        solver.add(Apostasi_lampa_y <= CONSTANT_rules['LAMPA_Y_SEMI_MAX'])

 
    
    solver.add(Apostasi_thalamou_toixou_ar_rear >= CONSTANT_rules['Apostasi_thalamou_toixou_x_ar_min'] )
    solver.add(Apostasi_thalamou_toixou_dek_rear >= CONSTANT_rules['Apostasi_thalamou_toixou_x_dek_min'] )

    Emvadon_guro = (Apostasi_thalamou_toixou_ar_rear + Apostasi_thalamou_toixou_dek_rear) * Vathos_freatiou + (Apostasi_thalamou_odhgou_rear + Apostasi_toixou_odhgou_y_rear + Apostasi_lampa_y) * Platos_thalamou 
    threshold = 190.0
    combined_apostasi = Apostasi_toixou_odhgou_x_dek_rear + muth_odhgou_dek + pahos_sthrigmatos_rear

    if combined_apostasi < threshold:
        solver.add(Apostasi_toixou_odhgou_x_dek_rear == 0)
        solver.add(Apostasi_toixou_odhgou_x_ar_rear == 0)

   
     


      
        
