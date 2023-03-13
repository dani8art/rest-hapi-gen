class CredentialsBuilder {
  constructor() {
    this._accessToken = {};
    this._idToken = {};
  }

  name(name) {
    this._name = name;
    return this;
  }

  scope(scope) {
    this._scope = scope;
    return this;
  }

  accessToken(accessToken) {
    this._accessToken.content = accessToken + '-content';
    this._accessToken.token = accessToken + '-value';
    return this;
  }

  idToken(idToken) {
    this._idToken.content = idToken + '-content';
    this._idToken.token = idToken + '-value';
    return this;
  }

  build() {
    const credentials = { name: this._name, scope: this._scope };

    if (this._accessToken.token) {
      credentials.accessToken = this._accessToken;
    }

    if (this._idToken.token) {
      credentials.idToken = this._idToken;
    }

    return credentials;
  }
}

const complete = () => {
  return new CredentialsBuilder().name('test-name').scope('test-scope').accessToken('test-access-token');
};

module.exports = { complete };
