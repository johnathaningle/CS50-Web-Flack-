import * as socketio from "socket.io";
import $ from "jquery";
import { PrivateMessage } from "./models/private_message";
var current_workspace = '';
var current_channel = '';
var baseURL = `http://${document.domain}:${location.port}`;


var private_message = false;
var private_username = '';

$(document).ready(() => {






    //EVENT LISTENERS
    //adding a new channel
    addChannelButton.on('click', (e) => {
        let newChannelField = $('#new-channel-name')
        let name = newChannelField.value;
        name = name.replace(" ", "_");
        this.getChannelUrl(name);
    });

    //changing workspace
    x.each((idx, el) =>  {
        $(el).on("click", () => {
            var heading = $(".navbar-brand");
            this.removeActive();
            this.clearChannels();
            this.clearUsers();
            var text = this.id;
            current_workspace = text;
            this.parentElement.className = "team active";
            heading.text(`# ${text.replace('_',' ')}`);
            this.load_page(text);
        });
    });





});

class Application {
    in_room: boolean
    mainArea: JQuery<HTMLElement>
    sendButton: JQuery<HTMLElement>
    x: JQuery<HTMLElement>
    channel_links: JQuery<HTMLElement>
    addChannelButton: JQuery<HTMLElement>
    heading: JQuery<HTMLElement>;
    // remove a message
    constructor() {
        //Query Selectors
        this.heading = $(".navbar-brand");
        this.sendButton = $('#message-send');
        const messageInput = $("#message-input");

        this.x = $(".team-name");

        this.channel_links = $(".channel-list");
        this.addChannelButton = $("#add-channel-button");
        this.in_room = false;
        this.mainArea = $(".main-area");
        //Socket s
        let io = socketio.listen(baseURL);
        io.on('connect', () => {
            console.log("socket connected");
            io.send('User connected');
        });

        io.on('message', (msg) => {
            console.log(msg);
            if (msg.status == 1) {
                this.getChannelUrl(current_channel);
            }
            if (msg.status == 2) {
                this.getPrivateMessages(private_username);
            }
        });
        //send message
        sendButton.on("click", (e) => {
            let msgText = messageInput.text;
            if (private_message) {
                let message = {'private_message': "True", "reciever": private_username, 'workspace': current_workspace, 'channel': current_channel, 'message': msgText };
                console.log(message);
                io.send(message);
            } else {
                let message = {'private_message': "False", "reciever": "",  'workspace': current_workspace, 'channel': current_channel, 'message': msgText };
                console.log(message);
                io.send(message);
            }
        });
        $(document).on('click', (e) => {
            let element = $(e.currentTarget);
            //load messages and change UI when user clicks on a channel
            if (element.hasClass("channel-list")) {
                this.removeChannelActive();
                this.removeUserActive();

                this.heading.text(element.children().first().text());
                let channelName = element.children().first().text().replace("# ", "");
                private_username = '';
                private_message = false;
                current_channel = channelName;
                this.getChannelUrl(channelName);
                this.in_room = true;
                element.addClass("channel-list active");
            } else if (element.hasClass("channel-item")) {
                this.removeChannelActive();
                this.removeUserActive();
                this.heading.text(element.text());
                let channelName = element.text().replace("# ", "");
                private_username = '';
                private_message = false;
                current_channel = channelName;
                this.in_room = true;
                this.getChannelUrl(channelName);
                element.addClass("active");
            }
            //direct message - if user clicks on username in list for direct message
            if (element.className == "user-list") {
                clearMessages();
                removeChannelActive();
                removeUserActive();
                username = element.firstElementChild.getAttribute('id');
                private_username = username;
                private_message = true;
                getPrivateMessages(username);
                element.className = "user-list active";
            } else if (element.className == "user-item") {
                clearMessages();
                removeChannelActive();
                removeUserActive();
                username = element.getAttribute('id');
                private_username = username;
                private_message = true;
                getPrivateMessages(username);
                element.parentElement.className = "user-list active";
            }
            //close the flashed message
            if (element.className == "far fa-times-circle flash-close") {
                const flashMessage = $('.flash-message');
                const currClasses = flashMessage.addClass;
                flashMessage.className = `${currClasses} hiding`;
            }
            //remove message
            if (element.className == "far fa-times-circle message-close") {
                let messageDivId = element.parentElement.getAttribute('id');
                this.removeMessage(messageDivId);
                this.getChannelUrl(current_channel);
            }
        });
    }
    //API REQUEST S
    //get the list of channels
    load_page(text: string) {
        console.log('searching');
        if (text != "Home" && text != "add-team") {
            var channel_container = $('.channel-container');
            var user_container = $('.user-container');
            var settings: JQueryAjaxSettings = {
                    url: text,
                    method: "GET",
                    success: function() {

                    },
                    error: function() {

                    }
                }
            $.ajax(settings);
            }
        }
    removeMessage(id) {
        const request = new XMLHttpRequest();
        request.onreadystatechange =  () {
            if (this.readyState == 4 && this.status == 200) {
                this.clearMessages();
                this.getChannelUrl(current_channel);
            }
        }
        let url = `/rm/${id}`;
        console.log(url);
        request.open('GET', url, true);
        request.send();
    };

