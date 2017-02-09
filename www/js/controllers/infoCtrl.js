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
            .state('app.info.timereport', {
                url: '/timereport',
                views: {
                    'hr': {
                        templateUrl: 'templates/info/timereport.html',
                        controller: 'TimeReportCtrl'
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
            $scope.FiscalYearText = (+$scope.FiscalYear + 543);
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
            $scope.fiscalYearTxt = +$stateParams.fiscalyear > 2500 ? $stateParams.fiscalyear : +$stateParams.fiscalyear + 543;
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
                if(item.selected && ($scope.selectedHospitalTypes.indexOf(item.name) < 0)) $scope.selectedHospitalTypes.push(item.name);
                else{
                    if($scope.selectedHospitalTypes.length == 1){
                        item.selected = true;
                        IonicAlert($ionicPopup,'ต้องเลือกอย่างน้อย 1 ประเภท',null)
                    } 
                    else $scope.selectedHospitalTypes.splice($scope.selectedHospitalTypes.indexOf(item.name), 1);
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
    .controller('TaxCtrl',function($scope,APIService,$cordovaFile,$cordovaFileOpener2,$cordovaNetwork,$ionicPopup,$q){

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
                //IonicAlert($ionicPopup,'รหัสผ่านคือ PIN',function(){});
                var url = APIService.hostname() + '/' + methodName;
                var data = {Empl_Code:$scope.empCode,TaxYear:taxYear};
                var fileName = methodName;
                DisplayPDF($q,$cordovaFile,$cordovaFileOpener2,APIService,url,data,fileName);    
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
    .controller('TimeReportCtrl',function($scope, SyncService, $ionicPlatform, APIService, $cordovaNetwork, $ionicPopup, TimeReportSQLite, $q, $filter){
        $ionicPlatform.ready(function(){

            //APIService.ShowLoading();

            //have internet connection
            if(CheckNetwork($cordovaNetwork)){
                SyncService.SyncTimeReport().then(function(){
                    FinalActionInfo($scope,APIService);
                    InitialTimeReportInfo($scope,$q,$filter,TimeReportSQLite);
                });    
            }
            else{
                //no internet connection
                InitialTimeReportInfo($scope,$q,$filter,TimeReportSQLite);  
            }

            $scope.BindTimeReportList = function()
            {   
                APIService.ShowLoading();
                $scope.timeReports = [];
                var selectedVal = $scope.ddlMonthsData.selectedOptions.val;
                if(!selectedVal || selectedVal.length == 0) return APIService.HideLoading();
                TimeReportSQLite.GetTimeReportsBySelectedMonthYear(selectedVal).then(function(response){
                    var data = ConvertQueryResultToArray(response);
                    for (var i = 0; i <= data.length - 1; i++) {
                        $scope.timeReports.push({
                            WORKDATE:GetThaiDateByDate($filter,data[i].WORKDATE),
                            STARTTIME:data[i].STARTTIME,
                            OFFTIME:data[i].OFFTIME,
                            NOTE:data[i].NOTE,
                            OUT_EARLY:data[i].OUT_EARLY,
                            OUT_LATE:data[i].OUT_LATE,
                            TIMECATEGORY:data[i].TIMECATEGORY
                            // LeaveStatus:data[i].LeaveStatus,
                            // Remark:data[i].Remark,
                            // TimeImage:'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'
                        });
                    };
                    APIService.HideLoading();
                });
            }

            function InitialTimeReportInfo()
            {
                GetTimeDDLOptionsOnlyHaveData($filter,$q,TimeReportSQLite).then(
                    function(response){
                        $scope.ddlMonthsData = response;
                        $scope.BindTimeReportList();
                    });
            }

            $scope.Refresh = function(){
                //if no internet connection
                if(!CheckNetwork($cordovaNetwork)){
                    OpenIonicAlertPopup($ionicPopup,'ไม่มีสัญญานอินเตอร์เนท','ไม่สามารถใช้งานส่วนนี้ได้เนื่องจากไม่ได้เชื่อมต่ออินเตอร์เนท');
                    FinalActionInfo($scope,APIService);
                }
                else{
                    APIService.ShowLoading();
                    //if disable sync, Get new data when page load.
                    SyncService.SyncTimeReport().then(function(){
                        FinalActionInfo($scope,APIService);
                        InitialTimeReportInfo($scope,$q,$filter,TimeReportSQLite);
                    });
                }
            };

        });
    })

function BindDDLInfoFiscalYear($scope){
    $scope.ddlFiscalYear = {selectedOptions:{},options:[]};
    var currentFiscalYear = GetFiscalYear();
    $scope.ddlFiscalYear.selectedOptions = {name:(+currentFiscalYear + 543),val:currentFiscalYear};
    for (var i = 3; i > 0; i--) {
        $scope.ddlFiscalYear.options.push({name:(+currentFiscalYear + 543),val:currentFiscalYear});    
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
    $scope.HospitalTypes = [{name:'รัฐบาล',selected:true,val:'รัฐบาล'},{name:'เอกชน',selected:true,val:'เอกชน'},{name:'สำนักแพทย์',selected:true,val:'ศูนย์แพทย์'}];
    $scope.selectedHospitalTypes = ['รัฐบาล','เอกชน','สำนักแพทย์'];
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
        result.push({val:currentYear,name:(+currentYear+543)});
    };
    $scope.ddlTaxYear = {
        options:result,
        selectedOptions: {val: defaultYear, name: (+defaultYear+543)}
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

function GetTimeDDLOptionsOnlyHaveData($filter,$q,sqliteService){
    return $q(function(resolve){
        var currentYear;
        var currentMonth;
        var result = {selectedOptions:{}};
        result.options = [];
        sqliteService.GetDistinctMonthYear().then(
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
            newData.taDetails.push({taStampTime:currentTAData[z].stamptimeonly,taLocation:currentTAData[z].Location,taImage:currentTAData[z].Image});
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