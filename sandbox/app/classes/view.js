var view = {
	pageTypes: {
		list: {},
		init: async () => {
			let resp = await db.collection("pageTypes").find({}).toArray();
			for(let item of resp){
				view.pageTypes.list[item._id] = item;
				if(item.default){
					view.pageTypes.default = item;
				}
			}
			// console.log("Page Types:",view.pageTypes.list);
		},
		getDefault: () => {
			return view.pageTypes.default;
		},
		getDefaultID: () => {
			return view.pageTypes.default._id;
		},
		get: (typeID) => {
			let type = view.pageTypes.list[typeID];
			if(type === undefined){
				type = view.pageTypes.default;
			}
			return type;
		}
	},
	init: async () => {
		view.pageTypes.init();
	},
	get: async (url) => {
		let output = {
			redirect: false,
			layout: "Not Found"
		};

		let currentPage, content;
		let params = [];

		let tpl = view.getTpl("/views/default");

		let lang = i18n.getPageLang(url);
		let clearURL = url.replace(new RegExp(`^/${lang}`),"");
		let urlChunks = clearURL.split("/");

		let pageData = {
			site: conf.project,
			lang: {
				name: lang
			}
		};

		let contentData = {};


		/*

		Control Panel

		*/
		if(DEV && clearURL.match(/^\/admin/)){
			if(urlChunks[2] === "pages" && urlChunks[3] !== undefined){
				if(urlChunks[3] !== "types"){
					params.push(urlChunks[3]);
					clearURL = "/admin/pages";

					if(urlChunks[4] !== undefined){
						params.push(urlChunks[4]);
						clearURL = "/admin/pages/page";
					}
				}
			} else if(urlChunks[2] === "i18n"){
				params.push(urlChunks[3]);
				clearURL = "/admin/i18n";				
			}
			let currentLang = i18n.getLang(params[0]);
			currentPage = await admin.control.getCurrentPage(clearURL);

			if(currentPage){
				pageData.assets = view.getAssets(true);
				pageData.seo = currentPage.seo;
				pageData.title = currentPage.title;
				pageData.menu = currentPage.menu;
				tpl = view.getTpl("/admin/views/default");

				pageData.content = view.getTpl(currentPage.tpl);

				switch(clearURL){
					case "/admin":
						
						break;

					case "/admin/pages":
						let pages = await admin.control.getPages(currentLang);
						pageData.title += ` (${pages.count})`;
						contentData = {
							lang: currentLang,
							languages: admin.control.getLanguages(clearURL, currentLang),
							pages: pages
						};
						break;

					case "/admin/pages/page":
						let page = await admin.control.getPage(params[1]);
						if(!page){
							pageData.title = pageData.seo.title = "Page Not Found";
							pageData.content = "";
							break;
						}
						pageData.title = page.name;
						pageData.seo.title = page.name +" • "+ admin.data.name;

						contentData = page;
						break;

					case "/admin/pages/types":
						contentData = await admin.control.getPageTypes();
						break;

					case "/admin/i18n":
						contentData = {
							lang: currentLang,
							languages: admin.control.getLanguages(clearURL, currentLang),
							data: await admin.control.i18n.get(currentLang)
						}
						break;
				}

				pageData.content = view.parseValues(pageData.content,contentData);
			} else {
				pageData.assets = view.getAssets();
			}
		} else {
			/*

			Content

			*/
			pageData.assets = view.getAssets();
			currentPage = await db.collection("pages").findOne({hashID:md5(url)});
			if(currentPage){
				pageData.seo = currentPage.seo;
				let pageType = view.pageTypes.get(currentPage.typeID);
				pageData.content = view.getTpl(pageType.tpl);
				if(currentPage.content){
					let content = marked(currentPage.content);
					pageData.content = view.parseValues(pageData.content,{content:content});
				}
			}
		}

		if(pageData.content === undefined){
			// Not Found
			output.state = false;
			pageData.content = "Not Found";
		} else {
			output.state = true;
		}

		if(modules.list.view !== undefined && typeof modules.list.view.app.getPageData === "function"){
			pageData = Object.assign(pageData, await modules.list.view.app.getPageData(currentPage) || {});
		}


		pageData.content = await view.parseModules(pageData.content, currentPage);
		tpl = await view.parseModules(tpl, currentPage);
		output.layout = view.parseValues(tpl,pageData);
		return output;
	},
	/*

	Get Assets

	*/
	getAssets: (isAdmin) => {
		let i;
		let data = {
			css: "",
			js: ""
		};
		let assets = (isAdmin === undefined)?conf.assets.web:conf.assets.admin;
		for(i of assets.css){
			data.css += `<link rel="stylesheet" type="text/css" href="${i}" />`;
		}
		for(i of assets.js){
			data.js += `<script src="${i}"></script>`;
		}
		return data;
	},
	/*

		Tpls

	*/
	tpls: {},
	getTpl: (path) => {
		let fullPath = workDir+path+".html";

		if(view.tpls[fullPath] === undefined || DEV){
			if(fs.existsSync(fullPath)){
				view.tpls[fullPath] = fs.readFileSync(fullPath).toString();
			} else {
				view.tpls[fullPath] = false;
			}
		}
		return view.tpls[fullPath];
	},
	/*

	Parse

	*/
	parseModules: async (tpl, currentPage) => {
		if(!tpl){
			return tpl;
		}
		let modulesList = tpl.match(/\{\{([^}]*)\}\}/g);
		if(!modulesList){
			return tpl;
		}

		for(let moduleName of modulesList){
			moduleName = moduleName.replace(/\{\{([^}]*)\}\}/,"$1");
			
			let moduleItem = await modules.get(moduleName, currentPage);
			if(moduleItem){
				moduleItem = await view.parseModules(moduleItem, currentPage);
				tpl = tpl.replace(`{{${moduleName}}}`, moduleItem);
			} else {
				let moduleTpl = view.getTpl(`/views/modules/${moduleName}`);
				if(moduleTpl !== false){
					tpl = tpl.replace(`{{${moduleName}}}`,moduleTpl);
				}
			}
		}

		return tpl;
	},
	parseValues: (tpl,values,prefix="") => {
		if(!tpl){
			return tpl;
		}
		for(var i in values){
			let item = values[i];
			if(typeof item === "object"){
				tpl = view.parseValues(tpl,item,`${prefix}${i}/`);
			} else {
				if(item === false){
					item = "";
				}
				let reg = new RegExp(`{${prefix}${i}}`,"g");
				tpl = tpl.replace(reg,item);
			}
		}

		return tpl;
	}
};
view.pages = require("./view.pages");
view.init();
module.exports = view;