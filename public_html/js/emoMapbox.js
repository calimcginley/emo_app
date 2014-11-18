/*  EMO Emotion Mapping App | Hexbin and Map Markers | Mapbox.js */

// Declare map variables here
var map;
var hexLayer;
var markers;
var setViewLat;
var setViewLong;
window.localStorage.setItem('hex-are', 'on');
var emoFilterArray = ['1', '2', '3', '4', '5', '6', '7', '8'];
window.localStorage.setItem('timeType', 'fastButtons');
window.localStorage.setItem('interval', 'WEEK');
var filterOpen = false;
var firstMarkers = true;

var onSuccess = function (position)
{
    setViewLat = position.coords.latitude;
    window.localStorage.setItem('postLat', setViewLat);
    setViewLong = position.coords.longitude;
    window.localStorage.setItem('postLong', setViewLong);
    console.log('geo local success lat is ' + setViewLat + ' and long is ' + setViewLong);
    if (firstMarkers)
    {
        setMapInAction();
    }
};

function onError(error)
{
    setViewLat = '53.344103999999990000';
    window.localStorage.setItem('postLat', setViewLat);
    setViewLong = '-6.267493699999932000';
    window.localStorage.setItem('postLong', setViewLong);
    console.log('Geo local fail lat is ' + setViewLat + ' and long is ' + setViewLong);
    if (firstMarkers)
    {
        setMapInAction();
    }
}

