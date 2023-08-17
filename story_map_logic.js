var map = L.map('map').setView([50,0], 5);

const basemaps = {
    StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap contributors'}),
    Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {layers: 'TOPO-WMS'}),
    Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {layers: 'OSM-Overlay-WMS'})
};
L.control.layers(basemaps).addTo(map);
basemaps.Topography.addTo(map);

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
        contentElement.innerHTML = props.content;
        storyDiv.appendChild(contentElement);

        if (props.image && props.image.trim() !== "") {
            var imgElement = document.createElement('img');
            imgElement.src = props.image;
            imgElement.alt = "Image for " + props.content;
            storyDiv.appendChild(imgElement);
        }
        
        document.getElementById('story-details').appendChild(storyDiv);
    });

    document.getElementById('story-details').addEventListener('scroll', function(e) {
        var top = e.target.scrollTop;
        var height = e.target.clientHeight;

        var index = Math.floor(top / height);

        var coords = storyData[index].geometry.coordinates;

        if (storyData[index]) {
            map.flyTo([coords[1], coords[0]], storyData[index].properties.zoom);

        }
    });

}).catch(error => {
    console.error("There was an error fetching the GeoJSON:", error);
});
