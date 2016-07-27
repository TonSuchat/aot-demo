var needReload = false;

angular.module('starter')
.service('NotiService',function($q,APIService,$cordovaDevice,$rootScope,$cordovaPushV5,MobileConfigSQLite,AuthService){

    // var isAndroid = ionic.Platform.isAndroid();
    // var isIOS = ionic.Platform.isIOS();
    //var androidConfig = {"senderID": "211415803371"};
    //var iosConfig = { "badge": true,"sound": true,"alert": true };
    
    //var cordovaPushConfig = (isAndroid ? androidConfig : iosConfig);
    var serviceObj = this;

    this.Register = function(){
      return $q(function(resolve){
        console.log('register-gcm');
        var options = {
          android: {senderID: "211415803371",sound: false,vibrate: false},
          ios: {alert: "true",badge: "true",sound: false},
          windows: {}
        };
        // initialize
        $cordovaPushV5.initialize(options).then(function(){
          // start listening for new notifications
          $cordovaPushV5.onNotification();
          // start listening for errors
          $cordovaPushV5.onError();
          // register to get registrationId
          $cordovaPushV5.register().then(function(data) {
            // `data.registrationId` save it somewhere;
            console.log('GCM Token : ' + data);
            serviceObj.StoreTokenOnServer(data,'',false).then(function(response){resolve(response);});
          })
        });
      });
      
      // GetNotificationSettings().then(function(response){
      //   if(response != null){
      //     var options = {
      //       android: {senderID: "211415803371",sound: false,vibrate: false},
      //       ios: {alert: "true",badge: "true",sound: response.sound},
      //       windows: {}
      //     };
          
      //   }
      // })
      
        // $cordovaPush.register(cordovaPushConfig).then(function(result) {
        //   // Success
        //   //if ios this result is device token
        //   if(isIOS){
        //     //set token to localStorage
        //     window.localStorage.setItem('GCMToken',result);
        //     //save token without empid ,Update empid when login completed
        //     serviceObj.StoreTokenOnServer(result,'',false);
        //   };
        //   console.log('register-success');
        // }, function(err) {
        //   console.log('register-error',err);
        // })
    };

    this.StoreTokenOnServer = function(token,empid,isUpdate){
        return $q(function(resolve){
          window.localStorage.setItem('GCMToken',token);
          console.log('StoreTokenOnServer');
          var deviceInfo = $cordovaDevice.getDevice();
          var url = '';
          if(!isUpdate) url = APIService.hostname() + '/DeviceRegistered/Register'
          else url = APIService.hostname() + '/DeviceRegistered/UpdateDevice'
          var data = {RegisterID : token, OS : deviceInfo.platform, Model:deviceInfo.model, Serial:deviceInfo.serial, EmpID: empid, RegistAction:true, DeviceName:''};
          console.log('isUpdate -> ' + isUpdate);
          console.log('empid -> ' + empid);
          console.log(data);
          APIService.httpPost(url,data,function(response){resolve(true)},function(error){console.log(error);resolve(false);});  
        });
    };

    $rootScope.$on('$cordovaPushV5:notificationReceived', function(event, notification) {
      console.log(notification);
      ProcessNotification(notification);

      // //android part
      // if(isAndroid){
      //     switch(notification.event) {
      //       case 'registered':
      //         if (notification.regid.length > 0 ) {
      //           console.log('gcmtoken : ' + notification.regid)
      //           //set token to localStorage
      //           window.localStorage.setItem('GCMToken',notification.regid);
      //           //save token without empid ,Update empid when login completed
      //           serviceObj.StoreTokenOnServer(notification.regid,'',false);
      //         }
      //         break;
      //       case 'message':
      //         // this is the actual push notification. its format depends on the data model from the push server
      //         console.log(notification);
      //         ProcessNotification(notification.payload);
      //         break;
      //       case 'error':
      //         console.log('GCM error = ' + notification.msg);
      //         break;

      //       default:
      //         console.log('An unknown GCM event has occurred');
      //         break;
      //     }
      // }
      // else if(isIOS){
      //   //ios part
      //   if (notification.alert) {
      //     alert(notification.alert);
      //   }
      //   if (notification.sound) {
      //     var snd = new Media(event.sound);
      //     snd.play();
      //   }
      //   if (notification.badge) {
      //     $cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
      //       // Success!
      //     }, function(err) {
      //       // An error occurred. Show a message to the user
      //     });
      //   }
      // }

    });

    //triggered every time error occurs
    $rootScope.$on('$cordovaPushV5:errorOcurred', function(event, e){
      console.log(e.message);
    });

    function GetNotificationSettings () {
      return $q(function(resolve){
        var notification_config = {};
        //sound
        MobileConfigSQLite.GetValueByKey('notification_sound').then(function(response){
          if(response != null){
             notification_config.sound = ConvertQueryResultToArray(response)[0].value;
             resolve(notification_config);
          }
          //vibrate
        });
      });
    };


});
// /**
//  * Created by danupon on 1/26/2016 AD.
//  */
// //pushNotification = window.plugins.pushNotification;
// var serviceObj;
// var needReload = false;

