/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./app.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app.ts":
/*!****************!*\
  !*** ./app.ts ***!
  \****************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("var current_workspace = '';\r\nvar current_channel = '';\r\nvar baseURL = `http://${document.domain}:${location.port}`;\r\nvar socket = io.connect(baseURL);\r\nvar private_message = false;\r\nvar private_username = '';\r\ndocument.addEventListener(\"DOMContentLoaded\", function () {\r\n    //Query Selectors\r\n    const sendButton = document.querySelector('#message-send');\r\n    const messageInput = document.querySelector('#message-input');\r\n    const mainArea = document.querySelector('.main-area');\r\n    var x = document.querySelectorAll(\".team-name\");\r\n    const heading = document.querySelector(\".navbar-brand\");\r\n    var channel_links = document.querySelectorAll('.channel-list');\r\n    const addChannelButton = document.querySelector('#add-channel-button');\r\n    //Socket functions\r\n    socket.on('connect', function () {\r\n        console.log(\"socket connected\");\r\n        socket.send('User connected');\r\n    });\r\n    socket.on('message', function (msg) {\r\n        console.log(msg);\r\n        if (msg.status == 1) {\r\n            getChannelUrl(current_channel);\r\n        }\r\n        if (msg.status == 2) {\r\n            getPrivateMessages(private_username);\r\n        }\r\n    });\r\n    //send message\r\n    sendButton.addEventListener(\"click\", function (e) {\r\n        let msgText = messageInput.value;\r\n        if (private_message) {\r\n            let message = { 'private_message': \"True\", \"reciever\": private_username, 'workspace': current_workspace, 'channel': current_channel, 'message': msgText };\r\n            console.log(message);\r\n            socket.send(message);\r\n        }\r\n        else {\r\n            let message = { 'private_message': \"False\", \"reciever\": \"\", 'workspace': current_workspace, 'channel': current_channel, 'message': msgText };\r\n            console.log(message);\r\n            socket.send(message);\r\n        }\r\n    });\r\n    //EVENT LISTENERS\r\n    //adding a new channel\r\n    addChannelButton.addEventListener('click', function (e) {\r\n        let newChannelField = document.querySelector('#new-channel-name');\r\n        let name = newChannelField.value;\r\n        name = name.replace(\" \", \"_\");\r\n        getChannelUrl(name);\r\n    });\r\n    //changing workspace\r\n    x.forEach(element => {\r\n        element.addEventListener(\"click\", function (e) {\r\n            removeActive();\r\n            clearChannels();\r\n            clearUsers();\r\n            text = this.id;\r\n            current_workspace = text;\r\n            this.parentElement.className = \"team active\";\r\n            heading.innerText = `# ${text.replace('_', ' ')}`;\r\n            load_page(text);\r\n        });\r\n    });\r\n    document.addEventListener('click', function (e) {\r\n        let element = e.target;\r\n        //load messages and change UI when user clicks on a channel\r\n        if (element.className == \"channel-list\") {\r\n            removeChannelActive();\r\n            removeUserActive();\r\n            heading.innerText = element.firstElementChild.innerText;\r\n            let channelName = element.firstElementChild.innerText.replace(\"# \", \"\");\r\n            private_username = '';\r\n            private_message = false;\r\n            current_channel = channelName;\r\n            getChannelUrl(channelName);\r\n            in_room = true;\r\n            element.className = \"channel-list active\";\r\n        }\r\n        else if (element.className == \"channel-item\") {\r\n            removeChannelActive();\r\n            removeUserActive();\r\n            heading.innerText = element.innerText;\r\n            let channelName = element.innerText.replace(\"# \", \"\");\r\n            private_username = '';\r\n            private_message = false;\r\n            current_channel = channelName;\r\n            in_room = true;\r\n            getChannelUrl(channelName);\r\n            element.parentElement.className = \"channel-list active\";\r\n        }\r\n        //direct message - if user clicks on username in list for direct message\r\n        if (element.className == \"user-list\") {\r\n            clearMessages();\r\n            removeChannelActive();\r\n            removeUserActive();\r\n            username = element.firstElementChild.getAttribute('id');\r\n            private_username = username;\r\n            private_message = true;\r\n            getPrivateMessages(username);\r\n            element.className = \"user-list active\";\r\n        }\r\n        else if (element.className == \"user-item\") {\r\n            clearMessages();\r\n            removeChannelActive();\r\n            removeUserActive();\r\n            username = element.getAttribute('id');\r\n            private_username = username;\r\n            private_message = true;\r\n            getPrivateMessages(username);\r\n            element.parentElement.className = \"user-list active\";\r\n        }\r\n        //close the flashed message\r\n        if (element.className == \"far fa-times-circle flash-close\") {\r\n            const flashMessage = document.querySelector('.flash-message');\r\n            const currClasses = flashMessage.className;\r\n            flashMessage.className = `${currClasses} hiding`;\r\n        }\r\n        //remove message\r\n        if (element.className == \"far fa-times-circle message-close\") {\r\n            let messageDivId = element.parentElement.getAttribute('id');\r\n            removeMessage(messageDivId);\r\n            getChannelUrl(current_channel);\r\n        }\r\n    });\r\n    //API REQUEST FUNCTIONS\r\n    //get the list of channels\r\n    function load_page(text) {\r\n        console.log('searching');\r\n        if (text != \"Home\" && text != \"add-team\") {\r\n            var channel_container = document.querySelector('.channel-container');\r\n            var user_container = document.querySelector('.user-container');\r\n            const request = new XMLHttpRequest();\r\n            request.onreadystatechange = function () {\r\n                if (this.readyState == 4 && this.status == 200) {\r\n                    data = this.responseText;\r\n                    data = JSON.parse(data);\r\n                    if (data) {\r\n                        channels = data.channels;\r\n                        users = data.users;\r\n                        channels.forEach(item => {\r\n                            let newDiv = document.createElement('div');\r\n                            let ptag = document.createElement(\"p\");\r\n                            newDiv.className = 'channel-list';\r\n                            ptag.innerHTML = `# ${item}`;\r\n                            ptag.className = 'channel-item';\r\n                            newDiv.appendChild(ptag);\r\n                            channel_container.appendChild(newDiv);\r\n                        });\r\n                        users.forEach(item => {\r\n                            let newDiv = document.createElement('div');\r\n                            let ptag = document.createElement(\"p\");\r\n                            let indicator = document.createElement('i');\r\n                            indicator.className = 'fas fa-circle indicator';\r\n                            newDiv.className = 'user-list';\r\n                            ptag.innerHTML = `<i class=\"fas fa-circle indicator\" id=\"inactive\"></i>${item}`;\r\n                            ptag.id = item;\r\n                            ptag.className = 'user-item';\r\n                            newDiv.appendChild(ptag);\r\n                            user_container.appendChild(newDiv);\r\n                        });\r\n                    }\r\n                }\r\n            };\r\n            request.open('GET', `/${text}`, true);\r\n            request.send();\r\n        }\r\n    }\r\n    ;\r\n    // remove a message \r\n    function removeMessage(id) {\r\n        const request = new XMLHttpRequest();\r\n        request.onreadystatechange = function () {\r\n            if (this.readyState == 4 && this.status == 200) {\r\n                clearMessages();\r\n                getChannelUrl(current_channel);\r\n            }\r\n        };\r\n        let url = `/rm/${id}`;\r\n        console.log(url);\r\n        request.open('GET', url, true);\r\n        request.send();\r\n    }\r\n    ;\r\n    //get messages when user clicks on channel\r\n    function getChannelUrl(name) {\r\n        const request = new XMLHttpRequest();\r\n        request.onreadystatechange = function () {\r\n            if (this.readyState == 4 && this.status == 200) {\r\n                data = this.responseText;\r\n                data = JSON.parse(data);\r\n                clearMessages();\r\n                data.forEach(element => {\r\n                    createMessage(element.content, element.username, element.id);\r\n                });\r\n            }\r\n        };\r\n        let url = `/${current_workspace}/${name}`;\r\n        console.log(url);\r\n        request.open('GET', url, true);\r\n        request.send();\r\n    }\r\n    //load private messages\r\n    function getPrivateMessages(private_username) {\r\n        console.log('getting private messages');\r\n        const request = new XMLHttpRequest();\r\n        request.onreadystatechange = function () {\r\n            if (this.readyState == 4 && this.status == 200) {\r\n                data = this.responseText;\r\n                data = JSON.parse(data);\r\n                clearMessages();\r\n                data.forEach(element => {\r\n                    createMessage(element.content, element.username, element.id);\r\n                });\r\n            }\r\n        };\r\n        let url = `/pm/${private_username}`;\r\n        console.log(url);\r\n        request.open('GET', url, true);\r\n        request.send();\r\n    }\r\n    function removeActive() {\r\n        let icons = document.querySelectorAll('.team');\r\n        icons.forEach(element => {\r\n            element.className = 'team';\r\n        });\r\n    }\r\n    function clearChannels() {\r\n        var channel_container = document.querySelector('.channel-container');\r\n        channel_container.innerHTML = '';\r\n    }\r\n    function clearUsers() {\r\n        var user_container = document.querySelector('.user-container');\r\n        user_container.innerHTML = '';\r\n    }\r\n    function clearMessages() {\r\n        mainArea.innerHTML = '';\r\n    }\r\n    function removeChannelActive() {\r\n        let channel_links = document.querySelectorAll('.channel-list');\r\n        channel_links.forEach(element => {\r\n            element.className = \"channel-list\";\r\n        });\r\n    }\r\n    function removeUserActive() {\r\n        let user_links = document.querySelectorAll('.user-list');\r\n        user_links.forEach(element => {\r\n            element.className = 'user-list';\r\n        });\r\n    }\r\n    function createMessage(content, username, id) {\r\n        let messageDiv = document.createElement('div');\r\n        messageDiv.className = \"message shadow-sm\";\r\n        messageDiv.id = id;\r\n        let closeButton = document.createElement('i');\r\n        closeButton.classList = \"far fa-times-circle message-close\";\r\n        messageDiv.appendChild(closeButton);\r\n        let rowDiv = document.createElement('div');\r\n        rowDiv.className = 'row';\r\n        let picDiv = document.createElement('div');\r\n        picDiv.className = 'col-md-1';\r\n        picDiv.innerHTML = '<img src=\"../static/img/icon.png\" alt=\"profilepic\" class=\"profile-picture\">';\r\n        let contentDiv = document.createElement('div');\r\n        contentDiv.className = 'col-md-11';\r\n        contentDiv.innerHTML = `<p>${username}</p><hr><p>${content}</p>`;\r\n        rowDiv.appendChild(picDiv);\r\n        rowDiv.appendChild(contentDiv);\r\n        messageDiv.appendChild(rowDiv);\r\n        mainArea.appendChild(messageDiv);\r\n    }\r\n});\r\n\n\n//# sourceURL=webpack:///./app.ts?");

/***/ })

/******/ });