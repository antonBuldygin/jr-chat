const usernameContainer = document.querySelector(".entrance_frame");
const USERNAME_REC = "username"
function initUsernameForm() {
    const usernameForm = usernameContainer.querySelector("form");
    usernameForm.onsubmit = function (evt) {
        evt.preventDefault();
        const formElement = evt.target;
        const formData = new FormData(formElement);
        const enteredUsername = formData.get("username");
        localStorage.setItem(
            USERNAME_REC,
            enteredUsername
        );


        window.location.href = 'chat_2.html';

        usernameContainer.close();
        usernameForm.onsubmit = null;
    };
    // usernameContainer.showModal();
}

initUsernameForm();