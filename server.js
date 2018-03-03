var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/express-todo');
var Note = require('./app/models/note.js');
var User = require('./app/models/users.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();
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
    for (let user of users){
      delete user.password;
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
      delete user.password;
      req.params.username = user;
      next();
    });

  });

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
