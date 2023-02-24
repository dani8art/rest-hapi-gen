jest.mock('lodash');
const _ = require('lodash');
_.get = jest.fn();
_.union = jest.fn().mockReturnValue(['app-role', 'realm-role']);

const CredentialsMapper = require('../../src/mapper/credentials-mapper');

const GrantMother = require('../mother/grant.mother');
const nameKey = 'name';
const clientId = 'test-client-id';

const expectedTemplate = {
  accessToken: {
    clientId,
    content: { exp: 0 },
    token: 'test-access-token',
  },
  idToken: {
    clientId,
    content: { exp: 0 },
    token: 'test-id-token',
  },
  name: 'test-name',
  scope: ['app-role', 'realm-role'],
};

describe('Given a CredentialsMapper', () => {
  beforeEach(() => {
    delete expectedTemplate.accessToken.content[nameKey];
    delete expectedTemplate.accessToken.content.sub;
    delete expectedTemplate.idToken.content[nameKey];
    _.get.mockReturnValueOnce(['app-role']).mockReturnValueOnce(['realm-role']);

    jest.clearAllMocks();
  });

  it('When map credentials from a keycloak grant and id_token content have name key then return properly', () => {
    const expected = Object.assign({}, expectedTemplate);
    expected.idToken.content[nameKey] = 'test-id-name';
    expected.name = 'test-id-name';
    const grant = GrantMother.complete().idTokenName(nameKey).build();

    const credentials = CredentialsMapper.fromGrant(grant, nameKey, clientId);

    expect(_.get).toHaveBeenCalledWith(expect.anything(), "content.resource_access['test-client-id'].roles", []);
    expect(_.get).toHaveBeenCalledWith(expect.anything(), 'content.realm_access.roles', []);
    expect(_.union).toHaveBeenCalledWith(['app-role'], ['realm-role']);
    expect(credentials).toEqual(expected);
  });

  it('When map credentials from a keycloak grant and id_token content have not name key but access_token has it then return properly', () => {
    const expected = Object.assign({}, expectedTemplate);
    expected.accessToken.content[nameKey] = 'test-access-name';
    expected.name = 'test-access-name';
    const grant = GrantMother.complete().accessTokenName(nameKey).build();

    const credentials = CredentialsMapper.fromGrant(grant, nameKey, clientId);

    expect(_.get).toHaveBeenCalledWith(expect.anything(), "content.resource_access['test-client-id'].roles", []);
    expect(_.get).toHaveBeenCalledWith(expect.anything(), 'content.realm_access.roles', []);
    expect(_.union).toHaveBeenCalledWith(['app-role'], ['realm-role']);
    expect(credentials).toEqual(expected);
  });

  it('When map credentials from a keycloak grant and id_token content have not name key and access_token neither then return properly', () => {
    const expected = Object.assign({}, expectedTemplate);
    expected.accessToken.content.sub = 'sub';
    expected.name = 'sub';
    const grant = GrantMother.complete().accessTokenSub('sub').build();

    const credentials = CredentialsMapper.fromGrant(grant, nameKey, clientId);

    expect(_.get).toHaveBeenCalledWith(expect.anything(), "content.resource_access['test-client-id'].roles", []);
    expect(_.get).toHaveBeenCalledWith(expect.anything(), 'content.realm_access.roles', []);
    expect(_.union).toHaveBeenCalledWith(['app-role'], ['realm-role']);
    expect(credentials).toEqual(expected);
  });
});
