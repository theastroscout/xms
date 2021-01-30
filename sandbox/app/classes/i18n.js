var i18n = {
	list: {},
	ids: {},
	init: async () => {
		i18n.default = conf.assets.i18n.default;
		let resp = await db.collection("i18n").find({}).toArray();
		for(let item of resp){
			i18n.list[item.name] = item;
			i18n.ids[item._id] = item.name;
		}
	},
	getLang: (str) => {
		if(str === undefined){
			return i18n.default;
		}
		str = str.toLowerCase();
		return (i18n.list[str] === undefined)?i18n.default:str;
	},
	getLangID: (lang) => {
		return i18n.list[lang]._id;
	},
	getPrefix: (lang) => {
		let obj;
		if(typeof lang === "object"){
			obj = i18n.list[i18n.ids[lang.toString()]];
		} else {
			obj = i18n.list[lang];
		}
		return (obj.prefix)?"/"+obj.prefix:"";
	},
	getLangFromHeader: (str) => {
		if(str === undefined || str === null){
			return i18n.default;
		}
		let lang = str.match(/(\D{2})/);
		if(lang){
			return i18n.getLang(lang[1]);
		}
		return i18n.default;
	},
	getPageLang: (url) => {
		let prefix = url.match(/^\/([^/]{2})/);
		if(!prefix){
			return i18n.default;
		}
		return i18n.getLang(prefix[1]);
	}
};
i18n.init();
module.exports = i18n;