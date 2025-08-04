const uploadDeck = document.getElementById("imagesAndCardDeck");
const myCardDeck = document.getElementById("myCardDeck");
const myPictures = document.getElementById("myPictures");
const nameOfDeck = document.getElementById("name-of-deck");
const selectDeck = document.getElementById("select-deck");
const faceOfDeck = document.getElementById('face-of-deck');

async function getDeckNames(){
  const res = await fetch('/api/get-deck-names');
  const data = await res.json();
  console.log(data);
  data.forEach((e) => {
    const newOption = new Option(e, e);
    faceOfDeck.add(newOption);
  })
}

getDeckNames();

myCardDeck.addEventListener('change', async function(event){

  const file = event.target.files[0];

  if(file){
    try{
      const fileContent = await file.text();
      const json = JSON.parse(fileContent);
      console.log(json);
    }
    catch(error){
      console.error("error reading JSON file", error);
    }
  }

});

uploadDeck.addEventListener('click', async () => {
  // on click, submit both pictures and card deck to database
  try{
    const files = myPictures.files;
    const jsonFile = myCardDeck.files[0];
    const formData = new FormData();

    for(let file of files){
      console.log("FILE", file);
      formData.append('files', file);
    }

    formData.append('deckName', nameOfDeck.value);

    console.log("THIS THE JSONFILE", jsonFile);

    if(jsonFile){
      const jsonText = await jsonFile.text();
      formData.append('cardDeck', jsonText);
    }

    const response = await fetch("/api/create-deck", {
      method: "POST",
      body: formData
    });

    const result = await response.text();
    console.log(result);
    // and then at some point return to the home page
  }
  catch(error){
    console.log(error);
  };
});

selectDeck.addEventListener('click', async () => {
  try{
    const response = await fetch("/api/select-deck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nameOfDeck: faceOfDeck.options[faceOfDeck.selectedIndex].text
      })
    });

    const result = await response.json();
    console.log(result);
  }
  catch(err){

  }
});
