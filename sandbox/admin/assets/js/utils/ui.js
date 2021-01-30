var ui = {
	init: () => {
		ui.bro = $("body");
		$("#aside>.block>.list>.item>a").hover();
		$("[data-btn]").hover();
	},
	switch(e){
		let t = (e.type)?$(this):e;
		if(t.hasClass("selected")){
			t.removeClass("selected");
			return false;
		} else {
			t.addClass("selected");
			return true;
		}
	}
};