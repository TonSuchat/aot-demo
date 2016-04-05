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
                url: '/directory',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/directory/directory.html',
                        controller: 'DirectoryCtrl'
                    }
                }
            })
            .state('app.directory-person', {
                url: '/directory/:personId',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/directory/person.html',
                        controller: 'PersonCtrl'
                    }
                }
            });
    })
    .controller('DirectoryCtrl', function ($scope, APIService) {
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

    })
    .controller('PersonCtrl', function ($scope, $stateParams, $filter,APIService,AuthService) {
        $scope.currentPerson = {};
        $scope.currentPerson.personId = $stateParams.personId;
        $scope.currentUserName = AuthService.username();
        var result = $filter('filter')(sharePersonData, { UserID: $scope.currentPerson.personId });
        var nickname = (result[0].Nickname && result[0].Nickname != null) ? '(' + result[0].Nickname + ')' : '';
        var fullname = result[0].PrefixName + ' ' + result[0].Firstname + ' ' + result[0].Lastname + ' ' + nickname;
        $scope.currentPerson.personDetails = { FullName: fullname, Position: result[0].Position, Department: result[0].Section };
        $scope.currentPerson.contacts = ChangePrefixDataToThaiVersion(result[0].ContactList[0], $filter);

        $scope.sendPMMsg = function(){
            //todo get roomId from server
            var url = APIService.hostname() + '/PrivateMessage/GetRoomId';
            var empId = AuthService.username();
            var data = {Empl_Code:empId,Empl_Code2:$scope.currentPerson.personId};
            console.log(url);
            console.log(empId);
            //APIService.httpPost()
        };

    });

function GetDirectories($scope, APIService) {
    APIService.ShowLoading();
    var url = APIService.hostname() + '/ContactDirectory/viewContactPaging';
    var data = { keyword: $scope.searchData.keyword, start: $scope.searchData.start, retrieve: $scope.searchData.retrieve };
    APIService.httpPost(url, data,
        function (response) {
            var result = response.data;
            if (result == null || result.length == 0) $scope.haveMoreData = false;
            else {
                (result.length < 20) ? $scope.haveMoreData = false : $scope.haveMoreData = true;
                $scope.directoryList = ($scope.directoryList.length > 0) ? $scope.directoryList.concat(result) : result;
                sharePersonData = $scope.directoryList
            }
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

 