/*  EMO Emotion Mapping App | Main Code for App  */
/*  Code by Keith McGinley @calimcginley  */
// Init Code         
// ----------------- 
$(document).ready(function () {

    $(function () { // Panels Code
        $("[data-role=panel]").panel().enhanceWithin();
    });

    var imageArray = [];    // Image Array for Profile Page
    window.localStorage.setItem('profileArray', JSON.stringify(imageArray));
    console.log(window.localStorage.getItem('profileArray'));

    $('.floatlabel_1').floatlabel(); // float label code

    $('.mapLink').click(function () { // Return to Map "Home Button" Event
        var pageID = $.mobile.activePage.attr('id');
        $("#menuPanel").panel("close");
        $(":mobile-pagecontainer").pagecontainer("change", "#mapPage", {transition: "drop"});
    });
});

//Show splashPage    
// ----------------- 
var endOfSplash = function ()
{
    // In the redirect we check the local storage for the logged in status
    // If the value is returned 'Yes' the app redirects direct to #mapPage
    console.log('Decide which page to show:');
    if (window.localStorage.getItem('logged') === 'Yes')
    {
        console.log('localStorage logged value = Yes');
        $(":mobile-pagecontainer").pagecontainer("change", "#mapPage", {transition: "fade"});
    }
    else
    {
        console.log('No localStorage logged value');
        $(":mobile-pagecontainer").pagecontainer("change", "#loginPage", {transition: "flow"});
    }
};

$(document).on("pageshow", "#splashPage", function () {
    setTimeout(function () {
        endOfSplash();
    }, 4000);

    $('#splashImage').click(function () {
        endOfSplash();
    });
});

// Show loginPage    
// ----------------- 
$(document).on("pageshow", "#loginPage", function () {
    $('#forgotPass').click(function () {    // Forgot Password Event
        var inputEmail = $('#email').val();
        if (inputEmail.length > 0)
        {
            function makeNewPass()
            {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < 6; i++)
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                return text;
            }
            var newPass = makeNewPass(); // Generate New Password
            var hashPassword = $.sha256(newPass); // Hash it
            $.ajax({url: 'http://emoapp.info/php/forgotPass.php', // Send Pass
                data: {userEmail: inputEmail, newPass: hashPassword, curPass: null, action: 'forgot'},
                type: 'post', async: 'true',
                beforeSend: function () {  // This callback function will trigger before data is sent     
                    $.mobile.loading("show", {text: 'Forgot Password', textVisible: true});
                },
                complete: function () { // This callback function will trigger on data sent/received complete                
                    $.mobile.loading("hide");
                },
                success: function (result) { // Open New Pass Dialog
                    $('#passMsg').html('<p>You will have recieved new password to account email.<br>Enter pass below and create your new password.</p>');
                    window.localStorage.setItem('tempEMail', inputEmail);
                    $.mobile.changePage("#passPage", {role: "dialog"});
                },
                error: function (error) { // This callback function will trigger on unsuccessful action                      
                    $('#updateBtn').html('There was an error = ' + error);
                    console.log('error = ' + error);
                    console.log(error.success);
                }
            });
        }
        else // Tell them enter email q
        {
            $('#formErrorMsg').html('Please enter your account email address');
        }
    });

});

// New Password popup
$(document).on("pageshow", "#passPage", function () {
    $('#changePass').click(function () { // Update Password clicked
        var newPass = $('#newPass').val();
        var curPass = $('#curPass').val();
        $('#formErrorMsg').html('');
        if (newPass === $('#conPass').val()) { // Passwords match, update      
            $.ajax({url: 'http://emoapp.info/php/forgotPass.php', // Send Pass
                data: {userEmail: window.localStorage.getItem('tempEMail'), newPass: newPass, curPass: curPass, action: 'update'},
                type: 'post', async: 'true',
                beforeSend: function () {  // This callback function will trigger before data is sent     
                    $.mobile.loading("show", {text: 'Forgot Password', textVisible: true});
                },
                complete: function () { // This callback function will trigger on data sent/received complete                
                    $.mobile.loading("hide");
                },
                success: function (result) { // Open New Pass Dialog
                    $('#passMsg').html('<p>You will have recieved new password to account email.<br>Enter pass below and create your new password.</p>');
                    $.mobile.changePage("#passPage", {role: "dialog"});
                },
                error: function (error) { // This callback function will trigger on unsuccessful action                      
                    $('#updateBtn').html('There was an error = ' + error);
                    console.log('error = ' + error);
                    console.log(error.success);
                }
            });

            // Add the logged in on success
        }
        else { // Passwords don't match

        }
    });
});


