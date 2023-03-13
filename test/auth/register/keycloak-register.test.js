jest.mock('@hapi/yar');
jest.mock('../../../lib/auth/ttsf-keycloak-hapi');
jest.mock('../../../lib/hapi-server-util');

const yar = require('@hapi/yar');
const ttsfKeycloakHapi = require('../../../lib/auth/ttsf-keycloak-hapi');
const KeycloakRegister = require('../../../lib/auth/register/keycloak-register');

const HapiServerUtil = require('../../../lib/hapi-server-util');
const HapiServerMother = require('../../mother/hapi-server.mother');

const server = HapiServerMother.complete().build();

describe('Given a KeycloakRegister', () => {
  beforeEach(() => jest.clearAllMocks());

  it('When session is not enabled then does not register', () => {
    const config = {
      session: { enabled: false },
    };
    HapiServerUtil.isRegistered.mockReturnValueOnce(true);
    const register = new KeycloakRegister(server, config);

    register.register();

    expect(server.register).not.toHaveBeenCalled();
  });

  describe('When session is enabled', () => {
    it('And yar is not register then register yar', () => {
      const config = {
        session: { enabled: true, cookie: { name: 'cookie-name' }, password: 'password' },
        tls: true,
      };
      HapiServerUtil.isRegistered.mockReturnValueOnce(false).mockReturnValueOnce(true);
      const register = new KeycloakRegister(server, config);

      register.register();

      expect(server.register).toHaveBeenCalledWith({
        options: {
          cookieOptions: { isSecure: true, password: 'password' },
          maxCookieSize: 0,
          name: 'cookie-name',
          storeBlank: false,
        },
        plugin: yar,
      });
    });

    it('And yar is already registered then does not register', () => {
      const config = {
        session: { enabled: true, cookie: { name: 'cookie-name', password: 'password' } },
      };
      HapiServerUtil.isRegistered.mockReturnValueOnce(true).mockReturnValueOnce(true);
      const register = new KeycloakRegister(server, config);

      register.register();

      expect(server.register).not.toHaveBeenCalled();
    });
  });

  it('When ttsf keycloak hapi is not registered then register', () => {
    const config = {
      session: { enabled: false },
      basePath: 'base/path',
      server: {
        url: 'http://auth.local',
        realm: 'master',
      },
      client: { id: 'test-client-id', secret: 'test-client-secret' },
      tls: true,
    };
    HapiServerUtil.isRegistered.mockReturnValueOnce(false);
    const register = new KeycloakRegister(server, config);

    register.register();

    expect(server.register).toHaveBeenCalledWith({
      options: {
        basePath: 'base/path',
        bearerOnly: true,
        keycloak: {
          client: { id: 'test-client-id', secret: 'test-client-secret' },
          realm: 'master',
          server: 'http://auth.local',
        },
      },
      plugin: ttsfKeycloakHapi,
    });
  });
});
