/* jshint esnext: true */
(function() {
    "use strict";
    let correctNum = 0;
    let incorrectNum = 0;
    let primesFound = 0;
    let timeTaken = 0;
    setInterval(function() {
        timeTaken++;
        document.getElementById("time").innerHTML = `Time: ${timeTaken}`;
    }, 1000);
    window.onload = newNumber;
    function newNumber() {
        let number = Math.floor(Math.random() * 998) + 2;
        document.getElementById("number").innerHTML = number;
        let answer = isPrime(number);
        if (answer) {
            document.getElementById("prime").onclick = correctAndPrime;
            document.getElementById("composite").onclick = incorrect;
        } else {
            document.getElementById("prime").onclick = incorrect;
            document.getElementById("composite").onclick = correct;
        }
    }
    function correct() {
        correctNum++;
        next();
    }
    function correctAndPrime() {
        primesFound++;
        document.getElementById("extra").innerHTML = `Primes Found: ${primesFound}`;
        correct();
    }
    function incorrect() {
        incorrectNum++;
        document.getElementById("incorrect").innerHTML = `Incorrect: ${incorrectNum}`;
        next();
    }
    function next() {
        document.getElementById("correct").innerHTML = `Correct: ${correctNum} (${Math.round(correctNum/(correctNum+incorrectNum)*1000)/10}%)`;
        newNumber();
    }
    function isPrime(number) {
        if (number % 2 === 0) {
            return false;
        }
        for (let i = 3; i <= Math.floor(Math.pow(number, 0.5)); i += 2) {
            if (number % i === 0) {
                return false;
            }
        }
        return true;
    }
})();
