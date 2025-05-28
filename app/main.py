from flask import Flask, render_template, request, jsonify
import sqlite3
import os
import re

DB_PATH = os.path.join('data', 'notes.db')
app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def newWriteup():
    return render_template('new.html')

@app.route('/submit', methods=['POST'])
def submitWriteup():
    data = request.get_json()

    title = data.get('title')
    tags = data.get('tags')
    content = data.get('content')

    if not title or not tags or not content:
        return jsonify({'status': 'error', 'message': 'Missing fields'}), 400

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO writeups (title, tags, content)
        VALUES (?, ?, ?)
    ''', (title, tags, content))

    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

@app.route('/edit/<int:writeup_id>')
def edit_doc(writeup_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('SELECT tags, content FROM writeups WHERE id = ?', (writeup_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        tags, content = row
        return render_template('edit.html', tags=tags.split(', '), content=content)
    else:
        return "Writeup not found", 404

@app.route('/doc/<int:writeup_id>')
def view_writeup(writeup_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('SELECT title, content FROM writeups WHERE id = ?', (writeup_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        title, content = row
        return render_template('doc.html', title=title, content=content)
    else:
        return "Writeup not found", 404

@app.route('/search')
def search_writeups():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([])

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    terms = [q.strip() for q in query.split(" + ")] if " + " in query else [query]
    clauses = []
    params = []
    for term in terms:
        wildcard = f"%{term}%"
        clauses.append('(' + ' OR '.join([
            "title LIKE ? COLLATE NOCASE",
            "tags LIKE ? COLLATE NOCASE",
            "content LIKE ? COLLATE NOCASE"
        ]) + ')')
        params.extend([wildcard] * 3)

    sql = f'''
        SELECT id, title, tags, content
        FROM writeups
        WHERE {' AND '.join(clauses)}
    '''

    cursor.execute(sql, params)

    results = []
    for row in cursor.fetchall():
        id_, title, tags, content = row

        excerpt = None
        content_lower = content.lower()
        for term in terms:
            idx = content_lower.find(term.lower())
            if idx != -1:
                start = max(0, idx - 20)
                end = min(len(content), idx + len(term) + 20)
                excerpt = content[start:end].strip()
                if start > 0:
                    excerpt = "…" + excerpt
                if end < len(content):
                    excerpt = excerpt + "…"
                break

        results.append({
            'id': id_,
            'title': title,
            'tags': tags,
            **({'excerpt': excerpt} if excerpt else {})
        })

    conn.close()
    return jsonify(results)

def init_db():
    if not os.path.exists('data'):
        os.makedirs('data')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS writeups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            tags TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

    
if __name__ == '__main__':
    init_db();
    app.run(debug=True, port=1337)
