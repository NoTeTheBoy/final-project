  
//define what monkeys that should be drawn on the aside menu
  const monkeyTypes = [
    "Dart Monkey",
    "Boomerang Monkey",
    "Bomb Shooter",
    "Tack Shooter",
    "Ice Monkey",
    "Glue Gunner",
  ];
//define at what points the rute turns
  const directions = [
    { x: 0, y: 208 },
    { x: 366, y: 208 },
    { x: 366, y: 100 },
    { x: 250, y: 100 },
    { x: 250, y: 408 },
    { x: 125, y: 408 },
    { x: 125, y: 300 },
    { x: 466, y: 300 },
    { x: 466, y: 175 },
    { x: 550, y: 175 },
    { x: 550, y: 366 },
    { x: 333, y: 366 },
    { x: 333, y: 530 },
  ];

  //variables for the hoverObject
  let hover = false;
  let hoverMonkey;
  let hoverClass;

  //necessary variables for the game 
  let playerMoney, playerHealth, monkeys, balloons, projectiles, firstRoundPlayed;
  let autoplayOn = false;
  window.costModifier;
  window.speedModifier;

  function GameSetup() {
    //checks difficulty and changes modifiers accordingly
    switch(difficulty){
      case 'easy':
        speedModifier = 1;
        costModifier = 0.85;
        playerHealth = 200;
        break;
      case 'medium':
        speedModifier = 1.1;
        costModifier = 1;
        playerHealth = 150;
        break;
      case 'hard':
        speedModifier = 1.25;
        costModifier = 1.08;
        playerHealth = 100;
        break;
    }
    playerMoney = 650;
    if (impoppableSelected){
        costModifier = 1.2;
        playerHealth = 1;
    }

    //makes the arrays empty
    monkeys = [];
    balloons = [];
    projectiles = [];
    firstRoundPlayed = false;

    //create the element where canvas and more will be placed
    const mainCreation = fsx('main', {id: 'main'}, [
      fsx('header', {id: 'header'}, [
        fsx('div', {}, [
          fsx('p', {id: 'health'}, [
            fsx(null, {}, ['Health'])
          ])
        ]),
        fsx('div', {}, [
          fsx('p', {id: 'money'}, [
            fsx(null, {}, ['Money'])
          ])
        ]),
        fsx('div', {}, [
          fsx('p', {id: 'round'}, [
            fsx(null, {}, ['Round'])
          ])
        ]),
      ])
    ])
    gameContainer.appendChild(mainCreation)
    
    //define global variables, so it can be changed outside of the function
    window.moneyContainer = document.getElementById("money");
    window.healthContainer = document.getElementById("health");
    window.roundContainer = document.getElementById("round");
    window.main = document.getElementById("main");

    //create and define route and the dimension for the rectangles that make out the map
    window.route = LoadRoute(directions, 0.1);
    window.rectDimensions = LoadMap(directions);

    //run the roundSetup, so the variables reset
    RoundSetup()

    //create canvas and aside
    let cnv = createCanvas(750, 500);
    createAsideElements();
    //add onclick events on canvas
    cnv.mousePressed(() => {
      //removes upgrade menu and the range off monkeys
      const menu = document.getElementById("monkey-menu");
      if (menu) {
        main.removeChild(menu);
      }
      monkeys.forEach((monkey) => {
        monkey.showRange = false;
      });
      //places monkey
      if (hover) {
        MonkeyPlacement();
      }
    });
    updateHeader();
  }

  function GameDraw() {
    //displays the route
    DisplayRoute(rectDimensions);
    //methods and code for the monkeys
    monkeys.forEach((monkey) => {
      monkey.display();
      monkey.findTarget();
      if (monkey.hasTarget) {
        monkey.attack();
      }
    });
    //methods and code for the balloons
    balloons.forEach((bloon, index) => {
      bloon.display();
      bloon.move();
      //Checks if bloon has completed route and splices the object 
      const lastIndex = directions.length - 1;
      if (
        bloon.x === directions[lastIndex].x &&
        bloon.y + bloon.speed > directions[lastIndex].y
      ) {
        balloons.splice(index, 1);
        playerHealth -= bloon.health;
        console.log('ballons', balloons.length)
        updateHeader();

        //if there is no more lives you die
        if (playerHealth <= 0)
        {
          EndSetup('Died')
          gameState = 'end'
        }
      }
    });
    //methods and code for the projectiles
    projectiles.forEach((projectile, projectileIndex) => {
      projectile.move();
      projectile.display();
      projectile.collision();
      //checks if the projectile is out of the map
      if (projectile.x > width || projectile.x < 0) {
        if (projectile.y > height || projectile.y < 0) {
          projectiles.splice(projectileIndex, 1);
        }
      }
    });
    //draw hover object
    if (hover === true) {
      //if you cant place show a red color
      if (!CanPlaceMonkey(hoverMonkey.diameter/2)){
        fill(255,0,0,100)
        circle(mouseX, mouseY, hoverMonkey.diameter);
        fill(255,0,0,50)
        circle(mouseX, mouseY, hoverMonkey.range)
      } 
      //else show a normal color
      else {
        fill(hoverMonkey.color)
        circle(mouseX, mouseY, hoverMonkey.diameter);
        fill(50, 50)
        circle(mouseX, mouseY, hoverMonkey.range)
      }
    }
    
    //win condition
    const checkWinCondition = () => {
    if (!roundNotOver && roundNumber >= rounds.length){
      if(balloons.length === 0){
        EndSetup('Won')
        gameState = 'end'
        return true;
      }
    }
    return false;
    }
      //checks if round is over
      if (balloons.length !== 0){
        roundNotOver = true;
        startRoundButton.innerText = 'Round is playing'
      } //makes ready for the next round
      else if (balloons.length === 0 && stoppedSendingBloons === rounds[roundNumber].length && roundNotOver){
        roundNotOver = false;
        playerMoney += 100 + roundNumber
        startRoundButton.innerText = 'Start Round'
        roundNumber++;
        stoppedSendingBloons = 0;
        updateHeader()
        checkWinCondition()
        //plays next round if autoplay is on
        if (autoplayOn && !checkWinCondition()){
          roundPlay()
        }
      } 
  }

