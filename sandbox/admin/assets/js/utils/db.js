var db = {
	obj: {},
	data: null,
	init: () => {
		db.obj = localStorage.getItem("data");
		db.obj = (db.obj)?JSON.parse(db.obj):{};

		if(!db.obj.pages){
			db.obj.pages = {};
		}
		if(!db.obj.i18n){
			db.obj.i18n = {};
		}

		let validator = {
			get(target, key){
				if (typeof target[key] === "object" && target[key] !== null) {
					return new Proxy(target[key], validator)
				} else {
					return target[key];
				}
			},
			set(target, key, value){
				target[key] = value;
				db.save();
				return true
			},
			deleteProperty(target,key){
				delete target[key];
				db.save();
				return true;
			}
		};

		db.data = new Proxy(db.obj, validator);
		if(!db.data.pages){
			db.data.pages = {};
		}
	},
	save: () => {
		localStorage.setItem("data",JSON.stringify(db.data));
	}
};