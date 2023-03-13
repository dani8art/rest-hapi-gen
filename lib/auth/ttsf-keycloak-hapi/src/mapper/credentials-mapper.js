const { get, union } = require('lodash');

const mapName = (grant, key) => {
  let name;

  if (grant.id_token && grant.id_token.content[key]) {
    name = grant.id_token.content[key];
  } else if (grant.access_token.content[key]) {
    name = grant.access_token.content[key];
  } else {
    name = grant.access_token.content.sub;
  }

  return name;
};

const mapRoles = (grant, clientId) => {
  const token = grant.access_token;

  const appRoles = get(token, `content.resource_access['${clientId}'].roles`, []);
  const realmRoles = get(token, 'content.realm_access.roles', []);

  return union(appRoles, realmRoles);
};

const fromGrant = (grant, nameKey, clientId) => {
  return {
    name: mapName(grant, nameKey),
    scope: mapRoles(grant, clientId),
    idToken: grant.id_token,
    accessToken: grant.access_token,
  };
};

module.exports = { fromGrant };
