const { not } = require('joi');
const DelegatingGrantStore = require('../../src/grant-store/delegating-grant-store');
const HapiRequestMother = require('../mother/hapi-request.mother');

const request = HapiRequestMother.complete().build();
const innerGrantStore = { canRetrieveGrantFrom: jest.fn().mockReturnValue(true), getGrant: jest.fn() };
const serializer = { serialize: jest.fn(), deserialize: jest.fn() };
const grantStore = new DelegatingGrantStore(innerGrantStore, serializer);

describe('Given a DelegatingGrantStore', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Name is bearer', () => {
    expect(grantStore.name).toEqual(undefined);
  });

  it('When asks if grant can be retreive then delegate to inner grant store', () => {
    const can = grantStore.canRetrieveGrantFrom(request);

    expect(can).toBeTruthy();
    expect(innerGrantStore.canRetrieveGrantFrom).toHaveBeenCalledWith(request);
  });

  it('When get the grant and it is store then delegate to inner grant store and deserialize', () => {
    const expectedGrant = 'test-grant';
    innerGrantStore.getGrant = jest.fn().mockReturnValue(expectedGrant);
    serializer.deserialize = jest.fn().mockReturnValue(expectedGrant);

    const actual = grantStore.getGrant(request);

    expect(actual).toEqual(expectedGrant);
    expect(innerGrantStore.getGrant).toHaveBeenCalledWith(request);
    expect(serializer.deserialize).toHaveBeenCalledWith(expectedGrant);
  });

  it('When get the grant and it isnot store then delegate to inner grant store and return null', () => {
    innerGrantStore.getGrant = jest.fn().mockReturnValue(null);

    const actual = grantStore.getGrant(request);

    expect(actual).toEqual(null);
    expect(innerGrantStore.getGrant).toHaveBeenCalledWith(request);
    expect(serializer.deserialize).not.toHaveBeenCalled();
  });

  it('When save the grant and inner grant store can save it then serialize and delegate', () => {
    const expectedGrant = 'test-grant';
    innerGrantStore.saveGrant = jest.fn();
    serializer.serialize = jest.fn().mockReturnValue('serialized:' + expectedGrant);

    grantStore.saveGrant(request, expectedGrant);

    expect(serializer.serialize).toHaveBeenCalledWith(expectedGrant);
    expect(innerGrantStore.saveGrant).toHaveBeenCalledWith(request, 'serialized:' + expectedGrant);
  });

  it('When save the grant and inner grant store can not store it then do nothing', () => {
    innerGrantStore.saveGrant = undefined;
    serializer.serialize = jest.fn();

    grantStore.saveGrant(request, 'test-grant');

    expect(serializer.serialize).not.toHaveBeenCalled();
  });

  it('When clean grant store up and store can do it then delegate', () => {
    innerGrantStore.clearGrant = jest.fn();

    grantStore.clearGrant(request);

    expect(innerGrantStore.clearGrant).toHaveBeenCalledWith(request);
  });
});
