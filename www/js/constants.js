//***config
var enableSync = false;
var isNetworkDown = false;
var itConnection = false;
var PCGCMToken = 'fY_RbvgA_1Q:APA91bHTBpqf-F9jxwjg_4kUA66zl5daUsf9bUGKtlssSCy8afpC-j9LlAehc9tTPMpLro9dPVJzmQfehVF6AE0Zx0YZ6XQgRJkdoJ2b-ikcIcA3G95sYZtZ_EZqOSO15-WENx9QoVlw';
var employeeFileName = 'employees'
var totalEmployeeFiles = 4;
var onWeb = (window.cordova) ? false : true;
var APPVERSION = '0.0.20';
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