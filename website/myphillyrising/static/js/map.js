/*globals Alexander Backbone Handlebars $ _ Swiper L lvector */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {
  NS.Map = {};

  // Roughly buffer a point to a bounding box
  NS.Map.pointToBoundingBox = function(coords, radius) {
    var lngMile = 0.0192,
        latMile = 0.01499,
        bottom = coords[0] - (latMile * radius),
        top = coords[0] + (latMile * radius),
        left = coords[1] - (lngMile * radius),
        right = coords[1] + (lngMile * radius);

    return [left, bottom, right, top]; // <xmin>,<ymin>,<xmax>,<ymax>
  };

  NS.Map.update = function(neighborhood, center) {
    // Clear the map of markers
    NS.Map.layerGroup.clearLayers();
    // Clear the list
    NS.Map.allTheThingsCollection.reset();

    // Zoom to the neighborhood on the map
    NS.Map.map.panTo(center);

    NS.Map.panTo = function(id) {
      NS.Map.map.panTo(NS.Map.allTheMarkers[id].getLatLng());
    };

    // Get new data for all of the AGS collections, triggering a reset!
    _.each(NS.Map.allTheCollections, function(collection, i) {
      collection.fetch({
        reset: true,
        data: {
          where: '1=1',
          outFields: '*',
          inSR: '4326',
          outSR: '4326',
          spatialRel: 'esriSpatialRelIntersects', // Find stuff that intersects this envelope
          geometryType: 'esriGeometryEnvelope', // Our "geometry" url param will be an envelope
          geometry: NS.Map.pointToBoundingBox(center, 0.75).join(','), // Build envelope geometry
          f: 'json'
        }
      });
    });
  };

  // Init Map
  NS.Map.initializer = function(options){
    // Collection that controls the item list
    NS.Map.allTheThingsCollection = new Backbone.Collection();

    var url = 'http://{s}.tiles.mapbox.com/v3/openplans.map-dmar86ym/{z}/{x}/{y}.png',
        attribution = '&copy; OpenStreetMap contributors, CC-BY-SA. <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>',
        baseLayer = L.tileLayer(url, {attribution: attribution}),
        mapCollectionView = new NS.MapCollectionView({
          collection: NS.Map.allTheThingsCollection
        });

    // A layergroup to handle all our markers
    NS.Map.layerGroup = L.layerGroup();
    // Keep track of all of our AGS services
    NS.Map.allTheCollections = [];
    // Keep track of all of the markers by id
    NS.Map.allTheMarkers = {};

    // Render the view
    NS.app.mapListRegion.show(mapCollectionView);

    // Init the map
    NS.Map.map = L.map('map', {
      layers: [baseLayer, NS.Map.layerGroup],
      center: [39.9529, -75.1630],
      zoom: 13
    });

    // Turn our config file into collections
    _.each(NS.Config.facilities, function(f, i) {

      // Make and cache a collection
      NS.Map.allTheCollections[i] = new A.AgsCollection(null, {
        url: f.url
      });

      // When we reset this collection
      NS.Map.allTheCollections[i].on('reset', function(collection, evt) {

        // Go through each model
        collection.each(function(model) {
          var geom = model.get('geometry'),
              attrs = model.get('attributes'),
              normAttrs = {
                label: f.label,
                type: f.type
              };

          _.each(f.attrMap, function(val, key) {
            normAttrs[key] = attrs[val];
          });

          NS.Map.allTheMarkers[normAttrs.id] = L.marker([geom.y, geom.x], {
            // fancy icon
            attributes: normAttrs
          });

          // Bind the click event to the marker
          NS.Map.allTheMarkers[normAttrs.id].on('click', function(evt) {

            mapCollectionView.selectItem(evt.target.options.attributes.id);
          });

          // Add it to the map
          // TODO: fancy markers by f.type
          NS.Map.layerGroup.addLayer(NS.Map.allTheMarkers[normAttrs.id]);

          // Add it to the list item collection so the view can do its thing.
          // Also map our attributes to something the template will understand.
          NS.Map.allTheThingsCollection.add(normAttrs);
        });
      });

    });

  };

}(MyPhillyRising, Alexander));