/*
Startup
*/
const express = require('express'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      path = require('path'),
      app = express();

app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect('mongodb://localhost/message_board');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));

var Schema = mongoose.Schema;
//define MessageSchema
var MessageSchema = new mongoose.Schema({
    mess_text: {type: String, required: [true, 'A message is required.']},
    user: {type: String, required: [true, 'Your name is required.']},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});
//define CommentSchema
var CommentSchema = new mongoose.Schema({
    comm_text: {type: String, required: [true, 'A comment is required.']},
    user: {type: String, required: [true, 'Your name is required.']},
    _message: {type: Schema.Types.ObjectId, ref: 'Message'}
})
//set models to schemas
mongoose.model('Message', MessageSchema);
mongoose.model('Comment', CommentSchema)
//store models in variables
var Message = mongoose.model('Message');
var Comment = mongoose.model('Comment');
//get promises
mongoose.Promise = global.Promise;
// Set View Engine to EJS
app.set('view engine', 'ejs');

/*
Routes
*/
// Root Request
app.get('/', function(req, res) {
    Message.find({})
        .populate('comments')
        .exec(function(err, messages){
            if (err) {
                console.log('error adding comment');
                res.render('index', {title: 'you have errors!', errors: user.err});
            } else {
                if (messages.length == 0){
                    res.render('index', {errs: [{message: 'No messages to display. Be the first to write one!'}]});
                } else {
                    res.render('index', {messages: messages})
                }
            }
        });
});
//add new message
app.post('/message/new', function(req, res){
    // var message = new Message({user: req.body.name, mess_text: req.body.message});
    var message = new Message(req.body);
    message.save(function(err){
        if (err) {
            console.log('error adding message');
            res.redirect('/');
        } else {
            console.log('message added');
            res.redirect('/');
        }
    });
});
//add new comment
app.post('/comment/new/:id', function(req,res){
    Message.findOne({_id: req.params.id}, function(err, message){
        var comment = new Comment(req.body);
        comment._message = message.id;
        message.comments.push(comment);
        comment.save(function(err){
            message.save(function(err){
                if (err) { console.log('error');}
                else { res.redirect('/')}
            })
        });
    });
});


// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})
