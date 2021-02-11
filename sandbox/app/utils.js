var utils = {
	getUniqueID: () => {
		return utils.hashChunk() + '-' + utils.hashChunk() + utils.hashChunk();
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
	}
};
module.exports = utils;