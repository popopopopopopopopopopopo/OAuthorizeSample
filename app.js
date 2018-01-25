'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes');
const util = require('./utils');

// Express configuration
const app = express();
app.use(cookieParser());
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorHandler());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// パスポートの設定を反映させる
require('./auth');

app.get('/', routes.login.index);
app.post('/login', routes.login.login);
app.post('/login2', function (req,res,next) {
    console.log("this is Post body test api.");
    console.log("logged in by login2");
    res.json(req.body.username);
});
app.get('/logout', routes.login.logout);
app.get('/account', routes.login.account);

app.get('/authorize', routes.oauth2.authorization);

app.post('/authorize/decision', routes.oauth2.decision);
app.post('/oauth/token', routes.oauth2.token);

app.get('/api/userinfo', routes.user.info);
app.get('/api/clientinfo', routes.client.info);

//uid取得サンプル：get
app.get('/getuid',(req,res,next)=> {
   console.log('uid output start.');
   res.json({ uid: util.getUid(12) });
});

app.get('/testPost', (req, res, next) => {
    let url = "http://localhost:3000/login";

    //TODO: by axios post
});

app.use('/authed', (req,res,next)=>{
    //いいのかわからんけどauthorizeオブジェクトをSessionに保管する
    //クライアント（接続してくるアプリ情報）idはクライアント認証的なAPIを作って格納しておかないとダメかも
    if(req.session){
        req.session.authorize = {};
        let tid = req.sessionID;
        req.session.authorize[tid] = {
            transactionID : req.query.code,
            client : '2',
            req : {
                type : "code"
            },
            redirectURI: '/decisionsuccess'
        };
    }
    console.log(req.query.client_id );
    let result = { code: req.query.code, sessionId : req.sessionID, clientId: req.query.client_id };
    res.json(result);
});

app.use('/success', (req,res,next)=>{
    res.json({ id : req.user.id });
});

app.use('/wrong', (req,res,next)=>{
    res.send("Auth denied.");
});

app.use('/decisionsuccess', (req,res,next)=>{
    res.send("Decision allowed.");
});

module.exports = app;
