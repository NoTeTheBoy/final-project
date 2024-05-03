function StartSetup() {
    const GetDifficulty = () => {
        const difficultySelectors = document.getElementsByName('difficulty')
        for (let i = 0; i < difficultySelectors.length; i++){
          if (difficultySelectors[i].checked){
            return difficultySelectors[i].value;
          }
        } 
      }
    const IsImpoppableSelected = () => {
        const ImpoppableSelectors = document.getElementsByName('impoppable')
          if (ImpoppableSelectors[0].checked){
            return true;
          }
          else return false;
        } 
    const startMenu = fsx('div', {className: 'start-container'}, [
        fsx('h1', {}, [
            fsx(null, {}, ['Fake Bloons'])
        ]),
        fsx('div', {id: 'radio-container'}, [
            fsx('input', {type: 'radio', id: 'easy', name: 'difficulty', value: 'easy', checked: true}, []),
            fsx('input', {type: 'radio', id: 'medium', name: 'difficulty', value: 'medium'}, []),
            fsx('input', {type: 'radio', id: 'hard', name: 'difficulty', value: 'hard'}, []),
            fsx('input', {type: 'checkbox', id: 'impoppable', name: 'impoppable'}, []),
            fsx('label', {for: 'easy'}, [
                fsx(null, {}, ['Easy'])
            ]),
            fsx('label', {for: 'medium'}, [
                fsx(null, {}, ['Medium'])
            ]),
            fsx('label', {for: 'hard'}, [
                fsx(null, {}, ['Hard'])
            ]),
            fsx('label', {for: 'impoppable'}, [
                fsx(null, {}, ['Impoppable'])
            ]),
        ]),
        fsx('button', {id: 'start-game-button', onclick: () => {
            difficulty = GetDifficulty()
            impoppableSelected = IsImpoppableSelected()
            gameContainer.removeChild(startMenu)
            GameSetup()
            gameState = 'game';
        }}, [
            fsx(null, {}, ['Start Game'])
        ])
    ])
    gameContainer.appendChild(startMenu);
}

function StartDraw() {

}