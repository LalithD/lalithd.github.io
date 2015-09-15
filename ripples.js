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
        var pause = false;
        canvas.addEventListener("mousemove", circle, false);
        canvas.addEventListener("keydown", checkKey, false);
        var prevTime = new Date().getTime();
        animation();
        function checkKey(evt) {
            if (evt.keyCode == "c".charCodeAt(0) - 32) {
                circles = [];
            }
            if (evt.keyCode == "p".charCodeAt(0) - 32) {
                pause = !pause;
                animation();
            }
            if (evt.keyCode === 27) {
                document.getElementById("options").style.display = "block";
            }
        }
        function circle(evt) {
            mousePos = {
                x: evt.x - canvas.offsetLeft,
                y: evt.y - canvas.offsetTop
            };
            if (!auto) {
                var newCircle = {
                    x: mousePos.x,
                    y: mousePos.y,
                    radius: 5,
                    hsl: (new Date().getTime()/25)%360,
                    transparency: 1
                };
                circles.push(newCircle);
            }
        }
        function newCircle() {
            if (mousePos !== null && auto && noMovement(stop)) {
                circles.push({
                    x: mousePos.x,
                    y: mousePos.y,
                    radius: 0,
                    hsl: Math.floor(new Date().getTime()/25)%360,
                    transparency: 1
                });
            }
        }
        function noMovement(stop) {
            return !stop || mousePos.prevX !== mousePos.x || mousePos.prevY !== mousePos.y;
        }
        function animation() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (new Date().getTime() - prevTime > 25) {
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
                ctx.strokeStyle = "hsla("+ circle.hsl + ", 100%, 50%, " + circle.transparency + ")";
                ctx.lineWidth = 1;
                ctx.arc(circle.x, circle.y, circle.radius, 0, 2*Math.PI, false);
                ctx.stroke();
                circle.transparency -= 0.01;
                circle.radius += 2;
            }
            if (!pause) {
                window.requestAnimationFrame(animation);
            }
        }
    };
}());
