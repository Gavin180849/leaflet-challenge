// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createMap function.
  createMap(data.features);
});

function createMap(earthquakeData) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  let geojsonLayer = L.geoJson(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circle(latlng, {
        radius: getRadius(feature.properties.mag),
        color: getColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.6
      });
    }
  });

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: geojsonLayer
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, geojsonLayer]
  });

  // Create a layer control.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add the legend with colors to correlate with depth
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
        depth = [-10, 10, 30, 50, 70, 90]; 

    // Styling the legend
    div.style.backgroundColor = "white";  
    div.style.padding = "10px"; 
    div.style.borderRadius = "5px"; 

  // Loop through depth intervals
  for (var i = 0; i < depth.length - 1; i++) {
    const color = getColor(depth[i + 1]);
    console.log(`Depth: ${depth[i + 1]}, Color: ${color}`); // Log for debugging
    div.innerHTML +=
      '<i style="background:' + color + '; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></i> ' +
      depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
  }
  return div;
};

legend.addTo(myMap);
}

// Function to determine the radius of the circle based on magnitude
function getRadius(magnitude) {
  return magnitude * 10000; // Adjust the multiplier as needed
}

// Function to determine the color of the circle based on depth
function getColor(depth) {
  if (depth <= 10) return "#00FF00"; // Green for shallow
  else if (depth <= 30) return "#FFFF00"; // Yellow for moderate
  else if (depth <= 50) return "#FFA500"; // Orange for deeper
  else return "#FF0000"; // Red for deep
}

// Give each feature a popup that describes the place and time of the earthquake.
function onEachFeature(feature, layer) {
  layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><br><h2>Magnitude: ${feature.properties.mag}</h2>`);
}