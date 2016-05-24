angular.module('starter')

.controller('PrivateMessageRoomsCtrl',function($scope,$ionicPlatform,SyncService,PMRoomSQLite,APIService,$cordovaNetwork,$ionicPopup,XMPPService,xmppSharedProperties){
    
    $ionicPlatform.ready(function(){
        
        $scope.haveMoreData = false;
        $scope.isfirstLoad = true;
        $scope.roomsDetail = [];
        $scope.allRooms = [];
        $scope.scrollDetails = {start:1,retrieve:10};
        APIService.ShowLoading();

        //if no internet connection
        if(!CheckNetwork($cordovaNetwork)) OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');

        //select all rooms from sqlite and bind to roomsDetail        
        PMRoomInitialProcess($scope,PMRoomSQLite,APIService);

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
.controller('PrivateMessagesCtrl',function($scope,$ionicScrollDelegate,$stateParams,PMMsgSQLite,$filter,APIService,$ionicPlatform,AuthService,SyncService,socketFactory,$rootScope,PMRoomSQLite,$ionicPopover,$cordovaNetwork,$ionicPopup,PMSubscribeSQLite,XMPPService,xmppSharedProperties){
    $ionicPlatform.ready(function(){

        $scope.roomId = $stateParams.roomId
        $scope.empId = AuthService.username();
        $scope.message = '';
        $scope.msgDetails = [];
        $scope.allMsg = [];
        $scope.allSubscribe = [];
        $scope.scrollDetails = {start:0,retrieve:10};
        var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
        var socket;

        //popover private message menus
        $ionicPopover.fromTemplateUrl('templates/PMMenus.html', {scope: $scope,}).then(function(popover) { $scope.popover = popover; });
        APIService.ShowLoading();

        $scope.noInternet = false;
        //if no internet connection
        if(!CheckNetwork($cordovaNetwork)){
            $scope.noInternet = true;
            OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
            //select all message from sqlite and bind to msgDetails
            PMMsgInitialProcess(PMMsgSQLite,PMSubscribeSQLite,$scope,APIService,viewScroll,$filter,PMRoomSQLite,xmppSharedProperties);
        }
        else{
            //resend all new message to notify sender that you seen message
            SendNotifySeenAllNewMessage($scope.roomId,PMMsgSQLite,XMPPService);
            //update read all message , lastmsg = null in this room
            PMRoomSQLite.UpdateReadAllMsg($scope.roomId);
            //sync subscribe
            SyncService.SyncSubscribe($scope.roomId).then(function(){
                //select all message from sqlite and bind to msgDetails
                PMMsgInitialProcess(PMMsgSQLite,PMSubscribeSQLite,$scope,APIService,viewScroll,$filter,PMRoomSQLite,xmppSharedProperties);
            });
        }

        //append message
        $scope.$on('incomingMessage',function(env,args){
            $scope.allMsg.push({Id:0,MessageId:args.msgId,Empl_Code:args.ownerId,message:args.message,readTotal:0,roomId:args.roomId,TS:args.TS});
            if(args.ownerId == window.localStorage.getItem("CurrentUserName")) $scope.msgDetails.push({msgId:args.msgId,side:'right',msg:args.message,TS:TransformServerTSToDateTimeStr(args.TS.toString()),readTotal:0,showExtraBtn:false});
            else{
                var eachSubscribe =  $filter('filter')($scope.allSubscribe, { Empl_Code: args.ownerId });
                $scope.msgDetails.push({msgId:args.msgId,side:'left',msg:args.message,PictureThumb:eachSubscribe[0].PictureThumb,Firstname:eachSubscribe[0].Firstname,TS:TransformServerTSToDateTimeStr(args.TS.toString()),readTotal:0,showExtraBtn:false});
                //send back to sender for update readed
                XMPPService.SendSeenMessage(args.roomId,args.msgId);
            } 
            if(!$scope.$$phase) $scope.$apply();
            viewScroll.scrollBottom(true);
        });

        //receiver seen our message
        $scope.$on('seenMessage',function(env,args){
            for (var i = 0; i <= $scope.msgDetails.length - 1; i++) {
                if($scope.msgDetails[i].msgId == args.msgId){
                    $scope.msgDetails[i].readTotal = args.readTotal;
                    break;
                }
            };
            if(!$scope.$$phase) $scope.$apply();
        });

        //show extra button
        $scope.$on('showExtraBtn',function(env,args){
            for (var i = 0; i <= $scope.msgDetails.length - 1; i++) {
                if($scope.msgDetails[i].msgId == args.msgId){
                    $scope.msgDetails[i].showExtraBtn = true;
                    break;
                }
            };
            if(!$scope.$$phase) $scope.$apply();
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
            InitialPMMsgDetails($scope,result,$scope.empId,$scope.allSubscribe,$filter);
            FinalAction($scope,APIService);
        };

        $scope.sendMessage = function(){
            if($scope.noInternet) return;
            console.log('xmppConnectionIsActive',xmppConnectionIsActive);
            //todo check has network, If has network try to reconnect xmpp then go on process;
            if(!xmppConnectionIsActive) ProcessTryToReconnectAndSendMessage($scope,$filter,XMPPService,PMMsgSQLite,viewScroll,$scope.roomId,$scope.message); //try to reconnect(timer process)
            else XMPPService.SendChatMessage($scope.empId, $scope.roomId, $scope.message); //normal process
            $scope.message = '';
        };

        $scope.resendMessage = function(msgId,msg){
            if($scope.noInternet) return;
            //if connection not active try to reconnect and resend message
            if(!xmppConnectionIsActive){
                //update this msAct = 1
                PMMsgSQLite.UpdateMsgAct(msgId,1).then(function(){
                    for (var i = 0; i <= $scope.msgDetails.length - 1; i++) {
                        if($scope.msgDetails[i].msgId == msgId){
                            $scope.msgDetails[i].showExtraBtn = false;
                            break;
                        }
                    };
                    if(!$scope.$$phase) $scope.$apply();
                    //enable timer
                    XMPPService.EnableTimerReconnect();
                });
            }
            else{
                //if has connection resend message by normal process
                //update this msgAct = 0
                PMMsgSQLite.UpdateMsgAct(msgId,0).then(function(){
                    //hide extra button
                    for (var i = 0; i <= $scope.msgDetails.length - 1; i++) {
                        if($scope.msgDetails[i].msgId == msgId){
                            $scope.msgDetails[i].showExtraBtn = false;
                            break;
                        }
                    };
                    if(!$scope.$$phase) $scope.$apply();
                });
                //resend message
                XMPPService.SendChatMessage($scope.empId, $scope.roomId, msg, msgId);    
            }
        };

        $scope.deleteMessage = function(msgId){
            if(confirm('ลบข้อความนี้ ?')){
                PMMsgSQLite.DeleteMessage(msgId,$scope.roomId).then(function(response){
                    for (var i = 0; i <= $scope.msgDetails.length - 1; i++) {
                        if($scope.msgDetails[i].msgId == msgId){
                            $scope.msgDetails.splice(i,1);
                            break;
                        }
                    };
                    if(!$scope.$$phase) $scope.$apply();
                });
            }
        };

        $rootScope.$on( "$stateChangeStart", function(e, toState, toParams, fromState, fromParams) {
            if(fromState.url == '/pmsmsgs/:roomId'){
                //clear active room
                xmppSharedProperties.SetSharedProperties({ActiveRoomId:null});  
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
            msgId:value.MessageId,
            side:(value.Empl_Code == myEmpId) ? 'right' : 'left',
            msg:value.message,
            TS:(value.TS != null) ? TransformServerTSToDateTimeStr(value.TS.toString()) : '',
            readTotal:value.readTotal,
            Firstname:eachSubscribe[0].Firstname,
            PictureThumb:eachSubscribe[0].PictureThumb,
            showExtraBtn:(value.msgAct == 2) ? true : false
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

// function SetRoomName($scope,PMRoomSQLite){
//     $scope.roomName = '';
//     PMRoomSQLite.GetRoomNameById($scope.roomId).then(
//         function(response){
//             if(response != null){
//                 var data = ConvertQueryResultToArray(response);
//                 $scope.roomName = data[0].roomName;
//             };
//     });
// };

function PMMsgInitialProcess(PMMsgSQLite,PMSubscribeSQLite,$scope,APIService,viewScroll,$filter,PMRoomSQLite,xmppSharedProperties){
    //set active room in sharedProperties
    xmppSharedProperties.SetSharedProperties({ActiveRoomId:$scope.roomId});

    $scope.roomDetails = {Id:$scope.roomId,roomName:'',roomType:0,senderJId:''};
    
    APIService.ShowLoading();
    //get room details
    PMRoomSQLite.GetRoomById($scope.roomId).then(function(response){
        if(response != null){
            var result = ConvertQueryResultToArray(response);
            $scope.roomDetails.roomName = result[0].roomName;
            $scope.roomDetails.roomType = result[0].roomType;
            $scope.roomDetails.JId = result[0].JId;
        }
    });

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
                    //update totalNewMsg = 0 this room because readed all messages in this room.
                    PMRoomSQLite.UpdateReadAllMsg($scope.roomId);
                }
                APIService.HideLoading();
            });    
        }
        else APIService.HideLoading();
    });
};

function PMRoomInitialProcess($scope,PMRoomSQLite,APIService){
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
};

function SendNotifySeenAllNewMessage(roomId,PMMsgSQLite,XMPPService) {
    if(!xmppConnectionIsActive) return;
    PMMsgSQLite.GetAllUnSeenMessageByRoomId(roomId).then(function(response){
        if(response != null){
            var result = ConvertQueryResultToArray(response);
            angular.forEach(result,function(value,key){
                XMPPService.SendSeenMessage(roomId,value.MessageId,value.Empl_Code,window.localStorage.getItem("CurrentUserName"));
            });
            //update unseen = 1 in this room
            PMMsgSQLite.UpdateSeenMessageInRoom(roomId);
        }
    });
};

function ProcessTryToReconnectAndSendMessage($scope,$filter,XMPPService,PMMsgSQLite,viewScroll,roomId,message){
    console.log('ProcessTryToReconnectAndSendMessage');
    var ownerId = window.localStorage.getItem("CurrentUserName");
    var eachSubscribe =  $filter('filter')($scope.allSubscribe, { Empl_Code: ownerId });
    var msgId = XMPPService.GenerateMessageId();
    var ts = GetCurrentTSAPIFormat();
    if(eachSubscribe == null || msgId == null) return;
    //append in UI
    $scope.msgDetails.push({msgId:msgId,side:'right',msg:message,PictureThumb:eachSubscribe[0].PictureThumb,Firstname:eachSubscribe[0].Firstname,TS:TransformServerTSToDateTimeStr(ts.toString()),readTotal:0,showExtraBtn:false});
    //insert to pmMSG msgAct = 1
    PMMsgSQLite.Add([msgId,ownerId,message,0,roomId,ts,1,1]);
    viewScroll.scrollBottom(true);
    //enable timer reconnect
    XMPPService.EnableTimerReconnect();
};
