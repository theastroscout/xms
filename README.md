# XMS
Lightweight Multi Thread CMS powered with WebSockets, Node.js, MongoDB & Nginx.
[Comet](https://en.wikipedia.org/wiki/Comet_(programming)) engine on board.

<br/>

## Requirements
1. [MongoDB](https://www.mongodb.com/)
2. [Node.js](https://nodejs.org/) & [npm](https://www.npmjs.com/)

<br/>

# Installation

## 1.A. With current repository
```
# Clone repository to your directory
git clone https://github.com/hqdaemon/xms

# Go to the directory
cd xms

# Update to the New Version
git pull
```

## 1.B. With your repository

### On Github.com
1. Create a new empty repository on Github

### On Local
2. Clone your repository
```
git clone https://github.com/YOUR_USERNAME/YOUR_REPO
```

3. Setup remote upstream to fetch @hqdaemon/xms
```
cd YOUR_REPO
git remote add upstream https://github.com/hqdaemon/xms
```

4. Pull from @hqdaemon/xms
```
git pull upstream master
```

5. Update to the New Version
```
git pull upstream master

# Or Forced update from the upstream (@hqdaemon/xms)
git reset --hard upstream/master
```

## 2. Install all dependencies
```
cd YOUR_DIR
npm install
```

## 3. Build
Run build command and follow instructions
```
npm run build

# or

npm run rebuild # If you already have Configuration file at conf/data.json
```

## 4. Restore XMS Settings to Default
```
npm run restore
```

<br/>
<br/>

# Usage
1. Control your web site: https://sandbox.yourdomain.com/admin
2. Testing your web site: https://sandbox.yourdomain.com
3. Store images - /img/ directory of https://img.yourdomain.com
4. Minified & Optimized Production - https://yourdomain.com

<br/>

## Launch
1. Go to the folder with your project
2. Create Screen
```
screen -S YOUR_SCREEN_NAME
```
3. Launch Sandbox
```
# Maybe you will need to change init file permissions (sudo chmod u+x init)
./init
```
4. Close screen ctrl + A + D
5. Open screen
```
screen -dr YOUR_SCREEN_NAME
```
6. Kill screen
```
screen -XS YOUR_SCREEN_NAME quit
```

<br/>

## Modules
Put your module into ```/sandbox/modules/custom/YOUR_CUSTOME_MODULE/``` directory.

### Module Structure
sandbox > modules > custom > YOUR_CUSTOME_MODULE
- app.js # Head of the module
- assets # To store module styles and script
- views # To store module templates

If you need override sys methods just create folder with the same name in custom directory.

### Module's ```app.js``` structure
```js
var app = {
	get: async (currentPage) => {
		let result = "Module resulting HTML code";
		/*

		Do something with currentPage or DB.
		You have access to all global classes from here. E.g. view, db and i18n.

		*/
		return result;
	},
	methods: {
		/*
		Place here your methods that you can evoke from Frontend by
		api.send({
			module: "YOUR_MODULE_NAME",
			method: "YOUR_MODULE_METHOD",
			data: {
				// Your data
			}
		})

		*/
		exampleCustomMethod: async (payload) => {
			/*
			payload = {
				module: "YourModuleName",
				method: "YourMethodName",
				data: {
					Received Object
				},
				result: {
					module: "YourModuleName",
					method: "YourMethodName"
					This is an object that respond to websocket
				}
			}
			*/
			payload.result.state = "Result state";
			payload.result.msg = "Message output";
			api.send(payload);
		}
	}
};
module.exports = app;
```

### Call your new module
Call module by putting next code to your template.
```
{{YOUR_CUSTOME_MODULE}}
```

<br/>

## View module
If you want work with template on global level add module View with getPageData() method in ```/sandbox/modules/custom/view```
```js
var app = {
	get: async (currentPage) => {

	},
	getPageData: async (currentPage) => {
		let data = {};
		return data;
	},
	rules: [
		// If the page is not found the array mapping is up to the first match
		{
			in: "^/?(.{2})?/news/(.+)", // Matching url with expression
			out: modules.list.YOUR_MODULE.YOUR_METHOD // Calling the async method if matched
			/*
			YOUR_MODULE.YOUR_METHOD = async (url, match) => {
				let pageData = {
					name: "",
					seo: {
						title: "",
						description: "",
						keywords: ""
					},
					content: ""
				};
				return pageData;
			}
			*/
		}
	],
	fileRules: [
		{
			in: "^/libs/(.+)",
			out: modules.list.YOUR_MODULE.YOUR_METHOD
			/*
			YOUR_MODULE.YOUR_METHOD = async (url, matches, res) => {
				let file = "SOME FILE";
				let header = "text/plain";
				res.setHeader("Content-Type", header);
				res.end(Buffer.from(file, "utf8"));
				return true;
			}
			*/
		}
	],
	request: async (req, cookies) => {
		// req is Entire Request Object
	},
	connect: async (socketObj) => {
		/*
		Fired when user connects to the API. See api.js
		socketObj = JSON {
			id: (string) socketID,
			ip: (string) IP,
			obj: (object) WebSocket Object,
			lang: (string) Language,
			cookies: (object) Cookies,
			url: (str) Request URL,
			params: (object) // new WebSocket("wss://example.com?param1=value1&param2=value2");
		}
		*/
	},
	disconnect: async (socketID) => {
		// Fired when user closes connection, e.g. closes browser tab.
	},
	getNotFound: async () => {
		// Return Custom Not Found Page
	}
}
```

<br/>

## SSL
We recommend using **certbot** to obtain SSL certificates
```
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

<br/>

## Nodemailer
Use nodemailer from global to send emails
```js
let notify = nodemailer.createTransport({
	host: "smtp.domain",
	port: 465,
	secure: true,
		auth: {
			user: "USER_NAME",
			pass: "PASSWORD"
		}
});
let mail = await notify.sendMail({
	from: '"YOUR_APP_NAME" <name@domain.com>',
	to: "Recipients",
	subject: "Subject",
	html: "Message"
});
console.log("Message sent: %s", mail.messageId);
```

<br/>

## Deploy module
If you want to do something while deploying add module Deploy with build() method in ```/sandbox/modules/custom/deploy```
```js
var app = {
	build: async (currentPage) => {
		/*

		Do what you want
		Don't forget you can use the Production DB through prodDB global variable
	
		Use next method to clone entire collection to the Production DB
		admin.cloneCollection("COLLECTION_NAME");

		*/
		return true;
	}
}
```


<br/>
<br/>

# Package Structure
- build
	- src
		- conf
			- dev.json # Sandbox Configuration Example
			- prod.json # Production Configuration Example
		- nginx
- conf
	- dev.json # Sandbox Configuration File
	- prod.json # Production Configuration File
- data
	- admin.json # Control Panel Configuration File
- img # img.yourdomain.com
	- ui.src # UI sprites
- nginx # Nginx Configuration Example
- node_modules
- prod # Production version. Create with Deploy method in Control Panel
	- app # System
	- modules # Your and Systems modules
	- public # Public folder
		- app.css # Minified styles
		- app.js # Minified scripts
		- ui.svg # UI sprites
	- views # Minified Templates
- sandbox # Sandbox version
	- admin
		- assets
			- css # Style
			- js # JavaScrip files
		- views # Control panel templates
	- app
		- classes
			- admin.control.js
			- admin.js
			- i18n.js
			- server.js
			- view.js
			- view.pages.js
			- api.js
		- app.js # Worker
		- init.js # App Launcher
		- master.js # Master
		- utils.js
	- assets
		- admin # FrontEnd of the Control Panel
			- css # Style files
			- js # JavaScript files
		- dev  # FrontEnd of the Web Site
			- css # Style files
			- js # JavaScript files
	- modules
		- sys # System modules, overwritten with the update
		- custom # Place here your custmo modules
	- public # Folder with external access from http, e.g. https://youdomain.com/ui.svg
		- app.css # Composed and minified styles after deploying
		- app.js # Composed and minified scripts after deploying
		- ui.svg # Sprites Bundle
	- views # HTML Templates


<br />
<br />
<br />
<br />

## MIT License

Copyright (c) HQ • [hqmode.com](https://hqmode.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.