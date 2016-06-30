angular.module('starter')

    .service('AuthService', function($q, $http,AUTH_EVENTS,APIService,UserProfileSQLite,PMSubscribeSQLite,XMPPService,XMPPApiService) {
        //var LOCAL_TOKEN_KEY = 'yourTokenKey';
        var username = '';
        var isAuthenticated = false;
        var role = '';
        var authToken,fullname,picThumb,position;

        function loadUserCredentials() {
            var token = window.localStorage.getItem(AUTH_EVENTS.LOCAL_TOKEN_KEY);
            if (token) {
                useCredentials(token);
            }
        }

        function storeUserCredentials() {
            //window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
            useCredentials();
        }

        function useCredentials(successAction,userData) {

            //bypass login
            if(userData != null){
                console.log('bypass-login');
                isAuthenticated = window.localStorage.setItem("AuthServices_isAuthenticated", true); //true;
                var nickname = (userData.Nickname && userData.Nickname != null) ? '(' + userData.Nickname + ')' : '';
                window.localStorage.setItem("AuthServices_fullname", userData.PrefixName + ' ' + userData.Firstname + ' ' + userData.Lastname + nickname); //userData.PrefixName + ' ' + userData.Firstname + ' ' + userData.Lastname;
                window.localStorage.setItem("AuthServices_picThumb", userData.PictureThumb); //userData.PictureThumb; 
                window.localStorage.setItem("AuthServices_position", userData.Position); //userData.Position;
                //connect xmpp server
                XMPPService.Authentication(window.localStorage.getItem("AuthServices_username"),window.localStorage.getItem("AuthServices_password"));
                //enable xmpp maintain timer
                XMPPService.TimerMaintainConnection();
                successAction();
            }
            //normal login
            else{
                console.log('normal-login');
                var url = APIService.hostname() + '/ContactDirectory/viewContactPaging';
                var data = {keyword:username,start:1,retrieve:1};
                APIService.httpPost(url,data,
                    function(response){
                        if(response.data == null || response.data.length == 0) return;
                        var result = response.data[0];
                        isAuthenticated = window.localStorage.setItem("AuthServices_isAuthenticated", true); //true;
                        var nickname = (result.Nickname && result.Nickname != null) ? '(' + result.Nickname + ')' : '';
                        window.localStorage.setItem("AuthServices_fullname", result.PrefixName + ' ' + result.Firstname + ' ' + result.Lastname + nickname); //result.PrefixName + ' ' + result.Firstname + ' ' + result.Lastname;
                        window.localStorage.setItem("AuthServices_picThumb", result.PictureThumb); //result.PictureThumb; 
                        window.localStorage.setItem("AuthServices_position", result.Position); //result.Position;
                        //save user data to sqlite db
                        UserProfileSQLite.SaveUserProfile(result);
                        //convert picthumb to base64
                        ConvertImgPNGToBase64(result.PictureThumb,function(base64){
                            if(base64 && base64.length > 0){
                                //save user data to pmsubscribe
                                var data = {Empl_Code:username,Firstname:result.Firstname,Lastname:result.Lastname,PictureThumb:base64};
                                PMSubscribeSQLite.Add([data]);
                            }
                        });
                        //check if user existed then connect xmpp server ,else create user and connect xmpp server
                        XMPPApiService.CheckAndCreateUserIfNotExist({username:window.localStorage.getItem("AuthServices_username"),password:window.localStorage.getItem("AuthServices_password"),name:window.localStorage.getItem('AuthServices_fullname')}).then(function(response){
                            if(response){
                                //update openfire password same as AD password
                                XMPPApiService.ChangePassword(username,window.localStorage.getItem("AuthServices_password")).then(function(response){
                                  if(response){
                                    console.log('update-password-openfire');
                                    //set flag enable sync room
                                    xmppSyncRooms = true;
                                    //connect xmpp
                                    XMPPService.Authentication(window.localStorage.getItem("AuthServices_username"),window.localStorage.getItem("AuthServices_password"));
                                    //enable xmpp maintain timer
                                    XMPPService.TimerMaintainConnection();
                                  }
                                });
                            }
                        });
                        successAction();
                    },
                    function(error){console.log(error);successAction();});
            }
            // Set the token as header for your requests!
            //$http.defaults.headers.common['X-Auth-Token'] = token;
        }

        function destroyUserCredentials() {
            authToken = undefined;
            username = '';
            isAuthenticated = false;
            //$http.defaults.headers.common['X-Auth-Token'] = undefined;
            //$http.defaults.headers.common['Authorization'] = undefined;
            ClearAllUserLocalStorage(AUTH_EVENTS);

            // window.localStorage.removeItem(AUTH_EVENTS.LOCAL_TOKEN_KEY);
            // window.localStorage.removeItem(AUTH_EVENTS.LOCAL_USERNAME_KEY);
        }

        var login = function(user, pw) {
            
            
            return $q(function(resolve, reject) {
                if(!user || user.length == 0 || !pw || pw.length == 0){
                    APIService.HideLoading();
                    return reject('Login Failed.');
                };
                var url = APIService.hostname() + '/Authen/AuthenUser';
                var data = {username:user,password:pw};
                APIService.ShowLoading();
                APIService.httpPost(url,data,
                    function(response){
                        var result = response.data;
                        if(result == null || result.length == 0) return reject('Login Failed.');
                        if (result._successField) {
                            username = user;
                            window.localStorage.setItem("AuthServices_username", user);
                            window.localStorage.setItem("AuthServices_password", pw);
                            window.localStorage.setItem(AUTH_EVENTS.LOCAL_USERNAME_KEY, username);
                            useCredentials(function () { APIService.HideLoading(); resolve('Login success.'); },null);
                        }
                        else {
                            APIService.HideLoading();
                            reject('Login Failed.');
                        }
                    },
                    function(response){});

                // if ((user == '484134' && pw == '1') || (user == '484074' && pw == '1')) {
                //     // Make a request and receive your auth token from your server

                //     storeUserCredentials(window.localStorage[AUTH_EVENTS.LOCAL_TOKEN_KEY]);
                //     resolve('Login success.');
                // } else {
                //     reject('Login Failed.');
                // }     
            });
        };

        var bypassLogIn = function(){
            return $q(function(resolve, reject) {
                UserProfileSQLite.GetUserProfile().then(
                    function(response){
                        if(response.rows != null && response.rows.length > 0){
                            username = response.rows.item(0).UserID;
                            useCredentials(function(){resolve();},response.rows.item(0));
                        }
                        resolve();
                    },
                    function(error){console.log(error);reject(error);})    
            });
        };

        var logout = function() {
            console.log('service logout');
            //disconnect xmpp
            XMPPService.Disconnect(true);
            destroyUserCredentials();
        };

        var isAuthorized = function(authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
        };

        //loadUserCredentials();

        return {
            login: login,
            logout: logout,
            isAuthorized: isAuthorized,
            isAuthenticated: function() {return window.localStorage.getItem("AuthServices_isAuthenticated");}, //isAuthenticated;
            username: function() {return (!username && username != null && username.length > 0) ? username : window.localStorage.getItem(AUTH_EVENTS.LOCAL_USERNAME_KEY);},
            fullname: function() {return window.localStorage.getItem("AuthServices_fullname");}, //fullname;
            role: function() {return role;},
            picThumb: function(){return window.localStorage.getItem("AuthServices_picThumb");}, //picThumb
            position: function(){return window.localStorage.getItem("AuthServices_position");}, //position
            bypassLogIn: bypassLogIn
        };
    })


    .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        return {
            responseError: function (response) {
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized
                }[response.status], response);
                return $q.reject(response);
            }
        };
    })
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    });


    function ClearAllUserLocalStorage(AUTH_EVENTS){
        //window.localStorage.removeItem(AUTH_EVENTS.LOCAL_TOKEN_KEY);
        window.localStorage.removeItem(AUTH_EVENTS.LOCAL_USERNAME_KEY);
        window.localStorage.removeItem("AuthServices_isAuthenticated");
        window.localStorage.removeItem("AuthServices_fullname");
        window.localStorage.removeItem("AuthServices_picThumb");
        window.localStorage.removeItem("AuthServices_position");
        window.localStorage.removeItem("AuthServices_username");
        window.localStorage.removeItem("AuthServices_password");
    };