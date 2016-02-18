var http = require("http"),
    path = require("path"),
    fs = require("fs"),
    EventEmitter = require("events")

var emitter = new EventEmitter()
emitter.setMaxListeners(Infinity)


var server = http.createServer(function(req, res) {

    if (req.url === "/") {
      fs.createReadStream(path.join(__dirname, "index.html")).pipe(res)
      return
    }

    if (req.url === "/messages") {
      var message = ""
      req.on("data", function(chunk) {
        message += chunk
      })

      req.on("end", function() {
        res.end(message)
        console.log("Received a message:", message)
        emitter.emit("message", message)
      })

      return
    }

    if (req.url === "/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream"
      })

      var handler = function(message) {
        res.write("data: " + message + "\n\n")
      }

      emitter.on("message", handler)

      res.on("close", function() {
        emitter.removeListener("message", handler)
      })

      return
    }


    res.writeHead(404, {

    })
    res.end("Not Found")
})

server.listen(9091, "0.0.0.0")