//creates the route
function LoadRoute(directions, stepDiff = 1) {
  //sets the start point and gets ready to make the route
  let tempRoute = [];
  const startPoint = directions[0];
  const { x, y } = startPoint;
  let xCoor = x;
  let yCoor = y;
  let directionStep = 1;
  //go over all the directions and push the steps into the array
  for (let i = 0; directionStep !== directions.length; i++) {
    const nextPoint = directions[directionStep];
    const { x, y } = nextPoint;
    //checks which directions the x and y values need to be heading
    if (xCoor < x) xCoor += stepDiff;
    else if (xCoor > x) xCoor -= stepDiff;
    if (yCoor < y) yCoor += stepDiff;
    else if (yCoor > y) yCoor -= stepDiff;
    //rounds cuz floating error
    xCoor = round(xCoor, 1);
    yCoor = round(yCoor, 1);
    tempRoute.push({ xCoor: xCoor, yCoor: yCoor });
    //goes to next direction if current direction and step are the same coordinates
    if (xCoor === x && yCoor === y) {
      directionStep += 1;
    }
  }
  return tempRoute;
}
//creates the dimension for the road
function LoadMap(directions) {
  let rectDimensions = [];
  for (let i = 0; i + 1 !== directions.length; i++) {
    //set starting variables 
    const roadSize = 33;
    let rectHeight = roadSize;
    let rectWidth = roadSize;
    let rectX;
    let rectY;
    const startPoint = directions[i];
    const { x, y } = startPoint;
    //check if the height or the width needs to change
    if (x === directions[i + 1].x) {
      rectHeight = directions[i + 1].y - y;
    } else if (y === directions[i + 1].y) {
      rectWidth = directions[i + 1].x - x;
    }
    //makes the value positive if it is negative and corrects position
    if (rectWidth < 0) {
      rectWidth *= -1;
      rectWidth += roadSize;
      rectX = directions[i + 1].x - roadSize / 2;
      rectY = y - rectHeight / 2;
    } else if (rectHeight < 0) {
      rectHeight *= -1;
      rectHeight += roadSize;
      rectX = x - rectWidth / 2;
      rectY = directions[i + 1].y - roadSize / 2;
    } else if (rectWidth === roadSize && rectHeight !== roadSize) {
      rectHeight += roadSize;
      rectX = x - rectWidth / 2;
      rectY = y - roadSize / 2;
    } else {
      rectWidth += roadSize;
      rectX = x - roadSize / 2;
      rectY = y - rectHeight / 2;
    }
    //pushes the object with dimensions into the array
    rectDimensions.push({
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight,
    });
  }
  return rectDimensions;
}
//draws the route
function DisplayRoute(
  rectDimensions,
  bgColor = "#227513",
  roadColor = "#999794"
) {
  background(bgColor);
  fill(roadColor);
  strokeWeight(0);
  rectDimensions.forEach((road) => {
    rect(road.x, road.y, road.width, road.height);
  });
}
//collision between rectangle and circle
function DoRectCircleCollide(circX, circY, circR, rectX, rectY, rectW, rectH) {
  const distX = abs(circX - rectX - rectW / 2);
  const distY = abs(circY - rectY - rectH / 2);

  //is the circle outside the rectangle
  if (distX > rectW / 2 + circR) return false;
  if (distY > rectH / 2 + circR) return false;

  //is the circle inside the rectangle
  if (distX <= rectW / 2) return true;
  if (distY <= rectH / 2) return true;

  //is the circle on the corner of the rectangle
  const dx = distX - rectW / 2;
  const dy = distY - rectH / 2;
  return dx ** 2 + dy ** 2 <= circR ** 2;

  //Fandt en funktion på stackoverflow
  //LINK - https://stackoverflow.com/questions/21089959/detecting-collision-of-rectangle-with-circle
}

