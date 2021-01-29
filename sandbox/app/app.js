global.https = require("https");
global.WebSocket = require("ws");
// Express
global.expressLib = require("express");
global.exp = expressLib();
const privateKey  = fs.readFileSync(conf.sys.ssl.privateKey, "utf8");
const certificate = fs.readFileSync(conf.sys.ssl.certificate, "utf8");
const credentials = {key: privateKey, cert: certificate};
global.httpsServer = https.createServer(credentials, exp);

// Classes
global.server = require("./classes/server");
global.ws = require("./classes/ws");

global.admin = require("./classes/admin");
global.view = require("./classes/view");

var app = {
	init: async () => {
		let assets = await db.collection("settings").findOne({name:"assets"});
		conf.assets = Object.assign(conf.assets, assets);

		let pageTypes = await db.collection("pageTypes").find({}).toArray();
		conf.pageTypes = pageTypes;
		
		process.on("message", app.message.get);

		server.init();
		ws.init();
	},
	message: {
		get: (payload) => {
			switch(payload.method) {
				default:
					console.log("Incoming message from master",payload);
					break;
			}
		},
		send: (payload) => {
			payload.pid = process.pid;
			process.send(payload);
		}
	}
};

app.init();