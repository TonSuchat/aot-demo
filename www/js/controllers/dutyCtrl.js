angular.module('starter')

.controller('DutyCtrl', function($scope,APIService,$filter,$q,$ionicModal,$cordovaNetwork,$ionicPopup,$cordovaClipboard){
	
	InitialDutyGroups($scope);

	$scope.currentDate = GetCurrentDate().toString().replace(new RegExp('/','g'),'');
	$scope.selectedDate = {plainFormat:$scope.currentDate,displayFormat:TransformDateHasSlashFormat($scope.currentDate)};
	$scope.selectedThaiDate = GetThaiDateByDate($filter,$scope.selectedDate.plainFormat);
	$scope.canCheckIn = false;

	$scope.DutyApiDetails = {
		getDutyEmpsURL:APIService.hostname() + '/duty/GetEmp',
		getDutyInfoBeforeURL:APIService.hostname() + '/duty/Info/GetBefore',
		getdutyInfoOperationURL:APIService.hostname() + '/duty/Info/GetOperate',
		checkInDutyURL:APIService.hostname() + '/duty/Emp'
	};

	//set default checkin type
	$scope.dutyCheckInForm = {type:2,remark:''};

	$scope.noInternet = false;
	if(!CheckNetwork($cordovaNetwork)) {
		OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
		$scope.noInternet = true;
	}
	else{
		//display current date duty data
		DisplayDutyDatas($scope.currentDate,APIService,$q,$scope);
	}

	// Create the checked in modal
    $ionicModal.fromTemplateUrl('templates/checkin_duty.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modalCheckIn = modal;
    });

    // Triggered in the login modal to close it
	$scope.closeCheckIn = function() {
	  $scope.modalCheckIn.hide();
	};

	// Triggered in the login modal to open it
	$scope.CheckIn = function(){
		$scope.modalCheckIn.show();
	};

	//check in
	$scope.doCheckIn = function(){
		var param = {
			Empl_Code:window.localStorage.getItem("CurrentUserName"),
			dutyDate:$scope.selectedDate.plainFormat,
			Leader:$scope.dutyCheckInForm.type,
			Remark:((!$scope.dutyCheckInForm.remark || $scope.dutyCheckInForm.remark.length == 0) ? '-' : $scope.dutyCheckInForm.remark),
			Action:1
		};
		console.log(param);
		APIService.ShowLoading();
		POSTCheckInDuty(APIService,$q,param,$scope).then(
			function(response){
				if(response == 'OK'){
					$scope.modalCheckIn.hide();
					APIService.HideLoading();
					DisplayDutyDatas($scope.selectedDate.plainFormat,APIService,$q,$scope);	
				}
				else{
					$scope.modalCheckIn.hide();
					APIService.HideLoading();
					alert(response);
				}
			});
	};

	//delete our check in data
	$scope.deleteCheckIn = function(){
		if(confirm('ต้องการลบข้อมูลนี้ ?'))
		{
			var param = {Empl_Code:window.localStorage.getItem("CurrentUserName"),dutyDate:$scope.selectedDate.plainFormat,Action:2};
			APIService.ShowLoading();
			POSTCheckInDuty(APIService,$q,param,$scope).then(
				function(response){
					console.log(param);
					console.log(response);
					if(response == 'OK'){
						APIService.HideLoading();
						DisplayDutyDatas($scope.selectedDate.plainFormat,APIService,$q,$scope);
					}
					else APIService.HideLoading();
				});
		}
		else
			return;
	};

  	//show first group by default
  	$scope.shownGroup = $scope.dutyGroups[0];
  
  	$scope.toggleGroup = function(group) {
    	if ($scope.isGroupShown(group)) {
      		$scope.shownGroup = null;
    	} 
    	else {
      		$scope.shownGroup = group;
    	}
  	};

  	$scope.isGroupShown = function(group) {
    	return $scope.shownGroup == group;
  	};

	$scope.onTimeSelected = function (selectedTime) {
		$scope.canCheckIn = false;
		var dutyDate = ConvertCalendarDateToAPIFormat(selectedTime,$filter);
		if(dutyDate == null) return;
		$scope.selectedDate.plainFormat = dutyDate;
		$scope.selectedDate.displayFormat = TransformDateHasSlashFormat(dutyDate);
		$scope.selectedThaiDate = GetThaiDateByDate($filter,$scope.selectedDate.plainFormat);

		//display all duty datas
		if(!$scope.noInternet) DisplayDutyDatas(dutyDate,APIService,$q,$scope);
	};
	
	$scope.onViewTitleChanged = function (title) {
		$scope.viewTitle = title;
	};

	$scope.copyDutyEmp = function(){
		console.log(GetDutyEmpsClipboardText());
		if(window.cordova){
			$cordovaClipboard.copy(GetDutyEmpsClipboardText()).then(function () {
		      alert('copy ข้อมูลเรียบร้อยแล้ว');
		    }, function () {
		      // error
		    });

			$cordovaClipboard.paste().then(function (result) {
			      console.log(result);
			    }, function (err) {
			      console.log(err);
			    });

		}
	};

	function GetDutyEmpsClipboardText () {
		var data = $scope.dutyGroups[0].items;
		var str = 'รายงานผู้ปฏิบัติงานเวร ประจำวันที่ ' + $scope.selectedThaiDate + '\n\n';
		angular.forEach(data,function(value,key){
			str += '-' + value.type + '\n';
			str += value.name + '\n';
			str += value.remark + '\n\n';
		});
		return str;
	};

});

