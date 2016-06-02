//**********VARIABLES**********
var xmppURLDetails = {prefix:'http://',domain:'10.74.17.109',port:':7070',bind:'/http-bind/',resource:'/PM',chatService:'conference'};
var xmppFullPath = xmppURLDetails.prefix + xmppURLDetails.domain + xmppURLDetails.port + xmppURLDetails.bind;
var xmppConnection;
var xmppConnectionIsActive = false;
var xmppSyncRooms = false;
var dictUserSeenMessage = [];
var isAttempToConnect = true;
//**********VARIABLES**********

angular.module('starter').service('XMPPService',function($q,$cordovaDevice,$rootScope,PMMsgSQLite,PMUserInRoomSQLite,PMRoomSQLite,APIService,XMPPApiService,xmppSharedProperties,PMSeenMessageSQLite){

	var service = this;

	//*************Connection*************
	//check authentication
	this.Authentication = function(userid,password){
		service.xmppConnect(userid,password);
	};

	this.Disconnect = function(){
		try
		{
			//disable xmpp maintain timer
            service.DisableTimerMaintainConnection();
			//clear other variables
            dictUserSeenMessage = [];
			xmppConnection.flush();
    		xmppConnection.disconnect();
		}
		catch(err){};
    	return true;
	};

	this.xmppConnect = function(userid,password) {
		xmppConnection = new Strophe.Connection(xmppFullPath);
		var resource = '';
		//if mobile use serial number for resource
		if (window.cordova){
			var deviceInfo = $cordovaDevice.getDevice();
			resource = '/' + deviceInfo.serial;		
		}
		xmppConnection.connect(userid + '@' + xmppURLDetails.domain + resource,password, service.xmppOnConnect);
	};

	this.xmppOnConnect = function(status) {
		console.log(status);
		console.log(Strophe.Status);
		if(status == Strophe.Status.CONNECTED){
			//add handler and set online
			xmppConnection.send($pres());
			service.xmppAddHandlers();
			//check need to sync rooms?
			if(xmppSyncRooms){
				//sync rooms (on new login, network online(after offline))
				service.SyncPMRooms().then(function(response){
					if(response){
						xmppSyncRooms = false;
						if(needResendMessages) service.ProcessResendMessages();
						////check flag is trigger by timer reconnect?, Yes resend all message after reconnect
						//if(xmppTimerIsActive) service.ProcessResendMessages();
					} 
				}); 
			}
			else{
				service.JoinRoomsUsersIsMember(); //todo join all rooms that current user is memeber	
				//check flag is trigger by timer reconnect?, Yes resend all message after reconnect
				if(needResendMessages) service.ProcessResendMessages();
			} 
			//set global connection state
			xmppConnectionIsActive = true;
			//set global attemp connect
			isAttempToConnect = false;
			return true;
		}
		else if(status == Strophe.Status.DISCONNECTED || status == Strophe.Status.DISCONNECTING){
			console.log('DISCONNECTED || DISCONNECTING');
			isAttempToConnect = false;
			xmppConnectionIsActive = false;
			return true;
		}
		else{
			xmppConnectionIsActive = false;
			return true;
		}
	};

	this.xmppAddHandlers = function() {
		xmppConnection.addHandler(service.OnChatMessage, null, "message", 'chat', null, null);
		xmppConnection.addHandler(service.OnGroupChatMessage, null, "message", 'groupchat', null, null);
		//xmppConnection.addHandler(service.OnPresence, null, "presence",null,null,null);
		//xmppConnection.addHandler(service.OnIQ, null, "iq",null,null,null);
	};

	this.JoinRoomsUsersIsMember = function(){
		PMRoomSQLite.GetAll().then(function(response){
			if(response != null){
				var result = ConvertQueryResultToArray(response);
				angular.forEach(result,function(value,key){
                	service.JoinRoom(value.Id,window.localStorage.getItem("CurrentUserName"));
            	});
			}
		})
	};
	//*************Connection*************



	//*************Handles*************
	this.OnCreateChatRoom = function(message){
		console.log(message);
		var senderId = message.getAttribute('empId');
		var fullname = message.getAttribute('fullName');
		var roomId = message.getAttribute('roomId');
		//get pic thumb for room icon
		GetPicThumbBase64($q,APIService,senderId).then(function(base64){
			if(base64 != null && base64.length > 0){
				var roomDetails = {roomId:roomId,roomIcon:base64,roomName:fullname,roomType:1};
				var memberDetails = [{empId:senderId}];
				//create data in pmroom if not exist
				service.ProcessCreateChatRoom(roomDetails,memberDetails).then(function(response){
					return response;
				});
			}
			else return true;
		});
	};

	this.OnChatMessage = function(message) {
		var result = GetMessageObjectFromXML(message);
		//create chat room event
 		if(result.event != null && result.event == 'createchatroom'){
 			service.OnCreateChatRoom(message);
 		}
	};

	this.OnGroupChatMessage = function(message) {	
		console.log(message);
 		var result = GetMessageObjectFromXML(message);
 		var roomId = result.from;
 		//receiver seen message and reply to sender
 		//if(result.received == 'true' && result.msgId != null && result.ownerId != null && result.fromJID != null){
 		console.log(result);
 		if(result.received == 'true' && result.msgId != null && result.fromJID != null){
 			//find ownerId by msgId
 			//PMMsgSQLite.GetEmpIdByMessageAndRoomId(result.msgId,roomId).then(function(response){
 				//if(response != null){
 					//var responseData = ConvertQueryResultToArray(response);
 					//var ownerId = (responseData[0] != null && responseData[0].Empl_Code != null) ? responseData[0].Empl_Code : '';
 					//if(result.fromJID != window.localStorage.getItem("CurrentUserName")){

		 				//check user has already seen message(in other device)
		 				var isUserSeenMessage = CheckUserIsSeenMessage(result.msgId,result.fromJID);
		 				console.log('isUserSeenMessage',isUserSeenMessage);
		 				if(!isUserSeenMessage){
		 					//add user seen this message to list
			 				AddUserIdSeenMessageInList(result.msgId,result.fromJID);
				 			//check this user is seen message?
							PMSeenMessageSQLite.CheckUserSeenMessage(result.fromJID,result.msgId,roomId).then(function(response){
								if(response != null){
									var totalCount = ConvertQueryResultToArray(response)[0].totalCount;
									if(totalCount == 0){
										//add this user has seen message
										PMSeenMessageSQLite.Add([result.fromJID,result.msgId,roomId]);
										//update +1 readtotal
							 			PMMsgSQLite.UpdateReadTotal(result.msgId).then(function(){
							 				//get readtotal
							 				PMMsgSQLite.GetReadTotalByMsgId(result.msgId).then(function(response){
							 					if(response != null){
							 						var dataReadTotal = ConvertQueryResultToArray(response);
							 						var readTotal = (dataReadTotal.length > 0 ? dataReadTotal[0].readTotal : null);
							 						//broadcast to update sender readtotal in UI if is active room
							 						if(readTotal != null && (result.fromJID != window.localStorage.getItem("CurrentUserName")) && (roomId == xmppSharedProperties.GetSharedProperties().ActiveRoomId)) $rootScope.$broadcast('seenMessage',{msgId:result.msgId,readTotal:readTotal});
							 					}
							 				});
							 			});				
									}
								}
							}); 	
		 				}

		 			//} 			
 				//}
 			//})
 		}
 		//incomming message
	    else if(result.to != null && result.from != null && result.message != null){
		    var ownerId = result.fromJID;
		   	//check this message is exist
		   	PMMsgSQLite.CheckMessageIdIsExsit(result.msgId).then(function(response){
		   		if(response != null){
		   			var totalCount = ConvertQueryResultToArray(response)[0].totalCount;
		   			//save to local
		   			if(totalCount == 0){
		   				console.log('create message');
		   				var unseen;
		   				//if this message from owner itself unseen = 1 (in case use many devices on same time)
		   				if(ownerId == window.localStorage.getItem("CurrentUserName")) unseen = 1;
		   				else unseen = (roomId == xmppSharedProperties.GetSharedProperties().ActiveRoomId) ? 1 : 0;
		   				PMMsgSQLite.Add([result.msgId,ownerId,result.message,0,roomId,result.TS,unseen,0]);
		   				//update lastmsg in pmroom
		   				PMRoomSQLite.UpdateLastMsg(roomId,result.message);
		   				//check for broadcast message
			   			if(roomId == xmppSharedProperties.GetSharedProperties().ActiveRoomId){
			   				console.log('active room');
							//append message
							$rootScope.$broadcast('incomingMessage',{message:result.message, msgId:result.msgId,TS:result.TS,ownerId:ownerId, roomId:roomId});
						}
						else{
							if(ownerId != window.localStorage.getItem("CurrentUserName")){
								console.log('increment');
								PMRoomSQLite.UpdateIncrementTotalNewMessage(roomId);
								//todo if active on pmrooms view show lastmsg & numberOfNewMsg
							}
						}
		   			}
		   			else{
		   				//todo update msgAct = 0 (ensure this message can resended)
		   			}
		   		}
		   	});
	    }
	  	return true;
	};

	// this.OnPresence = function(presence){
	// 	console.log(presence);
	// 	return true;
	// };

	// this.OnIQ = function(iq){
	// 	console.log(iq);
	// };
	//*************Handles*************



	//*************Message*************
	this.SendChatMessage = function(fromId,roomId,message,optMsgId){
		console.log('optMsgId',optMsgId);
		return $q(function(resolve, reject) {
			var result = {TS:GetCurrentTSAPIFormat()};
			if(optMsgId != null && optMsgId.length > 0) result.msgId = optMsgId;
			else result.msgId = service.GenerateMessageId();
			//send xmpp message
			var msg = CreateChatMessageXML(roomId,message,result.msgId,result.TS,fromId);
			try {xmppConnection.send(msg);}
			catch(err){};
			resolve(result);
		});
	};

	this.SendSeenMessage = function(roomId,msgId){
		xmppConnection.send($msg({to:roomId + '@' + xmppURLDetails.chatService + '.' + xmppURLDetails.domain, type:'groupchat', receive:true}).c('body').t(msgId + 'r'));
	};

	//todo implement
	this.SendGroupChatMessage = function(){
	};

	this.SendMessageCreateChatRoom = function(roomId,fromId,toId,fullName,receiverFullName){
		//send to receiver
		var jid = toId + '@' + xmppURLDetails.domain;
		var msg = $msg({to:jid, type:'chat', event:'createchatroom', empId:fromId, fullName:fullName, roomId:roomId}).c('body').t('create chat room');
		xmppConnection.send(msg);
		//send to self in case many devices
		jid = fromId + '@' + xmppURLDetails.domain;
		msg = $msg({to:jid, type:'chat', event:'createchatroom', empId:toId, fullName:receiverFullName, roomId:roomId}).c('body').t('create chat room');
		try{xmppConnection.send(msg);}
		catch(err){};
		
	};
	//*************Message*************



	//*************Utility*************
	this.AddRoster = function(toId){
		//send add roster
		var iq = $iq({type:'set'}).c('query',{xmlns:'jabber:iq:roster'}).c('item',{jid: toId + '@' + xmppURLDetails.domain});
		xmppConnection.sendIQ(iq);
		//send subscribe
		var subscribe = $pres({to: toId + '@' + xmppURLDetails.domain, 'type': 'subscribe'});
		xmppConnection.send(subscribe);
	};

	this.GetUniqueId = function(prefix){
		return xmppConnection.getUniqueId(prefix);
	};

	this.JoinRoom = function(roomId,nickName){
		var pres = $pres({to:roomId + '@' + xmppURLDetails.chatService + '.' + xmppURLDetails.domain + '/' + nickName});
						//.c('x',{xmlns:'http://jabber.org/protocol/muc#user'},null).c('history',{maxstanzas:100});
		xmppConnection.send(pres.tree());
	};

	this.SyncPMRooms = function(){
		console.log('Start SyncPMRooms');
		return $q(function(resolve,reject){
			var jid = window.localStorage.getItem("CurrentUserName");
			if(jid != null){
				//get rooms from server
				XMPPApiService.GetRoomsByJID(jid).then(function(response){
					if(response != null && response.data != null){
						var roomsDetail = response.data;
						var totalRows = roomsDetail.length;
						var counter = 0;
						angular.forEach(roomsDetail,function(value,key){
							var roomDetails = {};
							var memberDetails = [];
							//create room by type(chat,groupchat)
							if(value.members.length > 1){
								//group chat
								roomDetails.roomType = 2;roomDetails.roomName = '';roomDetails.roomIcon = '';roomDetails.JID;
								//todo create room
							}
							else{
								//normal chat(1:1)
								roomDetails.roomId = value.roomName;roomDetails.roomType = 1;
								memberDetails.push({empId:value.members[0]});
								//get fullname for roomname
								var url = APIService.hostname() + '/ContactDirectory/viewContactPaging';
							    var data = { keyword: value.members[0], start: 1, retrieve: 1 };
							    APIService.httpPost(url, data,
							        function (response) {
							            if(response != null && response.data != null){
							            	var result = response.data[0];
							            	var nickname = (result.Nickname && result.Nickname != null) ? '(' + result.Nickname + ')' : '';
							            	var fullname = result.PrefixName + ' ' + result.Firstname + ' ' + result.Lastname + nickname;
							            	roomDetails.roomName = fullname;
							            	//base64 for roomicon
							            	GetPicThumbBase64($q,APIService,value.members[0]).then(function(base64){
												if(base64 != null && base64.length > 0){
													roomDetails.roomIcon = base64;
													//create chat room
													service.ProcessCreateChatRoom(roomDetails,memberDetails).then(function(){
														counter++;
								                		if(counter == totalRows) resolve(true);	
													});
												}
												else{
													console.log('not found PicThumbBase64 data of ' + value.members[0]);
													counter++;
						                			if(counter == totalRows) resolve(true);	
												}
											});
							            }
							            else{
							            	console.log('not found ContactDirectory data of ' + value.members[0]);
							            	counter++;
						                	if(counter == totalRows) resolve(true);	
							            }
							        });
							}
		            	});
					}
					else resolve(true);
				});
			}
			else resolve(false);
		});
	};

	//roomDetails:{roomId:'xxx',roomIcon:'xxx',roomName:'xxx',roomType:0,1} , memberDetails:[{empId:'xxx'},{empId:'xxx'}]
	this.ProcessCreateChatRoom = function(roomDetails,memberDetails){
		return $q(function(resolve,reject){
			//create data in pmroom if not exist
			PMRoomSQLite.CheckRoomIdIsExist(roomDetails.roomId).then(function(response){
				if(response != null){
					var totalCount = ConvertQueryResultToArray(response)[0].totalCount;
					if(totalCount == 0){
						//create room
						PMRoomSQLite.Add([roomDetails.roomId,roomDetails.roomType,roomDetails.roomName,roomDetails.roomIcon,0,'',GetCurrentTSAPIFormat()]).then(
						function(response){
							if(response != null){
								//create userinroom
								angular.forEach(memberDetails,function(value,key){
									PMUserInRoomSQLite.Add([roomDetails.roomId,value.empId]);
								})
								//join room
								service.JoinRoom(roomDetails.roomId,window.localStorage.getItem("CurrentUserName"));
								resolve(true);
							}
						});
					}
					else{
						//join room
						service.JoinRoom(roomDetails.roomId,window.localStorage.getItem("CurrentUserName"));
						resolve(true);
					} 
				}
				else resolve(true);
			},function(response){console.log(response);resolve(false);});
		});
	};

	this.GenerateMessageId = function(){
		var fullId = xmppConnection.getUniqueId();
		return fullId.substring(24,36);
	};
	//*************Utility*************



	//*************Timer***************
	var xmppSetTimeout;
	var xmppTimerIsActive = false;
	var xmppReconnectCounter = 1;
	var xmppMaintainTimer;
	this.TryToReconnect = function() {
	    // if(xmppTimerIsActive) return;
	    // console.log('EnableTimerReconnect');
	    // xmppReconnectTimer = setInterval(function(){service.xmppTimerTick()}, 15000);
	    // //change flag
	    // xmppTimerIsActive = true;

	    //if server down reconnect xmpp and didn't already attemp to reconnect
	   	if(!isNetworkDown) {
	   		if(!isAttempToConnect){
	   			service.Authentication(window.localStorage.getItem("AuthServices_username"),window.localStorage.getItem("AuthServices_password"));
	   			isAttempToConnect = true;
	   		} 
	   	}

	   	//if reach 1:50 minute still can't connect then update msgAct = 2
	   	xmppSetTimeout = setTimeout(function(){
	   		if(!xmppConnectionIsActive){
	   			//update all messages that have msgAct = 1 to msgAct = 2 , Show extra button if still in active room
	        	service.ProcessShowExtraButton();
	        	isAttempToConnect = false;
	   		}
	   	},110000)
	};

	this.TimerMaintainConnection = function(){
		xmppMaintainTimer = setInterval(function(){
			console.log('xmppConnectionIsActive',xmppConnectionIsActive);
			console.log('isAttempToConnect',isAttempToConnect);
			if(!xmppConnectionIsActive && !isAttempToConnect){ 
				console.log('TimerMaintainConnection');
				isAttempToConnect = true;
				service.Authentication(window.localStorage.getItem("AuthServices_username"),window.localStorage.getItem("AuthServices_password"));
			}	
		}, 15000);
	};

	this.DisableTimerMaintainConnection = function(){
		console.log('DisableTimerMaintainConnection');
		clearInterval(xmppMaintainTimer);
	};

	this.DisableSetTimeout = function() {
	    clearTimeout(xmppSetTimeout);
	    // xmppTimerIsActive = false;
	    // xmppReconnectCounter = 1;
	    console.log('DisableSetTimeout');
	};

	// this.xmppTimerTick = function() {
	// 	console.log('xmppTimerTick');
	//     if(xmppReconnectCounter == 5){
	//     	console.log('xmppTimerTick 5 times');
	//         service.DisableTimerReconnect();
	//         //update all messages that have msgAct = 1 to msgAct = 2 , Show extra button if still in active room
	//         service.ProcessShowExtraButton();
	//     }
	//     else{
	//     	console.log('xmppTimerTick try to reconnect : ' + xmppReconnectCounter);
	//         //try to reconnect
	//         service.Authentication(window.localStorage.getItem("AuthServices_username"),window.localStorage.getItem("AuthServices_password"));
	//         xmppReconnectCounter++;
	//     }
	// };

	this.ProcessResendMessages = function(){
		needResendMessages = false;
		console.log('ProcessResendMessages');
		service.DisableSetTimeout();
		//loop resend message
		PMMsgSQLite.GetAllResendMessage().then(function(response){
			if(response != null){
				var msgs = ConvertQueryResultToArray(response);
				angular.forEach(msgs,function(value,key){
					//send message
					service.SendChatMessage(value.Empl_Code,value.roomId,value.message,value.MessageId);
					//update this msgAct = 0
					PMMsgSQLite.UpdateMsgAct(value.MessageId,0);
					//check if 
					if(value.roomId == xmppSharedProperties.GetSharedProperties().ActiveRoomId){
		   				console.log('active room -> resend completed');
						//show extra button
						$rootScope.$broadcast('resendCompleted',{msgId:value.MessageId});
					}
				});
				if(msgs.length > 0){
					var lastIndex = msgs.length - 1;
					//update lastmsg in pmroom
		   			PMRoomSQLite.UpdateLastMsg(msgs[lastIndex].roomId,msgs[lastIndex].message);
				}
			}
		})
	};

	this.ProcessShowExtraButton = function(){
		console.log('ProcessShowExtraButton');
		//get all msgAct = 1
		PMMsgSQLite.GetAllResendMessage().then(function(response){
			if(response != null){
				var msgs = ConvertQueryResultToArray(response);
				angular.forEach(msgs,function(value,key){
					//update this msgAct = 2
					PMMsgSQLite.UpdateMsgAct(value.MessageId,2);
					//check if 
					if(value.roomId == xmppSharedProperties.GetSharedProperties().ActiveRoomId){
		   				console.log('active room -> show extra button');
						//show extra button
						$rootScope.$broadcast('showExtraBtn',{msgId:value.MessageId});
					}
				});
			}
		})
	};
	//*************Timer***************

	
});


