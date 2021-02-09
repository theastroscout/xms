content.page = {
	init: () => {
		if(!$("#page").length){
			return false;
		}
		$('#page>form>.settings>.fields>.item').hover().click(content.page.changeSettings);
		$("#page>form").on("submit", content.page.edit);

		$("#page>form>.types>.tit").click(content.page.showTypes);
		$("#page>form>.types>.list>.item").hover().click(content.page.setType);
	},
	edit(e){
		let post = {
			class: "admin",
			method: "editPage",
			data: {
				pageID: $("#page").getAttr("data-id"),
				fields: {}
			}
		};
		$("#page>form>.block").each((el) => {
			let t = $(el);
			let blockName = t.getAttr("data-type");
			if(post.data.fields[blockName] === undefined){
				post.data.fields[blockName] = {};
			}
			t.find("input,textarea").each((input) => {
				post.data.fields[blockName][input.name] = input.value;
			});
		});

		post.data.fields.content = $("#page>form>.content>textarea").val();

		api.req(post);
		e.preventDefault();
		e.stopPropagation();
	},
	changeSettings(e){
		let t = $(this);
		let post = {
			class: "admin",
			method: "changePageSettings",
			data: {
				pageID: $("#page").getAttr("data-id"),
				values: {}
			}
		};
		post.data.values[t.getAttr("data-type")] = ui.switch(t);
		api.req(post)
	},
	showTypes(e){
		let block = $("#page>form>.types");
		let items = block.find(">.list>.item:not(.active)");
		if(block.hasClass("opened")){
			block.removeClass("opened");
			items.slideUp();
		} else {
			block.addClass("opened");
			items.slideDown();
		}
	},
	setType(e){
		let t = $(this);
		if(t.hasClass("active")){
			return false;
		}
		let post = {
			class: "admin",
			method: "setPageType",
			data: {
				pageID: $("#page").getAttr("data-id"),
				typeID: t.getAttr("data-id")
			}
		};
		api.req(post);
	}
};