// I changed this to operate on a multipage JQM app
// To do this I changed the 'show-menu' toggle to be added on click
// events for each menu button in the app and their unqiue id. 

// Menu open or closed
isOpen = false;
isPopUpOpen = false;


/****************  #mapPage  ******************/
// Menu Open close for #mapPage
$(".menu-button").click(function() {
    // Get the active page ID
    var pageID = $.mobile.activePage.attr('id');
    // Click event for the menu button
    if ($('#' + pageID).hasClass('show-menu'))
    {
        $('#' + pageID).removeClass('show-menu');
        console.log('Close Menu on map page');
        console.log('The current page is ' + $.mobile.activePage.attr('id'));
    }
    else
    {
        $('#' + pageID).addClass('show-menu');
        $("#emojiSearchBar").velocity({top: "-100%", easing: "easein"}, 500);
        $("#emojiPostSelectParent").velocity({left: "-100%", easing: "easein"}, 500);
        $('#mapPage').removeClass('show-popup');
        console.log('Open Menu on map page');
    }
    // Toggles the true flase value of isOpen
    isOpen = !isOpen;
});

$(".mapLink").click(function(){
    if (isOpen && 'mapPage' === $.mobile.activePage.attr('id'))
    {
        $('#mapPage').removeClass('show-menu');
        console.log('Close Menu on map page - clicked on mapPage Button');
        isOpen = !isOpen;           
    }   
});

// Content closeing event
$(".content-wrap").click(function() {
    // The menu is open
    if (isOpen)
    {
        // Get the active page ID
        var pageID = $.mobile.activePage.attr('id');
        $('#' + pageID).removeClass('show-menu');
        console.log('Close Menu on map page - clicked on .content-wrap');
        isOpen = !isOpen;
    }
    else if (isPopUpOpen)
    {
        $('#mapPage').removeClass('show-popup');
        isPopUpOpen = !isPopUpOpen;
    }
});

// Close the Popup using #close-button
$('#btnClose').click(function() {
    $('#mapPage').removeClass('show-popup');
    console.log('Close popup on map page');
    console.log('The current page is ' + $.mobile.activePage.attr('id'));
});

// Remove Classes when leaving map page
$(document).on("pagecontainerbeforehide", function(event, ui) {
// Close the menu when leaving page
    var pageID = $.mobile.activePage.attr('id');
    $('#' + pageID).removeClass('show-menu');
    $('#' + pageID).removeClass('show-popup');
    $("#emojiSearchBar").velocity({top: "-100%", easing: "easein"}, 500);
    $("#emojiPostSelectParent").velocity({left: "-100%", easing: "easein"}, 500);
    isOpen = false;
    isPopUpOpen = false;
});