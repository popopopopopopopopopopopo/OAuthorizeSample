'use strict';

const oauth2orize = require('oauth2orize');
const passport = require('passport');
const ensurelogin = require('connect-ensure-login');
const db = require('../db');
const utils = require('../utils');

// Create OAuth 2.0 Server
const authServer = oauth2orize.createServer();

authServer.serializeClient((client, done) => done(null, client.id));

authServer.deserializeClient((id, done)=> {
   db.clients.findById(id, (error, client) => {
      if (error) return done(error);
      return done(null, client);
   });
});

//認証サーバのGrant
authServer.grant(oauth2orize.grant.code(function (client,redirectUri,user,ares,done) {
    let code = utils.getUid(16);
    db.authorizationCodes.save(code, client.id, redirectUri, user.id, (error) => {
       if(error) return done(error);
       return done(null, code);
    });
}));

authServer.grant(oauth2orize.grant.token(function (client,user,ares,done) {
    let token = utils.getUid(256);
    db.accessTokens.save(token, user.id, client.clientId, (error) => {
        if(error) return done(error);
        return done(null, token);
    });
}));

//コードからトークンを取得（変換：Exchange）する処理
authServer.exchange(oauth2orize.exchange.code(function(client, code, redirectUri, done) {
    db.authorizationCodes.find(code, function(error, authCode) {
        if (error) { return done(error); }
        if (client.id !== code.clientId) { return done(null, false); }
        if (redirectUri !== code.redirectUri) { return done(null, false); }

        let token = utils.getUid(256);
        db.accessTokens.save(token, authCode.userId, authCode.clientId, (error)=>{
           if(error) return done(error);
           return done(null,token);
        });
    });
}));

authServer.exchange(oauth2orize.exchange.password((client,username,password,scope,done)=>{
    //Validate the client
    db.clients.findByClientId(client.clientId, (error, localClient) => {
       if(error) return done(error);
       if(!localClient) return done(null,false);
       if(localClient.clientSecret !== client.clientSecret) return done(null,false);

       //Validate the user
       db.users.findByUsername(username, (error, user) => {
           if(error) return done(error);
           if(!user) return done(null,false);
           if(password !== user.password) return done(null, false);
           let token = utils.getUid(256);
           db.accessTokens.save(token, user.id, client.clientId, (error) => {
              if(error) return done(error);
              return done(null, token);
           });
       });
    });
}));

authServer.exchange(oauth2orize.exchange.clientCredentials((client,scope,done)=>{
    //Validate the client
    db.clients.findByClientId(client.clientId,(error,localClient)=>{
       if (error) return done(error);
       if (!localClient) return done(null,false);
       if (localClient.clientSecret !== client.clientSecret) return done(null,false);
       let token = utils.getUid(256);
       db.accessTokens.save(token,null,client.clientId, (error)=> {
          if(error) return done(error);
          return done(null,token);
       });
    });
}));

module.exports.authorization = [
    ensurelogin.ensureLoggedIn(),
    authServer.authorization((clientId, redirectUri, done) => {
        db.clients.findByClientId(clientId, (error, client) => {
            if (error) return done(error);
            // WARNING: For security purposes, it is highly advisable to check that
            //          redirectUri provided by the client matches one registered with
            //          the server. For simplicity, this example does not. You have
            //          been warned.
            console.log("redirectUri is ?");
            console.log(redirectUri);

            return done(null, client, redirectUri);
        });
    }, (client, user, done) => {
        // Check if grant request qualifies for immediate approval

        // Auto-approve
        if (client.isTrusted) return done(null, true);

        db.accessTokens.findByUserIdAndClientId(user.id, client.clientId, (error, token) => {
            // Auto-approve
            if (token) return done(null, true);
            // Otherwise ask user
            return done(null, false);
        });
    }),
    (req, res) => {
        console.log("authentication after process start.");
        req.authorize = { transactionId: req.oauth2.transactionId, user: req.user, client: req.oauth2.client };
        console.log(JSON.stringify(result));
        res.json(result);
    },
];

// User decision endpoint.
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application. Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

exports.decision = [
    ensurelogin.ensureLoggedIn('/'),
    authServer.decision(),
];

// Token endpoint.
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens. Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request. Clients must
// authenticate when making requests to this endpoint.

exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    authServer.token(),
    authServer.errorHandler(),
];