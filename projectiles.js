class Dart {
  constructor(x, y, vectorAngle, monkeyId, {damage, pierce, speed, lifespan, ball = false}) {
    //projectile variables
    this.x = x;
    this.y = y;
    this.heading = vectorAngle;
    this.damage = 1 + damage; //damage it does to bloon
    this.pierce = 2 + pierce; //how many bloons it can hit before it disappears
    this.speed = 23 * speed;
    this.lifespan = 1800 * lifespan;
    this.ball = ball
    if (ball){
      this.damage = 2 + damage; //damage it does to bloon
      this.pierce = 22 + pierce; //how many bloons it can hit before it disappears
      this.speed = 15 * speed;
      this.lifespan = 3000 * lifespan;
    }
    this.damageType = 'Sharp';
    this.diameter = 3 * unitConverter;
    //id of the monkey that shot the projectile so it can transfer the pops
    this.monkeyId = monkeyId;
    this.ownId = crypto.randomUUID();
    //array over bloons it has hit so it doesn't hit the same bloon twice
    this.bloonsHit = [];
    //timer so it gets deleted after its lifespan is over
    setTimeout(() => {
      projectiles.forEach((projectile, index) => {
        if (projectile.ownId === this.ownId){
          projectiles.splice(index, 1);
        }
      })
    }, this.lifespan)
  }

  //checks if it collides with a ballon
  collision() {
    balloons.forEach((bloon, ballonIndex) => {
      //has it hit the balloon before
      if (this.bloonsHit.includes(bloon.id)) return;
      //does it hit it
      if (!DoCirclesCollide(this.x, this.y, this.diameter / 2, bloon.x, bloon.y, bloon.diameter / 2)) return;
      
      //give pops to monkey and update upgrade element
      monkeys.forEach((monkey) => {
        if (this.monkeyId === monkey.id){
          monkey.pops += 1;
          if (document.getElementById('monkey-menu')){
            if (document.getElementById('monkey-id').value === this.monkeyId){
              UpdateUpgradeElement(monkey);
            }
          }
        }
      }) 
      //runs the bloon popped method and deletes the bloon       
      if (bloon.defense <= 0) {
        bloon.popped(this.damage)
        balloons.splice(ballonIndex, 1);
      }      
      //removes one pierce 
      this.pierce -= 1;
      //deletes when pierce is 0 or less than 0
      if (this.pierce <= 0){
        projectiles.forEach((projectile, index) => {
          if (projectile.ownId === this.ownId){
            projectiles.splice(index, 1)
          }
        })
      }
      //adds the bloon the the hit balloons array
      this.bloonsHit.push(bloon.id)
    });
  }

  //moves the projectile according to the heading
  move() {
    const vector = p5.Vector.fromAngle(this.heading, this.speed);
    this.x -= vector.x;
    this.y -= vector.y;
  }

  //shows the projectile and rotates it so i faces the correct heading
  display() {
    if (!this.ball){
    push()
    fill(0);
    rectMode(CENTER);
    angleMode(RADIANS)
    translate(this.x, this.y)
    rotate(this.heading)
    rect(0, 0, this.diameter, this.diameter/2, 10, 1, 1, 10);
    pop()
  }
  else {
    fill(0);
    circle(this.x, this.y, this.diameter)
  }


  }
}


class Boomerang extends Dart {
  constructor(x, y, vectorAngle, monkeyId, {damage, pierce, speed, lifespan, kylie, ricochet }, range = 161){
    super(x, y, vectorAngle, monkeyId, {damage, pierce, speed, lifespan: 10})
    //variables for the projectile
    this.damage = 1 + damage; //damage it does to bloon
    this.pierce = 4 + pierce; //how many bloons it can hit before it disappears
    this.speed = 10 * speed;
    //radius of the circle the projectile moves in
    this.attackRadius = range/4
    //starting vector
    this.vector = p5.Vector.fromAngle(vectorAngle, this.attackRadius);
    //center for the circle
    this.centerX = x - this.vector.x;
    this.centerY = y - this.vector.y;
    //current position on the circle in angles 
    this.currentAngle = vectorAngle;
    //coordinates for where the balloon started
    this.originX = x;
    this.originY = y
    //if it can be deleted
    this.canBeDeleted = false
    //the angle of the rotation of the projectile
    this.rotationAngle = vectorAngle;
    //which movement the projectile should follow
    this.kylie = kylie;
    this.ricochet = ricochet;
    //variable for kylie movement
    this.direction = 'forward';
    this.range = range
    //can be deleted after 100 ms
    setTimeout(() => {
      this.canBeDeleted = true;
    }, 100)
  }

