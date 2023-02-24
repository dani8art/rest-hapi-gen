const GrantStoreFactory = require('../../src/factory/grant-store-factory');
const SessionGrantStore = require('../../src/grant-store/session-grant-store');
const BearerGrantStore = require('../../src/grant-store/bearer-grant-store');
const NoGrantStore = require('../../src/grant-store/no-grant-store');
const DelegatingGrantStore = require('../../src/grant-store/delegating-grant-store');
const HapiRequestMother = require('../mother/hapi-request.mother');

describe('Given a GrantStoreFactory', () => {
  it('When no client id is given then throws', () => {
    const throwing = () => new GrantStoreFactory();

    expect(throwing).toThrow("Can't create GrantStoreFactory because $.options.clientId is required");
  });

  describe('When request the grant store', () => {
    it('And token is in session then return SessionGrantStore', () => {
      const request = HapiRequestMother.complete()
        .yar({ get: () => 'test-token' })
        .build();
      const factory = new GrantStoreFactory({ clientId: 'test-client-id' });

      const grantStore = factory.get(request);

      expect(grantStore).toBeInstanceOf(DelegatingGrantStore);
      expect(grantStore.innerGrantStore).toBeInstanceOf(SessionGrantStore);
    });

    it('And token is in the authorization header then return BearerGrantStore', () => {
      const request = HapiRequestMother.complete()
        .yar({ get: () => undefined })
        .addHeader('authorization', 'bearer test-token')
        .build();
      const factory = new GrantStoreFactory({ clientId: 'test-client-id' });

      const grantStore = factory.get(request);

      expect(grantStore).toBeInstanceOf(DelegatingGrantStore);
      expect(grantStore.innerGrantStore).toBeInstanceOf(BearerGrantStore);
    });

    it('And no token then return NoGrantStore', () => {
      const request = HapiRequestMother.complete()
        .yar({ get: () => undefined })
        .build();
      const factory = new GrantStoreFactory({ clientId: 'test-client-id' });

      const grantStore = factory.get(request);

      expect(grantStore).toBeInstanceOf(DelegatingGrantStore);
      expect(grantStore.innerGrantStore).toBeInstanceOf(NoGrantStore);
    });
  });

  describe('When request the grant store and bearer only is configured', () => {
    it('And token is in session then return NoGrantStore', () => {
      const request = HapiRequestMother.complete()
        .yar({ get: () => 'test-token' })
        .build();
      const factory = new GrantStoreFactory({ bearerOnly: true, clientId: 'test-client-id' });

      const grantStore = factory.get(request);

      expect(grantStore).toBeInstanceOf(DelegatingGrantStore);
      expect(grantStore.innerGrantStore).toBeInstanceOf(NoGrantStore);
    });

    it('And token is in the authorization header then return BearerGrantStore', () => {
      const request = HapiRequestMother.complete()
        .yar({ get: () => undefined })
        .addHeader('authorization', 'bearer test-token')
        .build();
      const factory = new GrantStoreFactory({ clientId: 'test-client-id' });

      const grantStore = factory.get(request);

      expect(grantStore).toBeInstanceOf(DelegatingGrantStore);
      expect(grantStore.innerGrantStore).toBeInstanceOf(BearerGrantStore);
    });
  });

  it('When request session grant store then return SessionGrantStore', () => {
    const factory = new GrantStoreFactory({ clientId: 'test-client-id' });

    const grantStore = factory.getSessionGrantStore();

    expect(grantStore).toBeInstanceOf(DelegatingGrantStore);
    expect(grantStore.innerGrantStore).toBeInstanceOf(SessionGrantStore);
  });

  it('Whe create a grant store factory then serializer has the client id', () => {
    const expected = 'test-client-id';
    const factory = new GrantStoreFactory({ clientId: expected });

    expect(factory.serializer.clientId).toEqual(expected);
  });
});
