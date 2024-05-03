class DartMonkey {
  constructor(x, y, color = '#7d461d', id = 0) {
    //variables for monkey
    this.x = x;
    this.y = y;
    this.id = id;
    this.diameter = 6 * unitConverter;
    this.color = color;
    this.range = 32 * unitConverter;
    this.heading = createVector(0, -1).heading();
    this.name = 'Dart Monkey';
    this.pops = 0;
    this.showRange = false;
    this.cost = round(costModifier * 200);

    //variables for eyes
    this.eyeSize = 6;
    this.eyeAngleDiff = 0.8 + 3.14;
    this.eyeDistFromCenter = this.diameter / 4;
    
    //variables for attacks
    this.projectile = Dart;
    this.attackSpeed = 0.95; //per second
    this.hasTarget;
    this.canAttack = true;
    this.camoDetection = false;
    this.projectileModifier = { damage: 0, pierce: 0, speed: 1, lifespan: 1, ball: false};
    this.upgradeInfo = {
      top: {
        currentUpgrade: 0,
        upgradePath: [
          {
            name: 'Sharp Shots',
            cost: round(costModifier * 140),
            effect: (monkey) => {
              monkey.projectileModifier.pierce += 1;
            },
          },
          {
            name: 'Razor Sharp Shots',
            cost: round(costModifier * 220),
            effect: (monkey) => {
              monkey.projectileModifier.pierce += 2;
            },
          },
          {
            name: 'Spike-O-Pult',
            cost: round(costModifier * 300),
            effect: (monkey) => {
              monkey.projectileModifier.ball = true;
            },
          },
        ],
        status: 'open',
      },
      middle: {
        currentUpgrade: 0,
        upgradePath: [
          {
            name: 'Quick Shots',
            cost: round(costModifier * 100),
            effect: (monkey) => {
              monkey.attackSpeed *= 0.85;
            },
          },
          {
            name: 'Very Quick Shots',
            cost: round(costModifier * 190),
            effect: (monkey) => {
              monkey.attackSpeed *= 0.67;
            },
          },
          {
            name: 'Triple Shot',
            cost: round(costModifier * 400),
            effect: (monkey) => {
              monkey.tripleShot = true;
            },
          },
        ],
        status: 'open',
      },
      bottom: {
        currentUpgrade: 0,
        upgradePath: [
          {
            name: 'Long Range Darts',
            cost: round(costModifier * 90),
            effect: (monkey) => {
              monkey.range += 8 * unitConverter;
              monkey.projectileModifier.lifespan *= 1.15;
            },
          },
          {
            name: 'Enhanced Eyesight',
            cost: round(costModifier * 200),
            effect: (monkey) => {
              monkey.range += 8 * unitConverter;
              monkey.projectileModifier.speed *= 1.1;
              monkey.camoDetection = true;
              monkey.projectileModifier.lifespan *= 1.1;
            },
          },
          {
            name: 'Crossbow',
            cost: round(costModifier * 625),
            effect: (monkey) => {
              monkey.range += 8 * unitConverter;
              monkey.projectileModifier.pierce += 1;
              monkey.projectileModifier.damage += 3;
              monkey.projectileModifier.speed *= 1.1;
            },
          },
        ],
        status: 'open',
      },
    };
    this.targetMode = 'first';
    this.sellPrice = this.cost / 2;
    this.tripleShot = false;
  }

  //change which ballon it faces
  changeHeading(bloon) {
    const monkeyVector = createVector(this.x, this.y);
    const bloonVector = createVector(bloon.x, bloon.y);
    this.heading = p5.Vector.sub(monkeyVector, bloonVector).heading();
    this.hasTarget = true;
  }

  //find which ballon is should target
  findTarget() {
    //checks if there is any balloons
    if (balloons.length === 0) {
      this.hasTarget = false;
      return;
    }
    //finds balloons which are in range
    let ballonsInRange = [];
    balloons.forEach((bloon, index) => {
      if (dist(this.x, this.y, bloon.x, bloon.y) < this.range / 2) {
        ballonsInRange.push(balloons[index]);
      }
    });
    //checks if there are any ballons in range
    if (ballonsInRange.length === 0) {
      this.hasTarget = false;
      return;
    }
    //prioritizes the balloons depending on target mode
    switch (this.targetMode) {
      case 'first':
        let highestStep1;
        ballonsInRange.forEach((bloon) => {
          if (highestStep1 === undefined) {
            highestStep1 = bloon.currentStep;
            this.changeHeading(bloon);
          } else if (highestStep1 < bloon.currentStep) {
            highestStep1 = bloon.currentStep;
            this.changeHeading(bloon);
          }
        });
        break;
      case 'last':
        let lowestStep;
        ballonsInRange.forEach((bloon) => {
          if (lowestStep === undefined) {
            lowestStep = bloon.currentStep;
            this.changeHeading(bloon);
          } else if (lowestStep > bloon.currentStep) {
            lowestStep = bloon.currentStep;
            this.changeHeading(bloon);
          }
        });
        break;
      case 'close':
        let closestDistance;
        ballonsInRange.forEach((bloon) => {
          const bloonDistance = dist(this.x, this.y, bloon.x, bloon.y);
          if (closestDistance === undefined) {
            closestDistance = bloonDistance;
            this.changeHeading(bloon);
          } else if (closestDistance > bloonDistance) {
            closestDistance = bloonDistance;
            this.changeHeading(bloon);
          }
        });
        break;
      case 'strong':
        let highestLayer;
        let highestStep;
        ballonsInRange.forEach((bloon) => {
          if (highestLayer === undefined && highestStep === undefined) {
            highestLayer = bloon.layer;
            highestStep = bloon.currentStep;
            this.changeHeading(bloon);
          } else if (highestLayer < bloon.layer) {
            highestLayer = bloon.layer;
            this.changeHeading(bloon);
          }
          if (highestLayer === bloon.layer && highestStep < bloon.currentStep) {
            highestLayer = bloon.layer;
            this.changeHeading(bloon);
          }
        });
        break;
    }
  }

  //attacks
  attack() {
    if (this.canAttack) {
      //create a ned projectile
      projectiles.push(new this.projectile(this.x, this.y, this.heading, this.id, this.projectileModifier));
      if (this.tripleShot) {
        const secondHeading = this.heading + 0.26;
        const thirdHeading = this.heading - 0.26;
        projectiles.push(new this.projectile(this.x, this.y, secondHeading, this.id, this.projectileModifier));
        projectiles.push(new this.projectile(this.x, this.y, thirdHeading, this.id, this.projectileModifier));
      }
      //starts the timer for when it can attack again
      setTimeout(() => {
        this.canAttack = true;
      }, this.attackSpeed * 1000);
    }
    //make it so it can't attack right away
    this.canAttack = false;
  }

  //show the monkey
  display() {
    //main body
    fill(this.color);
    circle(this.x, this.y, this.diameter);

    //eyes
    fill('black');
    const rightEye = p5.Vector.fromAngle(this.heading - this.eyeAngleDiff, this.eyeDistFromCenter);
    const leftEye = p5.Vector.fromAngle(this.heading + this.eyeAngleDiff, this.eyeDistFromCenter);
    circle(this.x + rightEye.x, this.y + rightEye.y, this.eyeSize);
    circle(this.x + leftEye.x, this.y + leftEye.y, this.eyeSize);

    //upgradeInfo
    fill(255);
    text(
      `${this.upgradeInfo.top.currentUpgrade}-${this.upgradeInfo.middle.currentUpgrade}-${this.upgradeInfo.bottom.currentUpgrade}`,
      this.x - this.diameter / 2,
      this.y
    );
    fill('black');
    //showRange
    if (this.showRange) {
      fill(0, 0, 0, 20);
      circle(this.x, this.y, this.range);
    }
  }
}

