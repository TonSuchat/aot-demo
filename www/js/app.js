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
        $ionicPlatform.onHardwareBackButton(function () {
            if(true) { // your check here
                $ionicPopup.confirm({
                    title: 'System warning',
                    template: 'are you sure you want to exit?'
                }).then(function(res){
                    if( res ){
                        navigator.app.exitApp();
                    }
                })
            }
        })
    })
    .run(function($ionicPlatform,AUTH_EVENTS,APIService,$http){
      $ionicPlatform.ready(function(){
        //call login api
        LogInAPI(AUTH_EVENTS,APIService,$http);
      });
    })
    .run(function($ionicPlatform,SQLiteService,UserProfileSQLite){
      $ionicPlatform.ready(function(){
        //open db
        SQLiteService.OpenDB();
        //initial all tables
        SQLiteService.InitailTables();

        // SQLiteService.ExecuteData('INSERT INTO people (firstname, lastname,deleted,dirty,ts) VALUES (?,?,?,?,?)',['my-firstname2','my-lastname2',true,false,'23/02/2016 03:23:00'],
        // function(response){
        //   console.log(response.rows);
        // },
        // function(error){console.log(error);});

        // SQLiteService.ExecuteData('select * from userprofile',null,
        //   function(response){
        //     //console.log(response);
        //     console.log(response.rows[0]);
        //   },
        //   function(error){console.log(error);});

        // SQLiteService.Execute("select * from timeattendance",null).then(
        //   function(response){
        //   console.log(response);
        // },function(error){console.log(error);});

        
        //UserProfileSQLite.GetLatestTS().then(function(resp){console.log(resp);});
      });
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
          });
      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/app/home/news-feed');
    });

function LogInAPI(AUTH_EVENTS,APIService,$http){
  var data = {grant_type:'password',username:'epayment@airportthai.co.th',password:'aotP@ssw0rd'};
  var url = APIService.hostname() + '/Token';
  APIService.httpPost(url,data,
    function(response){
      var result = angular.fromJson(response.data);
      //get token_type("bearer") + one white space and token
      var token = result.token_type + ' ' + result.access_token;
      window.localStorage.setItem(AUTH_EVENTS.LOCAL_TOKEN_KEY, token);
      //set header
      //$http.defaults.headers.common['Authorization'] = token;
      //console.log(token);
    },
    function(response){console.log(response);});
};

