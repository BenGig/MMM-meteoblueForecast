# Module: Meteoblue Forecast
This module displays weather forecast from www.meteoblue.com, showing low and high temperatures and wind speed, rain probability and UV index. Meteoblue provides very accurate data based on several forecast models and dense grids. Especially for demanding regions like the alps, the forecasts are ahead of other providers.

## Access
You'll have to get an apikey from meteoblue.com.
https://docs.meteoblue.com/en/apis/weather-data/introduction.
Order the Free JSON feed.

API: https://docs.meteoblue.com/en/apis/weather-data/packages-api

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
      daysAhead: 4,        // days displayed, in rows
      updateInterval: 60 * 60 * 1000, // every 60 minutes
    }
  },
]
````

