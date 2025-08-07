// var el = document.querySelector('.more');
// // var btn = el.querySelector('.more-btn');
// // var menu = el.querySelector('.more-menu');
// var visible = false;
//
// function showMenu(e) {
//     e.preventDefault();
//     if (!visible) {
//         visible = true;
//         el.classList.add('show-more-menu');
//         menu.setAttribute('aria-hidden', false);
//         document.addEventListener('mousedown', hideMenu, false);
//     }
// }
//
// function hideMenu(e) {
//     if (btn.contains(e.target)) {
//         return;
//     }
//     if (visible) {
//         visible = false;
//         el.classList.remove('show-more-menu');
//         menu.setAttribute('aria-hidden', true);
//         document.removeEventListener('mousedown', hideMenu);
//     }
// }
//
// btn.addEventListener('click', showMenu, false);
//
//
// var el1 = document.querySelector('.more1');
// // var btn1 = el.querySelector('.more-btn1');
// var menu1 = el.querySelector('.more-menu1');
// var visible = false;
//
// function showMenu1(e) {
//     e.preventDefault();
//     if (!visible) {
//         visible = true;
//         el1.classList.add('show-more-menu');
//         menu1.setAttribute('aria-hidden', false);
//         document.addEventListener('mousedown', hideMenu, false);
//     }
// }
//
// function hideMenu1(e) {
//     if (btn1.contains(e.target)) {
//         return;
//     }
//     if (visible) {
//         visible = false;
//         el1.classList.remove('show-more-menu');
//         menu1.setAttribute('aria-hidden', true);
//         document.removeEventListener('mousedown', hideMenu1);
//     }
// }
// btn1.addEventListener('click', showMenu1, false);

import moment from '../node_modules/moment';
const USERNAME_REC = "username";
let username = null;
const chatContainer = document.querySelector(".messages");
const usernameContainer = document.querySelector(".username");
let element = document.querySelector(".date");
let message_size = 0;
let sd = '44';
let count = 0;

function renderMessages(messages) {
    chatContainer.innerHTML = "";
    for (const message of messages) {

        let dateElement = document.createElement("date");
        dateElement.className = "dateAdd";

        const messageElement = document.createElement("article");
        messageElement.className = "message";
        messageElement.classList.toggle(
            "message-mine",
            username === message.username
        );
        messageElement.innerHTML = `
        <div class="message-header">
          <div class="message-author">${message.username}</div>
          <button class="message-control"></button>
        </div>
        <p class="message-text"><code>${message.text}</code></p>
        <time class="message-time">${moment(message.timestamp).format('LT')}</time>
      `;
        let chatDate = moment(message.date).format("LL");
            //     message.timestamp.toLocaleString()
            // .split(
            //     'T',
            //     1
            // )[0];
        if (count == 0) {
            dateElement.innerHTML = `<div class="nn">${chatDate}</div>`;
            chatContainer.append(dateElement);
            console.log(chatDate);
            count++;
        }
        if (sd != chatDate) {
            dateElement.innerHTML = `<div class="nn">${chatDate}</div>`;
            chatContainer.append(dateElement);
            console.log(chatDate);
        }
        sd = chatDate;
        chatContainer.appendChild(messageElement);
    }
}

function getMessages(cb) {
    fetch(
        "http://localhost:4000/messages",
        {
            method: "GET",
        }
    )
        .then(function (messagesResponse) {
            if (messagesResponse.status !== 200) {
                throw new Error("Couldn't get messages from server");
            }
            return messagesResponse.json();
        })
        .then(function (messagesList) {
            count =0;
            renderMessages(messagesList);
            if (typeof cb === "function") {
                if (messagesList.length != message_size) {
                    cb();
                    console.log(messagesList.length + " 3 " + message_size);
                }
                console.log(messagesList.length + "  4 " + message_size);
            }
            message_size = messagesList.length;
        });
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

getMessages(scrollToBottom);

function initForm() {
    const formContainer = document.querySelector("#message-form");
    const formTextField = formContainer.querySelector("textarea");
    const formSubmitButton = formContainer.querySelector("#submit_button");
    const usernameField = formContainer.querySelector("input[name=username]");
    usernameField.value = username;
    formContainer.onsubmit = function (evt) {
        evt.preventDefault();
        const formData = new FormData(evt.target);
        const messageData = {
            username: formData.get("username"),
            text: formData.get("text"),
        };
        formTextField.disabled = true;
        formSubmitButton.disabled = true;
        formSubmitButton.textContent = "Сообщение отправляется...";
        // formTextField.value = "Сообщение отправляется...";
        fetch(
            "http://localhost:4000/messages",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(messageData),
            }
        )
            .then(function (newMessageResponse) {
                if (newMessageResponse.status != 200) {
                    alert("Ошибка 400. Скорее всего имя короткое");
                    localStorage.removeItem(USERNAME_REC);
                    chatContainer.innerHTML = "";
                    clearInterval(intervalId);
                    message_size -= message_size;
                    initApp();
                    console.log(
                        "error",
                        newMessageResponse.error
                    );
                }
                formTextField.disabled = false;
                formTextField.value = "";
                formSubmitButton.disabled = false;
                formSubmitButton.textContent = "Отправить";
                getMessages(scrollToBottom);
            });
    }
}

let intervalId;

function initChat() {
    // HTTP
    // Request --> Response
    // Polling
    // Websocket
    // Message <--> Message
    getMessages(scrollToBottom);
    intervalId = setInterval(
        getMessages,
        3000,
        scrollToBottom
    );
    initForm();
    // Как правильно скроллить?
    // - Когда мы сами отправили [новое сообщение]
    // - Когда мы находимся внизу списка и пришло [новое сообщение]
    // - Когда мы только загрузили страницу
    // | | | | | | | | | |
    //        | ||  ||| |
}

function initUsernameForm() {
    const usernameForm = usernameContainer.querySelector("form");
    usernameForm.onsubmit = function (evt) {
        evt.preventDefault();
        const formElement = evt.target;
        const formData = new FormData(formElement);
        const enteredUsername = formData.get("username");

        fetch("http://localhost:4000/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                                     "username": enteredUsername,
                                 }),
        })
            .then(function(authResponse) {
                if (authResponse.status !== 200) {
                    alert("YTnnnnnnnn")
                }

                return authResponse.json();
            })
            .then(function(authResponseData) {
                localStorage.setItem(USERNAME_REC, authResponseData.user_id);

                usernameContainer.close();
                usernameForm.onsubmit = null;

                initApp();
            });


        localStorage.setItem(
            USERNAME_REC,
            enteredUsername
        );
        // usernameContainer.close();
        // usernameForm.onsubmit = null;
        // initApp();
    };
    usernameContainer.showModal();
}

// Модальное приложение
// Модальность — зависимость от состояния
// В нашем случае режим переключается наличием username
// - есть username — режим чата
// - нет username — режим ввода username
function initApp() {
    username = localStorage.getItem(USERNAME_REC);
    if (username === null) {
        initUsernameForm();
        window.location.href = 'entrance.html';
        // initUsernameForm();
    }
    initChat();
}

initApp();
const button = document.getElementById('myButton');
// Добавляем обработчик клика
button.addEventListener(
    'click',
    function () {
        localStorage.removeItem(USERNAME_REC);
        chatContainer.innerHTML = "";
        clearInterval(intervalId);
        message_size -= message_size;
        initApp();
        // alert('Кнопка нажата!');
    }
);