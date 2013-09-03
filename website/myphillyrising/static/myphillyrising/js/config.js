var MyPhillyRising = MyPhillyRising || {};

(function(NS) {
  NS.Config = {
    facilities: [
      {
        id: 1,
        label: 'KEYSPOT',
        icon: 'marker-computer.png',
        iconShadow: 'marker-shadow.png',
        description: 'Philly KEYSPOTs provide free computer classes, web access, and 1-on-1 training.',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Keyspot_Locations/MapServer/0/query',
        radius: 1,
        attrMap: {
          id: 'OBJECTID_1',
          name: 'NAME',
          address: 'MATCH_ADDR'
        }
      },
      {
        id: 2,
        label: 'Recreation Facility',
        icon: 'marker-reccenter.png',
        iconShadow: 'marker-shadow.png',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Recreation_Facilities/MapServer/0/query',
        radius: 1,
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'ADDRESS'
        }
      },
      // NOTE: this is a polygon so we can't show it
      // {
      //   id: 3,
      //   label: 'Registered Community Organization',
      //   description: 'RCOs are designed to improve community notification of proposed developments and make community involvement more predictable across the city.',
      //   icon: 'marker-community.png',
      //   iconShadow: 'marker-shadow.png',
      //   url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/RCO/MapServer/0/query',
      //   radius: 1,
      //   attrMap: {
      //     id: 'OBJECTID',
      //     name: 'ORG_NAME',
      //     address: 'ADDRESS'
      //   }
      // },
      {
        id: 4,
        label: 'Playground',
        icon: 'marker-swing.png',
        iconShadow: 'marker-shadow.png',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Playgrounds/MapServer/0/query',
        radius: 1,
        attrMap: {
          id: 'OBJECTID',
          name: 'SITE',
          address: 'ADDRESS'
        }
      },
      {
        id: 5,
        label: 'PAL Centers',
        icon: 'marker-reccenter.png',
        iconShadow: 'marker-shadow.png',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/PAL_Centers/MapServer/0/query',
        radius: 1,
        attrMap: {
          id: 'OBJECTID',
          name: 'CENTER_NAM',
          address: 'ADDRESS'
        }
      },
      {
        id: 6,
        label: 'Park',
        icon: 'marker-park.png',
        iconShadow: 'marker-shadow.png',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Parks/MapServer/0/query',
        radius: 1,
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'ADDRESS'
        }
      },
      {
        id: 7,
        label: 'Ice Rink',
        icon: 'marker-iceskate.png',
        iconShadow: 'marker-shadow.png',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Ice_Rinks/MapServer/0/query',
        radius: 1,
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'ADDRESS'
        }
      },
      {
        id: 8,
        label: 'Health Center',
        icon: 'marker-healthcenter.png',
        iconShadow: 'marker-shadow.png',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Health_Centers/MapServer/0/query',
        radius: 1,
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'ADDRESS'
        }
      },
      {
        id: 9,
        label: 'Healthy Corner Store',
        icon: 'marker-food.png',
        iconShadow: 'marker-shadow.png',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Healthy_Corner_Stores/MapServer/0/query',
        radius: 1,
        attrMap: {
          id: 'OBJECTID',
          name: 'OFFICIAL_S',
          address: 'STORE_ADDR'
        }
      },
      {
        id: 10,
        label: 'Fire Station',
        icon: 'marker-firefighter.png',
        iconShadow: 'marker-shadow.png',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Fire_Stations/MapServer/0/query',
        radius: 1,
        attrMap: {
          id: 'OBJECTID',
          name: 'ENG',
          address: 'LOCATION'
        }
      },
      {
        id: 11,
        label: 'Cooling Center',
        icon: 'marker-swimmer.png',
        iconShadow: 'marker-shadow.png',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Cooling_Centers/MapServer/1/query',
        radius: 1,
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'LOCATION'
        }
      },
      {
        id: 12,
        label: 'Farmers Market',
        icon: 'marker-food.png',
        iconShadow: 'marker-shadow.png',
        url: 'http://gis.phila.gov/ArcGIS/rest/services/PhilaGov/Farmers_Markets/MapServer/0/query',
        radius: 1,
        attrMap: {
          id: 'OBJECTID',
          name: 'NAME',
          address: 'ADDRESS'
        }
      }
    ]
  };


}(MyPhillyRising));