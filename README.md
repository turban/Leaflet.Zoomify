Leaflet.Zoomify
==========
##Description
A tiny simple plugin for [Leaflet](http://leafletjs.com) to load Zoomify tiles from the TileGroup directories. It also corrects the arbritary boundary tiles that do not always have the standard square dimensions.

##Requirements
- Leaflet 1.0.0-b1 (or later)
- Zoomify tile source

##Example
See the example.html file

##Compatibility
Extends the original Leaflet TileLayer, so everything that ```L.TileLayer``` supports, is supported by this plugin.

##Usage
Just include the ```L.TileLayer.Zoomify.js``` file in your page and create a l.tilelayer.zoomify:
```js
var layer = L.tileLayer.zoomify('http://thematicmapping.org/playground/zoomify/books/{g}/{z}-{x}-{y}.jpg', {
			width: 5472,
			height: 3648,
			attribution: '&copy; Photo: Bjørn Sandvik'
		}).addTo(map);
```
Example Zoomify image by [turban](https://github.com/turban) 

##API
#### L.tileLayer.zoomify(urlTemplate, options)
Constructs a regular TileLayer that has overloaded some specific functions for tile loading.

The urlTemplate will be a regular Leaflet [url template](http://leafletjs.com/reference.html#url-template), but also has the ```{g}``` variable available that contains the current TileGroup number. E.g. ```www.your.url/{g}/{z}-{x}-{y}.jpg``` converts to ```www.your.url/TileGroup0/1-0-0.jpg``` for the lowest zoom tile.

The regular [L.TileLayer options](http://leafletjs.com/reference.html#tilelayer-options) are extended with the following:
#####Required options
- **width** - The width of the Zoomify image (max zoomed in), see ImageProperties.xml
- **height** - The height of the Zoomify image (max zoomed in), see ImageProperties.xml (**required to set**)

#####Optional
- **tileGroupPrefix** - The prefix used for the tile subdirectories (*default:* TileGroup)
- **tilesPerTileGroup** - The number of tiles per subdirectory (*default:* 256)

The Zoomify layer exposes its size in ```layer.options.bounds```, and could be used for constraining movement or to set the viewport with ```map.fitBounds(layer.options.bounds)```.
