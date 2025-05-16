const SpeedPresets = [
    { min: .1, max: .35 },
    { min: .25, max: 0.85 },
    { min: 0.75, max: 1.5 }
]
const DefaultSettings = {
    'entites_count': 2200,
    'default_objectives_count': 2,
    'communication_radius': 6,
    'collision': false,
    'entity_min_speed': structuredClone(SpeedPresets[1].min),
    'entity_max_speed': structuredClone(SpeedPresets[1].max),
    'entity_size': .75,
    'objective_speed': 0,
    'objective_size': 5,
    'objective_throughput': 0,
    'colors': true,
    'mono_color': false,
    'display_connections': true,
    'display_objectives': true,
    'display_entities': true,
    'display_directions': false,
    'optimized_view': true,
    'optimized_view_gap': 3,
    'glow': 10,
    'walls_collision': true,
    'display_barriers': true,
    'draw_fps': 80,
    'update_fps': 80,
    'fps_preset': 2,
    'import_map_zoom': 100,
    'import_walls': true,
    'import_roads': false,
    'display_roads': true,
    'only_log_good_connections': true,
    'autofill': true,
    'ent_brush_stack': 250,
    'auto_reassign_objectives': true,
    'grid': 3,
    'transparent_background': true,
    'optimized_view_opac': 15,
}
let HideSettingsInEdit = false;
let DirectionMarkerWidthMult = .75;
let DirectionMarkerDistMult = 1.75;
let DirectionMarkerWidthMultObj = DirectionMarkerWidthMult*1.25;
let DirectionMarkerDistMultObj = DirectionMarkerDistMult/1.75;
let WallWidthMult = 1;
let CStyles = window.getComputedStyle(document.body);
let SnapperGridColor = '';
const SnapperGridWidth = 5;
const SnapperGridMinDG = 1;
let ConnectionColors = {
    'default': '',
    'success': '',
    'useful':  '#48f8b9',
}
const ConnectionSizeMult = { // Relative to entity size
    'default': .005,
    'success': .05,
    'useful':  .075,
}
const FpsPresets = [
    1,
    15,
    60
]
const HomePageSettings = {
    'entites_count': 2500,
    'default_objectives_count': 2,
    'objective_throughput': 0,
    'communication_radius': 8,

    'entity_min_speed': structuredClone(SpeedPresets[1].min),
    'entity_max_speed': structuredClone(SpeedPresets[1].max),
    
    'objective_size': 8,

    'colors': false,
    'optimized_view': true,
    'optimized_view_gap': 2.5,
    'display_entities': false,
    'display_connections': false,
    'fps_preset': 2,
    'autofill': true,
    'glow': 1.25,
}
const SettingPresets = {
    'default': structuredClone(DefaultSettings),
    'home_page': structuredClone(HomePageSettings),
    'basic': {
        'optimized_view': false,
        'display_connections': false,

        'display_entities': true,
        'display_directions': true,

        'entity_size': 1,
        'colors': true,
        'mono_color': false,
        'glow': 10,
    },
    'optimal': {
        'display_entities': false,
        'display_connections': false,
        'display_directions': false,
        
        'optimized_view': true,
        'optimized_view_gap': 3,
        'entity_size': structuredClone(DefaultSettings.entity_size),
        
        'colors': true,
        'mono_color': true,
        'glow': 1,
    },
    'connections': {
        'optimized_view': false,
        'display_entities': false,
        'entity_size': structuredClone(DefaultSettings.entity_size),

        'display_connections': true,
        'only_log_good_connections': true,

        'mono_color': false,
        'glow': 10,
    },
}
const HTMLID = {
    pause: 'PAUSE_BUTTON',
    continue: 'CONTINUE_BUTTON',
    nextframe: 'NEXTFRAME_BUTTON',
    advancedsettingsshow: 'advanced-settings-show',
    advancedsettingshide: 'advanced-settings-hide',
    advancedsettings: 'advanced-settings-block',
    speedpreset: 'speed-x',
    fpspreset: 'fps-v',
    playingmodepanel1: 'playing-top-panel',
    playingmodepanel2: 'playing-bottom-panel',
    editmodepanel1: 'edit-top-panel',
    editmodepanel2: 'edit-bottom-panel',
    brushbuttonprefix: 'brush-',
    gridbuttonprefix: 'grid-',
    mapexportcode: 'map-export-code',
    mapimportcode: 'map-import-code',
    coordsimport: 'coords-import',
}
const HideButtonClass = 'hidden';
var colors = {
    background: '',
    background_editor: '',
    entities: '',
    objectives: ['#e85454', '#76d556', '#6689de', '#f0f25f', 'orange', 'pink', 'cyan', 'white']
}
var PlayingModes = {
    edit: 'editing',
    pause: 'paused',
    play: 'playing'
}

let Canvas = document.getElementById('Canvas');
let CanvasContext = Canvas.getContext('2d');
let PlayingMode = PlayingModes.edit;
let ColonyInitialState = {
    entities: [],
    objectives: [],
    barriers: [],
    roads: []
};
let Colony;
let Settings;
let BrushMode;
let GridSnappingMode;

function updateColorScheme() {
    CStyles = window.getComputedStyle(document.body);

    colors.background = CStyles.getPropertyValue('--dark');
    colors.background_editor = CStyles.getPropertyValue('--gray');
    colors.entities = CStyles.getPropertyValue('--light');

    ConnectionColors.success = CStyles.getPropertyValue('--main');
    ConnectionColors.default = CStyles.getPropertyValue('--light');

    SnapperGridColor = CStyles.getPropertyValue('--dark');
}
updateColorScheme();

const PlaneRealWidth = 300;
const PlaneRealHeight = 100;
let CanvasOnePercentWidth = 1, COPW = 1;
let CanvasOnePercentHeight = 1, COPH = 1;
function CanvasX_2_ColonyX(val) {
    return PlaneRealWidth * (val/Canvas.width);
}
function CanvasY_2_ColonyY(val) {
    return PlaneRealHeight * (val/Canvas.height);
}
function ResizeCanvas() {
    let wrapper = document.getElementById('main-canvas-holder');
    Canvas.width = wrapper.clientWidth;
    Canvas.height = wrapper.clientWidth / 3;

    CanvasOnePercentWidth = Canvas.width/PlaneRealWidth;
    CanvasOnePercentHeight = Canvas.height/PlaneRealHeight;
    COPW = CanvasOnePercentWidth;
    COPH = CanvasOnePercentHeight;

    UpdateColonyPlaneBorders();
    ColonyBoundElements();
};
window.addEventListener('resize', ResizeCanvas);
ResizeCanvas();

let MouseBoxRange = 10;
let BrushCD = 0;
let SettingUpWall = false;
let MousePos = { x: 0, y: 0 };

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}
window.addEventListener("mousemove", (event) => {
    MousePos = getMousePos(Canvas, event);
});

let MouseDown = false;
window.addEventListener("mousedown", () => {
    MouseDown = true;
});
window.addEventListener("mouseup", () => {
    MouseDown = false;
});

function random(min, max) {
    // Max & minimum are inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function MonoColorRGB(fromSettings, A = null) {
    let out = `${fromSettings['mono_color_r']}, ${fromSettings['mono_color_g']}, ${fromSettings['mono_color_b']}`;
    if(A != null)
        out += `, ${A}`;
    return out;
}
function GetMonoColor(fromSettings, A = null) {
    return `rgb(${MonoColorRGB(fromSettings, A)})`
}

