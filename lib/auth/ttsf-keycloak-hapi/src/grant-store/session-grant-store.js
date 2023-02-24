const Hoek = require('@hapi/hoek');

const DEAFULT_SESSION_KEY = 'kc_auth_grant';

class SessionGrantStore {
  constructor(options = {}) {
    this.options = Hoek.applyToDefaults({ key: DEAFULT_SESSION_KEY }, options);
    this.name = 'session';
  }

  canRetrieveGrantFrom(request) {
    return !!this.getGrant(request);
  }

  getGrant(request) {
    return request.yar.get(this.options.key);
  }

  saveGrant(request, grant) {
    request.yar.set(this.options.key, grant);
  }

  clearGrant(request) {
    request.yar.reset();
  }
}

module.exports = SessionGrantStore;
module.exports.DEAFULT_SESSION_KEY = DEAFULT_SESSION_KEY;
