angular.module('starter')

    .controller('LandingCtrl',function($scope, $ionicPlatform, $http, $q, APIService, $state, AUTH_EVENTS, NotiService, $cordovaNetwork, $ionicPopup, $cordovaFile, $ionicNavBarDelegate, $rootScope, $ionicHistory){
      
      $ionicPlatform.ready(function(){
        $ionicNavBarDelegate.showBackButton(true);
        RegisterBackButton($ionicPlatform,$rootScope,$ionicHistory);
        APIService.HideLoading();
      });

    })

    .controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, AuthService, $ionicPopup, $location, $ionicHistory, SQLiteService, NotiService, SyncService, $cordovaNetwork, APIService, $rootScope, $ionicPlatform, $q, $cordovaFile, $cordovaDevice, $filter, AUTH_EVENTS, $http) {

      // With the new view caching in Ionic, Controllers are only called
      // when they are recreated or on app start, instead of every page change.
      // To listen for when this page is active (for example, to refresh data),
      // listen for the $ionicView.enter event:
      //$scope.$on('$ionicView.enter', function(e) {
      //});

      $ionicPlatform.ready(function(){
        // if access with not support browser will end process
        if(CheckBrowserIsNotChrome()) return;
        
        //check open application in mobile browser?
        CheckOpenApplicationOnMobileDevice($q,APIService,$ionicPopup);

        APIService.ShowLoading();
        //Login api
        LogInAPI(AUTH_EVENTS,APIService,$http,$q,$cordovaNetwork, $ionicPopup).then(function(){
          APIService.HideLoading();
          //check is server released new version? if have new version then confirm user to update on each store
          CheckDeviceIsValid(APIService,$q,window.localStorage.getItem('GCMToken')).then(function(response){
            if(response != null && response.data != null){
              // //check the store have newest version?
              // CheckUpdateNewestVersion($q,$cordovaDevice,$ionicPopup,APIService,response.data.LastestVersion);
            }
          });
          //check is new version? if yes then popup and alter table
          CheckIsUpdateVersion($q,SQLiteService,APIService,$ionicPopup);
          //authen
          $rootScope.$broadcast('checkAuthen', null);
          //post to gcm(google cloud messaging) for register device and get token from gcm
          if (window.cordova){
            NotiService.Register().then(function(){
              CheckForceLogOut($ionicPopup,APIService,AuthService,$q,$cordovaFile,$cordovaDevice);
            });
          }
          //else window.localStorage.setItem('GCMToken',PCGCMToken);
          else{
            //register gcm for desktop
            NotiService.DesktopRegister().then(function(){});
          }
          //bypass login if still loging in.
          AuthService.bypassLogIn();
        });

        $scope.onWeb = onWeb;
        $scope.noInternet = false;
        $scope.PMNumber = 509;
        GetAppVersion($q).then(function(response){$scope.version = response;});

        // Form data for the login modal
        $scope.$on('checkAuthen',function(event,data){
          $scope.loginData = {};
          $scope.isAuthen = AuthService.isAuthenticated();
          $scope.fullname = AuthService.fullname();
          $scope.userPicturethumb = AuthService.picThumb();
          $scope.userPosition = AuthService.position();
          //bind menus
          $scope.InitialMenus($scope.isAuthen,data);
        });

        $scope.InitialMenus = function(isAuthen,loginComplete){
          $scope.menus = [];
          if(isAuthen){
            $scope.menus.push({link:'#/app/selfservice',text:'Self Services',icon:'ion-ios-person'});
            $scope.menus.push({link:'#/app/information/finance',text:'ตรวจสอบข้อมูล',icon:'ion-information'});
            $scope.menus.push({link:'#/app/directory?pmroomid=0',text:'สมุดโทรศัพท์',icon:'ion-android-call'});
            if(!onWeb) $scope.menus.push({link:'#/app/qrcode',text:'QR-Code',icon:'ion-qr-scanner'});
            $scope.menus.push({link:'#/app/duty',text:'จัดการเวร',icon:'ion-ios-body-outline'});
            $scope.menus.push({link:'#/app/notihistory',text:'ประวัติแจ้งเตือน',icon:'ion-android-refresh'});
            if(loginComplete == null){
              //post to get MenuNotSeen to remove it.
              APIService.ShowLoading();
              var url = APIService.hostname() + '/DeviceRegistered/DisplayMenu';
              var data = {Empl_Code:window.localStorage.getItem('CurrentUserName')};
              APIService.httpPost(url,data,function(response){
                if(response != null){
                  for (var i = 0; i <= response.data.length - 1; i++) {
                    var currentMenuName = response.data[i].MenuName;
                    for (var z = 0; i <= $scope.menus.length - 1; z++) {
                      if(currentMenuName == $scope.menus[z].text){
                        $scope.menus.splice(z,1);
                        break;
                      }
                    };
                  };
                }
                APIService.HideLoading();
              },function(error){console.log(error);APIService.HideLoading();});
            }
          }
          $scope.menus.push({link:'#/app/home/circular-letter',text:'ข่าวสาร ทอท.',icon:'ion-clipboard'});
          $scope.menus.push({link:'#/app/stock',text:'ราคาหุ้น',icon:'ion-ios-pulse-strong'});
          $scope.menus.push({link:'#/app/aotlive',text:'AOT-Live',icon:'ion-social-youtube'});
          $scope.menus.push({link:'#/app/feedback',text:'เสนอความคิดเห็น',icon:'ion-paper-airplane'});
          $scope.menus.push({link:'#/app/help',text:'ช่วยเหลือ',icon:'ion-help'});
        };

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
          if(!CheckNetwork($cordovaNetwork)) {
            OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
            $scope.noInternet = true;
          };
          //console.log(AuthService.isAuthenticated());
        };

        // Perform the login action when the user submits the login form
        $scope.doLogin = function(form) {
          if(form.$valid) {
            var currentUserName = $scope.loginData.username;
            var gcmToken = window.localStorage.getItem('GCMToken'); //(window.cordova) ? (window.localStorage.getItem('GCMToken') == null ? '' : window.localStorage.getItem('GCMToken')) : PCGCMToken;
            //check device is jailbreak or root
            CheckDeviceIsJailbreakOrRoot($q,$cordovaDevice).then(function(response){
              if(!response){
                //check has permission to manage files?
                CreateFileCheckPermission($cordovaFile,$q,APIService).then(function(response){
                  if(response != null && response){
                    CheckDeviceIsValid(APIService,$q,gcmToken).then(function(response){
                      if(response != null){
                        if(response.status == 500){
                          var alertPopup = $ionicPopup.alert({
                            title: 'ไม่สามารถเข้าสู่ระบบได้',
                            template: 'โปรดเข้าสู่ระบบอีกครั้ง!'
                          });
                        }
                        else if(response.data.RegistAction){
                          //check employee version with localstorage
                          CheckEmployeeVersion($q,APIService,$cordovaFile,response.data.EmpVer);
                          AuthService.login($scope.loginData.username, $scope.loginData.password).then(function() {
                            $rootScope.$broadcast('checkAuthen', true);
                            //update register device -> empid to server
                            if(window.localStorage.getItem('GCMToken') != null && window.localStorage.getItem('GCMToken').length > 0) {
                              NotiService.StoreTokenOnServer(window.localStorage.getItem('GCMToken'),currentUserName,true);
                            }
                            //check pin is exist?
                            CheckPINIsExist($q,APIService).then(function(response){
                              if(!response){
                                //redirect to set pin for the first time
                                IonicAlert($ionicPopup,'ต้องตั้งค่า PIN ก่อนใช้งาน',function(){
                                  $scope.closeLogin();
                                  window.location = '#/app/helppinsetting?returnURL=firstpage&hideButton=true';
                                });
                              }
                              else{
                                //bind full menus
                                $scope.InitialMenus(true);
                                $scope.closeLogin();    
                              }
                            })

                            //save login date to local storage for check expire to force logout(security process)
                            var currentDate = new Date();
                            window.localStorage.setItem('lastLogInDate',+currentDate);

                          }, function(err) {
                            console.log(err);
                            if(err.status == 200){
                              var alertPopup = $ionicPopup.alert({
                                title: err.data,
                                template: 'รหัสพนักงาน/รหัสผ่านไม่ถูกต้อง!'
                              });
                            }
                          });
                        }
                        else{
                          var alertPopup = $ionicPopup.alert({
                            title: 'ไม่สามารถเข้าสู่ระบบได้',
                            template: 'อุปกรณ์ถูกระงับการใช้งาน!'
                          });
                        }
                      }
                    });
                  }
                  else{
                    var alertPopup = $ionicPopup.alert({
                      title: 'ไม่สามารถเข้าสู่ระบบได้',
                      template: 'ต้องทำการอนุญาติให้เข้าถึงไฟล์ได้!'
                    });
                  }
                });
              }
              else{
                IonicAlert($ionicPopup,'อุปกรณ์ของคุณไม่ปลอดภัย(Jailbreak/Root)!',function(){});
              }
            });
            return;
          }
        };

        $scope.logout = function () {
          //if no internet connection
          if(!CheckNetwork($cordovaNetwork)) return;
          else{
            AuthService.logout(false).then(function(response){
              // //reload set default theme
              //if(response) window.location.reload();
            });
          }
        };
 
      });

    })

    .controller('NewsFeedCtrl', function($scope, $stateParams, SyncService, NewsSQLite, $ionicPlatform, APIService, $rootScope, $cordovaNetwork, $ionicPopup, $cordovaFile,$cordovaFileOpener2,$q) {

      $ionicPlatform.ready(function(){
        InitialNewsFeedProcess($scope, $stateParams, SyncService, NewsSQLite, $ionicPlatform, APIService);
      });

      CheckNeedToReload($rootScope,'/news-feed');

      $scope.OpenPDF = function(Id){
        //window.open(link,'_system','location=no');
        var url = APIService.hostname() + '/AOTNews/PdfNews';
        var data = {Id:Id};
        var fileName = 'AOTNews';
        DisplayPDF($q,$cordovaFile,$cordovaFileOpener2,APIService,url,data,fileName);
      };

      $scope.Refresh = function(){
        //if no internet connection
        if(!CheckNetwork($cordovaNetwork)){
            OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
            FinalCtrlAction($scope,APIService);
        }
        else InitialNewsFeedProcess($scope, $stateParams, SyncService, NewsSQLite, $ionicPlatform, APIService);
      };

    })
    .controller('NewsCtrl', function($scope, $stateParams) {
      console.log('news click');
    })
    .controller('CircularLetterCtrl', function($scope, $filter, SyncService, CircularSQLite, APIService, $ionicPlatform, $rootScope, $cordovaNetwork, $ionicPopup, $cordovaFile,$cordovaFileOpener2,$q) {
      $ionicPlatform.ready(function(){

        InitialCircularProcess($scope, $filter, SyncService, CircularSQLite, APIService);

        $scope.Refresh = function(){
          //if no internet connection
          if(!CheckNetwork($cordovaNetwork)){
              OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
              FinalCtrlAction($scope,APIService);
          }
          else InitialCircularProcess($scope, $filter, SyncService, CircularSQLite, APIService);
        };

        $scope.loadMoreData = function(){
          if ($scope.isfirstLoad) { $scope.isfirstLoad = false; $scope.$broadcast('scroll.infiniteScrollComplete'); return; };
          //start +10
          APIService.ShowLoading();
          $scope.start += $scope.retrieve;
          //var result = InitialCirculars($scope.distinctDate,$filter,$scope.allData,$scope.start,$scope.retrieve);
          var result = InitialCirculars($scope.allData,$scope.start,$scope.retrieve);
          $scope.Circulars = ($scope.Circulars.length > 0) ? $scope.Circulars.concat(result) : result;
          FinalCircularAction($scope,APIService);
          $scope.haveMoreData = (($scope.start + $scope.retrieve) < $scope.allData.length) ? true : false;
        };

        $scope.max = function(arr){
          return $filter('min')
            ($filter('map')(arr, '-OrderField'));
        };

        $scope.OpenPDF = function(Id){
          //window.open(link,'_system','location=no');
          var url = APIService.hostname() + '/CircularLetter/PdfDocCir';
          var data = {Id:Id};
          var fileName = 'circular-letter';
          DisplayPDF($q,$cordovaFile,$cordovaFileOpener2,APIService,url,data,fileName);
        };

        $scope.GetThaiDateByDate = function(inputDate){
          return GetThaiDateByDate($filter,inputDate);
        };

      });

      CheckNeedToReload($rootScope,'/circular-letter');
      
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
    .controller('StockCtrl',function($scope,APIService,$filter,$cordovaNetwork,$ionicPopup){
        
        //if no internet connection
        if(!CheckNetwork($cordovaNetwork)){
            OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
        };

        GetStockData($scope,APIService,$filter);

        $scope.Refresh = function(){
          //if no internet connection
          if(!CheckNetwork($cordovaNetwork)){
              OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
              FinalCtrlAction($scope,APIService);
          }
          else GetStockData($scope,APIService,$filter);
        };

    })
    .controller('FeedbackCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup,$location){
      // set the rate and max variables
      $scope.rating = {};
      $scope.rating.rate = 5;
      $scope.feedbackMSG = '';
      $scope.noInternet = false;

      //if no internet connection
      if(!CheckNetwork($cordovaNetwork)){
        $scope.noInternet = true;
        OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
      };
      
      $scope.sendFeedback = function(){
        var emplcode = (window.localStorage.getItem('CurrentUserName') == null ? '' : window.localStorage.getItem('CurrentUserName'));
        var url = APIService.hostname() + '/UserFeedbacks/Feedback';
        var data = {Msg:$scope.feedbackMSG,Rating:$scope.rating.rate,Empl_Code:emplcode};
        APIService.ShowLoading();
        APIService.httpPost(url,data,
          function(response){
            APIService.HideLoading();
            if(response != null && response.data.length > 0){
              IonicAlert($ionicPopup,'ระบบได้ส่งความคิดเห็นของท่านแล้ว ทางทีมงาน สสน.ฝรส.ขอขอบคุณที่ร่วมแสดงความคิดเห็น ให้เราได้นำไปปรับปรุงและพัฒนาต่อไป',function(){$location.path('/app/firstpage'); });
            }
          },
          function(error){APIService.HideLoading();console.log(error);});
      };

    })
    
    .controller('AOTLiveCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup){
      $scope.noInternet = false;
      //if no internet connection
      if(!CheckNetwork($cordovaNetwork)){
        $scope.noInternet = true;
        OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
      }
      else{
        //get youtube url
        var url = APIService.hostname() + '/AOTLiveConfig/AOTLive';
        var data = {ConfigKeys:'AOTLive1'};
        APIService.ShowLoading();
        APIService.httpPost(url,data,
          function(response){
            if(response != null && response.data != null) $scope.youtubeURL = response.data + '?rel=0';
            else $scope.youtubeURL = '';
            APIService.HideLoading();
          },
          function(error){
            APIService.HideLoading();
            IonicAlert($ionicPopup,'ไม่พบ URL/ลองใหม่อีกครั้ง',null);
        });
      }

    })

    .controller('NotiHistoryCtrl',function($scope,$cordovaNetwork,SyncService,APIService,$ionicPopup,NotiHistorySQLite,$ionicPlatform,$filter){

      $ionicPlatform.ready(function() {

        APIService.ShowLoading();
        //have internet connection
        if(CheckNetwork($cordovaNetwork)){
            SyncService.SyncNotiHistory().then(function(){
                InitialNotiHistory();
            });
        }
        else{
            //no internet connection
            InitialNotiHistory();  
        }

        $scope.Refresh = function(){
          //if no internet connection
          if(!CheckNetwork($cordovaNetwork)){
              OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
              FinalActionInfo($scope,APIService);
          }
          else{
            APIService.ShowLoading();
            SyncService.SyncNotiHistory().then(function(){
                InitialNotiHistory();
            });  
          }
        };

        $scope.Redirect = function(url){
          if(!url || url.length <= 0) return;
          //use ProcessRedirect method on NotiService
          ProcessRedirect(url);
        };

        function InitialNotiHistory () {
          $scope.AllData = [];
          $scope.NotiHistoryDetails = [];
          NotiHistorySQLite.GetNotiHistories().then(function(response){
            if(response != null){
              var result = ConvertQueryResultToArray(response);
              angular.forEach(result,function(value,key){
                var eachNotiHistory = {};
                eachNotiHistory.NotiType = value.NotiType;
                eachNotiHistory.NotiTypeText = GetNotiTypeText(value.NotiType);
                eachNotiHistory.Priority = GetPriorityText(value.NotiPriority);
                eachNotiHistory.Message = value.Message;
                eachNotiHistory.MenuPath = value.MenuPath
                eachNotiHistory.NotiTime = GetThaiDateTimeByDate($filter,value.NotiTime);
                eachNotiHistory.CategoryName = (value.NotiType != 3 ? null : GetCategoryNameByMenuPath(value.MenuPath));
                eachNotiHistory.DocuemntId = (value.NotiType != 3 ? null : GetDocumentIdByMenuPath(value.MenuPath));
                $scope.NotiHistoryDetails.push(eachNotiHistory);
              });
              FinalActionInfo($scope,APIService);
            }
            else FinalActionInfo($scope,APIService);
          })
        };

        function GetNotiTypeText (notiType) {
          switch(+notiType) {
            case 1:
                return 'ข่าวประชาสัมพันธ์';
                break;
            case 2:
                return 'ข้อมูลด้านการเงิน';
                break;
            case 3:
                return 'รออนุมัติ/รับทราบ';
                break;
            case 4:
                return 'แจ้งเตือน';
                break;
            case 9:
                return 'PrivateMessage';
                break;
          };
        };

        function GetPriorityText (priority) {
          switch(+priority) {
            case 1:
                return 'ปกติ';
                break;
            case 2:
                return 'ด่วน';
                break;
            case 3:
                return 'ด่วนมาก';
                break;
            case 4:
                return 'ด่วนที่สุด';
                break;
          };
        };

        function GetCategoryNameByMenuPath(menuPath){
          var str = menuPath.split('/');
          var categoryId = str[2];
          switch(+categoryId){
            case 1:
              return 'แลก/แทนเวร';
              break;
            case 2:
                return 'ขอทำบัตรพนักงาน';
                break;
            case 3:
                return 'ลงเวลาทำงาน';
                break;
            case 4:
                return 'บันทึกลาหยุดงาน';
                break;
            default:
                return '';
          }
        };

        function GetDocumentIdByMenuPath (menuPath) {
          var str = menuPath.split('/');
          return str[3];
        };

      });

    })
 

