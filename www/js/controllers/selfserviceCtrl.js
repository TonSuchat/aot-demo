
var selfServiceCategory = [
	{id:"",name:'เปลี่ยนรหัสผ่าน',href:'#/app/changepassword',requestURL:'#',showRequestButton:false,icon:'ion-locked',unreadNumber:0},
	{id:1,name:'แลก/แทนเวร',href:'#/app/selfservicelist/',requestURL:'#/app/createredeemduty',showRequestButton:true,icon:'ion-arrow-swap',unreadNumber:0},
	{id:2,name:'ขอทำบัตรพนักงาน',href:'#/app/selfservicelist/',requestURL:'#/app/cardrequest',showRequestButton:true,icon:'ion-card',unreadNumber:0},
	{id:3,name:'ลงเวลาทำงาน',href:'#/app/selfservicelist/',requestURL:'#/app/createtimework',showRequestButton:true,icon:'ion-clock',unreadNumber:0},
	{id:4,name:'บันทึกลาหยุดงาน',href:'#/app/selfservicelist/',requestURL:'#/app/createleave',showRequestButton:true,icon:'ion-medkit',unreadNumber:0},
];

angular.module('starter')

.config(function($stateProvider) {
	$stateProvider
	.state('app.selfservice', {
	    url: '/selfservice',
	    views: {
	      'menuContent': {
	        templateUrl: 'templates/selfservice/selfservice_menu.html',
	        controller:'SelfServiceCtrl'
	      }
	    }
	})
	.state('app.selfservicelist', {
	    url: '/selfservicelist/:CategoryId',
	    views: {
	      'menuContent': {
	        templateUrl: 'templates/selfservice/selfservice_list.html',
	        controller:'SelfServiceListCtrl'
	      }
	    }
	})    
	        .state('app.createredeemduty', {
	          url: '/createredeemduty',
	          views: {
	            'menuContent': {
	              templateUrl: 'templates/selfservice/create_redeemduty.html',
	              controller:'CreateRedeemDutyCtrl'
	            }
	          }
	        })
	        .state('app.ssitemredeemduty', {
	          url: '/ssitem_redeemduty?documentId&nextLevel',
	          views: {
	            'menuContent': {
	              templateUrl: 'templates/selfservice/ssitem_redeemduty.html',
	              controller:'ItemRedeemDutyCtrl'
	            }
	          }
	        })
	        .state('app.cardrequest', {
			    url: '/cardrequest',
			    views: {
			      'menuContent': {
			        templateUrl: 'templates/selfservice/cardrequest.html',
			        controller:'CardRequestCtrl'
			      }
			    }
			})
			.state('app.ssitemcardrequest', {
			    url: '/ssitem_cardrequest?documentId&nextLevel',
			    views: {
			      'menuContent': {
			        templateUrl: 'templates/selfservice/ssitem_cardrequest.html',
			        controller:'ItemCardRequestCtrl'
			      }
			    }
			})
			.state('app.createleave', {
	          url: '/createleave',
	          views: {
	            'menuContent': {
	              templateUrl: 'templates/selfservice/create_leave.html',
	              controller:'CreateLeaveCtrl'
	            }
	          }
	        })
	        .state('app.ssitemleave', {
			    url: '/ssitem_leave?documentId&nextLevel',
			    views: {
			      'menuContent': {
			        templateUrl: 'templates/selfservice/ssitem_leave.html',
			        controller:'ItemLeaveCtrl'
			      }
			    }
			})
			.state('app.createtimework', {
	          url: '/createtimework',
	          views: {
	            'menuContent': {
	              templateUrl: 'templates/selfservice/create_timework.html',
	              controller:'CreateTimeWorkCtrl'
	            }
	          }
	        })
	        .state('app.ssitemtimework', {
			    url: '/ssitem_timework?documentId&nextLevel',
			    views: {
			      'menuContent': {
			        templateUrl: 'templates/selfservice/ssitem_timework.html',
			        controller:'ItemTimeWorkCtrl'
			      }
			    }
			})
	.state('app.changepassword', {
	    url: '/changepassword',
	    views: {
	      'menuContent': {
	        templateUrl: 'templates/selfservice/changepassword.html',
	        controller:'ChangePasswordCtrl'
	      }
	    }
	})

})
 
.controller('SelfServiceCtrl',function($scope,$cordovaNetwork,$ionicPopup,WorkFlowService,$filter,$ionicPlatform,$ionicPopup,$rootScope){

	$ionicPlatform.ready(function(){

		$scope.InitialSSMenu = function(){
			$scope.categories = selfServiceCategory;
	    };

	    $scope.SetUnReadNumber = function(categoryId,unreadNumber){
	    	for (var i = 0; i <= $scope.categories.length - 1; i++) {
	    		if(+$scope.categories[i].id == +categoryId){
	    			$scope.categories[i].unreadNumber = unreadNumber;
	    			break;
	    		}
	    	};
	    };

	    $scope.SetReadedAll = function(categoryId){
	    	for (var i = 0; i <= $scope.categories.length - 1; i++) {
	    		$scope.categories[i].unreadNumber = 0;
	    	};
	    };

	    $scope.BindCategoryUnreadNumber = function(data){
	    	//set readed all first
	    	$scope.SetReadedAll();
	    	//set unreadnumber by date from server
	    	if(data == null) return;
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
	    		else $scope.BindCategoryUnreadNumber(null);
	    	});
	    }

	});


})

