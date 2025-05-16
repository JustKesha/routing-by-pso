let CopyUrlElements = document.getElementsByClassName('copy-link');

function copyText(text) {
    navigator.clipboard.writeText(text);
}

function copyUrl(delay = 0) {
    setTimeout(() => {
        navigator.clipboard.writeText(location.href);
    }, delay);
}

Array.prototype.slice.call(CopyUrlElements).forEach(element => {
    element.onclick = function() { copyUrl(50) };
});