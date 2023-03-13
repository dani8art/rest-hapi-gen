jest.mock('../../src/route/token-route');
jest.mock('../../src/route/login-route');
jest.mock('../../src/route/registration-route');
jest.mock('../../src/route/logout-route');
const RouteFactory = require('../../src/factory/route-factory');
const TokenRoute = require('../../src/route/token-route');
const LoginRoute = require('../../src/route/login-route');
const LogoutRoute = require('../../src/route/logout-route');
const RegistrationRoute = require('../../src/route/registration-route');

const HapiServerMother = require('../mother/hapi-server.mother');

const config = { mocked: 'adapterConfig' };
const keycloakConfig = { mocked: 'keycloakConfig' };
const grantStoreFactory = { mocked: 'grantStoreFactory' };
const grantManager = { mocked: 'grantManager' };

const adapter = { config, keycloakConfig, grantStoreFactory, grantManager };

const reply = jest.fn().mockReturnValue('reply-called');
reply.authenticated = jest.fn().mockReturnValue('authenticated');
reply.continue = jest.fn().mockReturnValue('continue');

describe('Given a RouteFactory', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('When request a reply strategy', () => {
    it('And server is version lower than 17 then return properly', () => {
      const server = HapiServerMother.complete().version(16).build();
      adapter.server = server;
      const routeFactory = new RouteFactory(adapter);
      const options = { mocked: 'options' };
      const obj = { mocked: 'obj' };

      const actual = routeFactory.getReplyStrategy()(reply);
      const authenticated = actual.authenticated(options);
      const representation = actual.representation(obj);

      expect(authenticated).toEqual('continue');
      expect(representation).toEqual('reply-called');
    });

    it('And server is version greather or equal than 17 then return properly', () => {
      const server = HapiServerMother.complete().build();
      adapter.server = server;
      const routeFactory = new RouteFactory(adapter);
      const options = { mocked: 'options' };
      const obj = { mocked: 'obj' };

      const actual = routeFactory.getReplyStrategy()(reply);
      const authenticated = actual.authenticated(options);
      const representation = actual.representation(obj);

      expect(authenticated).toEqual('authenticated');
      expect(representation).toEqual(obj);
    });
  });

  const server = HapiServerMother.complete().build();
  adapter.server = server;
  const routeFactory = new RouteFactory(adapter);
  jest.spyOn(routeFactory, 'getReplyStrategy');

  it('When request a TokenRoute then return properly', () => {
    routeFactory.getTokenRoute();

    expect(TokenRoute).toHaveBeenCalledWith(server, config, keycloakConfig, expect.anything());
    expect(routeFactory.getReplyStrategy).toHaveBeenCalled();
  });

  it('When request a LoginRoute then return properly', () => {
    routeFactory.getLoginRoute();

    expect(LoginRoute).toHaveBeenCalledWith(
      server,
      config,
      keycloakConfig,
      grantStoreFactory,
      grantManager,
      expect.anything()
    );
    expect(routeFactory.getReplyStrategy).toHaveBeenCalled();
  });

  it('When request a RegistrationRoute then return properly', () => {
    routeFactory.getRegistrationRoute();

    expect(RegistrationRoute).toHaveBeenCalledWith(
      server,
      config,
      keycloakConfig,
      grantStoreFactory,
      expect.anything()
    );
    expect(routeFactory.getReplyStrategy).toHaveBeenCalled();
  });

  it('When request a LogoutRoute then return properly', () => {
    routeFactory.getLogoutRoute();

    expect(LogoutRoute).toHaveBeenCalledWith(server, config, keycloakConfig, grantStoreFactory, expect.anything());
    expect(routeFactory.getReplyStrategy).toHaveBeenCalled();
  });
});
