var standardPrefix = ['http://','https://','matmsg:','tel:','smsto:','geo:','mecard:'];

angular.module('starter')

.config(function($stateProvider) {
	$stateProvider
		.state('app.qrcode', {
		    url: '/qrcode',
		    views: {
		      'menuContent': {
		        templateUrl: 'templates/qrcode/qrcode.html',
		        controller:'QRCodeCtrl'
		      }
		    }
		})
		.state('app.genqrcode', {
		    url: '/genqrcode',
		    views: {
		      'menuContent': {
		        templateUrl: 'templates/qrcode/genqrcode.html',
		        controller:'QRCodeCtrl'
		      }
		    }
		})
			.state('app.genqremployee', {
			        url: '/renderqrcode/:qrtype',
			        views: {
			          'menuContent': {
			            templateUrl: 'templates/qrcode/renderqrcode.html',
			            controller:'GenQRCodeCtrl'
			          }
			        }
			})
		.state('app.readqrcode', {
		    url: '/readqrcode',
		    views: {
		      'menuContent': {
		        templateUrl: 'templates/qrcode/readqrcode.html',
		        controller:'ReadQRCodeCtrl'
		      }
		    }
		})
})

.controller('QRCodeCtrl',function($scope,$cordovaBarcodeScanner){
   	//$scope.isAuthen = AuthService.isAuthenticated();
   	$scope.empId = window.localStorage.getItem("CurrentUserName");
})

.controller('GenQRCodeCtrl',function($scope,ionicDatePicker,APIService,$ionicPopup,$cordovaNetwork,$stateParams){
	$scope.QRSrc = '';
	$scope.QRType = $stateParams.qrtype;
	$scope.headerTxt = '';

	$scope.GenEmplooyeeQRCode = function(){
		var employeeNumber = PadString(window.localStorage.getItem("CurrentUserName"),"0000000000");
		var employeeNumberdata = {"ContentCode":2,DataTpe:2,BindingDataType02:{EmployeeID: employeeNumber}};
		POSTRenderQRCode(employeeNumberdata,function(response){
			$scope.QRSrc = 'data:image/png;base64,' + response.data;
		},function(error){});
	};

	$scope.GenEmplooyeeCardQRCode = function() {
		var data = {ObjectQRType:3,URLViewModel:{URL:'http://eservice2.airportthai.co.th/m/emp.aspx/' + window.localStorage.getItem('CurrentUserName')}};
		POSTGenerateQRCode(data,function(response){
			$scope.QRSrc = 'data:image/png;base64,' + response.data;
		},function(error){});
	};

	$scope.ProcessGenQRCode = function(){
		switch (+$scope.QRType) {
		    case 1:
		        $scope.headerTxt = 'สร้างรหัสพนักงาน';
		        $scope.GenEmplooyeeQRCode();
		        break;
		    case 2:
		        $scope.headerTxt = 'นามบัตรพนักงาน';
		        $scope.GenEmplooyeeCardQRCode();
		        break;
		}
	};
 	
	//do process
	$scope.ProcessGenQRCode();

	function POSTRenderQRCode(data,SuccessCB,ErrorCB) {
		var url = APIService.hostname() + '/RenderQRAndBarcode';
		APIService.ShowLoading();
		APIService.httpPost(url,data,function(response){
			APIService.HideLoading();
			SuccessCB(response);
		},function(error){console.log(error);APIService.HideLoading();ErrorCB(ErrorCB)});
	};

	function POSTGenerateQRCode(data,SuccessCB,ErrorCB) {
		var url = APIService.hostname() + '/QRCode/GenerateQR';
		APIService.ShowLoading();
		APIService.httpPost(url,data,function(response){
			APIService.HideLoading();
			SuccessCB(response);
		},function(error){console.log(error);APIService.HideLoading();ErrorCB(ErrorCB)});
	};

})

.controller('ReadQRCodeCtrl',function($scope,$cordovaBarcodeScanner,$ionicPopup,APIService,$cordovaNetwork){
	$scope.dialog = {remark:''};
	$scope.noInternet = false;

	//if no internet connection
	if(!CheckNetwork($cordovaNetwork)){
	  $scope.noInternet = true;
	  OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
	};
	
   	$scope.Scan = function(){
    	ActiveBarcodeScanner($cordovaBarcodeScanner,$ionicPopup,$scope,APIService);
   	};
})

function ActiveBarcodeScanner($cordovaBarcodeScanner,$ionicPopup,$scope,APIService){
  document.addEventListener("deviceready", function () {
     $cordovaBarcodeScanner.scan().then(function(barcodeData) {
        console.log(barcodeData);
        if(barcodeData.format == 'QR_CODE')
        	QRProcess(barcodeData.text,$ionicPopup,$scope,APIService);
      }, function(error) {
        console.log(error);
      });
  });
};

function QRProcess(qrresult,$ionicPopup,$scope,APIService){
	var standardVal = GetStandardPrefix(qrresult);
	console.log('standardVal = ' + standardVal);
	//standard process
	if(standardVal && standardVal.length > 0)
		ProcessStandardPrefix(standardVal,qrresult);
	else //aot customize process
		ProcessAOTPrefix(GetAOTPrefix(qrresult.toString()),qrresult.toString(),$ionicPopup,$scope,APIService);
};

