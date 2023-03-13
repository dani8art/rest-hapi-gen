const KeycloakAdapterConfig = require('../../src/keycloak-adapter-config');

class KeycloakAdapterConfigBuilder {
  constructor() {
    this._paths = { api: {} };
    this._token = {};
    this._keycloak = {};
  }

  bearerOnly(bearerOnly) {
    this._bearerOnly = bearerOnly;
    return this;
  }

  addPath(key, value) {
    this._paths[key] = value;
    return this;
  }

  addApiPath(key, value) {
    this._paths.api[key] = value;
    return this;
  }

  tokenMapper(tokenMapper) {
    this._token.mapper = tokenMapper;
    return this;
  }

  realm(realm) {
    this._keycloak.realm = realm;
    return this;
  }

  build() {
    return KeycloakAdapterConfig.get({
      bearerOnly: this._bearerOnly,
      paths: this._paths,
      token: this._token,
      keycloak: this._keycloak,
    });
  }
}

const complete = () => {
  return new KeycloakAdapterConfigBuilder()
    .bearerOnly(false)
    .tokenMapper(null)
    .realm('test-realm')
    .addPath('login', '/tests/login')
    .addPath('logout', '/tests/logout')
    .addPath('register', '/tests/register')
    .addApiPath('token', '/tests/token');
};

module.exports = { complete };
