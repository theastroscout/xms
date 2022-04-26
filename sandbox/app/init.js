'use strict';

const cluster = require("cluster");

let argv = process.argv;
global.DEV = argv && argv[2] === "DEV";

var confPath = (DEV)?"dev":"prod";
global.conf = require(`../../conf/${confPath}`);
conf.apps.smsaero.auth = "Basic " + Buffer.from(conf.apps.smsaero.email + ":" + conf.apps.smsaero.key).toString("base64");

global.workDir = conf.sys.root+"/"+((DEV)?"sandbox":"prod");
if(DEV){
	global.prodConf = require(`../../conf/prod`);
}


global.utils = require("./utils");

async function init(){
	global.mongodb = await hqDB({type:"mongo"});
	global.mongo = mongodb.client;
	global.db = await mongo.db(conf.sys.db.name);
	if(DEV){
		global.prodDB = await mongo.db(prodConf.sys.db.name);
	}
	if (cluster.isMaster) {
		let master = require("./master");
	} else {
		let app = require("./app");
	}

	global.i18n = require("./classes/i18n");
}

init();