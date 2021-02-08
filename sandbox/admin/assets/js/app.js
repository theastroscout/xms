import "../../../../node_modules/@hqdaemon/qx/src/qx.js";
import "utils/db";
import "utils/utils";
import "utils/ui";
import "utils/notify";
import "utils/api";
import "admin";

var content = {};
import "content/home";
import "content/pages";
import "content/pages.types";
import "content/pages.item";
import "content/i18n";

var app = {
	init: () => {
		db.init();
		ui.init();
		notify.init();
		api.init();
		for(let c in content){
			if(typeof content[c] !== "undefined" && typeof content[c].init === "function"){
				content[c].init();
			}
		}
	}
};
document.addEventListener("DOMContentLoaded", app.init);