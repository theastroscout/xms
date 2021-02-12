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
		var ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
		let url = req.path;

		if(DEV){
			if(conf.restricted && !conf.restricted.includes(ip)){
				res.redirect(prodConf.sys.host);
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

		// Fix Default Language Prefix
		/*
		let isEn = url.match(/^\/en/);
		if(isEn){
			let redirectURL = url.replace(/^\/en/,"");
			if(redirectURL === ""){
				redirectURL = "/"
			}
			res.redirect(redirectURL);
			return false;
		}
		*/

		// Cookie
		let cookies = utils.getCookies(req.headers.cookie);
		let pageLang = i18n.getPageLang(url);

		if(!cookies.lang){
			let lang = i18n.getLangFromHeader(req.headers["accept-language"]);
			res.cookie("lang", lang, conf.cookie);
			if(lang !== pageLang){
				let redirectURL = i18n.getPrefix(lang) + ((url === "/home")?"/":url);
				res.redirect(redirectURL);
				return false;
			}
		} else if(cookies.lang !== pageLang){
			res.cookie("lang", pageLang, conf.cookie);
		}

		if(cookies.xu === undefined){
			cookies.xu = utils.getUniqueID("xxxx-");
			res.cookie("xu", cookies.xu, conf.cookie);
		}
		
		prefix = i18n.getPrefix(pageLang);
		let reg = new RegExp("^"+prefix);
		if(url.replace(reg,"") === "/"){
			url += "home";
		}

		let page = await view.get(url, cookies);
		if(page.state === false){
			res.status(404);
		} else if(page.redirect){
			res.redirect(page.redirect);
			return false;
		}
		res.send(page.layout);
	}
};
module.exports = server;