function InitialDutyGroups ($scope) {
	$scope.dutyGroups = [];
	$scope.dutyGroups[0] = {name: 'ข้อมูลผู้ปฎิบัติงานเวรประจำวัน',items: []};
	$scope.dutyGroups[1] = {name: 'ข้อมูลทั่วไปที่ต้องทราบก่อนปฎิบัติงาน',items: []};
	$scope.dutyGroups[2] = {name: 'ข้อมูลระหว่างปฎิบัติงาน',items: []};
};

function ClearDutyGroupsItemData ($scope) {
	$scope.dutyGroups[0].items = [];
	$scope.dutyGroups[1].items = [];
	$scope.dutyGroups[2].items = [];
};

function DisplayDutyDatas (dutyDate,APIService,$q,$scope) {
	var completedProcessCount = 0;
	var totalProcess = 3;
	APIService.ShowLoading();

	//clear previous data
	ClearDutyGroupsItemData($scope);

	//POST to get duty data
	POSTGetDutyByDate(dutyDate,APIService,$q,$scope).then(
		function(response){
			completedProcessCount++;
			if(response != null){
				//render
				angular.forEach(response,function(value,key){
					$scope.dutyGroups[0].items.push({type:value.type,name:value.name,remark:value.remark,showDeleteBtn:(window.localStorage.getItem("CurrentUserName") == value.empl_code ? true : false)});
				});
			}
			if(completedProcessCount == totalProcess) APIService.HideLoading();
		});

	//POST get duty information
	POSTGetDutyInfoBefore(dutyDate,APIService,$q,$scope).then(
		function(response){
			completedProcessCount++;
			console.log(response);
			if(response != null){
				//render
				angular.forEach(response,function(value,key){
					$scope.dutyGroups[1].items.push(value.MsgContent);
				});
			}
			if(completedProcessCount == totalProcess) APIService.HideLoading();	
		});

	//POST get duty operate
	POSTGetDutyInfoOperation(dutyDate,APIService,$q,$scope).then(
		function(response){
			completedProcessCount++;
			console.log(response);
			if(response != null){
				//render
				angular.forEach(response,function(value,key){
					$scope.dutyGroups[2].items.push(value.MsgContent);
				});
			}
			if(completedProcessCount == totalProcess) APIService.HideLoading();	
		});

	//check validation user can checked in duty
	$scope.canCheckIn = ValidateCanChekIn($scope.selectedDate.plainFormat,$scope.currentDate);

};

function ConvertCalendarDateToAPIFormat (calendarDate,$filter) {
	if(!calendarDate || calendarDate.length <= 0) return null;
	var day = calendarDate.toString().substring(8,10);
	var month = $filter('filter')(shortnessEngMonth, { monthName: calendarDate.toString().substring(4,7) }); 
	var year = calendarDate.toString().substring(11,15);
	return day + month[0].monthValue + year;
};

function POSTAPIDuty (url,data,APIService,$q) {
	return $q(function(resolve) {
		if(!url || url.length <= 0 || !data || data.length <= 0) return resolve(null);

		APIService.httpPost(url,data,
			function(response){
				if(response != null){
					var result = response.data;
					resolve(result);
				}
				else{resolve(null);}
			},
			function(error){console.log(error);return resolve(error);});	
	});
};

function POSTGetDutyByDate (dutyDate,APIService,$q,$scope) {
	return $q(function(resolve) {
		if(!dutyDate || dutyDate.length <= 0) return resolve(null);
		
		var data = {DutyDate:dutyDate};
		var url = $scope.DutyApiDetails.getDutyEmpsURL;
		POSTAPIDuty(url,data,APIService,$q).then(function(response){resolve(response)});

	});
};

function POSTGetDutyInfoBefore (dutyDate,APIService,$q,$scope) {
	return $q(function(resolve) {
		if(!dutyDate || dutyDate.length <= 0) return resolve(null);
		
		var data = {DutyDate:dutyDate};
		var url = $scope.DutyApiDetails.getDutyInfoBeforeURL;
		POSTAPIDuty(url,data,APIService,$q).then(function(response){resolve(response)});
	});
};

function POSTGetDutyInfoOperation (dutyDate,APIService,$q,$scope) {
	return $q(function(resolve) {
		if(!dutyDate || dutyDate.length <= 0) return resolve(null);
		
		var data = {DutyDate:dutyDate};
		var url = $scope.DutyApiDetails.getdutyInfoOperationURL;
		POSTAPIDuty(url,data,APIService,$q).then(function(response){resolve(response)});
	});
};

function POSTCheckInDuty (APIService,$q,param,$scope) {
	return $q(function(resolve){
		var url = $scope.DutyApiDetails.checkInDutyURL;
		var data = {} 
		if(param.Action == 1) data = {Empl_Code:param.Empl_Code,DutyDate:param.dutyDate,Leader:param.Leader,Remark:param.Remark,Action:param.Action};
		else data = {Empl_Code:param.Empl_Code,DutyDate:param.dutyDate,Action:param.Action,Leader:0,Remark:'-'};		
		POSTAPIDuty(url,data,APIService,$q).then(function(response){resolve(response)});
	});
};

function ValidateCanChekIn (selectedDate,currentDate) {
	objSelectedDate = {day:+(selectedDate.toString().substring(0,2)),month:+(selectedDate.toString().substring(2,4)),year:+(selectedDate.toString().substring(4,8))};
	objCurrentDate = {day:+(currentDate.toString().substring(0,2)),month:+(currentDate.toString().substring(2,4)),year:+(currentDate.toString().substring(4,8))};
	if(objSelectedDate.year > objCurrentDate.year) return true;
	if(objSelectedDate.year < objCurrentDate.year) return false;
	if(objSelectedDate.month > objCurrentDate.month) return true;
	if(objSelectedDate.month < objCurrentDate.month) return false;
	//in case same year and month
	if(objSelectedDate.day >= objCurrentDate.day) return true;
	else return false;
};