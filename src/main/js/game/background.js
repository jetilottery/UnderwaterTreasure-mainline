define([
    'skbJet/component/resourceLoader/resourceLib'
], function(resLib) {
    'use strict';
    return function(gr, canvas){
		
        canvas.parentElement.style.backgroundImage = 'url({0})'.replace(/\{0\}/, resLib.images[gr._GameScene.$background].src);
        canvas.parentElement.style.backgroundRepeat = 'no-repeat';
        canvas.parentElement.style.backgroundSize = 'cover';	
        canvas.parentElement.style.backgroundPosition = 'center';
		
    };
});