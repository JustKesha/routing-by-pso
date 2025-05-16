const THEMES = {
    DARK: 'dark',
    LIGHT: 'light',
    SOFT: 'soft',
    BLUE: 'blue',
    YELLOW: 'yellow',

    SECRET1: 'secret_1',
    SECRET2: 'secret_2',
    SECRET3: 'secret_3',

    DEFAULT: 'dark',
}
const LS_THEME_KEY = 'theme';
const LS_SECRET_KEY = 'honkhonk';
const THEME_BUTTON_PREFIX = 'theme_';
const SECRET_MESSAGE = {
    'en': 'You have unlocked hidden themes!\nGo to settings to switch.',
    'ru': 'Вы разблокировали специальные темы!\nПерейдите в настройки для смены.',
}

function addCss(fileName) {
    var head = document.head;
    var link = document.createElement("link");

    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = fileName;

    head.appendChild(link);
}
function getThemePath(theme) {
    let currentUrl = window.location.href;
    let prefix = './';
    
    if( currentUrl.includes('settings') ||
        currentUrl.includes('editor') )
        prefix = '../'
        
    if (currentUrl.includes('ru'))
        prefix += '../'
    
    return prefix + `styles/themes/${theme}.css`;
}
function updateThemeButtons(active_theme) {
    let secretUnlocked = localStorage.getItem(LS_SECRET_KEY);

    Object.values(THEMES).forEach(theme => {
        let theme_button = document.getElementById(THEME_BUTTON_PREFIX + theme);

        if (theme_button)
            if (theme == active_theme) {
                theme_button.classList.add('attention');
                theme_button.classList.add('attention-secondary');
            } else {
                theme_button.classList.remove('attention');
                theme_button.classList.remove('attention-secondary');
            }

            if (theme.includes('secret') && !secretUnlocked) {
                theme_button.classList.add('hidden');
            }
    });
}
function getLanguage() {
    let currentUrl = window.location.href;
    if (currentUrl.includes('ru'))
        return 'ru';
    
    return 'en';
}
function secretUnlock() {
    localStorage.setItem(LS_SECRET_KEY, true);
    
    alert(SECRET_MESSAGE[getLanguage()]);
}
function checkSecrets() {
    let secretUnlocked = localStorage.getItem(LS_SECRET_KEY);

    if(secretUnlocked) {
        let btn = document.getElementById('secret_unlock');
        if(btn) btn.classList.add('hidden');
    }
}


function getTheme() {
    let localTheme = localStorage.getItem(LS_THEME_KEY);

    if (!localTheme)
        return THEMES.DEFAULT;

    return localTheme;
}

function setTheme(theme) {
    applyTheme(theme);
    saveTheme(theme);
}

function applyTheme(theme) {
    addCss(getThemePath(theme));
    updateThemeButtons(theme);
}

function saveTheme(theme, reload = false) {
    localStorage.setItem(LS_THEME_KEY, theme);
    if (reload)
        location.reload();
}



applyTheme(getTheme());
checkSecrets();