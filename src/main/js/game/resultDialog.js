/**
 * @module game/resultDialog
 * @description result dialog control
 */
define(
    [
        "skbJet/component/gameMsgBus/GameMsgBus",
        "game/audio",
        "skbJet/component/resourceLoader/resourceLib",
        "skbJet/component/SKBeInstant/SKBeInstant",
        "game/gladButton"
    ],
    function(msgBus, audio, resLib, SKBeInstant, gladButton) {
        return function(gr, config, jLottery) {
            var allUnderwaterTreasureRevealed = false;
            var resultData = null;
            var blinkListener;
            var messagePlaque;
            var messageCloseButton;
            //var shouldCallPlayAagineState = true;

            function onGameParametersUpdated() {
                gr._buttonMessageClose_text.$text.text = resLib.i18n.game.button_close;
                gr._buttonMessageClose_text.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
                messageCloseButton = new gladButton(gr._buttonMessageClose, "buttonMessageClose", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                hideDialog();
                messageCloseButton.click(function() {
                    hideDialog();
                    audio.play("ButtonGeneric", 0);
                    /*if (shouldCallPlayAagineState) {
                    	msgBus.publish('jLotteryGame.playAgain');
                    	shouldCallPlayAagineState = false;
                    }*/
                });
                gr._MessagePlaque.on("click", function() {
                    hideDialog();
                    audio.play("ButtonGeneric", 0);
                });
            }

            function hideDialog() {
                gr._BG_dim.visible = false;
                gr._MessagePlaque.visible = false;
            }

            function showDialog() {
                gr._BG_dim.visible = true;
                gr._MessagePlaque.visible = true;
                gr._Message01_Text.$text.text = "";
                gr._Message01_Value.$text.text = "";
                gr._Message02_Text.$text.text = "";
                if (resultData.playResult === "WIN") {
                    var msgTextHere;
                    if (SKBeInstant.config.wagerType === "BUY") {
                        msgTextHere = resLib.i18n.game.message_buyWin;
                    } else {
                        if (Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1) {
                            msgTextHere = resLib.i18n.game.message_anonymous_tryWin;
                        } else {
                            msgTextHere = resLib.i18n.game.message_tryWin;
                        }
                    }
                    //gr._Message01_Text.$text.lineHeight = 50;
                    gr._Message01_Text.$text.text = msgTextHere;
                    gr._Message01_Value.$text.text = SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount;
                    blinkListener = setInterval(function() {
                        gr["_WinOctopus"].$backgroundImage.gotoAndPlay("octopusBlink");
                    }, 1500);
                } else {
                    gr._Message02_Text.$text.text = resLib.i18n.game.message_nonWin;
                    gr["_WinOctopus"].$backgroundImage.gotoAndPlay("octopusDance");
                }
            }

            function onStartUserInteraction(data) {
                //shouldCallPlayAagineState = true;
                resultData = data;
                allUnderwaterTreasureRevealed = false;
                hideDialog();
            }

            function checkAllRevealed() {
                if (allUnderwaterTreasureRevealed) {
					jLottery.ticketResultHasBeenSeen(resultData.prizeDivision, resultData.prizeValue);
                    msgBus.publish("disableUI");
                    msgBus.publish("allRevealed");
                    //msgBus.publish('enablePlayWithMoneyUI');
                }
            }

            function onEnterResultScreenState() {
                msgBus.publish("enableUI");
                showDialog();
            }

            function onReStartUserInteraction(data) {
                clearInterval(blinkListener);
                onStartUserInteraction(data);
            }

            function onReInitialize() {
                clearInterval(blinkListener);
                hideDialog();
            }

            function onDisableMessagePlaque() {
                messagePlaque = false;
                if (gr._MessagePlaque.visible) {
                    messagePlaque = true;
                }
                gr._MessagePlaque.visible = false;
            }

            function onEnableMessagePlaque() {
                if (messagePlaque) {
                    gr._BG_dim.visible = true;
                    gr._MessagePlaque.visible = true;
                }
            }

            function onPlayerWantsPlayAgain() {
                /*if (shouldCallPlayAagineState) {
                	msgBus.publish('jLotteryGame.playAgain');
                	shouldCallPlayAagineState = false;
                }*/
            }
            msgBus.subscribe("disableMessagePlaque", onDisableMessagePlaque);
            msgBus.subscribe("enableMessagePlaque", onEnableMessagePlaque);
            msgBus.subscribe("jLottery.reInitialize", onReInitialize);

            msgBus.subscribe("jLottery.reStartUserInteraction", onReStartUserInteraction);
            msgBus.subscribe("allUnderwaterTreasureRevealed", function() {
                allUnderwaterTreasureRevealed = true;
                checkAllRevealed();
            });
            msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
            msgBus.subscribe("jLottery.startUserInteraction", onStartUserInteraction);
            msgBus.subscribe("jLottery.enterResultScreenState", onEnterResultScreenState);
            msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
            msgBus.subscribe("hideDialog", function() {
                hideDialog();
            });
        };
    }
);