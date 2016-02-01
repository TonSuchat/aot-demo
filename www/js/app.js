// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic'])

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
                templateUrl: 'templates/news-feed.html',
                controller: 'NewsFeedCtrl'
              }
            }
          })

          .state('app.home.news', {
            url: '/news',
            views: {
              'news-feed': {
                templateUrl: 'templates/news.html',
                  controller: 'NewsCtrl'
              }
            }
          })

          .state('app.home.circular-letter', {
            url: '/circular-letter',
            views: {
              'circular-letter': {
                templateUrl: 'templates/circular-letter.html',
                controller:'CircularLetterCtrl'
              }
            }
          })

          .state('app.info', {
            url: '/information',
              abstract: true,
            views: {
              'menuContent': {
                templateUrl: 'templates/information.html',
                controller: 'InfoCtrl'
              }
            }
          })
          .state('app.info.finance', {
            url: '/finance',
            views: {
              'finance': {
                templateUrl: 'templates/finance.html',
                controller: 'FinanceCtrl'
              }
            }
          })
          .state('app.info.hr', {
            url: '/hr',
            views: {
              'hr': {
                templateUrl: 'templates/hr.html',
                controller: 'HrCtrl'
              }
            }
          })
          .state('app.profile', {
            url: '/profile',
            views: {
              'hr': {
                templateUrl: 'templates/profile.html',
                controller: 'ProfileCtrl'
              }
            }
          })

          .state('app.directory', {
            url: '/directory',
            views: {
              'menuContent': {
                templateUrl: 'templates/directory.html'
              }
            }
          });
      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/app/home/news-feed');
    });
