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
3. Store images - img directory of https://img.yourdomain.com
4. Minified & Optimized Production - https://yourdomain.com

<br/>

## Launch
1. Go to folder with your project
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
Put your module into ```/sandbox/modules/YOUR_CUSTOME_MODULE/``` directory.

### Module Structure
sandbox > modules > YOUR_CUSTOME_MODULE
- app.js # Head of the module
- assets # To store module styles and script
- views # To store module templates

### Module's ```app.js``` structure
```js
var app = {
	get: (currentPage) => {
		let result = "Module resulting HTML code";
		/*
		Do something with currentPage or DB.
		You have access to all global classes from here. E.g. view, db and i18n.
		*/
		return result;
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
			- ws.js
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