// Settings of the colony
function UpdateSettingHTML(SettingID) {
    let SettingHTML = document.getElementById(SettingID);
    if(!SettingHTML) return;
    // Switch buttons
    if(Settings[SettingID] === true) {
        SettingHTML.getElementsByTagName('button')[0].classList.remove(HideButtonClass);
        SettingHTML.getElementsByTagName('button')[1].classList.add(HideButtonClass);
    } else
    if(Settings[SettingID] === false) {
        SettingHTML.getElementsByTagName('button')[1].classList.remove(HideButtonClass);
        SettingHTML.getElementsByTagName('button')[0].classList.add(HideButtonClass);
    } else {
    // Input value
        let input = SettingHTML.getElementsByTagName('input')[0];
        if(input) input.value = Settings[SettingID];
    }
}
function UpdateSettingsHTML() {
    Object.keys(Settings).forEach(SettingID => { UpdateSettingHTML(SettingID); });
}
function UpdateSwarmSetting(SettingID, SaveUpdate = true) {
    switch(SettingID) {
        case 'ent_brush_stack':
        case 'objective_throughput':
        case 'entites_count':
        case 'default_objectives_count':
        case 'grid':
            if(Settings[SettingID] != Math.floor(Settings[SettingID]))
                SettingsSet(SettingID, Math.floor(Settings[SettingID]), SaveUpdate);
            break;
        case 'only_log_good_connections':
            if(!Settings[SettingID] && SaveUpdate)
                SettingsSet('display_connections', true, SaveUpdate);
            Colony.entity.onlyLogGoodConnections = Settings[SettingID];
            break;
        case 'display_connections':
            if(!Settings[SettingID] && SaveUpdate)
                SettingsSet('only_log_good_connections', true, SaveUpdate);
            Colony.entity.logConnections = Settings[SettingID];
            break;
        case 'communication_radius':
            Colony.entity.communicationRadius = Settings[SettingID];
            break;
        case 'entity_size':
            Colony.entity.hitbox.height = Settings[SettingID];
            Colony.entity.hitbox.width = Settings[SettingID];
            break;
        case 'mono_color':
            if(Settings[SettingID] && SaveUpdate)
                SettingsSet('colors', true, SaveUpdate);
            break;
        case 'colors':
            if(!Settings[SettingID] && SaveUpdate)
                SettingsSet('mono_color', false, SaveUpdate);
            break;
        case 'entity_min_speed':
        case 'entity_max_speed':
            if(SaveUpdate || inCinemaMode)
                UpdateEntitiesSpeed();
            break;
        case 'collision':
            Colony.entity.collision = Settings[SettingID];
            break;
        case 'objective_size':
            Colony.objective.hitbox.height = Settings[SettingID];
            Colony.objective.hitbox.width = Settings[SettingID];
            break;
        case 'objective_speed':
            Colony.objective.speed = Settings[SettingID];
            break;
        case 'objective_throughput':
            Colony.objective.cooldownFrames = Settings[SettingID];
            break;
        case 'display_entities':
            break;
        case 'walls_collision':
            Colony.plane.collideWalls = Settings[SettingID];
            break;
    }
}
function UpdateSwarmSettings() {
    Object.keys(Settings).forEach(SettingID => { UpdateSwarmSetting(SettingID); });
}
function UpdateSpeedPresets() {
    for(i = 0; i < SpeedPresets.length; i++){
        let el = document.getElementById(HTMLID.speedpreset+i);
        if(el)
        if(SpeedPresets[i].min == Settings['entity_min_speed'] && SpeedPresets[i].max == Settings['entity_max_speed']) {
            el.classList.add('attention');
        } else
            el.classList.remove('attention');
    }
}
function ApplySpeedPreset(index, notUserInput) {
    SettingsSet('entity_max_speed', SpeedPresets[index].max, notUserInput);
    SettingsSet('entity_min_speed', SpeedPresets[index].min, notUserInput);
    let el = document.getElementById(HTMLID.speedpreset+index);
    if(el)
        el.classList.add('attention');
}
function ApplyFpsSettings(variant, notUserInput) {
    UpdateFPS = FpsPresets[variant] ?? 60;
    DrawFPS = UpdateFPS;
    SettingsSet('draw_fps', DrawFPS, notUserInput);
    SettingsSet('update_fps', UpdateFPS, notUserInput);
    for(i = 0; i < 3; i++) {
        let el = document.getElementById(HTMLID.fpspreset+i);
        if(el)
            el.classList.remove('attention');
    }
    let el = document.getElementById(HTMLID.fpspreset+variant);
    if(el)
        el.classList.add('attention');
}
function SaveSettings() {
    localStorage.setItem('settings', JSON.stringify(Settings));
}
function SaveColonyAsCurrentInitial() {
    ColonyInitialState.entities = JSON.parse(JSON.stringify(Colony.entities));
    ColonyInitialState.objectives = JSON.parse(JSON.stringify(Colony.objectives));
    ColonyInitialState.barriers = JSON.parse(JSON.stringify(Colony.barriers));
    ColonyInitialState.roads = JSON.parse(JSON.stringify(Colony.roads));
}
function SaveColonyState() {
    ColonyRemoveShortWalls();
    SaveColonyAsCurrentInitial();
    localStorage['colony'] = JSON.stringify(ColonyInitialState);
    
    let codeExportBlock = document.getElementById(HTMLID.mapexportcode);
    if(codeExportBlock) codeExportBlock.innerText = JSON.stringify({
        objectives: Colony.objectives,
        barriers: Colony.barriers,
    });
    if(!inCinemaMode)
        updateShareMapUrl(null);
}
function UpdateColonyPlaneBorders() {
    if(!Colony) return;
    Colony.plane.xMax = PlaneRealWidth;
    Colony.plane.yMax = PlaneRealHeight;
}
function ColonyBoundElements() {
    if(!Colony) return;
    Colony.objectives.forEach(objective => {
        if(objective.x+Colony.objective.hitbox.width/2 > Colony.plane.xMax) objective.x = Colony.plane.xMax-Colony.objective.hitbox.width/2;
        if(objective.y+Colony.objective.hitbox.height/2 > Colony.plane.yMax) objective.y = Colony.plane.yMax-Colony.objective.hitbox.height/2;
    });
    Colony.entities.forEach(entity => {
        if(entity.x+Colony.entity.hitbox.width/2 > Colony.plane.xMax) entity.x = Colony.plane.xMax-Colony.entity.hitbox.width/2;
        if(entity.y+Colony.entity.hitbox.height/2 > Colony.plane.yMax) entity.y = Colony.plane.yMax-Colony.entity.hitbox.height/2;
    });
}
function LoadSettings(forceDefault = false, theDefault = structuredClone(DefaultSettings)) {
    const StorageSettings = localStorage.getItem('settings');
    if(StorageSettings && !forceDefault){
        Settings = JSON.parse(StorageSettings);
    } else {
        Settings = structuredClone(theDefault);
    }
    UpdateSettingsHTML();
}
function UpdateSettingsWith(preset, notUserInput = false) {
    let prst = structuredClone(preset)
    Object.keys(prst).forEach(key => {
        SettingsSet(key, prst[key], notUserInput);
    });
}
async function loadMapWithOverpass(coordinates, loadBuildings = true, loadRoads = true, onlyHighways = false) {
    let requestBody = '[out:json][timeout:2500];(';

    if(loadBuildings) requestBody += `way(${coordinates[0]},${coordinates[1]},${coordinates[2]},${coordinates[3]})["building"];`;
    if(loadRoads) {
        if(!onlyHighways) {
            requestBody += `way(${coordinates[0]},${coordinates[1]},${coordinates[2]},${coordinates[3]})["highway"];`;
        } else {
            requestBody += `way(${coordinates[0]},${coordinates[1]},${coordinates[2]},${coordinates[3]})["highway"="trunk"];`;
            requestBody += `way(${coordinates[0]},${coordinates[1]},${coordinates[2]},${coordinates[3]})["highway"="primary"];`;
        }
    }

    requestBody += ');out geom;'

    const api = await fetch(
        'https://www.overpass-api.de/api/interpreter?',
        {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, // v- bottom_left/top_right
            body:requestBody
        } // ^- returns both nodes and ways
    );
    
    const answer = await api;

    return answer.json();
}
function RangeToRange(OldValue, OldRangeMin, OldRangeMax, NewRangeMin, NewRangeMax) {
    const OldRange = (OldRangeMax - OldRangeMin);
    const NewRange = (NewRangeMax - NewRangeMin);
    const NewValue = (((OldValue - OldRangeMin) * NewRange) / OldRange) + NewRangeMin;
    
    return NewValue;
    // -> https://stackoverflow.com/questions/929103/convert-a-number-range-to-another-range-maintaining-ratio
    // used to convert coords to canvas pos
}
function getMapBoxRatio() {
    return {
        width: 1.35,
        height: 1,
    }
}
function PointInRect(x, y, rx1, ry1, rx2, ry2) {
    return (
        rx1 <= x
        && x <= rx2
        && ry1 <= y
        && y <= ry2
    )
}
async function LoadMapByCords(cords, minElSize = null) {
    // Formating "1.0, 1.0" type string to [1, 1] type array
    cords = cords.replace(/ /g, '').split(',');
    cords[0] = Number(cords[0]);
    cords[1] = Number(cords[1]);

    let mapBoxZoom = Settings['import_map_zoom']/100000; // 0.001 -> Settings 100
    const mapBoxRatio = getMapBoxRatio()
    const mapBoxSize = {
        width: mapBoxZoom * mapBoxRatio.width,
        height: mapBoxZoom * mapBoxRatio.height,
    };

    const answer = await loadMapWithOverpass([
        cords[0] - mapBoxSize.width,
        cords[1] - mapBoxSize.height,
        cords[0] + mapBoxSize.width,
        cords[1] + mapBoxSize.height,
    ], Settings['import_walls'], Settings['import_roads'], Settings['import_map_zoom'] > 5000);

    const ccenter = {
        x:  Canvas.width/2,
        y:  Canvas.height/2
    }

    answer.elements.forEach(element => {
        let isRoad = false;
        let isBuilding = false;

        if(element.tags.highway) {
            isRoad = true;
        } else 
        if(element.tags.building) {
            isBuilding = true;
        }

        if((Settings['import_walls'] && isBuilding) || Settings['import_roads'] && isRoad) {
            let start, end;
            for(i = 0; i < element.geometry.length; i++) {
                let geometry = element.geometry[i];
                if(!start) {
                    start = {
                        x: ccenter.x + RangeToRange(cords[0] - geometry.lat, 0, mapBoxSize.width, 0, Canvas.width),
                        y: ccenter.y + RangeToRange(cords[1] - geometry.lon, 0, mapBoxSize.height, 0, Canvas.height),
                    }
                } else
                if(isBuilding)
                if(i == element.geometry.length -1) {
                    geometry = element.geometry[0];
                } // ^- connects the last building element to first

                end = {
                    x: ccenter.x + RangeToRange(cords[0] - geometry.lat, 0, mapBoxSize.width, 0, Canvas.width),
                    y: ccenter.y + RangeToRange(cords[1] - geometry.lon, 0, mapBoxSize.height, 0, Canvas.height),
                }

                if(start && end) {
                    let startColony = {
                        x:Math.floor(CanvasX_2_ColonyX(start.x)),
                        y:Math.floor(CanvasX_2_ColonyX(start.y)),
                    }
                    let endColony = {
                        x:Math.floor(CanvasX_2_ColonyX(end.x)),
                        y:Math.floor(CanvasX_2_ColonyX(end.y)),
                    }

                    let a = startColony.x - endColony.x;
                    let b = startColony.y - endColony.y;
                    let dist = Math.sqrt(a*a + b*b)
                    if(dist < 0) dist *= -1;

                    if(minElSize == null || dist >= minElSize)
                    if( PointInRect(
                            startColony.x, startColony.y,

                            0, 0,
                            PlaneRealWidth, PlaneRealHeight
                        )
                        ||
                        PointInRect(
                            endColony.x, endColony.y,

                            0, 0,
                            PlaneRealWidth, PlaneRealHeight
                        )
                    )
                    if(isBuilding) {
                        SpawnWall(startColony, endColony);
                    } else {
                        SpawnRoad(startColony, endColony);
                    }
                    start = end;
                    end = undefined;
                }
            }
        }
    });

    SaveColonyState();
}
function LoadMapByCode(MapImportCode) {
    MapImportCode = JSON.parse(MapImportCode);
    if(MapImportCode.entities)
    Colony.entities = MapImportCode.entities;
    Colony.objectives = MapImportCode.objectives;
    Colony.barriers = MapImportCode.barriers;
    SaveColonyState();
}
function LoadMap() {
    let MapImportCode = document.getElementById(HTMLID.mapimportcode)?.value;
    let CoordsImport  = document.getElementById(HTMLID.coordsimport)?.value;
    if(!MapImportCode && !CoordsImport) return;

    ColonyClear();
    if(!CoordsImport) {
        LoadMapByCode(MapImportCode);
    } else
        LoadMapByCords(CoordsImport);
}
function SetColonyInitialState() {
    Colony.entities = JSON.parse(JSON.stringify(ColonyInitialState.entities));
    UpdateEntitiesSpeed();
    Colony.objectives = JSON.parse(JSON.stringify(ColonyInitialState.objectives));
    Colony.barriers = JSON.parse(JSON.stringify(ColonyInitialState.barriers));
    Colony.roads = JSON.parse(JSON.stringify(ColonyInitialState.roads));
}
function InitColony(loadFromStorage = true) {
    Colony = new Swarm();

    let localColony = localStorage.getItem('colony');
    if(localColony && loadFromStorage) {
        localColony = JSON.parse(localColony);

        ColonyInitialState.entities = localColony.entities;
        ColonyInitialState.objectives = localColony.objectives;
        ColonyInitialState.barriers = localColony.barriers;
        ColonyInitialState.roads = localColony.roads;
    } else
    if(!localColony) {
        applySearchParams(FirstTimeInEditorParams);
    }

    UpdateColonyPlaneBorders();
    UpdateSwarmSettings();

    if(localColony) {
        SetColonyInitialState();
        ColonyBoundElements();
        
        ColonyInitialState.entities = JSON.parse(JSON.stringify(Colony.entities));
        ColonyInitialState.objectives = JSON.parse(JSON.stringify(Colony.objectives));
        ColonyInitialState.barriers = JSON.parse(JSON.stringify(Colony.barriers));
        ColonyInitialState.roads = JSON.parse(JSON.stringify(Colony.roads));
    }
}
function ColonyFill(force = false, writeToSave = true) {
    if(force || Colony.entities.length == 0) {
        Colony.entities = [];
        for(i = 0; i < Settings['entites_count']; i++) SpawnEntity();
    }
    if(Colony.objectives.length == 0) {
        Colony.objectives = [];
        for(i = 0; i < Settings['default_objectives_count']; i++) SpawnObjective();
    }
    if(writeToSave) SaveColonyState();
}
function ColonyRandomise(writeToSave = true) {
    Colony.objectives = [];
    for(i = 0; i < Settings['default_objectives_count']; i++) SpawnObjective();
    ColonyFill(true, writeToSave);
}
function ColonyClear(writeToSave = true) {
    Colony.entities = [];
    Colony.objectives = [];
    Colony.barriers = [];
    Colony.roads = [];
    if(writeToSave) SaveColonyState();
}
function ResetSettings() {
    localStorage.removeItem('settings');
    try {
        if(Settings) LoadSettings();
    } catch (err) { }
    location.reload();
}
function ResetColony() {
    localStorage.removeItem('colony');
    location.reload();
}
function SettingsSet(SettingID, value, notUserInput = false, writeToStorage = true) {
    if(value === true || value === false) { // For only true/false/number inputs
        Settings[SettingID] = value;
    } else {
        Settings[SettingID] = Number(value);
    };
    let the = !notUserInput && writeToStorage;
    if(inCinemaMode && PlayingMode == PlayingModes.play)
        the = false;
    UpdateSettingHTML(SettingID);
    UpdateSwarmSetting(SettingID, the);
    if(the) 
        SaveSettings();
}
function AdvancedSettingsShow(bool) {
    advSetShow = document.getElementById(HTMLID.advancedsettingsshow);
    advSetHide = document.getElementById(HTMLID.advancedsettingshide);
    advSet = document.getElementById(HTMLID.advancedsettings)
    
    if(bool) {
        if(advSetShow) advSetShow.classList.add(HideButtonClass);
        if(advSetHide) advSetHide.classList.remove(HideButtonClass);
        if(advSet) advSet.classList.remove(HideButtonClass);
    } else {
        if(advSetShow) advSetShow.classList.remove(HideButtonClass);
        if(advSetHide) advSetHide.classList.add(HideButtonClass);
        if(advSet) advSet.classList.add(HideButtonClass);
    }
}

