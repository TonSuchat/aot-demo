/**
 * Created by danupon on 1/26/2016 AD.
 */
//pushNotification = window.plugins.pushNotification;

angular.module('starter')
.service('NotiService',function($q,APIService,$cordovaDevice){

    this.Register = function(pushNotification){
        pushNotification.register(
            onNotification,
            errorHandler,
            {
              'badge': 'true',
              'sound': 'true',
              'alert': 'true',
              'senderID': '211415803371',
              'ecb': 'onNotification'
            }
        );
    };

    this.StoreTokenOnServer = function(token,empid){
        var deviceInfo = $cordovaDevice.getDevice();
        var url = APIService.hostname() + '/DeviceRegistered/Register'
        var data = {RegisterID : token, OS : deviceInfo.platform, Model:deviceInfo.model, Serial:deviceInfo.serial, EmpID: empid};
        console.log(data);
        APIService.httpPost(url,data,function(response){},function(error){console.log(error);});
    };

    window.onNotification = function(e){
      console.log('notification received');
      console.log(e);
      switch(e.event){
        case 'registered':
          if(e.regid.length > 0){
            var device_token = e.regid;
            alert(device_token);
            console.log(device_token);
            //todo post to store token on server
            //StoreTokenOnServer(device_token,'');
          }
          break;
        case 'message':
          alert('msg received');
          alert(JSON.stringify(e));
          break;

        case 'error':
          alert('error occured');
          break;
      }
    };


    window.errorHandler = function(error){
      alert('an error occured');
    };


});