function setLocale()
{
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

setLocale();


function setMapInAction()
{
    //**********************  Create Leaflet/Mapbox Map ************************
    //**************************************************************************

    console.log('At mapbox stage the lat is ' + setViewLat + ' and long is ' + setViewLong);
    map = L.mapbox.map('map', 'sona.3ab9e710', {zoomControl: false, detectRetina: true, maxZoom: 20, attributionControl: false})
            .setView([setViewLat, setViewLong], 14);
    // Add the locate Button
    //L.control.locate({position:'bottomright'}).addTo(map);
    var MyControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'centerButton');
            console.log('Lets Create the New Button');

            // ... initialize other DOM elements, add listeners, etc.
            var link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
            link.href = '#';

            L.DomEvent
                    .on(link, 'click', L.DomEvent.stopPropagation)
                    .on(link, 'click', L.DomEvent.preventDefault)
                    .on(link, 'click', function () {
                        console.log('Center Button Clicked!!1');
                        setLocale();
                        var cenLat = window.localStorage.getItem('postLat');
                        var cenLng = window.localStorage.getItem('postLong');
                        console.log('Lat: ' + cenLat + 'Long: ' + cenLng);
                        map.setView({lat: cenLat, lon: cenLng});
                    });
            return container;
        }
    });
    console.log('Lets Add the New Button');
    map.addControl(new MyControl());



    //**********************  Leaflet Hexbin Layer Class ***********************
    //**************************************************************************
    L.HexbinLayer = L.Class.extend({
        includes: L.Mixin.Events,
        initialize: function (rawData, options) {
            this.levels = {};
            this.layout = d3.hexbin().radius(15);
            this.rscale = d3.scale.sqrt().range([0, 15]).clamp(false);
            this.rwData = rawData;
            this.config = options;
        },
        project: function (x) {
            var point = this.map.latLngToLayerPoint([x[1], x[0]]);
            return [point.x, point.y];
        },
        getBounds: function (d) {
            var b = d3.geo.bounds(d);
            return L.bounds(this.project([b[0][0], b[1][1]]), this.project([b[1][0], b[0][1]]));
        },
        update: function () {
            var pad = 50, xy = this.getBounds(this.rwData), zoom = this.map.getZoom();
            this.container
                    //  Container Widths not Hex sizes
                    .attr("width", xy.getSize().x + (2 * pad))
                    .attr("height", xy.getSize().y + (2 * pad))
                    .style("margin-left", (xy.min.x - pad) + "px")
                    .style("margin-top", (xy.min.y - pad) + "px");

            // added in this if to decide weather hex layer is visable or not
            var hexLayerSwitch = window.localStorage.getItem('hex-are');
            if (hexLayerSwitch === 'on')
            {
                if (!(zoom in this.levels)) {
                    this.levels[zoom] = this.container.append("g").attr("class", "zoom-" + zoom);
                    this.genHexagons(this.levels[zoom]);
                    this.levels[zoom].attr("transform", "translate(" + -(xy.min.x - pad) + "," + -(xy.min.y - pad) + ")");
                }
                if (this.curLevel) {
                    this.curLevel.style("display", "none");
                }
                this.curLevel = this.levels[zoom];
                this.curLevel.style("display", "inline");
            }
            else
            {
                if (!(zoom in this.levels)) {
                    this.levels[zoom] = this.container.append("g").attr("class", "zoom-" + zoom);
                    this.genHexagons(this.levels[zoom]);
                    this.levels[zoom].attr("transform", "translate(" + -(xy.min.x - pad) + "," + -(xy.min.y - pad) + ")");
                }
                if (this.curLevel) {
                    this.curLevel.style("display", "none");
                }
                this.curLevel = this.levels[zoom];
                this.curLevel.style("display", "none");
            }
        },
        genHexagons: function (container) {
            var data = this.rwData.features.map(function (d) {
                var coords = this.project(d.geometry.coordinates);
                return [coords[0], coords[1], d.properties];
            }, this);

            var bins = this.layout(data);
            var hexagons = container.selectAll(".hexagon").data(bins);

            var path = hexagons.enter().append("path").attr("class", "hexagon");
            this.config.style.call(this, path);
            that = this;

            hexagons
                    .attr("d", function (d) {
                        var hexSize = d.length * .05 + 0.5;
                        if (map.getZoom() > 15)
                            hexSize = hexSize * 1.25;
                        if (map.getZoom() < 12)
                            hexSize = hexSize * .5;
                        if (map.getZoom() < 5)
                            hexSize = hexSize * .75;
                        return that.layout.hexagon(that.rscale(hexSize));
                    })
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    })
                    .on('click', function (d) {
                        map.on('click', function (e) {
                            var zoom = map.getZoom() + 1;
                            if (zoom <= 19)
                            {
                                map.setView({lat: e.latlng.lat, lon: e.latlng.lng}, zoom);
                                // $('#zoomLevel').html('The level is' + map.getZoom());
                            }
                        });
                    });
        },
        addTo: function (map) {
            map.addLayer(this);
            return this;
        },
        onAdd: function (map) {
            this.map = map;
            var overlayPane = this.map.getPanes().overlayPane;

            if (!this.container || overlayPane.empty) {
                this.container = d3.select(overlayPane)
                        .append('svg')
                        .attr("id", "hex-svg")
                        .attr('class', 'leaflet-layer leaflet-zoom-hide emotionHexbin');
            }
            map.on({'moveend': this.update}, this);
            this.update();
        }
    });

    L.hexbinLayer = function (data, styleFunction) {
        return new L.HexbinLayer(data, styleFunction);
    };

    //*******************  Get JSON data from php url***************************
    //**************************************************************************
    window.setJsonLayers = function () {

        $('#hex-svg').remove();
        console.log('getJSONMarkerData() is running ...');
        var timeType = window.localStorage.getItem('timeType');
        console.log(timeType);
        console.log(startDate);
        console.log(endDate);
        var interval = window.localStorage.getItem('interval');
        var startDate = $('#dateStart').val();
        var endDate = $('#dateEnd').val();

        var emoTypes = '';
        $.each(emoFilterArray, function (index, value)
        {
            if (index === (emoFilterArray.length - 1))
            {
                emoTypes = emoTypes + value;
            }
            else
            {
                emoTypes = emoTypes + value + '|';
            }
        });

        console.log('The REGEXP string is now:');
        console.log(emoTypes);

        var jsonStringHex = " ";
        if (timeType === 'dateRange')
        {
            jsonStringHex = 'http://www.emoapp.info/php/mysql_points_geojson_sensus.php?emoTypes=%27' + emoTypes + '%27&timeType=' + timeType + '&interval=' + interval + '&startDate=' + moment(startDate, "YYYY-MM-DD").format() + '&endDate=' + moment(endDate, "YYYY-MM-DD").format();
        }
        else
        {
            jsonStringHex = 'http://www.emoapp.info/php/mysql_points_geojson_sensus.php?emoTypes=%27' + emoTypes + '%27&timeType=' + timeType + '&interval=' + interval + '&startDate=null&endDate=null';
        }
        console.log('The PHP url is now:');
        console.log(jsonStringHex);

        d3.json(jsonStringHex, function (geoData) {

            //**********  Hexbin Layer to Map and Style Function ***************
            //******************************************************************
            console.log('geoData - - - - -  - ');
            console.log(geoData);
            hexLayer = L.hexbinLayer(geoData, {style: hexbinStyle}).addTo(map);
            function hexbinStyle(hexagons)
            {
                console.log('hexbin style start - - - - - - -');
                hexagons.attr("stroke", "black").attr("fill", function (d)
                {
                    //********  Set Hexbin colour using count array  ***************
                    var emoArray = {
                        '0': '#F7ED43', '1': '#66BA4D',
                        '2': '#6CCCE1', '3': '#F48530',
                        '4': '#A4579F', '5': '#C3242D',
                        '6': '#E01888', '7': '#DD5F84'};
                    var countArray = [0, 0, 0, 0, 0, 0, 0, 0];

                    $.each(d, function (key, value)
                    {
                        var emoNumber = value[2].emoType - 1;
                        countArray[emoNumber]++;
                        //console.log('2nd '+countArray[0]+' '+countArray[1]+' '+countArray[2]+' '+countArray[3]+' '+countArray[4]+' '+countArray[5]);
                    });
                    // Get the max value from the array    
                    var maxValue = Math.max.apply(null, countArray);

                    // Get the index of the max value, through the built in function inArray
                    var hexCode = $.inArray(maxValue, countArray);
                    if (hexCode === -1)
                    {
                        return emoArray[0];
                    }
                    else
                    {
                        return emoArray[hexCode];
                    }
                }).attr("title", function (d) {
                    // Add the postID's to the hexagons
                    var posts = '';
                    var len = d.length - 1;
                    $.each(d, function (key, value)
                    {
                        // Create a string for attr
                        if (len === key)
                        {
                            posts = posts + value[2].postID;
                        }
                        else
                        {
                            posts = posts + value[2].postID + ',';
                        }
                    });
                    // return the string as attr
                    return posts;
                }).attr("name", function (d) {
                    var latLng = '';
                    $.each(d, function (key, value)
                    {
                        // d.geometry.coordinates
                        latLng = value[2].postLat + ',' + value[2].postLong;
                    });
                    return latLng;
                });
            }
        });
    };

    //********  Call the inital Function  *********
    //*********************************************
    setJsonLayers();
    $(".emotionHexbin").show();

    // - - -  When the mapPage is shown This code will trigger - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -   
    $(document).on("pageshow", "#mapPage", function () {
        // - -  Leaflet / MapBox Map - - 
        console.log('Invalidate the map size');
        map.invalidateSize();   // fixes the issue with map size  
//        // If this is not the first time the map is shown
//        // Refresh the markers
//        if (!firstMarkers)
//        {
//            setJsonLayers();
//        }
    });
}
//  End of setMapInAction()