function GetRandomElement(someArray) {
    return someArray[Math.floor(Math.random()*someArray.length)];
}
const RandomMazeParams = [
    {w: '20:20:40:20,40:20:40:0,0:40:40:40,60:20:80:20,80:40:100:40,100:40:100:0,80:60:120:60,120:40:120:60,20:60:20:80,40:80:80:80,120:20:140:20,160:60:160:80,160:80:200:80,180:60:180:40,160:20:160:0,180:80:180:100,200:80:200:20,200:60:240:60,220:80:240:80,240:60:240:80,260:40:260:100,260:80:280:80,280:60:300:60,280:20:280:40,220:40:240:40,100:60:100:100,120:40:180:40,40:20:60:20,20:60:60:60,60:60:60:80,40:40:40:60,60:40:60:20,260:40:280:40,180:20:220:20,240:20:260:20,240:40:240:0,140:80:140:20,120:80:140:80'},
    {w: '15:30:30:15,30:15:45:90,45:90:60:30,45:30:60:15,60:15:90:45,90:30:105:15,105:15:120:60,105:45:75:75,75:60:60:45,75:60:60:90,75:75:90:90,90:90:105:60,105:90:150:30,150:30:120:15,120:15:120:30,165:30:150:60,150:60:195:30,195:30:180:75,135:75:165:90,165:90:210:75,15:60:30:90,15:30:30:60,210:60:255:30,225:60:255:75,255:75:210:90,270:45:225:60,270:75:285:30,285:30:255:15,270:90:285:75,270:90:255:90,175:10:215:25,90:30:75:5,165:30:145:5,255:15:280:5,210:60:235:5,235:5:210:15'},

];
const FirstTimeInEditorParams = RandomMazeParams[0];
const UrbanMazeParams = {
    w: '278:85:268:82,268:82:280:60,280:60:263:55,263:55:268:46,268:46:295:55,295:55:278:85,-29:2:11:42,11:42:-1:49,295:-18:282:6,282:6:274:3,274:3:272:7,272:7:248:-1,104:9:110:-2,110:-2:128:4,128:4:122:15,122:15:104:9,171:99:166:98,166:98:165:99,165:99:164:99,164:99:162:99,162:99:161:99,161:99:160:98,160:98:159:97,159:97:159:96,159:96:160:96,160:96:156:94,156:94:168:71,168:71:161:69,161:69:165:62,165:62:179:66,179:66:184:57,184:57:192:59,192:59:171:99,270:98:259:95,259:95:257:98,257:98:225:89,225:89:220:98,220:98:227:100,227:100:263:111,263:111:270:98,225:80:209:75,209:75:218:57,218:57:234:62,234:62:225:80,128:58:119:55,119:55:124:46,124:46:134:49,134:49:128:58,204:52:202:56,202:56:193:53,193:53:195:49,195:49:204:52,292:26:294:23,294:23:298:24,298:24:291:37,291:37:303:41,314:21:287:13,287:13:281:23,281:23:292:26,45:101:56:81,56:81:69:85,69:85:59:101,59:101:56:100,56:100:54:104,162:-4:207:11,207:11:213:0,213:0:194:-6,137:105:99:93,99:93:95:101,70:-3:65:5,65:5:59:16,59:16:58:18,58:18:61:19,61:19:70:21,70:21:71:22,71:22:75:15,75:15:74:14,74:14:82:-2,82:-2:84:0,84:0:88:-7,-7:-19:34:22,34:22:39:22,39:22:56:28,56:28:61:19,61:19:71:22,71:22:66:31,66:31:60:42,60:42:52:40,52:40:28:32,28:32:25:30,25:30:-18:-13,58:18:64:6,64:6:42:0,42:0:36:11,36:11:58:18,31:78:27:73,27:73:30:69,30:69:36:69,36:69:41:72,41:72:39:77,39:77:31:78,91:92:77:88,77:88:71:98,71:98:80:101,80:101:83:95,83:95:89:97,89:97:91:92,209:9:212:3,212:3:260:17,260:17:257:24,257:24:209:9,220:108:185:97,185:97:184:96,184:96:189:87,189:87:199:80,199:80:206:82,206:82:199:94,199:94:219:100,219:100:220:98,220:98:227:100,227:100:222:108,220:108:185:97,185:97:183:100,183:100:218:111,277:85:270:98,270:98:262:96,262:96:263:93,263:93:246:87,246:87:252:77,252:77:268:82,268:82:277:85,172:42:182:23,182:23:201:29,201:29:196:38,196:38:188:35,188:35:183:45,183:45:172:42,196:38:215:44,215:44:220:34,220:34:201:29,201:29:196:38,215:44:220:35,220:35:238:40,238:40:233:49,233:49:215:44,234:49:239:41,239:41:262:48,262:48:257:57,257:57:234:49,171:19:159:15,159:15:154:24,154:24:165:28,165:28:171:19,159:15:147:12,147:12:146:13,146:13:144:13,144:13:143:14,143:14:140:13,140:13:139:16,139:16:137:15,137:15:135:18,135:18:154:24,154:24:159:15,141:21:128:16,128:16:122:28,122:28:135:32,135:32:141:21,125:22:101:14,101:14:88:35,88:35:90:35,90:35:101:39,101:39:102:39,102:39:109:28,109:28:119:32,119:32:125:22,102:39:90:35,90:35:81:52,81:52:91:55,91:55:92:55,92:55:102:39,78:51:72:63,72:63:71:64,71:64:72:66,72:66:73:67,73:67:74:68,74:68:76:69,76:69:94:75,94:75:95:73,95:73:99:66,99:66:90:64,90:64:89:60,89:60:91:55,91:55:78:51,136:89:107:80,107:80:108:78,108:78:113:68,113:68:117:62,117:62:145:71,145:71:136:89,108:78:113:68,113:68:100:64,100:64:95:73,95:73:108:78,139:62:144:52,144:52:138:51,138:51:133:60,133:60:139:62'
}
function InitColonyFirstTimeInEditor() {
    
}
function EditorPageInit() {
    AdvancedSettingsShow(false);
    LoadSettings();
    UpdateSpeedPresets();

    InitColony();
    applySearchParams(onloadSearchParams);
    if(!inCinemaMode) SaveColonyState();

    Pause();

    const LocMapPresets = {
        'map_preset_maze': RandomMazeParams[0],
        'map_preset_broken_maze': RandomMazeParams[1],
        'map_preset_city': UrbanMazeParams,
    }
    Object.keys(LocMapPresets).forEach(id => {
        let el = document.getElementById(id);
        if(el)
            el.href = './' + buildSearchParams(LocMapPresets[id]);
    });

    setPlayingMode(startAfterLoad ? PlayingModes.play : PlayingModes.edit, true, !inCinemaMode);
    SetBrushMode('obj');
    ApplyFpsSettings(Settings['fps_preset'], true);
    UpdateSpeedPresets();
}
const RandomSearchParams = [
    {p: '40:20,260:80'},
    {p: '260:20,40:80'},
    {p: '260:50,40:50'},

    {p: '40:20,260:80', w: '40:80:260:20'},
    {p: '40:20,260:80', w: '40:80:260:20'},
    {p: '40:80,260:20', w: '150:20:40:20,150:20:150:80,150:80:260:80'},
    {p: '40:80,260:20', w: '150:20:40:20,150:20:150:80,150:80:260:80'},
    {p: '40:50,260:50', w: '150:0:150:60,210:40:210:100,90:40:90:100'},
    {p: '40:50,260:50', w: '150:0:150:60,210:40:210:100,90:40:90:100'},
]
function GetRandomParams() {
    return GetRandomElement(RandomSearchParams);
}
function HomePageInit() {
    AdvancedSettingsShow(false);
    LoadSettings(true);
    UpdateSpeedPresets();
    InitColony(false);

    let search_params = GetRandomParams();
    applySearchParams(search_params);

    let preview_search_params = structuredClone(search_params);
        preview_search_params['m'] = 'preview';
    let preview_url = './editor/' + buildSearchParams(preview_search_params)

    let el = document.getElementById('preview-button-home');
    if(el)
        el.href = preview_url;

    UpdateSettingsWith(HomePageSettings, true);
    Pause();
    setPlayingMode(PlayingModes.play, true, false);
    ApplyFpsSettings(Settings['fps_preset'], true);
}

