var utils = {
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
	strToURL: (str) => {
		str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		str = str.toLowerCase();
		str = translit(str);
		return str.replace(/[^a-z0-9 —]/g, "").trim().replace(/\s+/g,"-");
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
		fs.readdirSync(dir).forEach(file => {
			if (fs.statSync(dir+file).isDirectory()){
				files = files.concat(utils.getFilesList(dir+file+"/"));
			} else {
				files.push(dir+file);
			}
		});
		return files;
	},
	strCut: (str, length=180, trail, dots="...") => {
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
	}
};
module.exports = utils;