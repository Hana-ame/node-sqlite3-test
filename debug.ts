import * as fs from 'fs'
import sqlite3 from 'sqlite3';
const sqlite3Verbose = sqlite3.verbose();

const db = new sqlite3Verbose.Database('notes-bak.db'); 

const rows: any = await function query() {
  return new Promise((resolve) => {
    db.serialize(() => {
      db.all(`
      SELECT notes.id, reblogged_by.* 
      FROM notes 
      LEFT JOIN reblogged_by
      ON notes.id = reblogged_by.id 
      LIMIT 1 OFFSET 550;
      `, (err, rows: any) => {
        if (err) {
          console.error(err.message);
        }
        resolve(rows)
      })      
    })
  })
}()

rows.forEach(row => {
  console.log(row)
});

/*

async function readFileContents(filePath: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}
const authorization = await readFileContents('Authorization.txt')
console.log(authorization)
const secret = await readFileContents('secret.json').then(r => JSON.parse(r))
const host = secret.host
const id = secret.id


const url = `https://${host}/api/v1/accounts/relationships?id[]=${id}`
fetch(url, {
  headers : {
    Authorization: authorization,
  }
}).then(r => r.json())
.then(r => {
  console.log(r)
  console.log(r.blocked_by)
  console.log(r.blocking)
  if (r.blocked_by && !r.blocking) {
    console.log("???")
  }
})

*/