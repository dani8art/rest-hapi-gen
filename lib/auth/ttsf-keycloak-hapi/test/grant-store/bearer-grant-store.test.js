const BearerGrantStore = require('../../src/grant-store/bearer-grant-store');
const HapiRequestMother = require('../mother/hapi-request.mother');

const request = HapiRequestMother.complete().build();

describe('Given a BearerGrantStore', () => {
  it('Name is bearer', () => {
    const grantStore = new BearerGrantStore();

    expect(grantStore.name).toBe('bearer');
  });

  it('When asks if grant can be retreive and headers have not it then return false', () => {
    const grantStore = new BearerGrantStore();

    const can = grantStore.canRetrieveGrantFrom(request);

    expect(can).toBeFalsy();
  });

  it('When asks if grant can be retreive and header have it with "bearer" then return true', () => {
    const grantStore = new BearerGrantStore();
    const request = HapiRequestMother.complete().addHeader('authorization', 'bearer test-token').build();

    const can = grantStore.canRetrieveGrantFrom(request);

    expect(can).toBeTruthy();
  });

  it('When asks if grant can be retreive and header have it with "Bearer" then return true', () => {
    const grantStore = new BearerGrantStore();
    const request = HapiRequestMother.complete().addHeader('authorization', 'Bearer test-token').build();

    const can = grantStore.canRetrieveGrantFrom(request);

    expect(can).toBeTruthy();
  });

  it('When asks if grant can be retreive and header have it with no "Bearer" or "bearer" then return false', () => {
    const grantStore = new BearerGrantStore();
    const request = HapiRequestMother.complete().addHeader('authorization', 'Token test-token').build();

    const can = grantStore.canRetrieveGrantFrom(request);

    expect(can).toBeFalsy();
  });

  it('When get the grant and it is store then tries to resolve it from headers and returns', () => {
    const grantStore = new BearerGrantStore();
    const expectedGrant = 'test-grant';
    const request = HapiRequestMother.complete().addHeader('authorization', `bearer ${expectedGrant}`).build();

    const actual = grantStore.getGrant(request);

    expect(actual).toEqual({ access_token: expectedGrant });
  });

  it('When get the grant and it is not store then tries to resolve it and returns null', () => {
    const grantStore = new BearerGrantStore();

    const actual = grantStore.getGrant(request);

    expect(actual).toEqual(null);
  });
});
