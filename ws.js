import url from "url";
import WebSocket from "ws";
import sqlite3 from "sqlite3";
const sqlite3Verbose = sqlite3.verbose();
import { HttpsProxyAgent } from "https-proxy-agent";

console.log(process.argv);

const PROXY = "http://localhost:10809";
const WSS_URL = process.argv[2];
const parsed = url.parse(WSS_URL);
const options = url.parse(PROXY);
const agent = new HttpsProxyAgent(options);

// workflow for sqlite3

// 创建数据库连接
const db = new sqlite3Verbose.Database("notes.db");
// 执行查询
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

function saveAcctToDB(id, acct, data) {
  // console.log("INSERT OR REPLACE INTO accts (id, acct, data) VALUES (?, ?, ?)",
  // id, acct, data)
  // db.serialize(() => {
  db.run(
    `INSERT INTO accts (id, acct, data) VALUES (?, ?, ?) 
      ON CONFLICT(id) DO
      UPDATE SET data=excluded.data;`,
    [id, acct, data],
    (error) => {
      if (error) {
        if (error.code === "SQLITE_BUSY") {
          console.log(`Database is locked, retry after a delay`)
          setTimeout(() => saveAcctToDB(id, acct, data), 500);
        } else {
          console.error("Error executing SQL query:", error);
        }
      }
    }
  );
  // })
}

function saveNoteToDB(id, spoiler_text, content, data) {
  // console.log("INSERT OR REPLACE INTO notes (id, spoiler_text, content, data) VALUES (?, ?, ?, ?)",
  // id, spoiler_text, content, data)
  // db.serialize(() => {
  db.run(
    `INSERT INTO notes (id, spoiler_text, content, data) VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING;`,
    [id, spoiler_text, content, data],
    (error) => {
      if (error) {
        if (error.code === "SQLITE_BUSY") {
          console.log(`Database is locked, retry after a delay`)
          setTimeout(() => saveNoteToDB(id, spoiler_text, content, data), 500);
        } else {
          console.error("Error executing SQL query:", error);
        }
      }
    }
  );
  // })
}

// workflow for  websocket

function connect() {
  let ws = new WebSocket(WSS_URL, {
    // agent: agent,
    perMessageDeflate: false,
  });

  ws.on("error", console.error);

  // connect to timeline
  ws.on("open", function open() {
    ws.send('{"type":"subscribe","stream":"public"}');
  });

  // 还行，能接受到了
  ws.on("message", function message(data) {
    // console.log('received: %s', data);
    try {
      const jsonObject = JSON.parse(data);
      const payload = JSON.parse(jsonObject.payload); // this should be payload json.
      if (payload.language === "zh") {
        saveNoteToDB(
          payload.id,
          payload.spoiler_text,
          payload.content,
          jsonObject.payload
        );
        const account = payload.account;
        saveAcctToDB(account.id, account.acct, JSON.stringify(account));
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

  ws.onclose = function (e) {
    console.log(
      "Socket is closed. Reconnect will be attempted in 1 second.",
      e.reason
    );
    setTimeout(function () {
      connect();
    }, 1000);
  };
}

connect();
