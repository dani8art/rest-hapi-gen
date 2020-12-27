const hateoas = require('../lib/hateoas-links');

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
});
