// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
// angular.module('starter', ['ionic','ngCordova','ngMockE2E','btford.socket-io','ionic.rating'])
 angular.module('starter', ['ionic','ngCordova','btford.socket-io','ionic.rating','ui.rCalendar','ionic-datepicker','ngMessages','ion-floating-menu','ion-autocomplete','angular.filter'])

    .run(function($ionicPlatform) {

      $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }

      });
    })
    .run(function($cordovaFile,$cordovaFileOpener2,$ionicPlatform, SQLiteService, AuthService, XMPPService, XMPPApiService, $rootScope, AUTH_EVENTS, APIService, $http, $q, $cordovaNetwork, $ionicPopup,$state, NotiService){
      $ionicPlatform.ready(function(){
        
        //open db
        SQLiteService.OpenDB();
        //initial all tables
        SQLiteService.InitailTables();
        //bypass login if still loging in.
        AuthService.bypassLogIn();

        //log in to api and set header authorization
        APIService.ShowLoading();
        LogInAPI(AUTH_EVENTS,APIService,$http,$q,$cordovaNetwork, $ionicPopup).then(function(){
          APIService.HideLoading();
          //post to gcm(google cloud messaging) for register device and get token from gcm
          if (window.cordova){
            NotiService.Register().then(function(){
              CheckForceLogOut($ionicPopup,APIService,AuthService,$q,$cordovaFile);
            });
          }
          else window.localStorage.setItem('GCMToken',PCGCMToken);

          //ionic resume event
          $ionicPlatform.on('resume', function(){
            CheckForceLogOut($ionicPopup,APIService,AuthService,$q,$cordovaFile);
          });

        });

        window.onbeforeunload = function (event) {
            XMPPService.Disconnect();
        };

        // listen for Online event(mobile)
        $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
          onOnline();
        });

        // listen for Offline event(mobile)
        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
          onOffline();
        });

        //network detect event handles for pc
        if (!window.cordova){
          addEvent(window, 'online', onOnline);
          addEvent(window, 'offline', onOffline);  
        };
        
        function onOnline() {
          if(isNetworkDown){
            console.log('onOnline');
            //set flag enable sync room
            xmppSyncRooms = true;
            isAttempToConnect = true;
            //connect xmpp server
            //if(!xmppTimerIsActive){
            if(!isAttempToConnect){
              isAttempToConnect = true;
              XMPPService.Authentication(window.localStorage.getItem("AuthServices_username"),window.localStorage.getItem("AuthServices_password"));
            }
            //}
            isNetworkDown = false;
          }
        };

        function onOffline() {
          console.log('onOffline');
          XMPPService.Disconnect();
          xmppConnectionIsActive = false;
          isNetworkDown = true;
        };
        
      });
    })
    .run(function($rootScope, $ionicPlatform, $ionicHistory){
      $ionicPlatform.registerBackButtonAction(function(e){
        if ($rootScope.backButtonPressedOnceToExit) {
          ionic.Platform.exitApp();
        }
        else if ($ionicHistory.backView()) {
          $ionicHistory.goBack();
          e.preventDefault();
        }
        else {
          $rootScope.backButtonPressedOnceToExit = true;
          window.plugins.toast.showShortCenter(
            "Press back button again to exit",function(a){},function(b){}
          );
          setTimeout(function(){
            $rootScope.backButtonPressedOnceToExit = false;
          },2000);
        }
        e.preventDefault();
        return false;
      },101);
    })

    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $sceDelegateProvider) {

      $ionicConfigProvider.backButton.text('').icon('ion-chevron-left').previousTitleText(false);

      $sceDelegateProvider.resourceUrlWhitelist(['self', new RegExp('^(http[s]?):\/\/(w{3}.)?youtube\.com/.+$')]);

      $stateProvider

          .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl'
          })

          .state('app.home', {
            url: '/home',
            abstract: true,
            views: {
              'menuContent': {
                templateUrl: 'templates/home.html'
              }
            }
          })

          //aot-home-page
          .state('app.firstpage', {
            url: '/firstpage',
            views:{
              "menuContent":{
                templateUrl: 'templates/firstpage.html',
                controller:'LandingCtrl'
              }
            }
          })

          //initial page
          .state('landing', {
            url: '/landing',
            templateUrl: 'templates/landing.html',
            controller: 'LandingCtrl'
          })

          .state('app.home.news-feed', {
            url: '/news-feed',
            views: {
              'news-feed': {
                templateUrl: 'templates/news/news-feed.html',
                controller: 'NewsFeedCtrl'
              }
            }
          })

          .state('app.home.news', {
            url: '/news',
            views: {
              'news-feed': {
                templateUrl: 'templates/news/news.html',
                  controller: 'NewsCtrl'
              }
            }
          })

          .state('app.home.circular-letter', {
            url: '/circular-letter',
            views: {
              'circular-letter': {
                templateUrl: 'templates/news/circular-letter.html',
                controller:'CircularLetterCtrl'
              }
            }
          })

          .state('app.profile', {
            url: '/profile',
            views: {
              'menuContent': {
                templateUrl: 'templates/profile.html',
                controller: 'ProfileCtrl'
              }
            }
          })
          .state('app.testsync', {
            url: '/testsync',
            views: {
              'menuContent': {
                templateUrl: 'templates/testsync.html',
                controller:'TestSyncCtrl'
              }
            }
          })
          .state('app.testsync-detail', {
            url: '/testsync-detail/:Id',
            views: {
              'menuContent': {
                templateUrl: 'templates/testsync-detail.html',
                controller:'TestDetailSyncCtrl'
              }
            }
          })
          .state('app.stock', {
            url: '/stock',
            views: {
              'menuContent': {
                templateUrl: 'templates/stock.html',
                controller:'StockCtrl'
              }
            }
          })
          .state('app.pmsrooms', {
            url: '/pmsrooms',
            views: {
              'menuContent': {
                templateUrl: 'templates/pm/pms-rooms.html',
                controller:'PrivateMessageRoomsCtrl'
              }
            }
          })
          .state('app.pms-msgs', {
            url: '/pmsmsgs/:roomId',
            views: {
              'menuContent': {
                templateUrl: 'templates/pm/pm-messages.html',
                controller:'PrivateMessagesCtrl'
              }
            }
          })
          .state('app.feedback', {
            url: '/feedback',
            views: {
              'menuContent': {
                templateUrl: 'templates/feedback.html',
                controller:'FeedbackCtrl'
              }
            }
          })
          .state('app.duty', {
            url: '/duty',
            views: {
              'menuContent': {
                templateUrl: 'templates/duty.html',
                controller:'DutyCtrl'
              }
            }
          })
          .state('app.aotlive', {
            url: '/aotlive',
            views: {
              'menuContent': {
                templateUrl: 'templates/aotlive.html',
                controller:'AOTLiveCtrl'
              }
            }
          })
          .state('app.notification_history', {
            url: '/notihistory',
            views: {
              'menuContent': {
                templateUrl: 'templates/notification_history.html',
                controller:'NotiHistoryCtrl'
              }
            }
          })
      // if none of the above states are matched, use this as the fallback
      //$urlRouterProvider.otherwise('/app/home/news-feed');
      $urlRouterProvider.otherwise('/app/firstpage');
    });

