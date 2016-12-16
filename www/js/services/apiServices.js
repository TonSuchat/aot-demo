angular.module('starter').service('APIService',function($http,$httpParamSerializerJQLike,$ionicLoading,$q,$ionicPopup){

    var service = this;

	this.httpPost = function(url,data,success,error){
		var searchConfig = {};
        var gcmToken = (window.localStorage.getItem('GCMToken') == null ? '' : window.localStorage.getItem('GCMToken'));
        searchConfig.headers = {'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8','RegisterID': gcmToken};
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
	    //return 'https://10.74.17.188:8443/AOTWebAPI';
        //return 'http://localhost:51754/api';
        //return 'https://eservice.airportthai.co.th/AOTWebAPI';
        return 'https://mobile.airportthai.co.th/API';
	};

	this.ShowLoading = function () {
        // Setup the loader
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0,
            template:'<img src="img/loading.gif" />'
        });
    };

    this.HideLoading = function(){
        $ionicLoading.hide();
    };

    this.searchEmployee = function(searchTxt){
        return $q(function(resolve){
            service.ShowLoading();
            var url = service.hostname() + '/ContactDirectory/viewContactPaging';
            var data = {keyword:searchTxt,start:1,retrieve:1};
            service.httpPost(url,data,
                function(response){
                    if(response != null && response.data != null){
                        var emp = response.data[0];
                        var result = emp.PrefixName + ' ' + emp.Firstname + ' ' + emp.Lastname;
                        service.HideLoading();
                        return resolve(result);
                    }
                    else{
                        IonicAlert($ionicPopup,'ไม่พบข้อมูล',null);
                        service.HideLoading();
                        return resolve(null);
                    }
                },
                function(error){
                    console.log(error);
                    IonicAlert($ionicPopup,'เกิดข้อผิดพลาดขึ้น ลองอีกครั้ง!',null);
                    service.HideLoading();
                    return resolve(null);
            })
        });
    };

});