/* jshint esnext: true */
(function() {
    "use strict";
    window.onload = function() {
        var canvas = document.getElementById("panel");
        var ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var circles = [];
        var mousePos = null;
        var auto = true;
        var stop = false;
        var pause = true;
        var click = false;
        var initRadius = 5;
        var createSpeed = 20;
        var colorSpeed = 25;
        var disappearTime = 1000;
        var sizeIncrease = 4;
        document.addEventListener("mousemove", circle, false);
        document.addEventListener("mousedown", function() { if(click) {circles.push(createCircle());} }, false);
        document.addEventListener("keydown", checkKey, false);
        document.getElementById("easter_egg").onclick = function() {
            var getColor = document.getElementById("easter_egg").style.color;
            var colorArray = ["rgb(255, 0, 0)", "rgb(255, 165, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)", "rgb(0, 0, 255)", "rgb(75, 0, 130)", "rgb(238, 130, 238)"];
            for (var i = 0; i < colorArray.length; i++) {
                if (getColor === colorArray[i]) {
                    document.getElementById("easter_egg").style.color = colorArray[(i+1)%colorArray.length];
                    return;
                }
            }
            console.log(getColor);
            document.getElementById("easter_egg").style.color = "rgb(255, 0 , 0)";
        };
        document.getElementById("click_ripples").onclick = function() {
            if (click) {
                document.getElementById("click_ripples").style.color = "red";
                document.getElementById("click_ripples").innerHTML = "OFF";
            } else {
                document.getElementById("click_ripples").style.color = "green";
                document.getElementById("click_ripples").innerHTML = "ON";
            }
            click = !click;
        };
        document.querySelector("input.disappear").onchange = function() {
            var selected = parseInt(document.querySelector("input.disappear").value);
            var description = null;
            if (selected === 1) {
                disappearTime = 4000;
                description = "Slowest";
            } else if (selected === 2) {
                disappearTime = 2000;
                description = "Slower";
            } else if (selected === 3) {
                disappearTime = 1000;
                description = "Normal";
            } else if (selected === 4) {
                disappearTime = 500;
                description = "Faster";
            } else if (selected === 5) {
                disappearTime = 250;
                description = "Fastest";
            }
            document.querySelector("label.disappear").innerHTML = `Disappearing Time (${description}): `;
        };
        document.querySelector("input.radius").onchange = function() {
            initRadius = parseInt(document.querySelector("input.radius").value);
            document.querySelector("label.radius").innerHTML = `Radius (${initRadius} px): `;
        };
        document.getElementById("autoripples").onclick = function() {
            if (auto) {
                document.getElementById("autoripples").style.color = "red";
                document.getElementById("autoripples").innerHTML = "OFF";
            } else {
                document.getElementById("autoripples").style.color = "green";
                document.getElementById("autoripples").innerHTML = "ON";
            }
            auto = !auto;
        };
        document.querySelector("input.create_speed").onchange = function() {
            createSpeed = parseInt(document.querySelector("input.create_speed").value * 1000);
            document.querySelector("label.create_speed").innerHTML = `Delay (${createSpeed} ms): `;
        };
        document.querySelector("input.size_speed").onchange = function() {
            var selected = parseInt(document.querySelector("input.size_speed").value);
            var description = null;
            if (selected === 1) {
                sizeIncrease = 16;
                description = "Slowest";
            } else if (selected === 2) {
                sizeIncrease = 8;
                description = "Slower";
            } else if (selected === 3) {
                sizeIncrease = 4;
                description = "Normal";
            } else if (selected === 4) {
                sizeIncrease = 2;
                description = "Faster";
            } else if (selected === 5) {
                sizeIncrease = 1;
                description = "Fastest";
            }
            document.querySelector("label.size_speed").innerHTML = `Size Increase (${description}): `;
        };
        document.querySelector("input.color").onchange = function() {
            var selected = parseInt(document.querySelector("input.color").value);
            var description = null;
            if (selected === 1) {
                colorSpeed = 100;
                description = "Slowest";
            } else if (selected === 2) {
                colorSpeed = 50;
                description = "Slower";
            } else if (selected === 3) {
                colorSpeed = 25;
                description = "Normal";
            } else if (selected === 4) {
                colorSpeed = 10;
                description = "Faster";
            } else if (selected === 5) {
                colorSpeed = 1;
                description = "Fastest";
            }
            document.querySelector("label.color").innerHTML = `Color Change (${description}): `;
        };
        var prevTime = new Date().getTime();
        var lastFrame = new Date().getTime();
        animation();
        function checkKey(evt) {
            if (evt.keyCode == "p".charCodeAt(0) - 32) {
                pause = !pause;
                animation();
            }
            if (evt.keyCode === 27) {
                if (document.getElementById("options").style.display === "none") {
                    document.getElementById("options").style.display = "block";
                    pause = true;
                } else {
                    document.getElementById("options").style.display = "none";
                    pause = false;
                    animation();
                }
            }
        }
        function circle(evt) {
            mousePos = {
                x: evt.layerX,
                y: evt.layerY
            };
            if (!auto) {
                if (new Date().getTime() - prevTime > createSpeed) {
                    circles.push(createCircle());
                    prevTime = new Date().getTime();
                }
            }
        }
        function newCircle() {
            if (mousePos !== null && auto && !click && noMovement(stop)) {
                circles.push(createCircle());
            }
        }
        function createCircle() {
            return {
                x: mousePos.x,
                y: mousePos.y,
                radius: initRadius,
                hue: Math.floor(new Date().getTime()/colorSpeed)%360,
                transparency: 1
            };
        }
        function noMovement(stop) {
            return !stop || mousePos.prevX !== mousePos.x || mousePos.prevY !== mousePos.y;
        }
        function animation() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (new Date().getTime() - prevTime > createSpeed) {
                newCircle();
                prevTime = new Date().getTime();
            }
            if (mousePos) {
                mousePos.prevX = mousePos.x;
                mousePos.prevY = mousePos.y;
            }
            for (var i = 0; i < circles.length; i++) {
                var circle = circles[i];
                if (circle.transparency < 0) {
                    circles.splice(i, 1);
                }
                ctx.beginPath();
                ctx.strokeStyle = "hsla("+ circle.hue + ", 100%, 50%, " + circle.transparency + ")";
                ctx.lineWidth = 1;
                ctx.arc(circle.x, circle.y, circle.radius, 0, 2*Math.PI, false);
                ctx.stroke();
                circle.transparency -= (new Date().getTime() - lastFrame)/disappearTime;
                circle.radius += (new Date().getTime() - lastFrame)/sizeIncrease;
            }
            lastFrame = new Date().getTime();
            if (!pause) {
                window.requestAnimationFrame(animation);
            }
        }
    };
}());