.controller('SelfServiceListCtrl',function($scope,$stateParams,$cordovaNetwork,$ionicPopup,$filter,WorkFlowService,$ionicPlatform,$rootScope){

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
			    case 2:
			    	$scope.itemDetailURL = '#/app/ssitem_cardrequest';
			    	break;
			    case 3:
			    	$scope.itemDetailURL = '#/app/ssitem_timework';
			    	break;
			    case 4:
			    	$scope.itemDetailURL = '#/app/ssitem_leave';
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
	    			//$scope.SSList = response.data;
	    			$scope.BindSSList(response.data); 
	    			$scope.noItems = false;
	    		}
	    	});
	    };

	    $scope.BindSSList = function(data){
	    	angular.forEach(data,function(value,key){
	    		$scope.SSList.push({DocumentId:value.DocumentId,NextLevel:value.NextLevel,DocumentTitle:value.DocumentTitle,Note:value.Note,LastUpdate:GetThaiDateTimeByDate($filter,value.LastUpdate),IsRead:value.IsRead});
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
		    if(form.$valid) {
		      var url = APIService.hostname() + '/Authen/ChangePassword';
		      var data = {userName: window.localStorage.getItem("CurrentUserName"),password_old: $scope.changePassword.oldPassword,password_new: $scope.changePassword.newPassword,RegisterID:window.localStorage.getItem("GCMToken")};
		      APIService.ShowLoading();
		      //post to change password AD
		      APIService.httpPost(url,data,function(response){
		        //change password openfire
		        XMPPApiService.ChangePassword(window.localStorage.getItem("CurrentUserName"),$scope.changePassword.newPassword).then(function(response){
		          if(response) IonicAlert($ionicPopup,'เปลี่ยนรหัสผ่านเรียบร้อย');
		          //keep new password in localstorage
		          window.localStorage.setItem("AuthServices_password",$scope.changePassword.newPassword);
		          APIService.HideLoading();
		        });
		      },function(error){IonicAlert($ionicPopup,error.data,null);console.log(error);APIService.HideLoading();});
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

	   	var datePicker1 = {callback: function (val) { SetSelectedDate(val,true);},
			from:new Date()
		};

		var datePicker2 = {callback: function (val) { SetSelectedDate(val,false);},
			from: new Date()
		};

		$scope.doRedeemDuty = function(){
			if(!CheckRedeemDutyValidation()) return;
			//search emp again for confirm before create workflow
			$scope.searchEmployee().then(function(response){
				if(response != null && response != false){
					var leaderTxt = ($scope.redeemDuty.leader == 1 ? 'หัวหน้าเวร' : 'ลูกเวร');
					if($scope.redeemDuty.type == 1) message = 'คุณต้องการแลกเวรกับ ' + $scope.searchEmp.result + ' ในตำแหน่ง ' + leaderTxt + ' ในวันที่ ' + $scope.selectedDate.dutyDate1 + ' กับวันที่ ' + $scope.selectedDate.dutyDate2;
					else message = 'คุณต้องการแทนเวรกับ ' + $scope.searchEmp.result + ' ในตำแหน่ง ' + leaderTxt + ' ในวันที่ ' + $scope.selectedDate.dutyDate1;

					IonicConfirm($ionicPopup,'สร้างรายการแลกแทนเวร',message,function(){
						var data = {
									  CategoryId: 1,
									  RegisterId:window.localStorage.getItem("GCMToken"),
									  DutyModel:{
									  	DocumentTitle: "แลก/แทนเวร",
									  	DocumentDescription: "รายการแลก/แทนเวร",
									  	Empl_Code: $scope.Empl_Code,
									  	Empl_Code2: $scope.searchEmp.searchTxt,
									  	DutyDate: $scope.selectedDate.dutyDate1.toString().replace(new RegExp('/','g'),''),
									  	DutyDate2: $scope.selectedDate.dutyDate2.toString().replace(new RegExp('/','g'),''),
									  	Leader: $scope.redeemDuty.leader,
									  	RedeemType: $scope.redeemDuty.type,
									  	Remark: ($scope.redeemDuty.remark && $scope.redeemDuty.remark.length > 0 ? $scope.redeemDuty.remark : '-')
									  }
									};
						//var data = {Empl_Code:$scope.Empl_Code,Empl_Code2:$scope.searchEmp.searchTxt,DutyDate:$scope.selectedDate.dutyDate1.toString().replace(new RegExp('/','g'),''),DutyType: $scope.redeemDuty.type,DutyDate2:$scope.selectedDate.dutyDate2.toString().replace(new RegExp('/','g'),''),Remark: "sample string 6"}
						WorkFlowService.CreateWorkFlow(data).then(function(response){
							if(response != null) $location.path('/app/selfservicelist/1');
						},function(error){console.log(error);IonicAlert($ionicPopup,'ไม่สามารถทำรายการได้/โปรดลองใหม่อีกครั้ง',null);});
					});
				}
			});
		};

		function CheckRedeemDutyValidation () {
			if(!$scope.searchEmp.searchTxt || $scope.searchEmp.searchTxt.length <= 0){
				IonicAlert($ionicPopup,'รหัสพนักงานห้ามเป็นค่าว่าง',null);
				return false;
			}
			if($scope.Empl_Code == $scope.searchEmp.searchTxt){
				IonicAlert($ionicPopup,'คุณเลือกรหัสพนักงานของตัวเอง',null);
				return false;
			}
			return true;
		};

		$scope.searchEmployee = function(){
			// return $q(function(resolve){
			// 	APIService.ShowLoading();
			// 	var url = APIService.hostname() + '/ContactDirectory/viewContactPaging';
			// 	var data = {keyword:$scope.searchEmp.searchTxt,start:1,retrieve:1};
			// 	APIService.httpPost(url,data,
			// 		function(response){
			// 			if(response != null && response.data != null){
			// 				var emp = response.data[0];
			// 				$scope.searchEmp.result = emp.PrefixName + ' ' + emp.Firstname + ' ' + emp.Lastname;
			// 				APIService.HideLoading();
			// 				resolve(true);
			// 			}
			// 			else{
			// 				alert('ไม่พบข้อมูล');
			// 				$scope.searchEmp.result = '';
			// 				APIService.HideLoading();
			// 				resolve(false);
			// 			}
			// 		},
			// 		function(error){
			// 			$scope.searchEmp.result = '';
			// 			console.log(error);
			// 			alert('เกิดข้อผิดพลาดขึ้น ลองอีกครั้ง!');
			// 			APIService.HideLoading();
			// 			resolve(false);
			// 	})
			// });
			return $q(function(resolve){
				APIService.searchEmployee($scope.searchEmp.searchTxt).then(function(response){
					if(response != null){
						$scope.searchEmp.result = response;
						resolve(true);
					} 
					else{
						$scope.searchEmp.result = '';	
						resolve(false);
					} 
				});
			})
		};

		$scope.OpenRedeemDutyDatePicker = function(isDutyDate1){
			if(isDutyDate1) ionicDatePicker.openDatePicker(datePicker1);
			else ionicDatePicker.openDatePicker(datePicker2);
		};

		function SetSelectedDate (val,isDutyDate1) {
			var selectedDate = new Date(val);
			var result = ConvertDateObjToSlashFormat(selectedDate);
			if(isDutyDate1) $scope.selectedDate.dutyDate1 = result;
			else $scope.selectedDate.dutyDate2 = result;
		};
		//*******************Duty*******************
	});

	
})


