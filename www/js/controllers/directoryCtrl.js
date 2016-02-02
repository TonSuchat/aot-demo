angular.module('directory', [])
    .factory('shareData', function(){
        // I know this doesn't work, but what will?
        var directoryList = {};
        return directoryList;
    })
    .controller('DirectoryCtrl',function($scope,shareData){
        //$scope.searchData =  {};
        //$scope.searchData.keyword = "";
        //$scope.searchData.start = 1;
        //$scope.searchData.retrieve = 20;
        //
        //var searchUrl = "http://eservice2.airportthai.co.th/Services/ContactDirectory.asmx/viewContactPaging";
        //var searchConfig = {};
        //searchConfig.headers = {'Content-Type' : 'application/x-www-form-urlencoded'};
        //
        //$scope.searchEnter = function() {
        //    console.log('search', $scope.searchData, searchConfig);
        //    $http.post(searchUrl,$httpParamSerializerJQLike($scope.searchData),searchConfig)
        //        .then(
        //            function successCallback(resp){
        //                //var jsonObject = ngXml2json.parser(resp.data);
        //                shareData.directoryList = resp.data;
        //
        //                $scope.directoryList = shareData.directoryList;
        //                console.log(resp.data);
        //            },
        //            function errorCallBack(resp){
        //
        //                console.log(resp.statusText);
        //
        //            });
        //
        //
        //}

    })
    .controller('PersonCtrl', function($scope, $stateParams, $filter, shareData) {
        //$scope.personId = $stateParams.personId;
        //
        //$scope.personDetail= $filter('filter')(shareData.directoryList,$scope.personId);
        //console.log($stateParams.personId);

    });