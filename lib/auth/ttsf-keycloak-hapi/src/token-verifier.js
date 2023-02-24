const { createVerify } = require('crypto');

class ActionTokenVerifier {
  constructor(grantManager) {
    this.grantManager = grantManager;
  }

  error(cause) {
    throw new Error(`Invalid token (${cause})`);
  }

  exist(token) {
    return token || this.error('missing');
  }

  expired(token) {
    return (token.content.exp || token.content.expiration) * 1000 > Date.now() || this.error('expired');
  }

  signed(token) {
    return token.signed || this.error('not signed');
  }

  validAction(token, action) {
    return token.content.action === action || this.error('wrong action');
  }

  validResource(token, resource) {
    return token.content.resource === resource || this.error('wrong resource');
  }

  async validSignature(token, grantManager) {
    const verify = createVerify('RSA-SHA256');

    if (grantManager.publicKey) {
      verify.update(token.signed);

      if (!verify.verify(grantManager.publicKey, token.signature, 'base64')) {
        this.error('signature');
      }
    } else {
      const key = await grantManager.rotation.getJWK(token.header.kid);

      verify.update(token.signed);

      if (!verify.verify(key, token.signature)) {
        this.error('signature');
      }
    }
  }

  async verify(token, { action, resource }) {
    this.exist(token);
    this.expired(token);
    this.signed(token);
    this.validAction(token, action);
    this.validResource(token, resource);

    await this.validSignature(token, this.grantManager);

    return token;
  }
}

module.exports = ActionTokenVerifier;
