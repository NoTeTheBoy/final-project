function EndSetup(endCondition){
    //remove the elements that play the game
    gameContainer.removeChild(main)
    gameContainer.removeChild(aside)
    //create the end menu element
    const EndMenu = fsx('div', {className: 'start-container'}, [
        fsx('h1', {}, [
            fsx(null, {}, ['You ' + endCondition])
        ]),
        fsx('button', {id: 'restart-game-button', onclick: () => {
            gameContainer.removeChild(EndMenu)
            StartSetup()
            gameState = 'start';
        }}, [
            fsx(null, {}, ['Restart Game'])
        ])
    ])
    //append the end menu element on the game container so it is visible
    gameContainer.appendChild(EndMenu);
}

function EndDraw(){

}