angular.module('starter')

.controller('PrivateMessageRoomsCtrl',function($scope,$ionicPlatform,SyncService,PMRoomSQLite,APIService,$cordovaNetwork,$ionicPopup){
    
    $ionicPlatform.ready(function(){

        //if no internet connection
        if(!CheckNetwork($cordovaNetwork)){
             OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
        };
          
        $scope.haveMoreData = false;
        $scope.isfirstLoad = true;
        $scope.roomsDetail = [];
        $scope.allRooms = [];
        $scope.scrollDetails = {start:1,retrieve:10};

        APIService.ShowLoading();
        //sync rooms and insert/update room to sqlite
        SyncService.SyncPMRoom().then(
            function(){
                //select all rooms from sqlite and bind to roomsDetail        
                PMRoomSQLite.GetAll().then(
                    function(response){
                        if(response.rows != null) {
                            $scope.allRooms = ConvertQueryResultToArray(response);
                            $scope.roomsDetail = GetInfiniteScrollData($scope.allRooms,$scope.scrollDetails.start,$scope.scrollDetails.retrieve);
                            $scope.haveMoreData = (($scope.scrollDetails.start + $scope.scrollDetails.retrieve) < $scope.allRooms.length) ? true : false;
                            FinalAction($scope, APIService);
                        }
                },function(){FinalAction($scope, APIService);});
        },function(){FinalAction($scope, APIService);});

         //this function trigger by ng-infinite-scroll (when scrolled to bottom)
        $scope.loadMoreData = function () {
            if ($scope.isfirstLoad) { $scope.isfirstLoad = false; $scope.$broadcast('scroll.infiniteScrollComplete'); return; }
            APIService.ShowLoading();
            //start +10
            $scope.scrollDetails.start += $scope.scrollDetails.retrieve;
            var result = GetInfiniteScrollData($scope.allRooms,$scope.scrollDetails.start,$scope.scrollDetails.retrieve);
            $scope.roomsDetail = ($scope.roomsDetail.length > 0) ? $scope.roomsDetail.concat(result) : result;
            $scope.haveMoreData = (($scope.scrollDetails.start + $scope.scrollDetails.retrieve) < $scope.allRooms.length) ? true : false;
            FinalAction($scope, APIService);
        };

    });
})
.controller('PrivateMessagesCtrl',function($scope,$ionicScrollDelegate,$stateParams,PMMsgSQLite,$filter,APIService,$ionicPlatform,SyncService,socketFactory,$rootScope,PMRoomSQLite,$ionicPopover,$cordovaNetwork,$ionicPopup,PMSubscribeSQLite){
    $ionicPlatform.ready(function(){

        //popover private message menus
        $ionicPopover.fromTemplateUrl('templates/PMMenus.html', {scope: $scope,}).then(function(popover) { $scope.popover = popover; });

        $scope.noInternet = false;
        //if no internet connection
        if(!CheckNetwork($cordovaNetwork)){
            $scope.noInternet = true;
            OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
        };
        
        var socket = io.connect('http://10.74.17.233:1150');

        $scope.roomId = $stateParams.roomId
        $scope.empId = '484074'; //AuthService.username() **Hard-Code**
        $scope.message = '';
        $scope.msgDetails = [];
        $scope.allMsg = [];
        $scope.allSubscribe = [];
        $scope.scrollDetails = {start:0,retrieve:10};
        var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');

        //Set roomName
        SetRoomName($scope,PMRoomSQLite);

        //sync msg and insert/update into sqlite (post to api number 34 to bulk update and get last msg data)
        APIService.ShowLoading();
        SyncService.SyncPMMsg($scope.roomId).then(
            function(response){
                var listMsgChanged = (response != null && response.length > 0) ? response : [];
                //loop list to trigger web socket reenter_received_message
                IterationSendReEnterEvent(listMsgChanged,socket,$scope.roomId);
                //sync subscribe
                SyncService.SyncSubscribe($scope.roomId).then(function(){
                    //select all message from sqlite and bind to msgDetails
                    PMMsgInitialProcess(PMMsgSQLite,PMSubscribeSQLite,$scope,APIService,viewScroll,$filter);
                });
        });

        $scope.loadPreviousMsg = function(){
            if($scope.scrollDetails.start == 0) return FinalAction($scope,APIService);
            APIService.ShowLoading();
            if(($scope.scrollDetails.start - $scope.scrollDetails.retrieve) <= 0){
                $scope.scrollDetails.start = 0;
                $scope.scrollDetails.retrieve = $scope.scrollDetails.start;
            }
            else $scope.scrollDetails.start = ($scope.scrollDetails.start - $scope.scrollDetails.retrieve);
            var result = GetInfiniteScrollDataReverse($scope.allMsg,$scope.scrollDetails.start,$scope.scrollDetails.retrieve);
            InitialPMMsgDetails($scope,result,$scope.empId);
            FinalAction($scope,APIService);
        };

        // //sync subscribe and check this room is group/1:1
        // SyncSubscribe($scope,APIService,$scope.roomId,PMSubscribeSQLite);

        //join to current room
        socket.emit('join_room',$scope.roomId);

        $scope.sendMessage = function(){
            //gen tmpid
            var tmpId = GeneratedGUID();
            //web socket send msg
            socket.emit('send_message',$scope.roomId,$scope.message,$scope.empId,tmpId);
            //push objMSG Id,TS = null
            var senderMSG = {msgId:null,side:'right',msg:$scope.message,msgDate:'',readTotal:0,tmpId:tmpId};
            $scope.msgDetails.push(senderMSG);
            $scope.message = '';
            viewScroll.scrollBottom(true);
        };

        //push msg from sender
        socket.on('append_message',function(msg){
            console.log('append_message');
            var data = {Id:msg.Id,Empl_Code:$scope.empId,message:msg.msg,readTotal:0,roomId:$scope.roomId,DL:false,TS:msg.TS};
            msg.TS = TransformServerTSToDateTimeStr(msg.TS.toString());
            //insert msg into sqlite
            PMMsgSQLite.Add([data],false).then(function(){
                //push msg
                $scope.msgDetails.push(msg);
                viewScroll.scrollBottom(true);
                //web socket send back to update readed flag
                socket.emit('received_message',$scope.roomId,$scope.empId,msg.Id);    
            });
        });

        //append msg to sender side when insert DB success
        socket.on('send_success',function(retFromServer,recvMSG){
            var data = {Id:retFromServer.Id,Empl_Code:$scope.empId,message:retFromServer.msg,readTotal:0,roomId:$scope.roomId,DL:false,TS:retFromServer.TS};
            //save to sqlite
            PMMsgSQLite.Add([data],false).then(function(){
                //find msg in msgDetails by tmpId and edit TS,Id
                UpdateSendDateTimeToMsg($scope.msgDetails,retFromServer);
                $scope.$apply();
                viewScroll.scrollBottom(true);
                //web socket send to receiver for append message
                socket.emit('append_message_to_receiver',$scope.roomId,recvMSG);
            });
        });

        socket.on('set_readTotal',function(msgId,readTotal){
            if($scope.msgDetails == null || $scope.msgDetails.length <= 0) return;
            //set readeTotal use filter by msgid
            for (var i = 0; i <= $scope.msgDetails.length - 1; i++) {
                if(parseInt($scope.msgDetails[i].Id) == parseInt(msgId)){
                    $scope.msgDetails[i].readTotal = readTotal;
                    break;
                }
            };
            $scope.$apply();
        });

        $rootScope.$on( "$stateChangeSuccess", function(e, toState, toParams, fromState, fromParams) {
            if(fromState.url = '/pmsmsgs/:roomId'){
                socket.disconnect();
            }
        });

    });
    
})

