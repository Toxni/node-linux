import Hapi from 'hapi';
import h2o2 from 'h2o2';
import inert from 'inert';
import { exec } from 'child_process';


/**
 * Start Hapi server on port 8000.
 */
const host = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 8000;
const server = new Hapi.Server();

server.connection({ host, port });
server.register(
  [h2o2, inert], (err) => {
    if (err) throw err;
  }
);

server.route([
  {
    method: ['GET'],
    path: '/',
    config: {
      auth: false,
      handler(request, reply) {
        const webserver = process.env.NODE_ENV === 'production' ? '' : `//${host}:8080`;

        return reply(
          `<!doctype html>
          <html lang="en-us">
            <head>
              <meta charset="utf-8">
              <title>node linux</title>
              <link href="${webserver}/assets/app.css" rel="stylesheet"/>
            </head>
            <body>
              <div id="app"></div>
              <script src="${webserver}/assets/app.js"></script>
            </body>
          </html>`
        );
      },
    },
  },
  {
    method: ['POST'],
    path: '/order',
    config: {
      auth: false,
      handler(request, reply) {
        console.log(request.payload);
        const order = request.payload;
        const options = order.split(/\s+/).splice(0, 1);
        exec(order, options, (error, stdout) => {
          if (error) {
            return reply(`Error code: ${error.code}; Error stack: ${error.stack}`);
          }
          console.log(stdout);
          return reply(`${stdout}`);
        });
      },
    },
  },
  {
    method: 'GET', path: '/assets/{filename*}',
    config: {
      auth: false,
      handler: {
        file: (request) => {
          let assetsPath = `dist${request.path}`;
          if (process.env.NODE_ENV === 'production') {
            assetsPath = `.${request.path}`;
          }
          return assetsPath;
        },
      },
    },
  },
]);

export function runServer() {
  server.start(() => {
    /* eslint no-console:0 */
    console.info(`==> 🌎  Go to ${server.info.uri.toLowerCase()}`);
  });
}

if (process.env.NODE_ENV === 'production') {
  runServer();
}

export default {
  server,
  runServer,
};

