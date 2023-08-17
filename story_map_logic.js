var map = L.map('map').setView([50,0], 5);

const basemaps = {
    StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap contributors'}),
    Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {layers: 'TOPO-WMS'}),
    Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {layers: 'OSM-Overlay-WMS'})
};
L.control.layers(basemaps).addTo(map);
basemaps.Topography.addTo(map);

var storyLayers = L.featureGroup().addTo(map);  // Group for all story point markers

fetch('Henry_V_Leaflet.geojson')
.then(response => response.json())
.then(data => {
    var storyData = data.features;

    storyData.forEach((storyPoint, index) => {
        var storyDiv = document.createElement('div');
        storyDiv.className = 'story-section';
        storyDiv.dataset.index = index;

        var props = storyPoint.properties;

        if (props.title) {
            var titleElement = document.createElement('h2');
            titleElement.textContent = props.title;
            storyDiv.appendChild(titleElement);
        }
        
        var contentElement = document.createElement('p');
        contentElement.innerHTML = props.content.replace(/\n/g, '<br>');
        storyDiv.appendChild(contentElement);

        if (props.image && props.image.trim() !== "") {
            var imgElement = document.createElement('img');
            imgElement.src = props.image;
            imgElement.alt = "Image for " + props.title;
            storyDiv.appendChild(imgElement);
        }
        
        document.getElementById('story-details').appendChild(storyDiv);

        var coords = storyPoint.geometry.coordinates;
        var marker = L.marker([coords[1], coords[0]]);
        marker.bindTooltip(props.title, { permanent: false, direction: 'top' }).addTo(storyLayers);
    });

    document.getElementById('story-details').addEventListener('scroll', function(e) {
        var storySections = document.querySelectorAll('.story-section');
        var currentSectionIndex;

        storySections.forEach((section, index) => {
            var bounds = section.getBoundingClientRect();
            var parentBounds = e.target.getBoundingClientRect();

            // If the top of the section is close to the top of the parent container, treat it as the current section.
            if (Math.abs(bounds.top - parentBounds.top) < 20) {  
                currentSectionIndex = index;
            }
        });

        var coords = storyData[currentSectionIndex].geometry.coordinates;

        if (storyData[currentSectionIndex]) {
            map.flyTo([coords[1], coords[0]], storyData[currentSectionIndex].properties.zoom);

            // Show the tooltip of the currently focused point and hide others
            storyLayers.eachLayer(function(layer) {
                if (layer.getTooltip() && layer.getTooltip().getContent() === storyData[currentSectionIndex].properties.title) {
                    layer.openTooltip();
                } else {
                    layer.closeTooltip();
                }
            });
        }
    });

}).catch(error => {
    console.error("There was an error fetching the GeoJSON:", error);
});
