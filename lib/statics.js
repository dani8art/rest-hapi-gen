const ActionType = {
  GET_COLLECTION: 'GET_COLLECTION',
  GET_RESOURCE: 'GET_RESOURCE',
  CREATE_RESOURCE: 'CREATE_RESOURCE',
  UPDATE_RESOURCE: 'UPDATE_RESOURCE',
  DELETE_RESOURCE: 'DELETE_RESOURCE',
};

const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

const ActionTypeHttpMethod = {
  [ActionType.GET_COLLECTION]: HttpMethod.GET,
  [ActionType.GET_RESOURCE]: HttpMethod.GET,
  [ActionType.CREATE_RESOURCE]: HttpMethod.POST,
  [ActionType.UPDATE_RESOURCE]: HttpMethod.PUT,
  [ActionType.DELETE_RESOURCE]: HttpMethod.DELETE,
};

module.exports = {
  ActionType,
  HttpMethod,
  ActionTypeHttpMethod,
};
