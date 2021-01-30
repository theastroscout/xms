import "utils";
import "ui";
import "ws";
import "../../../../node_modules/@hqdaemon/qx/src/qx.js";

var app = {
	init: () => {
		ui.init();
		ws.init();
	}
};
document.addEventListener("DOMContentLoaded", app.init);