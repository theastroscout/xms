var sys = {
	checkFirstLaunch: async () => {
		let currentTime = new Date();
		let pageTypes = await db.collection("pageTypes").find({}).toArray();
		if(!pageTypes.length){
			await db.collection("pageTypes").insertMany(require(conf.sys.root+"/data/db.pageTypes"));
			console.log("Page Types Collection Created");
		}

		let i18n = await db.collection("i18n").find({}).toArray();
		if(!i18n.length){
			await db.collection("i18n").insertMany(require(conf.sys.root+"/data/db.i18n"));
			console.log("i18n Collection Created");
		}

		let settings = await db.collection("settings").find({}).toArray();
		if(!settings.length){
			let settingsPost = require(conf.sys.root+"/data/db.settings");
			settingsPost[0].updateTime = currentTime;
			await db.collection("settings").insertMany(settingsPost);
			console.log("Settings Collection Created");
		}

		let pages = await db.collection("pages").find({}).toArray();
		if(!pages.length){
			
			let langType = await db.collection("i18n").findOne({"name":"en"});
			let homeType = await db.collection("pageTypes").findOne({"name":"Home Page"});

			let pagesPost = require(conf.sys.root+"/data/db.pages");
			pagesPost[0].createTime = currentTime;
			pagesPost[0].updateTime = currentTime;
			pagesPost[0].typeID = homeType._id;
			pagesPost[0].langID = langType._id;
			await db.collection("pages").insertMany(pagesPost);
			console.log("Pages Collection Created");
		}
	}
};
module.exports = sys;