let markedLib = require("marked").setOptions({
	breaks: true,
	headerIds: false
});
let utils = {
	marked: (str) => {
		if(typeof str !== "string" || !str.length){
			return str;
		}

		return markedLib(str);
	},
	getUniqueID: (mask) => {
		let hash = utils.hashChunk() + utils.hashChunk() + utils.hashChunk();
		if(typeof mask === "string"){
			hash = utils.mask(mask,hash);
		}
		return hash;
	},
	mask: (mask,str) => {
		if(typeof mask === "string" && typeof str === "string"){
			let n=0;
			str = str.split("").map(v => {
				v = (mask[n] && mask[n]!=="x")?mask[n]+v:v
				n++;
				return v;
			}).join("");
		}
		return str;
	},
	getNumberedID: function(limit){
		var code = '';
			limit = (limit !== undefined)?limit:4;
		for(var i=0;i<limit;i++){
			code += utils.randomInteger(1,9);
		}
		code += ((new Date()).getTime()-1100006165769-parseInt(code)).toString().substr(-5);
		return code.toString().substr(-limit);
	},
	randomInteger: function(min, max) {
		let seed = Math.random();
		let rand = Math.sin(seed) * 10000;
			rand = rand - Math.floor(rand);

			rand = min + rand * (max - min)
			rand = Math.round(rand);
		return rand;
	},
	hashChunk: () => {
		return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
	},
	getCookies: (str) => {
		if(str === undefined || str === null){
			return {};
		}

		let cookies = {};
		let chunks = str.split("; ");
		for(var item of chunks){
			item = item.split("=");
			cookies[item[0]] = item[1];
		}
		return cookies;
	},
	getURLParams: (str) => {
		if(str === undefined || str === null){
			return {};
		}
		str = str.match(/([^?]*)\??(.*)/)[2];
		if(!str.length){
			return {};
		}

		let params = {};
		let chunks = str.split("&");
		for(var item of chunks){
			item = item.split("=");
			params[item[0]] = item[1];
		}
		return params;
	},
	strToURL: (str) => {
		str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		str = str.toLowerCase();
		str = translit(str);
		return str.replace(/[^a-z0-9 -]/g, "").trim().replace(/\s+/g,"-");
	},
	validate: {
		str: (str) => {
			if(!str || !str.replace(/\s+/g,"").length){
				return false;
			}
			return str.trim();
		}
	},
	copyObj: function(obj){
		return JSON.parse(JSON.stringify(obj));
	},
	getFilesList: (dir) => {
		let files = [];
		if(!fs.existsSync(dir)){
			return [];
		}
		fs.readdirSync(dir).forEach(file => {
			if (fs.statSync(dir+file).isDirectory()){
				files = files.concat(utils.getFilesList(dir+file+"/"));
			} else {
				files.push(dir+file);
			}
		});
		return files;
	},
	strCut: (str, length=180, dots="...") => {
		if(!str){
			return false;
		}

		str = marked(str).replace(/<[^>]*>?/gm, "");
		if(str.length > length){
			str = str.substr(0, length);
			str = str.substr(0, Math.min(str.length, str.lastIndexOf(" ")));
			str += dots;
		}
		return str;
	},
	escapeHtml: (str) => {
		return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
	},
	plural: (n, forms) => {
		return n%10==1&&n%100!=11?forms[0]:(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?forms[1]:forms[2]);
	},
	arraySum: function(array){
		return array.reduce((a, b) => a + b, 0);
	},
	median: function(arr){
		const mid = Math.floor(arr.length / 2),
		nums = arr.sort((a, b) => a - b);
		return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
	},
	moveArray: (a, from, to) => {
		let el = a.splice(from, 1)[0];
		a.splice(to, 0, el);
		return a;
	}
};

/*

Request

*/

global.request = (url, params, method="POST", auth=false) => {
	return new Promise((resolve) => {
		url = new URL(url);
		const postData = JSON.stringify(params);

		let options = {
			hostname: url.hostname,
			port: url.protocol==="https:"?443:80,
			path: url.pathname,
			method: method,
			headers: {
				"Content-Type": "application/json",
				"Content-Length": Buffer.byteLength(postData)
			}
		};
		if(auth){
			options.headers.Authorization = auth;
		}
		if(method === "GET"){
			let query = Object.entries(params).map(v => v.join("=")).join("&");
			options.path += "?"+encodeURI(query);
			delete options.headers["Content-Length"];
		}

		let driver = url.protocol==="https:"?https:http;
		const req = driver.request(options, (res) => {
			res.setEncoding("utf8");
			let data = "";
			res.on("data", (chunk) => {
				data+=chunk;
			});
			res.on("end", () => {
				resolve(data);
			});
		});

		req.on("error", (e) => {
			console.error(`problem with request: ${e.message}`);
			console.log(url)
			resolve(false);
		});

		if(method === "POST"){
			req.write(postData);
		}
		req.end();
	});
};

/*

Object ID

*/

global.ObjectID = (id) => {
	try {
		id = new mongodb.ObjectID(id);
	} catch (e){
		id = false;
	}
	return id;
}

global.marked = utils.marked;

global.translit = require("@hqdaemon/translit");

global.jscompose = require("@hqdaemon/jscompose");
global.minify = require("@hqdaemon/minify");
global.hqDB = require("@hqdaemon/db");

global.SVGSpriter = require("svg-sprite");
global.sharp = require("sharp");

global.nodemailer = require("nodemailer");
global.geoip = require("geoip-lite");

const {exec, execSync} = require("child_process");
global.execSync = execSync;

const {nanoid} = require("nanoid");
global.nanoid = nanoid;

global.fs = require("fs");
global.md5 = require("md5");

/*

Time

*/
global.moment = require("moment-timezone");
global.time = (time, locale="de", format=false, timeZone="Europe/Moscow") => {
	time = moment.tz(time,timeZone);
	let diff = Math.abs(time.diff(new Date())/1000/60/60/24);
	time.locale(locale);
	if(format === false){
		format = "dddd, Do MMMM в H:mm";
		time = diff > 9 ? time.format(format) : time.calendar();
	} else {
		time = time.format(format);
	}
	return time.charAt(0).toUpperCase() + time.slice(1);
}

global.useragent = require("express-useragent");

module.exports = utils;