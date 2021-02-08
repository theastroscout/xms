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

		$("#i18n>form .list>.item>.info>.fn>.btn").click(content.i18n.fn);

		$("#i18n > .add > .open").click(content.i18n.showAddForm);
		$("#i18n > .add > .wrap > form > .cancel").click(content.i18n.showAddForm);
		$("#i18n > .add > .wrap > form").on("submit",content.i18n.addNode);
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
		/*
		let post = {
			class: "admin",
			method: "savei18n",
			data: {
				lang: $("#i18n").getAttr("data-lang"),
				fields: {}
			}
		};
		$("#i18n > form .list > .item.endPoint").each((el) => {
			let t = $(el);
			post.data.fields[t.getAttr("data-id")] = t.find(">input,>textarea").val();
		});

		api.req(post);
		*/

		let post = {
			class: "admin",
			method: "savei18n",
			data: {
				lang: $("#i18n").getAttr("data-lang"),
				fields: $("#i18n>form>textarea").val()
			}
		};
		api.req(post);
		
		e.preventDefault();
		e.stopPropagation();
	},
	fn(e){
		let t = $(this);
		let type = t.getAttr("data-type");
		let item = t.parent(".item");
		if(type === "remove"){
			item.slideUp("remove");
		} else {
			item.removeClass("endPoint");
			item.find(">input").remove();
		}
	},
	showAddForm(e){
		let block = $(this).parent(".add");
		let open = block.find(">.open");
		let form = block.find(">.wrap");
		if(block.hasClass("opened")){
			block.removeClass("opened");
			form.slideUp();
			open.slideDown();
		} else {
			block.addClass("opened");
			form.slideDown();
			open.slideUp();
		}
	},
	addNode(e){
		let form = $(this);
		let nodeName = form.find("input").val().trim().toLowerCase();
		let nodeID = $("#i18n").getAttr("data-lang")+"/"+nodeName;
		// console.log("Add Node:", nodeName)
		$("#i18n>form>.list").append(content.i18n.getNode(nodeID,nodeName));
		e.preventDefault();
		e.stopPropagation();
		let createdEl = $(`#i18n>form>.list>.item[data-id="${nodeID}"]`);
		createdEl.find(">.info>.fn>.btn").hover().click(content.i18n.fn);
		createdEl.get(0).scrollIntoView({behavior: "smooth"});
	},
	getNode: (nodeID,nodeName) => {
		return `<div class="item endPoint" data-id="${nodeID}">
			<div class="info">
				<div class="i"></div>
				<div class="n">${nodeName}</div>
				<div class="fn">
					<div class="btn" data-type="add" data-btn="" data-sub="">+ Add</div>
					<div class="btn" data-type="remove" data-btn="" data-sub="">Remove</div>
				</div>
			</div>
			<input type="text" value="">
		</div>`
	}
};