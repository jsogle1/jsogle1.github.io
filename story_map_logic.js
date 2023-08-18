var map = L.map('map').setView([50, 0], 5);

const basemaps = {
    StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }),
    Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', { layers: 'TOPO-WMS' }),
    Places: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', { attribution: 'Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under ODbL.' })
};
L.control.layers(basemaps).addTo(map);
basemaps.Places.addTo(map);

fetch('Henry_V_Leaflet.geojson')
    .then(response => response.json())
    .then(data => {
        var storyData = data.features;

        var markers = []; // Store all markers for reference

        storyData.forEach((storyPoint, index) => {
            var navButton = document.createElement('div');
            navButton.className = 'nav-section';
            navButton.dataset.index = index;
            navButton.textContent = storyPoint.properties.title ? storyPoint.properties.title : "Section " + (index + 1);

            var contentDiv = document.createElement('div');
            contentDiv.className = 'content-section';
            contentDiv.dataset.index = index;

            if (storyPoint.properties.content) {
                var contentElement = document.createElement('p');
                contentElement.innerHTML = storyPoint.properties.content;
                contentDiv.appendChild(contentElement);
            }

            if (storyPoint.properties.image && storyPoint.properties.image.trim() !== "") {
                var imgElement = document.createElement('img');
                imgElement.src = storyPoint.properties.image;
                imgElement.alt = storyPoint.properties.alt_text ? storyPoint.properties.alt_text : "Image for " + storyPoint.properties.title;
                contentDiv.appendChild(imgElement);

                if (storyPoint.properties.attribution) {
                    var attributionElement = document.createElement('p');
                    attributionElement.className = 'image-attribution';
                    attributionElement.innerHTML = storyPoint.properties.attribution;
                    contentDiv.appendChild(attributionElement);
                }
            }

            document.getElementById('story-nav').appendChild(navButton);
            document.getElementById('story-content').appendChild(contentDiv);

            // Add the point to the map
            var coords = storyPoint.geometry.coordinates;
            var marker = L.marker([coords[1], coords[0]]).addTo(map);

            // Bind title as popup (callout) to marker
            if (storyPoint.properties.title) {
                marker.bindPopup(storyPoint.properties.title);
            }

            // Store the marker
            markers.push(marker);
        });

        document.getElementById('story-nav').addEventListener('click', function (e) {
            if (e.target && e.target.nodeName == "DIV") {
                var index = parseInt(e.target.dataset.index);
                var coords = storyData[index].geometry.coordinates;

                if (storyData[index]) {
                    map.flyTo([coords[1], coords[0]], storyData[index].properties.zoom);
                    markers[index].openPopup(); // Open the marker's popup (title callout)
                }
            }
        });
    })
    .catch(error => {
        console.error("There was an error fetching the GeoJSON:", error);
    });
