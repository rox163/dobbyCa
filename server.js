var http = require('http');
var jade = require('connect-jade-html');
var connect = require('connect');


var server = connect.createServer(
    // stylus.middleware({
    //     src: __dirname + '/css'
    //   , dest: __dirname + '/public'
    // }),
    jade({
        src : __dirname,
        dest: __dirname + '/public'
    }),
    connect.static(__dirname + '/public'),
    function (request, response, next) {
        next();
	}
).listen(1337);

console.log('Server running at http://127.0.0.1:1337/');

// stylus.middleware({
//     src: __dirname
//   , dest: __dirname + '/public'
// }),