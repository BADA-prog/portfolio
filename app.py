from flask import Flask, render_template
import sqlite3 

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('portfolio.db')
    conn.row_factory = sqlite3.Row 
    return conn


def get_dict_result(conn, query, fetch_all=False):
    cursor = conn.execute(query)
    if fetch_all:
        return [dict(row) for row in cursor.fetchall()]
    else:
        row = cursor.fetchone()
        return dict(row) if row else {}

@app.route('/')
def home():
    conn = get_db_connection()
    
    my_profile = get_dict_result(conn, "SELECT * FROM profile LIMIT 1")
    my_features = get_dict_result(conn, "SELECT * FROM about_features", fetch_all=True)
    
    experience_query = """
        SELECT * FROM experience 
        ORDER BY is_present DESC, start_year DESC, start_month DESC
    """
    my_experience = get_dict_result(conn, experience_query, fetch_all=True)
    
    reference_query = "SELECT * FROM reference WHERE is_visible = 1"
    my_references = get_dict_result(conn, reference_query, fetch_all=True)
    
    my_certs = get_dict_result(conn, "SELECT * FROM certificates", fetch_all=True)
    skills_list = get_dict_result(conn, "SELECT * FROM skills", fetch_all=True)


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

    my_strength = get_dict_result(conn, "SELECT * FROM core_strenghts", fetch_all=True)
    my_languages = get_dict_result(conn, "SELECT * FROM languages ORDER BY display_order", fetch_all=True)
    my_coursework = get_dict_result(conn, "SELECT * FROM coursework ORDER BY display_order", fetch_all=True)
    my_projects = get_dict_result(conn, "SELECT * FROM projects", fetch_all=True)
    
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

@app.route('/projects/<project_name>')
def project_detail(project_name):
    """
    DB의 project_url 값을 받아 상세 페이지를 보여주거나 외부 링크로 이동합니다.
    """
    if project_name.startswith('http'):
        return redirect(project_name)
    
    try:
        return render_template(f'projects/{project_name}.html')
    except Exception as e:
        print(f"Error loading project page: {e}")
        return redirect(url_for('home'))
    
if __name__ == '__main__':
    app.run(debug=True)