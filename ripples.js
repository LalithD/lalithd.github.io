/* jshint esnext: true */
(function() {
    "use strict";
    window.onload = function() {
        var canvas = document.getElementById("panel");
        var ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var descriptions = ["None", "Slowest", "Slower", "Normal", "Faster", "Fastest"];
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
        var shapes = ["CIRCLE", "TRIANGLE", "SQUARE", "HEXAGON"];
        var type = shapes[0];
        var rotate = 0;
        var thickness = 1;
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
        document.getElementById("cursor").onclick = function() {
            if (document.getElementById("cursor").style.color === "red") {
                document.getElementById("cursor").style.color = "green";
                document.getElementById("cursor").innerHTML = "ON";
                document.getElementById("panel").style.cursor = "crosshair";
            } else {
                document.getElementById("cursor").style.color = "red";
                document.getElementById("cursor").innerHTML = "OFF";
                document.getElementById("panel").style.cursor = "none";
            }
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
        document.querySelector("input.thickness").onchange = function() {
            var thicknessType = ["None", "Thinnest", "Thin", "Normal", "Thick", "Thickest"];
            var values = [0, 1, 3, 5, 10, 20];
            var selected = parseInt(document.querySelector("input.thickness").value);
            thickness = values[selected];
            document.querySelector("label.thickness").innerHTML = `Line Width (${thicknessType[selected]}): `;
        };
        document.querySelector("input.disappear").onchange = function() {
            var values = [0, 4000, 2000, 1000, 500, 250];
            var selected = parseInt(document.querySelector("input.disappear").value);
            disappearTime = values[selected];
            document.querySelector("label.disappear").innerHTML = `Disappearing Time (${descriptions[selected]}): `;
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
        document.getElementById("shape").onclick = function() {
            var selectedShape = document.getElementById("shape").innerHTML;
            for (var i = 0; i < shapes.length; i++) {
                if (selectedShape === shapes[i]) {
                    type = shapes[(i+1)%shapes.length];
                    document.getElementById("shape").innerHTML = type;
                }
            }
        };
        document.querySelector("input.rotation").onchange = function() {
            var values = [0, 5000, 1000, 500, 100, 50];
            var selected = parseInt(document.querySelector("input.rotation").value);
            rotate = values[selected];
            document.querySelector("label.rotation").innerHTML = `Rotation Speed (${descriptions[selected]}): `;
        };
        document.querySelector("input.create_speed").onchange = function() {
            createSpeed = parseInt(document.querySelector("input.create_speed").value * 1000);
            document.querySelector("label.create_speed").innerHTML = `Delay (${createSpeed} ms): `;
        };
        document.querySelector("input.size_speed").onchange = function() {
            var values = [0, 16, 8, 4, 2, 1];
            var selected = parseInt(document.querySelector("input.size_speed").value);
            sizeIncrease = values[selected];
            document.querySelector("label.size_speed").innerHTML = `Size Increase (${descriptions[selected]}): `;
        };
        document.querySelector("input.color").onchange = function() {
            var values = [0, 100, 50, 25, 10, 1];
            var selected = parseInt(document.querySelector("input.color").value);
            colorSpeed = values[selected];
            document.querySelector("label.color").innerHTML = `Color Change (${descriptions[selected]}): `;
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
                ctx.lineWidth = thickness;
                if (rotate !== 0) {
                    ctx.save();
                    ctx.translate(circle.x, circle.y);
                    ctx.rotate((new Date().getTime()/rotate)%(2*Math.PI));
                    ctx.translate(-circle.x,-circle.y);
                }
                if (type === "CIRCLE") {
                    ctx.arc(circle.x, circle.y, circle.radius, 0, 2*Math.PI, false);
                } else if (type === "TRIANGLE") {
                   ctx.moveTo(circle.x, circle.y-circle.radius);
                   ctx.lineTo(circle.x+Math.pow(3,0.5)/2*circle.radius, circle.y+circle.radius/2);
                   ctx.lineTo(circle.x-Math.pow(3,0.5)/2*circle.radius, circle.y+circle.radius/2);
                   ctx.lineTo(circle.x, circle.y-circle.radius);
                } else if (type === "SQUARE") {
                    ctx.rect(circle.x-circle.radius, circle.y-circle.radius, circle.radius * 2, circle.radius * 2);
                } else if (type === "HEXAGON") {
                    ctx.moveTo(circle.x+circle.radius, circle.y);
                    ctx.lineTo(circle.x+circle.radius/2, circle.y+Math.pow(3,0.5)/2*circle.radius);
                    ctx.lineTo(circle.x-circle.radius/2, circle.y+Math.pow(3,0.5)/2*circle.radius);
                    ctx.lineTo(circle.x-circle.radius, circle.y);
                    ctx.lineTo(circle.x-circle.radius/2, circle.y-Math.pow(3,0.5)/2*circle.radius);
                    ctx.lineTo(circle.x+circle.radius/2, circle.y-Math.pow(3,0.5)/2*circle.radius);
                    ctx.lineTo(circle.x+circle.radius, circle.y);
                }
                ctx.stroke();
                if (rotate !== 0) {
                    ctx.restore();
                }
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