function SpawnEntity(
        x = Math.random()*Colony.plane.xMax,
        y = Math.random()*Colony.plane.yMax,
        speed = (Math.random() * (Settings['entity_max_speed'] - Settings['entity_min_speed']) + Settings['entity_min_speed']),
    ) {
    Colony.entities.push(new SwarmEntity(
        x,
        y,
        speed,
        undefined,
        Math.floor(Math.random()*Colony.objectives.length)
    ));
    // No auto bound, bounds itself on play
}
function SpawnObjective(
    x = random(Colony.objective.hitbox.width/2, Colony.plane.xMax-Colony.objective.hitbox.width/2),
    y = random(Colony.objective.hitbox.height/2, Colony.plane.yMax-Colony.objective.hitbox.height/2)
) {
    Colony.objectives.push(new SwarmObjective(x, y));
}
function SpawnWall(PointA, PointB) {
    if(!PointA || !PointB) return 'not enough arguments to create a wall';
    Colony.barriers.push(new SwarmBarrier(PointA, PointB));
}
function ColonyRemoveShortWalls(minLength = .1) {
    for(let i = 0; i < Colony.barriers.length; i++) {
        var w = Colony.barriers[i];
        var a = w.points[0].x - w.points[1].x;
        var b = w.points[0].y - w.points[1].y;
        var l = Math.sqrt(a*a + b*b);

        if(l < minLength)
            Colony.barriers.splice(i, 1);
    }
}
function SpawnRoad(PointA, PointB) {
    if(!PointA || !PointB) return 'not enough arguments to create a road';
    Colony.roads.push(new SwamRoad(PointA, PointB));
}
function UpdateEntitiesSpeed() {
    Colony.entities.forEach(entity => {
        entity.speed = (Math.random() * (Settings['entity_max_speed'] - Settings['entity_min_speed']) + Settings['entity_min_speed']);
    });
    UpdateSpeedPresets();
}
function RefreshColony() {

    setPlayingMode(PlayingModes.play, !pause);
}
function SetBrushMode(NewMode) {
    if(!['ent', 'obj', 'wal', 'del', 'way'].includes(NewMode)) return 'unknown brush mode';

    // Disable the old one
    if(BrushMode != undefined) {
        document.getElementById(HTMLID.brushbuttonprefix+BrushMode).classList.remove('attention');
    }
    // Enable a new one
    BrushMode = NewMode;
    let el = document.getElementById(HTMLID.brushbuttonprefix+NewMode);
    if(el)
    el.classList.add('attention');
}
function IsOnCanvas(cords, canvas) {
    if(
        cords.x >= 0 &&
        cords.x <= canvas.width &&
        cords.y >= 0 &&
        cords.y <= canvas.height
    ) { return true; } else return false;
}
function DrawSnapperGrid() {
    if(PlayingMode != PlayingModes.edit)
        return;

    let grid = Math.floor(Settings['grid']);

    if(grid <= SnapperGridMinDG)
        return;

    CanvasContext.strokeStyle = SnapperGridColor;
    CanvasContext.lineWidth = SnapperGridWidth;

    for(let y = grid*COPH; y < Canvas.height; y += grid*COPH) {
        CanvasContext.beginPath();
        CanvasContext.moveTo(0, y);
        CanvasContext.lineTo(Canvas.width, y);
        CanvasContext.stroke();
    }
    for(let x = grid*COPW; x < Canvas.width; x += grid*COPW) {
        CanvasContext.beginPath();
        CanvasContext.moveTo(x, 0);
        CanvasContext.lineTo(x, Canvas.height);
        CanvasContext.stroke();
    }
}
function SnapToGrid(value) {
    let grid = Math.floor(Settings['grid']);
    value = Math.round(value);

    if(grid <= 1)
        return value;

    return value-value%grid;
}
function BrushFrame() {
    if(!MouseDown) {
        BrushCD = 0;
    }

    if(BrushCD != 0) { BrushCD--; } else // <- CD is in frames

    if(IsOnCanvas(MousePos, Canvas)) // Making sure mouse is within canvas range
    if(MouseDown) {
        let CanvasPoint = {
            x: Math.round(CanvasX_2_ColonyX(MousePos.x)),
            y: Math.round(CanvasY_2_ColonyY(MousePos.y)),
        }
        if(BrushMode != 'del') {
            CanvasPoint.x = SnapToGrid(CanvasPoint.x);
            CanvasPoint.y = SnapToGrid(CanvasPoint.y);
        }

        switch(BrushMode) {
            case 'ent':
                for(let i = 0; i < Settings['ent_brush_stack']; i++)
                    SpawnEntity(CanvasPoint.x, CanvasPoint.y);
                BrushCD = -1;
                SaveColonyState();
                break;
            case 'obj':
                SpawnObjective(CanvasPoint.x, CanvasPoint.y);
                BrushCD = -1;
                SaveColonyState();
                break;
            case 'del':
                let i = 0;
                // Entities
                while(i < Colony.entities.length) {
                    let ent = Colony.entities[i];
                    if(
                        ent.x > (CanvasPoint.x - MouseBoxRange/2) &&
                        ent.x < (CanvasPoint.x + MouseBoxRange/2) &&
                        ent.y > (CanvasPoint.y - MouseBoxRange/2) &&
                        ent.y < (CanvasPoint.y + MouseBoxRange/2)
                    ) {
                        Colony.entities.splice(i, 1);
                    } else i++;
                }
                i = 0;
                // Objectives
                while(i < Colony.objectives.length) {
                    let obj = Colony.objectives[i];
                    if(
                        obj.x > (CanvasPoint.x - MouseBoxRange/2) &&
                        obj.x < (CanvasPoint.x + MouseBoxRange/2) &&
                        obj.y > (CanvasPoint.y - MouseBoxRange/2) &&
                        obj.y < (CanvasPoint.y + MouseBoxRange/2)
                    ) {
                        Colony.objectives.splice(i, 1);
                    } else i++;
                }
                i = 0;
                // Barriers
                while(i < Colony.barriers.length) {
                    let wall = Colony.barriers[i];
                    if(Colony.lineRectCollision(
                        wall.points[0].x,
                        wall.points[0].y,
                        wall.points[1].x,
                        wall.points[1].y,
                        (CanvasPoint.x - MouseBoxRange/2),
                        (CanvasPoint.y - MouseBoxRange/2),
                        MouseBoxRange,
                        MouseBoxRange
                    )) {
                        Colony.barriers.splice(i, 1);
                    } else i++;
                }
                i = 0;
                // Roads
                while(i < Colony.roads.length) {
                    let wall = Colony.roads[i];
                    if(Colony.lineRectCollision(
                        wall.points[0].x,
                        wall.points[0].y,
                        wall.points[1].x,
                        wall.points[1].y,
                        (CanvasPoint.x - MouseBoxRange/2),
                        (CanvasPoint.y - MouseBoxRange/2),
                        MouseBoxRange,
                        MouseBoxRange
                    )) {
                        Colony.roads.splice(i, 1);
                    } else i++;
                }
                SaveColonyState();
                break;
            case 'wal':
                let lastWall = Colony.barriers[Colony.barriers.length-1];

                if(!SettingUpWall || !lastWall) {
                    SpawnWall({
                        x: CanvasPoint.x,
                        y: CanvasPoint.y,
                    }, {
                        x: CanvasPoint.x,
                        y: CanvasPoint.y,
                    },);
                    SettingUpWall = true;
                } else
                    lastWall.points[1] = {
                        x: CanvasPoint.x,
                        y: CanvasPoint.y,
                    };
                break;
            case 'way':
                if(!SettingUpWall) {
                    SpawnRoad({
                        x: CanvasPoint.x,
                        y: CanvasPoint.y,
                    }, {
                        x: CanvasPoint.x,
                        y: CanvasPoint.y,
                    });
                    SettingUpWall = true;
                } else
                    Colony.roads[Colony.roads.length-1].points[1] = {
                        x: CanvasPoint.x,
                        y: CanvasPoint.y,
                    };
                break;
        }
    } else {
        // Finish the wall or road setup once the mouse is up
        if(SettingUpWall) {
            SettingUpWall = false;
            SaveColonyState();
        }
    }

}

