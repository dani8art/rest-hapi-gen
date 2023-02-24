const HapiServerUtil = require('../../hapi-server-util');

module.exports = class KeycloakRegister {
  constructor(server, config) {
    this.server = server;
    this.config = config;
  }

  async register() {
    if (this.config.session.enabled === true) {
      const { session } = this.config;

      const yar = require('@hapi/yar');

      if (!HapiServerUtil.isRegistered(this.server, yar)) {
        await this.server.register({
          plugin: yar,
          options: {
            storeBlank: false,
            name: session.cookie.name,
            maxCookieSize: 0,
            cookieOptions: {
              password: session.password,
              isSecure: this.config.tls,
            },
          },
        });
      }
    }

    const ttsfKeycloakHapi = require('../ttsf-keycloak-hapi');

    if (!HapiServerUtil.isRegistered(this.server, ttsfKeycloakHapi)) {
      await this.server.register({
        plugin: ttsfKeycloakHapi,
        options: {
          basePath: this.config.basePath,
          keycloak: { server: this.config.server.url, realm: this.config.server.realm, client: this.config.client },
          bearerOnly: !this.config.session.enabled,
        },
      });

      this.server.auth.strategy('keycloak', 'keycloak');
      this.server.auth.default('keycloak');
    }
  }
};
