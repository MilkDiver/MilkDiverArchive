// loader.js
// Desc.: Loads core functionality for the audio visualizer & HTML from a JSON.
// Written by: Jack Moyen
// Last Updated: March 2025
// 

import * as main from "./main.js";
import dataImport from '../data/av-data.json' with { type: 'json' };


window.onload = ()=>{
	console.log("window.onload called");
	// 1 - do preload here - load fonts, images, additional sounds, etc...
	const data = dataImport;
	
	// 2 - start up app
	main.init(data);
}