class BoomerangMonkey extends DartMonkey {
  constructor(x, y, color = '#DE9331', id = 0) {
    super(x, y, color, id);
    //change variables specific for this monkey
    this.name = 'Boomerang Monkey';
    this.cost = round(costModifier * 325);
    this.sellPrice  = this.cost / 2;
    this.attackSpeed = 1.2;
    this.range = 43 * unitConverter;
    this.diameter = 7 * unitConverter;
    this.projectile = Boomerang;
    this.projectileModifier = { damage: 0, pierce: 0, speed: 1, lifespan: 1, kylie: false, ricochet: false };
    this.upgradeInfo = {
      top: {
        currentUpgrade: 0,
        upgradePath: [
          {
            name: 'Improved Rangs',
            cost: round(costModifier * 200),
            effect: (monkey) => {
              monkey.projectileModifier.pierce += 4;
            },
          },
          {
            name: 'Glaives',
            cost: round(costModifier * 280),
            effect: (monkey) => {
              monkey.projectileModifier.pierce += 5;
            },
          },
          {
            name: 'Glaive Ricochet',
            cost: round(costModifier * 600),
            effect: (monkey) => {
              monkey.projectileModifier.ricochet = true;
              monkey.projectileModifier.pierce = 30;
            },
          },
        ],
        status: 'open',
      },
      middle: {
        currentUpgrade: 0,
        upgradePath: [
          {
            name: 'Faster Throwing',
            cost: round(costModifier * 175),
            effect: (monkey) => {
              monkey.attackSpeed *= 0.75;
            },
          },
          {
            name: 'Faster Rangs',
            cost: round(costModifier * 250),
            effect: (monkey) => {
              monkey.attackSpeed *= 0.56;
            },
          },
          {
            name: 'Bionic Boomerang',
            cost: round(costModifier * 1450),
            effect: (monkey) => {
              monkey.attackSpeed *= 0.1983;
            },
          },
        ],
        status: 'open',
      },
      bottom: {
        currentUpgrade: 0,
        upgradePath: [
          {
            name: 'Long Range Rangs',
            cost: round(costModifier * 100),
            effect: (monkey) => {
              monkey.range += 14.19 * unitConverter;
            },
          },
          {
            name: 'Red Hot Rangs',
            cost: round(costModifier * 300),
            effect: (monkey) => {
              monkey.projectileType = 'hot';
            },
          },
          {
            name: 'Kylie Boomerang',
            cost: round(costModifier * 1300),
            effect: (monkey) => {
              monkey.projectileModifier.kylie = true;
              monkey.projectileModifier.pierce = 18;
            },
          },
        ],
        status: 'open',
      },
    };
  }

