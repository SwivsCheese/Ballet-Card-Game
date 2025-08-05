const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
require('dotenv').config();

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });
console.log('please');

const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
console.log("BRO AINT NO WAY.");
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const userCredSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: String,
  backOfCard: String,
  enemyBorder: String,
  playerBorder: String,
  attackHighlightFrom: String,
  attackHighlightTo: String,
  movementHighlightFrom: String,
  movementHighlightTo: String
});

const imageSchema = new mongoose.Schema({
  filename: String,
  mimetype: String,
  data: Buffer
});

const deckSchema = new mongoose.Schema({
  images: [imageSchema],
  cardDeck: mongoose.Schema.Types.Mixed
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  currentDeck: { type: String, required: true },
  decks: {
    type: Map,
    of: deckSchema,
    default: {}
  }
});

const bcrypt = require('bcrypt');
//const { hash } = require('crypto');
/*
const db = client.db("CardGame");
const searcher = db.collection("U/P");
const decks = db.collection("CardDecks"); // validate and sanitize pictures
*/
const UserCredentials = mongoose.model('UserCredentials', userCredSchema, 'U/P');
const User = mongoose.model('User', userSchema, 'CardDecks');

const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json({ limit: '50mb' }));

app.use(session({
  secret: 'process.env.SESSION_SECRET',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true // Prevents client-side JavaScript from accessing the cookie
  }
}));

app.get('/', async (req, res) => {
  console.log('/req.session', req.session);
  console.log('/req.session.id', req.session.id);
  console.log(req.session.username);
  req.session.visited = true;
  console.log('---------------hey there-----------------');

  if(req.session.username){
    res.sendFile(__dirname + '/home.html');
    return;
  }
  /*
  const user = await User.findOne({ username: "seeth" });
  console.log(user.decks);
  */

  res.sendFile(__dirname + '/index.html');
});

app.get('/home', (req, res) => {
  console.log('home req.session', req.session);
  console.log('home req.session.id', req.session.id);
  console.log('home', req.session.username);
  req.sessionStore.get(req.session.id, (err, session) => {
    if(err){
      console.error('Error retrieving session:', err);
      throw err;
    }
    console.log('home Session data:', session);
  });
  res.sendFile(__dirname + '/home.html');

});

app.get('/play', (req, res) => {
  console.log('play req.session', req.session);
  console.log('play', req.session.username);
  console.log('play req.session.id', req.session.id);
  res.sendFile(__dirname + '/play.html');
});

app.get('/customize', (req, res) => {
  console.log('customize req.session', req.session);
  console.log('customize', req.session.username);
  console.log('customize req.session.id', req.session.id);
  res.sendFile(__dirname + '/customize.html');
});

app.get('/createDeck', (req, res) => {
  console.log('customize', req.session.username);
  res.sendFile(__dirname + '/createDeck.html');
});

app.post('/api/create-deck', upload.any(), async (req, res) => {
  //console.log(req.files);
  try{
    const username = req.session.username;
    const user = await User.findOne({ username: username });

    if(!user){
      return res.status(404).send("user not found");
    }

    let images = [];
    const cardDeckJSON = req.body.cardDeck;
    const deckName = req.body.deckName;
    const cardDeck = JSON.parse(cardDeckJSON);

    console.log("DECKNAME, CARDDECK", req.body.deckName, cardDeck);

    for(const file of req.files){
      console.log("FILES", file);
      images.push({
        filename: file.originalname,
        mimetype: file.mimetype,
        data: file.buffer
      });
    }

    /*
    await User.updateOne(
      { username: username },
      {
        $set: {
          [`decks.${deckName}`]: {
            images: images,
            cardDeck: cardDeck
          }
        }
      }
    );
    */

    user.decks.set(deckName, {
      images: images,
      cardDeck: cardDeck
    });

    await user.save();
    //console.log("USER!!!!", user);
    res.send('deck uploadeddd');

  }
  catch(error){
    console.log(error);
  }
});

app.post('/api/select-deck', async (req, res) => {
  try{
    const username = req.session.username;
    const user = await User.updateOne({ username: username }, {
      $set: {
        currentDeck: req.body.nameOfDeck
      }
    });

    //await user.save();
    //console.log(user);

    res.status(201).json({ message: 'Data inserted successfully' });
  }
  catch(error){

  }
})

