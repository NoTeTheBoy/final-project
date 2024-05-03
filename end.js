function EndSetup(endCondition){
    gameContainer.removeChild(main)
    gameContainer.removeChild(aside)
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
    gameContainer.appendChild(EndMenu);
}

function EndDraw(){

}