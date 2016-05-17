//**********VARIABLES**********
var xmppURLDetails = {prefix:'http://',domain:'10.74.17.109',port:':7070',bind:'/http-bind/',resource:'/PM',chatService:'conference'};
var xmppFullPath = xmppURLDetails.prefix + xmppURLDetails.domain + xmppURLDetails.port + xmppURLDetails.bind;
var xmppConnection;
var xmppConnectionIsActive = false;
var dictUserSeenMessage = [];
//**********VARIABLES**********

angular.module('starter').service('XMPPService',function($q,$rootScope,PMMsgSQLite,PMUserInRoomSQLite,PMRoomSQLite,APIService,xmppSharedProperties,PMSeenMessageSQLite){

	var service = this;

	//*************Connection*************
	//check authentication
	this.Authentication = function(userid,password){
		service.xmppConnect(userid,password);
	};

	this.Disconnect = function(){
		xmppConnection.flush();
    	xmppConnection.disconnect();
    	return true;
	};

	this.xmppConnect = function(userid,password) {
		xmppConnection = new Strophe.Connection(xmppFullPath);
		xmppConnection.connect(userid + '@' + xmppURLDetails.domain,password, service.xmppOnConnect);
	};

	this.xmppOnConnect = function(status) {
		console.log(status);
		if(status == Strophe.Status.CONNECTED){
			//add handler and set online
			xmppConnection.send($pres());
			service.xmppAddHandlers();
			//todo join all rooms that current user is memeber
			service.JoinRoomsUsersIsMember();
			//set global connection state
			xmppConnectionIsActive = true;
			return true;
		}
		else if(status == Strophe.status.DISCONNECTED){
			xmppConnectionIsActive = false;
		}
		else xmppConnectionIsActive = false;
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
		//create data in pmroom if not exist
		PMRoomSQLite.CheckRoomIdIsExist(roomId).then(function(response){
			if(response != null){
				var totalCount = ConvertQueryResultToArray(response)[0].totalCount;
				if(totalCount == 0){
					//save pmroom , pmuserinroom
					GetPicThumbBase64($q,APIService,senderId).then(function(base64){
						if(base64 != null && base64.length > 0){
							var roomIcon = base64;
							PMRoomSQLite.Add([roomId,1,fullname,roomIcon,0,'',GetCurrentTSAPIFormat(),senderId]).then(
								function(response){
									if(response != null){
										PMUserInRoomSQLite.Add([roomId,senderId]);
										//join room
										service.JoinRoom(roomId,window.localStorage.getItem("CurrentUserName"));
									} 
								});
							return true;
						}
						else return true;
					});
				}
				else return true;
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
 		if(result.received == 'true' && result.msgId != null && result.fromJID != null){
 			//find ownerId by msgId
 			PMMsgSQLite.GetEmpIdByMessageAndRoomId(result.msgId,roomId).then(function(response){
 				if(response != null){
 					console.log('response',ConvertQueryResultToArray(response));
 					var ownerId = ConvertQueryResultToArray(response)[0].Empl_Code;
 					if(ownerId == window.localStorage.getItem("CurrentUserName")){
		 				//check user has already seen message(in other device)
		 				var isUserSeenMessage = CheckUserIsSeenMessage(result.msgId,result.fromJID);
		 				console.log('isUserSeenMessage',isUserSeenMessage);
		 				if(!isUserSeenMessage){
		 					//add user seen this message to list
			 				AddUserIdSeenMessageInList(result.msgId,result.fromJID);
				 			//check this user is seen message?
							PMSeenMessageSQLite.CheckUserSeenMessage(result.fromJID,result.msgId).then(function(response){
								if(response != null){
									var totalCount = ConvertQueryResultToArray(response)[0].totalCount;
									if(totalCount == 0){
										//add this user has seen message
										PMSeenMessageSQLite.Add([result.fromJID,result.msgId]);
										//update +1 readtotal
							 			PMMsgSQLite.UpdateReadTotal(result.msgId).then(function(){
							 				//get readtotal
							 				PMMsgSQLite.GetReadTotalByMsgId(result.msgId).then(function(response){
							 					if(response != null){
							 						var readTotal = ConvertQueryResultToArray(response)[0].readTotal;
							 						//broadcast to update sender readtotal in UI if is active room
							 						if(roomId == xmppSharedProperties.GetSharedProperties().ActiveRoomId) $rootScope.$broadcast('seenMessage',{msgId:result.msgId,readTotal:readTotal});
							 					}
							 				});
							 			});				
									}
								}
							}); 	
		 				}
		 			} 			
 				}
 			})
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
		   				PMMsgSQLite.Add([result.msgId,ownerId,result.message,0,roomId,result.TS,unseen]);

		   				//check for broadcast message
			   			if(roomId == xmppSharedProperties.GetSharedProperties().ActiveRoomId){
			   				console.log('active room');
							//append message
							$rootScope.$broadcast('incomingMessage',{message:result.message, msgId:result.msgId,TS:result.TS,ownerId:ownerId, roomId:roomId});
						}
						else{
							if(ownerId != window.localStorage.getItem("CurrentUserName")){
								console.log('increment');
								PMRoomSQLite.UpdateIncrementTotalNewMessage(roomId,result.message);
							}
						}
		   			}
		   		}
		   	});
	    }
	  	return true;
	};

	// this.OnPresence = function(presence){
	// 	console.log(presence);
	// };

	// this.OnIQ = function(iq){
	// 	console.log(iq);
	// };
	//*************Handles*************



	//*************Message*************
	this.SendChatMessage = function(toId,fromId,roomId,message){
		return $q(function(resolve, reject) {
			var result = {msgId:GenerateMessageId(),TS:GetCurrentTSAPIFormat()};
			//send xmpp message
			var msg = CreateChatMessageXML(roomId,message,result.msgId,result.TS,fromId);
			xmppConnection.send(msg);
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
		xmppConnection.send(msg);
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
		var pres = $pres({to:roomId + '@' + xmppURLDetails.chatService + '.' + xmppURLDetails.domain + '/' + nickName})
						.c('x',{xmlns:'http://jabber.org/protocol/muc#user'},null);
		xmppConnection.send(pres.tree());
	};

	// this.CreateRoomOnetoOne = function(roomId,empId1,empId2){
	// 	service.JoinRoom(roomId,empId1);
	// 	//send config to set room to persistant
	// 	var iq = $iq({to:roomId + '@' + xmppURLDetails.chatService + '.' + xmppURLDetails.domain,type:'set'})
	// 			.c('query',{xmlns:'http://jabber.org/protocol/muc#owner'})
	// 			.c('x',{xmlns:'jabber:x:data',type:'submit'})
	// 			.c('field',{var:'muc#roomconfig_persistentroom'}).c('value').t(1)
	// 			.up().up()
	// 			.c('field',{var:'muc#roomconfig_enablelogging'}).c('value').t(1)
	// 			.up().up()
	// 			.c('field',{var:'muc#roomconfig_roomowners'}).c('value').t('admin@' + xmppURLDetails.domain)
	// 			.up().up()
	// 			.c('field',{var:'muc#roomconfig_roommembers'}).c('value').t(empId1 + '@' + xmppURLDetails.domain)
	// 			.up().c('value').t(empId2 + '@' + xmppURLDetails.domain)
	// 	console.log('config room',iq.tree());
	// 	xmppConnection.send(iq.tree());
	// };
	//*************Utility*************
	
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
	var hour = timestamp.substring(11,13);
	var minute = timestamp.substring(14,16);
	var milisecond = timestamp.substring(17,19);
 	return (day + month + year + hour + minute + milisecond);
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

function GenerateMessageId(){
	var fullId = xmppConnection.getUniqueId();
	return fullId.substring(24,36);
};