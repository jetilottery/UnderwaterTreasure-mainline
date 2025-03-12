/**
 * @module game/playWithMoney
 * @description play with money button control
 */
define(
    [
        "skbJet/component/gameMsgBus/GameMsgBus",
        "game/audio",
        "game/playAgainController",
        "skbJet/component/resourceLoader/resourceLib",
        "skbJet/component/SKBeInstant/SKBeInstant",
        "game/gladButton"
    ],
    function(msgBus, audio, playAgainController, resLib, SKBeInstant, gladButton) {
        return function(gr, config) {
            var count = 0;
            var MTMButton;

            function onGameParametersUpdated() {
                MTMButton = new gladButton(gr._buttonMTM, "buttonCommon", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                gr._textMTM.$text.text = resLib.i18n.game.button_move2moneyGame;
                gr._textMTM.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
                gr._buttonMTM.visible = false;
                MTMButton.click(function() {
                    audio.play("ButtonGeneric", 0);
                    if (playAgainController.playAgainInterval) {
                        clearTimeout(playAgainController.playAgainInterval);
                    }
                    msgBus.publish("disableUI");
                    msgBus.publish("playerBuyOrTry");
                    SKBeInstant.config.wagerType = "BUY";
                    msgBus.publish('playerWantsToMoveToMoneyGame');
                    msgBus.publish('jLotteryGame.playerWantsToMoveToMoneyGame');
                });
            }

            function enableButton() {
                if (
                    SKBeInstant.config.wagerType === "BUY" ||
                    SKBeInstant.config.jLotteryPhase === 1 ||
                    Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1 /*-1: never. Move-To-Money-Button will never appear.*/
                ) {
                    gr._Money.visible = true;
                    gr._Try.visible = false;
                } else {
                    //0: Move-To-Money-Button shown from the beginning, before placing any demo wager.
                    //1..N: number of demo wagers before showing Move-To-Money-Button.
                    //(Example: If value is 1, then the first time the RESULT_SCREEN state is reached,
                    //the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))
                    if (count >= Number(SKBeInstant.config.demosB4Move2MoneyButton)) {
                        gr._Money.visible = false;
                        gr._Try.visible = true;
                        gr._buttonMTM.visible = true;
                    } else {
                        gr._Money.visible = true;
                        gr._Try.visible = false;
                        gr._buttonMTM.visible = false;
                    }
                }
            }

            function onInitialize() {
                enableButton();
            }

            function onReInitialize() {
                enableButton();
            }

            function onStartUserInteraction() {
                if (SKBeInstant.config.moveToMoneyButtonEnabledWhilePlaying) {
                    enableButton();
                } else {
                    gr._Money.visible = true;
                    gr._Try.visible = false;
                }
            }

            function onReStartUserInteraction(data) {
                onStartUserInteraction(data);
            }

            function onDisableUI() {
                gr._Money.visible = false;
                gr._Try.visible = false;
            }

            function onEnableUI() {
                enableButton();
            }

            function onEnablePlayWithMoneyUI() {
                gr._buttonMTM.visible = true;
            }
            //When the RESULT_SCREEN state is reached,plus count,
            //the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))
            function onEnterResultScreenState() {
                msgBus.publish("enableUI");
                gr._buttonMTM.visible = false;
                if (SKBeInstant.config.wagerType === "TRY") {
                    count++;
                    setTimeout(function() {
                        if (gr._helpPage.visible) {
                            return;
                        } else {
                            enableButton();
                        }
                    }, Number(config.compulsionDelayInSeconds) * 1000);
                }
            }
            msgBus.subscribe('jLotterySKB.reset', function() {
                enableButton();
            });
            msgBus.subscribe("jLottery.initialize", onInitialize);
            msgBus.subscribe("jLottery.reStartUserInteraction", onReStartUserInteraction);
            msgBus.subscribe("jLottery.reInitialize", onReInitialize);
            msgBus.subscribe("jLottery.startUserInteraction", onStartUserInteraction);
            msgBus.subscribe("disableUI", onDisableUI);
            msgBus.subscribe("enableUI", onEnableUI);
            msgBus.subscribe("enablePlayWithMoneyUI", onEnablePlayWithMoneyUI);
            msgBus.subscribe("jLottery.enterResultScreenState", onEnterResultScreenState);
            msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
        };
    }
);