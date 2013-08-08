var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  NS.Config = {
    facilities: [
      {
        label: 'Keyspot',
        type: 'computer',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Keyspot_Locations/MapServer/0/query',
        attrMap: {
          id: 'OBJECTID_1',
          name: 'NAME',
          address: 'MATCH_ADDR'
        }
      },
      {
        label: 'Recreation Facility',
        type: 'reccenter',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Recreation_Facilities/MapServer/0/query',
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'ADDRESS'
        }
      },
      {
        label: 'Registered Community Organization',
        type: 'community',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/RCO/MapServer/0/query',
        attrMap: {
          id: 'OBJECTID',
          name: 'ORG_NAME',
          address: 'ADDRESS'
        }
      },
      {
        label: 'Playgrounds',
        type: 'swing',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Playgrounds/MapServer/0/query',
        attrMap: {
          id: 'OBJECTID',
          name: 'SITE',
          address: 'ADDRESS'
        }
      },
      {
        label: 'PAL Centers',
        type: 'reccenter',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/PAL_Centers/MapServer/0/query',
        attrMap: {
          id: 'OBJECTID',
          name: 'CENTER_NAM',
          address: 'ADDRESS'
        }
      },
      {
        label: 'Parks',
        type: 'park',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Parks/MapServer/0/query',
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'ADDRESS'
        }
      },
      {
        label: 'Ice Rinks',
        type: 'iceskate',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Ice_Rinks/MapServer/0/query',
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'ADDRESS'
        }
      },
      {
        label: 'Health Centers',
        type: 'healthcenter',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Health_Centers/MapServer/0/query',
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'ADDRESS'
        }
      },
      {
        label: 'Healthy Corner Stores',
        type: 'food',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Healthy_Corner_Stores/MapServer/0/query',
        attrMap: {
          id: 'OBJECTID',
          name: 'OFFICIAL_S',
          address: 'STORE_ADDR'
        }
      },
      {
        label: 'Farmers Market',
        type: 'food',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Farmers_Markets/MapServer/0/query',
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'ADDRESS'
        }
      },
      {
        label: 'Fire Stations',
        type: 'firefighter',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Fire_Stations/MapServer/0/query',
        attrMap: {
          id: 'OBJECTID',
          name: 'LAD',
          address: 'LOCATION'
        }
      },
      {
        label: 'Cooling Centers',
        type: 'swimmer',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Cooling_Centers/MapServer/1/query',
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'LOCATION'
        }
      // },
      // {
      //   label: 'Police Stations',
      //   type: 'police',
      //   url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Cooling_Centers/MapServer/0/query',
      //   attrMap: {
      //     id: 'OBJECTID',
      //     name: 'SPCL',
      //     address: 'LOCATION'
      //   }
      }
    ]
  };


}(MyPhillyRising));