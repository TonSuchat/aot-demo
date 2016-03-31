angular.module('starter')

.controller('PrivateMessageRoomsCtrl',function($scope,$ionicPlatform,SyncService,PMRoomSQLite,APIService){
    
    $ionicPlatform.ready(function(){
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
.controller('PrivateMessagesCtrl',function($scope,$ionicScrollDelegate,$stateParams,SocketService,PMMsgSQLite,$filter,APIService,$ionicPlatform,SyncService){
    $ionicPlatform.ready(function(){

        $scope.roomId = $stateParams.roomId
        $scope.empId = '484074'; //AuthService.username()
        $scope.message = '';

        //sync msg and insert/update into sqlite (post to api number 34 to bulk update and get last msg data)
        SyncService.SyncPMMsg().then(
            function(response){
                var listMsgChanged = (response != null && response.length > 0) ? response : [];
                //loop list to trigger web socket reenter_received_message
                IterationSendReEnterEvent(listMsgChanged,SocketService,$scope.roomId);
                //select all message from sqlite and bind to msgDetails
                PMMsgSQLite.GetAll().then(function(response){
                    if(response.rows != null && response.rows.length > 0) InitialPMMsgDetails($scope,ConvertQueryResultToArray(response),$scope.empId);
                });
        });

        var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');

        //check this room is group or just 1:1 by POST to count check and set $scope.isGroup
        CheckThisRoomIsGroup($scope,APIService,$scope.roomId);
        
        //join to current room
        SocketService.emit('join_room',$scope.roomId);
         
        //*************test code*************
        //FakeData($scope);
        //*************test code*************

        $scope.sendMessage = function(){
            //web socket send msg
            SocketService.emit('send_message',$scope.roomId,$scope.message,$scope.empId);
            $scope.message = '';
        };

        //push msg from sender
        SocketService.on('append_message',function(msg){
            //todo insert msg into sqlite
            //push msg
            $scope.msgDetails.push(msg);
            viewScroll.scrollBottom(true);
            //web socket send back to update readed flag
            SocketService.emit('received_message',$scope.roomId,$scope.empId,msg.msgId);
        });

        //append msg to sender side when insert DB success
        SocketService.on('send_success',function(msg){
            //todo save to sqlite
            $scope.msgDetails.push(msg);
            viewScroll.scrollBottom(true);
        });

        SocketService.on('set_readTotal',function(msgId,readTotal){
            //todo set readeTotal use filter by msgid
            for (var i = 0; i <= $scope.msgDetails.length - 1; i++) {
                if($scope.msgDetails[i].msgId == msgId){
                    $scope.msgDetails[i].readTotal = readTotal;
                    break;
                }
            };
        });

    });
    
})

function GetInfiniteScrollData(alldata,start,retrieve){
    var result = [];
    var counter = 1;
    var lastIndex = ((start-1) + (retrieve-1));
    for (var i = start - 1; i <= lastIndex; i++) {
        if(alldata[i] != null)
            result.push(alldata[i]);
        else
            break;
    };
    return result;
};

function CheckThisRoomIsGroup($scope,APIService,roomId){
    $scope.isGroup = false;
    var url = APIService.hostname() + '/PM/GetEmpInRoom';
    APIService.httpPost(url,{roomID:roomId},function(response){
        if(response.data != null) {
            if(response.data.length > 2) 
                $scope.isGroup = true;
        }
    },function(){});
};

function IterationSendReEnterEvent(listChanged,SocketService,roomId){
    angular.forEach(listChanged,function(value,key){
        SocketService.emit('reenter_received_message',roomId,value.message,value.readTotal);
    });
};

function InitialPMMsgDetails($scope,data,myEmpId){
    $scope.msgDetails = [];
    angular.forEach(data,function(value,key){
        $scope.msgDetails.push({
                msgId:value.Id,
                side:(value.Empl_Code == myEmpId) ? 'right' : 'left',
                msg:value.message,
                msgDate:TransformServerTSToDateTimeStr(value.TS.toString()),
                readTotal:value.readTotal
            });
    });
};

function FakeData($scope){
    $scope.msgDetails.push({msgId:1,roomId:$scope.roomId,side:'left',msg:'asdasdasd',msgDate:'22/3/2016 16:22',readTotal:1});
    $scope.msgDetails.push({msgId:2,roomId:$scope.roomId,side:'right',msg:'Lorem ipsum dolor',msgDate:'22/3/2016 16:22',readTotal:0});
    $scope.msgDetails.push({msgId:3,roomId:$scope.roomId,side:'left',msg:'asdasdasd',msgDate:'22/3/2016 16:22',readTotal:1});
    $scope.msgDetails.push({msgId:4,roomId:$scope.roomId,side:'right',msg:'Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor Lorem ipsum dolor',msgDate:'22/3/2016 16:22',readTotal:1});
};