    //get messages when user clicks on channel
    getChannelUrl(name) {
        const request = new XMLHttpRequest();
        request.onreadystatechange =  () {
            if (this.readyState == 4 && this.status == 200) {
                data = this.responseText;
                data = JSON.parse(data);
                clearMessages()
                data.each((idx, el) =>  {
                    createMessage(element.content, element.username, element.id);
                });
            }
        }
        let url = `/${current_workspace}/${name}`;
        console.log(url);
        request.open('GET', url, true);
        request.send();
    }
    //load private messages
    getPrivateMessages(private_username) {
        console.log('getting private messages');
        const request = new XMLHttpRequest();
        request.onreadystatechange =  () {
            if (this.readyState == 4 && this.status == 200) {
                var data = this.responseText;

            }
        }
        var route = `/pm/${private_username}`;
        let settings: JQueryAjaxSettings = {
            url: route,
            method: "GET",
            success: (data: string) => {
                var res: PrivateMessage[] = JSON.parse(data)
                this.clearMessages()
                res.forEach(el => {
                    this.createMessage(el.content, el.username, el.id);
                });
            }
        }
    }
    removeActive() {
        let icons = $('.team');
        icons.each((idx, el) => {
            el.className = "team";
        });
    }
     clearChannels() {
        var channel_container = $('.channel-container');
        channel_container.html("");
    }
     clearUsers() {
        var user_container = $('.user-container');
        user_container.html('');
    }
    clearMessages() {
        this.mainArea.html("mainArea");
    }

     removeChannelActive() {
        let channel_links = $('.channel-list');
            channel_links.each((idx, el) =>  {
                el.className = "channel-list";
        });
    }
     removeUserActive() {
        let user_links = $('.user-list');
        user_links.each((idx, el) =>  {
            el.className = 'user-list';
        });
    }

     createMessage(content, username, id) {
        let messageDiv = document.createElement('div');
        messageDiv.className = "message shadow-sm";
        messageDiv.id = id;
        let closeButton = document.createElement('i');
        closeButton.classList.add("far fa-times-circle message-close");
        messageDiv.appendChild(closeButton);
        let rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        let picDiv = document.createElement('div');
        picDiv.className = 'col-md-1';
        picDiv.innerHTML = '<img src="../static/img/icon.png" alt="profilepic" class="profile-picture">';
        let contentDiv = document.createElement('div');
        contentDiv.className = 'col-md-11';
        contentDiv.innerHTML = `<p>${username}</p><hr><p>${content}</p>`;
        rowDiv.appendChild(picDiv);
        rowDiv.appendChild(contentDiv);
        messageDiv.appendChild(rowDiv);
        this.mainArea.children().pushStack($(messageDiv));
    }



}
    
