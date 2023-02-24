const GrantSerializer = require('../src/grant-serializer');
const GrantMother = require('./mother/grant.mother');

const clientId = 'test-client-id';
const grantSerializer = new GrantSerializer(clientId);

const serialized = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  id_token: 'test-id-token',
  expires_in: 102934832,
  token_type: 'jwt',
};

describe('Given a GrantSerializer', () => {
  describe('When serialize', () => {
    it('And grant is undefined then return null', () => {
      const actual = grantSerializer.serialize(undefined);

      expect(actual).toEqual(null);
    });

    it('And grant is filled then return properly', () => {
      const grant = GrantMother.complete().build();

      const actual = grantSerializer.serialize(grant);

      expect(actual).toEqual(serialized);
    });

    it('And grant is not filled then return undefined', () => {
      const grant = GrantMother.complete().accessToken(undefined).refreshToken(undefined).idToken(undefined).build();

      const actual = grantSerializer.serialize(grant);

      const { expires_in, token_type } = serialized;
      expect(actual).toEqual({ expires_in, token_type });
    });
  });

  describe('When deserialize', () => {
    it('And grant data is undefined then return null', () => {
      const actual = grantSerializer.deserialize(undefined);

      expect(actual).toEqual(null);
    });

    it('And grant data is filled then return properly', () => {
      const grant = GrantMother.complete().build();

      const actual = grantSerializer.deserialize(serialized);

      expect(actual).toEqual(grant);
    });

    it('And grant data is not filled then return undefined', () => {
      const grant = GrantMother.complete().accessToken(undefined).refreshToken(undefined).idToken(undefined).build();
      const { expires_in, token_type } = serialized;
      const input = { expires_in, token_type };

      const actual = grantSerializer.deserialize(input);

      expect(actual).toEqual(grant);
    });
  });
});