//return standard prefix if it is.
function GetStandardPrefix(qrresult){
	var result = '';
	angular.forEach(standardPrefix,function(value,key){
		if(qrresult.toString().toLowerCase().indexOf(value) > -1) result = value;
	});
	return result;
};

function GetAOTPrefix(qrresult){
	if(qrresult.substring(0,3) != 'AOT') return null;
	return qrresult.substring(5,7);
	//return '';
};

//standard prefix process
function ProcessStandardPrefix(prefixType,qrresult){
	console.log('ProcessStandardPrefix : ' + prefixType);
	switch(prefixType){
		case 'http://':
			window.open(qrresult,'_system','location=no');
			break;
		case 'https://':
			window.open(qrresult,'_system','location=no');
			break;
		case 'matmsg:':
			var emailformat = GetEmailFormatFromQRResult(qrresult);
			window.location = emailformat;
			break;
		case 'tel:':
		case 'geo:':
			window.location = qrresult;
			break;
		case 'smsto:':
			var smsformat = GetSMSFormatFromQRResult(qrresult);
			window.location = smsformat;
			break;
		// case 'geo:':
		// 	window.location = qrresult;
		// 	break;
		case 'mecard:':
			//window.location = qrresult;
			break;
	}
};

function GetSMSFormatFromQRResult (qrresult) {
	var arrSMS = qrresult.split(':');
	console.log(arrSMS);
	var result = 'sms:' + arrSMS[1] + '?body=' + arrSMS[2];
	return result;
};

function GetEmailFormatFromQRResult (qrresult) {
	//MATMSG:TO:suchat.v26@gmail.com; SUB:Hello; BODY:Message;
	var arrEmail = qrresult.split(';');
	var to = arrEmail[0].split(':')[2];
	var subject = arrEmail[1].split(':')[1];
	var result = 'mailto:' + to + '?subject=' + subject;
	return result;
	//mailto:test@host.com?subject=testing123	
};

//AOT customize process
function ProcessAOTPrefix(prefixType,qrresult,$ionicPopup,$scope,APIService){
	console.log(prefixType,qrresult);
	switch(+prefixType) {
	    case 7:
	    	//mobile - login
	        ProcessAOTType7(qrresult,APIService,$ionicPopup);
	        break;
	}
	//redeemDuty
	//if(prefixType == 14) ProcessApproveRedeemDuty(qrresult,$ionicPopup,$scope,APIService);
};

function ProcessAOTType7(qrresult,APIService,$ionicPopup){
	APIService.ShowLoading();
	var token = qrresult.substring(7);
	var url = APIService.hostname() + '/ValidateQRCode';
	var data = {Empl_Code:window.localStorage.getItem("CurrentUserName"),Token:token};
	//post qrlogin
	APIService.httpPost(url,data,function(response){
		APIService.HideLoading();
		IonicAlert($ionicPopup,'LogIn เรียบร้อย',null);
	},
		function(error){APIService.HideLoading();console.log(error);IonicAlert($ionicPopup,error.data,null);});
};

//redeem duty
function ProcessApproveRedeemDuty (qrresult,$ionicPopup,$scope,APIService) {
	var data = {Empl_Code:+qrresult.substring(7,17),dutyDate1:qrresult.substring(19,27),Leader:qrresult.substring(17,18),redeemType:qrresult.substring(18,19)};
	if(data.redeemType == 1) data.dutyDate2 = qrresult.substring(27);
	data.dutyDate1 = data.dutyDate1.substring(0,2) + '/' + data.dutyDate1.substring(2,4) + '/' + data.dutyDate1.substring(4);
	var message = '';
	var leaderTxt = (data.Leader == 1 ? 'หัวหน้าเวร' : 'ลูกเวร');
	if(data.redeemType == 1) {
		data.dutyDate2 = data.dutyDate2.substring(0,2) + '/' + data.dutyDate2.substring(2,4) + '/' + data.dutyDate2.substring(4);
		message = data.Empl_Code + ' ต้องการแลกเวรกับคุณ ในตำแหน่ง ' + leaderTxt + ' ในวันที่ ' + data.dutyDate1 + ' กับวันที่ ' + data.dutyDate2;
	} 
	else message = data.Empl_Code + ' ต้องการแทนเวรกับคุณ ในตำแหน่ง ' + leaderTxt + ' ในวันที่ ' + data.dutyDate1;

	OpenConfirmDialog($ionicPopup,$scope,'แลก/แทนเวร',message + "<input type='text' ng-model='dialog.remark' placeholder='หมายเหตุ' />",
		function(){
			var remark = (($scope.dialog.remark && $scope.dialog.remark.length > 0) ? $scope.dialog.remark : '-');
			var Empl_Code = window.localStorage.getItem("CurrentUserName");
			POSTCheckQR(APIService,{Empl_Code:Empl_Code,ContentData:qrresult,Remark:remark},
				function(response){
					if(response) IonicAlert($ionicPopup,'แลก/แทนเวร เรียบร้อย',null);
				},
				function(error){console.log(error);});
		},function(){});
};

function POSTCheckQR (APIService,data,SuccessCB,ErrorCB) {
	APIService.ShowLoading();
	var url = APIService.hostname() + '/CheckQR';
	APIService.httpPost(url,data,function(response){SuccessCB(response);APIService.HideLoading();},function(error){ErrorCB(error);APIService.HideLoading();});
};

