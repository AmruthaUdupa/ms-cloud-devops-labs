// A deliberately tiny HTTP service. The application code is fine in every
// case - the container around it is what is broken.
import { createServer } from 'node:http';

const port = process.env.PORT;
const greeting = process.env.GREETING;

createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`${greeting} from pid ${process.pid}\n`);
}).listen(port, () => {
  console.log(`listening on ${port}`);
});
