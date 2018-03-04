(function() {
    window.onload = function() {
        console.log("index.js loaded");
        document.querySelectorAll("img")[0].onmouseover = function() {
            var array = ["ripples1.png", "ripples2.png"];
            var currentPic = document.querySelectorAll("img")[0].src;
            currentPic = currentPic.split("").reverse().join("");
            currentPic = currentPic.substr(0, currentPic.indexOf("/")).split("").reverse().join("");
            console.log(currentPic);
            var newPic = array[(findMatch(currentPic, array) + 1)%array.length];
            document.querySelectorAll("img")[0].src = newPic;
        };
    };

    function findMatch(string, array) {
        for (var i = 0; i < array.length; i++) {
            if (string == array[i]) {
                return i;
            }
        }
        return -1;
    }
})();
