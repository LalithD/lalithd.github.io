// gravity simulation
(function() {
    "use strict";

    class Particle {

        constructor(x, y, v, a, c) {
            this.x = x; // x position of particle at any time
            this.y = y; // y position of particle at any time
            this.v = v; // velocity of particle at any time
            this.a = a; // angle of velocity vector at any time
            this.c = c; // color in form [r,g,b]
            // console.log("created particle with", x, y, v, a, c);
        }

        getPos() {
            return {
                x: this.x,
                y: this.y
            };
        }

        getSpeed() {
            return {
                x: this.v * Math.cos(this.a),
                y: this.v * Math.sin(this.a)
            };
        }

        getVelocity() {
            return {
                v: this.v,
                a: this.a
            };
        }

        getColor() {
            return {
                r: this.c[0],
                g: this.c[1],
                b: this.c[2]
            };
        }

        updatePos(x, y) {
            this.x = x;
            this.y = y;
        }

        updateSpeed(x, y) {
            this.v = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            this.a = Math.atan2(y, x);
        }

        updateVelocity(v, a) {
            this.v = v;
            this.a = a;
        }

        updateColor(c) {
            this.c = c;
        }

        // Expected: array with x and y coordinates
        findDistance(pos) {
            return Math.sqrt(Math.pow(pos.x-this.x, 2) + Math.pow(pos.y-this.y, 2));
        }

        // Expected: array with x and y coordinates
        findAngle(pos) {
            return Math.atan2(pos.y-this.y, pos.x-this.x);
        }

        // Expected: arr contains objects with x and y positions
        findClosestDistance(arr) {
            var minDist = -1;
            var object = null;
            for (var i = 0; i < arr.length; i++) {
                var distance = this.findDistance(arr[i]);
                if (object === null || distance < minDist) {
                    minDist = distance;
                    object = arr[i];
                }
            }
            return minDist;
        }
    }

    window.onload = function() {
        var canvas = document.getElementById("panel");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log(canvas.width,canvas.height);
        var ctx = canvas.getContext("2d");
        var particles = []; // stores Particle objects
        var wells = []; // stores Place objects (gravity wells)
        var beginTime = new Date().getTime(); // not used yet
        var prevTimeStep = beginTime;
        var viewPath = false;
        var gConstant = 1000; // equal to G*M1
        var eventHorizon = 5; // disappearing distance for particles
        var showWells = false;
        function getTime() {
            return Math.round(new Date().getTime() - beginTime);
        }
        updateAnimation();
        var isLeftDown = false;
        var isRightDown = false;
        var mouseX = 0; var mouseY = 0;
        canvas.addEventListener("keydown", checkKey, false);
        canvas.addEventListener("touchstart", toggleOn, false);
        canvas.addEventListener("touchmove", getEventPos, false);
        canvas.addEventListener("touchend", toggleOff, false);
        canvas.addEventListener("mousedown", toggleOn, false);
        canvas.addEventListener("mousemove", getEventPos, false);
        canvas.addEventListener("mouseup", toggleOff, false);
        canvas.addEventListener("contextmenu", function(evt) {
            evt.preventDefault();
        }, false);

        function toggleOn(evt) {
            // evt.preventDefault();
            if(!evt.button) {
                isLeftDown = true;
            } else if (evt.button == 2) {
                isRightDown = true;
            }
            getEventPos(evt);
        }

        function toggleOff(evt) {
            if(!evt.button) {
                isLeftDown = false;
            }
            if (evt.button == 2) {
                isRightDown = false;
            }
        }

        function getEventPos(evt) {
            // evt.preventDefault();
            mouseX = evt.x - canvas.offsetLeft;
            mouseY = evt.y - canvas.offsetTop;
            if (isLeftDown) {
                createParticle(mouseX, mouseY);
            } else if (isRightDown) {
                createWell(mouseX, mouseY);
            }
        }

        function checkKey(evt) {
            if (evt.keyCode == 67) { // c for clear particles
                particles = [];
            } else if (evt.keyCode == 87) { // w for clearing gravity wells
                wells = [];
            } else if (evt.keyCode == 86) { // v for viewing path of one particle toggling
                particles = [];
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                viewPath = !viewPath;
            } else if (evt.keyCode == 83) { // s for show/hide wells
                if (showWells) {
                    for (var i = 0; i < wells.length; i++) {
                        var pos = wells[i];
                        ctx.beginPath();
                        ctx.fillStyle = "#000000";
                        ctx.arc(pos.x, pos.y, 5, 0, 2*Math.PI, false);
                        ctx.fill();
                    }
                }
                showWells = !showWells;
            }
        }

        function createWell(mouseX, mouseY) {
            var newWell = {
                x: mouseX,
                y: mouseY
            };
            wells.push(newWell);
        }

        function createParticle(x, y) {
            var v = 0.1 + 1 * Math.random(); // min speed is 0.1 pixels
            var a = 2 * Math.PI * Math.random();
            var c = [255 * Math.random(), 255 * Math.random(), 255 * Math.random()];
            var newParticle = new Particle(x, y, v, a, c);
            // console.log("clicked at", x, y);
            if (viewPath) {
                particles = [];
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            particles.push(newParticle);
            redrawAll(particles);
        }

        function redrawAll(particles) {
            if (!viewPath) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            function getParticleRadius() {
                if (viewPath) { // fixed size to see path easily
                    return 5;
                } else { // animated
                    return Math.random() * 7 + 3;
                }
            }
            for (var i = 0; i < particles.length; i++) {
                var particleRadius = getParticleRadius();
                var pos = particles[i].getPos();
                ctx.beginPath();
                var color = particles[i].getColor();
                // ctx.fillStyle = "rgb(" + Math.floor(color.r) + "," + Math.floor(color.g) + "," + Math.floor(color.b) + ")";
                ctx.fillStyle = "hsl(" + (Math.floor(color.r) + getTime()) + ", 50%, 50%)";
                ctx.arc(pos.x, pos.y, particleRadius, 0, 2*Math.PI, false);
                ctx.fill();
            }
        }

        // assumes particles (array) is already defined as global var
        function updateAnimation() {
            var timeStep = new Date().getTime() - prevTimeStep;
            if (isLeftDown) {
                createParticle(mouseX, mouseY);
            }
            // iterates through particles, updating their location
            for (var i = 0; i < particles.length; i++) {
                var pos = particles[i].getPos();
                if (pos.x < -canvas.width || pos.x > canvas.width * 2 || pos.y < -canvas.height || pos.y > canvas.height * 2) { // delete element because it is too far out of range
                    particles.splice(i, 1);
                } else if (particles[i].findClosestDistance(wells) < eventHorizon) { // delete element because it is in a gravity well
                    // TODO: add code for collision course
                    // theta_main = Math.atan(well.y-particles[i].y);
                    particles.splice(i, 1);
                } else {
                    for (var j = 0; j < wells.length; j++) {
                        var speed = particles[i].getSpeed();
                        var R = particles[i].findDistance(wells[j]);
                        var angle = particles[i].findAngle(wells[j]);
                        particles[i].updateSpeed(speed.x + gConstant * Math.cos(angle)/(R*R), speed.y + gConstant * Math.sin(angle)/(R*R));
                    }
                    var newSpeed = particles[i].getSpeed();
                    particles[i].updatePos(pos.x + timeStep * newSpeed.x, pos.y + timeStep * newSpeed.y);
                }
            }
            // draws particles
            redrawAll(particles);
            // draws wells
            if (showWells) {
                drawWells(wells);
            }
            prevTimeStep = new Date().getTime();
            console.log(timeStep);
            window.requestAnimationFrame(updateAnimation);
        }

        function drawWells() {
            for (var i = 0; i < wells.length; i++) {
                var pos = wells[i];
                ctx.beginPath();
                ctx.fillStyle = "#FFFFFF";
                ctx.arc(pos.x, pos.y, 2, 0, 2*Math.PI, false);
                ctx.fill();
            }
        }
    };

})();
