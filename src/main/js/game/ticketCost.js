/**
 * @module game/ticketCost
 * @description ticket cost meter control
 */
define(
    [
        "skbJet/component/gameMsgBus/GameMsgBus",
        "game/audio",
        "game/gameUtil",
        "skbJet/component/resourceLoader/resourceLib",
        "skbJet/component/SKBeInstant/SKBeInstant",
        "game/gladButton"
    ],
    function(msgBus, audio, gameUtil, resLib, SKBeInstant, gladButton) {
        return function(gr, config, jLottery) {
            var prizePointList = [];
            var ticketIcon = {},
                ticketIconObj = null;
            var type;
            var _currentPrizePoint = null;
            var payTableList = [gr._textCrown, gr._textDiamond, gr._textBigGem, gr._textPearl, gr._textGem, gr._textGoldCoin];
            var merterDimVisible = false;
            var ticketPrice = 6;
            var increaseButton, decreaseButton;
            var MTMReinitial = false;
            var shouldShowMeterDim = true;

            function registerControl() {
                var formattedPrizeList = [];
                var strPrizeList = [];
                for (var i = 0; i < prizePointList.length; i++) {
                    formattedPrizeList.push(SKBeInstant.formatCurrency(prizePointList[i]).formattedAmount);
                    strPrizeList.push(prizePointList[i] + "");
                }
                var priceText, stakeText;
                if (SKBeInstant.isWLA()) {
                    priceText = resLib.i18n.game.MenuCommand.WLA.price;
                    stakeText = resLib.i18n.game.MenuCommand.WLA.stake;
                } else {
                    priceText = resLib.i18n.game.MenuCommand.Commercial.price;
                    stakeText = resLib.i18n.game.MenuCommand.Commercial.stake;
                }
                msgBus.publish("jLotteryGame.registerControl", [{
                    name: "price",
                    text: priceText,
                    type: "list",
                    enabled: 1,
                    valueText: formattedPrizeList,
                    values: strPrizeList,
                    value: SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault
                }]);
                msgBus.publish("jLotteryGame.registerControl", [{
                    name: "stake",
                    text: stakeText,
                    type: "stake",
                    enabled: 0,
                    valueText: "0",
                    value: 0
                }]);
            }

            function gameControlChanged(value) {
                msgBus.publish("jLotteryGame.onGameControlChanged", {
                    name: "stake",
                    event: "change",
                    params: [SKBeInstant.formatCurrency(value).amount / 100, SKBeInstant.formatCurrency(value).formattedAmount]
                });
                msgBus.publish("jLotteryGame.onGameControlChanged", {
                    name: "price",
                    event: "change",
                    params: [value, SKBeInstant.formatCurrency(value).formattedAmount]
                });
            }

            function onConsoleControlChanged(data) {
                if (data.option === "price") {
                    setTicketCostValue(Number(data.value));

                    msgBus.publish("jLotteryGame.onGameControlChanged", {
                        name: "stake",
                        event: "change",
                        params: [SKBeInstant.formatCurrency(data.value).amount / 100, SKBeInstant.formatCurrency(data.value).formattedAmount]
                    });
                }
            }

            function enableConsole() {
                msgBus.publish("toPlatform", {
                    channel: "Game",
                    topic: "Game.Control",
                    data: { name: "price", event: "enable", params: [1] }
                });
            }

            function disableConsole() {
                msgBus.publish("toPlatform", {
                    channel: "Game",
                    topic: "Game.Control",
                    data: { name: "price", event: "enable", params: [0] }
                });
            }

            function onGameParametersUpdated() {
                increaseButton = new gladButton(gr._arrowPlus, "arrowPlus", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                decreaseButton = new gladButton(gr._arrowMinus, "arrowMinus", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                type = config.wagerType === "BUY" ? true : false;
                gr._TicketCostText.$text.text = resLib.i18n.game.wagerDim;
                gr._TicketCostTextBase.$text.text = resLib.i18n.game.wager;
                for (var i = 0; i < config.gameConfigurationDetails.revealConfigurations.length; i++) {
                    var price = config.gameConfigurationDetails.revealConfigurations[i].price;
                    prizePointList.push(price);
                    ticketIcon[price] = "_select_0" + i;
                    gr["_select_0" + i].$backgroundImage.gotoAndStop("select_03");
                }
                if (prizePointList.length <= 1) {
                    gr._arrowMinus.visible = false;
                    gr._arrowPlus.visible = false;
                    for (i = 0; i < ticketPrice; i++) {
                        gr["_select_0" + i].visible = false;
                    }
                } else {
                    gr._arrowMinus.visible = true;
                    gr._arrowPlus.visible = true;
                    for (i = 0; i < ticketPrice; i++) {
                        if (i < prizePointList.length) {
                            gr["_select_0" + i].visible = true;
                        } else {
                            gr["_select_0" + i].visible = false;
                        }
                    }
                    gameUtil.fixTicketSelect(gr, prizePointList, ticketPrice);
                }
                registerControl();
                setDefaultPricePoint();
                gr._MerterDim.visible = false;
                increaseButton.click(function() {
                    if (gr["_ship"].count === 6) {
                        msgBus.publish("hideDialog");
                        msgBus.publish("resetAll");
                        gr._WinsValue.$text.text = config.defaultWinsValue;
                    }
                    increaseTicketCost();
                });
                decreaseButton.click(function() {
                    if (gr["_ship"].count === 6) {
                        msgBus.publish("hideDialog");
                        msgBus.publish("resetAll");
                        gr._WinsValue.$text.text = config.defaultWinsValue;
                    }
                    decreaseTicketCost();
                });
            }

            function setTicketCostValue(prizePoint) {
                var index = prizePointList.indexOf(prizePoint);
                if (index < 0) {
                    msgBus.publish("error", "Invalide prize point " + prizePoint);
                    return;
                }
                var currentPrizeTable = config.gameConfigurationDetails.revealConfigurations[index].prizeTable;
                if (index === 0) {
                    decreaseButton.enable(false);
                    gr._arrowMinus.visible = false;
                } else {
                    decreaseButton.enable(true);
                    gr._arrowMinus.visible = true;
                }
                if (index === prizePointList.length - 1) {
                    increaseButton.enable(false);
                    gr._arrowPlus.visible = false;
                } else {
                    increaseButton.enable(true);
                    gr._arrowPlus.visible = true;
                }
                var valueString = jLottery.formatCurrency(prizePoint).formattedAmount;
                if (!type) {
                    valueString = resLib.i18n.game.button_try + valueString;
                }
                gr._TicketCostValue.$text.text = valueString;
                gr._TicketCostValueBase.$text.text = valueString;
                if (ticketIconObj) {
                    ticketIconObj.$backgroundImage.gotoAndStop("select_03");
                }
                ticketIconObj = gr[ticketIcon[prizePoint]];
                ticketIconObj.$backgroundImage.gotoAndStop("select_02");

                //gr._TicketCostValue.$text.text = config.wagerType==='BUY'? jLottery.formatCurrency(prizePoint).formattedAmount:resLib.i18n.game.demo + jLottery.formatCurrency(prizePoint).formattedAmount;
                _currentPrizePoint = prizePoint;

                for (var i = 0; i < payTableList.length; i++) {
                    payTableList[i].$text.text = jLottery.formatCurrency(currentPrizeTable[i].prize).formattedAmount;
                }
                gameUtil.fixMeter(gr);
                msgBus.publish("ticketCostChanged", prizePoint);
            }

            function resetAll(value) {
                setTicketCostValueWithNotify(value);
            }

            function setTicketCostValueWithNotify(prizePoint) {
                setTicketCostValue(prizePoint);
                gameControlChanged(prizePoint);
            }

            function increaseTicketCost() {
                var index = prizePointList.indexOf(_currentPrizePoint);
                index++;
                if (index >= prizePointList.length) {
                    return;
                }
                audio.play("ButtonGeneric", 0);
                setTicketCostValueWithNotify(prizePointList[index]);
            }

            function decreaseTicketCost() {
                var index = prizePointList.indexOf(_currentPrizePoint);
                index--;
                if (index < 0) {
                    return;
                }
                audio.play("ButtonGeneric", 0);
                setTicketCostValueWithNotify(prizePointList[index]);
            }

            function onInitialize() {
                enableConsole();
            }

            function onReInitialize() {
                if (MTMReinitial) {
                    type = true;
                    setDefaultPricePoint();
                    onInitialize();
                    MTMReinitial = false;
                } else {
                    onErrorReset();
                }
            }

            function onStartUserInteraction(data) {
                disableConsole();
                gr._MerterDim.visible = false;
                shouldShowMeterDim = false;
                if (data.scenario) {
                    _currentPrizePoint = data.price || _currentPrizePoint;
                    var valueString = jLottery.formatCurrency(_currentPrizePoint).formattedAmount;
                    if (!type) {
                        valueString = resLib.i18n.game.button_try + valueString;
                    }
                    gr._TicketCostValue.$text.text = valueString;
                    gr._TicketCostValueBase.$text.text = valueString;
                    gr._buttonPlay.visible = true;
                    gr._buttonPlayMTM.visible = true;
                } else {
                    gr._buttonPlay.visible = false;
                    gr._buttonPlayMTM.visible = false;
                }
                for (var i = 0; i < payTableList.length; i++) {
                    payTableList[i].$text.text = jLottery.formatCurrency(data.prizeTable[i].prize).formattedAmount;
                }
                setTicketCostValueWithNotify(_currentPrizePoint);
                msgBus.publish("ticketCostChanged", _currentPrizePoint);
            }

            function onEnterResultScreenState() {
                if (config.jLotteryPhase === 2) {
                    setTimeout(function() {
                        setTicketCostValueWithNotify(_currentPrizePoint);
                    }, Number(config.compulsionDelayInSeconds) * 1000);
                }
            }

            function onReStartUserInteraction(data) {
                onStartUserInteraction(data);
            }

            function onPlayerBuyOrTry() {
                decreaseButton.enable(false);
                increaseButton.enable(false);
            }

            function playerWantsPlayAgain() {
                gr._MessagePlaque.visible = false;
                gr._BG_dim.visible = false;
                gr._MerterDim.visible = true;
                shouldShowMeterDim = true;
                enableConsole();
                msgBus.publish("resetAll");
            }

            function onDisableMerterDim() {
                merterDimVisible = false;
                if (shouldShowMeterDim) {
                    merterDimVisible = true;
                }
                gr._MerterDim.visible = false;
            }

            function onEnableMerterDim() {
                if (merterDimVisible) {
                    gr._MerterDim.visible = true;
                }
            }

            function meterVisible() {
                merterDimVisible = true;
            }

            function setDefaultPricePoint() {
                setTicketCostValueWithNotify(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
            }

            function onErrorReset() {
                if (_currentPrizePoint) {
                    resetAll(_currentPrizePoint);
                } else {
                    setDefaultPricePoint();
                }
                gr._MerterDim.visible = true;
                enableConsole();
            }

            function onPlayerWantsToMoveToMoneyGame() {
                MTMReinitial = true;
            }
            msgBus.subscribe('jLotterySKB.reset', onErrorReset);
            msgBus.subscribe("onMeterVisible", meterVisible);
            msgBus.subscribe("onDisableMerterDim", onDisableMerterDim);
            msgBus.subscribe("onEnableMerterDim", onEnableMerterDim);
            msgBus.subscribe("jLottery.reStartUserInteraction", onReStartUserInteraction);
            msgBus.subscribe("jLottery.initialize", onInitialize);
            msgBus.subscribe("jLottery.reInitialize", onReInitialize);
            msgBus.subscribe("jLottery.startUserInteraction", onStartUserInteraction);
            msgBus.subscribe("jLottery.enterResultScreenState", onEnterResultScreenState);
            msgBus.subscribe("playerBuyOrTry", onPlayerBuyOrTry);
            msgBus.subscribe("playerWantsPlayAgain", playerWantsPlayAgain);
            msgBus.subscribe("jLotterySKB.onConsoleControlChanged", onConsoleControlChanged);
            msgBus.subscribe("SKBeInstant.gameParametersUpdated", onGameParametersUpdated);
            msgBus.subscribe('playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoneyGame);
        };
    }
);