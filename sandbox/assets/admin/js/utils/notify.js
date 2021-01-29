var notify = {
	init: () => {
		notify.wrap = $("#notify>.wrap");
	},
	tmo: null,
	show: (data) => {
		clearTimeout(notify.tmo);
		notify.wrap.html(data.msg);
		ui.bro.addClass("notify");
		notify.tmo = setTimeout(() => {
			ui.bro.removeClass("notify");
		}, 2500);
	}
};