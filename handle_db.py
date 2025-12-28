import mysql.connector

def connect_db():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='6970264073Ar',
            database='minosltd',
            charset='utf8mb4'
        )
        if connection.is_connected():
         print("Connection to the database was successful.")
         return connection
        else:
         print("Failed to connect to the database.")
         return None

    except mysql.connector.Error as err:
        # Αν υπάρξει σφάλμα (π.χ., λάθος κωδικός, λάθος host)
        print(f" Σφάλμα κατά τη σύνδεση στη βάση δεδομένων: {err}")
        return None



# ανακτά όλες τις στήλες για ένα συγκεκριμένο εξάρτημα
def fetch_component_data(db_connection, table_name, component_id, id_column_name):
    if db_connection is None:
        print("Σφάλμα: Η σύνδεση με τη βάση δεδομένων δεν είναι ενεργή.")
        return None
    try:
        cursor = db_connection.cursor(dictionary=True)
        query = f"SELECT * FROM {table_name} WHERE {id_column_name} = %s"
        cursor.execute(query, (component_id,))
        
        result = cursor.fetchone()
        cursor.close()
        return result
        
    except Exception as e:
        print(f"Σφάλμα ανάκτησης δεδομένων για {table_name} / {component_id}: {e}")
        return None

# ανακτά όλα τα διαθέσιμα IDs από έναν πίνακα    
def fetch_all_component_ids(db_connection, table_name, id_column_name):
    if db_connection is None:
        print("Σφάλμα: Η σύνδεση με τη βάση δεδομένων δεν είναι ενεργή.")
        return []
        
    try:
        cursor = db_connection.cursor() #
        
        query = f"SELECT {id_column_name} FROM {table_name}" 
        
        cursor.execute(query)
        
        results = cursor.fetchall()
        
        cursor.close()
        
        return [row[0] for row in results]
        
    except Exception as e:
        print(f"Σφάλμα ανάκτησης όλων των IDs από τον πίνακα {table_name}: {e}")
        return []
    
def fetch_suitable_stirigma(db, min_distance_required):
    
    # Η μεταβλητή Python για την απόσταση
    MIN_DIST_REQUIRED = min_distance_required 
    
    # Προσθέτουμε τον τύπο που αναζητούμε
    BRACKET_TYPE = 'Normal' 
    
    cursor = db.cursor(dictionary=True)
    
    # ΠΡΟΣΟΧΗ: Χρησιμοποιούμε %s για τους placeholders
    query = """
        SELECT 
            * FROM 
            Stirigmata
        WHERE 
            Tupos_Stirigmatos = %s 
            AND
            Max_apostasi_toixou >= %s 
        ORDER BY  
            Max_apostasi_toixou ASC 
        LIMIT 1
    """
    
    try:
        # Εκτέλεση με ασφαλή τρόπο (Περνάμε τις τιμές ως tuple)
        # ΠΡΟΣΟΧΗ στη σειρά: Tupos_Stirigmatos, μετά Max_apostasi_toixou
        cursor.execute(query, (BRACKET_TYPE, MIN_DIST_REQUIRED))
        result = cursor.fetchone()
        cursor.close()
        return result
        
    except Exception as e:
        print(f"Σφάλμα κατά την επιλογή στηρίγματος (MySQL): {e}")
        cursor.close()
        return None
    

    
def fetch_max_wall_bracket(db, apostasi_y_criteria):
    
    # Η μεταβλητή Python που θα περάσουμε στο execute
    MAX_PERMITTED_LENGTH = apostasi_y_criteria 
    
    
    cursor = db.cursor(dictionary=True)
    
   
    query = """
        SELECT 
            * FROM 
            Stirigmata
        WHERE 
            Tupos_Stirigmatos = 'WALL'
            AND
            Max_Apostasi_Toixou <= %s 
        ORDER BY 
            Max_Apostasi_Toixou DESC 
        LIMIT 1
    """
    
    try:
        
        cursor.execute(query, (MAX_PERMITTED_LENGTH,))
        result = cursor.fetchone()
        cursor.close()
        return result
        
    except Exception as e:
        print(f"Σφάλμα κατά την επιλογή Wall Bracket (MySQL): {e}")
        cursor.close()
        return None
    



def fetch_suitable_door_ids(db_connection, required_opening, door_type, arithmos_fyllon=None, tupos_anoigmatos=None):
   
    table_name = 'Portes' 
    door_ids = []
    
    if db_connection is None:
        print("Σφάλμα: Η σύνδεση με τη βάση δεδομένων δεν είναι ενεργή.")
        return []

    try:

        cursor = db_connection.cursor()
        
        # βάση query και αρχικές παράμετροι
        query = f"""
        SELECT Tupos_Portas_ID 
        FROM {table_name}
        WHERE CO >= %s 
          AND Tupos = %s
        """
        params = [required_opening, door_type]

        # προσθήκη συνθηκών για αυτόματες πόρτες
        if door_type == 'Αυτόματη':
            
           
            if arithmos_fyllon is not None:
                query += " AND Arithmos_Fyllon = %s"
                params.append(arithmos_fyllon)
            
            
            if tupos_anoigmatos is not None:
                query += " AND Tupos_Anoigmatos = %s"
                params.append(tupos_anoigmatos)
        
        query += ";" 
        
        
        cursor.execute(query, tuple(params))
        
        
        results = cursor.fetchall()
        for row in results:
            door_ids.append(row[0]) 
        
        cursor.close()
        return door_ids
        
    except Exception as e:
        print(f"Σφάλμα κατά την επιλογή κατάλληλων Door IDs (MySQL): {e}")
        cursor.close()
        return []