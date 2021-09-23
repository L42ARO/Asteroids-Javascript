let cavas;
let ctx;
let canvasWidth=1400;
let canvasHeight=1000;
let ship;
let keys=[];
let bullets = [];
let asteroids=[];
let score=0;
let lives=3;
let inmuneTime= new Date().getTime();
let fadeInterval=2500; //2 seconds
let rep=1;

document.addEventListener('DOMContentLoaded', SetupCanvas);//this funciton is executed once the page loads

function SetupCanvas(){//function executed once page loads
    lives=3;
    canvas=document.getElementById('my-canvas');
    ctx=canvas.getContext('2d');
    canvas.width=canvasWidth;
    canvas.height=canvasHeight;
    ctx.fillStyle='black';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ship=new Ship();

    for(let i = 0; i < 8; i++){
        asteroids.push(new Asteroid());
    }
    document.body.addEventListener("keydown", function(e){
        keys[e.keyCode]=true;
    });
    document.body.addEventListener("keyup", function(e){
        keys[e.keyCode]=false;
        if(e.keyCode===32 && lives>0){ //SPACE BAR: 32, x: 88
            bullets.push(new Bullet(ship.angle));
        }
    });
    Render();
}


class Ship{
    constructor(){
        this.visible=true;
        this.x = canvasWidth/2;
        this.y= canvasHeight/2;
        this.movingForward=false;
        this.speed=0.1;
        this.velX=0;
        this.velY=0;
        this.rotationSpeed = 3;
        this.radius=15;
        this.angle=0;
        this.strokeColor='white';        
        this.boostStrokeColor='yellow';
        this.sideBoostStrokeColor='Red';
        this.noseX=canvasWidth/2 +15;
        this.noseY=canvasHeight/2;
    }
    Rotate(dir){
        this.angle+=this.rotationSpeed*dir;
    }
    Update(){
        let radians=this.angle*Math.PI/180;//its pi/180 to convert to radians and to avoid issues the rotation speed is also 2
        // oldX+cos(radians)*distance
        //oldY+sin(radians)*distance
        if(this.movingForward){
            this.velX+=Math.cos(radians)*this.speed;
            this.velY+=Math.sin(radians)*this.speed;
        }
        if(this.x<this.radius){//it's radius instead of 0 so the ship doesn't have to go all the way to the center to appear on the other side
            this.x=canvas.width;
        }
        if(this.x>canvas.width){
            this.x=this.radius;
        }
        if(this.y<this.radius){
            this.y=canvas.height;
        }
        if(this.y>canvas.height){
            this.y=this.radius;
        }
        this.velX*=0.99;
        this.velY*=0.99;

        this.x-= this.velX;
        this.y-=this.velY;
    }
    Draw(){
        ctx.strokeStyle =this.strokeColor;
        ctx.lineWidth=1;
        ctx.beginPath();
        let vertAngle=((Math.PI*2)/3);//finds circumfernce in radians and divedes by 3
        var radians=this.angle*Math.PI/180;
        this.noseX=this.x-this.radius*Math.cos(radians);
        this.noseY=this.y-this.radius*Math.sin(radians);
        for(let i=0; i<3; i++){
            let r=this.radius+(i==0?3:0);
            ctx.lineTo(this.x-r * Math.cos(vertAngle * i + radians), this.y-r * Math.sin(vertAngle * i + radians));
        }
        ctx.closePath();
        ctx.stroke();
    }
    DrawBoost(){
        var radians=this.angle*Math.PI/180;
        let BoostRadius=10;
        ctx.lineWidth=1.2;
        let Bx=this.x + (this.radius-0.5) * Math.cos(radians);
        let By=this.y + (this.radius-0.5) * Math.sin(radians);
        let vertAngle=((Math.PI*2)/3);
        ctx.strokeStyle=this.boostStrokeColor;
        ctx.beginPath();
        for(let i=0; i<3; i++){
            let r=(i!=0)?BoostRadius:((5+BoostRadius/2)*Math.random()+(BoostRadius/2));
            ctx.lineTo(Bx+r* Math.cos(vertAngle * i + radians), By + r * Math.sin(vertAngle * i + radians));
        }
        ctx.closePath();
        ctx.stroke();
    }
    DrawSideBoost(dir){
        let desiredAngle=((dir>0)?90:270)*Math.PI/180;
        ctx.strokeStyle=this.sideBoostStrokeColor;
        ctx.lineWidth=1;
        ctx.beginPath();
        let vertAngle=((Math.PI*2)/3);//finds circumfernce in radians and divedes by 3
        var radians=this.angle*Math.PI/180;
        let rBx=this.x-this.radius*0.9 * Math.cos(desiredAngle + radians);
        let rBy=this.y-this.radius*0.9 * Math.sin(desiredAngle + radians);
        for(let i=0; i<3; i++){
            let nRadius=this.radius*0.2+((i==0 && dir==1)||(i==2 && dir==-1)?Math.random()*13:0);
            ctx.lineTo(rBx-nRadius*Math.cos(vertAngle * i + radians + vertAngle*0.5), rBy-nRadius*Math.sin(vertAngle * i + radians + vertAngle*0.5));
        }
        ctx.closePath();
        ctx.stroke();
    }
}
class Bullet{
    constructor(angle){
        this.visible= true;
        this.x=ship.noseX;
        this.y=ship.noseY;
        this.angle=angle;
        this.height=4;
        this.width=4;
        this.speed=10;
        this.velX=0;
        this.velY=0;
    }
    Update(){
        var radians= this.angle*Math.PI/180
        this.x-=Math.cos(radians)*this.speed;
        this.y-=Math.sin(radians)*this.speed;
    }
    Draw(){
        ctx.fillStyle='white';
        ctx.fillRect(this.x,this.y,this.width, this.height);
    }
}

