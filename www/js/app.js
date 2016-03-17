// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ngCordova'])

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
    .run(function($ionicPlatform, $ionicPopup) {
        // $ionicPlatform.onHardwareBackButton(function () {
        //     if(true) { // your check here
        //         $ionicPopup.confirm({
        //             title: 'System warning',
        //             template: 'are you sure you want to exit?'
        //         }).then(function(res){
        //             if( res ){
        //                 navigator.app.exitApp();
        //             }
        //         })
        //     }
        // })
    })
    .run(function($ionicPlatform,AUTH_EVENTS,APIService,$http,$q,NotiService,$cordovaDevice){
      $ionicPlatform.ready(function(){
        //call login api
        LogInAPI(AUTH_EVENTS,APIService,$http,$q).then(function(){
          //post to gcm(google cloud messaging) for register device and get token from gcm
          if (window.cordova){
            pushNotification = window.plugins.pushNotification;
            NotiService.Register(pushNotification);  
          }
        });
          
      });
    })
    .run(function($ionicPlatform, SQLiteService, AuthService){
      $ionicPlatform.ready(function(){
        //open db
        SQLiteService.OpenDB();
        //initial all tables
        SQLiteService.InitailTables();
        //bypass login if still loging in.
        AuthService.bypassLogIn();

        // SQLiteService.Execute('select * from userprofile',null).then(function(response){
        //     console.log(response.rows.item);
        //   },
        // function(error){console.log(error);});

        // APIService.httpPost('http://localhost:51754/api/TestSync/UpdateData',{Id:99,field1:"a",field2:"b",field3:"c"},
        //   function(response){console.log(response.data);},function(error){console.log(error);});

        // var apiDatas = {
        //   GetData:{ObjectID:1,SyncMedicalViewModel:{EmpID: '484074', FromDate: '4444', ToDate: '55555'}},
        //   AddData:{},
        //   UpdateData:{}
        // };

        // var tmpJson = {ObjectID:1,MedicalObject:{}};
        // var jsonData = {Id:1,HospType:'รัฐบาล',HospName:'Name'};

        // apiDatas.GetData[Object.keys(apiDatas.GetData)[1]].TS = "9999999";
        // console.log(apiDatas.GetData);

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

    .config(function($stateProvider, $urlRouterProvider) {
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
      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/app/home/news-feed');
    });

function LogInAPI(AUTH_EVENTS,APIService,$http,$q){
  return $q(function(resolve,reject){
    var data = {grant_type:'password',username:'epayment@airportthai.co.th',password:'aotP@ssw0rd'};
    var url = APIService.hostname() + '/Token';
    APIService.httpPost(url,data,
      function(response){
        var result = angular.fromJson(response.data);
        //get token_type("bearer") + one white space and token
        var token = result.token_type + ' ' + result.access_token;
        window.localStorage.setItem(AUTH_EVENTS.LOCAL_TOKEN_KEY, token);
        resolve();
        //set header
        //$http.defaults.headers.common['Authorization'] = token;
        //console.log(token);
      },
      function(error){console.log(error);reject(error);});
  });
};

