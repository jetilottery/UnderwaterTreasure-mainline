/**
 * @module game/meters
 * @description meters control
 */
define(
    [
        "skbJet/component/gameMsgBus/GameMsgBus",
        "game/gameUtil",
        "skbJet/component/resourceLoader/resourceLib",
        "skbJet/component/SKBeInstant/SKBeInstant",
        "skbJet/component/currencyHelper/currencyHelper"
    ],
    function(msgBus, gameUtil, resLib, SKBeInstant, currencyHelper) {
        return function(gr, config) {
            var resultData = null;

            function onGameParametersUpdated(data) {
                onInitialize(data);
                gr._BalanceText.$text.text = resLib.i18n.game.balance;
                gr._meter_division_00.$text.text = resLib.i18n.game.meter_division;
                gr._meter_division_01.$text.text = resLib.i18n.game.meter_division;
                gr._WinsValue.$text.text = config.defaultWinsValue;
                gr._BalanceValue.$text.text = "";
                if (SKBeInstant.config.wagerType === "BUY") {
                    gr._WinsText.$text.text = resLib.i18n.game.wins;
                } else {
                    gr._WinsText.$text.text = resLib.i18n.game.wins_demo;
                }
                gr._BalanceText.originFontSize = gr._BalanceText.$text.font.match(/(\d+\w{2})/)[0].substr(0, 2);
                gameUtil.fixMeter(gr);
            }

            function onBeforeShowStage(data) {
                gr._BalanceValue.$text.text = currencyHelper.formatBalance(data.response.Balances["@totalBalance"]);
                gameUtil.fixMeter(gr);
            }

            function showSKBBalance() {
                //config.wagerType === 'BUY' || SKBeInstant.isSKB() && config.wagerType === 'TRY' && (Number(SKBeInstant.config.demosB4Move2MoneyButton) !== -1) && config.balanceDisplayInGame
                if (
                    (SKBeInstant.config.wagerType === "BUY" ||
                        (SKBeInstant.config.wagerType === "TRY" && SKBeInstant.isSKB() && Number(SKBeInstant.config.demosB4Move2MoneyButton) !== -1)) &&
                    SKBeInstant.config.balanceDisplayInGame
                ) {
                    gr._BalanceText.visible = true;
                    gr._BalanceValue.visible = true;
                    gr._meter_division_00.visible = true;
                } else {
                    gr._BalanceText.visible = false;
                    gr._BalanceValue.visible = false;
                    gr._meter_division_00.visible = false;
                }
            }

            function onInitialize() {
                //config.wagerType === 'BUY' || (config.wagerType === 'TRY' && SKBeInstant.isSKB() && (Number(SKBeInstant.config.demosB4Move2MoneyButton) !== -1))
                if (
                    SKBeInstant.config.wagerType === "BUY" ||
                    (SKBeInstant.config.wagerType === "TRY" && SKBeInstant.isSKB() && Number(SKBeInstant.config.demosB4Move2MoneyButton) !== -1)
                ) {
                    gr._BalanceText.visible = true;
                    gr._BalanceValue.visible = true;
                    gr._meter_division_00.visible = true;
                } else {
                    gr._BalanceText.visible = false;
                    gr._BalanceValue.visible = false;
                    gr._meter_division_00.visible = false;
                }
                gr._WinsValue.$text.text = SKBeInstant.config.defaultWinsValue;
            }

            function onStartUserInteraction(data) {
                showSKBBalance();
                gr._WinsValue.$text.text = SKBeInstant.config.defaultWinsValue;
                resultData = data;
                gameUtil.fixMeter(gr);
            }

            function onEnterResultScreenState() {
                //config.wagerType === 'BUY' || (config.wagerType === 'TRY' && SKBeInstant.isSKB() && (Number(config.demosB4Move2MoneyButton) !== -1))
                if (
                    SKBeInstant.config.wagerType === "BUY" ||
                    (SKBeInstant.config.wagerType === "TRY" && SKBeInstant.isSKB() && Number(SKBeInstant.config.demosB4Move2MoneyButton) !== -1)
                ) {
                    gr._BalanceText.visible = true;
                    gr._BalanceValue.visible = true;
                    gr._meter_division_00.visible = true;
                } else {
                    gr._BalanceText.visible = false;
                    gr._BalanceValue.visible = false;
                    gr._meter_division_00.visible = false;
                }
                if (resultData.prizeValue > 0) {
                    gr._WinsValue.$text.text = SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount;
                }
                gameUtil.fixMeter(gr);
            }

            function onReStartUserInteraction(data) {
                onStartUserInteraction(data);
            }

            function onReInitialize(data) {
                gr._WinsText.$text.text = resLib.i18n.game.wins;
                onInitialize(data);
            }

            function onUpdateBalance(data) {
                gr._BalanceValue.$text.text = data.formattedBalance;
                gameUtil.fixMeter(gr);
            }

            function onPlayerWantsPlayAgain() {
                gr._WinsValue.$text.text = SKBeInstant.config.defaultWinsValue;
                gameUtil.fixMeter(gr);
            }
            msgBus.subscribe("jLottery.updateBalance", onUpdateBalance);
            msgBus.subscribe("jLotterySKB.reset", onInitialize);
            msgBus.subscribe("onBeforeShowStage", onBeforeShowStage);
            msgBus.subscribe("jLottery.reInitialize", onReInitialize);
            msgBus.subscribe("jLottery.reStartUserInteraction", onReStartUserInteraction);
            msgBus.subscribe("jLottery.initialize", onInitialize);
            msgBus.subscribe("jLottery.startUserInteraction", onStartUserInteraction);
            msgBus.subscribe("jLottery.enterResultScreenState", onEnterResultScreenState);
            msgBus.subscribe("playerWantsPlayAgain", onPlayerWantsPlayAgain);
            msgBus.subscribe("SKBeInstant.gameParametersUpdated", onGameParametersUpdated);
        };
    }
);