class Asteroid{
    constructor(x, y, radius, level, collisionRadius){
        this.visible=true;
        this.x=x || Math.floor(Math.random()*canvasWidth);
        this.y=y || Math.floor(Math.random()*canvasHeight);
        this.speed=3;
        this.radius=radius || 50;
        this.angle=Math.floor(Math.random()*359);
        this.strokeColor='white';
        this.collisionRadius = collisionRadius || 46;
        this.level = level || 1;
        this.randR=[];
        this.randA=[];
        for(let i=0; i<6; i++){
            this.randR.push((0.75+Math.random()*0.25));
            this.randA.push((10-Math.random()*20)*Math.PI/180);
        }
    }
    Update(){
        var radians = this.angle * Math. PI /180;
        this.x +=Math.cos(radians)*this.speed;
        this.y+= Math.sin(radians)*this.speed;

        if(this.x<0){
            this.x=canvas.width;
        }
        if(this.x>canvas.width){
            this.x=0;
        }
        if(this.y<0){
            this.y=canvas.height;
        }
        if(this.y>canvas.height){
            this.y=0;
        }
    }
    Draw(){
        ctx.strokeStyle =this.strokeColor;
        ctx.lineWidth=1;
        ctx.beginPath();
        let vertAngle = ((Math.PI *2)/6);
        var radians = this.angle*Math.PI/180;
        for(let i=0; i<6; i++){
            let r=this.radius*this.randR[i];
            let a=vertAngle+this.randA[i];
            ctx.lineTo(this.x-r * Math.cos(a * i + radians), this.y-r * Math.sin(a* i + radians));
        }
        ctx.closePath();
        ctx.stroke();
    }
}

function CircleCollision(p1x, p1y, r1, p2x, p2y, r2){
    let radiusSum;
    let xDiff;
    let yDiff;
    radiusSum = r1 + r2;
    xDiff = p1x - p2x;
    yDiff=p1y-p2y;
    if (radiusSum>Math.sqrt((xDiff*xDiff)+(yDiff * yDiff))){
        return true;
    }else{
        return false;
    }
}

function DrawLifeShips(){
    let startX=1350;
    let startY=10;
    let points= [[12,25],[-12,25]];
    ctx.strokeStyle='white';
    for(let i =0; i <lives; i++){
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        for(let j =0; j< points.length; j++){
            ctx.lineTo(startX+points[j][0],startY+points[j][1]);
        }
        ctx.closePath();
        ctx.stroke();
        startX-=40;
    }
}