// Camera Function Posting Functions 
// ---------------------------------
$(document).ready(function () { // A click event for each emoji which creates a token in local storage to aid empji post
    parentOpen = false;
    $('.emoPostBtn').click(function (e) { // Open the parent EMoji select button

        console.log('Post Btn Clicked');
        var pageID = $.mobile.activePage.attr('id');
        console.log('pageID: ' + pageID);
        if (pageID === 'mapPage')
        {
            $("#menuPanel").panel("close");
            isOpen = !isOpen;
            console.log('close menu');
            openParentEmojiBar();
        }
        else // Move page to mapPage and open parent select
        {
            console.log('Change to map page and open filter');
            $(":mobile-pagecontainer").pagecontainer("change", "#mapPage", {transition: "slide"});
            openParentEmojiBar();
        }

        function openParentEmojiBar()
        {
            console.log('Open Filter bar');
            $("#emojiPostSelectParent").velocity({left: "0", easing: "easein"}, 500);
            $("#emojiSearchBar").velocity({top: "-100%", easing: "easein"}, 500); // Close Other bar
            parentOpen = !parentOpen; // switch boolen
        }
    });

    $('.emojiParent').on('click', function () { // Parent Emoji Clicked
        var pEmoji = $(this).attr('data-name');
        console.log(pEmoji);
        window.localStorage.setItem('parentPostEmoji', pEmoji);
        // Change Page to emotionPostPage
        $(":mobile-pagecontainer").pagecontainer("change", "#emotionPostPage", {transition: "slidedown"});
    });

    $('.menu-button').click(function () {   // Check weather the Panel was open       
        // It not it's about to so remove overlay menus
        if (!$('#menuPanel').hasClass('ui-panel-open'))
        {
            $(".panel-btn").velocity({width: '150px', easing: "easein"}, 1);
            $(".infoMenuButtonImg").velocity({marginBottom: 100, easing: "easein"}, 1);
            $('#mapPage').removeClass('show-popup');
            $("#emojiSearchBar").velocity({top: "-100%", easing: "easein"}, 300);
            $("#emojiPostSelectParent").velocity({left: "-100%", easing: "easein"}, 300);
        }
    });
});

function camera() // Camera Function to Handle the image creation
{
    // Place camera phonegap function here
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 80,
        destinationType: Camera.DestinationType.FILE_URI,
        targetWidth: 640,
        targetHeight: 640,
        saveToPhotoAlbum: true,
        correctOrientation: false,
        allowEdit: true
    });
    console.log('Camera opened on phone');

    function onSuccess(imageURI)
    {
        var emojiColours = ['#F7ED43', '#66BA4D', '#6CCCE1', '#F48530', '#A4579F', '#C3242D', '#E01888', '#DD5F84'];
        var parentEmoji = window.localStorage.getItem('parentPostEmoji') - 1;
        console.log('Camera opened and image was captured');
        // Canvas Mood on image
        var canvas = document.getElementById('imageCanvas');
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Add white bg
        context.rect(0, 0, 640, 720);
        context.fillStyle = '#ffffff';
        context.fill();

        // Add the emoji Colour
        context.rect(0, 0, 640, 650);
        context.fillStyle = emojiColours[parentEmoji];
        context.fill();

        // Camera Image Loaded
        var imageObj = new Image();
        imageObj.onload = function () {
            context.globalAlpha = 1;
            context.drawImage(imageObj, 0, 0, 640, 640);
        };
        imageObj.src = imageURI;
    }

    function onFail(message)
    {
        console.log('Camera Failed to load' + message);
    }
}

