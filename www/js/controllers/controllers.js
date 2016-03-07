angular.module('starter')

    .controller('AppCtrl', function($scope, $ionicModal, $timeout, AuthService, $ionicPopup,$location,SQLiteService) {

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
        $scope.userPicturethumb = AuthService.picThumb();
        $scope.userPosition = AuthService.position();

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
        //console.log(AuthService.isAuthenticated());
      };

      // Perform the login action when the user submits the login form
      $scope.doLogin = function() {
        AuthService.login($scope.loginData.username, $scope.loginData.password).then(function() {
          //$state.go('app.home', {}, {reload: true});
          //$scope.setCurrentUsername(data.username);
          //console.log(AuthService.isAuthenticated());
          //console.log(AuthService.fullname());
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
        //delete all datas and all tables
        SQLiteService.DeleteAllTables();
        //logout logic
        AuthService.logout();
        checkAuthen();
        $location.path('/news-feed');
      };

      checkAuthen();
    })

    .controller('NewsFeedCtrl', function($scope, $stateParams) {
    })
    .controller('NewsCtrl', function($scope, $stateParams) {
      console.log('news click');
    })
    .controller('CircularLetterCtrl', function($scope, $stateParams) {
    })
    .controller('ProfileCtrl', function($scope, $stateParams) {
    })
    .controller('TestSyncCtrl',function($scope,SyncService,TestSyncSQLite){
        //bind data
        $scope.testSyncDatas = [];
        TestSyncSQLite.GetAll().then(function(response){
          angular.forEach(response.rows,function(value,key){
            $scope.testSyncDatas.push(response.rows[key]);
          });
        });

      //delete data
      $scope.DeleteData = function(clientId){
        if(confirm('You want to delete data clientId : ' + clientId + ' ?')){
            TestSyncSQLite.DeleteById(clientId);
        }
      };
    })
     .controller('TestDetailSyncCtrl',function($scope,$stateParams,TestSyncSQLite,$location){
        var clientId = $stateParams.Id;
        $scope.Mode = '';
        $scope.info = {};
        if(clientId != 0){
            $scope.Mode = 'Edit';
            TestSyncSQLite.GetById(clientId).then(function(response){
                if(response.rows != null && response.rows.length > 0){
                    var result = response.rows[0];
                    $scope.info.clientid = result.clientid;
                    $scope.info.ID = result.ID;
                    $scope.info.field1 = result.field1;
                    $scope.info.field2 = result.field2;
                    $scope.info.field3 = result.field3;
                    $scope.info.TimeStamp = result.TimeStamp;
                    $scope.info.deleted = result.deleted;
                    $scope.info.dirty = result.dirty;
                    $scope.info.ts = result.ts;
                }
            });
        }
        else {
            $scope.Mode = 'Create';
            $scope.info.ts = null;
        }
        
        $scope.SaveData = function(){
            if($scope.Mode == 'Create'){
                console.log($scope.info);
                TestSyncSQLite.Add([$scope.info],true).then(function(){$location.path('/app/testsync');window.location.reload();});
            }
            else{
                console.log($scope.info);
                TestSyncSQLite.Update($scope.info,$scope.info.deleted,true,'clientid',$scope.info.clientid).then(
                    function(){
                        $location.path('/app/testsync');
                        window.location.reload();
                    });
            }
        };

     })
