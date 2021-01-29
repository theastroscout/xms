var utils = {
	getUniqueID: () => {
		return utils.hashChunk() + '-' + utils.hashChunk() + utils.hashChunk() + '-' + utils.hashChunk();
	},
	hashChunk: () => {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	},
	getCookie: (str) => {
		if(str === undefined || str === null){
			return {};
		}

		let cookie = {};
		let chunks = str.split("; ");
		for(var item of chunks){
			item = item.split("=");
			cookie[item[0]] = item[1];
		}
		return cookie;
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
	}
};
module.exports = utils;