.controller('ItemRedeemDutyCtrl',function($scope,$ionicPopup,$cordovaNetwork,$stateParams,WorkFlowService,$ionicPlatform,$location,$filter,$rootScope){

	$ionicPlatform.ready(function(){

		//actiontype : 2 = approve , 5 = reject , 3 = acknowledge
		$scope.popUpDetails = {title:'',subtitle:'',actiontype:0};
		$scope.action = {remark:''};

		//Accordion-Code
		$scope.initialHistoryGroup = function (){
			$scope.historyGroups = [];
			$scope.historyGroups[0] = {name: 'ประวัติ',items: []};
		};

		$scope.initialHistoryGroup();
		
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
	  	//Accordion-Code

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
	    	$scope.stateNextLevel = data.StateNextLevel;
	    	
	    	angular.forEach(data.HistoryWorkflow,function(value,key){
	      //   	$scope.redeemDutyHistories.push({
		    	// 	RouteName:value.RouteName,
		    	// 	UpdateBy:value.UpdateBy,
		    	// 	UpdateDate:GetThaiDateTimeByDate($filter,value.UpdateDate),
		    	// 	ActionTypeName:value.ActionTypeName,
		    	// 	RouteName:value.RouteName
		    	// });	
	    		$scope.historyGroups[0].items.push({
		    		RouteName:value.RouteName,
		    		UpdateBy:value.UpdateBy,
		    		UpdateDate:GetThaiDateTimeByDate($filter,value.UpdateDate),
		    		ActionTypeName:value.ActionTypeName,
		    		RouteName:value.RouteName,
		    		Device:value.Device
		    	});	
	      	});
	    };

		//if no internet connection
	    if(!CheckNetwork($cordovaNetwork)) OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
	    else{
	    	$scope.documentId = $stateParams.documentId;
	    	$scope.nextLevel = ''; //$stateParams.nextLevel;
	    	$scope.categoryId = 1;
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
 
	    $scope.confirmAcknowledge = function(){
	    	// $scope.popUpDetails.title = 'รับทราบ';
	    	// $scope.popUpDetails.subtitle = 'รับทราบรายการนี้ ?';
	    	// $scope.popUpDetails.actiontype = 3;
	    	// $scope.showPopUp();
	    	WorkFlowService.confirmAcknowledge($scope);
	    };

	    // $scope.doAcknowledge = function(){
    	// 	WorkFlowService.ApproveWorkflow($scope.documentId,window.localStorage.getItem("CurrentUserName"),$scope.action.remark,3).then(function(response){
    	// 		if(response) $location.path('/app/selfservicelist/1');
    	// 	});
	    // };

	    $scope.confirmApproveOrReject = function(isApprove){
	    	// var confirmMessage = '';
	    	// var title = '';
	    	// var actionType = 0;
	    	// if(isApprove){
	    	// 	title = 'อนุมัติ';
	    	// 	confirmMessage = 'คุณแน่ใจที่จะอนุมัติรายการนี้ ?';
	    	// 	actionType = 2;
	    	// }
	    	// else{
	    	// 	title = 'ไม่อนุมัติ'
	    	// 	confirmMessage = 'คุณแน่ใจที่จะไม่อนุมัติรายการนี้ ?';
	    	// 	actionType = 5;
	    	// }
	    	// $scope.popUpDetails.title = title;
	    	// $scope.popUpDetails.subtitle = confirmMessage;
	    	// $scope.popUpDetails.actiontype = actionType;

	    	// $scope.showPopUp();
	    	WorkFlowService.confirmApproveOrReject(isApprove,$scope);
	    };

	    // $scope.doApproveOrReject = function(isApprove,actionType){
	    // 	console.log('doApproveOrReject');
    	// 	WorkFlowService.ApproveWorkflow($scope.documentId,window.localStorage.getItem("CurrentUserName"),$scope.action.remark,actionType).then(function(response){
    	// 		if(response) $location.path('/app/selfservicelist/1');
    	// 	});
	    // };

	    // $scope.showPopUp = function(){
	    // 	$scope.action.remark = '';
	    // 	//popup when clicked approve/reject , acknowledge
		   //  var popUp = $ionicPopup.show({
		   //  	template: "<textarea placeholder='หมายเหตุ' rows='5' cols='50' ng-model='action.remark'></textarea>",
		   //  	title:$scope.popUpDetails.title,
		   //  	subTitle:$scope.popUpDetails.subtitle,
		   //  	scope:$scope,
		   //  	buttons:[
		   //  		{text:'ตกลง',type:'button-positive',onTap:function(e){
		   //  			if($scope.popUpDetails.actiontype == 2) $scope.doApproveOrReject(true,2);
		   //  			else if($scope.popUpDetails.actiontype == 5) $scope.doApproveOrReject(false,5);
		   //  			else if($scope.popUpDetails.actiontype == 3) $scope.doAcknowledge();
		   //  		}},
		   //  		{text:'ยกเลิก'}
		   //  	]
		   //  });
	    // };
 
	});

})

