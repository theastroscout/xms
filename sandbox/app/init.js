'use strict';

const cluster = require("cluster");

global.DEV = process.env.DEV;
var confPath = (DEV)?"dev":"prod";
global.conf = require(`../../conf/${confPath}`);
global.workDir = conf.sys.root+"/"+((DEV)?"sandbox":"prod");
if(DEV){
	global.prodConf = require(`../../conf/prod`);
}

global.fs = require("fs");
global.md5 = require("md5");
global.moment = require("moment-timezone");


global.utils = require("./utils");
global.marked = utils.marked;

global.translit = require("@hqdaemon/translit");

global.jscompose = require("@hqdaemon/jscompose");
global.minify = require("@hqdaemon/minify");
global.hqDB = require("@hqdaemon/db");

global.SVGSpriter = require("svg-sprite");

const {exec, execSync} = require("child_process");
global.execSync = execSync;

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