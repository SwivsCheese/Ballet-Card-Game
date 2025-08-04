const socket = io();
const params = new URLSearchParams(window.location.search);
const room = params.get("room");

// newPlayer, newPlayer

//console.log("JOINED ROOM", room);
socket.emit("join-room", room);

let backOfCardColor;
let enemyBorderColor;
let playerBorderColor;
let attackHighlightFromColor;
let attackHighlightToColor;
let movementHighlightFromColor;
let movementHighlightToColor;

let customPlayerDeck;
let customDeck;
let customDeck2;

const waitingForOpponent = document.getElementById("waiting-for-opponent");
waitingForOpponent.style.display = "block";

document.addEventListener("DOMContentLoaded", async () => {
  Promise.all([
    fetch('/api/customize-data').then(res => res.json()),
    fetch('/api/use-custom-deck').then(res => res.json())
  ])
  .then(([customizeData, customDeckData]) => {
    backOfCardColor = customizeData.backOfCard;
    enemyBorderColor = customizeData.enemyBorder;
    playerBorderColor = customizeData.playerBorder;
    attackHighlightFromColor = customizeData.attackHighlightFrom;
    attackHighlightToColor = customizeData.attackHighlightTo;
    movementHighlightFromColor = customizeData.movementHighlightFrom;
    movementHighlightToColor = customizeData.movementHighlightTo;

    updateGlowKeyframes();
    updateGlowRedKeyframes();

    console.log(customDeckData, "CUSTOM DECK DATA");

    if(customDeckData !== null){
      customPlayerDeck = customDeckData.$__parent.decks[customDeckData.$__parent.currentDeck].cardDeck;
      const objectOfObjects = customDeckData.images.reduce((acc, cur) => {
        acc[cur.filename] = cur;
        return acc;
      }, {});

      customPlayerDeck.forEach((card) => {
        card.image = objectOfObjects[card.image]?.src;
      });
    }

    if(window.playerNumber == 1){
      customDeck2 = customPlayerDeck || customDeckImport;
      customDeck2.sort(() => Math.random() - 0.5);
    }
    else{
      customDeck = customPlayerDeck || customDeckImport2;
      customDeck.sort(() => Math.random() - 0.5);
      socket.emit('start-game', { roomid: room });
      waitingForOpponent.style.display = "none";
    }
  })
  .catch(err => {
    console.error('Error fetching data:', err);
  });
});

//import Card from "./classes/card.js";
import customDeckImport from "./cards/deck1.js";
import customDeckImport2 from "./cards/deck2.js";
import dirtBlock1 from "./cards/dirtblock1.js";
import dirtBlock2 from "./cards/dirtblock2.js";

const gayarea = document.getElementById('game-area');

let cardDeck1 = document.getElementById("cardArea1");
let cardDeck2 = document.getElementById("cardArea2");
const hand1 = document.getElementById("hand1");
const hand2 = document.getElementById("hand2");
let entire = document.getElementById("entire-card");
let entirename = document.getElementById("entire-name");
let entireimage = document.getElementById("entire-image");
let entirehealth = document.getElementById("entire-health");
let entireattack = document.getElementById("entire-attack");
let entiremana = document.getElementById("entire-mana");
let entiremovement = document.getElementById("entire-movement");
let entiredescription = document.getElementById("entire-description");
let yourTurn = document.getElementById("all-actions");
const actionButtons = document.getElementById("action-buttons");
const turnEvents = document.getElementById("stuff-happening");


const attackButton = document.getElementById("action-button");
const abilityButton = document.getElementById("ability-button");
const attatchedButton = document.getElementById("attatched-button");
const endTurn = document.getElementById('end-turn');

var modal = document.getElementById("myModal");
var seekplacement = document.getElementById("seek-placement");
let closemodal = document.getElementById("close-modal")
const endGameModal = document.getElementById("end-game-modal");
const closeEndModal = document.getElementById("close-end-modal");


const styleTag = document.createElement('style');
document.head.appendChild(styleTag);
const styleTag2 = document.createElement('style');
document.head.appendChild(styleTag2);

let alreadyDrew = 1;
let turnCounter = 1;
let isFog = false;

const actionsObj = {
  deployers: [],
  movementers: [],
  attackers: [],
  abilities: [],
};

let fogSquares = [];
// this will be used for if opp steps on square that is fogged & has an enemy card in it

let selectedCard = null;
let attackedCard = null;

let playerassigned = false;

let isDragging = false;
let offsetX, offsetY;
const firstHand = [];
const secondHand = [];

let player1Turn = true;
let whosTurn;

const actionQ = [];
let processingQ = false;

let hoverTimeout;

const gameObj = {};
let deadCards = [];

// this will be used for necromancer card thing
const alive = {};
const dead = {};

yourTurn.textContent = "Your Turn!";

function generateBoard(playerNum){
  const boarder = document.getElementById("board");
  boarder.innerHTML = "";
  const rows = 7;
  const cols = 7;

  for(let r=0; r<rows; r++){
    const actualRow = playerNum === 1 ? rows - 1 - r : r;
    const rowDiv = document.createElement("div");
    rowDiv.className = "cellContainer";

    for(let c=0; c<cols; c++){

      const actualCol = playerNum === 1 ? cols - 1 - c : c;
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `${actualRow + 1},${actualCol + 1}`;
      cell.style.backgroundColor = (actualRow + actualCol) % 2 === 0 ? "rgb(181, 136, 99)" : "rgb(240, 217, 181)";
      rowDiv.appendChild(cell);

    }
    boarder.appendChild(rowDiv);
  }
  importantSquares();
}

function importantSquares(){

  const squares = document.querySelectorAll(".cell");

  squares.forEach(square => {
    square.addEventListener("dragover", allowDrop);
    square.addEventListener("drop", drop);
    square.addEventListener("mouseover", handleCardMouseOver);
  });
  const dirt1 = document.getElementById('1,4');
  const dirt2 = document.getElementById('7,4');

  const dirty1 = document.createElement("div");
  const dirty1img = document.createElement("img");

  dirty1.className = "card";
  dirty1.id = `p1${dirtBlock1.name}`;
  dirty1img.src = dirtBlock1.image;
  dirty1img.style.width = "100%";
  dirty1img.style.height = "100%";
  dirty1.append(dirty1img);

  dirty1.setAttribute('data-health', dirtBlock1.health);
  dirty1.setAttribute('data-attack', dirtBlock1.attack);
  dirty1.setAttribute('data-mana', dirtBlock1.mana);
  dirty1.setAttribute('data-movement', dirtBlock1.movement);
  dirty1.setAttribute('data-placed', true);

  dirty1.addEventListener("mouseover", (e) => {
    entirename.textContent = dirtBlock1.name;
    entireimage.src = dirtBlock1.image;
    entirehealth.textContent = `Health: ${dirty1.getAttribute("data-health")}`;
    entireattack.textContent = `Attack: ${dirty1.getAttribute("data-attack")}`;
    entiremana.textContent = `Mana: ${dirty1.getAttribute("data-mana")}`;
    entiremovement.textContent = `Movement: ${dirty1.getAttribute("data-movement")}`;
    entiredescription.textContent = dirtBlock1.description;
    entire.style.visibility = "visible";
    handleCardMouseOver(e);
  });

  dirty1.addEventListener("mouseout", (e) => {
    entire.style.visibility = "hidden";
    handleCardMouseOut(e);
  });

  dirt1.appendChild(dirty1)

  const dirty2 = document.createElement("div");
  const dirty2img = document.createElement("img");

  dirty2.className = "card";
  dirty2.id = `p2${dirtBlock2.name}`;
  dirty2img.src = dirtBlock2.image;
  dirty2img.style.width = "100%";
  dirty2img.style.height = "100%";
  dirty2.append(dirty2img);

  dirty2.setAttribute('data-health', dirtBlock2.health);
  dirty2.setAttribute('data-attack', dirtBlock2.attack);
  dirty2.setAttribute('data-mana', dirtBlock2.mana);
  dirty2.setAttribute('data-movement', dirtBlock2.movement);
  dirty2.setAttribute('data-placed', true);

  dirty2.addEventListener("mouseover", (e) => {
    entirename.textContent = dirtBlock2.name;
    entireimage.src = dirtBlock2.image;
    entirehealth.textContent = `Health: ${dirty2.getAttribute("data-health")}`;
    entireattack.textContent = `Attack: ${dirty2.getAttribute("data-attack")}`;
    entiremana.textContent = `Mana: ${dirty2.getAttribute("data-mana")}`;
    entiremovement.textContent = `Movement: ${dirty2.getAttribute("data-movement")}`;
    entiredescription.textContent = dirtBlock2.description;
    entire.style.visibility = "visible";
    handleCardMouseOver(e);
  });

  dirty2.addEventListener("mouseout", (e) => {
    entire.style.visibility = "hidden";
    handleCardMouseOut(e);
  });

  dirt2.appendChild(dirty2)

}

const players = {};

console.log(turnCounter, "TURNCOUNTER");

// SOCKETS

socket.on('connection', () => {
  //socket.emit('join-room', room);
  //console.log('connected man', socket.id);
  //socket.emit("join-room", room)
  console.log('joined room', room);
});

socket.on('player-assigned', (data) => {
  console.log('THE PLAYER ASSIGNED', data.player);

  if(playerassigned){
    return;
  }
  playerassigned = true;

  window.playerNumber = data.player;
  whosTurn = data.player;

  const boardContainer = document.getElementById("main-board");
  const cardArea1 = document.getElementById("cardArea1");
  const cardArea2 = document.getElementById("cardArea2");
  const board = document.getElementById("board");
  boardContainer.innerHTML = "";
  gayarea.innerHTML = "";

  if(data.player === 1){
    boardContainer.append(cardArea2, board, cardArea1);
    gayarea.append(hand2, boardContainer, hand1);
  }
  else{
    boardContainer.append(cardArea1, board, cardArea2);
    gayarea.append(hand1, boardContainer, hand2);
  }

  generateBoard(data.player);

  if(data.player === 1){
    yourTurn.style.visibility = "visible";
  }

  alreadyDrew = 4;
});

socket.on('recieved-start-game', (elem) => {
  waitingForOpponent.style.display = "none";
});

socket.on('recieve-movement', (element) => {
  console.log("recieved-movement", element);
  // elem = id of the square it was originally on, moved = the card being moved, moved to = the square it's going to
  queueAnimation((done) => {
    const placement = document.getElementById(element.elem);
    const from = document.getElementById(element.movedto);
    let decider = element.decide;
    console.log("PLACEMENT, FROM, MOVED")
    console.log(placement, from, element.moved);
    if(!from.firstChild){
      console.log("WHAT, HOW NO FIRST CHILD?");
    }
    const fromChild = from.firstChild;
    console.log(fromChild);

    const temp = document.createElement('div');
    temp.innerHTML = element.moved;

    if(!decider){

      if(element.idx){
        console.log('okay, so we here');
        from.removeChild(from.children[element.idx]);
      }
      else{
        //console.log('should remove first child.. probably.');
        from.removeChild(from.firstChild);
      }
    }

    const moved = temp.querySelector('.card');
    const movedImg = temp.querySelector('img');

    if(moved){

      moved.addEventListener("click", (e) => {
        e.stopPropagation();
        handleCardClick(e);
      });

      moved.addEventListener("mouseover", (e) => {
        entirename.textContent = moved.getAttribute('data-name');
        entireimage.src = movedImg.src;
        entirehealth.textContent = `Health: ${moved.getAttribute("data-health")}`;
        entireattack.textContent = `Attack: ${moved.getAttribute("data-attack")}`;
        entiremana.textContent = `Mana: ${moved.getAttribute("data-mana")}`;
        entiremovement.textContent = `Movement: ${moved.getAttribute("data-movement")}`;
        entiredescription.textContent = `${moved.getAttribute("data-description")}`;
        entire.style.visibility = "visible";
        handleCardMouseOver(e);
      });

      moved.addEventListener("mouseout", (e) => {
        entire.style.visibility = "hidden";
        handleCardMouseOut(e);
      });

      moved.addEventListener("dragstart", drag);
      moved.setAttribute("draggable", "true");
      movedImg.setAttribute("draggable", "false");
      moved.style.borderColor = enemyBorderColor;

      console.log(moved, from, placement);

      animateMovementOfCard(moved, from, placement, () => {
        placement.appendChild(moved);
        done();
      });
    }
    else{
      console.log('what.');
      done();
    }
  })

});

socket.on('recieve-draw1', () => {
  const card = document.createElement('div');
  const cardimg = document.createElement('img');

  card.className = "back-of-card";
  card.style.backgroundColor = backOfCardColor;
  // set enemy color border here
  card.style.border = `2px solid ${enemyBorderColor}`
  //cardimg.src = imagine;
  cardimg.style.width = "100%";
  cardimg.style.height = "100%";
  card.appendChild(cardimg);

  animateDrawCard1(card, hand1);

});

socket.on('recieve-draw2', () => {
  //console.log('recieved-draw2')
  const card = document.createElement('div');
  const cardimg = document.createElement('img');

  card.className = "back-of-card";
  card.style.backgroundColor = backOfCardColor;
  card.style.border = `2px solid ${enemyBorderColor}`;
  //cardimg.src = imagine;
  cardimg.style.width = "100%";
  cardimg.style.height = "100%";
  card.appendChild(cardimg);

  animateDrawCard2(card, hand2);
});

socket.on('recieved-attack', (card) => {
  console.log('recieved attack', card.attacked, card.health);
  console.log(card.attacked);
  const attacker = document.getElementById(card.attacker);
  const attacked = document.getElementById(card.attacked);

  if(!attacker || !attacked){
    console.log('recieved-attack no attacker or attacked');
    return;
  }

  animateAttack(attacker, attacked, () => {
    attacked.setAttribute('data-health', card.health);
  });

});

socket.on('recieved-turn', (turn) => {
  //console.log('recieved turn', turn.playerTurn);

  yourTurn.style.visibility = "visible";
  yourTurn.textContent = "Your Turn!";

  player1Turn = turn.playerTurn;
  turnCounter = turn.turncount;
  alreadyDrew = turnCounter === 1 ? 4 : 1;
  console.log("TURNCOUNTER", turnCounter, "PLAYERTURN t=1 f=2", player1Turn);

  // eventually update all the requests so then if they are the correct player they can do the actions
});

socket.on('recieved-remove', (card) => {
  let endGame = false;
  const remover = document.getElementById(card.attacker);
  const remove = document.getElementById(card.attacked);
  console.log('RECIEVED-REMOVE', remover, remove);

  if(!remove){
    console.log('recieved-remove no attacked/removed card');
    return;
  }

  if(card.attacked == "p1Dirt Block"){
    endGame = true;
  }
  if(card.attacked == "p2Dirt Block"){
    endGame = true;
  }

  dead[card.attacked] = alive[card.attacked];
  delete alive[card.attacked];
  console.log(dead);

  deadCards.push(remove);

  if(remover){
    animateAttack(remover, remove, () => {
      if(endGame){
        onWin(card.attacked);
      }
      remove.remove();
    });

  }
  else{
    if(endGame){
      onWin(card.attacked);
    }
    remove.remove();
    return;
  }
});

socket.on('recieved-show-hand', (elem) => {
  const handElem = document.getElementById(elem.hand);
  const hand = Array.from(handElem.querySelectorAll('.card')).map(card => card.outerHTML);
  console.log('recieved-show-hand', hand);

  const card = document.getElementById(elem.card);

  socket.emit('send-hand', { hand: hand, roomid: room, handElem: elem.hand });

});

socket.on('recieved-hand', (elem) => {
  console.log('recieved-hand', elem);

  const handElem = document.getElementById(elem.handElem);
  const flipCards = Array.from(handElem.children);

  elem.hand.forEach((card, index) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = card;
    const newCard = tempDiv.firstChild;

    if(flipCards[index]){
      handElem.replaceChild(newCard, flipCards[index]);
    }
  });

});

socket.on("updatePlayers", (backendPlayers) => {
  for(const id in backendPlayers){
    const backendPlayer = backendPlayers[id];

    if(!players[id]){
      players[id] = {
        //new Player();
        
      }
      console.log("new player");
    }
  }
  for(const id in players){
    if(!backendPlayers[id]){
      delete players[id];
    }
  }
});

socket.on('recieved-movement-status', (elem) => {
  console.log(elem.target, elem.movement);
  const movementer = document.getElementById(elem.target);
  if(!movementer){
    console.log('recieved-movement-status no target card');
    return;
  }
  movementer.setAttribute('data-movement', elem.movement);
});

socket.on('recieved-update-gameObj', (elem) => {
  console.log(elem.arr); // [card.id, target, oldMovement, moveableTurn];
  const whatTurn = `${elem.addon}${elem.arr[3]}`;
  console.log('recieved-update-gameObj', whatTurn);

  if(!gameObj[whatTurn]){
    gameObj[whatTurn] = [];
  }

  gameObj[whatTurn].push(elem.arr);


});

socket.on('update-mana', (elem) => {
  console.log(elem);
  const manaer = document.getElementById(elem.target);
  if(!manaer){
    console.log('update-mana no target card');
    return;
  }
  manaer.setAttribute('data-mana', elem.mana);

});

socket.on('recieved-update-attack', (elem) => {
  console.log(elem);
  const attacked = document.getElementById(elem.target);
  if(!attacked){
    console.log('recieved-update-attack no target card');
    return;
  }
  attacked.setAttribute('data-attack', elem.newAttack);
});

socket.on('recieved-flip-card', (elem) => {

  if(!elem.card){
    console.log('recieved-flip-card no card');
    return;
  }

  queueAnimation((done) => {
    console.log('recieved-flip-card', elem);

    const hand = document.getElementById(elem.handid);
    const temp = document.createElement('div');
    temp.innerHTML = elem.card;
    console.log(hand);

    const filler = hand.children[elem.num];

    const front = temp.querySelector('.card');
    const frontImg = temp.querySelector('img');

    front.appendChild(frontImg);
    front.style.border = `2px solid ${enemyBorderColor}`

    filler.style.animation = "shake 0.45s";

    filler.replaceWith(front);
    console.log("okay, did all that, lets see if it worked");
    done();
  });
  // fix this when you get home 

});

socket.on('recieved-ability-attack', (card) => {

  console.log('recieved ability attack', card.attacked, card.health);
  console.log(card.attacked);
  const attacker = document.getElementById(card.attacker);
  const attacked = document.getElementById(card.attacked);

  if(!attacker || !attacked){
    console.log('recieved-ability-attack no attacker or attacked card');
    return;
  }

  animateUseOfCard(attacker, attacked, () => {
    attacked.setAttribute('data-health', card.health);
  });
  // leave this as animateUseOfCard() or else this shit breaks
  // literally no idea why either, and i don't care to know either

});

socket.on('recieved-ability-done', (card) => {
  console.log('recieved ability done', card.attacker, card.attacked, card.health);
  const attacker = document.getElementById(card.attacker);
  const attacked = document.getElementById(card.attacked);

  if(!attacked){
    console.log('recieved-ability-done no attacked card');
    return;
  }

  if(card.attacker){
    console.log(attacker);
    animateUseOfCard(attacker, attacked, () => {
      attacker.remove();
      dead[card.attacker] = alive[card.attacker];
      delete alive[card.attacker];
      console.log(dead);
    });
  }
  else{
    animateUseOfCard(attacked, null, () => {
      console.log('done');
    });
  }

  if(card.health){
    attacked.setAttribute('data-health', card.health);
  }
});

