var modules = {
	list: {},
	init: async () => {
		await modules.load(workDir+"/modules/sys");
		await modules.load(workDir+"/modules/custom");
		console.log(modules.list);
	},
	load: async (modulesPath) => {
		if(!fs.existsSync(modulesPath)){
			return false;
		}
		fs.readdirSync(modulesPath, {withFileTypes: true}).forEach(dirent => {
			if(dirent.isDirectory()){
				let moduleName = dirent.name;
				let modulePath = modulesPath+"/"+moduleName;
				let item = {
					name: moduleName,
					path: modulePath,
					app: require(modulePath+"/app.js")
				};
				modules.list[moduleName] = item;
			};
		});
	},
	get: async (name, currentPage, cookies) => {
		if(modules.list[name] !== undefined){
			return await modules.list[name].app.get(currentPage, cookies);
		}
		return false;
	},
	getInstance: (moduleName) => {
		if(modules.list[moduleName] !== undefined){
			return modules.list[moduleName].app;
		}
		return false;
	},
	call: async (moduleName, methodName, data) => {
		if(modules.list[moduleName] !== undefined && typeof modules.list[moduleName].app[methodName] === "function"){
			return await modules.list[moduleName].app[methodName](data);
		}
		return false;
	}
};
module.exports = modules;