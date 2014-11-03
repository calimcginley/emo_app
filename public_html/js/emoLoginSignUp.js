// User Clicked to Login or Sing Up
// Here the inputs are checked against the database and if successfull local storage 
// variables are set. 

$(document).on('click', '#submitBtn', function() { 
    // catch the form's submit event
    // console records
    console.log('form submitted');
    console.log('get form values');
    // get the login values
    var inputEmail = $('#email').val();
    var inputPassword = $('#password').val();
    var hashPassword = $.sha256(inputPassword);
    var formType = $('input[name=submitBtn]').val();

    // Check the both inputs have values
    console.log('get form values');
    if(inputEmail.length > 0 && inputPassword.length > 0)
    {
        console.log('check form action');
        if(formType === 'Login')
        {
            // Send data to server through the ajax call
            // action is functionality we want to call and outputJSON is our data
            $.ajax({url: 'http://icandraw.me/sensus/php/sensusLogin.php',
            data: {action : 'login', userEmail : inputEmail, userPass : hashPassword },
            type: 'post',
            async: 'true',
            dataType: 'json',
            beforeSend: function() {
                // This callback function will trigger before data is sent
                //$.mobile.showPageLoadingMsg(true); // This will show ajax spinner
            },
            complete: function() {
                // This callback function will trigger on data sent/received complete
                //$.mobile.hidePageLoadingMsg(); // This will hide ajax spinner
            },
            success: function (result) {
                if(result.status === "ok") {
                    console.log('Login successful for '+result.id);
                    window.localStorage.setItem('logged', 'Yes');
                    window.localStorage.setItem('email', inputEmail);
                    window.localStorage.setItem('userID', result.id);
                    $('#formErrorMsg').html('');
                    $('#email').removeClass('orangeBackground');
                    $('#password').removeClass('orangeBackground');                    
                    $.mobile.changePage("#mapPage");                        
                } else {
                    if(result.msgType === 'password')
                    {
                        console.log('Login unsuccessful = '+result.msg);
                        $('#formErrorMsg').html(result.msg);
                        $('#email').removeClass('orangeBackground');
                        $('#password').addClass('orangeBackground');
                    }
                    else
                    {
                        console.log('Login unsuccessful = '+result.msg);
                        $('#formErrorMsg').html(result.msg);                        
                    }
                }
            },
            error: function (request,error) {
                // This callback function will trigger on unsuccessful action               
                $('#formErrorMsg').html('There was an error = '+error);
                console.log('error = '+error);
                console.log("XMLHttpRequest", XMLHttpRequest);
            }
            });
        }
        else
        {
            // Send data to server through the ajax call
            // action is functionality we want to call and outputJSON is our data
            $.ajax({url: 'http://icandraw.me/sensus/php/sensusSignUp.php',
            data: {action : 'signUp', userEmail : inputEmail, userPass : hashPassword },
            type: 'post',
            async: 'true',
            dataType: 'json',
            beforeSend: function() {
                // This callback function will trigger before data is sent
                //$.mobile.showPageLoadingMsg(true); // This will show ajax spinner
            },
            complete: function() {
                // This callback function will trigger on data sent/received complete
                //$.mobile.hidePageLoadingMsg(); // This will hide ajax spinner
            },
            success: function (result) {
                if(result.status === "ok") {
                    console.log('Sign up successful');
                    window.localStorage.setItem('logged', 'Yes');
                    window.localStorage.setItem('email', inputEmail);
                    $('#formErrorMsg').html('');
                    $('#email').removeClass('orangeBackground');
                    $('#password').removeClass('orangeBackground');
                    // Place the email function here
                    // emailSignUpSuccess()
                    $.mobile.changePage("#mapPage");                        
                } else {
                    console.log('Signup was unsuccessful = '+result.msg);
                    $('#formErrorMsg').html(result.msg);
                }
            },
            error: function (request,error) {
                // This callback function will trigger on unsuccessful action               
                $('#formErrorMsg').html('There was an error = '+error);
                console.log('error = '+error);
                console.log("XMLHttpRequest", XMLHttpRequest);
            }
            });
        }
    } 
    else 
    {
        // There is one or both inputs empty
        if(inputEmail.length === 0 && inputPassword.length === 0)
        {
            $('#formErrorMsg').html('Please enter your email and password');
            // Adds or removes the orange background class to the inputs
            $('#email').addClass('orangeBackground');
            $('#password').addClass('orangeBackground');
        }
        else if(inputEmail.length > 0 && inputPassword.length === 0)
        {
            $('#formErrorMsg').html('Please enter a valid password');
            $('#email').removeClass('orangeBackground');
            $('#password').addClass('orangeBackground');
        }
        else
        {
            $('#formErrorMsg').html('Please enter a valid email');
            $('#email').addClass('orangeBackground');
            $('#password').removeClass('orangeBackground');
        }
    }
    return false; // cancel original event to prevent form submitting
});
        
               
// Capture the settings logout button
$(document).on('click', '#logoutBtn', function() 
{ 
    // Here we clear the local storage and redirect the page
    // to the #loginPage
    console.log('Logout has been clicked. Wipe local storage and go to #loginPage');
    window.localStorage.clear();
    $( ":mobile-pagecontainer" ).pagecontainer( "change", "#loginPage", { transition: "flow" } );
});
            


