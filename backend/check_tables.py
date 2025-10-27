import sqlite3

con = sqlite3.connect('app/connectus.db')
cur = con.cursor()
cur.execute('SELECT name FROM sqlite_master WHERE type="table"')
print('Tabelas existentes:')
for r in cur.fetchall():
    print(f'  {r[0]}')
con.close()

