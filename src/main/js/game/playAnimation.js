define(
    [
        "skbJet/component/gameMsgBus/GameMsgBus",
        "game/audio",
        "com/createjs/easeljs",
        "com/createjs/tweenjs",
        "skbJet/component/resourceLoader/resourceLib",
        "skbJet/component/SKBeInstant/SKBeInstant",
        "game/gladButton",
        "game/gameUtil"
    ],
    function(msgBus, audio, cjs, tweenjs, resLib, SKBeInstant, gladButton, gameUtil) {
        "use strict";
        cjs = window.createjs;
        return function(gr, stage, jLottery) {
            var canvas = stage.canvas;
            var moveStep = 3;
            var rotationAngle = 20;
            var orientation = SKBeInstant.getGameOrientation();
            // critical value
            var landscape = orientation === "landscape" ? true : false;
            var maxSpace = canvas.width - gr["_ship"].getBounds().width / 2;
            var minSpace = landscape ? gr["_BGIsland"].regX + gr["_BGIsland"].x + gr["_ship"].getBounds().width / 2 : gr["_ship"].getBounds().width / 2;
            var mousedownX, pressupX;
            var shipListenerLeft, shipListenerRight;
            var shipScene = false;
            var bonusScene = false;
            var existingDigital = [];
            var chipPosition = [];
            var winPayTable = [];
            var result;
            var resultData;
            var randomAnimal;
            var currentPositionX;
            var autoMoveInterval;
            var generalInterval;
            var seaGullInterval;
            var handClickInterval;
            // for every treasure position
            var onseaTreasure;
            var bonusTreasure;
            var bonusTreasurePosition;
            var treasurePosition;
            var vomitBubbleInterval = null;
            var shipRandomPosition = new Array(7);
            var treasurePositionArray = [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
            var playButton, playMTMButton;

            function generateTheMedian(max, min) {
                var middleRandom = Math.floor(Math.random() * (max - min) + min);
                return middleRandom;
            }
            var positionBubbleX = generateTheMedian(maxSpace, minSpace - gr["_ship"].regX);
            // The animals of bubbles can be released
            var bubbleAnimals = [gr["_octopus"], gr["_seahorse"]];
            var shipclimpY = gr["_shipclamp"].y;
            var onseaChange = [gr["_onSeaScreen"], gr["_buttonReveal"], gr["_wheel"], gr["_Paytable"]];
            var enlargeTreasureTime = 500;
            var treasureTime = 500;
            var treasureToPaytable = 500;
            var treasureDisplay = 200;
            var everyTreasureTime = 1800;
            var runningSide = null;

            function factorialLeft(obj) {
                if (!obj.parent) {
                    return obj.x - obj.regX;
                } else {
                    return obj.x - obj.regX + factorialLeft(obj.parent);
                }
            }

            function factorialTop(obj) {
                if (!obj.parent) {
                    return obj.y - obj.regY;
                } else {
                    return obj.y - obj.regY + factorialTop(obj.parent);
                }
            }

            var minHotSportsY = factorialTop(gr["_BGSea"]);
            var maxHotSportsY = factorialTop(gr["_buttonPlay"]);
            var minHotSportsX = factorialLeft(gr["_wheel"]);
            var middleHotSportsX = factorialLeft(gr["_wheel"]) + gr["_wheel"].getBounds().width / 2;
            var maxHotSportsX = factorialLeft(gr["_wheel"]) + gr["_wheel"].getBounds().width;

            var winResult = 0;
            var winMap = {};

            function initGame() {
                playButton = new gladButton(gr._buttonPlay, "buttonCommon", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                playMTMButton = new gladButton(gr._buttonPlayMTM, "buttonCommon", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                gr["_planktext"].$text.text = resLib.i18n.game.select_treasure;
                gr["_textPlay"].$text.text = resLib.i18n.game.button_play;
                gr["_textPaly"].$text.text = resLib.i18n.game.button_play;
                gr._textPaly.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
                gr._textPlay.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
                if (SKBeInstant.config.locale === "en_us") {
                    gr["_planktext"].$text.font = "600 30px Impact";
                }
                onseaTreasure = [gr["_crownSymbol"], gr["_diamondSymbol"], gr["_bigGemSymbol"], gr["_pearlSymbol"], gr["_gemSymbol"], gr["_goldCoinSymbol"]];
                bonusTreasure = [
                    gr["_minitable_crown_symbol"],
                    gr["_minitable_diamond_symbol"],
                    gr["_minitable_bigGem_symbol"],
                    gr["_minitable_pearl_symbol"],
                    gr["_minitable_gem_symbol"],
                    gr["_minitable_goldCoin_symbol"]
                ];
                getChipPosition();
                for (var i = 0; i < 6; i++) {
                    onseaTreasure[i] = onseaTreasure[i].localToGlobal(onseaTreasure[i].x, onseaTreasure[i].y);
                    bonusTreasure[i] = bonusTreasure[i].localToGlobal(bonusTreasure[i].x, bonusTreasure[i].y);
                }
                treasurePosition = [{
                        x: onseaTreasure[0].x,
                        y: onseaTreasure[0].y
                    },
                    {
                        x: onseaTreasure[1].x,
                        y: onseaTreasure[1].y
                    },
                    {
                        x: onseaTreasure[2].x,
                        y: onseaTreasure[2].y
                    },
                    {
                        x: onseaTreasure[3].x,
                        y: onseaTreasure[3].y
                    },
                    {
                        x: onseaTreasure[4].x,
                        y: onseaTreasure[4].y
                    },
                    {
                        x: onseaTreasure[5].x,
                        y: onseaTreasure[5].y
                    },
                    {
                        x: factorialLeft(gr["_WinsValue"]) + gr["_WinsValue"].regX,
                        y: factorialTop(gr["_WinsValue"]) + gr["_WinsValue"].regY
                    }
                ];
                bonusTreasurePosition = [{
                        x: bonusTreasure[0].x,
                        y: bonusTreasure[0].y
                    },
                    {
                        x: bonusTreasure[1].x,
                        y: bonusTreasure[1].y
                    },
                    {
                        x: bonusTreasure[2].x,
                        y: bonusTreasure[2].y
                    },
                    {
                        x: bonusTreasure[3].x,
                        y: bonusTreasure[3].y
                    },
                    {
                        x: bonusTreasure[4].x,
                        y: bonusTreasure[4].y
                    },
                    {
                        x: bonusTreasure[5].x,
                        y: bonusTreasure[5].y
                    },
                    {
                        x: factorialLeft(gr["_WinsValue"]) + gr["_WinsValue"].regX,
                        y: factorialTop(gr["_WinsValue"]) + gr["_WinsValue"].regY
                    }
                ];
            }

            function getChipPosition() {
                for (var i = 0; i < 14; i++) {
                    var chip = {};
                    i = i >= 10 ? i : "0" + i;
                    if (landscape) {
                        chip.x = gr["_chip" + i].x - (gr["_chip" + i].getBounds().width - gr._shipclamp.getBounds().width) / 2;
                        chip.y = gr._shipclamp.y - (gr._chip10.y - gr["_chip" + i].y + gr["_chip" + i].getBounds().height / 2);
                    } else {
                        chip.x = gr["_chip" + i].x + 10;
                        chip.y = gr._shipclamp.y - (gr._chip10.y - gr["_chip" + i].y + gr["_chip" + i].getBounds().height / 2) + 20;
                    }
                    chipPosition[i] = chip;
                }
            }

            function resetAll() {
                gr["_underSeaScreen"].visible = false;
                gr["_bonusScreen"].visible = false;
                gr["_seagull"].visible = false;
                gr["_sgoldCoin"].visible = false;
                gr["_sbigGem"].visible = false;

                gr["_scrown"].visible = false;
                gr["_sdiamond"].visible = false;
                gr["_sgem"].visible = false;
                gr["_spearl"].visible = false;
                gr["_buttonPlay"].visible = false;
                gr["_buttonPlayMTM"].visible = false;
                gr["_buttonPlay"].alpha = 1;
                gr["_buttonPlayMTM"].alpha = 1;
                gr["_ship"].$backgroundImage.gotoAndStop("ship");
                gr["_bubble"].$backgroundImage.gotoAndStop("bubble");
                playButton.onClick = null;
                playMTMButton.onClick = null;
                gr["_ship"].count = 0;
                shipScene = false;
                bonusScene = false;
                existingDigital = [];
                winPayTable = [0, 0, 0, 0, 0, 0];
                reSetRandomArray();
                clickArrowHandInterval();
                stage.removeAllEventListeners();

                winResult = 0;
                winMap = {};
                //init clamp visible
                for (var i = 0; i < 7; i++) {
                    gr["_clamp_0" + i].alpha = 1;
                }
                for (var i = 0; i < 6; i++) {
                    gr["_smallCrown_0" + i].alpha = 1;
                    gr["_smallDiamond_0" + i].alpha = 1;
                    gr["_smallCrown_0" + i].visible = false;
                    gr["_smallDiamond_0" + i].visible = false;
                    cjs.Tween.removeTweens(gr["_smallCrown_0" + i]);
                    cjs.Tween.removeTweens(gr["_smallDiamond_0" + i]);
                }
                for (var i = 0; i < 5; i++) {
                    gr["_smallBigGem_0" + i].alpha = 1;
                    gr["_smallPearl_0" + i].alpha = 1;
                    gr["_smallBigGem_0" + i].visible = false;
                    gr["_smallPearl_0" + i].visible = false;
                    cjs.Tween.removeTweens(gr["_smallBigGem_0" + i]);
                    cjs.Tween.removeTweens(gr["_smallPearl_0" + i]);
                }
                for (var i = 0; i < 4; i++) {
                    gr["_smallGem_0" + i].alpha = 1;
                    gr["_smallGoldCoin_0" + i].alpha = 1;
                    gr["_smallGem_0" + i].visible = false;
                    gr["_smallGoldCoin_0" + i].visible = false;
                    cjs.Tween.removeTweens(gr["_smallGem_0" + i]);
                    cjs.Tween.removeTweens(gr["_smallGoldCoin_0" + i]);
                }
                for (var i = 0; i < 14; i++) {
                    i = i >= 10 ? i : "0" + i;
                    gr["_shipSign_" + i].visible = false;
                    gr["_chip" + i].visible = false;
                }
                gr["_shipRedSign_00"].visible = false;
                gr["_shipRedSign_01"].visible = false;
            }

            function arrowHandInterval() {
                if (handClickInterval) {
                    clearTimeout(handClickInterval);
                }
                handClickInterval = setTimeout(function() {
                    gr.animMap["_ship_move1"].play();
                    gr.animMap["_ship_move2"].play();
                    gr.animMap["_ship_move1"]._onComplete = function() {
                        this.play();
                    };
                    gr.animMap["_ship_move2"]._onComplete = function() {
                        this.play();
                    };
                }, 5000);
            }

            function clickArrowHandInterval() {
                clearTimeout(handClickInterval);
                gr.animMap["_ship_move1"].stop();
                gr["_ship_leftMove"].alpha = 1;
                gr.animMap["_ship_move2"].stop();
                gr["_ship_RightMove"].alpha = 1;
            }

            // the ship location of the automatic
            function reSetRandomArray() {
                for (var i = 0; i < 7; i++) {
                    var shipPositionX = generateTheMedian(maxSpace, minSpace);
                    shipRandomPosition[i] = shipPositionX;
                }
            }
            //set up random bird fly-bys
            function seaGullLoop() {
                var timeEnd = generateTheMedian(60000, 10000);
                gr["_seagull"].$backgroundImage.gotoAndPlay("seagull");
                seaGullInterval = setTimeout(seaGullLoop, timeEnd);
            }

            // shipMove function
            function shipMove(speed) {
                gr["_ship"].x += speed;
                // lowest critical value
                if (gr["_ship"].x <= minSpace) {
                    gr["_ship"].x = minSpace;
                    cjs.Tween.get(gr["_ship"], { loop: false }, true).pause(null);
                    return;
                } else if (gr["_ship"].x >= maxSpace) {
                    gr["_ship"].x = maxSpace;
                    cjs.Tween.get(gr["_ship"], { loop: false }, true).pause(null);
                    return;
                }
                cjs.Tween.get(gr["_ship"], { loop: false }, true).to({ x: gr["_ship"].x });
            }

            // rudder rotation function
            function rudderMove(speed) {
                gr["_wheel"].rotation += speed;
                cjs.Tween.get(gr["_wheel"], { loop: false }, true).to({ rotation: gr["_wheel"].rotation % 360 });
            }
            // Check the result
            function checkAllRevealed() {
                var isAllRevealed = true;
                if (gr["_ship"].count !== 6) {
                    isAllRevealed = false;
                } else {
                    msgBus.publish("allUnderwaterTreasureRevealed");
                }
                return isAllRevealed;
            }

            // autoPlay
            function autoPlay(autoReveal) {
                if (gr["_ship"].autoPlay) {
                    var directionMove;
                    var directionRotation;
                    clickArrowHandInterval();
                    audio.play("WheelLoop", -1);
                    gr["_ship"].currentPlaying = true;
                    currentPositionX = shipRandomPosition[gr["_ship"].count];
                    directionMove = gr["_ship"].x < currentPositionX ? moveStep : -moveStep;
                    directionRotation = gr["_ship"].x < currentPositionX ? rotationAngle : -rotationAngle;
                    autoMoveInterval = setInterval(function() {
                        if (directionMove > 0) {
                            if (gr["_ship"].x >= currentPositionX) {
                                audio.stop("WheelLoop");
                                gr["_ship"].x = currentPositionX;
                                clearInterval(autoMoveInterval);
                                setTimeout(function() {
                                    autoReveal();
                                }, 500);
                                return;
                            }
                        } else {
                            if (gr["_ship"].x <= currentPositionX) {
                                audio.stop("WheelLoop");
                                gr["_ship"].x = currentPositionX;
                                clearInterval(autoMoveInterval);
                                setTimeout(function() {
                                    autoReveal();
                                }, 500);
                                return;
                            }
                        }
                        shipMove(directionMove);
                        rudderMove(directionRotation);
                    }, 50);
                }
            }
            // Vomit a bubble
            function autoBubbling() {
                positionBubbleX = landscape ? generateTheMedian(maxSpace, minSpace - gr["_ship"].regX) : generateTheMedian(maxSpace, 0);
                // random bubble position of vomit
                gr["_bubble"].x = positionBubbleX;
                gr["_bubble"].$backgroundImage.gotoAndPlay("bubble");
            }
            //  get The location of the ship
            function getClampPosition(ship) {
                var flipper = 0;
                var currentNumber;
                var averageLength = landscape ? (maxSpace - minSpace) / 7 : maxSpace / 7;
                if (ship.x < minSpace + averageLength && ship.x >= minSpace) {
                    currentNumber = generateTheMedian(14, 12);
                } else if (ship.x < minSpace + averageLength * 2 && ship.x >= minSpace + averageLength) {
                    currentNumber = generateTheMedian(12, 10);
                } else if (ship.x < minSpace + averageLength * 3 && ship.x >= minSpace + averageLength * 2) {
                    currentNumber = generateTheMedian(10, 8);
                } else if (ship.x < minSpace + averageLength * 4 && ship.x >= minSpace + averageLength * 3) {
                    currentNumber = generateTheMedian(8, 6);
                } else if (ship.x < minSpace + averageLength * 5 && ship.x >= minSpace + averageLength * 4) {
                    currentNumber = generateTheMedian(6, 4);
                } else if (ship.x < minSpace + averageLength * 6 && ship.x >= minSpace + averageLength * 5) {
                    currentNumber = generateTheMedian(4, 2);
                } else {
                    currentNumber = generateTheMedian(2, 0);
                }
                while (treasurePositionArray[currentNumber] === undefined || existingDigital.indexOf(currentNumber) >= 0) {
                    currentNumber += ++flipper * (flipper % 2 ? -1 : 1);
                }
                existingDigital.push(currentNumber);
                return currentNumber;
            }
            /*function setSpecificParameters() {
            var specificParam = window.game.UnderwaterTreasure.resources.config.config || false;
			if(specificParam){
				if(!isNaN(specificParam.enlargeTreasureTime)){
					if(specificParam.enlargeTreasureTime < 0){
						enlargeTreasureTime = 500;
					}else{
						enlargeTreasureTime = Number(specificParam.enlargeTreasureTime);	
					}
				}	
				if(!isNaN(specificParam.treasureTime)){
					if(specificParam.treasureTime < 0){
						treasureTime = 500;
					}else{
						treasureTime = Number(specificParam.treasureTime);	
					}
				}
				if(!isNaN(specificParam.treasureToPaytable)){
					if(specificParam.treasureToPaytable < 0){
						treasureToPaytable = 500;
					}else{
						treasureToPaytable = Number(specificParam.treasureToPaytable);	
					}
				}
				if(!isNaN(specificParam.treasureDisplay)){
					if(specificParam.treasureToPaytable < 0){
						treasureDisplay = 200;
					}else{
						treasureDisplay = Number(specificParam.treasureDisplay);	
					}
				}
				if(!isNaN(specificParam.everyTreasureTime)){
					if(specificParam.everyTreasureTime < 0){
						everyTreasureTime = enlargeTreasureTime + treasureTime + treasureToPaytable + treasureDisplay;
					}else{	
						everyTreasureTime = Number(specificParam.everyTreasureTime);
					}
				}
				
			}
		}*/
            // ship's eventListener
            function initShipListener() {
                stage.on("stagemousedown", function() {
                    if (stage.mouseY >= minHotSportsY && stage.mouseY <= maxHotSportsY) {
                        clickArrowHandInterval();
                        mousedownX = gr["_ship"].x;
                        if (stage.mouseX >= middleHotSportsX && stage.mouseX <= maxHotSportsX) {
                            if (runningSide) {
                                return;
                            }
                            runningSide = "R";

                            if (gr["_ship"].x >= maxSpace) {
                                audio.stop("WheelLoop");
                            } else {
                                audio.play("WheelLoop", -1);
                            }
                            shipListenerRight = setInterval(function() {
                                if (gr["_ship"].x >= maxSpace) {
                                    audio.stop("WheelLoop");
                                    clearInterval(shipListenerRight);
                                    return;
                                }
                                rudderMove(rotationAngle);
                                shipMove(moveStep);
                            }, 50);
                        } else if (stage.mouseX >= minHotSportsX && stage.mouseX < middleHotSportsX) {
                            if (runningSide) {
                                return;
                            }
                            runningSide = "L";

                            if (gr["_ship"].x <= minSpace) {
                                audio.stop("WheelLoop");
                            } else {
                                audio.play("WheelLoop", -1);
                            }
                            shipListenerLeft = setInterval(function() {
                                if (gr["_ship"].x <= minSpace) {
                                    audio.stop("WheelLoop");
                                    clearInterval(shipListenerLeft);
                                    return;
                                }
                                rudderMove(-rotationAngle);
                                shipMove(-moveStep);
                            }, 50);
                        }
                    }
                });

                stage.on("stagemouseup", function() {
                    audio.stop("WheelLoop");
                    arrowHandInterval();
                    pressupX = gr["_ship"].x;
                    clearInterval(shipListenerRight);
                    clearInterval(shipListenerLeft);
                    if (stage.mouseX >= middleHotSportsX && stage.mouseX <= maxHotSportsX) {
                        runningSide = null;
                        if (runningSide === "L") {
                            return;
                        }
                        if (mousedownX === pressupX) {
                            shipMove(moveStep);
                            if (gr["_ship"].x >= maxSpace) {
                                cjs.Tween.get(gr["ship"], { loop: false }, true).pause(null);
                                return;
                            }
                            rudderMove(rotationAngle);
                        }
                    } else if (stage.mouseX >= minHotSportsX && stage.mouseX < middleHotSportsX) {
                        runningSide = null;
                        if (runningSide === "R") {
                            return;
                        }
                        if (mousedownX === pressupX) {
                            shipMove(-moveStep);
                            if (gr["_ship"].x <= minSpace) {
                                cjs.Tween.get(gr["_ship"], { loop: false }, true).pause(null);
                                return;
                            }
                            rudderMove(-rotationAngle);
                        }
                    }
                });
            }

            function updateWinValue() {
                var result = 0;
                for (var symbol in winMap) {
                    result += Number(winMap[symbol]);
                }
                gr["_WinsValue"].$text.text = jLottery.formatCurrency(result).formattedAmount;
                gameUtil.fixMeter(gr);
            }

            // the animation of every treasure
            function moveTreasure(object, treasurePosition, clickBox, smallTreasure, winPayTable) {
                var currentTreasure = object;
                var flashingAlpha;
                var findFlashing = [gr._smallCrown_00, gr._smallDiamond_00, gr._smallBigGem_00, gr._smallPearl_00, gr._smallGem_00, gr._smallGoldCoin_00];
                currentTreasure.visible = true;
                currentTreasure.alpha = 1;

                function flashingTreasure(winPayTable, length, index) {
                    winPayTable = length;
                    winMap[index] = resultData.prizeTable[index].prize;
                    if (gr["_WinsValue"].$text.text.slice(1) === "--") {
                        gr["_WinsValue"].$text.text = jLottery.formatCurrency(resultData.prizeTable[index].prize).formattedAmount;
                        gameUtil.fixMeter(gr);
                    } else {
                        updateWinValue();
                    }
                    var hasTween;
                    for (var i = 0; i < findFlashing.length; i++) {
                        hasTween = cjs.Tween.hasActiveTweens(findFlashing[i]);
                        if (hasTween) {
                            flashingAlpha = findFlashing[i].alpha;
                            break;
                        }
                    }
                    if (flashingAlpha !== undefined) {
                        for (var i = 0; i < length; i++) {
                            cjs.Tween
                                .get(gr[smallTreasure + i], { loop: false }, true)
                                .set({ alpha: flashingAlpha })
                                .to({ alpha: 0.4 }, (flashingAlpha - 0.4) * 1000)
                                .set({ alpha: 1 })
                                .call(function() {
                                    cjs.Tween.get(this, { loop: true }, true).to({ alpha: 0.4 }, 600);
                                });
                        }
                    } else {
                        for (var i = 0; i < length; i++) {
                            cjs.Tween.get(gr[smallTreasure + i], { loop: true }, true).to({ alpha: 0.4 }, 600);
                        }
                    }
                }
                var setTreasureX, setTreasureY;
                if (clickBox !== undefined) {
                    var box = clickBox[0].name;
                    setTreasureX = factorialLeft(gr[box]) + gr[box].regX;
                    var setTreasureY = factorialTop(gr[box]) + gr[box].regY;
                } else {
                    setTreasureX = factorialLeft(gr["_ship"]) + gr["_ship"].regX - 85;
                    setTreasureY = landscape ? factorialTop(gr["_BGSea"]) + gr["_BGSea"].regY - 160 : factorialTop(gr["_BGSea"]) + gr["_BGSea"].regY - 200;
                }
                currentTreasure.set({
                    x: setTreasureX,
                    y: setTreasureY,
                    scaleX: 0.1,
                    scaleY: 0.1
                });
                if (currentTreasure !== gr["_bigjintiao"]) {
                    cjs.Tween
                        .get(currentTreasure, { loop: false }, true)
                        .to({
                                x: canvas.width / 2,
                                y: canvas.height / 2,
                                scaleX: 1,
                                scaleY: 1
                            },
                            enlargeTreasureTime
                        )
                        .wait(treasureTime)
                        .to({
                                x: treasurePosition.x,
                                y: treasurePosition.y,
                                scaleX: 0.4,
                                scaleY: 0.4
                            },
                            treasureToPaytable
                        )
                        .to({
                                alpha: 0,
                                visible: false
                            },
                            treasureDisplay
                        )
                        .call(function() {
                            if (smallTreasure && winPayTable) {
                                audio.play("ItemThud", 0);
                                switch (currentTreasure) {
                                    case gr["_scrown"]:
                                        gr[smallTreasure + winPayTable[0]].visible = true;
                                        winPayTable[0]++;
                                        if (winPayTable[0] === 6) {
                                            flashingTreasure(winPayTable[0], 6, 0);
                                            audio.play("PrizeBoxReveal", 0);
                                        }
                                        gr["_crowntext"].$text.text = winPayTable[0] + "/" + 6;
                                        break;
                                    case gr["_sdiamond"]:
                                        gr[smallTreasure + winPayTable[1]].visible = true;
                                        winPayTable[1]++;
                                        if (winPayTable[1] === 6) {
                                            flashingTreasure(winPayTable[1], 6, 1);
                                            audio.play("PrizeBoxReveal", 0);
                                        }
                                        gr["_diamondtext"].$text.text = winPayTable[1] + "/" + 6;
                                        break;
                                    case gr["_sbigGem"]:
                                        gr[smallTreasure + winPayTable[2]].visible = true;
                                        winPayTable[2]++;
                                        if (winPayTable[2] === 5) {
                                            flashingTreasure(winPayTable[2], 5, 2);
                                            audio.play("PrizeBoxReveal", 0);
                                        }
                                        gr["_bigGemtext"].$text.text = winPayTable[2] + "/" + 5;
                                        break;
                                    case gr["_spearl"]:
                                        gr[smallTreasure + winPayTable[3]].visible = true;
                                        winPayTable[3]++;
                                        if (winPayTable[3] === 5) {
                                            flashingTreasure(winPayTable[3], 5, 3);
                                            audio.play("PrizeBoxReveal", 0);
                                        }
                                        gr["_pearltext"].$text.text = winPayTable[3] + "/" + 5;
                                        break;
                                    case gr["_sgem"]:
                                        gr[smallTreasure + winPayTable[4]].visible = true;
                                        winPayTable[4]++;
                                        if (winPayTable[4] === 4) {
                                            flashingTreasure(winPayTable[4], 4, 4);
                                            audio.play("PrizeBoxReveal", 0);
                                        }
                                        gr["_gemtext"].$text.text = winPayTable[4] + "/" + 4;
                                        break;
                                    case gr["_sgoldCoin"]:
                                        gr[smallTreasure + winPayTable[5]].visible = true;
                                        winPayTable[5]++;
                                        if (winPayTable[5] === 4) {
                                            flashingTreasure(winPayTable[5], 4, 5);
                                            audio.play("PrizeBoxReveal", 0);
                                        }
                                        gr["_goldCointext"].$text.text = winPayTable[5] + "/" + 4;
                                        break;
                                }
                            }
                        });
                    audio.play("Reveal0", 0);
                } else {
                    cjs.Tween
                        .get(currentTreasure, { loop: false }, true)
                        .to({
                                x: canvas.width / 2,
                                y: canvas.height / 2,
                                scaleX: 1,
                                scaleY: 1
                            },
                            enlargeTreasureTime
                        )
                        .wait(treasureTime)
                        .to({
                                alpha: 0,
                                visible: false
                            },
                            treasureDisplay
                        )
                        .call(function() {
                            if (gr["_WinsValue"].$text.text.slice(1) === "--") {
                                gr["_WinsValue"].$text.text = gr["_bigjintiao_text"].$text.text;
                                gameUtil.fixMeter(gr);
                            } else {
                                updateWinValue();
                            }
                        });
                    audio.play("PrizeBoxReveal", 0);
                }
            }

            function treasureAnimation(onceRevealMember, clickBox) {
                var spliceMember = onceRevealMember.splice(0, 1);
                var currentTreasurePosition;
                if (!shipScene) {
                    currentTreasurePosition = treasurePosition;
                } else {
                    currentTreasurePosition = bonusTreasurePosition;
                }
                switch (spliceMember[0]) {
                    case "A":
                        moveTreasure(gr["_scrown"], currentTreasurePosition[0], clickBox, "_smallCrown_0", winPayTable);
                        break;
                    case "B":
                        moveTreasure(gr["_sdiamond"], currentTreasurePosition[1], clickBox, "_smallDiamond_0", winPayTable);
                        break;
                    case "C":
                        moveTreasure(gr["_sbigGem"], currentTreasurePosition[2], clickBox, "_smallBigGem_0", winPayTable);
                        break;
                    case "D":
                        moveTreasure(gr["_spearl"], currentTreasurePosition[3], clickBox, "_smallPearl_0", winPayTable);
                        break;
                    case "E":
                        moveTreasure(gr["_sgem"], currentTreasurePosition[4], clickBox, "_smallGem_0", winPayTable);
                        break;
                    case "F":
                        moveTreasure(gr["_sgoldCoin"], currentTreasurePosition[5], clickBox, "_smallGoldCoin_0", winPayTable);
                        break;
                    case "1":
                        winMap["bigjintiao_text1"] = resultData.prizeTable[6].prize;
                        gr["_bigjintiao_text"].$text.text = jLottery.formatCurrency(winMap["bigjintiao_text1"]).formattedAmount;
                        moveTreasure(gr["_bigjintiao"], currentTreasurePosition[6], clickBox);
                        break;
                    case "2":
                        winMap["bigjintiao_text2"] = resultData.prizeTable[7].prize;
                        gr["_bigjintiao_text"].$text.text = jLottery.formatCurrency(winMap["bigjintiao_text2"]).formattedAmount;
                        moveTreasure(gr["_bigjintiao"], currentTreasurePosition[6], clickBox);
                        break;
                }
                if (onceRevealMember.length !== 0) {
                    setTimeout(function() {
                        treasureAnimation(onceRevealMember, clickBox);
                    }, everyTreasureTime);
                } else {
                    if (!shipScene && !bonusScene) {
                        setTimeout(function() {
                            gr["_ship"].$backgroundImage.gotoAndStop("ship");
                            gr["_ship"].currentPlaying = false;
                            if (gr["_ship"].count === 6) {
                                checkAllRevealed();
                                audio.play("WinLine", 0);
                                //gr["_buttonHelp"].visible = true;
                                return;
                            }
                            oncePlayBehavior();
                        }, everyTreasureTime);
                    }
                    if (shipScene && !bonusScene) {
                        setTimeout(function() {
                            sceneChange();
                            gr["_ship"].$backgroundImage.gotoAndStop("ship");
                            if (gr["_ship"].count === 6) {
                                checkAllRevealed();
                                audio.play("WinLine", 0);
                                //gr["_buttonHelp"].visible = true;
                                return;
                            }
                            setTimeout(function() {
                                oncePlayBehavior();
                            }, 1000);
                        }, 3900);
                    }
                }
            }

            function oncePlayBehavior() {
                gr["_ship"].count++;
                gr["_ship"].currentPlaying = false;
                if (gr["_ship"].autoPlay) {
                    gr["_ship"].autoReveal();
                    gr["_buttonHelp"].visible = false;
                    gr["_buttonPlay"].visible = false;
                    gr["_buttonPlayMTM"].visible = false;
                } else {
                    addButtonSalvageListener();
                    gr["_buttonHelp"].visible = true;
                    gr._buttonPlay.visible = true;
                    gr._buttonPlayMTM.visible = true;
                    gr._buttonPlay.alpha = 1;
                    gr._buttonPlayMTM.alpha = 1;
                    msgBus.publish("enablePlayWithMoneyUI");
                    initShipListener();
                    arrowHandInterval();
                }
            }
            // inBonusAnimation
            function inBonusAnimation(onceRevealMember) {
                var allBonusBox = [gr._box_left, gr._right_box, gr._box_Middle];
                var selectBoxReveal = ["boxCrown", "boxDiamond", "boxBigGem", "boxPearl", "boxGem", "boxGoldCoin", "bullion"];
                //var notSelectBoxReveal = ["boxCrownGrey", "boxDiamondGrey", "boxBigGemGrey", "boxPearlGrey", "boxGemGrey", "boxGoldCoinGrey", "bullionGrey"];

                gr.animMap["_BonusLight"].clone(gr, ["_boxLightRight"], "_BonusLightRight");
                gr.animMap["_BonusLight"].clone(gr, ["_boxLight"], "_BoxLightMiddle");
                gr.animMap["_BonusLight"].play();
                gr.animMap["_BonusLight"]._onComplete = function() {
                    this.play();
                };
                gr.animMap["_BonusLightRight"].play();
                gr.animMap["_BonusLightRight"]._onComplete = function() {
                    this.play();
                };
                gr.animMap["_BoxLightMiddle"].play();
                gr.animMap["_BoxLightMiddle"]._onComplete = function() {
                    this.play();
                };

                function baseRevealBox(revealMember, box, boxRevealArray) {
                    for (var i = 0; i < revealMember.length; i++) {
                        switch (revealMember[i]) {
                            case "A":
                                box[i].$backgroundImage.gotoAndPlay(boxRevealArray[0]);
                                break;
                            case "B":
                                box[i].$backgroundImage.gotoAndPlay(boxRevealArray[1]);
                                break;
                            case "C":
                                box[i].$backgroundImage.gotoAndPlay(boxRevealArray[2]);
                                break;
                            case "D":
                                box[i].$backgroundImage.gotoAndPlay(boxRevealArray[3]);
                                break;
                            case "E":
                                box[i].$backgroundImage.gotoAndPlay(boxRevealArray[4]);
                                break;
                            case "F":
                                box[i].$backgroundImage.gotoAndPlay(boxRevealArray[5]);
                                break;
                            case "1":
                                box[i].$backgroundImage.gotoAndStop(boxRevealArray[6]);
                                gr[box[i].name + "_text"].$text.text = jLottery.formatCurrency(resultData.prizeTable[6].prize).formattedAmount;
                                break;
                            case "2":
                                box[i].$backgroundImage.gotoAndStop(boxRevealArray[6]);
                                gr[box[i].name + "_text"].$text.text = jLottery.formatCurrency(resultData.prizeTable[7].prize).formattedAmount;
                                break;
                        }
                    }
                }

                function selectBonusBox(revealMember, clickBox) {
                    var boxLight;
                    if (clickBox === gr._box_left) {
                        boxLight = revealMember.length === 3 ? [gr._Treasure_00, gr._Treasure_01, gr._Treasure_02] : [gr._Treasure_00, gr._Treasure_01];
                    } else if (clickBox === gr._right_box) {
                        boxLight = revealMember.length === 3 ? [gr._Treasure_03, gr._Treasure_04, gr._Treasure_05] : [gr._Treasure_03, gr._Treasure_04];
                    } else {
                        boxLight = revealMember.length === 3 ? [gr._Treasure_06, gr._Treasure_07, gr._Treasure_08] : [gr._Treasure_06, gr._Treasure_07];
                    }
                    baseRevealBox(revealMember, boxLight, selectBoxReveal);
                    return boxLight;
                }

                /*function notSelectBonusBox(notRevealMember, bonusBox) {
                    var boxGreyArray;
                    if (bonusBox === gr._box_left) {
                        boxGreyArray = notRevealMember.length === 3 ? [gr._baowu_06, gr._baowu_07, gr._baowu_08] : [gr._baowu_06, gr._baowu_07];
                    } else if (bonusBox === gr._right_box) {
                        boxGreyArray = notRevealMember.length === 3 ? [gr._baowu_03, gr._baowu_04, gr._baowu_05] : [gr._baowu_03, gr._baowu_04];
                    } else {
                        boxGreyArray = notRevealMember.length === 3 ? [gr._baowu_00, gr._baowu_01, gr._baowu_02] : [gr._baowu_00, gr._baowu_01];
                    }
                    baseRevealBox(notRevealMember, boxGreyArray, notSelectBoxReveal);
                    return boxGreyArray;
                }*/

                function revealBox(clickBox, selectBox) {
                    var boxLight = selectBonusBox(onceRevealMember, selectBox);
                    for (var i = 0; i < boxLight.length; i++) {
                        boxLight[i].visible = true;
                        boxLight[i].alpha = 1;
                    }
                    //var notRevealMember1 = onceResult.split(":").slice(2, 3)[0].split("");
                    //var notRevealMember2 = onceResult.split(":").slice(3, 4)[0].split("");
                    treasureAnimation(onceRevealMember, clickBox);
                    /*setTimeout(function() {
                        var boxGreyArray1 = notSelectBonusBox(notRevealMember1, allBonusBox[0]);
                        var boxGreyArray2 = notSelectBonusBox(notRevealMember2, allBonusBox[1]);
                        for (var i = 0; i < boxGreyArray1.length; i++) {
                            boxGreyArray1[i].alpha = 0.8;
                            boxGreyArray1[i].visible = true;
                        }
                        for (var i = 0; i < boxGreyArray2.length; i++) {
                            boxGreyArray2[i].visible = true;
                            boxGreyArray2[i].alpha = 0.8;
                        }
                    }, boxLight.length * (enlargeTreasureTime + treasureTime + treasureToPaytable + treasureDisplay));
                */
                }
                for (var i = 0; i < allBonusBox.length; i++) {
                    allBonusBox[i].on("click", function() {
                        audio.play("BonusBoxReveal", 0);
                        gr["_boxLightLeft"].visible = false;
                        gr["_boxLightRight"].visible = false;
                        gr["_boxLight"].visible = false;
                        gr.animMap["_BonusLight"].stop();
                        gr.animMap["_BonusLightRight"].stop();
                        gr.animMap["_BoxLightMiddle"].stop();
                        for (var j = 0; j < allBonusBox.length; j++) {
                            gr._box_left.removeAllEventListeners();
                            gr._right_box.removeAllEventListeners();
                            gr._box_Middle.removeAllEventListeners();
                            if (this === allBonusBox[j]) {
                                if (allBonusBox[j] === gr["_box_Middle"]) {
                                    //var index = j;
                                    var clickBox = allBonusBox.splice(j, 1);
                                    gr["_box_Middle"].$backgroundImage.gotoAndPlay("boxMiddle");
                                    gr["_box_Middle"].$backgroundImage.on(
                                        "animationend",
                                        function() {
                                            gr["_leftBoxGrey"].visible = true;
                                            gr["_rightBoxGrey"].visible = true;
                                            gr["_boxLeftTreasure"].visible = false;
                                            gr["_rightBoxTreasure"].visible = false;
                                            gr["_middleBoxTreasure"].visible = true;
                                            for (var i = 3; i < 9; i++) {
                                                gr["_baowu_0" + i].visible = false;
                                            }
                                            for (var i = 6; i < 9; i++) {
                                                gr["_Treasure_0" + i].visible = false;
                                            }
                                            revealBox(clickBox, gr["_box_Middle"]);
                                        },
                                        null,
                                        true
                                    );
                                } else if (allBonusBox[j] === gr["_box_left"]) {
                                    //var index = j;
                                    var clickBox = allBonusBox.splice(j, 1);
                                    gr["_box_left"].$backgroundImage.gotoAndPlay("box");
                                    gr["_box_left"].$backgroundImage.on(
                                        "animationend",
                                        function() {
                                            gr["_rightBoxGrey"].visible = true;
                                            gr["_middleBoxGrey"].visible = true;
                                            gr["_boxLeftTreasure"].visible = true;
                                            gr["_middleBoxTreasure"].visible = false;
                                            gr["_rightBoxTreasure"].visible = false;
                                            for (var i = 0; i < 6; i++) {
                                                gr["_baowu_0" + i].visible = false;
                                            }
                                            for (var i = 0; i < 3; i++) {
                                                gr["_Treasure_0" + i].visible = false;
                                            }
                                            revealBox(clickBox, gr["_box_left"]);
                                        },
                                        null,
                                        true
                                    );
                                } else if (allBonusBox[j] === gr["_right_box"]) {
                                    //var index = j;
                                    var clickBox = allBonusBox.splice(j, 1);
                                    gr["_right_box"].$backgroundImage.gotoAndPlay("box");
                                    gr["_right_box"].$backgroundImage.on(
                                        "animationend",
                                        function() {
                                            gr["_leftBoxGrey"].visible = true;
                                            gr["_middleBoxGrey"].visible = true;
                                            gr["_rightBoxTreasure"].visible = true;
                                            gr["_middleBoxTreasure"].visible = false;
                                            gr["_boxLeftTreasure"].visible = false;
                                            for (var i = 0; i < 3; i++) {
                                                gr["_baowu_0" + i].visible = false;
                                            }
                                            for (var i = 6; i < 9; i++) {
                                                gr["_baowu_0" + i].visible = false;
                                            }
                                            for (var i = 3; i < 6; i++) {
                                                gr["_Treasure_0" + i].visible = false;
                                            }
                                            revealBox(clickBox, gr["_right_box"]);
                                        },
                                        null,
                                        true
                                    );
                                }
                            }
                        }
                    });
                }
            }
            //  In shipHide Animation
            function noBonusAnimation(onceResult) {
                if (generalInterval) {
                    clearInterval(generalInterval);
                }
                var onceRevealMember = onceResult.split("");
                bonusScene = false;
                var chipNumber = getClampPosition(gr["_ship"]);
                if (chipNumber < 10) {
                    chipNumber = "0" + chipNumber;
                }
                gr["_shipclamp"].x = chipPosition[chipNumber].x;
                gr["_shipclamp"].y = chipPosition[chipNumber].y;
                randomAnimal = bubbleAnimals[Math.floor(Math.random() * 2)];
                randomAnimal.visible = true;
                randomAnimal.alpha = 1;
                //randomAnimal.x = positionBubbleX;
                if (Math.abs(gr["_shipclamp"].x - positionBubbleX) <= 50) {
                    randomAnimal.x = positionBubbleX - 50;
                } else {
                    randomAnimal.x = positionBubbleX;
                }
                gr["_octopus"].$backgroundImage.gotoAndStop("jiaOctopus");
                if (randomAnimal === gr["_octopus"]) {
                    generalInterval = setInterval(function() {
                        randomAnimal.$backgroundImage.gotoAndPlay("generalOctopus");
                    }, 800);
                } else {
                    generalInterval = setInterval(function() {
                        randomAnimal.$backgroundImage.gotoAndPlay("seahorse");
                    }, 800);
                }
                gr["_bubble_01"].x = randomAnimal.x;
                gr["_bubble_01"].y = randomAnimal.y - randomAnimal.getBounds().height;
                gr["_bubble_01"].$backgroundImage.gotoAndPlay("bubble");
                gr["_shipclamp"].visible = true;
                if (landscape) {
                    gr["_shipclamp"].$backgroundImage.gotoAndStop("clamp");
                } else {
                    gr["_shipclamp"].$backgroundImage.gotoAndStop("clampPortrait");
                }
                setTimeout(function() {
                    if (landscape) {
                        gr["_shipclamp"].$backgroundImage.gotoAndPlay("clamp");
                    } else {
                        gr["_shipclamp"].$backgroundImage.gotoAndPlay("clampPortrait");
                    }
                    audio.play("ClawReachesUnderwaterScene", 0);
                }, 100);
                gr["_shipclamp"].$backgroundImage.on(
                    "animationend",
                    function() {
                        gr["_chip" + chipNumber].visible = true;
                        gr["_chip" + chipNumber].$backgroundImage.gotoAndPlay("chip");
                        audio.play("ClawBreaksThroughWood", 0);
                        gr["_shipSign_" + chipNumber].visible = true;
                        gr["_chip" + chipNumber].$backgroundImage.on(
                            "animationend",
                            function() {
                                setTimeout(function() {
                                    if (landscape) {
                                        gr["_shipclamp"].$backgroundImage.gotoAndPlay("clampBack");
                                    } else {
                                        gr["_shipclamp"].$backgroundImage.gotoAndPlay("clambackPortrait");
                                    }
                                    audio.play("ClawReelIn", 0);
                                    gr["_shipclamp"].$backgroundImage.on(
                                        "animationend",
                                        function() {
                                            gr["_shipclamp"].visible = false;
                                            sceneChange();
                                            gr["_ship"].$backgroundImage.gotoAndPlay("shipclamback");
                                            gr["_ship"].$backgroundImage.on(
                                                "animationend",
                                                function() {
                                                    audio.stop("ClawReelIn");
                                                    treasureAnimation(onceRevealMember);
                                                },
                                                null,
                                                true
                                            );
                                        },
                                        null,
                                        true
                                    );
                                }, 800);
                            },
                            null,
                            true
                        );
                    },
                    null,
                    true
                );
            }

            function bonusAnimation(onceResult) {
                if (generalInterval) {
                    clearInterval(generalInterval);
                }
                var bonusResult = onceResult.split(":").slice(1, 2);
                var onceRevealMember = bonusResult[0].split("");
                var currentOctopus;
                bonusScene = true;
                gr._shipclamp.visible = true;
                if (landscape) {
                    gr._shipclamp.$backgroundImage.gotoAndStop("clampOctopus");
                } else {
                    gr._shipclamp.$backgroundImage.gotoAndStop("clampOctopusPortrait");
                }
                gr._sleepOctopus.$backgroundImage.gotoAndStop("sleepOctopus");
                gr._octopus.$backgroundImage.gotoAndStop("jiaOctopus");
                if (gr._seahorse.visible) {
                    gr._octopus.visible = false;
                    gr._sleepOctopus.visible = true;
                    gr._sleep00.visible = true;
                    gr._sleep00.alpha = 1;
                    gr._sleep00.$text.text = "Z";
                    gr.animMap._SleepAnim.play();
                    generalInterval = setInterval(function() {
                        gr._seahorse.$backgroundImage.gotoAndPlay("seahorse");
                    }, 800);
                    gr._sleepOctopus.x = gr._ship.x;
                    gr._seahorse.x = positionBubbleX;
                    gr._bubble_01.x = positionBubbleX;
                    gr._bubble_01.y = gr._seahorse.y - gr._seahorse.getBounds().height * 2;
                    gr._bubble_01.$backgroundImage.gotoAndPlay("bubble");
                } else {
                    gr._octopus.visible = true;
                    generalInterval = setInterval(function() {
                        gr._octopus.$backgroundImage.gotoAndPlay("generalOctopus");
                    }, 800);
                    gr._octopus.x = positionBubbleX;
                    gr._bubble_01.x = gr._octopus.x;
                    gr._bubble_01.y = gr._octopus.y - gr._octopus.getBounds().height * 2;
                    gr._bubble_01.$backgroundImage.gotoAndPlay("bubble");
                }
                currentOctopus = gr._sleepOctopus.visible ? gr._sleepOctopus : gr._octopus;
                gr._shipclamp.x = currentOctopus.x;
                gr._shipclamp.y = shipclimpY - 17;
                if (landscape) {
                    gr._shipclamp.$backgroundImage.gotoAndPlay("clampOctopus");
                } else {
                    gr._shipclamp.$backgroundImage.gotoAndPlay("clampOctopusPortrait");
                }
                audio.play("ClawReachesUnderwaterScene", 0);
                gr._shipclamp.$backgroundImage.on(
                    "animationend",
                    function() {
                        currentOctopus.$backgroundImage.gotoAndPlay("jiaOctopus");
                        audio.play("OctopusCaughtSurprised", 0);
                        if (!gr._shipRedSign_00.visible) {
                            gr._shipRedSign_00.visible = true;
                        } else {
                            gr._shipRedSign_01.visible = true;
                        }
                        currentOctopus.$backgroundImage.on(
                            "animationend",
                            function() {
                                gr._ink.visible = true;
                                gr._ink.alpha = 1;
                                for (var i = 0; i < 3; i++) {
                                    gr["_ink0" + i].visible = false;
                                    gr["_Inks0" + i].visible = false;
                                }
                                gr._ink00.visible = true;
                                gr._ink00.scaleX = 0.1;
                                gr._ink00.scaleY = 0.1;
                                gr.animMap._inkAnim00.play(); // tumo
                                audio.play("OctopusInkSplat_x3", 0);
                                gr.animMap._inkAnim00._onComplete = function() {
                                    gr._ink01.visible = true;
                                    gr._ink01.scaleX = 0.1;
                                    gr._ink01.scaleY = 0.1;
                                    gr.animMap._inkAnim01.play(); // tumo
                                };
                                gr.animMap._inkAnim01._onComplete = function() {
                                    gr._ink02.visible = true;
                                    gr._ink02.scaleX = 0.1;
                                    gr._ink02.scaleY = 0.1;
                                    gr.animMap._inkAnim02.play(); // tumo
                                };
                                gr.animMap._inkAnim02._onComplete = function() {
                                    audio.play("BonusLandedFlourish", 0);
                                    for (var i = 0; i < 3; i++) {
                                        gr["_Inks0" + i].visible = true;
                                        gr["_Inks0" + i].alpha = 1;
                                        gr["_Inks0" + i].$backgroundImage.gotoAndStop("Ink");
                                        gr["_Inks0" + i].$backgroundImage.gotoAndPlay("Ink");
                                    }
                                };
                            },
                            null,
                            true
                        );
                    },
                    null,
                    true
                );
                gr["_Inks02"].$backgroundImage.on(
                    "animationend",
                    function() {
                        setTimeout(function() {
                            sceneChange();
                            inBonusAnimation(onceRevealMember);
                        }, 1500);
                    },
                    null,
                    true
                );
            }
            //  scenechange
            function sceneChange(callback) {
                if (shipScene && !bonusScene) {
                    shipScene = false;
                    if (handClickInterval) {
                        clickArrowHandInterval();
                    }
                    audio.play("OceanWave", 0);
                    gr["_bubble"].visible = true;
                    gr["_seagull"].visible = true;
                    vomitBubbleInterval = setInterval(autoBubbling, 5000);
                    cjs.Tween.get(gr["_bonusScreen"], { loop: false }, true).to({ alpha: 0, visible: false }, 500, cjs.Ease.cubicOut);
                    for (var i = 0; i < onseaChange.length; i++) {
                        onseaChange[i].visible = true;
                        onseaChange[i].alpha = 1;
                    }
                    //gr["_buttonPlay"].visible = false;
                    if (gr["_ship"].count === 6) {
                        gr["_buttonReveal"].visible = false;
                    } else {
                        gr["_buttonReveal"].visible = true;
                        gr["_buttonReveal"].alpha = 1;
                    }
                    if (landscape) {
                        gr["_onSeaScreen"].stage.canvas.parentElement.style.backgroundImage = "url({0})".replace(/\{0\}/, resLib.images.landscapeBG.src);
                    } else {
                        gr["_onSeaScreen"].stage.canvas.parentElement.style.backgroundImage = "url({0})".replace(/\{0\}/, resLib.images.portraitBG.src);
                    }
                    gr["_onSeaScreen"].stage.canvas.parentElement.style.backgroundRepeat = "no-repeat";
                    gr["_onSeaScreen"].stage.canvas.parentElement.style.backgroundSize = "cover";
                    gr["_onSeaScreen"].stage.canvas.parentElement.style.backgroundPosition = "center";
                    cjs.Tween.get(gr["_underSeaScreen"], { loop: false }, true).to({ alpha: 0, visible: false }, 500, cjs.Ease.cubicOut);
                } else if (bonusScene) {
                    bonusScene = false;
                    shipScene = true;
                    cjs.Tween.get(gr["_underSeaScreen"], { loop: false }, true).to({ alpha: 0, visible: false }, 500, cjs.Ease.cubicOut);
                    gr["_buttonPlay"].visible = false;
                    gr["_buttonPlayMTM"].visible = false;
                    gr["_leftBoxGrey"].visible = false;
                    gr["_rightBoxGrey"].visible = false;
                    gr["_middleBoxGrey"].visible = false;
                    gr["_boxLeftTreasure"].visible = false;
                    gr["_rightBoxTreasure"].visible = false;
                    gr["_middleBoxTreasure"].visible = false;
                    gr["_boxLightLeft"].visible = true;
                    gr["_boxLightRight"].visible = true;
                    gr["_boxLight"].visible = true;
                    gr["_box_Middle"].$backgroundImage.gotoAndStop("boxMiddle");
                    gr["_box_left"].$backgroundImage.gotoAndStop("box");
                    gr["_right_box"].$backgroundImage.gotoAndStop("box");
                    for (var i = 0; i < 9; i++) {
                        gr["_baowu_0" + i + "_text"].$text.text = "";
                    }
                    for (var i = 0; i < 9; i++) {
                        gr["_Treasure_0" + i + "_text"].$text.text = "";
                    }
                    gr["_bonusScreen"].alpha = 1;
                    gr["_bonusScreen"].visible = true;
                    gr["_bigjintiao"].visible = false;
                    gr["_crowntext"].$text.text = winPayTable[0] + "/" + 6;
                    gr["_diamondtext"].$text.text = winPayTable[1] + "/" + 6;
                    gr["_bigGemtext"].$text.text = winPayTable[2] + "/" + 5;
                    gr["_pearltext"].$text.text = winPayTable[3] + "/" + 5;
                    gr["_gemtext"].$text.text = winPayTable[4] + "/" + 4;
                    gr["_goldCointext"].$text.text = winPayTable[5] + "/" + 4;
                } else {
                    shipScene = true;
                    gr["_underSeaScreen"].stage.canvas.parentElement.style.backgroundImage = "url({0})".replace(/\{0\}/, resLib.images.seabed.src);
                    gr["_underSeaScreen"].stage.canvas.parentElement.style.backgroundRepeat = "no-repeat";
                    gr["_underSeaScreen"].stage.canvas.parentElement.style.backgroundSize = "cover";
                    gr["_underSeaScreen"].stage.canvas.parentElement.style.backgroundPosition = "center";
                    gr["_octopus"].visible = false;
                    gr["_seahorse"].visible = false;
                    gr["_sleepOctopus"].visible = false;
                    gr["_ink"].visible = false;
                    gr["_seagull"].visible = false;
                    for (var i = 0; i < onseaChange.length; i++) {
                        cjs.Tween.get(onseaChange[i], { loop: false }, true).to({ alpha: 0, visible: false }, 500, cjs.Ease.cubicOut);
                    }
                    cjs.Tween.get(gr._buttonPlay, { loop: false }, true).to({ alpha: 0, visible: false }, 500, cjs.Ease.cubicOut);
                    cjs.Tween.get(gr._buttonPlayMTM, { loop: false }, true).to({ alpha: 0, visible: false }, 500, cjs.Ease.cubicOut);
                    gr["_underSeaScreen"].visible = true;
                    gr["_underSeaScreen"].alpha = 1;
                    if (gr["_ship"].count === 6) {
                        gr["_buttonReveal"].visible = false;
                    } else {
                        gr["_buttonReveal"].visible = true;
                        gr["_buttonReveal"].alpha = 1;
                    }
                    if (callback) {
                        callback(result);
                    }
                }
            }
            // animation for result
            function baseUnderwaterAnimation(result) {
                var onceResult = result[gr["_ship"].count]; //Each time the results
                if (Math.abs(gr["_ship"].x - positionBubbleX) <= 10) {
                    // Where there is air bubbles under the hook
                    if (onceResult.search(/X/g) === -1) {
                        // no bonus
                        noBonusAnimation(onceResult);
                    } else {
                        // bonus
                        bonusAnimation(onceResult);
                    }
                } else {
                    if (onceResult.search(/X/g) === -1) {
                        // no bonus
                        noBonusAnimation(onceResult);
                    } else {
                        // bonus
                        gr["_seahorse"].visible = true;
                        bonusAnimation(onceResult);
                    }
                }
            }

            function setUnderwaterTreasureRevealAction() {
                gr["_ship"].autoReveal = function() {
                    clickArrowHandInterval();
                    playButton.onClick = null;
                    playMTMButton.onClick = null;
                    stage.removeAllEventListeners();
                    gr["_buttonMTM"].visible = false;
                    autoPlay(gr["_ship"].reveal);
                };
                gr["_ship"].reveal = function() {
                    clickArrowHandInterval();
                    playButton.onClick = null;
                    playMTMButton.onClick = null;
                    stage.removeAllEventListeners();
                    gr["_buttonMTM"].visible = false;
                    gr["_buttonHelp"].visible = false;
                    gr["_ship"].currentPlaying = true;
                    gr["_ship"].$backgroundImage.gotoAndPlay("ship");
                    if (gr["_ship"].count === 6) {
                        gr["_buttonPlay"].visible = false;
                        gr["_buttonPlayMTM"].visible = false;
                    }
                    audio.play("ClawDrop", 0);
                    gr["_clamp_0" + gr["_ship"].count].alpha = 0.2;
                    gr["_ship"].$backgroundImage.on(
                        "animationend",
                        function() {
                            setTimeout(function() {
                                sceneChange(baseUnderwaterAnimation);
                                gr["_bubble"].visible = false;
                                clearInterval(vomitBubbleInterval);
                            }, 500);
                        },
                        null,
                        true
                    );
                };
            }

            function addButtonSalvageListener() {
                playButton.click(function() {
                    gr._buttonPlay.visible = false;
                    gr["_ship"].reveal();
                });
                playMTMButton.click(function() {
                    gr._buttonPlayMTM.visible = false;
                    gr["_ship"].reveal();
                });
            }

            function onStartUserInteraction(data) {
                resultData = data;
                if (!data.scenario) {
                    gr["_buttonPlay"].visible = false;
                    gr["_buttonPlayMTM"].visible = false;
                }
                result = data.scenario.split(",");
                if (!result) {
                    msgBus.publish("error", "Cannot parse server response");
                }
                //audio.play('OceanWave', 0);
                gr["_seagull"].visible = true;
                if (!seaGullInterval) {
                    seaGullLoop();
                }
                arrowHandInterval();
                addButtonSalvageListener();
                vomitBubbleInterval = setInterval(autoBubbling, 5000);
                gr["_buttonPlay"].visible = true;
                gr["_buttonPlay"].alpha = 1;
                gr["_buttonPlayMTM"].visible = true;
                setUnderwaterTreasureRevealAction();
            }

            function onReInitialize() {
                resetAll();
                msgBus.publish("enableUI");
            }

            function onReStartUserInteraction(data) {
                resetAll();
                initShipListener();
                onStartUserInteraction(data);
            }
            initGame();
            resetAll();
            //setSpecificParameters();
            msgBus.subscribe("resetAll", resetAll);
            msgBus.subscribe("initShipListener", initShipListener);
            msgBus.subscribe("jLottery.reInitialize", onReInitialize);
            msgBus.subscribe("jLottery.reStartUserInteraction", onReStartUserInteraction);
            msgBus.subscribe("jLottery.startUserInteraction", onStartUserInteraction);
        };
    }
);