// function InitialCirculars(distinctCircularDate,$filter,allData,start,retrieve){
//     var result = [];
//     var counter = 1;
//     var currentIndex = start - 1;
//     if(allData.rows != null && distinctCircularDate.rows != null){
//       while ((currentIndex < distinctCircularDate.rows.length) && (counter <= retrieve)){
//         var currentCircularDate = distinctCircularDate.rows.item(currentIndex).DocDate;
//         allDataArr = ConvertQueryResultToArray(allData);
//         var currentDetailsByDate = $filter('filter')(allDataArr,{DocDate:currentCircularDate});   
//         if(currentCircularDate.indexOf('/') > -1) currentCircularDate = currentCircularDate.replace(/\//g,'');
//         var newData = {};
//         newData.circularDate = GetThaiDateByDate($filter,currentCircularDate);
//         newData.circularDetails = [];
//         for (var z = 0; z <= currentDetailsByDate.length -1; z++) {
//             //newData.circularDetails.push({link:currentDetailsByDate[z].Link,header:currentDetailsByDate[z].Description,description:currentDetailsByDate[z].DocNumber});    
//             newData.circularDetails.push({Id:currentDetailsByDate[z].Id,header:currentDetailsByDate[z].Description,description:currentDetailsByDate[z].DocNumber});    
//         };
//         result.push(newData);
//         counter++;
//         currentIndex++;
//       }  
//     };
//     return result;
// };