// function CheckIsAlreadyHasToken() {
//   if(window.localStorage.getItem('yourTokenKey') != null && window.localStorage.getItem('yourTokenKey').length > 0) return true;
//   else return false;
// };

// function LogInAPI(AUTH_EVENTS,APIService,$http,$q){
//   return $q(function(resolve,reject){

//     //if already has token, return;
//     if(CheckIsAlreadyHasToken){
//       SetAuthorizationHeader($http,window.localStorage.getItem('yourTokenKey'));
//       resolve();
//     } 
//     else{
//       var data = {grant_type:'password',username:'epayment@airportthai.co.th',password:'aotP@ssw0rd'};
//       var url = APIService.hostname() + '/Token';
//       APIService.httpPost(url,data,
//         function(response){
//           var result = angular.fromJson(response.data);
//           //get token_type("bearer") + one white space and token
//           var token = result.token_type + ' ' + result.access_token;
//           console.log(token);
//           window.localStorage.setItem(AUTH_EVENTS.LOCAL_TOKEN_KEY, token);
//           //set header
//           SetAuthorizationHeader($http,token);
//           resolve();
//         },
//         function(error){console.log(error);reject(error);});
//     }
//   });
// };

// function SetAuthorizationHeader($http,value) {
//   //set header
//   $http.defaults.headers.common['Authorization'] = value;
// };