const fs = require("fs");
var restore = {
	list: {
		files: [
			"init",
			"restart",
			"sandbox/admin/views/modules/head.html",
			"sandbox/views/modules/head.html"
		],
		dirs: [
			"conf",
			"nginx",
			"img/favicon"
		]
	},
	init: async () => {
		for(let file of restore.list.files){
			await restore.unlink(file);
		}
		for(let dir of restore.list.dirs){
			fs.rmdirSync(dir, { recursive: true });
		}
		console.log("Repo restored\n");
	},
	unlink: async (file) => {
		try {
			fs.unlinkSync(file);
		} catch (e) {
			// Continue
		}
		return true;
	}
};
restore.init();