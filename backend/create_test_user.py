import sqlite3

con = sqlite3.connect('app/connectus.db')
cur = con.cursor()
cur.execute('INSERT OR IGNORE INTO users (nickname, password_hash, full_name, email) VALUES ("test", "test_hash", "Test User", "test@test.com")')
con.commit()
con.close()
print('User test created')

