var standardPrefix = ['http://','https://','mailto:','tel:','sms:','geo:','mecard:'];

angular.module('starter')

.controller('QRCodeCtrl',function($scope,$cordovaBarcodeScanner){
   	//$scope.isAuthen = AuthService.isAuthenticated();
})

.controller('GenQRCodeCtrl',function($scope,ionicDatePicker,APIService,$ionicPopup){

	$scope.QRSrc = '';

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

.controller('ReadQRCodeCtrl',function($scope,$cordovaBarcodeScanner,$ionicPopup,APIService){

	$scope.dialog = {remark:''};
	
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
		console.log(qrresult.toString().toLowerCase());
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
		case 'http://:':
			window.open(qrresult,'_system','location=no');
			break;
		case 'https://':
			window.open(qrresult,'_system','location=no');
			break;
		case 'mailto:':
			window.location = qrresult;
			break;
		case 'tel:':
			window.location = qrresult;
			break;
		case 'sms:':
			window.location = qrresult;
			break;
		case 'geo:':
			window.location = qrresult;
			break;
		case 'mecard:':
			//window.location = qrresult;
			break;
	}
};

//AOT customize process
function ProcessAOTPrefix(prefixType,qrresult,$ionicPopup,$scope,APIService){
	console.log(prefixType,qrresult);
	//redeemDuty
	if(prefixType == 14) ProcessApproveRedeemDuty(qrresult,$ionicPopup,$scope,APIService);
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
					if(response) alert('แลก/แทนเวร เรียบร้อย');
				},
				function(error){console.log(error);});
		},function(){});
};

function POSTCheckQR (APIService,data,SuccessCB,ErrorCB) {
	APIService.ShowLoading();
	var url = APIService.hostname() + '/CheckQR';
	APIService.httpPut(url,data,function(response){SuccessCB(response);APIService.HideLoading();},function(error){ErrorCB(error);APIService.HideLoading();});
};