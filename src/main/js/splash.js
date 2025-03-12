define([
	'skbJet/component/resourceLoader/resourceLib',
	'skbJet/componentCRDC/splash/splashLoadController'
], function(resLib, splashLoadController){
	
	var loadDiv = document.getElementById('load');
	var loadingBar = document.getElementById('loadingBar');
	var loadingBarWidht = 0;
	var loadingBarFrontWidth = 0;
	var progressBar = document.getElementById('progressBar');
	var progressBarLoader = document.getElementById('progressBarLoader');
	var cursor = document.getElementById('cursor');
	var cursorWidth = 0;
	var percentLoaded = 0;
	
	function onWindowResized(){
		var winW = Math.floor(Number(window.innerWidth));
		var winH = Math.floor(Number(window.innerHeight));
		document.documentElement.style.width = winW + 'px';
		document.documentElement.style.height = winH + 'px';
		document.body.style.width = winW + 'px';
		document.body.style.height = winH + 'px';
		
		var orientation = winW > winH ? 'landscape' : 'portrait';
		document.body.style.backgroundImage = 'url('+resLib.splash[orientation+'Loading'].src+')';
		
		
		var whRate = winW > winH?1.6:0.625;//16:10 or 10:16
		var ldw, ldh, ldLeft, ldTop;
		if(winW/winH>whRate){
			ldw = Math.floor(winH*whRate);
			ldh = winH;
			ldLeft = Math.floor((winW-ldw)/2);
			ldTop = 0;
		}else{
			ldw = winW;
			ldh = Math.floor(winW/whRate);
			ldLeft = 0;
			ldTop = Math.floor((winH-ldh)/2);
		}
		loadDiv.style.width = ldw+'px';
		loadDiv.style.height = ldh+'px';
		loadDiv.style.left = ldLeft+'px';
		loadDiv.style.top = ldTop+'px';

		var defaultW = winW > winH?960:600;
		var defaultH = winW > winH?600:960;
		
		loadingBar.style.top = Math.floor(ldh*0.75)+'px';
		loadingBar.style.height = Math.floor(ldh*resLib.splash.loadingBarBack.height/defaultH)+'px';
		loadingBarWidht = Math.floor(ldw*resLib.splash.loadingBarBack.width/defaultW);
		loadingBarFrontWidth = Math.floor(ldw*resLib.splash.loadingBarFront.width/defaultW); 
		loadingBar.style.width = loadingBarWidht+'px';
		loadingBar.style.left = Math.floor((ldw-loadingBarWidht)/2)+'px';
		progressBar.style.width = 0 +'px';
		progressBar.style.height = loadingBar.style.height;
		progressBarLoader.style.width = loadingBarWidht + "px";
		progressBarLoader.style.height = loadingBar.style.height;
		cursor.style.height = loadingBar.style.height;
		cursorWidth = Math.floor(Number(loadingBar.style.height.substring(0, loadingBar.style.height.length-2))*1.3);
		cursor.style.width = cursorWidth+'px';
		cursor.style.top = '-'+loadingBar.style.height;
	}
	
	function onMessage(e){
		var percentLoadedStr = e.data.loaded || null;
		if (percentLoadedStr !== null) {
			percentLoaded = Number(percentLoadedStr);
			progressBar.style.width = percentLoadedStr + '%';
			cursor.style.left = Math.floor(percentLoaded*loadingBarWidht/100-cursorWidth/2)+'px';
		}
	}
	
	function onLoadDone(){
		loadingBar.style.backgroundImage = 'url('+resLib.splash['loadingBarBack'].src+')';
		progressBarLoader.style.backgroundImage = 'url('+resLib.splash['loadingBarFront'].src+')';
		cursor.style.backgroundImage = 'url('+resLib.splash['pangxie'].src+')';
		window.addEventListener('resize', onWindowResized);
		onWindowResized();
		window.addEventListener('message', onMessage, false);
	}

	function init(){
		splashLoadController.load(onLoadDone);
	}
	init();
	return {};
});