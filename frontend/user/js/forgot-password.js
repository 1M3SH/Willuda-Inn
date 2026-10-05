const form=document.getElementById("forgotForm");

form.addEventListener("submit",function(e){

e.preventDefault();

const email=document.getElementById("email").value;

if(email==""){

alert("Please enter your email.");

return;

}

alert("Password reset link sent successfully!");

window.location="login.html";

});