socket.on('recieved-ability-remove', (card) => {
  let endGame = false;
  console.log('recieved ability remove', card.attacked);
  console.log(card.attacked);
  const remover = document.getElementById(card.attacker);
  const remove = document.getElementById(card.attacked);
  console.log(remove);

  if(!remove){
    console.log('recieved-ability-remove no attacked card');
    return;
  }
  
  if(card.attacked == "p1Dirt Block"){
    endGame = true;
  }
  if(card.attacked == "p2Dirt Block"){
    endGame = true;
  }

  dead[card.attacked] = alive[card.attacked];
  delete alive[card.attacked];
  console.log(dead);

  if(remover){
    animateUseOfCardOpponentSide(remover, remove, () => {
      remove.remove();
    });
  }

  if(!remover){
    animateUseOfCardOpponentSide(remove, null, () => {
      remove.remove();
    });
  }

  if(endGame){
    onWin(card.attacked);
  }
});

socket.on('recieved-knocked-ability-status', (card) => {
  const knocked = document.getElementById(card.target);
  if(!knocked){
    console.log('recieved-knocked-ability-status no target card');
    return;
  }
  knocked.setAttribute('data-knockedability', true);
  return;
});

socket.on('update-knocked-ability', (card) => {
  const noknock = document.getElementById(card.target);
  if(noknock){
    console.log('update-knocked-ability no target card');
    return;
  }
  noknock.removeAttribute('data-knockedability');
  return;
});

socket.on('recieved-turn-event', (event) => {
  let p = document.createElement("p");
  let text = event.text;
  let word;
  if(event.second){
    if(event.second == "your"){
      word = "their";
    }
    if(event.second == "their"){
      word = "your";
    }
  }
  
  text = text.replace("Your", "Opponent's");
  text = text.replace(event.second, word);
  console.log("RECIEVED-TURN-EVENT", text);
  p.textContent = text;
  turnEvents.appendChild(p);
});

socket.on('recieved-game-over', (elem) => {
  console.log('recieved-game-over');
  whoWon(elem.winner);
});

socket.on('recieved-show-opp-card', (elem) => {
  console.log('recieved-show-opp-card', elem);
  const handElem = document.getElementById(elem.handid);
  const index = Array.from(handElem.children);
  const card = index[elem.index];
 
  console.log(card);

  socket.emit('send-card', { card: card.outerHTML, index: elem.index, roomid: room, hand: elem.handid });
  console.log('done with showoppcard');
});

socket.on('recieved-send-card', (elem) => {
  // sending this socket to original player
  // this will flip the card at the specific index 
  // and then it will show animation of it going to your hand
  // and then it is done
  console.log('recieved-send-card', elem);

  const handElem = document.getElementById(elem.hand);
  const index = Array.from(handElem.children);
  const card = index[elem.index];
  let giveTo;
  let newID;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = elem.card;
  const newCard = tempDiv.firstChild;

  handElem.replaceChild(newCard, card);

  console.log("ALRIGHT GREAT, NOW ANIMATE");

  if(elem.hand == "hand1"){
    console.log('okay.')
    giveTo = "hand2";
  }
  else{
    console.log('okay.')
    giveTo = "hand1";
  }
  console.log("STEALING CARD");

  // give newCard clickevent or whatever
  // also make sure newCard has new id so then they can actually play it.

  if(newCard.id.includes("p1")){
    const randomString = generateRandomString(8);
    newID = `p2${randomString}`; // do this tomorrow
  }
  else{
    const randomString = generateRandomString(8);
    newID = `p1${randomString}`
  }

  const newCardImg = newCard.querySelector('img');
  console.log(newCardImg.src);

  newCard.addEventListener("click", (e) => {
    e.stopPropagation();
    handleCardClick(e);
  });

  newCard.addEventListener("mouseover", (e) => {
    hoverTimeout = setTimeout(() => {
      entirename.textContent = newCard.getAttribute("data-name");
      entireimage.src = newCardImg.src;
      entirehealth.textContent = `Health: ${newCard.getAttribute("data-health")}`;
      entireattack.textContent = `Attack: ${newCard.getAttribute("data-attack")}`;
      entiremana.textContent = `Mana: ${newCard.getAttribute("data-mana")}`;
      entiremovement.textContent = `Movement: ${newCard.getAttribute("data-movement")}`;
      entiredescription.textContent = `${newCard.getAttribute("data-description")}`;
      entire.style.visibility = "visible";
    }, 90);
    handleCardMouseOver(e);

  });

  newCard.addEventListener("mouseout", (e) => {
    clearTimeout(hoverTimeout);
    entire.style.visibility = "hidden";
    handleCardMouseOut(e);
  });

  newCard.addEventListener("dragstart", drag);
  newCard.setAttribute("draggable", "true");
  newCard.firstChild.setAttribute("draggable", "false");

  animateStealCard(newCard, giveTo);
  socket.emit('steal-card-animate', { card: newCard.id, hand: giveTo, roomid: room, newID: newID });
  console.log("done with recieved-send-card");
  newCard.id = newID;

  return;

});

socket.on('recieved-steal-card-animate', (elem) => {
  console.log('recieved steal-card-animate', elem);
  const cardy = document.getElementById(elem.card);

  cardy.style.border = `2px solid ${enemyBorderColor}`;

  cardy.id = elem.newID;

  animateStealCard(cardy, elem.hand);

  return;

  
});

socket.on('recieved-movement-of-cardid', (element) => {
  console.log("recieved-movement", element);
  queueAnimation((done) => {
    const placement = document.getElementById(element.elem);
    const from = document.getElementById(element.movedto);
    let decider = element.decide;

    const card = document.getElementById(element.cardid);
    const cardImg = card.querySelector('img');

    if(!decider){
      if(element.idx){
        console.log('okay, so we here');
        from.removeChild(from.children[element.idx]);
      }
      else{
        from.removeChild(from.firstChild);
      }
    }

    if(card){

      card.addEventListener("click", (e) => {
        e.stopPropagation();
        handleCardClick(e);
      });

      card.addEventListener("mouseover", (e) => {
        entirename.textContent = card.getAttribute('data-name');
        entireimage.src = cardImg.src;
        entirehealth.textContent = `Health: ${card.getAttribute("data-health")}`;
        entireattack.textContent = `Attack: ${card.getAttribute("data-attack")}`;
        entiremana.textContent = `Mana: ${card.getAttribute("data-mana")}`;
        entiremovement.textContent = `Movement: ${card.getAttribute("data-movement")}`;
        entiredescription.textContent = `${card.getAttribute("data-description")}`;
        entire.style.visibility = "visible";
        handleCardMouseOver(e);
      });

      card.addEventListener("mouseout", (e) => {
        entire.style.visibility = "hidden";
        handleCardMouseOut(e);
      });

      card.addEventListener("dragstart", drag);
      card.setAttribute("draggable", "true");
      cardImg.setAttribute("draggable", "false");

      console.log(card, from, placement);

      animateMovementOfCard(card, from, placement, () => {
        placement.appendChild(card);
        done();
      });
    }
    else{
      done();
    }
  })
});

socket.on('recieved-ability-fog', (elem) => {
  //socket.emit('ability-fog', { arr: array, turn: removeFogTurn, roomid: room });
  console.log('recieved-ability-fog', (elem));

  elem.arr.forEach((x) => {
    const square = document.getElementById(x);
    square.classList.add('fogged');
  });

  // so fix this cuz it's getting the opponent's cards and also hiding them (bad)
  console.log('fogging');

  elem.arr.forEach((x) => {
    const square = document.getElementById(x);
    if(square.firstChild && square.firstChild.id.includes(elem.which)){
      animateUseOfCard(square.firstChild, null, () => {
        console.log('animate use removed');
        square.firstChild.remove();
      });
    }
  });

});

socket.on('recieved-fog-removed', (elem) => {
  console.log('recieved-fog-removed', elem);
  isFog = false;

  elem.arr.forEach((x) => {
    const square = document.getElementById(x);

    square.classList.remove('fogged');

    if(square.firstChild && square.firstChild.id.includes(elem.which)){
      square.firstChild.setAttribute('data-fogged', false);
      socket.emit('out-of-fog', { square: square.id, card: square.firstChild.outerHTML, roomid: room });
    }
    return;
  });
});

socket.on('recieved-out-of-fog', (elem) => {
  // if card attacks, or uses ability
  // eventually add this to animation queue
  //queueAnimation((done) => {
    console.log('RECIEVED-out-of-fog', elem);
    const square = document.getElementById(elem.square);

    if(square.firstChild){
      console.log('theres already a card there, just return man');
      return;
    }

    const temp = document.createElement('div');
    temp.innerHTML = elem.card;

    const card = temp.querySelector('.card');
    const cardImg = temp.querySelector('img');

    if(card){
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        handleCardClick(e);
      });

      card.addEventListener("mouseover", (e) => {
        entirename.textContent = card.getAttribute('data-name');
        entireimage.src = cardImg.src;
        entirehealth.textContent = `Health: ${card.getAttribute("data-health")}`;
        entireattack.textContent = `Attack: ${card.getAttribute("data-attack")}`;
        entiremana.textContent = `Mana: ${card.getAttribute("data-mana")}`;
        entiremovement.textContent = `Movement: ${card.getAttribute("data-movement")}`;
        entiredescription.textContent = `${card.getAttribute("data-description")}`;
        entire.style.visibility = "visible";
        handleCardMouseOver(e);
      });

      card.addEventListener("mouseout", (e) => {
        entire.style.visibility = "hidden";
        handleCardMouseOut(e);
      });

      card.addEventListener("dragstart", drag);
      card.setAttribute("draggable", "true");
      cardImg.setAttribute("draggable", "false");
    }

    console.log("THIS IS IN OUT-OF-FOG", card);
    card.style.animation = "fadeIn 0.5s";

    square.appendChild(card);
    /*
    card.addEventListener('animationend', function handleAnimationEnd(){
      card.removeEventListener('animationend', handleAnimationEnd);
      
      done();
    });
    */
  //});

});

socket.on('recieved-in-the-fog', (elem) => {
  // if card attacks, or uses ability
  queueAnimation((done) => {
    console.log('RECIEVED-in-the-fog', elem);
    const card = document.getElementById(elem.card);
    card.style.animation = "fadeOut 0.5s";

    card.addEventListener('animationend', function handleAnimationEnd(){
      card.removeEventListener('animationend', handleAnimationEnd);
      card.remove();
      done();
    });
  });
});

socket.on('recieved-no-placement', (elem) => {
  fogSquares = elem.squares;
});

socket.on('recieved-is-card-here', (elem) => {
  const square = document.getElementById(elem.square);
  if(!square.firstChild){
    return;
  }

  socket.emit('out-of-fog', { square: square.id, card: square.firstChild.outerHTML, roomid: room });
  square.firstChild.setAttribute('data-fogged', false);

});

socket.on('recieved-ability-blow-up', (elem) => {
  console.log('recieved-ability-blow-up')
  const card = document.getElementById(elem.card);
  if(!elem.array){
    console.log('recieved-ability-blow-up no array');
    return;
  }

  if(elem.target){
    const target = document.getElementById(elem.target);
    animateBlowUp(card, target, elem.array, () => {
      elem.array.forEach((x) => {
        const square = document.getElementById(`${x[0]},${x[1]}`);
        if(square && square.childElementCount > 0){
          const cardy = square.firstChild;
          const newHealth = Number(cardy.getAttribute('data-health')) - elem.damage;
          if(checkHealth(newHealth)){
            dead[cardy.id] = alive[cardy.id];
            delete alive[cardy.id];
            cardy.remove();
          }
          else{
            cardy.setAttribute("data-health", newHealth);
          }
        }
      })
    });
  }
  else{
    animateBlowUp(card, null, elem.array, () => {
      elem.array.forEach((x) => {
        const square = document.getElementById(`${x[0]},${x[1]}`);
        if(square && square.childElementCount > 0){
          const cardy = square.firstChild;
          const newHealth = Number(cardy.getAttribute('data-health')) - elem.damage;
          if(checkHealth(newHealth)){
            dead[cardy.id] = alive[cardy.id];
            delete alive[cardy.id];
            cardy.remove();
          }
          else{
            cardy.setAttribute("data-health", newHealth);
          }
        }
      })
    });
  }

});

// SOCKETS END

// CARD DECK CREATION, CLICKABLE CARDS

cardDeck1.addEventListener("click", () => {
  //queueAnimation((done) => { // probs remove this queueAnimation
    if(alreadyDrew === 0 || !player1Turn || whosTurn === 2){ // if not player1Turn or whosTurn === 2
      return;
    }

    if(customDeck2.length === 0){
      console.log("No more cards in the deck");
      return;
    }

    else{
      console.log(customDeck2, customDeck2.length, "customDeck2 length");
      alreadyDrew -= 1;
      const newCard = customDeck2.pop();
      firstHand.push(newCard);
      console.log(newCard);
      
      const cardy = document.createElement("div");
      const cardyImg = document.createElement("img");
      console.log(firstHand[firstHand.length - 1]);

      cardyImg.src = firstHand[firstHand.length - 1].image;
      cardy.className = "card"; 
      cardyImg.style.width = "100%";
      cardyImg.style.height = "100%";
      cardy.style.border = `2px solid ${playerBorderColor}`;

      const thisCardIndex = firstHand.length - 1;
      //const ID = firstHand[thisCardIndex].name.replace(/\s+/g, '');
      const randomString = generateRandomString(8);
      cardy.id = `p1${randomString}`; // do this tomorrow
      alive[cardy.id] = newCard;
      cardy.setAttribute('data-name', firstHand[thisCardIndex].name);
      cardy.setAttribute('data-health', firstHand[thisCardIndex].health);
      cardy.setAttribute('data-attack', firstHand[thisCardIndex].attack);
      cardy.setAttribute('data-mana', firstHand[thisCardIndex].mana);
      cardy.setAttribute('data-movement', firstHand[thisCardIndex].movement);
      cardy.setAttribute('data-description', firstHand[thisCardIndex].description);
      cardy.setAttribute('data-ability', firstHand[thisCardIndex].ability);
      cardy.setAttribute('data-determiner', firstHand[thisCardIndex].determiner);
      cardy.setAttribute('data-abilityattack', firstHand[thisCardIndex].abilityAttack);
      cardy.setAttribute('data-abilityrange', firstHand[thisCardIndex].abilityRange);
      cardy.setAttribute('data-placed', null);

      cardy.addEventListener("click", (e) => {
        e.stopPropagation();
        handleCardClick(e);
      });

      cardy.addEventListener("mouseover", (e) => {
        hoverTimeout = setTimeout(() => {
          const john = firstHand[thisCardIndex];
          entirename.textContent = cardy.getAttribute("data-name");
          entireimage.src = john.image;
          entirehealth.textContent = `Health: ${cardy.getAttribute("data-health")}`;
          entireattack.textContent = `Attack: ${cardy.getAttribute("data-attack")}`;
          entiremana.textContent = `Mana: ${cardy.getAttribute("data-mana")}`;
          entiremovement.textContent = `Movement: ${cardy.getAttribute("data-movement")}`;
          entiredescription.textContent = `${cardy.getAttribute("data-description")}`;
          entire.style.visibility = "visible";
        }, 90);
        handleCardMouseOver(e);

      });

      cardy.addEventListener("mouseout", (e) => {
        clearTimeout(hoverTimeout);
        entire.style.visibility = "hidden";
        handleCardMouseOut(e);
      });

      cardy.addEventListener("dragstart", drag);
      cardy.addEventListener("dragend", dragEnd);
      cardy.setAttribute("draggable", "true");
      cardyImg.setAttribute("draggable", "false");
      cardy.appendChild(cardyImg);

      socket.emit('hand1Draw', { roomid: room });
      animateDrawCard1(cardy, hand1);
      //done();
    }
  //});

});

cardDeck2.addEventListener("click", () => {
  //queueAnimation((done) => {
    if(alreadyDrew === 0 || player1Turn || whosTurn === 1){ // if player1Turn or whosTurn === 1
      return;
    }

    if(customDeck.length === 0){
      console.log("No more cards in the deck");
      return;
    }

    else{
      console.log(customDeck, customDeck.length, "customDeck2 length");
      alreadyDrew -= 1;
      const newCard = customDeck.pop();
      secondHand.push(newCard);
      const cardy = document.createElement("div");
      const cardyImg = document.createElement("img");

      console.log(newCard);
      cardyImg.src = secondHand[secondHand.length - 1].image;
      cardy.className = "card"; 
      cardyImg.style.width = "100%";
      cardyImg.style.height = "100%";
      cardy.style.border = `2px solid ${playerBorderColor}`

      const thisCardIndex = secondHand.length - 1;
      //const ID = secondHand[thisCardIndex].name.replace(/\s+/g, '');
      const randomString = generateRandomString(8);
      cardy.id = `p2${randomString}`; // do this tomorrow
      alive[cardy.id] = newCard;
      cardy.setAttribute('data-name', secondHand[thisCardIndex].name);
      cardy.setAttribute('data-health', secondHand[thisCardIndex].health);
      cardy.setAttribute('data-attack', secondHand[thisCardIndex].attack);
      cardy.setAttribute('data-mana', secondHand[thisCardIndex].mana);
      cardy.setAttribute('data-movement', secondHand[thisCardIndex].movement);
      cardy.setAttribute('data-description', secondHand[thisCardIndex].description);
      cardy.setAttribute('data-ability', secondHand[thisCardIndex].ability); // abilityName
      cardy.setAttribute('data-determiner', secondHand[thisCardIndex].determiner);
      cardy.setAttribute('data-abilityattack', secondHand[thisCardIndex].abilityAttack);
      cardy.setAttribute('data-abilityrange', secondHand[thisCardIndex].abilityRange);
      cardy.setAttribute('data-placed', null);


      cardy.addEventListener("click", (e) => {
        e.stopPropagation();
        handleCardClick(e);
      });

      cardy.addEventListener("mouseover", (e) => {
        hoverTimeout = setTimeout(() => {
          const john = secondHand[thisCardIndex];
          entirename.textContent = cardy.getAttribute("data-name");
          entireimage.src = john.image;
          entirehealth.textContent = `Health: ${cardy.getAttribute("data-health")}`;
          entireattack.textContent = `Attack: ${cardy.getAttribute("data-attack")}`;
          entiremana.textContent = `Mana: ${cardy.getAttribute("data-mana")}`;
          entiremovement.textContent = `Movement: ${cardy.getAttribute("data-movement")}`;
          entiredescription.textContent = `${cardy.getAttribute("data-description")}`;
          entire.style.visibility = "visible";
        }, 90); // do this but again.
        handleCardMouseOver(e);

      });

      cardy.addEventListener("mouseout", (e) => {
        clearTimeout(hoverTimeout);
        entire.style.visibility = "hidden";
        handleCardMouseOut(e);
      });

      cardy.addEventListener("dragstart", drag);
      cardy.addEventListener("dragend", dragEnd);
      cardy.setAttribute("draggable", "true");
      cardyImg.setAttribute("draggable", "false");
      cardy.appendChild(cardyImg);
      socket.emit('hand2Draw', { roomid: room });
      animateDrawCard2(cardy, hand2);
      //done();
    }
  //});
});