function Render(){
    let a =0;
    ship.movingForward = (keys[38]);//W Key
    if(keys[39]){//D key
        ship.Rotate(1);
        a=1;
    }
    if(keys[37]){//A key
        ship.Rotate(-1);
        a=-1;
    }
    ctx.clearRect(0,0,canvasWidth,canvasHeight);
    
    ctx.fillStyle='white';
    ctx.font='21px Arial';
    ctx.fillText('SCORE: ' + score.toString(),20,35);
    /*let time=(new Date().getTime())-inmuneTime;
    ctx.fillText('Time:'+time.toString(),canvasWidth/2,35);*/

    if((new Date().getTime())-inmuneTime<fadeInterval){
        if(rep%7==0){
            ship.visible=!ship.visible;
        }
        rep++;
    }else{
        ship.visible=true;
        rep=1;
    }
    
    if (asteroids.length===0){
        ctx.fillStyle='white';
        ctx.font='50px Arial';
        ctx.fillText('YOU WIN', canvasWidth/2 -150, canvasHeight/2);
    }else if (lives<=0){
        ship.visible=false;
        ctx.fillStyle='white';
        ctx.font='50px Arial';
        ctx.fillText('GAME OVER', canvasWidth/2 -150, canvasHeight/2);
    }
    
    DrawLifeShips();
    if(asteroids.length!==0 && (new Date().getTime())-inmuneTime>fadeInterval){
        for(let k=0; k<asteroids.length; k++){
            if(CircleCollision(ship.x,ship.y,11, asteroids[k].x, asteroids[k].y, asteroids[k].collisionRadius)){
                if(asteroids[k].level===1){
                    asteroids.push(new Asteroid(asteroids[k].x-5,asteroids[k].y-5,25,2,22));
                    asteroids.push(new Asteroid(asteroids[k].x+5,asteroids[k].y+5,25,2,22));
                } else if(asteroids[k].level===2){
                    asteroids.push(new Asteroid(asteroids[k].x-5,asteroids[k].y-5,15,3,22));
                    asteroids.push(new Asteroid(asteroids[k].x+5,asteroids[k].y+5,15,3,22));
                }
                asteroids.splice(k,1);
                ship.x=canvasWidth/2;
                ship.y=canvasHeight/2;
                ship.velX = 0;
                ship.velY=0;
                lives--;
                inmuneTime=new Date().getTime();

            }
        }
    }
    if(asteroids.length!==0 && bullets.length!=0){
loop1:
        for(let l=0; l<asteroids.length; l++){
            for(let m=0; m<bullets.length; m++){
                if(CircleCollision(bullets[m].x, bullets[m].y, 3, asteroids[l].x, asteroids[l].y,asteroids[l].collisionRadius)){
                    if(asteroids[l].level===1){
                        asteroids.push(new Asteroid(asteroids[l].x-5,asteroids[l].y-5,25,2,22));
                        asteroids.push(new Asteroid(asteroids[l].x+5,asteroids[l].y+5,25,2,22));
                    } else if(asteroids[l].level===2){
                        asteroids.push(new Asteroid(asteroids[l].x-5,asteroids[l].y-5,15,3,22));
                        asteroids.push(new Asteroid(asteroids[l].x+5,asteroids[l].y+5,15,3,22));
                    }
                    asteroids.splice(l,1);
                    bullets.splice(m,1);
                    score+=20;
                    break loop1;
                }
            }
        }
    }

    if(ship.visible){
        ship.Update();
        ship.Draw();
        if(ship.movingForward){ ship.DrawBoost();}
        if(a!==0) ship.DrawSideBoost(a);  
    }
    if(bullets.length!== 0){
        for(let i = 0; i < bullets.length; i++){
            bullets[i].Update();
            bullets[i].Draw();
        }
    }
    if(asteroids.length!== 0){
        for(let j = 0; j < asteroids.length; j++){
            asteroids[j].Update();
            asteroids[j].Draw(j);
        }
    }
      
    requestAnimationFrame(Render);

}