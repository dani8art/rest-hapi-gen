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
});
