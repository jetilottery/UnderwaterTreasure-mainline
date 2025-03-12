define(
    [
        "skbJet/component/gameMsgBus/GameMsgBus",
        "com/createjs/easeljs",
        "com/createjs/tweenjs",
        "game/audio",
        "skbJet/component/resourceLoader/resourceLib",
        "skbJet/component/SKBeInstant/SKBeInstant",
        "game/gladButton"
    ],
    function(msgBus, cjs, tweenjs, audio, resLib, SKBeInstant, gladButton) {
        return function(gr, stage) {
            var tutorialClose = false;
            var beforePlay = false;
            //var gameTicketReady = true;
            var tutorialButton, tutorialCloseButton;
            var MTMReinitial = false;
            var index = 0,
                minIndex = 0,
                maxIndex = 1;
            var left, right;
            var jLotteryReset = false;
            function tutorialAction() {
                gr._helpPage.visible = true;
                gr._BG_dim.visible = true;
                if (tutorialClose) {
                    if (gr.animMap._TutorialAnim.isPlaying) {
                        return;
                    }
                    if (beforePlay) {
                        stage.removeAllEventListeners();
                    }
                    tutorialClose = false;
                    gr.animMap._TutorialAnimDown.play();
                    gr._tutorial_ship.$backgroundImage.gotoAndPlay("tutorial");
                    msgBus.publish("disableUI");
                    msgBus.publish("onDisableMerterDim");
                    msgBus.publish("disableMessagePlaque");
                } else {
                    if (gr.animMap._TutorialAnimDown.isPlaying) {
                        return;
                    }
                    tutorialClose = true;
                    gr.animMap._TutorialAnim.play();
                    gr._tutorial_ship.$backgroundImage.gotoAndStop("tutorial_01");
                }
            }

            function onGameParametersUpdated() {
                tutorialButton = new gladButton(gr._buttonHelp, "buttonInfo", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                tutorialCloseButton = new gladButton(gr._helpPage_closeButton, "buttonMessageClose", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                left = new gladButton(gr._buttonTutorialArrowLeft, "buttonTutorialArrow", { scaleXWhenClick: -0.92, scaleYWhenClick: 0.92 });
                right = new gladButton(gr._buttonTutorialArrowRight, "buttonTutorialArrow", { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92 });
                gr._helpPage_closeButton_text.$text.text = resLib.i18n.game.button_close;
                gr._Trawl_text.$text.text = resLib.i18n.game.button_play;
                gr._help_title.$text.text = resLib.i18n.game.PrizeXBonus;
                gr._help_title.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 3);
                gr._help_text.$text.text = resLib.i18n.game.help_text_landscape;
                gr._help_text.$text.lineHeight = 35;
                gr._help_text.$text.shadow = new window.createjs.Shadow("#000000", 1, 1, 1);
                gr._helpPage_closeButton_text.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
                gr._Trawl_text.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
                gr._buttonHelp.visible = false;
                tutorialButton.click(function() {
                    audio.play("ButtonGeneric", 0);
                    tutorialAction();
                });
                tutorialCloseButton.click(function() {
                    audio.play("ButtonGeneric", 0);
                    tutorialAction();
                });
                left.click(function() {
                    gr['_helpTu_0' + index].visible = false;
                    index--;
                    if (index < minIndex) {
                        index = maxIndex;
                    }
                    gr['_helpTu_0' + index].visible = true;
                    audio.play("ButtonGeneric", 0);
                });
                right.click(function() {
                    gr['_helpTu_0' + index].visible = false;
                    index++;
                    if (index > maxIndex) {
                        index = minIndex;
                    }
                    gr['_helpTu_0' + index].visible = true;
                    audio.play("ButtonGeneric", 0);
                });
                for (var i = minIndex; i <= maxIndex; i++) {
                    if (i !== 0) {
                        gr['_helpTu_0' + i].visible = false;
                    }
                }
                gr.animMap._TutorialAnim._onComplete = function() {
                    index = minIndex;
                    for (var i = minIndex; i <= maxIndex; i++) {
                        if (i === minIndex) {
                            gr['_helpTu_0' + i].visible = true;
                        } else {
                            gr['_helpTu_0' + i].visible = false;
                        }
                    }
                    gr._helpPage.visible = false;
                    gr._BG_dim.visible = false;
                    msgBus.publish("enableUI");
                    msgBus.publish("onEnableMerterDim");
                    msgBus.publish("enableMessagePlaque");
                    if (beforePlay) {
                        msgBus.publish("initShipListener");
                    }
                };
            }

            function onDisableUI() {
                gr._buttonHelp.visible = false;
            }

            function onEnableUI() {
                gr._buttonHelp.visible = true;
            }

            function showFirstTutorial() {
                for (var i = minIndex; i <= maxIndex; i++) {
                    if (i === minIndex) {
                        gr['_helpTu_0' + i].visible = true;
                    } else {
                        gr['_helpTu_0' + i].visible = false;
                    }
                }
                gr._helpPage.visible = true;
                gr._BG_dim.visible = true;
                gr._tutorial_ship.$backgroundImage.gotoAndPlay("tutorial");
                msgBus.publish("disableUI");
                msgBus.publish("onDisableMerterDim");
            }

            function onInitialize() {
                //gameTicketReady = false;
                msgBus.publish("showBuyOrTryButton");
                showFirstTutorial();
            }

            function onStartUserInteraction() {
                beforePlay = true;
                tutorialClose = true;
                gr._buttonHelp.visible = true;
                gr._helpPage.visible = false;
                gr._BG_dim.visible = false;
                if (SKBeInstant.config.gameType === "ticketReady" && !jLotteryReset/*&& gameTicketReady*/) {
                    //gameTicketReady = false;
                    tutorialClose = false;
                    showFirstTutorial();
                } else {
                    msgBus.publish("initShipListener");
                }
            }

            function onReInitialize() {
                if (MTMReinitial) {
                    beforePlay = false;
                    MTMReinitial = false;
                    showFirstTutorial();
                    tutorialAction();
                    msgBus.publish("onMeterVisible");
                }
            }

            function onReStartUserInteraction() {
                beforePlay = true;
                gr._buttonHelp.visible = true;
                msgBus.publish("initShipListener");
            }

            function onEnterResultScreenState() {
                beforePlay = false;
                jLotteryReset = false;
            }

            function onPlayerWantsToMoveToMoneyGame() {
                MTMReinitial = true;
            }
            msgBus.subscribe("jLotterySKB.reset", function(){
                if(!jLotteryReset){
                    jLotteryReset = true;
                }                
                onEnableUI();
            });
            msgBus.subscribe("disableUI", onDisableUI);
            msgBus.subscribe("enableUI", onEnableUI);
            msgBus.subscribe("jLottery.initialize", onInitialize);
            msgBus.subscribe("jLottery.reInitialize", onReInitialize);
            msgBus.subscribe("jLottery.startUserInteraction", onStartUserInteraction);
            msgBus.subscribe("jLottery.reStartUserInteraction", onReStartUserInteraction);
            msgBus.subscribe("jLottery.enterResultScreenState", onEnterResultScreenState);
            msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
            msgBus.subscribe('playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoneyGame);
        };
    }
);