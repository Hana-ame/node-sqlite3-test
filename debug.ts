import * as fs from 'fs'

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