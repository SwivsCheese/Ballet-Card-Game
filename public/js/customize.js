
const change = document.getElementById("change-squares");
let squaresBool = true;
const save = document.getElementById("save-customization");
const reset = document.getElementById("reset-customization");

const backOfCard = document.getElementById("back-of-card-button");
const cardBack = document.getElementById("back-card");

const enemyBorder = document.getElementById("enemy-border-color-button");
const enemyBorderCard = document.getElementById("enemy-border-color");

const playerBorder = document.getElementById("player-border-color-button");
const playerBorderCard = document.getElementById("player-border-color");

const attackHighlightFrom = document.getElementById("attack-enemy-highlight-button-from");
const attackHighlightTo = document.getElementById("attack-enemy-highlight-button-to");

const attackHighlightSquare = document.getElementById("attack-enemy-highlight");

const movementHighlightFrom = document.getElementById("movement-highlight-button-from");
const movementHighlightTo = document.getElementById("movement-highlight-button-to");

const styleTag = document.createElement('style');
document.head.appendChild(styleTag);
const styleTag2 = document.createElement('style');
document.head.appendChild(styleTag2);

function updateGlowRedKeyframes(){
  const fromColor = attackHighlightFrom.value;
  const toColor = attackHighlightTo.value;

  // Remove any existing glow-red keyframes from this style tag
  styleTag.innerHTML = `
    @keyframes glow-red {
      from { outline-color: ${fromColor}; }
      to { outline-color: ${toColor}; }
    }
  `;

  // Optionally force reflow/restart animation
  const card = document.getElementById("attack-enemy-highlight");
  card.classList.remove("highlight-red");
  void card.offsetWidth; // force reflow
  card.classList.add("highlight-red");
}

function updateGlowKeyframes(){
  const fromColor = movementHighlightFrom.value;
  const toColor = movementHighlightTo.value;

  // Remove any existing glow-red keyframes from this style tag
  styleTag2.innerHTML = `
    @keyframes glow {
      from { outline-color: ${fromColor}; }
      to { outline-color: ${toColor}; }
    }
  `;

  // Optionally force reflow/restart animation
  const square = document.getElementById("highlighted-square");
  square.classList.remove("highlight-square");
  void square.offsetWidth; // force reflow
  square.classList.add("highlight-square");
}

updateGlowRedKeyframes();
updateGlowKeyframes();

fetch('/api/customize-data')
.then(res => res.json())
.then(data => {
  console.log('data', data);
  backOfCard.value = data.backOfCard;
  cardBack.style.backgroundColor = data.backOfCard;

  enemyBorder.value = data.enemyBorder;
  enemyBorderCard.style.borderColor = data.enemyBorder;

  playerBorder.value = data.playerBorder;
  playerBorderCard.style.borderColor = data.playerBorder;

  attackHighlightFrom.value = data.attackHighlightFrom;
  attackHighlightTo.value = data.attackHighlightTo;

  movementHighlightFrom.value = data.movementHighlightFrom;
  movementHighlightTo.value = data.movementHighlightTo;

  updateGlowRedKeyframes();
  updateGlowKeyframes();

});

backOfCard.addEventListener('input', () => {
  cardBack.style.backgroundColor = backOfCard.value;
});

enemyBorder.addEventListener('input', () => {
  enemyBorderCard.style.borderColor = enemyBorder.value;
});

playerBorder.addEventListener('input', () => {
  playerBorderCard.style.borderColor = playerBorder.value;
});

attackHighlightFrom.addEventListener('input', updateGlowRedKeyframes);

attackHighlightTo.addEventListener('input', updateGlowRedKeyframes);

movementHighlightTo.addEventListener('input', updateGlowKeyframes);

movementHighlightFrom.addEventListener('input', updateGlowKeyframes);

save.addEventListener('click', async (e) => {
  console.log(backOfCard.value);
    try{
    const response = await fetch("/save-customization", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        backOfCard: backOfCard.value,
        enemyBorder: enemyBorder.value,
        playerBorder: playerBorder.value,
        attackHighlightFrom: attackHighlightFrom.value,
        attackHighlightTo: attackHighlightTo.value,
        movementHighlightFrom: movementHighlightFrom.value,
        movementHighlightTo: movementHighlightTo.value
      })
    });
    const result = await response.json();
    console.log(result);

    window.location.href = `/home`;
    // and then at some point return to the home page
  }
  catch(error){
    console.log(error);
  };
});

reset.addEventListener('click', async (e) => {
  console.log(backOfCard.value);
    try{
    const response = await fetch("/reset-customization", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        backOfCard: "#00b890",
        enemyBorder: "#fca1ff",
        playerBorder: "#a1f1ff",
        attackHighlightFrom: "#ff2727",
        attackHighlightTo: "#ff2756",
        movementHighlightFrom: "#ffff00",
        movementHighlightTo: "#ffa500"
      })
    });
    const result = await response.json();
    console.log(result);
   
  }
  catch(error){
    console.log(error);
  };
});

change.addEventListener('click', () => {

  const darkSquares = document.querySelectorAll('.dark-squares');
  const lightSquares = document.querySelectorAll('.light-squares');

  if(squaresBool){
    // so if true, than make .dark-squares have this color: rgb(240, 217, 181)
    // and then .light-squares have this color: rgb(181, 136, 99)
    darkSquares.forEach(elem => elem.style.backgroundColor = 'rgb(240, 217, 181)');
    lightSquares.forEach(elem => elem.style.backgroundColor = 'rgb(181, 136, 99)');
  }
  else{
    // this will be the opposite of above
    darkSquares.forEach(elem => elem.style.backgroundColor = 'rgb(181, 136, 99)');
    lightSquares.forEach(elem => elem.style.backgroundColor = 'rgb(240, 217, 181)');
  }

  squaresBool = !squaresBool;
  return;
});
