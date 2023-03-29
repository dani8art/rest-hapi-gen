const Joi = require('joi');

module.exports = {
  /**
   * A hapi-swagger docs for a redirection response.
   */
  redirect: () => {
    return {
      description: 'Redirect to the authentication operation page',
      headers: {
        location: {
          type: 'string',
          description: 'The authentication operation endpoint',
        },
      },
    };
  },

  /**
   * A Joi validation object for a forbidden request error.
   */
  forbidden: () => {
    return Joi.object({
      statusCode: Joi.number().valid(403).required(),
      error: Joi.string().required(),
      message: Joi.string().required(),
    })
      .label('_forbidden_error')
      .description('Forbidden request');
  },

  /**
   * Build a response specification for an internal error.
   */
  internal() {
    return Joi.object({
      statusCode: Joi.number().valid(500).required(),
      error: Joi.string().required(),
      message: Joi.string().required(),
    })
      .label('_internal_error')
      .description('An unexpected internal error response');
  },

  /**
   * Build a response specification for an unauthorized request error.
   */
  unauthorized: () => {
    return Joi.object({
      statusCode: Joi.number().valid(401).required(),
      error: Joi.string().required(),
      message: Joi.string().required(),
      attributes: Joi.object({
        realm: Joi.string().required(),
        error: Joi.string().required(),
      }).label('_unauthorized_error_attributes'),
    })
      .label('_unauthorized_error')
      .description('Unauthorized request');
  },
};
