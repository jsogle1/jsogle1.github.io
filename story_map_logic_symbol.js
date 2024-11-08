var map = L.map('map').setView([50, 0], 5);
var mapElement = document.getElementById('map');
var geojsonPath = mapElement.getAttribute('data-geojson');

// 1. Define the Layers
var watercolor = L.tileLayer('https://watercolormaps.collection.cooperhewitt.org/tile/watercolor/{z}/{x}/{y}.jpg', {
    attribution: 'Map tiles by <a href="https://watercolormaps.collection.cooperhewitt.org/">Smithsonian Cooper-Hewitt</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
});

var terrain = L.tileLayer('https://watercolormaps.collection.cooperhewitt.org/tile/terrain/{z}/{x}/{y}.jpg', {
    attribution: 'Map tiles by <a href="https://watercolormaps.collection.cooperhewitt.org/">Smithsonian Cooper-Hewitt</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
});

var satellite = L.tileLayer.wms('http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}')
var hillshade = L.tileLayer.wms('http://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}.png', {
    layers: 'TOPO-WMS', 
    transparent: true,
    opacity: 0.7
});

// 2. Combine into a Layer Group
var watercolorWithHillshade = L.layerGroup([watercolor, hillshade]);

// 3. Integrate into Base Maps
const basemaps = {
    Satellite: satellite,
    Watercolor: watercolor
};

// 4. Add Layer Control and default map
L.control.layers(basemaps).addTo(map);
basemaps.Watercolor.addTo(map);

// 5. Fetch the GeoJSON
fetch(geojsonPath)
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
            
                // Scroll to the top of the opened section
                if (!isVisible) {
                    document.getElementById('story-details').scrollTop = navSection.offsetTop;
                    map.flyTo([storyPoint.geometry.coordinates[1], storyPoint.geometry.coordinates[0]], props.zoom);
                    markers[index].openPopup(); // Make sure to open the related popup
                }
            };

            navSection.appendChild(navButton);

            // Populate the story content
            var storyDiv = document.createElement('div');
            storyDiv.className = 'story-content-section';
            storyDiv.style.display = 'none';

            if (props.image && props.image.trim() !== "") {
                var imgElement = document.createElement('img');
                imgElement.src = props.image;
                imgElement.alt = props.content;
                storyDiv.appendChild(imgElement);
            }

            if (props.attribution) {
                var attributionElement = document.createElement('small');
                attributionElement.className = 'attribution';
                attributionElement.innerHTML = props.attribution;
                storyDiv.appendChild(attributionElement);
            }

            var contentElement = document.createElement('p');
            contentElement.innerHTML = props.content.replace(/\n/g, '<br>');
            storyDiv.appendChild(contentElement);

            navSection.appendChild(storyDiv);
            document.getElementById('story-details').appendChild(navSection);

            // Check for custom icon in the symbol property
            var iconOptions = {};
            if (props.symbol) {
                iconOptions = {
                    iconUrl: props.symbol,
                    iconSize: [32, 32], // Adjust icon size as needed
                    iconAnchor: [16, 32], // Anchor the icon
                    popupAnchor: [0, -32] // Offset the popup
                };
            }

            var customIcon = L.icon(iconOptions);

            // Add the point to the map and bind the popup
            var marker = L.marker([storyPoint.geometry.coordinates[1], storyPoint.geometry.coordinates[0]], { icon: props.symbol ? customIcon : undefined })
                .bindPopup(props.title)
                .addTo(map);
            
            markers.push(marker); // Store the marker
        });

    }).catch(error => {
        console.error("There was an error fetching the GeoJSON:", error);
    });
