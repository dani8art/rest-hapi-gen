jest.mock('uuid', () => {
  return { v4: jest.fn().mockReturnValue('mocked-uuid') };
});

const { v4: uuidv4 } = require('uuid');

const HapiRequestMother = require('./mother/hapi-request.mother');
const HapiServerMother = require('./mother/hapi-server.mother');

const UrlUtil = require('../src/url-util');
const request = HapiRequestMother.complete().build();
const realm = 'http://auth.local';
const clientId = 'test-client-id';

describe('Given an UrlUtil', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('When request a base url', () => {
    it('And no base path no base url then return', () => {
      const server = HapiServerMother.complete().build();

      const actual = UrlUtil.base(server, request, null, null);

      expect(actual).toEqual('http://tests.local/');
    });

    it('And base url but no base path is given then return', () => {
      const server = HapiServerMother.complete().build();

      const actual = UrlUtil.base(server, request, 'http://tests-diff.local', null);

      expect(actual).toEqual('http://tests-diff.local/');
    });

    it('And no base url but base path is given then return', () => {
      const server = HapiServerMother.complete().build();

      const actual = UrlUtil.base(server, request, null, '/api/v1');

      expect(actual).toEqual('http://tests.local/api/v1');
    });

    it('And base url and base path is given then return', () => {
      const server = HapiServerMother.complete().build();

      const actual = UrlUtil.base(server, request, 'http://tests-diff.local', '/api/v1');

      expect(actual).toEqual('http://tests-diff.local/api/v1');
    });

    it('And base url with path and base path is given then return', () => {
      const server = HapiServerMother.complete().build();

      const actual = UrlUtil.base(server, request, 'http://tests-diff.local/sub', '/api/v1');

      expect(actual).toEqual('http://tests-diff.local/sub/api/v1');
    });

    it('And no base url, no base path but modifiers.route.prefix is given then return', () => {
      const server = HapiServerMother.complete().realmModifiersRoutePrefix('/route/prefix').build();

      const actual = UrlUtil.base(server, request, 'http://tests-diff.local', null);

      expect(actual).toEqual('http://tests-diff.local/route/prefix');
    });
  });

  describe('When request keycloak login url', () => {
    it('And realm, client id and redirect url but no uuid are given then return', () => {
      const actual = UrlUtil.login(realm, clientId, 'http://tests.local');

      expect(actual).toEqual(
        'http://auth.local/protocol/openid-connect/auth?client_id=test-client-id' +
          '&state=mocked-uuid&redirect_uri=http%3A%2F%2Ftests.local&scope=openid&response_type=code'
      );
      expect(uuidv4).toHaveBeenCalled();
    });

    it('And realm, client id, redirect url and uuid are given then return', () => {
      const actual = UrlUtil.login(realm, clientId, 'http://tests.local', 'test-uuid');

      expect(actual).toEqual(
        'http://auth.local/protocol/openid-connect/auth?client_id=test-client-id' +
          '&state=test-uuid&redirect_uri=http%3A%2F%2Ftests.local&scope=openid&response_type=code'
      );
      expect(uuidv4).not.toHaveBeenCalled();
    });

    it('And realm with path, client id and redirect url but no uuid are given then return', () => {
      const actual = UrlUtil.login(realm + '/realm', clientId, 'http://tests.local');

      expect(actual).toEqual(
        'http://auth.local/realm/protocol/openid-connect/auth?client_id=test-client-id' +
          '&state=mocked-uuid&redirect_uri=http%3A%2F%2Ftests.local&scope=openid&response_type=code'
      );
      expect(uuidv4).toHaveBeenCalled();
    });
  });

  describe('When request after login redirect url', () => {
    it('And base url but no base path is given then return', () => {
      const actual = UrlUtil.loginRedirect('http://test.local');

      expect(actual).toEqual('http://test.local/?auth_callback=1');
    });

    it('And base url and base path is given then return', () => {
      const actual = UrlUtil.loginRedirect('http://test.local', '/api/v1');

      expect(actual).toEqual('http://test.local/api/v1?auth_callback=1');
    });

    it('And base url with path and base path is given then return', () => {
      const actual = UrlUtil.loginRedirect('http://test.local/sub', '/api/v1');

      expect(actual).toEqual('http://test.local/sub/api/v1?auth_callback=1');
    });
  });

  describe('When request logout url', () => {
    it('And realm and client id are given but redirect and id token do not then return', () => {
      const actual = UrlUtil.logout(realm, clientId);

      expect(actual).toEqual('http://auth.local/protocol/openid-connect/logout?client_id=test-client-id');
    });

    it('And realm, client id and redirect are given but id token do not then return', () => {
      const actual = UrlUtil.logout(realm, clientId, 'http://test.local');

      expect(actual).toEqual(
        'http://auth.local/protocol/openid-connect/logout' +
          '?post_logout_redirect_uri=http%3A%2F%2Ftest.local&client_id=test-client-id'
      );
    });

    it('And realm, client id and id token are given but redirect do not then return', () => {
      const actual = UrlUtil.logout(realm, clientId, null, 'test-id-token');

      expect(actual).toEqual('http://auth.local/protocol/openid-connect/logout?id_token_hint=test-id-token');
    });

    it('And realm, client id, redirect and id token are given then return', () => {
      const actual = UrlUtil.logout(realm, clientId, 'http://test.local', 'test-id-token');

      expect(actual).toEqual(
        'http://auth.local/protocol/openid-connect/logout' +
          '?post_logout_redirect_uri=http%3A%2F%2Ftest.local&id_token_hint=test-id-token'
      );
    });

    it('And realm with path, client id, redirect and id token are given then return', () => {
      const actual = UrlUtil.logout(realm + '/realm', clientId, 'http://test.local', 'test-id-token');

      expect(actual).toEqual(
        'http://auth.local/realm/protocol/openid-connect/logout' +
          '?post_logout_redirect_uri=http%3A%2F%2Ftest.local&id_token_hint=test-id-token'
      );
    });
  });

  describe('When request registration url', () => {
    it('And realm, client id and redirect are given but locale do not then return', () => {
      const actual = UrlUtil.registration(realm, clientId, 'http://test.local');

      expect(actual).toEqual(
        'http://auth.local/protocol/openid-connect/registrations' +
          '?client_id=test-client-id&redirect_uri=http%3A%2F%2Ftest.local&scope=openid&response_type=code'
      );
    });

    it('And realm with path, client id and redirect are given but locale do not then return', () => {
      const actual = UrlUtil.registration(realm + '/realm', clientId, 'http://test.local');

      expect(actual).toEqual(
        'http://auth.local/realm/protocol/openid-connect/registrations' +
          '?client_id=test-client-id&redirect_uri=http%3A%2F%2Ftest.local&scope=openid&response_type=code'
      );
    });

    it('And realm, client id, redirect and locale are given then return', () => {
      const actual = UrlUtil.registration(realm, clientId, 'http://test.local', 'es');

      expect(actual).toEqual(
        'http://auth.local/protocol/openid-connect/registrations' +
          '?client_id=test-client-id&redirect_uri=http%3A%2F%2Ftest.local&scope=openid&response_type=code&kc_locale=es'
      );
    });
  });

  /**
   * DEPRECATED
   */
  describe('When request a password url', () => {
    it('And realm and client id are given then return', () => {
      const actual = UrlUtil.password(realm, clientId);

      expect(actual).toEqual('http://auth.local/account/password?referrer=test-client-id');
    });

    it('And realm with path and client id are given then return', () => {
      const actual = UrlUtil.password(realm + '/realm', clientId);

      expect(actual).toEqual('http://auth.local/realm/account/password?referrer=test-client-id');
    });
  });

  describe('When request an account url', () => {
    it('And realm is given then return', () => {
      const actual = UrlUtil.account(realm);

      expect(actual).toEqual('http://auth.local/account');
    });

    it('And realm with path is given then return', () => {
      const actual = UrlUtil.account(realm + '/realm');

      expect(actual).toEqual('http://auth.local/realm/account');
    });
  });
});
