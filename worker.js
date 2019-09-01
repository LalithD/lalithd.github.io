"use strict";
self.addEventListener("message", function(e) {
    self.postMessage("Worker received message: " + e.data); // send message back to main program
    self.close(); // terminate worker
}, false);
