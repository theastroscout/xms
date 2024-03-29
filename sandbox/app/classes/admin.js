var admin = {
	init: async () => {
		admin.data = require("../../../data/admin");
	},
	methods: {
		base: async (payload) => {
			switch(payload.data.type) {
				case "sprites":
					await admin.createSprites();
					db.collection("settings").updateOne({name:"assets"},{$inc: {ui:1}});
					payload.result.msg = "Sprite created successfully to public/ui.svg";
					break;
				case "deploy":
					await admin.deploy();
					payload.result.msg = "Production rebuild & launch successfully";
					break;
				case "refreshURLs":
					await admin.refreshURLs();
					payload.result.msg = "Page URLs refreshed";
					break;
			}

			payload.result.state = true;
			api.send(payload);
		},
		addPage: async (payload) => {
			let pageName = utils.validate.str(payload.data.name);

			if(pageName === false){
				payload.result.state = false;
				payload.result.msg = "Please Fill in Name field.";
				api.send(payload);
				return false;
			}

			let pages = db.collection("pages");

			let lang = i18n.getLang(payload.data.lang);
			let langID = i18n.getLangID(lang);
			let currentTime = new Date();

			let url = utils.strToURL(pageName);

			let pagePost = {
				createTime: currentTime,
				updateTime: currentTime,
				typeID: view.pageTypes.getDefaultID(), // Content Page
				langID: langID,
				url: url,
				seo: {
					title: pageName,
					description: "",
					keywords: ""
				},
				name: pageName,
				menu: true,
				default: false
			};

			let parentPage;
			if(payload.data.parentID !== undefined){
				let parentID = new mongodb.ObjectID(payload.data.parentID);
				parentPage = await pages.findOne({_id:parentID});
				if(parentPage){
					pagePost.parentID = parentPage._id;
				}
				pagePost.position = await pages.countDocuments({parentID:parentID,langID:langID});
			} else {
				pagePost.position = await pages.countDocuments({parentID:null,langID:langID});
			}

			let prefix = i18n.getPrefix(langID);
			let fullURL = (parentPage)?parentPage.fullURL:prefix;
			fullURL += "/"+url;
			pagePost.fullURL = fullURL;
			pagePost.hashID = md5(pagePost.fullURL);

			let result = await pages.insertOne(pagePost);

			payload.result.state = true;
			payload.result.link = `/admin/pages/${lang}/${result.insertedId}`;
			api.send(payload);
		},
		editPage: async (payload) => {
			let pages = await db.collection("pages");
			let page = await pages.findOne({_id:new mongodb.ObjectID(payload.data.pageID)});
			let prefix = i18n.getPrefix(page.langID);
			let parentPage;
			if(page.parentID !== undefined){
				parentPage = await db.collection("pages").findOne({_id:page.parentID});
			}
			let i,v, updated = {}, unset = {};

			// Common
			for(i in payload.data.fields.common){
				v = payload.data.fields.common[i];
				if(i === "name" && !v){
					payload.result.state = false;
					payload.result.msg = "Page must have a name";
					api.send(payload);
					return false;
				} else if(i === "url"){
					if(!v){
						v = updated.name;
					}
					v = utils.strToURL(v);
					let fullURL = (parentPage)?parentPage.fullURL:prefix;
					fullURL += "/"+v;
					if(page.fullURL !== fullURL){
						updated.url = v;
						updated.fullURL = fullURL;
						updated.hashID = md5(updated.fullURL);
					}
				} else if(!v){
					unset[i] = "";
				} else {
					updated[i] = v;
				}
			}

			// SEO
			updated.seo = payload.data.fields.seo;
			updated.content = payload.data.fields.content;
			updated.img = payload.data.fields.img;

			let result;
			if(Object.keys(unset).length){
				result = await pages.updateOne({_id:page._id},{$set:updated,$unset:unset});
			} else {
				result = await pages.updateOne({_id:page._id},{$set:updated});
			}
			payload.result.state = true;
			payload.result.msg = "Page saved successfully";
			api.send(payload);
		},
		changePageSettings: async (payload) => {
			let pages = await db.collection("pages");
			let page = await pages.findOne({_id:new mongodb.ObjectID(payload.data.pageID)});
			let updated = {};
			if(payload.data.values.menu !== undefined){
				updated.menu = payload.data.values.menu;
			}
			if(payload.data.values.default !== undefined){
				updated.default = payload.data.values.default;
				if(updated.default){
					await pages.updateMany({default:true,langID:page.langID},{$set:{default:false}});
				}
			}

			let result = await pages.updateOne({_id:page._id},{$set:updated});

			payload.result.state = true;
			payload.result.msg = "Page saved successfully";
			api.send(payload);
		},
		setPageOrder: async (payload) => {
			if(payload.data.targetID === payload.data.parentID){
				payload.result.state = false;
				payload.result.msg = "Page cannot be ordered by itself.";
				api.send(payload);
				return false;
			}
			let position,
				pos,
				siblings,
				sibling;

			let pages = await db.collection("pages");

			let parentID = new mongodb.ObjectID(payload.data.parentID);
			let parentPage = await pages.findOne({_id:parentID});
			if(!parentPage){
				payload.result.state = false;
				payload.result.msg = "Parent page not found. Please refresh this page.";
				api.send(payload);
				return false;
			}

			let targetID = new mongodb.ObjectID(payload.data.targetID);
			let targetPage = await pages.findOne({_id:targetID});
			if(!targetPage){
				payload.result.state = false;
				payload.result.msg = "Target page not found. Please refresh this page.";
				api.send(payload);
				return false;
			}

			let langID = parentPage.langID;

			let parentPageParentID = (parentPage.parentID)?parentPage.parentID.toString():false;
			let targetPageParentID = (targetPage.parentID)?targetPage.parentID.toString():false;

			switch(payload.data.position){
				case "inside":
					position = await pages.countDocuments({parentID:parentID,langID:langID});
					pages.updateOne({_id:targetID},{$set:{parentID:parentID,position:position}});
					
					post = targetPage.position;
					siblings = await pages.find({parentID:targetPage.parentID, langID:langID, position: {$gt:post}}).sort({position: 1}).toArray();
					for(sibling of siblings){
						await pages.updateOne({_id:sibling._id},{$set:{position:post}});
						post++;
					}
					break;

				case "after": case "before":
					siblings = await pages.find({parentID:parentPage.parentID, langID:langID, _id:{$ne:targetID}}).sort({position: 1}).toArray();
					pos = 0;
					for(sibling of siblings){
						if(payload.data.position === "before" && sibling._id.toString() === parentID.toString()){
							await pages.updateOne({_id:targetID},{$set:{position:pos,parentID:parentPage.parentID}});
							pos++;
						}

						await pages.updateOne({_id:sibling._id},{$set:{position:pos}});
						pos++;

						if(payload.data.position === "after" && sibling._id.toString() === parentID.toString()){
							await pages.updateOne({_id:targetID},{$set:{position:pos,parentID:parentPage.parentID}});
							pos++;
						}
					}


					if(targetPageParentID !== parentPageParentID){
						siblings = await pages.find({parentID:targetPage.parentID, langID: langID}).sort({position: 1}).toArray();
						pos = 0;
						for(sibling of siblings){
							await pages.updateOne({_id:sibling._id},{$set:{position:pos}});
							pos++;
						}
					}
					break;
			}

			await admin.refreshURL(targetID);

			payload.result.state = true;
			payload.result.msg = "Page saved successfully";
			api.send(payload);
		},
		setPageType: async (payload) => {
			let pageID = new mongodb.ObjectID(payload.data.pageID);
			let typeID = new mongodb.ObjectID(payload.data.typeID);
			db.collection("pages").updateOne({_id:pageID},{$set: {typeID:typeID}});

			payload.result.typeID = payload.data.typeID;
			payload.result.state = true;
			payload.result.msg = "Page Type changed successfully";
			api.send(payload);
		},
		savei18n: async (payload) => {
			let data;
			try {
				data = JSON.parse(payload.data.fields)
			} catch (e){
				data = false;
			}
			if(data === false){
				payload.result.state = false;
				payload.result.msg = "Data was corrupted and can't be saved";
				api.send(payload);
				return false;
			}
			let langID = i18n.getLangID(payload.data.lang);
			db.collection("i18n").replaceOne({_id:langID},data);
			payload.result.state = true;
			payload.result.msg = "Dictionary saved successfully";
			api.send(payload);

			app.message.send({method:"refresh-i18n",lang:i18n.getLang(payload.data.lang)});
			/*
			let fields = {};
			for(let index in payload.data.fields){
				let value = payload.data.fields[index];
				let path = index.split("/").splice(1);

				let section = fields;
				for(let i=0,l=path.length;i<l;i++){
					let p = path[i];
					if(i+1 === l){
						section[p] = value || "";
					} else {
						if(typeof section[p] === "undefined"){
							if(isNaN(parseInt(path[i+1],10))){
								section[p] = {};
							} else {
								section[p] = [];
							}
						}
						section = section[p];
					}
				}
			}


			let langID = i18n.getLangID(payload.data.lang);
			db.collection("i18n").replaceOne({_id:langID},fields);
			payload.result.state = true;
			payload.result.msg = "Dictionary saved successfully";
			api.send(payload);

			app.message.send({method:"refresh-i18n",lang:i18n.getLang(payload.data.lang)});
			*/
		}
	},
	refreshURLs: async(payload) => {
		let pages = await db.collection("pages").find({}).toArray();
		for(let page of pages){
			await admin.refreshURL(page._id);
		}
		return true;
	},
	refreshURL: async (targetID) => {
		let pages = await db.collection("pages");
		targetID = (typeof targetID === "object")?targetID:new mongodb.ObjectID(targetID);
		let targetPage = await pages.findOne({_id:targetID});
		let parentPage = (targetPage.parentID)?await pages.findOne({_id:targetPage.parentID}):false;

		let prefix = i18n.getPrefix(targetPage.langID);
		let fullURL = (parentPage)?parentPage.fullURL:prefix;
			fullURL += "/"+targetPage.url;
		if(targetPage.fullURL !== fullURL){
			await pages.updateOne({_id:targetID},{$set:{fullURL:fullURL,hashID:md5(fullURL)}});
			
			// Fix childs
			let result = await pages.find({parentID:targetID}).toArray();
			if(result){
				for(let page of result){
					await admin.refreshURL(page._id);
				}
			}
		}
		return true;
	},
	createSprites: () => {
		return new Promise((resolve) => {
			let spriter = new SVGSpriter({
				mode: {
					view: true
				},
				shape: {
					spacing: {
						padding: 0
					}
				}
			});
			let path = "img/ui.src";
			fs.readdirSync(path, {withFileTypes: true}).forEach(dirent => {
				if(dirent.isFile()){
					let filePath = path+"/"+dirent.name;
					let file = fs.readFileSync(filePath);
					let fileName = dirent.name;
					spriter.add(workDir.replace("sandbox","")+filePath, null, file);
				}
			});

			spriter.compile((error, result) => {
				let svg = result.view.sprite.contents.toString();
				
				let sizes = svg.match(/svg width="(\d+)" height="(\d+)"/);
				let size = Math.max(parseInt(sizes[1],10),parseInt(sizes[2],10));
				svg = svg.replace(/svg width="(\d+)" height="(\d+)"/,`svg width="${size}" height="${size}"`);

				fs.writeFileSync("sandbox/public/ui.svg", svg);
				resolve(true);
			});
		});
	},
	deploy: async () => {
		if (!fs.existsSync("prod")) {
			fs.mkdirSync("prod");
		}

		// Refresh Sprites
		await admin.createSprites();

		await minify("sandbox/assets/js/app.js", {to: "sandbox/public/app.js"});
		await minify("sandbox/assets/css/app.scss", {to: "sandbox/public/app.css"});

		let css = fs.readFileSync("sandbox/public/app.css").toString();
			css = css.replace(/\/ui.svg/g,`/ui.svg?${conf.assets.ui}`);
		fs.writeFileSync("sandbox/public/app.css", css, "utf8");

		// Call Deploy module if exists
		await modules.deploy();

		execSync("rsync -avc --delete sandbox/public/ prod/public/");
		execSync("rsync -avc --delete sandbox/app/ prod/app/");
		execSync("rsync -avc --delete sandbox/modules/ prod/modules/");
		execSync("rsync -avc --delete sandbox/views/ prod/views/");


		let tpls = utils.getFilesList(`${conf.sys.root}/prod/views/`);
		// for(let i=0,l=tpls.length;i<l;i++){
		for(let tpl of tpls){
			// let tpl = tpls[i];
			await minify(tpl,{to:tpl});
		}


		for(let moduleID in modules.list){
			let moduleItem = modules.list[moduleID];
			if(moduleID === "sitemap"){
				continue;
			}
			let path = moduleItem._path.replace("sandbox","prod")+"/views/";
			let tpls = utils.getFilesList(path);
			
			for(let tpl of tpls){
				await minify(tpl,{to:tpl});
			}
		}

		// Update Production Version
		await db.collection("settings").updateOne({name:"assets"}, {$inc: {ver:1}});

		// Drop and Clone Collection
		await admin.cloneCollection("i18n");
		await admin.cloneCollection("pageTypes");
		await admin.cloneCollection("pages");
		await admin.cloneCollection("settings");

		// Then star Production Screen
		execSync("./restart");		
	},
	cloneCollection: async (collectionName) => {
		let collection = await prodDB.listCollections({name:collectionName}).toArray();
		if(collection.length){
			prodDB.collection(collectionName).drop();
		}

		let documents = await db.collection(collectionName).find({}).toArray();
		await prodDB.collection(collectionName).insertMany(documents);
	}
};
admin.control = require("./admin.control");
admin.init();
module.exports = admin;