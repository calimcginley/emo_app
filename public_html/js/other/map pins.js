/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


                var icon1 = L.icon({
                    iconUrl: 'images/yellowPin.png',
                    shadowUrl: 'images/pinShadow.png',                  
                    iconSize:     [38, 50], // size of the icon
                    shadowSize:   [50, 45], // size of the shadow
                    iconAnchor:   [22, 49], // point of the icon which will correspond to marker's location
                    shadowAnchor: [4, 43],  // the same for the shadow
                    popupAnchor:  [-3, -35] // point from which the popup should open relative to the iconAnchor
                });
                var icon2 = L.icon({
                    iconUrl: 'images/orangePin.png',
                    shadowUrl: 'images/pinShadow.png',                  
                    iconSize:     [38, 50], // size of the icon
                    shadowSize:   [50, 45], // size of the shadow
                    iconAnchor:   [22, 49], // point of the icon which will correspond to marker's location
                    shadowAnchor: [4, 43],  // the same for the shadow
                    popupAnchor:  [-3, -35] // point from which the popup should open relative to the iconAnchor
                });
                var icon3 = L.icon({
                    iconUrl: 'images/bluePin.png',
                    shadowUrl: 'images/pinShadow.png',                  
                    iconSize:     [38, 50], // size of the icon
                    shadowSize:   [50, 45], // size of the shadow
                    iconAnchor:   [22, 49], // point of the icon which will correspond to marker's location
                    shadowAnchor: [4, 43],  // the same for the shadow
                    popupAnchor:  [-3, -35] // point from which the popup should open relative to the iconAnchor
                });
                var icon4 = L.icon({
                    iconUrl: 'images/greenPin.png',
                    shadowUrl: 'images/pinShadow.png',                  
                    iconSize:     [38, 50], // size of the icon
                    shadowSize:   [50, 45], // size of the shadow
                    iconAnchor:   [22, 49], // point of the icon which will correspond to marker's location
                    shadowAnchor: [4, 43],  // the same for the shadow
                    popupAnchor:  [-3, -35] // point from which the popup should open relative to the iconAnchor
                });
                var icon5 = L.icon({
                    iconUrl: 'images/redPin.png',
                    shadowUrl: 'images/pinShadow.png',                  
                    iconSize:     [38, 50], // size of the icon
                    shadowSize:   [50, 45], // size of the shadow
                    iconAnchor:   [22, 49], // point of the icon which will correspond to marker's location
                    shadowAnchor: [4, 43],  // the same for the shadow
                    popupAnchor:  [-3, -35] // point from which the popup should open relative to the iconAnchor
                });
                var icon2 = L.icon({
                    iconUrl: 'images/purplePin.png',
                    shadowUrl: 'images/pinShadow.png',                  
                    iconSize:     [38, 50], // size of the icon
                    shadowSize:   [50, 45], // size of the shadow
                    iconAnchor:   [22, 49], // point of the icon which will correspond to marker's location
                    shadowAnchor: [4, 43],  // the same for the shadow
                    popupAnchor:  [-3, -35] // point from which the popup should open relative to the iconAnchor
                });
                
                var markers = new L.MarkerClusterGroup({
                    iconCreateFunction: function(cluster) {
                    //  This is how to have the cluster number in the cluster
                    var childCount = cluster.getChildCount();
                    return new L.DivIcon({ html: '<div class="sadIcon">' +childCount +'</div>'});
                    }
                });
                var markersList = [];
                
                markers.on('clusterclick', function (a) {
			//alert('cluster ' + a.layer.getAllChildMarkers().length);
		});
		markers.on('click', function (a) {
			//alert('marker ' + a.layer);
		});
                markers.on('clusterclick', function (a) {
			//alert('cluster ' + a.layer.getAllChildMarkers().length);
		});
		markers.on('click', function (a) {
			//alert('marker ' + a.layer);
		});
                           
                $.getJSON('http://icandraw.me/sensus/php/getPostsLatLong.php', function(data){
                    $.each(data.emotionPost, function(index, value) {

                        var latLong = new L.LatLng(value.long, value.lat);
                        var m = new L.Marker(latLong, {icon: "icon"+value.emoType});
                        markersList.push(m);
                        markers.addLayer(m);
                    });
                });
                
                map.addLayer(markers);
                
                		L.DomUtil.get('populate').onclick = function () {
			var bounds = map.getBounds(),
			southWest = bounds.getSouthWest(),
			northEast = bounds.getNorthEast(),
			lngSpan = northEast.lng - southWest.lng,
			latSpan = northEast.lat - southWest.lat;
			var m = new L.Marker(new L.LatLng(
					southWest.lat + latSpan * 0.5,
					southWest.lng + lngSpan * 0.5));
			markersList.push(m);
			markers.addLayer(m);
		};
		L.DomUtil.get('remove').onclick = function () {
		markers.removeLayer(markersList.pop());
                
                
		};  