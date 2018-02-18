// imports

const express = require('express');
const template = require('express-handlebars');
const path = require('path');
const parser = require('body-parser');
const override = require('method-override');
const redis = require('redis');

// creating a Redis Client and connecting to it

const server = redis.createClient();

server.on('connect', function() {

  console.log('Connected to redis ...');

});



// setting up the express

const application = express();

// setting up the template engiine

application.engine('handlebars', template({
  defaultLayout: 'main'
}));
application.set('view engine', 'handlebars');

// Middleware

application.use(parser.json());
application.use(parser.urlencoded({
  extended: false
}));
application.use(override('_MET'));


application.get('/', function(request, response, nextMW) {

  response.render('searchfeature');

});

application.get('/user/add', function(request, response, nextMW) {

  response.render('addfeature');

});


application.post('/user/search', function(request, response, nextMW) {

  var id = request.body.id;

  server.hgetall(id, function(err, object) {

    if (!object) {

      response.render('searchfeature', {

        error: 'this user does not exist'

      });

    } else {

      object.id = id;

      response.render('detailspage', {

        user: object

      })

    }

  });

});

application.post('/user/add', function(request, response, nextMW) {

  var id = request.body.id;
  var first_name = request.body.first_name;
  var last_name = request.body.last_name;
  var email = request.body.email;
  var so_link = request.body.so_link;
  var github_link = request.body.github_link;

  server.hmset(id, [

    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'so_link', so_link,
    'github_link', github_link

  ], function name(err, res) {

    if (err) {

      console.log(err);

    } else {

      console.log(res);
      response.redirect('/');

    }


  });

});

application.delete('/user/delete/:id', function(request, response, nextMW) {

  server.del(request.params.id);
  response.redirect('/');



});


// setting up the port

application.listen(process.env.port || 5500, function() {

  console.log('listening to port 5500');

});