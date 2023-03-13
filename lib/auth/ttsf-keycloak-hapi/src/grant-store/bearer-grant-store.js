class BearerGrantStore {
  constructor() {
    this.name = 'bearer';
  }

  canRetrieveGrantFrom(request) {
    const header = request.headers.authorization;
    if (!header) {
      return false;
    }

    return header.indexOf('bearer ') === 0 || header.indexOf('Bearer ') === 0;
  }

  getGrant(request) {
    if (!this.canRetrieveGrantFrom(request)) {
      return null;
    }

    return { access_token: request.headers.authorization.substring('bearer '.length) };
  }
}

module.exports = BearerGrantStore;
