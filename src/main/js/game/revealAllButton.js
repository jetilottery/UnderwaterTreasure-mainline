/**
 * @module game/revealAllButton
 * @description reveal all button control
 */
define(
    [
        "skbJet/component/gameMsgBus/GameMsgBus",
        "game/audio",
        "com/createjs/easeljs",
        "com/createjs/tweenjs",
        "skbJet/component/resourceLoader/resourceLib",
        "skbJet/component/SKBeInstant/SKBeInstant",
        "game/gladButton"
    ],
    function(msgBus, audio, cjs, tweenjs, resLib, SKBeInstant, gladButton) {
        return function(gr /*, config, jLottery*/ ) {
            var autoPlayVis = false;
            var revealButton;

            function onGameParametersUpdated() {
                revealButton = new gladButton(gr._buttonReveal, "buttonAutoPlay", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                gr._buttonReveal.visible = false;
                gr["_ship"].autoPlay = false;
                gr["_ship"].currentPlaying = false;
                gr["_buttonReveal_text"].$text.text = resLib.i18n.game.button_reveal;
                gr["_buttonReveal_text"].$text.lineHeight = 22;
                gr._buttonReveal_text.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
            }

            function resetAll() {
                gr._ship.autoPlay = false;
                gr._ship.currentPlaying = false;
                gr._buttonReveal_text.$text.text = resLib.i18n.game.button_reveal;
                revealButton.onClick = null;
            }

            function autoPlay(enabled) {
                if (!enabled) {
                    gr._ship.autoPlay = true;
                    if (!gr._ship.currentPlaying) {
                        gr._ship.currentPlaying = true;
                        gr._buttonHelp.visible = false;
                        gr._buttonExit.visible = false;
                        gr._buttonPlay.visible = false;
                        gr._buttonPlayMTM.visible = false;
                        gr._ship.autoReveal();
                    }
                } else {
                    gr._ship.autoPlay = false;
                }
                gr._buttonReveal_text.$text.text = gr._ship.autoPlay ? resLib.i18n.game.button_cancel_reveal : resLib.i18n.game.button_reveal;
            }

            function tutorialAnimComplete() {
                revealButton.click(function() {
                    autoPlay(gr._ship.autoPlay);
                    audio.play("ButtonGeneric", 0);
                });
            }

            function onStartUserInteraction() {
                autoPlayVis = true;
                gr._buttonReveal.visible = true;
                gr.animMap._Autoplay.play();
                tutorialAnimComplete();
            }

            function onReStartUserInteraction() {
                resetAll();
                onStartUserInteraction();
            }

            function onEnterResultScreenState() {
                autoPlayVis = false;
            }

            function onReInitialize() {
                resetAll();
                autoPlayVis = false;
                gr._buttonReveal.visible = false;
            }

            function onDisableUI() {
                if (autoPlayVis) {
                    gr._buttonReveal.visible = false;
                }
            }

            function onEnableUI() {
                if (autoPlayVis && gr._ship.count !== 6) {
                    gr._buttonReveal.visible = true;
                }
            }
            msgBus.subscribe('jLotterySKB.reset', resetAll);
            msgBus.subscribe("disableUI", onDisableUI);
            msgBus.subscribe("enableUI", onEnableUI);
            msgBus.subscribe("tutorialAnimComplete", tutorialAnimComplete);
            msgBus.subscribe("jLottery.reInitialize", onReInitialize);
            msgBus.subscribe("jLottery.reStartUserInteraction", onReStartUserInteraction);
            msgBus.subscribe("jLottery.startUserInteraction", onStartUserInteraction);
            msgBus.subscribe("jLottery.enterResultScreenState", onEnterResultScreenState);
            msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
            msgBus.subscribe("allRevealed", function() {
                gr["_buttonReveal"].visible = false;
            });
        };
    }
);