function GetJIDFromAttribute(attr) {
	if(attr && attr.length > 0){
		var prefixIndex = attr.indexOf('@');
		return attr.substring(0,prefixIndex);
	}
	else return null;
};

function GetMessageObjectFromXML(xml){
	var bodyTxt = null;
	var result = {};
	var bodyelem = (xml.getElementsByTagName('body') != null) ? xml.getElementsByTagName('body') : null;
	if(bodyelem != null && bodyelem.length > 0){
		bodyTxt = Strophe.getText(bodyelem[0]);
		//find message txt from body after 12 digit
		result.message = GetMessageFromBody(bodyTxt);
	}
	//find msgId from body first 12 digit
	result.msgId = (bodyTxt != null) ? GetMsgIdFromBody(bodyTxt) : null;
	result.to = (xml.getAttribute('to') != null) ? GetJIDFromAttribute(xml.getAttribute('to')) : null;
    result.from = (xml.getAttribute('from') != null) ? GetJIDFromAttribute(xml.getAttribute('from')) : null;
    result.fromJID = (xml.getAttribute('from') != null) ? GetOwnerIdByFrom(xml.getAttribute('from')) : null; 
    result.received = (bodyTxt != null) ? CheckThisMessageIsReceivedType(bodyTxt) : null;
    result.event = (xml.getAttribute('event') != null) ? xml.getAttribute('event') : null;
    //if delay message get ts from timestamp attribute
    if(xml.getElementsByTagName('delay') != null && xml.getElementsByTagName('delay').length > 0) result.TS = GetTSFromDelayMessage(xml.getElementsByTagName('delay')[0].getAttribute('stamp'));
    else result.TS = (xml.getAttribute('TS') != null) ? xml.getAttribute('TS') : null;
    //result.roomId = (xml.getAttribute('roomId') != null) ? xml.getAttribute('roomId') : null;
    //result.ownerId = (xml.getAttribute('from') != null) ? GetOwnerIdByFrom(xml.getAttribute('from')) : null; 
    return result;
};