.controller('CardRequestCtrl',function($scope,$cordovaNetwork,$ionicPopup,APIService,$ionicPlatform,WorkFlowService,$location){

	$ionicPlatform.ready(function(){
		$scope.noInternet = false;
		//if no internet connection
		if(!CheckNetwork($cordovaNetwork)){
		 	$scope.noInternet = true;
		 	OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
		};

		$scope.cardRequest = function(){
			// var url = APIService.hostname() + '/EmployeeCardRequest/CardRequest';
			// var data = {EmplCode:window.localStorage.getItem("CurrentUserName")};
			// APIService.ShowLoading();
			// APIService.httpPost(url,data,
			// 	function(response){
			// 		if(response.data && response.data.length > 0) OpenIonicAlertPopup($ionicPopup,'ขอทำบัตร','หมายเลขคำขอเลขที่ ' + response.data + ' ได้ถูกจัดส่งให้ผู้ดำเนินการแล้ว กรุณาติดต่อ 1449 คุณจำปูน');
			// 		APIService.HideLoading();	
			// 	},
			// 	function(error){APIService.HideLoading();console.log(error);});
			var data = {
				CategoryId:2,
				RegisterId:window.localStorage.getItem("GCMToken"),
				REQCardModel:{
					DocumentTitle:'ขอทำบัตรพนักงาน',
					DocumentDescription:window.localStorage.getItem("CurrentUserName") + ' ขอทำบัตรพนักงาน',
					Empl_Code:window.localStorage.getItem("CurrentUserName")
				}};
			WorkFlowService.CreateWorkFlow(data).then(function(response){
				if(response != null && response.data != null && response.data != 'Error'){
					OpenIonicAlertPopup($ionicPopup,'ขอทำบัตร','หมายเลขคำขอเลขที่ ' + response.data + ' ได้ถูกจัดส่งให้ผู้ดำเนินการแล้ว กรุณาติดต่อ 1449 คุณจำปูน');
					$location.path('/app/selfservicelist/2');
				}
			},function(error){console.log(error);});
		};
	});

})