$(document).on("pageshow", "#emotionPostPage", function () { // emotionPostPage shown functions

    $('.emojiRender').each(function (i, d) { // Renders emoji on keyPad click
        console.log('emoji img code set');
        $(d).emoji();
    });

    window.localStorage.setItem('emojiKeypad', 'off');
    $("#toggle").click(function () { // Set local storage value for keypad
        $("#panel").slideToggle("fast");
        var keypadOnOff = window.localStorage.getItem('emojiKeypad'); // Get keypad on/off value     
        if (keypadOnOff === 'off')  // Checks which position keypad is in
        {
            console.log('emoji keypad opened');
            $("#tabs").tabs();
            $('#toggle').html('close');
            $("#insertButtons").velocity({top: "-=200", easing: "easein"}, 400).delay(800);
            window.localStorage.setItem('emojiKeypad', 'on');
        }
        else
        {
            console.log('emoji keypad closed');
            $('#toggle').html('Describe');
            $("#insertButtons").velocity({top: "+=200", easing: "easein"}, 400).delay(800);
            window.localStorage.setItem('emojiKeypad', 'off');
        }
    });

    $("#imageCanvas").click(function (e) { // Camera Button Clicked
        console.log('Camera CLicked');
        camera();
    });
});

// Post to map Functions    
// ---------------------
$(document).on('click', '#postToMapBtn', function () {
    console.log('Post to map clicked:');
    var postLat;
    var postLong;

    function renderImage() { // Create the image in canvas
        var imgEmoji = $(".emojiRender").children('.removeEmoji');
        var emojiImgArr = jQuery.makeArray(imgEmoji); // Make the emoji description array
        console.log('emojiArra: ' + emojiImgArr);
        var padLeft = 10;
        var canvas = document.getElementById('imageCanvas');
        var context = canvas.getContext('2d');

        $.each(emojiImgArr, function (index, value) { // Emoji Input to Canvas          
            console.log('index: ' + index + ' Title: ' + value.title);
            var imgEmo = new Image();
            (function (pad) {
                imgEmo.onload = function () {
                    context.drawImage(imgEmo, pad, 655, 60, 60);
                };
                imgEmo.src = 'images/emojis/' + value.title + '.png';
            })(padLeft);
            padLeft = padLeft + 70;
            console.log(padLeft);
        });

        var emojiIconObj = new Image(); // Add the emoji Icon Canvas
        emojiIconObj.onload = function () {
            context.globalAlpha = 0.58;
            context.drawImage(emojiIconObj, 14, 14, 132, 117);
        };
        emojiIconObj.src = 'images/emojiSelect/emoji-' + window.localStorage.getItem('parentPostEmoji') + '.png';
        emojiIconObj.addEventListener('load', sendPost);
    }

    var onSuccess = function (position)
    {
        postLat = position.coords.latitude;
        postLong = position.coords.longitude;
        console.log('postLat is ' + postLat + ' and postLong is ' + postLong);
        renderImage();
    };
    function onError(error)
    {
        postLat = window.localStorage.getItem('setViewLat');
        postLong = window.localStorage.setItem('setViewLong');
        console.log('Geo local fail postLat is ' + postLat + ' and postLong is ' + postLong);
        renderImage();
    }
    ;
    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    function sendPost() // Sent the post to server and save info to Database
    {   // Get the informtion to send to server
        var userID = window.localStorage.getItem('userID');
        var userEmail = window.localStorage.getItem('email');
        var parentEmoji = window.localStorage.getItem('parentPostEmoji');
        var timeStmp = $.now();
        var imageNameStr = timeStmp + '_' + userID;
        var postPublic = 1;
        var now = new Date();
        var month = now.getMonth() + 1;
        var timeDevice = now.getFullYear() + '-' + month + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
        console.log('User ID: ' + userID + ' User Email: ' + userEmail + ' Parent Emoji: ' + parentEmoji + ' Image Name: ' + imageNameStr + ' Public Post: ' + postPublic + ' Time on Device: ' + timeDevice);

        function uploadPhoto(fileNameStr) { // Upload Image Function
            $.mobile.loading("show", {
                text: 'Image uploading ...',
                textVisible: true
            });
            var imageData = document.getElementById('imageCanvas').toDataURL('image/png', 0.6);
            //console.log('Image DATA: ');
            //console.log(imageData);      
            $.ajax({// http://stackoverflow.com/questions/13198131/how-to-save-a-html5-canvas-as-image-on-a-server
                type: "POST",
                url: "http://emoapp.info/php/saveDataImage.php",
                data: {
                    imgBase64: imageData, name: fileNameStr
                }
            }).done(function (o) {
                console.log('Image Uploaded: saved');
                $.mobile.loading("hide");
                $(":mobile-pagecontainer").pagecontainer("change", "#mapPage", {transition: "fade"});
                // Open the Map Marker
                var imgSrc = 'http://www.emoapp.info/uploads/' + fileNameStr + '.png';
                //$('#emoPostPopup').attr('src', imgSrc);
                // Time Difference
                //$('#popUpInfo').html('<i class="fa fa-clock-o fa-2x"></i> Just now.');
                //$('#mapPage').addClass('show-popup');
                setLocale();
            });
        }
        uploadPhoto(imageNameStr); // Start the file upload process   
        console.log('Upload Info to Database: ');
        $.ajax({url: 'http://emoapp.info/php/postToMap.php',
            data: {
                action: 'post', userEmail: userEmail,
                parentEmoji: parentEmoji,
                imageLocation: imageNameStr,
                postPublic: postPublic, postLat: postLat,
                postLong: postLong, timeDevice: timeDevice
            },
            type: 'post',
            datatype: 'text',
            async: 'true',
            beforeSend: function () {
                console.log('Before send ');
            },
            complete: function () {
                console.log('Complete ');
            },
            success: function (result) {
                console.log('Database call was : ' + result);
                console.log('Post was inserted to database ' + result);
                console.log('Variables are - Post ID: ' + result + ' ' + postLat + ' ' + postLong + ' - Parent: ' + parentEmoji);
                addMarkerToMap(parentEmoji, result, postLat, postLong);
            },
            error: function (results, error) {
                // This callback function will trigger on unsuccessful action               
                $('#postToMapBtn').html('Post Failed' + error + ' ' + results.postID + ' ' + results.status);
                console.log('Post Failed ' + error + ' ' + results.postID + ' ' + results.status);
            }
        });
    }
    ;
});