// angular.module('starter')
// .service('NotiService',function($q,APIService,$cordovaDevice,$rootScope){

//     serviceObj = this;

//     this.Register = function(pushNotification){
//         pushNotification.register(
//             onNotification,
//             errorHandler,
//             {
//               'badge': 'true',
//               'sound': 'true',
//               'alert': 'true',
//               'senderID': '211415803371',
//               'ecb': 'onNotification'
//             }
//         );
//     };

//     this.StoreTokenOnServer = function(token,empid,isUpdate){
//         console.log('StoreTokenOnServer');
//         var deviceInfo = $cordovaDevice.getDevice();
//         var url = '';
//         if(!isUpdate) url = APIService.hostname() + '/DeviceRegistered/Register'
//         else url = APIService.hostname() + '/DeviceRegistered/UpdateDevice'
//         var data = {RegisterID : token, OS : deviceInfo.platform, Model:deviceInfo.model, Serial:deviceInfo.serial, EmpID: empid, RegistAction:true, DeviceName:''};
//         console.log('isUpdate -> ' + isUpdate);
//         console.log('empid -> ' + empid);
//         console.log(data);
//         APIService.httpPost(url,data,function(response){},function(error){console.log(error);});
//     };

// });

// window.onNotification = function(e){
//   // console.log('notification received');
//   // console.log(e);
//   switch(e.event){
//     case 'registered':
//       if(e.regid.length > 0){
//         var device_token = e.regid;
//         console.log('GCM Token = ' + device_token);
//          //window.localStorage.removeItem('GCMToken');
//         if(window.localStorage.getItem('GCMToken') != null && window.localStorage.getItem('GCMToken').length > 0 && (window.localStorage.getItem('GCMToken') == device_token)) return;
//         //set token to local storage
//         window.localStorage.setItem('GCMToken',device_token);
//         //post to store token on server
//         serviceObj.StoreTokenOnServer(device_token,'',false);
//       }
//       break;
//     case 'message':
//       // alert('msg received');
//       // alert(JSON.stringify(e));

//       ProcessNotification(e.payload)
//       break;

//     case 'error':
//       alert('error occured');
//       break;
//   }
// };

// window.errorHandler = function(error){
//   alert('an error occured');
// };


function ProcessNotification(data){
  //check if force logout from server
  if(data.additionalData.alertType == "9"){
    if(AuthService.isAuthenticated()){
      alert(data.message);
      AuthService.logout();
      return;
    }
  }
  //check if messageType is hyperlink
  if(data.additionalData.messageType.type == "1"){
    if(confirm('ต้องการเปิด link : ' + data.additionalData.messageType.optData + ' ?'))
      window.open(data.additionalData.messageType.optData,'_system','location=no');
  }
  else{
    //check if need to confirm and redirect to specific path
    if(data.additionalData.alertType == "1"){
      if(confirm('ต้องการดูข้อมูล : ' + data.title + ' ?')){
        // //check is selfservice menu, Yes redirect with other logic, No redirect by link
        // if(CheckURLIsSelfService(data.additionalData.menu)) RedirectSelfServiceMenu(data.additionalData.menu);
        // else{
        //   needReload = true;
        //   window.location.href = '#/app' + data.additionalData.menu;  
        // }
        ProcessRedirect(data.additionalData.menu);
      }
    }
    //just show message
    else alert(data.message);
  }
};

function ProcessRedirect(url) {
  //check is selfservice menu, Yes redirect with other logic, No redirect by link
  if(CheckURLIsSelfService(url)) RedirectSelfServiceMenu(url);
  else{
    needReload = true;
    window.location.href = '#/app' + url;  
  }
};

function CheckURLIsSelfService (url) {
  if(url.toString().indexOf('/ess/') >= 0) return true;
  else return false;
};

function RedirectSelfServiceMenu (url) {
  var urlDetails = url.split('/');
  if(urlDetails.length > 0){
    var categoryId = urlDetails[2];
    var documentId = urlDetails[3];
    var nextLevel = urlDetails[4];
    switch(+categoryId){
      case 1:
        window.location.href = '#/app/ssitem_redeemduty?documentId=' + documentId + '&nextLevel=' + nextLevel;
        break;
      case 2:
        window.location.href = '#/app/ssitem_cardrequest?documentId=' + documentId + '&nextLevel=' + nextLevel;
        break;
    }
  }
};