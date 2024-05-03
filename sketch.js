let difficulty = 'easy';
let impoppableSelected = false;
let gameState = 'start';
const gameContainer = document.getElementById('game-container')
//for creating html elements

const unitConverter = 4.5;

const fsx = (element, attributes = {}, children = []) => {
    if (element === null) return document.createTextNode(children);
    const newElement = document.createElement(element);
    Object.assign(newElement, attributes);
    children.forEach((child) => newElement.appendChild(child));
    return newElement;
  };
  //^tog det her fra et tidligere projekt

function setup() {
    StartSetup()
    // const startMainElement = document.getElementsByTagName('main')
    // document.body.removeChild(startMainElement[0])
}

function draw() {
    switch(gameState){
        case 'game':
            GameDraw()
            break;
        case 'start':
            StartDraw()
            break;
        case 'end':
            EndDraw()
            break;
    }
}