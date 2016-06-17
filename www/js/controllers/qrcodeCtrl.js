var standardPrefix = ['http://','https://','mailto:','tel:','sms:','geo:','mecard:'];

angular.module('starter')

.controller('QRCodeCtrl',function($scope,$cordovaBarcodeScanner){
   	
   	
})

.controller('GenQRCodeCtrl',function($scope,ionicDatePicker){

	//*******************Duty*******************
   	$scope.swapDuty = {type:1};
   	$scope.selectedDate = {dutyDate1:'',dutyDate2:''};

   	var datePicker1 = {callback: function (val) { 
		SetSelectedDate(val,true);
	}};

	var datePicker2 = {callback: function (val) { 
		SetSelectedDate(val,false);
	}};

	$scope.OpenDatePicker = function(isDutyDate1){
		if(isDutyDate1) ionicDatePicker.openDatePicker(datePicker1);
		else ionicDatePicker.openDatePicker(datePicker2);
	};

	function SetSelectedDate (val,isDutyDate1) {
		var selectedDate = new Date(val);
		var day = selectedDate.getDate();
		var month = (selectedDate.getUTCMonth() + 1);
		month = (month.length == 1 ? '0' + month.toString() : month);
		var year = selectedDate.getFullYear();
		var result = day + '/' + month + '/' + year;
		if(isDutyDate1) $scope.selectedDate.dutyDate1 = result;
		else $scope.selectedDate.dutyDate2 = result;
	};
	//*******************Duty*******************

})

.controller('ReadQRCodeCtrl',function($scope,$cordovaBarcodeScanner){
   	$scope.Scan = function(){
    	ActiveBarcodeScanner($cordovaBarcodeScanner);
   	};
})

function ActiveBarcodeScanner($cordovaBarcodeScanner){
  document.addEventListener("deviceready", function () {
     $cordovaBarcodeScanner.scan().then(function(barcodeData) {
        console.log(barcodeData);
        if(barcodeData.format == 'QR_CODE')
        	QRProcess(barcodeData.text);
      }, function(error) {
        console.log(error);
      });
  });
};

function QRProcess(qrresult){
	var standardVal = GetStandardPrefix(qrresult);
	console.log('standardVal = ' + standardVal);
	//standard process
	if(standardVal && standardVal.length > 0)
		ProcessStandardPrefix(standardVal,qrresult);
	else //aot customize process
		ProcessAOTPrefix(GetAOTPrefix(qrresult),qrresult);
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
	return '';
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
function ProcessAOTPrefix(prefixType,qrresult){

};