function GetInfiniteScrollData(alldata,start,retrieve){
    var result = [];
    var lastIndex = ((start-1) + (retrieve-1));
    for (var i = start - 1; i <= lastIndex; i++) {
        if(alldata[i] != null)
            result.push(alldata[i]);
        else
            break;
    };
    return result;
};

function GetInfiniteScrollDataReverse(alldata,start,retrieve){
    var result = [];
    var counter = 0;
    for (var i = (start-1); i >= 0; i--) {
        if(counter == retrieve)
            break;
        result.push(alldata[i]);
        counter += 1;
    };
    return result;
};

// //******************************************************
// function SyncSubscribe($scope,APIService,roomId,PMSubscribeSQLite){
    
//     var url = APIService.hostname() + '/PM/GetEmpInRoom';
//     APIService.httpPost(url,{roomID:roomId},function(response){
//         if(response.data != null) {
//             if(response.data.length > 2) $scope.isGroup = true;
//             //sync subscribe
//             var directoryURL = APIService.hostname() + '/ContactDirectory/viewContactPaging';
//             angular.forEach(response.data,function(value,key){
//                 PMSubscribeSQLite.CountSubscribeByEmpId(value.Empl_Code).then(
//                     function(response){
//                         if(response != null && response.rows != null){
//                             var result = ConvertQueryResultToArray(response);
//                             if(result[0].totalCount == 0){
//                                 //get info & insert into pmsubsribe
//                                 var directoryData = {keyword:value.Empl_Code,start:1,retrieve:1};
//                                 APIService.httpPost(directoryURL,directoryData,
//                                     function(response){
//                                         var result = response.data[0];
//                                         if(response != null && response.data != null){
//                                             //convert picthumb to base64
//                                             ConvertImgPNGToBase64(result.PictureThumb,function(base64){
//                                                 if(base64 && base64.length > 0){
//                                                     //save user data to pmsubscribe
//                                                     var data = {Empl_Code:result.UserID,Firstname:result.Firstname,Lastname:result.Lastname,PictureThumb:base64};
//                                                     PMSubscribeSQLite.Add([data]);
//                                                 }
//                                             });
//                                         };
//                                     },
//                                     function(error){console.log(error);});
//                             }
//                         };
//                     });
//             });
//         }
//     },function(){});
// };
// //******************************************************

