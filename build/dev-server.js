const opn             = require('opn');
const path            = require('path');
const express         = require('express');
const webpack         = require('webpack');
const proxyMiddleware = require('http-proxy-middleware');
const chalk           = require('chalk');
const webpackConfig   = require('./webpack.dev.conf');
const devConf         = require('./config').dev;

const app      = express();
const compiler = webpack(webpackConfig);

const port       = devConf.port;
const proxyTable = devConf.proxyTable; // https://github.com/chimurai/http-proxy-middleware

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  index: "index.html",
  publicPath: '/',
  noInfo: false,
  quiet: true
});

const hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: function () {
    const args = [].slice.call(arguments);
    console.log.apply(null, args.map(d => chalk.white(d)));
  },
  heartbeat: 2000
});

// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', compilation => {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({action: 'reload'});
    cb();
  })
});

// proxy api requests
Object.keys(proxyTable).forEach(context => {
  let options = proxyTable[context];
  if (typeof options === 'string') {
    options = {target: options}
  }
  app.use(proxyMiddleware(options.filter || context, options));
});
app.get('/', (req, res) => res.redirect('/index.html'));
app.use(require('connect-history-api-fallback')());
app.use(devMiddleware);
app.use(hotMiddleware);
app.use(express.static(path.join(__dirname, '../static')));

const uri = `http://${devConf.hostname}:${port}`;

let _resolve;
const readyPromise = new Promise(resolve => _resolve = resolve);

console.log(chalk.bgBlue.bold('> Starting dev server...\n'));
devMiddleware.waitUntilValid(() => {
  console.log(chalk.bgGreen.bold('> Listening at ' + uri + '\n'));
  if (devConf.autoOpenBrowser) {
    opn(uri);
  }
  _resolve();
});

const server = app.listen(port);

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close();
  }
};
