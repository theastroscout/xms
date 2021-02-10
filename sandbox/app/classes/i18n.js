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
		if(typeof str === "object"){
			str = str.toString();
			return (i18n.ids[str] !== undefined)?i18n.ids[str]:i18n.default;
		} else if(i18n.ids[str] !== undefined){
			return i18n.ids[str];
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
	},
	get: (path, lang, getObject=false) => {
		lang = i18n.getLang(lang);

		let value = false;
		let chunks = path.split("/");

		try {
			value = i18n.list[lang];
			for(var c of chunks){
				value = value[c];
			}
		} catch(e){
			// Continue regardless errors
		}

		if(value === undefined && i18n.default !== lang){
			try{
				value = i18n.list[i18n.default];
				for(var c of chunks){
					value = value[c];
				}
			} catch(e){}

			if(value === false){
				value = path;
			}
		}
		if(typeof value !== "string"){
			if(getObject && typeof value === "object"){
				return utils.copyObj(value);
			}
			return false;
		} else if(typeof value === "string" && value.match(/^marked/)){
			value = value.replace(/^marked/,"");
			value = marked(value);
		}
		return value;
	},
	translate: (tpl, langID) => {
		if(tpl === false){
			return tpl;
		}
		let translate = tpl.match(/\{i18n\/([^}]+)\}/g);
		if(translate){
			for(let t of translate){
				let v = i18n.get(t.replace(/\{i18n\/([^}]+)\}/,"$1"), langID);
				if(v !== false){
					tpl = tpl.replace(t, v);
				}
			}
		}
		return tpl;
	}
};
i18n.init();
module.exports = i18n;