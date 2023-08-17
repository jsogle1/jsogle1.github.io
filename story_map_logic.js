var map = L.map('map').setView([50,0], 5);

const basemaps = {
    StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }),
    Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', { layers: 'TOPO-WMS' }),
    Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', { layers: 'OSM-Overlay-WMS' })
};
L.control.layers(basemaps).addTo(map);
basemaps.Topography.addTo(map);

var storyData = L.geoJSON(GeoJSONData).addTo(map);

storyData.forEach((storyPoint, index) => {
    var storyDiv = document.createElement('div');
    storyDiv.className = 'story-section';
    storyDiv.dataset.index = index;

    if (storyPoint.properties.title) {
        var titleElement = document.createElement('h2');
        titleElement.textContent = storyPoint.properties.title;
        storyDiv.appendChild(titleElement);
    }

    var contentElement = document.createElement('p');
    contentElement.innerHTML = storyPoint.properties.content;
    storyDiv.appendChild(contentElement);

    if (storyPoint.properties.image && storyPoint.properties.image.trim() !== "") {
        var imgElement = document.createElement('img');
        imgElement.src = storyPoint.properties.image;
        imgElement.alt = "Image for " + storyPoint.properties.content;
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

    if (typeof currentStoryIndex !== "undefined" && storyData[currentStoryIndex]) {
        map.flyTo([storyData[currentStoryIndex].geometry.coordinates[1], storyData[currentStoryIndex].geometry.coordinates[0]], storyData[currentStoryIndex].properties.zoom);
    }
});
