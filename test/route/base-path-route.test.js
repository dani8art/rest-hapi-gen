const BasePathRoute = require('../../lib/route/base-path-route');

const HapiRequestMother = require('../mother/hapi-request.mother');
const HapiServerMother = require('../mother/hapi-server.mother');

const server = HapiServerMother.complete().addRoute('/api/tests').build();
const request = HapiRequestMother.complete().build();

describe('Given a BasePathRoute', () => {
  it('When a route is created then handle request and return hateoas links', async () => {
    const route = new BasePathRoute(server, { basePath: '/path' });

    const res = await route.handler(request);

    expect(res).toEqual({
      _links: {
        self: {
          href: 'http://tests.local/path',
        },
        tests: {
          href: 'http://tests.local/api/tests',
        },
      },
    });
  });
});
