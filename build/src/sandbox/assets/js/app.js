var modules = {}
import "../../../node_modules/@hqdaemon/qx/src/qx.js";
import "utils";
import "ui";
import "api";
import "../../modules/custom/account/assets/account.js";

var app = {
	init: () => {
		ui.init();
		api.init();

		let modulesList = Object.keys(modules);
		for(let i=0,l=modulesList.length;i<l;i++){
			if(typeof modules[modulesList[i]].init === "function"){
				modules[modulesList[i]].init();
			}
		}
	}
};
document.addEventListener("DOMContentLoaded", app.init);