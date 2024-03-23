// Info: Boilerplate library. Contains Functions for Outgoing HTTP(s) requests (For NodeJS only and not browsers)
// TODO: multipart requests
'use strict';

// Shared Dependencies (Managed by Loader)
var Lib = {};


// Exclusive Dependencies
var CONFIG = require('./config'); // Loader can override it with Custom-Config
var COUNTRY_DATA = require('./data/index.js')();

/////////////////////////// Module-Loader START ////////////////////////////////

  /********************************************************************
  Load dependencies and configurations

  @param {Set} shared_libs - Reference to libraries already loaded in memory by other modules
  @param {Set} config - Custom configuration in key-value pairs

  @return nothing
  *********************************************************************/
  const loader = function(shared_libs, config){

    // Shared Dependencies (Must be loaded in memory already)
    Lib.Utils = shared_libs.Utils;
    Lib.Debug = shared_libs.Debug;
    Lib.HttpHandler = shared_libs.HttpHandler;
    [Lib.Geo, Lib.GeoInput, Lib.GeoData] = [shared_libs.Geo, shared_libs.GeoInput, shared_libs.GeoData];
    [ Lib.Contact, Lib.ContactInput, Lib.ContactData ] = [ shared_libs.Contact, shared_libs.ContactInput, shared_libs.ContactData ];
    Lib.Instance = shared_libs.Instance;


    // Override default configuration
    if( !Lib.Utils.isNullOrUndefined(config) ){
      Object.assign(CONFIG, config); // Merge custom configuration with defaults
    }

  };

//////////////////////////// Module-Loader END /////////////////////////////////



///////////////////////////// Module Exports START /////////////////////////////
module.exports = function(shared_libs, config){

  // Run Loader
  loader(shared_libs, config);

  // Return Public Funtions of this module
  return GeoCodingMapBox;

};//////////////////////////// Module Exports END //////////////////////////////



///////////////////////////Public Functions START//////////////////////////////
const GeoCodingMapBox = { // Public functions accessible by other modules

  /********************************************************************
  Get Address List from search string

  @param {reference} instance - Request Instance object reference //TODO
  @param {Function} cb  - callback function

  @param {String} provider_key - Api key
  @param {String} search_string - Search String
  @param {Set} options - Additional options for Search
  * @param {String} filter - Filter results (ENUM) (country | region | postcode | district | place | locality | neighborhood | address | poi)
  * @param {String} country - Search for specific region (ENUM) (cn (China) | in (India) | jp (Japan) | us)

  @callback - Request Callback(addresses_list, success, failure_code, is_internal_failure)
  * @callback {Set[]} addresses_list - Address List
  * @callback {Boolean} success - success
  * @callback {String} failure_code - Failure Code
  * @callback {Boolean} is_internal_failure - Is this failure internal or can it be shown to user
  *********************************************************************/
  searchPlaces: function(instance, cb, provider_key, search_string, options){

    // Search Places
    _GeoCodingMapBox.searchPlacesApi(
      instance, cb,
      provider_key,
      search_string,
      options
    );

  },


  /********************************************************************
  Extends an Address Received by Search place api. Add additional Fields including latitude and longitude

  @param {reference} instance - Request Instance object reference
  @param {Function} cb  - callback function

  @param {Set} provider_key - Api Key
  @param {Set} address_data - Address Data

  @callback - Request Callback(addresses_list, success, failure_code, is_internal_failure)
  * @callback {Set[]} addresses_list - Address List
  * @callback {Boolean} success - success
  * @callback {String} failure_code - Failure Code
  * @callback {Boolean} is_internal_failure - Is this failure internal or can it be shown to user
  *********************************************************************/
  geoCoding: function(instance, cb, provider_key, address_data){

    // In Mapbox, Lat Lng are already exist in address data that is received from search place api
    // Return
    return cb(
      address_data, // Address Data
      true, // success
      null, // failure_code
      null  // Is Internal Failure
    );

  },


  /********************************************************************
  Get Address Data from latitude and longitude

  @param {reference} instance - Request Instance object reference
  @param {Function} cb  - callback function

  @param {String} provider_key - Api key
  @param {String} lat - Location latitude
  @param {String} lng - Location longitude

  @callback - Request Callback(address_data, success, failure_code, is_internal_failure)
  * @callback {Set} address_data - Address Data
  * @callback {Boolean} success - success
  * @callback {String} failure_code - Failure Code
  * @callback {Boolean} is_internal_failure - Is this failure internal or can it be shown to user
  *********************************************************************/
  reverseGeoCoding: function(instance, cb, provider_key, lat, lng){


    _GeoCodingMapBox.reverseGeoCodingApi(
      instance, cb,
      provider_key,
      lat, lng
    );

  },

};///////////////////////////Public Functions END//////////////////////////////



