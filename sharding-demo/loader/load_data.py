import pandas as pd
import requests
import sqlite3
import os

URL = 'https://raw.githubusercontent.com/zygmuntz/goodbooks-10k/master/books.csv'
SPLIT = 3
OUT_DIR = './shard-data'
os.makedirs(OUT_DIR, exist_ok=True)
res = requests.get(URL)
open('books.csv','wb').write(res.content)
df = pd.read_csv('books.csv')
df = df[['book_id','goodreads_book_id','title','authors','original_publication_year','average_rating']]
for i in range(SPLIT):
    path = os.path.join(OUT_DIR, f'shard{i+1}.db')
    conn = sqlite3.connect(path)
    conn.execute('''CREATE TABLE IF NOT EXISTS books (book_id INTEGER PRIMARY KEY, goodreads_book_id INTEGER, title TEXT, authors TEXT, original_publication_year INTEGER, average_rating REAL)''')
    conn.commit()
    conn.close()

for idx,row in df.iterrows():
    key = int(row['book_id'])
    sid = key % SPLIT
    db = os.path.join(OUT_DIR, f'shard{sid+1}.db')
    conn = sqlite3.connect(db)
    conn.execute('''INSERT OR REPLACE INTO books (book_id,goodreads_book_id,title,authors,original_publication_year,average_rating) VALUES (?,?,?,?,?,?)''',
                 (int(row['book_id']), int(row['goodreads_book_id']), str(row['title']), str(row['authors']), int(row['original_publication_year']) if not pd.isna(row['original_publication_year']) else None, float(row['average_rating'])))
    conn.commit()
    conn.close()

full_db = os.path.join(OUT_DIR, 'full.db')
conn = sqlite3.connect(full_db)
conn.execute('''CREATE TABLE IF NOT EXISTS books (book_id INTEGER PRIMARY KEY, goodreads_book_id INTEGER, title TEXT, authors TEXT, original_publication_year INTEGER, average_rating REAL)''')
for idx,row in df.iterrows():
    conn.execute('''INSERT OR REPLACE INTO books (book_id,goodreads_book_id,title,authors,original_publication_year,average_rating) VALUES (?,?,?,?,?,?)''',
                 (int(row['book_id']), int(row['goodreads_book_id']), str(row['title']), str(row['authors']), int(row['original_publication_year']) if not pd.isna(row['original_publication_year']) else None, float(row['average_rating'])))
conn.commit()
conn.close()
