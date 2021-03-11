const cluster = require("cluster");

var master = {
	PIDs: [process.pid],
	init: async () => {
		await master.db.init();
		master.threads = require("os").cpus().length;
		master.threads = (conf.sys.cpu)?Math.min(master.threads,conf.sys.cpu):master.threads;
		for (let i = 0; i < master.threads; i++) {
			cluster.fork();
		}

		cluster.on("exit", (worker, code, signal) => {
			console.log(`Worker #${worker.process.pid} died. Started new one ;)`);
			cluster.fork();
		});

		for (let id in cluster.workers) {
			let worker = cluster.workers[id];
			cluster.workers[id].on("message", master.message);
			master.PIDs.push(cluster.workers[id].process.pid);
		}

		console.log(`Master go with ${master.threads} workers started.\ntop -p ${master.PIDs.join(",")}`);
	},
	message: (payload) => {
		// console.log("Master incoming message", payload);
		for(let i in cluster.workers){
			let worker = cluster.workers[i];
			// if(worker.process.pid !== payload.pid){
				worker.send(payload);
			// }
		}
	},
	db: {
		init: async () => {
			let sys = require("./sys");
			await sys.checkFirstLaunch();
			
			for(let i in master.db.methods){
				await master.db.methods[i]();
			}
			console.log("🚀 DB is ready");
		},
		methods: {}
	}
};

master.init();