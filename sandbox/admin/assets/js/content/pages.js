content.pages = {
	init: () => {
		if(!$("#pages").length){
			return false;
		}
		$("#pages > .add > .open").click(content.pages.showAddForm);
		$("#pages > .add > .wrap > form > .cancel").click(content.pages.showAddForm);
		$("#pages > .add > .wrap > form").on("submit",admin.addPage);

		$("#pages>.list .item>.page>.fn>.add").click(content.pages.add.show);

		$("#pages>.list .item>.page").on("dragstart dragover dragleave drop", content.pages.drag.go);
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
	add: {
		el: `<div class="add">
				<form>
					<input type="text" />
					<button type="submit" data-btn>Add</button>
					<div class="cancel" data-btn data-sub>Cancel</div>
				</form>
			</div>`,
		show(e){
			let t = $(this);
			let item = t.parent(".item");
			let addEl = item.find(">.add");
			if(!addEl.length){
				item.find(">.page").after(content.pages.add.el);
				addEl = item.find(">.add");
				addEl.find(">form").on("submit", admin.addPage);
				addEl.find(">form>.cancel").hover().click(content.pages.add.show);
			}
			if(item.hasClass(".addOpened")){
				item.removeClass(".addOpened");
				addEl.slideUp();
			} else {
				item.addClass(".addOpened");
				addEl.slideDown();
			}
		}
	},
	drag: {
		go(e){
			let t, position;
			switch(e.type){
				case "dragstart":
					content.pages.drag.targetID = $(this).parent(".item").getAttr("data-id");
					break

				case "dragover":
					t = $(this);
					clearTimeout(this.tmo);
					t.addClass("dragover")
					let perc = (e.clientY - t.get(0).getBoundingClientRect().y)/t.height();
						perc = Math.max(0,Math.min(perc,1));
					if(perc > .7){
						position = "after";
					} else if(perc < .3){
						position = "before";
					} else {
						position = "inside";
					}
					t.parent(".item").setAttr("data-position",position);
					e.preventDefault();
					e.stopPropagation();
					break;

				case "dragleave":
					t = $(this)
					this.tmo = setTimeout(() => {
						t.removeClass("dragover");
						t.parent(".item").removeAttr("data-position");
					},50)
					break;

				case "drop":
					t = $(this);
					let item = t.parent(".item");
					position = item.getAttr("data-position");
					t.removeClass("dragover");
					item.removeAttr("data-position");
					let post = {
						class: "admin",
						method: "setPageOrder",
						data: {
							targetID: content.pages.drag.targetID,
							parentID: item.getAttr("data-id"),
							position: position
						}
					};
					api.req(post);
					break;
			}
		}
	}
};