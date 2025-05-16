let OverflowContent = [];
let CodeElements = document.getElementsByClassName('code-block');
const OverflowAtCharacters = 500;

function unfold(id){
    let content = OverflowContent[id];
    if(!content) return;
    document.getElementById(id).getElementsByTagName('code')[0].innerHTML = content;
    Array.prototype.slice.call(document.getElementById(id).getElementsByTagName('a')).forEach(a => {
        let onclickStr = a.onclick + '';
        if(onclickStr)
        if(onclickStr.includes('unfold')){
            a.classList.add('hidden');
        } else
        if(onclickStr.includes('fold')){
            a.classList.remove('hidden');
        }
    });
}

function fold(id){
    let element = document.getElementById(id);
    let content = element.getElementsByTagName('code')[0].innerText;

    if(!OverflowContent[element.id])
    element.getElementsByClassName('settings')[0].innerHTML += `
    <a onclick="unfold('${element.id}');">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 8.5V4M4 4H8.5M4 4L9.5 9.5M20 8.5V4M20 4H15.5M20 4L14.5 9.5M4 15.5V20M4 20H8.5M4 20L9.5 14.5M20 15.5V20M20 20H15.5M20 20L14.5 14.5"/>
        </svg>
    </a>
    <a onclick="fold('${element.id}');" class="hidden">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V6a2 2 0 0 1 2-2h2m8 0h2a2 2 0 0 1 2 2v2m0 8v2a2 2 0 0 1-2 2h-2m-8 0H6a2 2 0 0 1-2-2v-2"/>
        </svg>
    </a>`;

    OverflowContent[element.id] = content;
    element.getElementsByTagName('code')[0].innerText = content.slice(0, OverflowAtCharacters) + ' ...';

    Array.prototype.slice.call(document.getElementById(id).getElementsByTagName('a')).forEach(a => {
        let onclickStr = a.onclick + '';
        if(onclickStr)
        if(onclickStr.includes('unfold')){
            a.classList.remove('hidden');
        } else
        if(onclickStr.includes('fold')){
            a.classList.add('hidden');
        }
    });
}

Array.prototype.slice.call(CodeElements).forEach(element => {
    let content = element.getElementsByTagName('code')[0].innerText;
    if(content.length > OverflowAtCharacters) {
        fold(element.id);
    }
});