/**
 * Created by danupon on 1/26/2016 AD.
 */
//pushNotification = window.plugins.pushNotification;

angular.module('starter')
.service('NotiService',function(){

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

});

window.onNotification = function(e){

  console.log('notification received');

  switch(e.event){
    case 'registered':
      if(e.regid.length > 0){
        var device_token = e.regid;
        alert(device_token);
        console.log(device_token);
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
}


