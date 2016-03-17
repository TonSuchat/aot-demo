var shareMedicalData = [];
var shareTuitionData = [];

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
            .state('app.info.royal', {
                url: '/royal',
                views: {
                    'hr': {
                        templateUrl: 'templates/info/royal.html',
                        controller: 'RoyalCtrl'
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
            .state('app.info.tuition', {
                url: '/tuition',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/tuition.html',
                        controller: 'TuitionCtrl'
                    }
                }
            })
            .state('app.info.tuition-detail', {
                url: '/tuition-detail/:Id',
                views: {
                    'finance': {
                        templateUrl: 'templates/info/tuition-detail.html',
                        controller: 'TuitionDetailCtrl'
                    }
                }
            })
    })

    .controller('InfoCtrl', function($scope, $stateParams) {
    })
    .controller('TimeCtrl', function($scope, $filter, TimeAttendanceSQLite, SyncService) {

        //if disable sync, Get new data when page load.
        SyncService.SyncTime();
        //if(!enableSync) ProcessSyncTimeData($scope,TimeAttendanceSQLite,APIService,AuthService,$filter);

        // //get all data only one times for use with $filter
        TimeAttendanceSQLite.GetTimeAttendances().then(function(response){
            $scope.allTADatas = ConvertQueryResultToArray(response);
        });

        $scope.BindList = function(){
            var selectedVal = $scope.ddlMonthsData.selectedOptions.val;
            if(!selectedVal || selectedVal.length == 0) return;
            TimeAttendanceSQLite.GetDistinctStampDateByFromDateAndToDate(selectedVal).then(
                function(response){
                    var distinctStampDateArr = ConvertQueryResultToArray(response);
                    if($scope.allTADatas.length == 0){
                        TimeAttendanceSQLite.GetTimeAttendances().then(function(allData){
                            var allDataArr = ConvertQueryResultToArray(allData);
                            $scope.allTADatas = allDataArr;
                            if(allDataArr != null && allDataArr.length > 0){
                                $scope.listTimeInfo = GetTimeInfo(allDataArr,$filter,$scope.allTADatas);
                            }
                            else $scope.listTimeInfo = [];
                        });
                    }
                    else{
                        if(distinctStampDateArr != null && distinctStampDateArr.length > 0){
                            $scope.listTimeInfo = GetTimeInfo(distinctStampDateArr,$filter,$scope.allTADatas);
                        }
                        else $scope.listTimeInfo = [];
                    }
            });
        };

        InitialTimeInfo($scope,$filter);

    })
    .controller('LeaveCtrl', function($scope, $stateParams,$filter,LeaveSQLite, SyncService) {
        //if disable sync, Get new data when page load.
        SyncService.SyncLeave().then(function(){
            InitialLeaveInfo($scope,$filter,LeaveSQLite);
        });  
        //if(!enableSync) ProcessSyncLeaveData($scope,LeaveSQLite,APIService,AuthService,$filter)
        
    })
    .controller('MedicalCtrl', function($scope, $stateParams, $filter, MedicalSQLite, SyncService) {
        MedicalSQLite.GetMedicals().then(function(response){
            shareMedicalData = response;
            //get distinct paiddate for group data by paiddate
            MedicalSQLite.GetDistinctPaidDate().then(function(resultDistinct){
                $scope.MedicalInfo = CreateFinanceInfoGroupByDate(resultDistinct,$filter,shareMedicalData,'medical');
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
    .controller('FinanceCtrl', function($scope, MedicalSQLite, TuitionSQLite, SyncService) {
        //***Medical
        //if disable sync, Get new data when page load.
        SyncService.SyncMedical().then(function(numberOfNewData){
             //get current data from sqlite
             InitialMedicalInfo($scope,MedicalSQLite,numberOfNewData);    
        });
        //get current data from sqlite
        //if(!enableSync) ProcessSyncMedicalData($scope,MedicalSQLite,APIService,AuthService);
        //***Medical

        //***tuition
        SyncService.SyncTuition().then(function(numberOfNewData){
            //get current data from sqlite
            InitialTuitionInfo($scope,TuitionSQLite,numberOfNewData);
        });   
        //get current data from sqlite
        //if(!enableSync) ProcessSyncTuitionData($scope,TuitionSQLite,APIService,AuthService);
        //***tuition

    })
    .controller('HrCtrl', function($scope, $stateParams) {

    })
    .controller('TuitionCtrl', function($scope, $stateParams, $filter, TuitionSQLite, SyncService) {
        // shareTuitionData = tmpTuitionData;
        // $scope.TuitionInfo = CreateFinanceInfoGroupByDate(tmpDistinctTuitionData,$filter,shareTuitionData,'tuition');
        TuitionSQLite.GetTuitions().then(function(response){
            shareTuitionData = response;
            //get distinct paiddate for group data by paiddate
            TuitionSQLite.GetDistinctPaidDate().then(function(resultDistinct){
                $scope.TuitionInfo = CreateFinanceInfoGroupByDate(resultDistinct,$filter,shareTuitionData,'tuition');
            });
        });
    })
    .controller('TuitionDetailCtrl', function($scope, $stateParams, $filter) {
        InitialTuitionDetails($scope,$filter,$stateParams);
    })
    .controller('RoyalCtrl', function($scope, $stateParams, RoyalSQLite, SyncService, $filter) {
        SyncService.SyncRoyal().then(function(){
            //get current data from sqlite
            InitialRoyalInfo($scope,RoyalSQLite,$filter);
        });
       
        //get current data from sqlite
        //else InitialRoyalInfo($scope,RoyalSQLite,$filter);
        //if(!enableSync) ProcessSyncRoyalData($scope,RoyalSQLite,APIService,AuthService,$filter);  
    })

function InitialMedicalInfo($scope,MedicalSQLite,totalNotification){
    $scope.medicalInfo = {};
    MedicalSQLite.GetSumMedicalTotal().then(
        function(response){
            if(response.rows.item(0).total != null && response.rows.item(0).total > 0) $scope.medicalInfo.totalSpent = response.rows.item(0).total;
            else $scope.medicalInfo.totalSpent = 0;
        },
        function(error){$scope.medicalInfo.totalSpent = 0;}
    );
    $scope.medicalInfo.notification = (totalNotification && totalNotification !== null && totalNotification != 'undefined') ? totalNotification : 0;
};

function InitialTuitionInfo($scope,TuitionSQLite,totalNotification){
    $scope.tuitionInfo = {};
    TuitionSQLite.GetSumTuitionGrandTotal().then(
        function(response){
            if(response.rows.item(0).Grand_Total != null && response.rows.item(0).Grand_Total > 0) $scope.tuitionInfo.totalSpent = response.rows.item(0).Grand_Total;
            else $scope.tuitionInfo.totalSpent = 0;
        },
        function(error){$scope.tuitionInfo.totalSpent = 0;}
    );
    $scope.tuitionInfo.notification = (totalNotification && totalNotification !== null && totalNotification != 'undefined') ? totalNotification : 0;
};

function InitialRoyalInfo($scope,RoyalSQLite,$filter){
    $scope.RoyalInfo = [];
    RoyalSQLite.GetRoyals().then(function(response){
        if(response.rows.length > 0){
            for (var i = 0; i <= response.rows.length - 1; i++) {
                var currentRoyal = {};
                currentRoyal.royalName = response.rows.item(i).Roya_Name;
                currentRoyal.royalCode = response.rows.item(i).Roya_Code;
                currentRoyal.royalDate = GetThaiDateByDate($filter,response.rows.item(i).Roya_Date);
                $scope.RoyalInfo.push(currentRoyal);
            };    
        }
    })
};

function InitialTimeInfo($scope,$filter){
    $scope.ddlMonthsData = GetTimeDDLOptions($filter);
    $scope.BindList();
};

function InitialLeaveInfo($scope,$filter,LeaveSQLite){
    LeaveSQLite.GetLeaves().then(function(response){
        var result = ConvertQueryResultToArray(response);
        if(result == null || result.length == 0) return;
        $scope.leaveInfo = {};
        $scope.leaveInfo.sickLeave = GetLeaveDetails('1',result,$filter);
        $scope.leaveInfo.annualLeave = GetLeaveDetails('2',result,$filter);
        $scope.leaveInfo.personalLeave = GetLeaveDetails('4',result,$filter);
    });
};

function InitialMedicalDetails($scope,$filter,$stateParams){
    var shareMedicalDataArr = ConvertQueryResultToArray(shareMedicalData);
    var currentMedical = $filter('filter')(shareMedicalDataArr, { Id: $stateParams.Id });
    $scope.MedicalDetails = {};
    $scope.MedicalDetails.hospitalType = (currentMedical[0].HospType == 320) ? 'รัฐบาล' : 'เอกชน';
    $scope.MedicalDetails.hospitalName = currentMedical[0].HospName;
    $scope.MedicalDetails.patientType = currentMedical[0].PatientType;
    $scope.MedicalDetails.family = currentMedical[0].Family;
    $scope.MedicalDetails.patientName = currentMedical[0].PatientName;
    $scope.MedicalDetails.disease = currentMedical[0].Disease;
    $scope.MedicalDetails.total = currentMedical[0].Total;
    $scope.MedicalDetails.docdate = GetThaiDateByDate($filter,currentMedical[0].DocDate);
    $scope.MedicalDetails.paidDate = GetThaiDateByDate($filter,currentMedical[0].PaidDate);
    $scope.MedicalDetails.bankName = currentMedical[0].BankName;
};

function InitialTuitionDetails($scope,$filter,$stateParams){
    var shareTuitionDataArr = ConvertQueryResultToArray(shareTuitionData);
    var currentTuition = $filter('filter')(shareTuitionDataArr, { Id: $stateParams.Id });
    $scope.TuitionDetails = {};
    $scope.TuitionDetails.paidDate = GetThaiDateByDate($filter,currentTuition[0].Paid_Date.replace(/\//g,''));
    $scope.TuitionDetails.total = currentTuition[0].Total_Amnt;
    $scope.TuitionDetails.vatAmnt = currentTuition[0].Vat_Amnt;
    $scope.TuitionDetails.grandTotal = currentTuition[0].Grand_Total;
    $scope.TuitionDetails.bankName = currentTuition[0].BankName;
};

function ProcessSyncMedicalData($scope,MedicalSQLite,APIService,AuthService){
    //get latest ts
    MedicalSQLite.GetLatestTS().then(function(lastesTS){
        //post to get new data
        var url = APIService.hostname() + '/Medicals/MedicalValues';
        var myEmpId = '393028'; //AuthService.username()
        var data = { EmpID: myEmpId, FromDate: GetFiscalDate(), ToDate: GetCurrentDate().replace(/\//g,''), TS: lastesTS};
        APIService.httpPost(url,data,
            function(response){
                var result = response.data;
                if(result != null && result.length > 0){
                    //if disable sync, Delete current data before then insert new data.
                    if(!enableSync){
                        MedicalSQLite.DeleteAllMedical().then(function(){
                            //save to sqlite
                            MedicalSQLite.SaveMedicals(result).then(function(){
                                //bind new data to ui
                                InitialMedicalInfo($scope,MedicalSQLite,result.length);   
                            });        
                        });
                    }
                    else{
                        //save to sqlite
                        MedicalSQLite.SaveMedicals(result).then(function(){
                            //bind new data to ui
                            InitialMedicalInfo($scope,MedicalSQLite,result.length);   
                        });    
                    }
                }
            },
            function(error){});    
    });
};

function ProcessSyncTuitionData($scope,TuitionSQLite,APIService,AuthService){
    //get latest ts
    TuitionSQLite.GetLatestTS().then(function(lastesTS){
        //post to get new data
        var url = APIService.hostname() + '/ASSI/ASSIValues';
        var myEmpId = '409689'; //AuthService.username()
        var data = { Empl_Code: myEmpId, FromDate: GetFiscalDate(), ToDate: GetCurrentDate().replace(/\//g,''), TS: lastesTS};
        APIService.httpPost(url,data,
            function(response){
                var result = response.data;
                if(result != null && result.length > 0){
                    //if disable sync, Delete current data before then insert new data.
                    if(!enableSync){
                        TuitionSQLite.DeleteAllTuition().then(function(){
                            //save to sqlite
                            TuitionSQLite.SaveTuitions(result).then(function(){
                                //bind new data to ui
                                InitialTuitionInfo($scope,TuitionSQLite,result.length);   
                            });        
                        });
                    }
                    else{
                        //save to sqlite
                        TuitionSQLite.SaveTuitions(result).then(function(){
                            //bind new data to ui
                            InitialTuitionInfo($scope,TuitionSQLite,result.length);   
                        });    
                    }
                }
            },
            function(error){});    
    });
};

function ProcessSyncRoyalData($scope,RoyalSQLite,APIService,AuthService,$filter){
    //get latest ts
    RoyalSQLite.GetLatestTS().then(function(lastesTS){
        //post to get new data
        var url = APIService.hostname() + '/Royal/RoyalValues';
        var myEmpId = '221577'; //AuthService.username()
        var data = { Empl_Code: myEmpId, TS: lastesTS};
        APIService.httpPost(url,data,
            function(response){
                var result = response.data;
                if(result != null && result.length > 0){
                    //if disable sync, Delete current data before then insert new data.
                    if(!enableSync){
                        RoyalSQLite.DeleteAllRoyal().then(function(){
                            //save to sqlite
                            RoyalSQLite.SaveRoyals(result).then(function(){
                                InitialRoyalInfo($scope,RoyalSQLite,$filter);
                            });
                        });
                    }
                    //save to sqlite
                    else {
                        RoyalSQLite.SaveRoyals(result).then(function(){
                            InitialRoyalInfo($scope,RoyalSQLite,$filter);    
                        });    
                    }
                }
            },
            function(error){});    
    });
};

function ProcessSyncTimeData($scope,TimeAttendanceSQLite,APIService,AuthService,$filter){
    //get latest ts
    TimeAttendanceSQLite.GetLatestTS().then(function(lastesTS){
        //post to get new data
        var url = APIService.hostname() + '/TA/TAValues';
        var myEmpId = '576222'; //AuthService.username()
        var data = { EmpID: myEmpId, FromDate: GetFiscalDate(), ToDate: GetCurrentDate().replace(/\//g,'') , TS: lastesTS};
        APIService.httpPost(url,data,
            function(response){
                var result = response.data;
                if(result != null && result.length > 0){
                    //if disable sync, Delete current data before then insert new data.
                    if(!enableSync){
                        TimeAttendanceSQLite.DeleteAllTimeAttendance().then(function(){
                            //save to sqlite
                            TimeAttendanceSQLite.SaveTimeAttendances(result).then(function(){
                                InitialTimeInfo($scope,$filter);
                            });
                        });
                    }
                    //save to sqlite
                    else {
                        TimeAttendanceSQLite.SaveTimeAttendances(result).then(function(){
                            InitialTimeInfo($scope,$filter);    
                        });    
                    }
                }
            },
            function(error){});    
    });
};

function ProcessSyncLeaveData($scope,LeaveSQLite,APIService,AuthService,$filter){
    //get latest ts
    LeaveSQLite.GetLatestTS().then(function(lastesTS){
        //post to get new data
        var url = APIService.hostname() + '/Leave/LeaveValues';
        var myEmpId = '565888'; //AuthService.username()
        var data = { Empl_Code: myEmpId, LeaveType:'', FromDate: GetFiscalDate(), ToDate: GetCurrentDate().replace(/\//g,'') , TS: lastesTS};
        APIService.httpPost(url,data,
            function(response){
                var result = response.data;
                if(result != null && result.length > 0){
                    //if disable sync, Delete current data before then insert new data.
                    if(!enableSync){
                        LeaveSQLite.DeleteAllLeave().then(function(){
                            //save to sqlite
                            LeaveSQLite.SaveLeaves(result).then(function(){
                                InitialLeaveInfo($scope,$filter,LeaveSQLite);
                            });
                        });
                    }
                    //save to sqlite
                    else {
                        LeaveSQLite.SaveLeaves(result).then(function(){
                            InitialLeaveInfo($scope,$filter,LeaveSQLite);    
                        });    
                    }
                }
            },
            function(error){});    
    });
};

function CreateFinanceInfoGroupByDate(distinctPaidDate,$filter,shareData,type){
    var result = [];
    for (var i = 0; i <= distinctPaidDate.rows.length -1; i++) {
        var currentPaidDate;
        var currentFinanceDetailsByPaidDate;
        var shareDataArr = ConvertQueryResultToArray(shareData);
        switch(type){
            case "medical":
                currentPaidDate = distinctPaidDate.rows.item(i).PaidDate;
                currentFinanceDetailsByPaidDate = $filter('filter')(shareDataArr,{PaidDate:currentPaidDate});   
            break;
            case "tuition":
                currentPaidDate = distinctPaidDate.rows.item(i).Paid_Date;
                currentFinanceDetailsByPaidDate = $filter('filter')(shareDataArr,{Paid_Date:currentPaidDate});
            break;
        }
        if(currentPaidDate.indexOf('/') > -1) currentPaidDate = currentPaidDate.replace(/\//g,'');
        var newData = {};
        newData.paidDate = GetThaiDateByDate($filter,currentPaidDate);
        newData.paidDetails = [];
        for (var z = 0; z <= currentFinanceDetailsByPaidDate.length -1; z++) {
            switch(type){
                case "medical":
                    newData.paidDetails.push({id:currentFinanceDetailsByPaidDate[z].Id,total:currentFinanceDetailsByPaidDate[z].Total,bankName:currentFinanceDetailsByPaidDate[z].BankName});    
                break;
                case "tuition":
                    newData.paidDetails.push({id:currentFinanceDetailsByPaidDate[z].Id,grandtotal:currentFinanceDetailsByPaidDate[z].Grand_Total,bankName:currentFinanceDetailsByPaidDate[z].BankName});    
                break;
            }
        };
        result.push(newData);
    };
    return result;
};

function GetTimeDDLOptions($filter){
    var result = {};
    result.options = [];
    var today = new Date();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    //bind default value
    result.selectedOptions = {val: GetStringNumber2Digits(month) + year.toString(), name:GetThaiMonthNameByMonth($filter,GetStringNumber2Digits(month)) + ' ' + (year + 543)};
    if(month < 10)
    {
        var endedYear = year - 1;
        var endedMonth = 9;
        for (var i = 0; i < 12; i++) {
            if(month == endedMonth && year == endedYear) break;
            result.options.push({val:GetStringNumber2Digits(month) + year.toString(),name:GetThaiMonthNameByMonth($filter,GetStringNumber2Digits(month)) + ' ' + (year + 543)});
            //if current month is january next round must decrease one year
            if(month == 1) {
                year -= 1;
                month = 12;
            } 
            else month -= 1;
        };
    }
    else
    {
        while(month >= 10)
        {
            result.options.push({val:month + year,name:GetThaiMonthNameByMonth($filter,GetStringNumber2Digits(month)) + ' ' + (year + 543)});
            month -= 1
        }
    }
    return result;
};

function GetTimeInfo(distinctStampDate,$filter,allTADatas){
    var result = [];
    for (var i = 0; i <= distinctStampDate.length - 1; i++) {
        var currentTAData = $filter('filter')(allTADatas,{stampdate:distinctStampDate[i].stampdate});
        var newData = {};
        newData.taDate = GetThaiDateByDate($filter,distinctStampDate[i].stampdate);
        newData.taDetails = [];
        for (var z = 0; z <= currentTAData.length - 1; z++) {
            newData.taDetails.push({taStampTime:currentTAData[z].stamptimeonly,taLocation:currentTAData[z].Location});
        };
        result.push(newData);
    };
    return result;
};

function GetLeaveDetails(leaveCode,allLeaveDatas,$filter){
    var result = {};
    var leaves = $filter('filter')(allLeaveDatas,{Leave_Code:leaveCode});
    result.totalLeave = leaves.length;
    result.leaveDate = [];
    for (var i = 0; i <= leaves.length - 1; i++) {
        result.leaveDate.push({leavedate:GetThaiDateByDate($filter,leaves[i].Leave_Date),leavefrom:GetThaiDateByDate($filter,leaves[i].Leave_From)});
    };
    return result;
}