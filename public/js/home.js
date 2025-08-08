//const socket = io();

const create = document.getElementById("createBtn");
const play = document.getElementById("playBtn");
const customize = document.getElementById("customizeBtn");
const tutorial = document.getElementById("tutorial");
const modal = document.getElementById("myModal");
const closeModal = document.getElementById("close-modal");

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

tutorial.addEventListener("click", () => {

  modal.style.display = "block";

});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
})


/*
socket.on("waiting", () => {
  console.log('waiting for another person');
});
*/
