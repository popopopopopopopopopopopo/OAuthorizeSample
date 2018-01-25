'use strict';

const passport = require('passport');
const ensurelogin = require('connect-ensure-login');

//トップ
module.exports.index = (req, res) => res.send('OAuth 2.0 Server');

//ログイン処理
module.exports.login = [
    passport.authenticate('local', { successReturnToOrRedirect: '/success', failureRedirect: '/wrong'}),
];

//ログイン後のサンプルコールバック
module.exports.loginedSample = (req,res) => {
    res.json(req.user);
};

//ログアウト処理
module.exports.logout = (req,res)=> {
    //ログアウト
    req.logout();
    //ログアウト後はトップに戻す
    res.redirect('/');
};

module.exports.account = [
    ensurelogin.ensureLoggedIn('/'),
    (req, res) => res.json({ user: req.user }),
];