.controller('ItemCardRequestCtrl',function($scope,$cordovaNetwork,$stateParams,$ionicPopup,$ionicPlatform,WorkFlowService,$filter){
	$ionicPlatform.ready(function(){

		$scope.cardRequestDetails = {};
		$scope.cardRequestHistories = [];
		//actiontype : 2 = approve , 5 = reject , 3 = acknowledge
		$scope.popUpDetails = {title:'',subtitle:'',actiontype:0};
		$scope.action = {remark:''};
		$scope.noInternet = false;

		//Accordion-Code
		$scope.initialHistoryGroup = function (){
			$scope.historyGroups = [];
			$scope.historyGroups[0] = {name: 'ประวัติ',items: []};
		};

		$scope.initialHistoryGroup();
		
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
	  	//Accordion-Code

		//if no internet connection
		if(!CheckNetwork($cordovaNetwork)){
		 	$scope.noInternet = true;
		 	OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
		}
		else{
			$scope.documentId = $stateParams.documentId;
	    	$scope.nextLevel = ''; //$stateParams.nextLevel;
	    	$scope.categoryId = 2;
	    	$scope.EmplCode = window.localStorage.getItem("CurrentUserName");
			WorkFlowService.ViewHistoryMyTask($scope.documentId,$scope.nextLevel,$scope.EmplCode).then(function(response){
				if(response != null && response.data != null){
					$scope.InitialCardRequestDetails(response.data);
					//post to mark readed this document
					WorkFlowService.UpdateReadMytask($scope.EmplCode,$scope.documentId);
				};
			});
		}

		$scope.InitialCardRequestDetails = function(data){
			$scope.showBtnAcknowledgment = data.Acknowledgment;
			$scope.showBtnApprove = data.Approve;
			$scope.stateNextLevel = data.StateNextLevel;

			$scope.cardRequestDetails.DocumentTitle = data.HistoryWorkflow[0].DocumentTitle;
			$scope.cardRequestDetails.DocumentDescription = data.HistoryWorkflow[0].DocumentDescription;

			angular.forEach(data.HistoryWorkflow,function(value,key){
	        	$scope.historyGroups[0].items.push({
		    		UpdateBy:value.UpdateBy,
		    		UpdateDate:GetThaiDateTimeByDate($filter,value.UpdateDate),
		    		ActionTypeName:value.ActionTypeName,
		    		RouteName:value.RouteName
		    	});	
	      	});
		};

		$scope.confirmAcknowledge = function(){
	    	WorkFlowService.confirmAcknowledge($scope);
	    };

	});

})

.controller('CreateLeaveCtrl',function($scope,$cordovaNetwork,$stateParams,$ionicPopup,$ionicPlatform,WorkFlowService,$filter,ionicDatePicker,$location){
	$ionicPlatform.ready(function(){
		var defaultDate1,defaultDate2;
		$scope.noInternet = false;
		//if no internet connection
		if(!CheckNetwork($cordovaNetwork)){
		  $scope.noInternet = true;
		  OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
		};

		$scope.leave = {type:1,reason:'',duration:1,contact:''};

		InitialStartAndEndDate();

		$scope.Empl_Code = window.localStorage.getItem("CurrentUserName");
		 
		var datePicker1 = {callback: function (val) { SetSelectedDate(val,true);},
			inputDate:defaultDate1
			//from:new Date()
		};

		var datePicker2 = {callback: function (val) { SetSelectedDate(val,false);},
			inputDate:defaultDate2
			//from:new Date()
		};

		$scope.OpenDatePicker = function(isStartDate){
			if(isStartDate) ionicDatePicker.openDatePicker(datePicker1);
			else ionicDatePicker.openDatePicker(datePicker2);
		};

		function SetSelectedDate (val,isStartDate) {
			var selectedDate = new Date(val);
			var result = ConvertDateObjToSlashFormat(selectedDate);
			if(isStartDate) $scope.selectedDate.startDate = result;
			else $scope.selectedDate.endDate = result;
		};

		function InitialStartAndEndDate () {
			defaultDate1 = new Date();
			defaultDate1.setDate(defaultDate1.getDate() + 1);
			defaultDate2 = new Date();
			defaultDate2.setDate(defaultDate2.getDate() + 2);
			$scope.selectedDate = {startDate:ConvertDateObjToSlashFormat(defaultDate1),endDate:ConvertDateObjToSlashFormat(defaultDate2)};
		};

		$scope.IncrementDuration = function(){
			$scope.leave.duration += 0.5;
		};

		$scope.DecreaseDuration = function(){
			$scope.leave.duration -= 0.5;
			if($scope.leave.duration < 0.5) $scope.leave.duration = 0.5;
		};

		$scope.CreateLeave = function(){
			if(!$scope.CheckDateValidation()) return;
			//if duration less than 1 set startdate and enddate to same day
			if($scope.leave.duration == 1) $scope.selectedDate.endDate = $scope.selectedDate.startDate;
			if(!$scope.leave.reason || $scope.leave.reason.length <= 0) $scope.leave.reason = '-';
			if(!$scope.leave.contact || $scope.leave.contact.length <= 0) $scope.leave.contact = '-';
			var description = $scope.GetDocumentDescription();

			IonicConfirm($ionicPopup,'สร้างรายการวันลา','ต้องการสร้าง' + description + ' ?',function(){
				var data = {
					CategoryId:4,
					RegisterId:window.localStorage.getItem("GCMToken"),
					OnLeaveModel:{
						DocumentTitle:'บันทึกลาหยุดงาน',
						DocumentDescription:description,
						Empl_Code:$scope.Empl_Code,
						LeaveCode:$scope.leave.type,
						Reason:$scope.leave.reason,
						FromDate:$scope.selectedDate.startDate.toString().replace(new RegExp('/','g'),''),
						ToDate:$scope.selectedDate.endDate.toString().replace(new RegExp('/','g'),''),
						Duration:$scope.leave.duration,
						Contact:$scope.leave.contact	
					}
				};
				WorkFlowService.CreateWorkFlow(data).then(function(response){
					if(response != null) $location.path('/app/selfservicelist/4');
				},function(error){console.log(error);IonicAlert($ionicPopup,'ไม่สามารถทำรายการได้/โปรดลองใหม่อีกครั้ง',null);});
			});
		};

		$scope.GetDocumentDescription = function(){
			var message,typeName;
			if($scope.leave.type == 1) typeName = 'ป่วย';
			else if($scope.leave.type == 2) typeName = 'กิจ';
			else if($scope.leave.type == 3) typeName = 'คลอด';
			else if($scope.leave.type == 4) typeName = 'พักผ่อน';
			else if($scope.leave.type == 1.1) typeName = 'ลาป่วยเนื่องจากปฏิบัติในหน้าที่';
			else if($scope.leave.type == 9) typeName = 'ลาศึกษาและอบรมต่างประเทศ';
			else if($scope.leave.type == 5) typeName = 'ลาอุปสมบท';
			else if($scope.leave.type == 6) typeName = 'ลาไปประกอบพิธีฮัจย์';
			else if($scope.leave.type == 2.1) typeName = 'ลากิจเพื่อเลี้ยงดูบัตร';
			else if($scope.leave.type == 7) typeName = 'ลาติดตามคู่สมรสไปต่างประเทศ';
			else if($scope.leave.type == 8) typeName = 'รับราชการทหาร';
			else if($scope.leave.type == 10) typeName = 'ลาช่วยเหลือภริยาที่คลอดบุตร';
			else if($scope.leave.type == 12) typeName = 'ขาดงาน';
			else if($scope.leave.type == 13) typeName = 'ลาถือศีลปฏิบัติธรรม';
			message = 'บันทึกลา' + typeName + ' เนื่องจาก : ' + $scope.leave.reason + ' ตั้งแต่วันที่ ' + $scope.selectedDate.startDate + ' ถึงวันที่ ' + $scope.selectedDate.endDate + ' เป็นระยะเวลา ' + $scope.leave.duration + ' วัน สามารถติดต่อได้ที่ ' + $scope.leave.contact;
			return message;
		};

		$scope.CheckDateValidation = function(){
			if($scope.leave.duration > 1){
				var arrStartDate,startDate,endDate,arrEndDate;
				arrStartDate = $scope.selectedDate.startDate.split('/');
				arrEndDate = $scope.selectedDate.endDate.split('/');
				startDate = new Date(arrStartDate[2] + '-' + arrStartDate[1] + '-' + arrStartDate[0]);
				endDate = new Date(arrEndDate[2] + '-' + arrEndDate[1] + '-' + arrEndDate[0]);
				if(startDate > endDate) {
					IonicAlert($ionicPopup,'ช่วงวันที่ไม่ถูกต้อง',function(){
						return false;	
					})
				}
				else return true;
			}
		};

	});
})