function draw() {
    updateColorScheme();
    if(Settings['transparent_background'] && PlayingMode != PlayingModes.edit) {
        CanvasContext.clearRect(0, 0, Canvas.width, Canvas.height);
    } else {
        CanvasContext.fillStyle = PlayingMode == PlayingModes.edit ? colors.background_editor : colors.background;
        CanvasContext.fillRect(0, 0, Canvas.width, Canvas.height);
    }
    DrawSnapperGrid();
    if(Settings['optimized_view']){
        const pheromonesZoneSize = Settings['optimized_view_gap'];
        let pheromonesMap = [];

        for(let entityIndex = 0; entityIndex < Colony.entities.length; entityIndex++){
            let entity = Colony.entities[entityIndex];
            let line = Math.floor(entity.y/pheromonesZoneSize), column = Math.floor(entity.x/pheromonesZoneSize);

            if(!pheromonesMap[line]) pheromonesMap[line] = [];
            if(!pheromonesMap[line][column]) pheromonesMap[line][column] = 0;
            pheromonesMap[line][column]++;
        }

        const maxEnts = Settings['optimized_view_opac']; // Entities per block for opacity 1
        for(let line = 0; line < Canvas.height/pheromonesZoneSize; line++){
            for(let column = 0; column < Canvas.width/pheromonesZoneSize; column++){
                if(pheromonesMap[line] && pheromonesMap[line][column] > 0){
                    let ents = pheromonesMap[line][column];
                    let opacity = ents/maxEnts;
                    let RGB_STR = Settings['colors'] ? (
                        ConnectionColors.success.replace('rgb(', '').replace(')', '')
                    ) : colors.entities.replace('rgb(', '').replace(')', '');
                    let RGB_COL = `rgb(${RGB_STR})`;
                    CanvasContext.fillStyle = `rgba(${RGB_STR}, ${opacity})`;
                    CanvasContext.shadowBlur = Settings['glow'];
                    CanvasContext.shadowColor = RGB_COL;
                    CanvasContext.fillRect(
                        column*pheromonesZoneSize*COPW,
                        line*pheromonesZoneSize*COPH,
                        pheromonesZoneSize*COPW,
                        pheromonesZoneSize*COPH
                        );
                }
            }
        }
    }
    CanvasContext.shadowBlur = 0;
    if(Settings['display_connections'] && PlayingMode == PlayingModes.play)
    Colony.connections.forEach(connection => {
        entityIndexA = connection.entityIndexA;
        entityIndexB = connection.entityIndexB;
        
        let A = Colony.entities[entityIndexA];
        let B = Colony.entities[entityIndexB];
        if(A && B) {
            CanvasContext.beginPath();
            CanvasContext.moveTo(A.x*COPW, A.y*COPH);
            CanvasContext.lineTo(B.x*COPW, B.y*COPH);

            CanvasContext.lineWidth = (Colony.entity.hitbox.height*COPH + Colony.entity.hitbox.width*COPW) * 2;

            switch(connection.status) { 
                case 'CONNECTION_SUCCESSFUL':
                    CanvasContext.strokeStyle = Settings['colors'] ? (
                        Settings['mono_color'] ? colors.entities : ConnectionColors.success
                        ) : colors.entities;
                    CanvasContext.lineWidth *= ConnectionSizeMult.success;
                    break;
                case 'CONNECTION_USEFUL':
                    CanvasContext.strokeStyle = Settings['colors'] ? (
                        Settings['mono_color'] ? ConnectionColors.default : ConnectionColors.useful
                        ) : colors.entities;
                    CanvasContext.lineWidth *= ConnectionSizeMult.useful;
                    break;
                default:
                    CanvasContext.strokeStyle = Settings['colors'] ? (
                        Settings['mono_color'] ? colors.entities : ConnectionColors.default
                        ) : colors.entities;
                    CanvasContext.lineWidth *= ConnectionSizeMult.default;
                    break;
            }

            CanvasContext.stroke();
        }
    });
    if(Settings['display_roads']) {
        Colony.roads.forEach(wall => {
            CanvasContext.strokeStyle = Settings['colors'] ? 'white' : 'rgba(255, 255, 255, 50)';
            CanvasContext.lineWidth = (Colony.entity.hitbox.width+Colony.entity.hitbox.height)/5;
            CanvasContext.beginPath();
            CanvasContext.moveTo(wall.points[0].x, wall.points[0].y);
            CanvasContext.lineTo(wall.points[1].x, wall.points[1].y);
            CanvasContext.stroke();
        });
    }
    if(Settings['display_entities'])
    Colony.entities.forEach(entity => { 
        CanvasContext.fillStyle = Settings['colors'] ? (
            Settings['mono_color'] ? ConnectionColors.success : colors.objectives[entity.objective]
        ) : colors.entities;

        if(Settings['display_directions']){
            let sizeAvrg = (Colony.entity.hitbox.width+Colony.entity.hitbox.height)/2;
            let distance = sizeAvrg*DirectionMarkerDistMult;
            let x2 = Math.round(Math.cos(entity.directionAngle) * distance + entity.x);
            let y2 = Math.round(Math.sin(entity.directionAngle) * distance + entity.y);

            CanvasContext.strokeStyle = CanvasContext.fillStyle;
            CanvasContext.lineWidth = sizeAvrg*DirectionMarkerWidthMult;
            CanvasContext.beginPath();
            CanvasContext.moveTo(entity.x*COPW, entity.y*COPH);
            CanvasContext.lineTo(x2*COPW, y2*COPH);
            CanvasContext.stroke();
        }

        CanvasContext.fillRect(
            (entity.x-Colony.entity.hitbox.width/2)*COPW,
            (entity.y-Colony.entity.hitbox.height/2)*COPH,
            Colony.entity.hitbox.width*COPW,
            Colony.entity.hitbox.height*COPH
        );
    });
    if(Settings['display_objectives'])
    for(objectiveIndex = 0; objectiveIndex < Colony.objectives.length; objectiveIndex++){
        let objective = Colony.objectives[objectiveIndex];
        CanvasContext.fillStyle = Settings['colors'] ? (
            Settings['mono_color'] ? colors.entities : colors.objectives[Math.floor(objectiveIndex%colors.objectives.length)]
            ) : colors.entities;

        if(Settings['display_directions'])
        if(Colony.objective.speed > 0){
            let x1 = objective.x;
            let y1 = objective.y;
            let distance = (Colony.objective.hitbox.width+Colony.objective.hitbox.height)/2*DirectionMarkerDistMultObj;
            let x2 = Math.round(Math.cos(objective.directionAngle) * distance + x1);
            let y2 = Math.round(Math.sin(objective.directionAngle) * distance + y1);

            CanvasContext.strokeStyle = CanvasContext.fillStyle;
            CanvasContext.lineWidth = (Colony.objective.hitbox.width+Colony.objective.hitbox.height)/2*DirectionMarkerWidthMultObj;
            CanvasContext.beginPath();
            CanvasContext.moveTo(x1*COPW, y1*COPH);
            CanvasContext.lineTo(x2*COPW, y2*COPH);
            CanvasContext.stroke();
        }

        CanvasContext.shadowBlur = Settings['glow'];
        CanvasContext.shadowColor = CanvasContext.fillStyle;
        CanvasContext.fillRect(
            (objective.x-Colony.objective.hitbox.width/2)*COPW,
            (objective.y-Colony.objective.hitbox.height/2)*COPH,
            Colony.objective.hitbox.width*COPW,
            Colony.objective.hitbox.height*COPH
        );
    };
    CanvasContext.shadowBlur = 0;
    if(Settings['display_barriers'])
    Colony.barriers.forEach(wall => {
        CanvasContext.strokeStyle = colors.entities;
        CanvasContext.lineWidth = (Colony.entity.hitbox.width*COPW + Colony.entity.hitbox.height*COPH)/2 *WallWidthMult;
        CanvasContext.beginPath();
        CanvasContext.moveTo(wall.points[0].x*COPW, wall.points[0].y*COPH);
        CanvasContext.lineTo(wall.points[1].x*COPW, wall.points[1].y*COPH);
        CanvasContext.stroke();
    });
}

