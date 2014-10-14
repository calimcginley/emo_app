/*  Sensus | Hexbin and Map Markers | Mapbox.js */

// Declare map variables here
var map;
var hexLayer;
var markers;
var setViewLat;
var setViewLong;
window.localStorage.setItem('hex-are', 'on');

var onSuccess = function(position)
{
    setViewLat = position.coords.latitude;
    window.localStorage.setItem('postLat', setViewLat);
    setViewLong = position.coords.longitude;
    window.localStorage.setItem('postLong', setViewLong);
    console.log('geo local success lat is ' + setViewLat + ' and long is ' + setViewLong);
    setMapInAction();
};
function onError(error)
{
    setViewLat = '52.341';
    window.localStorage.setItem('postLat', setViewLat);
    setViewLong = '-5.27';
    window.localStorage.setItem('postLong', setViewLong);
    console.log('Geo local fail lat is ' + setViewLat + ' and long is ' + setViewLong);
    setMapInAction();
}
;
navigator.geolocation.getCurrentPosition(onSuccess, onError);

function setMapInAction()
{
    //**********************************************************************************
    //********  CREATE LEAFLET MAP *****************************************************
    //**********************************************************************************
    console.log('At mapbox stage the lat is ' + setViewLat + ' and long is ' + setViewLong);
    map = L.mapbox.map('map', 'emomcginley.jmmf7jce', {zoomControl: false, detectRetina: true, maxZoom: 17})
            .setView([setViewLat, setViewLong], 14);
    
    
    //**********************************************************************************
    //********  LEAFLET HEXBIN LAYER CLASS *********************************************
    //**********************************************************************************
    L.HexbinLayer = L.Class.extend({
        includes: L.Mixin.Events,
        initialize: function(rawData, options) {
            this.levels = {};
            this.layout = d3.hexbin().radius(22);
            this.rscale = d3.scale.sqrt().range([0, 22]).clamp(true);
            this.rwData = rawData;
            this.config = options;
        },
        project: function(x) {
            var point = this.map.latLngToLayerPoint([x[1], x[0]]);
            return [point.x, point.y];
        },
        getBounds: function(d) {
            var b = d3.geo.bounds(d);
            return L.bounds(this.project([b[0][0], b[1][1]]), this.project([b[1][0], b[0][1]]));
        },
        update: function() {
            var pad = 10, xy = this.getBounds(this.rwData), zoom = this.map.getZoom();
            this.container
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
        genHexagons: function(container) {
            var data = this.rwData.features.map(function(d) {
                var coords = this.project(d.geometry.coordinates);
                return [coords[0], coords[1], d.properties];
            }, this);

            var bins = this.layout(data);
            var hexagons = container.selectAll(".hexagon").data(bins);

            var counts = [];
            bins.map(function(elem) {
                counts.push(elem.length);
            });
            this.rscale.domain([0, (ss.mean(counts) + (ss.standard_deviation(counts) * 3))]);

            var path = hexagons.enter().append("path").attr("class", "hexagon");
            this.config.style.call(this, path);

            that = this;

            hexagons
                    .attr("d", function(d) {
                        return that.layout.hexagon(that.rscale(d.length));
                    })
                    .attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    })
                    .on('click', function(d) {
                        map.on('click', function(e) {
                            if (map.getZoom() <= 16)
                            {
                                map.setView([e.latlng.lat, e.latlng.lng], map.getZoom() + 2);
                                $('#zoomLevel').html('The level is' + map.getZoom());
                            }
                            else
                            {
                                $(this).addClass('.animateHexagon');
                            }
                        });
                    });
        },
        addTo: function(map) {
            map.addLayer(this);
            return this;
        },
        onAdd: function(map) {
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

    L.hexbinLayer = function(data, styleFunction) {
        return new L.HexbinLayer(data, styleFunction);
    };

    

    //**********************************************************************************
    //********  IMPORT DATA AND REFORMAT ***********************************************
    //**********************************************************************************
    d3.json('http://www.emoapp.info/php/mysql_points_geojson_sensus.php', function(geoData) {
        //**********************************************************************************
        //********  ADD HEXBIN LAYER TO MAP AND DEFINE HEXBIN STYLE FUNCTION ***************
        //**********************************************************************************
        hexLayer = L.hexbinLayer(geoData, {style: hexbinStyle}).addTo(map);
        function hexbinStyle(hexagons)
        {
            console.log('hexbin style start - - - - - - -');
            hexagons
                    .attr("stroke", "black")
                    .attr("fill", function(d) {
                        //********  Set Hexbin colour using count array  ***************
                        var emoArray = {'0': '#7AC57A', '1': '#5089C6', '2': '#A03CB5', '3': '#F92028', '4': '#FD9B27', '5': '#F1E835'};
                        var countArray = [0, 0, 0, 0, 0, 0];

                        $.each(d, function(key, value)
                        {
                            var emoNumber = value[2].emoType - 1;
                            //var hexCode = emoArray[value[2].emoType];
                            //console.log('1st '+countArray[0]+' '+countArray[1]+' '+countArray[2]+' '+countArray[3]+' '+countArray[4]+' '+countArray[5]);
                            countArray[emoNumber]++;
                            //console.log('2nd '+countArray[0]+' '+countArray[1]+' '+countArray[2]+' '+countArray[3]+' '+countArray[4]+' '+countArray[5]);
                        });
                        // Get the max value from the array    
                        var maxValue = Math.max.apply(null, countArray);

                        // Get the index of the max value, through the built in function inArray
                        var hexCode = $.inArray(maxValue, countArray);
                        if (hexCode === -1)
                        {
                            //console.log('-1 Max val = '+maxValue+' and index is '+hexCode +' '+emoArray[hexCode]+' '+countArray[0]+' '+countArray[1]+' '+countArray[2]+' '+countArray[3]+' '+countArray[4]+' '+countArray[5]);
                            return emoArray[0];
                        }
                        else
                        {
                            //console.log('Max val = '+maxValue+' and index is '+hexCode +' '+emoArray[hexCode]+' '+countArray[0]+' '+countArray[1]+' '+countArray[2]+' '+countArray[3]+' '+countArray[4]+' '+countArray[5]);
                            return emoArray[hexCode];
                        }
                    });
        }
        ;
    });

    //*******************************************************
    //********  Zoom Switcher for the Layers  ***************
    //*******************************************************
    map.on('zoomend', zoom);
    function zoom()
    {
        var zoomNow = map.getZoom();
        console.log("Map zoom is " + zoomNow);
        if (zoomNow > 12)
        {
            // Hide the hex layer
            $(".emotionHexbin").hide();
            // Set hex layer to off
            window.localStorage.setItem('hex-are', 'off');
            console.log('hex hidden?, show markers');
            // Show the marker layer
            map.addLayer(markers);
        }
        else
        {
            // Hide the Marker layer
            map.removeLayer(markers);
            // Show the layers
            $(".emotionHexbin").show();
            // Set hex layers to visable
            window.localStorage.setItem('hex-are', 'on');
            // Get zoom level to display current layer
            var zoom = map.getZoom();
            console.log('zoom is' + zoom);
            console.log('SHow Hex, hide Pins');
            $(".zoom-" + zoom).show();
        }
    }
    //***********************************************
    //********  Marker Cluster Layer  ***************
    //***********************************************
    markers = new L.MarkerClusterGroup({spiderfyDistanceMultiplier: 3, removeOutsideVisibleBounds: true, spiderfyOnMaxZoom: true});
    $.getJSON('http://emoapp.info/php/jsonPosts.php', function(data) {
        $.each(data.posts, function(index, value) {
            var myIcon = L.icon({
                iconUrl: 'images/svgPins/pin' + value.emoType + '.svg',
                iconRetinaUrl: 'images/svgPins/pin' + value.emoType + '.svg',
                iconSize: [45, 60],
                iconAnchor: [22, 60],
                popupAnchor: [-3, -31],
                shadowUrl: 'images/svgPins/Pin_shadow.svg',
                shadowRetinaUrl: 'images/svgPins/Pin_shadow.svg',
                shadowSize: [73, 46],
                shadowAnchor: [41, 46]
            });
            var marker = L.marker([value.lat, value.long]
                    , {title: value.postID, icon: myIcon});
            markers.addLayer(marker);
        });

        //********  Marker Click Event  ***************
        markers.on('click', function(e) {
            console.log('Existing Marker Clicked');
            console.log('Exisitng Marker Clicked: Function');
            // Get the title for map and pass into php file with AJAX and post result
            console.log(e.layer.options.title);
            var postID = e.layer.options.title;
            console.log('Exisitng Marker was clicked - postID: ' + postID);
            map.setView(e.layer.getLatLng());
            markerClicked(postID);
        });
    });


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // - - -  When the mapPage is shown This code will trigger - - -
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -   

    $(document).on("pageshow", "#mapPage", function() {
        // - -  Leaflet / MapBox Map - - 
        console.log('Invalidate the map size');
        map.invalidateSize();   // fixes the issue with map size   
//        $('.leaflet-control-attribution').attr(' display', 'none');
    });
    //  End of setMapInAction()
}


//********  Marker Click Event Code  ***************

function markerClicked(postID)
{
    $.ajax({url: 'http://emoapp.info/php/getMarkerInfo.php',
        data: {action: 'markerPost', postID: postID},
        type: 'post',
        async: 'true',
        //dataType: 'json',
        beforeSend: function() {
            // This callback function will trigger before data is sent
            $.mobile.loading("show", {
                text: 'Fetching Emotion Data',
                textVisible: true
            });
        },
        complete: function() {
            // This callback function will trigger on data sent/received complete
            $.mobile.loading("hide");
        },
        success: function(result) {
            // Map marker was success        
            console.log('Map Marker Fetch Succesfull');
            console.log($.trim(result));
            console.log(result.status);
            var imgSrc = 'http://emoapp.info/uploads/' + $.trim(result) + '.jpg';
            console.log('The image src is : ' + imgSrc);
            $('#emoPostPopup').attr('src', imgSrc);
            // Open the Map Marker
            $('#mapPage').addClass('show-popup');
            $("#emojiSearchBar").velocity({left: "-100%", easing: "easein"}, 500);
            $("#emojiPostSelectParent").velocity({left: "-100%", easing: "easein"}, 500);
        },
        error: function(request, error) {
            // This callback function will trigger on unsuccessful action               
            console.log('error = ' + error);
            console.log("XMLHttpRequest", XMLHttpRequest);
        }
    });
}
;

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

    addMarker.on('click', function() {
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
;

//********  Center Map on marker click  ***************
function centerMap(mapLat, mapLong)
{
    console.log('centered map view');
    map.setView([mapLat, mapLong]);
}
;


function mapSetView(mLat, mLong)
{
    console.log('setting mao view');
    map.setView([mLat, mLong], 15);
}


// Map Emoji Filter
$(document).ready(function() {

var filterOpen = false;

$(".emoFilterBtn").click(function()
{
    
    console.log('Filter Clicked');
    var pageID = $.mobile.activePage.attr('id');
    console.log('pageID: '+pageID);
    if(pageID === 'mapPage')
    {
        $('#' + pageID).removeClass('show-menu');
        isOpen = !isOpen;
        console.log('close menu');
        openFilterBar();
    }
    else
    {
        console.log('Change to map page and open filter');
        $( ":mobile-pagecontainer" ).pagecontainer( "change", "#mapPage", { transition: "slide" } );
        openFilterBar();
    }    
    
    function openFilterBar()
    {
        console.log('Open Filter bar');
        $("#emojiSearchBar").velocity({top: "200px", easing: "easein"}, 10);
        $("#emojiSearchBar").velocity({left: "0", easing: "easein"}, 500);
        
        $("#emojiPostSelectParent").velocity({left: "-100%", easing: "easein"}, 500);
        filterOpen = !filterOpen;
    }
});

$(".emojiFilters").click(function()
{
    console.log('search bar clicked');
    $("#emojiSearchBar").velocity({left: "-100%", easing: "easein"}, 500);
    filterOpen = !filterOpen;
});

});