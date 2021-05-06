//防止iphone 快速点击两下 页面往上调
window.ontouchstart = function(e) { e.preventDefault(); };
//禁止页面滑动
document.documentElement.addEventListener('touchmove',function(e){e.preventDefault();});

let stats;

const draw = {
    drawX: 0,
    drawY: 0,
    ctx: '',
    k: 0, // 0～360 度数
    paused: true,
    dir: 0, // 0~14 边距
    colors: ['#228b22', '#fd5b78', '#00bfff', '#ffa500', '#ff0000', '#ffffff'],
    scale: 0, // 倍数
    opacity: 0,
    particle: [],
    width: document.documentElement.clientWidth * 2,
    height: document.documentElement.clientHeight * 2,
    animateFlag: false, 

    init(canvas) {
        const cvs = document.querySelector(canvas);
        cvs.width = this.width;
        cvs.height = this.height;
        this.ctx = cvs.getContext('2d');

        this.img = new Image();
        this.img.onload = (e) => {
            this.load = true;
        }
        this.img.src = "https://main.qcloudimg.com/raw/cdd4a9be427788ed037dc584e67a812b.png";
        
        cvs.addEventListener("touchstart", (e) => {
            e = e.touches[0];
            this.setXY(e.clientX, e.clientY);
            this.play();
        });
        cvs.addEventListener("touchmove", (e) => {
            e = e.touches[0];
            this.setXY(e.clientX, e.clientY);
        });
        cvs.addEventListener("touchend", ()=> {
            this.paused = true;
        });

        console.log('文案动画开始');
        this.animateText();
    },

    setXY(x, y) {
        this.drawX = x;
        this.drawY = y;
    },

    render() {
        if (!this.load) return;

        this.ctx.beginPath();
        this.opacity = Math.ceil(Math.random() * 10) / 10 + 0.3;
        this.opacity = this.opacity > 1 ? 1 : this.opacity;
        this.ctx.globalAlpha = this.opacity;
        let dis = 3 * Math.ceil(Math.random() * 10) / 10 + 1;

        this.ctx.fillStyle = this.colors[Math.floor(Math.random() * 6)];
        // this.ctx.drawImage(this.img, this.drawX * 2,this.drawY * 2, dis, dis);

        this.ctx.arc(this.drawX*2, this.drawY*2, dis, 0, 2*Math.PI);

        this.particle.push({
            opacity: this.opacity,
            x: this.drawX * 2,
            y: this.drawY * 2,
            size: dis,
            xspeed: 0,
            yspeed:0,
            color: this.ctx.fillStyle,
            f: Math.random() > 0.5 ? true : false,
        })

        this.ctx.fill();
        this.ctx.closePath();

        for (let i = 0; i < 14; i++) {
            this.ctx.beginPath();
            this.k = Math.ceil(Math.random() * 360);
            this.dir = Math.ceil(Math.random() * 30);
            this.ctx.fillStyle = this.colors[Math.floor(Math.random() * 6)];
            this.opacity = Math.ceil(Math.random() * 10) / 10 + 0.3;
            this.opacity = this.opacity > 1 ? 1 : this.opacity;
            this.ctx.globalAlpha = this.opacity;
            
            let x1 = this.dir * Math.sin(2 * Math.PI / 360 * this.k);
            let y1 = this.dir * Math.cos(2 * Math.PI / 360 * this.k);
            let dis = 3 * Math.ceil(Math.random() * 10) / 10 + 1;
    
            // this.ctx.drawImage(this.img, this.drawX * 2 + x1,this.drawY * 2 + y1, dis, dis);
            this.ctx.arc(this.drawX * 2 + x1, this.drawY * 2 + y1, dis, 0, 2*Math.PI);
            // console.log('size', dis)
            this.particle.push({
                opacity: this.opacity,
                x: this.drawX * 2 + x1,
                y: this.drawY * 2 + y1,
                size: dis,
                xspeed: x1/8,
                yspeed: y1/8,
                color: this.ctx.fillStyle,
                f: Math.random() > 0.5 ? true : false,
            })
            this.ctx.fill();
            this.ctx.closePath();
        }

        // this.ctx.fill();
        // this.ctx.closePath();
        if(this.paused === false) {
            requestAnimationFrame(this.render.bind(this));
        }
    },

    play() {
        if(this.paused) {
            this.paused = false;
            this.render();
        }
    },

    animate() {
        stats.update();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.animateFlag = false;

        for(let i = 0; i < this.particle.length; i++) {
            let item = this.particle[i];

            if (item.opacity <= 0) {
                this.particle.splice(i, 1);
                i--;
                continue;
            }

            this.animateFlag = true;

            item.x+=item.xspeed;
            item.y+=item.yspeed;
            item.opacity-=0.03;
            item.opacity = item.opacity < 0 ? 0 : item.opacity;
            this.ctx.beginPath();
            this.ctx.globalAlpha = item.opacity;
            // this.ctx.drawImage(this.img, item.x, item.y, item.size, item.size);

            this.ctx.fillStyle = item.color;

            this.ctx.arc(item.x, item.y, item.size, 0, 2*Math.PI);
            this.ctx.fill();
            this.ctx.closePath();
        }
        if (this.animateFlag === false) {
            console.log('动画结束');
            this.animateText();
            return;
        }
        requestAnimationFrame(this.animate.bind(this));
    },

    animateText() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        for(let i = 0; i < this.particle.length; i++) {
            let item = this.particle[i];
            this.ctx.beginPath();
            this.ctx.fillStyle = item.color;
            // this.opacity = Math.ceil(Math.random() * 10) / 10 + 0.3;
            // this.opacity = this.opacity > 1 ? 1 : this.opacity;
            this.ctx.globalAlpha = item.opacity;
            
            if (item.f) { // 放大
                item.size += 0.05;
                if (item.size > 4) {
                    item.f = false;
                    item.size = 4;
                }
            } else {
                item.size -= 0.05;
                if (item.size < 1) {
                    item.f = true;
                    item.size = 1;
                }
            }
    
            // this.ctx.drawImage(this.img, this.drawX * 2 + x1,this.drawY * 2 + y1, dis, dis);
            this.ctx.arc(item.x, item.y, item.size, 0, 2*Math.PI);

            this.ctx.fill();
            this.ctx.closePath();
        }


        if (this.animateFlag === true) {
            console.log('文案动画结束');
            return;
        }
        requestAnimationFrame(this.animateText.bind(this));

    },
}

window.onload = () => {
    
    stats = new Stats();
    // document.body.appendChild(stats.dom);

    draw.init('#cvs');

    document.getElementById('btn').onclick = () => {
        this.animateFlag = true;
        draw.animate();
    }
}