function InitialCirculars(allData,start,retrieve){
    var result = [];
    var counter = 1;
    var currentIndex = start - 1;
    if(allData != null){
      while (counter <= retrieve){
        var item = {Id:allData[currentIndex].Id,
                    DocDate:allData[currentIndex].DocDate,
                    Description:allData[currentIndex].Description,
                    DocNumber:allData[currentIndex].DocNumber,
                    OrderField:allData[currentIndex].DocDate.substring(4) + allData[currentIndex].DocDate.substring(2,4) + allData[currentIndex].DocDate.substring(0,2)
                  };
        result.push(item);
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
  // $scope.Circulars = [];
  // $scope.haveMoreData = false;
  // $scope.isfirstLoad = true;
  // $scope.allData;
  // $scope.distinctDate;
  // $scope.start = 1;
  // $scope.retrieve = 3;
  // APIService.ShowLoading();
  // SyncService.SyncCircular().then(function(){
  //   CircularSQLite.GetAll().then(function(allData){
  //     if(allData.rows != null && allData.rows.length > 0){
  //       $scope.allData = allData;
  //       CircularSQLite.GetDistinctDate().then(function(distinctDate){
  //         $scope.distinctDate = distinctDate;
  //         APIService.ShowLoading();
  //         $scope.Circulars = InitialCirculars(distinctDate,$filter,allData,$scope.start,$scope.retrieve);
  //         FinalCircularAction($scope,APIService);
  //         $scope.haveMoreData = (($scope.start + $scope.retrieve) < $scope.distinctDate.rows.length) ? true : false;
  //       });
  //     }
  //     APIService.HideLoading();
  //   });
  // });

  $scope.Circulars = [];
  $scope.haveMoreData = false;
  $scope.isfirstLoad = true;
  $scope.start = 1;
  $scope.retrieve = 10;
  $scope.allData;
  APIService.ShowLoading();
  SyncService.SyncCircular().then(function(){
    CircularSQLite.GetAll().then(function(response){
      if(response != null){
        $scope.allData = ConvertQueryResultToArray(response);
        $scope.Circulars = InitialCirculars($scope.allData,$scope.start,$scope.retrieve);
      }
      $scope.haveMoreData = (($scope.start + $scope.retrieve) < $scope.allData.length) ? true : false;
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
            //$scope.listNews.push({link:allData.rows.item(i).FileName,title:allData.rows.item(i).Title});
            $scope.listNews.push({Id:allData.rows.item(i).Id,title:allData.rows.item(i).Title});
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
  console.log(data);
  //up
  if(data != null && data.Pdiff.indexOf('+') >= 0) {
    console.log('up');
    $scope.stockInfo.color = 'green';
    $scope.stockInfo.type = 'up';
  }
  //down
  else if (data != null && data.Pdiff.indexOf('-') >= 0){
    console.log('down');
     $scope.stockInfo.color = 'red'; 
    $scope.stockInfo.type = 'down';
  }
  //not change
  else{
    console.log('else');
    $scope.stockInfo.color = 'gray'; 
    $scope.stockInfo.type = '';
  }
  $scope.stockInfo.currentDate = (data == null) ? 'ไม่สามารถถึงข้อมูลล่าสุดได้' : GetThaiDateByDate($filter,GetCurrentDate().replace(/\//g,'')) + ' เวลา ' + GetCurrentTimeWithoutMillisecond() + ' น.';
};