// Clicked on Hexagon Event
$('#mapPage').on('click', '.hexagon', function (e) {
    if (map.getZoom() >= 19)
    {
        var latLng = $(this).attr('name');
        var latLngArr = latLng.split(',');
        map.setView({lat: latLngArr[0], lon: latLngArr[1]});
        //alert('Hex clicked ma ma');
        var postIDStr = $(this).attr('title');
        //alert(postID);
        var arrPosts = postIDStr.split(',');
        if (arrPosts.length === 1)
        {
            // Pass Arr Value to Post function
            markerClicked(arrPosts[0]);
        }
    }
});

//********  Marker Click Event Code  ***************
function markerClicked(postID)
{
    $.ajax({url: 'http://emoapp.info/php/getMarkerInfo.php',
        data: {action: 'markerPost', postID: postID},
        type: 'post',
        dataType: "json",
        async: 'true',
        //dataType: 'json',
        beforeSend: function () {
            // This callback function will trigger before data is sent
            $.mobile.loading("show", {
                text: 'Fetching Emotion Data',
                textVisible: true
            });
        },
        complete: function () {
            // This callback function will trigger on data sent/received complete
            $.mobile.loading("hide");
        },
        success: function (result) {
            $.each(result.marker, function (key, val) {
                // Map marker was success  
                $('#emoPostPopup').attr('src', 'images/loading.svg');
                console.log('Map Marker Fetch Succesfull');
                console.log('image: ' + val.imageName);
                console.log('Post Time: ' + val.timeThen);
                console.log('Now: ' + val.timeNow);
                var imgSrc = 'http://emoapp.info/uploads/' + val.imageName + '.png';
                console.log('The image src is : ' + imgSrc);
                $('#emoPostPopup').attr('src', imgSrc);
                // Time Difference
                var a = moment(val.timeThen);
                console.log(a);
                var b = moment(val.timeNow);
                console.log(b);
                var timeOffset = a.from(b);
                console.log(timeOffset);
                $('#popUpInfo').html('<p><i class="fa fa-clock-o fa-2x"></i> ' + timeOffset + '</p>');

                $("#emoPostPopup").load(function () {
                    // Handler for .load() called.
                    $.mobile.loading("hide");
                });
            });

            // Open the Map Marker
            $('#mapPage').addClass('show-popup');
            $("#emojiSearchBar").velocity({top: "-100%", easing: "easein"}, 500);
            $("#emojiPostSelectParent").velocity({left: "-100%", easing: "easein"}, 500);
        },
        error: function (request, error) {
            // This callback function will trigger on unsuccessful action               
            console.log('error = ' + error);
            console.log("XMLHttpRequest", XMLHttpRequest);
        }
    });
}

