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
    data TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS accts (
    id TEXT PRIMARY KEY, 
    acct TEXT,
    data TEXT,
    relationship TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS favourited_by (
    id TEXT PRIMARY KEY,
    data TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS reblogged_by (
    id TEXT PRIMARY KEY,
    data TEXT
  )`);
});

const noterows: any = await function query() {
  return new Promise((resolve) => {
    oldDB.serialize(() => {
      oldDB.all(`SELECT data, favourited_by, reblogged_by FROM notes;`, (err, rows: any) => {
        if (err) {
          console.error(err.message);
        }
        resolve(rows)
      })      
    })
  })
}()

const acctrows: any = await function query() {
  return new Promise((resolve) => {
    oldDB.serialize(() => {
      oldDB.all(`SELECT id, acct, data, relationship FROM accts;`, (err, rows: any) => {
        if (err) {
          console.error(err.message);
        }
        resolve(rows)
      })      
    })
  })
}()

db.serialize(() => {
  noterows.forEach(row => {
    const transition = JSON.parse(row.data)
    const note = JSON.parse(transition.payload)
    db.run("INSERT OR REPLACE INTO notes (id, spoiler_text, content, data) VALUES (?, ?, ?, ?)",
      note.id, note.spoiler_text, note.content, row.data)
    // console.log(note)
    if ( row.favourited_by !== null) {
      db.run("INSERT OR REPLACE INTO favourited_by (id, data) VALUES (?, ?)",
        note.id, row.favourited_by)
    }
    if ( row.reblogged_by !== null) {
      db.run("INSERT OR REPLACE INTO reblogged_by (id, data) VALUES (?, ?)",
        note.id, row.reblogged_by)
    }
    /*
    const account = note.account
    const data = JSON.stringify(account)
    // console.log(account)
    db.run("INSERT OR REPLACE INTO accts (id, acct, data) VALUES (?, ?, ?)",
      account.id, account.acct, data)
    */
  });
  acctrows.forEach(row => {
    db.run("INSERT OR REPLACE INTO accts (id, acct, data, relationship) VALUES (?, ?, ?, ?)",
    row.id, row.acct, row.data, row.relationship)
  });
})