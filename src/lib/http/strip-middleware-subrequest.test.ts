import { once } from 'node:events';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { describe, expect, it } from 'vitest';
import {
  MIDDLEWARE_SUBREQUEST_HEADER,
  installMiddlewareSubrequestStrip,
} from './strip-middleware-subrequest';

describe('strip x-middleware-subrequest', () => {
  it('removes a forged header before the HTTP handler sees the request', async () => {
    installMiddlewareSubrequestStrip();
    const seen: Array<string | string[] | undefined> = [];
    const server = http.createServer((req, res) => {
      seen.push(req.headers[MIDDLEWARE_SUBREQUEST_HEADER]);
      const rawHas = req.rawHeaders.some(
        (value, index) => index % 2 === 0 && value.toLowerCase() === MIDDLEWARE_SUBREQUEST_HEADER
      );
      res.end(rawHas ? 'raw-present' : 'raw-absent');
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address() as AddressInfo;
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/brain-map-graph.json`, {
        headers: {
          'X-Middleware-Subrequest':
            'src/middleware:src/middleware:src/middleware:src/middleware:src/middleware',
        },
      });
      expect(await response.text()).toBe('raw-absent');
      expect(seen).toEqual([undefined]);
    } finally {
      server.close();
      await once(server, 'close');
    }
  });
});
