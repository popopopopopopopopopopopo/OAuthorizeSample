'use strict';

const users = require('./users');
const clients = require('./clients');
const accessTokens = require('./access_tokens');
const authorizationCodes = require('./authorization_code');

module.exports = {
  users,
  clients,
  accessTokens,
  authorizationCodes,
};