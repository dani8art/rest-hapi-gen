jest.mock('@hapi/hoek', () => {
  return { applyToDefaults: jest.fn().mockImplementation((defaults, sources) => (sources.key ? sources : defaults)) };
});

const { applyToDefaults } = require('@hapi/hoek');
const SessionGrantStore = require('../../src/grant-store/session-grant-store');
const HapiRequestMother = require('../mother/hapi-request.mother');

const yar = { get: jest.fn(), set: jest.fn(), reset: jest.fn() };
const request = HapiRequestMother.complete().yar(yar).build();

describe('Given a SessionGrantStore', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Name is session', () => {
    const grantStore = new SessionGrantStore();

    expect(grantStore.name).toBe('session');
    expect(applyToDefaults).toHaveBeenCalledWith(expect.anything(), {});
  });

  it('When options are provided then defaults are overriden', () => {
    const expectedOptions = { key: 'test-key' };
    const grantStore = new SessionGrantStore(expectedOptions);

    grantStore.getGrant(request);

    expect(applyToDefaults).toHaveBeenCalledWith(expect.anything(), expectedOptions);
    expect(yar.get).toHaveBeenCalledWith(expectedOptions.key);
  });

  it('When asks if grant can be retreive then try to get it from yar', () => {
    const grantStore = new SessionGrantStore();

    const can = grantStore.canRetrieveGrantFrom(request);

    expect(can).toBeFalsy();
    expect(yar.get).toHaveBeenCalledWith(SessionGrantStore.DEAFULT_SESSION_KEY);
  });

  it('When asks if grant can be retreive and it is stored then try to get it from yar', () => {
    const grantStore = new SessionGrantStore();
    yar.get = jest.fn().mockReturnValue('test-grant');

    const can = grantStore.canRetrieveGrantFrom(request);

    expect(can).toBeTruthy();
    expect(yar.get).toHaveBeenCalledWith(SessionGrantStore.DEAFULT_SESSION_KEY);
  });

  it('When set a grant then try to store it to yar', () => {
    const grantStore = new SessionGrantStore();
    const expectedGrant = 'test-grant';

    grantStore.saveGrant(request, expectedGrant);

    expect(yar.set).toHaveBeenCalledWith(SessionGrantStore.DEAFULT_SESSION_KEY, expectedGrant);
  });

  it('When clean grant store up then try to clean yar up', () => {
    const grantStore = new SessionGrantStore();

    grantStore.clearGrant(request);

    expect(yar.reset).toHaveBeenCalled();
  });
});
