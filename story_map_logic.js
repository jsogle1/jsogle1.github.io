var map = L.map('map').setView([50,0], 5);

const basemaps = {
    StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'TOPO-WMS'
    }),
    Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {
        layers: 'OSM-Overlay-WMS'
    })
};
L.control.layers(basemaps).addTo(map);
basemaps.Topography.addTo(map);

// Fetch GeoJSON
fetch('Henry_V_Leaflet.geojson')
.then(response => response.json())
.then(data => {
    var storyData = L.geoJSON(data, {
        onEachFeature: function(feature, layer) {
            // For each point in the GeoJSON, create a corresponding story section
            var storyDiv = document.createElement('div');
            storyDiv.className = 'story-section';

            if (feature.properties.title) {
                var titleElement = document.createElement('h2');
                titleElement.textContent = feature.properties.title;
                storyDiv.appendChild(titleElement);
            }

            var contentElement = document.createElement('p');
            contentElement.innerHTML = feature.properties.content;
            storyDiv.appendChild(contentElement);

            if (feature.properties.image && feature.properties.image.trim() !== "") {
                var imgElement = document.createElement('img');
                imgElement.src = feature.properties.image;
                imgElement.alt = "Image for " + feature.properties.content;
                storyDiv.appendChild(imgElement);
            }

            document.getElementById('story-details').appendChild(storyDiv);
        }
    }).addTo(map);

    // Adjusted scroll event listener:
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
            var layer = storyData.getLayer(currentStoryIndex + 1); // The +1 is because Leaflet assigns IDs starting from 1
            if (layer) {
                var targetZoom = layer.feature.properties.zoom ? layer.feature.properties.zoom : map.getZoom();
                map.flyTo(layer.getLatLng(), targetZoom);
            }
        }
    });
})
.catch(error => {
    console.error("There was an error fetching the GeoJSON:", error);
});
