const {program} = require("commander");
const http = require("http");
const fs =require("fs");
const path = require("path");

program

.requiredOption("-h, --host <host>", "Введіть адресу хоста")
.requiredOption("-p, --port <port>", "Введіть порт сервера")
.requiredOption("-c, --cache <path>", "Введіть шлях до директорії"); 

program.configureOutput({
outputError: (str, write) => {
 }
});

program.exitOverride();


try{
program.parse();

}
catch(err){
if (err.code === 'commander.missingMandatoryOptionValue') {
    console.error("Please write required argument")
  }
 else console.error(err.message)
 process.exit(1);
}
const options= program.opts();
const cachePath = path.resolve(options.cache);
 if (!fs.existsSync(cachePath)) {
  console.error("Директорія кешу не існує");
  fs.mkdirSync(cachePath, { recursive: true });
  console.log("Директорію створено");
 }
 else {
    console.log("Директорія кешу вже існує:", cachePath);
 };
const host = options.host;
const port = options.port;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Сервер працює!");
});

server.listen(port, host, () => {
  console.log(`
  Сервер запущено на http://${host}:${port}`);
});



