'use strict';

let _ = require('lodash');

const tokens = {};

module.exports.find = (key, done) => {
    if(tokens[key]) return done(null,tokens[key]);
    return done(new Error('token not found.'));
};

module.exports.findByUserIdAndClientId = (userId, clientId, done) => {
    let g = _.find(tokens,x=> x.userId === userId && x.clientId === clientId);
    if(g) return done(null,g);
    return done(new Error('token not found'));
};

module.exports.save = (token, userId, clientId, done) => {
  tokens[token] = { userId, clientId };
  done();
};