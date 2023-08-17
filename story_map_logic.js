var map = L.map('map').setView([50,0], 5);

const basemaps = {
    StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }),
    Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', { layers: 'TOPO-WMS' }),
    Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', { layers: 'OSM-Overlay-WMS' })
};

L.control.layers(basemaps).addTo(map);
basemaps.Topography.addTo(map);

// Fetch the GeoJSON file and then process it
fetch('Henry_V_Leaflet.geojson')
    .then(response => response.json())
    .then(data => {
        var storyData = L.geoJSON(data).addTo(map);

        storyData.eachLayer((layer) => {
            var storyPoint = layer.feature.properties;
            var storyDiv = document.createElement('div');
            storyDiv.className = 'story-section';
            storyDiv.dataset.index = layer._leaflet_id - 1;

            if (storyPoint.title) {
                var titleElement = document.createElement('h2');
                titleElement.textContent = storyPoint.title;
                storyDiv.appendChild(titleElement);
            }

            var contentElement = document.createElement('p');
            contentElement.innerHTML = storyPoint.content;
            storyDiv.appendChild(contentElement);

            if (storyPoint.image && storyPoint.image.trim() !== "") {
                var imgElement = document.createElement('img');
                imgElement.src = storyPoint.image;
                imgElement.alt = "Image for " + storyPoint.content;
                storyDiv.appendChild(imgElement);
            }

            document.getElementById('story-details').appendChild(storyDiv);
        });

        document.getElementById('story-details').addEventListener('scroll', function(e) {
            var storySections = document.querySelectorAll('.story-section');
            var currentStoryIndex;

            storySections.forEach((section, index) => {
                var rect = section.getBoundingClientRect();
                if (rect.top >= 0 && rect.top <= rect.height) {
                    currentStoryIndex = index;
                }
            });

            if (typeof currentStoryIndex !== "undefined") {
                var layer = storyData.getLayer(currentStoryIndex + 1);
                if (layer) {
                    map.flyTo(layer.getLatLng(), layer.feature.properties.zoom);
                }
            }
        });
    })
    .catch(error => {
        console.error("Error fetching the GeoJSON data: ", error);
    });
