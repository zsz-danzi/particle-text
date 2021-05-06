let stats;

const draw = {
    drawX: 0,
    drawY: 0,
    ctx: '',
    k: 0, // 0～360 度数
    paused: true,
    dir: 0, // 0~14 边距
    colors: [ '#aaa', '#888', '#333', '#ccc', '#111' ],
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
        
        document.addEventListener("touchstart", (e) => {
            e = e.touches[0];
            this.setXY(e.clientX, e.clientY);
            this.play();
        });
        document.addEventListener("touchmove", (e) => {
            e = e.touches[0];
            this.setXY(e.clientX, e.clientY);
        });
        document.addEventListener("touchend", ()=> {
            this.paused = true;
        });
    },

    setXY(x, y) {
        this.drawX = x;
        this.drawY = y;
    },

    render() {
        if (!this.load) return;

        this.ctx.beginPath();
        this.opacity = Math.ceil(Math.random() * 10) / 10 + 0.5;
        this.opacity = this.opacity > 1 ? 1 : this.opacity;
        this.ctx.globalAlpha = this.opacity;
        let dis = 3 * Math.ceil(Math.random() * 10) / 10 + 3;

        this.ctx.drawImage(this.img, this.drawX * 2,this.drawY * 2, dis, dis);

        this.particle.push({
            opacity: this.opacity,
            x: this.drawX * 2,
            y: this.drawY * 2,
            size: dis,
            xspeed: 0,
            yspeed:0,
        })

        for (let i = 0; i < 20; i++) {
            this.k = Math.ceil(Math.random() * 360);
            this.dir = Math.ceil(Math.random() * 30);
            this.ctx.fillStyle = this.colors[Math.floor(Math.random() * 4)];
            
            let x1 = this.dir * Math.sin(2 * Math.PI / 360 * this.k);
            let y1 = this.dir * Math.cos(2 * Math.PI / 360 * this.k);
            let dis = 3 * Math.ceil(Math.random() * 10) / 10 + 3;
    
            this.ctx.drawImage(this.img, this.drawX * 2 + x1,this.drawY * 2 + y1, dis, dis);
            this.particle.push({
                opacity: this.opacity,
                x: this.drawX * 2 + x1,
                y: this.drawY * 2 + y1,
                size: dis,
                xspeed: x1/10,
                yspeed: y1/10,
            })
        }

        this.ctx.closePath();
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
            this.ctx.drawImage(this.img, item.x, item.y, item.size, item.size);
            this.ctx.closePath();
        }
        if (this.animateFlag === false) {
            console.log('动画结束');
            return;
        }
        requestAnimationFrame(this.animate.bind(this));
    }
}

window.onload = ()=> {
    stats = new Stats();
    // document.body.appendChild(stats.dom);

    draw.init('#cvs');

    document.getElementById('btn').onclick = () => {
        this.animateFlag = true;
        draw.animate();
    }
}