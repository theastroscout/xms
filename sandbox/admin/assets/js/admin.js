var admin = {
	init: () => {
		
	},
	methods: {
		addPage: (payload) => {
			if(payload.state === false){
				notify.show(payload);
			} else {
				location.href = payload.link;
			}
		},
		editPage: (payload) => {
			notify.show(payload);
		},
		changePageSettings: (payload) => {
			notify.show(payload);
		},
		setPageOrder: (payload) => {
			if(payload.state === false){
				notify.show(payload);
			} else {
				location.reload();
			}
		}
	},
	addPage(e){
		let form = $(this);
		let post = {
			class: "admin",
			method: "addPage",
			data: {
				lang: $("#pages").getAttr("data-lang"),
				name: form.find("input").val()
			}
		};
		let item = form.parent(".item");
		if(item.length){
			post.data.parentID = item.getAttr("data-id");
		}
		ws.req(post);
		e.preventDefault();
		e.stopPropagation();
	},
	saveTypes(e){
		let form = $(this);
		let post = {
			class: "admin",
			method: "saveTypes",
			data: {}
		};
		console.log(post);
		e.preventDefault();
		e.stopPropagation();
	}
};