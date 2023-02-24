class KeycloakConfigBuilder {
  bearerOnly(bearerOnly) {
    this._bearerOnly = bearerOnly;
    return this;
  }

  serverUrl(serverUrl) {
    this._serverUrl = serverUrl;
    return this;
  }

  realm(realm) {
    this._realm = realm;
    return this;
  }

  clientId(clientId) {
    this._clientId = clientId;
    return this;
  }

  secret(secret) {
    this._secret = secret;
    return this;
  }

  build() {
    return {
      bearerOnly: this._bearerOnly,
      serverUrl: this._serverUrl,
      realm: this._realm,
      realmUrl: `${this._serverUrl}/${this._realm}`,
      clientId: this._clientId,
      secret: this._secret,
      minTimeBetweenJwksRequests: 1,
      verifyTokenAudience: true,
    };
  }
}

const complete = () => {
  return new KeycloakConfigBuilder()
    .bearerOnly(false)
    .serverUrl('http://auth.local')
    .realm('test-realm')
    .clientId('test-client-id')
    .secret('test-secret');
};

module.exports = { complete };
