jest.mock('../lib/hateoas-links');

const hateoasLinks = require('../lib/hateoas-links');
const hateoas = require('../lib/hateoas');

describe('Hateoas Test', () => {
  const baseResource = { test: 'myTest', _id: 'id' };
  const baseArray = [baseResource];

  const opts = { url: new URL('http://localhost/base/path'), collectionName: 'tests' };

  const collectionLink = { href: 'http://localhost/base/path/tests' };

  hateoasLinks.buildCollectionLink.mockReturnValue(collectionLink);
  hateoasLinks.buildResourceLink.mockImplementation((url, identifier) => {
    return { href: `http://localhost/base/path/tests/${identifier}` };
  });

  beforeEach(() => jest.clearAllMocks());

  describe('#addResourceLinks', () => {
    it('should return the object with default identifier links', () => {
      const options = { ...opts };
      const expected = {
        _id: 'id',
        _links: {
          collection: { href: 'http://localhost/base/path/tests' },
          self: { href: 'http://localhost/base/path/tests/id' },
        },
        test: 'myTest',
      };

      const hateoasResource = hateoas.addResourceLinks(baseResource, options);

      expect(hateoasResource).toStrictEqual(expected);
    });

    it('should return the object with custom identifier links', () => {
      const options = { ...opts, identifier: 'test' };
      const expected = {
        _id: 'id',
        _links: {
          collection: { href: 'http://localhost/base/path/tests' },
          self: { href: 'http://localhost/base/path/tests/myTest' },
        },
        test: 'myTest',
      };

      const hateoasResource = hateoas.addResourceLinks(baseResource, options);

      expect(hateoasResource).toStrictEqual(expected);
    });

    it('should return null', () => {
      const options = { ...opts, identifier: 'test' };

      const hateoasResource = hateoas.addResourceLinks(null, options);

      expect(hateoasResource).toStrictEqual(null);
    });
  });

  describe('#addCollectionLinks', () => {
    it('should return the array embedded with links', () => {
      const expected = {
        _embedded: {
          tests: [
            {
              _id: 'id',
              _links: {
                collection: { href: 'http://localhost/base/path/tests' },
                self: { href: 'http://localhost/base/path/tests/id' },
              },
              test: 'myTest',
            },
          ],
        },
        _links: { self: { href: 'http://localhost/base/path/tests' } },
      };

      const hateoasCollection = hateoas.addCollectionLinks(baseArray, opts);

      expect(hateoasCollection).toStrictEqual(expected);
    });
  });
});
