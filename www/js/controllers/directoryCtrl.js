//variable for storage data for used between Directory and Person controller
var sharePersonData = [];
var prefixData = [
    { prefixkey: 'officetel', prefixvalue: 'เบอร์สำนักงาน' , prefixType:'tel' },
    { prefixkey: 'officefax', prefixvalue: 'เบอร์ Fax' , prefixType:'tel' },
    { prefixkey: 'emailaddress', prefixvalue: 'Email' , prefixType:'email' },
    { prefixkey: 'line', prefixvalue: 'Line Id' , prefixType:'line' },
    { prefixkey: 'facebook', prefixvalue: 'Facebook' , prefixType:'facebook' },
    { prefixkey: 'mobilephone', prefixvalue: 'เบอร์มือถือ' , prefixType:'tel' },
];

angular.module('starter')
    // .factory('shareData', function () {
    //     // I know this doesn't work, but what will?
    //     //var directoryList = {};
    //     var directoryList = [
    //     { id: '484074', Firstname: 'Test1', Position: 'Position1', Section: 'Section1', Department: 'Department1' },
    //     { id: '484134', Firstname: 'Test2', Position: 'Position2', Section: 'Section2', Department: 'Department2' },
    //     { id: '484999', Firstname: 'Test3', Position: 'Position3', Section: 'Section3', Department: 'Department3' },
    //     ];
    //     return directoryList;
    // })

    .config(function ($stateProvider) {
        $stateProvider
            .state('app.directory', {
                url: '/directory?pmroomid',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/directory/directory.html',
                        controller: 'DirectoryCtrl'
                    }
                }
            })
            .state('app.directory-person', {
                url: '/directory/:personId?pmroomid',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/directory/person.html',
                        controller: 'PersonCtrl'
                    }
                }
            });
    })
    .controller('DirectoryCtrl', function ($scope, APIService, $stateParams, $cordovaNetwork, $ionicPopup, $ionicPlatform) {
        
        $ionicPlatform.ready(function(){
            $scope.noInternet = false;
            $scope.notFoundData = false;

            //if no internet connection
            if(!CheckNetwork($cordovaNetwork)){
                $scope.noInternet = true;
                OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
            };
            
            $scope.PMRoomId = $stateParams.pmroomid;

            $scope.directoryList = [];
            //set data to share variable for used in person controller
            sharePersonData = [];
            $scope.searchData = {keyword:"", start:1, retrieve:20, newSearch:true};
            $scope.haveMoreData = false;
            $scope.isfirstLoad = true;

            //trigger when form submited or pressed search button
            $scope.searchEnter = function () {
                if (CheckValidate($scope)) {
                    InitialVariables($scope);
                    GetDirectories($scope, APIService);
                };
            };

            //this function trigger by ng-infinite-scroll (when scrolled to bottom)
            $scope.loadMoreData = function () {
                if ($scope.isfirstLoad) { $scope.isfirstLoad = false; $scope.$broadcast('scroll.infiniteScrollComplete'); return; }
                //start +20
                $scope.searchData.start += $scope.searchData.retrieve;
                GetDirectories($scope, APIService);
            };
        });

    })
    .controller('PersonCtrl', function ($scope, $stateParams, $filter,APIService,AuthService,$location,PMRoomSQLite,PMUserInRoomSQLite,XMPPService,$q,XMPPApiService, $ionicPlatform) {
        $ionicPlatform.ready(function(){

            $scope.currentPerson = {};
            $scope.currentPerson.personId = $stateParams.personId;
            $scope.PMRoomId = $stateParams.pmroomid;
            $scope.onWeb = onWeb;

            ////process show/hide button create/invite private message
            //CheckForShowPMButton($scope,$stateParams,APIService,XMPPApiService);

            $scope.currentUserName = AuthService.username();
            var result = $filter('filter')(sharePersonData, { UserID: $scope.currentPerson.personId });
            if(result == null || result.length == 0) return;
            var nickname = (result[0].Nickname && result[0].Nickname != null) ? '(' + result[0].Nickname + ')' : '';
            var fullname = result[0].PrefixName + ' ' + result[0].Firstname + ' ' + result[0].Lastname + ' ' + nickname;
            $scope.currentPerson.personDetails = { FullName: fullname, Position: result[0].Position, Department: result[0].Section, UpdateDate: result[0].changeDate };
            $scope.currentPerson.contacts = ChangePrefixDataToThaiVersion(result[0].ContactList[0], $filter);

            //redirect to private message view
            $scope.sendPMMsg = function(){
                APIService.ShowLoading();
                //create data in pmroom if not exist
                PMRoomSQLite.GetRoomIdTypeChat($scope.currentPerson.personId).then(function(response){
                    if(response != null){
                        var roomId;
                        result = ConvertQueryResultToArray(response);
                        if(result.length > 0){
                            APIService.HideLoading();
                            $location.path('/app/pmsmsgs/' + result[0].Id);
                        } 
                        else{
                            //todo get base64 string for roomIcon
                            GetPicThumbBase64($q,APIService,$scope.currentPerson.personId).then(function(base64){
                                if(base64 != null && base64){
                                    roomId = XMPPService.GetUniqueId();
                                    var roomIcon = base64;
                                    //create xmpproom
                                    var data = {roomName:roomId,naturalName:roomId,description:'one-by-one-chat-room(' + $scope.currentPerson.personId + ',' + $scope.currentUserName + ')',owners:{"owner": "admin@" + xmppURLDetails.domain},members:{"member": [$scope.currentUserName + "@" + xmppURLDetails.domain,$scope.currentPerson.personId + "@" + xmppURLDetails.domain]}};
                                    XMPPApiService.CreateChatRoom(data).then(function(response){
                                        if(response){
                                            //join room
                                            XMPPService.JoinRoom(roomId,$scope.currentUserName);
                                            //create pmroom
                                            PMRoomSQLite.Add([roomId,1,fullname,roomIcon,0,'',GetCurrentTSAPIFormat()]).then(
                                                function(response){
                                                    //create pmuserinroom
                                                    if(response != null){
                                                        //send message to create room at receiver side
                                                        XMPPService.SendMessageCreateChatRoom(roomId,$scope.currentUserName,$scope.currentPerson.personId,window.localStorage.getItem("AuthServices_fullname"),fullname);
                                                        PMUserInRoomSQLite.Add([roomId,$scope.currentPerson.personId]);
                                                        APIService.HideLoading();
                                                        $location.path('/app/pmsmsgs/' + roomId);  
                                                    }
                                                });        
                                        }
                                    });
                                }
                                else{
                                    console.log("can't found base64 picthumb");
                                    APIService.HideLoading();
                                }
                            });
                        }
                    } 
                });
                //$scope.currentPerson.personId
                
            };

            //invite new person into room
            $scope.InvitePMMSg = function(){
                var url = APIService.hostname() + '/PM/InvitePerson';
                var data = {roomID:$scope.PMRoomId,Empl_Code:$scope.currentPerson.personId};
                APIService.httpPost(url,data,
                    function(response){
                        if(response != null && response.data != null){
                            if(response.data)
                                $location.path('/app/pmsmsgs/' + $scope.PMRoomId);    
                        }
                    },
                    function(error){console.log(error);});  
            };
        });
        

    });