// Create emoji Keypad 
// --------------------
$(document).on("pagecreate", "#emotionPostPage", function () { // load the emoji keypad
    var canvas = document.getElementById('imageCanvas'); // Set the image in place for camera
    canvas.width = 640; // Set Retina Image size
    canvas.height = 720;
    canvas.style.width = '320px'; // Set x2 Pixel ratio size
    canvas.style.height = '360px';
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    var canvasBtnObj = new Image();
    canvasBtnObj.onload = function () {
        context.globalAlpha = 1;
        context.drawImage(canvasBtnObj, 0, 0);
    };
    canvasBtnObj.src = 'images/menu/canvasBtn.svg';

    console.log('set tab selection of emoji');     // Set up emoji Keypad
    var tabIcons = [
        {
            ':joy:': 'joy.png',
            ':angry:': 'angry.png',
            ':sunglasses:': 'sunglasses.png',
            ':relaxed:': 'relaxed.png',
            ':smirk:': 'smirk.png',
            ':heart_eyes:': 'heart_eyes.png',
            ':kissing_heart:': 'kissing_heart.png',
            ':confused:': 'confused.png',
            ':flushed:': 'flushed.png',
            ':stuck_out_tongue_winking_eye:': 'stuck_out_tongue_winking_eye.png',
            ':grinning:': 'grinning.png',
            ':wink:': 'wink.png',
            ':expressionless:': 'expressionless.png',
            ':unamused:': 'unamused.png',
            ':pensive:': 'pensive.png',
            ':anguished:': 'anguished.png',
            ':disappointed:': 'disappointed.png',
            ':fearful:': 'fearful.png',
            ':grimacing:': 'grimacing.png',
            ':weary:': 'weary.png',
            ':cry:': 'cry.png',
            ':yum:': 'yum.png',
            ':eyes:': 'eyes.png',
            ':cop:': 'cop.png',
            ':older_man:': 'older_man.png',
            ':older_woman:': 'older_woman.png',
            ':bride_with_veil:': 'bride_with_veil.png',
            ':baby:': 'baby.png'
        }, // Tab 1 Similes
        {
            ':bear:': 'bear.png',
            ':cat:': 'cat.png',
            ':dog:': 'dog.png',
            ':chicken:': 'chicken.png',
            ':cow:': 'cow.png',
            ':frog:': 'frog.png',
            ':ghost:': 'ghost.png',
            ':hatched_chick:': 'hatched_chick.png',
            ':hear_no_evil:': 'hear_no_evil.png',
            ':see_no_evil:': 'see_no_evil.png',
            ':speak_no_evil:': 'speak_no_evil.png',
            ':horse:': 'horse.png',
            ':monkey:': 'monkey.png',
            ':mouse:': 'mouse.png',
            ':panda_face:': 'panda_face.png',
            ':penguin:': 'penguin.png',
            ':pig:': 'pig.png',
            ':monkey_face:': 'monkey_face.png',
            ':poop:': 'poop.png',
            ':skull:': 'skull.png',
            ':snail:': 'snail.png',
            ':snake:': 'snake.png',
            ':turtle:': 'turtle.png',
            ':whale:': 'whale.png',
            ':wolf:': 'wolf.png'
        }, // Tab 2 Animals        
        {
            ':apple:': 'apple.png',
            ':banana:': 'banana.png',
            ':cake:': 'cake.png',
            ':cookie:': 'cookie.png',
            ':doughnut:': 'doughnut.png',
            ':egg:': 'egg.png',
            ':pizza:': 'pizza.png',
            ':fries:': 'fries.png',
            ':hamburger:': 'hamburger.png',
            ':icecream:': 'icecream.png',
            ':lemon:': 'lemon.png',
            ':mushroom:': 'mushroom.png',
            ':strawberry:': 'strawberry.png',
            ':airplane:': 'airplane.png',
            ':ambulance:': 'ambulance.png',
            ':articulated_lorry:': 'articulated_lorry.png',
            ':bike:': 'bike.png',
            ':car:': 'car.png',
            ':bullettrain_side:': 'bullettrain_side.png',
            ':bus:': 'bus.png',
            ':fire_engine:': 'fire_engine.png',
            ':oncoming_automobile:': 'oncoming_automobile.png',
            ':oncoming_police_car:': 'oncoming_police_car.png',
            ':oncoming_taxi:': 'oncoming_taxi.png',
            ':police_car:': 'police_car.png',
            ':rowboat:': 'rowboat.png',
            ':tractor:': 'tractor.png',
            ':rocket:': 'rocket.png'
        }, // Tab Food, & Cars     
        {
            ':beer:': 'beer.png',
            ':beers:': 'beers.png',
            ':cocktail:': 'cocktail.png',
            ':coffee:': 'coffee.png',
            ':tropical_drink:': 'tropical_drink.png',
            ':wine_glass:': 'wine_glass.png',
            ':jack_o_lantern:': 'jack_o_lantern.png',
            ':fireworks:': 'fireworks.png',
            ':four_leaf_clover:': 'four_leaf_clover.png',
            ':christmas_tree:': 'christmas_tree.png',
            ':santa:': 'santa.png',
            ':snowflake:': 'snowflake.png',
            ':snowman:': 'snowman.png',
            ':ring:': 'ring.png',
            ':wedding:': 'wedding.png',
            ':angel:': 'angel.png',
            ':kiss:': 'kiss.png',
            ':pray:': 'pray.png',
            ':clap:': 'clap.png',
            ':couple_with_heart:': 'couple_with_heart.png',
            ':two_men_holding_hands:': 'two_men_holding_hands.png',
            ':two_women_holding_hands:': 'two_women_holding_hands.png',
            ':lips:': 'lips.png',
            ':dancer:': 'dancer.png',
            ':cupid:': 'cupid.png',
            ':gift_heart:': 'gift_heart.png',
            ':gift:': 'gift.png',
            ':dress:': 'dress.png'
        }, // Drink, Holidays & People        
        {
            ':baseball:': 'baseball.png',
            ':basketball:': 'basketball.png',
            ':football:': 'football.png',
            ':soccer:': 'soccer.png',
            ':golf:': 'golf.png',
            ':tennis:': 'tennis.png',
            ':swimmer:': 'swimmer.png',
            ':surfer:': 'surfer.png',
            ':snowboarder:': 'snowboarder.png',
            ':checkered_flag:': 'checkered_flag.png',
            ':eyeglasses:': 'eyeglasses.png',
            ':man:': 'man.png',
            ':muscle:': 'muscle.png',
            ':nail_care:': 'nail_care.png',
            ':ok_hand:': 'ok_hand.png',
            ':point_up:': 'point_up.png',
            ':punch:': 'punch.png',
            ':raised_hands:': 'raised_hands.png',
            ':runner:': 'runner.png',
            ':thumbDown:': 'thumbDown.png',
            ':thumbUp:': 'thumbUp.png',
            ':tongue:': 'tongue.png',
            ':walking:': 'walking.png',
            ':v:': 'v.png',
            ':bikini:': 'bikini.png',
            ':crown:': 'crown.png',
            ':trophy:': 'trophy.png',
            ':game_die:': 'game_die.png'
        }, // Sports and People
        {
            ':8ball:': '8ball.png',
            ':alarm_clock:': 'alarm_clock.png',
            ':alien:': 'alien.png',
            ':bomb:': 'bomb.png',
            ':bouquet:': 'bouquet.png',
            ':broken_heart:': 'broken_heart.png',
            ':dollar:': 'dollar.png',
            ':exclamation:': 'exclamation.png',
            ':question:': 'question.png',
            ':fire:': 'fire.png',
            ':flashlight:': 'flashlight.png',
            ':gem:': 'gem.png',
            ':guitar:': 'guitar.png',
            ':gun:': 'gun.png',
            ':heart:': 'heart.png',
            ':lipstick:': 'lipstick.png',
            ':mortar_board:': 'mortar_board.png',
            ':musical_note:': 'musical_note.png',
            ':pill:': 'pill.png',
            ':rose:': 'rose.png',
            ':shower:': 'shower.png',
            ':eggplant:': 'tab3/eggplant.png',
            ':star:': 'star.png',
            ':sunny:': 'sunny.png',
            ':sweat_drops:': 'sweat_drops.png',
            ':umbrella:': 'umbrella.png',
            ':zzz:': 'zzz.png'
        }  // Other Tab6
    ];

    for (var i = 0; i < 6; i++)
    {
        $.each(tabIcons[i], function (title, png)
        {
            var tabKey = '#tab' + i;
            $(tabKey).append('<img class="addEmoji" src="images/emojis/' + png + '" title="' + title + '">');
        });
    }
    ;
});

