
var selfServiceCategory = [
	{id:1,name:'รายการแลก/แทนเวร',requestURL:'#/app/createredeemduty',showRequestButton:true}
];

angular.module('starter')
 
.controller('SelfServiceCtrl',function($scope,$cordovaNetwork,$ionicPopup,WorkFlowService,$filter,$ionicPlatform){

	$ionicPlatform.ready(function(){
		$scope.InitialSSMenu = function(){
	    	$scope.categories = [
				{id:1,name:'แลก/แทนเวร',icon:'ion-arrow-swap',unreadNumber:0}
			];
	    };

	    $scope.SetUnReadNumber = function(categoryId,unreadNumber){
	    	for (var i = 0; i <= $scope.categories.length - 1; i++) {
	    		if($scope.categories[i].id == categoryId){
	    			$scope.categories[i].unreadNumber = unreadNumber;
	    			break;
	    		}
	    	};
	    };

	    $scope.BindCategoryUnreadNumber = function(data){
	    	angular.forEach(data,function(value,key){
	    		$scope.SetUnReadNumber(value.CategoryId,value.NumberIsUnread);
	    	});
	    };

		$scope.InitialSSMenu();

		//if no internet connection
	    if(!CheckNetwork($cordovaNetwork)) OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
	    else{
	    	//get badge number of new item and bind to each category
	    	WorkFlowService.ViewUnReadMytask(window.localStorage.getItem("CurrentUserName")).then(function(response){
	    		if(response != null && response.data != null) $scope.BindCategoryUnreadNumber(response.data);
	    	});
	    }
	});

})

.controller('SelfServiceListCtrl',function($scope,$stateParams,$cordovaNetwork,$ionicPopup,$filter,WorkFlowService,$ionicPlatform){

	$ionicPlatform.ready(function(){

		$scope.InitialSSList = function(){
	    	$scope.noItems = true;
	    	$scope.SSList = [];
	    	$scope.categoryId = $stateParams.CategoryId;
	    	this.GetItemDetailURL();
	    	var result = $filter('filter')(selfServiceCategory, { id: $scope.categoryId });
	    	if(result == null) return;

			$scope.selectedCategory =  result[0];
			$scope.title = $scope.selectedCategory.name;
			$scope.selfserviceRequestButton = {show:$scope.selectedCategory.showRequestButton,requestURL:$scope.selectedCategory.requestURL};
	    };

	    $scope.GetItemDetailURL = function(){
	    	switch(+$scope.categoryId) {
			    case 1:
			        $scope.itemDetailURL = '#/app/ssitem_redeemduty';
			        break;
			    default:
			        $scope.itemDetailURL = '#';
			}
	    };

	   	//if no internet connection
	    if(!CheckNetwork($cordovaNetwork)) OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
	    else{
			$scope.InitialSSList();
	    	//get list of items by categoryId
	    	WorkFlowService.ViewMyTask($scope.categoryId).then(function(response){
	    		if(response != null && response.data != null && response.data.length > 0) {
	    			$scope.SSList = response.data;
	    			$scope.noItems = false;
	    		}
	    	});
	    };
	});

	
})

.controller('ChangePasswordCtrl',function($scope,APIService,$cordovaNetwork,$ionicPopup,XMPPApiService,$ionicPlatform){

	$ionicPlatform.ready(function(){
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
	});
  

})

