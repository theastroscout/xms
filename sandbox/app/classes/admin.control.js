let control = {
	getLanguages: (url, lang) => {
		let itemTpl = view.getTpl("/admin/views/snippets/lang.item");
		let list = [];
		
		for(let id in i18n.list){
			let item = i18n.list[id];
			let link = url + (item.prefix?"/":"")+item.prefix;
			let itemData = {
				name: item.fullName,
				active: (id === lang)?"active":false,
				link: link
			};
			list.push(view.parseValues(itemTpl,itemData));
		}

		return list.join("");
	},
	getCurrentPage: (url) => {
		let blockTpl = view.getTpl("/admin/views/snippets/menu.block");
		let itemTpl = view.getTpl("/admin/views/snippets/menu.item");
		let blocks = [];
		let list = [];

		let currentPage;

		let pages = {};
		for(let link in admin.data.pages){
			let page = admin.data.pages[link];
			let active = false;
			if(url === link){
				active = "active";
				currentPage = page;
			}

			let sub;
			if(link === "/admin/pages"){
				// sub = `<div class="sub"><a href="/admin/pages/types">Page Types</a><a href="/admin/pages">In English</a><a href="/admin/pages/ru">По русски</a><a href="/admin/pages/de">Auf Deutsch</a></div>`;
				sub = false;
			} else {
				sub = false;
			}
			
			let pageData = {
				name: page.name,
				link: link,
				active: active,
				target: false,
				sub: sub
			};
			if(active && page.parentID !== undefined){
				pages[page.parentID].active = "active";
			} else if(page.inMenu === undefined){
				pages[link] = pageData;
			}
		}

		for(let i in pages){
			list.push(view.parseValues(itemTpl,pages[i]));
		}

		if(currentPage === undefined){ // Not Found
			return false;
		}

		blocks.push(view.parseValues(blockTpl,{
			name: "Menu",
			list: list.join("")
		}));

		list = [];
		list.push(view.parseValues(itemTpl,{name:"Sandbox", link: `https://${conf.sys.host}`, target:'target="_blank"', active: false, sub: false}));
		list.push(view.parseValues(itemTpl,{name:"Production", link: `https://${prodConf.sys.host}`, target:'target="_blank"', active: false, sub: false}));

		blocks.push(view.parseValues(blockTpl,{
			name: "Source",
			list: list.join("")
		}));

		return {
			title: currentPage.title,
			seo: {
				title: currentPage.title +" • "+ admin.data.name
			},
			menu: blocks.join(""),
			tpl: currentPage.tpl
		};
	},
	getPages: async (lang) => {
		let output = {
			count: 0,
			list: []
		};

		let pages = await view.pages.get(lang);
		output.count = pages.count;
		output.list = admin.control.getPagesLayout(pages.list);

		if(output.list.length){
			output.list = output.list.join("");
		} else {
			output.list = '<div class="empty">Pages Not Found</div>';
		}
		return output;
	},
	findPage: (page, parentID) => {
		if(page.pages[parentID]){
			return page.pages[parentID];
		}
		for(let pageID in page.pages){
			let item = page.pages[pageID];
			if(Object.keys(item.pages).length) {
				let targetParent = dev.findPage(item, parentID);
				if(targetParent){
					return targetParent;
				}
			}
		}
		return false;
	},
	getPagesLayout: (page) => {
		let list = [];
		let itemTpl = view.getTpl("/admin/views/snippets/pages.list.item");
		for(var i in page.pages){
			let item = page.pages[i];
			let updateTime = moment.tz(item.page.updateTime,"Europe/Moscow").format("ddd, MMM Do YYYY LT");
			let data = {
				id: item.page._id.toString(),
				link: `/admin/pages/${item.lang}/${item.page._id}`,
				name: item.page.name + ` (${item.page.position})`,
				updateTime: updateTime,
				fullURL: item.page.fullURL.replace("/home","") || "/"
			};
			if(Object.keys(item.pages).length){
				data.subSwitch = '<div class="sub"><div class="i"></div></div>';
				data.pages = `<div class="pages">${admin.control.getPagesLayout(item).join("")}</div>`;
			} else {
				data.subSwitch = false;
				data.pages = false;
			}
			let el = view.parseValues(itemTpl,data)
			list.push(el);
		}
		return list;
	},
	getPage: async (pageID) => {
		let page = await db.collection("pages").findOne({_id: new mongodb.ObjectID(pageID)});
		if(!page){
			return false;
		}

		let pageTypes = [];
		let pageTypeTpl = view.getTpl("/admin/views/snippets/page.types.item");

		for(let i in view.pageTypes.list){
			let item = view.pageTypes.list[i];
			let pageTypeData = {
				active: (item._id.toString() === page.typeID.toString())?"active":"",
				id: item._id.toString(),
				name: item.name,
				desc: item.desc
			};
			pageTypes.push(view.parseValues(pageTypeTpl,pageTypeData));
		}

		let output = {
			id: page._id.toString(),
			name: page.name,
			h1: page.h1 || false,
			url: page.url,
			fullURL: page.fullURL.replace("/home","") || "/",
			seo: {
				title: page.seo.title || false,
				description: page.seo.description || false,
				keywords: page.seo.keywords || false
			},
			menu: (page.menu)?"selected":"",
			default: (page.default)?"selected":"",
			pageTypes: pageTypes.join(""),
			content: page.content || false,
			img: page.img || false
		};

		return output;
	},
	getPageTypes: async () => {
		let output = {
			list: []
		};

		let itemTpl = view.getTpl("/admin/views/snippets/pages.types.item");

		let result = await db.collection("pageTypes").find({}).sort({name:1}).toArray();
		if(result){
			for(let type of result){
				let itemData = {
					id: type._id.toString(),
					name: type.name,
					tpl: type.tpl
				};
				output.list.push(view.parseValues(itemTpl,itemData));
			}
		}

		output.list = output.list.join("");
		return output;
	},
	i18n: {
		get: async (lang) => {

			let dict = utils.copyObj(i18n.getLangObj(lang));
				delete dict._id;
			return JSON.stringify(dict, null, "\t");
			/*
			control.i18n.tpl = view.getTpl("/admin/views/snippets/i18n.item");
			let dict = i18n.getLangObj(lang);
			let list = control.i18n.list(lang, dict);
			return list;
			*/

			// return JSON.stringify(dict);
			/*
			control.i18n.tpl = view.getTpl("/admin/views/snippets/i18n.item");
			let dict = i18n.getLangObj(lang);
			return 
			let list = control.i18n.list(lang, dict);
			return list;
			*/
		},
		list: (path, dict) => {
			let list = [];
			for(let name of Object.keys(dict)){
				if(name.match(/id$/)){
					continue;
				}
				let itemPath = path+"/"+name;
				let value = dict[name];
				let subList = false;
				let endPoint = "endPoint";
				if(typeof value === "object"){
					subList = control.i18n.list(itemPath, value);
					endPoint = "";
					value = false;
				}
				/* else {
					subList = (value.length < 120)?`<input type="text" value="${value}"/>`:`<textarea>${value}</textarea>`;
				}
				*/

				let tpl = view.parseValues(control.i18n.tpl,{
					id: itemPath,
					endPoint: endPoint,
					name: name,
					value: value,
					list: subList
				});
				list.push(tpl);
			}
			return `<div class="list">${list.join("")}</div>`;
		}
	}
};
module.exports = control;