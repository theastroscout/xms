import "utils";
import "ui";
import "api";
import "../../../../node_modules/@hqdaemon/qx/src/qx.js";

var app = {
	init: () => {
		ui.init();
		api.init();
	}
};
document.addEventListener("DOMContentLoaded", app.init);