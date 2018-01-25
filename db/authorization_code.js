'use strict';

const codes = {};

module.exports.find = (key, done) => {
   if (codes[key]) return done(null, codes[key]);
   return done(new Error("Code not found."));
};

module.exports.save = (code, clientId, redirectUri, userId, done) => {
    let redirectUri2 = redirectUri + '/?client_id=' + clientId;
    console.log(redirectUri2);
    codes[code] = { clientId, redirectUri2, userId };
    done();
};