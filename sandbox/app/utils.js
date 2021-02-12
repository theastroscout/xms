var utils = {
	getUniqueID: (mask) => {
		let hash = utils.hashChunk() + utils.hashChunk() + utils.hashChunk();
		if(mask){
			let n=0;
			hash = hash.split("").map(v => {
				v = (mask[n] && mask[n]!=="x")?mask[n]+v:v
				n++;
				return v;
			}).join("");
		}
		return hash;
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
		return str.replace(/[^a-zA-Z0-9 -—]/g, "").trim().replace(/\s+/g,"-");
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
	}
};
module.exports = utils;