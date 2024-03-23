// Info: Test Cases
'use strict';

// Global objects
var Lib = {}; // For dependencies


// Dependencies (Modules that are imported from outside this project)
Lib.Utils = require('js-helper-utils');
Lib.Debug = require('js-helper-debug')(Lib);
Lib.HttpHandler = require('js-helper-http-nodejs')(Lib);
[ Lib.Geo, Lib.GeoInput, Lib.GeoData ] = require('js-helper-geo')(Lib);
[ Lib.Contact, Lib.ContactInput, Lib.ContactData ] = require('js-helper-contact')(Lib);
Lib.Instance = require('js-helper-instance')(Lib, {});

const CONFIG = {};


const GeoCodingMapBox = require('js-helper-geocoding-mapbox')(Lib, CONFIG);




////////////////////////////SIMILUTATIONS//////////////////////////////////////
// Nothing
///////////////////////////////////////////////////////////////////////////////


/////////////////////////////STAGE SETUP///////////////////////////////////////

function test_output3(address_data, success, failure_code, is_internal_failure){ // Result are from previous function

  Lib.Debug.log('address_data', address_data);
  Lib.Debug.log('success', success);
  Lib.Debug.log('failure_code', failure_code);
  Lib.Debug.log('is_internal_failure', is_internal_failure);

};

///////////////////////////////////////////////////////////////////////////////


// Sample Input
// GeoCodingMapBox.geoCoding(
//   Lib.Instance.initialize(),
//   test_output3,
//   null,
//   {
//     address_id: null,
//     provider_data: {
//       search_string: 'Grant-Wexler Community School, 55 Foote St, New Haven, Connecticut 06511, United States'
//     },
//     country: 'United States',
//     sub_division: 'CT',
//     locality: 'New Haven',
//     line1: '55 Foote St, Dixwell',
//     postal_code: '06511',
//     latitude: 41.31815,
//     longitude: -72.93277
//   },
//   null // options
// )

// Sample output
// { lat: 28.7040592, lng: 77.10249019999999 }


// Sample Input
// GeoCodingMapBox.searchPlaces(
//   Lib.Instance.initialize(),
//   test_output3,
//   'todo', // access_token
//   "4 nature trail, hamden",
//   {
//     filter: '',
//     country: 'us'
//   } //options
// );


// console.log('4 Nature trails, Hamden 4 Nature trails, Hamden 4 Nature trails, Hamden 4 Nature trails, Hamden 4 Nature trails, Hamden 4 Nature trails, Hamden 4 Nature trails, Hamden 4 Nature trails, Hamden 4 Nature trails, Hamden 4 Nature trails, Hamden 4 Nature trails, Hamden 4 Nature trails, Hamden 4 Nature trails, Hamden'.length);
// Search places token
// console.log(GoogleGeo.searchPlaceToken());


// GeoCodingMapBox.reverseGeoCoding(
//   Lib.Instance.initialize(),
//   test_output3,
//   'todo', // access token
//   '35.853184', // lat
//   '-82.211023', //lng
// )


// Sample output
// {
//   address_id: null,
//   address_title: null,
//   address_type: 0,
//   address_country: 'Delhi',
//   address_sub_division: 'Delhi',
//   address_locality: 'North West Delhi',
//   address_line2: 'Delhi',
//   address_line1: [ 'Sector 3', 'Rohini' ],
//   address_postal_code: '110085',
//   address_extra: null,
//   address_latitude: '28.7040592',
//   address_longitude: '77.10249019999999'
// }

/////////////////////////////////TESTS/////////////////////////////////////////
