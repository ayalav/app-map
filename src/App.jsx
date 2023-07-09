import React, { useRef, useEffect } from "react";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import PopupTemplate from "@arcgis/core/PopupTemplate";

import "./App.css";

const GEOCODE_FIND_ADDRESS_URL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=";
const WORLD_CITIES_LAYER_URL = "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Cities/FeatureServer/0";
const MAP_ITEM_ID = "aa1d3f80270146208328cf66d022e09c";

async function getLocation(address) {
  const response = await fetch(GEOCODE_FIND_ADDRESS_URL + address);
  const data = await response.json();
  const location = data.candidates[0].location;
  return location;
}

async function initializeMap(mapRef, centerAddress) {
  // Create a map
  const webmap = new WebMap({
    portalItem: {
      id: MAP_ITEM_ID
    }
  });

  // Create the feature layer for capital cities
  const capitalCitiesLayer = new FeatureLayer({
    url: WORLD_CITIES_LAYER_URL,
    definitionExpression: "STATUS = 'National and provincial capital'",
    outFields: ["CITY_NAME", "POP"],
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        color: "red"
      }
    },
    popupTemplate: {
      title: "{CITY_NAME}",
      content: "<p>Population: {POP}</p><br>",
      fieldInfos: [{
        fieldName: "POP",
        format: {
          digitSeparator: true,
          places: 0
        }
      }]
    }
  });

  // Add the feature layer to the map
  webmap.add(capitalCitiesLayer);

  // Get the coordinates of the center
  const { x, y } = await getLocation(centerAddress);

  // Create a 2D view
  const view = new MapView({
    container: mapRef.current,
    map: webmap,
    center: [x, y],
    zoom: 7
  });
}

function App() {
  const mapRef = useRef(null);

  useEffect(() => {
    initializeMap(mapRef, "Israel");
  }, []);

  return <div className="mapDiv" ref={mapRef}></div>;
}

export default App;
