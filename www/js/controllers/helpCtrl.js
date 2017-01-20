angular.module('starter')

.config(function($stateProvider) {
	$stateProvider

	.state('app.help', {
        url: '/help',
        views: {
          'menuContent': {
            templateUrl: 'templates/help/help_menu.html',
            controller:'HelpCtrl'
          }
        }
    })
  .state('app.help_devicesetting',{
      url: '/helpdevicesetting',
        views: {
          'menuContent': {
            templateUrl: 'templates/help/help_devicesetting.html',
            controller:'HelpDeviceSettingCtrl'
          }
      }
  })
  .state('app.help_pinsetting',{
      url: '/helppinsetting',
        views: {
          'menuContent': {
            templateUrl: 'templates/help/help_pinsetting.html',
            controller:'HelpPINSettingCtrl'
          }
      }
  })
  .state('app.help_activedevices',{
      url: '/helpactivedevices',
        views: {
          'menuContent': {
            templateUrl: 'templates/help/help_activedevices.html',
            controller:'HelpActiveDevicesCtrl'
          }
      }
  })
	.state('app.help_notification', {
	    url: '/helpnotification',
	    views: {
	      'menuContent': {
	        templateUrl: 'templates/help/help_notification.html',
	        controller:'HelpNotificationCtrl'
	      }
	    }
	})
  .state('app.help_theme', {
      url: '/helptheme',
      views: {
        'menuContent': {
          templateUrl: 'templates/help/help_theme.html',
          controller:'HelpThemeCtrl'
        }
      }
  })
})

.controller('MainCtrl',function($scope){
  //set selected or default theme
  SetTheme();
  function SetTheme () {
    $scope.theme = 'default';
    if(window.localStorage.getItem('theme') == null) window.localStorage.setItem('theme','default');
    else $scope.theme = window.localStorage.getItem('theme');
  };

})

.controller('HelpCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup,AuthService,$ionicPlatform,$q){
    $ionicPlatform.ready(function() {
      $scope.noInternet = false;
      GetAppVersion($q).then(function(version){$scope.appVersion = version;});
      //check is authen for display some menu
      $scope.isAuthen = AuthService.isAuthenticated();
      //if no internet connection
      if(!CheckNetwork($cordovaNetwork)){
          $scope.noInternet = true;
        OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
      }

      $scope.OpenHelperLink = function(key){
          if($scope.noInternet) return;
          var url = APIService.hostname() + '/AOTLiveConfig/AOTLive';
          var data = {ConfigKeys:key}
          APIService.ShowLoading();
          APIService.httpPost(url,data,function(response){
            APIService.HideLoading();
            if(response != null && response.data != null){
              var link = response.data;
              window.open(link,'_system','location=no');
            }
          },function(error){APIService.HideLoading();console.log(error);IonicAlert($ionicPopup,'ไม่พบ URL/ลองใหม่อีกครั้ง',null);});
      };
    });
})

.controller('HelpNotificationCtrl',function($scope,NotiService,$ionicPlatform){
   	
})

.controller('HelpThemeCtrl',function($scope,APIService,$ionicPlatform){

  $ionicPlatform.ready(function() {

    InitialThemeDetails();

    $scope.ApplyTheme = function(val){
      window.localStorage.setItem('theme',val);
      APIService.ShowLoading();
      window.location.reload();
    };

    function InitialThemeDetails() {
      $scope.Themes = [];
      $scope.Themes.push({Img:'default2_theme',Name:'Light',Description:'Light Blue Theme',IsApply:false,val:'default'});
      $scope.Themes.push({Img:'default_theme',Name:'Dark',Description:'Dark Blue Theme',IsApply:false,val:'theme_dark'});
      //set IsApply for selected theme
      SetSelectedTheme();
    };

    function SetSelectedTheme () {
      for (var i = 0; i <= $scope.Themes.length -1; i++) {
        if(window.localStorage.getItem('theme') == $scope.Themes[i].val){
          $scope.Themes[i].IsApply = true;
          break;
        }
      };
    }

  });
  

})

