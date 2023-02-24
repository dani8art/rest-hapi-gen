const HEADERS_PROTOCOL_KEY = 'x-forwarded-proto';
const HEADERS_HOST_KEY = 'x-forwarded-host';
const HEADERS_LOCALE_KC_KEY = 'kc_locale';
const HEADERS_LOCALE_UI_KEY = 'ui_locales';

const protocol = (request) => request.headers[HEADERS_PROTOCOL_KEY] || request.server.info.protocol;
const host = (request) => request.headers[HEADERS_HOST_KEY] || request.info.host;
const locale = (request) => request.query[HEADERS_LOCALE_KC_KEY] || request.query[HEADERS_LOCALE_UI_KEY];

module.exports = {
  protocol,
  host,
  locale,
  HEADERS_PROTOCOL_KEY,
  HEADERS_HOST_KEY,
  HEADERS_LOCALE_KC_KEY,
  HEADERS_LOCALE_UI_KEY,
};
