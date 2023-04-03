// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Accessing the tectonic plate GeoJSON URL
let tectonicPUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    
    let earthquakeData = data.features;

    // Use d3.json to make a call to get our Tectonic Plate geoJSON data.
    d3.json(tectonicPUrl).then(function(data_02) {
       console.log(data_02);
   
       let tectonicPlatesData = data_02;



       createFeatures(earthquakeData,tectonicPlatesData);
   
       someStats(data.features);
   
       
     });

   
  });


function someStats(data){


    let numEQ = data.length ;

    let sumMag = 0 ;

    let sumDepth= 0 ;

    let minMag = 0 ;

    let maxMag = 0;

    let minDep = 100;

    let maxDep = 100;


    for (let i=0; i<numEQ ; i++){



        sumMag = sumMag + data[i].properties.mag;

        sumDepth = sumDepth + data[i].geometry.coordinates[2];


        if (minMag > data[i].properties.mag){

            minMag = data[i].properties.mag;
        }

        if (maxMag < data[i].properties.mag){

            maxMag = data[i].properties.mag;
        }      

        if (minDep > data[i].properties.mag){

            minMag = data[i].properties.mag;
        }

        if (maxDep < data[i].geometry.coordinates[2]){

            maxDep = data[i].geometry.coordinates[2];
        }      
        if (minDep > data[i].geometry.coordinates[2]){

            minDep = data[i].geometry.coordinates[2];
        }   

    }

    let avgMag = sumMag/numEQ;

    let avgDep = sumDepth/numEQ;

    console.log ("Avg Dep" + avgDep);
    console.log ("Min Dep" + minDep);
    console.log ("Max Dep" + maxDep);
    console.log ("Avg Mag" + avgMag);
    console.log ("Min Mag" + minMag);
    console.log ("Max Mag" + maxMag);

};



  function createFeatures(earthquakeData,tectonicPlatesData) {


    let numEQ = earthquakeData.length ;

    console.log(numEQ);
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place, time, Longitude, Latitude and depth of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h2>${feature.properties.place}</h2><hr>
      <p>${new Date(feature.properties.time)}</p>
      <h4>Magnitude ${feature.properties.mag}</h4>
      <p>Longitude ${feature.geometry.coordinates[0]}</p>
      <p>Latitude ${feature.geometry.coordinates[1]}</p>
      <p>Depth ${feature.geometry.coordinates[2]}</p>`);

    }

    	// This function determines the radius of the earthquake marker based on its magnitude.
	// Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
	function getRadius(magnitude) {
		if (magnitude === 0) {
		return 1;
		}
		return magnitude * 3;
	}

    	// This function determines the color of the circle based on the depth of the earthquake.
	function getColor(depth) {
		if (depth > 90) {
		return "#7a0177";
		}
		if (depth > 70) {
		return "#c51b8a";
		}
		if (depth > 50) {
		return "#f768a1";
		}
		if (depth > 30) {
		return "#fa9fb5";
		}
		if (depth > 10) {
		return "#fcc5c0";
		}
		return "#feebe2";
	}
  
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {

        pointToLayer: function (feature,latlng){

                    // console.log(earthquakeData);
                    return L.circleMarker(latlng);
        },

        style : function (feature){

            return{
                opacity: 1,
                fillOpacity: 0.75,
                color: 'black',
                fillColor: getColor(feature.geometry.coordinates[2]),
                // Adjust the radius.
                radius: getRadius(feature.properties.mag),
                weight: 0.5
            }
        },

 
      onEachFeature: onEachFeature
    });


    let tectonicPlates =  L.geoJson(tectonicPlatesData, {
        style: {
          color: "#7a0177",
          lineweight: 0.3
          }
    })

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes,tectonicPlates);
  }

  function createMap(earthquakes,tectonicPlates) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      "Tectonic Plates":tectonicPlates,
      "Earthquakes": earthquakes,
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        -25.27, 73.77
      ],
      zoom: 2,
      layers: [street, tectonicPlates, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);


     // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    
    legend.onAdd = function(myMap) {
        let div = L.DomUtil.create("div", "info legend");


        let limits = ["-10", "10", "30", "50", "70", "90"];
        let colors = [
        "#feebe2",
        "#fcc5c0",
        "#fa9fb5",
        "#f768a1",
        "#c51b8a",
        "#7a0177"
        ];

        		// Looping through our intervals to generate a label with a colored square for each interval.
		for (var i = 0; i < limits.length; i++) {
			div.innerHTML +=
			"<i style='background: " + colors[i] + "'></i> " +
			limits[i] + (limits[i + 1] ? "&ndash;" + limits[i + 1] + "<br>" : "+");
		}
		return div;


    };


    legend.addTo(myMap);   




  }
  