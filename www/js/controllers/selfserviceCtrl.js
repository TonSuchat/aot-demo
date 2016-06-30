
angular.module('starter')

.controller('SelfServiceCtrl',function($scope){
   	
})

.controller('ChangePasswordCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup,XMPPApiService){

  $scope.changePassword = {oldPassword:'',newPassword:'',confirmNewPassword:''};

  $scope.noInternet = false;
  //if no internet connection
  if(!CheckNetwork($cordovaNetwork)){
    $scope.noInternet = true;
    OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
  };

  $scope.changePassword = function(form){
    console.log(form.$valid);
    if(form.$valid) {
      var url = APIService.hostname() + '/Authen/ChangePassword';
      var data = {userName: window.localStorage.getItem("CurrentUserName"),password_old: $scope.changePassword.oldPassword,password_new: $scope.changePassword.newPassword};
      console.log(data);
      APIService.ShowLoading();
      //post to change password AD
      APIService.httpPost(url,data,function(response){
        //change password openfire
        XMPPApiService.ChangePassword(window.localStorage.getItem("CurrentUserName"),$scope.changePassword.newPassword).then(function(response){
          if(response) alert('เปลี่ยนรหัสผ่านเรียบร้อย');
          //keep new password in localstorage
          window.localStorage.setItem("AuthServices_password",$scope.changePassword.newPassword);
          APIService.HideLoading();
        });
      },function(error){alert(error.data);console.log(error);APIService.HideLoading();});
    }
  };

})

.controller('SwapDutyCtrl',function($scope,ionicDatePicker,APIService,$ionicPopup,$cordovaNetwork){
   	$scope.QRSrc = '';
	$scope.noInternet = false;

	//if no internet connection
	if(!CheckNetwork($cordovaNetwork)){
	  $scope.noInternet = true;
	  OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
	};

	//*******************Duty*******************
	//swapDutyType : 1 = แลก , 2 = แทน
   	$scope.redeemDuty = {type:1,leader:1};
   	$scope.selectedDate = {dutyDate1:GetCurrentDate().toString(),dutyDate2:GetCurrentDate().toString()};

   	var datePicker1 = {callback: function (val) { 
		SetSelectedDate(val,true);
	}};

	var datePicker2 = {callback: function (val) { 
		SetSelectedDate(val,false);
	}};

	$scope.doRedeemDuty = function(){
		var url = APIService.hostname() + '/RenderQRAndBarcode';
		var emplCode = PadString(window.localStorage.getItem("CurrentUserName"),"0000000000");
		var data = {"ContentCode":2,DataTpe:14,BindingDataType14:{"Empl_Code":emplCode,"Leader":$scope.redeemDuty.leader,"RedeemType":$scope.redeemDuty.type,"DutyDate1":$scope.selectedDate.dutyDate1.replace(new RegExp('/','g'),'')}};
		if($scope.redeemDuty.type == 1) data.BindingDataType14.DutyDate2 = $scope.selectedDate.dutyDate2.replace(new RegExp('/','g'),'');
		APIService.ShowLoading();
		APIService.httpPost(url,data,function(response){
			if(response != null){
				var base64Str = response.data;
				$scope.QRSrc = 'data:image/png;base64,' + base64Str;
				APIService.HideLoading();
			}
			else APIService.HideLoading();				
		},function(error){console.log(error);APIService.HideLoading();});
	};

	$scope.OpenRedeemDutyDatePicker = function(isDutyDate1){
		if(isDutyDate1) ionicDatePicker.openDatePicker(datePicker1);
		else ionicDatePicker.openDatePicker(datePicker2);
	};

	function SetSelectedDate (val,isDutyDate1) {
		var selectedDate = new Date(val);
		var day = selectedDate.getDate();
		var month = (selectedDate.getUTCMonth() + 1).toString();
		month = (month.length == 1 ? '0' + month : month);
		var year = selectedDate.getFullYear();
		var result = day + '/' + month + '/' + year;
		if(isDutyDate1) $scope.selectedDate.dutyDate1 = result;
		else $scope.selectedDate.dutyDate2 = result;
	};
	//*******************Duty*******************
})

.controller('CardRequestCtrl',function($scope,$cordovaNetwork,$ionicPopup,APIService){

	$scope.noInternet = false;
	//if no internet connection
	if(!CheckNetwork($cordovaNetwork)){
	 	$scope.noInternet = true;
	 	OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
	};

	$scope.cardRequest = function(){
		var url = APIService.hostname() + '/EmployeeCardRequest/CardRequest';
		var data = {EmplCode:window.localStorage.getItem("CurrentUserName")};
		APIService.ShowLoading();
		APIService.httpPost(url,data,
			function(response){
				if(response.data && response.data.length > 0) OpenIonicAlertPopup($ionicPopup,'ขอทำบัตร','หมายเลขคำขอเลขที่ ' + response.data + ' ได้ถูกจัดส่งให้ผู้ดำเนินการแล้ว กรุณาติดต่อ 1449 คุณจำปูน');
				APIService.HideLoading();	
			},
			function(error){APIService.HideLoading();console.log(error);});
	};

})