content.i18n = {
	init: () => {
		$("#i18n > form").on("submit", content.i18n.go);
		$("#i18n > form > .fn > .wrap > button").hover();
		$("#i18n > form .list > .item > .info > .i").hover().click(content.i18n.open);
		for(let id in db.data.i18n){
			let item = $(`#i18n > form .list > .item[data-id="${id}"]`);
			item.addClass("open");
			item.find(">.list").show();
		}
	},
	open(e){
		let t = $(this);
		let item = t.parent(".item");
		let itemID = item.getAttr("data-id");
		let list = item.find(">.list");
		if(item.hasClass("open")){
			item.removeClass("open");
			list.slideUp();
			delete db.data.i18n[itemID];
		} else {
			item.addClass("open");
			list.slideDown();
			db.data.i18n[itemID] = true;
		}
	},
	go(e){
		let post = {
			class: "admin",
			method: "savei18n",
			data: {
				langID: $("#i18n").getAttr("data-lang"),
				fields: {}
			}
		};
		$("#i18n > form .list > .item.endPoint").each((el) => {
			let t = $(el);
			post.data.fields[t.getAttr("data-id")] = t.find(">input,>textarea").val();
		});

		ws.req(post);
		
		e.preventDefault();
		e.stopPropagation();
	}
};