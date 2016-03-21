/**
 * Created by danupon on 1/26/2016 AD.
 */
//pushNotification = window.plugins.pushNotification;
var serviceObj;
angular.module('starter')
.service('NotiService',function($q,APIService,$cordovaDevice){

    serviceObj = this;

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

    this.StoreTokenOnServer = function(token,empid,isUpdate){
        var deviceInfo = $cordovaDevice.getDevice();
        var url = '';
        if(!isUpdate) url = APIService.hostname() + '/DeviceRegistered/Register'
        else url = APIService.hostname() + '/DeviceRegistered/UpdateDevice'
        var data = {RegisterID : token, OS : deviceInfo.platform, Model:deviceInfo.model, Serial:deviceInfo.serial, EmpID: empid, RegistAction:true, DeviceName:''};
        console.log('isUpdate -> ' + isUpdate);
        console.log('empid -> ' + empid);
        console.log(data);
        APIService.httpPost(url,data,function(response){},function(error){console.log(error);});
    };

});

window.onNotification = function(e){
  // console.log('notification received');
  // console.log(e);
  switch(e.event){
    case 'registered':
      if(e.regid.length > 0){
        var device_token = e.regid;
        console.log(device_token);
         //window.localStorage.removeItem('GCMToken');
        if(window.localStorage.getItem('GCMToken') != null && window.localStorage.getItem('GCMToken').length > 0 && (window.localStorage.getItem('GCMToken') == device_token)) return;
        //set token to local storage
        window.localStorage.setItem('GCMToken',device_token);
        //post to store token on server
        serviceObj.StoreTokenOnServer(device_token,'',false);
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