.controller('HelpDeviceSettingCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup,$q,AuthService,$ionicPlatform){
    
    $ionicPlatform.ready(function() {
      $scope.noInternet = false;
      $scope.setting = {Device:false,Logon:true,TimeOut:60};
      $scope.Empl_Code = window.localStorage.getItem('CurrentUserName');
      //if no internet connection
      if(!CheckNetwork($cordovaNetwork)){
        $scope.noInternet = true;
        OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
      }
      else{
        //get setting from server
        GetProfileSettings(APIService,$q,$scope.Empl_Code).then(function(response){
          //set profile setting
          SetProfileSettings($q,response.data.Setting).then(function(){
            //bind settings from local storage
            InitialDeviceSetting();
          });
        })
      }
      
      //method triggered when toggle checkbox
      $scope.SetUseOnDevice = function(){
        IonicConfirm($ionicPopup,'ตั้งค่าอุปกรณ์','ต้องการเปลี่ยนการตั้งค่าอุปกรณ์?',
          function(){
            console.log($scope.setting.Device);
          },
          function(){
            if($scope.setting.Device) $scope.setting.Device = false;
            else $scope.setting.Device = true;  
          });

        // if(confirm('ต้องการเปลี่ยนการตั้งค่าอุปกรณ์?')){
        //   console.log($scope.setting.Device);
        // }
        // else{
        //   if($scope.setting.Device) $scope.setting.Device = false;
        //   else $scope.setting.Device = true;
        // }
      };

      function GetDeviceSettings (argument) {
        APIService.ShowLoading();
        var url = APIService.hostname() + '/Device/ProfileSetting';
        var data = {Empl_Code:$scope.Empl_Code};
        APIService.httpPost(url,data,function(response){
          if(response != null && response.data != null){
            //set value to each setting
            SetProfileSettings(response.data);
            //initial device settings
            APIService.HideLoading();
          }
          else APIService.HideLoading();
        },function(error){APIService.HideLoading();console.log(error);});
      };

      $scope.ToggleLogOn = function(){
        if(!$scope.setting.Logon) $scope.setting.TimeOut = 0;
        else $scope.setting.TimeOut = 60;
      };

      $scope.IncreaseTimeOut = function(){
        $scope.setting.TimeOut += 1;
      };

      $scope.DecreaseTimeOut = function(){
        $scope.setting.TimeOut -= 1;
      };

      function InitialDeviceSetting() {
        $scope.setting.Device = (+window.localStorage.getItem('Device') == 1 ? true : false);
        $scope.setting.Logon = (+window.localStorage.getItem('Logon') == 1 ? true : false);
        $scope.setting.TimeOut = +window.localStorage.getItem('TimeOut');
      };

      $scope.CheckValidate = function(){
        //validate TimeOut
        if($scope.setting.Logon){
          console.log($scope.setting.TimeOut);
          if(!$scope.setting.TimeOut || $scope.setting.TimeOut.length == 0){
            IonicAlert($ionicPopup,'จำนวนวันห้ามเป็นค่าว่าง/ต้องเป็นตัวเลขเท่านั้น',null);
            return false;
          }
          if((+$scope.setting.TimeOut > 90) || (+$scope.setting.TimeOut < 0)){
            IonicAlert($ionicPopup,'จำนวนวันต้องมากกว่า 0 และไม่เกิน 90 วัน',null);
            return false;
          }
        }
        return true;
      };

      $scope.SelectAllText = function($event){
        $event.target.select();
      };

      $scope.CheckLimitTimeOut = function(){
        if($scope.setting.TimeOut > 90) $scope.setting.TimeOut = 90;
      };

      $scope.SaveSetting = function(){
        if(!$scope.CheckValidate()) return;
        IonicConfirm($ionicPopup,'ตั้งค่าอุปกรณ์','ต้องการเปลี่ยนการตั้งค่าอุปกรณ์',function(){
          //post setting save on server
          APIService.ShowLoading()
          var url = APIService.hostname() + '/DeviceRegistered/SetProfile';
          var data = {
            Empl_Code:$scope.Empl_Code,
            Setting:{
              Device:$scope.setting.Device,
              LogOn:$scope.setting.Logon,
              TimeOut:$scope.setting.TimeOut
            }
          };
          APIService.httpPost(url,data,function(response){
            if(response){
              //force user to logout for apply new settings
              IonicAlert($ionicPopup,'กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อใช้งานการตั้งค่า',function(){AuthService.logout(false);});
              // //save setting to local storage
              // SetProfileSettings($q,{Device:+$scope.setting.Device,LogOn:+$scope.setting.Logon,TimeOut:$scope.setting.TimeOut}).then(function(response){
              //   if(response){
              //     //force user to logout for apply new settings
              //     alert('กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อใช้งานการตั้งค่า');
              //     AuthService.logout();
              //   }
              //   else{
              //     alert('ไม่สามารถบันทึกการตั้งค่าอุปกรณ์ได้');
              //     APIService.HideLoading();
              //     console.log("can't save settings to localStorage");
              //   }
              // });  
            }
          },
            function(error){console.log(error);APIService.HideLoading();IonicAlert($ionicPopup,'ไม่สามารถบันทึกการตั้งค่าที่ Server ได้',null);});
        })
      };
    });

})