//collision between circles
function DoCirclesCollide(circ1X, circ1Y, circ1R, circ2X, circ2Y, circ2R) {
  return (
    sqrt((circ1X - circ2X) ** 2 + (circ1Y - circ2Y) ** 2) < circ1R + circ2R
  );
}

//stops the hover if escape or backspace is pressed
function keyPressed() {
  if ((keyCode === 8 || keyCode === 27)&& keyIsPressed === true) hover = false;
}

//change values for hover variables
function MonkeyButtonClicked(id, name, monkeyClass) {
  selectedMonkeyContainer.innerText = name;
  hover = true;
  hoverMonkey = eval('new '+ monkeyClass +'(0,0)')
  hoverClass = monkeyClass;
}

//updates the display for money and health 
function updateHeader() {
  moneyContainer.innerText = `💰${playerMoney}`;
  healthContainer.innerText = `❤️ ${playerHealth}`;
}

//creates the aside
function createAsideElements() {
  const asideCreation = fsx('aside', {id: 'aside'}, [
    fsx('div', {className: 'aside-container'}, [
      fsx('span', {id: 'selected-monkey-name'}, [
        fsx(null, {}, ['None'])
      ]),
      fsx('button', {id: 'autoplay-button', onclick: () => {
        const autoplayButton = document.getElementById('autoplay-button')
        if (autoplayOn){
          autoplayOn = false;
          autoplayButton.innerText = `Autoplay: OFF`;
        } else {
          autoplayOn = true;
          autoplayButton.innerText = `Autoplay: ON`;
        }
      }}, [
        fsx(null, {}, ['Autoplay: OFF'])
      ])
    ]),
    fsx('div', {id: 'monkey-button-container'}, []),
    fsx('div', {className: 'aside-container'}, [
      fsx('button', {id: 'start-round'}, [
        fsx(null, {}, ['Start Round'])
      ])
    ])
  ])

  gameContainer.appendChild(asideCreation)
  //defines global variables, so they can be accessed
  window.startRoundButton = document.getElementById("start-round");
  window.selectedMonkeyContainer = document.getElementById(
    "selected-monkey-name"
  );

  const monkeyButtonContainer = document.getElementById(
    "monkey-button-container"
  );
  //add onclick listener to start round button that starts the round when clicked
  startRoundButton.addEventListener("click", () => {
    if (!roundNotOver && balloons.length === 0) {
      roundPlay();
    } else {
      console.log("round not over");
      window.alert("round not over");
    }
  });
  //creates the buttons you press to buy monkeys
  for (let i in monkeyTypes) {
    //takes the string and makes 3 different strings so they make out the name, id and class
    const name = monkeyTypes[i];
    let idArray = [];
    let classArray = [];

    for (let i in name) {
      if (name[i] !== " ") {
        idArray.push(name[i]);
        classArray.push(name[i]);
      } else {
        idArray.push("-");
      }
    }
    const monkeyClass = classArray.join("");
    let cost;
    //use the class to create an object and find the cost value
    if (monkeyClass === "DartMonkey" || monkeyClass === "BoomerangMonkey" || monkeyClass === "BombShooter") {
      const testMonkey = eval("new " + monkeyClass + "(0, 0)");
      cost = `💰${testMonkey.cost}`;
    }
    const tempId = idArray.join("");
    const id = tempId.toLowerCase();
    //creates the button
    const button = fsx(
      "button",
      {
        className: "tower-button",
        id: id,
        //uses id to find the image
        style: `background-image: url("/images/${id}.png")`,
        //adds a onclick event
        onclick: () => {
          MonkeyButtonClicked(id, name, monkeyClass);
        },
      },
      [
        fsx("div", {}, [fsx(null, {}, [name])]),
        fsx("div", {}, [fsx(null, {}, [cost])]),
      ]
    );
    monkeyButtonContainer.appendChild(button);
  }
}

