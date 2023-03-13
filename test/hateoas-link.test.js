const hateoas = require('../lib/hateoas-links');

const HapiRequestMother = require('./mother/hapi-request.mother');

describe('Hateoas Links Test', () => {
  describe('#mapCollectionPath', () => {
    it('When request the collection then return the collection path', () => {
      const expectedPath = '/collection';
      const request = HapiRequestMother.complete().path('/collection').build();

      const hateoasCollectionLink = hateoas.mapCollectionPath(request, 'id');

      expect(hateoasCollectionLink).toStrictEqual(expectedPath);
    });

    it('When request the resource then return the collection path', () => {
      const expectedPath = '/collection';
      const request = HapiRequestMother.complete().path('/collection/id').build();

      const hateoasCollectionLink = hateoas.mapCollectionPath(request, 'id');

      expect(hateoasCollectionLink).toStrictEqual(expectedPath);
    });
  });

  describe('#mapResourcePath', () => {
    it('When request the collection then return the resource path', () => {
      const expectedPath = '/collection/id';
      const request = HapiRequestMother.complete().path('/collection').build();

      const hateoasCollectionLink = hateoas.mapResourcePath(request, 'id');

      expect(hateoasCollectionLink).toStrictEqual(expectedPath);
    });

    it('When request the resource then return the resource path', () => {
      const expectedPath = '/collection/id';
      const request = HapiRequestMother.complete().path('/collection/id').build();

      const hateoasCollectionLink = hateoas.mapResourcePath(request, 'id');

      expect(hateoasCollectionLink).toStrictEqual(expectedPath);
    });
  });

  describe('When a href is requested', () => {
    it('And path is given then appends it', () => {
      const request = HapiRequestMother.complete().build();

      const href = hateoas.href(request, '/api/v1');

      expect(href).toEqual({ href: 'http://tests.local/api/v1' });
    });

    it('And path is not given then appends default path', () => {
      const request = HapiRequestMother.complete().build();

      const href = hateoas.href(request);

      expect(href).toEqual({ href: 'http://tests.local/' });
    });

    it('And path is not given but request has path then appends it', () => {
      const request = HapiRequestMother.complete().path('path').build();

      const href = hateoas.href(request);

      expect(href).toEqual({ href: 'http://tests.local/path' });
    });

    it('And page is given then appends it to the query', () => {
      const request = HapiRequestMother.complete().addQueryParam('qparam', 'value').build();

      const href = hateoas.href(request, null, { page: 1 });

      expect(href).toEqual({ href: 'http://tests.local/?page=1' });
    });

    it('And limit is given then appends it to the query', () => {
      const request = HapiRequestMother.complete().addQueryParam('qparam', 'value').build();

      const href = hateoas.href(request, null, { page: 1, limit: 2 });

      expect(href).toEqual({ href: 'http://tests.local/?limit=2&page=1' });
    });

    it('And shoud add query params from request is given then appends it to the new query properly', () => {
      const request = HapiRequestMother.complete()
        .addQueryParam('qparam', 'value')
        .addQueryParam('limit', '10')
        .addQueryParam('page', 2)
        .build();

      const href = hateoas.href(request, null, { page: 1, limit: 2 }, true);

      expect(href).toEqual({ href: 'http://tests.local/?limit=2&page=1&qparam=value' });
    });
  });
});
