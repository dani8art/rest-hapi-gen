jest.mock('crypto', () => {
  return {
    createVerify: jest.fn().mockReturnValue({
      update: jest.fn(),
      verify: jest.fn().mockImplementation((publicKey, signature, format) => publicKey !== 'not-valid'),
    }),
  };
});

const grantManager = { publicKey: 'mocked-public-key', rotation: { getJWK: jest.fn() } };

const TokenMother = require('./mother/token.mother');
const ActionTokenVerifier = require('../src/token-verifier');
const actionTokenVerifier = new ActionTokenVerifier(grantManager);

describe('Given a ActionTokenVerifier', () => {
  beforeEach(() => jest.clearAllMocks());

  it('When has no token then throws error', async () => {
    const throwing = async () => actionTokenVerifier.verify(null, {});

    await expect(throwing).rejects.toThrow('Invalid token (missing)');
  });

  it('When has expired and using the exp field then throws', async () => {
    const token = TokenMother.complete().exp(TokenMother.nowSubMinutes(5)).build();
    const throwing = async () => actionTokenVerifier.verify(token, {});

    await expect(throwing).rejects.toThrow('Invalid token (expired)');
  });

  it('When has expired and using the expiration field then throws', async () => {
    const token = TokenMother.complete().exp(null).expiration(TokenMother.nowSubMinutes(5)).build();
    const throwing = async () => actionTokenVerifier.verify(token, {});

    await expect(throwing).rejects.toThrow('Invalid token (expired)');
  });

  it('When is not signed then throws', async () => {
    const token = TokenMother.complete().signed(false).build();
    const throwing = async () => actionTokenVerifier.verify(token, {});

    await expect(throwing).rejects.toThrow('Invalid token (not signed)');
  });

  it('When action is not valid then throws', async () => {
    const token = TokenMother.complete().build();
    const throwing = async () => actionTokenVerifier.verify(token, { action: 'not-valid' });

    await expect(throwing).rejects.toThrow('Invalid token (wrong action)');
  });

  it('When resource is not valid then throws', async () => {
    const token = TokenMother.complete().build();
    const throwing = async () => actionTokenVerifier.verify(token, { action: 'test-action', resource: 'not-valid' });

    await expect(throwing).rejects.toThrow('Invalid token (wrong resource)');
  });

  describe('When validating signature', () => {
    it('And grant manager has public key and crypto can not verify then throws', async () => {
      actionTokenVerifier.grantManager.publicKey = 'not-valid';
      const token = TokenMother.complete().build();
      const throwing = async () =>
        actionTokenVerifier.verify(token, { action: 'test-action', resource: 'test-resource' });

      await expect(throwing).rejects.toThrow('Invalid token (signature)');
    });

    it('And grant manager has not public key and crypto can not verify then get a new public key and throws', async () => {
      actionTokenVerifier.grantManager.publicKey = null;
      actionTokenVerifier.grantManager.rotation.getJWK = jest.fn().mockReturnValue('not-valid');
      const token = TokenMother.complete().build();
      const config = { action: 'test-action', resource: 'test-resource' };
      const throwing = async () => actionTokenVerifier.verify(token, config);

      await expect(throwing).rejects.toThrow('Invalid token (signature)');
      expect(grantManager.rotation.getJWK).toHaveBeenCalledWith(token.header.kid);
    });
  });

  it('When stored public key and valid token then return', async () => {
    actionTokenVerifier.grantManager.publicKey = 'valid';
    const token = TokenMother.complete().build();
    const config = { action: 'test-action', resource: 'test-resource' };

    const actual = await actionTokenVerifier.verify(token, config);

    expect(actual).toEqual(token);
    expect(grantManager.rotation.getJWK).not.toHaveBeenCalled();
  });

  it('When no stored public key then get new valid public key and return', async () => {
    actionTokenVerifier.grantManager.publicKey = null;
    actionTokenVerifier.grantManager.rotation.getJWK = jest.fn().mockReturnValue('valid');
    const token = TokenMother.complete().build();
    const config = { action: 'test-action', resource: 'test-resource' };

    const actual = await actionTokenVerifier.verify(token, config);

    expect(actual).toEqual(token);
    expect(grantManager.rotation.getJWK).toHaveBeenCalledWith(token.header.kid);
  });
});
