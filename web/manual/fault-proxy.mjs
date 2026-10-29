// Local browser-QA fixture. Production always uses the real Go server directly.
import http from 'node:http';
let failed = false;
const upstream = 'http://127.0.0.1:8080';
http
  .createServer(async (req, res) => {
    if (req.url === '/api/v1/profile' && !failed) {
      failed = true;
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: {
            code: 'temporary_failure',
            message: 'Temporary connection issue. Please try again.',
          },
        }),
      );
      return;
    }
    try {
      const response = await fetch(new URL(req.url, upstream), { method: req.method });
      const headers = Object.fromEntries(response.headers);
      delete headers['transfer-encoding'];
      res.writeHead(response.status, headers);
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('QA upstream unavailable');
    }
  })
  .listen(8082, '127.0.0.1', () => console.log('Failure/retry QA proxy: http://127.0.0.1:8082'));
