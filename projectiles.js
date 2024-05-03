class Dart {
  constructor(x, y, vectorAngle, monkeyId, {damage, pierce, speed, lifespan, ball = false}) {
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
    this.monkeyId = monkeyId;
    this.ownId = crypto.randomUUID();
    this.bloonsHit = [];
    setTimeout(() => {
      projectiles.forEach((projectile, index) => {
        if (projectile.ownId === this.ownId){
          projectiles.splice(index, 1);
        }
      })
    }, this.lifespan)
  }

  collision() {
    balloons.forEach((bloon, ballonIndex) => {
      if (this.bloonsHit.includes(bloon.id)) return;
      if (!DoCirclesCollide(this.x, this.y, this.diameter / 2, bloon.x, bloon.y, bloon.diameter / 2)) return;
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
      if (bloon.defense <= 0) {
        bloon.popped(this.damage)
        balloons.splice(ballonIndex, 1);
      }      
      this.pierce -= 1;
      if (this.pierce <= 0){
        projectiles.forEach((projectile, index) => {
          if (projectile.ownId === this.ownId){
            projectiles.splice(index, 1)
          }
        })
      }
      this.bloonsHit.push(bloon.id)
    });
  }

  move() {
    const vector = p5.Vector.fromAngle(this.heading, this.speed);
    this.x -= vector.x;
    this.y -= vector.y;
  }

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
    this.damage = 1 + damage; //damage it does to bloon
    this.pierce = 4 + pierce; //how many bloons it can hit before it disappears
    this.speed = 10 * speed;
    this.attackRadius = range/4
    this.vector = p5.Vector.fromAngle(vectorAngle, this.attackRadius);
    this.centerX = x - this.vector.x;
    this.centerY = y - this.vector.y;
    this.currentAngle = vectorAngle;
    this.originX = x;
    this.originY = y
    this.canBeDeleted = false
    this.rotationAngle = vectorAngle;
    this.kylie = kylie;
    this.ricochet = ricochet;
    this.direction = 'forward';
    this.range = range
    setTimeout(() => {
      this.canBeDeleted = true;
    }, 100)
  }

  changeHeading(bloon) {
    const projectileVector = createVector(this.x, this.y);
    const bloonVector = createVector(bloon.x, bloon.y);
    this.heading = p5.Vector.sub(projectileVector, bloonVector).heading();
  }

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
      //can hit after 3 seconds
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

  move() {
    if (!this.kylie && !this.ricochet){
    this.currentAngle -= 0.2
    this.x = this.centerX + cos(this.currentAngle)*this.attackRadius;
    this.y = this.centerY + sin(this.currentAngle)*this.attackRadius;
    } else if (this.kylie){
      const kylieVector = p5.Vector.fromAngle(this.heading, this.speed);
      if (this.direction === 'forward'){
        this.x -= kylieVector.x;
        this.y -= kylieVector.y;
      }
      else if (this.direction === 'backward'){
        this.x += kylieVector.x
        this.y += kylieVector.y
        console.log('back')
      }
      if (dist(this.x, this.y, this.originX, this.originY) > this.range){
        this.direction = 'wait'
        setTimeout(() => {
          this.direction = 'backward'
        }, 300)
      } 
    } else {
      this.findTarget()
      const vector = p5.Vector.fromAngle(this.heading, this.speed);
      this.x -= vector.x;
      this.y -= vector.y;
    }
   
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

  

  display() {
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
    if (ballonsInRange.length > 0) {
      ballonsInRange.sort((a, b) => {
        return (a.distance - b.distance);
      })
      try {
      ballonsInRange.forEach((object) => {
        if (object.pierce <= 0) {
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

      if (this.fragment.isActivated){
        console.log('frags')
        let fragAngle = this.heading
        const angleIncrease = 6.28/this.fragment.count;
        for (let i = 0; i < this.fragment.count; i++){
          projectiles.push(new Fragment(this.x, this.y, fragAngle, this.monkeyId, this.fragment))
          fragAngle += angleIncrease * i;
        }
      } else if (this.cluster){
        console.log('cluster')
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