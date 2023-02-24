const { join } = require('path');
const { v4: uuidv4 } = require('uuid');

const HapiRequestUtil = require('./hapi-request-util');

const base = (server, request, baseUrl, basePath) => {
  const base = baseUrl
    ? new URL(baseUrl)
    : new URL(`${HapiRequestUtil.protocol(request)}://${HapiRequestUtil.host(request)}`);

  base.pathname = join(base.pathname, basePath || server.realm.modifiers.route.prefix || '');

  return base.toString();
};

const login = (realm, clientId, redirect, uuid = null) => {
  const url = new URL(realm);
  url.pathname = join(url.pathname, '/protocol/openid-connect/auth');

  const query = new URLSearchParams();
  query.append('client_id', clientId);
  query.append('state', uuid || uuidv4());
  query.append('redirect_uri', redirect);
  query.append('scope', 'openid');
  query.append('response_type', 'code');

  url.search = query.toString();
  return url.toString();
};

const loginRedirect = (base, path = '') => {
  const url = new URL(base);
  url.pathname = join(url.pathname, path);

  url.search = 'auth_callback=1';

  return url.toString();
};

const logout = (realm, clientId, redirect, idToken) => {
  const url = new URL(realm);
  url.pathname = join(url.pathname, '/protocol/openid-connect/logout');

  const query = new URLSearchParams();
  if (redirect) {
    query.append('post_logout_redirect_uri', redirect);
  }

  if (idToken) {
    query.append('id_token_hint', idToken);
  } else {
    query.append('client_id', clientId);
  }

  url.search = query.toString();

  return url.toString();
};

const registration = (realm, clientId, redirect, locale) => {
  const url = new URL(realm);
  url.pathname = join(url.pathname, '/protocol/openid-connect/registrations');

  const query = new URLSearchParams();
  query.append('client_id', clientId);
  query.append('redirect_uri', redirect);
  query.append('scope', 'openid');
  query.append('response_type', 'code');

  if (locale) {
    query.append('kc_locale', locale);
  }

  url.search = query.toString();

  return url.toString();
};

/**
 * DEPRECATED
 */
const password = (realm, clientId) => {
  const url = new URL(realm);
  url.pathname = join(url.pathname, '/account/password');
  url.search = `referrer=${clientId}`;

  return url.toString();
};

const account = (realm) => {
  const url = new URL(realm);
  url.pathname = join(url.pathname, '/account');

  return url.toString();
};

module.exports = { login, loginRedirect, logout, registration, password, account, base };