document.addEventListener("click", (e) => {
  const actionButtons = document.getElementById("action-buttons");

  if(selectedCard && !selectedCard.contains(e.target)){
    selectedCard = null;
    hideActionMenu();
    const squares = document.querySelectorAll(".highlight-square");
    squares.forEach(square => {
      removeHighlight(square.id);
    });
    const cards = document.querySelectorAll(".highlight-red");
    cards.forEach(card => {
      card.classList.remove('highlight-red');
    });
  }
  /*
  console.log(selectedCard, e.target, e.currentTarget);
  if(selectedCard && !selectedCard.contains(e.target)){
    hideActionMenu();
    selectedCard = null;
  }
  */
});

// CARD DECK CREATION, CLICKABLE CARDS END

// BUTTONS THAT DO STUFF

attackButton.addEventListener("click", (e) => {
  if(selectedCard == attackedCard){
    console.log('no attacking yourself, weirdo.')
    return;
  }

  if(actionsObj.attackers.includes(selectedCard.id) || actionsObj.attackers.length == 3){
    console.log('already attacked, cant do that again')
    return;
  }
  console.log("SELECTED AND ATTACKED", selectedCard, attackedCard);
  selectedCard.classList.remove('hovered');
  attack(selectedCard, attackedCard);
});

abilityButton.addEventListener("click", (e) => {
  if(selectedCard){
    console.log("SELECTED AND ATTACKED", selectedCard, attackedCard)
    // selectedCard = ability card
    // attackedCard = null
    selectedCard.classList.remove('hovered');
    activateAbility(selectedCard, attackedCard, "use");
  }
});

attatchedButton.addEventListener("click", (e) => {
  if(selectedCard){
    selectedCard.classList.remove('hovered');
    activateAttatched(selectedCard, attackedCard, "assign");
  }
});

endTurn.addEventListener("click", (e) => {

  if(player1Turn && whosTurn === 1){
    turn();
    yourTurn.style.visibility = "hidden";
  }

  if(!player1Turn && whosTurn === 2){
    turn();
    yourTurn.style.visibility = "hidden";
  }

  else{
    console.log('not ur turn man');
    return; // can't do that man
  }
});

actionButtons.addEventListener('mouseenter', () => {
  if(selectedCard){
    selectedCard.classList.add('hovered');
  };
});

actionButtons.addEventListener('mouseleave', () => {
  if(selectedCard){
    selectedCard.classList.remove('hovered');
  };
});

closeEndModal.addEventListener("click", () => {
  window.location.href = "/home";
});

// BUTTONS THAT DO STUFF END

// GAME LOGIC

function allowDrop(e){
  e.preventDefault();
  // this shows where we can drop the card (inside of the squares)
  // e.target gets the square
}

function drag(e){
  //console.log(e.target, e.currentTarget)

  const squares = document.querySelectorAll(".highlight-square");

  squares.forEach(square => {
    removeHighlight(square.id)
  });

  e.dataTransfer.setData("text", JSON.stringify({
    id: e.target.id,
    health: e.target.getAttribute("data-health"), 
    attack: e.target.getAttribute("data-attack"),
    mana: e.target.getAttribute("data-mana"),
    movement: e.target.getAttribute("data-movement"),
    placed: e.target.getAttribute("data-placed"),
    determiner: e.target.getAttribute("data-determiner"),
  }));

  showMovement(e.target.parentElement, e.target.getAttribute("data-determiner"));
}

function dragEnd(e){
  const squares = document.querySelectorAll(".highlight-square");
  squares.forEach(square => {
    removeHighlight(square.id);
  });
}

function drop(e){
  e.preventDefault();
  //console.log("DROPPED", e.target, e.currentTarget);
  const squares = document.querySelectorAll(".highlight-square");
  let indexOfCard;

  squares.forEach(square => {
    removeHighlight(square.id)
  });

  let data = JSON.parse(e.dataTransfer.getData("text"));
  const card = document.getElementById(data.id);

  // if the id includes correlating turn, they can move it
  if(data.id.includes('p1')){
    if(!player1Turn || whosTurn === 2){
      console.log('cant move that card');
      return;
    }
  }

  if(data.id.includes('p2')){
    if(player1Turn || whosTurn === 1){
      console.log('cant move that card');
      return;
    }
  }

  if(!isSquareOccupied(e.currentTarget)){
    console.log("Square is occupied, cannot drop card here or already moved");
    return;
  }
  console.log(e.currentTarget.id);


  if(data.placed === 'null'){
    console.log(data.placed, 'data placed');
    if(!deployCard(e.currentTarget.id, card) || actionsObj.deployers.length == 2 || card.getAttribute('data-determiner') != "attacker"){
      //console.log("Card cannot be deployed here");
      return;
    }
    actionsObj.deployers.push(card.id);
    card.setAttribute("data-placed", true);
    indexOfCard = Array.from(card.parentElement.children).indexOf(card);
    console.log(indexOfCard);
  }

  if(fogSquares.includes(e.currentTarget.id)){
    // reveal card in the fog
    // have that card attack this one and deal 2 damage
    // put card into obj
    // holy fuck why is this so much effort
    // so i guess create a socket that says "is there a card here"
    // and if there is then get the card, place it on the square
    // they tried to go to

    socket.emit('is-card-here', { square: e.currentTarget.id, roomid: room });

    animateUseOfCard(card, null, () => {

    });

    actionsObj.movementers.push(card.id);
    actionsObj.attackers.push(card.id);
    actionsObj.abilities.push(card.id);

    const newHealth = Number(card.getAttribute('data-health')) - 2;

    setTimeout(() => {
      if(checkHealth(newHealth)){
        socket.emit('ability-remove', { attacked: card.id, attacker: null, roomid: room });
        card.remove();
        return;
      }

      card.setAttribute("data-health", newHealth);
      socket.emit('ability-done', { attacked: card.id, attacker: null, health: newHealth, roomid: room });

    }, 220);

    return;
  }

  if(data.placed === 'true' && !allowMove(card.parentElement.id, card, e.currentTarget.id)){
    return;
  }

  if(isFog){
    console.log("currentTarget", "card.id", "card.parentElement.id");
    console.log(e.currentTarget.id, card.id, card.parentElement.id);
    if(card.parentElement.id.includes('hand')){
      card.setAttribute("data-fogged", true);
      animateFlipAndShow(card, card.parentElement.id);
      socket.emit('ability-remove', { attacked: card.id, roomid: room });
      e.currentTarget.append(card);

      return;
    }
    else if(card.id.includes('p1') && Number(e.currentTarget.id[0]) < 4 || card.id.includes('p2') && Number(e.currentTarget.id[0]) > 4){
      // if card moves into the fog
      card.setAttribute("data-fogged", true);
      socket.emit('in-the-fog', { square: e.currentTarget.id, card: card.id, roomid: room });
      e.currentTarget.append(card);
      return;
    }
    
    else if(card.id.includes('p1') && Number(e.currentTarget.id[0]) >= 4 || card.id.includes('p2') && Number(e.currentTarget.id[0]) <= 4){
      /*
      call a socket that shows the card's position && no longer fogged
      so for some reason this shit ain't working and i don't know why
      all that is being asked is "hey, if the x of the square is
      at a higher position or a lower position than the player's
      part of the map, then show that the card moved to the unfogged square"

      so if a card is shown to enemy and then fog clears, there will be 2 cards put back
      gonna have to make a case for that. dammit.

      */
      console.log('okay, else if in drop() is running');

      card.setAttribute("data-fogged", false);
      socket.emit('out-of-fog', { square: e.currentTarget.id, card: card.outerHTML, roomid: room });
      e.currentTarget.append(card);
      onReachEndOfBoard(card, e.currentTarget.id);
      return;
    }

    e.currentTarget.append(card);
    onReachEndOfBoard(card, e.currentTarget.id);
    return;
  }

  console.log("EMITTING CARD-MOVED", card, indexOfCard, e.currentTarget.id);
  socket.emit('card-moved', { elem: e.currentTarget.id, moved: card.outerHTML, movedto: card.parentElement.id, idx: indexOfCard, roomid: room });
  e.currentTarget.append(card);
  onReachEndOfBoard(card, e.currentTarget.id);
}

function deployCard(square){
  // this will be the card in their hand now placed on the board

  if(player1Turn){
    if(
      square === "1,1" ||
      square === "1,2" ||
      square === "1,3" ||
      square === "1,4" ||
      square === "1,5" ||
      square === "1,6" ||
      square === "1,7"){
      return true;
    }
    else{
      return false;
    }
  }

  else{
    if(
      square === "7,1" ||
      square === "7,2" ||
      square === "7,3" ||
      square === "7,4" ||
      square === "7,5" ||
      square === "7,6" ||
      square === "7,7"){
      return true;
    }
    else{
      return false;
    }
  }
}

function allowMove(square, card, toSquare){
  // if card on board, check it's movement, how ever many movement it has let it do that
  /*

  this could be written better by asking using ternary operators.
  essentially ask "if card.id is p1 then only allow + movements, if not then only allow - movements"

  */
  let truth = false;
  let num1 = Number(square[0]);
  let num2 = Number(square[2]);
  const cardMovement = parseInt(card.getAttribute("data-movement"));
  const allowedMoves = [];
  //console.log(square, toSquare)

  
  if(actionsObj.movementers.length >= 2 || actionsObj.movementers.includes(card.id) || card.getAttribute('data-determiner') != "attacker"){
    return truth;
  }

  if(player1Turn){
    // if it is player1's turn
    if(cardMovement >= 1){
      allowedMoves.push([num1, num2 + 1]);
      allowedMoves.push([num1, num2 - 1]);
      allowedMoves.push([num1 + 1, num2 + 1]);
      allowedMoves.push([num1 + 1, num2]);
      allowedMoves.push([num1 + 1, num2 - 1]);
      allowedMoves.push([num1 - 1, num2]);
    }
  
    if(cardMovement >= 2){
      allowedMoves.push([num1, num2 + 2]);
      allowedMoves.push([num1 + 2, num2 + 1]);
      allowedMoves.push([num1 + 2, num2 + 2]);
      allowedMoves.push([num1 + 1, num2 + 2]);
      allowedMoves.push([num1 + 2, num2]);
      allowedMoves.push([num1 + 2, num2 - 1]);
      allowedMoves.push([num1 + 2, num2 - 2]);
      allowedMoves.push([num1 + 1, num2 - 2]);
      allowedMoves.push([num1, num2 - 2]);
    }

    //add more of this later at some point
  
    allowedMoves.forEach(elem => {
      const strElem = `${elem[0]},${elem[1]}`
      if(toSquare === strElem){
        console.log('matching!!');
        truth = true;
        actionsObj.movementers.push(card.id);
        return truth;
      }
    });
    return truth;
  }

  else{
    // if it's player2's turn
    if(cardMovement >= 1){
      allowedMoves.push([num1, num2 - 1]);
      allowedMoves.push([num1 - 1, num2 - 1]);
      allowedMoves.push([num1 - 1, num2]);
      allowedMoves.push([num1 - 1, num2 + 1]);
      allowedMoves.push([num1, num2 + 1]);
      allowedMoves.push([num1 + 1, num2]);
    }
  
    if(cardMovement >= 2){
      allowedMoves.push([num1 - 2, num2 - 2]);
      allowedMoves.push([num1 - 2, num2 - 1]);
      allowedMoves.push([num1 - 2, num2]);
      allowedMoves.push([num1 - 2, num2 + 1]);
      allowedMoves.push([num1 - 2, num2 + 2]);
      allowedMoves.push([num1 - 1, num2 - 2]);
      allowedMoves.push([num1 - 1, num2 + 2]);
      allowedMoves.push([num1, num2 - 2]);
      allowedMoves.push([num1, num2 + 2]);
      
    }

    //add more of this later at some point
  
    allowedMoves.forEach(elem => {
      const strElem = `${elem[0]},${elem[1]}`
      if(toSquare === strElem){
        console.log('matching!!');
        truth = true;
        actionsObj.movementers.push(card.id);
        return truth;
      }
    });
    return truth;
  }
  //console.log(cardMovement)
}

function isSquareOccupied(square){
  if(square.childElementCount > 0){
    return false;
  }
  return true;
}

function turn(){

  console.log('whos turn', whosTurn);
  if(whosTurn === 2){
    turnCounter += 1;
  }
  let player = player1Turn ? 'p1' : 'p2';
  player1Turn = !player1Turn;
  alreadyDrew = 1;
  actionsObj.deployers = [];
  actionsObj.movementers = [];
  actionsObj.attackers = [];
  actionsObj.abilities = [];

  updateRemove(gameObj);
  updateMovement(gameObj); // might need to put this before all happens
  updateBlowUp(gameObj);
  updateRadiation(gameObj);
  updateKnockedAbility(gameObj);
  updateSapTower(gameObj);
  updateFogAbility(gameObj);

  deadCardsFunc(deadCards);

  if(isFog){
    const squares = document.querySelectorAll(".cell");
    fogSquares = []; // turn this into a let and not a const
    console.log(player);
    squares.forEach(square => {
      if(square.firstChild && square.classList.contains('fogged') && square.firstChild.id.includes(player)){
        fogSquares.push(square.id); // why is square.firstChild necessary?
        // then make a socket that pushes those into an array that is then sent
        // to the other player and then done
      }
    });
    socket.emit('no-placement', { squares: fogSquares, roomid: room });
    

  }

  console.log('TURNCOUNTER', turnCounter);
  socket.emit('update-turn', { playerTurn: player1Turn, turncount: turnCounter, roomid: room });
  return;
}

function handleCardClick(e){
  // if card on board
  selectedCard = e.currentTarget;
  //console.log(selectedCard, attackedCard);

  if(selectedCard && cardAbilities[selectedCard.getAttribute('data-ability')]?.active?.use){
    showMenuButtons(selectedCard, {
      attacked: false,
      ability: true,
      attatched: false
    });
  }
}

function handleCardMouseOver(e){
  // also in this, use the determiner
  let attacked = false;
  let ability = false;
  let attatched = false;
  let dataAbility;
  let activeAbility = null;

  if(selectedCard && selectedCard.getAttribute('data-ability')){
    dataAbility = selectedCard.getAttribute('data-ability').split(",");

    dataAbility.forEach((e) => {
      if(cardAbilities[e]?.active){
        activeAbility = cardAbilities[e];
      }
    });
  }

  if(selectedCard && selectedCard != e.currentTarget && e.currentTarget.classList.contains('cell') && selectedCard.parentElement.classList.contains('cell')){
    attacked = true;
  }

  if(selectedCard && selectedCard != e.currentTarget && activeAbility?.active?.useAgainst){
    ability = true
  }

  if(selectedCard && selectedCard != e.currentTarget && Number(selectedCard.getAttribute('data-health')) == 0 && selectedCard.parentElement.id.includes('hand') && activeAbility?.active?.useOn){
    ability = true
  }

  if(selectedCard && selectedCard != e.currentTarget && Number(selectedCard.getAttribute('data-health')) == 0 && selectedCard.parentElement.id.includes('hand') && activeAbility?.active?.useOnSquare){
    ability = true
  }

  if(selectedCard && selectedCard != e.currentTarget && abilityObj[selectedCard.id]){
    attatched = true
  }

  if(attacked || ability || attatched){
    showMenuButtons(e.currentTarget, {
      attacked: attacked,
      ability: ability,
      attatched: attatched
    });
  }

}

function handleCardMouseOut(e){
  //console.log('mouseOver');
  //hideActionMenu();
}

function showMenuButtons(targetCard, options = {}){
  attackedCard = targetCard;

  const actionButtons = document.getElementById("action-buttons");
  const actionButton = document.getElementById("action-button");
  const abilityButton = document.getElementById("ability-button");
  const attatchedButton = document.getElementById("attatched-button");

  // Control which buttons are visible
  actionButton.style.display = options.attacked ? "inline-block" : "none";
  abilityButton.style.display = options.ability ? "inline-block" : "none";
  attatchedButton.style.display = options.attatched ? "inline-block" : "none";

  // if specific button shows, give the range of it?
  // problem is that i would need to give the cards
  // a separate attribute of "range" so then i can actually get the range
  // actual attack wouldn't be difficult cuz it's 3x3
  // but everything else is the problem (for the most part)

  if(options.attacked){
    showAttack(selectedCard);
  }

  // Position the menu near the card
  const rect = targetCard.getBoundingClientRect();
  const menuWidth = 60;
  
  actionButtons.style.left = (rect.left + window.scrollX + rect.width / 2 - menuWidth / 2) + "px";
  actionButtons.style.top = targetCard.parentElement.id.includes('hand') === true
  ? (rect.top + window.scrollY - 20) + "px" : (rect.top + window.scrollY) + "px";
  // if targetCard is in hand, than raise the actionButtons div if not, do not.

  actionButtons.style.visibility = "visible";
}

function hideActionMenu(){
  document.getElementById("action-buttons").style.visibility = "hidden";
}

function attack(card, attackdCard){

  if(!inRange(card.parentElement.id, attackdCard) || actionsObj.attackers.length == 3 || actionsObj.attackers.includes(card.id)){
    console.log('cant do that..')
    return;
  }

  const newHealth = attackdCard.firstChild.getAttribute('data-health') - card.getAttribute('data-attack');
  actionsObj.attackers.push(card.id);

  console.log(card.getAttribute('data-fogged'));

  if(card.getAttribute('data-fogged') == 'true'){
    // so make a function that sends a socket so then player2 can see the card
    // show the p2 card being attacked by this one, and then remove it if still fogged
    // if the card is fogged, then take it out of fog and then place it back into fog
    console.log('EMMITTING OUT OF FOG');
    socket.emit('out-of-fog', { card: card.outerHTML, square: card.parentElement.id, roomid: room });

  }

  animateAttack(card, attackdCard, () => {
    console.log('okay how it go?');
  });

  attackerPassiveAbility(card, attackdCard.firstChild);
  targetPassiveAbility(card.getAttribute('data-attack'), attackdCard.firstChild);

  setTimeout(() => {
    if(checkHealth(newHealth)){
      socket.emit('remove-card', { attacked: attackdCard.firstChild.id, attacker: card.id, roomid: room });
      attackdCard.firstChild.remove();
      return;
    }

    attackdCard.firstChild.setAttribute("data-health", newHealth);
    socket.emit('attacked', { attacked: attackdCard.firstChild.id, attacker: card.id, health: newHealth, roomid: room });
  }, 220);

  if(card.getAttribute('data-fogged') == 'true'){
    setTimeout(() => {
      socket.emit('in-the-fog', { card: card.id, roomid: room });
    }, 300);
  }

  return;

}

function activateAbility(card, attacked, context){

  if(player1Turn && whosTurn == 2){
    console.log('it is not your turn.');
    return;
  }

  if(!player1Turn && whosTurn == 1){
    console.log('it is not your turn.');
    return;
  }

  console.log("ACTIVATE ABILITY", card, attacked);

  if(card.getAttribute("data-knockedability") == 'true'){
    console.log('you cannot use your ability');
    return;
  }

  console.log("IN ACTIVATE ABILITY");
  context = "assign";

  const dataAbility = selectedCard.getAttribute('data-ability').split(",");
  let activeAbility;

  dataAbility.forEach((e) => {
    if(cardAbilities[e]?.active){
      activeAbility = cardAbilities[e];
    }
  });

  const name = activeAbility?.active;

  console.log(name, 'what now man.');

  if(name && typeof name.use === 'function'){
    name.use(card);
    return;
  }

  if(name && typeof name.useAgainst === 'function'){
    console.log('this ran')
    name.useAgainst(card, attacked);
    return;
  }

  if(name && typeof name.useOn === 'function' && card.parentElement.id.includes('hand') && card.getAttribute('data-health') == 0){
    name.useOn(card, attacked, context);
    return;
  }

  if(name && typeof name.useOnSquare === 'function' && card.parentElement.id.includes('hand') && card.getAttribute('data-health') == 0){
    name.useOnSquare(card, attacked, context);
    console.log('gave ability to:', attacked.id);
    console.log('abilityObj', abilityObj);
    return;
  }

  else{
    console.log("none bruh");
  }
}