function IterationSendReEnterEvent(listChanged,socket,roomId){
    angular.forEach(listChanged,function(value,key){
        socket.emit('reenter_received_message',roomId,value.Id,value.readTotal);
    });
};

function InitialPMMsgDetails($scope,data,myEmpId,allsubscribe,$filter){
    if(data == null || data.length == 0) return;
    angular.forEach(data,function(value,key){
        var eachSubscribe =  $filter('filter')(allsubscribe, { Empl_Code: value.Empl_Code });
        $scope.msgDetails.unshift({
            Id:value.Id,
            side:(value.Empl_Code == myEmpId) ? 'right' : 'left',
            msg:value.message,
            TS:TransformServerTSToDateTimeStr(value.TS.toString()),
            readTotal:value.readTotal,
            Firstname:eachSubscribe[0].Firstname,
            PictureThumb:eachSubscribe[0].PictureThumb 
        });
    });
};

function UpdateSendDateTimeToMsg(data,updatedMsg){
    for (var i = 0; i <= data.length - 1; i++) {
        if(data[i].tmpId == updatedMsg.tmpId){
            data[i].TS = TransformServerTSToDateTimeStr(updatedMsg.TS.toString());
            data[i].Id = updatedMsg.Id;
            break;
        }
    };
};

function SetRoomName($scope,PMRoomSQLite){
    $scope.roomName = '';
    PMRoomSQLite.GetRoomNameById($scope.roomId).then(
        function(response){
            if(response != null){
                var data = ConvertQueryResultToArray(response);
                $scope.roomName = data[0].roomName;
            };
    });
};

function PMMsgInitialProcess(PMMsgSQLite,PMSubscribeSQLite,$scope,APIService,viewScroll,$filter){
    APIService.ShowLoading();
    PMSubscribeSQLite.GetAllSubScribe().then(function(response){
        if(response != null && response.rows != null){
            $scope.allSubscribe = ConvertQueryResultToArray(response);
            PMMsgSQLite.GetAllMsgByRoomId($scope.roomId).then(function(response){
                if(response.rows != null && response.rows.length > 0){
                    $scope.allMsg = ConvertQueryResultToArray(response);
                    $scope.scrollDetails.start = $scope.allMsg.length;
                    var result = GetInfiniteScrollDataReverse($scope.allMsg,$scope.scrollDetails.start,$scope.scrollDetails.retrieve);
                    InitialPMMsgDetails($scope,result,$scope.empId,$scope.allSubscribe,$filter);
                    viewScroll.scrollBottom(true);
                }
                APIService.HideLoading();
            });    
        }
        else APIService.HideLoading();
    });

    //check this room is group/1:1
    $scope.isGroup = false;
    var url = APIService.hostname() + '/PM/GetEmpInRoom';
    APIService.httpPost(url,{roomID:$scope.roomId},
        function(response){
            if(response.data != null) {
                if(response.data.length > 2) $scope.isGroup = true;
            }
        },
        function(error){});
};