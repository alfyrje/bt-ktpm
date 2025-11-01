import sqlite3
import os
DB = os.environ.get('DB_PATH','/data/shard1.db')
conn = sqlite3.connect(DB)
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS books (book_id INTEGER PRIMARY KEY, goodreads_book_id INTEGER, title TEXT, authors TEXT, original_publication_year INTEGER, average_rating REAL)''')
conn.commit()
conn.close()
