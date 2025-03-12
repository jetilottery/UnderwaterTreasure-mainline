/**
 * @module game/audio
 * @description audio control
 */
define(
    [
        "skbJet/component/gameMsgBus/GameMsgBus",
        "game/gladButton",
        "skbJet/component/resourceLoader/resourceLib",
        'com/createjs/easeljs',
        'com/createjs/soundjs'
    ],
    function(msgBus, gladButton, resourceLib) {
        var cjs = window.createjs;
        var sounds = {};
        var audioOnButton, audioOffButton;
        var registeredSound;
        var gameChannelParam;
        var grClone;
        var SKBeInstant;
		var audioDisabled = false;

        function popUpEnableAudioDialog(data) {
            var mask = document.createElement('div');
            mask.style.width = '100%';
            mask.style.height = '100%';
            mask.style.backgroundColor = 'rgba(0,0,0,.9)';
            mask.style.position = 'absolute';
            mask.style.zIndex = 8;
            mask.style.top = '0';
            mask.style.left = '0';
            document.body.appendChild(mask);
            var panel = document.createElement('div');
            panel.style.width = '240px';
            panel.style.height = '100px';
            panel.style.backgroundColor = 'black';
            panel.style.border = '2px solid white';
            panel.style.borderRadius = '14px';
            panel.style.position = 'absolute';
            panel.style.zIndex = 10;
            panel.style.top = '50%';
            panel.style.left = '50%';
            panel.style.marginTop = '-50px';
            panel.style.marginLeft = '-122px';
            var winW = Number(window.innerWidth);
            var winH = Number(window.innerHeight);
            var winS = winW > winH ? winH : winW;
            var dialogScale = winS > 600 ? winS / 600 : 1;
            panel.style.transform = 'scale(' + dialogScale + ')';
            mask.appendChild(panel);
            var p = document.createElement('p');
            p.style.width = '220px';
            p.style.height = '40px';
            p.style.margin = '10px';
            p.style.color = 'white';
            p.style.font = 'normal 20px Arial';
            p.style.textAlign = 'center';
            p.innerHTML = data.query;
            panel.appendChild(p);
            var yesBtn = document.createElement('button');
            yesBtn.style.width = '60px';
            yesBtn.style.height = '26px';
            yesBtn.style.backgroundColor = '#DDDDDD';
            yesBtn.style.border = '2px solid white';
            yesBtn.style.borderRadius = '5px';
            yesBtn.style.float = 'left';
            yesBtn.style.marginLeft = '33px';
            yesBtn.style.color = 'balck';
            yesBtn.innerHTML = data.yes;
            yesBtn.id = 'audio_btn_YES';
            panel.appendChild(yesBtn);
            var noBtn = document.createElement('button');
            noBtn.style.width = '60px';
            noBtn.style.height = '26px';
            noBtn.style.backgroundColor = '#DDDDDD';
            noBtn.style.border = '2px solid white';
            noBtn.style.borderRadius = '5px';
            noBtn.style.float = 'right';
            noBtn.style.marginRight = '33px';
            noBtn.style.color = 'balck';
            noBtn.innerHTML = data.no;
            noBtn.id = 'audio_btn_NO';
            panel.appendChild(noBtn);

            function stopPropagation(event) {
                var evt = event ? event : window.event;
                evt.stopPropagation();
                evt.cancelBubble = true;
            }

            function playerAudioChoice(event) {
                stopPropagation(event);
                document.body.removeChild(mask);
                var audioEnabled = false;
                if (this.id === 'audio_btn_YES') {
                    audioEnabled = true;
                }
                /*for (var key in resourceLib.audio) {
                    audioPlayer.play(key, 'temp');
                    audioPlayer.stopChannel('temp');
                    break;
                }*/
                cjs.Sound.muted = !audioEnabled;
                registerSound(audioEnabled);
                onPlayerSelectedAudioWhenGameLaunch(audioEnabled);
            }

            yesBtn.addEventListener('click', playerAudioChoice);
            noBtn.addEventListener('click', playerAudioChoice);
            mask.addEventListener('click', stopPropagation);
        }

        function onBeforeShowStage() {
            if (!registeredSound) {
                if (gameChannelParam !== 'INT') { //if mobile or tablet, add rotate animation css
                    var data = {
                        "query": resourceLib.i18n.game.audioLoader.confirm,
                        "yes": resourceLib.i18n.game.audioLoader.yes,
                        "no": resourceLib.i18n.game.audioLoader.no
                    };
                    popUpEnableAudioDialog(data);
                } else {
                    registerSound(true);
                    setTimeout(function() {
                        cjs.Sound.muted = true;
                        audioSwitch();
                    }, 20);
                }
            }
        }

        /// fix audio blocked issue on mobile
        function onGameParametersUpdated() {
            SKBeInstant = require('skbJet/component/SKBeInstant/SKBeInstant');
            if (!SKBeInstant.isSKB()) {
                if (SKBeInstant.config.screenEnvironment === 'device') {
                    var data = {
                        "query": resourceLib.i18n.game.audioLoader.confirm,
                        "yes": resourceLib.i18n.game.audioLoader.yes,
                        "no": resourceLib.i18n.game.audioLoader.no
                    };
                    popUpEnableAudioDialog(data);
                }
            }
            msgBus.unsubscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
        }

        function onPlayerSelectedAudioWhenGameLaunch(data) {
			if(SKBeInstant.config.screenEnvironment === "desktop"){
				cjs.Sound.muted = audioDisabled;
				gameAudioControlChanged(audioDisabled);
				return;
			}else{
				audioDisabled = data;
				audioSwitch();
			}
			if(SKBeInstant.config.gameType === 'ticketReady'){
                if (!sounds.BaseMusicLoop || sounds.BaseMusicLoop.playState !== "playSucceeded") {
                    play("BaseMusicLoop", -1);
                }
                sounds.BaseMusicLoop._volume = 0.6;
			}else{
                play("GameInit", 0);
			}
        }

        function onSystemInit(data) {
            gameChannelParam = data.serverConfig.channel;
        }        
		
		var hidden, visibilityChange; 
        if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }
		
        document.addEventListener(visibilityChange, function() {
            var index;
            if (document.visibilityState === hidden) {
                for (index in sounds) {
                    if (sounds[index] && sounds[index].gainNode && sounds[index].gainNode.context.state === 'running') {
                        sounds[index].soundsType = true;
                        sounds[index].paused = true;
                    }
                }
            } else {
                for (index in sounds) {
                    if (sounds[index].soundsType) {
                        sounds[index].soundsType = false;
                        sounds[index].paused = false;
                    }
                }
            }
        });

        function registerSound(audioEnabled) {
            var soundText = "Sound";
            var soundOn = "On",
                soundOff = "Off";
            registeredSound = true;
            if (resourceLib.i18n.game.MenuCommand.audio) {
                soundText = resourceLib.i18n.game.MenuCommand.audio.sound;
                soundOn = resourceLib.i18n.game.MenuCommand.audio.on;
                soundOff = resourceLib.i18n.game.MenuCommand.audio.off;
            }

            msgBus.publish('toPlatform', {
                channel: "Game",
                topic: "Game.Register",
                data: {
                    "options": [{
                        "name": "sound",
                        "text": soundText,
                        "type": "list",
                        "enabled": 1,
                        "value": audioEnabled ? 0 : 1,
                        "values": ["0", "1"],
                        "valueText": [soundOn, soundOff]
                    }]
                }
            });
        }

        function gameAudioControlChanged(mute) {
            var value = 0;
            if (mute) {
                value = 1;
            }
            msgBus.publish("toPlatform", {
                channel: "Game",
                topic: "Game.Control",
                data: { name: "sound", event: "change", params: [value] }
            });
        }

        function consoleAudioControlChanged(data) {
            var isMuted = false;
            if (data.option === "sound" && data.value === "1") {
                isMuted = true;
            }
            return isMuted;
        }

        function onConsoleControlChanged(data) {
            if (data.option === 'sound') {
                var isMuted = consoleAudioControlChanged(data);
                if (isMuted) {
                    grClone._buttonAudioOff_00.visible = true;
                    grClone._buttonAudio_00.visible = false;
                    cjs.Sound.muted = true;
                } else {
                    grClone._buttonAudio_00.visible = true;
                    grClone._buttonAudioOff_00.visible = false;
                    cjs.Sound.muted = false;
                }
            }
        }

        function onMuteChange(data) {
            if (data.option === "sound") {
                cjs.Sound.muted = (data.value === "1");
            }
        }

        function play(id, loop) {
            sounds[id] = cjs.Sound.play(id, { loop: loop });
            if (sounds[id] && sounds[id].gainNode && sounds[id].gainNode.context.state === 'suspended') {
                sounds[id].gainNode.context.resume();
            }
        }

        function stop(id) {
            if (sounds[id]) {
                sounds[id].stop();
            }
        }

        //When error happened, audio should be muted.
        //Add one function to mute audio.
        function muteAudio() {
            if (!cjs.Sound.muted) {
                cjs.Sound.muted = true;
                grClone._buttonAudioOff_00.visible = true;
                grClone._buttonAudio_00.visible = false;
            }
        }

        function audioSwitch() {
            play("ButtonGeneric", 0);
            if (audioDisabled) {
                grClone._buttonAudio_00.visible = true;
                grClone._buttonAudioOff_00.visible = false;
                audioDisabled = false;
            } else {
                grClone._buttonAudioOff_00.visible = true;
                grClone._buttonAudio_00.visible = false;
                audioDisabled = true;
            }
			cjs.Sound.muted = audioDisabled;
            gameAudioControlChanged(audioDisabled);
        }
        function audio(gr, config) {
            grClone = gr;
            audioOnButton = new gladButton(gr._buttonAudio_00, "buttonAudioOn", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
            audioOffButton = new gladButton(gr._buttonAudioOff_00, "buttonAudioOff", { scaleXWhenClick: 0.95, scaleYWhenClick: 0.95 });
			audioDisabled = config.soundStartDisabled;
			if(config.assetPack !== "desktop"){
				audioDisabled = true;
			}
            if (audioDisabled) {
                gr._buttonAudioOff_00.visible = true;
                gr._buttonAudio_00.visible = false;
            } else {
                gr._buttonAudio_00.visible = true;
                gr._buttonAudioOff_00.visible = false;
            }
			cjs.Sound.muted = audioDisabled;
            audioOnButton.click(audioSwitch);
            audioOffButton.click(audioSwitch);

            function onReInitialize() {
                if (sounds.BaseMusicLoop) {
                    sounds.BaseMusicLoop.stop();
                }
                play("GameInit", 0);
            }

            function onInitialize() {
				if(SKBeInstant.config.screenEnvironment === 'device'){
					return;
				}else{
                    play("GameInit", 0);
				}
            }

            function onStartUserInteraction() {
                if (gameChannelParam === 'INT' || SKBeInstant.config.screenEnvironment === 'desktop') {
                    if (!sounds.BaseMusicLoop || sounds.BaseMusicLoop.playState !== "playSucceeded") {
                        play("BaseMusicLoop", -1);
                    }
                    sounds.BaseMusicLoop._volume = 0.6;
                }
            }

            function onEnterResultScreenState() {
                if (sounds.BaseMusicLoop) {
                    sounds.BaseMusicLoop.stop();
                }
                play("BaseMusicLoopTerm", 0);
            }

            function onReStartUserInteraction() {
                play("BaseMusicLoop", -1);
            }

            msgBus.subscribe('platformMsg/Kernel/System.Init', onSystemInit);
            msgBus.subscribe('platformMsg/ConsoleService/Game.Control', onMuteChange);
            msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
            msgBus.subscribe("onBeforeShowStage", onBeforeShowStage);
            msgBus.subscribe("jLottery.reInitialize", onReInitialize);
            msgBus.subscribe("jLottery.initialize", onInitialize);
            msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
            msgBus.subscribe(
                "jLottery.startUserInteraction",
                onStartUserInteraction
            );
            msgBus.subscribe(
                "jLottery.enterResultScreenState",
                onEnterResultScreenState
            );
            msgBus.subscribe(
                "jLottery.reStartUserInteraction",
                onReStartUserInteraction
            );

            return {};
        }

        audio.play = play;
        audio.stop = stop;
        audio.muteAudio = muteAudio;

        return audio;
    }
);