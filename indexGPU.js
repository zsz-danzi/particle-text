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
        this.gl = cvs.getContext("webgl");

        if (!this.gl) {
            return;
        }


        // cvs.width = this.width;
        // cvs.height = this.height;
        // this.ctx = cvs.getContext('2d');

        this.img = new Image();
        this.img.onload = (e) => {
            this.load = true;
            this.drawImage(30, 0, 50, 50);
            this.drawImage(100, 0, 50, 50);
        }
        this.img.crossOrigin = "anonymous";
        this.img.src = "https://main.qcloudimg.com/raw/cdd4a9be427788ed037dc584e67a812b.png";
        // this.img.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";


        // 分割前准备
        // setup GLSL program
        this.program = webglUtils.createProgramFromScripts(this.gl, ["vertex-shader-2d", "fragment-shader-2d"]);
        webglUtils.resizeCanvasToDisplaySize(this.gl.canvas, 2);

        // look up where the vertex data needs to go. 查找顶点数据需要去的地方
        this.positionLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.texcoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");

        // Create a buffer to put three 2d clip space points in
        this.positionBuffer = this.gl.createBuffer();

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = this.positionBuffer)
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);


        // document.addEventListener("touchstart", (e) => {
        //     e = e.touches[0];
        //     this.setXY(e.clientX, e.clientY);
        //     this.play();
        // });
        // document.addEventListener("touchmove", (e) => {
        //     e = e.touches[0];
        //     this.setXY(e.clientX, e.clientY);
        // });
        // document.addEventListener("touchend", ()=> {
        //     this.paused = true;r
        // });
    },

    drawImage(x, y, width, height) {

        // this.setRectangle(this.gl, 0, 0, width, height);

        this.setRectangle(this.gl, x, y, width, height);
    
        // provide texture coordinates for the rectangle.
        this.texcoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
                0.0,  0.0,
                1.0,  0.0,
                0.0,  1.0,
                0.0,  1.0,
                1.0,  0.0,
                1.0,  1.0,
        ]), this.gl.STATIC_DRAW);

        // Create a texture.
        var texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        // Upload the image into the texture.
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.img);


        // lookup uniforms
        this.resolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution");

        // 分割
        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        // Clear the canvas
        // this.gl.clearColor(0, 0, 0, 0);
        // this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // 渲染

        // Tell it to use our program (pair of shaders)
        this.gl.useProgram(this.program);

        // Turn on the position attribute
        this.gl.enableVertexAttribArray(this.positionLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        // Tell the position attribute how to get data out of this.positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = this.gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
                this.positionLocation, size, type, normalize, stride, offset);

        // console.log(777, positionLocation)

        // Turn on the texcoord attribute
        this.gl.enableVertexAttribArray(this.texcoordLocation);

        // bind the texcoord buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer);

        // Tell the texcoord attribute how to get data out of this.texcoordBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = this.gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
                this.texcoordLocation, size, type, normalize, stride, offset);

        // let currentPosition = [x, y];
        // currentPosition[0] = 200;
        // console.log(111, currentPosition)
        // this.gl.uniform2fv(resolutionLocation, currentPosition);

        this.gl.uniform2f(this.resolutionLocation, this.gl.canvas.width, this.gl.canvas.height);

        // Draw the rectangle.
        var primitiveType = this.gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        this.gl.drawArrays(primitiveType, offset, count);

    },

    setRectangle(gl, x, y, width, height) {
        var x1 = x;
        var x2 = x + width;
        var y1 = y;
        var y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]), gl.STATIC_DRAW);
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