//deletes old menu and creates a new one
function MonkeyMenu(id) {
  monkeys.forEach((monkey) => {
    if (monkey.id === id) {
      const menu = document.getElementById("monkey-menu");
      if (menu) {
        main.removeChild(menu);
      }
      monkey.showRange = true;
      CreateUpgradeElement(monkey);
      UpdateUpgradeElement(monkey);
    } else monkey.showRange = false;
  });
}

//checks if you can place monkey
function CanPlaceMonkey(monkeyRadius) {
  let roadCollision, monkeyCollision;
  //checks for road
  for (let i in rectDimensions) {
    if (
      !DoRectCircleCollide(
        mouseX,
        mouseY,
        monkeyRadius,
        rectDimensions[i].x,
        rectDimensions[i].y,
        rectDimensions[i].width,
        rectDimensions[i].height
      )
    ) {
      roadCollision = false;
    } else {
      roadCollision = true;
      break;
    }
  }
  //checks for monkeys
  for (let i in monkeys) {
    if (
      !DoCirclesCollide(
        mouseX,
        mouseY,
        monkeyRadius,
        monkeys[i].x,
        monkeys[i].y,
        monkeys[i].diameter / 2
      )
    ) {
      monkeyCollision = false;
    } else {
      monkeyCollision = true;
      break;
    }
  }
  //if no collision return true
  if (!roadCollision && !monkeyCollision){
    return true;
  }
}

