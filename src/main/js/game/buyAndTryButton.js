/**
 * @module game/buyAndTryButton
 * @description buy and try button control
 */
define(
    [
        "skbJet/component/gameMsgBus/GameMsgBus",
        "game/audio",
        "skbJet/component/resourceLoader/resourceLib",
        "skbJet/component/SKBeInstant/SKBeInstant",
        "game/gameUtil",
        "game/gladButton"
    ],
    function(msgBus, audio, resLib, SKBeInstant, gameUtils, gladButton) {
        return function(gr) {
            var currentTicketCost = null;
            var replay = false;
            var MTMReinitial = false;
            var buttonBuy, buttonTry;

            function onGameParametersUpdated() {
                buttonBuy = new gladButton(gr._buttonBuy, "buttonCommon", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                buttonTry = new gladButton(gr._buttonTry, "buttonCommon", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                gr._textBuy.$text.text = resLib.i18n.game.button_buy;
                gr._textTry.$text.text = resLib.i18n.game.button_try;
                gr._textBuy.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
                gr._textTry.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
                gr._buttonBuy.visible = false;
                gr._buttonTry.visible = false;
                if (SKBeInstant.config.wagerType === "BUY") {
                    gr._textBuy.$text.text = resLib.i18n.game.button_buy;
                } else {
                    gr._textBuy.$text.text = resLib.i18n.game.button_try;
                }
                buttonBuy.click(play);
                buttonTry.click(play);
            }

            function play() {
                if (replay) {
                    msgBus.publish("jLotteryGame.playerWantsToRePlay", { price: currentTicketCost });
                } else {
                    msgBus.publish("jLotteryGame.playerWantsToPlay", { price: currentTicketCost });
                }
                gr._buttonBuy.visible = false;
                gr._buttonTry.visible = false;
                gr._buttonMTM.visible = false;
                audio.play("ButtonGeneric", 0);
                msgBus.publish("disableUI");
                msgBus.publish("playerBuyOrTry");
            }

            function onStartUserInteraction(data) {
                replay = true;
                gr._buttonBuy.visible = false;
                gr._buttonTry.visible = false;
                gr._buttonMTM.visible = false;
                currentTicketCost = data.price;
            }

            function showBuyOrTryButton() {
                if (SKBeInstant.config.jLotteryPhase !== 2) {
                    return;
                }
                gr._buttonBuy.visible = true;
                gr._buttonTry.visible = true;
            }

            function onInitialize() {
                showBuyOrTryButton();
            }

            function onTicketCostChanged(data) {
                currentTicketCost = data;
                gameUtils.fixMeter(gr);
            }

            // function onEnterResultScreenState(data){
            // 	setTimeout(showBuyOrTryButton, Number(config.compulsionDelayInSeconds)*1000);
            // }
            function onPlayerWantsToMoveToMoneyGame() {
                MTMReinitial = true;
            }

            function onReInitialize() {
                if (MTMReinitial) {
                    gr._textBuy.$text.text = resLib.i18n.game.button_buy;
                    replay = false;
                    MTMReinitial = false;
                }
                showBuyOrTryButton();
            }

            function onReStartUserInteraction(data) {
                onStartUserInteraction(data);
            }
            msgBus.subscribe('jLotterySKB.reset', function() {
                //gr.lib._refresh.show(false);
                showBuyOrTryButton();
            });
            msgBus.subscribe("showBuyOrTryButton", showBuyOrTryButton);
            msgBus.subscribe("playerWantsPlayAgain", showBuyOrTryButton);
            msgBus.subscribe("jLottery.reInitialize", onReInitialize);
            msgBus.subscribe("jLottery.initialize", onInitialize);
            msgBus.subscribe("jLottery.startUserInteraction", onStartUserInteraction);
            msgBus.subscribe("ticketCostChanged", onTicketCostChanged);
            msgBus.subscribe("jLottery.reStartUserInteraction", onReStartUserInteraction);
            msgBus.subscribe("SKBeInstant.gameParametersUpdated", onGameParametersUpdated);
            msgBus.subscribe('playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoneyGame);
            //msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
        };
    }
);