  attack() {
    //does the same as the last one but adds range
    if (this.canAttack) {
      projectiles.push(new this.projectile(this.x, this.y, this.heading, this.id, this.projectileModifier, this.range));
      setTimeout(() => {
        this.canAttack = true;
      }, this.attackSpeed * 1000);
    }
    this.canAttack = false;
  }
}

class BombShooter extends DartMonkey {
  constructor(x, y, color = '#453f3f', id = 0) {
    super(x, y, color, id);
    //change variables specific for this monkey
    this.cost = round(costModifier * 525);
    this.sellPrice  = this.cost / 2;
    this.attackSpeed = 1.5;
    this.range = 40 * unitConverter;
    this.diameter = 7 * unitConverter;
    this.projectile = Bomb;
    this.projectileModifier = { damage: 0, pierce: 0, speed: 1, lifespan: 1, blastRadius: 12 * unitConverter, knockback: false, fragment: {isActivated: false, damage: 0, pierce: 0, count: 8, lifespan: 0.1, size: 1}, cluster: false };
    this.upgradeInfo = {
      top: {
        currentUpgrade: 0,
        upgradePath: [
          {
            name: 'Bigger Bombs',
            cost: round(costModifier * 350),
            effect: (monkey) => {
              monkey.projectileModifier.blastRadius = 18 * unitConverter;
              monkey.projectileModifier.pierce += 6;
            },
          },
          {
            name: 'Heavy Bombs',
            cost: round(costModifier * 650),
            effect: (monkey) => {
              monkey.projectileModifier.pierce += 10;
              monkey.projectileModifier.damage += 1;
            },
          },
          {
            name: 'Really Big Bombs',
            cost: round(costModifier * 1100),
            effect: (monkey) => {
              monkey.projectileModifier.blastRadius = 27 * unitConverter;
              monkey.projectileModifier.damage += 1;
              monkey.projectileModifier.pierce += 30;
              monkey.projectileModifier.fragment.damage = 3;
              monkey.projectileModifier.fragment.count = 12;
              monkey.projectileModifier.fragment.pierce = 2;
              monkey.projectileModifier.fragment.lifespan *= 1.3;
              monkey.projectileModifier.fragment.size = 3;
              monkey.projectileModifier.knockback = true;
            },
          },
        ],
        status: 'open',
      },
      middle: {
        currentUpgrade: 0,
        upgradePath: [
          {
            name: 'Faster Reload',
            cost: round(costModifier * 250),
            effect: (monkey) => {
              monkey.attackSpeed *= 0.75;
            },
          },
          {
            name: 'Missile Launcher',
            cost: round(costModifier * 400),
            effect: (monkey) => {
              monkey.attackSpeed *= 0.73;
              monkey.range += 15;
              monkey.projectileModifier.speed *= 1.5;
            },
          },
          {
            name: 'MOAB Mauler',
            cost: round(costModifier * 1100),
            effect: (monkey) => {
              monkey.range += 18.75;
              monkey.projectileModifier.damage += 16;
            },
          },
        ],
        status: 'open',
      },
      bottom: {
        currentUpgrade: 0,
        upgradePath: [
          {
            name: 'Extra Range',
            cost: round(costModifier * 200),
            effect: (monkey) => {
              monkey.range += 7 * unitConverter;
            },
          },
          {
            name: 'Frag Bombs',
            cost: round(costModifier * 300),
            effect: (monkey) => {
              monkey.range += 2 * unitConverter;
              monkey.projectileModifier.fragment.isActivated = true;
            },
          },
          {
            name: 'Cluster Bombs',
            cost: round(costModifier * 800),
            effect: (monkey) => {
              monkey.projectileModifier.cluster = true;
              monkey.projectileModifier.fragment.isActivated = false;
            },
          },
        ],
        status: 'open',
      },
    };
  }
}

//classes so it doesn't throw an error when nonfunctional monkeys are pressed
class TackShooter extends DartMonkey {
  constructor(x, y, color = '#f707f3', id = 0) {
    super(x, y, color, id);
    this.cost = costModifier * 240;
    this.attackSpeed = 1.4;
    this.range = 23 * unitConverter;
    this.diameter = 6 * unitConverter;
  }
}

class IceMonkey extends DartMonkey {
  constructor(x, y, color = '#7fecfa', id = 0) {
    super(x, y, color, id);
  }
}

class GlueGunner extends DartMonkey {
  constructor(x, y, color = '#85f279', id = 0) {
    super(x, y, color, id);
  }
}
