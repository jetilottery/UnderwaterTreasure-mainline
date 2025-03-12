define([
		'skbJet/component/gameMsgBus/GameMsgBus',
		'skbJet/component/SKBeInstant/SKBeInstant',
		'skbJet/component/resourceLoader/ResourceLoader',
		'skbJet/componentCRDC/splash/splashLoadController',
		'skbJet/component/resourceLoader/subLoaders/HtmlTagSubLoader',
	    'skbJet/component/resourceLoader/subLoaders/TextFilesSubLoader',
        'skbJet/component/resourceSubLoaders/createjsSubLoader/CreatejsImageSoundSubLoader',
		'skbJet/component/resourceSubLoaders/createjsSubLoader/CreatejsSpriteSubLoader',
		'skbJet/component/gladPixiRenderer/gladPixiRenderer',
		'skbJet/component/resourceLoader/resourceLib',
		'com/createjs/easeljs'
	], function(msgBus, 
	SKBeInstant, 
	ResourceLoader, 
	splashLoadController, 
	HtmlTagSubLoader,
    TextFilesSubLoader,
	CreatejsImageSoundSubLoader,
	CreatejsSpriteSubLoader, 
	gr, 
	resLib,
	cjs
	){	
	cjs = window.createjs;
    'use strict';

	return function(){
		var gameFolder;
		var progress;
		function startLoadGameRes(){
			if(!SKBeInstant.isSKB()){ msgBus.publish('loadController.jLotteryEnvSplashLoadDone'); }
			ResourceLoader.initDefault(gameFolder+'assetPacks/'+SKBeInstant.config.assetPack, SKBeInstant.config.locale, SKBeInstant.config.siteId);
			loaderFile();
			msgBus.subscribe('resourceLoader.loadProgress', onResourceLoadProgress);
		}
			
		function onStartAssetLoading(){
			gameFolder = SKBeInstant.config.urlGameFolder;
			if(!SKBeInstant.isSKB()){
				var splashLoader = new ResourceLoader(gameFolder+'assetPacks/'+SKBeInstant.config.assetPack, SKBeInstant.config.locale, SKBeInstant.config.siteId);
				splashLoadController.loadByLoader(startLoadGameRes, splashLoader);
			}else{
				startLoadGameRes();
			}
		}
			
		function onAssetsLoadedAndGameReady(){
			var spriteSheets = {};
			var gce = SKBeInstant.getGameContainerElem();
			var main = require("game/main");
			var orientation = SKBeInstant.getGameOrientation();
			var imgUrl = SKBeInstant.config.urlGameFolder+'assetPacks/'+SKBeInstant.config.assetPack+'/images/' + orientation+'BG.jpg';
			//avoid blank background between two background switch.
			gce.style.backgroundImage = gce.style.backgroundImage+', url('+imgUrl+')';
			setTimeout(function(){
				gce.style.backgroundImage = 'url('+imgUrl+')';
			}, 100);
			gce.style.backgroundRepeat= 'no-repeat';
			gce.style.backgroundSize = 'cover';
			gce.innerHTML='';
			
			var gladData;
			if(orientation === "landscape"){
				gladData = window._gladLandscape;
			}else{
				gladData = window._gladPortrait;
			}
			for (var k in resLib.sprites) {
                spriteSheets[k] = new cjs.SpriteSheet(resLib.sprites[k]);
            }

			main.init(SKBeInstant.config, spriteSheets);
			msgBus.publish('jLotteryGame.assetsLoadedAndGameReady');
		}
		
		function onResourceLoadProgress(data){
			msgBus.publish('jLotteryGame.updateLoadingProgress', {items:(data.total), current:data.current});
			
			if(data.complete){
				if(!SKBeInstant.isSKB()){
					setTimeout(onAssetsLoadedAndGameReady,500);
				}else{
					onAssetsLoadedAndGameReady();			
				}
			}
		}

		function loaderFile() {
            var defaultLoader = ResourceLoader.getDefault();

            function onFileLoaded() {
                progress = defaultLoader.currentProgress();
				msgBus.publish("jLotteryGame.updateLoadingProgress", {
					items: progress.total,
					current: progress.current,
					complete: progress.complete
				});
                if (progress.complete) {
                    if (!SKBeInstant.isSKB()) {
                        setTimeout(onAssetsLoadedAndGameReady, 500);
                    } else {
                        onAssetsLoadedAndGameReady();
                    }
                }
            }

            function onLoadFailed() {
                progress = defaultLoader.currentProgress();
                msgBus.publish("toPlatform", {
                    channel: "Kernel",
                    topic: "LoadProgress",
                    data: {
                        id: "game",
                        items: progress.total,
                        current: progress.current,
                        complete: false,
                        fail: true
                    }
                });
            }

            defaultLoader.addSubLoader("images", new HtmlTagSubLoader({ type: "images", tagName: "img" }));
            defaultLoader.addSubLoader("sprites", new CreatejsSpriteSubLoader({ type: "sprites" }));
            defaultLoader.addSubLoader("sounds", new CreatejsImageSoundSubLoader({ type: "sounds" }));
            defaultLoader.addSubLoader("i18n", new TextFilesSubLoader({ type: "i18n", parseJson: true }));
            defaultLoader.addSubLoader(
                "layout",
                new HtmlTagSubLoader({
                    tagName: "script",
                    tagAttributes: { type: "text/javascript" },
                    fileExtFilterList: ["js"],
                    parentTag: document.getElementsByTagName("head")[0]
                })
            );

            defaultLoader.load(onFileLoaded, onLoadFailed);
        }
        
		msgBus.subscribe('jLottery.startAssetLoading', onStartAssetLoading);
	//msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	};	
});