jest.mock('../../src/url-util');

const LoginRoute = require('../../src/route/login-route');
const HapiServerMother = require('../mother/hapi-server.mother');
const HapiRequestMother = require('../mother/hapi-request.mother');
const KeycloakAdapterConfigMother = require('../mother/keycloak-adapter-config.mother');
const KeycloakConfigMother = require('../mother/keycloak-config.mother');

const UrlUtil = require('../../src/url-util');
UrlUtil.base = jest.fn().mockReturnValue('http://tests.local');
UrlUtil.login = jest.fn().mockReturnValue('http://auth.local/realm');
UrlUtil.loginRedirect = jest.fn().mockReturnValue('http://tests.local/tests/login?auth_callback=1');

const server = HapiServerMother.complete().build();
const adapterConfig = KeycloakAdapterConfigMother.complete().build();
const keycloakConfig = KeycloakConfigMother.complete().build();
const replyStrategy = jest.fn().mockReturnValue({ representation: jest.fn().mockImplementation((i) => i) });
const grantStoreFactory = {
  getSessionGrantStore: jest.fn().mockReturnValue({
    canRetrieveGrantFrom: jest.fn().mockImplementation((request) => !!request.auth.credentials),
    saveGrant: jest.fn().mockImplementation((request, grant) => {
      if (grant === 'fail') throw 'save-grant-mock-failing';
    }),
  }),
};
const grantManager = {
  obtainFromCode: jest.fn().mockImplementation((request, code) => {
    if (code === 'fail') throw 'obtain-from-code-mock-failing';
    if (code === 'wrong-grant') return 'fail';
  }),
};

const h = { redirect: jest.fn() };

