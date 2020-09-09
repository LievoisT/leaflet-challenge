// code for creating Basic Map (Level 1)
const geojsonURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

const myMap = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 5
});

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/dark-v10',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    }).addTo(myMap);

d3.json(geojsonURL).then(data => {
    // console.log(data);
    // console.log(data.features)

    const radiusScale = d3.scalePow()
    .exponent(4)
    .domain(d3.extent(data.features.map(d => d.properties.mag)))
    .range([0, 100])

    const colorInterp = d3.scaleLinear()
        .domain([0, 1000])
        .range([0, 1]);

    function colorScale(sig) {
        return d3.interpolateYlOrRd(colorInterp(sig));
    }
    
    const legend = L.control({position: "bottomright"});

    legend.onAdd = function(map) {
        let div = L.DomUtil.create("div", "info legend");
        
        
        div.innerHTML = `<h2>EQ Significance</h2>
        <hr>
        <i style="background:${colorScale(0)}"></i> 0 <br>
        <i style="background:${colorScale(250)}"></i> 250 <br>
        <i style="background:${colorScale(500)}"></i> 500 <br>
        <i style="background:${colorScale(750)}"></i> 750 <br>
        <i style="background:${colorScale(1000)}"></i> 1000 <br>
        `
        

        return div;
    }

    legend.addTo(myMap);


    function onEachFeature(feature, layer) {
        if (feature.properties) {
            let popupContent = `<h2>Earthquake: ${feature.properties.title}</h2>
            <hr>
            <h3>Time: ${new Date(feature.properties.time)}</h3>
            <hr>
            <h3>Magnitude: ${feature.properties.mag}</h3>
            <hr>
            <h3>Significance: ${feature.properties.sig}</h3>`


            layer.bindPopup(popupContent).openPopup();
        }
    }

    function markerStyle (feature) {
        
        return {
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6,
            color: "#000",
            radius: radiusScale(feature.properties.mag),
            fillColor: colorScale(feature.properties.sig)
        }
    }

    console.log(radiusScale(1.4))

    L.geoJSON(data, {
        pointToLayer(feature, latlng) {
            return L.circleMarker(latlng, markerStyle(feature))
        },
        onEachFeature: onEachFeature
    }).addTo(myMap);
})