function activateAttatched(card, attacked){
  //attatchedButton.style.display = "inline-block";

  if(player1Turn && whosTurn == 2){
    return;
  }
  if(!player1Turn && whosTurn == 1){
    return;
  }
 
  const name = abilityObj[card.id]?.active;

  if(name && typeof name.use === 'function'){
    name.use(card, "use");
    return;
  }

  if(name && typeof name.useAgainst === 'function'){
    console.log('this ran for some reason')
    name.useAgainst(card, attacked, "use");
    return;
  }

  if(name && typeof name.useOn === 'function'){ // fix this if neccessary
    name.useOn(card, attacked, "use");
    return;
  }

  if(name && typeof name.useOnSquare === 'function'){ // fix this if neccessary
    name.useOnSquare(card, attacked, "use");
    return;
  }

  else{
    console.log("none bruh");
  }

}

function checkHealth(health){
  console.log(health);
  if(Number(health) < 1){
    console.log("remove this card from the board");
    return true;
  }
}

function inRange(card1, card2){

  let truth = false;
  let num1 = Number(card1[0]);
  let num2 = Number(card1[2]);

  const allowedRange = []
  allowedRange.push([num1, num2 - 1]);
  allowedRange.push([num1, num2 + 1]);
  allowedRange.push([num1 + 1, num2]);
  allowedRange.push([num1 - 1, num2]);

  allowedRange.push([num1 - 1, num2 + 1]);
  allowedRange.push([num1 + 1, num2 + 1]);
  allowedRange.push([num1 + 1, num2 - 1]);
  allowedRange.push([num1 - 1, num2 - 1]);

  console.log(allowedRange);

  allowedRange.forEach(elem => {
    const strElem = `${elem[0]},${elem[1]}`
    if(card2.id === strElem){
      console.log(card2.id, strElem);
      truth = true;
      return truth
    }
  });
  return truth;
}

function showMovement(whereAt, move){
  // maybe put in code where if they already deployed
  // or if they already moved, don't show squares

  if(move !== "attacker"){
    console.log('no highlight cant move.');
    return;
  }

  if(player1Turn && whosTurn === 1){
    if(whereAt.id == 'hand1'){
      
      const squares = [];
      
      squares.push(document.getElementById('1,1'));
      squares.push(document.getElementById('1,2'));
      squares.push(document.getElementById('1,3'));
      squares.push(document.getElementById('1,5'));
      squares.push(document.getElementById('1,6'));
      squares.push(document.getElementById('1,7'));

      squares.forEach(square => {
        if(square.childElementCount < 1){
          highlightSquare(square.id);
        }
      });
      return;

    }
    else{
      // hey actually calculate card.movement and where they can go
      const squared = document.getElementById(whereAt.id);
      const card = squared.firstChild;
      const movement = card.getAttribute('data-movement');
      const num1 = Number(squared.id[0]);
      const num2 = Number(squared.id[2]);
      const movementRange = [];

      // only add to num1 but add & minus to num2
      // if new squares are in movement range, highlight 'em
      // if square is occupied, don't show it

      if(movement >= 1){
        movementRange.push([num1, num2 - 1]);
        movementRange.push([num1, num2 + 1]);
        movementRange.push([num1 + 1, num2]);
        movementRange.push([num1 + 1, num2 - 1]);
        movementRange.push([num1 + 1, num2 + 1]);
        movementRange.push([num1 - 1, num2]);
      }

      if(movement >= 2){ // at some point add movement >= 3
        // what if square doesn't exist?

        movementRange.push([num1, num2 - 2]);
        movementRange.push([num1, num2 + 2]);

        movementRange.push([num1 + 2, num2]);

        movementRange.push([num1 + 2, num2 - 1]);
        movementRange.push([num1 + 2, num2 + 1]);

        movementRange.push([num1 + 1, num2 - 2]);
        movementRange.push([num1 + 1, num2 + 2]);

        movementRange.push([num1 + 2, num2 - 2]);
        movementRange.push([num1 + 2, num2 + 2]);
      }

      console.log(movementRange, 'MOVEMENT RANGE');

      movementRange.forEach(elem => {
        const strElem = `${elem[0]},${elem[1]}`
        const square = document.getElementById(strElem);
        if(square && square.childElementCount < 1){
          highlightSquare(square.id);
        }
      });

    }
  }


  else{
    if(whereAt.id == 'hand2'){
      const squares = [];
      
      squares.push(document.getElementById('7,1'));
      squares.push(document.getElementById('7,2'));
      squares.push(document.getElementById('7,3'));
      squares.push(document.getElementById('7,5'));
      squares.push(document.getElementById('7,6'));
      squares.push(document.getElementById('7,7'));

      squares.forEach(square => {
        if(square.childElementCount < 1){
          highlightSquare(square.id);
        }
      });
      return;

    }
    else{
      // show movement squares player can go to
      // if square is occupied, don't show it

      const squared = document.getElementById(whereAt.id);
      const card = squared.firstChild;
      const movement = card.getAttribute('data-movement');
      const num1 = Number(squared.id[0]);
      const num2 = Number(squared.id[2]);
      const movementRange = [];

      if(movement >= 1){
        movementRange.push([num1, num2 - 1]);
        movementRange.push([num1, num2 + 1]);
        movementRange.push([num1 - 1, num2]);
        movementRange.push([num1 - 1, num2 - 1]);
        movementRange.push([num1 - 1, num2 + 1]);
        movementRange.push([num1 + 1, num2]);
      }

      if(movement >= 2){ // at some point add movement >= 3
        // what if square doesn't exist?

        movementRange.push([num1, num2 - 2]);
        movementRange.push([num1, num2 + 2]);

        movementRange.push([num1 - 2, num2]);

        movementRange.push([num1 - 2, num2 - 1]);
        movementRange.push([num1 - 2, num2 + 1]);

        movementRange.push([num1 - 1, num2 - 2]);
        movementRange.push([num1 - 1, num2 + 2]);

        movementRange.push([num1 - 2, num2 - 2]);
        movementRange.push([num1 - 2, num2 + 2]);
      }

      console.log(movementRange, 'MOVEMENT RANGE2');

      movementRange.forEach(elem => {
        const strElem = `${elem[0]},${elem[1]}`
        const square = document.getElementById(strElem);
        if(square && square.childElementCount < 1){
          highlightSquare(square.id);
        }
      });

    }
  }

  
}

function showAttack(card){
 /*
 if square in 1 block radius AND square contains a card, highlight where to attack
 */
  const square = card.parentElement.id;
  const num1 = Number(square[0]);
  const num2 = Number(square[2]);
  const attackable = card.id.includes('p1') ? 'p2' : 'p1';
  // attackable = 'p2' if player1, and 'p1' if player2

  const attackRange = [
    [num1, num2 - 1],
    [num1, num2 + 1],
    [num1 + 1, num2],
    [num1 - 1, num2],
    [num1 + 1, num2 - 1],
    [num1 + 1, num2 + 1],
    [num1 - 1, num2 - 1],
    [num1 - 1, num2 + 1]
  ];

  attackRange.forEach(elem => {
    const strElem = `${elem[0]},${elem[1]}`;
    const squareT = document.getElementById(strElem);
    if(squareT && squareT.childElementCount > 0 && squareT.firstChild.id.includes(attackable)){
      highlightAttackable(squareT.firstChild.id);
    }
  });

}

function onReachEndOfBoard(card, squareid){
  if(typeof(card.ability?.passive?.onReachEnd) === 'function'){
    try{
      console.log("BLOW UP MAN")
      card.ability.passive.onReachEnd(card.getAttribute('data-attack'), squareid);
    }
    catch(err){
      console.error("Error in onReachEnd ability:", err);
    }
  }
}

function whileAlive(card){
  if(typeof(card.ability?.active?.whileAlive) === 'function'){
    try{
      card.ability.active.whileAlive(card);
    }
    catch(err){
      console.error("Error in whileAlive ability:", err);
    }
  }
}

function highlightSquare(squareId){
  const square = document.getElementById(squareId);
  if(square){
    square.classList.add("highlight-square");
  }
}

function updateGlowRedKeyframes(){
  const fromColor = attackHighlightFromColor;
  const toColor = attackHighlightToColor;

  // Remove any existing glow-red keyframes from this style tag
  styleTag.innerHTML = `
    @keyframes glow-red {
      from { outline-color: ${fromColor}; }
      to { outline-color: ${toColor}; }
    }
  `;
  return;
}

function updateGlowKeyframes(){
  const fromColor = movementHighlightFromColor;
  const toColor = movementHighlightToColor;

  // Remove any existing glow-red keyframes from this style tag
  styleTag2.innerHTML = `
    @keyframes glow {
      from { outline-color: ${fromColor}; }
      to { outline-color: ${toColor}; }
    }
  `;
  return;
}

function highlightAttackable(cardID){
  const square = document.getElementById(cardID);
  if(square){
    square.classList.add("highlight-red");
  }
}

function removeHighlight(squareId){
  const square = document.getElementById(squareId);
  if(square){
    square.classList.remove("highlight-square");
  }
}

function removeHighlightAttackable(cardID){
  const square = document.getElementById(cardID);
  if(square){
    square.classList.remove("highlight-red");
  }
}

function updateMovement(obj){
  // [card.id, target.id, oldMovement, moveableTurn];
  //gameObj[`${elem.arr[3]}`] = elem.arr;
  console.log(obj);
  if(obj[`movement${turnCounter}`]){
    const target = document.getElementById(obj[`${turnCounter}`][1]);
    target.setAttribute('data-movement', obj[`${turnCounter}`][2]);

    socket.emit("movement-status", { target: target.id, movement: obj[`${turnCounter}`][2], roomid: room });

    // this code will need to be updated at some point
    // there will be issues if other cards like glue are made
  }
}

function updateRemove(obj){
  // [card.id, target.id, oldMovement, moveableTurn];
  //gameObj[`${elem.arr[3]}`] = elem.arr;

  console.log("UPDATEREMOVE", obj);
  if(obj[`remove${turnCounter}`]){
    obj[`remove${turnCounter}`].forEach((x, y) => {
      const target = document.getElementById(x[0]);
      if(target){
        target.remove();
        console.log("TARGETID", target.id, x[0]);
        socket.emit('remove-card', { attacked: x[0], roomid: room });
      }
    });
  }
}

function updateBlowUp(obj){
  console.log("UPDATEBLOWUP", obj);

  if(obj[`blowup${turnCounter}`]){
    obj[`blowup${turnCounter}`].forEach((x, y) => {
      const target = document.getElementById(x[1]);
      const mainSquare = document.getElementById("4,4");
      const num1 = Number(target.id[0]);
      const num2 = Number(target.id[2]);

      const blowUpRange = [
        [num1 + 1, num2],
        [num1 - 1, num2],
        [num1, num2 + 1],
        [num1, num2 - 1],
        [num1, num2],
        [num1 + 1, num2 + 1],
        [num1 + 1, num2 - 1],
        [num1 - 1, num2 + 1],
        [num1 - 1, num2 - 1],
        [num1 + 2, num2],
        [num1 - 2, num2],
        [num1, num2 + 2],
        [num1, num2 - 2],
      ];

      animateBlowUp(mainSquare, null, blowUpRange, () => {
        socket.emit('ability-blow-up', { card: '4,4', target: null, array: blowUpRange, damage: 5, roomid: room });
        blowUpRange.forEach(elem => {

          const ifCard = document.getElementById(`${elem[0]},${elem[1]}`);
          console.log(ifCard, elem);
          if(ifCard.childElementCount > 0){
            const cardy = ifCard.firstChild;
            const newHealth = cardy.getAttribute('data-health') - 5;
            targetPassiveAbility(5, cardy)
            if(checkHealth(newHealth)){
              //socket.emit('remove-card', { attacked: cardy.id, roomid: room });
              cardy.remove();
            }
            else{
              cardy.setAttribute("data-health", newHealth);
              //socket.emit('attacked', { attacked: cardy.id, health: newHealth, roomid: room });
            }
          }
          // eventually make another updateFunction that causes radiation for a turn

        });
      });

      const moveableTurn = turnCounter + 1;
      const intoObject = [null, "4,4", 0, moveableTurn];
      socket.emit("update-gameObj", { arr: intoObject, roomid: room, addon: "radiation" });

    });
  }
}

function updateRadiation(obj){
  console.log("UPDATERADIATION", obj);
  if(obj[`radiation${turnCounter}`]){
    obj[`radiation${turnCounter}`].forEach((x, y) => {
      const target = document.getElementById(x[1]);
      const mainSquare = document.getElementById('4,4');
      const num1 = Number(target.id[0]);
      const num2 = Number(target.id[2]);

      const blowUpRange = [
        [num1 + 1, num2],
        [num1 - 1, num2],
        [num1, num2 + 1],
        [num1, num2 - 1],
        [num1, num2],
        [num1 + 1, num2 + 1],
        [num1 + 1, num2 - 1],
        [num1 - 1, num2 + 1],
        [num1 - 1, num2 - 1],
        [num1 + 2, num2],
        [num1 - 2, num2],
        [num1, num2 + 2],
        [num1, num2 - 2],
      ];

      animateBlowUp(mainSquare, null, blowUpRange, () => {
        socket.emit('ability-blow-up', { card: '4,4', target: null, array: blowUpRange, damage: 1, roomid: room });
        blowUpRange.forEach(elem => {
          const ifCard = document.getElementById(`${elem[0]},${elem[1]}`);
          if(ifCard.childElementCount > 0){
            const cardy = ifCard.firstChild;

            const newHealth = cardy.getAttribute('data-health') - 1;
            targetPassiveAbility(1, cardy)
            if(checkHealth(newHealth)){
              //socket.emit('remove-card', { attacked: cardy.id, roomid: room });
              cardy.remove();
            }
            else{
              cardy.setAttribute("data-health", newHealth);
              //socket.emit('attacked', { attacked: cardy.id, health: newHealth, roomid: room });
            }
          }
        });
      });
    });
  }
}

function updateKnockedAbility(obj){
  console.log("UPDATE KNOCK ABILITY", obj);

  if(obj[`knock-ability${turnCounter}`]){
    obj[`knock-ability${turnCounter}`].forEach((x, y) => {
      const target = document.getElementById(x[1]);
      if(target){
        target.setAttribute('data-knockedability', false);
        socket.emit('knocked-ability', { target: x[1], roomid: room });
      }
    });
  }
}

function updateSapTower(obj){
  console.log("UPDATE TOWER", obj);

  if(obj[`tower${turnCounter}`]){
    obj[`tower${turnCounter}`].forEach((x, y) => {
      console.log('THIS IS X', x);
      const target = document.getElementById(x[0]);
      const moveableTurn = Number(x[3]) + 2;
      console.log(moveableTurn, 'moveableTurn');
      if(target && target.parentElement.className.includes('cell')){
        // if the target exists and is on the board

        let onSquareOne = Number(target.parentElement.id[0]);
        let onSquareTwo = Number(target.parentElement.id[2]);
        const squares = [
          [onSquareOne, onSquareTwo - 1],
          [onSquareOne, onSquareTwo + 1],
          [onSquareOne - 1, onSquareTwo],
          [onSquareOne + 1, onSquareTwo],
          [onSquareOne - 1, onSquareTwo - 1],
          [onSquareOne - 1, onSquareTwo + 1],
          [onSquareOne + 1, onSquareTwo - 1],
          [onSquareOne + 1, onSquareTwo + 1]
        ];
        squares.forEach((elem) => {
          const squareId = `${elem[0]},${elem[1]}`;
          const square = document.getElementById(squareId);
          if(square && square.childElementCount > 0){
            const cardy = square.firstChild;
            const newHealth = cardy.getAttribute('data-health') - 2;
            targetPassiveAbility(2, cardy)
            if(checkHealth(newHealth)){
              console.log('emitting ability-remove, removing card');
              animateUseOfCard(target, cardy);
              socket.emit('ability-remove', { attacker: target.id, attacked: cardy.id, roomid: room });
              cardy.remove();
            }
            else{
              animateUseOfCard(target, cardy);
              cardy.setAttribute("data-health", newHealth);
              socket.emit('ability-attack', { attacker: target.id, attacked: cardy.id, health: newHealth, roomid: room });
            }
          }
        });

        const intoObject = [target.id, target.id, 0, moveableTurn];
        socket.emit("update-gameObj", { arr: intoObject, roomid: room, addon: "tower" });
        return;
      }
      else{
        // if not, remove tower from the gameObj
        console.log('no tower here');
        return;
      }
    });
  }
}

function updateFogAbility(obj){
  console.log("UPDATE FOG ABILITY");
  // const intoObject = [array, 0, 0, removeFogTurn];
  if(obj[`fog${turnCounter}`]){
    obj[`fog${turnCounter}`].forEach((x, y) => {
      x[0].forEach((elem) => {
        const square = document.getElementById(elem);
        square.classList.remove('fogged');

      });
      socket.emit('fog-removed', { arr: x[0], which: x[2], roomid: room });
    });
  }
}

