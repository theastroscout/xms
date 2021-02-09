var i18n = {
	list: {},
	ids: {},
	init: async () => {
		let resp = await db.collection("i18n").find({}).toArray();
		for(let item of resp){
			i18n.list[item.name] = item;
			i18n.ids[item._id] = item.name;
			if(item.default === true){
				i18n.default = item.name;
				i18n.defaultID = item._id.toString();
			}
		}
	},
	refresh: async (langName) => {
		let langID = i18n.getLangID(langName);
		let lang = await db.collection("i18n").findOne({_id:langID});
		i18n.list[lang.name] = lang;
		i18n.ids[lang._id] = lang.name;
		if(lang.default === true){
			i18n.default = lang.name;
			i18n.defaultID = lang._id.toString();
		}
	},
	getLangObj: (lang) => {
		lang = i18n.getLang(lang);
		return i18n.list[lang];
	},
	getLang: (str) => {
		if(str === undefined || !str || str === null){
			return i18n.default;
		}
		str = str.toLowerCase();
		return (i18n.list[str] === undefined)?i18n.default:str;
	},
	getLangID: (lang) => {
		lang = i18n.getLang(lang);
		return i18n.list[lang]._id;
	},
	getPrefix: (lang) => {
		let obj;
		if(typeof lang === "object"){
			obj = i18n.list[i18n.ids[lang.toString()]];
		} else {
			obj = i18n.list[lang];
		}
		return (obj._id.toString() !== i18n.defaultID)?"/"+obj.prefix:"";
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