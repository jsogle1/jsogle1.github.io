var map = L.map('map').setView([50,0], 5);

const basemaps = {
    StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),
    Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {layers: 'TOPO-WMS'}),
    Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {layers: 'OSM-Overlay-WMS'})
};

L.control.layers(basemaps).addTo(map);
basemaps.Topography.addTo(map);

// Use Fetch API to get the GeoJSON data
fetch('Henry_V_Leaflet.geojson')
    .then(response => response.json())
    .then(data => {
        var storyData = L.geoJSON(data).addTo(map);

        var stories = data.features.map(feature => feature.properties);

        stories.forEach((storyPoint, index) => {
            var storyDiv = document.createElement('div');
            storyDiv.className = 'story-section';
            storyDiv.dataset.index = index;

            // Add title if it exists
            if (storyPoint.title) {
                var titleElement = document.createElement('h2');
                titleElement.textContent = storyPoint.title;
                storyDiv.appendChild(titleElement);
            }
            
            // Add story content
            var contentElement = document.createElement('p'); // Encapsulate content in a paragraph tag
            contentElement.innerHTML = storyPoint.content;
            storyDiv.appendChild(contentElement);

            // Check if image path exists and is not empty
            if (storyPoint.image && storyPoint.image.trim() !== "") {
                var imgElement = document.createElement('img');
                imgElement.src = storyPoint.image;
                imgElement.alt = "Image for " + storyPoint.content; // Alt text for accessibility
                storyDiv.appendChild(imgElement);
            }
            
            document.getElementById('story-details').appendChild(storyDiv);
        });

        // Handle the scroll event
        document.getElementById('story-details').addEventListener('scroll', function(e) {
            var top = e.target.scrollTop;
            var height = e.target.clientHeight;

            var index = Math.floor(top / height);
            
            if (stories[index]) {
                map.flyTo([stories[index].lat, stories[index].lon], stories[index].zoom);
            }
        });
    })
    .catch(error => console.error('Error fetching the GeoJSON data:', error));
