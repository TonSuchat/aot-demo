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
            .state('app.info.leavedetail', {
                url: '/leavedetail?leavecode&leavename&fiscalyear',
                views: {
                    'hr': {
                        templateUrl: 'templates/info/leave_details.html',
                        controller: 'LeaveDetailCtrl'
                    }
                }
            })
            .state('app.info.tax', {
                url: '/tax',
                views: {
                    'hr': {
                        templateUrl: 'templates/info/tax.html',
                        controller: 'TaxCtrl'
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
    .controller('TimeCtrl', function($scope, $q, $filter, TimeAttendanceSQLite, SyncService, $ionicPlatform, APIService, $rootScope, $cordovaNetwork, $ionicPopup) {
        $ionicPlatform.ready(function(){

            APIService.ShowLoading();

            //have internet connection
            if(CheckNetwork($cordovaNetwork)){
                SyncService.SyncTime().then(function(){
                    FinalActionInfo($scope,APIService);
                    GetAllTimes($scope,TimeAttendanceSQLite);
                    InitialTimeInfo($scope,$q,$filter,TimeAttendanceSQLite);
                });    
            }
            else{
                //no internet connection
                GetAllTimes($scope,TimeAttendanceSQLite);
                InitialTimeInfo($scope,$q,$filter,TimeAttendanceSQLite);  
            } 

            $scope.BindList = function(){
                var selectedVal = $scope.ddlMonthsData.selectedOptions.val;
                if(!selectedVal || selectedVal.length == 0) return APIService.HideLoading();
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
                        APIService.HideLoading();
                });
            };

            

            $scope.Refresh = function(){
                //if no internet connection
                if(!CheckNetwork($cordovaNetwork)){
                    OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
                    FinalActionInfo($scope,APIService);
                }
                else{
                    APIService.ShowLoading();
                    //if disable sync, Get new data when page load.
                    SyncService.SyncTime().then(function(){
                        FinalActionInfo($scope,APIService);
                    });
                    //if(!enableSync) ProcessSyncTimeData($scope,TimeAttendanceSQLite,APIService,AuthService,$filter);

                    // //get all data only one times for use with $filter
                    TimeAttendanceSQLite.GetTimeAttendances().then(function(response){
                        $scope.allTADatas = ConvertQueryResultToArray(response);
                    });
                    InitialTimeInfo($scope,$q,$filter,TimeAttendanceSQLite);    
                }
            };

        });

        CheckNeedToReload($rootScope,'/time');

    })
    .controller('LeaveCtrl', function($scope, $filter, LeaveSQLite, LeaveSummarySQLite, SyncService, $ionicPlatform, APIService, $rootScope, $cordovaNetwork, $ionicPopup, $q) {
        $ionicPlatform.ready(function(){
            $scope.notFoundData = false;
            APIService.ShowLoading();

            $scope.toggleGroup = function(group) {
                if ($scope.isGroupShown(group)) {
                    $scope.shownGroup = null;
                } 
                else {
                    $scope.shownGroup = group;
                }
            };

            $scope.isGroupShown = function(group) {
                return $scope.shownGroup == group;
            };

            //have internet connection
            if(CheckNetwork($cordovaNetwork)){
                SyncService.SyncLeaveSummary().then(function(){
                    InitialLeaveSummary();
                    SyncService.SyncLeave().then(function(){
                        //InitialLeaveInfo($scope,$filter,LeaveSQLite,$q);
                        FinalActionInfo($scope,APIService);
                    });
                });
            }
            else{
                //no internet connection
                InitialLeaveSummary();
                //InitialLeaveInfo($scope,$filter,LeaveSQLite,$q);
                FinalActionInfo($scope,APIService);
            }

            $scope.Refresh = function(){
                //if no internet connection
                if(!CheckNetwork($cordovaNetwork)){
                    OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
                    FinalActionInfo($scope,APIService);
                }
                else{
                    APIService.ShowLoading();
                    SyncService.SyncLeaveSummary().then(function(){
                        InitialLeaveSummary();
                        SyncService.SyncLeave().then(function(){
                            //InitialLeaveInfo($scope,$filter,LeaveSQLite,$q);
                            FinalActionInfo($scope,APIService);
                        });
                    });    
                }
            };
        });

        CheckNeedToReload($rootScope,'/leave');

        function InitialLeaveSummary(){
            $scope.FiscalYear = GetFiscalYear();
            //get leave summary info of current year
            LeaveSummarySQLite.GetLeaveSummaryInfos($scope.FiscalYear).then(function(response){
                var data = ConvertQueryResultToArray(response);
                if(data != null && data.length > 0){
                    //if current fiscal year have data
                    $scope.leaveSummaryGroups = [];
                    angular.forEach(data,function(value,key){
                        $scope.leaveSummaryGroups.push({LeaveCode:value.LeaveCode,name:value.LeaveName,Details:'(ใช้ไป ' + value.Used + ' วัน,คงเหลือ ' + value.Left + ' วัน)',Bring:value.Bring,YearRight:value.YearRight,SumRight:value.SumRight,Used:value.Used,Left:value.Left});
                    });
                }
                else{
                    //if current fiscal year don't have data then use previous year
                    $scope.FiscalYear--;
                    LeaveSummarySQLite.GetLeaveSummaryInfos($scope.FiscalYear).then(function(response){
                        var data = ConvertQueryResultToArray(response);
                        $scope.leaveSummaryGroups = [];
                        angular.forEach(data,function(value,key){
                            $scope.leaveSummaryGroups.push({LeaveCode:value.LeaveCode,name:value.LeaveName + ' (' + value.Used + ' วัน)',Bring:value.Bring,YearRight:value.YearRight,SumRight:value.SumRight,Used:value.Used,Left:value.Left});
                        });
                    });
                }
            });
            // BindDDLFiscalYear().then(function(){
            //     if($scope.ddlFiscalYear.options.length > 0) ProcessLeaveSummary($scope.ddlFiscalYear.options[0].val);    
            // });
        };

        function ProcessLeaveSummary(fiscalYear){
            LeaveSummarySQLite.GetLeaveSummaryInfos(fiscalYear).then(function(response){
                var data = ConvertQueryResultToArray(response);
                $scope.leaveSummaryGroups = [];
                angular.forEach(data,function(value,key){
                    $scope.leaveSummaryGroups.push({LeaveCode:value.LeaveCode,name:value.LeaveName + ' (' + value.Used + ' วัน)',Bring:value.Bring,YearRight:value.YearRight,SumRight:value.SumRight,Used:value.Used,Left:value.Left});
                });
            });
        };

        function BindDDLFiscalYear(){
            return $q(function(resolve){
                $scope.ddlFiscalYear = {options:[],selectedOptions:null};
                LeaveSummarySQLite.GetFiscalYears().then(function(response){
                    if(response == null) return resolve();
                    var fiscalYears = ConvertQueryResultToArray(response);
                    angular.forEach(fiscalYears,function(value,key){
                        $scope.ddlFiscalYear.options.push({name:value.FiscalYear,val:value.FiscalYear});
                    });
                    $scope.ddlFiscalYear.selectedOptions = $scope.ddlFiscalYear.options[0];
                    return resolve();
                });
            });
        };

    })
    .controller('LeaveDetailCtrl',function($scope, LeaveSQLite, $stateParams, $ionicPlatform, APIService, $filter){
        $ionicPlatform.ready(function(){
            //APIService.ShowLoading();
            if($stateParams.leavecode == null) return;
            $scope.leaveCode = $stateParams.leavecode;
            $scope.leaveName = $stateParams.leavename;
            $scope.fiscalYear = $stateParams.fiscalyear;
            $scope.leaveDetails = [];
            LeaveSQLite.GetLeavesByLeaveCode($scope.leaveCode,$scope.fiscalYear).then(function(response){
                if(response == null) return;
                var data = ConvertQueryResultToArray(response);
                InitialLeaveDetails(data);
            });
        });

        function InitialLeaveDetails(data){
            angular.forEach(data,function(value,key){
                $scope.leaveDetails.push({val:GetThaiDateByDate($filter,value.Leave_From),leaveDay:value.Leave_Day});
            });
        };

    })
    .controller('MedicalCtrl', function($scope, $stateParams, $filter, MedicalSQLite, SyncService, $rootScope, $ionicPlatform, $ionicPopup) {
        $ionicPlatform.ready(function(){
            //bind ddl fiscal year
            BindDDLInfoFiscalYear($scope);
            InitialFiltersMedical($scope,MedicalSQLite);
            $scope.notFoundData = false;

            $scope.updateDisease = function(item){
                $scope.ProcessFilter();
            };

            $scope.updatePatientType = function(item){
                if(item.selected && ($scope.selectedPatientTypes.indexOf(item.val) < 0)) $scope.selectedPatientTypes.push(item.val);  
                else{
                    if($scope.selectedPatientTypes.length == 1){
                        item.selected = true;
                        IonicAlert($ionicPopup,'ต้องเลือกอย่างน้อย 1 ประเภท',null)
                    }
                    else $scope.selectedPatientTypes.splice($scope.selectedPatientTypes.indexOf(item.val), 1);
                }
                //update result
                $scope.ProcessFilter();
            };

            $scope.updateHospitalType = function(item){
                if(item.selected && ($scope.selectedHospitalTypes.indexOf(item.val) < 0)) $scope.selectedHospitalTypes.push(item.val);
                else{
                    if($scope.selectedHospitalTypes.length == 1){
                        item.selected = true;
                        IonicAlert($ionicPopup,'ต้องเลือกอย่างน้อย 1 ประเภท',null)
                    } 
                    else $scope.selectedHospitalTypes.splice($scope.selectedHospitalTypes.indexOf(item.val), 1);
                }
                //update result
                $scope.ProcessFilter();
            };

            $scope.calculateSumTotal = function(data){
                if(data == null || data.length == 0) return 0;
                var sum = 0;
                for (var i = 0; i <= data.length - 1; i++) {
                    sum += data[i].Total;
                };
                return sum;
            };

            $scope.ProcessFilter = function(){
                if(shareMedicalData.length == 0) return $scope.MedicalInfo = [];
                var result = shareMedicalData;
                //var resultPatientTypes = [];
                // //disease
                // if($scope.ddlDisease.selectedOptions.val == 0){
                //   resultPatientTypes.push(2);resultPatientTypes.push(3);  
                // } 
                // else resultPatientTypes.push($scope.ddlDisease.selectedOptions.val);
                //patient type
                //resultPatientTypes = resultPatientTypes.concat($scope.selectedPatientTypes);
                //console.log('resultPatientTypes',resultPatientTypes);
                result = result.filter(function(el){ return $scope.selectedPatientTypes.indexOf(el.SickGroup) >= 0; })
                //hospital type
                result = result.filter(function(el){ return $scope.selectedHospitalTypes.indexOf(el.HospType) >= 0; })
                //set result to repeater
                $scope.MedicalInfo = $scope.CreateMedicalInfo(result);
                //edit sum
                $scope.sumTotal = $scope.calculateSumTotal(result);
            };

            $scope.GetThaiDateByDate = function(inputDate){
              return GetThaiDateByDate($filter,inputDate);
            };

            $scope.max = function(arr){
              return $filter('min')
                ($filter('map')(arr, '-OrderField'));
            };

            $scope.CreateMedicalInfo = function(data){
                var arr = [];
                for (var i = 0; i <= data.length - 1; i++) {
                    arr.push({
                        PaidDate:data[i].PaidDate,
                        Id:data[i].Id,
                        Total:data[i].Total,
                        OrderField:data[i].PaidDate.substring(4) + data[i].PaidDate.substring(2,4) + data[i].PaidDate.substring(0,2)
                    });
                };
                return arr;
            };

            //ddl change fiscal year
            $scope.ProcessMedical = function(fiscalYear){
                // //todo edit sum total medical
                // MedicalSQLite.GetSumMedicalTotal(fiscalYear).then(function(response){
                //     if(response != null){
                //         var result = ConvertQueryResultToArray(response);
                //         if(result.length == 0 || result[0].total == null) return $scope.sumTotal = 0;
                //         $scope.sumTotal = result[0].total;
                //     }
                //     else $scope.sumTotal = 0;
                // });
                //find details
                MedicalSQLite.GetMedicals(fiscalYear).then(function(response){
                    if(response != null){
                        var result = ConvertQueryResultToArray(response);
                        if(result.length ==0) {
                            $scope.notFoundData = true;
                            $scope.MedicalInfo = [];
                            shareMedicalData = [];
                        }
                        else {
                            $scope.notFoundData = false;
                            shareMedicalData = result;
                            //$scope.MedicalInfo = $scope.CreateMedicalInfo(result);
                            //filter by conditions
                            $scope.ProcessFilter();
                        }
                    }
                });
            };

            //initial
            $scope.ProcessMedical($scope.ddlFiscalYear.selectedOptions.val);

            //set new medical info = 0 on financial view
            $rootScope.$broadcast('seenMedicalInfo',null);
        });
        
    })
    .controller('MedicalDetailCtrl', function($scope, $stateParams, $filter, $ionicPlatform) {
        $ionicPlatform.ready(function(){
            InitialMedicalDetails($scope,$filter,$stateParams);
        });
    })
    .controller('FuelCtrl', function($scope, $stateParams) {
    })
    .controller('FuelDetailCtrl', function($scope, $stateParams) {

    })
    .controller('FinanceCtrl', function($scope, MedicalSQLite, TuitionSQLite, SyncService, $ionicPlatform, APIService, $rootScope, $cordovaNetwork, $ionicPopup, $rootScope, $q) {

        $ionicPlatform.ready(function(){

            var syncCompleted = 0;
            APIService.ShowLoading();

            //have internet connection
             if(CheckNetwork($cordovaNetwork)){
                //***Medical
                SyncService.SyncMedical().then(function(){
                    //get numberofNewDate from count column IsRead = false
                    MedicalSQLite.CountNewItem().then(function(response){
                        var result = ConvertQueryResultToArray(response);
                        var numberOfNewData = result[0].newItem;
                        syncCompleted++;
                        //get current data from sqlite
                        InitialMedicalInfo($scope,MedicalSQLite,numberOfNewData);
                        if(syncCompleted == 2) FinalActionInfo($scope,APIService);
                    });
                });
                //***Medical

                //***tuition
                SyncService.SyncTuition().then(function(){
                    //get numberofNewDate from count column IsRead = false
                    TuitionSQLite.CountNewItem().then(function(response){
                        var result = ConvertQueryResultToArray(response);
                        var numberOfNewData = result[0].newItem;
                        syncCompleted++;
                        //get current data from sqlite
                        InitialTuitionInfo($scope,TuitionSQLite,numberOfNewData);
                        if(syncCompleted == 2) FinalActionInfo($scope,APIService);
                    });
                });
                //***tuition
             }
             else{
                //no internet connection
                //get current Medical data from sqlite
                InitialMedicalInfo($scope,MedicalSQLite,0);
                //get current Tuition data from sqlite
                InitialTuitionInfo($scope,TuitionSQLite,0);
                FinalActionInfo($scope,APIService);
             }

            //pull to sync data
            $scope.Refresh = function(){
                //if no internet connection
                if(!CheckNetwork($cordovaNetwork)){
                    OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
                    FinalActionInfo($scope,APIService);
                }
                else{
                    syncCompleted = 0;
                    APIService.ShowLoading();
                    //***Medical
                    SyncService.SyncMedical().then(function(numberOfNewData){
                        syncCompleted++;
                        //get current data from sqlite
                        InitialMedicalInfo($scope,MedicalSQLite,numberOfNewData);
                        if(syncCompleted == 2) FinalActionInfo($scope,APIService);    
                    });
                    //***Medical

                    //***tuition
                    SyncService.SyncTuition().then(function(numberOfNewData){
                        syncCompleted++;
                        //get current data from sqlite
                        InitialTuitionInfo($scope,TuitionSQLite,numberOfNewData);
                        if(syncCompleted == 2) FinalActionInfo($scope,APIService); 
                    });   
                    //***tuition    
                }
            };

            //set medical notification = 0 when user go to medical view
            $rootScope.$on('seenMedicalInfo',function(){
                //update isread = true at API and sqliteDB
                UpdateIsRead(1,window.localStorage.getItem("CurrentUserName"),MedicalSQLite).then(function(response){
                    if(response) $scope.medicalInfo.notification = 0;
                });
            });

            //set medical notification = 0 when user go to medical view
            $rootScope.$on('seenTuitionInfo',function(){
                UpdateIsRead(6,window.localStorage.getItem("CurrentUserName"),TuitionSQLite).then(function(response){
                    if(response) $scope.tuitionInfo.notification = 0; 
                });
            });

        });

        CheckNeedToReload($rootScope,'/finance');

        function  UpdateIsRead(objectId,empl_code,sqliteService) {
            return $q(function(resolve){
                //post to api for update isread
                var url = APIService.hostname() + '/SyncData/SyncIsRead';
                var data = {ObjectID:objectId,Empl_Code:empl_code};
                APIService.ShowLoading();
                APIService.httpPost(url,data,function(){
                    //update isread in sqliteDB
                    sqliteService.UpdateIsRead().then(function(){APIService.HideLoading();resolve(true);},function(){APIService.HideLoading();resolve(false);})
                },function(){APIService.HideLoading();resolve(false);});
            });
        };

    })
    .controller('HrCtrl', function($scope, $stateParams, APIService) {

    })
    .controller('TaxCtrl',function($scope,APIService,$cordovaFile,$cordovaFileOpener2,$cordovaNetwork,$ionicPopup){

        if(!CheckNetwork($cordovaNetwork)) return OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
        else{
            InitialTaxDetails($scope);
            $scope.empCode = window.localStorage.getItem("CurrentUserName");

            $scope.OpenTax91 = function(){
                var taxYear = $scope.ddlTaxYear.selectedOptions.val;
                //check pin is exist
                APIService.ShowLoading();
                var url = APIService.hostname() + '/DeviceRegistered/CheckExistPIN';
                var data = {Empl_Code:window.localStorage.getItem('CurrentUserName')};
                APIService.httpPost(url,data,function(response){
                    if(response.data){
                        APIService.HideLoading();
                        $scope.DisplayPDFTax('Tax_91',taxYear);
                    }
                    else{
                        APIService.HideLoading();
                        IonicAlert($ionicPopup,'ต้องตั้งค่า PIN ก่อนใช้งาน',function(){
                            window.location = '#/app/helppinsetting';
                        });
                    }
                  },
                    function(error){console.log(error);APIService.HideLoading();});                
            };

            $scope.OpenTax50 = function(){
                var taxYear = $scope.ddlTaxYear.selectedOptions.val;
                //check pin is exist
                APIService.ShowLoading();
                var url = APIService.hostname() + '/DeviceRegistered/CheckExistPIN';
                var data = {Empl_Code:window.localStorage.getItem('CurrentUserName')};
                APIService.httpPost(url,data,function(response){
                    if(response.data){
                        APIService.HideLoading();
                        $scope.DisplayPDFTax('Tax_50',taxYear);
                    }
                    else{
                        APIService.HideLoading();
                        IonicAlert($ionicPopup,'ต้องตั้งค่า PIN ก่อนใช้งาน',function(){
                            window.location = '#/app/helppinsetting';
                        });
                    }
                  },
                    function(error){console.log(error);APIService.HideLoading();});
            };

            $scope.DisplayPDFTax = function (methodName,taxYear) {
                IonicAlert($ionicPopup,'รหัสผ่านคือ PIN',function(){
                    var url = APIService.hostname() + '/' + methodName;
                    var data = {Empl_Code:$scope.empCode,TaxYear:taxYear};
                    var fileName = methodName;
                    DisplayPDF($cordovaFile,$cordovaFileOpener2,APIService,url,data,fileName);    
                });
            };    
        }

    })
    .controller('TuitionCtrl', function($scope, $filter, TuitionSQLite, SyncService, $rootScope, $ionicPlatform) {
        $ionicPlatform.ready(function(){
            //set new tuition info = 0 on financial view
            $rootScope.$broadcast('seenTuitionInfo',null);

            //bind ddl fiscal year
            BindDDLInfoFiscalYear($scope);

            $scope.GetThaiDateByDate = function(inputDate){
              return GetThaiDateByDate($filter,inputDate);
            };

            $scope.max = function(arr){
              return $filter('min')
                ($filter('map')(arr, '-OrderField'));
            };

            $scope.notFoundData = false;

            $scope.CreateTuitionInfo = function(data){
                var arr = [];
                for (var i = 0; i <= data.length - 1; i++) {
                    arr.push({
                        Paid_Date:data[i].Paid_Date,
                        Id:data[i].Id,
                        Grand_Total:data[i].Grand_Total,
                        BankName:data[i].BankName,
                        OrderField:data[i].Paid_Date.substring(4) + data[i].Paid_Date.substring(2,4) + data[i].Paid_Date.substring(0,2)
                    });
                };
                return arr;
            };

            //ddl change fiscal year
            $scope.ProcessTuition = function(fiscalYear){
                //sum total medical
                TuitionSQLite.GetSumTuitionGrandTotal(fiscalYear).then(function(response){
                    if(response != null){
                        var result = ConvertQueryResultToArray(response);
                        if(result.length == 0 || result[0].Grand_Total == null) return $scope.sumTotal = 0;
                        $scope.sumTotal = result[0].Grand_Total;
                    }
                    else $scope.sumTotal = 0;
                });
                //find details
                TuitionSQLite.GetTuitions(fiscalYear).then(function(response){
                    if(response != null){
                        var result = ConvertQueryResultToArray(response);
                        if(result.length ==0) {
                            $scope.notFoundData = true;
                            $scope.TuitionInfo = [];
                        }
                        else $scope.notFoundData = false;
                        shareTuitionData = result;
                        $scope.TuitionInfo = $scope.CreateTuitionInfo(result);
                    }
                });
            };

            //initial
            $scope.ProcessTuition($scope.ddlFiscalYear.selectedOptions.val);

        });
    })
    .controller('TuitionDetailCtrl', function($scope, $stateParams, $filter, $ionicPlatform) {
        $ionicPlatform.ready(function(){
            InitialTuitionDetails($scope,$filter,$stateParams);    
        });
    })
    .controller('RoyalCtrl', function($scope, RoyalSQLite, SyncService, $filter, $ionicPlatform, APIService, $rootScope, $cordovaNetwork, $ionicPopup) {
        $ionicPlatform.ready(function(){
            APIService.ShowLoading();
            SyncService.SyncRoyal().then(function(){
                //get current data from sqlite
                InitialRoyalInfo($scope,RoyalSQLite,$filter);
                FinalActionInfo($scope,APIService);
            });

            $scope.Refresh = function(){
                //if no internet connection
                if(!CheckNetwork($cordovaNetwork)){
                    OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
                    FinalActionInfo($scope,APIService);
                }
                else{
                    APIService.ShowLoading();
                    SyncService.SyncRoyal().then(function(){
                        //get current data from sqlite
                        InitialRoyalInfo($scope,RoyalSQLite,$filter);
                        FinalActionInfo($scope,APIService);
                    });    
                }
            };
        });

        CheckNeedToReload($rootScope,'/royal');
    })

function BindDDLInfoFiscalYear($scope){
    $scope.ddlFiscalYear = {selectedOptions:{},options:[]};
    var currentFiscalYear = GetFiscalYear();
    $scope.ddlFiscalYear.selectedOptions = {name:currentFiscalYear,val:currentFiscalYear};
    for (var i = 3; i > 0; i--) {
        $scope.ddlFiscalYear.options.push({name:currentFiscalYear,val:currentFiscalYear});    
        currentFiscalYear -= 1;
    };
};

function InitialFiltersMedical ($scope,MedicalSQLite) {
    // //bind ddl disease
    // $scope.ddlDisease = {selectedOptions:{},options:[]};
    // $scope.ddlDisease.selectedOptions = {name:'ทั้งหมด',val:''};
    // $scope.ddlDisease.options.push({name:'ทั้งหมด',val:''});
    // //get distinct all sickgroup
    // MedicalSQLite.GetDistinctSickGroup().then(function(response){
    //     if(response != null){
    //         var diseases = ConvertQueryResultToArray(response);
    //         console.log(diseases);
    //         for (var i = 0; i <= diseases.length - 1; i++) {
    //             $scope.ddlDisease.options.push({name:diseases[i].SickGroup,val:diseases[i].SickGroup});    
    //         };
    //     }
    // });
    //checkboxs patient type
    $scope.PatientTypes = [{name:'ผู้ป่วยนอก',selected:true,val:'ผู้ป่วยนอก'},{name:'ผู้ป่วยใน',selected:true,val:'ผู้ป่วยใน'},{name:'ทันตกรรม',selected:true,val:'ทันตกรรม'},{name:'ตรวจภายใน',selected:true,val:'ตรวจภายใน'}];
    $scope.selectedPatientTypes = ['ผู้ป่วยนอก','ตรวจภายใน','ทันตกรรม','ผู้ป่วยใน'];
    //checkboxs hospital type
    $scope.HospitalTypes = [{name:'รัฐบาล',selected:true,val:'รัฐบาล'},{name:'เอกชน',selected:true,val:'เอกชน'},{name:'ศูนย์แพทย์',selected:true,val:'ศูนย์แพทย์'}];
    $scope.selectedHospitalTypes = ['รัฐบาล','เอกชน','ศูนย์แพทย์'];
};

function InitialMedicalInfo($scope,MedicalSQLite,totalNotification){
    $scope.medicalInfo = {};
    // MedicalSQLite.GetSumMedicalTotal().then(
    //     function(response){
    //         if(response.rows.item(0).total != null && response.rows.item(0).total > 0) $scope.medicalInfo.totalSpent = parseFloat(response.rows.item(0).total).toFixed(2);
    //         else $scope.medicalInfo.totalSpent = 0;
    //     },
    //     function(error){$scope.medicalInfo.totalSpent = 0;}
    // );
    $scope.medicalInfo.notification = (totalNotification && totalNotification !== null && totalNotification != 'undefined') ? totalNotification : 0;
};

function InitialTuitionInfo($scope,TuitionSQLite,totalNotification){
    $scope.tuitionInfo = {};
    // TuitionSQLite.GetSumTuitionGrandTotal().then(
    //     function(response){
    //         if(response.rows.item(0).Grand_Total != null && response.rows.item(0).Grand_Total > 0) $scope.tuitionInfo.totalSpent = parseFloat(response.rows.item(0).Grand_Total).toFixed(2);
    //         else $scope.tuitionInfo.totalSpent = 0;
    //     },
    //     function(error){$scope.tuitionInfo.totalSpent = 0;}
    // );
    $scope.tuitionInfo.notification = (totalNotification && totalNotification !== null && totalNotification != 'undefined') ? totalNotification : 0;
};

function InitialRoyalInfo($scope,RoyalSQLite,$filter){
    $scope.notFoundData = true;
    $scope.RoyalInfo = [];
    RoyalSQLite.GetRoyals().then(function(response){
        if(response.rows.length > 0){
            $scope.notFoundData = false;
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

function InitialTimeInfo($scope,$q,$filter,TimeAttendanceSQLite){
    GetTimeDDLOptionsOnlyHaveData($filter,$q,TimeAttendanceSQLite).then(
        function(response){
            $scope.ddlMonthsData = response;
            $scope.BindList();
        });
};

function InitialLeaveInfo($scope,$filter,LeaveSQLite,$q){


    LeaveSQLite.GetLeaves().then(function(response){
        var result = ConvertQueryResultToArray(response);
        if(result == null || result.length == 0) return;

        //bind into accordion
        $scope.leaveGroups = [];

        //get leave datas
        $scope.leaveInfo = {};
        GetLeaveDetails('1',result,$filter,LeaveSQLite,$q).then(function(response){
            $scope.leaveInfo.sickLeave = response;
            $scope.leaveGroups.push({name:'ลาป่วย',items:$scope.leaveInfo.sickLeave.leaveDate,totalLeave:$scope.leaveInfo.sickLeave.totalLeave});
        });
        GetLeaveDetails('4',result,$filter,LeaveSQLite,$q).then(function(response){
            $scope.leaveInfo.annualLeave = response;
            $scope.leaveGroups.push({name:'ลาพักผ่อน',items:$scope.leaveInfo.annualLeave.leaveDate,totalLeave:$scope.leaveInfo.annualLeave.totalLeave});    
        });
        GetLeaveDetails('2',result,$filter,LeaveSQLite,$q).then(function(response){
            $scope.leaveInfo.personalLeave = response;
            $scope.leaveGroups.push({name:'ลากิจ',items:$scope.leaveInfo.personalLeave.leaveDate,totalLeave:$scope.leaveInfo.personalLeave.totalLeave});
        });

        //show first group by default
        $scope.shownGroup = $scope.leaveGroups[0];
    });
};

function InitialMedicalDetails($scope,$filter,$stateParams){
    if(shareMedicalData.length == 0) return;
    // console.log(shareMedicalData);
    // var shareMedicalDataArr = ConvertQueryResultToArray(shareMedicalData);
    var currentMedical = $filter('filter')(shareMedicalData, { Id: $stateParams.Id });
    $scope.MedicalDetails = {};
    $scope.MedicalDetails.hospitalType = currentMedical[0].HospType;
    $scope.MedicalDetails.hospitalName = currentMedical[0].HospName;
    $scope.MedicalDetails.patientType = currentMedical[0].PatientType;
    $scope.MedicalDetails.family = currentMedical[0].Family;
    $scope.MedicalDetails.patientName = currentMedical[0].PatientName;
    $scope.MedicalDetails.disease = currentMedical[0].Disease;
    $scope.MedicalDetails.total = parseFloat(currentMedical[0].Total).toFixed(2);
    $scope.MedicalDetails.docdate = GetThaiDateByDate($filter,currentMedical[0].DocDate);
    $scope.MedicalDetails.paidDate = GetThaiDateByDate($filter,currentMedical[0].PaidDate);
    $scope.MedicalDetails.bankName = currentMedical[0].BankName;
};

function GetHospNameByType(type){
    if(type == 320) return 'รัฐบาล';
    if(type == 321) return 'เอกชน';
    if(type == 322) return 'สำนักแพทย์';
    return '';
};

function GetPatientNameByType(type){
    if(type == 1) return 'OPD';
    if(type == 2) return 'ทำฟัน';
    if(type == 3) return 'ตรวจภายใน';
    if(type == 4) return 'IPD';
    return '';
};

function InitialTuitionDetails($scope,$filter,$stateParams){
    //var shareTuitionDataArr = ConvertQueryResultToArray(shareTuitionData);
    var currentTuition = $filter('filter')(shareTuitionData, { Id: $stateParams.Id });
    $scope.TuitionDetails = {};
    $scope.TuitionDetails.paidDate = GetThaiDateByDate($filter,currentTuition[0].Paid_Date.replace(/\//g,''));
    $scope.TuitionDetails.total = parseFloat(currentTuition[0].Total_Amnt).toFixed(2);
    $scope.TuitionDetails.vatAmnt = currentTuition[0].Vat_Amnt;
    $scope.TuitionDetails.grandTotal = currentTuition[0].Grand_Total;
    $scope.TuitionDetails.bankName = currentTuition[0].BankName;
};

function InitialTaxDetails ($scope) {
    BindDDLTaxYears($scope);
};

function BindDDLTaxYears($scope) {
    var result = [];
    var currentYear = new Date().getFullYear();
    var defaultYear = currentYear - 1;
    //result.push({val:currentYear,name:currentYear.toString()});
    for (var i = 1; i <= 3; i++) {
        currentYear--;
        result.push({val:currentYear,name:currentYear.toString()});
    };
    $scope.ddlTaxYear = {
        options:result,
        selectedOptions: {val: defaultYear, name: defaultYear.toString()}
    };
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
                                InitialLeaveInfo($scope,$filter,LeaveSQLite,$q);
                            });
                        });
                    }
                    //save to sqlite
                    else {
                        LeaveSQLite.SaveLeaves(result).then(function(){
                            InitialLeaveInfo($scope,$filter,LeaveSQLite,$q);    
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
                    newData.paidDetails.push({id:currentFinanceDetailsByPaidDate[z].Id,total:parseFloat(currentFinanceDetailsByPaidDate[z].Total).toFixed(2),bankName:currentFinanceDetailsByPaidDate[z].BankName});    
                break;
                case "tuition":
                    newData.paidDetails.push({id:currentFinanceDetailsByPaidDate[z].Id,grandtotal:parseFloat(currentFinanceDetailsByPaidDate[z].Grand_Total).toFixed(2),bankName:currentFinanceDetailsByPaidDate[z].BankName});    
                break;
            }
        };
        result.push(newData);
    };
    return result;
};

function GetAllTimes($scope,TimeAttendanceSQLite) {
    TimeAttendanceSQLite.GetTimeAttendances().then(function(response){
        $scope.allTADatas = ConvertQueryResultToArray(response);
    });
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

function GetTimeDDLOptionsOnlyHaveData($filter,$q,TimeAttendanceSQLite){
    return $q(function(resolve){
        var currentYear;
        var currentMonth;
        var result = {selectedOptions:{}};
        result.options = [];
        TimeAttendanceSQLite.GetDistinctMonthYear().then(
            function(response){
                if(response != null){
                    var dbResult = ConvertQueryResultToArray(response);
                    angular.forEach(dbResult,function(value,key){
                        currentYear = value.monthyear.substring(2,6);
                        currentMonth = value.monthyear.substring(0,2) //GetStringNumber2Digits(value.monthyear.substring(1,2));
                        result.options.push({val:value.monthyear,name:GetThaiMonthNameByMonth($filter,currentMonth) + ' ' + (+currentYear + 543)});
                    });
                    if(dbResult.length > 0) result.selectedOptions = {val:result.options[0].val,name:result.options[0].name}
                    resolve(result);
                }
                else resolve(null);
            },
            function(error){console.log(error);});
    });
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

function GetLeaveDetails(leaveCode,allLeaveDatas,$filter,LeaveSQLite,$q){
    return $q(function(resolve){
        var result = {};
        var leaves = $filter('filter')(allLeaveDatas,{Leave_Code:leaveCode});
        LeaveSQLite.GetTotalLeave(leaveCode).then(function(response){
            if(response == null) return resolve(result);
            else{
                result.totalLeave = ConvertQueryResultToArray(response)[0].totalLeave;
                result.leaveDate = [];
                for (var i = 0; i <= leaves.length - 1; i++) {
                    result.leaveDate.push({leavedate:GetThaiDateByDate($filter,leaves[i].Leave_Date),leavefrom:GetThaiDateByDate($filter,leaves[i].Leave_From)});
                };
                return resolve(result);
            }
        })
    });
};

function FinalActionInfo($scope,APIService){
    $scope.$broadcast('scroll.refreshComplete');
    APIService.HideLoading();
};