function CreateChatMessageXML(roomId,message,msgId,TS,ownerId) {
	var jid = roomId + '@' + xmppURLDetails.chatService + '.' + xmppURLDetails.domain;
	var msg = $msg({to:jid, type:'groupchat', receive:false,TS:TS, ownerId:ownerId, roomId:roomId}).c('body').t(msgId + 's' + message);
	return msg.tree();
};

function GetOwnerIdByFrom(from) {
	var index = from.indexOf('/');
	return from.substring(index + 1);
};

function GetMsgIdFromBody(body){
	if(body && body.length > 0){
		return body.substring(0,12);
	}
	else return null;
};

function GetMessageFromBody (body){
	return body.substring(13);
};

function GetTSFromDelayMessage(timestamp){
	var day = timestamp.substring(8,10);
	var month = timestamp.substring(5,7);
	var year = timestamp.substring(0,4);
	var hour = (parseInt(timestamp.substring(11,13)) + 7).toString();
	hour = (hour.length == 1) ? '0' + hour : hour;
	var minute = timestamp.substring(14,16);
	var millisecond = timestamp.substring(17,19);
 	return (day + month + year + hour + minute + millisecond);
};

function CheckThisMessageIsReceivedType(body) {
	if(body.substring(12,13) == 'r') return 'true';
	else return 'false';
};

function CheckUserIsSeenMessage(msgId,empId){
	for (var i = 0; i <= dictUserSeenMessage.length - 1; i++) {
		if(dictUserSeenMessage[i].msgId == msgId){
			var empIds = dictUserSeenMessage[i].empIds;
			for (var z = 0; z <= empIds.length - 1; z++) {
				if(empIds[z] == empId) return true;
			}
			return false;
		}
	}
	return false;
};

function AddUserIdSeenMessageInList(msgId,empId) {
	var found = false;
	for (var i = 0; i <= dictUserSeenMessage.length - 1; i++) {
		if(dictUserSeenMessage[i].msgId == msgId){
			dictUserSeenMessage[i].empIds.push(empId);
			return;
		}
	}
	//in case new msgId
	dictUserSeenMessage.push({msgId:msgId,empIds:[empId]});
	return;
}