$(document).on('click', '.addEmoji', function () { // click to add emoji function
    var emojiName = $(this).attr('title');
    console.log('emoji clicked- Title is = ' + emojiName);
    console.log('emoji img added - now refresh p');

    $(".emojiRender").append(emojiName);
    $('.emojiRender').emoji();
});

$(document).on('click', '.removeEmoji', function () { // click removes emojis
    console.log('emoji img removed');
    $(this).remove();
});

// When the Profile is showen. This code will trigger
// ---------------------------------------------------
$(document).on("pageshow", "#profilePage", function (e, data) {

    e.preventDefault(); // Page show prevent default
    var profileImageArray = JSON.parse(window.localStorage.getItem('profileArray'));
    if (profileImageArray.length === 0)
    {
        window.localStorage.setItem('imageCount', 7);
        var userID = window.localStorage.getItem('userID');
        console.log('Getting posts for Users: ' + userID);
        $.ajax({url: 'http://emoapp.info/php/getUserPosts.php', // Get Users Posts
            data: {userID: userID},
            type: 'post',
            async: 'true',
            dataType: 'json',
            beforeSend: function () {  // This callback function will trigger before data is sent     
                $.mobile.loading("show", {
                    text: 'Fetching user Data',
                    textVisible: true
                });
            },
            complete: function () { // This callback function will trigger on data sent/received complete                
                $.mobile.loading("hide");
            },
            success: function (result) { // Get user posts and place them into assoc Array            
                console.log('User Posts Fetch successfull: ' + result);
                 // Remove no Posts Msg
                $.each(result.posts, function (index, value) {
                    console.log(index + ' : ' + value.postID);
                    array_push = [index, value.postID, value.imageName, value.timeServer, value.timeNow];
                    //console.log(array_push);
                    profileImageArray.push(array_push);
                    window.localStorage.setItem('profileArray', JSON.stringify(profileImageArray));
                });
                insertImageArray(window.localStorage.getItem('imageCount'));
            },
            error: function (error) { // This callback function will trigger on unsuccessful action                      
                $('#updateBtn').html('There was an error = ' + error);
                console.log('error = ' + error);
                console.log(error.success);
                $.mobile.loading('hide');
            }
        });
    }

    $("#addProfilePost").click(function () { // Add More Posts to Page
        var imgCount = window.localStorage.getItem('imageCount');
        insertImageArray(imgCount);
    });
});

