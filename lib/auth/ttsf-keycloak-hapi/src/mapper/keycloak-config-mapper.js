const toKeycloakConfig = (config) => {
  const { bearerOnly, keycloak } = config;

  if (!keycloak || !keycloak.client || !(keycloak.client.id && keycloak.client.secret)) {
    throw new Error('$.config.keycloak.client.id and $.config.keycloak.client.secret are required');
  }

  if (!keycloak || !keycloak.server) {
    throw new Error('$.config.keycloak.server is required. Please, provide the keycloak url');
  }

  if (!keycloak || !keycloak.realm) {
    throw new Error('$.config.keycloak.realm is required. Please, provide the keycloak realm');
  }

  return {
    bearerOnly,
    serverUrl: keycloak.server,
    realm: keycloak.realm,
    clientId: keycloak.client.id,
    secret: keycloak.client.secret,
    minTimeBetweenJwksRequests: keycloak.minTimeBetweenJwksRequests,
    verifyTokenAudience: keycloak.verifyTokenAudience,
  };
};

module.exports = { toKeycloakConfig };
