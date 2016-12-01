var needReload = false;

// [START get_messaging_object]
// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();
// [END get_messaging_object]

angular.module('starter')
.service('NotiService',function($q,APIService,$cordovaDevice,$rootScope,$cordovaPushV5,MobileConfigSQLite,AuthService,$ionicPopup){

    // var isAndroid = ionic.Platform.isAndroid();
    // var isIOS = ionic.Platform.isIOS();
    //var androidConfig = {"senderID": "211415803371"};
    //var iosConfig = { "badge": true,"sound": true,"alert": true };
    
    //var cordovaPushConfig = (isAndroid ? androidConfig : iosConfig);
    var serviceObj = this;

    //register gcm for mobile device
    this.Register = function(){
      return $q(function(resolve){
        console.log('register-gcm');
        var options = {
          android: {senderID: "211415803371"},
          ios: {senderID: "211415803371",gcmSandbox:"false",alert: "true",badge: "true",sound: "true"},
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
    };

    //register gcm for desktop pc
    this.DesktopRegister = function(){

      return $q(function(resolve){
          
        console.log('Requesting permission...');
        // [START request_permission & Get Token]
        messaging.requestPermission()
        .then(function() {
          console.log('Notification permission granted.');
          //get token
          console.log('Get token...');
          messaging.getToken()
          .then(function(currentToken) {
            if (currentToken) {
              console.log('currentToken',currentToken);
              serviceObj.StoreTokenOnServer(currentToken,'',false).then(function(response){resolve(response);});
              // sendTokenToServer(currentToken);
              // updateUIForPushEnabled(currentToken);
            } else {
              // Show permission request.
              console.log('No Instance ID token available. Request permission to generate one.');
              resolve(false);
            }
          })
          .catch(function(err) {
            console.log('An error occurred while retrieving token. ', err);
            resolve(false);
          });
        })
        .catch(function(err) {
          console.log('Unable to get permission to notify.', err);
          resolve(false);
        });
        // [END request_permission & Get Token]

        //on message event
        messaging.onMessage(function(payload) {
          console.log("Message received. ", payload);
          ProcessNotification(payload.data,$ionicPopup);
        });

      });
      
    }

    this.StoreTokenOnServer = function(token,empid,isUpdate){
        return $q(function(resolve){
          window.localStorage.setItem('GCMToken',token);
          console.log('StoreTokenOnServer');
          var url = '';
          if(!isUpdate) url = APIService.hostname() + '/DeviceRegistered/Register'
          else url = APIService.hostname() + '/DeviceRegistered/UpdateDevice'
          var data = {};
          if(onWeb)
            data = {RegisterID : token, OS : 'PC', Model:'-', Serial:'-', EmpID: empid, RegistAction:true, DeviceName:''};
          else{
            var deviceInfo = $cordovaDevice.getDevice();
            data = {RegisterID : token, OS : deviceInfo.platform, Model:deviceInfo.model, Serial:deviceInfo.uuid, EmpID: empid, RegistAction:true, DeviceName:''};
          }
          console.log('isUpdate -> ' + isUpdate);
          console.log('empid -> ' + empid);
          console.log(data);
          APIService.httpPost(url,data,function(response){resolve(true)},function(error){console.log(error);resolve(false);});  
        });
    };

    $rootScope.$on('$cordovaPushV5:notificationReceived', function(event, notification) {
      console.log(notification);
      ProcessNotification(notification,$ionicPopup);

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

    function ProcessNotification(data,$ionicPopup){

      var alertType = (onWeb) ? data.alertType : data.additionalData.alertType;
      var messageType = (onWeb) ? data.messageType : data.additionalData.messageType;
      var menu = (onWeb) ? data.menu : data.additionalData.menu;

      //check if force logout from server
      if(alertType == "9"){
        if(AuthService.isAuthenticated()){
          IonicAlert($ionicPopup,data.message,function(){AuthService.logout(true);return;});
        }
        else return;
      }
      //check if messageType is hyperlink
      if(messageType.type == "1"){
        IonicConfirm($ionicPopup,'แจ้งเตือน','ต้องการเปิด link : ' + messageType.optData + ' ?',function(){
          window.open(messageType.optData,'_system','location=no');
        });  
      }
      else{
        //check if need to confirm and redirect to specific path
        if(alertType == "1"){
          IonicConfirm($ionicPopup,'แจ้งเตือน','ต้องการดูข้อมูล : ' + data.title + ' ?',function(){
            ProcessRedirect(menu);
          });
        }
        //just show message
        else IonicAlert($ionicPopup,data.message,null);
      }
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

function ProcessRedirect(url) {
  if(!url || url.length <= 0) return;
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
    var nextLevel = ''; //urlDetails[4];
    switch(+categoryId){
      case 1:
        window.location.href = '#/app/ssitem_redeemduty?documentId=' + documentId + '&nextLevel=' + nextLevel;
        break;
      case 2:
        window.location.href = '#/app/ssitem_cardrequest?documentId=' + documentId + '&nextLevel=' + nextLevel;
        break;
      case 3:
        window.location.href = '#/app/ssitem_timework?documentId=' + documentId + '&nextLevel=' + nextLevel;
        break;
      case 4:
        window.location.href = '#/app/ssitem_leave?documentId=' + documentId + '&nextLevel=' + nextLevel;
        break;
    }
  }
};