app.get('/api/use-custom-deck', async (req, res) => {
  // use in play.js
  /*

  okay, going with this solution of using base64 cuz the person should only have
  ~60 cards. i will have to monitor their card size and maybe make it a requirement
  that they can only use webp files or they have to make the size of their images
  a certain value. maybe below a specific limit too? idk i'll think about it

  */
  const username = req.session.username;
  const user = await User.findOne({ username: username });
  if(!user){
    res.json(null);
    return;
  }
  console.log("THIS THE USER", user);
  const nameOfDeck = user.decks.get(user.currentDeck);

  if(!nameOfDeck || !Array.isArray(nameOfDeck.images)){
    console.error('Deck data or deck images are missing');
    console.log('ermm, what the sigma?');
    return;
  }

  const alteredDeckBase64 = {
    ...nameOfDeck,
    images: nameOfDeck.images.map((img) => {
      const base64 = Buffer.from(img.data.buffer).toString('base64');
      return {
        filename: img.filename,
        mimetype: img.mimetype,
        src: `data:${img.mimetype};base64,${base64}`
      };
    })
  };
  //console.log(alteredDeckBase64, "ALTERED DECK BASE 64");
  res.json(alteredDeckBase64)

  // so this will get their username, the deck they have and then that's it

});

app.get('/api/get-deck-names', async (req, res) => {
  const username = req.session.username;
  const user = await User.findOne({ username: username });

  const allNames = Array.from(user.decks.keys());
  console.log("WITHIN GET-DECK-NAMES", allNames);

  res.json(allNames);
});

app.get('/api/customize-data', async (req, res) => {
  const username = req.session.username;
  const searched = await UserCredentials.findOne({ username: username })
  console.log('searched', searched);
  let customizationData;
  if(searched){
    customizationData = {
      backOfCard: searched.backOfCard,
      enemyBorder: searched.enemyBorder,
      playerBorder: searched.playerBorder,
      attackHighlightFrom: searched.attackHighlightFrom,
      attackHighlightTo: searched.attackHighlightTo,
      movementHighlightFrom: searched.movementHighlightFrom,
      movementHighlightTo: searched.movementHighlightTo,
    }
    console.log("SEARCHED IS REAL:", searched, customizationData);
  }
  else{
    customizationData = {
      backOfCard: "#00b890",
      enemyBorder: "#fca1ff",
      playerBorder: "#a1f1ff",
      attackHighlightFrom: "#ff2727",
      attackHighlightTo: "#ff2756",
      movementHighlightFrom: "#ffff00",
      movementHighlightTo: "#ffa500"
    }
  }
  
  console.log(customizationData);
  res.json(customizationData);
});
//meek
/*
app.post('/login', async (req, res) => {
  try{
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });

    if(!user){
      return;
    }

    const match = await verifyPassword(password, user.password);
    //console.log(user);
    if(match){
      console.log('Password is correct');
      req.session.username = username; // Store username in session
      console.log(req.session.username);
      res.status(200).json({ message: 'Login successful' }).send(username);
    }
    else{
      console.log('Password is incorrect');
      res.status(401).json({ message: 'Login failed' });
    }
    // then move them to other part of website when logged in

  }
  catch(error){
    console.log(error);
  }
  console.log('login req.session', req.session);
  console.log('login req.session.id', req.session.id);
});
*/

app.post('/login', async (req, res) => {
  try{
    const { username, password } = req.body;

    const user = await UserCredentials.findOne({ username }); // use the correct model
    if(!user){
      console.log('User not found');
      return res.status(401).json({ message: 'Login failed' });
    }

    const match = await verifyPassword(password, user.password);
    if(match){
      console.log('Password is correct');
      req.session.username = username;
      console.log(req.session.username);
      res.status(200).json({ message: 'Login successful' });
    }
    else{
      console.log('Password is incorrect');
      res.status(401).json({ message: 'Login failed' });
    }
  }
  catch(error){
    console.log(error);
    res.status(500).json({ message: 'Server error during login' });
  }

  console.log('login req.session', req.session);
  console.log('login req.session.id', req.session.id);
});