//********  Add Marker  ***************
function addMarkerToMap(emoType, postID, pinLat, pinLong)
{
    console.log('The values passed to addMarkerToMap: EmoType-' + emoType + ' PostID-' + postID + ' LatLong-' + pinLat + pinLong);
    var addMarker;
    var myIcon = L.icon({
        iconUrl: 'images/svgPins/animated/pin' + emoType + '.svg',
        iconRetinaUrl: 'images/svgPins/animated/pin' + emoType + '.svg',
        iconSize: [76, 80],
        iconAnchor: [36, 80],
        popupAnchor: [-3, -31],
        shadowUrl: 'images/svgPins/animated/Pin_shadow.svg',
        shadowRetinaUrl: 'images/svgPins/animated/Pin_shadow.svg',
        shadowSize: [73, 46],
        shadowAnchor: [41, 46]
    });
    var addMarker = L.marker([pinLat, pinLong]
            , {title: postID, icon: myIcon});

    addMarker.on('click', function () {
        console.log('New Marker Clicked');
        console.log('New Marker Clicked: Function');
        // Get the title for map and pass into php file with AJAX and post result
        console.log('Post ID is: ' + postID);
        console.log('New Marker was clicked - postID: ' + postID);
        markerClicked(postID);
    });
    //addMarker.addTo(map);
    markers.addLayer(addMarker);
}

////********  Center Map on marker click  ***************
function centerMap()
{
    setLocale();
}

