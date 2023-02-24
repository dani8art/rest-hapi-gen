jest.mock('../../lib/auth/register/keycloak-register');
jest.mock('../../lib/auth/register/noop-register');

const NoopRegister = require('../../lib/auth/register/noop-register');
const KeycloakRegister = require('../../lib/auth/register/keycloak-register');
const AuthRegisterFactory = require('../../lib/auth/auth-register-factory');

const HapiServerMother = require('../mother/hapi-server.mother');

const server = HapiServerMother.complete().build();

describe('Given an AuthRegisterFactory', () => {
  beforeEach(() => jest.clearAllMocks());

  it('When auth is not enabled then returns NoopRegister', () => {
    const register = AuthRegisterFactory.get(server, { enabled: false });

    expect(register).toBeInstanceOf(NoopRegister);
  });

  describe('When auth is enabled', () => {
    it('And kind is keycloak then returns KeycloakRegister', () => {
      const config = { enabled: true, kind: 'keycloak', session: { password: 'password' } };
      const register = AuthRegisterFactory.get(server, config);

      expect(register).toBeInstanceOf(KeycloakRegister);
      expect(KeycloakRegister).toHaveBeenCalledWith(server, {
        ...config,
        server: {
          realm: 'master',
        },
        session: { cookie: { name: 'rest-hapi-gen-session' }, enabled: true, password: 'password' },
      });
    });

    it('And kind is keycloak then returns KeycloakRegister', () => {
      const register = AuthRegisterFactory.get(server, { enabled: true, kind: 'noexist' });

      expect(register).toBeInstanceOf(NoopRegister);
    });
  });
});
