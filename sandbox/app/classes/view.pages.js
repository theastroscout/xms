var pages = {
	get: async (lang) => {
		let output = {
			count: 0,
			list: {}
		};

		let langID = i18n.getLangID(lang);
		let result = await db.collection("pages").find({langID:langID}).sort({position: 1}).toArray();

		let pageList = {
			pages: {}
		};

		let preserveList = {
			pages: {}
		};

		for(let page of result){
			output.count++;
			let pageData = {
				lang: lang,
				page: page,
				pages: {}
			};

			if(page.parentID){
				let preserveData = pages.findPage(preserveList, page._id);
				if(preserveData){
					pageData.pages = preserveData.pages;
				}

				let parentPage = pages.findPage(pageList, page.parentID);
				if(parentPage){
					parentPage.pages[page._id] = pageData;
				} else {
					parentPage = pages.findPage(preserveList, page.parentID);
					if(parentPage){
						parentPage.pages[page._id] = pageData;
					} else {
						preserveList.pages[page.parentID] = {
							pages: {}
						};
						preserveList.pages[page.parentID].pages[page._id] = pageData;
					}
				}
			} else {
				let preserveData = pages.findPage(preserveList, page._id);
				if(preserveData){
					pageData.pages = preserveData.pages;
				}
				pageList.pages[page._id] = pageData;
			}
		}
		output.list = pageList;
		return output;
	},
	findPage: (page, parentID) => {
		if(page.pages[parentID]){
			return page.pages[parentID];
		}
		for(let pageID in page.pages){
			let item = page.pages[pageID];
			if(Object.keys(item.pages).length) {
				let targetParent = pages.findPage(item, parentID);
				if(targetParent){
					return targetParent;
				}
			}
		}
		return false;
	}
};
module.exports = pages;