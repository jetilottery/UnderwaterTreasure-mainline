/**
 * @module game/ticketCost
 * @description ticket cost meter control
 */
define(['skbJet/component/gameMsgBus/GameMsgBus'], function (msgBus) {
    return function (gr, config, jLottery) {     
        //Init avaliable prize point list
        
		var payTableList = [gr._textCrown,gr._textDiamond,gr._textBigGem,gr._textPearl,gr._textGem,gr._textGoldCoin];

        var prePrice = null;
        function resetPaytable() {
            for(var i=0;i<6;i++){
                gr["_smallCrown_0"+i].visible = false;
                gr["_smallDiamond_0"+i].visible = false;
            }
            for(var i=0;i<5;i++){
                gr["_smallBigGem_0"+i].visible = false;
                gr["_smallPearl_0"+i].visible = false;
            }
            for(var i=0;i<4;i++){
                gr["_smallGem_0"+i].visible = false;
                gr["_smallGoldCoin_0"+i].visible = false;
            }
            for(var i=0;i<14;i++){
                i = i>=10?i:"0"+i;
                gr["_shipSign_"+i].visible = false;
            }
        }
        
        function setPaytableValue(prizePoint){
            if(prePrice === prizePoint){
				return;
			}
			var prizePointList = [];
			for (var i = 0; i < config.gameConfigurationDetails.revealConfigurations.length; i++) {
				prizePointList.push(config.gameConfigurationDetails.revealConfigurations[i].price);
			}
            prePrice = prizePoint;
            resetPaytable();
            var index = prizePointList.indexOf(prizePoint);
            if (index < 0) {
                throw new Error('Invalide prize point ' + prizePoint);
            }           
            
            for(var i = 0; i < payTableList.length; i++){
                var value = config.gameConfigurationDetails.revealConfigurations[index].prizeTable[i]["prize"];
				payTableList[i].$text.text = jLottery.formatCurrency(value).formattedAmount;
            }          
        }
        
        function onInitialize() {
            resetPaytable();
            setPaytableValue(config.gameConfigurationDetails.pricePointGameDefault);
        }

        function onReInitialize(data) {
            prePrice = null;
            onInitialize(data);
         }

        function onStartUserInteraction() {
            resetPaytable();
        }

        function onReStartUserInteraction(data) {
            onStartUserInteraction(data);
        }
        
        function onTicketCostChanged(prizePoint){
            setPaytableValue(prizePoint);            
        }
        
        msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
        msgBus.subscribe('jLottery.initialize', onInitialize);
        msgBus.subscribe('jLottery.reInitialize', onReInitialize);
        msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
        msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    };
});