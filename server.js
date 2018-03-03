var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/express-todo');
var Note = require('./app/models/note.js');
var User = require('./app/models/users.js');

var jwt = require('jsonwebtoken');

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'TheMeaningOfLiveIs42';

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  User.findOne({'login': jwt_payload.username}, function(err, user) {
    if (err) {
      next(null, false);
    }
    if (!user) {
      next(null, false);
    }
    next(null, user);
  });
});

passport.use(strategy);

app.use(passport.initialize());

var roleVerify = function(role) {
  return function(req, res, next) {
    passport.authenticate('jwt', function(err, user, info) {
      if(user.role != role) {
        return res.status(403).json({message:"access denied"});
      }
      next();
    })(req, res, next);
  }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();
router.post("/login", function(req, res) {

  User.findOne({'login': req.body.username, 'password': req.body.password}, function(err, user) {
    if(err) {
      return res.send(err);
    }

    if(!user) {
      return res.status(401).json({message:"no such user found"});
    }

    let payload = {
      username: user.login,
      role: user.role,
    };
    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({message: "ok", token: token});
  });  
});

router.get('/', function(req, res) {
  res.json({ message: 'hooray! welcome to our api!' });   
});

router.route('/users')
.post(function(req, res) {
  var user = new User();
  user.login = req.body.login;
  if (req.body.name) {
    user.name = req.body.name;  
  } else {
    user.name = user.login;
  }

  user.save(function(err) {
    if (err) {
      return res.send(err);
    }
    res.json({ message: 'user created!' });
  });
})
.get(function(req, res) {
  User.find(function(err, users) {
    if (err) {
      return res.send(err);
    }
    res.json(users);
  });
});

router.route('/users/:username')
.get(function(req, res) {
  res.json(req.params.username);
})
.put(function(req, res) {
  if (req.body.name) {
    req.params.username.name = req.body.name;  
  }
  if (req.body.password) {
    req.params.username.password = req.body.password;  
  }
  if (req.body.role) {
    req.params.username.role = req.body.role;  
  }
  req.params.username.save(function(err) {
    if (err) {
      return res.send(err);
    }
    res.json({ message: 'User updated!' });
  });
})
.delete(function(req, res) {
  req.params.username.remove({
    login: req.params.username
  }, function(err, user) {
    if (err) {
      return res.send(err);
    }
    res.json({ message: 'Successfully deleted' });
  });
});

router.route('/users/:username/notes')
  .post(function(req, res) {
    var note = new Note();
    note.title = req.body.title;
    note.body = req.body.body;
    note.login = req.params.username.login;

    note.save(function(err) {
      if (err) {
        return res.send(err);
      }
      res.json({ message: 'note created!' });
    });
  })
  .get(function(req, res) {
    Note.find({login: req.params.username.login},function(err, notes) {
      if (err) {
        return res.send(err);
      }
      res.json(notes);
    });
  });

router.route('/users/:username/notes/:note_id')
  .get(function(req, res) {
    Note.findOne({
      login: req.params.username.login,
      _id: req.params.note_id
    }, function(err, note) {
      if (err) {
        return res.send(err);
      }
      res.json(note);
    });
  })
  .put(function(req, res) {
    Note.findOne({
      login: req.params.username.login,
      _id: req.params.note_id
    }, function(err, note) {
      if (err) {
        return res.send(err);
      }
      if (req.body.title) {
        note.title = req.body.title;  
      }
      if (req.body.body) {
        note.body = req.body.body;  
      }
      note.save(function(err) {
        if (err) {
          return res.send(err);
        }
        res.json({ message: 'Note updated!' });
      });
    });
  })
  .delete(function(req, res) {
    Note.remove({
      login: req.params.username.login,
      _id: req.params.note_id
    } , function(err, note) {
      if (err) {
        return res.send(err);
      }
      res.json({ message: 'Successfully deleted' });
    });
  });


  router.param('username', function(req, res, next, username) {
    User.findOne({'login': req.params.username}, function(err, user) {
      if (err) {
        return res.send(new Error('No such user'));
      }
      if (!user) {
        return res.status('404').send(new Error('No such user'));
      }
      req.params.username = user;
      next();
    });

  });

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
