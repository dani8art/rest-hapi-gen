jest.mock('../../src/url-util');

const TokenRoute = require('../../src/route/token-route');
const HapiServerMother = require('../mother/hapi-server.mother');
const HapiRequestMother = require('../mother/hapi-request.mother');
const HapiCredentialsMother = require('../mother/hapi-credentials.mother');
const KeycloakAdapterConfigMother = require('../mother/keycloak-adapter-config.mother');
const KeycloakConfigMother = require('../mother/keycloak-config.mother');

const UrlUtil = require('../../src/url-util');
UrlUtil.base = jest.fn().mockReturnValue('http://tests.local');
UrlUtil.account = UrlUtil.base;

const server = HapiServerMother.complete().build();
const adapterConfig = KeycloakAdapterConfigMother.complete().build();
const keycloakConfig = KeycloakConfigMother.complete().build();
const replyStrategy = jest.fn().mockReturnValue({ representation: jest.fn().mockImplementation((i) => i) });
const h = jest.fn();

const expected = {
  access_token: {
    value: 'test-access-token-value',
    content: 'test-access-token-content',
  },
  name: 'test-name',
  scope: 'test-scope',
  url: {
    account: 'http://tests.local',
    login: 'http://tests.local/tests/login',
    logout: 'http://tests.local/tests/logout',
  },
};

describe('Given a TokenRoute', () => {
  beforeEach(() => jest.clearAllMocks());

  it('When create a route then path and method are correct', () => {
    const request = HapiRequestMother.complete().build();
    const route = new TokenRoute(server, adapterConfig, keycloakConfig, replyStrategy);

    const res = route.handler(request, h);

    expect(route.path).toEqual('/tests/token');
    expect(route.method).toEqual('GET');
    expect(res.isBoom).toBeTruthy();
    expect(res.isServer).toBeFalsy();
    expect(res.output.payload.statusCode).toEqual(401);
  });

  it('When authenticated without id token then return token resource', () => {
    const request = HapiRequestMother.complete().credentials(HapiCredentialsMother.complete().build()).build();

    const route = new TokenRoute(server, adapterConfig, keycloakConfig, replyStrategy);

    const res = route.handler(request, h);

    expect(route.path).toEqual('/tests/token');
    expect(route.method).toEqual('GET');
    expect(res).toEqual(expected);
  });

  it('When authenticated with id token then return token resource', () => {
    const request = HapiRequestMother.complete()
      .credentials(HapiCredentialsMother.complete().idToken('test-id-token').build())
      .build();
    const expectedWithIdToken = Object.assign({}, expected, {
      id_token: {
        value: 'test-id-token-value',
        content: 'test-id-token-content',
      },
    });

    const route = new TokenRoute(server, adapterConfig, keycloakConfig, replyStrategy);

    const res = route.handler(request, h);

    expect(route.path).toEqual('/tests/token');
    expect(route.method).toEqual('GET');
    expect(res).toEqual(expectedWithIdToken);
  });

  it('When authenticated and bearer only then return token resource without urls', () => {
    const request = HapiRequestMother.complete().credentials(HapiCredentialsMother.complete().build()).build();
    const expectedWithoutUrls = Object.assign({}, expected);
    delete expectedWithoutUrls.url;

    const route = new TokenRoute(
      server,
      KeycloakAdapterConfigMother.complete().bearerOnly(true).build(),
      keycloakConfig,
      replyStrategy
    );

    const res = route.handler(request, h);

    expect(route.path).toEqual('/tests/token');
    expect(route.method).toEqual('GET');
    expect(res).toEqual(expectedWithoutUrls);
  });

  it('When authenticated and token mapper then return token resource mapped', () => {
    const request = HapiRequestMother.complete().credentials(HapiCredentialsMother.complete().build()).build();

    const route = new TokenRoute(
      server,
      KeycloakAdapterConfigMother.complete()
        .tokenMapper((r) => r.access_token)
        .build(),
      keycloakConfig,
      replyStrategy
    );

    const res = route.handler(request, h);

    expect(route.path).toEqual('/tests/token');
    expect(route.method).toEqual('GET');
    expect(res).toEqual({
      value: 'test-access-token-value',
      content: 'test-access-token-content',
    });
  });
});
