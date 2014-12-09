// I changed this to operate on a multipage JQM app
// To do this I changed the 'show-menu' toggle to be added on click
// events for each menu button in the app and their unqiue id. 

// Menu open or closed
isPopUpOpen = false;
isInfoMenuOpen = false;

/****************  #mapPage  ******************/
// Menu Open close for #mapPage

function closeInfoMenu() { // vibes info       
    $(".infoMenu").velocity({opacity: '0', easing: 'easeout'}, 900); // vibes info
    $('#panelBtns').velocity({top: '90px', easing: 'easein'}, 600, function () {
        $(".infoMenu").hide();
    });
    isInfoMenuOpen = !isInfoMenuOpen;
}

$(document).ready(function () {

    $(".mapLink").click(function () { // Return to Map "Home Button" Event
        if ('mapPage' === $.mobile.activePage.attr('id'))
        {
            $("#menuPanel").panel("close");
        }
        else
        {
            $("#menuPanel").panel("close");
            $(":mobile-pagecontainer").pagecontainer("change", "#mapPage", {transition: "slide"});
        }
    });

    $('#mapPage').on('click', '#btnClose', function () { // Close the Popup using #close-button
        $('#mapPage').removeClass('show-popup');
        $('#settingsPage').removeClass('show-about');
        console.log('Close popup on map page');
        console.log('The current page is ' + $.mobile.activePage.attr('id'));
    });

    $('.infoMenuButton').click(function () {
        // check if infoMenu is open
        console.log('Button click: infoMenuButton');
        if (!isInfoMenuOpen) // MEnu is closed, open it
        { // Lets Scroll      
            $(".infoMenu").show(); // vibes info
            $(".infoMenu").velocity({opacity: '1', easing: 'easein'}, 600); // vibes info
            $('#panelBtns').velocity({top: '-290px', easing: 'easein'}, 800);
            isInfoMenuOpen = !isInfoMenuOpen;
        }
        else
        {
            closeInfoMenu();
        }
    });

    $('.about-wrap').click(function () { // Close About Popup
        $('#settingsPage').removeClass('show-about');
    });
});

$(document).on("pagecontainerbeforehide", function (event, ui) { // Remove Classes when leaving map page
    closeMenus();
    closeInfoMenu();
    isPopUpOpen = false;
    isInfoMenuOpen = false;
});

function closeMenus() {
    var pageID = $.mobile.activePage.attr('id'); // Close the menu when leaving page
    $("#menuPanel").panel("close");
    $('#' + pageID).removeClass('show-popup');
    $('#settingsPage').removeClass('show-about');
    $("#emojiSearchBar").velocity({top: "-120%", easing: "easein"}, 500);
    $("#emojiPostSelectParent").velocity({left: "-100%", easing: "easein"}, 500);
}