const KeycloakConfigMapper = require('../../src/mapper/keycloak-config-mapper');

describe('Given a KeycloakConfigMapper', () => {
  it('When keycloak object is not given then throw', () => {
    const throwing = () => KeycloakConfigMapper.toKeycloakConfig({});

    expect(throwing).toThrow('$.config.keycloak.client.id and $.config.keycloak.client.secret are required');
  });

  it('When keycloak client object is not given then throw', () => {
    const throwing = () => KeycloakConfigMapper.toKeycloakConfig({ keycloak: {} });

    expect(throwing).toThrow('$.config.keycloak.client.id and $.config.keycloak.client.secret are required');
  });

  it('When keycloak client id is not given then throw', () => {
    const throwing = () => KeycloakConfigMapper.toKeycloakConfig({ keycloak: { client: { secret: 'test-secret' } } });

    expect(throwing).toThrow('$.config.keycloak.client.id and $.config.keycloak.client.secret are required');
  });
  it('When keycloak client secret is not given then throw', () => {
    const throwing = () => KeycloakConfigMapper.toKeycloakConfig({ keycloak: { client: { id: 'test-id' } } });

    expect(throwing).toThrow('$.config.keycloak.client.id and $.config.keycloak.client.secret are required');
  });
  it('When keycloak server is not given then throw', () => {
    const throwing = () =>
      KeycloakConfigMapper.toKeycloakConfig({ keycloak: { client: { id: 'test-id', secret: 'test-secret' } } });

    expect(throwing).toThrow('$.config.keycloak.server is required. Please, provide the keycloak url');
  });
  it('When keycloak realm is not given then throw', () => {
    const throwing = () =>
      KeycloakConfigMapper.toKeycloakConfig({
        keycloak: { client: { id: 'test-id', secret: 'test-secret' }, server: 'https://test.local' },
      });

    expect(throwing).toThrow('$.config.keycloak.realm is required. Please, provide the keycloak realm');
  });
  it('When arguments are fine then return', () => {
    const actual = KeycloakConfigMapper.toKeycloakConfig({
      bearerOnly: false,
      keycloak: {
        client: { id: 'test-id', secret: 'test-secret' },
        server: 'https://test.local',
        realm: 'test-realm',
        minTimeBetweenJwksRequests: 1,
        verifyTokenAudience: true,
      },
    });

    expect(actual).toEqual({
      bearerOnly: false,
      clientId: 'test-id',
      minTimeBetweenJwksRequests: 1,
      realm: 'test-realm',
      secret: 'test-secret',
      serverUrl: 'https://test.local',
      verifyTokenAudience: true,
    });
  });
});
