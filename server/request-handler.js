var Db = require('tingodb')().Db,
    assert = require('assert');

var db = new Db('./', {});
// Fetch a collection to insert document into
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
  // The outgoing status.
  var statusCode = 404;


  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = "text/html";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  response.end("404: Not Found");
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

