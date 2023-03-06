jest.mock('../lib/hateoas-links');

const HateoasLinks = require('../lib/hateoas-links');
const Hateoas = require('../lib/hateoas');

const HapiRequestMother = require('./mother/hapi-request.mother');
const request = HapiRequestMother.complete().build();

describe('Hateoas Test', () => {
  const baseResource = { test: 'myTest', _id: 'id' };
  const baseArray = [baseResource];

  const opts = { collection: { name: 'tests' } };

  const collectionPath = '/base/path/tests';

  HateoasLinks.mapCollectionPath.mockReturnValue(collectionPath);
  HateoasLinks.mapResourcePath.mockImplementation((request, identifier) => {
    return `/base/path/tests/${identifier}`;
  });
  HateoasLinks.href.mockReturnValue({ href: 'http://test.local' });

  beforeEach(() => jest.clearAllMocks());

  describe('#addResourceLinks', () => {
    it('should return the object with default identifier links', () => {
      const expected = {
        _id: 'id',
        _links: {
          collection: { href: 'http://test.local' },
          self: { href: 'http://test.local' },
        },
        test: 'myTest',
      };

      const hateoasResource = Hateoas.addResourceLinks(baseResource, request, '_id');

      expect(hateoasResource).toStrictEqual(expected);
    });

    it('should return the object with custom identifier links', () => {
      const expected = {
        _id: 'id',
        _links: {
          collection: { href: 'http://test.local' },
          self: { href: 'http://test.local' },
        },
        test: 'myTest',
      };

      const hateoasResource = Hateoas.addResourceLinks(baseResource, request, 'test');

      expect(hateoasResource).toStrictEqual(expected);
    });

    it('should return null', () => {
      const hateoasResource = Hateoas.addResourceLinks(null, request, '_id');

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
                collection: { href: 'http://test.local' },
                self: { href: 'http://test.local' },
              },
              test: 'myTest',
            },
          ],
        },
        _links: { self: { href: 'http://test.local' } },
      };

      const hateoasCollection = Hateoas.addCollectionLinks(baseArray, request, opts.collection.name);

      expect(hateoasCollection).toStrictEqual(expected);
    });
  });
});