function insertImageArray(imageCount) // Insert into Profile Page function
{
    var profileImageArray = JSON.parse(window.localStorage.getItem('profileArray'));
    if (profileImageArray > 0)  { // User has posts
        $('#noMsg').remove();
        // Remove the add button and append more images
        //$('#addProfilePost').remove();
        console.log('start loop imageCount is ' + imageCount);
        console.log('profileImageArray:' + profileImageArray);
        $.each(profileImageArray, function (index, value) {     // Loop through the array to the imageCount number
            if (index <= imageCount && index >= imageCount - 7)
            {
                var a = moment(value[3]);             // Time since Tag
                console.log(a);
                var b = moment(value[4]);
                console.log(b);
                var timeOffset = a.from(b); // Get time differ and insert posts to page
                $('#profilePosts').append('<div class="profilePostDiv" >'
                        + '<img id="' + value[2] + '" class="postDivImg" alt="' + timeOffset + '" src="http://www.emoapp.info/uploads/thumbs/' + value[2] + '.png"/>'
                        + '<p><i class="fa fa-clock-o"></i> ' + timeOffset + '</p>'
                        + '</div>');
            }
        });

        imageCount = parseInt(imageCount) + 7;
        window.localStorage.setItem('imageCount', imageCount);
        console.log('AfterInsert: imageCount is now ' + imageCount);
    }
    else {    // User has no posts   
        $('#noMsg').html('You have no posts yet. Click on Post in Menu to make one.');
    }

    $(".postDivImg").click(function () { // Expand Image on Click
        console.log('Image Clicked');
        var imgSrc = $(this).attr('id');
        var offSet = $(this).attr('alt');
        $('#profilePopup').append('<div class="giantImg"><img src="http://www.emoapp.info/uploads/' + imgSrc + '.png" class="animated bounceInDown"/><p><i class="fa fa-clock-o fa-2x"></i> ' + offSet + '</p></div>');
        // Remove Click Event
        $(".giantImg").click(function () {
            $(".giantImg").remove();
        });
    });
}