// Map Emoji Filter
$(document).on("pageshow", "#mapPage", function () {

    // Filter Menu Button
    $(".centerButton a").html('<i class="fa fa-compass fa-3x"></i>');

//    $(".hexagon").click(function () {
//        console.log('Hex CLicked');
//                
//    });

    // Share Button
    // Twitter Share Button
    $('#btnShare').click(function () {

        var fileShare = $('#emoPostPopup').attr('src');
        console.log('Share button clicked: ' + fileShare);
        window.plugins.socialsharing.shareViaTwitter('Check out my Vibe @Vibes_ios', fileShare, 'http://emoapp.info');
    });


    // Filter Menu Button
    $(".emoFilterBtn").click(function ()
    {
        // Check if mapPage is active
        // If not naviagte to mapPage and then open the filter bar
        console.log('Filter Clicked');
        var pageID = $.mobile.activePage.attr('id');
        console.log('pageID: ' + pageID);
        if (pageID === 'mapPage')
        {
            $("#menuPanel").panel("close");
            isOpen = !isOpen;
            console.log('close menu');
            openFilterBar();
        }
        else
        {
            console.log('Change to map page and open filter');
            $(":mobile-pagecontainer").pagecontainer("change", "#mapPage", {transition: "slide"});
            openFilterBar();
        }

        // Open the filet menu bar
        function openFilterBar()
        {
            console.log('Open Filter bar');
            $("#emojiSearchBar").velocity({top: "70px", easing: "easein"}, 500);
            //$("#emojiSearchBar").velocity({left: "0", easing: "easein"}, 500);
            $("#emojiPostSelectParent").velocity({left: "-100%", easing: "easein"}, 500);
            filterOpen = !filterOpen;
        }
    });

    // Filter Buttons click event, add/remove opacity class and 
    // Append and remove emoType from array
    $('.emojiFilter').on('click', function () {
        // Parent Emoji Clicked
        console.log('Filter clicked');
        var emoType = $(this).attr('data-name');
        if ($(this).hasClass('filterOff'))
        {
            emoFilterArray.push(emoType);
            $(this).removeClass('filterOff');
        }
        else
        {
            $(this).addClass('filterOff');
            $('#checkboxSelectAll').prop("checked", false).checkboxradio("refresh");
            emoFilterArray = jQuery.grep(emoFilterArray, function (value) {
                return value !== emoType;
            });
        }
        console.log('The emoType Array is now:');
        console.log(emoFilterArray);
    });

    // Checkbox Select All/None function on filter
    $('#checkboxSelectAll').on('click', function () {
        if ($('#checkboxSelectAll').prop('checked'))
        {
            // Remove all classes for opacity and fill array
            $('.emojiFilter').removeClass('filterOff');
            emoFilterArray = ['1', '2', '3', '4', '5', '6', '7', '8'];
        }
        else
        {
            // Opacity drop all buttons and clear array
            $('.emojiFilter').addClass('filterOff');
            emoFilterArray = [];
        }
    });

    // Advanced Filter
    $("#advancedFilter").on("collapsibleexpand", function (event, ui) {
        // The Advanced Tab is opened
        $("#filterButton").val('Filter by Date').button("refresh");
    });

    $("#advancedFilter").on("collapsiblecollapse", function (event, ui) {
        // The Advanced Tab is closed
        $("#filterButton").val('Filter emoji').button("refresh");
    });

    // Filter Button closes the filter bar and initates new hex-svg elements.
    $("#filterButton").bind("click", function (event, ui) {
        // Check the button type and decide which timeType to declare
        var btnType = $("#filterButton").val();
        if (btnType === 'Filter by Date')
        {
            window.localStorage.setItem('timeType', 'dateRange');
        }
        else
        {
            window.localStorage.setItem('timeType', 'default');
        }

        console.log('Filter Button Clicked');
        $("#emojiSearchBar").velocity({top: "-100%", easing: "easein"}, 500);
        filterOpen = !filterOpen;
        setJsonLayers();
    });

    // Filter Button closes the filter bar and initates new hex-svg elements.
    $(".quickSearch").bind("click", function (event, ui) {
        console.log('Quick Search Clicked');
        // Set the variables
        var timeInterval = $(this).attr('data-name');
        window.localStorage.setItem('timeType', 'fastButtons');
        window.localStorage.setItem('interval', timeInterval);
        console.log('Time Interval set as: ' + timeInterval);
        $("#emojiSearchBar").velocity({top: "-100%", easing: "easein"}, 500);
        filterOpen = !filterOpen;
        setJsonLayers();
    });

// ------------------------------------------------------------------------------------------
// ------------------------------ Filter form inputs  -------------------------------
// ------------------------------------------------------------------------------------------
    $('.input-daterange').datepicker({
        autoclose: true,
        todayHighlight: true
    });
});