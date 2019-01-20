var current_workspace = '';
document.addEventListener("DOMContentLoaded", function() {
    console.log("ready");
    var x = document.querySelectorAll(".team-name");
    console.log(x);
    const heading = document.querySelector(".navbar-brand");
    var channel_links = document.querySelectorAll('.channel-list');
    const addChannelButton = document.querySelector('#add-channel-button');

    addChannelButton.addEventListener('click', function(e) {
        let newChannelField = document.querySelector('#new-channel-name')
        let name = newChannelField.value;
        name = name.replace(" ", "_");
        getChannelUrl(name);
    });

    document.addEventListener('click', function(e){
        let element = e.target;
        console.log(element);
        if (element.className == "channel-list") {
            removeChannelActive();
            heading.innerText = element.firstElementChild.innerText;
            getChannelUrl(element.firstElementChild.innerText.replace("# ", ""));
            element.className = "channel-list active";
        } else if (element.className == "channel-item") {
            removeChannelActive();
            heading.innerText = element.innerText;
            getChannelUrl(element.innerText.replace("# ", ""));
            element.parentElement.className = "channel-list active";
        }
    });

    x.forEach(element => {
        element.addEventListener("click", function(e){
            removeActive();
            clearChannels();
            text = this.id;
            current_workspace = text;
            this.parentElement.className = "team active";
            heading.innerText = `# ${text.replace('_',' ')}`;
            load_page(text);
        });
    });

    function load_page(text) {
        console.log('searching');
        if (text != "Home") {
            var channel_container = document.querySelector('.channel-container');
        const request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                data = this.responseText;
                data = JSON.parse(data);
                if (data) {
                    data.forEach(item => {
                        let newDiv = document.createElement('div');
                        let ptag = document.createElement("p");
                        newDiv.className = 'channel-list';
                        ptag.innerHTML = `# ${item}`;
                        ptag.className = 'channel-item';
                        newDiv.appendChild(ptag);
                        channel_container.appendChild(newDiv);
                    });
                }
            }
        }
        request.open('GET', `/${text}`, true);
        request.send();
        }
    };

    function removeActive() {
        let icons = document.querySelectorAll('.team');
        icons.forEach(element => {
            element.className = 'team';
        });
    }

    function clearChannels() {
        var channel_container = document.querySelector('.channel-container');
        channel_container.innerHTML='';
    }

    function removeChannelActive() {
        let channel_links = document.querySelectorAll('.channel-list');
            channel_links.forEach(element => {
                element.className = "channel-list";
            });
    }

    function getChannelUrl(name) {
        const request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                data = this.responseText;
                data = JSON.parse(data);
                data.forEach(element => {
                    console.log(element);
                });
            }
        }
        let url = `/${current_workspace}/${name}`;
        console.log(url);
        request.open('GET', url, true);
        request.send();
    }
});
    
