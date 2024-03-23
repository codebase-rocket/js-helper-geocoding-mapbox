// Info: Consolidator for countries data
'use strict';

// Use ISO-Code 3166-1
// Ref: https://www.iso.org/obp/ui/#search (For All Country)
// Ref: https://www.iso.org/obp/ui/#iso:code:3166:US (For US)

module.exports = function(){
  return {
    'in': require('./country_exception/in')
  }
};
