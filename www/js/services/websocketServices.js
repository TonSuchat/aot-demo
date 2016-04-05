angular.module('starter')

.service('SocketService', ['socketFactory', SocketService]);

function SocketService(socketFactory){
	return socketFactory({
		ioSocket: io.connect('http://10.74.17.233:1150',{'forceNew':true})
	});
};
