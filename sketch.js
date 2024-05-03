//sets start variables
let difficulty = 'easy';
let impoppableSelected = false;
let gameState = 'start';
const gameContainer = document.getElementById('game-container')


//for creating html elements
const unitConverter = 4.5;

//imitates reacts jsx()
const fsx = (element, attributes = {}, children = []) => {
    //if element is null then create a text node
    if (element === null) return document.createTextNode(children);
    //else create a element and assign attributes and appends children
    const newElement = document.createElement(element);
    Object.assign(newElement, attributes);
    children.forEach((child) => newElement.appendChild(child));
    return newElement;
  };
  //took this from an earlier project

function setup() {
    //runs the setup for the start screen
    StartSetup()
}

function draw() {
    //checks which draw is should run
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