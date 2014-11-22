// I changed this to operate on a multipage JQM app
// To do this I changed the 'show-menu' toggle to be added on click
// events for each menu button in the app and their unqiue id. 

// Menu open or closed
isOpen = false;
isPopUpOpen = false;
isInfoMenuOpen = false;



/****************  #mapPage  ******************/
// Menu Open close for #mapPage

$(document).ready(function () {
    $(".mapLink").click(function () {
        if (isOpen && 'mapPage' === $.mobile.activePage.attr('id'))
        {
            $("#menuPanel").panel("close");
            $('#settingsPage').removeClass('show-about');
            isOpen = !isOpen;
        }
    });

// Close the Popup using #close-button
    $('#mapPage').on('click', '#btnClose', function () {
        $('#mapPage').removeClass('show-popup');
        $('#settingsPage').removeClass('show-about');
        console.log('Close popup on map page');
        console.log('The current page is ' + $.mobile.activePage.attr('id'));
    });

    $('.infoMenuButton').click(function () {
        // check if infoMenu is open
        console.log('Button click: infoMenuButton');
        if (!isInfoMenuOpen)
        {
            $(".panel-btn").velocity({width: 0, easing: "easein"}, 500); //menu-top-buttons
            $(".infoMenu").show(); // vibes info
            $(".menu-top-buttons a").velocity({height: 0, easing: "easein"}, 500); //menu-top-buttons
            $(".infoMenuButtonImg").velocity({marginBottom: 0, easing: "easein"}, 500); //menu-top-buttons
            isInfoMenuOpen = !isInfoMenuOpen;
        }
        else
        {
            closeInfoMenu();
        }
    });

    function closeInfoMenu()
    {
        $(".panel-btn").velocity({width: '150px', easing: "easein"}, 500);
        $(".infoMenu").hide(); // vibes info
        $(".menu-top-buttons a").velocity({height: 72, easing: "easein"}, 500); //menu-top-buttons
        $(".infoMenuButtonImg").velocity({marginBottom: 100, easing: "easein"}, 500); //menu-top-buttons
        isInfoMenuOpen = !isInfoMenuOpen;
    }

    $('.about-wrap').click(function () {
        $('#settingsPage').removeClass('show-about');
    });
});

// Remove Classes when leaving map page
$(document).on("pagecontainerbeforehide", function (event, ui) {
// Close the menu when leaving page
    var pageID = $.mobile.activePage.attr('id');
    $("#menuPanel").panel("close");
    $('#' + pageID).removeClass('show-popup');
    $('#settingsPage').removeClass('show-about');
    $("#emojiSearchBar").velocity({top: "-100%", easing: "easein"}, 500);
    $("#emojiPostSelectParent").velocity({left: "-100%", easing: "easein"}, 500);
    if (isInfoMenuOpen)
    {
        $(".menu-top-buttons a").velocity("reverse");
        $(".left-panel-btn").velocity("reverse");
    }
    isOpen = false;
    isPopUpOpen = false;
    isInfoMenuOpen = false;
});