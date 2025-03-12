/**
 * @module game/exitButton
 * @description exit button control
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
            var exitIButton, exitIIButton;
            var whilePlaying = false;

            function exitButton() {
                audio.play("ButtonGeneric", 0);
                jLottery.playerWantsToExit();
            }

            function onGameParametersUpdated() {
                exitIButton = new gladButton(gr._buttonExit, "buttonHome", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                exitIIButton = new gladButton(gr._buttonExitII, "buttonCommon", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
                exitIButton.click(exitButton);
                exitIIButton.click(exitButton);
                gr._textExit.$text.text = resLib.i18n.game.button_exit;
                gr._textExit.$text.shadow = new window.createjs.Shadow("#000000", 2, 2, 2);
                gr._buttonExit.visible = false;
                gr._buttonExitII.visible = false;
            }

            function onStartUserInteraction() {
                whilePlaying = true;
                gr._buttonExit.visible = false;
            }

            function onEnterResultScreenState() {
                if (Number(SKBeInstant.config.jLotteryPhase) === 1) {
                    gr._buttonExitII.visible = true;
                }else{
                    whilePlaying = false;
                    gr._buttonExit.visible = true;
                }
            }

            function onDisableUI() {
                gr._buttonExit.visible = false;
            }

            function onEnableUI() {
                if (Number(SKBeInstant.config.jLotteryPhase) === 2 && !whilePlaying) {
                    gr._buttonExit.visible = true;
                }else{
                    gr._buttonExit.visible = false;
                }
            }

            function onReStartUserInteraction() {
                onStartUserInteraction();
            }

            function onReInitialize(){
                whilePlaying = false;
                gr._buttonExit.visible = true;
            }

            msgBus.subscribe('jLottery.reInitialize', onReInitialize);
            msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
            msgBus.subscribe("jLotterySKB.reset", onEnableUI);
            msgBus.subscribe("disableUI", onDisableUI);
            msgBus.subscribe("enableUI", onEnableUI);
            msgBus.subscribe("jLottery.enterResultScreenState", onEnterResultScreenState);
            msgBus.subscribe("jLottery.startUserInteraction", onStartUserInteraction);
            msgBus.subscribe("jLottery.reStartUserInteraction", onReStartUserInteraction);
        };
    }
);