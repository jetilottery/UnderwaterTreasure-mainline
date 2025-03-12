define([
    'com/createjs/easeljs',
    'game/util/GladRenderer',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/audio',
    'game/meters',
    'game/resultDialog',
    'game/playAnimation',
    'game/revealAllButton',
    'game/buyAndTryButton',
    'game/ticketCost',
    'game/playWithMoney',
    'game/exitButton',
    "game/paytable",
    "game/tutorial",
    "game/playAgainController",
    "game/gameUtil",
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/helpPage',
    'game/gladButton',
    'game/background',
    'game/loading',
    'skbJet/componentCRDC/IwGameControllers/jLotteryInnerLoarderUIController',
    'skbJet/component/resourceLoader/resourceLib'
], function(
    cjs,
    GladRenderer,
    gameMsgBus,
    audio,
    meters,
    resultDialog,
    playAnimation,
    revealAllButton,
    buyAndTryButton,
    ticketCost,
    playWithMoney,
    exitButton,
    paytable,
    turtorial,
    playAgainController,
    gameUtil,
    SKBeInstant,
    helpPage,
    gladButton,
    background,
    loading,
    jLotteryInnerLoarderUIController,
    resLib
) {
    loading();
    cjs = window.createjs;
    var jLottery = {
        playerWantsToMoveToMoneyGame: function() {
            gameMsgBus.publish('jLotteryGame.playerWantsToMoveToMoneyGame');
        },
        playerWantsToPlay: function(price, spots) {
            gameMsgBus.publish('jLotteryGame.playerWantsToPlay', { price: price, spots: spots });
        },
        playerWantsToRePlay: function(price, spots) {
            gameMsgBus.publish('jLotteryGame.playerWantsToRePlay', { price: price, spots: spots });
        },
        ticketResultHasBeenSeen: function(tierPrizeShown, amountWonShown) {
            gameMsgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
                tierPrizeShown: tierPrizeShown,
                formattedAmountWonShown: SKBeInstant.formatCurrency(amountWonShown).formattedAmount
            });
        },
        playerWantsToExit: function() {
            gameMsgBus.publish('jLotteryGame.playerWantsToExit');
        },
        revealDataSave: function(data) {
            gameMsgBus.publish('jLotteryGame.revealDataSave', data);
        },
        error: function(data) {
            gameMsgBus.publish('jLotteryGame.error', data);
        },
        formatCurrency: SKBeInstant.formatCurrency
    };
    var warningContinueButton, warningExitButton, errorExitButton;

    function init(config, spriteSheets) {
        //init stage
        var canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        SKBeInstant.getGameContainerElem().appendChild(canvas);
        var stage = new cjs.Stage('gameCanvas');
        var orientation = SKBeInstant.getGameOrientation();
        var gr;
        cjs.Touch.enable(stage);
        if (orientation !== "landscape") {
            config.gameConfigurationDetails.orientation = 'portrait';
            gr = GladRenderer(window._gladPortrait, spriteSheets, stage);
        } else {
            config.gameConfigurationDetails.orientation = 'landscape';
            gr = GladRenderer(window._gladLandscape, spriteSheets, stage);
        }
        gr._GameScene.visible = true;
        meters(gr, config, jLottery);
        resultDialog(gr, config, jLottery);
        revealAllButton(gr, config, jLottery);
        buyAndTryButton(gr, config, jLottery);
        ticketCost(gr, config, jLottery);
        playWithMoney(gr, config, jLottery);
        exitButton(gr, config, jLottery);
        paytable(gr, config, jLottery);
        playAgainController(gr, config, jLottery);
        playAnimation(gr, stage, jLottery);
        turtorial(gr, stage, config, jLottery);
        helpPage(gr, config, jLottery);
        background(gr, canvas);
        audio(gr, config, jLottery);
        //jLotteryInnerLoarderUIController();
        //init controls
        warningContinueButton = new gladButton(gr._warningContinueButton, "buttonCommon", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
        warningExitButton = new gladButton(gr._warningExitButton, "buttonCommon", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
        errorExitButton = new gladButton(gr._errorExitButton, "buttonCommon", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });

        function warn(warning) {
            gr._GameScene.visible = false;
            gr._ErrorScene.visible = true;

            gr._buttonHelp.stage.canvas.parentElement.style.backgroundImage = 'url({0})'.replace(/\{0\}/, resLib.images[gr._ErrorScene.$background].src);
            gr._buttonHelp.stage.canvas.parentElement.style.backgroundRepeat = 'no-repeat';
            gr._buttonHelp.stage.canvas.parentElement.style.backgroundSize = 'cover';
            gr._buttonHelp.stage.canvas.parentElement.style.backgroundPosition = 'center';

            gr._warningExitButton.visible = true;
            gr._warningContinueButton.visible = true;
            gr._errorExitButton.visible = false;
			gr._errorTitle.visible = false;

            gr._warningExitText.$text.text = resLib.i18n.game.warning_button_exitGame;
            gr._warningContinueText.$text.text = resLib.i18n.game.warning_button_continue;
			
            gr._warningText.$text.text = warning.warningMessage;
            gr._warningText.$text.lineHeight = 40;
            warningContinueButton.click(closeErrorWarn);
            warningExitButton.click(function() {
                jLottery.playerWantsToExit();
                audio.play('ButtonGeneric', 0);
            });
        }

        function closeErrorWarn() {
            gr._GameScene.visible = true;
            gr._ErrorScene.visible = false;

            gr._buttonHelp.stage.canvas.parentElement.style.backgroundImage = 'url({0})'.replace(/\{0\}/, resLib.images[gr._GameScene.$background].src);
            gr._buttonHelp.stage.canvas.parentElement.style.backgroundRepeat = 'no-repeat';
            gr._buttonHelp.stage.canvas.parentElement.style.backgroundSize = 'cover';
            gr._buttonHelp.stage.canvas.parentElement.style.backgroundPosition = 'center';
            audio.play('ButtonGeneric', 0);
        }

        function error(error) {
            gr._GameScene.visible = false;
            gr._ErrorScene.visible = true;

            //When error happend, Sound must be silenced.
            audio.muteAudio(gr);
            gr._buttonHelp.stage.canvas.parentElement.style.backgroundImage = 'url({0})'.replace(/\{0\}/, resLib.images[gr._ErrorScene.$background].src);
            gr._buttonHelp.stage.canvas.parentElement.style.backgroundRepeat = 'no-repeat';
            gr._buttonHelp.stage.canvas.parentElement.style.backgroundSize = 'cover';
            gr._buttonHelp.stage.canvas.parentElement.style.backgroundPosition = 'center';

            gr._warningExitButton.visible = false;
            gr._warningContinueButton.visible = false;
            gr._errorExitButton.visible = true;
            gr._errorExitText.$text.text = resLib.i18n.game.error_button_exit;

			gr._errorTitle.visible = true;
			gr._warningText.visible = false;
            gr._errorTitle.$text.text = resLib.i18n.game.error_title;
            gr._errorText.$text.text = error.errorCode + ":" + error.errorDescriptionSpecific + "\n" + error.errorDescriptionGeneric;
            gr._errorText.$text.lineHeight = 40;
            errorExitButton.click(function() {
                jLottery.playerWantsToExit();
                audio.play('ButtonGeneric', 0);
            });
        }

        gameMsgBus.subscribe('jLottery.error', error);
        gameMsgBus.subscribe('jLottery.playingSessionTimeoutWarning', warn);
    }

    return {
        init: init
    };
});