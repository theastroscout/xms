# XMS
Lightweight CMS powered by Node.js & Nginx

<br/>

## Installation
```
npm install @hqdaemon/xms
```

## Build
Run build command and follow instructions
```
npm run build
```

## Restore to Default
```
npm run restore
```

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
		- admin
		- dev
	- public # Folder with external access from http, e.g. https://youdomain.com/ui.svg
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