content.pageTypes = {
	init: () => {
		if(!$("#pageTypes").length){
			return false;
		}

		$("#pageTypes > .add > .open").click(content.pageTypes.showAddForm);
		$("#pageTypes > .add > .wrap > form > .cancel").click(content.pageTypes.showAddForm);
		$("#pageTypes > .add > .wrap > form").on("submit",content.pageTypes.addType);
		$("#pageTypes>form").on("submit",admin.saveTypes);
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
	addType(e){
		e.preventDefault();
		e.stopPropagation();
	}
};