const {
  HEADERS_PROTOCOL_KEY,
  HEADERS_HOST_KEY,
  HEADERS_LOCALE_KC_KEY,
  HEADERS_LOCALE_UI_KEY,
} = require('../../lib/hapi-request-util');

class HapiRequestBuilder {
  constructor() {
    this._headers = {};
    this._query = {};
    this._auth = {};
  }

  protocol(protocol) {
    this._protocol = protocol;
    return this;
  }

  host(host) {
    this._host = host;
    return this;
  }

  headerProtocol(protocol) {
    this._headers[HEADERS_PROTOCOL_KEY] = protocol;
    return this;
  }

  headerHost(host) {
    this._headers[HEADERS_HOST_KEY] = host;
    return this;
  }

  locale(locale, keycloak = true) {
    if (keycloak) {
      this._query[HEADERS_LOCALE_KC_KEY] = locale;
    } else {
      this._query[HEADERS_LOCALE_UI_KEY] = locale;
    }

    return this;
  }

  yar(yar) {
    this._yar = yar;
    return this;
  }

  addHeader(key, value) {
    this._headers = { ...this._headers, [key]: value };
    return this;
  }

  addQueryParam(param, value) {
    this._query = { ...this._query, [param]: value };
    return this;
  }

  credentials(credentials) {
    this._auth.credentials = credentials;
    return this;
  }

  build() {
    const server = { info: { protocol: this._protocol } };
    return {
      headers: this._headers,
      server,
      info: { host: this._host },
      query: this._query,
      yar: this._yar,
      auth: this._auth,
      raw: { req: { url: `http://${this._host}` } },
    };
  }
}

const complete = () => {
  return new HapiRequestBuilder().protocol('http').host('tests.local');
};

const completeOnHeaders = () => {
  return new HapiRequestBuilder().headerProtocol('http').headerHost('tests.local');
};

module.exports = { complete, completeOnHeaders };