//creates and places the monkey
function MonkeyPlacement() {
  //create an object
  const testMonkey = eval('new '+hoverClass+'(0, 0, undefined, 0);')
  //find the diameter of the monkey
  const monkeyRadius = testMonkey.diameter / 2;
  //check if you have enough monkey
  if (testMonkey.cost >= playerMoney) {
    console.log("no money");
    window.alert("Not enough money");
    return 
  }
  //can you places the monkey?
  if (!CanPlaceMonkey(monkeyRadius)) {
    window.alert("Can't place monkey here")
    return
  }
  //is it within the map
    if (
      mouseX > monkeyRadius &&
      mouseX < width - monkeyRadius &&
      mouseY > monkeyRadius &&
      mouseY < height - monkeyRadius
    ) {
      //creates variables for the monkey and creates the monkey
      const id = crypto.randomUUID();
      monkeys.push(eval('new '+hoverClass+'(mouseX, mouseY, undefined, id)'));
      hover = false;
      playerMoney -= testMonkey.cost;
      updateHeader()
      //creates the button for the monkey
      const MonkeyButton = fsx("button", {
        className: "monkey-button",
        style: `left: ${mouseX}px; top: ${mouseY}px;`,
        id: `monkey-${id}`,
        onclick: () => MonkeyMenu(id),
      });
      main.appendChild(MonkeyButton);
      return;
    }

}
//creates the upgrade element
function CreateUpgradeElement(monkey) {
  //finds on which side of the map the monkey is and place the upgrade element on the opposite side
  let left;
  if (monkey.x < width / 2) {
    left = "75%";
  } else {
    left = "0px";
  }
  //create the upgrade element
  const monkeyMenu = fsx("div", { id: "monkey-menu", style: `left: ${left}` }, [
    fsx("div", { className: "info-container" }, [
      fsx("p", { id: "monkey" }, []),
      fsx("p", { id: "monkey-pops" }, []),
      fsx("p", { id: 'monkey-id'}, []),
      fsx("div", {}, [
        fsx(
          "button",
          {
            id: "targeting-back",
            onclick: () => {
              MonkeyChangeInfo(monkey.id, "back");
            },
          },
          []
        ),
        fsx("p", { id: "targeting" }, []),
        fsx(
          "button",
          {
            id: "targeting-forward",
            onclick: () => {
              MonkeyChangeInfo(monkey.id, "forward");
            },
          },
          []
        ),
      ]),
    ]),
    fsx("div", { className: "path-container" }, [
      fsx("div", { className: "upgrade-number" }, [
        fsx("div", { className: "upgradebox", id: "top3" }, []),
        fsx("div", { className: "upgradebox", id: "top2" }, []),
        fsx("div", { className: "upgradebox", id: "top1" }, []),
      ]),
      fsx(
        "div",
        { className: "current-upgrade", id: "current-top-upgrade" },
        []
      ),
      fsx("button", {
        id: "next-top-upgrade",
        onclick: () => {
          MonkeyChangeInfo(monkey.id, "top");
        },
      }),
    ]),
    fsx("div", { className: "path-container" }, [
      fsx("div", { className: "upgrade-number" }, [
        fsx("div", { className: "upgradebox", id: "middle3" }, []),
        fsx("div", { className: "upgradebox", id: "middle2" }, []),
        fsx("div", { className: "upgradebox", id: "middle1" }, []),
      ]),
      fsx(
        "div",
        { className: "current-upgrade", id: "current-middle-upgrade" },
        []
      ),
      fsx("button", {
        id: "next-middle-upgrade",
        onclick: () => {
          MonkeyChangeInfo(monkey.id, "middle");
        },
      }),
    ]),
    fsx("div", { className: "path-container" }, [
      fsx("div", { className: "upgrade-number" }, [
        fsx("div", { className: "upgradebox", id: "bottom3" }, []),
        fsx("div", { className: "upgradebox", id: "bottom2" }, []),
        fsx("div", { className: "upgradebox", id: "bottom1" }, []),
      ]),
      fsx(
        "div",
        { className: "current-upgrade", id: "current-bottom-upgrade" },
        []
      ),
      fsx("button", {
        id: "next-bottom-upgrade",
        onclick: () => {
          MonkeyChangeInfo(monkey.id, "bottom");
        },
      }),
    ]),
    fsx("div", { className: "sell-container" }, [
      fsx(
        "button",
        {
          id: "sell-button",
          onclick: () => {
            MonkeyChangeInfo(monkey.id, "sell");
          },
        },
        []
      ),
    ]),
  ]);
  main.appendChild(monkeyMenu);
}

