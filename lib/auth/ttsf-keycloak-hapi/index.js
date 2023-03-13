const pkg = require('./package.json');

const KeycloakAdapter = require('./src/keycloak-adapter');

/* This is a plugin registration backward-compatible with Hapijs v14+ */
const register = (server, options, next) => {
  const adapter = new KeycloakAdapter(server, options);

  adapter.register();

  if (next) {
    next();
  }
};

register.attributes = { pkg };

module.exports = { register, pkg, KeycloakAdapter };