.controller('ItemLeaveCtrl',function($scope,$cordovaNetwork,$stateParams,$ionicPopup,$ionicPlatform,WorkFlowService,$filter){
	$ionicPlatform.ready(function(){

		$scope.LeaveDetails = {};
		$scope.LeaveHistories = [];
		//actiontype : 2 = approve , 5 = reject , 3 = acknowledge
		$scope.popUpDetails = {title:'',subtitle:'',actiontype:0};
		$scope.action = {remark:''};

		//Accordion-Code
		$scope.initialHistoryGroup = function (){
			$scope.historyGroups = [];
			$scope.historyGroups[0] = {name: 'ประวัติ',items: []};
		};

		$scope.initialHistoryGroup();
		
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
	  	//Accordion-Code

		$scope.noInternet = false;
		//if no internet connection
		if(!CheckNetwork($cordovaNetwork)){
		  $scope.noInternet = true;
		  OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
		}
		else{
			$scope.documentId = $stateParams.documentId;
	    	$scope.nextLevel = ''; //$stateParams.nextLevel;
	    	$scope.categoryId = 4;
	    	$scope.EmplCode = window.localStorage.getItem("CurrentUserName");

			WorkFlowService.ViewOnLeave($scope.EmplCode,$scope.documentId,$scope.nextLevel).then(function(response){
				if(response != null && response.data != null) {
					//initial leave details
					InitialLeaveDetails(response.data);
					//initial leave history
					WorkFlowService.ViewHistoryMyTask($scope.documentId,$scope.nextLevel,$scope.EmplCode).then(function(response){
						if(response != null && response.data != null){
							InitialLeaveHistory(response.data);
							//post to mark readed this document
							WorkFlowService.UpdateReadMytask($scope.EmplCode,$scope.documentId);
					};
				});
				}
			});
		}

		$scope.confirmApproveOrReject = function(isApprove){
	    	WorkFlowService.confirmApproveOrReject(isApprove,$scope);
	    };

	    $scope.confirmAcknowledge = function(){
	    	WorkFlowService.confirmAcknowledge($scope);
	    };

	    function InitialLeaveDetails (data) {
	    	$scope.LeaveDetails.Empl_Code = data[0].Empl_Code;
			$scope.LeaveDetails.LeaveCode = data[0].LeaveCode;
			$scope.LeaveDetails.Reason = data[0].Reason;
			$scope.LeaveDetails.FromDate = GetThaiDateByDate($filter,data[0].FromDate);
			$scope.LeaveDetails.ToDate = GetThaiDateByDate($filter,data[0].ToDate);
			$scope.LeaveDetails.Contact = data[0].Contact;
			$scope.LeaveDetails.Duration = data[0].Duration;
	    };

	    function InitialLeaveHistory (data) {
	    	$scope.showBtnAcknowledgment = data.Acknowledgment;
			$scope.showBtnApprove = data.Approve;
			$scope.stateNextLevel = data.StateNextLevel;

			$scope.LeaveDetails.DocumentTitle = data.HistoryWorkflow[0].DocumentTitle;
			$scope.LeaveDetails.DocumentDescription = data.HistoryWorkflow[0].DocumentDescription;

			angular.forEach(data.HistoryWorkflow,function(value,key){
	        	$scope.historyGroups[0].items.push({
		    		UpdateBy:value.UpdateBy,
		    		UpdateDate:GetThaiDateTimeByDate($filter,value.UpdateDate),
		    		ActionTypeName:value.ActionTypeName,
		    		RouteName:value.RouteName
		    	});	
	      	});
	    };

	});
})

