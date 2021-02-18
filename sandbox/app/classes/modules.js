var modules = {
	list: {},
	init: async () => {
		await modules.load(workDir+"/modules/sys");
		await modules.load(workDir+"/modules/custom");
		console.log("Loaded modules:",Object.keys(modules.list));
	},
	load: async (modulesPath) => {
		if(!fs.existsSync(modulesPath)){
			return false;
		}
		fs.readdirSync(modulesPath, {withFileTypes: true}).forEach(dirent => {
			if(dirent.isDirectory()){
				let moduleName = dirent.name;
				let modulePath = modulesPath+"/"+moduleName;
				let item = require(modulePath+"/app.js");
					item._name = moduleName;
					item._path = modulePath;
				modules.list[moduleName] = item;
			};
		});
	},
	get: async (name, currentPage, cookies) => {
		if(modules.list[name] !== undefined){
			return await modules.list[name].get(currentPage, cookies);
		}
		return false;
	},
	getInstance: (moduleName) => {
		if(modules.list[moduleName] !== undefined){
			return modules.list[moduleName];
		}
		return false;
	},
	getMethod: (moduleName, methodName) => {
		if(modules.list[moduleName] !== undefined && modules.list[moduleName].methods !== undefined && typeof modules.list[moduleName].methods[methodName] === "function"){
			return modules.list[moduleName].methods[methodName];
		}
		return false;
	},
	call: async (moduleName, methodName, data) => {
		if(modules.list[moduleName] !== undefined && typeof modules.list[moduleName][methodName] === "function"){
			return await modules.list[moduleName][methodName](data);
		}
		return false;
	},
	getRules: () => {
		if(modules.list.view !== undefined && modules.list.view.rules !== undefined){
			return modules.list.view.rules;
		}
		return false;
	},
	getFileRules: () => {
		if(modules.list.view !== undefined && typeof modules.list.view.fileRules === "object"){
			return modules.list.view.fileRules;
		}
		return false;
	},
	request: (req, cookies) => {
		if(modules.list.view !== undefined && typeof modules.list.view.request === "function"){
			modules.list.view.request(req, cookies);
		}
	},
	deploy: async () => {
		if(modules.list.deploy !== undefined && typeof modules.list.deploy.build === "function"){
			await modules.list.deploy.build();
		}
		return true;
	}
};
module.exports = modules;