//update the upgrade element
function UpdateUpgradeElement(monkey) {
  //defines the variables in the upgrade element
  const nameContainer = document.getElementById("monkey");
  const popsContainer = document.getElementById("monkey-pops");
  const monkeyIdBox = document.getElementById("monkey-id")
  const targetModeContainer = document.getElementById("targeting");
  const topUpgrade1Box = document.getElementById("top1");
  const topUpgrade2Box = document.getElementById("top2");
  const topUpgrade3Box = document.getElementById("top3");
  const topCurrentUpgradeContainer = document.getElementById(
    "current-top-upgrade"
  );
  const topNextUpgradeContainer = document.getElementById("next-top-upgrade");
  const middleUpgrade1Box = document.getElementById("middle1");
  const middleUpgrade2Box = document.getElementById("middle2");
  const middleUpgrade3Box = document.getElementById("middle3");
  const middleCurrentUpgradeContainer = document.getElementById(
    "current-middle-upgrade"
  );
  const middleNextUpgradeContainer = document.getElementById(
    "next-middle-upgrade"
  );
  const bottomUpgrade1Box = document.getElementById("bottom1");
  const bottomUpgrade2Box = document.getElementById("bottom2");
  const bottomUpgrade3Box = document.getElementById("bottom3");
  const bottomCurrentUpgradeContainer = document.getElementById(
    "current-bottom-upgrade"
  );
  const bottomNextUpgradeContainer = document.getElementById(
    "next-bottom-upgrade"
  );
  //updates the elements with the correct values
  const sellButton = document.getElementById("sell-button");
  nameContainer.innerText = monkey.name;
  popsContainer.innerText = monkey.pops;
  monkeyIdBox.value = monkey.id
  targetModeContainer.innerText = monkey.targetMode;
  sellButton.innerText = `SELL \n 💰${monkey.sellPrice}`;
  //find the current upgrades for all the paths and display the correct upgrade
  switch (monkey.upgradeInfo.top.currentUpgrade) {
    case 0:
      topCurrentUpgradeContainer.innerText = "No Upgrades";
      topNextUpgradeContainer.innerText = `${monkey.upgradeInfo.top.upgradePath[0].name} \n Cost: 💰${monkey.upgradeInfo.top.upgradePath[0].cost}`;
      break;

    case 1:
      topUpgrade1Box.style.backgroundColor = "black";
      topCurrentUpgradeContainer.innerText = `${monkey.upgradeInfo.top.upgradePath[0].name} \n Owned`;
      topNextUpgradeContainer.innerText = `${monkey.upgradeInfo.top.upgradePath[1].name} \n Cost: 💰${monkey.upgradeInfo.top.upgradePath[1].cost}`;
      break;

    case 2:
      topUpgrade1Box.style.backgroundColor = "black";
      topUpgrade2Box.style.backgroundColor = "black";

      topCurrentUpgradeContainer.innerText = `${monkey.upgradeInfo.top.upgradePath[1].name} \n Owned`;
      topNextUpgradeContainer.innerText = `${monkey.upgradeInfo.top.upgradePath[2].name} \n Cost: 💰${monkey.upgradeInfo.top.upgradePath[2].cost}`;
      break;
    case 3:
      topUpgrade1Box.style.backgroundColor = "black";
      topUpgrade2Box.style.backgroundColor = "black";
      topUpgrade3Box.style.backgroundColor = "black";
      topCurrentUpgradeContainer.innerText = `${monkey.upgradeInfo.top.upgradePath[2].name} \n Owned`;
      topNextUpgradeContainer.innerText = "Max";
      break;
  }
if (monkey.upgradeInfo.top.status === 'locked') {
  topNextUpgradeContainer.innerText = 'PATH LOCKED'
}


  switch (monkey.upgradeInfo.middle.currentUpgrade) {
    case 0:
      middleCurrentUpgradeContainer.innerText = "No Upgrades";
      middleNextUpgradeContainer.innerText = `${monkey.upgradeInfo.middle.upgradePath[0].name} \n Cost: 💰${monkey.upgradeInfo.middle.upgradePath[0].cost}`;
      break;
    case 1:
      middleUpgrade1Box.style.backgroundColor = "black";
      middleCurrentUpgradeContainer.innerText = `${monkey.upgradeInfo.middle.upgradePath[0].name} \n Owned`;
      middleNextUpgradeContainer.innerText = `${monkey.upgradeInfo.middle.upgradePath[1].name} \n Cost: 💰${monkey.upgradeInfo.middle.upgradePath[1].cost}`;
      break;

    case 2:
      middleUpgrade1Box.style.backgroundColor = "black";
      middleUpgrade2Box.style.backgroundColor = "black";
      middleCurrentUpgradeContainer.innerText = `${monkey.upgradeInfo.middle.upgradePath[1].name} \n Owned`;
      middleNextUpgradeContainer.innerText = `${monkey.upgradeInfo.middle.upgradePath[2].name} \n Cost: 💰${monkey.upgradeInfo.middle.upgradePath[2].cost}`;
      break;

    case 3:
      middleUpgrade1Box.style.backgroundColor = "black";
      middleUpgrade2Box.style.backgroundColor = "black";
      middleUpgrade3Box.style.backgroundColor = "black";
      middleCurrentUpgradeContainer.innerText = `${monkey.upgradeInfo.middle.upgradePath[2].name} \n Owned`;
      middleNextUpgradeContainer.innerText = "Max";
      break;
  }
  if (monkey.upgradeInfo.middle.status === 'locked') {
    middleNextUpgradeContainer.innerText = 'PATH LOCKED'
  }
  
  switch (monkey.upgradeInfo.bottom.currentUpgrade) {
    case 0:
      bottomCurrentUpgradeContainer.innerText = "No Upgrades";
      bottomNextUpgradeContainer.innerText = `${monkey.upgradeInfo.bottom.upgradePath[0].name} \n Cost: 💰${monkey.upgradeInfo.bottom.upgradePath[0].cost}`;
      break;
    case 1:
      bottomUpgrade1Box.style.backgroundColor = "black";
      bottomCurrentUpgradeContainer.innerText = `${monkey.upgradeInfo.bottom.upgradePath[0].name} \n Owned`;
      bottomNextUpgradeContainer.innerText = `${monkey.upgradeInfo.bottom.upgradePath[1].name} \n Cost: 💰${monkey.upgradeInfo.bottom.upgradePath[1].cost}`;
      break;

    case 2:
      bottomUpgrade1Box.style.backgroundColor = "black";
      bottomUpgrade2Box.style.backgroundColor = "black";
      bottomCurrentUpgradeContainer.innerText = `${monkey.upgradeInfo.bottom.upgradePath[1].name} \n Owned`;
      bottomNextUpgradeContainer.innerText = `${monkey.upgradeInfo.bottom.upgradePath[2].name} \n Cost: 💰${monkey.upgradeInfo.bottom.upgradePath[2].cost}`;
      break;

    case 3:
      bottomUpgrade1Box.style.backgroundColor = "black";
      bottomUpgrade2Box.style.backgroundColor = "black";
      bottomUpgrade3Box.style.backgroundColor = "black";
      bottomCurrentUpgradeContainer.innerText = `${monkey.upgradeInfo.bottom.upgradePath[2].name} \n Owned`;
      bottomNextUpgradeContainer.innerText = "Max";
      break;
  }
  if (monkey.upgradeInfo.bottom.status === 'locked') {
    bottomNextUpgradeContainer.innerText = 'PATH LOCKED'
  }
}

