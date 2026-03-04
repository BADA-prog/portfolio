from flask import Flask, render_template
import mysql.connector

app = Flask(__name__)

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="1234",
        database="my_portfolio"
    )

def get_dict_result(cursor, query, fetch_all=False):
    cursor.execute(query)
    columns = [col[0] for col in cursor.description]
    if fetch_all:
        return [dict(zip(columns, row)) for row in cursor.fetchall()]
    else:
        row = cursor.fetchone()
        return dict(zip(columns, row)) if row else {}

@app.route('/')
def home():
    conn = get_db_connection()
    cursor = conn.cursor() 
    my_profile = get_dict_result(cursor, "SELECT * FROM profile LIMIT 1")
    my_features = get_dict_result(cursor, "SELECT * FROM about_features", fetch_all=True)
    
    experience_query = """
        SELECT * FROM experience 
        ORDER BY is_present DESC, start_year DESC, start_month DESC
    """
    my_experience = get_dict_result(cursor, experience_query, fetch_all=True)
    reference_query = "SELECT * FROM reference WHERE is_visible = 1"
    my_references = get_dict_result(cursor, reference_query, fetch_all=True)
    
    cert_query = "SELECT * FROM certificates"
    my_certs = get_dict_result(cursor, cert_query, fetch_all=True)
    
    skills_list = get_dict_result(cursor, "SELECT * FROM skills", fetch_all=True)

    level_config = {
        0: {"name": "Advanced", "criteria": "90%+", "ring_idx": 2, "lb_idx": 2},
        1: {"name": "Intermediate", "criteria": "70-89%", "ring_idx": 1, "lb_idx": 1},
        2: {"name": "Basic", "criteria": "50-69%", "ring_idx": 0, "lb_idx": 0}
    }

    grouped_skills = {}
    for db_val in [0, 1, 2]:
        grouped_skills[db_val] = {
            "info": level_config[db_val],
            "skill_list": [s for s in skills_list if s['orbit_ring'] == db_val]
        }
    my_strength = get_dict_result(cursor, "SELECT * FROM core_strenghts", fetch_all=True)
    my_languages = get_dict_result(cursor, "SELECT * FROM languages ORDER BY display_order", fetch_all=True)
    my_coursework = get_dict_result(cursor, "SELECT * FROM coursework ORDER BY display_order", fetch_all=True)
    my_projects = get_dict_result(cursor, "SELECT * FROM projects", fetch_all=True)
    cursor.close()
    conn.close()

    return render_template('index.html', 
                           profile=my_profile, 
                           about_features=my_features,
                           experience=my_experience,
                           references=my_references,
                           certificates=my_certs,
                           skills=grouped_skills,
                           strengths=my_strength,
                           languages=my_languages,
                           coursework=my_coursework,
                           projects=my_projects)
    
if __name__ == '__main__':
    app.run(debug=True)