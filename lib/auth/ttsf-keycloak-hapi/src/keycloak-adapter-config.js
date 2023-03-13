const { join } = require('path');
const Hoek = require('@hapi/hoek');

const defaultTokenMapper = (token) => token;

const defaultOnUnauthenticated =
  (bearerOnly = false) =>
  (request) => {
    return !(
      bearerOnly ||
      request.auth.mode !== 'required' ||
      request.raw.req.url.startsWith('/api/') ||
      request.headers['x-requested-with'] === 'XMLHttpRequest'
    );
  };

const get = (config) => {
  const defaults = {
    baseUrl: undefined,
    bearerOnly: false,
    cors: ['*'],
    keycloak: {
      client: {
        id: undefined,
        secret: undefined,
      },
      minTimeBetweenJwksRequests: undefined,
      realm: undefined,
      server: undefined,
      verifyTokenAudience: undefined,
    },
    onUnauthenticated: defaultOnUnauthenticated(config),
    paths: {
      api: {
        token: '/auth/token',
      },
      base: undefined,
      login: '/auth/login',
      logout: '/auth/logout',
      register: '/auth/register',
    },
    token: {
      mapper: defaultTokenMapper,
      nameKey: 'name',
    },
  };

  return Hoek.applyToDefaults(defaults, config, { nullOverride: true });
};

const getRoutePath = (basePath, path) => {
  return basePath ? join(basePath, path) : path;
};

module.exports = { get, getRoutePath, defaultTokenMapper, defaultOnUnauthenticated };
