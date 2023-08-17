var map = L.map('map').setView([50,0], 5);

const basemaps = {
    StreetView: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',   {attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),
    Topography: L.tileLayer.wms('http://ows.mundialis.de/services/service?',   {layers: 'TOPO-WMS'}),
    Places: L.tileLayer.wms('http://ows.mundialis.de/services/service?', {layers: 'OSM-Overlay-WMS'})
  };
  L.control.layers(basemaps).addTo(map);
  basemaps.Topography.addTo(map);
  
  var storyData = [
    {
        lat: 51.505, 
        lon: -0.09, 
        zoom: 5, 
        title: "Act I Scene I",
        content: "Story content for point 1",
        image: "path/to/image1.jpg"
    },
    {
        lat: 48.8566,
        lon: 2.3522,
        zoom: 5,
        title: "Act I Scene II",
        content: "Story content for Paris",
        image: "path/to/imageParis.jpg"
    },
    {
        lat: 40.7128,
        lon: -74.0060,
        zoom: 5,
        
        content: "Story content for New York",
        image: "path/to/imageNY.jpg"
    }
    // ... other points ...
];

storyData.forEach((storyPoint, index) => {
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
    
    if (storyData[index]) {
        map.flyTo([storyData[index].lat, storyData[index].lon], storyData[index].zoom);
    }
});