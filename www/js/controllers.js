angular.module('starter')

.controller('AppCtrl', function($scope, $ionicModal, $timeout, AuthService, $ionicPopup) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  function checkAuthen(){

    $scope.loginData = {};
    $scope.isAuthen = AuthService.isAuthenticated();
    $scope.fullname = AuthService.fullname();

  }
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
    console.log(AuthService.isAuthenticated());
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    AuthService.login($scope.loginData.username, $scope.loginData.password).then(function() {
      //$state.go('app.home', {}, {reload: true});
      //$scope.setCurrentUsername(data.username);
      console.log(AuthService.isAuthenticated());
      console.log(AuthService.fullname());
      checkAuthen();

      $scope.closeLogin();

    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
    //
    //$ionicHistory.nextViewOptions({
    //  disableBack: true
    //});
  };
  $scope.logout = function () {

    AuthService.logout();

    checkAuthen();
  }
  checkAuthen();
})

.controller('NewsFeedCtrl', function($scope, $stateParams) {
})
.controller('NewsCtrl', function($scope, $stateParams) {
  console.log('news click');
})
.controller('CircularLetterCtrl', function($scope, $stateParams) {
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
  console.log('med detail');
})
.controller('FuelCtrl', function($scope, $stateParams) {
})
.controller('ProfileCtrl', function($scope, $stateParams) {
})
.controller('FinanceCtrl', function($scope, $stateParams) {
})
.controller('HrCtrl', function($scope, $stateParams) {
});