app.post('/signup', async (req, res) => {
  // if username already exists don't allow them to create account
  console.log('signup req.session', req.session);
  console.log('signup req.session.id', req.session.id);
  try{
    const { username, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const result = new UserCredentials({
      username: username, 
      password: hashedPassword,
      backOfCard: "#00b890",
      enemyBorder: "#fca1ff",
      playerBorder: "#a1f1ff",
      attackHighlightFrom: "#ff2727",
      attackHighlightTo: "#ff2756",
      movementHighlightFrom: "#ffff00",
      movementHighlightTo: "#ffa500",
    });
    console.log("THIS THE RESULT", result)
    await result.save();
    const otherOne = new User({
      username: username,
      currentDeck: 'Classic',
      decks: new Map()
    });
    await otherOne.save();
    console.log("THIS THE OTHERONE", otherOne);
    res.status(201).json({ message: 'Data inserted successfully', userId: result._id, decksId: otherOne._id });

  }
  catch(error){
    console.log(error);
  }
});

app.post('/save-customization', async (req, res) => {
  console.log(req.session.username);
  try{
    const {backOfCard, enemyBorder, playerBorder, attackHighlightFrom, attackHighlightTo, movementHighlightFrom, movementHighlightTo} = req.body;
    console.log("SAVECUSTOM", backOfCard);

    if(!req.session.username){
      // redirect to login webpage
      return;
    }

    // okay well replace all of them
    // so now insert all of req.body
    const result = await UserCredentials.updateOne({ username: req.session.username }, {
      $set: {
        backOfCard: backOfCard,
        enemyBorder: enemyBorder,
        playerBorder: playerBorder,
        attackHighlightFrom: attackHighlightFrom,
        attackHighlightTo: attackHighlightTo,
        movementHighlightFrom: movementHighlightFrom,
        movementHighlightTo: movementHighlightTo
      }
    });

    if(result.modifiedCount === 0){
      return res.status(404).json({ message: "data unchanged man." })
    }

    console.log(result);
    res.status(200).json({ message: 'customization updated successfully' });

  }
  catch(error){
    console.log(error);
    res.status(500).json({ message: 'something went wrong, try again' });
  }
});

app.post('/reset-customization', async (req, res) => {
  console.log(req.session.username);
  try{
    const { backOfCard, enemyBorder, playerBorder, attackHighlightFrom, attackHighlightTo, movementHighlightFrom, movementHighlightTo } = req.body;
    console.log("RESET CUSTOMIZATION", backOfCard);

    if(!req.session.username){
      // redirect to login webpage
      return;
    }

    const result = await UserCredentials.updateOne({ username: req.session.username }, {
      $set: {
        backOfCard: backOfCard,
        enemyBorder: enemyBorder,
        playerBorder: playerBorder,
        attackHighlightFrom: attackHighlightFrom,
        attackHighlightTo: attackHighlightTo,
        movementHighlightFrom: movementHighlightFrom,
        movementHighlightTo: movementHighlightTo
      }
    });

    if(result.modifiedCount === 0){
      return res.status(404).json({ message: "data unchanged man." })
    }

    console.log(result);
    res.status(200).json({ message: 'customization updated successfully' });

  }
  catch(error){
    console.log(error);
  }
});

const players = {};

const rooms = {};

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected`);
  //console.log('a user connected');
  players[socket.id] = {

  }

  socket.on("join-room", (room) => {
    if(!rooms[room]){
      rooms[room] = [];
    }
    console.log('this is the room,man: ', room, rooms[room], rooms[room].length);

    if(rooms[room].length >= 2) return;

    if(!rooms[room].includes(socket.id)){
      rooms[room].push(socket.id);
    }
    console.log('this is the room,man2: ', room, rooms[room], rooms[room].length);

    socket.join(room);
    console.log(`user ${socket.id} joined room ${room}`);

    const playerNum = rooms[room].length;
    socket.emit("player-assigned", { player: playerNum });
    console.log('PLAYER NUMBER', playerNum);

    if(rooms[room].length === 2){
      console.log(`${room} FULL STARTING GAME`, rooms[room]);
      io.to(room).emit("start-game", room);
    }

    else{
      socket.emit("waiting");
    }
   console.log('PLAYERS IN ROOM', rooms[room]);

  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket ${socket.id} disconnected:`, reason);

    const room = socket.data.room;
    if(room && rooms[room]){
      rooms[room] = rooms[room].filter(id => id !== socket.id);
      if(rooms[room].length === 0){
        delete rooms[room];
        console.log(`Room ${room} deleted`);
      }
    }

    delete players[socket.id];
    io.emit('updatePlayers', players);
  });

  socket.on('card-moved', (element) => {
    console.log('card moved', element);
    socket.to(element.roomid).emit('recieve-movement', element);
    //console.log(element);
  });

  socket.on('hand1Draw', (room) => {
    console.log('ROOM ID', room);
    socket.to(room.roomid).emit('recieve-draw1', "./cards/images/blueback.png")
  });

  socket.on('hand2Draw', (room) => {
    //console.log(room);
    socket.to(room.roomid).emit('recieve-draw2');
  });

  socket.on('start-game', (room) => {
    socket.to(room.roomid).emit('recieved-start-game', room);
  });

  socket.on('attacked', (card) => {
    socket.to(card.roomid).emit('recieved-attack', card)
  });

  socket.on('remove-card', (card) => {
    socket.to(card.roomid).emit('recieved-remove', card);
  });

  socket.on('update-turn', (turn) => {
    socket.to(turn.roomid).emit('recieved-turn', turn);
  });

  socket.on('show-hand', (elem) => {
    socket.to(elem.roomid).emit('recieved-show-hand', elem);
  });

  socket.on('send-hand', (elem) => {
    console.log(elem);
    socket.to(elem.roomid).emit('recieved-hand', elem);
  });

  socket.on('movement-status', (elem) => {
    socket.to(elem.roomid).emit('recieved-movement-status', elem);
  });

  socket.on('update-gameObj', (elem) => {
    socket.to(elem.roomid).emit('recieved-update-gameObj', elem);
  });

  socket.on('mana-card', (elem) => {
    socket.to(elem.roomid).emit('update-mana', elem);
  });

  socket.on('flip-card', (elem) => {
    socket.to(elem.roomid).emit('recieved-flip-card', elem);
  });

  socket.on('ability-attack', (elem) => {
    socket.to(elem.roomid).emit('recieved-ability-attack', elem)
  });

  socket.on('ability-done', (elem) => {
    socket.to(elem.roomid).emit('recieved-ability-done', elem)
  });

  socket.on('ability-remove', (elem) => {
    socket.to(elem.roomid).emit('recieved-ability-remove', elem)
  });

  socket.on('knocked-ability-status', (elem) => {
    socket.to(elem.roomid).emit('recieved-knocked-ability-status', elem);
  });

  socket.on('knocked-ability', (elem) => {
    socket.to(elem.roomid).emit('update-knocked-ability', elem);
  });

  socket.on('turn-event', (elem) => {
    socket.to(elem.roomid).emit('recieved-turn-event', elem);
  });

  socket.on('game-over', (elem) => {
    socket.to(elem.roomid).emit('recieved-game-over', elem);
  });

  socket.on('update-attack', (elem) => {
    socket.to(elem.roomid).emit('recieved-update-attack', elem);
  });

  socket.on('show-opp-card', (elem) => {
    socket.to(elem.roomid).emit('recieved-show-opp-card', elem);
  });

  socket.on('send-card', (elem) => {
    socket.to(elem.roomid).emit('recieved-send-card', elem);
  });

  socket.on('steal-card-animate', (elem) => {
    socket.to(elem.roomid).emit('recieved-steal-card-animate', elem);
  });

  socket.on('card-moved-of-cardid', (element) => {
    socket.to(element.roomid).emit('recieved-movement-of-cardid', element);
  });

  socket.on('ability-fog', (elem) => {
    socket.to(elem.roomid).emit('recieved-ability-fog', elem);
  });

  socket.on('fog-removed', (elem) => {
    socket.to(elem.roomid).emit('recieved-fog-removed', elem);
  });

  socket.on('out-of-fog', (elem) => {
    socket.to(elem.roomid).emit('recieved-out-of-fog', elem);
  });

  socket.on('in-the-fog', (elem) => {
    socket.to(elem.roomid).emit('recieved-in-the-fog', elem);
  });

  socket.on('no-placement', (elem) => {
    socket.to(elem.roomid).emit('recieved-no-placement', elem);
  });

  socket.on('is-card-here', (elem) => {
    socket.to(elem.roomid).emit('recieved-is-card-here', elem);
  });

  socket.on('ability-blow-up', (elem) => {
    socket.to(elem.roomid).emit('recieved-ability-blow-up', elem);
  });


  console.log('players', players);
});

mongoose.connect(process.env.MONGODB_URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  server.listen(port, () => {
    console.log(`Server: ${port}`);
  });
});


async function hashPassword(password){
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function verifyPassword(password, hashedPassword){
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}