//////////////////////////Private Functions START//////////////////////////////
const _GeoCodingMapBox = { // Private functions accessible within this modules only

  /********************************************************************
  Search Places API Request Builder

  @param {String} provider_key - Api Key
  @param {Set} options - Additional Options

  @return {Set} request_data - Request Data Object
  *********************************************************************/
  searchPlacesApiRequestBuilder: function(provider_key, options){

    // Make Request Data for Geocoding
    var request_data = {
      'access_token': provider_key
    }

    // Check Options present
    if( !Lib.Utils.isEmpty(options) ){

      // Add Additional Params
      request_data['types'] = options['filter'] ? options['filter'] : 'postcode,district,place,locality,neighborhood,address,poi'; // Default filters
      request_data['country'] = options['country'] ? options['country'].toUpperCase() : ''; // Default country all
    }


    // Return Request Data
    return request_data;
  },


  /********************************************************************
  Search Places Api Response Resolver

  @param {Integer} response_status - Http Status
  @param {Set} response_header - Http Response Header
  @param {Set} response_body - Http Response Body

  @callback - Request Callback(addresses_list, success, failure_code, is_internal_failure)
  * @callback {Set[]} addresses_list - Address List
  * @callback {Boolean} success - success
  * @callback {String} failure_code - Failure Code
  * @callback {Boolean} is_internal_failure - Is this failure internal or can it be shown to user
  *********************************************************************/
  searchPlacesApiResponseResolver: function(response_status, response_header, response_body){

    // If Bad HTTP-Status code or No data in Response-Body
    if(
      response_status != 200  // Not 200
    ){

      // Determine Failure-Code on basis of HTTP-Status
      var failure_code  = 'UNKNOWN_FAILURE' // Default Error
      if(
        response_status in CONFIG.MAPBOX_ERROR_CODES // Must be a Known payment-Processor
      ){

        // Map Failure Code
        failure_code = CONFIG.MAPBOX_ERROR_CODES[response_status];

        // Check Client Error
        if(
          response_status === 422 &&
          response_body['message'].includes('Query too long')
        ){
          failure_code = 'QUERY_TOO_LONG';
        }

      }

      // Determine internal-failure on Basis of failure-code
      var is_internal_failure = CONFIG.MAPBOX_FAILURE_CODES[failure_code]['ii'];


      // Log failure for research
      Lib.Debug.logErrorForResearch(
        failure_code,
        'Cause: Mapbox Error' +
        '\ncmd: Search Places Api' +
        '\nparams: ' + JSON.stringify({
          'Error-code': response_status,
          'Error-message': response_body['message']
        })
      );


      return { // No Data recieved
        'addresses_list': null,
        'success': false, // Success - failed
        'failure_code': failure_code, // Failure Code -
        'is_internal_failure': is_internal_failure // Is Internal Failure - true
      }
    }


    // Check If no data received
    if( Lib.Utils.isEmpty(response_body['features']) ){
      return { // No Data recieved
        'addresses_list': [],
        'success': true, // Success - true
        'failure_code': null, // No failure code in case of success
        'is_internal_failure': null // No Internal Failure in case of success
      }

    }


    // reach here means all good

    // Return
    return {
      'addresses_list': _GeoCodingMapBox.createAddressListData(response_body['features']),
      'success': true, // Success - True
      'failure_code': null, // Failure Code -
      'is_internal_failure': null // Is Internal Failure - true
    };

  },


  /********************************************************************
  Search Places Api Request

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} provider_key - Api Key
  @param {String} search_string - Search String
  @param {Set} options - Options

  @callback - Request Callback(addresses_list, success, failure_code, is_internal_failure)
  * @callback {Set[]} addresses_list - Address List
  * @callback {Boolean} success - success
  * @callback {String} failure_code - Failure Code
  * @callback {Boolean} is_internal_failure - Is this failure internal or can it be shown to user
  *********************************************************************/
  searchPlacesApi: function(
    instance, cb,
    provider_key,
    search_string,
    options
  ){

    // Construct URL
    var url = _GeoCodingMapBox.urlBuilder(search_string);

    // Construct params
    var http_params = _GeoCodingMapBox.searchPlacesApiRequestBuilder(provider_key, options);

    // Initialize Additional Service parameters for http Request
    let options = {
      'request_content_type': 'jsonp',
    };


    // Make HTTP Request
    Lib.HttpHandler.fetchJSON(
      instance,
      function(err, response_status, response_headers, response_data){

        if(err){ // Print Error
          return cb(err); // Invoke callback with error
        }

        // Process Raw-Response and Convert to Addresses List Data.
        const resolved_api_response = _GeoCodingMapBox.searchPlacesApiResponseResolver( // Resolve Transaction Response
          response_status,
          response_headers,
          response_data
        )

        const { addresses_list, success, failure_code, is_internal_failure } = resolved_api_response;

        // Return API-Response
        cb(addresses_list, success, failure_code, is_internal_failure);

      },
      url, // url
      'GET', // Http-method
      http_params, // params
      options // Additional Service Parameters
    );

  },



  /********************************************************************
  API Request Builder

  @param {String} provider_key - Api Key

  @return {Set} request_data - Request Data Object
  *********************************************************************/
  reverseGeoCodingApiRequestBuilder: function(provider_key){

    // Make Request Data for Geocoding
    var request_data = {
      'access_token': provider_key, // Api key
      'types': 'postcode,district,place,locality,neighborhood,address,poi', // Filter results
      'limit': 1 // Limit the results to 1
    }


    // Return Request Data
    return request_data;
  },


  /********************************************************************
  Reverse Geocoding Api Response Resolver

  @param {Integer} response_status - Http Status
  @param {Set} response_header - Http Response Header
  @param {Set} response_body - Http Response Body

  @callback - Request Callback(address_data, success, failure_code, is_internal_failure)
  * @callback {Set} address_data - Address Data
  * @callback {Boolean} success - success
  * @callback {String} failure_code - Failure Code
  * @callback {Boolean} is_internal_failure - Is this failure internal or can it be shown to user
  *********************************************************************/
  reverseGeoCodingApiResponseResolver: function(response_status, response_header, response_body){

    // If Bad HTTP-Status code or No data in Response-Body
    if(
      response_status != 200  // Not 200
    ){

      // Determine Failure-Code on basis of HTTP-Status
      var failure_code  = 'UNKNOWN_FAILURE' // Default Error
      if(
        response_status in CONFIG.MAPBOX_ERROR_CODES // Must be a Known payment-Processor
      ){
        failure_code = CONFIG.MAPBOX_ERROR_CODES[response_status];
      }

      var is_internal_failure = CONFIG.MAPBOX_FAILURE_CODES[failure_code]['ii'];


      // Log failure for research
      Lib.Debug.logErrorForResearch(
        failure_code,
        'Cause: Mapbox Error' +
        '\ncmd: Reverse Geocoding Api' +
        '\nparams: ' + JSON.stringify({
          'Error-code': response_status,
          'Error-message': response_body['message']
        })
      );


      return { // Failed. No Data recieved
        'address_data': null,
        'success': false, // Success - failed
        'failure_code': failure_code, // Failure Code -
        'is_internal_failure': is_internal_failure // Is Internal Failure - true
      }

    }


    // Check If no data received
    if( Lib.Utils.isEmpty(response_body['features']) ){
      return { // No Data recieved
        'address_data': null,
        'success': true, // Success - true
        'failure_code': null, // No failure code in case of success
        'is_internal_failure': null // No Internal Failure in case of success
      }
    }

    // Reach here means all good


    return {
      'address_data': _GeoCodingMapBox.mapboxDataToAddressData(response_body['features'][0]) ? _GeoCodingMapBox.mapboxDataToAddressData(response_body['features'][0]) : null ,
      'success': true, // Success - True
      'failure_code': null, // Failure Code -
      'is_internal_failure': null // Is Internal Failure - true
    }

  },


  /********************************************************************
  Reverse Geocoding Api Request

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} provider_key - Api Key
  @param {Integer} lat - Latitude
  @param {Integer} lng - Longitude

  @callback - Request Callback(address_data, success, failure_code, is_internal_failure)
  * @callback {Set} address_data - Address Data
  * @callback {Boolean} success - success
  * @callback {String} failure_code - Failure Code
  * @callback {Boolean} is_internal_failure - Is this failure internal or can it be shown to user
  *********************************************************************/
  reverseGeoCodingApi: function(
    instance, cb,
    provider_key,
    lat, lng
  ){

    // Combine coordinates
    var coordinates = lng + ',' + lat;

    // Construct URL
    var url = _GeoCodingMapBox.urlBuilder(coordinates);

    // Construct params
    var http_params = _GeoCodingMapBox.reverseGeoCodingApiRequestBuilder(provider_key);

    // Initialize Additional Service parameters for http Request
    let options = {
      'request_content_type': 'jsonp',
    };


    // Make HTTP Request
    Lib.HttpHandler.fetchJSON(
      instance,
      function(err, response_status, response_headers, response_data){

        if(err){
          return cb(err); // Invoke callback with error
        }

        // Process Raw-Response and Convert to Addresses List Data.
        const resolved_api_response = _GeoCodingMapBox.reverseGeoCodingApiResponseResolver( // Resolve Transaction Response
          response_status,
          response_headers,
          response_data
        )

        const { address_data, success, failure_code, is_internal_failure } = resolved_api_response;

        // Return API-Response
        cb(
          address_data,
          success,
          failure_code,
          is_internal_failure
        );

      },
      url, // url
      'GET', // Http-method
      http_params, // params
      options // Additional Service Parameters
    );

  },



  /********************************************************************
  url Bulider

  @param {String} end_point - url end point

  @return {String} - url
  *********************************************************************/
  urlBuilder: function(endpoint){

    // Return url
    return CONFIG.MAPBOX_GEO_CODING_BASE_URL + `${encodeURI(endpoint)}.json`;

  },



  /********************************************************************
  Extract And Convert Mapbox Addresses List to our Address Data format

  @param {Set[]} addresses_list - List of places

  @return {Set[]} addresses_data - Addresses Data List
  *********************************************************************/
  createAddressListData: function(addresses_list){

    // Check Addresses-List is not Exist
    if( Lib.Utils.isEmpty(addresses_list) ){
      return [];
    }


    // Iterate Each Mapbox Place's Address And Convert into our Address-data
    var foramtted_addresses_list = [];
    addresses_list.forEach(function(mapbox_address){

      // Format Mapbox-Address to our Address-Data
      let address_data = _GeoCodingMapBox.mapboxDataToAddressData(mapbox_address);

      // Check if Address Data was Successfully formatted then push to foramtted-addresses-list
      if( address_data ){
        foramtted_addresses_list.push(address_data);
      }

    });


    // Return foramtted-addresses-list
    return foramtted_addresses_list;

  },


  /********************************************************************
  Convert Mapbox Address To our Address Data format

  @param {Set} mapbox_address - Mapbox Address

  @return {Set} address - Address Data Object in key-value
  @return {Boolean} address - False, If Invalid Address
  *********************************************************************/
  mapboxDataToAddressData: function(mapbox_address){

    // Initialize Address Object
    var address = {
      'address_id': null,
      'string': null,
      'title': null,
      'type': 'oth', // (oth:other (Default) | off:office | hom:home)
      'country': null, // United States (country)
      'sub_division': null, // Connecticut (region)
      'locality': null, // New Haven County ( district)
      'line1': null,
      'line2': null, // Hamden (place)
      'postal_code': null, // 06518 (postcode)
      'extra': null,
      'latitude': null,
      'longitude': null,
      'provider_data': {
        'search_string': mapbox_address['place_name']
      }
    }

    // Check Place-Name Exist
    if( !Lib.Utils.isEmpty( mapbox_address['place_name'] ) ){
      address['string'] = mapbox_address['place_name']
    }


    // Construct Address-Line-1 And Address-Type
    // Construct Line-1 on bases of Place-type. Mapbox sends Line-1 Address in Different Fields.
    if(
      mapbox_address['place_type'].includes('address')
    ){
      address['type'] = 'hom';
      address['line1'] = [mapbox_address.address, mapbox_address.text].filter(Boolean).join(' '); // 'Address Text' | 'Address' | 'Text' | ''
    }
    else if(
      mapbox_address['place_type'].includes('poi') &&
      'properties' in mapbox_address &&
      'address' in mapbox_address['properties']
    ){
      address['type'] = 'off';
      address['line1'] = [mapbox_address['properties']['address'], mapbox_address.text].filter(Boolean).join(' '); // 'Address Text' | 'Address' | 'Text' | ''
    }

    // Initialize Postal-Code and Sub-Division (Postal-Code is processed after address is processed)
    var postal_code;
    var sub_division;
    var sub_division_exception_text; // When Sub-Division Short-Code is not sent by Mapbox
    // var sub_division_exception_short_code; // When Short Code is Different from ISO-Code 3166-1

    // Check & assign coordinates if present
    if( !Lib.Utils.isEmpty(mapbox_address['geometry']['coordinates']) ){
      address['latitude'] = Lib.GeoInput.sanitizeLatitude(mapbox_address['geometry']['coordinates'][1]);
      address['longitude'] = Lib.GeoInput.sanitizeLongitude(mapbox_address['geometry']['coordinates'][0]);
    }


    // Check Context in Mapbox-Address Exist
    if( !Lib.Utils.isEmpty(mapbox_address['context']) ){

      // Extract other fields of Address from mapbox data
      mapbox_address['context'].forEach(function(data){

        // Extract Field Name (locality, district, region, ...)
        let field = data['id'].split('.')[0];

        // Extract Field Value (United States, Connecticut, ...)
        let value = data['text'];

        // Extract Additional Short Code (us, US-CT)
        let short_value = data['short_code'];
        if( !Lib.Utils.isEmpty(short_value) ){ // Always Convert short_value to Lower-Case
          short_value = short_value.toLowerCase();
        }


        // Convert Mapbox field to our address format field
        // Extract Country
        if(
          field === 'country' &&
          !Lib.Utils.isEmpty(short_value) &&
          Lib.ContactInput.validateAddressCountry(short_value) // Validate Country
        ){
          address['country'] = short_value;
        }

        // Extract Postal-Code
        else if(
          field == 'postcode' &&
          !Lib.Utils.isEmpty(value)
        ){
          postal_code = value;
        }

        // Extract Sub-Division
        else if(
          field === 'region' &&
          !Lib.Utils.isEmpty(short_value)
        ){
          sub_division = short_value
        }

        // Extract Sub-Division (Exceptions, when short code is not available)
        else if(
          field === 'region' &&
          Lib.Utils.isEmpty(short_value) &&
          !Lib.Utils.isEmpty(value)
        ){
          sub_division_exception_text = value
        }

        // Extract Locality
        else if(
          field == 'district' &&
          !Lib.Utils.isEmpty(value)
        ){
          address['locality'] = value;
        }

        // Extract Line-2
        else if(
          field == 'place' &&
          !Lib.Utils.isEmpty(value)
        ){
          address['line2'] = value;
        }

      });
    }


    // Process Sub-Division
    address['sub_division']  = _GeoCodingMapBox.processSubDivision(
      address['country'],
      sub_division,
      sub_division_exception_text
    );


    // Check for compulsary address fields (Country, Sub-Division)
    if(
      Lib.Utils.isEmpty(address['country']) ||
      Lib.Utils.isEmpty(address['sub_division'])
    ){
      return false; // Do not continue because Address-Data does not have required fields
    }


    // Validate & Assign Postal-Code
    if(
      !Lib.Utils.isEmpty(postal_code) &&
      Lib.ContactInput.validateAddressPostalCode(address['country'], postal_code)
    ){
      address['postal_code'] = Lib.ContactInput.sanitizeAddressPostalCode(postal_code);
    }


    // Return Formatted Address
    return Lib.ContactData.createAddressData(address);

  },


  /********************************************************************
  Determine sub division ISO code for Exceptional Sub-Division text

  @param {String} country - Country Name
  @param {String} sub_division_exception - sub-division-exception

  @return {String} sub_division - Sub-Division ISO code
  *********************************************************************/
  determineExceptionalRegion: function(country, sub_division_exception){

    var sub_division = null;

    // Check Country And Sub-Division exist in our list
    if(
      country in COUNTRY_DATA &&
      sub_division_exception in COUNTRY_DATA[country]['sd']
    ){
      sub_division = COUNTRY_DATA[country]['sd'][sub_division_exception]
    }


    // Return Sub-Division ISO code
    return sub_division;

  },


  /********************************************************************
  Determine Sub-Division ISO code for Normal And Exceptional Sub-Division

  @param {String} country - Country in ISO-Code (us)
  @param {String} sub_division - Sub-Division ('US-CT')
  @param {String} sub_division_exception_text - sub-division-exception ('Chandigarh capital')

  @return {String} sub_division - Sub-Division ISO code
  *********************************************************************/
  processSubDivision: function(
    country,
    sub_division,
    sub_division_exception_text
  ){

    // Process for Sub-Division (When Short code is Available )
    if(
      !Lib.Utils.isEmpty(country) &&
      !Lib.Utils.isEmpty(sub_division)
    ){

      // Extract Sub-Division code from region short code (Example: 'US-CT' -> 'ct')
      sub_division = sub_division.split('-').pop();

      // Validate Sub-Division
      if( Lib.ContactInput.validateAddressSubDivision(country, sub_division) ){
        return sub_division;
      }
      else{ // Validation Failed means Short Code is Different from ISO-Code 3166-1

        // Determine sub division ISO code for Exceptional sub division (for example Short Code is Different from ISO-Code 3166-1)
        sub_division = _GeoCodingMapBox.determineExceptionalRegion(country, sub_division);

        // Validate Sub-Division
        if( Lib.ContactInput.validateAddressSubDivision(country, sub_division) ){
          return sub_division;
        }

      }
    }



    // Process for Exceptional Sub-Division (When Short Code is not Available)
    if(
      !Lib.Utils.isEmpty(country) &&
      !Lib.Utils.isEmpty(sub_division_exception_text)
    ){

      // Determine sub division ISO code for Exceptional sub division (for example ISO code is not sent for 'Chandigarh capital')
      sub_division = _GeoCodingMapBox.determineExceptionalRegion(country, sub_division_exception_text);

      // Validate Sub-Division
      if( Lib.ContactInput.validateAddressSubDivision(country, sub_division) ){
        return sub_division;
      }

    }


    // Reach here means Failed to process Sub-Division
    return null;

  }

};//////////////////////////Private Functions END//////////////////////////////
