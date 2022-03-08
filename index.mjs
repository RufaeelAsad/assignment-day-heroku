import express, { response } from 'express';
import cors from "cors";
import mongoose from 'mongoose';



const app = express()
app.use(express.json())
app.use(cors());


let dbURI = "mongodb+srv://dbUser:1234@cluster0.a13y6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";


mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {//connected
    console.log("Mongoose is connected");
    // process.exit(1);
});

mongoose.connection.on('disconnected', function () {
    console.log("Mongoose is disconnected");
    process.exit(1);
});

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ', err);
    process.exit(1);
});

process.on('SIGINT', function () {
    console.log("app is terminating");
    mongoose.connection.close(function () {
        console.log('Mongoose default connection closed');
        process.exit(0);
    });
});

const postSchema = new mongoose.Schema({
    "text": String,
    "cretedOn": {type: Date, default: Date.now}
});

const Post = mongoose.model('Post', postSchema);

app.get('/post/:id', (req, res) => {
    Post.findOne({ _id: req.params.id }, (err, data) => {
        if (!err) {
            res.send(data);
        } else {
            res.status(500).send("something went wrong")
        }
    })
})

app.get('/posts', (req, res) => {
    Post.find({}, (err, data) => {
        if (!err) {
            res.send(data);
        } else {
            res.status(500).send("something went wrong")
        }
    })
})




app.post('/post', (req, res) => {

    if (!req.body.text || req.body.text.length > 200) {
        res.status(400).send(`text is required in json body (max 200 chars), e.g: { "text" : "what is in your mind" }`);
        return;
    }

    let newPost = new Post({
        text: req.body.text
    });

    newPost.save((err, saved) => {
        if (!err) {
            res.send("your post is saved 🥳");
        } else {
            res.status(500).send("some thing went wrong, please try later");
        }
    })
})


app.put('/post/:id', (req, res) => {

    Post.findOneAndUpdate(
        { _id: req.params.id },
        { text: req.body.text },
        {},
        (err, data) => {
            if (!err) {
                res.send("updated");
            } else {
                res.status(500).send("something went wrong")
            }
        }
    );
})

app.delete('/post/:id', (req, res) => {
    Post.deleteOne(
        { _id: req.params.id },
        {},
        (err, data) => {
            if (!err) {
                res.send("deleted")
            } else {
                res.status(500).send("something went wrong")
            }
        });
})

 
app.listen(3000, () => {
    console.log(`Hello server is listening at http://localhost:3000}`)
})