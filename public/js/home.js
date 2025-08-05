//const socket = io();

const create = document.getElementById("createBtn");
const play = document.getElementById("playBtn");
const customize = document.getElementById("customizeBtn");

play.addEventListener("click", () => {
  const battle = document.getElementById("battle").value.trim(); //.trim()

  if(battle.length === 0){
    return;
  }

  window.location.href = `/play?room=${battle}`;

});

customize.addEventListener("click", () => {
  window.location.href = '/customize';
});

create.addEventListener("click", () => {
  window.location.href = '/createDeck';
});


/*
socket.on("waiting", () => {
  console.log('waiting for another person');
});
*/
