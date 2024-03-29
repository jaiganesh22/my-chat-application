
async function add_message(msg, scroll) {
    var message = msg["content"];
    var file_dirs = msg["file_dirs"];
    file_dirs = file_dirs.split(",");
    var chat_room = msg["chat_room"];
    var usr_name = msg["sender"];
    let datetime = msg["datetime"];
    let todays_date = new Date();
    if (todays_date.getMonth() >= 9)
        todays_date = `${todays_date.getFullYear()}-${todays_date.getMonth() + 1}-${todays_date.getDate()}`;
    else
        todays_date = `${todays_date.getFullYear()}-0${todays_date.getMonth() + 1}-${todays_date.getDate()}`;
    let [date, time] = datetime.split(" ");
    time = time.split(".");
    var logged_usr_name = await load_name();

    var message_div = document.getElementById("messages");
    let content = document.createElement("div");


    content.classList.add("message");
    let m_p = document.createElement("p");
    let profile_img_path = await get_profile_img_path(usr_name);
    let s_index = profile_img_path.indexOf("profile-images");
    profile_img_path = "../static/" + profile_img_path.substring(s_index);
    m_p.classList.add("msg");
    m_p.innerHTML = `
                        <img src=${profile_img_path} class="profile-icon">    
                        <span class="usr-name">${usr_name}</span>: ${message}
    `;

    let base_dir = "../static/chat-files";
    for(let i=0;i<file_dirs.length;i++){
        if(file_dirs[i] != ""){
            let c_dir = base_dir + '/' + file_dirs[i];
            m_p.innerHTML += `
                                <img src=${c_dir} class="msg-img">
            `; 
        }
    }

    let d_p = document.createElement("p");
    d_p.classList.add("date-time");
    if (date == todays_date) {
        d_p.textContent = '- ' + time[0];
    }
    else {
        d_p.textContent = '- ' + date;
    }
    content.appendChild(m_p);
    content.appendChild(d_p);

    let m_span = m_p.childNodes[3];
    m_span.addEventListener("mouseenter", async function (e) {
        let c_span = e.target;
        let message_div = c_span.parentElement.parentElement;
        let c_usr_name = c_span.textContent;

        let add_friend_div = document.createElement("div");
        add_friend_div.classList.add("add-friend-div");

        let profile_icon = document.createElement("img");
        let profile_img_path = await get_profile_img_path(usr_name);
        let s_index = profile_img_path.indexOf("profile-images");
        profile_img_path = "../static/" + profile_img_path.substring(s_index);
        profile_icon.setAttribute("src", profile_img_path);
        profile_icon.classList.add("profile-icon");

        let add_m_p = document.createElement("a");
        add_m_p.setAttribute("href", `/friend_request/${c_usr_name}`);
        add_m_p.classList.add("add-friend");
        add_m_p.innerHTML = `Add friend:${c_usr_name}`;

        add_friend_div.appendChild(profile_icon);
        add_friend_div.appendChild(add_m_p);
        if (message_div.childNodes.length < 3) {
            message_div.prepend(add_friend_div);
        };
    })
    content.addEventListener("mouseleave", (e) => {
        let m_div = e.target;

        let p_div = m_div.childNodes[0];
        let divx = m_div.childNodes;
        console.log(divx);
        if (p_div.classList.contains("add-friend-div")) {
            p_div.remove();
        }
    })

    if (logged_usr_name != usr_name) content.classList.add("right");
    message_div.appendChild(content);

    if (scroll) {
        scrolltobottom("messages");
    }
}

function scrolltobottom(id) {
    var div = document.getElementById(id);
    $("#" + id).animate({
        scrollTop: div.scrollHeight - div.clientHeight,
    },
        500);
}

async function load_name() {
    return await fetch("/get_name")
        .then(async function (response) {
            return await response.json();
        })
        .then(async function (text) {
            return await text["name"];
        });
}


async function load_rooms() {
    return await fetch("/get_rooms")
        .then(async function (response) {
            console.log(response);
            return await response.json();
        })
        .then(function (text) {
            return text;
        })
}

async function get_messages(room_name) {
    return await fetch(`/get_messages/${room_name}`)
        .then(async function (response) {
            console.log(response);
            return await response.json();
        })
        .then(function (text) {
            return text;
        })
}

async function get_profile_img_path(username) {
    return await fetch("/get_profile_img/" + username)
        .then(async function (response) {
            return await response.json();
        });
}

var username = load_name();

