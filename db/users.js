'use strict';

let _ = require('lodash');

const users = [
    { id: '1', username:'hoge', password:'secret', name: 'Hoge Hoge' },
    { id: '2', username:'moge', password:'pwd', name: 'Moge Moge' },
];

module.exports.findById = (id, done) => {
    let g = _.find(users, u=> u.id === id);
    if(g) return done(null,g);
    return done(new Error('User Not Found. by id'));
};

module.exports.findByUsername = (username, done) => {
    let g = _.find(users, u=> u.username === username);
    if(g) return done(null,g);
    return done(new Error('User Not Found. by username'));
};