angular.module('starter')

.service('WorkFlowService',function($q,APIService){

  this.ViewMyTask = function(categoryId){
    return $q(function(resolve){
      var url = APIService.hostname() + '/Workflow/ViewMyTask';
      var data = {Empl_Code:window.localStorage.getItem("CurrentUserName"),CategoryId:categoryId};
      APIService.ShowLoading();
      APIService.httpPost(url,data,function(response){APIService.HideLoading();resolve(response);},function(error){APIService.HideLoading();resolve(null);});
    });
  };

  this.ViewHistoryMyTask = function(documentId,nextLevel,emplCode){
    return $q(function(resolve){
      var url = APIService.hostname() + '/Workflow/ViewHistoryMyTask';
      var data = {DocumentId:documentId,NextLevel:nextLevel,Empl_Code:emplCode};
      APIService.ShowLoading();
      APIService.httpPost(url,data,function(response){APIService.HideLoading();resolve(response);},function(error){APIService.HideLoading();resolve(null)});
    })
  };

  this.ViewDutyChangeStaff = function(documentId){
    return $q(function(resolve){
      var url = APIService.hostname() + '/Workflow/ViewDutyChangeStaff';
      var data = {DocumentId:documentId};
      APIService.ShowLoading();
      APIService.httpPost(url,data,function(response){APIService.HideLoading();resolve(response);},function(error){APIService.HideLoading();resolve(null);});
    });
  };

  this.ViewUnReadMytask = function(emplCode){
    return $q(function(resolve){
      var url = APIService.hostname() + '/Workflow/ViewUnReadMytask';
      var data = {Empl_Code:emplCode};
      APIService.ShowLoading();
      APIService.httpPost(url,data,function(response){APIService.HideLoading();resolve(response);},function(error){APIService.HideLoading();resolve(null);});
    });
  };

  this.CreateWorkFlow = function(data){
    return $q(function(resolve,reject){
      var url = APIService.hostname() + '/Workflow/CreateWorkflow';
      APIService.ShowLoading();
      APIService.httpPost(url,data,
        function(response){
          APIService.HideLoading();
          resolve(response);
        },
        function(error){
          APIService.HideLoading();
          reject(error);
        });
    });
  };
  
  this.AcknowledgmentWorkflow = function(documentId,emplCode,remark){
    return $q(function(resolve,reject){
      var url = APIService.hostname() + '/Workflow/AcknowledgmentWorkflow';
      var data = {DocumentId:documentId,Empl_Code:emplCode,Remark:remark};
      APIService.ShowLoading();  
      APIService.httpPost(url,data,
        function(response){
          APIService.HideLoading();
          resolve(response);
      },
      function(error){
        APIService.HideLoading();
        reject(error);
      });
    });
  };

});