.controller('HelpActiveDevicesCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup,$filter,$ionicPlatform){
  $ionicPlatform.ready(function() {
    $scope.noInternet = false;
    $scope.activeDevices = [];
    //if no internet connection
    if(!CheckNetwork($cordovaNetwork)){
      $scope.noInternet = true;
      OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
    }
    else{
      //get devices from API
      APIService.ShowLoading();
      var url = APIService.hostname() + '/DeviceRegistered/ViewDeviceRegistered';
      var data = {Empl_Code:window.localStorage.getItem('CurrentUserName')};
      APIService.httpPost(url,data,function(response){
        if(response != null && response.data != null){
          InitialActiveDevices(response.data);
          APIService.HideLoading(); 
        }
        else APIService.HideLoading();
      },
        function(error){APIService.HideLoading();console.log(error);});
    }
    function InitialActiveDevices(data){
      angular.forEach(data,function(value,key){
        $scope.activeDevices.push({
          Model:value.Model,
          OS:value.OS,
          Serial:value.Serial,
          LastAccess:GetThaiDateTimeByDate($filter,value.LastAccessTime)
        });
      });
    };
  });
})

.controller('HelpPINSettingCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup,$filter,$ionicPlatform,$location,$ionicNavBarDelegate,$ionicSideMenuDelegate){
  $ionicPlatform.ready(function() {

    $scope.InitialPIN = function(){
      
      $scope.pin = '';
      $scope.keepPIN = '';
      $scope.TitleText = 'ตั้งค่า PIN';
      $scope.headerTxt = 'กรอกรหัสใหม่';
      $scope.returnURL = $location.search().returnURL;
      $scope.hideButton = $location.search().hideButton;

      //hide menu,back button by query string
      if($scope.hideButton != null && $scope.hideButton){
        $ionicNavBarDelegate.showBackButton(false);
        $ionicSideMenuDelegate.canDragContent(false);
        var registerBackButton = $ionicPlatform.registerBackButtonAction(function(e) {
            e.preventDefault();
        }, 1000);
        $scope.$on('$destroy',registerBackButton);
      } 
      else{
        $ionicNavBarDelegate.showBackButton(true);
        $ionicSideMenuDelegate.canDragContent(true);
      } 

      $scope.onlyAuthen = $location.search().onlyAuthen;
      if($scope.onlyAuthen != null && $scope.onlyAuthen){
        $scope.state = 1;
        $scope.headerTxt = 'กรอกรหัส PIN';
        $scope.TitleText = '';
      }
      else{
        APIService.ShowLoading();
        //1 = กรอกรหัสเดิม , 2 = กรอกรหัสใหม่ , 3 = ยืนยันรหัสใหม่
        $scope.state = 2;
        var url = APIService.hostname() + '/DeviceRegistered/CheckExistPIN';
        var data = {Empl_Code:$scope.Empl_Code};
        APIService.httpPost(url,data,function(response){
          if(response.data){
            $scope.state = 1;
            $scope.headerTxt = 'กรอกรหัสเดิม';
          }
          else{
            $scope.state = 2;
            $scope.headerTxt = 'กรอกรหัสใหม่';
          }
          APIService.HideLoading();
        },
          function(error){console.log(error);APIService.HideLoading();});  
      }
      
    };

    $scope.noInternet = false;
    $scope.Empl_Code = window.localStorage.getItem('CurrentUserName');
    //if no internet connection
    if(!CheckNetwork($cordovaNetwork)){
      $scope.noInternet = true;
      OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
      return;
    }
    else{
      //Initial
      $scope.InitialPIN();
    }

    //element variables
    var dots = document.querySelectorAll(".dot");
    var numbers = document.querySelectorAll(".number");
    dots = Array.prototype.slice.call(dots);
    numbers = Array.prototype.slice.call(numbers);

    //each process by state
    $scope.ProcessPIN = function(){
      APIService.ShowLoading();
      if($scope.state == 1) $scope.ProcessPINState1();
      else if($scope.state == 2) $scope.ProcessPINState2();
      else if($scope.state == 3) $scope.ProcessPINState3();
    };

    $scope.ProcessPINState1 = function(){
      var url = APIService.hostname() + '/DeviceRegistered/ValidatePIN';
      var data = {Empl_Code:$scope.Empl_Code,PIN:$scope.pin};
      APIService.httpPost(url,data,function(response){
        if(response != null && response.data != null){
          if(response.data){
            if($scope.onlyAuthen != null && $scope.onlyAuthen){
              window.location = ($scope.returnURL == null) ? '#/app/help' : '#/app/' + $scope.returnURL;
            }
            else{
              $scope.pin = '';
              $scope.state = 2;
              $scope.headerTxt = 'กรอกรหัสใหม่';
              $scope.ResetDot();
              APIService.HideLoading();  
            }
          }
          else $scope.Error();
        }
        else{
          $scope.ResetDot();
          APIService.HideLoading();
          IonicAlert($ionicPopup,'ไม่ได้รับค่าจาก Server',null);
        }
      },
        function(error){console.log(error);$scope.ResetDot();APIService.HideLoading();IonicAlert($ionicPopup,'เกิดข้อผิดพลาด/ลองใหม่อีกครั้ง',null);})
    };

    $scope.ProcessPINState2 = function(){
      $scope.ResetDot();
      $scope.keepPIN = $scope.pin;
      $scope.pin = '';
      $scope.state = 3;
      $scope.headerTxt = 'ยืนยันรหัสอีกครั้ง';
      APIService.HideLoading();
    };

    $scope.ProcessPINState3 = function(){
      if($scope.keepPIN == $scope.pin){
        var url = APIService.hostname() + '/DeviceRegistered/SetPIN';
        var data = {Empl_Code:$scope.Empl_Code,PIN:$scope.pin};
        APIService.httpPost(url,data,function(response){
          APIService.HideLoading();
          IonicAlert($ionicPopup,'ตั้งค่าเรียบร้อย',function(){window.location = ($scope.returnURL == null) ? '#/app/help' : '#/app/' + $scope.returnURL;});
        },
          function(error){console.log(error);$scope.ResetDot();APIService.HideLoading();IonicAlert($ionicPopup,'เกิดข้อผิดพลาด/ลองใหม่อีกครั้ง',null);})
      }
      else $scope.Error();
    };

    //reset dot elements to default class
    $scope.ResetDot = function(){
      dots.forEach(function(dot, index) {
        dot.className = 'dot';
      });
    };

    //set animation error to dot elements
    $scope.Error = function(){
      dots.forEach(function(dot, index) {
        dot.className += " wrong";
      });
      document.body.className = "wrong";
      setTimeout(function() {
        dots.forEach(function(dot, index) {
          dot.className = "dot"; 
      }); $scope.ResetDot();}, 900);
      $scope.pin = '';
      setTimeout(function() {APIService.HideLoading();},1000);
    };

    //loop add event click for number buttons
    if(!$scope.noInternet){
      numbers.forEach(function(number, index) {
        number.addEventListener('click', function() {
          $scope.errorTxt = '';
          if($scope.pin.length == 6) return;
          number.className += ' grow';
          $scope.pin += (index+1 == 11 ? 0 : index + 1);
          dots[$scope.pin.length-1].className += ' active';
          setTimeout(function() {number.className = 'number';}, 1000);
          if($scope.pin.length == 6){
            $scope.ProcessPIN();
          }
        });
      });  
    }

    $scope.deletePIN = function (){
      if($scope.pin.length > 0) {
        $scope.pin = $scope.pin.substring(0, $scope.pin.length - 1);
        dots[$scope.pin.length].className = 'dot';
      }
    };

  });
})
