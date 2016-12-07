angular.module('starter')

.service('SyncService',function($q,APIService,TestSyncSQLite,UserProfileSQLite,MedicalSQLite,TuitionSQLite,RoyalSQLite,TimeAttendanceSQLite,LeaveSQLite,LeaveSummarySQLite,CircularSQLite,NewsSQLite,PMRoomSQLite,PMMsgSQLite,PMSubscribeSQLite,PMUserInRoomSQLite,NotiHistorySQLite,EmployeeSQLite,TimeReportSQLite){

  enableSync = true;

  var apiURLs = {GetURL:'/SyncData/SyncValue',AddURL:'/SyncData/SyncInsertValue',UpdateURL:'/SyncData/SyncUpdateValue'};
  //var apiURLs = {GetURL:'/TestSync/GetNewData',AddURL:'/TestSync/AddNewData',UpdateURL:'/TestSync/UpdateData'};

	this.SyncTestSync = function(){
    apiURLs = {GetURL:'/TestSync/GetNewData',AddURL:'/TestSync/AddNewData',UpdateURL:'/TestSync/UpdateData'};
    var apiDatas = {
      GetData:{},
      AddData:{},
      UpdateData:{}
    }
    return ProcessSyncData(APIService,TestSyncSQLite,$q,apiURLs,apiDatas);
	};

  this.SyncMedical = function(){
    var myEmpId = window.localStorage.getItem("CurrentUserName"); //'393028';  **Hard-Code**
    var apiDatas = {
      GetData:{ObjectID:1,SyncMedicalViewModel:{EmpID: myEmpId, FromDate: GetFiscalDate(3), ToDate: GetCurrentDate().replace(/\//g,'')}},
      AddData:{ObjectID:1,ObjectMedicalEntity:{}},
      UpdateData:{ObjectID:1,ObjectMedicalEntity:{}}
    };
    console.log('SYNC-MEDICAL');
    return ProcessSyncData(APIService,MedicalSQLite,$q,apiURLs,apiDatas,null);
  };

  this.SyncTuition = function(){
    var myEmpId = window.localStorage.getItem("CurrentUserName"); //'409689'; **Hard-Code**
    var apiDatas = {
      GetData:{ObjectID:6,SyncASSIViewModel:{Empl_Code: myEmpId, FromDate: GetFiscalDate(), ToDate: GetCurrentDate().replace(/\//g,'')}},
      AddData:{ObjectID:6,ObjectASSIEntity:{}},
      UpdateData:{ObjectID:6,ObjectASSIEntity:{}}
    };
    console.log('SYNC-TUITION')
    return ProcessSyncData(APIService,TuitionSQLite,$q,apiURLs,apiDatas,null);
  };

  this.SyncTime = function(){
    var myEmpId = window.localStorage.getItem("CurrentUserName"); // '576222' **Hard-Code**
    var apiDatas = {
      GetData:{ObjectID:2,SyncTAViewModel:{EmpID: myEmpId, FromDate: GetFiscalDate(1), ToDate: GetCurrentDate().replace(/\//g,'')}},
      AddData:{ObjectID:2,ObjectTAEntity:{}},
      UpdateData:{ObjectID:2,ObjectTAEntity:{}},
    };
    console.log('SYNC-TIMEATTENDANCE');
    return ProcessSyncData(APIService,TimeAttendanceSQLite,$q,apiURLs,apiDatas,null);
  };

  this.SyncTimeReport = function(){
    var myEmpId = window.localStorage.getItem("CurrentUserName");
    var apiDatas = {
      GetData:{ObjectID:12,SyncTAReportViewModel:{EmpID: myEmpId, FromDate: GetFiscalDate(1), ToDate: GetCurrentDate().replace(/\//g,'')}},
      AddData:{ObjectID:12,ObjectTAReportEntity:{}},
      UpdateData:{ObjectID:12,ObjectTAReportEntity:{}},
    };
    console.log('SYNC-TIMEREPORT');
    return ProcessSyncData(APIService,TimeReportSQLite,$q,apiURLs,apiDatas,null);
  };

  this.SyncLeave = function(){
    var myEmpId = window.localStorage.getItem("CurrentUserName"); //'565888'; **Hard-Code**
    var apiDatas = {
      GetData:{ObjectID:4,SyncLeaveViewModel:{Empl_Code: myEmpId, LeaveType:'', FromDate: GetFiscalDate(), ToDate: GetCurrentDate().replace(/\//g,'') }},
      AddData:{ObjectID:4,ObjectLeaveEntity:{}},
      UpdateData:{ObjectID:4,ObjectLeaveEntity:{}}
    };
    console.log('SYNC-LEAVE');
    return ProcessSyncData(APIService,LeaveSQLite,$q,apiURLs,apiDatas,null);
  };

  this.SyncLeaveSummary = function(){
    var myEmpId = window.localStorage.getItem("CurrentUserName"); //'565888'; **Hard-Code**
    var apiDatas = {
      GetData:{ObjectID:10,SyncLeaveSummaryViewModel:{Empl_Code: myEmpId}},
      AddData:{ObjectID:10,ObjectLeaveSummaryEntity:{}},
      UpdateData:{ObjectID:10,ObjectLeaveSummaryEntity:{}}
    };
    console.log('SYNC-LEAVE-SUMMARY');
    return ProcessSyncData(APIService,LeaveSummarySQLite,$q,apiURLs,apiDatas,null);
  };

  this.SyncRoyal = function(){
    var myEmpId = window.localStorage.getItem("CurrentUserName"); //'221577'; **Hard-Code**
    var apiDatas = {
      GetData:{ObjectID:5,SyncRoyalViewModel:{Empl_Code: myEmpId}},
      AddData:{ObjectID:5,ObjectRoyalEntity:{}},
      UpdateData:{ObjectID:5,ObjectRoyalEntity:{}}
    };
    console.log('SYNC-ROYAL');
    return ProcessSyncData(APIService,RoyalSQLite,$q,apiURLs,apiDatas,null);
  };

  this.SyncCircular = function(){
    var apiDatas = {
      GetData:{ObjectID:3,SyncCircularLetterViewModel:{DocDate:''}},
      AddData:{ObjectID:3,ObjectCircularLetterEntity:{}},
      UpdateData:{ObjectID:3,ObjectCircularLetterEntity:{}}
    };
    console.log('SYNC-CIRCULAR');
    return ProcessSyncData(APIService,CircularSQLite,$q,apiURLs,apiDatas,null);
  };

  this.SyncNews = function(){
    var apiDatas = {
      GetData:{ObjectID:8,SyncNewsViewModel:{PubDate:''}},
      AddData:{ObjectID:8,ObjectNewsEntity:{}},
      UpdateData:{ObjectID:8,ObjectNewsEntity:{}}
    };
    console.log('SYNC-NEWS');
    return ProcessSyncData(APIService,NewsSQLite,$q,apiURLs,apiDatas,null);
  };

  this.SyncNotiHistory = function(){
    var myEmpId = window.localStorage.getItem("CurrentUserName");
    var apiDatas = {
      GetData:{ObjectID:9,SyncNotiHistoryViewModel:{Empl_Code: myEmpId,RegisterID:window.localStorage.getItem('GCMToken')}},
      AddData:{ObjectID:9,ObjectNotiHistoryEntity:{}},
      UpdateData:{ObjectID:9,ObjectNotiHistoryEntity:{}}
    };
    console.log('SYNC-NotiHistory');
    return ProcessSyncData(APIService,NotiHistorySQLite,$q,apiURLs,apiDatas,null);
  };

  this.SyncEmployee = function(){
    var apiDatas = {
      GetData:{ObjectID:11,SyncEmplooyeeViewModel:{}},
      AddData:{ObjectID:11,SyncEmplooyeeViewModel:{}},
      UpdateData:{ObjectID:11,SyncEmplooyeeViewModel:{}}
    };
    console.log('SYNC-Employee');
    return ProcessSyncData(APIService,EmployeeSQLite,$q,apiURLs,apiDatas,null);
  };

  this.SyncTimeReport = function(){
    var apiDatas = {
      GetData:{ObjectID:12,SyncTimeReportViewModel:{}},
      AddData:{ObjectID:12,SyncTimeReportViewModel:{}},
      UpdateData:{ObjectID:12,SyncTimeReportViewModel:{}}
    };
    console.log('SYNC-TimeReport');
    return ProcessSyncData(APIService,TimeReportSQLite,$q,apiURLs,apiDatas,null);
  };

  // this.SyncPMRoom = function(){
  //   var empcode = '484074'; //window.localStorage.getItem("CurrentUserName") **Hard-Code**
  //   var apiDatas = {
  //     GetData:{ObjectID:9,SyncPMRoomViewModel:{Empl_Code:empcode}},
  //     AddData:{ObjectID:9,ObjectPMRoomEntity:{}},
  //     UpdateData:{ObjectID:9,ObjectPMRoomEntity:{}}
  //   };
  //   console.log('SYNC-PMRoom');
  //   return ProcessSyncData(APIService,PMRoomSQLite,$q,apiURLs,apiDatas,null);
  // };

  this.SyncPMMsg = function(roomId){
    var empcode = window.localStorage.getItem("CurrentUserName"); //'484074'; **Hard-Code**
    var apiDatas = {
      GetData:{ObjectID:10,SyncPMMsgViewModel:{roomId:roomId,Empl_Code:empcode}},
      AddData:{ObjectID:10,ObjectPMMsgEntity:{}},
      UpdateData:{ObjectID:10,ObjectPMMsgEntity:{}}
    };
    console.log('SYNC-PMMsg');
    return ProcessSyncData(APIService,PMMsgSQLite,$q,apiURLs,apiDatas,{PMroomId:roomId,isSyncPMMsg:true});
  };

  this.SyncSubscribe = function(roomId){
    var counter = 0;
    return  $q(function(resolve,reject){
      PMUserInRoomSQLite.GetUserIdInRoom(roomId).then(function(response){
          if(response != null) {
              var result = ConvertQueryResultToArray(response);
              var totalEmp = result.length;
              //sync subscribe
              var directoryURL = APIService.hostname() + '/ContactDirectory/viewContactPaging';
              angular.forEach(result,function(value,key){
                  PMSubscribeSQLite.CountSubscribeByEmpId(value.userId).then(
                      function(response){
                          if(response != null && response.rows != null){
                              var result = ConvertQueryResultToArray(response);
                              if(result[0].totalCount == 0){
                                  //get info & insert into pmsubsribe
                                  var directoryData = {keyword:value.userId,start:1,retrieve:1};
                                  APIService.httpPost(directoryURL,directoryData,
                                      function(response){
                                          if(response != null && response.data != null){
                                              var result = response.data[0];
                                              //convert picthumb to base64
                                              ConvertImgPNGToBase64(result.PictureThumb,function(base64){
                                                  if(base64 && base64.length > 0){
                                                    //save user data to pmsubscribe
                                                    var data = {Empl_Code:result.UserID,Firstname:result.Firstname,Lastname:result.Lastname,PictureThumb:base64};
                                                    PMSubscribeSQLite.Add([data]);
                                                    counter++;
                                                    if(counter == totalEmp) resolve();
                                                  }
                                                  else{
                                                    counter++;
                                                    if(counter == totalEmp) resolve();
                                                  }
                                              });
                                          }
                                          else{
                                            counter++;
                                            if(counter == totalEmp) resolve();   
                                          }
                                      },
                                      function(error){reject(error);});
                              }
                              else{
                                counter++;
                                if(counter == totalEmp) resolve();
                              }
                          }
                          else{
                            counter++;
                            if(counter == totalEmp) resolve();
                          }
                      });
              });
          }
      },function(error){reject(error);});
    });
  };

  this.SyncInitialPM = function(){
    var service = this;
    APIService.ShowLoading();
    //sync rooms
    service.SyncPMRoom().then(function(){
      PMRoomSQLite.GetAll().then(
        function(response){
          if(response != null){
            var rooms = ConvertQueryResultToArray(response);
            //loop all room for sync message in each room
            angular.forEach(rooms,function(value,key){
              //sync messages in each room
              service.SyncPMMsg(value.Id).then(
                function(){
                // //sync subscribe in each room
                // service.SyncSubscribe(value.Id);
              });
              
            });
            APIService.HideLoading();
          }
          else APIService.HideLoading();
        },
        function(){APIService.HideLoading();});
    },function(){APIService.HideLoading();})
  };

});

function SyncDownloadFromServer(APIService,GenericSQLite,$q,apiURLs,apiDatas,optData){
  return  $q(function(resolve,reject){
    var counter = 0;
    var keysbyindex;
    var currentId;
    var arrPmMsgsChanged = [];
    //get latest ts
    GenericSQLite.GetLatestTS().then(function(latesTS){
        //post to get new data
        var url = APIService.hostname() + apiURLs.GetURL;
        apiDatas.GetData.TimeStamp = (latesTS == null) ? '' : (latesTS.TS.toString().length == 13) ? '0' + latesTS.TS : latesTS.TS;
        APIService.httpPost(url,apiDatas.GetData,
          function(response){
            var result = response.data;
            if(result != null && result.length > 0){
                //if disable sync, Delete current data before then insert new data.
                if(!enableSync){
                    GenericSQLite.DeleteAll().then(function(){
                        //save to sqlite
                        GenericSQLite.Add(result,false).then(function(){resolve(result.length);});        
                    });
                }
                else{
                    angular.forEach(result,function(value,key){
                      //check id already exist?
                      GenericSQLite.CountByServerId(value.Id).then(function(resultCountIsExist){
                        if(resultCountIsExist.rows.item(0).countTotal > 0){
                          //check client dirty if not update client data
                          GenericSQLite.CountIsNotDirtyById(value.Id).then(function(resultCountIsNotDirty){
                            if(resultCountIsNotDirty.rows.item(0).countTotal > 0){
                              //update data
                              console.log('update :' + value.Id);
                              //if sync private messages set roomId to current data to update/insert
                              if(optData != null && optData.PMroomId != null) value.roomId = optData.PMroomId.toString();
                              GenericSQLite.Update(value,false,false).then(
                                function(response){
                                  //if sync private messages push current record to changed list for trigger websocket
                                  if(optData != null && optData.isSyncPMMsg) arrPmMsgsChanged.push(value);
                                  counter++;
                                  if(counter == result.length){
                                    if(optData != null && optData.isSyncPMMsg) resolve(arrPmMsgsChanged);
                                    else resolve(result.length);
                                  }
                                },function(error){reject(error);});
                            }
                            //if is dirty go to next round;
                            else{
                              counter++;
                              if(counter == result.length){
                                if(optData != null && optData.isSyncPMMsg) resolve(arrPmMsgsChanged);
                                else resolve(result.length);
                              }
                            }
                          });  
                        }
                        //create new record
                        else{
                          console.log('create new : ' + value.Id);
                          //if sync private messages set roomId to current data to update/insert
                          if(optData != null && optData.PMroomId != null) value.roomId = optData.PMroomId.toString();
                          GenericSQLite.Add([value],false).then(
                            function(){
                              //if sync private messages push current record to changed list for trigger websocket
                              if(optData != null && optData.isSyncPMMsg) arrPmMsgsChanged.push(value);
                              counter++;
                              if(counter == result.length){
                                if(optData != null && optData.isSyncPMMsg) resolve(arrPmMsgsChanged);
                                else resolve(result.length);
                              }
                            },
                            function(error){reject(error);});
                        }
                      })
                    });
                }
            }
            else {
              if(optData != null && optData.isSyncPMMsg) resolve(arrPmMsgsChanged);
              else resolve(0);
            }
          },
          function(error){reject(0);});
    });
  })
};

function SyncCreateFromClient(APIService,GenericSQLite,$q,apiURLs,apiDatas){
  return $q(function(resolve,reject){
    var counter = 0;
    //get list new data from client(where ts is null)
    GenericSQLite.GetDataByTSIsNull().then(
      function(response){
        if(response.rows.length > 0){
          var responseArr = ConvertQueryResultToArray(response);
          angular.forEach(responseArr,function(value,key){
            //post data to insert at server
            var url = APIService.hostname() + apiURLs.AddURL;
            //apiDatas.AddData = value; //{Id:null,field1:value.field1,field2:value.field2,field3:value.field3};
            apiDatas.AddData[Object.keys(apiDatas.AddData)[1]] = value;
            APIService.httpPost(url,apiDatas.AddData,
              function(resultFromServer){
                console.log(resultFromServer);
                  if(resultFromServer.data != null){
                      var currentData = response.rows.item(key);
                      currentData.Id = resultFromServer.data.Id; //return id from server
                      currentData.TS = resultFromServer.data.TS; //return ts from server
                      console.log(currentData);
                      //update server id
                      GenericSQLite.Update(currentData,false,true).then(
                        function(){
                          counter++;
                          if(counter == response.rows.length) resolve();
                        },function(error){reject(error);});
                  }
              },
              function(error){reject(error);})
          });
        }
        else resolve();
    });

  });
};

function SyncUpdateFromClient(APIService,GenericSQLite,$q,apiURLs,apiDatas){
  return $q(function(resolve,reject){
     var counter = 0;
     //get list dirty data
     GenericSQLite.GetDataIsDirty().then(function(response){
        if(response.rows.length > 0){
          var responseArr = ConvertQueryResultToArray(response);
          angular.forEach(responseArr,function(value,key){
            //post to update at server
            var url = APIService.hostname() + apiURLs.UpdateURL;
            //apiDatas.UpdateData = value //{Id:null,field1:value.field1,field2:value.field2,field3:value.field3};
            apiDatas.UpdateData[Object.keys(apiDatas.UpdateData)[1]] = value;
            APIService.httpPost(url,apiDatas.UpdateData,
              function(returnFromServer){
                if(returnFromServer.data != null){
                    var currentData = value;
                    currentData.TS = returnFromServer.data.TS; //ts return from server
                    //update client ts
                    GenericSQLite.Update(currentData,false,false).then(
                      function(){
                        counter++;
                        if(counter == response.rows.length) resolve();
                      },function(error){reject(error);});
                }
              },
              function(error){reject(error);});
          });
        }
        else resolve();
     })
  });
};

function SyncDeleteClientData(GenericSQLite,$q){
	return $q(function(resolve,reject){
		GenericSQLite.DeleteDataIsFlagDeleted().then(function(){resolve();},function(error){reject(error);});
	});
};

function ProcessSyncData(APIService,GenericSQLite,$q,apiURLs,apiDatas,optData){
  //Sync update data from server
  console.log('start-SyncDownloadFromServer');
  return SyncDownloadFromServer(APIService,GenericSQLite,$q,apiURLs,apiDatas,optData).then(
    function(numberOfNewData){
      //Sync data created from client
      console.log('start-SyncCreateFromClient');
      return SyncCreateFromClient(APIService,GenericSQLite,$q,apiURLs,apiDatas).then(function(){
        //Sync data updated from client
        console.log('start-SyncUpdateFromClient');
        return SyncUpdateFromClient(APIService,GenericSQLite,$q,apiURLs,apiDatas).then(function(){
          //Sync data deleted from client
          console.log('start-SyncDeleteClientData');
          return SyncDeleteClientData(GenericSQLite,$q).then(function(response){
            console.log('completed');
            return numberOfNewData;
          },function(error){return error;});
        },function(error){return error;});
      },function(error){return error;});
    },function(error){return error;});

  // //Sync update data from server
  // return SyncDownloadFromServer(APIService,GenericSQLite,$q,apiURLs,apiDatas).then(
  //   function(response){return response;},function(error){return error;});
};

