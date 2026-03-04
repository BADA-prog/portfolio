from flask import Flask, render_template
import sqlite3 # mysql.connector 대신 sqlite3를 사용합니다.

app = Flask(__name__)

# 1. DB 연결 함수 수정 (MySQL -> SQLite)
def get_db_connection():
    # portfolio.db 파일이 app.py와 같은 폴더에 있어야 합니다.
    conn = sqlite3.connect('portfolio.db')
    # 데이터를 딕셔너리 형태(키-값)로 가져오기 위한 설정
    conn.row_factory = sqlite3.Row 
    return conn

# 2. 결과 처리 함수 수정 (SQLite에 최적화)
def get_dict_result(conn, query, fetch_all=False):
    cursor = conn.execute(query)
    if fetch_all:
        # sqlite3.Row 객체를 일반 dict로 변환하여 반환
        return [dict(row) for row in cursor.fetchall()]
    else:
        row = cursor.fetchone()
        return dict(row) if row else {}

@app.route('/')
def home():
    conn = get_db_connection()
    
    # 각 테이블에서 데이터 가져오기
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

    # 하오핑 님의 기존 기술 스택 분류 로직 유지
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
    
    conn.close() # 연결 종료

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
    # Render 배포 시에는 보통 gunicorn을 사용하지만, 로컬 테스트용으로 남겨둡니다.
    app.run(debug=True)