/**
 * @module game/util/GladRenderer
 * @description Renderer GLAD layout and animations
 */
define([
	'com/createjs/easeljs', 
	'com/createjs/tweenjs',
	'game/util/KeyFrameAnimation',
	"skbJet/component/SKBeInstant/SKBeInstant"
	], function(cjs, tween, KeyFrameAnimation, SKBeInstant){
	cjs = window.createjs;
    /**
	 * @function constructure
	 * @description constructure function of GladRenderer.
	 * @param gladData {object} - glad data JSON object.
	 * @param spriteSheets {object} - sprite sheets JSON object
	 * @param stage {object} - create js stage object
	 * @returns new instance of GladRenerer.
	 * @instance
	 */
	return function(gladData, spriteSheets, stage){
		var instance = {};
        instance.animMap = {};
        
		function resizeToFitWindow(){
			var gw = gladData._width;
			var gh = gladData._height;
			var w = Number(stage.canvas.width);
			var h = Number(stage.canvas.height);		
			if(SKBeInstant.isSKB() || SKBeInstant.config.screenEnvironment === 'device'){
				w = Number(window.innerWidth);
				h = Number(window.innerHeight);
			}
			SKBeInstant.getGameContainerElem().style.width = w + 'px';
			SKBeInstant.getGameContainerElem().style.height = h + 'px';
			var gp = gh/gw;
			
			var rw,rh;			
			if(h/w>gp){
				rw = Math.round(w);
				rh = Math.round(w*gp);
				stage.canvas.style.marginTop = (h-rh)/2+'px';
				stage.canvas.style.marginLeft = '0px';
			}else{
				rh = Math.round(h);
				rw = Math.round(h/gp);
				stage.canvas.style.marginLeft = (w-rw)/2+'px';
				stage.canvas.style.marginTop = '0px';
			}
			stage.canvas.style.width = rw+'px';
			stage.canvas.style.height = rh+'px';
		}
        
		/**
		 * @function convertPixelRate
		 * @description Convert pixel rate. Pixel rate in "glad.js" is 2, but we need 1.
		 * @private
		 * @instance
		 */
		function convertPixelRate(){
			if(gladData._width){
				gladData._width = Number(gladData._width)*2;
			}
			if(gladData._height){
				gladData._height = Number(gladData._height)*2;
			}
			function convertSpritePixelRateRecursly(sprite){
				var sst = sprite._style;
				if(sst){
					if(sst._width){
						sst._width = Number(sst._width)*2;
					}
					if(sst._height){
						sst._height = Number(sst._height)*2;
					}
					if(sst._top){
						sst._top = Number(sst._top)*2;
					}
					if(sst._left){
						sst._left = Number(sst._left)*2;
					}
					if(sst._background&&sst._background._position){
						if(sst._background._position._x){
							sst._background._position._x = Number(sst._background._position._x)*2;
						}
						if(sst._background._position._y){
							sst._background._position._y = Number(sst._background._position._y)*2;
						}
					}
					if(sst._font&&sst._font._size){
						sst._font._size = Number(sst._font._size)*2;
					}
				}
				if(sprite._SPRITES){
					for(var i=0;i<sprite._SPRITES.length;i++){
						convertSpritePixelRateRecursly(sprite._SPRITES[i]);
					}
				}
			}
			for(var i=0;i<gladData._SCENES.length;i++){
				for(var j=0;j<gladData._SCENES[i]._LAYERS.length;j++){
					convertSpritePixelRateRecursly(gladData._SCENES[i]._LAYERS[j]);
				}
			}
		}
		
		/**
		 * @function removeUnderLinePrefix
		 * @description remove the underLine prefix if the input str have one.
		 * @param str {string} - string to deal with.
		 * @returns new string without underLine prefix
		 * @private
		 * @instance
		 */
		function removeUnderLinePrefix(str){
			if(str.match(/^_/)){
				return str.substring(1);
			}
			return str;
		}
		
		function findSpriteSheet(spriteName){
			for(var key in spriteSheets){
				if(spriteSheets[key]._animations.indexOf(spriteName)>=0){
					return spriteSheets[key];
				}
			}
			var postfixMatch = spriteName.match(/(.*)(_\d+)$/);
			if(postfixMatch){
				var nameWithoutPostfix = postfixMatch[1];
				for(var key in spriteSheets){
					if(spriteSheets[key]._animations.indexOf(nameWithoutPostfix)>=0){
						return spriteSheets[key];
					}
				}
			}
			throw 'Cannot find sprite sheet for \"'+spriteName+'\"';
		}
		
		/**
		 * @function updateSpriteStyle
		 * @description update sprite style
		 * @param sp {object} - cjs container which conatins the sprite
		 * @param sst {object} - sprite style gladData 
		 * @private
		 * @instance
		 */
		function updateSpriteStyle(sp, sst){
			if(sst){
				if(sst._background){
					if(sst._background._color){
                        
						var graphics = new cjs.Graphics().beginFill('#'+sst._background._color).drawRect(0, 0, Number(sst._width), Number(sst._height));
						var bc = new cjs.Shape(graphics);
						sp.addChild(bc);
						sp.$backgroundColor = bc;
					}
					if(sst._background._imagePlate){
						var imagePlate = removeUnderLinePrefix(sst._background._imagePlate);
						var bgImg = new cjs.Sprite(findSpriteSheet(imagePlate));
						var frameIndex = imagePlate.match(/(.*)_(\d+)$/);
						if(frameIndex){
							imagePlate = frameIndex[1];
							frameIndex = Number(frameIndex[2])-1;
						}
						bgImg.gotoAndStop(imagePlate);
						if(frameIndex){
							bgImg._normalizeFrame(frameIndex);
						}
						sp.addChild(bgImg);
						sp.$backgroundImage = bgImg;
					}
				}
				if(sst._text){
					var sText = new cjs.Text("");
					/*if(sst._text._token){
						sText.text = sst._text._token;
						console.log("==="+sst._text._token);
					}*/
					if(sst._text._align){
						sText.textAlign = sst._text._align;
					}
					if(sst._text._color){
						sText.color = '#'+sst._text._color;
					}
					if(sst._font){
						var font = '';
						if(sst._font._weight){
							font += ' '+sst._font._weight;
						}
						if(sst._font._size){
							font += ' '+sst._font._size+'px';
						}
						if(sst._font._family){
							font += ' '+sst._font._family;
						}else{
							font += ' Arial';
						}
						font = font.length>0?font.substring(1):'';
						if(font){
							sText.font = font;
						}
					}
					if(sst._width){
						sText.lineWidth = Number(sst._width);
                        if(sText.textAlign === 'center'){
							sText.setTransform(sText.lineWidth/2, 0);
						}
					}
					sp.addChild(sText);
					sp.$text = sText;
				}
				if(sst._transform&&sst._transform._scale){
					if(sst._transform._scale._x){
						sp.scaleX = Number(sst._transform._scale._x);
					}
					if(sst._transform._scale._y){
						sp.scaleY = Number(sst._transform._scale._y);
					}
				}
				if(sst._transform&&sst._transform._rotate){
					sp.rotation = Number(sst._transform._rotate);
				}
				if(sst._transform&&sst._transform._skew){
					if(sst._transform._skew._x){
						sp.skewX = Number(sst._transform._skew._x);
					}
					if(sst._transform._skew._y){
						sp.skewY = Number(sst._transform._skew._y);
					}
				}
				sp.regX = Number(sst._width)/2;
				sp.regY = Number(sst._height)/2;
				if(Number(sst._left)){
                   sp.x = Number(sst._left) + sp.regX;  
               } else{
                   sp.x = sp.regX;
               }                      
			    if(Number(sst._top)){
                    sp.y = Number(sst._top) + sp.regY;
                } else{
                    sp.y = sp.regY;
                }
				if(sst._opacity){
					sp.alpha = Number(sst._opacity);
				}
			}
		}
		
		/**
		 * @function createSprites
		 * @description create sprite or layer
		 * @param spriteData {object} - glad data JSON object for the sprite or layer.
		 * @param parentObj {object} - cjs container which conatins the sprite or layer.
		 * @private
		 * @instance
		 */
		function createSprites(spriteData, parentObj){
			var sprite = new cjs.Container();
			sprite.name = spriteData._name;
			updateSpriteStyle(sprite, spriteData._style);
			parentObj.addChild(sprite);
			instance[spriteData._name] = sprite;
			
			if(spriteData._SPRITES){
				for(var i=0;i<spriteData._SPRITES.length;i++){
					createSprites(spriteData._SPRITES[i], sprite);
				}
			}
		}
        
		/**
		 * @function initLayoutAndAnimations
		 * @description init layout and animations.
		 * @private
		 * @instance
		 */
		function initLayoutAndAnimations(){
			for(var i=0;i<gladData._SCENES.length;i++){
				var scene = new cjs.Container();
				instance[gladData._SCENES[i]._name] = scene;
				scene.visible = false;
				if(gladData._SCENES[i]._background&&gladData._SCENES[i]._background._imagePlate){
					scene.$background = removeUnderLinePrefix(gladData._SCENES[i]._background._imagePlate);
				}
				stage.addChild(scene);
				if(!gladData._SCENES[i]._LAYERS){
					continue;
				}
				for(var j=0;j<gladData._SCENES[i]._LAYERS.length;j++){
					createSprites(gladData._SCENES[i]._LAYERS[j], scene);
				}
                
                for (var j = 0; j < gladData._SCENES[i]._ANIMATIONS.length; j++) {
                    var animData = gladData._SCENES[i]._ANIMATIONS[j];
                    if (animData._type === '_KEY_FRAME_ANIMATION') {//We may need to support other animation type in future.
                        /*var anim = */new KeyFrameAnimation(gladData._SCENES[i]._ANIMATIONS[j],instance);
                    }
                }
			}
            
            cjs.Ticker.addEventListener("tick", function(){
                 for (var k in instance.animMap) {
                    instance.animMap[k].updateStyleIfPlaying(cjs.Ticker.interval);
                }
				stage.update();
            });
		}
        
		convertPixelRate();
		stage.canvas.width = gladData._width;
		stage.canvas.height = gladData._height;
		resizeToFitWindow();
		window.addEventListener('resize', resizeToFitWindow);
		initLayoutAndAnimations();

		return instance;
	};
});