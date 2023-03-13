const HealthRoute = require('../../lib/route/health-route');

describe('Given a HealthRoute', () => {
  it('When handler is called then it returns healthy data', async () => {
    const path = '/test/path';
    const route = new HealthRoute({ not_used: 'by_now' }, { path });

    const res = await route.handler({ not_used: 'by_now' }, { not_used: 'by_now' });

    expect(res).toEqual({ healthy: true });
  });
});
