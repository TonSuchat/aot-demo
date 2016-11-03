angular.module('starter')

.service('WorkFlowService',function($q,APIService,$ionicPopup,$location,$ionicModal){

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

  this.ViewTimeWork = function(emplCode,documentId,nextLevel){
    return $q(function(resolve){
      var url = APIService.hostname() + '/Workflow/ViewTimeWork';
      var data = {Empl_Code:emplCode,DocumentId:documentId,NextLevel:nextLevel};
      APIService.ShowLoading();
      APIService.httpPost(url,data,function(response){APIService.HideLoading();resolve(response);},function(error){APIService.HideLoading();resolve(null);});
    });
  };

  this.ViewOnLeave = function(Empl_Code,documentId,nextLevel){
    return $q(function(resolve){
      var url = APIService.hostname() + '/Workflow/ViewOnLeave';
      var data = {Empl_Code:Empl_Code,DocumentId:documentId,NextLevel:nextLevel};
      APIService.ShowLoading();
      APIService.httpPost(url,data,function(response){APIService.HideLoading();resolve(response);},function(error){APIService.HideLoading();resolve(null);});
    });
  };

  this.ViewReqApprAcknDoc = function(Empl_Code,documentId,nextLevel){
    return $q(function(resolve){
      var url = APIService.hostname() + '/Workflow/ViewReqApprAcknDoc';
      var data = {Empl_Code:Empl_Code,DocumentId:documentId,NextLevel:nextLevel};
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

  this.ApproveWorkflow = function(documentId,emplCode,remark,actionType,signature){
    return $q(function(resolve){
      var url = APIService.hostname() + '/Workflow/ApproveWorkflow';
      var data = {DocumentId:documentId,Empl_Code:emplCode,Remark:remark,ActionType:actionType,RegisterID:window.localStorage.getItem("GCMToken"),SignatureObject:signature};
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
    //service.showPopUp(scope);
    service.showModal(scope);
  };

  this.doAcknowledge = function(scope){
    console.log('doAcknowledge',scope.documentId,scope.action.remark);
    service.ApproveWorkflow(scope.documentId,window.localStorage.getItem("CurrentUserName"),scope.action.remark,3,scope.signature).then(function(response){
      if(response){
        scope.modalSSAction.remove();
        $location.path('/app/floatbutton/selfservicelist/' + scope.categoryId);
      } 
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

    //service.showPopUp(scope);
    service.showModal(scope);
  };

  this.doApproveOrReject = function(isApprove,actionType,scope){
    console.log('doApproveOrReject',scope.documentId,scope.action.remark);
    service.ApproveWorkflow(scope.documentId,window.localStorage.getItem("CurrentUserName"),scope.action.remark,actionType,scope.signature).then(function(response){
      if(response){
        scope.modalSSAction.remove();
        $location.path('/app/floatbutton/selfservicelist/' + scope.categoryId);
      } 
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

  this.showModal = function(scope){
    scope.action.remark = '';

    if(scope.modalSSAction == null){
      // Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/selfservice/ssaction.html', {
        scope: scope
      }).then(function(modal) {
        scope.modalSSAction = modal;
        //show
        scope.modalSSAction.show();
        //canvas
        scope.InitialCanvas();
      });
    }
    else scope.modalSSAction.show();

    //close modal action
    scope.closeAction = function(){
      scope.modalSSAction.hide();
    };

    //canvas
    scope.clearCanvas = function() {
      scope.signaturePad.clear();
    };
    scope.saveCanvas = function() {
        var sigImg = scope.signaturePad.toDataURL();
        scope.signature = sigImg;
        console.log(sigImg);
    };
    scope.InitialCanvas = function(){
      var canvas = document.getElementById('signatureCanvas');
      if(scope.signaturePad == null) scope.signaturePad = new SignaturePad(canvas);
      scope.signaturePad.off();
      scope.signaturePad.on();
    };
    //canvas

    scope.submit = function(){
      //check if use signature then get base64 else use empty string
      if(scope.showSignature == false) scope.signature = '';
      else{
        //first check signature is empty?
        if(scope.signaturePad.isEmpty()) return IonicAlert($ionicPopup,'ลายเซ็นห้ามเป็นค่าว่าง',null);
        else scope.signature = scope.signaturePad.toDataURL().replace('data:image/png;base64,','');
      } 
      if(scope.popUpDetails.actiontype == 2) service.doApproveOrReject(true,2,scope);
      else if(scope.popUpDetails.actiontype == 5) service.doApproveOrReject(false,5,scope);
      else if(scope.popUpDetails.actiontype == 3) service.doAcknowledge(scope);
    };

  };

  this.showModalAuthen = function(scope,action,faType){

    if(scope.modalSSAuthen == null){
      $ionicModal.fromTemplateUrl('templates/selfservice/ssauthen.html', {
        scope: scope
      }).then(function(modal) {
        scope.modalSSAuthen = modal;
        InitialModalAuthenProcess(scope,action,faType);
      });
    }
    else InitialModalAuthenProcess(scope,action,faType);
    
    //close modal action
    scope.closeAction = function(){
      scope.modalSSAuthen.hide();
    };

    scope.doAuthenPIN = function(form){
      if(form.$valid) {
        APIService.ShowLoading();
        //check pin is valid
        var url = APIService.hostname() + '/DeviceRegistered/ValidatePIN';
        var data = {Empl_Code:window.localStorage.getItem('CurrentUserName'),PIN:scope.modalDetails.PINValue};
        APIService.httpPost(url,data,function(response){
          if(response != null && response.data){
            APIService.HideLoading();
            scope.modalSSAuthen.hide();
            if(action.actionType == 'acknowledge') service.confirmAcknowledge(scope);
            else service.confirmApproveOrReject(action.val,scope);
          }
          else{
            APIService.HideLoading();
            IonicAlert($ionicPopup,'PIN ไม่ถูกต้อง',null);
          }
        },function(error){APIService.HideLoading();console.log(error);})
      }
    };

    scope.doAuthenOTP = function(form){
      if(form.$valid) {
        if(scope.OTP == scope.modalDetails.OTPValue){
          scope.modalSSAuthen.hide();
          if(action.actionType == 'acknowledge') service.confirmAcknowledge(scope);
          else service.confirmApproveOrReject(action.val,scope);
        }
        else{
          IonicAlert($ionicPopup,'OTP ไม่ถูกต้อง',null);
        }
      }
    };

  };

  function InitialModalAuthenProcess (scope,action,faType) {
    scope.modalDetails = {};
    if(scope.RequestDetails.FAType == 0){
      if(action.actionType == 'acknowledge') service.confirmAcknowledge(scope);
      else service.confirmApproveOrReject(action.val,scope);
    } 
    else{
      //authen by fa type
      scope.modalDetails.title = (scope.RequestDetails.FAType == 1) ? 'ยืนยัน PIN-Code' : 'ยืนยัน OTP';
      if(scope.RequestDetails.FAType == 1){
        //check pin is exist
        APIService.ShowLoading();
        var url = APIService.hostname() + '/DeviceRegistered/CheckExistPIN';
        var data = {Empl_Code:window.localStorage.getItem('CurrentUserName')};
        APIService.httpPost(url,data,function(response){
            if(response.data){
                APIService.HideLoading();
                scope.modalSSAuthen.show();
            }
            else{
                APIService.HideLoading();
                IonicAlert($ionicPopup,'ต้องตั้งค่า PIN ก่อนใช้งาน',function(){
                    window.location = '#/app/helppinsetting';
                });
            }
          },
            function(error){console.log(error);APIService.HideLoading();});                
      }
      else scope.modalSSAuthen.show();
    }
  };

});