function update() {
    Colony.frame();
}

function edit() {
    if(PlayingMode == PlayingModes.edit) BrushFrame();
}

function NextFrame() {
    update();
    draw();
}

let pause = true;
function Pause(newState = !pause) {
    if(PlayingMode == PlayingModes.edit) return;
    pause = newState;
    let el_pause = document.getElementById(HTMLID.pause);
    let el_continue = document.getElementById(HTMLID.continue);
    let el_nextframe = document.getElementById(HTMLID.nextframe);

    if(pause) {
        if(el_pause) el_pause.classList.add(HideButtonClass);
        if(el_continue) el_continue.classList.remove(HideButtonClass);
        if(el_nextframe) el_nextframe.classList.remove(HideButtonClass);
    } else {
        if(el_pause) el_pause.classList.remove(HideButtonClass);
        if(el_continue) el_continue.classList.add(HideButtonClass);
        if(el_nextframe) el_nextframe.classList.add(HideButtonClass);
    }
}

function setPlayingMode(modeName, unpause = true, setInit = true) {
    PlayingMode = modeName;
    let editmodepanel1 = document.getElementById(HTMLID.editmodepanel1);
    let editmodepanel2 = document.getElementById(HTMLID.editmodepanel2);
    let playingmodepanel1 = document.getElementById(HTMLID.playingmodepanel1);
    let playingmodepanel2 = document.getElementById(HTMLID.playingmodepanel2);

    if(editmodepanel1) editmodepanel1.style.display = 'none';
    if(editmodepanel2) editmodepanel2.style.display = 'none';
    if(playingmodepanel1) playingmodepanel1.style.display = 'none';
    if(playingmodepanel2 && HideSettingsInEdit) playingmodepanel2.style.display = 'none';

    [...document.getElementsByClassName('play-mode-hide')].forEach(el => {
        if(PlayingModes.play) 
            el.classList.add('hidden');
        else
            el.classList.remove('hidden');
    });

    switch(PlayingMode) {
        default:
        case PlayingModes.edit:
            LoadSettings();
            if(setInit)
                SetColonyInitialState();
            SetCinemaMode(false);
            updateShareMapUrl(null);
            if(editmodepanel1) editmodepanel1.style.display = 'block';
            if(editmodepanel2) editmodepanel2.style.display = 'block';

            break;
        case PlayingModes.play:
            if(setInit)
                SetColonyInitialState();
            if(Settings['autofill'])
                ColonyFill(false, false);
            if(Settings['auto_reassign_objectives'])
                Colony.randomiseEntityTargets();
            UpdateSwarmSettings();
            Colony.connections = [];
            if(unpause) Pause(false);
            if(playingmodepanel1) playingmodepanel1.style.display = 'block';
            if(playingmodepanel2) playingmodepanel2.style.display = 'block';
            if(inCinemaMode)
                SetCinemaMode(true);

            break;
        case PlayingModes.pause:
            Pause(true);
            break;
    }
}