.controller('CreateTimeWorkCtrl',function($scope,$cordovaNetwork,$stateParams,$ionicPopup,$ionicPlatform,WorkFlowService,$filter,ionicDatePicker,APIService,$location){

	$scope.searchEmp = {searchTxt:'',result:''};
	$scope.ddlStartTimesData = {selectedOptions:{},options:[]};
	$scope.ddlEndTimesData = {selectedOptions:{},options:[]};
	$scope.timework = {type:1,reasoncode:1,reason:''};
	$scope.selectedDate = {startDate:GetCurrentDate().toString(),endDate:GetCurrentDate().toString()};
	$scope.Empl_Code = window.localStorage.getItem("CurrentUserName");

	var datePicker1 = {callback: function (val) { SetSelectedDate(val,true);}};

	var datePicker2 = {callback: function (val) { SetSelectedDate(val,false);}};

	$scope.OpenDatePicker = function(isStartDate){
		if(isStartDate) ionicDatePicker.openDatePicker(datePicker1);
		else ionicDatePicker.openDatePicker(datePicker2);
	};

	function SetSelectedDate (val,isStartDate) {
		var selectedDate = new Date(val);
		var result = ConvertDateObjToSlashFormat(selectedDate);
		if(isStartDate) $scope.selectedDate.startDate = result;
		else $scope.selectedDate.endDate = result;
	};

	$scope.BindDDLTimes = function(ddl,isStartDate){
		ddl.options.push({name:'08:00',val:'080000'});
		ddl.options.push({name:'09:00',val:'090000'});
		ddl.options.push({name:'10:00',val:'100000'});
		ddl.options.push({name:'11:00',val:'110000'});
		ddl.options.push({name:'12:00',val:'120000'});
		ddl.options.push({name:'13:00',val:'130000'});
		ddl.options.push({name:'14:00',val:'140000'});
		ddl.options.push({name:'15:00',val:'150000'});
		ddl.options.push({name:'16:00',val:'160000'});
		ddl.options.push({name:'17:00',val:'170000'});
		if(isStartDate) ddl.selectedOptions = {name:'08:00',val:'080000'};
		else ddl.selectedOptions = {name:'17:00',val:'170000'};
	};

	$scope.searchEmployee = function(){
		APIService.searchEmployee($scope.searchEmp.searchTxt).then(function(response){
			if(response != null) $scope.searchEmp.result = response;
			else $scope.searchEmp.result = '';
		});
	};

	$scope.CreateTimeWork = function(){
		if(!$scope.CheckIsValid()) return;

		var details = $scope.GetDocumentDescription();
		
		IonicConfirm($ionicPopup,'สร้างรายการลงเวลา','ต้องการสร้างข้อมูล' + details + ' ?',function(){
			console.log($scope.timework.reason);
			var data = {
					CategoryId:3,
					RegisterId:window.localStorage.getItem("GCMToken"),
					TimeWorkModel:{
						DocumentTitle:'ลงเวลาการทำงาน',
						DocumentDescription:details,
						Empl_Code:$scope.Empl_Code,
						TimeCode:$scope.timework.type,
						ReasonCode:$scope.timework.reasoncode,
						FromDate:$scope.selectedDate.startDate.toString().replace(new RegExp('/','g'),'') + $scope.ddlStartTimesData.selectedOptions.val,
						ToDate:$scope.selectedDate.endDate.toString().replace(new RegExp('/','g'),'') + $scope.ddlEndTimesData.selectedOptions.val,
						TimeWith:(!$scope.searchEmp.searchTxt || $scope.searchEmp.searchTxt.length <= 0) ? '-' : $scope.searchEmp.searchTxt,
						Reason:($scope.timework.reasoncode == 6 ) ? $scope.timework.reason : ''
					}
				};
			WorkFlowService.CreateWorkFlow(data).then(function(response){
				//check response from server if have warn from server then show alert('message') before redirect to selfservicelist
				if(response != null) $location.path('/app/selfservicelist/3');
			},function(error){console.log(error);IonicAlert($ionicPopup,'ไม่สามารถทำรายการได้/โปรดลองใหม่อีกครั้ง',null);});
		});

	};

	$scope.GetDocumentDescription = function(){
		var message,typeName,reasonTxt;
		typeName = ($scope.timework.type == 1 ? 'เข้า' : 'ออก');
		if($scope.timework.reasoncode == 1) reasonTxt = 'อบรม';
		else if($scope.timework.reasoncode == 2) reasonTxt = 'ปฏิบัติงานนอกสถานที่';
		else if($scope.timework.reasoncode == 3) reasonTxt = 'บัตรบันทึกเวลาชำรุด';
		else if($scope.timework.reasoncode == 4) reasonTxt = 'เครื่องบันทึกเวลาขัดข้อง';
		else if($scope.timework.reasoncode == 5) reasonTxt = 'ลืมนำบัตรมา';
		else if($scope.timework.reasoncode == 6) reasonTxt = 'อื่นๆ';
		message = 'บันทึกลงเวลา' + typeName + ' เนื่องจาก ' + reasonTxt + ' ในวันที่ ' + $scope.selectedDate.startDate + ' เวลา ' + $scope.ddlStartTimesData.selectedOptions.name + ' จนถึงวันที่ ' + $scope.selectedDate.endDate + ' เวลา ' + $scope.ddlEndTimesData.selectedOptions.name + ' บันทึกลงเวลากับพนักงานรหัส ' + $scope.searchEmp.searchTxt;
		return message;
	};

	$scope.CheckIsValid = function(){
		// if(!$scope.searchEmp.searchTxt || $scope.searchEmp.searchTxt.length <= 0) 
		// {
		// 	alert('ต้องกรอกรหัสพนักงานที่บันทึกเวลาด้วย!');
		// 	return false;
		// }
		if($scope.Empl_Code == $scope.searchEmp.searchTxt){
			IonicAlert($ionicPopup,'ห้ามใส่รหัสพนักงานของตัวเอง!',null);
			return false;
		}
		return true;
	};

	$scope.BindDDLTimes($scope.ddlStartTimesData,true);
	$scope.BindDDLTimes($scope.ddlEndTimesData,false);

})

