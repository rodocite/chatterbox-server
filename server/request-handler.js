var Db = require('tingodb')().Db;
var db = new Db('./', {});
var collection = db.collection("message_store");

exports.requestHandler = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "application/json";

  var routes = {
    'GET': {
      '/classes/messages' : function(req, res){
        response.writeHead(200, headers);
        collection.find().sort({objectId:-1}).toArray(function(err, messages) {
          console.log(messages);
          response.end(JSON.stringify({results: messages.slice(0, 10)}));
        });
      }
    },

    'POST': {
      '/classes/messages' : function(req, res){
        var message = '';

        req.on('data', function(data){
          message += data;
        });

        req.on('end', function() {
          //put message in messages array
          var json = JSON.parse(message);
          collection.count(function(err, count){
            console.log('count must have had a callback');
            if(err) throw err;
            json.objectId = count + 1;
            console.log(json);

            // messages.unshift(json);
            collection.insert(json, function(err, result) {
              if(err) throw err;
              response.writeHead(201, headers);
              response.end(message);
            });
          });
        });
      }
    },

    'OPTIONS': {
      '/classes/messages' : function(req, res){
        response.writeHead(200, headers);
        response.end();
      }
    }
  };
  var url = request.url.split('?')[0];
  if(url[url.length-1] === '/'){
    url = url.slice(0,url.length-1);
  }
  console.log(url);
  var handler = routes[request.method] && routes[request.method][url];
  if(handler){
    handler(request,response);
    return;
  }


  // 404
  var statusCode = 404;

  headers['Content-Type'] = "text/html";
  response.writeHead(statusCode, headers);
  response.end("404: Not Found");
};

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