function generateRandomString(length){
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz03456789';
  let result = '';
  for(let i = 0; i < length; i++){
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function onWin(id){
  if(id.includes("p1")){
    console.log('player 2 has won!');
    socket.emit('game-over', { winner: 'player2', roomid: room });
    whoWon('player2');
  }
  else{
    console.log('player 1 has won!');
    socket.emit('game-over', { winner: 'player1', roomid: room });
    whoWon('player1');
  }
}

function whoWon(winner){
  let content = document.getElementById("end-game-content");
  if(window.playerNumber == 1){

    if(winner === 'player1'){
      // this player has won
      endGameModal.style.display = "block";
      content.innerHTML = "<h2>You Win!</h2>";

    }

    else{
      // this player has lost
      endGameModal.style.display = "block";
      content.innerHTML = "<h2>You Lost..</h2>";
    }
  }

  else{
    if(winner === 'player1'){
      // this player has lost
      endGameModal.style.display = "block";
      content.innerHTML = "<h2>You Lost..</h2>";
    }

    else{
      // this player has won
      endGameModal.style.display = "block";
      content.innerHTML = "<h2>You Win!</h2>";
    }
  }

}

function deadCardsFunc(arr){
  arr.forEach(card => {
    const name = cardAbilities[card.getAttribute('data-ability')]?.passive;
    if(name && typeof name.onDeath === 'function'){
      name.onDeath(card);
      return;
    }
  });
  arr = [];
  return
}

function attackerPassiveAbility(card, target){
  const name = cardAbilities[card.getAttribute('data-ability')]?.passive;
  if(name && typeof name.attackedCard === 'function'){
    name.attackedCard(card, target);
  }

}

function targetPassiveAbility(card, target){
  const name = cardAbilities[target.getAttribute('data-ability')]?.passive;
  console.log("WHATS YO NAME", name)
  if(name && typeof name.whenAttacked === 'function'){
    name.whenAttacked(card, target);
    console.log('this ran bruh');
  }
}

function createCardEventListener(card){
  // this function will get a card and put all card event listeners onto it
  // so then i don't have to manually type it each time
  // also easier for people who make card decks on this game (if they need it)
  // what's up party people

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = card.outerHTML;
  const newCard = tempDiv.firstChild;
  console.log("NEW CARD", newCard);

  newCard.addEventListener("click", (e) => {
    e.stopPropagation();
    handleCardClick(e);
  });

  newCard.addEventListener("mouseover", (e) => {
    handleCardMouseOver(e);
    const blank = newCard.querySelector('img');
    hoverTimeout = setTimeout(() => {
      entirename.textContent = newCard.getAttribute('data-name');
      entireimage.src = blank.src;
      entirehealth.textContent = `Health: ${newCard.getAttribute("data-health")}`;
      entireattack.textContent = `Attack: ${newCard.getAttribute("data-attack")}`;
      entiremana.textContent = `Mana: ${newCard.getAttribute("data-mana")}`;
      entiremovement.textContent = `Movement: ${newCard.getAttribute("data-movement")}`;
      entiredescription.textContent = newCard.getAttribute("data-description");
      entire.style.visibility = "visible";
    }, 90);
  });

  newCard.addEventListener("mouseout", (e) => {
    entire.style.visibility = "hidden";
    handleCardMouseOut(e);
  });

  newCard.addEventListener("dragstart", drag);
  newCard.setAttribute("draggable", "true");

  newCard.setAttribute("data-placed", true);


}


// GAME LOGIC END

// ANIMATION OF CARDS

function animateAttack(attackerEl, targetEl, callback){
  console.log(attackerEl, targetEl);
  queueAnimation((done) => {
    const attackerRect = attackerEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // Clone attacker to animate separately
    const clone = attackerEl.cloneNode(true);
    document.body.appendChild(clone);

    // Set clone's starting style to match the attacker
    clone.style.position = 'absolute';
    clone.style.top = `${attackerRect.top}px`;
    clone.style.left = `${attackerRect.left}px`;
    clone.style.width = `${attackerRect.width}px`;
    clone.style.height = `${attackerRect.height}px`;
    clone.style.zIndex = 9999;
    clone.style.transition = 'top 0.22s ease, left 0.22s ease';

    attackerEl.style.visibility = 'hidden';

    void clone.offsetWidth;

    clone.style.top = `${targetRect.top}px`;
    clone.style.left = `${targetRect.left}px`;

    clone.addEventListener('transitionend', function firstStep(){
      clone.removeEventListener('transitionend', firstStep);

      setTimeout(() => {
        clone.style.top = `${attackerRect.top}px`;
        clone.style.left = `${attackerRect.left}px`;

        clone.addEventListener('transitionend', function secondStep(){
          clone.removeEventListener('transitionend', secondStep);
          attackerEl.style.visibility = 'visible';
          clone.remove();
          done();
          if(callback) callback();
        });
      }, 35);
    });
  });
}

function animateDrawCard1(card, hand){
  queueAnimation((done) => {
    document.body.appendChild(card);

    const deckRect = cardDeck1.getBoundingClientRect();

    card.style.position = 'absolute';
    card.style.top = `${deckRect.top}px`;
    card.style.left = `${deckRect.left}px`;
    card.style.transition = 'all 0.28s ease-out';
    card.style.zIndex = 1000;

    void card.offsetWidth;

    let targetLeft, targetTop;

    const lastCard = hand.lastChild;

    if(lastCard){
      const lastCardRect = lastCard.getBoundingClientRect();
      targetLeft = lastCardRect.right + 10;
      targetTop = lastCardRect.top;
    }
    else{
      const handRect = hand.getBoundingClientRect();
      targetLeft = handRect.left + (handRect.width / 2) - 45;
      targetTop = handRect.top + (handRect.height / 2) - 30;
    }

    card.style.top = `${targetTop}px`;
    card.style.left = `${targetLeft}px`;

    card.addEventListener('transitionend', function firstStep(){
      card.removeEventListener('transitionend', firstStep);

      card.style.position = '';
      card.style.top = '';
      card.style.left = '';
      card.style.transition = '';
      card.style.zIndex = '';

      hand.appendChild(card);
      done();
    });
  });

}

function animateDrawCard2(card, hand){
  queueAnimation((done) => {
    document.body.appendChild(card);

    const deckRect = cardDeck2.getBoundingClientRect();

    card.style.position = 'absolute';
    card.style.top = `${deckRect.top}px`;
    card.style.left = `${deckRect.left}px`;
    card.style.transition = 'all 0.28s ease-out';
    card.style.zIndex = 1000;

    void card.offsetWidth;

    let targetLeft, targetTop;

    const lastCard = hand.lastChild;

    if(lastCard){
      const lastCardRect = lastCard.getBoundingClientRect();
      targetLeft = lastCardRect.right + 10; 
      targetTop = lastCardRect.top;
    }
    else{
      const handRect = hand.getBoundingClientRect();
      targetLeft = handRect.left + (handRect.width / 2) - 45;  // 50 = half of card width
      targetTop = handRect.top + (handRect.height / 2) - 30;
    }

    card.style.top = `${targetTop}px`;
    card.style.left = `${targetLeft}px`;

    card.addEventListener('transitionend', function firstStep(){
      card.removeEventListener('transitionend', firstStep);
      card.style.position = '';
      card.style.top = '';
      card.style.left = '';
      card.style.transition = '';
      card.style.zIndex = '';

      hand.appendChild(card);
      done();
    });
  })

}

function animateFlipAndShow(card, hand){ // this is if ability card in hand
  if(!card.parentElement.id.includes("hand")){
    return;
  }
  console.log('ts running', card, hand);
  
  const parent = document.getElementById(card.parentElement.id);

  const index = Array.from(parent.children).indexOf(card);
  console.log('emmitting', index);
  socket.emit('flip-card', { card: card.outerHTML, handid: hand, num: index, roomid: room });

}

function animateUseOfCard(card, target, callback){
  // this code is redundant, just call animateFlipAndShow();
  console.log('animateUseOfCard');
  console.log(card, target);

  queueAnimation((done) => {
    if(card.parentElement.id.includes("hand")){
      console.log("KEEP CHANGE FLIP");
      animateFlipAndShow(card, card.parentElement.id);
    }

    if(!target){
      // make the card just shake
      card.style.animation = "shake 0.5s";
      card.addEventListener('animationend', function firstStep(){
        card.removeEventListener('animationend', firstStep);
        done();
        if(callback) callback();
        return;
      });
      return;
    }

    if(card.getAttribute("data-health") == 0){
      // move the card over to the target and then card disappears
      console.log("the card has 0 hp, so also in hand");

      const targetRect = target.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const clone = card.cloneNode(true);
      document.body.appendChild(clone);
      clone.style.position = 'absolute';
      clone.style.top = `${cardRect.top}px`;
      clone.style.left = `${cardRect.left}px`;
      clone.style.width = `${cardRect.width}px`;
      clone.style.height = `${cardRect.height}px`;
      clone.style.zIndex = 9999;
      clone.style.transition = 'top 0.4s ease, left 0.4s ease';

      card.style.visibility = "hidden";

      void card.offsetWidth;

      clone.style.top = `${targetRect.top}px`;
      clone.style.left = `${targetRect.left}px`;

      clone.addEventListener('transitionend', function firstStep(){
        clone.removeEventListener('transitionend', firstStep);
        card.style.visibility = 'visible';
        clone.remove();
        done();
        if(callback) callback();
      });
      return;
    }

    const cardRect = card.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const project = document.createElement("div");
    project.classList.add("projectile");
    document.body.appendChild(project);

    project.style.left = `${cardRect.left + cardRect.width / 2}px`;
    project.style.top = `${cardRect.top + cardRect.height / 2}px`;

    void project.offsetWidth;

    project.style.left = `${targetRect.left + targetRect.width / 2}px`;
    project.style.top = `${targetRect.top + targetRect.height / 2}px`;

    project.addEventListener('transitionend', () => {
      project.remove();
      done();
      if(callback) callback();
    });
  });
  return;

}

function animateUseOfCardOpponentSide(card, target, callback){
  // this code is redundant, just call animateFlipAndShow();
  console.log('animateUseOfCard');
  console.log(card, target);

  queueAnimation((done) => {
    if(!target){
      // make the card just shake
      card.style.animation = "shake 0.5s";
      card.addEventListener('animationend', function firstStep(){
        card.removeEventListener('animationend', firstStep);
        done();
        if(callback) callback();
        return;
      });
      return;
    }

    if(card.getAttribute("data-health") == 0){
      // move the card over to the target and then card disappears
      console.log("the card has 0 hp, so also in hand");

      const targetRect = target.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      const clone = card.cloneNode(true);
      document.body.appendChild(clone);
      clone.style.position = 'absolute';
      clone.style.top = `${cardRect.top}px`;
      clone.style.left = `${cardRect.left}px`;
      clone.style.width = `${cardRect.width}px`;
      clone.style.height = `${cardRect.height}px`;
      clone.style.zIndex = 9999;
      clone.style.transition = 'top 0.4s ease, left 0.4s ease';

      card.style.visibility = "hidden";

      void card.offsetWidth;

      clone.style.top = `${targetRect.top}px`;
      clone.style.left = `${targetRect.left}px`;

      clone.addEventListener('transitionend', function firstStep(){
        clone.removeEventListener('transitionend', firstStep);
        card.style.visibility = 'visible';
        clone.remove();
        done();
        if(callback) callback();
      });
      return;
    }

    const cardRect = card.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const project = document.createElement("div");
    project.classList.add("projectile");
    document.body.appendChild(project);

    project.style.left = `${cardRect.left + cardRect.width / 2}px`;
    project.style.top = `${cardRect.top + cardRect.height / 2}px`;

    void project.offsetWidth;

    project.style.left = `${targetRect.left + targetRect.width / 2}px`;
    project.style.top = `${targetRect.top + targetRect.height / 2}px`;

    project.addEventListener('transitionend', () => {
      project.remove();
      done();
      if(callback) callback();
    });
    return;
  });

}

function animateMovementOfCard(card, from, to, onComplete){
  // queueAnimation((done) => {}) idk maybe
  if(from.id.includes("hand")){
    //console.log('running animate flip and show');
    //animateFlipAndShow(card, card.parentElement.id);
    console.log(card, from, to);

    const toRect = to.getBoundingClientRect();
    const fromRect = from.firstChild.getBoundingClientRect();

    const clone = card.cloneNode(true);
    document.body.appendChild(clone);
    clone.style.position = 'absolute';
    clone.style.top = `${fromRect.top}px`;
    clone.style.left = `${fromRect.left}px`;
    clone.style.width = `85px`;
    clone.style.height = `85px`;
    clone.style.zIndex = 9999;
    clone.style.transition = 'top 0.4s ease, left 0.4s ease';

    card.style.visibility = "hidden";
    void clone.offsetWidth;

    clone.style.top = `${toRect.top}px`;
    clone.style.left = `${toRect.left}px`;

    clone.addEventListener('transitionend', function firstStep(){
      clone.removeEventListener('transitionend', firstStep);

      card.style.visibility = 'visible';
      clone.remove();
      if(typeof onComplete === 'function') onComplete();
    });
    return;
  }

  else{
    const toRect = to.getBoundingClientRect();
    const fromRect = from.getBoundingClientRect();

    const clone = card.cloneNode(true);
    document.body.appendChild(clone);

    clone.style.position = 'absolute';
    clone.style.top = `${fromRect.top}px`;
    clone.style.left = `${fromRect.left}px`;
    clone.style.width = `${fromRect.width}px`;
    clone.style.height = `${fromRect.height}px`;
    clone.style.zIndex = 9999;
    clone.style.transition = 'top 0.4s ease, left 0.4s ease';

    card.style.visibility = "hidden";

    void clone.offsetWidth;

    clone.style.top = `${toRect.top}px`;
    clone.style.left = `${toRect.left}px`;
    clone.addEventListener('transitionend', function firstStep(){
      clone.removeEventListener('transitionend', firstStep);
      card.style.visibility = 'visible';
      clone.remove();
      if(typeof onComplete === 'function') onComplete();
    });
    return;
  }

}

function animateStealCard(card, hand){
  //document.body.appendChild(card);
  queueAnimation((done) => {
    const ownHand = document.getElementById(hand);

    const enemyCardRect = card.getBoundingClientRect();

    card.style.position = 'absolute';
    card.style.top = `${enemyCardRect.top}px`;
    card.style.left = `${enemyCardRect.left}px`;
    card.style.transition = 'all 0.34s ease-out';
    card.style.zIndex = 1000;

    void card.offsetWidth;

    let targetLeft, targetTop;

    const lastCard = ownHand.lastChild;

    if(lastCard){
      const lastCardRect = lastCard.getBoundingClientRect();
      targetLeft = lastCardRect.right + 10;
      targetTop = lastCardRect.top;
    }
    else{
      const handRect = ownHand.getBoundingClientRect();
      targetLeft = handRect.left + (handRect.width / 2) - 45;  // 50 = half of card width
      targetTop = handRect.top + (handRect.height / 2) - 30;
    }

    card.style.top = `${targetTop}px`;
    card.style.left = `${targetLeft}px`;

    card.addEventListener('transitionend', function firstStep(){
    card.removeEventListener('transitionend', firstStep);
      card.style.position = '';
      card.style.top = '';
      card.style.left = '';
      card.style.transition = '';
      card.style.zIndex = '';

      ownHand.appendChild(card);
      done();
    });
  });
}

function animateBlowUp(card, target, array, callback){
  const cardRect = card.getBoundingClientRect();
  /*
  so, one part of this animation will be if the card throws an explosive
  and the other part will be if the card IS the explosive
  */
  queueAnimation((done) => {

    if(!target){
      // this will just blow up the surrounding area
      array.forEach((elem) => {

        const square = document.getElementById(`${elem[0]},${elem[1]}`);
        const squareRect = square.getBoundingClientRect();

        const project = document.createElement("div");
        project.classList.add("projectile");
        document.body.appendChild(project);

        project.style.left = `${cardRect.left + cardRect.width / 2}px`;
        project.style.top = `${cardRect.top + cardRect.height / 2}px`;

        void project.offsetWidth;

        project.style.left = `${squareRect.left + squareRect.width / 2}px`;
        project.style.top = `${squareRect.top + squareRect.height / 2}px`;

        project.addEventListener('transitionend', () => {
          project.remove();
        });
      });
      done();
      if(callback) callback();
      return;
    }

    else{
      const targetRect = target.getBoundingClientRect();

      const project = document.createElement("div");
      project.classList.add("projectile");
      document.body.appendChild(project);
      console.log("PROJECT, ELEM", project, target.id);

      project.style.left = `${cardRect.left + cardRect.width / 2}px`;
      project.style.top = `${cardRect.top + cardRect.height / 2}px`;

      void project.offsetWidth;

      project.style.left = `${targetRect.left + targetRect.width / 2}px`;
      project.style.top = `${targetRect.top + targetRect.height / 2}px`;

      project.addEventListener('transitionend', () => {
        console.log('removing project', project, target.id);
        project.remove();
        console.log('project removed');
        array.forEach((elem, y) => {
          const square = document.getElementById(`${elem[0]},${elem[1]}`);
          if(square.id === target.id){
            return;
          }
          const squareRect = square.getBoundingClientRect();

          const projected = document.createElement("div");
          projected.classList.add("projectile");
          document.body.appendChild(projected);
          console.log("PROJECTILE, ELEM AND INDEX:", projected, square, y);

          projected.style.left = `${targetRect.left + targetRect.width / 2}px`;
          projected.style.top = `${targetRect.top + targetRect.height / 2}px`;

          void projected.offsetWidth;

          projected.style.left = `${squareRect.left + squareRect.width / 2}px`;
          projected.style.top = `${squareRect.top + squareRect.height / 2}px`;

          projected.addEventListener('transitionend', () => {
            console.log('REMOVING PROJECTED', projected, square, y);
            projected.remove();
            console.log('projected removed');
          });
        });
      });
      done();
      if(callback) callback();
      return;
    }
  });
}

function animationQueue(){
  if(processingQ || actionQ.length === 0) return;

  processingQ = true;

  const next = actionQ.shift();

  next(() => {
    processingQ = false;
    animationQueue();
  });

}

function queueAnimation(fn){
  console.log("QUEUEANIMATION REGISTERED");
  actionQ.push(fn);
  animationQueue();
}

// ANIMATION OF CARDS END

// CARD ABILITY FUNCTIONS

window.explodeSelf = function(damage, squareid){
  // blow up in a 3x3 radius (could make this more customizable)
  const num1 = Number(squareid[0]);
  //console.log("WINDOWexplodeSelf NOW");
  //console.log(num1, "NUM 1");

  if(whosTurn === 1){
    if(num1 === 7){
      const first = Number(squareid[0] - 1);
      const second = Number(squareid[2]);
      const blowUpRange = [];

      blowUpRange.push([first, second - 1]);
      blowUpRange.push([first, second + 1]);
      blowUpRange.push([first + 1, second]);
      blowUpRange.push([first - 1, second]);
      
      blowUpRange.push([first, second]);

      blowUpRange.push([first - 1, second + 1]);
      blowUpRange.push([first + 1, second + 1]);
      blowUpRange.push([first + 1, second - 1]);
      blowUpRange.push([first - 1, second - 1]);
      //console.log(blowUpRange, "BLOW UP RANGE");

      blowUpRange.forEach(elem => {
        const ifCard = document.getElementById(`${elem[0]},${elem[1]}`);
        //console.log(ifCard);
        if(ifCard.childElementCount > 0){
          const card = ifCard.firstChild;
          //console.log(card);
          const newHealth = card.getAttribute('data-health') - damage;
          if(checkHealth(newHealth)){
            socket.emit('remove-card', { attacked: card.id, roomid: room });
            card.remove();
          }
          else{
            card.setAttribute("data-health", newHealth);
            socket.emit('attacked', { attacked: card.id, health: newHealth, roomid: room });
          }
        }

      });
      
    }
  }

  else{
    if(num1 === 1){
      const first = Number(squareid[0] + 1);
      const second = Number(squareid[2]);
      const blowUpRange = [];

      blowUpRange.push([first, second - 1]);
      blowUpRange.push([first, second + 1]);
      blowUpRange.push([first + 1, second]);
      blowUpRange.push([first - 1, second]);
      
      blowUpRange.push([first, second]);

      blowUpRange.push([first - 1, second + 1]);
      blowUpRange.push([first + 1, second + 1]);
      blowUpRange.push([first + 1, second - 1]);
      blowUpRange.push([first - 1, second - 1]);
      //console.log(blowUpRange, "BLOW UP RANGE");

      blowUpRange.forEach(elem => {
        const ifCard = document.getElementById(`${elem[0]},${elem[1]}`);
        //console.log(ifCard);
        if(ifCard.childElementCount > 0){
          const card = ifCard.firstChild;
          //console.log(card);
          const newHealth = card.getAttribute('data-health') - damage;
          if(checkHealth(newHealth)){
            socket.emit('remove-card', { attacked: card.id, roomid: room });
            card.remove();
          }
          else{
            card.setAttribute("data-health", newHealth);
            socket.emit('attacked', { attacked: card.id, health: newHealth, roomid: room });
          }
        }

      });
    }

  }

}

window.gambleDraw2 = function(card){
  if(alreadyDrew === 0 || actionsObj.abilities.includes(card.id)){
    return;
  }

  if(card.parentElement.className === "cell"){
    const hOL = Math.floor(Math.random() * 21);

    if(hOL < 10){
      alreadyDrew = 0;
      console.log("alreadyDrew", alreadyDrew);
      return;
    }

    if(hOL > 10){
      animateUseOfCard(card, null, () => {
        alreadyDrew = 2;
        console.log("alreadyDrew", alreadyDrew);
        return;
      });
    }
  }
}

window.shoot = function(card, target){
  // eventually make this so they can modify damage and range

  console.log("RIGHT HERE", actionsObj);

  if(Number(card.getAttribute('data-mana')) < 1){
    console.log('not enough mana to shoot');
    return;
  }
  console.log(card, target.firstChild);

  const cardNum1 = Number(card.parentElement.id[0]);
  const cardNum2 = Number(card.parentElement.id[2]);
  const targetNum1 = Number(target.parentElement.id[0]);
  const targetNum2 = Number(target.parentElement.id[2]);

  console.log('past card nums and target nums');

  const newNum1 = Math.abs(cardNum1 - targetNum1);
  const newNum2 = Math.abs(cardNum2 - targetNum2);

  console.log("past newnums");

  if(newNum1 > Number(card.getAttribute("data-abilityrange")) || newNum2 > Number(card.getAttribute("data-abilityrange"))){
    console.log('not in range to shoot');
    return;
  }

  console.log('past in range to shoot');

  if(actionsObj.abilities.includes(card.id)){
    console.log('cant shoot again');
    return;
  }

  console.log('past cannae shoot again');

  //turnEventsAbility(card, target);
  const mana = Number(card.getAttribute('data-mana')) - 1;
  actionsObj.abilities.push(card.id);
  console.log("FOGGERS", card.getAttribute('data-fogged'));
  card.setAttribute('data-mana', mana);

  if(card.getAttribute('data-fogged') == 'true'){
    console.log('EMMITTING OUT OF FOG');
    socket.emit('out-of-fog', { card: card.outerHTML, square: card.parentElement.id, roomid: room });
    console.log('done with emitting out of fog');
  }
  console.log('again');

  animateUseOfCard(card, target.firstChild, () => {
    console.log('animating card');

    const newHealth = Number(target.firstChild.getAttribute('data-health')) - Number(card.getAttribute('data-abilityattack'));
    targetPassiveAbility(card.getAttribute('data-abilityattack'), target.firstChild);
    console.log(newHealth);

    if(checkHealth(newHealth)){
      console.log('emitting ability-remove');
      socket.emit('ability-remove', { attacker: card.id, attacked: target.firstChild.id, roomid: room });
      socket.emit('mana-card', { target: card.id, roomid: room, mana: mana });
      target.firstChild.remove();
      if(card.getAttribute('data-fogged') == 'true'){
        socket.emit('in-the-fog', { card: card.id, roomid: room });
      }
      return;
    }
    else{
      target.firstChild.setAttribute("data-health", newHealth);
      console.log('emitting ability-attack');
      socket.emit('ability-attack', { attacker: card.id, attacked: target.firstChild.id, health: newHealth, roomid: room });
      socket.emit('mana-card', { target: card.id, roomid: room, mana: mana });
      if(card.getAttribute('data-fogged') == 'true'){
        socket.emit('in-the-fog', { card: card.id, roomid: room });
      }
      return;
    }
    return;
  });
  return;
}

window.showEnemyHand = function(card){
  const whoseHand = card.parentElement.id;
  console.log('showEnemyHand ran', whoseHand)
  animateUseOfCard(card, null, () => {
    if(whoseHand == 'hand1'){
      socket.emit('show-hand', { card: card.id, roomid: room, hand: 'hand2' });
    }
    else{
      socket.emit('show-hand', { card: card.id, roomid: room, hand: 'hand1' });
    }
    dead[card.id] = alive[card.id];
    delete alive[card.id];
    card.remove();
    return;
  });
}

window.deployWholeHand = function(card){
  const whoseHand = document.getElementById(card.parentElement.id);
  console.log('deployWholeHand ran', whoseHand);
  const pushCards = Array.from(whoseHand.children);

  console.log(pushCards);

  if(card.parentElement.id == 'hand1'){
    const square1 = document.getElementById('1,1');
    const square2 = document.getElementById('1,2');
    const square3 = document.getElementById('1,3');
    const square5 = document.getElementById('1,5');
    const square6 = document.getElementById('1,6');
    const square7 = document.getElementById('1,7');
    const squares = [square1, square2, square3, square5, square6, square7];
    let taken = 0;
    dead[card.id] = alive[card.id];
    delete alive[card.id];

    animateUseOfCard(card, null, () => {
      socket.emit('ability-remove', { attacked: card.id, roomid: room });
      card.remove();
    });

    pushCards.forEach((cardy, index) => {

      console.log(cardy.getAttribute('data-health'));
      if(cardy.getAttribute('data-determiner') != "attacker"){
        console.log('this cardy cannot be deployed');
        return;
      }

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cardy.outerHTML;
      const newCard = tempDiv.firstChild;

      if(squares[taken]){
        while(squares[taken].hasChildNodes()){
          taken += 1
        }

        console.log('these are the kids', squares[taken].children)

        newCard.addEventListener("click", (e) => {
          e.stopPropagation();
          handleCardClick(e);
        });

        newCard.addEventListener("mouseover", (e) => {
          console.log('new card!!', newCard)
          const blank = newCard.querySelector('img');
          console.log('blank dawg', blank);
          entirename.textContent = newCard.getAttribute('data-name');
          entireimage.src = blank.src;
          entirehealth.textContent = `Health: ${newCard.getAttribute("data-health")}`;
          entireattack.textContent = `Attack: ${newCard.getAttribute("data-attack")}`;
          entiremana.textContent = `Mana: ${newCard.getAttribute("data-mana")}`;
          entiremovement.textContent = `Movement: ${newCard.getAttribute("data-movement")}`;
          entiredescription.textContent = `${newCard.getAttribute("data-description")}`;
          entire.style.visibility = "visible";
          handleCardMouseOver(e);
        });

        newCard.addEventListener("mouseout", (e) => {
          entire.style.visibility = "hidden";
          handleCardMouseOut(e);
        });

        newCard.addEventListener("dragstart", drag);
        newCard.setAttribute("draggable", "true");

        cardy.remove();
        squares[taken].appendChild(newCard);
        socket.emit('card-moved', { elem: squares[taken].id, moved: newCard.outerHTML, movedto: 'hand1', roomid: room });
        newCard.setAttribute("data-placed", true);
        taken += 1;
        return;
        //turnEventsAbility(card);
        return;
      }
    });
  }

  else{
    const square1 = document.getElementById('7,7');
    const square2 = document.getElementById('7,6');
    const square3 = document.getElementById('7,5');
    const square5 = document.getElementById('7,3');
    const square6 = document.getElementById('7,2');
    const square7 = document.getElementById('7,1');
    const squares = [square1, square2, square3, square5, square6, square7];
    let taken = 0;

    dead[card.id] = alive[card.id];
    delete alive[card.id];

    animateUseOfCard(card, null, () => {
      socket.emit('ability-remove', { attacked: card.id, roomid: room });
      card.remove();
    });

    pushCards.forEach((cardy, index) => {

      if(cardy.getAttribute('data-determiner') != "attacker"){
        console.log('this card cannot be deployed');
        return;
      }

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cardy.outerHTML;
      const newCard = tempDiv.firstChild;

      if(squares[taken]){
        while(squares[taken].hasChildNodes()){
          taken += 1
        }

        console.log('these are the kids', squares[taken].children)

        newCard.addEventListener("click", (e) => {
          e.stopPropagation();
          handleCardClick(e);
        });

        newCard.addEventListener("mouseover", (e) => {
          const blank = newCard.querySelector('img');
          entirename.textContent = newCard.getAttribute('data-name');
          entireimage.src = blank.src;
          entirehealth.textContent = `Health: ${newCard.getAttribute("data-health")}`;
          entireattack.textContent = `Attack: ${newCard.getAttribute("data-attack")}`;
          entiremana.textContent = `Mana: ${newCard.getAttribute("data-mana")}`;
          entiremovement.textContent = `Movement: ${newCard.getAttribute("data-movement")}`;
          entiredescription.textContent = `${newCard.getAttribute("data-description")}`; // at somme point man
          entire.style.visibility = "visible";
          handleCardMouseOver(e);
        });

        newCard.addEventListener("mouseout", (e) => {
          entire.style.visibility = "hidden";
          handleCardMouseOut(e);
        });

        newCard.addEventListener("dragstart", drag);
        newCard.setAttribute("draggable", "true");

        cardy.remove();
        squares[taken].appendChild(newCard);
        socket.emit('card-moved', { elem: squares[taken].id, moved: newCard.outerHTML, movedto: 'hand2', roomid: room });
        newCard.setAttribute("data-placed", true);
        taken += 1;
        return;
      }
    });
  }

}

window.glueSquare = function(card, target){
  const oldMovement = target.getAttribute("data-movement");
  const newMovement = 0;
  const moveableTurn = turnCounter + 1;
  const intoObject = [card.id, target.id, oldMovement, moveableTurn];

  console.log(gameObj);

  // need to update gameObj on server side
  animateUseOfCard(card, target, () => {
    dead[card.id] = alive[card.id];
    delete alive[card.id];
    target.setAttribute("data-movement", newMovement);
    // at some point update the sockets to this
    socket.emit("update-gameObj", { arr: intoObject, roomid: room, addon: "movement"});
    socket.emit("movement-status", { target: target.id, movement: newMovement, roomid: room });
    card.remove();
  });
  //turnEventsAbility(card, target);

}

window.giveStim = function(card, target){
  const newMovement = Number(target.firstChild.getAttribute('data-movement')) + 1;
  const newHealth = Number(target.firstChild.getAttribute('data-health')) - Number(card.getAttribute('data-abilityattack'));

  animateUseOfCard(card, target, () => {
    targetPassiveAbility(card, target.firstChild);
    if(checkHealth(newHealth)){
      socket.emit('ability-remove', { attacker: card.id, attacked: target.firstChild.id, roomid: room });
      target.firstChild.remove();
    }
    else{
      target.firstChild.setAttribute("data-health", newHealth);
      target.firstChild.setAttribute("data-movement", newMovement);
      socket.emit('ability-done', { attacker: card.id, attacked: target.firstChild.id, health: newHealth, roomid: room });
      socket.emit('movement-status', { target: target.firstChild.id, movement: newMovement, roomid: room });
    }

    dead[card.id] = alive[card.id];
    delete alive[card.id];
    card.remove();
    return;
  });
  //turnEventsAbility(card, target);

  

}

window.wallOfThree = function(card, target){
  const num1 = Number(target.id[0]);
  const num2 = Number(target.id[2]);
  // use card mana to dictate how much health card has
  const moveableTurn = turnCounter + 3;
  console.log('THIS THE TARGET', target)
  let indexOfCard = Array.from(card.parentElement.children).indexOf(card);
  console.log("WALL OF 3", indexOfCard)

  const targetSquare = document.getElementById(`${num1},${num2}`);
  const targetSide1 = document.getElementById(`${num1},${num2 - 1}`);
  const targetSide2 = document.getElementById(`${num1},${num2 + 1}`);
  const squares = [targetSquare, targetSide1, targetSide2];
  const hand = card.parentElement.id;

  animateUseOfCardOpponentSide(card, target, () => {
    squares.forEach((elem, index) => {
      if(!elem || elem.hasChildNodes()){
        console.log('already summ there')
        return;
      }

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = card.outerHTML;
      const newCard = tempDiv.firstChild;
      const newHealth = newCard.getAttribute("data-mana");
      newCard.setAttribute("data-health", newHealth);
      newCard.id = `${newCard.id}${index}`;

      newCard.addEventListener("click", (e) => {
        e.stopPropagation();
        handleCardClick(e);
      });

      newCard.addEventListener("mouseover", (e) => {
        const blank = newCard.querySelector('img');
        entirename.textContent = newCard.getAttribute('data-name');
        entireimage.src = blank.src;
        entirehealth.textContent = `Health: ${newCard.getAttribute("data-health")}`;
        entireattack.textContent = `Attack: ${newCard.getAttribute("data-attack")}`;
        entiremana.textContent = `Mana: ${newCard.getAttribute("data-mana")}`;
        entiremovement.textContent = `Movement: ${newCard.getAttribute("data-movement")}`;
        entiredescription.textContent = `${newCard.getAttribute("data-description")}`; // at somme point man
        entire.style.visibility = "visible";
        handleCardMouseOver(e);
      });

      newCard.addEventListener("mouseout", (e) => {
        entire.style.visibility = "hidden";
        handleCardMouseOut(e);
      });

      newCard.addEventListener("dragstart", drag);
      newCard.setAttribute("draggable", "true");

      newCard.setAttribute("data-placed", true);

      elem.appendChild(newCard);
      console.log('target.firstchild', target.firstChild.id);

      const intoObject = [newCard.id, target.firstChild.id, 0, moveableTurn];
      socket.emit("update-gameObj", { arr: intoObject, roomid: room, addon: "remove" });

      if(index < 1){
        socket.emit("card-moved", { elem: elem.id, moved: newCard.outerHTML, movedto: hand, idx: indexOfCard, roomid: room });
        //{ elem: e.currentTarget.id, moved: card.outerHTML, movedto: card.parentElement.id, roomid: room });
      }

      else{
        socket.emit("card-moved", { elem: elem.id, moved: newCard.outerHTML, movedto: hand, roomid: room, decide: true });
      }
      return;
    });
  });

  //turnEventsAbility(card, target);
  dead[card.id] = alive[card.id];
  delete alive[card.id];
  card.remove();

  return;
}

window.eviscerate = function(card, target){ 
  const num1 = Number(target.id[0]);
  const num2 = Number(target.id[2]);
  const alt1 = Number(card.parentElement.id[0]);
  const alt2 = Number(card.parentElement.id[2]);

  const newNum1 = Math.abs(alt1 - num1);
  const newNum2 = Math.abs(alt2 - num2);

  if(newNum1 > 1 || newNum2 > 1){
    console.log('not in range to eviscerate');
    return;
  }
  //turnEventsAbility(card, target);

  const blowUpRange = [
    [num1 + 1, num2],
    [num1 - 1, num2],
    [num1, num2 + 1],
    [num1, num2 - 1],
    [num1, num2],
    [num1 + 1, num2 + 1],
    [num1 + 1, num2 - 1],
    [num1 - 1, num2 + 1],
    [num1 - 1, num2 - 1]
  ];

  animateBlowUp(card, target, blowUpRange, () => {
    console.log('eviscerate ran');
    socket.emit('ability-blow-up', { card: card.id, target: null, array: blowUpRange, damage: damage, roomid: room });
    blowUpRange.forEach(elem => {
      const ifCard = document.getElementById(`${elem[0]},${elem[1]}`);

      if(ifCard.childElementCount > 0){
        const cardy = ifCard.firstChild;
        const newHealth = cardy.getAttribute('data-health') - 4;
        targetPassiveAbility(4, cardy);
        if(checkHealth(newHealth)){
          //socket.emit('remove-card', { attacked: cardy.id, roomid: room });
          dead[cardy.id] = alive[cardy.id];
          delete alive[cardy.id];
          cardy.remove();
        }
        else{
          cardy.setAttribute("data-health", newHealth);
          //socket.emit('attacked', { attacked: cardy.id, health: newHealth, roomid: room });
        }
        delete abilityObj[card.id];
      }
    });
  });
}

window.implode = function(card, target){

  if(target.id != card.parentElement.id){
    console.log('cant blow up there');
    return;
  }

  const num1 = Number(target.id[0]);
  const num2 = Number(target.id[2]);

  const blowUpRange = [
    [num1 + 1, num2],
    [num1 - 1, num2],
    [num1, num2 + 1],
    [num1, num2 - 1],
    [num1, num2],
    [num1 + 1, num2 + 1],
    [num1 + 1, num2 - 1],
    [num1 - 1, num2 + 1],
    [num1 - 1, num2 - 1]
  ];

  animateBlowUp(card, null, blowUpRange, () => {
    socket.emit('ability-blow-up', { card: card.id, target: null, array: blowUpRange, damage: damage, roomid: room });
  //turnEventsAbility(card, target);

    blowUpRange.forEach(elem => {
    const ifCard = document.getElementById(`${elem[0]},${elem[1]}`);

    if(ifCard.childElementCount > 0){
      const cardy = ifCard.firstChild;

      const newHealth = cardy.getAttribute('data-health') - 4;
      targetPassiveAbility(4, cardy);
      if(checkHealth(newHealth)){
        dead[cardy.id] = alive[cardy.id];
        delete alive[cardy.id];
        cardy.remove();
      }
      else{
        cardy.setAttribute("data-health", newHealth);
      }
      delete abilityObj[card.id];
      return;
    }
    });
  });
  return;

  
}

window.nuke = function(card, target){
  const moveableTurn = turnCounter + 2;
//turnEventsAbility(card, target);
  animateUseOfCard(card, target, () => {
    const intoObject = [card, "4,4", 0, moveableTurn];
    socket.emit("update-gameObj", { arr: intoObject, roomid: room, addon: "blowup" });
    dead[card.id] = alive[card.id];
    delete alive[card.id];
    socket.emit('ability-remove', { attacked: card.id, attacker: null, roomid: room });
    card.remove();
  });


  return;


}

window.jsnAbility = function(card){ 
  const num1 = Number(card.parentElement.id[0]);
  const num2 = Number(card.parentElement.id[2]);
  const damage = card.getAttribute('data-abilityattack');

  console.log(num1, num2)

  const blowUpRange = [
    [num1 + 1, num2],
    [num1 - 1, num2],
    [num1, num2 + 1],
    [num1, num2 - 1],
    [num1, num2],
    [num1 + 1, num2 + 1],
    [num1 + 1, num2 - 1],
    [num1 - 1, num2 + 1],
    [num1 - 1, num2 - 1]
  ];

  //animateUseOfCard(card, null);
  animateBlowUp(card, null, blowUpRange, () => {
  //turnEventsAbility(card);
    socket.emit('ability-blow-up', { card: card.id, target: null, array: blowUpRange, damage: damage, roomid: room });

    blowUpRange.forEach(elem => {
      const ifCard = document.getElementById(`${elem[0]},${elem[1]}`);

      if(ifCard.childElementCount > 0){
        const cardy = ifCard.firstChild;

        const newHealth = cardy.getAttribute('data-health') - card.getAttribute('data-abilityattack');
        targetPassiveAbility(card.getAttribute('data-abilityattack'), cardy)
        if(checkHealth(newHealth)){
          //socket.emit('remove-blow-up', { card: card.id, target: null, array: blowUpRange, roomid: room });
          dead[cardy.id] = alive[cardy.id];
          delete alive[cardy.id];
          cardy.remove();
        }
        else{
          cardy.setAttribute("data-health", newHealth);
        }
      }
    });
  });
  return;
}

window.manaCard = function(card, target){
  console.log("USEON", card, target);
  console.log('stilluseon', target.firstChild);
  const manana = document.getElementById(target.firstChild.id);
  const mana = 5;

  animateUseOfCard(card, target, () => {
  //turnEventsAbility(card, target);
    manana.setAttribute("data-mana", mana);
    socket.emit('mana-card', { target: target.firstChild.id, mana: mana, roomid: room });
    socket.emit('ability-done', { attacker: card.id, attacked: target.firstChild.id, roomid: room });
    dead[card.id] = alive[card.id];
    delete alive[card.id];

    card.remove();
    return;
  });
  return;

}

window.draw4 = function(card){
  if(alreadyDrew === 0 || turnCounter === 1){
    return;
  }
  else{
    animateUseOfCard(card, null, () => {
    //turnEventsAbility(card);
      alreadyDrew = 4;
      socket.emit('ability-remove', { attacked: card.id, roomid: room });
      dead[card.id] = alive[card.id];
      delete alive[card.id];
      card.remove();
    });
    return;
  }

}

window.heal3 = function(card, target){
  const healthed = document.getElementById(target.firstChild.id);
  const health = Number(healthed.getAttribute("data-health")) + 3;
  animateUseOfCard(card, target, () => {

  //turnEventsAbility(card, target);
    healthed.setAttribute("data-health", health);
    socket.emit('ability-done', { attacker: card.id, attacked: healthed.id, health: health, roomid: room });
    dead[card.id] = alive[card.id];
    delete alive[card.id];
    card.remove();
    return;
  });

  
}

window.seekAndDraw = function(card){ // add to queueAnimation()
  let popper = [];
  let last = null;
  const arr = [];
  //animateUseOfCard(card, null);
  //turnEventsAbility(card, target);

  closemodal.style.visibility = 'hidden';

  if(player1Turn && whosTurn == 1){
    for(let i=0; i < 6; i++){
      const bard = customDeck2.pop();
      arr.push(bard);
    }

    arr.forEach((elem, idx) => {
      const cardy = document.createElement("div");
      const cardyImg = document.createElement("img");

      cardyImg.src = elem.image;
      cardy.className = "card"; 
      cardyImg.style.width = "100%";
      cardyImg.style.height = "100%";
      cardy.style.border = `2px solid ${playerBorderColor}`;

      const randomString = generateRandomString(8);
      cardy.id = `p2${randomString}`; // do this tomorrow
      cardy.setAttribute('data-name', elem.name);
      cardy.setAttribute('data-health', elem.health);
      cardy.setAttribute('data-attack', elem.attack);
      cardy.setAttribute('data-mana', elem.mana);
      cardy.setAttribute('data-movement', elem.movement);
      cardy.setAttribute('data-description', elem.description);
      cardy.setAttribute('data-placed', null);

      cardy.addEventListener("mouseover", (e) => {
        entirename.textContent = cardy.getAttribute("data-name");
        entireimage.src = cardyImg.src;
        entirehealth.textContent = `Health: ${cardy.getAttribute("data-health")}`;
        entireattack.textContent = `Attack: ${cardy.getAttribute("data-attack")}`;
        entiremana.textContent = `Mana: ${cardy.getAttribute("data-mana")}`;
        entiremovement.textContent = `Movement: ${cardy.getAttribute("data-movement")}`;
        entiredescription.textContent = `${cardy.getAttribute("data-description")}`;
        entire.style.visibility = "visible";
      });

      cardy.addEventListener("mouseout", (e) => {
        entire.style.visibility = "hidden";
        handleCardMouseOut(e);
      });

      cardy.addEventListener("click", (e) => {
        const clicked = e.currentTarget;
        // so probably make one selected, and then make it equal to that
        if(popper.includes(clicked)){
          // if array already contains clicked, remove it from array
          popper = popper.filter(card => card !== clicked);
          clicked.classList.remove("highlight-square");
          closemodal.style.visibility = 'hidden';
          return;
        }

        if(popper.length < 2){
          // if array is less than 2, add clicked to array
          popper.push(clicked);
          clicked.classList.add("highlight-square");
          closemodal.style.visibility = 'hidden';
        }
        else if(popper.length < 2){
          popper.push(clicked);
          clicked.classList.add("highlight-square");
        }
        else{
          // if 2 cards already selected, remove them from array and only add newly clicked to array
          popper.forEach(card => card.classList.remove("highlight-square"));
          popper = [clicked];
          clicked.classList.add("highlight-square");
        }

        if(popper.length === 2){
          closemodal.innerHTML = "Select These 2 Cards"
          closemodal.style.visibility = 'visible';
          // if there are 2 cards selected, show button
        }
        else{
          // if above is not true, then do not show button
          closemodal.style.visibility = 'hidden';
        }

      });
      cardyImg.setAttribute("draggable", "false");
      cardy.appendChild(cardyImg);
      seekplacement.appendChild(cardy);

    });

  }
  else{
    for(let i=0; i < 6; i++){
      const bard = customDeck.pop();
      arr.push(bard);
    }

    arr.forEach((elem, idx) => {
      const cardy = document.createElement("div");
      const cardyImg = document.createElement("img");

      cardyImg.src = elem.image;
      cardy.className = "card"; 
      cardyImg.style.width = "100%";
      cardyImg.style.height = "100%";
      cardy.style.border = `2px solid ${playerBorderColor}`;

      const randomString = generateRandomString(8);
      cardy.id = `p2${randomString}`; // do this tomorrow
      cardy.setAttribute('data-name', elem.name);
      cardy.setAttribute('data-health', elem.health);
      cardy.setAttribute('data-attack', elem.attack);
      cardy.setAttribute('data-mana', elem.mana);
      cardy.setAttribute('data-movement', elem.movement);
      cardy.setAttribute('data-description', elem.description);
      cardy.ability = cardAbilities[elem.name];
      cardy.setAttribute('data-placed', null);

      cardy.addEventListener("mouseover", (e) => {
        entirename.textContent = cardy.getAttribute("data-name");
        entireimage.src = cardyImg.src;
        entirehealth.textContent = `Health: ${cardy.getAttribute("data-health")}`;
        entireattack.textContent = `Attack: ${cardy.getAttribute("data-attack")}`;
        entiremana.textContent = `Mana: ${cardy.getAttribute("data-mana")}`;
        entiremovement.textContent = `Movement: ${cardy.getAttribute("data-movement")}`;
        entiredescription.textContent = `${cardy.getAttribute("data-description")}`;
        entire.style.visibility = "visible";
      });

      cardy.addEventListener("mouseout", (e) => {
        entire.style.visibility = "hidden";
        handleCardMouseOut(e);
      });

      cardy.addEventListener("click", (e) => {
        const clicked = e.currentTarget;
        // so probably make one selected, and then make it equal to that
        if(popper.includes(clicked)){
          popper = popper.filter(card => card !== clicked);
          clicked.classList.remove("highlight-square");
          closemodal.style.visibility = 'hidden';
          return;
        }

        if(popper.length < 2){
          popper.push(clicked);
          clicked.classList.add("highlight-square");
          closemodal.style.visibility = 'hidden';
        }
        else if(popper.length < 2){
          popper.push(clicked);
          clicked.classList.add("highlight-square");
        }
        else{
          popper.forEach(card => card.classList.remove("highlight-square"));
          popper = [clicked];
          clicked.classList.add("highlight-square");
        }

        if(popper.length === 2){
          closemodal.style.visibility = 'visible';
        }
        else{
          closemodal.style.visibility = 'hidden';
        }
        
      });
      cardyImg.setAttribute("draggable", "false");
      cardy.appendChild(cardyImg);
      seekplacement.appendChild(cardy);

    });

  }
  modal.style.display = "block";

  closemodal.onclick = function(){

    let cardsInSeek = seekplacement.querySelectorAll('.highlight-square');

    let card1Name = cardsInSeek[0].getAttribute("data-name");
    let card2Name = cardsInSeek[1].getAttribute("data-name");

    let card1Index = arr.findIndex(elem => elem.name === card1Name);
    let card1 = arr[card1Index];
    if(card1Index !== -1) arr.splice(card1Index, 1); 

    let card2Index = arr.findIndex(elem => elem.name === card2Name);
    let card2 = arr[card2Index];
    if(card2Index !== -1) arr.splice(card2Index, 1); 

    arr.forEach(elem => {
      if(player1Turn && whosTurn == 1){
        customDeck2.push(elem);
      }
      else{
        customDeck.push(elem);
      }
    });

    if(player1Turn && whosTurn == 1){
      customDeck2.sort(() => Math.random() - 0.5);
    }
    else{
      customDeck.sort(() => Math.random() - 0.5);
    }

    if(player1Turn && whosTurn == 1){
      customDeck2.push(card1);
      customDeck2.push(card2);
    }
    else{
      customDeck.push(card1);
      customDeck.push(card2);
    }

    alreadyDrew = 2;
    while(seekplacement.firstChild){
      seekplacement.removeChild(seekplacement.firstChild);
    }
    modal.style.display = "none";

    animateUseOfCard(card, null, () => {
      socket.emit('remove-card', { attacked: card.id, attacker: null, roomid: room });
      dead[card.id] = alive[card.id];
      delete alive[card.id];
      card.remove();
      return;
    });
    return;
  }
  return;

}

window.knockAbility = function(card, target){
  console.log('knockAbility', target);
  const useableAbility = turnCounter + 2;
  const health = target.firstChild.getAttribute('data-health');
  animateUseOfCard(card, target, () => {
    const intoObject = [card, target.firstChild.id, 0, useableAbility];
    target.firstChild.setAttribute('data-knockedability', true);
    socket.emit("update-gameObj", { arr: intoObject, roomid: room, addon: "knock-ability" });
    socket.emit('ability-done', { attacker: card.id, attacked: target.firstChild.id, health: health, roomid: room });
    socket.emit('knocked-ability-status', { target: target.firstChild.id, roomid: room });

    dead[card.id] = alive[card.id];
    delete alive[card.id];
    card.remove();
  });
  //turnEventsAbility(card, target);
}

// just wanna say, this is broken, cuz if placed next to ur dirtblock, dirtblock will die.
window.placeSapTower = function(card, target){ // add to queueAnimation()
  const hand = card.parentElement;
  const moveableTurn = turnCounter + 2;
  let indexOfCard = Array.from(card.parentElement.children).indexOf(card);

  if(hand.id == 'hand1'){
    const targetSquare = target.id;
    const arr = [
    '1,1', '1,2', '1,3', '1,5', '1,6', '1,7',
    '2,1', '2,2', '2,3', '2,5', '2,6', '2,7',
    '3,1', '3,2', '3,3', '3,5', '3,6', '3,7'];
    if(!arr.includes(targetSquare)){
      console.log('not a valid square for tower');
      return;
    }
  }

  if(hand.id == 'hand2'){
    const targetSquare = target.id;
    const arr = [
    '7,1', '7,2', '7,3', '7,5', '7,6', '7,7',
    '6,1', '6,2', '6,3', '6,5', '6,6', '6,7',
    '5,1', '5,2', '5,3', '5,5', '5,6', '5,7'];
    if(!arr.includes(targetSquare)){
      console.log('not a valid square for tower');
      return;
    }
  }

  if(!target || target.hasChildNodes()){
    console.log('already summ there');
    return;
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = card.outerHTML;
  const newCard = tempDiv.firstChild;
  const newHealth = newCard.getAttribute("data-mana");
  newCard.setAttribute("data-health", newHealth);
  console.log("CARD, HAND, TARGET", newCard, hand, target);

  animateMovementOfCard(newCard, hand, target, () => {
    newCard.addEventListener("click", (e) => {
      e.stopPropagation();
      handleCardClick(e);
    });

    newCard.addEventListener("mouseover", (e) => {
      const blank = newCard.querySelector('img');
      entirename.textContent = newCard.getAttribute('data-name');
      entireimage.src = blank.src;
      entirehealth.textContent = `Health: ${newCard.getAttribute("data-health")}`;
      entireattack.textContent = `Attack: ${newCard.getAttribute("data-attack")}`;
      entiremana.textContent = `Mana: ${newCard.getAttribute("data-mana")}`;
      entiremovement.textContent = `Movement: ${newCard.getAttribute("data-movement")}`;
      entiredescription.textContent = newCard.getAttribute("data-description"); // at somme point man
      entire.style.visibility = "visible";
      handleCardMouseOver(e);
    });

    newCard.addEventListener("mouseout", (e) => {
      entire.style.visibility = "hidden";
      handleCardMouseOut(e);
    });

    newCard.addEventListener("dragstart", drag);
    newCard.setAttribute("draggable", "true");

    newCard.setAttribute("data-placed", true);

    target.appendChild(newCard);

    const intoObject = [newCard.id, target.id, 0, moveableTurn];
    socket.emit("update-gameObj", { arr: intoObject, roomid: room, addon: "tower" });
    socket.emit("card-moved", { elem: target.id, moved: newCard.outerHTML, movedto: hand.id, idx: indexOfCard, roomid: room });
    //{ elem: e.currentTarget.id, moved: card.outerHTML, movedto: card.parentElement.id, roomid: room });
    return;
  });
  //turnEventsAbility(card, target);
  dead[card.id] = alive[card.id];
  delete alive[card.id];
  card.remove();
  return;

}

window.hitsDirtBlock = function(card){
  if(card.id.includes('p1')){
    let dirtBlock = document.getElementById('p1Dirt Block');
    const newHealth = dirtBlock.getAttribute('data-health') - 2;
    animateUseOfCard(dirtBlock, null, () => {
    //turnEventsAbility(card);
      if(checkHealth(newHealth)){
        dirtBlock.remove();
        socket.emit('ability-remove', { attacked: dirtBlock.id, roomid: room });
        return;
      }
      dirtBlock.setAttribute("data-health", newHealth);
      socket.emit('ability-done', { attacker: null, attacked: dirtBlock.id, health: newHealth, roomid: room });
    });
  }

  else{
    let dirtBlock = document.getElementById('p2Dirt Block');
    const newHealth = dirtBlock.getAttribute('data-health') - 2;
    animateUseOfCard(dirtBlock, null, () => {
    //turnEventsAbility(card);
      if(checkHealth(newHealth)){
        dirtBlock.remove();
        socket.emit('ability-remove', { attacked: dirtBlock.id, roomid: room });
        return;
      }
      dirtBlock.setAttribute("data-health", newHealth);
      socket.emit('ability-done', { attacker: null, attacked: dirtBlock.id, health: newHealth, roomid: room });
    });
  }
}

window.summonDead = function(card){
  // kinda like with seek and draw, but instead of drawing cards, you summon dead cards
  let popper = [];
  const arr = [];
  
  if(Number(card.getAttribute('data-mana')) < 1){
    console.log('not enough mana to summon dead');
    return;
  }
  //animateUseOfCard(card, null);

  closemodal.style.visibility = 'hidden';

  if(player1Turn && whosTurn == 1){
    let deadones = Object.entries(dead);
    console.log("DEADONES", deadones);
    deadones.filter(elem => {
      if(elem !== null || elem !== undefined){
        arr.push(elem);
      }
    });
    console.log(arr, "AND", dead);

    arr.forEach((elem, idx) => {
      const cardy = document.createElement("div");
      const cardyImg = document.createElement("img");
      console.log('ELEMENT', elem);

      cardyImg.src = elem[1].image;
      cardy.className = "card"; 
      cardyImg.style.width = "100%";
      cardyImg.style.height = "100%";
      cardy.style.border = `2px solid ${playerBorderColor}`;

      cardy.id = elem[0]; 
      cardy.setAttribute('data-name', elem[1].name);
      cardy.setAttribute('data-health', elem[1].health);
      cardy.setAttribute('data-attack', elem[1].attack);
      cardy.setAttribute('data-mana', elem[1].mana);
      cardy.setAttribute('data-movement', elem[1].movement);
      cardy.setAttribute('data-description', elem[1].description);
      cardy.ability = cardAbilities[elem[1].name];
      cardy.setAttribute('data-placed', null);

      cardy.addEventListener("mouseover", (e) => {
        entirename.textContent = cardy.getAttribute("data-name");
        entireimage.src = cardyImg.src;
        entirehealth.textContent = `Health: ${cardy.getAttribute("data-health")}`;
        entireattack.textContent = `Attack: ${cardy.getAttribute("data-attack")}`;
        entiremana.textContent = `Mana: ${cardy.getAttribute("data-mana")}`;
        entiremovement.textContent = `Movement: ${cardy.getAttribute("data-movement")}`;
        entiredescription.textContent = `${cardy.getAttribute("data-description")}`;
        entire.style.visibility = "visible";
      });

      cardy.addEventListener("mouseout", (e) => {
        entire.style.visibility = "hidden";
        handleCardMouseOut(e);
      });

      cardy.addEventListener("click", (e) => {
        const clicked = e.currentTarget;
        // so probably make one selected, and then make it equal to that
        if(popper.includes(clicked)){
          popper = popper.filter(card => card !== clicked);
          clicked.classList.remove("highlight-square");
          closemodal.style.visibility = 'hidden';
          return;
        }

        if(popper.length < 1){
          popper.push(clicked);
          clicked.classList.add("highlight-square");
          closemodal.style.visibility = 'hidden';
        }

        else if(popper.length < 1){
          popper.push(clicked);
          clicked.classList.add("highlight-square");
        }
        else{
          popper.forEach(card => card.classList.remove("highlight-square"));
          popper = [clicked];
          clicked.classList.add("highlight-square");
        }

        if(popper.length === 1){
          closemodal.innerHTML = "Select This Card"
          closemodal.style.visibility = 'visible';
        }
        else{
          closemodal.style.visibility = 'hidden';
        }
        
      });
      cardyImg.setAttribute("draggable", "false");
      cardy.appendChild(cardyImg);
      console.log(seekplacement);
      seekplacement.appendChild(cardy);

    });

  }
  else{
    let deadones = Object.entries(dead);
    console.log("DEADONES", deadones);
    deadones.filter(elem => {
      if(elem !== null || elem !== undefined){
        arr.push(elem);
      }
    });
    console.log(arr, "AND", dead);

    arr.forEach((elem, idx) => {
      const cardy = document.createElement("div");
      const cardyImg = document.createElement("img");
      console.log('ELEMENT', elem);

      cardyImg.src = elem[1].image;
      cardy.className = "card"; 
      cardyImg.style.width = "100%";
      cardyImg.style.height = "100%";
      cardy.style.border = `2px solid ${playerBorderColor}`;

      cardy.id = elem[0]; 
      cardy.setAttribute('data-name', elem[1].name);
      cardy.setAttribute('data-health', elem[1].health);
      cardy.setAttribute('data-attack', elem[1].attack);
      cardy.setAttribute('data-mana', elem[1].mana);
      cardy.setAttribute('data-movement', elem[1].movement);
      cardy.setAttribute('data-description', elem[1].description);
      cardy.ability = cardAbilities[elem[1].name];
      cardy.setAttribute('data-placed', null);

      cardy.addEventListener("mouseover", (e) => {
        entirename.textContent = cardy.getAttribute("data-name");
        entireimage.src = cardyImg.src;
        entirehealth.textContent = `Health: ${cardy.getAttribute("data-health")}`;
        entireattack.textContent = `Attack: ${cardy.getAttribute("data-attack")}`;
        entiremana.textContent = `Mana: ${cardy.getAttribute("data-mana")}`;
        entiremovement.textContent = `Movement: ${cardy.getAttribute("data-movement")}`;
        entiredescription.textContent = `${cardy.getAttribute("data-description")}`;
        entire.style.visibility = "visible";
      });

      cardy.addEventListener("mouseout", (e) => {
        entire.style.visibility = "hidden";
        handleCardMouseOut(e);
      });

      cardy.addEventListener("click", (e) => {
        const clicked = e.currentTarget;
        // so probably make one selected, and then make it equal to that
        if(popper.includes(clicked)){
          popper = popper.filter(card => card !== clicked);
          clicked.classList.remove("highlight-square");
          closemodal.style.visibility = 'hidden';
          return;
        }

        if(popper.length < 1){
          popper.push(clicked);
          clicked.classList.add("highlight-square");
          closemodal.style.visibility = 'hidden';
        }

        else if(popper.length < 1){
          popper.push(clicked);
          clicked.classList.add("highlight-square");
        }
        else{
          popper.forEach(card => card.classList.remove("highlight-square"));
          popper = [clicked];
          clicked.classList.add("highlight-square");
        }

        if(popper.length === 1){
          closemodal.innerHTML = "Select This Card"
          closemodal.style.visibility = 'visible';
        }
        else{
          closemodal.style.visibility = 'hidden';
        }
        
      });
      cardyImg.setAttribute("draggable", "false");
      cardy.appendChild(cardyImg);
      console.log(seekplacement);
      seekplacement.appendChild(cardy);

    });

  }

  modal.style.display = "block";

  closemodal.onclick = function(){

    let cardsInSeek = seekplacement.querySelectorAll('.highlight-square');

    let card1Name = cardsInSeek[0].id;
    console.log("THIS THE ID", cardsInSeek[0].id);
    delete dead[cardsInSeek[0].id];
    console.log(dead);

    let card1Index = arr.findIndex(elem => elem[0] === card1Name);
    let card1 = arr[card1Index];
    if(card1Index !== -1) arr.splice(card1Index, 1);
    console.log("CARD1", card1);

    if(player1Turn && whosTurn == 1){
      customDeck2.push(card1[1]);
    }
    else{
      customDeck.push(card1[1]);
    }

    alreadyDrew = 1;
    while(seekplacement.firstChild){
      seekplacement.removeChild(seekplacement.firstChild);
    }
    modal.style.display = "none";
    const mana = Number(card.getAttribute('data-mana')) - 1;
    card.setAttribute('data-mana', mana);

    animateUseOfCard(card, null, () => {
      socket.emit('mana-card', { target: card.id, mana: mana, roomid: room });
      socket.emit('ability-done', { attacked: card.id, attacker: null, roomid: room });
      return;
    });
    return;
  }
  return;

}

window.gainAttack = function(card, target){
  // attackedCards.push([attacked.id, attacked.getAttribute('data-health'), card.health]);
  // id, health prior to attack, health after attack

  animateUseOfCard(target.firstChild, null, () => {

    const newAttack = Number(card) + Number(target.getAttribute("data-attack"));

    target.setAttribute('data-attack', newAttack);
    socket.emit('update-attack', { target: target.id, newAttack: newAttack, roomid: room });
    return;
  });
  return;

}

window.beebomb = function(card, target){

  const orig1 = Number(card.parentElement.id[0]);
  const orig2 = Number(card.parentElement.id[2]);
  console.log(target.id);
  const targ1 = Number(target.id[0]);
  const targ2 = Number(target.id[2]);

  const newNum1 = Math.abs(orig1 - targ1);
  const newNum2 = Math.abs(orig2 - targ2);

  if(newNum1 > 2 || newNum2 > 2){
    console.log('out of range');
    return;
  }

  const arr = [
    [targ1 + 1, targ2],
    [targ1, targ2 + 1],

    [targ1, targ2],

    [targ1, targ2 - 1],
    [targ1 - 1, targ2]
  ];

  animateBlowUp(card, target, arr, () => {

    arr.forEach(elem => {
      const ifCard = document.getElementById(`${elem[0]},${elem[1]}`);
      if(ifCard.childElementCount > 0){
        const cardy = ifCard.firstChild;
        const newHealth = cardy.getAttribute('data-health') - 2;
        targetPassiveAbility(card.getAttribute('data-abilityattack'), cardy);

        if(checkHealth(newHealth)){
          dead[cardy.id] = alive[cardy.id];
          delete alive[cardy.id];
          cardy.remove();
        }
        else{
          cardy.setAttribute("data-health", newHealth);
        }
        delete abilityObj[card.id];
        return;

      }
    });

  });

  return;


}

window.selectOpponentCard = function(card){
  let hand;
  let popper = [];
  if(card.parentElement.id == 'hand1'){
    hand = document.getElementById("hand2");
  }
  else{
    hand = document.getElementById("hand1");
  }
  closemodal.style.visibility = 'hidden';
  
  const newHand = hand.cloneNode(true);
  const pushCards = Array.from(newHand.children);
  console.log(pushCards);

  pushCards.forEach((elem) => {
    elem.addEventListener("click", (e) => {
      const clicked = e.currentTarget;
      // so probably make one selected, and then make it equal to that
      if(popper.includes(clicked)){
        popper = popper.filter(card => card !== clicked);
        clicked.classList.remove("highlight-square");
        closemodal.style.visibility = 'hidden';
        return;
      }

      if(popper.length < 1){
        popper.push(clicked);
        clicked.classList.add("highlight-square");
        closemodal.style.visibility = 'hidden';
      }

      else if(popper.length < 1){
        popper.push(clicked);
        clicked.classList.add("highlight-square");
      }
      else{
        popper.forEach(card => card.classList.remove("highlight-square"));
        popper = [clicked];
        clicked.classList.add("highlight-square");
      }

      if(popper.length === 1){
        closemodal.innerHTML = "Select This Card"
        closemodal.style.visibility = 'visible';
      }
      else{
        closemodal.style.visibility = 'hidden';
      }
    });

    seekplacement.appendChild(elem);
  });

  modal.style.display = "block";

  closemodal.onclick = function(){

    let cardsInSeek = seekplacement.querySelectorAll('.highlight-square');
    const idx = Array.prototype.indexOf.call(seekplacement.children, cardsInSeek[0]);
    console.log("IDX, IDK", idx);

    console.log("THIS THE CARD", cardsInSeek[0]);

    socket.emit('show-opp-card', { handid: hand.id, index: idx, roomid: room });

    modal.style.display = "none";

    while(seekplacement.firstChild){
      seekplacement.removeChild(seekplacement.firstChild);
    }
    animateUseOfCard(card, null, () => {
      socket.emit('ability-remove', { attacked: card.id, attacker: null, roomid: room });
      card.remove();
    });
    return;
  }
  return;

}

window.drawOne = function(card, target){
  animateUseOfCard(card, null, () => {
    alreadyDrew += 1;
    console.log(alreadyDrew);
  });
}

window.pushBackCards = function(card, target){
  // get 2x3 area
  // if there are cards in that area push them back 2 squares (if possible)
  // remove the wave from the hand

  const num1 = Number(target.id[0]);
  const num2 = Number(target.id[2]);
  const addorsub = card.id.includes('p1') === true ? +1 : -1;

  const arr = [
    [num1 + addorsub, num2 + 1],
    [num1 + addorsub, num2],
    [num1 + addorsub, num2 - 1],
    [num1, num2 + 1],
    [num1, num2],
    [num1, num2 - 1]
  ];
  console.log('pushback arr', arr);

  animateUseOfCard(card, null, () => {

    // so if fog is true, then make sure to make the cards disappear

    arr.forEach((elem) => {

      console.log('pushback forEach', elem);
      const ifCard = document.getElementById(`${elem[0]},${elem[1]}`);
      if(ifCard && ifCard.childElementCount > 0){

        const cardy = ifCard.firstChild;
        // so if the card exists, than move it back 2 squares if possible
        const target = document.getElementById(`${elem[0] + addorsub + addorsub},${elem[1]}`);
        console.log('THIS THE TARGET', target);
        if(!target || target.childElementCount > 0){

          console.log('TARGET DOESNT EXIST!!!');
          const newTarg = document.getElementById(`${elem[0] + addorsub},${elem[1]}`);
          console.log('CREATING NEWTARG');

          if(newTarg && newTarg.childElementCount === 0){
            socket.emit('card-moved', { elem: newTarg.id, moved: cardy.outerHTML, movedto: target.id, roomid: room });
            animateMovementOfCard(cardy, ifCard, newTarg, () => {
              newTarg.appendChild(cardy);
            });
  // elem = id of the square it was originally on, moved = the card being moved, moved to = the square it's going to
            //socket.emit('card-moved-of-cardid', { elem: newTarg.id, cardid: cardy.id, movedto: ifCard.id, roomid: room });
            return;
          }
        }
        // if target exists, than push card to square
        console.log("CARDY, IFCARD, TARGET", cardy, ifCard, target);
        socket.emit('card-moved', { elem: target.id, moved: cardy.outerHTML, movedto: ifCard.id, roomid: room });
        animateMovementOfCard(cardy, ifCard, target, () => {
          target.appendChild(cardy);
        });
        
  // elem = id of the square it was originally on, moved = the card being moved, moved to = the square it's going to
        //socket.emit('card-moved-of-cardid', { elem: target.id, cardid: cardy.id, movedto: ifCard.id, roomid: room });
        return;
      }
    });
    socket.emit('remove-card', { attacked: card.id, attacker: null, roomid: room });
    card.remove();
    return;
  });
  return;

}

window.fog2Turns = function(card){
  // so create new updateFogAbility()
  // then put all cards inside it
  // then make all cards disappear on opponents side
  // then after 2 turns, make everything visible and show opponent what ur side looks like now
  let array;
  const removeFogTurn = turnCounter + 2;
  isFog = true;
  let whichPlayer = card.parentElement.id === "hand1" ? 'p1' : 'p2';

  animateUseOfCard(card, null, () => {
    console.log('fog 2 cards animateUseOfCard()')

    if(card.parentElement.id === "hand1"){
      array = [
      '1,1', '1,2', '1,3', '1,5', '1,6', '1,7',
      '2,1', '2,2', '2,3', '2,4', '2,5', '2,6', '2,7',
      '3,1', '3,2', '3,3', '3,4', '3,5', '3,6', '3,7'
      ];
    }
    else{
      array = [
      '7,1', '7,2', '7,3', '7,5', '7,6', '7,7',
      '6,1', '6,2', '6,3', '6,4', '6,5', '6,6', '6,7',
      '5,1', '5,2', '5,3', '5,4', '5,5', '5,6', '5,7'
      ];
    }

    array.forEach((elem) => {
      const square = document.getElementById(elem);
      square.classList.add('fogged');

      if(square.childElementCount > 0 && square.firstChild.id.includes(whichPlayer)){
        const cardy = square.firstChild;
        cardy.setAttribute('data-fogged', true);
      }
    });

    const intoObject = [array, 0, whichPlayer, removeFogTurn];
    console.log("into object", intoObject);

    socket.emit('ability-fog', { arr: array, otherarr: intoObject, which: whichPlayer, roomid: room });
    socket.emit('ability-remove', { attacked: card.id, roomid: room });
    socket.emit('update-gameObj', { arr: intoObject, roomid: room, addon: "fog" });
    dead[card.id] = alive[card.id];
    delete alive[card.id];

    card.remove();
  });

}

window.pullCard = function(card, target){
  const pullSquare = card.parentElement.id;
  const new1 = Number(pullSquare[0]);
  const new2 = Number(pullSquare[2]);
  const targ1 = Number(target.id[0]);
  const targ2 = Number(target.id[2]); 
  const newNum1 = Math.abs(new1 - targ1);
  const newNum2 = Math.abs(new2 - targ2);
  let truth = true;

  if(newNum1 > 2 || newNum2 > 2){
    console.log('not in range to grab');
    return;
  }

  if(actionsObj.abilities.includes(card.id)){
    console.log('cant grab again');
    return;
  }

  animateUseOfCard(card, target.firstChild, () => {
    actionsObj.abilities.push(card.id);

    const arr = [
      [new1, new2 + 1],
      [new1, new2 - 1],
      [new1 - 1, new2],
      [new1 + 1, new2],
      [new1 + 1, new2 + 1],
      [new1 + 1, new2 - 1],
      [new1 - 1, new2 + 1],
      [new1 - 1, new2 - 1]
    ];

    arr.forEach((e) => {
      const square = document.getElementById(`${e[0]},${e[1]}`);
      // ANIMATE TARGET TO GO TO SQUARE AND THEN SEND SOCKETS AND THEN BE DONE
      // FUCK.
      if(square && square.childElementCount < 1 && truth){
        console.log(square.id, target.firstChild, target.id);
        socket.emit('card-moved', { elem: square.id, moved: target.firstChild.outerHTML, movedto: target.id, roomid: room });
        animateMovementOfCard(target.firstChild, target, square, () => {
          square.appendChild(target.firstChild);
        });
        truth = false;
      }
    });
  });
  // elem = id of the square it was originally on, moved = the card being moved, moved to = the square it's going to

}

window.spawnBees = function(card){
  // get area surrounding card and then if there is an available place 
  // place the bee there
  // if not, try a different one, until there is none
  const pullSquare = card.parentElement.id;
  const new1 = Number(pullSquare[0]);
  const new2 = Number(pullSquare[2]);
  const arr = [
    [new1 + 1, new2 + 1],
    [new1 + 1, new2],
    [new1 + 1, new2 - 1],
    [new1, new2 + 1],
    [new1, new2 - 1],
    [new1 - 1, new2 + 1],
    [new1 - 1, new2],
    [new1 - 1, new2 - 1],
  ];

  arr.forEach((e) => {
    const square = document.getElementById(`${e[0]},${e[1]}`);
    // ANIMATE TARGET TO GO TO SQUARE AND THEN SEND SOCKETS AND THEN BE DONE
    // FUCK.
    if(square && square.childElementCount < 1){
      socket.emit('card-moved-of-cardid', { elem: square.id, cardid: target.firstChild.id, movedto: target.id, roomid: room });
      square.appendChild(/*bee*/);

    }
  });
}

const cardAbilities = {

  blow_up_reach_end: {
    passive: {
      onReachEnd: (dmg, squareid) => {
        explodeSelf(dmg, squareid);
      }
    },
    active: null
  },

  gamble_draw: {
    passive: null,
    active: {
      use: (card) => {
        gambleDraw2(card);
      }
    }
  },

  shooting: {
    passive: null,
    active: {
      useAgainst: (card, targetcard) => {
        shoot(card, targetcard);
      }
    }
  },

  show_enemy_hand: {
    passive: null,
    active: {
      use: (card) => {
        console.log("WOWOWOWOW")
        showEnemyHand(card);
      }
    }
  },

  glue_square: {
    passive: null,
    active: {
      useOn: (card, targetcard) => {
        glueSquare(card, targetcard);
        console.log('who up gluing they shit');
        
      }
    }
  },

  give_stim:{
    passive: null,
    active: {
      useOn: (card, targetcard) => {
        giveStim(card, targetcard);
        console.log('stimulants');
        
      }
    }
  },

  deploy_entire_hand: {
    passive: null,
    active: {
      use: (card) => {
        deployWholeHand(card);
      }
    }
  },

  create_wall: {
    passive: null,
    active: {
      useOnSquare: (card, target) => {
        wallOfThree(card, target);
      }
    }
  },

  attach_sun: {
    passive: null,
    active: {
      useOnSquare: (card, target, context) => {
        if(context === "assign"){
          animateUseOfCard(card, target, () => {
            abilityObj[target.firstChild.id] = {
              active: {
                useOnSquare: cardAbilities["attach_sun"].active.useOnSquare
              }
            };
            console.log("THE SUN", target.firstChild, card);
            socket.emit('ability-done', { attacker: card.id, attacked: target.firstChild.id, roomid: room });
            return;
          });
          card.remove();
          return;
        }

        eviscerate(card, target);
      }
    }
  },

  attach_blow_up_vest: {
    passive: null,
    active: {
      useOnSquare: (card, target, context = "use") => {
        if(context === "assign"){
          animateUseOfCard(card, target, () => {

            abilityObj[target.firstChild.id] = {
              active: {
                useOnSquare: cardAbilities["attach_blow_up_vest"].active.useOnSquare
              }
            };
            const newMovement = Number(target.firstChild.getAttribute("data-movement")) + 1;
            target.firstChild.setAttribute("data-movement", newMovement);
            socket.emit('ability-done', { attacker: card.id, attacked: target.firstChild.id, roomid: room });
            socket.emit('movement-status', { target: target.firstChild.id, movement: newMovement, roomid: room });
            console.log('gave ability to:', target.firstChild.id);
            return;
            });
          card.remove();
          return;
        }

        implode(card, target);
      }
    }
  },

  in_2_turns_drop_nuke: {
    passive: null,
    active: {
      use: (card, target) => {
        nuke(card, target);
      }
    }
  },

  blow_up_man: {
    passive: null,
    active: {
      use: (card) => {
        jsnAbility(card);
      }
    }
  },

  give_mana: {
    passive: null,
    active: {
      useOn: (card, target) => {
        console.log("USEON", card, target.firstChild);
        manaCard(card, target);
      }
    }
  },

  draw_4_cards: {
    passive: null,
    active: {
      use: (card) => {
        draw4(card);
      }
    }
  },

  give_health_potion: {
    passive: null,
    active: {
      useOn: (card, target) => {
        heal3(card, target);
      }
    }
  },

  seek_and_draw: {
    passive: null,
    active: {
      use: (card) => {
        seekAndDraw(card);
      }
    }
  },

  knock_ability: {
    passive: null,
    active: {
      useOn: (card, target) => {
        knockAbility(card, target);
      }
    }
  },

  on_tower_death: {
    passive: {
      onDeath: (card) => {
        hitsDirtBlock(card); 
      }
    },
    active: null
  },

  place_tower: {
    passive: null,
    active: {
      useOnSquare: (card, target) => {
        placeSapTower(card, target);
      }
    }
  },

  summon_dead: {
    active: {
      use: (card) => {
        summonDead(card);
      }
    }
  },

  gain_attack_when_attacked: {
    passive: {
      whenAttacked: (card, target) => {
        gainAttack(card, target);
      }
    },
    active: null
  },

  attach_beenade: {
    passive: null,
    active: {
      useOn: (card, target, context = "use") => {
        if(context === "assign"){
          animateUseOfCard(card, target, () => {
            abilityObj[target.firstChild.id] = {
              active: {
                useOn: cardAbilities["attach_beenade"].active.useOn
              }
            };
            socket.emit('ability-done', { attacker: card.id, attacked: target.firstChild.id, roomid: room });
            console.log('gave ability to:', target.firstChild.id);
            return;
          });
          card.remove();
          return;
        }
        beebomb(card, target);
      }
    }
  },

  steal_card_from_opp: {
    passive: null,
    active: {
      use: (card) => {
        selectOpponentCard(card);
      }
    }
  },

  on_attack_draw_1: {
    passive: {
      attackedCard: (card, target) => {
        drawOne(card, target);
      }
    },
    active: null
  },

  push_back_cards: {
    passive: null,
    active: {
      useOn: (card, target) => {
        pushBackCards(card, target);
      }
    }
  },

  fog_own_side_for_2_turns: {
    passive: null,
    active: {
      use: (card) => {
        fog2Turns(card);
      }
    }
  },

  pull_card: {
    passive: null,
    active: {
      useAgainst: (card, target) => {
        pullCard(card, target);
      }
    }
  },

  on_death_spawn_bees: {
    passive: {
      onDeath: (card) => {
        spawnBees(card);
      }
    },
    active: null
  },





}

// CARD ABILITY FUNCTIONS END

const abilityObj = {

}