.controller('ItemTimeWorkCtrl',function($scope,$cordovaNetwork,$stateParams,$ionicPopup,$ionicPlatform,WorkFlowService,$filter){
	$ionicPlatform.ready(function(){
		$scope.TimeWorkDetails = {};
		$scope.TimeWorkHistories = [];
		//actiontype : 2 = approve , 5 = reject , 3 = acknowledge
		$scope.popUpDetails = {title:'',subtitle:'',actiontype:0};
		$scope.action = {remark:''};

		//Accordion-Code
		$scope.initialHistoryGroup = function (){
			$scope.historyGroups = [];
			$scope.historyGroups[0] = {name: 'ประวัติ',items: []};
		};

		$scope.initialHistoryGroup();
		
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
	  	//Accordion-Code

		$scope.noInternet = false;
		//if no internet connection
		if(!CheckNetwork($cordovaNetwork)){
		 	$scope.noInternet = true;
		 	OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
		}
		else{
			$scope.documentId = $stateParams.documentId;
	    	$scope.nextLevel = $stateParams.nextLevel;
	    	$scope.categoryId = 3;
	    	$scope.EmplCode = window.localStorage.getItem("CurrentUserName");

	    	WorkFlowService.ViewTimeWork($scope.EmplCode,$scope.documentId,$scope.nextLevel).then(function(response){
	    		if(response != null && response.data != null) $scope.InitialTimeWorkDetails(response.data);
	    		WorkFlowService.ViewHistoryMyTask($scope.documentId,$scope.nextLevel,$scope.EmplCode).then(function(response){
					if(response != null && response.data != null){
						$scope.InitialTimeWorkHistory(response.data);
						//post to mark readed this document
						WorkFlowService.UpdateReadMytask($scope.EmplCode,$scope.documentId);
					};
				});
	    	});
		}

		$scope.InitialTimeWorkDetails = function(data){
			$scope.TimeWorkDetails.Empl_Code = data[0].Empl_Code;
			$scope.TimeWorkDetails.Reason = data[0].ReasonCode;
			$scope.TimeWorkDetails.TimeCode = data[0].TimeCode;
			$scope.TimeWorkDetails.StartDate = GetThaiDateTimeByDate($filter,data[0].FromDate);
			$scope.TimeWorkDetails.EndDate = GetThaiDateTimeByDate($filter,data[0].ToDate);
			$scope.TimeWorkDetails.TimeWith = data[0].TimeWith;
		};

		$scope.InitialTimeWorkHistory = function(data){
			$scope.showBtnAcknowledgment = data.Acknowledgment;
			$scope.showBtnApprove = data.Approve;
			$scope.stateNextLevel = data.StateNextLevel;

			$scope.TimeWorkDetails.DocumentTitle = data.HistoryWorkflow[0].DocumentTitle;
			$scope.TimeWorkDetails.DocumentDescription = data.HistoryWorkflow[0].DocumentDescription;

			angular.forEach(data.HistoryWorkflow,function(value,key){
	        	$scope.historyGroups[0].items.push({
		    		UpdateBy:value.UpdateBy,
		    		UpdateDate:GetThaiDateTimeByDate($filter,value.UpdateDate),
		    		ActionTypeName:value.ActionTypeName,
		    		RouteName:value.RouteName
		    	});	
	      	});
		};

		$scope.confirmApproveOrReject = function(isApprove){
	    	WorkFlowService.confirmApproveOrReject(isApprove,$scope);
	    };

	});
})