async function add_chat_rooms() {
    var rooms_container = document.getElementById("rooms-container");
    var rooms = await load_rooms();
    console.log(rooms);
    for (let i = 0; i < rooms.length; i++) {
        let room = rooms[i];
        var room_name = i == 0 ? room["chat_room"] : room["friend"];
        let load_name = room["chat_room"];
        var freind_name = room["friend"];
        room_name = room_name.toUpperCase();
        let profile_img_path = await get_profile_img_path(freind_name);
        let s_index = profile_img_path.indexOf("profile-images");
        profile_img_path = "../static/" + profile_img_path.substring(s_index);

        let room_div = document.createElement("div");
        let room_div_image = document.createElement("img");
        let room_div_h4 = document.createElement("h4");
        let room_div_hr = document.createElement("hr");

        room_div.classList.add("chat-room")
        room_div_image.setAttribute("src", profile_img_path);
        room_div_image.classList.add("profile-icon");
        room_div_h4.textContent = room_name;

        room_div.appendChild(room_div_image);
        room_div.appendChild(room_div_h4);
        room_div.addEventListener("click", async function (e) {
            load_chat(load_name, room_name);
        });
        rooms_container.appendChild(room_div);
        rooms_container.appendChild(room_div_hr);
    }
    load_chat(rooms[0]["chat_room"], rooms[0]["chat_room"]);
}

async function load_chat(chat_room, room_name) {
    var chat_container = document.getElementById("chat-container");
    var chat_room_header = document.getElementById("chat-room-header");
    chat_room_header.textContent = room_name.toUpperCase();
    var message_div = document.getElementById("messages");
    message_div.innerHTML = ``;
    let messages = await get_messages(chat_room.toLowerCase());
    let scroll = false;
    for (let i = 0; i < messages.length; i++) {
        msg = messages[i];
        if (i == messages.length - 1) {
            scroll = true;
        }
        if(msg['msg_type'] == 'text/img')
            add_message(msg, scroll);
    }
}

add_chat_rooms();

let chat_file_upload = document.querySelector("#chat-file");
let file_button = document.querySelector("#file-upload");

file_button.addEventListener("click", function(e) {
    e.preventDefault();
    chat_file_upload.click();
})

chat_file_upload.addEventListener("change", function(e) {
    e.preventDefault();
    let message_input_div = document.querySelector(".message-input");
    let new_div = document.createElement("div");
    let p1 = document.createElement("p");
    p1.textContent = "Selected Files: ";
    let ins = document.getElementById('chat-file').files.length;
    new_div.appendChild(p1);
    new_div.classList.add("selected-files");
    
    for(let x=0;x<ins;x++){
        let new_p = document.createElement("p");
        new_p.textContent = document.getElementById('chat-file').files[x].name;
        new_div.appendChild(new_p);
    }
    message_input_div.appendChild(new_div);
})

var socket = io.connect('/', { transports: ['websocket'] });
socket.on("connect", async function () {
    setTimeout(function (){},5000);
    var usr_name = await load_name();
    var room_name = document.getElementById("chat-room-header").textContent;
    var datetime = new Date();
    if (usr_name != "") {
        socket.emit("receive_message", {
            content: usr_name + " just connected to the server!",
            chat_room: room_name,
            sender: usr_name,
            connect: true,
            msg_type: 'text/img',
            file_dirs: '',
        });
        socket.emit("receive_message", {
            content: "<----- Welcome to the server " + usr_name + " ----->",
            chat_room: room_name,
            sender: usr_name,
            connect: true,
            msg_type: 'text/img',
            file_dirs: '',
        });
    }
    var send_message = $("button#send").on("click", async function (e) {
        e.preventDefault();


        let msg_input = document.getElementById("msg");
        let user_input = msg_input.value;
        let user_name = await load_name();
        let room_name = document.getElementById("chat-room-header").textContent;

        let form_data = new FormData();
        let ins = document.getElementById('chat-file').files.length;
        let file_names = "";
        for(let x=0;x<ins;x++){
            form_data.append("files[]", document.getElementById('chat-file').files[x]);
            file_names += document.getElementById('chat-file').files[x].name + ',';
        }
        $.ajax({
            url: "https://" + document.domain + ":" + location.port + "/user/chat-file-upload", 
            dataType: 'json', 
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            type: 'post',
            success: function (response) { 
                console.log(response.message);
            },
            error: function (response) {

            }
        });

        msg_input.value = "";

        user_input_list = user_input.split(" ");

        if(user_input != ""){
            if (user_input_list[0] == "/bot") {
                socket.emit("receive_message", {
                    content: user_input,
                    chat_room: room_name,
                    sender: user_name,
                    bot: true,
                    msg_type: 'text/img',
                    file_dirs: file_names,
                });
            }
            else {
                socket.emit("receive_message", {
                    content: user_input,
                    chat_room: room_name,
                    sender: user_name,
                    msg_type: 'text/img',
                    file_dirs: file_names,
                });
            }
        }

        

        let selected_files = document.querySelector(".selected-files");
        selected_files.remove();
    });
});

socket.on("disconnect", async function () {
    var user_name = await load_name();
    var room_name = document.getElementById("chat-room-header").textContent;
    socket.emit("receive_message", {
        content: user_name + " just left the server...",
        chat_room: room_name,
        sender: user_name,
        msg_type: 'text/img',
        file_dirs: '',
    });
});

socket.on("message response", function (msg) {
    if(msg['msg_type'] == 'text/img')
        add_message(msg, true);
});










