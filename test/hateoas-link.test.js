const hateoas = require('../lib/hateoas-links');

const HapiRequestMother = require('./mother/hapi-request.mother');

describe('Hateoas Links Test', () => {
  const collectionName = 'tests';
  const url = new URL(`http://localhost/base/path/${collectionName}`);

  describe('#buildCollectionLink', () => {
    it('should return the collection link', () => {
      const expectedLink = { href: 'http://localhost/base/path/tests' };
      const hateoasCollectionLink = hateoas.buildCollectionLink(url);

      expect(hateoasCollectionLink).toStrictEqual(expectedLink);
    });
  });

  describe('#buildResourceLink', () => {
    it('should return the resource link with default identifier', () => {
      const expectedLink = { href: 'http://localhost/base/path/tests/myTest' };
      const hateoasCollectionLink = hateoas.buildResourceLink(url, 'myTest');

      expect(hateoasCollectionLink).toStrictEqual(expectedLink);
    });
  });

  describe('When a href is requested', () => {
    it('And path is given then appends it', () => {
      const request = HapiRequestMother.complete().build();

      const href = hateoas.href(request, '/api/v1');

      expect(href).toEqual({ href: 'http://tests.local/api/v1' });
    });

    it('And path is given then appends default path', () => {
      const request = HapiRequestMother.complete().build();

      const href = hateoas.href(request);

      expect(href).toEqual({ href: 'http://tests.local/' });
    });
  });
});