.controller('CreateRedeemDutyCtrl',function($scope,$q,ionicDatePicker,APIService,$ionicPopup,$cordovaNetwork,$location,WorkFlowService,$ionicPlatform){

	$ionicPlatform.ready(function(){
		$scope.noInternet = false;

		//if no internet connection
		if(!CheckNetwork($cordovaNetwork)){
		  $scope.noInternet = true;
		  OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
		};

		//*******************Duty*******************
		$scope.searchEmp = {searchTxt:'',result:''};
		//RedeemDutyType : 1 = แลก , 2 = แทน
	   	$scope.redeemDuty = {type:1,leader:1,remark:''};
	   	$scope.selectedDate = {dutyDate1:GetCurrentDate().toString(),dutyDate2:GetCurrentDate().toString()};
	   	$scope.Empl_Code = window.localStorage.getItem("CurrentUserName");

	   	var datePicker1 = {callback: function (val) { 
			SetSelectedDate(val,true);
		}};

		var datePicker2 = {callback: function (val) { 
			SetSelectedDate(val,false);
		}};

		$scope.doRedeemDuty = function(){
			if(!CheckRedeemDutyValidation()) return;
			//search emp again for confirm before create workflow
			this.searchEmployee().then(function(response){
				if(response){
					var leaderTxt = ($scope.redeemDuty.leader == 1 ? 'หัวหน้าเวร' : 'ลูกเวร');
					if($scope.redeemDuty.type == 1) message = 'คุณต้องการแลกเวรกับ ' + $scope.searchEmp.result + ' ในตำแหน่ง ' + leaderTxt + ' ในวันที่ ' + $scope.selectedDate.dutyDate1 + ' กับวันที่ ' + $scope.selectedDate.dutyDate2;
					else message = 'คุณต้องการแทนเวรกับ ' + $scope.searchEmp.result + ' ในตำแหน่ง ' + leaderTxt + ' ในวันที่ ' + $scope.selectedDate.dutyDate1;
					if(confirm(message)){
						var data = {
									  CategoryId: 1,DocumentTitle: "แลก/แทนเวร",DocumentDescription: "รายการแลก/แทนเวร",
									  Empl_Code: $scope.Empl_Code,Empl_Code2: $scope.searchEmp.searchTxt,
									  DutyDate: $scope.selectedDate.dutyDate1.toString().replace(new RegExp('/','g'),''),
									  DutyDate2: $scope.selectedDate.dutyDate2.toString().replace(new RegExp('/','g'),''),
									  Leader: $scope.redeemDuty.leader,
									  RedeemType: $scope.redeemDuty.type,
									  Remark: $scope.redeemDuty.remark
									};
						//var data = {Empl_Code:$scope.Empl_Code,Empl_Code2:$scope.searchEmp.searchTxt,DutyDate:$scope.selectedDate.dutyDate1.toString().replace(new RegExp('/','g'),''),DutyType: $scope.redeemDuty.type,DutyDate2:$scope.selectedDate.dutyDate2.toString().replace(new RegExp('/','g'),''),Remark: "sample string 6"}
						console.log(data);
						WorkFlowService.CreateWorkFlow(data).then(function(response){
							if(response != null) $location.path('/app/selfservicelist/1');
						},function(error){console.log(error);alert('ไม่สามารถทำรายการได้/โปรดลองใหม่อีกครั้ง');});
					}
				}
			});
		};

		function CheckRedeemDutyValidation () {
			if(!$scope.searchEmp.searchTxt || $scope.searchEmp.searchTxt.length <= 0){
				alert('รหัสพนักงานห้ามเป็นค่าว่าง');
				return false;
			}
			if($scope.Empl_Code == $scope.searchEmp.searchTxt){
				alert('คุณเลือกรหัสพนักงานของตัวเอง');
				return false;
			}
			return true;
		};

		$scope.searchEmployee = function(){
			return $q(function(resolve){
				APIService.ShowLoading();
				var url = APIService.hostname() + '/ContactDirectory/viewContactPaging';
				var data = {keyword:$scope.searchEmp.searchTxt,start:1,retrieve:1};
				APIService.httpPost(url,data,
					function(response){
						if(response != null && response.data != null){
							var emp = response.data[0];
							$scope.searchEmp.result = emp.PrefixName + ' ' + emp.Firstname + ' ' + emp.Lastname;
							APIService.HideLoading();
							resolve(true);
						}
						else{
							alert('ไม่พบข้อมูล');
							$scope.searchEmp.result = '';
							APIService.HideLoading();
							resolve(false);
						}
					},
					function(error){
						$scope.searchEmp.result = '';
						console.log(error);
						alert('เกิดข้อผิดพลาดขึ้น ลองอีกครั้ง!');
						APIService.HideLoading();
						resolve(false);
				})
			});
		};

		$scope.OpenRedeemDutyDatePicker = function(isDutyDate1){
			if(isDutyDate1) ionicDatePicker.openDatePicker(datePicker1);
			else ionicDatePicker.openDatePicker(datePicker2);
		};

		function SetSelectedDate (val,isDutyDate1) {
			var selectedDate = new Date(val);
			var day = selectedDate.getDate().toString();
			day = (day.length == 1 ? '0' + day : day);
			var month = (selectedDate.getUTCMonth() + 1).toString();
			month = (month.length == 1 ? '0' + month : month);
			var year = selectedDate.getFullYear();
			var result = day + '/' + month + '/' + year;
			if(isDutyDate1) $scope.selectedDate.dutyDate1 = result;
			else $scope.selectedDate.dutyDate2 = result;
		};
		//*******************Duty*******************
	});

	
})

