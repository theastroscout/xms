var api = {
	list: {},
	init: async () => {
		api.obj = new WebSocket.Server({server: httpsServer});
		api.obj.on("connection", api.connection);
		api.heartbeat();
	},
	heartbeat: () => {
		let list = Object.keys(api.list);
		for(let i=0,l=list.length;i<l;i++){
			let socket = api.list[list[i]];
			socket.obj.send("");
		}
		setTimeout(api.heartbeat,5000);
	},
	connection: async (socket, req) => {
		let ip = req.headers["x-real-ip"];
		let cookies = utils.getCookies(req.headers.cookie);
		let lang = cookies.lang;
		if(lang === undefined){
			lang = i18n.getLangFromHeader(req.headers["accept-language"]);
		}

		socket.id = utils.getUniqueID("xxxxx-");

		let socketObj = {
			id: socket.id,
			ip: ip,
			obj: socket,
			lang: lang,
			cookies: cookies,
			url: req.url,
			params: utils.getURLParams(req.url)
		};
		api.list[socket.id] = socketObj;
		modules.connect(socketObj);

		socket.on("message", api.message);
		socket.on("close", api.disconnect);
	},
	disconnect(e){
		let socketID = this.id;
		modules.disconnect(socketID);
		let socket = api.list[socketID];
		if(socket){
			delete api.list[socketID];
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

		let socketID = this.id;
		let socket = api.list[socketID];
		payload.socketID = socketID;
		payload.ip = socket.ip;
		payload.lang = socket.lang;
		payload.xu = socket.cookies.xu;

		payload.result = {
			method: payload.method
		};
		if(payload.class !== undefined){
			payload.result.class = payload.class;
		} else if(payload.module !== undefined){
			payload.result.module = payload.module;
		}
		if(payload.class === "admin" && DEV){
			if(admin.methods[payload.method] !== undefined){
				admin.methods[payload.method](payload);
			} else {
				payload.result.state = false;
				payload.result.msg = "Method Not Found";
				api.send(payload);
			}
		} else if(payload.module !== undefined){
			let method = modules.getMethod(payload.module, payload.method);
			if(method){
				method(payload);
			} else {
				payload.result.state = false;
				payload.result.msg = "Sorry, this method not found.";
				api.send(payload);
			}
		}
	},
	send: (payload) => {
		let data = payload.result;
		let socketID = payload.socketID;
		if(api.list[socketID] !== undefined){
			api.list[socketID].obj.send(JSON.stringify(data));
		}
	}
};
module.exports = api;