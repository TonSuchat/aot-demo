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

.controller('HelpCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup){

    $scope.noInternet = false;
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