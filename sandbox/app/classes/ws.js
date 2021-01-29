var ws = {
	list: {},
	init: async () => {
		ws.obj = new WebSocket.Server({server: httpsServer});
		ws.obj.on("connection", ws.connection);
		ws.heartbeat();
	},
	heartbeat: () => {
		let list = Object.keys(ws.list);
		for(let i=0,l=list.length;i<l;i++){
			let socket = ws.list[list[i]];
			socket.obj.send("");
		}
		setTimeout(ws.heartbeat,5000);
	},
	connection: async (socket, req) => {
		let ip = req.headers["x-real-ip"];

		let cookie = utils.getCookie(req.headers.cookie);
		let lang = cookie.lang;
		if(lang === undefined){
			lang = i18n.getLangFromHeader(req.headers["accept-language"]);
		}

		socket.id = utils.getUniqueID();

		ws.list[socket.id] = {
			id: socket.id,
			ip: ip,
			obj: socket,
			lang: lang
		};

		socket.on("message", ws.message);
		socket.on("close", ws.disconnect);
	},
	disconnect(e){
		let socketID = this.id;
		let socket = ws.list[socketID];
		if(socket){
			delete ws.list[socketID];
		}
	},
	message(data){
		let payload;
		try {
			payload = JSON.parse(data);
		} catch(e){
			payload = false;
		}

		if(payload === false){
			return false;
		}

		payload.socketID = this.id;
		payload.result = {
			class: payload.class,
			method: payload.method
		};
		if(payload.class === "admin" && DEV){
			if(admin.methods[payload.method] !== undefined){
				admin.methods[payload.method](payload);
			} else {
				payload.result.state = false;
				payload.result.msg = "Method Not Found";
				ws.send(payload);
			}
		}
	},
	send: (payload) => {
		let data = payload.result;
		let socketID = payload.socketID;
		if(ws.list[socketID] !== undefined){
			ws.list[socketID].obj.send(JSON.stringify(data));
		}
	}
};
module.exports = ws;