function showMessage(type, message) {
    const messageContainer = document.querySelector('div.message-container');
    
    messageContainer.style.animation = 'none';
    messageContainer.offsetHeight;
    messageContainer.style.animation = 'messageFadeAnimation .3s ease 1';

    messageContainer.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`
}

function clearMessage() {
    const messageContainer = document.querySelector('div.message-container');
    messageContainer.innerHTML = '';
}