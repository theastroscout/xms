var app = {
	get: (currentPage) => {
		let tpl = view.getTpl("/modules/sys/header/views/header");
		let data = {
			name: conf.project.name,
			desc: conf.project.desc
		};
		tpl = view.parseValues(tpl,data);
		return tpl;
	}
};
module.exports = app;