'use strict';

const passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let BasicStrategy = require('passport-http').BasicStrategy;
let ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
let BearerStragey = require('passport-http-bearer').Strategy;
const db = require('../db');

/**
 * LocalStrategy
 *
 * ユーザーとパスワードによる認証サンプル
 */
passport.use(new LocalStrategy(
    (username, password, done) => {
        console.log('LocalStrategy check in');
        db.users.findByUsername(username, (error, user) =>{
            if(error) return done(error);
            if(!user) return done(null,false);
            if(user.password !== password) return done(null,false);
            return done(null,user);
    });
  }
));

console.log('localStrategy setting on.');

passport.serializeUser((user, done) =>  done(null, user.id));

passport.deserializeUser((id, done) => {
    db.users.findById(id, (error, user) => done(error, user));
});

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients. They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens. The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate. Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header). While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
function verifyClient(clientId, clientSecret, done){
 db.clients.findByClientId(clientId, (error,client)=>{
     if (error) return done(error);
     if (!client) return done(null,false);
     if (client.clientSecret !== clientSecret) return done(null, false);
     return done(null,client);
 });
}

function verifyToken(accessToken, done){
     db.accessTokens.find(accessToken,(error,token) => {
       if(error) return done(error);
       if(!token) return done(null,false);
       if(token.userId){
           //ユーザーIdが存在する場合は、ユーザー認証とみなす
           db.users.findByUsername(token.userId, (error, done)=>{
              if (error) return done(error);
              if (!token) return done(null,false);
              return done(null, user, { scope: '*' });
           });
       }
       else{
           //存在しない場合は、クライアント認証とみなす
           db.clients.findByClientId(token.clientId, (error, client)=>{
              if (error) return done(error);
              if (!client) return done(null,false);
              return done(null, client, { scope: '*' });
           });
       }
     });
}

passport.use(new BasicStrategy(verifyClient));

console.log('BasicStrategy setting on.');

passport.use(new ClientPasswordStrategy(verifyClient));

console.log('ClientPasswordStrategy setting on.');

passport.use(new BearerStragey(verifyToken));

console.log('BearerStragey setting on.');