angular.module('starter')
    .factory('shareData', function(){
        // I know this doesn't work, but what will?
        //var directoryList = {};
        var directoryList = [
        {Firstname:'Test1',Position:'Position1',Section:'Section1',Department:'Department1'},
        {Firstname:'Test2',Position:'Position2',Section:'Section2',Department:'Department2'},
        {Firstname:'Test3',Position:'Position3',Section:'Section3',Department:'Department3'},
        ];
        return directoryList;
    })

    .config(function($stateProvider) {
        $stateProvider
            .state('app.directory', {
                url: '/directory',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/directory/directory.html',
                        controller: 'DirectoryCtrl'
                    }
                }
            });
    })
    .controller('DirectoryCtrl',function($scope,$http,$httpParamSerializerJQLike,$ionicLoading){
        //$scope.directoryList = shareData;
        $scope.searchData =  {};
        $scope.searchData.keyword = "";
        $scope.searchData.start = 1;
        $scope.searchData.retrieve = 20;
        
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

        $scope.searchEnter = function(){        
            GetDirectories($scope,$http,$httpParamSerializerJQLike,$ionicLoading);
        };

    })
    .controller('PersonCtrl', function($scope, $stateParams, $filter, shareData) {
        //$scope.personId = $stateParams.personId;
        //
        //$scope.personDetail= $filter('filter')(shareData.directoryList,$scope.personId);
        //console.log($stateParams.personId);

    });

    function GetDirectories ($scope,$http,$httpParamSerializerJQLike,$ionicLoading) {
        $scope.directoryList = {};
        ShowLoading($ionicLoading);
        var searchConfig = {};
        searchConfig.headers = {'Content-Type' : 'application/x-www-form-urlencoded','Access-Control-Allow-Origin':'*'};
        $http.post('http://eservice2.airportthai.co.th/Services/ContactDirectory.asmx/viewContactPaging',$httpParamSerializerJQLike($scope.searchData),searchConfig).then(
            function(response){
                var parsedXml = parseXml(response.data);
                var retjson = angular.fromJson(xml2json(parsedXml,'\t'));
                console.log(retjson.root.UserID);
                //$scope.directoryList = retjson.root.UserID;
                $scope.directoryList = retjson.root.UserID;
                HideLoading($ionicLoading);
            },
            function(){});
    };

    function parseXml(xml) {
       var dom = null;
        try { 
            dom = (new DOMParser()).parseFromString(xml, "text/xml"); 
        } 
        catch (e) { dom = null; }
       return dom;
    };

    function ShowLoading ($ionicLoading) {
        // Setup the loader
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    };

    function HideLoading($ionicLoading){
         $ionicLoading.hide();
    };
