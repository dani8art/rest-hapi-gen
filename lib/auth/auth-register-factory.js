const Crypto = require('crypto');
const Hoek = require('@hapi/hoek');
const KeycloakRegister = require('./register/keycloak-register');
const NoopRegister = require('./register/noop-register');

module.exports = {
  get(server, options) {
    const config = Hoek.applyToDefaults(
      {
        enabled: false,
        kind: 'keycloak',
        session: {
          enabled: true,
          cookie: { name: 'rest-hapi-gen-session' },
          password: Crypto.randomBytes(16).toString('hex'),
        },
        server: { realm: 'master' },
      },
      options
    );

    if (config.enabled) {
      switch (config.kind) {
        case 'keycloak':
          return new KeycloakRegister(server, config);
        default:
          return new NoopRegister();
      }
    } else {
      return new NoopRegister();
    }
  },
};
