
const login = document.getElementById("loginBtn");
const signup = document.getElementById("signupBtn");
const anonymous = document.getElementById("anonymousBtn");

login.addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  // fetch data from login and then direct them to create deck, play, or customize if they are logged in
  // if not then just retry them here

  // make a create account form so they can create an account and whatnot
  // serialize password so i don't have access to it 

  // also create one where they don't have to log in to play
  // and just give them the normal deck of cards 
  // they have to log in to make a deck

  try{
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      })
    });
    const result = await response.json();
    console.log(result);
    if(result.message === 'Login successful'){
      window.location.href = "/home";
    }
  }
  catch(error){
    console.log(error);
  };

});

signup.addEventListener("click", async () => {
  const username = document.getElementById("username-up").value;
  const password = document.getElementById("password-up").value;
  
  try{
    const response = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      })
    });
    const result = await response.json();
    console.log(result);
  }
  catch(error){
    console.log(error);
  };

});

anonymous.addEventListener("click", async () => {
  window.location.href = "/home";
});
