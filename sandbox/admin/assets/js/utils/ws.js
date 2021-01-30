var ws = {
	attempts: 0,
	online: false,
	init: () => {
		ws.attempts++;
		ws.obj = new WebSocket(`wss://${location.host}`);
		ws.obj.onopen = ws.events;
		ws.obj.onclose = ws.events;
		ws.obj.onerror = ws.events;
		ws.obj.onmessage = ws.resp;
	},
	events(e){
		// error, close & open
		switch(e.type){
			case "open":
				ws.attempts = 0;
				ws.online = true;
				ws.req({
					class: "handshake",
					method: "hi",
					data:{
						p: location.pathname+location.search,
						l: navigator.language
					}
				});
				ws.tasker.purge();
				break;

			case "error":
				ws.online = false;
				ws.obj.close();
				break;

			case "close":
				ws.online = false;
				if(ws.attempts < 10){
					setTimeout(ws.init, 1000);
				} else {
					setTimeout(ws.init, 10000);
				}
				break;
		}
	},
	tasker: {
		list: [],
		purge: () => {
			let l = ws.tasker.length
			while (l--) {
				let data = ws.tasker.splice(i, 1);
				ws.req(data);
			}
		}
	},
	req: (data) => {
		if(ws.obj && ws.online){
			log("Request:",data);
			ws.obj.send(JSON.stringify(data));
		} else {
			ws.tasker.list.push(data);
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