let startAfterLoad = false;
let inCinemaMode = false;

const outsideUrlSep = '&';
const insideUrlSep = ',';
const smallestUrlSep = ':';
const onloadSearchParams = Object.fromEntries(new URLSearchParams(location.search));

function applySearchParams(params) {
    // Entities not supported
    let params_str = buildSearchParams(params);
    let local_colony_params_str = generateSearchParams(Colony.objectives, Colony.barriers);
    if (local_colony_params_str == params_str)
        return

    let view_mode = '';
    let points_data = [];
    let walls_data = [];
    let entity_data = [];

    Object.keys(params).forEach(key => {

        switch(key) {
            case 'p':
                params[key].split(insideUrlSep).forEach(point => {
                    points_data.push(point.split(smallestUrlSep));
                });
                break;
            
            case 'w':
                params[key].split(insideUrlSep).forEach(wall => {
                    walls_data.push(wall.split(smallestUrlSep));
                });
                break;
            
            case 'e':
                params[key].split(insideUrlSep).forEach(ent => {
                    entity_data.push(ent.split(smallestUrlSep));
                });
                break;
            
            case 'm':
                view_mode = params[key];
                break;
        }
    });

    switch(view_mode) {
        case 'preview':
            SetCinemaMode(true);
            break;
    }
    
    if(points_data.length + walls_data.length + entity_data > 0) {
        Colony.entities = [];
        Colony.objectives = [];
        Colony.barriers = [];
    }

    if(points_data.length > 0) {
        Colony.objectives = [];
        points_data.forEach(pointData => {
            SpawnObjective(Number(pointData[0]), Number(pointData[1]));
        });
    }

    if(walls_data.length > 0) {
        Colony.barriers = [];
        walls_data.forEach(wallData => {
            SpawnWall({
                x: Number(wallData[0]),
                y: Number(wallData[1])
            }, {
                x: Number(wallData[2]),
                y: Number(wallData[3])
            });
        });
    }

    if(entity_data.length > 0) {
        Colony.entities = [];
        entity_data.forEach(entData => {
            for(let i = 0; i < entData[2]; i++) {
                SpawnEntity(
                    CanvasX_2_ColonyX(entData[0]),
                    CanvasY_2_ColonyY(entData[1]),
                );
            }
        });
    }

    SaveColonyAsCurrentInitial();
}
function SetCinemaMode(val) {
    inCinemaMode = val;

    if(inCinemaMode) {
        startAfterLoad = true;
        let el = document.getElementById("preview");
        if(el)
            el.scrollIntoView();
    } else {
        startAfterLoad = false;
    }

    [...document.getElementsByClassName('cinema-mode-hide')].forEach(el => {
        if(inCinemaMode) 
            el.classList.add('hidden');
        else
            el.classList.remove('hidden');
    });

    let el = document.getElementById("close-preview-btn");
    if(inCinemaMode) 
        el.classList.remove('hidden');
    else
        el.classList.add('hidden');

    el = document.getElementById("main-canvas-holder");
    if(inCinemaMode){
        el.style.animationDelay = 0;
        el.style.animationDuration = '.25s'
    }
}

