/*  EMO Emotion Mapping App | Main Code for App  */

// ------------------------------------------------------------------------------------------
// Init Code
// ------------------------------------------------------------------------------------------

$(document).ready(function () {

    var imageArray = [];
    window.localStorage.setItem('profileArray', JSON.stringify(imageArray));
    console.log(window.localStorage.getItem('profileArray'));

    // Load Menu 
//    console.log('load menu');
//    $( ".menu-wrap" ).load( "menu.html #menu" );

    // float label
    $('.floatlabel_1').floatlabel();

    $("#loginType").change(function () {
        var value = $('input[name=radio-loginSignUp]:checked').val();
        if (value === "signUp")
        {
            $('input[name=submitBtn]').val('Sign Up').button("refresh");
            $("#forgotPass").css("visibility", "hidden");
            $("#fbText").text(' Sign up with Facebook');
        }
        else
        {
            $('input[name=submitBtn]').val('Login').button("refresh");
            $("#forgotPass").css("visibility", "visible");
            $("#fbText").text(' Log in with Facebook');
        }
    });

    $('.mapLink').click(function () {
        var pageID = $.mobile.activePage.attr('id');
        $('#' + pageID).removeClass('show-menu');
        $(":mobile-pagecontainer").pagecontainer("change", "#mapPage", {transition: "slide"});
    });


});


// ------------------------------------------------------------------------------------------
// Show splash and the show mapPage
// ------------------------------------------------------------------------------------------
$(document).on("pageshow", "#splashPage", function () {
    setTimeout(function () {
        endOfSplash();
    }, 4000);

    $('#splashImage').click(function () {
        endOfSplash();
    });
});

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

// ------------------------------------------------------------------------------------------
// Wipes the Username input on click
// ------------------------------------------------------------------------------------------
function wipeValueUsername()
{
    document.getElementById('email').setAttribute('value', " ");
}

// ------------------------------------------------------------------------------------------
// Password Title Code
// There is two inputs for password one for title and the second for input
// This code alternates the visablity of the code depending on the focus
// ------------------------------------------------------------------------------------------
function setPasswordInputs()
{
    $('#password-clear').show();
    $('#password-password').hide();
    $('#password-clear').focus(function () {
        $('#password-clear').hide();
        $('#password-password').show();
        $('#password-password').focus();
    });

    $('#password-password').blur(function () {
        if ($('#password-password').val() === '')
        {
            $('#password-clear').show();
            $('#password-password').hide();
        }
    });

// Change the username title back in still blank
    $('#username').blur(function () {
        if ($('#username').val() === '')
        {
            document.getElementById('username').setAttribute('value', "Username");
        }
    });
}

// ------------------------------------------------------------------------------------------
// ------------------------------ Camera Function  -------------------------------
// ------------------------------------------------------------------------------------------


// A click event for each emoji which creates a token in local storage to aid empji post
$(document).ready(function () {
    parentOpen = false;
    $('.emoPostBtn').click(function (e) {

        console.log('Post Btn Clicked');
        var pageID = $.mobile.activePage.attr('id');
        console.log('pageID: ' + pageID);
        if (pageID === 'mapPage')
        {
            $('#' + pageID).removeClass('show-menu');
            isOpen = !isOpen;
            console.log('close menu');
            openParentEmojiBar();
        }
        else
        {
            console.log('Change to map page and open filter');
            $(":mobile-pagecontainer").pagecontainer("change", "#mapPage", {transition: "slide"});
            openParentEmojiBar();
        }

        function openParentEmojiBar()
        {
            console.log('Open Filter bar');
            $("#emojiPostSelectParent").velocity({top: "200px", easing: "easein"}, 10);
            $("#emojiPostSelectParent").velocity({left: "0", easing: "easein"}, 500);
            // Close Other
            $("#emojiSearchBar").velocity({top: "-100%", easing: "easein"}, 500);

            parentOpen = !parentOpen;
        }
    });

    $("#imageCanvas").click(function (e) {
        console.log('Camera CLicked');
        camera();
    });

    $('.emojiParent').on('click', function () {
        // Parent Emoji Clicked

        var pEmoji = $(this).attr('data-name');
        console.log(pEmoji);
        window.localStorage.setItem('parentPostEmoji', pEmoji);
        // Change Page
        $(":mobile-pagecontainer").pagecontainer("change", "#emotionPostPage", {transition: "slidedown"});
    });
});

