  

  const monkeyTypes = [
    "Dart Monkey",
    "Boomerang Monkey",
    "Bomb Shooter",
    "Tack Shooter",
    "Ice Monkey",
    "Glue Gunner",
  ];
  
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

  let playerMoney, playerHealth, monkeys, balloons, projectiles, firstRoundPlayed;
  let autoplayOn = false;
  window.costModifier;
  window.speedModifier;

  function GameSetup() {
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

    monkeys = [];
    balloons = [];
    projectiles = [];
    firstRoundPlayed = false;

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
    
    window.moneyContainer = document.getElementById("money");
    window.healthContainer = document.getElementById("health");
    window.roundContainer = document.getElementById("round");
    window.main = document.getElementById("main");

    window.route = LoadRoute(directions, 0.1);
    // console.log(route);
    window.rectDimensions = LoadMap(directions);
    // console.log(rectDimensions);

    RoundSetup()

    let cnv = createCanvas(750, 500);
    createAsideElements();
    cnv.mousePressed(() => {
      const menu = document.getElementById("monkey-menu");
      if (menu) {
        main.removeChild(menu);
      }
      monkeys.forEach((monkey) => {
        monkey.showRange = false;
      });
      if (hover) {
        MonkeyPlacement();
      }
    });
    updateHeader();
  }

  function GameDraw() {
    DisplayRoute(rectDimensions);
    //monkeys
    monkeys.forEach((monkey) => {
      monkey.display();
      monkey.findTarget();
      if (monkey.hasTarget) {
        monkey.attack();
      }
    });
    //balloons
    balloons.forEach((bloon, index) => {
      bloon.display();
      bloon.move();
      //Checks if bloon has completed route
      const lastIndex = directions.length - 1;
      if (
        bloon.x === directions[lastIndex].x &&
        bloon.y + bloon.speed > directions[lastIndex].y
      ) {
        balloons.splice(index, 1);
        playerHealth -= bloon.health;
        console.log('ballons', balloons.length)
        updateHeader();

        if (playerHealth <= 0)
        {
          EndSetup('Died')
          gameState = 'end'
        }

        //balloons.push(new Bloon())
      }
    });
    //projectiles
    projectiles.forEach((projectile, projectileIndex) => {
      projectile.move();
      projectile.display();
      projectile.collision();
      if (projectile.x > width || projectile.x < 0) {
        if (projectile.y > height || projectile.y < 0) {
          projectiles.splice(projectileIndex, 1);
        }
      }
    });
    //draw hover object
    if (hover === true) {
      if (!CanPlaceMonkey(hoverMonkey.diameter/2)){
        fill(255,0,0,100)
        circle(mouseX, mouseY, hoverMonkey.diameter);
        fill(255,0,0,50)
        circle(mouseX, mouseY, hoverMonkey.range)
      } 
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
      } 
      else if (balloons.length === 0 && stoppedSendingBloons === rounds[roundNumber].length && roundNotOver){
        roundNotOver = false;
        playerMoney += 100 + roundNumber
        startRoundButton.innerText = 'Start Round'
        roundNumber++;
        stoppedSendingBloons = 0;
        updateHeader()
        checkWinCondition()
        if (autoplayOn && !checkWinCondition()){
          roundPlay()
        }
      } 
  }


    // moneyContainer.innerText = `🪙${playerMoney}`;

function LoadRoute(directions, stepDiff = 1) {
  let tempRoute = [];
  const startPoint = directions[0];
  const { x, y } = startPoint;
  let xCoor = x;
  let yCoor = y;
  let directionStep = 1;
  for (let i = 0; directionStep !== directions.length; i++) {
    const nextPoint = directions[directionStep];
    const { x, y } = nextPoint;
    if (xCoor < x) xCoor += stepDiff;
    else if (xCoor > x) xCoor -= stepDiff;
    if (yCoor < y) yCoor += stepDiff;
    else if (yCoor > y) yCoor -= stepDiff;
    xCoor = round(xCoor, 1);
    yCoor = round(yCoor, 1);
    tempRoute.push({ xCoor: xCoor, yCoor: yCoor });
    if (xCoor === x && yCoor === y) {
      directionStep += 1;
    }
  }
  return tempRoute;
}

function LoadMap(directions) {
  let rectDimensions = [];
  for (let i = 0; i + 1 !== directions.length; i++) {
    const roadSize = 33;
    let rectHeight = roadSize;
    let rectWidth = roadSize;
    let rectX;
    let rectY;
    const startPoint = directions[i];
    const { x, y } = startPoint;
    if (x === directions[i + 1].x) {
      rectHeight = directions[i + 1].y - y;
    } else if (y === directions[i + 1].y) {
      rectWidth = directions[i + 1].x - x;
    }
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

    rectDimensions.push({
      x: rectX,
      y: rectY,
      width: rectWidth,
      height: rectHeight,
    });
  }
  return rectDimensions;
}

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

function DoCirclesCollide(circ1X, circ1Y, circ1R, circ2X, circ2Y, circ2R) {
  return (
    sqrt((circ1X - circ2X) ** 2 + (circ1Y - circ2Y) ** 2) < circ1R + circ2R
  );
}

function keyPressed() {
  if ((keyCode === 8 || keyCode === 27)&& keyIsPressed === true) hover = false;
}

