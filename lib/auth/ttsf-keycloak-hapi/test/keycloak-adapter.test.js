jest.mock('keycloak-connect/middleware/auth-utils/grant-manager', () => {
  return jest.fn(() => {
    return {
      isGrantRefreshable: (grant) => grant.includes('refreshable'),
      ensureFreshness: async (grant) => {
        if (grant.includes('fail')) {
          throw 'refreshness';
        } else if (grant.includes('refreshed-invalid')) {
          return 'grant-refreshed-fail';
        } else if (grant.includes('refreshed')) {
          return 'grant-refreshed';
        } else {
          return grant;
        }
      },
      validateGrant: async (grant) => {
        if (grant.includes('fail') || grant.includes('invalid')) {
          throw 'validation';
        } else {
          return grant;
        }
      },
    };
  });
});
jest.mock('keycloak-connect/middleware/auth-utils/config');
jest.mock('../src/token-verifier');
jest.mock('../src/mapper/credentials-mapper');
jest.mock('../src/factory/grant-store-factory', () => {
  return jest.fn(() => {
    return {
      get: jest.fn(() => {
        return { getGrant: jest.fn((r) => r.yar.id), clearGrant: jest.fn(), saveGrant: jest.fn() };
      }),
    };
  });
});
jest.mock('../src/hapi-request-util');
jest.mock('../src/keycloak-adapter-config');
jest.mock('../src/mapper/keycloak-config-mapper');
jest.mock('../src/factory/route-factory', () => {
  return jest.fn(() => {
    return {
      getReplyStrategy: jest.fn().mockReturnValue((h) => {
        return { authenticated: (creds) => creds, representation: (error) => error };
      }),
      getLoginRoute: () => 'getLoginRoute',
      getLogoutRoute: () => 'getLogoutRoute',
      getRegistrationRoute: () => 'getRegistrationRoute',
      getTokenRoute: () => 'getTokenRoute',
    };
  });
});
jest.mock('../src/url-util');
jest.mock('../src/logger-util');

const Boom = require('@hapi/boom');
const GrantManager = require('keycloak-connect/middleware/auth-utils/grant-manager');
const KeycloakConfig = require('keycloak-connect/middleware/auth-utils/config');

const ActionTokenVerifier = require('../src/token-verifier');
const CredentialsMapper = require('../src/mapper/credentials-mapper');
const GrantStoreFactory = require('../src/factory/grant-store-factory');
const HapiRequestUtil = require('../src/hapi-request-util');
const KeycloakApdapterConfig = require('../src/keycloak-adapter-config');
const KeycloakConfigMapper = require('../src/mapper/keycloak-config-mapper');
const RouteFactory = require('../src/factory/route-factory');
const UrlUtil = require('../src/url-util');
const LoggerUtil = require('../src/logger-util');

const KeycloakAdapter = require('../src/keycloak-adapter');

const HapiServerMother = require('./mother/hapi-server.mother');
const HapiRequestMother = require('./mother/hapi-request.mother');

const server = HapiServerMother.complete().build();
const config = { config: 'test-config' };
const finalConfig = {
  bearerOnly: false,
  keycloak: { client: { id: 'test-client-id' } },
  token: { nameKey: 'name' },
  onUnauthenticated: jest.fn((request) => request.query && request.query.r),
  paths: { login: 'login', api: {} },
};
const mappedConfig = { mapped: 'mapped-config' };
KeycloakApdapterConfig.get = jest.fn().mockImplementation((config) => {
  return config.config === 'test-config' ? finalConfig : config;
});
KeycloakConfigMapper.toKeycloakConfig = jest.fn().mockReturnValue(mappedConfig);
CredentialsMapper.fromGrant = jest.fn().mockImplementation((grant) => {
  return { credentials: grant };
});
UrlUtil.base = jest.fn().mockReturnValue('https://test.local');
UrlUtil.loginRedirect = jest.fn().mockReturnValue('https://test.local/login');
UrlUtil.login = jest.fn().mockReturnValue('https://auth.local/realm?redirectUrl=https://test.local/login');