// Settings Page Code
// ------------------
$(document).on("pageshow", "#settingsPage", function () {

    $('#updateBtn').html('Update Info');
    var lsEmail = window.localStorage.getItem('email');
    console.log('Fetch LS email ' + lsEmail);
    $.ajax({url: 'http://emoapp.info/php/updateInfo2.php', //Fetch the form info
        data: {action: 'info', userEmail: lsEmail},
        type: 'post',
        async: 'true',
        dataType: 'json',
        beforeSend: function () {   // This callback function will trigger before data is sent
            $.mobile.loading("show", {text: '', textVisible: true});
        },
        complete: function () { // This callback function will trigger on data sent/received complete
            $.mobile.loading("hide");
        },
        success: function (result) {
            console.log('Info Fetch Succesfull');
            $('#firstName').val(result['firstName']);
            $('#lastName').val(result['lastName']);
            $('#selectGender').val(result['userGender']).selectmenu('refresh');
        },
        error: function (request, error) {  // This callback function will trigger on unsuccessful action               
            $('#updateBtn').html('There was an error');
            console.log('error = ' + error);
            console.log("XMLHttpRequest", XMLHttpRequest);
        }
    });

    $("#updateBtn").click(function () { // When the update button on settingPage is clicked
        console.log('Update Button Clicked');
        var firstName = $('#firstName').val();
        var lastName = $('#lastName').val();
        var genderType = $('#selectGender').val();
        var lsEmail = window.localStorage.getItem('email');
        console.log('Fetch LS email' + lsEmail);
        $.ajax({url: 'http://emoapp.info/php/updateInfo.php', // Update the user info
            data: {action: 'update', userEmail: lsEmail, userFirstName: firstName, userLastName: lastName, userGender: genderType},
            type: 'post', async: 'true', dataType: 'json',
            beforeSend: function () {   // This callback function will trigger before data is sent
                $.mobile.loading("show", {text: '', textVisible: true});
            },
            complete: function () {  // This callback function will trigger on data sent/received complete
                $.mobile.loading("hide");
            },
            success: function () {
                console.log('Update Succesfull');
                $('#updateBtn').html('Info Updated');
            },
            error: function (error) {    // This callback function will trigger on unsuccessful action               
                $('#updateBtn').html('There was an error = ' + error);
                console.log('error = ' + error);
            }
        });
    });

    $("#aboutButton").click(function () { // ABout Btn clicked
        $('#settingsPage').addClass('show-about');
    });

    $('#btnCloseAbout').click(function () { // ABout Btn closed
        $('#settingsPage').removeClass('show-about');
    });
});