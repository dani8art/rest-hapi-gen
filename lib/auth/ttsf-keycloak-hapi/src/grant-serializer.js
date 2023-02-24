const Grant = require('keycloak-connect/middleware/auth-utils/grant');
const Token = require('keycloak-connect/middleware/auth-utils/token');

class GrantSerializer {
  constructor(clientId) {
    this.clientId = clientId;
  }

  serialize(grant) {
    if (!grant) {
      return null;
    }

    return {
      access_token: grant.access_token ? grant.access_token.token : undefined,
      refresh_token: grant.refresh_token ? grant.refresh_token.token : undefined,
      id_token: grant.id_token ? grant.id_token.token : undefined,
      expires_in: grant.expires_in,
      token_type: grant.token_type,
    };
  }

  deserialize(grantData) {
    if (!grantData) {
      return null;
    }

    return new Grant({
      access_token: grantData.access_token ? new Token(grantData.access_token, this.clientId) : undefined,
      refresh_token: grantData.refresh_token ? new Token(grantData.refresh_token, this.clientId) : undefined,
      id_token: grantData.id_token ? new Token(grantData.id_token, this.clientId) : undefined,
      expires_in: grantData.expires_in,
      token_type: grantData.token_type,
      __raw: grantData,
    });
  }
}

module.exports = GrantSerializer;
