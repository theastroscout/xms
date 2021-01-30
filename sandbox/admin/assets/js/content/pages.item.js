content.page = {
	init: () => {
		if(!$("#page").length){
			return false;
		}
		$('#page>form>.settings>.fields>.item').hover().click(content.page.changeSettings);
		$("#page>form").on("submit", content.page.edit);
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

		ws.req(post);
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
		ws.req(post)
	}
};