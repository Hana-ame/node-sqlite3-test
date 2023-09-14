# 要求
监听global的消息
存储所有的`"language":"zh"`消息
存储所有的account。

*间隔一段时间*

读取所有消息的fav列表
存储所有的account。

*间隔一端时间*

查阅所有的account，查看是否被block
存储被block列表。

# 设计

## notes.db
所有的消息，也许只需要id和content，和payload
|key|describe|
|---|--------|
|id|id|
|content|内容|
|payload|json|

## accounts.db
|key|describe|
|---|--------|
|id|人的id|
|username|用户名|
|host|@之后的内容|
|status|"blocking"/"normal"/"deleted" 没实现|

## wss.py
链接的global轴
**py懒得写，暂时先放着了**

## ws.js
做好了
会监听timeline的东西然后放进
notes，accts两张表
之后在做处理

# node.js
没有留下太多记录
## websocket

## sqlite3

# cheat sheet

## sqlite3
```sh
C:\bin\sqlite-tools-win32-x86-3400100\sqlite3.exe notes.db
```
```sql
SELECT name FROM sqlite_master WHERE type='table';
-- users
SELECT * FROM users;
-- 1|John
-- 2|Jane
```

# log

npm
run`npm init`
不知道起了什么作用


要打包吗？
[ref](https://zhuanlan.zhihu.com/p/66411743)
还没看，win到linux好像还蛮麻烦的


websocket
[ref](https://github.com/websockets/ws)


`import ws`报错了
```log
(node:11608) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
```
添加了`"type": "module"`到package.json里面
解决了
`--experimental-modules`是什么


```log
ReferenceError: require is not defined in ES module scope, you can use import instead
This file is being treated as an ES module because it has a '.js' file extension and 'package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.
```
问了chatGPT
```txt
const sqlite3 = require('sqlite3').verbose(); 转换成import
```
```js
import sqlite3 from 'sqlite3';
const sqlite3Verbose = sqlite3.verbose();
```
解决了 


sqlite实例代码
```js
// 创建数据库连接
const db = new sqlite3Verbose.Database('notes.db'); 
// 执行查询
db.serialize(() => {
  // 创建表
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)');

  // 插入记录
  db.run("INSERT INTO users (name) VALUES ('John')");
  db.run("INSERT INTO users (name) VALUES ('Jane')");

  // 查询记录
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }
    rows.forEach((row) => {
      console.log(row.id, row.name);
    });
  });
});
```
大概是GPT问出来的。


要proxy访问，先换个镜像试下去。



```log
node:internal/modules/cjs/loader:1050
  throw err;
  ^

Error: Cannot find module '\ws.js'
?[90m    at Module._resolveFilename (node:internal/modules/cjs/loader:1047:15)?[39m
?[90m    at Module._load (node:internal/modules/cjs/loader:893:27)?[39m
?[90m    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)?[39m
?[90m    at node:internal/main/run_main_module:23:47?[39m {
  code: ?[32m'MODULE_NOT_FOUND'?[39m,
  requireStack: []
}

Node.js v18.14.0
```
好像是因为还在安装过程中所以会报这个
绷不住了，给我整跑不起来了
难绷，等着吧，proxy也好像没用的样子。
监听没监听v6，然后链接连在v6，然后报错了，你是不是弱智。
```log
npm ERR!   code: 'ECONNREFUSED',
npm ERR!   errno: 'ECONNREFUSED',
npm ERR!   syscall: 'connect',
npm ERR!   address: '::1',
npm ERR!   port: 10809,
```
```sh
npm config set proxy http://127.0.0.1:10809
npm config set https-proxy http://127.0.0.1:10809
```
绷不住了，早点这么设置不好么。


```log
TypeError: HttpsProxyAgent is not a constructor
```
更正为
```js
import { HttpsProxyAgent } from 'https-proxy-agent';
```
[ref](https://pipedream.com/community/t/facing-httpsproxyagent-is-not-a-constructor-error-after-working-fine-what-could-be-the-issue/6354/3)


console死掉了用ctrl + C回复


~~好像成了~~
~~不成~~
~~成了~~


插入相同的acct会报错
修改为
```sql
INSERT OR REPLACE
```
就好了
[ref](https://www.sqlitetutorial.net/sqlite-replace-statement/)


十分钟20M
要不咱还是不存data了
哦，KB啊，那没事了……好像也不是没事


需要断线重连 
做好了，大概吧，还在跑着