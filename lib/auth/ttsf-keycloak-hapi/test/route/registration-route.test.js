jest.mock('../../src/url-util');

const RegistrationRoute = require('../../src/route/registration-route');
const HapiServerMother = require('../mother/hapi-server.mother');
const HapiRequestMother = require('../mother/hapi-request.mother');
const KeycloakAdapterConfigMother = require('../mother/keycloak-adapter-config.mother');
const KeycloakConfigMother = require('../mother/keycloak-config.mother');

const UrlUtil = require('../../src/url-util');
UrlUtil.base = jest.fn().mockReturnValue('http://tests.local');
UrlUtil.loginRedirect = jest.fn().mockReturnValue('http://tests.local/tests/login');
UrlUtil.registration = jest.fn().mockReturnValue('http://auth.local/register');

const server = HapiServerMother.complete().build();
const adapterConfig = KeycloakAdapterConfigMother.complete().build();
const keycloakConfig = KeycloakConfigMother.complete().build();
const replyStrategy = jest.fn().mockReturnValue({ representation: jest.fn().mockImplementation((i) => i) });
const h = { redirect: jest.fn() };
const grantStoreFactory = {
  getSessionGrantStore: jest.fn().mockReturnValue({
    clearGrant: jest.fn(),
  }),
};

describe('Given a RegistrationRoute', () => {
  beforeEach(() => jest.clearAllMocks());

  it('When create a route then path and method are correct', () => {
    const request = HapiRequestMother.complete().build();
    const route = new RegistrationRoute(server, adapterConfig, keycloakConfig, grantStoreFactory, replyStrategy);

    route.handler(request, h);

    expect(route.path).toEqual('/tests/register');
    expect(route.method).toEqual('GET');
    expect(UrlUtil.base).toHaveBeenCalledWith(server, request, undefined, undefined);
    expect(UrlUtil.loginRedirect).toHaveBeenCalledWith('http://tests.local', '/tests/login');
    expect(UrlUtil.registration).toHaveBeenCalledWith(
      'http://auth.local/test-realm',
      'test-client-id',
      'http://tests.local/tests/login',
      undefined
    );
    expect(h.redirect).toHaveBeenCalledWith('http://auth.local/register');
  });
});
