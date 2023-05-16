// required modules
const {MongoClient, ServerApiVersion} = require('mongodb');
const cookieParser = require('cookie-parser');
const queryString = require('querystring');
const bodyParser = require('body-parser');
const express = require("express");
const request = require('request');
const env = require('dotenv');
const path = require('path');
const cors = require('cors');

// global level variable declarations
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const database = process.env.MONGO_DB_DATABASE;
const collection = process.env.MONGO_DB_COLLECTION;
const app = express();
const port = 8888;
const client_id = 'e234fa038b8c405e9bd94f812ec0a33c';
const client_secret = '33343a3d512d4f52b2358be1c8d58ae3';
const redirect_uri = `http://localhost:${port}`;
const stateKey = 'spotify_auth_state';
env.config({path: path.resolve(__dirname, 'creds/.env')});
const uri = `mongodb+srv://${userName}:${password}@summercampcmsc335.pb5l18w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


function shutdown() {
    process.stdout.write('Shutting down server...\n');
    process.exit(0);
}

function promptCmd() {
    const stopInfo = "Stop to shutdown the server: ";
    process.stdout.write(`Web server started and running at http://localhost:${port}\n`);
    process.stdin.setEncoding("utf-8");

    process.stdout.write(stopInfo);
    process.stdin.on("readable", function () {
        let dataInput = process.stdin.read();
        if (dataInput !== null) {
            let command = dataInput.trim();
            if (command === "stop") {
                shutdown();
            } else {
                process.stdout.write(`Invalid command: ${command}\n`);
                process.stdout.write(stopInfo);
            }
        }
        process.stdin.resume();
    });
}

function genRandString(length) {
    var text = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * characters.length));
    }
    return text;
}

app.get("/", (request, response) => {
    response.render("index");
});

app.get("/index", (request, response) => {
    response.render("index");
});



app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}))
   .use(cors())
   .use(cookieParser());

app.listen(port);
promptCmd();
