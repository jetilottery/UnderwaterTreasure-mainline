/**
 * @module game/helpPage
 * @description helpPage control
 */
define(
    [
        "game/audio",
        "skbJet/component/gameMsgBus/GameMsgBus",
        "skbJet/component/resourceLoader/resourceLib",
        "skbJet/component/SKBeInstant/SKBeInstant"
    ],
    function(audio, msgBus, resLib, SKBeInstant) {
        return function() {
			var paytableText, howToPlayText;

			function onSystemInit() {
				var articles = document.getElementsByTagName('article');
				for (var i = 0; i < articles.length; i++) {
					articles[i].addEventListener('mousedown', preventDefault, false);
				}
				document.addEventListener('mousemove', preventDefault, false);
			}

			function preventDefault(e) {
				var ev = e || window.event;
				ev.returnValue = false;
				ev.preventDefault();
			}

			function onGameInit() {
        		registerConsole();
			}
			
			function onBeforeShowStage() {
				fillHeaders();
				fillContent();
				fillCloseBtn();
				titleGo();
			}

			function titleGo() {
				var li = document.getElementsByTagName("li");
				var gameRulesSection = document.getElementsByTagName("section")[0];
				var howToPlay = document.getElementById("howToPlay");
				var autoReveal = document.getElementById("autoReveal");
				var aboutTheGame = document.getElementById("aboutTheGame");
				var rules = document.getElementById("rules");
				var topBack = document.getElementsByTagName("b");
				var gameRulesTitle = [howToPlay,autoReveal,aboutTheGame,rules];
				var index;
				function gameRulsTitle(index){
					return function(){
						gameRulesSection.scrollTop = gameRulesTitle[index].offsetTop - gameRulesTitle[index].offsetHeight*4;
					};
				}
				function topBackUp(){
					return function(){
						gameRulesSection.scrollTop = 0;
					};
				}
				for (var i = 0; i < li.length; i++) {
					index = i;
					li[index].onclick = gameRulsTitle(index);
				}
				for (i = 0; i < topBack.length; i++) {
					index = i;         
					topBack[index].onclick = topBackUp();
				}
			}

			function onStartUserInteraction() {
				disableConsole();
			}

			function onReStartUserInteraction() {
				disableConsole();
			}

			function onReInitialize() {
				enableConsole();
			}

			function registerConsole() {
				if(SKBeInstant.isWLA()){
					paytableText = resLib.i18n.game.MenuCommand.WLA.payTable;
					howToPlayText = resLib.i18n.game.MenuCommand.WLA.howToPlay;
				}else{
					paytableText = resLib.i18n.game.MenuCommand.Commercial.payTable;
					howToPlayText = resLib.i18n.game.MenuCommand.Commercial.howToPlay;
				}
				msgBus.publish('toPlatform', {
					channel: "Game",
					topic: "Game.Register",
					data: {
						options: [{
							type: 'command',
							name: 'paytable',
							text: paytableText,
							enabled: 1
						}]
					}
				});
				msgBus.publish('toPlatform', {
					channel: "Game",
					topic: "Game.Register",
					data: {
						options: [{
							type: 'command',
							name: 'howToPlay',
							text: howToPlayText,
							enabled: 1
						}]
					}
				});
			}

			function enableConsole() {
				msgBus.publish('toPlatform', {
					channel: "Game",
					topic: "Game.Control",
					data: { "name": "howToPlay", "event": "enable", "params": [1] }
				});
				msgBus.publish('toPlatform', {
					channel: "Game",
					topic: "Game.Control",
					data: { "name": "paytable", "event": "enable", "params": [1] }
				});
			}

			function disableConsole() {
				msgBus.publish('toPlatform', {
					channel: "Game",
					topic: "Game.Control",
					data: { "name": "howToPlay", "event": "enable", "params": [0] }
				});
				msgBus.publish('toPlatform', {
					channel: "Game",
					topic: "Game.Control",
					data: { "name": "paytable", "event": "enable", "params": [0] }
				});
			}

			function fillHeaders() {
				var gameRulesHeader = document.getElementById('gameRulesHeader');
				var payTableHeader = document.getElementById('paytableHeader');
				gameRulesHeader.innerHTML = howToPlayText;
				payTableHeader.innerHTML = paytableText;
			}

			function fillContent() {
				//fill paytable
				var paytableText = resLib.i18n.payTable.replace(/\"/g, "'");
				var tHead = '<th>PRIZE LEVEL</th>';
				var tBody = '';

				var revealConfigurations = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
				var availablePrices = SKBeInstant.config.gameConfigurationDetails.availablePrices;
				var i, j;
				for (i = 0; i < availablePrices.length; i++) {
					tHead += '<th>' + SKBeInstant.formatCurrency(availablePrices[i]).formattedAmount + '</th>';
				}
				paytableText = paytableText.replace('{paytableHead}', tHead);

				for (i = 0; i < revealConfigurations[0].prizeTable.length; i++) {
					tBody += '<tr>';
					tBody += '<td>' + (i + 1) + '</td>';
					for (j = 0; j < availablePrices.length; j++) {
						tBody += '<td>' + SKBeInstant.formatCurrency(revealConfigurations[j].prizeTable[i].prize).formattedAmount + '</td>';
					}
					tBody += '</tr>';
				}

				paytableText = paytableText.replace('{paytableBody}', tBody);

				var paytableBox = document.getElementById('paytableArticle');
				paytableBox.innerHTML = paytableText;

				var howToPlayText = resLib.i18n.help.replace(/\"/g, "'");
				var howToPlayBox = document.getElementById('gameRulesArticle');
				howToPlayBox.innerHTML = howToPlayText;
			}

			function fillCloseBtn() {
				var buttons = document.getElementsByClassName('closeBtn');
				Array.prototype.forEach.call(buttons, function (item) {
					item.innerHTML = resLib.i18n.game.buttonClose;
					item.onclick = function () { showOne('game'); };
				});
			}

			function showOne(id) {
				var tabs = document.getElementsByClassName('tab');
				for (var i = 0; i < tabs.length; i++) {
					tabs[i].style.display = 'none';
				}
				audio.play('ButtonGeneric', 0);
				document.getElementById(id).style.display = 'block';
			}


			//retrigger clickbtn
			function onGameControl(data) {
				if (data.option === 'paytable' || data.option === 'howToPlay') {
					var id = data.option === 'howToPlay' ? 'gameRules' : 'paytable';
					if (document.getElementById(id).style.display === 'block') {
						showOne('game');
					} else {
						showOne(id);
					}
				}
			}

			function onAbortNextStage() {
				disableConsole();
			}

			function onResetNextStage() {
				enableConsole();
			}

			function onEnterResultScreenState() {
				enableConsole();
			}

			msgBus.subscribe('platformMsg/Kernel/System.Init', onSystemInit);
			msgBus.subscribe('platformMsg/ClientService/Game.Init', onGameInit);
			msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
			msgBus.subscribe('onAbortNextStage', onAbortNextStage);
			msgBus.subscribe('onResetNextStage', onResetNextStage);
			msgBus.subscribe('platformMsg/ConsoleService/Game.Control', onGameControl);

			msgBus.subscribe('jLottery.reInitialize', onReInitialize);
			msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
			msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
			msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
			return {};





            // var fontFamily = config.locale === "en_us" ? " Arial" : " SimHei";

            // function openHelp() {
            //     gr._GameScene.visible = false;
            //     gr._HelpScene.visible = true;
            //     if (config.gameConfigurationDetails.orientation === "landscape") {
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundImage = "url({0})".replace(/\{0\}/, resLib.images[gr._HelpScene.$background].src);
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundRepeat = "no-repeat";
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundSize = "cover";
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundPosition = "center";
            //     } else {
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundImage = "url({0})".replace(/\{0\}/, resLib.images[gr._HelpScene.$background].src);
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundRepeat = "no-repeat";
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundSize = "cover";
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundPosition = "center";
            //     }
            //     audio.play("ButtonGeneric", 0);
            //     gr._helpWinValue.$text.text = gr._WinsValue.$text.text || config.defaultWinsValue;
            // }

            // function closeHelp() {
            //     gr._GameScene.visible = true;
            //     gr._HelpScene.visible = false;
            //     if (config.gameConfigurationDetails.orientation === "landscape") {
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundImage = "url({0})".replace(/\{0\}/, resLib.images[gr._GameScene.$background].src);
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundRepeat = "no-repeat";
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundSize = "cover";
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundPosition = "center";
            //     } else {
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundImage = "url({0})".replace(/\{0\}/, resLib.images[gr._GameScene.$background].src);
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundRepeat = "no-repeat";
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundSize = "cover";
            //         gr._buttonHelp.stage.canvas.parentElement.style.backgroundPosition = "center";
            //         audio.play("ButtonGeneric", 0);
            //     }
            // }

            // function onTicketCostChanged(prizePoint) {
            //     var rc = config.gameConfigurationDetails.revealConfigurations;
            //     for (var i = 0; i < rc.length; i++) {
            //         if (Number(prizePoint) === Number(rc[i].price)) {
            //             var ps = rc[i].prizeStructure;
            //             var maxPrize = 0;
            //             for (var j = 0; j < ps.length; j++) {
            //                 var prize = Number(ps[j].prize);
            //                 if (maxPrize < prize) {
            //                     maxPrize = prize;
            //                 }
            //             }
            //             gr._WinUpToText.$text.text = resLib.i18n.game.ui_winUpToAmount + " " + SKBeInstant.formatCurrency(maxPrize).formattedAmount + "!";
            //             gr._WinUpToText.$text.font = "600 50px" + fontFamily;
            //             return;
            //         }
            //     }
            // }
            // gr._buttonHelp.on("click", openHelp);
            // gr._helpBG.on("click", closeHelp);
            // gr._buttonCloseHelp.on("click", closeHelp);
            // gr._HelpScene.visible = false;
            // gr._HowToPlayTitle.$text.text = resLib.i18n.game.PrizeXBonus;
            // gr._HowToPlayTitle.$text.font = "45px" + fontFamily;
            // if (gr._HelpScene.stage.canvas.width > gr._HelpScene.stage.canvas.height) {
            //     gr._GameRules.$text.text = resLib.i18n.game.help_text_landscape;
            // } else {
            //     gr._GameRules.$text.text = resLib.i18n.game.help_text_portrait;
            // }
            // gr._GameRules.$text.font = "24px" + fontFamily;
            // gr._GameRules.$text.lineHeight = 40;
            // //var totalWith = gr._HowToPlayTitle.$text.getMeasuredWidth();
            // gr._HowToPlayTitle.$text.x = gr._HowToPlayTitle.regX; //-totalWith/2;
            // gr._helpBalanceText.$text.text = resLib.i18n.game.balance;
            // //gr._helpWinValue.$text.text = gr._WinsValue.$text.text;
            // function onReInitialize() {
            //     gr._buttonHelp.visible = true;
            // }
            // msgBus.subscribe("jLottery.reInitialize", onReInitialize);
            // msgBus.subscribe("ticketCostChanged", onTicketCostChanged);
        };
    }
);
