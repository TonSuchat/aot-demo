var shareMedicalData = [];

angular.module('starter')

    .config(function($stateProvider) {
        $stateProvider

            .state('app.info', {
                url: '/information',
                abstract: true,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/info/information.html',
                        controller: 'InfoCtrl'
                    }
                }
            })
            .state('app.info.finance', {
                url: '/finance',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/finance.html',
                        controller: 'FinanceCtrl'
                    }
                }
            })
            .state('app.info.hr', {
                url: '/hr',
                views: {
                    'hr': {
                        templateUrl: 'templates/info/hr.html',
                        controller: 'HrCtrl'
                    }
                }
            })
            .state('app.info.time', {
                url: '/time',
                views: {
                    'hr': {
                        templateUrl: 'templates/info/time.html',
                        controller: 'TimeCtrl'
                    }
                }
            })
            .state('app.info.leave', {
                url: '/leave',
                views: {
                    'hr': {
                        templateUrl: 'templates/info/leave.html',
                        controller: 'LeaveCtrl'
                    }
                }
            })
            .state('app.info.medical', {
                url: '/medical',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/medical.html',
                        controller: 'MedicalCtrl'
                    }
                }
            })
            .state('app.info.medical-detail', {
                url: '/medical-detail/:Id',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/medical-detail.html',
                        controller: 'MedicalDetailCtrl'
                    }
                }
            })
            .state('app.info.fuel', {
                url: '/fuel',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/fuel.html',
                        controller: 'FuelCtrl'
                    }
                }
            })
            .state('app.info.fuel-detail', {
                url: '/fuel-detail',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/fuel-detail.html',
                        controller: 'FuelDetailCtrl'
                    }
                }
            })
    })

    .controller('InfoCtrl', function($scope, $stateParams) {
    })
    .controller('TimeCtrl', function($scope, $stateParams) {
    })
    .controller('LeaveCtrl', function($scope, $stateParams) {
    })
    .controller('MedicalCtrl', function($scope, $stateParams, $filter, MedicalSQLite) {
        MedicalSQLite.GetMedicals().then(function(response){
            shareMedicalData = response;
            //get distinct paiddate for group data by paiddate
            MedicalSQLite.GetDistinctPaidDate().then(function(resultDistinct){
                $scope.MedicalInfo = CreateMedicalInfoGroupByDate(resultDistinct,$filter,shareMedicalData);
            });
        });
    })
    .controller('MedicalDetailCtrl', function($scope, $stateParams, $filter) {
        InitialMedicalDetails($scope,$filter,$stateParams);
    })
    .controller('FuelCtrl', function($scope, $stateParams) {
    })
    .controller('FuelDetailCtrl', function($scope, $stateParams) {
    })
    .controller('FinanceCtrl', function($scope, $stateParams,APIService,AuthService,MedicalSQLite) {

        //***Medical
        //get current data from sqlite
        InitialMedicalInfo($scope,MedicalSQLite);

        $scope.SyncMedicalData = function(){
            ProcessSyncMedicalData($scope,MedicalSQLite,APIService,AuthService);
        };
        //***Medical

        //***tuition
        //***tuition

    })
    .controller('HrCtrl', function($scope, $stateParams) {
    });

function InitialMedicalInfo($scope,MedicalSQLite,totalNotification){
    $scope.medicalInfo = {};
    MedicalSQLite.GetSumMedicalTotal().then(
        function(response){
            if(response.rows[0].total != null && response.rows[0].total > 0) $scope.medicalInfo.totalSpent = response.rows[0].total;
            else $scope.medicalInfo.totalSpent = 0;
        },
        function(error){$scope.medicalInfo.totalSpent = 0;}
    );
    $scope.medicalInfo.notification = (totalNotification && totalNotification !== null && totalNotification != 'undefined') ? totalNotification : 0;
};

function InitialMedicalDetails($scope,$filter,$stateParams){
    var currentMedical = $filter('filter')(shareMedicalData.rows, { id: $stateParams.Id });
    $scope.MedicalDetails = {};
    $scope.MedicalDetails.hospitalType = (currentMedical[0].hosptype == 320) ? 'รัฐบาล' : 'เอกชน';
    $scope.MedicalDetails.hospitalName = currentMedical[0].hospname;
    $scope.MedicalDetails.patientType = currentMedical[0].patienttype;
    $scope.MedicalDetails.family = currentMedical[0].family;
    $scope.MedicalDetails.patientName = currentMedical[0].patientname;
    $scope.MedicalDetails.disease = currentMedical[0].disease;
    $scope.MedicalDetails.total = currentMedical[0].total;
    $scope.MedicalDetails.docdate = GetThaiDateByDate($filter,currentMedical[0].docdate);
    $scope.MedicalDetails.paidDate = GetThaiDateByDate($filter,currentMedical[0].paiddate);
    $scope.MedicalDetails.bankName = currentMedical[0].bankname;
}

function ProcessSyncMedicalData($scope,MedicalSQLite,APIService,AuthService){
    //get latest ts
    MedicalSQLite.GetLatestTS().then(function(lastesTS){
        //post to get new data
        var url = APIService.hostname() + '/Medicals/MedicalValues';
        var myEmpId = '393028'; //AuthService.username()
        var data = { EmpID: myEmpId, FromDate: GetFiscalDate(), ToDate: GetCurrentDate().replace(/\//g,''), TS: lastesTS};
        console.log(data);
        APIService.httpPost(url,data,
            function(response){
                var result = response.data;
                if(result.length > 0){
                    //save to sqlite
                    MedicalSQLite.SaveMedical(result).then(function(){
                        //bind new data to ui
                        InitialMedicalInfo($scope,MedicalSQLite,result.length)    
                    });
                }
            },
            function(error){});    
    });
};

function CreateMedicalInfoGroupByDate(distinctPaidDate,$filter,shareMedicalData){
    var result = [];
    for (var i = 0; i <= distinctPaidDate.rows.length -1; i++) {
        var currentPaidDate = distinctPaidDate.rows[i].paiddate;
        var currentMedicalDetailsByPaidDate = $filter('filter')(shareMedicalData.rows,{paiddate:currentPaidDate});
        //var currentMonth = $filter('filter')(shortnessThaiMonth, { monthValue: currentPaidDate.substring(2,4) });
        var newData = {};
        newData.paidDate = GetThaiDateByDate($filter,currentPaidDate); //currentPaidDate.substring(0,2) + ' ' + currentMonth[0].monthName + ' ' + (parseInt(currentPaidDate.substring(4,8)) + 543);
        newData.paidDetails = [];
        for (var z = 0; z <= currentMedicalDetailsByPaidDate.length -1; z++) {
            newData.paidDetails.push({id:currentMedicalDetailsByPaidDate[z].id,total:currentMedicalDetailsByPaidDate[z].total,bankName:currentMedicalDetailsByPaidDate[z].bankname});
        };
        result.push(newData);
    };
    return result;
};