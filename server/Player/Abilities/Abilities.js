let Particle = require('../../Particle.js').Particle;

class Abilities{
    constructor(){
    }

    bite(target) {
        let biteDamage = 5;

        target.pbody.mass -= 5;
        
        // Produce particles
        for(var i=0; i<biteDamage; i++){
            let p = new Particle(Date.now());
            p.timeUntilEdible = target.pbody.size * 0.5;
            p.color = target.color;
            p.pbody.loc = target.pbody.loc.clone();
            p.mass = Math.random() + 0.1;
            p.density = 10;
            p.pbody.applyForce(target.pbody.vel.clone());

            // this world should be the players' world, not root!
            global.rootWorld.particles[p.id] = p;
        }
    }

    dash() {
        if(this.isDashing) return;
        this.isDashing = true;

        let speed = this.dashSpeed || 30;
        let duration = this.dashDuration || 500;
        let cooldown = this.dashCooldown || 10;

        this.maxSpeed += speed;
        let force = this.pbody.forward;
        force.x *= speed;
        force.y *= speed;
        this.pbody.applyForce(force);
        this.pbody.mass -= this.pbody.mass * 0.2;
        let particles = global.rootWorld.findWorldByPlayerId(this.id).particles;
        let dp = new Particle(Date.now());
        force.x *= -1;
        force.y *= -1;
        dp.color = this.color;
        dp.pbody.mass = this.pbody.mass * 0.2;
        dp.timeUntilEdible = this.pbody.size * 0.5;
        dp.pbody.loc = this.pbody.loc.clone();
        dp.pbody.applyForce(force);
        particles[dp.id] = dp;

        setTimeout(() => {
            this.maxSpeed -= speed;
            setTimeout(() => {
                this.isDashing = false;
            }, cooldown);
        }, duration);
    }
}

module.exports.Abilities = Abilities;