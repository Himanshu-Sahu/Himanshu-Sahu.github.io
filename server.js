var http = require('http');
var fs = require('fs');
var url = require('url');

// Create a server
http.createServer( function (request, response) {  
   // Parse the request containing file name
   var pathname = url.parse(request.url).pathname;
   var tmp  = pathname.lastIndexOf(".");
   var extension  = pathname.substring((tmp + 1));
   // Print the name of the file for which request is made.
   
   // Read the requested file content from file system
   fs.readFile(pathname.substr(1), function (err, data) {
      if (err) {
         // HTTP Status: 404 : NOT FOUND
         // Content Type: text/plain
         response.writeHead(404, {'Content-Type': 'text/html'});
      }else {	
         //Page found	  
         // HTTP Status: 200 : OK
         // Content Type: text/plain
         if (extension === 'html') response.writeHeader(200, {"Content-Type": 'text/html'});
         else if (extension === 'css') response.writeHeader(200, {"Content-Type": 'text/css'});
          else if (extension === 'png') response.writeHeader(200, {"Content-Type": 'image/png'});
         // Write the content of the file to response body
         response.write(data.toString());		
      }
      // Send the response body 
      response.end();
   });   
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');