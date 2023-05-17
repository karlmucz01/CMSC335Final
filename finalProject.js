// required modules
const {MongoClient, ServerApiVersion} = require('mongodb');
const bodyParser = require('body-parser');
const express = require("express");
const env = require('dotenv');
const path = require('path');
// const fetch = require("node-fetch");

// global level variable declarations
// const password = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = {db:"finalProject", collection:"users"};
const app = express();
const port = 8888;
env.config({path: path.resolve(__dirname, 'creds/.env')});
const uri = `mongodb+srv://dbUser:J8DXi3NDOLD3XKDr@summercampcmsc335.pb5l18w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname + '/public'));

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

// async function testConnection() {
//     try {
//         // Connect the client to the server	(optional starting in v4.7)
//         await client.connect();
//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//       } finally {
//         // Ensures that the client will close when you finish/error
//         await client.close();
//       }
// }

async function insertUser(appUser, appPass) {
    try {
        await client.connect();
        const userInfo = {user:appUser, pass:appPass};
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(userInfo);
        console.log(`Database entry created with ID: ${result.insertedId}`);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function lookupUser(appUser, appPass) {
    let foundUser;
    try {
        await client.connect();
        const filter = {user: appUser, pass: appPass};
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne(filter);
        if (result) {
            foundUser = result;
        } else {
            foundUser = undefined;
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return foundUser;
}

app.get("/", (request, response) => {
    response.render("index");
});

app.get("/index", (request, response) => {
    response.render("index");
});

app.get("/signUp", (request, response) => {
    response.render("signUp");
});

app.post("/signUp", (request, response) => {
    const u = request.body.username;
    const p = request.body.password;
    const variables = {user: u};
    response.render("signUpConfirmation", variables);
    insertUser(u, p);
});

app.get("/login", (request, response) => {
    response.render("login");
});

app.post("/login", (request, response) => {
    const u = request.body.username;
    const p = request.body.password;
    const variables = {user: u};
    (async () => {
        const x = await lookupUser(u, p);
        if (x) {
            response.render("loginSuccessful", variables);
        } else {
            response.render("loginUnsuccessful");
        }
    })();
});

app.get("/api", (request, response) => {
    response.render("api");
});

app.post("/api", (request, response) => {
    const word = request.body.word;
    const url = `https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '3ffb5a0b77msh2f11eaaf43296f1p1e77c6jsnef46c3711d06',
            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
    };
    let definitions = "";
    try {
        (async () => {
            await fetch(url, options)
                .then((res) => res.json())
                .then((data) => {
                    for (const d of data.definitions) {
                        definitions += `<li> <strong>Definition</strong>: ${d.definition}. <strong>Part of Speech</strong>: ${d.partOfSpeech}</li>`;
                    }
                    response.render("apiResult", {defs:definitions});
                });
        })();
    } catch (e) {
        console.log(error);
    }
});

app.listen(port);
promptCmd();
