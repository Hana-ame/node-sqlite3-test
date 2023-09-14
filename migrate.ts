import sqlite3 from 'sqlite3';
const sqlite3Verbose = sqlite3.verbose();

const oldDB = new sqlite3Verbose.Database('notes_old.db'); 
const db = new sqlite3Verbose.Database('notes.db'); 

db.serialize(() => {
  // 创建表
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY, 
    spoiler_text TEXT,
    content TEXT,
    data TEXT,
    favourited_by TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS accts (
    id TEXT PRIMARY KEY, 
    acct TEXT,
    data TEXT,
    relationship TEXT)`);
});

const rows: any = await function query() {
  return new Promise((resolve) => {
    oldDB.serialize(() => {
      oldDB.all(`SELECT data FROM notes;`, (err, rows: any) => {
        if (err) {
          console.error(err.message);
        }
        resolve(rows)
      })      
    })
  })
}()

db.serialize(() => {
  rows.forEach(row => {
    const transition = JSON.parse(row.data)
    const note = JSON.parse(transition.payload)
    db.run("INSERT OR REPLACE INTO notes (id, spoiler_text, content, data) VALUES (?, ?, ?, ?)",
      note.id, note.spoiler_text, note.content, row.data)
    // console.log(note)
    const account = note.account
    const data = JSON.stringify(account)
    // console.log(account)
    db.run("INSERT OR REPLACE INTO accts (id, acct, data) VALUES (?, ?, ?)",
      account.id, account.acct, data)
  });
})