function buildSearchParams(params, end = null) {
    let arr = [];
    Object.keys(params).forEach(param => {
        arr.push(param + '=' + params[param]);
    });
    if(end != null)
        arr.push(end);
    if(arr.length > 0)
        return '?' + arr.join(outsideUrlSep);
    else
        return ''
}

function generateSearchParams(objs, bars, ents = null, end = null, ignoreEnts = true) {
    if(!objs) objs = [];
    if(!bars) bars = [];
    if(!ents) ents = [];

    let out = [];

    if(objs.length != 0) {
        let arr = [];
        objs.forEach(obj => {
            arr.push([
                Math.floor(obj.x),
                Math.floor(obj.y)
            ].join(smallestUrlSep));
        });

        out.push(`p=${arr.join(insideUrlSep)}`);
    }

    if(bars.length != 0) {
        let arr = [];
        bars.forEach(bar => {
            arr.push([
                Math.floor(bar.points[0].x),
                Math.floor(bar.points[0].y),
                Math.floor(bar.points[1].x),
                Math.floor(bar.points[1].y),
            ].join(smallestUrlSep))
        });

        out.push(`w=${arr.join(insideUrlSep)}`);
    }

    if(!ignoreEnts)
    if(ents.length != 0) {
        let arr = [];

        let entityStacks = {};
        ents.forEach(ent => {
            let key = [
                Math.floor(ent.x),
                Math.floor(ent.y),
            ].join(smallestUrlSep);

            if(!entityStacks[key])
                entityStacks[key] = 0;
            
            entityStacks[key]++;
        });

        // To avoid getting this triggered with fill
        const minEntitesStackToExp = 5;
        Object.keys(entityStacks).forEach(key => {
            let stack = entityStacks[key];

            if(stack >= minEntitesStackToExp)
                arr.push([
                    key,
                    stack,
                ].join(smallestUrlSep));
        });

        if(arr.length > 0)
            out.push(`e=${arr.join(insideUrlSep)}`);
    }

    if(out != null && end != null)
        out.push(end);

    if(out.length > 0)
        return '?' + out.join(outsideUrlSep);
    else
        return '';
}

function getMapShareSearchParams(end = null, ignoreEnts = true) {
    return generateSearchParams(Colony.objectives, Colony.barriers, Colony.entities, end, ignoreEnts);
}
function getNoParamsCurrentLink() {
    return window.location.origin + window.location.pathname;
}
function getShareMapUlr(end = 'm=preview') {
    return getNoParamsCurrentLink() + getMapShareSearchParams(end)
}
function updateShareMapUrl(end = null) {
    if(window.history.replaceState) {
        // Prevents browser from storing history with each change:
        window.history.replaceState('->', '--->', getShareMapUlr(end));
    }
}

const MaximumFPS = 250;
let UpdateFPS;
let DrawFPS;

let DrawTick = 0, UpdateTick = 0;
setInterval(() => {

    if(DrawTick >= 1000/DrawFPS){
        draw();
        edit();
        DrawTick = 0;
    }
    DrawTick += 1000/MaximumFPS;

    if(UpdateTick >= 1000/UpdateFPS){
        if(!pause && PlayingMode != PlayingModes.edit)
        update();
        UpdateTick = 0;
    }
    UpdateTick += 1000/MaximumFPS;
}, 1000/MaximumFPS);
ResizeCanvas();