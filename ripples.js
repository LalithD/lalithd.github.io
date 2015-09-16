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
        document.addEventListener("mousemove", circle, false);
        document.addEventListener("mousedown", function() { if(click) {circles.push(createCircle());} }, false);
        document.addEventListener("keydown", checkKey, false);
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
        document.querySelector("input.radius").onchange = function() {
            initRadius = parseInt(document.querySelector("input.radius").value);
            document.querySelector("label.radius").innerHTML = "Radius (" + initRadius + " px): ";
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
            document.querySelector("label.create_speed").innerHTML = "Delay (" + createSpeed + " ms): ";
        };
        document.querySelector("input.color").onchange = function() {
            colorSpeed = parseInt(document.querySelector("input.color").value);
            var description = "Slowest";
            if (colorSpeed <= 10) {
                description = "Fastest";
            } else if (colorSpeed <= 20) {
                description = "Fast";
            } else if (colorSpeed <= 40) {
                description = "Normal";
            } else if (colorSpeed <= 100) {
                description = "Slower";
            }
            document.querySelector("label.color").innerHTML = "Delay (" + description + "): ";
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
                circles.push(createCircle());
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
                circle.transparency -= (new Date().getTime() - lastFrame)/1000;
                circle.radius += (new Date().getTime() - lastFrame)/5;
            }
            lastFrame = new Date().getTime();
            if (!pause) {
                window.requestAnimationFrame(animation);
            }
        }
    };
}());
