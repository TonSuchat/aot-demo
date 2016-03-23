angular.module('starter')

.controller('PrivateMessagesCtrl',function($scope,$cordovaBarcodeScanner){
         
})
.controller('PrivateMessageDetailCtrl',function($scope,$ionicScrollDelegate){
	var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
	$scope.message = '';
    $scope.msgDetails = [];
    $scope.msgDetails.push({side:'left',msg:'asdasdasd',msgDate:'22/3/2016 16:22'});
    $scope.msgDetails.push({side:'right',msg:'Lorem ipsum dolor',msgDate:'22/3/2016 16:22'});
    $scope.msgDetails.push({side:'left',msg:'asdasdasd',msgDate:'22/3/2016 16:22'});
    $scope.msgDetails.push({side:'right',msg:'Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor',msgDate:'22/3/2016 16:22'});

    $scope.sendMessage = function(){
    	$scope.msgDetails.push({side:'right',msg:$scope.message,msgDate:GetCurrentDate() + ' ' + GetCurrentTime()});
    	viewScroll.scrollBottom(true);
    	$scope.message = '';
    };


})