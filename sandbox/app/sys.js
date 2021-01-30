var sys = {
	checkFirstLaunch: async () => {
		let pageTypes = await db.collection("pageTypes").find({}).toArray();
		if(!pageTypes.length){
			// await db.collection("pageTypes").insertMany(require(conf.sys.root+"/data/db.pageTypes"));
		}

		let i18n = await db.collection("i18n").find({}).toArray();
		if(!i18n.length){
			// await db.collection("i18n").insertMany(require(conf.sys.root+"/data/db.i18n"));
		}

		let settings = await db.collection("settings").find({}).toArray();
		if(!settings.length){
			let settingsPost = require(conf.sys.root+"/data/db.settings");
			settingsPost.updateTime = new Date();
			// await db.collection("settings").insertMany(settingsPost);
		}
	}
};
module.exports = sys;