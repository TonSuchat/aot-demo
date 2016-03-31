angular.module('starter')
	.run(function($httpBackend,$http,$httpParamSerializerJQLike,APIService){

		var apiTokenURL = APIService.hostname() + '/Token';
		var loginURL = APIService.hostname() + '/Authen/AuthenUser';
		var userprofileURL = APIService.hostname() + '/ContactDirectory/viewContactPaging';
		var syncValueGetURL = APIService.hostname() + '/SyncData/SyncValue';
		var stockURL = APIService.hostname() + '/Stocks/getAOTStockLive';

		var getEmpsInRoom = APIService.hostname() + '/PM/GetEmpInRoom';

		//get api token
		$httpBackend.whenPOST(apiTokenURL).respond(function(method,url,data,headers){
			return [200,true,{}];
		});
		//log in
		$httpBackend.whenPOST(loginURL).respond(function(method,url,data,headers){
			return [200,true,{}];
		});
		//userprofile
		$httpBackend.whenPOST(userprofileURL).respond(function(method,url,data,headers){
			return [200,fakeUserProfile,{}];
		});
		//sync get data from server
		$httpBackend.whenPOST(syncValueGetURL).respond(function(method,url,data,headers){
			switch(GetObjectId(data)){
				//Medical
				case 1:
					return [200,fakeMedicals,{}];
					break;
				//Time
				case 2:
					return [200,fakeTimes,{}];
					break;
				//Circular
				case 3:
					return [200,fakeCirculars,{}];
					break;
				//Leave
				case 4:
					return [200,fakeLeaves,{}];
					break;
				//Leave
				case 5:
					return [200,fakeRoyals,{}];
					break;
				//Tuition
				case 6:
					return [200,fakeTuitions,{}];
					break;
				//News
				case 8:
					return [200,fakeNews,{}];
					break;
				//PMRoom
				case 9:
					return [200,fakePMRooms,{}];
					break;
				//PMMsg
				case 10:
					return [200,fakePMMsgs,{}];
					break;
				default:
					return [404,{},{}];
			};
		});
		//stock price
		$httpBackend.whenPOST(stockURL).respond(function(method,url,data,headers){
			return [200,fakeStock,{}];
		});
		//get emp in room
		$httpBackend.whenPOST(getEmpsInRoom).respond(function(method,url,data,headers){
			return [200,fakeGetEMPsInRoom,{}];
		});
		//templates
		$httpBackend.whenGET(/templates\/\w+.*/).passThrough();

	 });


function GetObjectId(data){
	var lastIndex = data.indexOf('&');
	var startIndex = data.indexOf('=');
	return parseInt(data.substring(startIndex + 1,lastIndex));
};