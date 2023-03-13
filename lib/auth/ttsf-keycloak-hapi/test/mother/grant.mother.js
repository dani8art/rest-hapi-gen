const Grant = require('keycloak-connect/middleware/auth-utils/grant');
const Token = require('keycloak-connect/middleware/auth-utils/token');

class GrantMother {
  accessToken(accessToken) {
    this._accessToken = accessToken;
    return this;
  }

  refreshToken(refreshToken) {
    this._refreshToken = refreshToken;
    return this;
  }

  idToken(idToken) {
    this._idToken = idToken;
    return this;
  }

  expiresIn(expiresIn) {
    this._expiresIn = expiresIn;
    return this;
  }

  tokenType(tokenType) {
    this._tokenType = tokenType;
    return this;
  }

  idTokenName(nameKey) {
    this._idTokenNameKey = nameKey;
    return this;
  }

  accessTokenName(nameKey) {
    this._accessTokenNameKey = nameKey;
    return this;
  }

  accessTokenSub(sub) {
    this._accessTokenSub = sub;
    return this;
  }

  build() {
    const grant = new Grant({
      access_token: new Token(this._accessToken, 'test-client-id'),
      refresh_token: new Token(this._refreshToken, 'test-client-id'),
      id_token: new Token(this._idToken, 'test-client-id'),
      expires_in: this._expiresIn,
      token_type: this._tokenType,
      __raw: {
        access_token: this._accessToken,
        refresh_token: this._refreshToken,
        id_token: this._idToken,
        expires_in: this._expiresIn,
        token_type: this._tokenType,
      },
    });

    if (this._idTokenNameKey) {
      grant.id_token.content[this._idTokenNameKey] = 'test-id-name';
    }

    if (this._accessTokenNameKey) {
      grant.access_token.content[this._accessTokenNameKey] = 'test-access-name';
    }

    if (!this._accessToken) {
      delete grant.access_token;
    } else {
      if (this._accessTokenSub) {
        grant.access_token.content.sub = 'sub';
      }
    }

    if (!this._refreshToken) {
      delete grant.refresh_token;
    }

    if (!this._idToken) {
      delete grant.id_token;
    }

    return grant;
  }
}

const complete = () => {
  return new GrantMother()
    .accessToken('test-access-token')
    .refreshToken('test-refresh-token')
    .idToken('test-id-token')
    .expiresIn(102934832)
    .tokenType('jwt');
};

module.exports = { complete };
