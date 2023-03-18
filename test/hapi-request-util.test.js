const HapiRequestUtil = require('../lib/hapi-request-util');
const HapiRequestMother = require('./mother/hapi-request.mother');

describe('Given a HapiRequestUtil', () => {
  describe('When protocol', () => {
    it('And it comes in server info then return it', () => {
      const request = HapiRequestMother.complete().build();

      const protocol = HapiRequestUtil.protocol(request);

      expect(protocol).toBe('http');
    });

    it('And it comes in headers then return it', () => {
      const request = HapiRequestMother.completeOnHeaders().build();

      const protocol = HapiRequestUtil.protocol(request);

      expect(protocol).toBe('http');
    });
  });

  describe('When host', () => {
    it('And it comes in server info then return it', () => {
      const request = HapiRequestMother.complete().build();

      const host = HapiRequestUtil.host(request);

      expect(host).toBe('tests.local');
    });

    it('And it comes in headers then return it', () => {
      const request = HapiRequestMother.completeOnHeaders().build();

      const host = HapiRequestUtil.host(request);

      expect(host).toBe('tests.local');
    });
  });

  describe('When locale', () => {
    it('And it comes in kc query param then return it', () => {
      const request = HapiRequestMother.complete().locale('es').build();

      const locale = HapiRequestUtil.locale(request);

      expect(locale).toBe('es');
    });

    it('And it comes in ui query param then return it', () => {
      const request = HapiRequestMother.complete().locale('es', false).build();

      const locale = HapiRequestUtil.locale(request);

      expect(locale).toBe('es');
    });
  });

  describe('When pagination', () => {
    it('And limit is in query then returns it from query', () => {
      const request = HapiRequestMother.complete().addQueryParam('limit', 2).build();

      const pagination = HapiRequestUtil.pagination(request, {}, 10);

      expect(pagination).toEqual({ count: 10, limit: 2, page: 1 });
    });

    it('And limit is not in query and not pages then returns default limit', () => {
      const request = HapiRequestMother.complete().build();

      const pagination = HapiRequestUtil.pagination(request, null, 10);

      expect(pagination).toEqual({ count: 10, limit: HapiRequestUtil.DEFAULT_PAGE_LIMIT, page: 1 });
    });

    it('And limit is not in query and pages but not limit then returns default limit', () => {
      const request = HapiRequestMother.complete().build();

      const pagination = HapiRequestUtil.pagination(request, {}, 10);

      expect(pagination).toEqual({ count: 10, limit: HapiRequestUtil.DEFAULT_PAGE_LIMIT, page: 1 });
    });

    it('And limit is not in query and pages with limit then returns pages limit', () => {
      const request = HapiRequestMother.complete().build();

      const pagination = HapiRequestUtil.pagination(request, { limit: 2 }, 10);

      expect(pagination).toEqual({ count: 10, limit: 2, page: 1 });
    });

    it('And page is in query then returns query page', () => {
      const request = HapiRequestMother.complete().addQueryParam('page', 2).build();

      const pagination = HapiRequestUtil.pagination(request, null, 10);

      expect(pagination).toEqual({ count: 10, limit: HapiRequestUtil.DEFAULT_PAGE_LIMIT, page: 2 });
    });

    it('And page is not in query then returns page 1', () => {
      const request = HapiRequestMother.complete().build();

      const pagination = HapiRequestUtil.pagination(request, null, 10);

      expect(pagination).toEqual({ count: 10, limit: HapiRequestUtil.DEFAULT_PAGE_LIMIT, page: 1 });
    });
  });
});
