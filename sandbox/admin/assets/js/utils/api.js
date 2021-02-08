var api = {
	attempts: 0,
	online: false,
	init: () => {
		api.attempts++;
		api.obj = new WebSocket(`wss://${location.host}`);
		api.obj.onopen = api.events;
		api.obj.onclose = api.events;
		api.obj.onerror = api.events;
		api.obj.onmessage = api.resp;
	},
	events(e){
		// error, close & open
		switch(e.type){
			case "open":
				api.attempts = 0;
				api.online = true;
				api.req({
					class: "handshake",
					method: "hi",
					data:{
						p: location.pathname+location.search,
						l: navigator.language
					}
				});
				api.tasker.purge();
				break;

			case "error":
				api.online = false;
				api.obj.close();
				break;

			case "close":
				api.online = false;
				if(api.attempts < 10){
					setTimeout(api.init, 1000);
				} else {
					setTimeout(api.init, 10000);
				}
				break;
		}
	},
	tasker: {
		list: [],
		purge: () => {
			let l = api.tasker.length
			while (l--) {
				let data = api.tasker.splice(i, 1);
				api.req(data);
			}
		}
	},
	req: (data) => {
		if(api.obj && api.online){
			log("Request:",data);
			api.obj.send(JSON.stringify(data));
		} else {
			api.tasker.list.push(data);
		}
	},
	resp: (e) => {
		if(!e.data || e.data === ""){
			return false;
		}
		let data;
		try {
			data = JSON.parse(e.data);
		} catch(e){
			data = false;
		}
		if(!data){
			return false;
		}
		log("Response:",data);
		if(data.class === "admin"){
			if(admin.methods[data.method] !== undefined){
				admin.methods[data.method](data);
			}
		}
	}
};