  //change heading the projectile
  changeHeading(bloon) {
    const projectileVector = createVector(this.x, this.y);
    const bloonVector = createVector(bloon.x, bloon.y);
    this.heading = p5.Vector.sub(projectileVector, bloonVector).heading();
  }

  //find the target
  findTarget(){
    let closestBloonDist;
    if (balloons.length === 0) return;
    balloons.forEach((bloon) => {
      if (this.bloonsHit.includes(bloon.id)) return;
      const distance = dist(this.x, this.y, bloon.x, bloon.y)
      if (distance > 225) return
      if (closestBloonDist === undefined){
        closestBloonDist = distance
        this.changeHeading(bloon)
      } else if (distance < closestBloonDist){
        this.changeHeading(bloon)
      }
    })
  }

  //almost works the as the dart
  collision() {
    balloons.forEach((bloon, ballonIndex) => {
      if (this.bloonsHit.includes(bloon.id)) return;
      if (!DoCirclesCollide(this.x, this.y, this.diameter / 2, bloon.x, bloon.y, bloon.diameter / 2)) return;
      
      bloon.popped(this.damage)
      balloons.splice(ballonIndex, 1)
      this.pierce -= 1;
      if (this.pierce <= 0){
        projectiles.forEach((projectile, index) => {
          if (projectile.ownId === this.ownId){
            projectiles.splice(index, 1)
          }
        })
      }
      this.bloonsHit.push(bloon.id)
      //can hit after 3 seconds if kylie movement is true
      if (this.kylie){
        setTimeout(() => {
          const index = this.bloonsHit.indexOf(bloon.id)
          this.bloonsHit.splice(index, 1)
        }, 300)
      }

      monkeys.forEach((monkey) => {
        if (this.monkeyId === monkey.id){
          monkey.pops += 1;
          if (document.getElementById('monkey-menu')){
            if (document.getElementById('monkey-id').value === this.monkeyId){
              UpdateUpgradeElement(monkey);
            }
          }
        }
      })   
    });
  }
  //movement for the projectile
  move() {
    //if there is no special movement then it moves in a circle
    if (!this.kylie && !this.ricochet){
    this.currentAngle -= 0.2
    this.x = this.centerX + cos(this.currentAngle)*this.attackRadius;
    this.y = this.centerY + sin(this.currentAngle)*this.attackRadius;
    } //if kylie then it moves in a straight line and the comes back
    else if (this.kylie){
      const kylieVector = p5.Vector.fromAngle(this.heading, this.speed);
      //when it moves forward
      if (this.direction === 'forward'){
        this.x -= kylieVector.x;
        this.y -= kylieVector.y;
      }
      //when it moves back
      else if (this.direction === 'backward'){
        this.x += kylieVector.x
        this.y += kylieVector.y
      }
      //if projectile is on the perimeter of the monkeys range it waits 300 ms and then turns back
      if (dist(this.x, this.y, this.originX, this.originY) > this.range){
        this.direction = 'wait'
        setTimeout(() => {
          this.direction = 'backward'
        }, 300)
      } 
    } else {
      //tracks balloons and the moves according to heading 
      this.findTarget()
      const vector = p5.Vector.fromAngle(this.heading, this.speed);
      this.x -= vector.x;
      this.y -= vector.y;
    }
   
    //if it can be deleted then delete it if it comes to close to the monkeys
    if (this.canBeDeleted){
      if (abs(this.originX - this.x) < 10 && abs(this.originY - this.y) < 10){
        projectiles.forEach((projectile, index) => {
          if (projectile.ownId === this.ownId){
            projectiles.splice(index, 1)
          }
        })
      }
    }
  }

  
  //show the projectile
  display() {
    //rotates the boomerang
    push()
    fill(0);
    angleMode(RADIANS)
    translate(this.x, this.y)
    rotate(this.rotationAngle)
    strokeWeight(1)
    quad(0-this.diameter/2, 0, 0, 0-this.diameter/2, 0 + this.diameter/2, 0, 0, 0-this.diameter/4)
    this.rotationAngle -= 3.14/4
    pop()
  }
}

class Bomb {
  constructor(x, y, vectorAngle, monkeyId, {damage, pierce, speed, lifespan, blastRadius, knockback, fragment, cluster}){
    //variables for the projectile. It doesn't inherit because it has a different function when lifespan is over
    this.x = x;
    this.y = y;
    this.heading = vectorAngle;
    this.lifespan = 1800 * lifespan;
    this.damage = 1 + damage;
    this.pierce = 14 + pierce;
    this.speed = 13 * speed;
    this.blastRadius = blastRadius;
    this.fragment = fragment;
    this.knockback = knockback;
    this.cluster = cluster;
    this.diameter = 15;
    this.monkeyId = monkeyId;
    this.ownId = crypto.randomUUID();
    this.bloonsHit = [];
    //explodes when lifespan is over
    setTimeout(() => {
      projectiles.forEach((projectile, index) => {
        if (projectile.ownId === this.ownId){
          projectile.explosion(projectile)
          
        }
      })
    }, this.lifespan)
  }

