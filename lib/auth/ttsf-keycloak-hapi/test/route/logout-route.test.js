jest.mock('../../src/url-util');

const LogoutRoute = require('../../src/route/logout-route');
const HapiServerMother = require('../mother/hapi-server.mother');
const HapiRequestMother = require('../mother/hapi-request.mother');
const KeycloakAdapterConfigMother = require('../mother/keycloak-adapter-config.mother');
const KeycloakConfigMother = require('../mother/keycloak-config.mother');

const UrlUtil = require('../../src/url-util');
UrlUtil.base = jest.fn().mockReturnValue('http://tests.local');
UrlUtil.logout = jest.fn().mockReturnValue('http://auth.local/realm');

const server = HapiServerMother.complete().build();
const adapterConfig = KeycloakAdapterConfigMother.complete().build();
const keycloakConfig = KeycloakConfigMother.complete().build();
const replyStrategy = jest.fn().mockReturnValue({ representation: jest.fn().mockImplementation((i) => i) });
const grantStoreFactory = {
  getSessionGrantStore: jest.fn().mockReturnValue({
    getGrant: jest.fn().mockImplementation((request) => {
      if (request.yar.id === 'fail') throw 'get-grant-mock-failing';

      return request.yar.grant;
    }),
    clearGrant: jest.fn(),
  }),
};

const h = { redirect: jest.fn() };

describe('Given a LogoutRoute', () => {
  beforeEach(() => jest.clearAllMocks());

  it('When create a route then path and method are correct', async () => {
    const request = HapiRequestMother.complete().yar({ grant: {} }).build();
    const route = new LogoutRoute(server, adapterConfig, keycloakConfig, grantStoreFactory, replyStrategy);

    await route.handler(request, h);

    expect(route.path).toEqual('/tests/logout');
    expect(route.method).toEqual('GET');
    expect(UrlUtil.base).toHaveBeenCalledWith(server, request, undefined, undefined);
    expect(UrlUtil.logout).toHaveBeenCalledWith(
      'http://auth.local/test-realm',
      'test-client-id',
      'http://tests.local',
      undefined
    );
    expect(h.redirect).toHaveBeenCalledWith('http://auth.local/realm');
  });

  it('When create route and id_token and locale then redirect', async () => {
    const request = HapiRequestMother.complete()
      .locale('es')
      .yar({ grant: { id_token: { token: 'test-id-token' } } })
      .build();
    const route = new LogoutRoute(server, adapterConfig, keycloakConfig, grantStoreFactory, replyStrategy);

    await route.handler(request, h);

    expect(route.path).toEqual('/tests/logout');
    expect(route.method).toEqual('GET');
    expect(UrlUtil.base).toHaveBeenCalledWith(server, request, undefined, undefined);
    expect(UrlUtil.logout).toHaveBeenCalledWith(
      'http://auth.local/test-realm',
      'test-client-id',
      'http://tests.local',
      'test-id-token'
    );
    expect(h.redirect).toHaveBeenCalledWith('http://auth.local/realm?kc_locale=es');
  });
});
