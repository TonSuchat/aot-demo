angular.module('starter')

.service('SyncService',function($q,TestSyncSQLite,UserProfileSQLite,MedicalSQLite,TuitionSQLite,RoyalSQLite,TimeAttendanceSQLite,LeaveSQLite){

	this.SyncTestSync = function(){
    var apiURLs = {GetURL:'/TestSync/GetNewData',AddURL:'/TestSync/AddNewData',UpdateURL:'/TestSync/UpdateData'};
    var apiDatas = {
      GetData:{},
      AddData:{},
      UpdateData:{}
    }
		//return ProcessSyncData(TestSyncSQLite,$q,'id',apiURLs,apiDatas);
	};

});


function SyncDownloadFromServer(GenericSQLite,$q,clientIdFieldName,apiURLs,apiDatas){
  return  $q(function(resolve,reject){
    var tmpData = [
      {ID:1,field1:'f1.1a',field2:'f2.1z',field3:'f3.1q',TimeStamp:'03032016101900'},
      {ID:2,field1:'f1.2b',field2:'f2.2x',field3:'f3.2w',TimeStamp:'03032016101900'},
      {ID:5,field1:'f1.35',field2:'f2.35',field3:'f3.35',TimeStamp:'03032016101900'}
    ];
    var counter = 0;
    var keysbyindex;
    var currentId;

    //get latest ts
    GenericSQLite.GetLatestTS().then(function(lastesTS){
        //post to get new data
        var url = APIService.hostname() + apiURLs.GetURL;
        //var data = {TimeStamp: lastesTS};
        apiDatas.GetData.TimeStamp = lastesTS;
        APIService.httpPost(url,apiDatas.GetData,
          function(response){
            var result = response.data;
            if(result != null && result.length > 0){
                //if disable sync, Delete current data before then insert new data.
                if(!enableSync){
                    GenericSQLite.DeleteAll().then(function(){
                        //save to sqlite
                        GenericSQLite.Add(result,false).then(function(){resolve();});        
                    });
                }
                else{
                    angular.forEach(result.rows,function(value,key){
                    //check id already exist?
                    GenericSQLite.CountById(value[Object.keys(value)[0]]).then(function(resultCountIsExist){
                      if(resultCountIsExist.rows[0].countTotal > 0){
                        //check dirty
                        GenericSQLite.CountIsNotDirtyById(value[Object.keys(value)[0]]).then(function(resultCountIsNotDirty){
                          if(resultCountIsNotDirty.rows[0].countTotal > 0){
                            //update data
                            //console.log('update :' + value[Object.keys(value)[0]]);
                            GenericSQLite.Update(value,false,false,clientIdFieldName,value[Object.keys(value)[0]]).then(
                              function(response){
                                counter++;
                                if(counter == tmpData.length) resolve();
                              },function(error){reject(error);});
                          }
                          //if is dirty go to next round;
                          else{
                            counter++;
                            if(counter == tmpData.length) resolve();
                          }
                        });
                      }
                      else{
                        //create new record
                        //console.log('create new : ' + value[Object.keys(value)[0]]);
                        GenericSQLite.Add([value],false).then(
                          function(){
                            counter++;
                            if(counter == tmpData.length) resolve();
                          },
                          function(error){reject(error);});
                      }
                    })
                });
                }
            }
            else resolve();
          },
          function(error){reject(error);});    
    });
  })
};

function SyncCreateFromClient(GenericSQLite,$q,apiURLs,apiDatas){
  return $q(function(resolve,reject){
    var counter = 0;
    //get list new data from client(where ts is null)
    GenericSQLite.GetDataByTSIsNull().then(
      function(response){
      	console.log(response);
        if(response.rows.length > 0){
          angular.forEach(response.rows,function(value,key){
            //post data to insert at server
            //**wait service
            // POST-METHOD
            //apiURLs.AddNewData
            //apiDatas.AddData
            //**wait service
            var currentData = response.rows[key];
            currentData.id = 99; //return id from server
            currentData.ts = '04032016110500'; //return ts from server
            currentData.timestamp = '04032016110500';
            //update server id
            GenericSQLite.Update(currentData,currentData.deleted,false,'clientid',currentData.clientid).then(
              function(){
                counter++;
                if(counter == response.rows.length) resolve();
              },function(error){reject(error);});
          });
        }
        else resolve();
    });

  });
};

function SyncUpdateFromClient(GenericSQLite,$q,apiURLs,apiDatas){
  return $q(function(resolve,reject){
     //get list dirty data
     GenericSQLite.GetDataIsDirty().then(function(response){
        if(response.rows.length > 0){
          angular.forEach(response.rows,function(value,key){
            //post to update at server
            //**wait service
            // POST-METHOD
            //apiURLs.UpdateNewData
            //apiDatas.UpdateData
            //**wait service
            var counter = 0;
            var currentData = value;
            currentData.timestamp = '99999999999999'; //ts return from server
            angular.forEach(response.rows,function(value,key){
            	//update client ts
            	GenericSQLite.Update(currentData,currentData.deleted,false,'clientid',currentData.clientid).then(
            		function(){
            			counter++;
            			if(counter == response.rows.length) resolve();
            		},function(error){reject(error);});
            });
          });
        }
        else reject();
     })
  });
};

function SyncDeleteClientData(GenericSQLite,$q){
	return $q(function(resolve,reject){
		GenericSQLite.DeleteDataIsFlagDeleted().then(function(){resolve();},function(error){reject(error);});
	});
};

function ProcessSyncData(GenericSQLite,$q,clientIdFieldName,apiURLs,apiDatas){
  //Sync update data from server
  return SyncDownloadFromServer(GenericSQLite,$q,clientIdFieldName,apiURLs,apiDatas).then(
    function(){
      //Sync data created from client
      return SyncCreateFromClient(GenericSQLite,$q,apiURLs,apiDatas).then(function(){
        //Sync data updated from client
        return SyncUpdateFromClient(GenericSQLite,$q,apiURLs,apiDatas).then(function(){
          //Sync data deleted from client
          return SyncDeleteClientData(GenericSQLite,$q).then(function(response){
            return response;
          },function(error){return error;});
        },function(error){return error;});
      },function(error){return error;});
    },function(error){return error;});
};