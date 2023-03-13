const HapiServerUtil = require('../lib/hapi-server-util');
const HapiServerMother = require('./mother/hapi-server.mother');
const HapiRequestMother = require('./mother/hapi-request.mother');

describe('Given a HapiServerUtil', () => {
  it('When href table is requested then returns', () => {
    const server = HapiServerMother.complete()
      .addRoute('/api/pets')
      .addRoute('/api/tags')
      .addRoute('/api/pets/{identifier}')
      .addRoute('/swaggerui/path.js')
      .addRoute('/api')
      .build();
    const request = HapiRequestMother.complete().build();

    const hrefs = HapiServerUtil.hrefTable(server, request, '/api');

    expect(hrefs).toEqual({
      pets: { href: 'http://tests.local/api/pets' },
      tags: { href: 'http://tests.local/api/tags' },
    });
  });

  it('When href table is requested with no base path then returns', () => {
    const server = HapiServerMother.complete()
      .addRoute('/api/pets')
      .addRoute('/api/tags')
      .addRoute('/api/pets/{identifier}')
      .addRoute('/swaggerui/path.js')
      .addRoute('/api')
      .build();
    const request = HapiRequestMother.complete().build();

    const hrefs = HapiServerUtil.hrefTable(server, request);

    expect(hrefs).toEqual({
      pets: { href: 'http://tests.local/api/pets' },
      tags: { href: 'http://tests.local/api/tags' },
      api: { href: 'http://tests.local/api' },
    });
  });

  describe('When isRoute', () => {
    it('And it the path is registered in the given server then return true', () => {
      const server = HapiServerMother.complete().addRoute('/api/pets').addRoute('/api/tags').build();

      const isRoute = HapiServerUtil.isRoute(server, '/api/pets');

      expect(isRoute).toBeTruthy();
    });

    it('And it the path is not registered in the given server then return false', () => {
      const server = HapiServerMother.complete().addRoute('/api/pets').addRoute('/api/tags').build();

      const isRoute = HapiServerUtil.isRoute(server, '/api/rocks');

      expect(isRoute).toBeFalsy();
    });
  });

  describe('When isRegistered', () => {
    const plugin = { pkg: { name: 'test-plugin' } };
    const pluginPlugin = { plugin: { pkg: { name: 'test-plugin-plugin' } } };

    it('And the plugin is registered with simple pkg in the given server then return true', () => {
      const server = HapiServerMother.complete().addPlugin('test-plugin', plugin).build();

      const isRegistered = HapiServerUtil.isRegistered(server, plugin);

      expect(isRegistered).toBeTruthy();
    });

    it('And the plugin is registered with in plugin pkg in the given server then return true', () => {
      const server = HapiServerMother.complete().addPlugin('test-plugin-plugin', pluginPlugin).build();

      const isRegistered = HapiServerUtil.isRegistered(server, pluginPlugin);

      expect(isRegistered).toBeTruthy();
    });

    it('And the plugin is registered with in plugin pkg in the given server but no name is given then return false', () => {
      const server = HapiServerMother.complete().addPlugin('test-plugin', plugin).build();

      const isRegistered = HapiServerUtil.isRegistered(server, { plugin: {} });

      expect(isRegistered).toBeFalsy();
    });

    it('And the plugin is not registered in the given server then return false', () => {
      const server = HapiServerMother.complete().build();

      const isRegistered = HapiServerUtil.isRegistered(server, pluginPlugin);

      expect(isRegistered).toBeFalsy();
    });
  });
});