function camera()
{
    //alert('camera function');
    // Place camera phonegap function here
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 48,
        destinationType: Camera.DestinationType.FILE_URI,
        targetWidth: 960,
        targetHeight: 960,
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
        // Add the emoji Colour
        context.rect(0, 0, 960, 975);
        context.fillStyle = emojiColours[parentEmoji];
        context.fill();

        // Camera Image Loaded
        var imageObj = new Image();
        imageObj.onload = function () {
            context.globalAlpha = 1;
            context.drawImage(imageObj, 0, 0, 960, 960);
        };
        imageObj.src = imageURI;
    }

    function onFail(message)
    {
        console.log('Camera Failed to load' + message);
    }
}

// -------------------------------------------------------------------------------------------
// ----------------------------------  Post to map  ---------------------------- 
// ------------------------------------------------------------------------------------------- 
$(document).on('click', '#postToMapBtn', function () {

    console.log('Post to map clicked:');
    // userID, emoType, emoji, imageName, songID, public, lat, long, timeLocal

    var postLat;
    var postLong;

    function renderImage() {

        var imgEmoji = $(".emojiRender").children('.removeEmoji');
        var emojiImgArr = jQuery.makeArray(imgEmoji);
        console.log(emojiImgArr);
        var padLeft = 15;
        var canvas = document.getElementById('imageCanvas');
        var context = canvas.getContext('2d');

        $.each(emojiImgArr, function (index, value)
        {
            // Emoji Input Canvas
            console.log(index);
            console.log(value.title);
            var imgEmo = new Image();
            (function (pad) {
                imgEmo.onload = function () {
                    context.drawImage(imgEmo, pad, 980, 90, 90);
                };
                imgEmo.src = 'images/emojis/' + value.title + '.png';
            })(padLeft);
            padLeft = padLeft + 105;
            console.log(padLeft);
        });
        // Add the emoji Icon Canvas
        var emojiIconObj = new Image();
        emojiIconObj.onload = function () {
            context.globalAlpha = 0.58;
            context.drawImage(emojiIconObj, 20, 20, 200, 176);
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

    function sendPost()
    {
        var userID = window.localStorage.getItem('userID');
        var userEmail = window.localStorage.getItem('email');
        console.log('User Email: ' + userEmail);
        var parentEmoji = window.localStorage.getItem('parentPostEmoji');
        console.log('Parent Emoji: ' + parentEmoji);
        var timeStmp = $.now();
        var imageNameStr = timeStmp + '_' + userID;
        console.log('Image Name: ' + imageNameStr);
        var postPublic = 1;
        console.log('Public Post: ' + postPublic);
        var now = new Date();
        var month = now.getMonth() + 1;
        var timeDevice = now.getFullYear() + '-' + month + '-' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
        console.log('Time on Device: ' + timeDevice);

        function uploadPhoto(fileNameStr) {
            $.mobile.loading("show", {
                text: 'Image uploading ...',
                textVisible: true
            });
            console.log('File Path');
            var imageData = document.getElementById('imageCanvas').toDataURL('image/jpg');
            console.log('Image DATA: ');
            console.log(imageData);

            // http://stackoverflow.com/questions/13198131/how-to-save-a-html5-canvas-as-image-on-a-server
            $.ajax({
                type: "POST",
                url: "http://emoapp.info/php/saveDataImage.php",
                data: {
                    imgBase64: imageData, name: fileNameStr
                }
            }).done(function (o) {
                console.log('Image Uploaded: saved');
                $.mobile.loading("hide");
                $(":mobile-pagecontainer").pagecontainer("change", "#mapPage", {transition: "fade"});
            });
        }

        // Start the file upload process        
        uploadPhoto(imageNameStr);
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
                // This callback function will trigger before data is sent
                console.log('Before send ');
                //$.mobile.showPageLoadingMsg(true); // This will show ajax spinner
            },
            complete: function () {
                // This callback function will trigger on data sent/received complete
                console.log('Complete ');
            },
            success: function (result) {
                console.log('Database call was : ' + result);
                console.log('Post was inserted to database ' + result);
                console.log('Variables are - Post ID: ' + result + ' ' + postLat + ' ' + postLong + ' - Parent: ' + parentEmoji);
                addMarkerToMap(parentEmoji, result, postLat, postLong);
                centerMap(postLat, postLong);
                //$('')
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


// -------------------------------------------------------------------------------------------
// ----------------------------------  emoji Keypad ---------------------------- 
// ------------------------------------------------------------------------------------------- 
$(document).ready(function ()
{
    $('.emojiRender').each(function (i, d) {
        console.log('emoji img code set');
        $(d).emoji();
    });

    // Set local storage value for keypad
    window.localStorage.setItem('emojiKeypad', 'off');
    $("#toggle").click(function () {

        $("#panel").slideToggle("fast");
        // Get keypad on/off value
        var keypadOnOff = window.localStorage.getItem('emojiKeypad');
        // Checks which position keypad is in
        if (keypadOnOff === 'off')
        {
            console.log('emoji keypad opened');
            $('#toggle').html('close');
            $("#insertButtons").velocity({top: "-=250", easing: "easein"}, 400).delay(800);
            window.localStorage.setItem('emojiKeypad', 'on');
        }
        else
        {
            console.log('emoji keypad closed');
            $('#toggle').html('Describe');
            $("#insertButtons").velocity({top: "+=250", easing: "easein"}, 400).delay(800);
            window.localStorage.setItem('emojiKeypad', 'off');
        }
    });
});


// load the emoji keypad
$(document).on("pagecreate", "#emotionPostPage", function () {

    // Set the image in place for camera
    var canvas = document.getElementById('imageCanvas');
    canvas.width = 960;
    canvas.height = 1080;
    canvas.style.width = '320px';
    canvas.style.height = '360px';
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    var canvasBtnObj = new Image();

    canvasBtnObj.onload = function () {
        context.globalAlpha = 1;
        context.drawImage(canvasBtnObj, 0, 0);
    };
    canvasBtnObj.src = 'images/menu/canvasBtn.svg';

    // Set up emoji Keypad
    console.log('set tab selection of emoji');
    var tabIcons = [
        {
            ':joy:': 'tab1/joy.png',
            ':angry:': 'tab1/angry.png',
            ':sunglasses:': 'tab1/sunglasses.png',
            ':relaxed:': 'tab1/relaxed.png',
            ':smirk:': 'tab1/smirk.png',
            ':heart_eyes:': 'tab1/heart_eyes.png',
            ':kissing_heart:': 'tab1/kissing_heart.png',
            ':confused:': 'tab1/confused.png',
            ':flushed:': 'tab1/flushed.png',
            ':stuck_out_tongue_winking_eye:': 'tab1/stuck_out_tongue_winking_eye.png',
            ':grinning:': 'tab1/grinning.png',
            ':wink:': 'tab1/wink.png',
            ':expressionless:': 'tab1/expressionless.png',
            ':unamused:': 'tab1/unamused.png',
            ':pensive:': 'tab1/pensive.png',
            ':anguished:': 'tab1/anguished.png',
            ':disappointed:': 'tab1/disappointed.png',
            ':fearful:': 'tab1/fearful.png',
            ':grimacing:': 'tab1/grimacing.png',
            ':weary:': 'tab1/weary.png',
            ':cry:': 'tab1/cry.png',
            ':yum:': 'tab1/yum.png',
            ':eyes:': 'tab1/eyes.png',
            ':cop:': 'tab1/cop.png',
            ':older_man:': 'tab1/older_man.png',
            ':older_woman:': 'tab1/older_woman.png',
            ':bride_with_veil:': 'tab1/bride_with_veil.png',
            ':baby:': 'tab1/baby.png'
        }, // Tab 1 Similes
        {
            ':bear:': 'tab2/bear.png',
            ':cat:': 'tab2/cat.png',
            ':dog:': 'tab2/dog.png',
            ':chicken:': 'tab2/chicken.png',
            ':cow:': 'tab2/cow.png',
            ':frog:': 'tab2/frog.png',
            ':ghost:': 'tab2/ghost.png',
            ':hatched_chick:': 'tab2/hatched_chick.png',
            ':hear_no_evil:': 'tab2/hear_no_evil.png',
            ':see_no_evil:': 'tab2/see_no_evil.png',
            ':speak_no_evil:': 'tab2/speak_no_evil.png',
            ':horse:': 'tab2/horse.png',
            ':monkey:': 'tab2/monkey.png',
            ':mouse:': 'tab2/mouse.png',
            ':panda_face:': 'tab2/panda_face.png',
            ':penguin:': 'tab2/penguin.png',
            ':pig:': 'tab2/pig.png',
            ':monkey_face:': 'tab2/monkey_face.png',
            ':poop:': 'tab2/poop.png',
            ':skull:': 'tab2/skull.png',
            ':snail:': 'tab2/snail.png',
            ':snake:': 'tab2/snake.png',
            ':turtle:': 'tab2/turtle.png',
            ':whale:': 'tab2/whale.png',
            ':wolf:': 'tab2/wolf.png'
        }, // Tab 2 Animals        
        {
            ':apple:': 'tab3/apple.png',
            ':banana:': 'tab3/banana.png',
            ':cake:': 'tab3/cake.png',
            ':cookie:': 'tab3/cookie.png',
            ':doughnut:': 'tab3/doughnut.png',
            ':egg:': 'tab3/egg.png',
            ':eggplant:': 'tab3/eggplant.png',
            ':pizza:': 'tab3/pizza.png',
            ':fries:': 'tab3/fries.png',
            ':hamburger:': 'tab3/hamburger.png',
            ':icecream:': 'tab3/icecream.png',
            ':lemon:': 'tab3/lemon.png',
            ':mushroom:': 'tab3/mushroom.png',
            ':strawberry:': 'tab3/strawberry.png',
            ':airplane:': 'tab3/airplane.png',
            ':ambulance:': 'tab3/ambulance.png',
            ':articulated_lorry:': 'tab3/articulated_lorry.png',
            ':bike:': 'tab3/bike.png',
            ':car:': 'tab3/car.png',
            ':bullettrain_side:': 'tab3/bullettrain_side.png',
            ':bus:': 'tab3/bus.png',
            ':fire_engine:': 'tab3/fire_engine.png',
            ':oncoming_automobile:': 'tab3/oncoming_automobile.png',
            ':oncoming_police_car:': 'tab3/oncoming_police_car.png',
            ':oncoming_taxi:': 'tab3/oncoming_taxi.png',
            ':police_car:': 'tab3/police_car.png',
            ':rowboat:': 'tab3/rowboat.png',
            ':tractor:': 'tab3/tractor.png',
            ':ship:': 'tab3/ship.png',
            ':rocket:': 'tab3/rocket.png'
        }, // Tab Food, Drink & Cars     
        {
            ':beer:': 'tab4/beer.png',
            ':beers:': 'tab4/beers.png',
            ':cocktail:': 'tab4/cocktail.png',
            ':coffee:': 'tab4/coffee.png',
            ':tropical_drink:': 'tab4/tropical_drink.png',
            ':wine_glass:': 'tab4/wine_glass.png',
            ':jack_o_lantern:': 'tab4/jack_o_lantern.png',
            ':fireworks:': 'tab4/fireworks.png',
            ':four_leaf_clover:': 'tab4/four_leaf_clover.png',
            ':christmas_tree:': 'tab4/christmas_tree.png',
            ':santa:': 'tab4/santa.png',
            ':snowflake:': 'tab4/snowflake.png',
            ':snowman:': 'tab4/snowman.png',
            ':ring:': 'tab4/ring.png',
            ':wedding:': 'tab4/wedding.png',
            ':angel:': 'tab4/angel.png',
            ':kiss:': 'tab4/kiss.png',
            ':pray:': 'tab4/pray.png',
            ':clap:': 'tab4/clap.png',
            ':couple_with_heart:': 'tab4/couple_with_heart.png',
            ':two_men_holding_hands:': 'tab4/two_men_holding_hands.png',
            ':two_women_holding_hands:': 'tab4/two_women_holding_hands.png',
            ':lips:': 'tab4/lips.png',
            ':dancer:': 'tab4/dancer.png',
            ':cupid:': 'tab4/cupid.png',
            ':gift_heart:': 'tab4/gift_heart.png',
            ':gift:': 'tab4/gift.png',
            ':dress:': 'tab4/dress.png'
        }, // Drink, Holidays & People        
        {
            ':baseball:': 'tab5/baseball.png',
            ':basketball:': 'tab5/basketball.png',
            ':football:': 'tab5/football.png',
            ':soccer:': 'tab5/soccer.png',
            ':golf:': 'tab5/golf.png',
            ':tennis:': 'tab5/tennis.png',
            ':swimmer:': 'tab5/swimmer.png',
            ':surfer:': 'tab5/surfer.png',
            ':snowboarder:': 'tab5/snowboarder.png',
            ':checkered_flag:': 'tab5/checkered_flag.png',
            ':eyeglasses:': 'tab5/eyeglasses.png',
            ':man:': 'tab5/man.png',
            ':muscle:': 'tab5/muscle.png',
            ':nail_care:': 'tab5/nail_care.png',
            ':ok_hand:': 'tab5/ok_hand.png',
            ':point_up:': 'tab5/point_up.png',
            ':punch:': 'tab5/punch.png',
            ':raised_hands:': 'tab5/raised_hands.png',
            ':runner:': 'tab5/runner.png',
            ':thumbDown:': 'tab5/thumbDown.png',
            ':thumbUp:': 'tab5/thumbUp.png',
            ':tongue:': 'tab5/tongue.png',
            ':walking:': 'tab5/walking.png',
            ':v:': 'tab5/v.png',
            ':bikini:': 'tab5/bikini.png',
            ':crown:': 'tab5/crown.png',
            ':trophy:': 'tab5/trophy.png',
            ':game_die:': 'tab5/game_die.png'
        }, // Sports and People
        {
            ':8ball:': 'tab6/8ball.png',
            ':alarm_clock:': 'tab6/alarm_clock.png',
            ':alien:': 'tab6/alien.png',
            ':bomb:': 'tab6/bomb.png',
            ':bouquet:': 'tab6/bouquet.png',
            ':broken_heart:': 'tab6/broken_heart.png',
            ':dollar:': 'tab6/dollar.png',
            ':exclamation:': 'tab6/exclamation.png',
            ':question:': 'tab6/question.png',
            ':fire:': 'tab6/fire.png',
            ':flashlight:': 'tab6/flashlight.png',
            ':gem:': 'tab6/gem.png',
            ':guitar:': 'tab6/guitar.png',
            ':gun:': 'tab6/gun.png',
            ':heart:': 'tab6/heart.png',
            ':lipstick:': 'tab6/lipstick.png',
            ':mortar_board:': 'tab6/mortar_board.png',
            ':musical_note:': 'tab6/musical_note.png',
            ':pill:': 'tab6/pill.png',
            ':rose:': 'tab6/rose.png',
            ':shower:': 'tab6/shower.png',
            ':star:': 'tab6/star.png',
            ':sunny:': 'tab6/sunny.png',
            ':sweat_drops:': 'tab6/sweat_drops.png',
            ':umbrella:': 'tab6/umbrella.png',
            ':zzz:': 'tab6/zzz.png'
        }  // Other Tab6
    ];

    // sample to build off 
    //console.log('run thru array and add emoji');

    for (var i = 0; i < 6; i++)
    {
        //console.log('This is loop' + i);
        $.each(tabIcons[i], function (title, png)
        {
            var tabKey = '#tab' + i;
            //console.log('added' + title + ' emoji' + tabKey);
            $(tabKey).append('<img class="addEmoji" src="images/emojis/' + png + '" title="' + title + '">');
        });
    }
    ;
});

// click to add emoji function

$(document).on('click', '.addEmoji', function () {
    var emojiName = $(this).attr('title');
    console.log('emoji clicked- Title is = ' + emojiName);
    console.log('emoji img added - now refresh p');

    $(".emojiRender").append(emojiName);
    $('.emojiRender').emoji();
});

// click removes emojis
$(document).on('click', '.removeEmoji', function () {
    console.log('emoji img removed');
    $(this).remove();
});

// -------------------------------------------------------------------------------------------
// ------------------------------  When the Profile is showen ---------------------------- 
// ------------------------------  This code will trigger ------------------------------------
// ------------------------------------------------------------------------------------------- 




$(document).on("pageshow", "#profilePage", function (e, data) {
// -------------------------------------------------------------------------------------------
// ------------  Profile Page Images ---------------------------- 

    // Page show prevent default
    e.preventDefault();
    var profileImageArray = JSON.parse(window.localStorage.getItem('profileArray'));
    if (profileImageArray.length === 0)
    {
        window.localStorage.setItem('imageCount', 7);
        var userID = window.localStorage.getItem('userID');
        $.ajax({url: 'http://emoapp.info/php/getUserPosts.php',
            data: {userID: userID},
            type: 'post',
            async: 'true',
            dataType: 'json',
            beforeSend: function () {
                // This callback function will trigger before data is sent
                $.mobile.loading("show", {
                    text: 'Fetching user Data',
                    textVisible: true
                });
            },
            complete: function () {
                // This callback function will trigger on data sent/received complete
                $.mobile.loading("hide");
            },
            success: function (result) {

                // Get user posts and place them into assoc Array
                console.log('User Posts Fetch successfull');
                $.each(result.posts, function (index, value) {
                    console.log(index + ' : ' + value.postID);
                    array_push = [index, value.postID, value.imageName, value.timeServer, value.timeNow];
                    console.log(array_push);
                    profileImageArray.push(array_push);
                    window.localStorage.setItem('profileArray', JSON.stringify(profileImageArray));

                });
                insertImageArray(window.localStorage.getItem('imageCount'));

            },
            error: function (error) {
                // This callback function will trigger on unsuccessful action               
                $('#updateBtn').html('There was an error = ' + error);
                console.log('error = ' + error);
                console.log(error);
                console.log(error.success);
                console.log("XMLHttpRequest", XMLHttpRequest);
            }
        });
    }
    /// Array it here
});


function insertImageArray(imageCount)
{
    var profileImageArray = JSON.parse(window.localStorage.getItem('profileArray'));
    // Remove the add button and append more images
    //$('#addProfilePost').remove();
    console.log('start loop imageCount is ' + imageCount);
    // Loop through the array to the imageCount number
    console.log('profileImageArray:');
    console.log(profileImageArray);
    console.log(profileImageArray.length);
    $.each(profileImageArray, function (index, value) {
        if (index <= imageCount && index >= imageCount - 7)
        {
            // Time since Tag
            var a = moment(value[3]);
            console.log(a);
            var b = moment(value[4]);
            console.log(b);
            var timeOffset = a.from(b);
            $('#profilePosts').append('<div class="profilePostDiv">'
                    + '<img class="postDivImg" alt="' + timeOffset + '" src="http://www.emoapp.info/uploads/' + value[2] + '.jpg"/>'
                    + '<p><i class="fa fa-clock-o"></i> ' + timeOffset + '</p>'
                    + '</div>');
        }
    });
    // Append the add Button
    //$('#addProfilePost').append('<button id="addProfilePost" data-theme="a">Load More</button>');
    imageCount = parseInt(imageCount) + 7;
    window.localStorage.setItem('imageCount', imageCount);
    console.log('AfterInsert: imageCount is now ' + imageCount);

    $(".postDivImg").click(function () {
        console.log('Image Clicked');
        var imgSrc = $(this).attr('src');
        var offSet = $(this).attr('alt');
        $('#profilePopup').append('<div class="giantImg"><img src="' + imgSrc + '" class="animated bounceInDown"/><p><i class="fa fa-clock-o fa-2x"></i> ' + offSet + '</p></div>');
        // Remove Click Event
        $(".giantImg").click(function () {
            $(".giantImg").remove();
        });
    });
}

$(document).ready(function ()
{
    $("#addProfilePost").click(function () {
        // Honey Add Button Clicked
        console.log('Honey Add Button Clicked');
        var imgCount = window.localStorage.getItem('imageCount');
        insertImageArray(imgCount);
    });

    // profilePostDiv
});

$(document).on("pageshow", "#settingsPage", function () {

    $('#updateBtn').html('Update Info');
    console.log('Settings page opened');
    var lsEmail = window.localStorage.getItem('email');
    console.log('Fetch LS email ' + lsEmail);
    //Fetch the form info
    $.ajax({url: 'http://emoapp.info/php/updateInfo2.php',
        data: {action: 'info', userEmail: lsEmail},
        type: 'post',
        async: 'true',
        dataType: 'json',
        beforeSend: function () {
            // This callback function will trigger before data is sent

            $.mobile.loading("show", {
                text: '',
                textVisible: true
            });
        },
        complete: function () {
            // This callback function will trigger on data sent/received complete
            $.mobile.loading("hide");
        },
        success: function (result) {
            console.log('Info Fetch Succesfull');
            $('#firstName').val(result['firstName']);
            $('#lastName').val(result['lastName']);
            $('#selectGender').val(result['userGender']).selectmenu('refresh');
        },
        error: function (request, error) {
            // This callback function will trigger on unsuccessful action               
            $('#updateBtn').html('There was an error');
            console.log('error = ' + error);
            console.log("XMLHttpRequest", XMLHttpRequest);
        }
    });
// -------------------------------------------------------------------------------------------
// ------------  When the update button on settingPage os clicked ---------------------------- 
// ------------------------------  This code will trigger ------------------------------------
// ------------------------------------------------------------------------------------------- 
    $("#updateBtn").click(function ()
    {
        console.log('Update Button Clicked');
        var firstName = $('#firstName').val();
        var lastName = $('#lastName').val();
        var genderType = $('#selectGender').val();
        var lsEmail = window.localStorage.getItem('email');
        console.log('Fetch LS email' + lsEmail);
        // Update the user info
        $.ajax({url: 'http://emoapp.info/php/updateInfo.php',
            data: {action: 'update', userEmail: lsEmail, userFirstName: firstName, userLastName: lastName, userGender: genderType},
            type: 'post',
            async: 'true',
            dataType: 'json',
            beforeSend: function () {
                // This callback function will trigger before data is sent
                $.mobile.loading("show", {
                    text: '',
                    textVisible: true
                });
            },
            complete: function () {
                // This callback function will trigger on data sent/received complete
                $.mobile.loading("hide");
            },
            success: function () {
                console.log('Update Succesfull');
                $('#updateBtn').html('Info Updated');
            },
            error: function (error) {
                // This callback function will trigger on unsuccessful action               
                $('#updateBtn').html('There was an error = ' + error);
                console.log('error = ' + error);
                console.log("XMLHttpRequest", XMLHttpRequest);
            }
        });
    });

    $("#aboutButton").click(function ()
    {
        $('#settingsPage').addClass('show-about');
    });

    $('#btnCloseAbout').click(function () {
        $('#settingsPage').removeClass('show-about');
    });
});