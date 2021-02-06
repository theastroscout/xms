var app = {
	get: (currentPage) => {
		let tpl = view.getTpl("/modules/footer/views/footer");
		let data = {
			copy: `&copy; ${conf.project.name}`
		};
		tpl = view.parseValues(tpl,data);
		return tpl;
	}
};
module.exports = app;