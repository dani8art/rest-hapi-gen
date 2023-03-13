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
      expect(HateoasLinks.href).toHaveBeenCalledWith(request, expect.anything(), null, true);
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
      expect(HateoasLinks.href).toHaveBeenCalledWith(request, expect.anything(), null, true);
    });

    it('should return null', () => {
      const hateoasResource = Hateoas.addResourceLinks(null, request, '_id');

      expect(hateoasResource).toStrictEqual(null);
      expect(HateoasLinks.href).not.toHaveBeenCalledWith(request, expect.anything(), null, true);
    });

    it('When resources links are calculated from a collection query then does not include query params', () => {
      const expected = {
        _id: 'id',
        _links: {
          collection: { href: 'http://test.local' },
          self: { href: 'http://test.local' },
        },
        test: 'myTest',
      };

      const hateoasResource = Hateoas.addResourceLinks(baseResource, request, 'test', true);

      expect(hateoasResource).toStrictEqual(expected);
      expect(HateoasLinks.href).toHaveBeenCalledWith(request, expect.anything(), null, false);
    });
  });

  describe('#addCollectionLinks', () => {
    it('When no pagination needed should return the array embedded with links', () => {
      const pagination = { page: 1, limit: 10, count: 2 };
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
        _pages: pagination,
      };

      const hateoasCollection = Hateoas.addCollectionLinks(baseArray, request, opts.collection.name, pagination);

      expect(hateoasCollection).toStrictEqual(expected);
      expect(HateoasLinks.href).toHaveBeenCalledTimes(3);
      expect(HateoasLinks.href).toHaveBeenCalledWith(request, null, pagination, true);
      expect(HateoasLinks.href).not.toHaveBeenCalledWith(request, null, prev(pagination), true);
      expect(HateoasLinks.href).not.toHaveBeenCalledWith(request, null, next(pagination), true);
    });

    it('When there is next page should return the array embedded with proper links', () => {
      const pagination = { page: 1, limit: 2, count: 4 };
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
        _links: { self: { href: 'http://test.local' }, next: { href: 'http://test.local' } },
        _pages: pagination,
      };

      const hateoasCollection = Hateoas.addCollectionLinks(baseArray, request, opts.collection.name, pagination);

      expect(hateoasCollection).toStrictEqual(expected);
      expect(HateoasLinks.href).toHaveBeenCalledTimes(4);
      expect(HateoasLinks.href).toHaveBeenCalledWith(request, null, pagination, true);
      expect(HateoasLinks.href).not.toHaveBeenCalledWith(request, null, prev(pagination), true);
      expect(HateoasLinks.href).toHaveBeenCalledWith(request, null, next(pagination), true);
    });

    it('When there is next and prev page should return the array embedded with proper links', () => {
      const pagination = { page: 2, limit: 2, count: 6 };
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
        _links: {
          self: { href: 'http://test.local' },
          prev: { href: 'http://test.local' },
          next: { href: 'http://test.local' },
        },
        _pages: pagination,
      };

      const hateoasCollection = Hateoas.addCollectionLinks(baseArray, request, opts.collection.name, pagination);

      expect(hateoasCollection).toStrictEqual(expected);
      expect(HateoasLinks.href).toHaveBeenCalledTimes(5);
      expect(HateoasLinks.href).toHaveBeenCalledWith(request, null, pagination, true);
      expect(HateoasLinks.href).toHaveBeenCalledWith(request, null, prev(pagination), true);
      expect(HateoasLinks.href).toHaveBeenCalledWith(request, null, next(pagination), true);
    });

    it('When there is only prev page should return the array embedded with proper links', () => {
      const pagination = { page: 3, limit: 2, count: 6 };
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
        _links: {
          self: { href: 'http://test.local' },
          prev: { href: 'http://test.local' },
        },
        _pages: pagination,
      };

      const hateoasCollection = Hateoas.addCollectionLinks(baseArray, request, opts.collection.name, pagination);

      expect(hateoasCollection).toStrictEqual(expected);
      expect(HateoasLinks.href).toHaveBeenCalledTimes(4);
      expect(HateoasLinks.href).toHaveBeenCalledWith(request, null, pagination, true);
      expect(HateoasLinks.href).toHaveBeenCalledWith(request, null, prev(pagination), true);
      expect(HateoasLinks.href).not.toHaveBeenCalledWith(request, null, next(pagination), true);
    });
  });
});

function next(pagination) {
  return { limit: pagination.limit, page: pagination.page + 1 };
}

function prev(pagination) {
  return { limit: pagination.limit, page: pagination.page - 1 };
}
