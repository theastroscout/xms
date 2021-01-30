let control = {
	getLanguages: (url, lang) => {
		let itemTpl = view.getTpl("/../admin/views/snippets/lang.item");
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
		let blockTpl = view.getTpl("/../admin/views/snippets/menu.block");
		let itemTpl = view.getTpl("/../admin/views/snippets/menu.item");
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
				sub = `<div class="sub"><a href="/admin/pages/types">Page Types</a><a href="/admin/pages">In English</a><a href="/admin/pages/ru">По русски</a><a href="/admin/pages/de">Auf Deutsch</a></div>`;
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
		list.push(view.parseValues(itemTpl,{name:"Sandbox", link: `https://${conf.sys.host}`, target:'target="_blank"', active: false}));
		list.push(view.parseValues(itemTpl,{name:"Production", link: `https://${prodConf.sys.host}`, target:'target="_blank"', active: false}));

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
		let itemTpl = view.getTpl("/../admin/views/snippets/pages.list.item");
		for(var i in page.pages){
			let item = page.pages[i];
			let updateTime = moment.tz(item.page.updateTime,"Europe/Moscow").format("ddd, MMM Do YYYY LT");
			let data = {
				id: item.page._id.toString(),
				link: `/admin/pages/${item.lang}/${item.page._id}`,
				name: item.page.name + ` (${item.page.position})`,
				updateTime: updateTime,
				fullURL: item.page.fullURL
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
		console.log("Pages",page);
		if(!page){
			return false;
		}

		let output = {
			id: page._id.toString(),
			name: page.name,
			h1: page.h1 || false,
			url: page.url,
			fullURL: page.fullURL,
			seo: {
				title: page.seo.title || false,
				description: page.seo.description || false,
				keywords: page.seo.keywords || false
			},
			menu: (page.menu)?"selected":"",
			default: (page.default)?"selected":"",
			content: page.content || false
		};

		return output;
	},
	getPageTypes: async() => {
		let output = {
			list: []
		};

		let itemTpl = view.getTpl("/../admin/views/snippets/pages.types.item");

		let result = await db.collection("pageTypes").find({}).toArray();
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
	}
};
module.exports = control;