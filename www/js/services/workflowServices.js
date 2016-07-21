angular.module('starter')

.service('WorkFlowService',function($q,APIService,$ionicPopup,$location){

  var service = this;

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

  this.ApproveWorkflow = function(documentId,emplCode,remark,actionType){
    return $q(function(resolve){
      var url = APIService.hostname() + '/Workflow/ApproveWorkflow';
      var data = {DocumentId:documentId,Empl_Code:emplCode,Remark:remark,ActionType:actionType};
      APIService.ShowLoading();
      APIService.httpPost(url,data,function(response){APIService.HideLoading();resolve(true)},function(error){APIService.HideLoading();resolve(false);});
    });
  };

  this.UpdateReadMytask = function(emplCode,documentId){
    return $q(function(resolve){
      var url = APIService.hostname() + '/Workflow/UpdateReadMytask';
      var data = {Empl_Code:emplCode,DocumentId:documentId};
      APIService.ShowLoading();
      APIService.httpPost(url,data,function(response){APIService.HideLoading();resolve(true)},function(error){APIService.HideLoading();resolve(false);});
    });
  };
 
  this.confirmAcknowledge = function(scope){
    scope.popUpDetails.title = 'รับทราบ';
    scope.popUpDetails.subtitle = 'รับทราบรายการนี้ ?';
    scope.popUpDetails.actiontype = 3;
    service.showPopUp(scope);
  };

  this.doAcknowledge = function(scope){
    console.log('doAcknowledge',scope.documentId,scope.action.remark);
    service.ApproveWorkflow(scope.documentId,window.localStorage.getItem("CurrentUserName"),scope.action.remark,3).then(function(response){
      if(response) $location.path('/app/selfservicelist/1');
    });
  };

  this.confirmApproveOrReject = function(isApprove,scope){
    var confirmMessage = '';
    var title = '';
    var actionType = 0;
    if(isApprove){
      title = 'อนุมัติ';
      confirmMessage = 'คุณแน่ใจที่จะอนุมัติรายการนี้ ?';
      actionType = 2;
    }
    else{
      title = 'ไม่อนุมัติ'
      confirmMessage = 'คุณแน่ใจที่จะไม่อนุมัติรายการนี้ ?';
      actionType = 5;
    }
    scope.popUpDetails.title = title;
    scope.popUpDetails.subtitle = confirmMessage;
    scope.popUpDetails.actiontype = actionType;

    service.showPopUp(scope);
  };

  this.doApproveOrReject = function(isApprove,actionType,scope){
    console.log('doApproveOrReject',scope.documentId,scope.action.remark);
    service.ApproveWorkflow(scope.documentId,window.localStorage.getItem("CurrentUserName"),scope.action.remark,actionType).then(function(response){
      if(response) $location.path('/app/selfservicelist/1');
    });
  };

  this.showPopUp = function(scope){
    scope.action.remark = '';
    //popup when clicked approve/reject , acknowledge
    var popUp = $ionicPopup.show({
      template: "<textarea placeholder='หมายเหตุ' rows='5' cols='50' ng-model='action.remark'></textarea>",
      title:scope.popUpDetails.title,
      subTitle:scope.popUpDetails.subtitle,
      scope:scope,
      buttons:[
        {text:'ตกลง',type:'button-positive',onTap:function(e){
          if(scope.popUpDetails.actiontype == 2) service.doApproveOrReject(true,2,scope);
          else if(scope.popUpDetails.actiontype == 5) service.doApproveOrReject(false,5,scope);
          else if(scope.popUpDetails.actiontype == 3) service.doAcknowledge(scope);
        }},
        {text:'ยกเลิก'}
      ]
    });
  };

   

});
