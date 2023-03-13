const NoGrantStore = require('../../src/grant-store/no-grant-store');

describe('Given a NoGrantStore', () => {
  it('Name is bearer', () => {
    const grantStore = new NoGrantStore();

    expect(grantStore.name).toEqual(undefined);
  });

  it('When asks if grant can be retreive then return true', () => {
    const grantStore = new NoGrantStore();

    const can = grantStore.canRetrieveGrantFrom();

    expect(can).toBeTruthy();
  });

  it('When get the grant then returns null', () => {
    const grantStore = new NoGrantStore();

    const actual = grantStore.getGrant();

    expect(actual).toEqual(null);
  });
});
