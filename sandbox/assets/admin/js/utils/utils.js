var log = function() {
	if(location.host != "{prodHost}"){
		for(var i in arguments){
			console.log(arguments[i]);
		}
	}
};