  explosion(object){
    //show blast radius
    push()
    fill('#ed8b4e')
    circle(object.x, object.y, object.blastRadius * 2)
    pop()
    
    console.log('explode')
    //finds bloons it can hit
    let pops = 0;
    let ballonsInRange = [];
    balloons.forEach((blastBloon, blastIndex) => {
      const distance = dist(object.x, object.y, blastBloon.x, blastBloon.y)
      if (distance <= object.blastRadius) {
        ballonsInRange.push({ballon: balloons[blastIndex], distance: distance});
      }
    });
    //sorts the balloons according to distance
    if (ballonsInRange.length > 0) {
      ballonsInRange.sort((a, b) => {
        return (a.distance - b.distance);
      })
      //pops as many balloons as it has pierce
      try {
      ballonsInRange.forEach((object) => {
        if (object.pierce <= 0) {
          //if there is no more pierce it breaks out of loop
          throw new Error('Break Loop')
        }
        if (object.knockback){
          object.ballon.currentStep -= 100 * unitConverter;
          if (object.ballon.currentStep < 0){
            object.ballon.currentStep = 0;
          }
        }
        object.ballon.popped(object.damage)
        const indexToSplice =  balloons.findIndex((element) => {
          return (element.id === object.ballon.id)
        })
        balloons.splice(indexToSplice, 1);
        pops++;
        object.pierce -= 1;
      })}
      catch (error) {}
    }
    //finds monkey and updates pop and upgrade element
    monkeys.forEach((monkey) => {
      if (object.monkeyId === monkey.id){
        monkey.pops += pops;
        if (document.getElementById('monkey-menu')){
          if (document.getElementById('monkey-id').value === object.monkeyId){
            UpdateUpgradeElement(monkey);
          }
        }
      }
    })
    
    //splice the projectile
    projectiles.forEach((projectile, index) => {
      if (projectile.ownId === object.ownId){
        projectiles.splice(index, 1)
      }
    })
  }

  collision() {
    balloons.forEach((bloon, ballonIndex) => {
      if (this.bloonsHit.includes(bloon.id)) return;
      if (!DoCirclesCollide(this.x, this.y, this.diameter / 2, bloon.x, bloon.y, bloon.diameter / 2)) return;
    
      this.explosion(this)

      // if fragments upgrade is purchased it spawns fragments add shoots the out from the center of the bomb
      if (this.fragment.isActivated){
        //finds start heading
        let fragAngle = this.heading
        //finds the increase in angle after each fragment
        const angleIncrease = 6.28/this.fragment.count;
        //creates and pushes new fragments
        for (let i = 0; i < this.fragment.count; i++){
          projectiles.push(new Fragment(this.x, this.y, fragAngle, this.monkeyId, this.fragment))
          //changes angle
          fragAngle += angleIncrease * i;
        }
        //if cluster is purchases is spawns bombs instead of fragments
      } else if (this.cluster){
        let fragAngle = this.heading
        const angleIncrease = 6.28/8;
        for (let i = 0; i < 8; i++){
          projectiles.push(new Bomb(this.x, this.y, fragAngle, this.monkeyId, {damage: 0, pierce: -6, speed: 1, lifespan: 0.05, blastRadius: 15 * unitConverter, knockback: false, fragment: {isActivated: false}, cluster: false}))
          fragAngle += angleIncrease * i;
        }
      }
      this.bloonsHit.push(bloon.id)       
    });
  }

  move() {
    const vector = p5.Vector.fromAngle(this.heading, this.speed);
    this.x -= vector.x;
    this.y -= vector.y;
  }

  display(){
    fill(0);
    circle(this.x, this.y, this.diameter)
  }
}

class Fragment extends Dart {
  constructor(x, y, vectorAngle, monkeyId, { damage , pierce, lifespan, size }){
    super(x, y, vectorAngle, monkeyId, {damage, pierce, speed: 1, lifespan})
    this.damage = 1 + damage; //damage it does to bloon
    this.pierce = 1 + pierce; //how many bloons it can hit before it disappears
    this.speed = 13;
    this.diameter = size * unitConverter
  }

  display() {
    fill(0);
    circle(this.x, this.y, this.diameter)
  }
}