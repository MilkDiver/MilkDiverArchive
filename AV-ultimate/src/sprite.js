// sprite.js
// Desc.: Creates a Sprite object to be modified based on audio data.
// Written by: Jack Moyen
// Last Updated: March 2025
// 

class Sprite{
    constructor(x,y,size, color, canvasWidth, canvasHeight){
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speed = Math.random() * 2 + 1;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight
    }

    update(audioData){
        let averageFrequency = audioData.reduce((sum, value) => sum + value, 0) / audioData.length; 
        this.speed = averageFrequency/10 * Math.random();
        this.x += this.speed;
        if(this.x > this.canvasWidth){
            this.x = 0;
            this.y = Math.random() * this.canvasHeight;
        }
    }

    draw(ctx){
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'white';
        ctx.beginPath();

        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.size/2, this.y + this.size/2);
        ctx.lineTo(this.x, this.y + this.size);

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}

export {Sprite};