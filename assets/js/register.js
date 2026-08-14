const form=document.getElementById("registerForm");

form.addEventListener("submit",function(e){

e.preventDefault();

const name=document.getElementById("fullname").value;

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

const confirm=document.getElementById("confirm").value;

if(name==""){

alert("Enter Full Name");

return;

}

if(email==""){

alert("Enter Email");

return;

}

if(password.length<6){

alert("Password must be at least 6 characters");

return;

}

if(password!==confirm){

alert("Passwords do not match");

return;

}

alert("Account Created Successfully!");

window.location="login.html";

});