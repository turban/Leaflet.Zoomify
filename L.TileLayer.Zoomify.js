/*
 * L.TileLayer.Zoomify display Zoomify tiles with Leaflet
 *
 * Developed for Leaflet 1.0-dev
 *
 * Based on the Leaflet.Zoomify (https://github.com/turban/Leaflet.Zoomify) 
 * from turban (https://github.com/turban)
 * 
 */
 
L.TileLayer.Zoomify = L.TileLayer.extend({
	options: {
		width: -1, //Must be set by user, max zoom image width
		height: -1, //Must be set by user, max zoom image height
		tileGroupPrefix: 'TileGroup',
		tilesPerTileGroup: 256
	},

	initialize: function (url, options) {
		var options = L.setOptions(this, options);
		this._url = url;

		//Replace with automatic loading from ImageProperties.xml
		if(options.width < 0 || options.height < 0)
		{
			throw new Error("The user must set the Width and Height of the Zoomify image");
		}
		
    	var imageSize = L.point(options.width, options.height),
	    	tileSize = options.tileSize;

		//Build the zoom sizes of the pyramid and cache them in an array
    	this._imageSize = [imageSize];
    	this._gridSize = [this._getGridSize(imageSize)];
		
		//Register the image size in pixels and the grid size in # of tiles for each zoom level
        var imageSize;
        while (parseInt(imageSize.x) > tileSize || parseInt(imageSize.y) > tileSize) {
        	imageSize = imageSize.divideBy(2).ceil();
        	this._imageSize.push(imageSize);
        	this._gridSize.push(this._getGridSize(imageSize));
        }

		//We built the cache from bottom to top, but leaflet uses a top to bottom index for the zoomlevel, 
		// so reverse it for easy indexing by current zoomlevel
		this._imageSize.reverse();
		this._gridSize.reverse();

		//Register our max supported zoom level
        options.maxNativeZoom = this._gridSize.length - 1;
		
		//Register our bounds for this zoomify layer based on the maximum zoom
		var maxZoomGrid = this._gridSize[options.maxNativeZoom];
		var southWest = map.unproject([0,maxZoomGrid.y*tileSize], options.maxNativeZoom);
		var northEast = map.unproject([maxZoomGrid.x*tileSize,0], options.maxNativeZoom);
		options.bounds = new L.LatLngBounds(southWest, northEast);		
	},

	//Calculate the grid size for a given image size (based on tile size)
	_getGridSize: function (imageSize) {
		var tileSize = this.options.tileSize;
		return L.point(Math.ceil(imageSize.x / tileSize), Math.ceil(imageSize.y / tileSize));
	},

	//Extend the add tile function to update our arbitrary sized border tiles
	_addTile: function (coords, container) {
		//Load the tile via the original leaflet code
		L.TileLayer.prototype._addTile.call(this, coords, container);

		//Get out imagesize in pixels for this zoom level and our grid size
		var imageSize = this._imageSize[this._getZoomForUrl()],
			gridSize = this._gridSize[this._getZoomForUrl()];
			
		//The real tile size (default:256) and the display tile size (if zoom > maxNativeZoom)
		var	realTileSize = L.GridLayer.prototype.getTileSize.call(this),
			displayTileSize = L.TileLayer.prototype.getTileSize.call(this);
		
		//Get the current tile to adjust
		var key = this._tileCoordsToKey(coords),
			tile = this._tiles[key].el;
		
		//Calculate the required size of the border tiles
		var scaleFactor = L.point(	(imageSize.x % realTileSize.x), 
									(imageSize.y % realTileSize.y)).unscaleBy(realTileSize);
		
		//Update tile dimensions if we are on a border
		if ((imageSize.x % realTileSize.x) > 0 && coords.x === gridSize.x - 1) {
			tile.style.width = displayTileSize.scaleBy(scaleFactor).x + 'px';
		} 

		if ((imageSize.y % realTileSize.y) > 0 && coords.y === gridSize.y - 1) {
			tile.style.height = displayTileSize.scaleBy(scaleFactor).y + 'px';			
		} 
	},

	
	//Construct the tile url, by inserting our tilegroup before we template the url
	getTileUrl: function (coords) {
		//Set our TileGroup variable, and then let the original tile templater do the work
		this.options.g = this.options.tileGroupPrefix+this._getTileGroup(coords)
		
		//Call the original templater
		return L.TileLayer.prototype.getTileUrl.call(this, coords);
	},

	//Calculates the TileGroup number, each group contains 256 tiles. The tiles are stored from topleft to bottomright
	_getTileGroup: function (coords) {
		var zoom = this._getZoomForUrl(),
			num = 0,
			gridSize;

		//Get the total number of tiles from the lowest zoom level to our zoomlevel
		for (var z = 0; z < zoom; z++) {
			gridSize = this._gridSize[z];
			num += gridSize.x * gridSize.y; 
		}	

		//Add the remaining tiles from this zoom layer to the running total of tiles
		num += coords.y * this._gridSize[zoom].x + coords.x;
      	return Math.floor(num / this.options.tilesPerTileGroup);
	}

});

L.tileLayer.zoomify = function (url, options) {
	return new L.TileLayer.Zoomify(url, options);
};