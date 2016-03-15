angular.module('starter')

    .controller('AppCtrl', function($scope, $ionicModal, $timeout, AuthService, $ionicPopup,$location,SQLiteService) {

      // With the new view caching in Ionic, Controllers are only called
      // when they are recreated or on app start, instead of every page change.
      // To listen for when this page is active (for example, to refresh data),
      // listen for the $ionicView.enter event:
      //$scope.$on('$ionicView.enter', function(e) {
      //});

      //bypass login if still loging in.
      $scope.bypassLogIn = function(){
        AuthService.bypassLogIn().then(function(){
          checkAuthen();
        });
      };

      //$scope.bypassLogIn();

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
    .controller('CircularLetterCtrl', function($scope, $filter, SyncService, CircularSQLite) {

      SyncService.SyncCircular().then(function(){
        CircularSQLite.GetAll().then(function(allData){
          if(allData.rows != null && allData.rows.length > 0){
            CircularSQLite.GetDistinctDate().then(function(distinctDate){
              $scope.Circulars = InitialCirculars(distinctDate,$filter,allData);
            });
          }
        });
      });

    })
    .controller('ProfileCtrl', function($scope, UserProfileSQLite) {
        UserProfileSQLite.GetUserProfile().then(
          function(response){
            if(response.rows != null && response.rows.length > 0){
              var result = response.rows.item(0);
              $scope.profile = {};
              $scope.profile.UserID = result.UserID;
              $scope.profile.FullName = result.PrefixName + ' ' + result.Firstname + ' ' + result.Lastname; 
              $scope.profile.Nickname = (result.Nickname && result.Nickname.length > 0) ? ' (' + result.Nickname + ')' : '';
              $scope.profile.Department = result.Department;
              $scope.profile.Section = result.Section;
              $scope.profile.Position = result.Position;
              $scope.profile.OfficeTel = (result.OfficeTel && result.OfficeTel.length > 0) ? result.OfficeTel : '-';
              $scope.profile.OfficeFax = (result.OfficeFax && result.OfficeFax.length > 0) ? result.OfficeFax : '-';
              $scope.profile.MobilePhone = (result.MobilePhone && result.MobilePhone.length > 0) ? response.MobilePhone : '-';
              $scope.profile.eMailAddress = (result.eMailAddress && result.eMailAddress.length > 0) ? result.eMailAddress : '-';
              $scope.profile.Facebook = (result.Facebook && result.Facebook.length > 0) ? result.Facebook : '-';
              $scope.profile.Line = (result.Line && result.Line.length > 0) ? result.Line : '-';
            };
        })
    })
    .controller('TestSyncCtrl',function($scope,SyncService,TestSyncSQLite){

        $scope.StartSync = function(){
          SyncService.SyncTestSync().then(function(){
            //window.location.reload();
          });  
        };
        
        //bind data
        $scope.testSyncDatas = [];
        TestSyncSQLite.GetAll().then(function(response){
          angular.forEach(response.rows,function(value,key){
            $scope.testSyncDatas.push(response.rows[key]);
          });
        });

      // //delete data
      $scope.DeleteData = function(clientId){
        if(confirm('You want to delete data clientId : ' + clientId + ' ?')){
            //TestSyncSQLite.DeleteById(clientId).then(function(){window.location.reload();});
        }
      };
    })
     .controller('TestDetailSyncCtrl',function($scope,$stateParams,TestSyncSQLite,$location){
        var clientId = $stateParams.Id;
        $scope.Mode = '';
        $scope.info = {};
        if(clientId != 0){
            $scope.Mode = 'Edit';
            TestSyncSQLite.GetByClientId(clientId).then(function(response){
                if(response.rows != null && response.rows.length > 0){
                    var result = response.rows.item(0);
                    $scope.info.clientid = result.clientid;
                    $scope.info.Id = result.Id;
                    $scope.info.field1 = result.field1;
                    $scope.info.field2 = result.field2;
                    $scope.info.field3 = result.field3;
                    $scope.info.TS = result.TS;
                    $scope.info.DL = result.DL;
                    $scope.info.dirty = result.dirty;
                }
            });
        }
        else {
            $scope.Mode = 'Create';
            $scope.info.Id = null;
            $scope.info.ts = null;
            $scope.info.DL = false;
        }
        
        $scope.SaveData = function(){
            if($scope.Mode == 'Create'){
                console.log($scope.info);
                TestSyncSQLite.Add([$scope.info],true).then(function(){
                  $location.path('/app/testsync');window.location.reload();
                });
            }
            else{
                console.log($scope.info);
                TestSyncSQLite.Update($scope.info,true,true).then(
                    function(){
                        $location.path('/app/testsync');
                        window.location.reload();
                    });
            }
        };

     })

function InitialCirculars(distinctCircularDate,$filter,allData){
    var result = [];
    for (var i = 0; i <= distinctCircularDate.rows.length -1; i++) {
        var currentCircularDate = distinctCircularDate.rows.item(i).DocDate;
        allDataArr = ConvertQueryResultToArray(allData);
        var currentDetailsByDate = $filter('filter')(allDataArr,{DocDate:currentCircularDate});   
        if(currentCircularDate.indexOf('/') > -1) currentCircularDate = currentCircularDate.replace(/\//g,'');
        var newData = {};
        newData.circularDate = GetThaiDateByDate($filter,currentCircularDate);
        newData.circularDetails = [];
        for (var z = 0; z <= currentDetailsByDate.length -1; z++) {
            newData.circularDetails.push({link:currentDetailsByDate[z].Link,header:currentDetailsByDate[z].Description,description:currentDetailsByDate[z].DocNumber});    
        };
        result.push(newData);
    };
    return result;
};