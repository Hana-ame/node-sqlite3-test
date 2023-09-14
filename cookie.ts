import * as fs from 'fs'
import sqlite3 from 'sqlite3';
const sqlite3Verbose = sqlite3.verbose();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 解析 Cookie 文件格式
function parseCookieFile(data: string) {
  const cookies : Record<string,string> = {};

  // 按行分割文件内容
  const lines = data.split('\n');

  // 解析每一行的 Cookie 数据
  lines.forEach((line) => {
    const parts = line.split(';');
    const cookieData = parts[0].trim().split('=');
    // parse key and value
    const key = cookieData[0].trim();
    const value = cookieData[1].trim();
    // give it to recorder
    cookies[key] = value;
  });

  return cookies;
}

// load file
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
// db

function relationURL(id: string, host: string) {
  return `https://${host}/api/v1/accounts/relationships?id[]=${id}`
}

const db = new sqlite3Verbose.Database('notes.db'); 

function main(){
  return new Promise<Array<any>>((resolve) => {
    // const cookies = await readFileContents('cookie.txt')// .then(data => parseCookieFile(data))    
    db.serialize(() => {
      // read.
      db.all(`SELECT 
        id, data 
      FROM accts 
      WHERE 
        relationship IS NULL 
      LIMIT 50;`, (err, rows: any) => {
        if (err) {
          console.error(err.message);
        }
        resolve(rows)
      })      
    })
  })
  
}
const rows = await main()

db.serialize(() => {
  rows.forEach(row => {  
    console.log(row.id, row.data)
    let account = JSON.parse(row.data)
    // let id = account.id
    let url = relationURL(account.id, 'wxw.ooo')
    console.log(url)
    fetch(url, { // 难绷，忘记改了 
      headers : {
        Authorization: authorization, // todo
      }
    }).then(r => r.json()).then(a => {
      if (a.length === 0) {
        console.log(url, account)
        return
      }
      const r = a[0]
      console.log(r)
      
      if (r.blocked_by && !r.blocking) {
        // db.serialize(() => {
          db.run(`UPDATE accts 
          SET relationship = 'NEED BLOCK'
          WHERE id = ?`, row.id)
        // })
      } else if (r.blocked_by && r.blocking) {
        // db.serialize(() => {
          db.run(`UPDATE accts 
          SET relationship = 'BLOCKED'
          WHERE id = ?`, row.id)
        // })
      } else if (!r.blocked_by && !r.blocking) {
        // db.serialize(() => {
          db.run(`UPDATE accts 
          SET relationship = 'DEFAULT'
          WHERE id = ?`, row.id)
        // })
      } else {
        console.log("???")
      }
    }).catch(err => {
      console.log(err)
    })
  });
})

await delay(1000*10)
db.close();
