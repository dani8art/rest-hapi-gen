class TokenBuilder {
  constructor() {
    this._content = {};
    this._header = {};
  }

  exp(exp) {
    this._content.exp = exp;
    return this;
  }

  expiration(expiration) {
    this._content.expiration = expiration;
    return this;
  }

  signed(signed) {
    this._signed = signed;
    return this;
  }

  signature(signature) {
    this._signature = signature;
    return this;
  }

  action(action) {
    this._content.action = action;
    return this;
  }

  resource(resource) {
    this._content.resource = resource;
    return this;
  }

  kid(kid) {
    this._header.kid = kid;
    return this;
  }

  build() {
    return { content: this._content, header: this._header, signed: this._signed, signature: this._signature };
  }
}

const complete = () => {
  return new TokenBuilder()
    .action('test-action')
    .resource('test-resource')
    .exp(nowPlusMinutes(5))
    .kid('test-kid')
    .signed(true)
    .signature('test-signature');
};

const nowPlusMinutes = (m) => Math.round(new Date(new Date().getTime() + m * 60000).getTime() / 1000);
const nowSubMinutes = (m) => Math.round(new Date(new Date().getTime() - m * 60000).getTime() / 1000);

module.exports = { complete, nowPlusMinutes, nowSubMinutes };
