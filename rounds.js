function RoundSetup() {

  //the rounds gets defined
  window.rounds = [
    [{ bloon: 'Red', amount: 20, space: 1, delay: 0 }],
    
    [{ bloon: 'Red', amount: 35, space: 1, delay: 0 }],
    [
      { bloon: 'Red', amount: 10, space: 1, delay: 10 },
      { bloon: 'Blue', amount: 5, space: 1, delay: 5 },
      { bloon: 'Red', amount: 15, space: 1, delay: 0 }
    ],
    [
      { bloon: 'Red', amount: 25, space: 0.5, delay: 12.5 },
      { bloon: 'Blue', amount: 18, space: 0.2, delay: 3.6 },
      { bloon: 'Red', amount: 10, space: 0.3, delay: 0 },
    ],
    [
      { bloon: 'Blue', amount: 12, space: 0.5, delay: 6 },
      { bloon: 'Red', amount: 5, space: 0.5, delay: 2.5 },
      { bloon: 'Blue', amount: 15, space: 0.6, delay: 0 },
    ],
    [
      { bloon: 'Green', amount: 4, space: 0.6, delay: 8.4 },
      { bloon: 'Red', amount: 15, space: 0.3, delay: 5 },
      { bloon: 'Blue', amount: 15, space: 0.6, delay: 0 },
      
    ],
    [
      { bloon: 'Blue', amount: 10, space: 0.5, delay: 5 },
      { bloon: 'Green', amount: 5, space: 1.2, delay: 6 },
      { bloon: 'Red', amount: 20, space: 0.5, delay: 10 },
      { bloon: 'Blue', amount: 10, space: 0.5, delay: 0 },
    ],
    [
      { bloon: 'Blue', amount: 20, space: 0.5, delay: 10 },
      { bloon: 'Green', amount: 2, space: 0.5, delay: 5 },
      { bloon: 'Red', amount: 10, space: 0.3, delay: 3 },
      { bloon: 'Green', amount: 12, space: 1, delay: 0 },
    ],
    [{ bloon: 'Green', amount: 30, space: 0.7, delay: 0 }],
    [{ bloon: 'Blue', amount: 102, space: 0.6, delay: 0 }],
    [
      { bloon: 'Yellow', amount: 3, space: 0.5, delay: 6.5 },
      { bloon: 'Green', amount: 12, space: 0.5, delay: 6 },
      { bloon: 'Blue', amount: 10, space: 0.4, delay: 4 },
      { bloon: 'Red', amount: 10, space: 0.5, delay: 0 },
    ],
    [
        { bloon: 'Green', amount: 10, space: 0.5, delay: 5 },
      { bloon: 'Blue', amount: 15, space: 0.5, delay: 10.5 },
      { bloon: 'Yellow', amount: 5, space: 0.7, delay: 0 },
    ],
    [
      { bloon: 'Blue', amount: 50, space: 0.6, delay: 3 },
      { bloon: 'Green', amount: 23, space: 1.2, delay: 0 },
    ],
    [
      { bloon: 'Red', amount: 49, space: 0.5, delay: 4 },
      { bloon: 'Blue', amount: 5, space: 0.3, delay: 5 },
      { bloon: 'Green', amount: 5, space: 0.3, delay: 5 },
      { bloon: 'Yellow', amount: 4, space: 0.3, delay: 10 },
      { bloon: 'Blue', amount: 10, space: 0.2, delay: 5 },
      { bloon: 'Green', amount: 5, space: 0.4, delay: 5 },
      { bloon: 'Yellow', amount: 5, space: 0.3, delay: 0 },
    ],
    [
      { bloon: 'Red', amount: 20, space: 1.2, delay: 3 },
      { bloon: 'Blue', amount: 15, space: 1.4, delay: 3 },
      { bloon: 'Green', amount: 12, space: 1.4, delay: 4 },
      { bloon: 'Yellow', amount: 10, space: 1.4, delay: 12 },
      { bloon: 'Pink', amount: 5, space: 0.7, delay: 0 },
    ],
  ];

  //defines variables needed for the round to work
  window.roundNumber = 0; //round number - 1 because array
  window.roundNotOver = false;
  window.stoppedSendingBloons = 0;
  roundContainer.innerText = `round ${roundNumber + 1}`;
}


function roundPlay(wave = 0) {
  //updates roundContainer
  roundContainer.innerText = `round ${roundNumber + 1}`;
  //makes sure bloon name is correct spelled
  const [...bloonNameArray] = rounds[roundNumber][wave].bloon.toLowerCase();
  bloonNameArray[0] = bloonNameArray[0].toUpperCase();
  const ballon = bloonNameArray.join('');
  const amount = rounds[roundNumber][wave].amount;
  //makes the timing into milliseconds from seconds
  const space = rounds[roundNumber][wave].space * 1000;
  const delay = rounds[roundNumber][wave].delay * 1000;

  //makes bloons for the current wave
  roundNotOver = true;
  startRoundButton.innerText = 'Round is playing';
  //creates the amount of bloons and after the correct amount of time
  for (let i = 0; i < amount; i++) {
    setTimeout(() => {
      balloons.push(eval('new ' + ballon + '()'));
    }, space * i);
    //if it is the last bloon in a wave i starts a timer to update the stopped sending bloons variable
    if (i === amount - 1) {
      setTimeout(() => {
        stoppedSendingBloons += 1;
      }, space * i);
    }
  }
  //calls the function again if there are more waves otherwise it changes roundNumber
  if (rounds[roundNumber].length > wave + 1) {
    setTimeout(() => {
      roundPlay(wave + 1);
    }, delay);
  }
}
