const {program} = require("commander");
const http = require("http");
const fs =require("fs");
const path = require("path");
const fsp= fs.promises;
const superagent = require("superagent");

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

const server = http.createServer(async (req, res) => {
const urlPath = req.url.slice(1);
 const filePath = path.join(cachePath, `${urlPath}.jpg`);

 try {
  switch(req.method){
    case "GET":
      try{
        const data = await fsp.readFile(filePath);
        res.writeHead(200, { "Content-Type": "image/jpeg" });
          res.end(data);
      } catch{
       console.log("Файл не знайдено в кеші");
       try{
            const response = await superagent.get(`https://http.cat/${urlPath}`);
            const imageData = response.body;

            
            await fsp.writeFile(filePath, imageData);
            console.log("Збережено у кеш: ${filePath}");

            
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            res.end(imageData);
       }catch(err){
        console.error("Помилка запиту до http.cat");
         res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Зображення не знайдено на сервері http.cat");
       }
      } 
       break;
    case "PUT":
      let body = [];
      req.on("data", chunk => body.push(chunk));
      req.on("end", async () => {
          const buffer = Buffer.concat(body);
          await fsp.writeFile(filePath, buffer);
          res.writeHead(201, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Файл збережено в кеші");
      });
      break;
    case "DELETE":
      try {
           await fsp.unlink(filePath);
          res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Файл видалено з кешу");
        } catch {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Файл для видалення не знайдено");
        }
        break;
     default:
        res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Метод не дозволено");

      }
    }
  catch(err){
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Внутрішня помилка сервера: " + err.message);
  }




});

server.listen(port, host, () => {
  console.log(`Сервер запущено на http://${host}:${port}`);
});



