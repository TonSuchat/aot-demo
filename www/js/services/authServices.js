angular.module('starter')

    .service('AuthService', function($q, $http,AUTH_EVENTS,APIService,UserProfileSQLite) {
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

            // username = token.split('.')[0];
            
            // authToken = token;

            // if (username == '484134') {
            //     fullname = "Danupon Kainongsuang";
            // }
            // if (username == '484074') {
            //     fullname = "Sontaya Wilaijit";
            // }
            if(userData != null){
                isAuthenticated = true;
                fullname = userData.PrefixName + ' ' + userData.Firstname + ' ' + userData.Lastname;
                picThumb = userData.PictureThumb; position = userData.Position;
                successAction();
            }
            else{
                var url = APIService.hostname() + '/ContactDirectory/viewContactPaging';
                var data = {keyword:username,start:1,retrieve:1};
                APIService.httpPost(url,data,
                    function(response){
                        if(response.data == null || response.data.length == 0) return;
                        var result = response.data[0];
                        isAuthenticated = true;
                        fullname = result.PrefixName + ' ' + result.Firstname + ' ' + result.Lastname;
                        picThumb = result.PictureThumb; position = result.Position;
                        //save user data to sqlite db
                        UserProfileSQLite.SaveUserProfile(result);
                        successAction();
                    },
                    function(){});
            }
            // Set the token as header for your requests!
            //$http.defaults.headers.common['X-Auth-Token'] = token;
        }

        function destroyUserCredentials() {
            authToken = undefined;
            username = '';
            isAuthenticated = false;
            //$http.defaults.headers.common['X-Auth-Token'] = undefined;
            $http.defaults.headers.common['Authorization'] = undefined;
            window.localStorage.removeItem(AUTH_EVENTS.LOCAL_TOKEN_KEY);
            window.localStorage.removeItem(AUTH_EVENTS.LOCAL_USERNAME_KEY);
        }

        var login = function(user, pw) {
            
            
            return $q(function(resolve, reject) {

                var url = APIService.hostname() + '/Authen/AuthenUser';
                var data = {username:user,password:pw};
                APIService.ShowLoading();
                APIService.httpPost(url,data,
                    function(response){
                        var result = response.data;
                        if(result == null || result.length == 0) return reject('Login Failed.');
                        if (result) {
                            username = user;
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
            isAuthenticated: function() {return isAuthenticated;},
            username: function() {return (!username && username != null) ? username : window.localStorage.getItem(AUTH_EVENTS.LOCAL_USERNAME_KEY);},
            fullname: function() {return fullname;},
            role: function() {return role;},
            picThumb: function(){return picThumb},
            position: function(){return position},
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