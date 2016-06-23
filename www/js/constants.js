//***config
var enableSync = false;
var isNetworkDown = false;
var itConnection = false;
//***config

angular.module('starter')
    .constant('AUTH_EVENTS',{
        notAuthenticated : 'auth-not-authenticated',
        notAuthorized : 'auth-not-authorized',
        LOCAL_TOKEN_KEY : 'yourTokenKey',
        LOCAL_USERNAME_KEY : 'CurrentUserName'
    })
    .constant('USER_ROLES',{
        admin : 'admin-role',
        public : 'public-role'
    })