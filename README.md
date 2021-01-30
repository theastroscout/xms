# XMS
Lightweight CMS powered by Node.js & Nginx

<br/>

## Installation
```
# Clone repository to your directory
git clone https://github.com/hqdaemon/xms

# Go to your catalog
cd xms

# Install all dependencies
npm install
```

## Build
Run build command and follow instructions
```
npm run build # Setup your website
```

## Restore to Default
```
npm run restore
```

## Usage
1. Control your web site: https://sandbox.yourdomain.com/admin
2. Testing your web site: https://sandbox.yourdomain.com
3. Store images - img directory & https://img.yourdomain.com
4. Minified & Optimized Production - https://yourdomain.com

## Structure
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