# usage

```sh
# 监听
node ./ws.js wss://wss.wxw.ooo/api/v1/streaming/?
# 通过relationship查漏补缺
./bash.sh cookie.js 300 30

# ex: 通过喜欢和reblog查漏补缺
./bash.sh fav.js 450 30 
./bash.sh reblog.js 450 30

# 打开数据库
C:\bin\sqlite-tools-win32-x86-3400100\sqlite3.exe notes.db
/c/bin/sqlite-tools-win32-x86-3400100/sqlite3.exe notes.db
```
```sql
-- 查看有什么
select count(id) from notes; select count(id) from accts where relationship is null; select count(id) from accts where relationship is not null; select id, acct, relationship from accts where relationship not in ('DEFAULT', 'HaruUrara', 'BLOCKED'); 
-- 返回值分别是
-- 收集到的note数
-- 还没查漏补缺的account数
-- 总的account数
```

## TODO
还没做proxy，要做一个么

# 要求
**key word: 查漏补缺**

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
事务和run的关系
还有精度的问题
sqlite3？
呃啊。js怎么写的问题。
有空记得看。
## typescript

`import fs`报错了，找不到

绷，config文件好像只读`/`的
另外还做了的事情
`tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs"
  }
}
```

`npm i -D @types/node`
```json
{
    "compilerOptions": {
    "types": [
      "node"
    ]
  }
}
```

绷，怎么拿这个编译的
```sh
tsc -p ./tsconfig.json
```

`tsconfig.json`改成
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "types": [
      "node"
    ]
  }
}
```
top level不让用await
[ref](https://stackoverflow.com/questions/66486903/top-level-await-expressions-are-only-allowed-when-the-module-option-is-set-t)

```json
{
  "compilerOptions": {
    ...
    "moduleResolution":"node",
  }
}
```
这是啥啊。
解决了`Cannot find module 'sqlite3'. Did you mean to set the 'moduleResolution' option to 'nodenext', or to add aliases to the 'paths' option?ts(2792)`


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


~~要proxy访问，先换个镜像试下去。~~



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


~~插入相同的acct会报错~~
~~修改为~~
```sql
INSERT OR REPLACE
```
~~就好了~~
[ref](https://www.sqlitetutorial.net/sqlite-replace-statement/) 
坑！（from 几个小时后）


十分钟20M
要不咱还是不存data了
哦，KB啊，那没事了……好像也不是没事


~~需要断线重连 ~~
做好了，大概吧，还在跑着


cookie
做个手动ban了的
哦还要先做查`favourated_by`和`reblog`
debug吃屎


~~可以先写一个查自己的。~~


数字被取整了，难绷
~~要修数据库。~~
修好了


差fav和reblog的查询
记得加column
加逻辑


修正了不期待的replace行为
[ref](https://www.one-tab.com/page/TsKsaa0aTT6f649npGFR5Q?ext=3476a8b4-aba9-4506-ac8e-fa942330ec65)
请用 on conflict
吃屎


改了一下relationship的逻辑
Array没解，难绷。
undefined什么都不会进去


favs.ts
not tested
tested,  works well?


curl notes from local users? (which will record favs from fedi)
curl ff?
sister's notes? once again make a lib? <- ~~this is good~~
all todo 


查名单里人的最新notes


绷不住了，怎么写出两种类型json存一起了，这下尬住了。不弄了
下次在说


改一下`ws.js`
表分开来了，下次