(function () {

/**
 * Basic hard difficulty settings
 */
const hardSettings = {
    width: 30,
    height: 16,
    mines: 99
}

/**
 * Basic normal difficulty settings
 */
const normalSettings = {
    width: 16,
    height: 16,
    mines: 40
}

/**
 * Basic easy difficulty settings
 */
const easySettings = {
    width: 9,
    height: 9,
    mines: 10
}

/**
 * Custom difficulty settings
 */
let customSettings = {
    width: 0,
    height: 0,
    mines: 0
}

/**
 * Generates buttons representing minefield for playing the game according to stored settings.
 */
function generateMinefield() {
    document.getElementById("minesLeft").innerHTML = currentSettings.mines;
    let gameDiv = document.getElementById('minefield');
    revealedSlots = 0;
    for(let i = 0; i<currentSettings.height; i++) {
        let gameUl = gameDiv.appendChild(document.createElement("ul"));
        gameUl.setAttribute("id", "row"+i);
        for(let j = 0; j<currentSettings.width; j++) {
            let mineButton = document.createElement("button");
            mineButton.setAttribute("class", "unrevealedMine");
            mineButton.setAttribute("id", "mine"+ j)
            mineButton.addEventListener("click", revealMine);
            mineButton.addEventListener("contextmenu", markMine);
            mineButton.addEventListener("mousedown", smileyfaceOnHold);
            gameUl.appendChild(mineButton);
        }
    }
}

/**
 * Generates position of mines in the game according to stored settings and restarts time counter
 * clickX and clickY are used to determine where shouldn't be any mines
 */
function generateMines(settings, clickX, clickY) {
    let gamefield = [];
    for(let i=0; i<settings.height; i++) {
        gamefield[i] = new Array(settings.width).fill(0);
    }
    let currentMines=0;
    while(currentMines<settings.mines) {
        let x = Math.floor(Math.random()*settings.width);
        let y = Math.floor(Math.random()*settings.height);
        if (!(Math.abs(x-clickX) <= 1 && Math.abs(y-clickY) <= 1)) { 
            if(gamefield[y][x]!="x") {
                gamefield[y][x]="x";
                addMinesCounter(x,y,gamefield);
                currentMines++;
            }
        }
    }
    timer = setInterval(() => {
        time++;
        if (time > 999) {
            document.getElementById("timer").innerHTML = "999";    
        } else {
            document.getElementById("timer").innerHTML = time;
        }
    }, 1000);
    window.addEventListener("beforeunload", confirmReload);
    return gamefield;
}

/**
 * Increases count of mines on adjacent positions of a mine
 */
function addMinesCounter(mineX, mineY, field) {
    if(mineY!=0) {
        if(field[mineY-1][mineX]!="x") {field[mineY-1][mineX]++;};
        if(mineX!=0) {
            if(field[mineY-1][mineX-1]!="x") {field[mineY-1][mineX-1]++};
        }
        if(mineX!=field[mineY].length-1) {
            if(field[mineY-1][mineX+1]!="x") {field[mineY-1][mineX+1]++};
        }
    }

    if(mineY!=field.length-1) {
        if(field[mineY+1][mineX]!="x") {field[mineY+1][mineX]++};
        if(mineX!=0) {
            if(field[mineY+1][mineX-1]!="x") {field[mineY+1][mineX-1]++};
        }
        if(mineX!=field[mineY].length-1) {
            if(field[mineY+1][mineX+1]!="x") {field[mineY+1][mineX+1]++};
        }
    }

    if(mineX!=0) {
        if(field[mineY][mineX-1]!="x") {field[mineY][mineX-1]++};
    }
    if(mineX!=field[mineY].length-1) {
        if(field[mineY][mineX+1]!="x") {field[mineY][mineX+1]++};
    }
}

/**
 * Reveals wheter clicked button is a mine
 * If it is the first button clicked, it generates the mines, so that the first click can't be on a mine
 * Also if it reveals plot with 0 adjacent mines, it reveals all surrounding plots
 * Lastly it ends game when all plots without mines are revealed
 */
function revealMine(e) {
    let mineX;
    let mineY;
    if(Event.prototype.composedPath == undefined) {
        mineY = eventPath(e)[1].id.substring(3,5);
        mineX = eventPath(e)[0].id.substring(4,6);
    } else {
        mineY = e.composedPath()[1].id.substring(3,5);
        mineX = e.composedPath()[0].id.substring(4,6);
    }
    if(field==null) {
        field = generateMines(currentSettings, mineX, mineY);
    }
    let gameButton = e.target;
    if (gameButton.className != "markedMine" && gameButton.className != "revealedBlank") {
        if(field[mineY][mineX]=="x") {
            gameButton.setAttribute("class", "revealedMine");
            endGameLost(e);
        } else {
            gameButton.innerHTML = field[mineY][mineX];
            gameButton.setAttribute("class", "revealedBlank");
            gameButton.removeEventListener("click", revealMine);
            gameButton.removeEventListener("contextmenu", markMine);
            gameButton.addEventListener("click", revealMany);
            gameButton.addEventListener("contextmenu", e => e.preventDefault());
            if(gameButton.innerHTML=="0") {
                setTimeout(() => {
                    revealAdjacent(mineX,mineY);    
                }, 0);
            }
            revealedSlots++;
            if(revealedSlots+currentSettings.mines == totalSlots) {
                endGameWin(e);
            }
        }
    }
}

/**
 * Reveals all adjacent sqares of a clicked one 
 */
function revealMany(e) {
    let mineX;
    let mineY;
    if(Event.prototype.composedPath == undefined) {
        mineY = eventPath(e)[1].id.substring(3,5);
        mineX = eventPath(e)[0].id.substring(4,6);
    } else {
        mineY = e.composedPath()[1].id.substring(3,5);
        mineX = e.composedPath()[0].id.substring(4,6);
    }
    revealAdjacent(mineX, mineY);
}

/**
 * Marks or unmarks that an unrevealed plot has a mine
 */
function markMine(e) {
    e.preventDefault();
    let gameButton = e.target;
    if (gameButton.className == "markedMine") {
        gameButton.className = "unrevealedMine";
        let minesLeftText = document.getElementById("minesLeft");
        let minesLeft = Number.parseInt(minesLeftText.innerHTML)+1;
        minesLeftText.innerHTML = minesLeft;
    } else if (gameButton.className == "unrevealedMine"){
        gameButton.className = "markedMine";
        let minesLeftText = document.getElementById("minesLeft");
        let minesLeft = Number.parseInt(minesLeftText.innerHTML)-1;
        minesLeftText.innerHTML = minesLeft;
        
    }
}

/**
 * Reveals all adjacent plots of a plot given by x and y
 */
function revealAdjacent(x, y) {
    x = Number.parseInt(x);
    y = Number.parseInt(y);
    let firstUl = Array.from(document.getElementById("row" + y).childNodes);
    if(x!=0) {
        safeClick(firstUl[x-1]);
    }
    if(x!=currentSettings.width-1) {
        safeClick(firstUl[x+1]);
    }
    if(y!=0) {
        let secondUl = Array.from(document.getElementById("row" + (y-1)).childNodes);
        if(x!=0) {
            safeClick(secondUl[x-1]);
        }
        safeClick(secondUl[x]);
        if(x!=currentSettings.width-1) {
            safeClick(secondUl[x+1]);
        }
    }
    if(y!=currentSettings.height-1) {
        let thirdUl = Array.from(document.getElementById("row" + (y+1)).childNodes);
        if(x!=0) {
            safeClick(thirdUl[x-1]);
        }
        safeClick(thirdUl[x]);
        if(x!=currentSettings.width-1) {
            safeClick(thirdUl[x+1]);
        }
    }
}

/**
 * Clicks the target node only if it is not a flag or revealed
 * Used for revealing multiple sqares
 */
function safeClick(node) {
    if (node.className != "markedMine" && node.className != "revealedBlank") {
        node.click();
    }
}

/**
 * When the player reveals a mine, the game ends with a defeat, disables any further revealing, shows all mines and displays game over text
 */
function endGameLost(e) {
    document.getElementById("endGameHidden").setAttribute("id", "endGame");
    document.getElementById("endGame").innerHTML = "You lost. Better luck next time";
    if (!muted) {
        new Audio("Sounds/explosion.mp3").play();
    }
    setTimeout(() => {
        for(let i = 0; i<currentSettings.height; i++) {
            let currentUl = Array.from(document.getElementById("row" + i).childNodes);
            for(let j = 0; j<currentSettings.width; j++) {
                if(field[i][j]=="x") {
                    currentUl[j].setAttribute("class", "revealedMine");
                }
                if(currentUl[j].className == "markedMine") {
                    currentUl[j].setAttribute("class", "wrongMark");
                }
                currentUl[j].disabled = true;
            }
        }
    }, 100);
    clearInterval(timer);
    window.removeEventListener("beforeunload", confirmReload);
    smileyfaceOnLost();
    e.stopPropagation();
    window.addEventListener("click", hideEndGameMessage);
}

/**
 * When the player reveals all plots without mines, the game ends with a victory, disables any further revealing, computes score and displays it along with a you win text
 */
function endGameWin(e) {
    document.getElementById("endGameHidden").setAttribute("id", "endGame");
    document.getElementById("endGame").innerHTML = "You won. Your score: " + saveScore();
    if (!muted) {
        new Audio("Sounds/win.mp3").play();
    }
    for(let i = 0; i<currentSettings.height; i++) {
        let currentUl = Array.from(document.getElementById("row" + i).childNodes);
        for(let j = 0; j<currentSettings.width; j++) {
            currentUl[j].disabled = true;
        }
    }
    clearInterval(timer);
    window.removeEventListener("beforeunload", confirmReload);
    e.stopPropagation();
    window.addEventListener("click", hideEndGameMessage);
}

/**
 * Hides the end game message when clicking anywhere
 */
function hideEndGameMessage() {
    document.getElementById("endGame").setAttribute("id", "endGameHidden");
    window.removeEventListener("click", hideEndGameMessage);
}

/**
 * Computes the players score after a win, saves it to local storage and returns it
 */
function saveScore() {
    let score = Math.floor((1/(time+1))*totalSlots*currentSettings.mines*100);
    let currentScore = score;
    for(let i = 0; i <5; i++) {
        let savedScore = Number.parseInt(localStorage.getItem("highscore"+i));
        if (currentScore > savedScore) {
            localStorage.setItem("highscore"+i, currentScore  + " (" + new Date().toLocaleString() + ")");
            currentScore = savedScore;
            loadHighscore();
        }
    }
    return score;
}

/**
 * Resets the game for a new round
 */
function restartGame() {
    document.getElementById('minefield').innerHTML = "";
    field = null;
    clearInterval(timer);
    time = 0;
    document.getElementById("timer").innerHTML = "0";
    generateMinefield(currentSettings);
    smileyfaceOnNormal();
}

/**
 * Changes the difficulty of the game to one of the predetermined difficulties
 */
function changeDifficulty(e) {
    switch (e.target.id) {
        case "easyDifficulty":
            currentSettings = easySettings;
            break;
        case "normalDifficulty":
            currentSettings = normalSettings;
            break;
        case "hardDifficulty":
            currentSettings = hardSettings;
            break;
        default:
            break;
    }
    storeSettings();
    totalSlots = currentSettings.width*currentSettings.height;
    restartGame();
    hideModal();
}

/**
 * Changes the difficulty of the game to players custom difficulty
 * The custom difficulty is limited to max 50 width and height
 */
function setCustomDifficulty() {
    let width = Number.parseInt(document.getElementById("inputWidth").value);
    let height = Number.parseInt(document.getElementById("inputHeigth").value);
    let mines = Number.parseInt(document.getElementById("inputMines").value);
    if(!isNaN(width) && !isNaN(height) && !isNaN(mines)) {
        currentSettings = customSettings;
        currentSettings.width = width;
        currentSettings.height = height;
        currentSettings.mines = mines;  
        if(currentSettings.width > 50) {
            currentSettings.width = 50;
        }
        if(currentSettings.width <= 9) {
            currentSettings.width = 9;
        }
        if(currentSettings.height > 50) {
            currentSettings.height = 50;
        }
        if(currentSettings.height <= 9) {
            currentSettings.height = 9;
        }
        if(currentSettings.mines <= 0) {
            currentSettings.mines = 1;
        }
        if(currentSettings.mines > totalSlots-9) {
            currentSettings.mines = totalSlots-9;
        }
        totalSlots = currentSettings.width*currentSettings.height;
        storeSettings();
        restartGame();
        hideModal();
    } else {
        alert("Please enter a number");
    }
}

/**
 * Changes mute when checkbox is checked
 */
function changeMuted() {
    muted = this.checked;
    localStorage.setItem("muted", muted);
}

/** 
 * Checks if an input is correct and paints red border if not
 */
function checkCustomSettingsInput(e) {
    let input = document.getElementById(e.target.id);
    if (input.value == "" || isNaN(input.value)) {
        input.setAttribute("class", "wrongInput");
    } else {
        if (input.id != "inputMines") {
            if(input.value <= 9) {
                input.value = 9;
            } else if (input.value > 50) {
                input.value = 50;
            }
        } else {
            if (input.value <= 0) {
                input.value = 1;
            }
        }
    }
}

/**
 * Removes the red border from an input field on focus 
 */
function resetInput(e) {
    let input = document.getElementById(e.target.id);
    if (input.className == "wrongInput") {
        input.setAttribute("class", "");
    }
}

/**
 * Loads the highscore from local storage
 */
function loadHighscore() {
    let highscoreDiv = document.getElementById("highscore");
    highscoreDiv.innerHTML = "";
    for(let i=0; i < 5; i++) {
        if(localStorage.getItem("highscore"+i) == null) {
            localStorage.setItem("highscore"+i, 0);
        }
        highscoreDiv.innerHTML += "<h5>" + (i+1) + ". " + localStorage.getItem("highscore"+i) + "</h5>";
    }
    
}

/**
 * Loads the settings from local storage
 */
function loadSettings() {
    let loadedSettings = {
        width: Number.parseInt(localStorage.getItem("storedSettingsWidth")),
        height: Number.parseInt(localStorage.getItem("storedSettingsHeight")),
        mines: Number.parseInt(localStorage.getItem("storedSettingsMines"))
    }
    if(isNaN(loadedSettings.width) || isNaN(loadedSettings.height) || isNaN(loadedSettings.mines)) {
        loadedSettings = hardSettings;
    }
    return loadedSettings;
}

/**
 * Loads the muted setting from local storage
 */
function loadMuted() {
    let loadedMuted = localStorage.getItem("muted");
    if(loadedMuted == "true") {
        loadedMuted = true;
    } else if (loadedMuted == "false") {
        loadedMuted = false;
    }
    document.getElementById("mutedCheckbox").checked = loadedMuted;
    return loadedMuted;
}

/**
 * Stores the settings into a local storage
 */
function storeSettings() {    
    localStorage.setItem("storedSettingsWidth", currentSettings.width);
    localStorage.setItem("storedSettingsHeight", currentSettings.height);
    localStorage.setItem("storedSettingsMines", currentSettings.mines);
}

/**
 * Displays the settings modal window
 */
function showSettings() {
    let body = document.querySelector("body");
    body.className = "settingsModal";
}

/**
 * Hides any currently shown modals
 */
function hideModal() {
    let body = document.querySelector("body");
    body.className = "";
    let settingsDiv = document.querySelector(".customSettings");
    if(settingsDiv.id == "customSettings") {
        settingsDiv.id = "customSettingsHidden";
    }
}

/**
 * Displays the highscore modal window
 */
function showHighscore() {
    let body = document.querySelector("body");
    body.className = "highscoreModal";
}

/**
 * Displays the custom settings part of settings modal window
 */
function showCustomSettings() {
    let settingsDiv = document.querySelector(".customSettings");
    if(settingsDiv.id == "customSettings") {
        settingsDiv.id = "customSettingsHidden";
    } else {
        settingsDiv.id = "customSettings";
    }
}

/**
 * Asks the user if he really wants to reload the page when he is playing
 */
function confirmReload(e) {
    e.preventDefault();
    e.returnValue = "";
}

/**
 * Changes the smileyface upon holding mouse down
 */
function smileyfaceOnHold() {
    document.getElementById("startNewGame").setAttribute("class", "smileyHold");
}

/**
 * Changes the smileyface when revealing a mine
 */
function smileyfaceOnLost() {
    document.getElementById("startNewGame").setAttribute("class", "smileyOver");
}

/**
 * Changes the smileyface back to normal
 */
function smileyfaceOnNormal() {
    document.getElementById("startNewGame").setAttribute("class", "smileyNormal");
}

let field = null;
let currentSettings = loadSettings();
let muted = loadMuted();
let time = 0;
let timer;
let revealedSlots = 0;
let totalSlots = currentSettings.width*currentSettings.height;

loadHighscore();
generateMinefield();

document.getElementById("startNewGame").addEventListener("click", restartGame);
document.getElementById("easyDifficulty").addEventListener("click", changeDifficulty);
document.getElementById("normalDifficulty").addEventListener("click", changeDifficulty);
document.getElementById("hardDifficulty").addEventListener("click", changeDifficulty);
document.getElementById("customDifficulty").addEventListener("click", showCustomSettings);
document.getElementById("submitCustomSettings").addEventListener("click", setCustomDifficulty);
document.getElementById("settingsButton").addEventListener("click", showSettings);
document.getElementById("highscoreButton").addEventListener("click", showHighscore);
document.getElementById("closeSettingsButton").addEventListener("click", hideModal);
document.getElementById("closeHighscoreButton").addEventListener("click", hideModal);
document.getElementById("inputWidth").addEventListener("blur", checkCustomSettingsInput);
document.getElementById("inputHeigth").addEventListener("blur", checkCustomSettingsInput);
document.getElementById("inputMines").addEventListener("blur", checkCustomSettingsInput);
document.getElementById("inputWidth").addEventListener("focus", resetInput);
document.getElementById("inputHeigth").addEventListener("focus", resetInput);
document.getElementById("inputMines").addEventListener("focus", resetInput);
document.getElementById("mutedCheckbox").addEventListener("change", changeMuted);
window.addEventListener("mouseup", smileyfaceOnNormal);

function eventPath(evt) {
    var path = (evt.composedPath && evt.composedPath()) || evt.path,
        target = evt.target;

    if (path != null) {
        // Safari doesn't include Window, and it should.
        path = (path.indexOf(window) < 0) ? path.concat([window]) : path;
        return path;
    }

    if (target === window) {
        return [window];
    }

    function getParents(node, memo) {
        memo = memo || [];
        var parentNode = node.parentNode;

        if (!parentNode) {
            return memo;
        }
        else {
            return getParents(parentNode, memo.concat([parentNode]));
        }
    }

    return [target]
        .concat(getParents(target))
        .concat([window]);
}


/*
TODO:
    Fix disabled tlačítek
    Upravit kód a stylování
*/

})();
