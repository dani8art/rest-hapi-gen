jest.mock('joi');
jest.mock('../../lib/hateoas-links');
jest.mock('../../lib/hapi-server-util');
jest.mock('../../lib/response/builders');

const Joi = require('joi');

Joi.object.mockImplementation((object) => {
  const wrapped = {
    object: object || {},
    stack: ['object'],
  };

  wrapped.__proto__.label = jest.fn().mockImplementation(() => {
    wrapped.stack.push('label');

    wrapped.description = jest.fn().mockImplementation(() => {
      wrapped.stack.push('description');

      return wrapped;
    });

    return wrapped;
  });

  return wrapped;
});

const HateoasLinks = require('../../lib/hateoas-links');
HateoasLinks.href.mockReturnValue('called-hateoas-links-href');

const HapiServerUtil = require('../../lib/hapi-server-util');
HapiServerUtil.hrefTable.mockReturnValue({ tests: 'called-href-table' });

const ResponseBuilder = require('../../lib/response/builders');
ResponseBuilder.errors.internal.mockReturnValue('called-error-internal');

const BasePathRoute = require('../../lib/route/base-path-route');

const HapiRequestMother = require('../mother/hapi-request.mother');
const HapiServerMother = require('../mother/hapi-server.mother');

const server = HapiServerMother.complete().addRoute('/api/tests').build();
const request = HapiRequestMother.complete().build();

describe('Given a BasePathRoute', () => {
  beforeEach(() => jest.clearAllMocks());

  it('When a route is created then handle request and return hateoas links', async () => {
    const route = new BasePathRoute(server, { basePath: '/path' });

    const res = await route.handler(request);

    expect(res).toEqual({ _links: { self: 'called-hateoas-links-href', tests: 'called-href-table' } });
    expect(route.options.response.status[200].object._links.stack.join('.')).toEqual('object.label');
    expect(route.options.response.status[200].stack.join('.')).toEqual('object.label.description');
    expect(route.options.response.status[500]).toEqual('called-error-internal');
  });

  it('When auth is given but it is not enabled then route auth is not enabled', () => {
    const route = new BasePathRoute(server, { basePath: '/path', auth: {} });

    expect(route.options.auth).toBeFalsy();
  });

  it('When auth is given and it is enabled then route auth is set', () => {
    const route = new BasePathRoute(server, { basePath: '/path', auth: { enabled: true } });

    expect(route.options.auth).toEqual({ access: { scope: false } });
  });
});
