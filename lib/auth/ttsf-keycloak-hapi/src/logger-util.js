const LoggerTag = {
  DEBUG: 'debug',
  ERROR: 'error',
  KEYCLOAK: 'keycloak',
};

const DEFAULT_TAGS = [LoggerTag.KEYCLOAK];

const noop = () => {};
let log = noop;

const initialize = (server) => {
  if (log === noop) {
    log = server.log.bind(server);
  }
};

const debug = (message) => {
  log([LoggerTag.DEBUG, ...DEFAULT_TAGS], message);
};

const error = (message) => {
  log([LoggerTag.ERROR, ...DEFAULT_TAGS], message);
};

module.exports = { LoggerTag, noop, initialize, debug, error };
