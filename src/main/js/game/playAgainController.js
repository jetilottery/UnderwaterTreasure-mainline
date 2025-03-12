/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * @module game/exitButton
 * @description exit button control
 */
define(
    [
        "skbJet/component/gameMsgBus/GameMsgBus",
        "game/audio",
        "skbJet/component/resourceLoader/resourceLib",
        "game/gameUtil",
        "skbJet/component/SKBeInstant/SKBeInstant",
        "game/gladButton"
    ],
    function(msgBus, audio, resLib, gameUtil, SKBeInstant, gladButton) {
        return function(gr, config /*, jLottery*/ ) {
            var playAgainInterval = null;
            var playAgainButton, resMTMButton;

            function playAgain() {
                audio.play("ButtonGeneric", 0);
                gr._buttonRestart.visible = false;
                gr._buttonResMTM.visible = false;
                msgBus.publish("playerWantsPlayAgain");
                gameUtil.fixMeter(gr);
            }

            function onGameParametersUpdated() {
                playAgainButton = new gladButton(gr._buttonRestart, "buttonCommon", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                resMTMButton = new gladButton(gr._buttonResMTM, "buttonCommon", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                if (SKBeInstant.config.wagerType === "BUY") {
                    gr._textRestart.$text.text = resLib.i18n.game.button_restart;
                } else {
                    gr._textRestart.$text.text = resLib.i18n.game.button_tryRestart;
                }
                playAgainButton.click(playAgain);
                gr._buttonRestart.visible = false;

                gr._textResMTM.$text.text = resLib.i18n.game.button_tryRestart;
                resMTMButton.click(playAgain);
                gr._buttonResMTM.visible = false;
                gr._textRestart.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
                gr._textResMTM.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
            }

            function onReInitialize() {
                gr._textRestart.$text.text = resLib.i18n.game.button_restart;
                gr._buttonRestart.visible = false;
                gr._buttonResMTM.visible = false;
            }

            function onEnterResultScreenState() {
                if (SKBeInstant.config.jLotteryPhase === 2) {
                    playAgainInterval = setTimeout(function() {
                        gr._buttonRestart.visible = true;
                        gr._buttonResMTM.visible = true;
                    }, Number(config.compulsionDelayInSeconds) * 1000);
                }
            }

            msgBus.subscribe("jLottery.reInitialize", onReInitialize);
            msgBus.subscribe("jLottery.enterResultScreenState", onEnterResultScreenState);
            msgBus.subscribe("SKBeInstant.gameParametersUpdated", onGameParametersUpdated);

            return {
                playAgainInterval: playAgainInterval
            };
        };
    }
);