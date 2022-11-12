const expSessionLib = require("express-session");
const expSession = expSessionLib(conf.sys.express.session);
const bodyParser = require("body-parser");

var server = {
	init: async () => {
		exp.disable("x-powered-by");

		exp.use(expressLib.json());
		exp.use(bodyParser.urlencoded({ extended: true }));
		exp.use(bodyParser.json({limit: "10mb"}));
		exp.use((err, req, res, next) => {
			if(err){
				res.status(400).send("Sorry. Error parsing data.");
			} else {
				next();
			}
		});
		exp.use(expSession);
		exp.set("trust proxy", 1);

		exp.get("*", server.req);
		
		httpsServer.listen(conf.sys.port, () => {});
	},
	req: async (req,res) => {
		let ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
		let url = req.path;

		let fileRules = modules.getFileRules();
		if(fileRules !== false){
			for(let re of fileRules){
				let r = url.match(new RegExp(re.in));
				if(r !== null){
					let result = await re.out(url, r, res, req);
					if(result === false){
						return false;
					}
				}
			}
		}

		if(DEV){
			if(conf.sys.restricted && !conf.sys.restricted.includes(ip)){
				res.redirect("https://"+prodConf.sys.host);
				return false;
			}

			if(url.match(/^\/(assets|admin\/assets)/)){
				let ext = url.match(/\.([^/]+)$/)[1];
				url = "sandbox"+url;
				let file;
				if(ext == "js"){
					file = jscompose(url.replace(/^\//,""));
				} else {
					file = await minify(url.replace(/^\//,""));
				}

				if(file){
					let header = (ext === "js")?"text/javascript":"text/css";
					res.setHeader("Content-Type", header);
					res.end(Buffer.from(file, "utf8"));
					return false;
				}
			}
		}


		let langFix = modules.langFix();
		if(langFix){
			let result = await langFix(url, res, req);
			if(result === false){
				return false;
			}
		}

		// Cookie
		let cookies = utils.getCookies(req.headers.cookie);
		let pageLang = i18n.getPageLang(url);

		if(cookies.lang === undefined){
			res.cookie("lang", pageLang, conf.cookie);
			cookies.lang = pageLang;
		} else if(cookies.lang !== pageLang){
			cookies.lang = pageLang;
			res.cookie("lang", pageLang, conf.cookie);
		}

		if(cookies.xu === undefined){
			cookies.xu = utils.getUniqueID("xxxx-");
			res.cookie("xu", cookies.xu, conf.cookie);
		}

		modules.request(req, cookies);
		
		/*

		Page

		*/
		let page = view.getTpl("/views/default");
		let pageData = {
			assets: {
				css: "",
				js: ""
			}
		};
		let uiPostfix = DEV ? "" : "?" + conf.assets.ui;
		for(i of conf.assets.web.css){
			pageData.assets.css += `<link rel="stylesheet" type="text/css" href="${i+uiPostfix}" />`;
		}
		for(i of conf.assets.web.js){
			pageData.assets.js += `<script src="${i+uiPostfix}"></script>`;
		}

		page = view.parseValues(page, pageData);

		res.send(page);
	}
};
module.exports = server;