# Module: Meteoblue Forecast
This module displays weather forecast from www.meteoblue.com.
The weather's APIBase ist www.meteoblue.com

You'll have to get an apikey from meteoblue.com.
https://content.meteoblue.com/en/products/meteoblue-api
Order the Free JSON feed.

API
https://content.meteoblue.com/en/help/technical-documentation/meteoblue-api

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
  {
    module: 'MMM-meteoblueForecast',
    position: 'top_right',
    config: {
      apikey: '123456789', // private; don't share!
      city: 'Oberrieden',
      lat: '47.2744',
      lon: '8.5784',
      asl: '464'
		}
	},
]
````

