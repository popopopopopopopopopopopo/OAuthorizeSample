'use strict';

let _ = require('lodash');

const clients = [
    { id: '1', name: 'Samplr', clientId: 'abc123', clientSecret: 'ssh-secret', isTrusted: false },
    { id: '2', name: 'Samplr2', clientId: 'xyz123', clientSecret: 'ssh-password', isTrusted: true },
];

module.exports.findById = (id, done) => {
    console.log(id);
    let g = _.find(clients,c=> c.id === id);
    if(g) return done(null,g);
    return done(new Error('client not found. by id'));
};

module.exports.findByClientId = (clientId, done) => {
    console.log(clientId);
    let g = _.find(clients, c=> c.clientId === clientId);
    if(g) return done(null, g);
    return done(new Error('Client Not Found by clientid '));
};