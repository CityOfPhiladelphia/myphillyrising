/*globals Alexander Backbone Handlebars $ _ Swiper L lvector */

var MyPhillyRising = MyPhillyRising || {};

(function(NS, A) {
  NS.Map = {};

  NS.Map.update = function(neighborhood, center) {
    // Roughly buffer a point to a bounding box
    var getBoundingBox = function(coords, radius) {
      var lngMile = 0.0192,
          latMile = 0.01499,
          bottom = coords[0] - (latMile * radius),
          top = coords[0] + (latMile * radius),
          left = coords[1] - (lngMile * radius),
          right = coords[1] + (lngMile * radius);

      return [left, bottom, right, top]; // <xmin>,<ymin>,<xmax>,<ymax>
    };

    NS.Map.allTheThingsLayer.clearLayers();

    NS.Map.map.panTo(center);

    _.each(NS.Map.allTheThingsCollections, function(collection, i) {
      console.log('fetching for', neighborhood, 'at', center);
      collection.fetch({
        reset: true,
        data: {
          where: '1=1',
          outFields: '*',
          inSR: '4326',
          outSR: '4326',
          spatialRel: 'esriSpatialRelIntersects', // Find stuff that intersects this envelope
          geometryType: 'esriGeometryEnvelope', // Our "geometry" url param will be an envelope
          geometry: getBoundingBox(center, 1).join(','), // Build envelope geometry
          f: 'json'
        }
      });
    });

  };

  // Init Map
  NS.Map.initializer = function(options){
    var url = 'http://{s}.tiles.mapbox.com/v3/openplans.map-dmar86ym/{z}/{x}/{y}.png',
        attribution = '&copy; OpenStreetMap contributors, CC-BY-SA. <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>',
        baseLayer = L.tileLayer(url, {attribution: attribution});

    NS.Map.allTheThingsLayer = L.layerGroup();
    NS.Map.allTheThingsCollections = [];

    // Init the map
    NS.Map.map = L.map('map', {
      layers: [baseLayer, NS.Map.allTheThingsLayer],
      center: [39.9529, -75.1630],
      zoom: 13
    });

    _.each(NS.Config.facilities, function(f, i) {
      NS.Map.allTheThingsCollections[i] = new A.AgsCollection(null, {
        url: f.url
      });

      NS.Map.allTheThingsCollections[i].on('reset', function(collection, evt) {
        console.log('finished fetching', this.size(), 'records for', f.name);

        collection.each(function(model) {
          var geom = model.get('geometry');
          NS.Map.allTheThingsLayer.addLayer(L.marker([geom.y, geom.x]));
        });
      });
    });

  };

}(MyPhillyRising, Alexander));