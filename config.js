// Info: Configuration file
'use strict';


// Export configration as key-value Map
module.exports = {

  // MapBox Base URL
  MAPBOX_GEO_CODING_BASE_URL        : 'https://api.mapbox.com/geocoding/v5/mapbox.places/',


  // Errors
  MAPBOX_ERROR_CODES: {
    '401': 'PROVIDER_AUTH_FAILED', // Invalid Token
    '403': 'PROVIDER_ACCOUNT_ISSUE', // Forbidden
    '404': 'INVALID_URL', // Not Found
    '422': 'BAD_REQUEST', // Invalid Params
    '429': 'THROTTLED', // Rate limit exceeded
  },


  MAPBOX_FAILURE_CODES: {
    'PROVIDER_AUTH_FAILED': {
      'ii': true
    },
    'PROVIDER_ACCOUNT_ISSUE': {
      'ii': true
    },
    'INVALID_URL': {
      'ii': true
    },
    'BAD_REQUEST': {
      'ii': true
    },
    'THROTTLED': {
      'ii': true
    },
    'UNKNOWN_FAILURE': {
      'ii': true
    },
    'QUERY_TOO_LONG': {
      'ii': false
    }
  }

}
