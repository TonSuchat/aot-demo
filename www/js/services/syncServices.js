angular.module('starter')

.service('SyncService',function($q,AuthService,APIService,TestSyncSQLite,UserProfileSQLite,MedicalSQLite,TuitionSQLite,RoyalSQLite,TimeAttendanceSQLite,LeaveSQLite){

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
    var myEmpId = '393028'; //AuthService.username()
    var apiDatas = {
      GetData:{ObjectID:1,SyncMedicalViewModel:{EmpID: myEmpId, FromDate: GetFiscalDate(), ToDate: GetCurrentDate().replace(/\//g,'')}},
      AddData:{ObjectID:1,ObjectMedicalEntity:{}},
      UpdateData:{ObjectID:1,ObjectMedicalEntity:{}}
    };
    console.log('SYNC-MEDICAL');
    return ProcessSyncData(APIService,MedicalSQLite,$q,apiURLs,apiDatas);
  };

  this.SyncTuition = function(){
    var myEmpId = '409689'; //AuthService.username()
    var apiDatas = {
      GetData:{ObjectID:6,SyncASSIViewModel:{Empl_Code: myEmpId, FromDate: GetFiscalDate(), ToDate: GetCurrentDate().replace(/\//g,'')}},
      AddData:{ObjectID:6,ObjectASSIEntity:{}},
      UpdateData:{ObjectID:6,ObjectASSIEntity:{}}
    };
    console.log('SYNC-TUITION')
    return ProcessSyncData(APIService,TuitionSQLite,$q,apiURLs,apiDatas);
  };

  this.SyncTime = function(){
    var myEmpId = '576222'; //AuthService.username()
    var apiDatas = {
      GetData:{ObjectID:2,SyncTAViewModel:{EmpID: myEmpId, FromDate: GetFiscalDate(), ToDate: GetCurrentDate().replace(/\//g,'')}},
      AddData:{ObjectID:2,ObjectTAEntity:{}},
      UpdateData:{ObjectID:2,ObjectTAEntity:{}},
    };
    console.log('SYNC-TIMEATTENDANCE');
    return ProcessSyncData(APIService,TimeAttendanceSQLite,$q,apiURLs,apiDatas);
  };

  this.SyncLeave = function(){
    var myEmpId = '565888'; //AuthService.username()
    var apiDatas = {
      GetData:{ObjectID:4,SyncLeaveViewModel:{Empl_Code: myEmpId, LeaveType:'', FromDate: GetFiscalDate(), ToDate: GetCurrentDate().replace(/\//g,'') }},
      AddData:{ObjectID:4,ObjectLeaveEntity:{}},
      UpdateData:{ObjectID:4,ObjectLeaveEntity:{}}
    };
    console.log('SYNC-LEAVE');
    return ProcessSyncData(APIService,LeaveSQLite,$q,apiURLs,apiDatas);
  };

  this.SyncRoyal = function(){
    var myEmpId = '221577'; //AuthService.username()
    var apiDatas = {
      GetData:{ObjectID:5,SyncRoyalViewModel:{Empl_Code: myEmpId}},
      AddData:{ObjectID:5,ObjectRoyalEntity:{}},
      UpdateData:{ObjectID:5,ObjectRoyalEntity:{}}
    };
    console.log('SYNC-ROYAL');
    return ProcessSyncData(APIService,RoyalSQLite,$q,apiURLs,apiDatas);
  };

  this.SyncCircular = function(){
    var apiDatas = {
      GetData:{ObjectID:3,SyncCircularLetterViewModel:{DocDate: GetCurrentDate().replace(/\//g,'')}},
      AddData:{ObjectID:3,ObjectCircularLetterEntity:{}},
      UpdateData:{ObjectID:3,ObjectCircularLetterEntity:{}}
    };
    console.log('SYNC-CIRCULAR');
    //return ProcessSyncData(APIService,CircularSQLite,$q,apiURLs,apiDatas);
  };

});

function SyncDownloadFromServer(APIService,GenericSQLite,$q,apiURLs,apiDatas){
  return  $q(function(resolve,reject){
    var counter = 0;
    var keysbyindex;
    var currentId;
    //get latest ts
    GenericSQLite.GetLatestTS().then(function(lastesTS){
        //post to get new data
        var url = APIService.hostname() + apiURLs.GetURL;
        apiDatas.GetData.TimeStamp = (lastesTS == null) ? '' : (lastesTS.TS.toString().length == 13) ? '0' + lastesTS.TS : lastesTS.TS;
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
                        if(resultCountIsExist.rows[0].countTotal > 0){
                          //check client dirty if not update client data
                          GenericSQLite.CountIsNotDirtyById(value.Id).then(function(resultCountIsNotDirty){
                            if(resultCountIsNotDirty.rows[0].countTotal > 0){
                              //update data
                              console.log('update :' + value.Id);
                              GenericSQLite.Update(value,false,false).then(
                                function(response){
                                  counter++;
                                  if(counter == result.length) resolve(result.length);
                                },function(error){reject(error);});
                            }
                            //if is dirty go to next round;
                            else{
                              counter++;
                              if(counter == result.length) resolve(result.length);
                            }
                          });  
                        }
                        //create new record
                        else{
                          console.log('create new : ' + value.Id);
                          GenericSQLite.Add([value],false).then(
                            function(){
                              counter++;
                              if(counter == result.length) resolve(result.length);
                            },
                            function(error){reject(error);});
                        }
                      })
                    });
                }
            }
            else resolve(0);
          },
          function(error){reject(error);});    
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
          angular.forEach(response.rows,function(value,key){
            //post data to insert at server
            var url = APIService.hostname() + apiURLs.AddURL;
            //apiDatas.AddData = value; //{Id:null,field1:value.field1,field2:value.field2,field3:value.field3};
            apiDatas.AddData[Object.keys(apiDatas.AddData)[1]] = value;
            APIService.httpPost(url,apiDatas.AddData,
              function(resultFromServer){
                console.log(resultFromServer);
                  if(resultFromServer.data != null){
                      var currentData = response.rows[key];
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
          angular.forEach(response.rows,function(value,key){
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

function ProcessSyncData(APIService,GenericSQLite,$q,apiURLs,apiDatas){
  //Sync update data from server
  console.log('start-SyncDownloadFromServer');
  return SyncDownloadFromServer(APIService,GenericSQLite,$q,apiURLs,apiDatas).then(
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