//changes the monkey info
function MonkeyChangeInfo(id, change) {
  //defines the target modes
  const targetingList = ["first", "last", "close", "strong"];
  monkeys.forEach((monkey, monkeyIndex) => {
    if (monkey.id === id) {
      //finds the monkeys target mode
      const index = targetingList.findIndex((value) => {
        return value === monkey.targetMode;
      });
      //checks which path you can upgrade
      const CheckUpgradeStatus = ()=> {
        //top
        if (
          monkey.upgradeInfo.middle.currentUpgrade !== 0 &&
          monkey.upgradeInfo.bottom.currentUpgrade !== 0
        ){
          monkey.upgradeInfo.top.status = 'locked'
        } 
        else if (monkey.upgradeInfo.top.currentUpgrade === 2) {
          if (
            monkey.upgradeInfo.middle.currentUpgrade === 3 ||
            monkey.upgradeInfo.bottom.currentUpgrade === 3
          ){
            monkey.upgradeInfo.top.status = 'locked'
          }
        }
        //middle
        if (
          monkey.upgradeInfo.top.currentUpgrade !== 0 &&
          monkey.upgradeInfo.bottom.currentUpgrade !== 0
        ){
          monkey.upgradeInfo.middle.status = 'locked'
        } 
        else if (monkey.upgradeInfo.middle.currentUpgrade === 2) {
          if (
            monkey.upgradeInfo.top.currentUpgrade === 3 ||
            monkey.upgradeInfo.bottom.currentUpgrade === 3
          ){
            monkey.upgradeInfo.middle.status = 'locked'
          }
        }
        //bottom
        if (
          monkey.upgradeInfo.middle.currentUpgrade !== 0 &&
          monkey.upgradeInfo.top.currentUpgrade !== 0
        ){
          monkey.upgradeInfo.bottom.status = 'locked'
        }
        if (monkey.upgradeInfo.bottom.currentUpgrade === 2) {
          if (
            monkey.upgradeInfo.middle.currentUpgrade === 3 ||
            monkey.upgradeInfo.top.currentUpgrade === 3
          ){
            monkey.upgradeInfo.bottom.status = 'locked'
          }
        }
      }
      //updates the monkey depending on which upgrade is chosen
      const UpdatePath = (path) => {
        //checks if you can upgrade
        CheckUpgradeStatus()
        if (path.status !== 'locked' && path.currentUpgrade < 3) {
          //define cost
          const upgradeCost =
            path.upgradePath[
              path.currentUpgrade
            ].cost;
          //if you can afford the run the effect of the upgrade
          if (playerMoney >= upgradeCost) {
            path.upgradePath[
              path.currentUpgrade
            ].effect(monkey);
            //update values so they are correct
            path.currentUpgrade += 1;
            playerMoney -= upgradeCost;
            moneyContainer.innerText = `💰${playerMoney}`;
            monkey.sellPrice += round(upgradeCost / 2);
          }
        }
      }
      //find out which action is needed
      switch (change) {
        case "back":
          //change target mode one back
          if (index === 0) {
            monkey.targetMode = "strong";
          } else {
            monkey.targetMode = targetingList[index - 1];
          }
          break;

        case "forward":
          //change target mode one forward
          if (index === 3) {
            monkey.targetMode = "first";
          } else {
            monkey.targetMode = targetingList[index + 1];
          }
          break;

        //update the upgrade path
        case "top":
          UpdatePath(monkey.upgradeInfo.top)
          break;

        case "middle":
          UpdatePath(monkey.upgradeInfo.middle)
          break;

        case "bottom":
          UpdatePath(monkey.upgradeInfo.bottom)
          break;

        //sell the monkey
        case "sell":
          //get money
          playerMoney += monkey.sellPrice;
          updateHeader();
          //find button associated with monkey
          const soldMonkeyButton = document.getElementById(
            `monkey-${monkey.id}`
          );
          //remove everything related
          const monkeyMenu = document.getElementById("monkey-menu");
          main.removeChild(monkeyMenu);
          monkeys.splice(monkeyIndex, 1);
          main.removeChild(soldMonkeyButton);

          break;
      }
      if (change !== "sell") {
        //update the upgrade element
        UpdateUpgradeElement(monkey);
        //check the upgrade status
        CheckUpgradeStatus();
        //update element againg
        UpdateUpgradeElement(monkey);
      }
    }
  });
}
