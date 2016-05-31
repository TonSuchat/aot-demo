angular.module('starter').service('APIService',function($http,$httpParamSerializerJQLike,$ionicLoading){

	this.httpPost = function(url,data,success,error){
		var searchConfig = {};
        searchConfig.headers = {'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8'};
		$http.post(url,$httpParamSerializerJQLike(data),searchConfig).then(
        function(response){
        	success(response);
        },
        function(response){
        	error(response);
        });
	};

    this.httpGet = function(url,param,success,error){
        $http({
          method: 'GET',
          url: url,
          params: param //{json format}
        }).then(
        function(response){
            success(response);
        },
        function(response){
            error(response);
        });
    };

    this.httpPut = function(url,data,success,error){
        var searchConfig = {};
        searchConfig.headers = {'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8'};
        $http.put(url,data,searchConfig).then(
        function(response){
            success(response);
        },
        function(response){
            error(response);
        });
    };

	this.hostname = function(){
	    //return 'https://10.74.17.239:8443/AOTWebAPI2';
	    return 'https://10.74.17.188:8443/AOTWebAPI';
        //return 'http://localhost:51754/api';
        //return 'https://eservice.airportthai.co.th/AOTWebAPI';
	};

	this.ShowLoading = function () {
        // Setup the loader
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    };

    this.HideLoading = function(){
        $ionicLoading.hide();
    };

});