.controller('ItemRedeemDutyCtrl',function($scope,$ionicPopup,$cordovaNetwork,$stateParams,WorkFlowService,$ionicPlatform,$location){

	$ionicPlatform.ready(function(){
		$scope.InititalRedeemDutyDetails = function(data){
    		//RedeemDutyType : 1 = แลก , 2 = แทน
	    	$scope.redeemDutyDetails = {
	    		Emp1:data.Empl_Code,
	    		Emp2:data.Empl_Code2,
	    		type:data.RedeemType,
	    		dutyDate1:TransformDateHasSlashFormat(data.DutyDate),
	    		dutyDate2:TransformDateHasSlashFormat(data.DutyDate2),
	    		leader:data.Leader,
	    		remark:data.Remark
	    	};
	    };

	    $scope.InititalRedeemHistory = function(data){
	    	$scope.redeemDutyHistories = [];

	    	$scope.showBtnApprove = data.Approve;
	    	$scope.showBtnAcknowledgment = data.Acknowledgment;
	    	$scope.action = {remark:''};

	    	angular.forEach(data.HistoryWorkflow,function(value,key){
	        	$scope.redeemDutyHistories.push({
		    		RouteName:value.RouteName,
		    		UpdateBy:value.UpdateBy,
		    		UpdateDate:value.UpdateDate,
		    		ActionTypeName:value.ActionTypeName
		    	});	
	      	});
	    };

		//if no internet connection
	    if(!CheckNetwork($cordovaNetwork)) OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
	    else{
	    	$scope.documentId = $stateParams.documentId;
	    	$scope.nextLevel = $stateParams.nextLevel;
	    	$scope.EmplCode = window.localStorage.getItem("CurrentUserName");
	    	//bind redeem duty details
	    	WorkFlowService.ViewDutyChangeStaff($scope.documentId).then(function(response){
	    		if(response != null && response.data != null){
	    			$scope.InititalRedeemDutyDetails(response.data[0]);
	    			//bind all history
	    			WorkFlowService.ViewHistoryMyTask($scope.documentId,$scope.nextLevel,$scope.EmplCode).then(function(response){
	    				if(response != null && response.data != null){
	    					$scope.InititalRedeemHistory(response.data);
	    					//post to mark readed this document
	    					WorkFlowService.UpdateReadMytask($scope.EmplCode,$scope.documentId);
	    				};
	    			})
	    		}
	    	});
	    }

	    $scope.doAcknowledge = function(){
	    	if(confirm('รับทราบรายการนี้')){
	    		WorkFlowService.ApproveWorkflow($scope.documentId,window.localStorage.getItem("CurrentUserName"),$scope.action.remark,3).then(function(response){
	    			if(response) $location.path('/app/selfservicelist/1');
	    		});
	    	}
	    };

	    $scope.doApproveOrReject = function(isApprove){
	    	var confirmMessage = '';
	    	var actionType = 0;
	    	if(isApprove){
	    		confirmMessage = 'คุณแน่ใจที่จะอนุมัติรายการนี้ ?';
	    		actionType = 2;
	    	}
	    	else{
	    		confirmMessage = 'คุณแน่ใจที่จะไม่อนุมัติรายการนี้ ?';
	    		actionType = 5;
	    	}
	    	if(confirm(confirmMessage)){
	    		WorkFlowService.ApproveWorkflow($scope.documentId,window.localStorage.getItem("CurrentUserName"),$scope.action.remark,actionType).then(function(response){
	    			if(response) $location.path('/app/selfservicelist/1');
	    		});
	    	}
	    };
	});

})

.controller('CardRequestCtrl',function($scope,$cordovaNetwork,$ionicPopup,APIService,$ionicPlatform){

	$ionicPlatform.ready(function(){
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
	});

})