var map = L.map('map').setView([50, 0], 5);

const basemaps = {
    StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '© OpenStreetMap contributors'}),
    Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {layers: 'TOPO-WMS'}),
    Places: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
    })
};

L.control.layers(basemaps).addTo(map);
basemaps.Places.addTo(map);

fetch('Henry_V_Leaflet.geojson')
    .then(response => response.json())
    .then(data => {
        var storyData = data.features;
        var markers = []; // To store all markers

        storyData.forEach((storyPoint, index) => {
            var props = storyPoint.properties;

            var navSection = document.createElement('div');
            navSection.className = 'nav-section';

            // Populate the navigation
            var navButton = document.createElement('button');
            navButton.textContent = props.title;
            navButton.onclick = function() {
                var contentDiv = this.nextElementSibling;
                var isVisible = contentDiv.style.display === 'block';
            
                // Close all story-content-sections
                var allContentDivs = document.querySelectorAll('.story-content-section');
                allContentDivs.forEach(div => div.style.display = 'none');
            
                // If the clicked contentDiv was already visible, keep it closed, otherwise open it
                contentDiv.style.display = isVisible ? 'none' : 'block';
            
                // Fly to the map position only when the content section is shown
                if (!isVisible) {
                    map.flyTo([storyPoint.geometry.coordinates[1], storyPoint.geometry.coordinates[0]], props.zoom);
                    markers[index].openPopup(); // Make sure to open the related popup
                }
            };


            navSection.appendChild(navButton);

            // Populate the story content
            var storyDiv = document.createElement('div');
            storyDiv.className = 'story-content-section';
            storyDiv.style.display = 'none';

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
                imgElement.alt = "Image for " + props.content;
                storyDiv.appendChild(imgElement);
            }

            if (props.attribution) {
                var attributionElement = document.createElement('p');
                attributionElement.innerHTML = props.attribution;
                storyDiv.appendChild(attributionElement);
            }

            navSection.appendChild(storyDiv);
            document.getElementById('story-details').appendChild(navSection);

            // Add the point to the map and bind the popup
            var marker = L.marker([storyPoint.geometry.coordinates[1], storyPoint.geometry.coordinates[0]])
                .bindPopup(props.title)
                .addTo(map);
            
            markers.push(marker); // Store the marker
        });

    }).catch(error => {
        console.error("There was an error fetching the GeoJSON:", error);
    });
