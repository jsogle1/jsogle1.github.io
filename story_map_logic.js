var map = L.map('map').setView([50,0], 5);

const basemaps = {
    StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap contributors'}),
    Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {layers: 'TOPO-WMS'}),
    Places: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under ODbL',
      subdomains: 'abcd',
      ext: 'png'
    })
};

L.control.layers(basemaps).addTo(map);
basemaps.Places.addTo(map);

fetch('Henry_V_Leaflet.geojson')
.then(response => response.json())
.then(data => {
    var storyData = data.features;

    storyData.forEach((storyPoint, index) => {
        var props = storyPoint.properties;
        
        // Populate the navigation
        var navButton = document.createElement('button');
        navButton.textContent = props.title;
        navButton.onclick = function() {
            document.getElementById('story-content').scrollTop = index * document.getElementById('story-content').clientHeight;
        };
        document.getElementById('story-nav').appendChild(navButton);

        // Populate the story content
        var storyDiv = document.createElement('div');
        storyDiv.className = 'story-section';
        storyDiv.dataset.index = index;

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
        
        if (props.attribution) {
            var attributionElement = document.createElement('p');
            attributionElement.innerHTML = props.attribution;
            storyDiv.appendChild(attributionElement);
        }

        document.getElementById('story-content').appendChild(storyDiv);
    });

    // Handle the scrolling within the story-content
    document.getElementById('story-content').addEventListener('scroll', function(e) {
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
