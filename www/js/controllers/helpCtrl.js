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

.controller('HelpCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup,AuthService){

    $scope.noInternet = false;
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
        },function(error){APIService.HideLoading();console.log(error);alert('ไม่พบ URL/ลองใหม่อีกครั้ง')});
    };

})

.controller('HelpNotificationCtrl',function($scope,NotiService){
   	
})

.controller('HelpThemeCtrl',function($scope,APIService){

  InitialThemeDetails();

  $scope.ApplyTheme = function(val){
    window.localStorage.setItem('theme',val);
    APIService.ShowLoading();
    window.location.reload();
  };

  function InitialThemeDetails() {
    $scope.Themes = [];
    $scope.Themes.push({Img:'default_theme',Name:'Default',Description:'Description',IsApply:false,val:'default'});
    $scope.Themes.push({Img:'default2_theme',Name:'Default2',Description:'Description2',IsApply:false,val:'default2'});
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

})

.controller('HelpDeviceSettingCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup,$q,AuthService){
    
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
      if(confirm('ต้องการเปลี่ยนการตั้งค่าอุปกรณ์?')){
        console.log($scope.setting.Device);
      }
      else{
        if($scope.setting.Device) $scope.setting.Device = false;
        else $scope.setting.Device = true;
      }
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
        if(!$scope.setting.TimeOut || $scope.setting.TimeOut.length == 0){
          alert('จำนวนวันห้ามเป็นค่าว่าง');
          return false;
        }
        if((+$scope.setting.TimeOut > 60) || (+$scope.setting.TimeOut < 0)){
          alert('จำนวนวันต้องมากกว่า 0 และไม่เกิน 60 วัน');
          return false;
        }
      }
      return true;
    };

    $scope.SelectAllText = function($event){
      $event.target.select();
    };

    $scope.SaveSetting = function(){
      if(!$scope.CheckValidate()) return;
      if(confirm('ต้องการเปลี่ยนการตั้งค่าอุปกรณ์')){
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
            alert('กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อใช้งานการตั้งค่า');
            AuthService.logout();
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
          function(error){console.log(error);APIService.HideLoading();alert('ไม่สามารถบันทึกการตั้งค่าที่ Server ได้');});
        
      }
    };
    


})

.controller('HelpActiveDevicesCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup,$filter){
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


})