describe('Given a LoginRoute', () => {
  beforeEach(() => jest.clearAllMocks());

  it('When create a route then path and method are correct', async () => {
    const request = HapiRequestMother.complete().credentials({ mocked: 'mocked' }).build();
    const route = new LoginRoute(server, adapterConfig, keycloakConfig, grantStoreFactory, grantManager, replyStrategy);

    await route.handler(request, h);

    expect(route.path).toEqual('/tests/login');
    expect(route.method).toEqual('GET');
    expect(UrlUtil.base).toHaveBeenCalledWith(server, request, undefined, undefined);
    expect(h.redirect).toHaveBeenCalledWith('http://tests.local');
  });

  it('When no grant in the session store and no auth callback then redirect to login url', async () => {
    const request = HapiRequestMother.complete().credentials(null).build();
    const route = new LoginRoute(server, adapterConfig, keycloakConfig, grantStoreFactory, grantManager, replyStrategy);

    await route.handler(request, h);

    expect(route.path).toEqual('/tests/login');
    expect(route.method).toEqual('GET');
    expect(UrlUtil.loginRedirect).toHaveBeenCalledWith('http://tests.local', '/tests/login');
    expect(UrlUtil.login).toHaveBeenCalledWith(
      'http://auth.local/test-realm',
      'test-client-id',
      'http://tests.local/tests/login?auth_callback=1'
    );
    expect(h.redirect).toHaveBeenCalledWith('http://auth.local/realm');
  });

  it('When no grant in the session store and it is an auth callback and it is an error then throw', async () => {
    const request = HapiRequestMother.complete()
      .credentials(null)
      .addQueryParam('auth_callback', '1')
      .addQueryParam('error', '401')
      .addQueryParam('error_description', 'unauthenticated')
      .build();
    const route = new LoginRoute(server, adapterConfig, keycloakConfig, grantStoreFactory, grantManager, replyStrategy);

    const res = await route.handler(request, h);

    expect(route.path).toEqual('/tests/login');
    expect(route.method).toEqual('GET');
    expect(UrlUtil.loginRedirect).toHaveBeenCalledWith('http://tests.local', '/tests/login');
    expect(UrlUtil.login).not.toHaveBeenCalled();
    expect(h.redirect).not.toHaveBeenCalled();
    expect(replyStrategy).toHaveBeenCalledWith(h);
    expect(res.isBoom).toBeTruthy();
    expect(res.isServer).toBeFalsy();
    expect(res.output.payload.statusCode).toEqual(403);
    expect(res.output.payload.message).toEqual('Unable to authenticate - 401. unauthenticated');
  });

  it('When no grant in the session store and it is an auth callback and it is an error but not error message then throw', async () => {
    const request = HapiRequestMother.complete()
      .credentials(null)
      .addQueryParam('auth_callback', '1')
      .addQueryParam('error', '401')
      .build();
    const route = new LoginRoute(server, adapterConfig, keycloakConfig, grantStoreFactory, grantManager, replyStrategy);

    const res = await route.handler(request, h);

    expect(route.path).toEqual('/tests/login');
    expect(route.method).toEqual('GET');
    expect(UrlUtil.loginRedirect).toHaveBeenCalledWith('http://tests.local', '/tests/login');
    expect(UrlUtil.login).not.toHaveBeenCalled();
    expect(h.redirect).not.toHaveBeenCalled();
    expect(replyStrategy).toHaveBeenCalledWith(h);
    expect(res.isBoom).toBeTruthy();
    expect(res.isServer).toBeFalsy();
    expect(res.output.payload.statusCode).toEqual(403);
    expect(res.output.payload.message).toEqual('Unable to authenticate - 401. ');
  });

  it('When no grant in the session store and it is an auth callback and a code is present but fails to get the grant then throw', async () => {
    const request = HapiRequestMother.complete()
      .credentials(null)
      .yar({ id: 'test-cookie-id' })
      .addQueryParam('auth_callback', '1')
      .addQueryParam('code', 'fail')
      .build();
    const route = new LoginRoute(server, adapterConfig, keycloakConfig, grantStoreFactory, grantManager, replyStrategy);

    const res = await route.handler(request, h);

    expect(route.path).toEqual('/tests/login');
    expect(route.method).toEqual('GET');
    expect(UrlUtil.loginRedirect).toHaveBeenCalledWith('http://tests.local', '/tests/login');
    expect(UrlUtil.login).not.toHaveBeenCalled();
    expect(h.redirect).not.toHaveBeenCalled();
    expect(replyStrategy).toHaveBeenCalledWith(h);
    expect(grantManager.obtainFromCode).toHaveBeenCalledWith(
      { session: { auth_redirect_uri: 'http://tests.local/tests/login?auth_callback=1' } },
      'fail',
      'test-cookie-id',
      'tests.local'
    );
    expect(res.isBoom).toBeTruthy();
    expect(res.isServer).toBeFalsy();
    expect(res.output.payload.statusCode).toEqual(403);
    expect(res.output.payload.message).toEqual(
      'Unable to authenticate - could not obtain grant code. obtain-from-code-mock-failing'
    );
  });

  it('When no grant in the session store and it is an auth callback and a code is present but fails to save the grant then throw', async () => {
    const request = HapiRequestMother.complete()
      .credentials(null)
      .yar({ id: 'test-cookie-id' })
      .addQueryParam('auth_callback', '1')
      .addQueryParam('code', 'wrong-grant')
      .build();
    const route = new LoginRoute(server, adapterConfig, keycloakConfig, grantStoreFactory, grantManager, replyStrategy);

    const res = await route.handler(request, h);

    expect(route.path).toEqual('/tests/login');
    expect(route.method).toEqual('GET');
    expect(UrlUtil.loginRedirect).toHaveBeenCalledWith('http://tests.local', '/tests/login');
    expect(UrlUtil.login).not.toHaveBeenCalled();
    expect(h.redirect).not.toHaveBeenCalled();
    expect(replyStrategy).toHaveBeenCalledWith(h);
    expect(grantManager.obtainFromCode).toHaveBeenCalledWith(
      { session: { auth_redirect_uri: 'http://tests.local/tests/login?auth_callback=1' } },
      'wrong-grant',
      'test-cookie-id',
      'tests.local'
    );
    expect(res.isBoom).toBeTruthy();
    expect(res.isServer).toBeFalsy();
    expect(res.output.payload.statusCode).toEqual(403);
    expect(res.output.payload.message).toEqual(
      'Unable to authenticate - could not obtain grant code. save-grant-mock-failing'
    );
  });

  it('When no grant in the session store and it is an auth callback and a code is present then redirect', async () => {
    const request = HapiRequestMother.complete()
      .credentials(null)
      .yar({ id: 'test-cookie-id' })
      .addQueryParam('auth_callback', '1')
      .addQueryParam('code', 'test-code')
      .build();
    const route = new LoginRoute(server, adapterConfig, keycloakConfig, grantStoreFactory, grantManager, replyStrategy);

    await route.handler(request, h);

    expect(route.path).toEqual('/tests/login');
    expect(route.method).toEqual('GET');
    expect(UrlUtil.loginRedirect).toHaveBeenCalledWith('http://tests.local', '/tests/login');
    expect(UrlUtil.login).not.toHaveBeenCalled();
    expect(replyStrategy).not.toHaveBeenCalled();
    expect(grantManager.obtainFromCode).toHaveBeenCalledWith(
      { session: { auth_redirect_uri: 'http://tests.local/tests/login?auth_callback=1' } },
      'test-code',
      'test-cookie-id',
      'tests.local'
    );
    expect(h.redirect).toHaveBeenCalledWith('http://tests.local');
  });
});
