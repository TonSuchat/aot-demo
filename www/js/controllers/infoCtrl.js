angular.module('starter')

    .config(function($stateProvider) {
        $stateProvider

            .state('app.info', {
                url: '/information',
                abstract: true,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/info/information.html',
                        controller: 'InfoCtrl'
                    }
                }
            })
            .state('app.info.finance', {
                url: '/finance',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/finance.html',
                        controller: 'FinanceCtrl'
                    }
                }
            })
            .state('app.info.hr', {
                url: '/hr',
                views: {
                    'hr': {
                        templateUrl: 'templates/info/hr.html',
                        controller: 'HrCtrl'
                    }
                }
            })
            .state('app.info.time', {
                url: '/time',
                views: {
                    'hr': {
                        templateUrl: 'templates/info/time.html',
                        controller: 'TimeCtrl'
                    }
                }
            })
            .state('app.info.leave', {
                url: '/leave',
                views: {
                    'hr': {
                        templateUrl: 'templates/info/leave.html',
                        controller: 'LeaveCtrl'
                    }
                }
            })
            .state('app.info.medical', {
                url: '/medical',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/medical.html',
                        controller: 'MedicalCtrl'
                    }
                }
            })
            .state('app.info.medical-detail', {
                url: '/medical-detail',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/medical-detail.html',
                        controller: 'MedicalDetailCtrl'
                    }
                }
            })
            .state('app.info.fuel', {
                url: '/fuel',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/fuel.html',
                        controller: 'FuelCtrl'
                    }
                }
            })
            .state('app.info.fuel-detail', {
                url: '/fuel-detail',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/fuel-detail.html',
                        controller: 'FuelDetailCtrl'
                    }
                }
            })
    })


    .controller('InfoCtrl', function($scope, $stateParams) {
    })
    .controller('TimeCtrl', function($scope, $stateParams) {
    })
    .controller('LeaveCtrl', function($scope, $stateParams) {
    })
    .controller('MedicalCtrl', function($scope, $stateParams) {
    })
    .controller('MedicalDetailCtrl', function($scope, $stateParams) {
    })
    .controller('FuelCtrl', function($scope, $stateParams) {
    })
    .controller('FuelDetailCtrl', function($scope, $stateParams) {
    })
    .controller('FinanceCtrl', function($scope, $stateParams) {
    })
    .controller('HrCtrl', function($scope, $stateParams) {
    });