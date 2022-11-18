function validateemail(){

    var email=document.getElementById('email').value
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    
    if(email==null || email==" "){
        document.getElementById("emaildemo").innerHTML ="Email can't be blank";
        return false;
    }else if(!email.match(mailformat)){
        document.getElementById("emaildemo").innerHTML ="You have entered an invalid email address!";
        return false;
    }else{
        document.getElementById("emaildemo").innerHTML ="";
    }
  }

function validatePassword() {  
    var pw = document.getElementById("pswd").value;  
    if(pw == "") {  
        document.getElementById("pswddemo").innerHTML = "Fill the password please!";  
        return false;  
    }  
    if(pw.length < 5) {  
        document.getElementById("pswddemo").innerHTML = "Password length must be atleast 5 characters";  
        return false;  
    }  
    else {  
        document.getElementById("pswddemo").innerHTML ="";
    }  
  }


function validatephone() {  
  var phone = document.getElementById("phone").value;  
  var phoneformat = /^\d{10}$/;

  if(phone == "") {  
      document.getElementById("phonedemo").innerHTML = "Fill the phonenumber please!";  
      return false;  
  }
  if(!phone.match(phoneformat)) {  
      document.getElementById("phonedemo").innerHTML = "Fill the phonenumber Correctly please!";  
      return false;  
  }
  if(phone.length < 10) {  
      document.getElementById("phonedemo").innerHTML = "phonenumber length must be atleast 10 characters";  
      return false;  
  }  
  else {  
      document.getElementById("phonedemo").innerHTML ="";
  }  
}

function validateFirstname(){

var firstname=document.getElementById('firstname').value 
var nameformat = /^[A-Za-z ]+$/;

if (firstname==null || firstname==" "){
  document.getElementById("firstnamedemo").innerHTML = "Name can't be blank";
  return false;
}
  if(!firstname.match(nameformat))
  {
  document.getElementById("firstnamedemo").innerHTML = "You have entered an invalid Name!";
  return false;
  }
  document.getElementById("firstnamedemo").innerHTML = "";
}  

function validateLastname(){

var lastname=document.getElementById('lastname').value 
var nameformat = /^[A-Za-z ]+$/;

if (lastname==null || lastname==" "){
  document.getElementById("lastnamedemo").innerHTML = "Name can't be blank";
  return false;
}
  if(!lastname.match(nameformat))
  {
  document.getElementById("lastnamedemo").innerHTML = "You have entered an invalid Name!";
  return false;
  }
  document.getElementById("lastnamedemo").innerHTML = "";
} 

function validatename(){

  var name=document.getElementById('name').value 
  var nameformat = /^[A-Za-z ]+$/;

  if (name==null || name==" "){
    document.getElementById("namedemo").innerHTML = "Name can't be blank";
    return false;
  }
    if(!name.match(nameformat))
    {
    document.getElementById("namedemo").innerHTML = "You have entered an invalid Name!";
    return false;
    }
    document.getElementById("namedemo").innerHTML = "";
  }  


function validateAddress(){

  var address=document.getElementById('address').value 

  if (address==null || address==" "){
    document.getElementById("addressdemo").innerHTML = "Address can't be blank";
    return false;
  }
  document.getElementById("addressdemo").innerHTML = "";
  }  

        
function validatepostal() {  
  var postcode = document.getElementById("postcode").value;  
  var phoneformat = /^\d{10}$/;

  if(postcode == "") {  
      document.getElementById("postcodedemo").innerHTML = "Fill the postnumber please!";  
      return false;  
  }
  if(!postcode.match(phoneformat)) {  
      document.getElementById("postcodedemo").innerHTML = "Fill the postnumber Correctly please!";  
      return false;  
  }
  if(postcode.length < 6) {  
      document.getElementById("postcodedemo").innerHTML = "Postnumber length must be atleast 6 characters";  
      return false;  
  }  
  else {  
      document.getElementById("postcodedemo").innerHTML ="";
  }  
}
function validateCouponname(){

  var name=document.getElementById('couponName').value 
  var nameformat = /^[A-Za-z ]+$/;

  if (name==null || name==" "){
    document.getElementById("namedemo").innerHTML = "Name can't be blank";
    return false;
  }
    if(!name.match(nameformat))
    {
    document.getElementById("namedemo").innerHTML = "You have entered an invalid Name!";
    return false;
    }
    document.getElementById("namedemo").innerHTML = "";
  }  