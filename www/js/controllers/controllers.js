angular.module('starter')

    .controller('AppCtrl', function($scope, $ionicModal, $timeout, AuthService, $ionicPopup,$location,SQLiteService,NotiService) {

      // With the new view caching in Ionic, Controllers are only called
      // when they are recreated or on app start, instead of every page change.
      // To listen for when this page is active (for example, to refresh data),
      // listen for the $ionicView.enter event:
      //$scope.$on('$ionicView.enter', function(e) {
      //});

      $scope.PMNumber = 509;

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
        var currentUserName = $scope.loginData.username;
        AuthService.login($scope.loginData.username, $scope.loginData.password).then(function() {
          //$state.go('app.home', {}, {reload: true});
          //$scope.setCurrentUsername(data.username);
          //console.log(AuthService.isAuthenticated());
          //console.log(AuthService.fullname());
          checkAuthen();
          //update register device -> empid to server
          if(window.localStorage.getItem('GCMToken') != null && window.localStorage.getItem('GCMToken').length > 0) 
            NotiService.StoreTokenOnServer(window.localStorage.getItem('GCMToken'),currentUserName,true);

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
        SQLiteService.DeleteAllTables().then(function(){
          //logout logic
          AuthService.logout();
          checkAuthen();
          $location.path('/news-feed');  
        });
      };

      checkAuthen();
    })

    .controller('NewsFeedCtrl', function($scope, $stateParams, SyncService, NewsSQLite, $ionicPlatform, APIService) {

      $ionicPlatform.ready(function(){
        InitialNewsFeedProcess($scope, $stateParams, SyncService, NewsSQLite, $ionicPlatform, APIService);
      });

      $scope.OpenPDF = function(link){
        window.open(link,'_system','location=no');
      };

      $scope.Refresh = function(){
        InitialNewsFeedProcess($scope, $stateParams, SyncService, NewsSQLite, $ionicPlatform, APIService);
      };

    })
    .controller('NewsCtrl', function($scope, $stateParams) {
      console.log('news click');
    })
    .controller('CircularLetterCtrl', function($scope, $filter, SyncService, CircularSQLite, APIService, $ionicPlatform) {
      $ionicPlatform.ready(function(){

        InitialCircularProcess($scope, $filter, SyncService, CircularSQLite, APIService);

        $scope.Refresh = function(){
          InitialCircularProcess($scope, $filter, SyncService, CircularSQLite, APIService);
        };

        $scope.loadMoreData = function(){
          if ($scope.isfirstLoad) { $scope.isfirstLoad = false; $scope.$broadcast('scroll.infiniteScrollComplete'); return; };
          //start +3
          APIService.ShowLoading();
          $scope.start += $scope.retrieve;
          var result = InitialCirculars($scope.distinctDate,$filter,$scope.allData,$scope.start,$scope.retrieve);
          $scope.Circulars = ($scope.Circulars.length > 0) ? $scope.Circulars.concat(result) : result;
          FinalCircularAction($scope,APIService);
          $scope.haveMoreData = (($scope.start + $scope.retrieve) < $scope.distinctDate.rows.length) ? true : false;
        };

        $scope.OpenPDF = function(link){
          window.open(link,'_system','location=no');
        };

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
     .controller('StockCtrl',function($scope,APIService,$filter){
      
        GetStockData($scope,APIService,$filter);

        $scope.Refresh = function(){
          GetStockData($scope,APIService,$filter);
        };

     })
     

function InitialCirculars(distinctCircularDate,$filter,allData,start,retrieve){
    var result = [];
    // for (var i = 0; i <= retrieve - 1; i++) {
    //     var currentCircularDate = distinctCircularDate.rows.item(i).DocDate;
    //     allDataArr = ConvertQueryResultToArray(allData);
    //     var currentDetailsByDate = $filter('filter')(allDataArr,{DocDate:currentCircularDate});   
    //     if(currentCircularDate.indexOf('/') > -1) currentCircularDate = currentCircularDate.replace(/\//g,'');
    //     var newData = {};
    //     newData.circularDate = GetThaiDateByDate($filter,currentCircularDate);
    //     newData.circularDetails = [];
    //     for (var z = 0; z <= currentDetailsByDate.length -1; z++) {
    //         newData.circularDetails.push({link:currentDetailsByDate[z].Link,header:currentDetailsByDate[z].Description,description:currentDetailsByDate[z].DocNumber});    
    //     };
    //     result.push(newData);
    // };
    var counter = 1;
    var currentIndex = start - 1;
    if(allData.rows != null && distinctCircularDate.rows != null){
      while ((currentIndex < distinctCircularDate.rows.length) && (counter <= retrieve)){
        var currentCircularDate = distinctCircularDate.rows.item(currentIndex).DocDate;
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
        counter++;
        currentIndex++;
      }  
    };
    return result;
};

function FinalCircularAction($scope,APIService){
  APIService.HideLoading();
  $scope.$broadcast('scroll.infiniteScrollComplete');
  $scope.$broadcast('scroll.refreshComplete');
};

function InitialCircularProcess($scope, $filter, SyncService, CircularSQLite, APIService){
  $scope.Circulars = [];
  $scope.haveMoreData = false;
  $scope.isfirstLoad = true;
  $scope.allData;
  $scope.distinctDate;
  $scope.start = 1;
  $scope.retrieve = 3;
  APIService.ShowLoading();
  SyncService.SyncCircular().then(function(){
    CircularSQLite.GetAll().then(function(allData){
      if(allData.rows != null && allData.rows.length > 0){
        $scope.allData = allData;
        CircularSQLite.GetDistinctDate().then(function(distinctDate){
          $scope.distinctDate = distinctDate;
          APIService.ShowLoading();
          $scope.Circulars = InitialCirculars(distinctDate,$filter,allData,$scope.start,$scope.retrieve);
          FinalCircularAction($scope,APIService);
          $scope.haveMoreData = (($scope.start + $scope.retrieve) < $scope.distinctDate.rows.length) ? true : false;
        });
      }
      APIService.HideLoading();
    });
  });
};

function InitialNewsFeedProcess($scope, $stateParams, SyncService, NewsSQLite, $ionicPlatform, APIService){
  $scope.listNews = [];
  APIService.ShowLoading();
  SyncService.SyncNews().then(function(){
    NewsSQLite.GetAll().then(function(allData){
      if(allData.rows != null && allData.rows.length > 0){
          for (var i = 0; i <= allData.rows.length - 1; i++) {
            $scope.listNews.push({link:allData.rows.item(i).FileName,title:allData.rows.item(i).Title});
          };
      }
      FinalCtrlAction($scope,APIService);
    });
  });
};

function FinalCtrlAction($scope,APIService){
  $scope.$broadcast('scroll.refreshComplete');
  APIService.HideLoading();
};

function GetStockData($scope,APIService,$filter){
  var url = APIService.hostname() + '/Stocks/getAOTStockLive';
  APIService.ShowLoading();
  APIService.httpPost(url,null,
    function(response){
      if(response.data != null && response.data.length > 0){
        InitialStockProcess($scope,$filter,response.data[0]);
      }
      else InitialStockProcess($scope,$filter,null);
      FinalCtrlAction($scope,APIService);
    },
    function(error){
      //in case can't get current data, Will not show current time.
      FinalCtrlAction($scope,APIService);
      console.log(error);
    })
};

function InitialStockProcess($scope,$filter,data){
  //green : #0BC70B
  //red : #FF3232
  //gray : gray (in case price is not either up or down)
  $scope.stockInfo = {};
  $scope.stockInfo.price = (data == null) ? '-' : data.Price;
  $scope.stockInfo.priceDif = (data == null) ? '-' : data.Pdiff;
  $scope.stockInfo.pricePercentDif = (data == null) ? '-' : data.Diff;
  //up
  if(data != null && data.Diff.indexOf('+') >= 0) {
    $scope.stockInfo.color = '#0BC70B';
    $scope.stockInfo.type = 'up';
  }
  //down
  else if (data != null && data.Diff.indexOf('-') >= 0){
     $scope.stockInfo.color = '#FF3232'; 
    $scope.stockInfo.type = 'down';
  }
  //not change
  else{
    $scope.stockInfo.color = 'gray'; 
    $scope.stockInfo.type = '';
  }
  $scope.stockInfo.currentDate = (data == null) ? 'ไม่สามารถถึงข้อมูลล่าสุดได้' : GetThaiDateByDate($filter,GetCurrentDate().replace(/\//g,'')) + ' เวลา ' + GetCurrentTime() + ' น.';
};