function MonkeyButtonClicked(id, name, monkeyClass) {
  selectedMonkeyContainer.innerText = name;
  hover = true;
  hoverMonkey = eval('new '+ monkeyClass +'(0,0)')
  hoverClass = monkeyClass;
}

function updateHeader() {
  moneyContainer.innerText = `💰${playerMoney}`;
  healthContainer.innerText = `❤️ ${playerHealth}`;
}

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
  window.startRoundButton = document.getElementById("start-round");
  window.selectedMonkeyContainer = document.getElementById(
    "selected-monkey-name"
  );

  const monkeyButtonContainer = document.getElementById(
    "monkey-button-container"
  );
  startRoundButton.addEventListener("click", () => {
    if (!roundNotOver && balloons.length === 0) {
      roundPlay();
    } else {
      console.log("round not over");
      window.alert("round not over");
    }
  });
  for (let i in monkeyTypes) {
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
    if (monkeyClass === "DartMonkey" || monkeyClass === "BoomerangMonkey" || monkeyClass === "BombShooter") {
      const testMonkey = eval("new " + monkeyClass + "(0, 0)");
      cost = `💰${testMonkey.cost}`;
    }
    const tempId = idArray.join("");
    const id = tempId.toLowerCase();

    const button = fsx(
      "button",
      {
        className: "tower-button",
        id: id,
        style: `background-image: url("/images/${id}.png")`,
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

function CanPlaceMonkey(monkeyRadius) {
  let roadCollision, monkeyCollision;
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
      // console.log("no monke cuz road");
      roadCollision = true;
      break;
    }
  }
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
      // console.log("no monke cuz monke");
      monkeyCollision = true;
      break;
    }
  }
  if (!roadCollision && !monkeyCollision){
    return true;
  }
}

function MonkeyPlacement() {
  const testMonkey = eval('new '+hoverClass+'(0, 0, undefined, 0);')
  const monkeyRadius = testMonkey.diameter / 2;
  if (testMonkey.cost >= playerMoney) {
    console.log("no money");
    window.alert("Not enough money");
    return 
  }
  if (!CanPlaceMonkey(monkeyRadius)) {
    window.alert("Can't place monkey here")
    return
  }
    if (
      mouseX > monkeyRadius &&
      mouseX < width - monkeyRadius &&
      mouseY > monkeyRadius &&
      mouseY < height - monkeyRadius
    ) {
      console.log("place monke");
      const id = crypto.randomUUID();
      monkeys.push(eval('new '+hoverClass+'(mouseX, mouseY, undefined, id)'));
      hover = false;
      playerMoney -= testMonkey.cost;
      updateHeader()
      // const positionLeft = mouseX + (windowWidth - width - 206);
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

function CreateUpgradeElement(monkey) {
  let left;
  if (monkey.x < width / 2) {
    left = "75%";
  } else {
    left = "0px";
  }
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

function UpdateUpgradeElement(monkey) {
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
  const sellButton = document.getElementById("sell-button");
  nameContainer.innerText = monkey.name;
  popsContainer.innerText = monkey.pops;
  monkeyIdBox.value = monkey.id
  targetModeContainer.innerText = monkey.targetMode;
  sellButton.innerText = `SELL \n 💰${monkey.sellPrice}`;
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

function MonkeyChangeInfo(id, change) {
  const targetingList = ["first", "last", "close", "strong"];
  monkeys.forEach((monkey, monkeyIndex) => {
    if (monkey.id === id) {
      const index = targetingList.findIndex((value) => {
        return value === monkey.targetMode;
      });
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
      const UpdatePath = (path) => {
        CheckUpgradeStatus()
        if (path.status !== 'locked' && path.currentUpgrade < 3) {
          const upgradeCost =
            path.upgradePath[
              path.currentUpgrade
            ].cost;
          // console.log(upgradeCost);
          if (playerMoney >= upgradeCost) {
            path.upgradePath[
              path.currentUpgrade
            ].effect(monkey);
            path.currentUpgrade += 1;
            playerMoney -= upgradeCost;
            moneyContainer.innerText = `💰${playerMoney}`;
            monkey.sellPrice += round(upgradeCost / 2);
          }
        }
      }
      
      switch (change) {
        case "back":
          if (index === 0) {
            monkey.targetMode = "strong";
          } else {
            monkey.targetMode = targetingList[index - 1];
          }
          break;

        case "forward":
          if (index === 3) {
            monkey.targetMode = "first";
          } else {
            monkey.targetMode = targetingList[index + 1];
          }
          break;

        case "top":
          UpdatePath(monkey.upgradeInfo.top)
          break;

        case "middle":
          UpdatePath(monkey.upgradeInfo.middle)
          break;

        case "bottom":
          UpdatePath(monkey.upgradeInfo.bottom)
          break;

        case "sell":
          playerMoney += monkey.sellPrice;
          updateHeader();
          const soldMonkeyButton = document.getElementById(
            `monkey-${monkey.id}`
          );
          const monkeyMenu = document.getElementById("monkey-menu");
          main.removeChild(monkeyMenu);
          monkeys.splice(monkeyIndex, 1);
          main.removeChild(soldMonkeyButton);

          break;
      }
      if (change !== "sell") {
        UpdateUpgradeElement(monkey);
        CheckUpgradeStatus();
        UpdateUpgradeElement(monkey);
      }
    }
  });
}
