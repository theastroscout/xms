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
	get: async (url, cookies, rewriteParams) => {
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
				currentPage.isAdmin = true;
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
			}

		} else {
			/*

			Content

			*/
			currentPage = await db.collection("pages").findOne({hashID:md5(url)});
			if(currentPage){
				let pageType = view.pageTypes.get(currentPage.typeID);
				if(pageType.module !== undefined
					&& modules.list[pageType.module] !== undefined
					&& typeof modules.list[pageType.module].getPage === "function"){
					
					currentPage.rewriteParams = rewriteParams;
					currentPage.cookies = cookies;
					let modulePage = await modules.list[pageType.module].getPage(currentPage);
					if(modulePage !== false){
						pageData = modulePage;
					}
				} else {
					pageData.seo = currentPage.seo;
					pageData.content = view.getTpl(pageType.tpl);
					if(currentPage.content){
						let content = marked(currentPage.content);
						pageData.content = view.parseValues(pageData.content,{content:content});
					}
				}
			} else {
				// Not Found
				let rules = modules.getRules();
				if(rules){
					for(let re of rules){
						let r = url.match(new RegExp(re.in));
						if(r !== null){
							if(typeof re.out === "string"){
								let newURL = url.replace(new RegExp(re.in),re.out);
								return await view.get(newURL,cookies,r);
							} else {
								customPageData = await re.out(url, r);
								if(customPageData){
									pageData.seo = customPageData.seo;
									pageData.content = customPageData.content;
								}
							}
							break;
						}
					}
				}

				if(currentPage === null || currentPage === undefined){
					currentPage = {
						langID: i18n.getLangID(lang)
					};
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

		currentPage.rewriteParams = rewriteParams;
		currentPage.cookies = cookies;
		pageData.assets = await view.getAssets(currentPage);

		if(modules.list.view !== undefined && typeof modules.list.view.getPageData === "function"){
			pageData = Object.assign(pageData, await modules.list.view.getPageData(currentPage) || {});
		}

		pageData.content = await view.parseModules(pageData.content, currentPage);
		tpl = await view.parseModules(tpl, currentPage);
		output.layout = view.parseValues(tpl,pageData);
		return output;
	},
	/*

	Get Assets

	*/
	getAssets: async (currentPage) => {
		let i;
		let data = {
			css: "",
			js: ""
		};
		let assets = utils.copyObj((currentPage.isAdmin === undefined)?conf.assets.web:conf.assets.admin);

		if(modules.list.view !== undefined && typeof modules.list.view.getAssets === "function"){
			let custom = await modules.list.view.getAssets(currentPage);
			assets.js = [...assets.js, ...custom.js];
			assets.css = [...assets.css, ...custom.css];
		}

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
			tpl = i18n.translate(tpl, currentPage.langID);
			return tpl;
		}

		for(let moduleName of modulesList){
			moduleName = moduleName.replace(/\{\{([^}]*)\}\}/,"$1");
			
			let moduleItem = await modules.get(moduleName, currentPage);
			if(moduleItem){
				moduleItem = await view.parseModules(moduleItem, currentPage);
				tpl = tpl.replace(`{{${moduleName}}}`, moduleItem);
			} else {
				let moduleTpl = view.getTpl(moduleName);
				if(moduleTpl !== false){
					tpl = tpl.replace(`{{${moduleName}}}`,moduleTpl);
				}
			}
		}

		tpl = i18n.translate(tpl, currentPage.langID);

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
	},
	clearValues: (tpl) => {
		if(typeof tpl !== "string"){
			return tpl;
		}
		let values = tpl.match(/\{([^}]*)\}/g);
		if(values === null){{
			return tpl;
		}
		for(let value of values){
			tpl = tpl.replace(`{${value}}`,"");
		}
		return tpl;
	}
};
view.pages = require("./view.pages");
view.init();
module.exports = view;