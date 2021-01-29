'use strict';

const cluster = require("cluster");

global.DEV = process.env.DEV;
var confPath = (DEV)?"dev":"prod";
global.conf = require(`../../conf/${confPath}`);
if(DEV){
	global.prodConf = require(`../../conf/prod`);
}

global.fs = require("fs");

global.workDir = __dirname.replace("/app","");
global.md5 = require("md5");
global.moment = require("moment-timezone");

global.marked = require("marked").setOptions({
	breaks: true,
	headerIds: false
});

global.utils = require("./utils");
global.translit = require("@hqdaemon/translit");

global.jscompose = require("@hqdaemon/jscompose");
global.minify = require("@hqdaemon/minify");
global.hqDB = require("@hqdaemon/db");

async function init(){
	global.mongodb = await hqDB({type:"mongo"});
	global.mongo = mongodb.client;
	global.db = await mongo.db(conf.sys.db.name)
	if (cluster.isMaster) {
		let master = require("./master");
	} else {
		let app = require("./app");
	}

	global.i18n = require("./classes/i18n");
}

init();