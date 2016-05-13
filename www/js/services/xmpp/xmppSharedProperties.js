
angular.module('starter').service('xmppSharedProperties',function(){

	var _sharedProperties = {ActiveRoomId:null};

	this.GetSharedProperties = function(){
		return _sharedProperties;
	};

	this.SetSharedProperties = function(sharedProperties){
		_sharedProperties = sharedProperties;
	};	

});

