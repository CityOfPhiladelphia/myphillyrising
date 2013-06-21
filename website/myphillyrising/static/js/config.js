var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  NS.Config = {
    neighborhoods: {
      'market-east': { center: [39.9515, -75.1567] },
      'north-central': { center: [39.9524, -75.1636] },
      'pennrose': { center: [39.9524, -75.1636] },
      'strawberry-mansion': { center: [39.9524, -75.1636] },
      'hartranft': { center: [39.9524, -75.1636] },
      'kensington': { center: [39.9949, -75.1185] },
      'st-hughs': { center: [39.9524, -75.1636] },
      'frankford': { center: [39.9524, -75.1636] },
      'lawncrest': { center: [39.9524, -75.1636] },
      'swampoodle-allegheny-west': { center: [39.9524, -75.1636] },
      'point-breeze': { center: [39.9524, -75.1636] },
      'southeast': { center: [39.9524, -75.1636] },
      'elmwood': { center: [39.9524, -75.1636] },
      'haddington': { center: [39.9524, -75.1636] },
      'kingsessing': { center: [39.9524, -75.1636] }
    },

    facilities: [
      {
        name: 'Keyspots',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Keyspot_Locations/MapServer/0/query'
      },
      {
        name: 'Recreation',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Recreation_Facilities/MapServer/0/query'
      }
    ]

  };


}(MyPhillyRising));