function GetDirectories($scope, APIService) {
    APIService.ShowLoading();
    var url = APIService.hostname() + '/ContactDirectory/viewContactPaging';
    var data = { keyword: $scope.searchData.keyword, start: $scope.searchData.start, retrieve: $scope.searchData.retrieve };
    APIService.httpPost(url, data,
        function (response) {
            var result = response.data;
            if (result == null || result.length == 0)$scope.haveMoreData = false;
            else {
                (result.length < 20) ? $scope.haveMoreData = false : $scope.haveMoreData = true;
                $scope.directoryList = ($scope.directoryList.length > 0) ? $scope.directoryList.concat(result) : result;
                sharePersonData = $scope.directoryList
            }
            $scope.notFoundData = ($scope.directoryList.length > 0 ? false : true);
            FinalAction($scope, APIService);
        },
        function () {
            FinalAction($scope, APIService);
        });
};

function parseXml(xml) {
    var dom = null;
    try {
        dom = (new DOMParser()).parseFromString(xml, "text/xml");
    }
    catch (e) { dom = null; }
    return dom;
};

function CheckValidate($scope) {
    if ($scope.searchData.keyword.length < 2) return false;
    else return true;
};

function FinalAction($scope, APIService) {
    APIService.HideLoading();
    $scope.$broadcast('scroll.infiniteScrollComplete');
    $scope.$broadcast('scroll.refreshComplete');
};

function InitialVariables($scope) {
    sharePersonData = {};
    $scope.directoryList = {};
    $scope.searchData.start = 1;
    $scope.searchData.newSearch = true;
    $scope.isfirstLoad = true;
};

function ChangePrefixDataToThaiVersion(contacts, $filter) {
    var contactDatas = [];
    var currentKey;
    angular.forEach(contacts, function (value, key) {
        if(value != null){
            var newData = {};
            currentKey = $filter('filter')(prefixData, { prefixkey: key.toLowerCase() });
            newData.ContactKey = currentKey[0].prefixvalue;
            newData.ContactValue = (value != null) ? value : '-';
            if(currentKey[0].prefixType == 'tel'){
                newData.href = "tel:" + value;  
                newData.rowIcon = "ion-ios-telephone";
            }
            else if(currentKey[0].prefixType == 'email'){
                newData.href = "mailto:" + value;
                newData.rowIcon = "ion-ios-email";   
            } 
            else if(currentKey[0].prefixType == 'facebook'){
                newData.href = "https://www.facebook.com/" + value;          
                newData.rowIcon = "ion-social-facebook";
            }
            contactDatas.push(newData);    
        }
    });
    return contactDatas;
};
 

function CheckForShowPMButton($scope,$stateParams,APIService,XMPPApiService){
    $scope.PMInfo = {pmRoomId:$stateParams.pmroomid,showInvitebtn:true,showSendPMbtn:true};
    if($scope.currentPerson.personId == window.localStorage.getItem('CurrentUserName')){
        $scope.PMInfo.showSendPMbtn = false;
        $scope.PMInfo.showInvitebtn = true;
        return;
    }
    if($scope.PMInfo.pmRoomId == 0) {
        $scope.PMInfo.isInvite = false;
        //check this person has openfire account? if not hide button
        XMPPApiService.CheckUserIsExist($scope.currentPerson.personId).then(function(response){
            console.log(response);
            if(response == false) $scope.PMInfo.showSendPMbtn = false;
            else $scope.PMInfo.showSendPMbtn = true;
        });
    }
    else {
        $scope.PMInfo.isInvite = true;
        //check current person has already in room?
        var url = APIService.hostname() + '/PM/GetEmpInRoom';
        var data = {roomID:$scope.PMInfo.pmRoomId};
        APIService.httpPost(url,data,
            function(response){
                if(response != null && response.data != null){
                    console.log(response.data);
                    for (var i = 0; i <= response.data.length - 1; i++) {
                        if(response.data[i].Empl_Code == $scope.currentPerson.personId){
                            $scope.PMInfo.showInvitebtn = false;
                            break;
                        }
                    };
                }
                else $scope.PMInfo.showInvitebtn = false;
            },
            function(error){
                console.log(error);
                $scope.PMInfo.showInvitebtn = false;
            });
    }
};