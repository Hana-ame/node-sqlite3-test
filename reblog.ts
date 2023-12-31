import { readFileContents } from './utils.js';
const secret = await readFileContents('secret.json').then(r => JSON.parse(r))
const HOST = secret.host
import sqlite3 from 'sqlite3';
const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database('notes.db'); 

function getRows(){
  return new Promise<Array<any>>((resolve) => {
    // const cookies = await readFileContents('cookie.txt')// .then(data => parseCookieFile(data))    
    db.serialize(() => {
      // read.
      db.all(`SELECT 
        id, data 
      FROM notes 
      WHERE 
        reblogged_by IS NULL 
      LIMIT 30;`, (err, rows: any) => {
        if (err) {
          console.error(err.message);
        }
        resolve(rows)
      })      
    })
  })
}
const rows = await getRows()



function favUrl(id: string, host: string) {
  return `https://${host}/api/v1/statuses/${id}/reblogged_by`
}

const favArrs = await Promise.all(rows.map(async (row) => {
  const favArr: any[] = await fetch(favUrl(row.id, HOST)).then(r => r.json())
  return { favArr, id: row.id }
}))

db.serialize(() => {
  favArrs.forEach(({ favArr, id }) => {
    try {
      favArr.forEach(account => {
        db.run(`INSERT INTO accts (id, acct, data) VALUES (?, ?, ?) 
        ON CONFLICT(id) DO NOTHING;`,
        account.id, account.acct, JSON.stringify(account))
      })
    }catch(error){
      console.error('Error:', error.message);
    }
    db.run(`UPDATE notes SET reblogged_by = ? WHERE id = ?;`,
      JSON.stringify(favArr), id)
  })
})

db.close()