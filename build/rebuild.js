const {execSync} = require("child_process");
const fs = require("fs");
const chalk = require("chalk");

var app = {
	init: () => {
		let confPath = "conf/data.json";
		if(!fs.existsSync(confPath)){
			console.log("Error: conf/data.json not exists");
			return false;
		}

		fs.mkdirSync("sandbox/assets/js", {recursive: true});
		fs.mkdirSync("sandbox/assets/css", {recursive: true});
		fs.mkdirSync("sandbox/views/content", {recursive: true});
		fs.mkdirSync("sandbox/views/modules", {recursive: true});
		fs.mkdirSync("sandbox/modules/sys", {recursive: true});
		fs.mkdirSync("sandbox/modules/custom", {recursive: true});
		fs.mkdirSync("nginx/sites-enabled", {recursive: true});

		let conf = JSON.parse(fs.readFileSync(confPath));

		// Sandbox shell
		let initFile = fs.readFileSync("build/src/init").toString();
		initFile = initFile.replace(/ROOT_PATH/g,conf.rootPath);
		fs.writeFileSync("init",initFile);

		// Prod shell
		let restartFile = fs.readFileSync("build/src/restart").toString();
		restartFile = restartFile.replace(/ROOT_PATH/g,conf.rootPath);
		restartFile = restartFile.replace(/PRODUCTION_SCREEN_NAME/g,conf.projectName);
		fs.writeFileSync("restart",restartFile);


		// Nginx conf
		let nginxConf = fs.readFileSync("build/src/nginx/nginx.conf").toString();
		nginxConf = nginxConf.replace(/DOMAIN_NAME/g,conf.domainName);
		nginxConf = nginxConf.replace(/ROOT_PATH/g,conf.rootPath);
		fs.writeFileSync("nginx/nginx.conf",nginxConf);

		let nginxServerConf = fs.readFileSync("build/src/nginx/server.conf").toString();

		// Prod Nginx
		let prodServerConf = nginxServerConf.replace(/DOMAIN_NAME/g,conf.domainName);
			prodServerConf = prodServerConf.replace(/PORT/g,conf.prodPort);
			prodServerConf = prodServerConf.replace(/ROOT_PATH/g,conf.rootPath);
			prodServerConf = prodServerConf.replace(/DOMAIN_TYPE/g,"prod");
		fs.writeFileSync("nginx/sites-enabled/"+conf.domainName,prodServerConf);

		// Sandbox Nginx
		let sandboxServerConf = nginxServerConf.replace(/DOMAIN_NAME/g,conf.sandboxDomainName);
			sandboxServerConf = sandboxServerConf.replace(/PORT/g,conf.devPort);
			sandboxServerConf = sandboxServerConf.replace(/ROOT_PATH/g,conf.rootPath);
			sandboxServerConf = sandboxServerConf.replace(/DOMAIN_TYPE/g,"sandbox");
		fs.writeFileSync("nginx/sites-enabled/"+conf.sandboxDomainName,sandboxServerConf);

		// Img Nginx
		let imgServerConf = fs.readFileSync("build/src/nginx/img.conf").toString();
		imgServerConf = imgServerConf.replace(/DOMAIN_NAME/g,conf.imgDomainName);
		imgServerConf = imgServerConf.replace(/ROOT_PATH/g,conf.rootPath);
		fs.writeFileSync("nginx/sites-enabled/"+conf.imgDomainName,imgServerConf);


		// Favicon
		let FAVICON_URL = "https://"+conf.imgDomainName+"/favicon/v1";

		let headAdminModule = fs.readFileSync("build/src/sandbox/admin/views/modules/head.html").toString();
		headAdminModule = headAdminModule.replace(/FAVICON_URL/g,FAVICON_URL);
		fs.writeFileSync("sandbox/admin/views/modules/head.html",headAdminModule);

		/*
		let headModule = fs.readFileSync("build/src/sandbox/views/modules/head.html").toString();
		headModule = headModule.replace(/FAVICON_URL/g,FAVICON_URL);
		fs.writeFileSync("sandbox/views/modules/head.html",headModule);

		execSync("cp -a build/src/img/favicon/. img/favicon");


		let browserconfig = fs.readFileSync("img/favicon/v1/browserconfig.xml").toString();
		browserconfig = browserconfig.replace(/FAVICON_URL/g, FAVICON_URL);
		fs.writeFileSync("img/favicon/v1/browserconfig.xml",browserconfig);
		
		let webmanifest = fs.readFileSync("img/favicon/v1/site.webmanifest").toString();
		webmanifest = webmanifest.replace(/FAVICON_URL/g, FAVICON_URL);
		fs.writeFileSync("img/favicon/v1/site.webmanifest",webmanifest);
		*/


		// Dev Conf
		let devConf = fs.readFileSync("build/src/conf/dev.json").toString();

		devConf = devConf.replace(/ROOT_PATH/g,conf.rootPath);
		let ipAccess;
		if(!conf.ipAccess){
			ipAccess = false;
		} else {
			ipAccess = "["+conf.ipAccess.map(el => `"${el}"`).join(",")+"]"
		}
		devConf = devConf.replace(/\"IP_ACCESS\"/g,ipAccess);
		devConf = devConf.replace("PROJECT_NAME",conf.projectName);
		devConf = devConf.replace("PROJECT_DESC",conf.projectDesc);
		devConf = devConf.replace(/DB_NAME/g,conf.devDBName);
		devConf = devConf.replace(/\"PORT\"/g,conf.devPort);
		devConf = devConf.replace(/FULL_DOMAIN_NAME/g,conf.sandboxDomainName);
		devConf = devConf.replace(/SSL_DOMAIN_NAME/g,conf.sandboxDomainName);
		devConf = devConf.replace(/IMG_PATH/g,"https://"+conf.imgDomainName);
		fs.writeFileSync("conf/dev.json",devConf);

		// Prod Conf
		let prodConf = fs.readFileSync("build/src/conf/prod.json").toString();

		prodConf = prodConf.replace(/ROOT_PATH/g,conf.rootPath);
		prodConf = prodConf.replace(/DB_NAME/g,conf.dbName);
		prodConf = prodConf.replace(/\"PORT\"/g,conf.prodPort);
		prodConf = prodConf.replace(/IMG_PATH/g,"https://"+conf.imgDomainName);
		prodConf = prodConf.replace(/FULL_DOMAIN_NAME/g,conf.domainName);
		prodConf = prodConf.replace(/SSL_DOMAIN_NAME/g,conf.domainName);
		
		fs.writeFileSync("conf/prod.json",prodConf);

		console.log(chalk.yellow(`\n
-------------------------------------------------------------\n
All is done and we're ready to work with your new web site :)\n
-------------------------------------------------------------\n\n
1. Create your app through "screen -S YOUR_DEV_SCREEN_NAME"\n
2. Launch you app "./init"\n
3. Exit from the screen "ctrl + A + D"\n
4. Reopen your dev screen "screen -dr YOUR_DEV_SCREEN_NAME"\n
5. Manually configuration /conf/*\n
6. Production screen name is "${conf.projectName}"\n
\n
`));

	}
};
app.init();

module.exports = app;