class Red {
  constructor(x = route[0].xCoor, y = route[0].yCoor, currentStep = 0, id = round(random(100000))) {
    this.currentStep = currentStep //step in the route
    this.speed = speedModifier * 10; //how fast it moves
    this.x = x;
    this.y = y;
    this.col = 'red';
    this.diameter = 30;
    this.health = 1; //layer
    this.defense = 0;
    this.money = 1; //how much money it gives when popped
    this.id = id; //unique 
    this.childBloon = undefined; //the bloon it will spawn when popped
    this.parentBloon = Blue;
  }

  //method for when the bloon takes damage
  popped(damage){
    //returns if there is no childBloon
    let pops;
    if (this.childBloon === undefined) {
      playerMoney += this.money
      pops = 1
      updateHeader()
      return pops;
    }
    let nextBloon;
    //function for finding which bloon the that should spawn when popped
    const findNextBloon = (bloon, layerDeep = 1) => {
      //returns if there is no childBloon
      if (bloon.childBloon === undefined) {
        playerMoney += bloon.money * layerDeep
        pops = layerDeep
        updateHeader()
        return pops;
      }
      //if the damage is the same as how many times the function has run, this is the next bloon that should spawn
      if (layerDeep === damage){
        nextBloon = bloon.childBloon;
        playerMoney += bloon.money * layerDeep - 1
        pops = layerDeep - 1
        updateHeader()
      } 
      // make a new ballon and repeat the process
      else {
        const newBloon = eval('new ' + bloon.childBloon + '()');
        findNextBloon(newBloon, layerDeep + 1)
      }
    }
    findNextBloon(this)
    if (nextBloon === undefined) return pops;
    //make the new ballon
    balloons.push(eval('new ' + nextBloon + `(${this.x}, ${this.y}, ${round(this.currentStep)}, ${this.id})`))
    return pops
  }

  //move on the route
  move() {
    this.currentStep += this.speed;
    this.currentStep = round(this.currentStep);
    this.x = route[this.currentStep].xCoor;
    this.y = route[this.currentStep].yCoor;
  }

  //shows the ballon as a circle
  display() {
    fill(this.col);
    strokeWeight(1);
    circle(this.x, this.y, this.diameter);
    strokeWeight(0);
  }

}

//makes more bloons that inherit for Red and change some values for them
class Blue extends Red {
  constructor(x = route[0].xCoor, y = route[0].yCoor, currentStep = 0, id = round(random(10000))) {
    super(x, y, currentStep, id);
    this.col = 'blue';
    this.speed = speedModifier * 14;
    this.childBloon = Red;
    this.parentBloon = Green;
    this.health = 2

  }

}
class Green extends Red {
  constructor(x = route[0].xCoor, y = route[0].yCoor, currentStep = 0, id = round(random(10000))) {
    super(x, y, currentStep, id);
    this.col = 'green';
    this.speed = speedModifier * 18;
    this.childBloon = Blue
    this.parentBloon = Yellow;
    this.health = 3
  }
}

class Yellow extends Red {
  constructor(x = route[0].xCoor, y = route[0].yCoor, currentStep = 0, id = round(random(10000))) {
    super(x, y, currentStep, id);
    this.col = 'yellow'
    this.speed = speedModifier * 32;
    this.childBloon = Green;
    this.parentBloon = Pink;
    this.health = 4;
  }
}
class Pink extends Red {
  constructor(x = route[0].xCoor, y = route[0].yCoor, currentStep = 0, id = round(random(10000))) {
    super(x, y, currentStep, id);
    this.col = 'pink';
    this.speed = speedModifier * 35;
    this.childBloon = Yellow;
    this.health = 5;
  }
}

class Black extends Red {
  constructor(x = route[0].xCoor, y = route[0].yCoor, currentStep = 0, id = round(random(10000))) {
    super(x, y, currentStep, id);
    this.speed = speedModifier * 18
  }
}
class White extends Red {
  constructor(x = route[0].xCoor, y = route[0].yCoor, currentStep = 0, id = round(random(10000))) {
    super(x, y, currentStep, id);
    this.speed = speedModifier * 20
  }
}