describe('Given a KetcloakAdapter', () => {
  beforeEach(() => jest.clearAllMocks());

  it('When new keycloak adapter then assign object properly', () => {
    const adapter = new KeycloakAdapter(server, config);

    expect(adapter.server).toEqual(server);
    expect(LoggerUtil.initialize).toHaveBeenCalledWith(server);
    expect(KeycloakApdapterConfig.get).toHaveBeenCalledWith(config);
    expect(KeycloakConfigMapper.toKeycloakConfig).toHaveBeenCalledWith(finalConfig);
    expect(KeycloakConfig).toHaveBeenCalledWith(mappedConfig);
    expect(GrantManager).toHaveBeenCalledWith(expect.any(KeycloakConfig));
    expect(ActionTokenVerifier).toHaveBeenCalledWith(expect.anything());
    expect(GrantStoreFactory).toHaveBeenCalledWith({ bearerOnly: false, clientId: 'test-client-id' });
    expect(RouteFactory).toHaveBeenCalledWith(expect.any(KeycloakAdapter));
  });

  describe('When authenticate', () => {
    it('And grant store has no grant then return null', async () => {
      const request = HapiRequestMother.complete().yar({}).build();
      const adapter = new KeycloakAdapter(server, config);

      const credentials = await adapter.authenticate(request, () => {});

      expect(credentials).toBeNull();
    });

    it('And grant store has grant and it is refreshable and try refresh fail then clean and return null', async () => {
      const request = HapiRequestMother.complete().yar({ id: 'refreshable-fail-refresh' }).build();
      const adapter = new KeycloakAdapter(server, config);

      const credentials = await adapter.authenticate(request, () => {});

      expect(LoggerUtil.debug).toHaveBeenCalledWith(
        'Authorization has failed - Received grant is invalid: refreshness'
      );
      expect(credentials).toBeNull();
    });

    it('And grant store has grant and it is refreshable and try refresh and it is refreshed then save new grant and return', async () => {
      const request = HapiRequestMother.complete().yar({ id: 'refreshable-refreshed' }).build();
      const adapter = new KeycloakAdapter(server, config);

      const credentials = await adapter.authenticate(request, () => {});

      expect(LoggerUtil.debug).toHaveBeenCalledWith('Access token has been refreshed: grant-refreshed');
      expect(credentials).toEqual({ credentials: 'grant-refreshed' });
    });

    it('And grant store has grant and it is refreshable and try refresh and it is refreshed and validation fail then clean and return null', async () => {
      const request = HapiRequestMother.complete().yar({ id: 'refreshable-refreshed-invalid' }).build();
      const adapter = new KeycloakAdapter(server, config);

      const credentials = await adapter.authenticate(request, () => {});

      expect(LoggerUtil.debug).toHaveBeenCalledWith('Authorization has failed - Received grant is invalid: validation');
      expect(credentials).toBeNull();
    });

    it('And grant store has grant and it is refreshable and try refresh and it is not refreshed and validation fail then clean and return null', async () => {
      const request = HapiRequestMother.complete().yar({ id: 'refreshable-invalid' }).build();
      const adapter = new KeycloakAdapter(server, config);

      const credentials = await adapter.authenticate(request, () => {});

      expect(LoggerUtil.debug).toHaveBeenCalledWith('Authorization has failed - Received grant is invalid: validation');
      expect(credentials).toBeNull();
    });

    it('And grant store has grant and it is not refreshable and validation fail then clean and return null', async () => {
      const request = HapiRequestMother.complete().yar({ id: 'invalid' }).build();
      const adapter = new KeycloakAdapter(server, config);

      const credentials = await adapter.authenticate(request, () => {});

      expect(LoggerUtil.debug).toHaveBeenCalledWith('Authorization has failed - Received grant is invalid: validation');
      expect(credentials).toBeNull();
    });

    it('And grant store has grant and it is not refreshable then return', async () => {
      const request = HapiRequestMother.complete().yar({ id: 'valid' }).build();
      const adapter = new KeycloakAdapter(server, config);

      const credentials = await adapter.authenticate(request, () => {});

      expect(LoggerUtil.debug).not.toHaveBeenCalled();
      expect(credentials).toEqual({ credentials: 'valid' });
    });
  });

  describe('When getting auth scheme', () => {
    const h = {
      response: jest.fn().mockReturnValue({ takeover: jest.fn().mockReturnValue({ redirect: jest.fn((url) => url) }) }),
    };

    it('And request has credentials then authenticated', async () => {
      const request = HapiRequestMother.complete().yar({ id: 'valid' }).build();
      const adapter = new KeycloakAdapter(server, config);
      const scheme = adapter.getAuthScheme()();

      const res = await scheme.authenticate(request, h);

      expect(res).toEqual({ credentials: { credentials: 'valid' } });
    });

    it('And request has not credentials and should redirect then redirect', async () => {
      const request = HapiRequestMother.complete().yar({}).addQueryParam('r', true).build();
      const adapter = new KeycloakAdapter(server, config);
      const scheme = adapter.getAuthScheme()();

      const res = await scheme.authenticate(request, h);

      expect(res).toEqual('https://auth.local/realm?redirectUrl=https://test.local/login');
    });

    it('And request has not credentials and should redirect with locale then redirect', async () => {
      const request = HapiRequestMother.complete().yar({}).addQueryParam('r', true).build();
      const adapter = new KeycloakAdapter(server, config);
      const scheme = adapter.getAuthScheme()();
      HapiRequestUtil.locale.mockReturnValueOnce('es');

      const res = await scheme.authenticate(request, h);

      expect(res).toEqual('https://auth.local/realm?redirectUrl=https%3A%2F%2Ftest.local%2Flogin&kc_locale=es');
    });

    it('And request has not credentials and should not redirect then unathenticated error', async () => {
      const request = HapiRequestMother.complete().yar({}).addQueryParam('r', false).build();
      const adapter = new KeycloakAdapter(server, config);
      const scheme = adapter.getAuthScheme()();

      const res = await scheme.authenticate(request, h);

      expect(res.isBoom).toBeTruthy();
      expect(res.isServer).toBeFalsy();
      expect(res.output.statusCode).toEqual(401);
      expect(res.output.payload.message).toEqual('The resource owner is not authenticated');
    });
  });

  describe('When register keycloak adapter', () => {
    describe('And it is bearer only', () => {
      it('And token route is enable then register', () => {
        const expectedConfig = Object.assign({}, finalConfig);
        expectedConfig.bearerOnly = true;
        expectedConfig.paths = Object.assign({}, finalConfig.paths);
        expectedConfig.paths.api.token = 'token';
        const adapter = new KeycloakAdapter(server, expectedConfig);

        adapter.register();

        expect(server.auth.scheme).toHaveBeenCalledWith('keycloak', expect.anything());
        expect(server.route).toHaveBeenCalledWith('getTokenRoute');
        expect(server.route).not.toHaveBeenCalledWith('getLoginRoute');
      });

      it('And token route is not enable then register nothing', () => {
        const expectedConfig = Object.assign({}, finalConfig);
        expectedConfig.bearerOnly = true;
        expectedConfig.paths = Object.assign({}, finalConfig.paths);
        expectedConfig.paths.api.token = undefined;
        const adapter = new KeycloakAdapter(server, expectedConfig);

        adapter.register();

        expect(server.auth.scheme).toHaveBeenCalledWith('keycloak', expect.anything());
        expect(server.route).not.toHaveBeenCalled();
      });
    });

    describe('And it is not bearer only', () => {
      it('And login enable then register', () => {
        const expectedConfig = Object.assign({}, finalConfig);
        expectedConfig.bearerOnly = false;
        expectedConfig.paths = Object.assign({}, finalConfig.paths);
        expectedConfig.paths.login = undefined;
        const adapter = new KeycloakAdapter(server, expectedConfig);

        adapter.register();

        expect(server.auth.scheme).toHaveBeenCalledWith('keycloak', expect.anything());
        expect(server.route).not.toHaveBeenCalledWith('getLoginRoute');
        expect(server.route).not.toHaveBeenCalledWith('getLogoutRoute');
        expect(server.route).not.toHaveBeenCalledWith('getRegisterRoute');
      });

      it('And login enable then register', () => {
        const expectedConfig = Object.assign({}, finalConfig);
        expectedConfig.bearerOnly = false;
        expectedConfig.paths = Object.assign({}, finalConfig.paths);
        expectedConfig.paths.login = 'login';
        const adapter = new KeycloakAdapter(server, expectedConfig);

        adapter.register();

        expect(server.auth.scheme).toHaveBeenCalledWith('keycloak', expect.anything());
        expect(server.route).toHaveBeenCalledWith('getLoginRoute');
        expect(server.route).not.toHaveBeenCalledWith('getLogoutRoute');
        expect(server.route).not.toHaveBeenCalledWith('getRegisterRoute');
      });

      it('And logout enable then register', () => {
        const expectedConfig = Object.assign({}, finalConfig);
        expectedConfig.bearerOnly = false;
        expectedConfig.paths = Object.assign({}, finalConfig.paths);
        expectedConfig.paths.login = 'login';
        expectedConfig.paths.logout = 'logout';
        const adapter = new KeycloakAdapter(server, expectedConfig);

        adapter.register();

        expect(server.auth.scheme).toHaveBeenCalledWith('keycloak', expect.anything());
        expect(server.route).toHaveBeenCalledWith('getLoginRoute');
        expect(server.route).toHaveBeenCalledWith('getLogoutRoute');
        expect(server.route).not.toHaveBeenCalledWith('getRegisterRoute');
      });

      it('And register enable then register', () => {
        const expectedConfig = Object.assign({}, finalConfig);
        expectedConfig.bearerOnly = false;
        expectedConfig.paths = Object.assign({}, finalConfig.paths);
        expectedConfig.paths.login = 'login';
        expectedConfig.paths.logout = 'logout';
        expectedConfig.paths.register = 'register';
        const adapter = new KeycloakAdapter(server, expectedConfig);

        adapter.register();

        expect(server.auth.scheme).toHaveBeenCalledWith('keycloak', expect.anything());
        expect(server.route).toHaveBeenCalledWith('getLoginRoute');
        expect(server.route).toHaveBeenCalledWith('getLogoutRoute');
        expect(server.route).toHaveBeenCalledWith('getRegistrationRoute');
      });
    });
  });
});
