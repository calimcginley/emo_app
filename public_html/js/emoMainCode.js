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