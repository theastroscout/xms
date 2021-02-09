const fs = require("fs");
const chalk = require("chalk");
const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout
});

let conf = {
	rootPath: __dirname.replace("/build",""),
	projectName: "",
	projectDesc: "",
	domainName: "",
	sandboxDomainName: "",
	imgDomainName: "",
	prodPort: 12137,
	devPort: 12138,
	ipAccess: false,
	dbName: "",
	devDBName: ""
};

var go = {
	init: async () => {
		console.log(`\n${chalk.yellow.bold("Let's setting up your site!")}\n\n`);
		go.next();
	},
	currentStep: 0,
	next: () => {
		let steps = Object.keys(go.steps);
		let step = steps[go.currentStep];
		if(step !== undefined){
			go.currentStep++;
			go.steps[step]();
		} else {
			go.build();
			readline.close();
		}
	},
	steps: {
		setRoot: () => {
			readline.question(`${go.currentStep+1}. Root location is ${chalk.bold.green(conf.rootPath)} right?
Press Enter for use this path or type another: `, input => {
				conf.rootPath = (!input || input==="y")?conf.rootPath:input;
				console.log(`\nGreate! I set root location to ${chalk.bold(conf.rootPath)}\n`);

				go.next();
			});
		},
		projectName: () => {
			readline.question(`
${go.currentStep+1}. Project Name: `, input => {
				if(!input){
					console.log(chalk.red("\nNope. You need to set it."));
					go.steps.projectName();
				} else {
					conf.projectName = input;
					go.next();
				}
			});
		},
		projectDesc: () => {
			readline.question(`
${go.currentStep+1}. Project Description: `, input => {
				conf.projectDesc = input || "Really cool stuff";
				go.next();
			});
		},
		setDomain: () => {
			readline.question(`
${go.currentStep+1}. Domain Name without http(s)://: `, input => {
				if(!input){
					console.log(chalk.red("\nNope. You need to set it."));
					go.steps.setDomain();
				} else {
					conf.domainName = input;
					go.next();
				}
			});
		},
		setSandboxDomain: () => {
			conf.sandboxDomainName = `sandbox.${conf.domainName}`;
			readline.question(`
${go.currentStep+1}. Sandbox Domain Name
Press Enter to use ${chalk.bold(conf.sandboxDomainName)} or type another: `, input => {
				conf.sandboxDomainName = input || conf.sandboxDomainName;
				go.next();
			});
		},
		setSandboxImgPath: () => {
			conf.imgDomainName = `img.${conf.domainName}`;
			readline.question(`
${go.currentStep+1}. Domain storing images
Press Enter to set ${chalk.bold(conf.imgDomainName)} or type another: `, input => {
				conf.imgDomainName = input || conf.imgDomainName;
				go.next();
			});
		},
		setProdPort: () => {
			readline.question(`
${go.currentStep+1}. Production Server Port. Press Enter to use ${chalk.bold(conf.prodPort)} or type another: `, input => {
				conf.prodPort = parseInt(input || conf.prodPort, 10);
				go.next();
			});
		},
		setSandboxPort: () => {
			readline.question(`
${go.currentStep+1}. Sandbox Server Port. (!) Do not use production port ${conf.prodPort}.
Press Enter to use ${chalk.bold(conf.devPort)} or type another: `, input => {
				let port = parseInt(input || conf.devPort, 10);
				if(port === conf.prodPort){
					console.log(chalk.red(`\nDo not use production port ${conf.prodPort}`));
					go.steps.setSandboxPort();
				} else {
					conf.devPort = port;
					go.next();
				}
			});
		},
		setProdDB: () => {
			conf.dbName = conf.projectName;
			readline.question(`
${go.currentStep+1}. Production DB name. Press Enter to use ${chalk.bold(conf.dbName)} or type another: `, input => {
				conf.dbName = input || conf.dbName;
				go.next();
			});
		},
		setSandboxDB: () => {
			conf.devDBName = conf.projectName+"Dev";
			readline.question(`
${go.currentStep+1}. Sandbox DB name. Press Enter to use ${chalk.bold(conf.devDBName)} or type another: `, input => {
				conf.devDBName = input || conf.devDBName;
				go.next();
			});
		},
		setIPRestrict: () => {
			readline.question(`
${go.currentStep+1}. Set Restrict by IP for sandbox access
You can set several splitted by comma: `, input => {
				conf.ipAccess = input || false;
				if(conf.ipAccess){
					conf.ipAccess = conf.ipAccess.split(",");
				}
				go.next();
			});
		}
	},
	build: () => {

		fs.mkdirSync("conf");
		fs.writeFileSync("conf/data.json",JSON.stringify(conf,null,"\t"));

		require("./rebuild")
	}
};
go.init();