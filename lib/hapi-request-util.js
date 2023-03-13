const HEADERS_PROTOCOL_KEY = 'x-forwarded-proto';
const HEADERS_HOST_KEY = 'x-forwarded-host';
const HEADERS_LOCALE_KC_KEY = 'kc_locale';
const HEADERS_LOCALE_UI_KEY = 'ui_locales';
const DEFAULT_PAGE_LIMIT = 10;
const LIMIT_REQUEST_QUERY_KEY = 'limit';
const PAGES_REQUEST_QUERY_KEY = 'page';

const protocol = (request) => request.headers[HEADERS_PROTOCOL_KEY] || request.server.info.protocol;
const host = (request) => request.headers[HEADERS_HOST_KEY] || request.info.host;
const locale = (request) => request.query[HEADERS_LOCALE_KC_KEY] || request.query[HEADERS_LOCALE_UI_KEY];

/**
 * Gets pagination info from the request.
 *
 * @param {Request} request Hapi.js Request object.
 * @param {number} pages.limit Max number of items per page.
 * @param {number} count Total count of items in the collection.
 * @returns
 */
function pagination(request, pages, count) {
  return {
    limit: parseInt(
      request.query[LIMIT_REQUEST_QUERY_KEY] || (pages ? pages.limit : DEFAULT_PAGE_LIMIT) || DEFAULT_PAGE_LIMIT
    ),
    page: parseInt(request.query[PAGES_REQUEST_QUERY_KEY] || 1),
    count,
  };
}

module.exports = {
  protocol,
  host,
  locale,
  pagination,
  HEADERS_PROTOCOL_KEY,
  HEADERS_HOST_KEY,
  HEADERS_LOCALE_KC_KEY,
  HEADERS_LOCALE_UI_KEY,
  DEFAULT_PAGE_LIMIT,
  LIMIT_REQUEST_QUERY_KEY,
  PAGES_REQUEST_QUERY_KEY,
};
