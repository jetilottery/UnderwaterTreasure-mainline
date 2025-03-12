define(function() {

    function setTextStyle(Sprite, style) {
        for (var key in style) {
            Sprite.pixiContainer.$text.style[key] = style[key];
        }
    }

    //ramdom sort Array
    function randomSort(Array) {
        var len = Array.length;
        var i, j, k;
        var temp;

        for (i = 0; i < Math.floor(len / 2); i++) {
            j = Math.floor((Math.random() * len));
            k = Math.floor((Math.random() * len));
            while (k === j) {
                k = Math.floor((Math.random() * len));
            }
            temp = Array[j];
            Array[j] = Array[k];
            Array[k] = temp;
        }
    }

    function updateFontSize(obj, fontSize) {
        var fontWeight = obj.$text.font.substr(0, obj.$text.font.indexOf(" ") + 1);
        var fontFamily = obj.$text.font.substr(obj.$text.font.lastIndexOf(" "));
        obj.$text.font = fontWeight + fontSize + fontFamily;
    }

    function fixMeter(gr) {
        var balanceText = gr._BalanceText;
        var balanceValue = gr._BalanceValue;
        var meterDivision0 = gr._meter_division_00;
        var ticketCostMeterText = gr._TicketCostTextBase;
        var ticketCostMeterValue = gr._TicketCostValueBase;
        var meterDivision1 = gr._meter_division_01;
        var winsText = gr._WinsText;
        var winsValue = gr._WinsValue;
        var len = gr._Meters.regX * 2;
        var temp, balanceLeft;
        var originFont = balanceText.$text.font.match(/[0-9]+px/g).join();
        var originFontSize = originFont.match(/[0-9]+/g).join();
        if (balanceText.visible) {
            updateFontSize(balanceText, originFont);
            updateFontSize(balanceValue, originFont);
            updateFontSize(ticketCostMeterText, originFont);
            updateFontSize(ticketCostMeterValue, originFont);
            updateFontSize(winsText, originFont);
            updateFontSize(winsValue, originFont);
            temp = (len - (ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision0.$text.getMeasuredWidth() + balanceText.$text.getMeasuredWidth() + balanceValue.$text.getMeasuredWidth() + meterDivision1.$text.getMeasuredWidth() + winsText.$text.getMeasuredWidth() + winsValue.$text.getMeasuredWidth())) / 2;
            balanceLeft = (len - ticketCostMeterText.$text.getMeasuredWidth() - ticketCostMeterValue.$text.getMeasuredWidth()) / 2;
            balanceLeft = balanceLeft - meterDivision0.$text.getMeasuredWidth() - balanceText.$text.getMeasuredWidth() - balanceValue.$text.getMeasuredWidth();
            if (temp >= 6) {
                if (balanceLeft >= 0) {
                    ticketCostMeterText.x = (len - ticketCostMeterText.$text.getMeasuredWidth() - ticketCostMeterValue.$text.getMeasuredWidth()) / 2 + ticketCostMeterText.regX;
                    ticketCostMeterValue.x = ticketCostMeterText.x - ticketCostMeterText.regX + ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.regX;
                    meterDivision0.x = ticketCostMeterText.x - ticketCostMeterText.regX - meterDivision0.$text.getMeasuredWidth() + meterDivision0.regX;
                    balanceValue.x = meterDivision0.x - meterDivision0.regX - balanceValue.$text.getMeasuredWidth() + balanceValue.regX;
                    balanceText.x = balanceValue.x - balanceValue.regX - balanceText.$text.getMeasuredWidth() + balanceText.regX;
                    meterDivision1.x = ticketCostMeterValue.x - ticketCostMeterValue.regX + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision1.regX;
                    winsText.x = meterDivision1.x - meterDivision1.regX + meterDivision1.$text.getMeasuredWidth() + winsText.regX;
                    winsValue.x = winsText.x - winsText.regX + winsText.$text.getMeasuredWidth() + winsValue.regX;
                } else {
                    balanceText.x = temp + balanceText.regX;
                    balanceValue.x = balanceText.x - balanceText.regX + balanceText.$text.getMeasuredWidth() + balanceValue.regX;
                    meterDivision0.x = balanceValue.x - balanceValue.regX + balanceValue.$text.getMeasuredWidth() + meterDivision0.regX;
                    ticketCostMeterText.x = meterDivision0.x - meterDivision0.regX + meterDivision0.$text.getMeasuredWidth() + ticketCostMeterText.regX;
                    ticketCostMeterValue.x = ticketCostMeterText.x - ticketCostMeterText.regX + ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.regX;
                    meterDivision1.x = ticketCostMeterValue.x - ticketCostMeterValue.regX + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision1.regX;
                    winsText.x = meterDivision1.x - meterDivision1.regX + meterDivision1.$text.getMeasuredWidth() + winsText.regX;
                    winsValue.x = winsText.x - winsText.regX + winsText.$text.getMeasuredWidth() + winsValue.regX;
                }
            } else {
                var left = temp;
                for (var fsize = Number(originFontSize) - 1; fsize >= 1 && left < 6; fsize--) {
                    var fsizeFont = fsize + 'px';
                    updateFontSize(balanceText, fsizeFont);
                    updateFontSize(balanceValue, fsizeFont);
                    updateFontSize(ticketCostMeterText, fsizeFont);
                    updateFontSize(ticketCostMeterValue, fsizeFont);
                    updateFontSize(winsText, fsizeFont);
                    updateFontSize(winsValue, fsizeFont);
                    left = (len - (ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision0.$text.getMeasuredWidth() + balanceText.$text.getMeasuredWidth() + balanceValue.$text.getMeasuredWidth() + meterDivision1.$text.getMeasuredWidth() + winsText.$text.getMeasuredWidth() + winsValue.$text.getMeasuredWidth())) / 2;
                }
                balanceText.x = left + balanceText.regX;
                balanceValue.x = balanceText.x - balanceText.regX + balanceText.$text.getMeasuredWidth() + balanceValue.regX;
                meterDivision0.x = balanceValue.x - balanceValue.regX + balanceValue.$text.getMeasuredWidth() + meterDivision0.regX;
                ticketCostMeterText.x = meterDivision0.x - meterDivision0.regX + meterDivision0.$text.getMeasuredWidth() + ticketCostMeterText.regX;
                ticketCostMeterValue.x = ticketCostMeterText.x - ticketCostMeterText.regX + ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.regX;
                meterDivision1.x = ticketCostMeterValue.x - ticketCostMeterValue.regX + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision1.regX;
                winsText.x = meterDivision1.x - meterDivision1.regX + meterDivision1.$text.getMeasuredWidth() + winsText.regX;
                winsValue.x = winsText.x - winsText.regX + winsText.$text.getMeasuredWidth() + winsValue.regX;
            }
        } else {
            ticketCostMeterText.x = (len - (ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision1.$text.getMeasuredWidth() + winsText.$text.getMeasuredWidth() + winsValue.$text.getMeasuredWidth())) / 2 + ticketCostMeterText.regX;
            ticketCostMeterValue.x = ticketCostMeterText.x - ticketCostMeterText.regX + ticketCostMeterText.$text.getMeasuredWidth() + ticketCostMeterValue.regX;
            meterDivision1.x = ticketCostMeterValue.x - ticketCostMeterValue.regX + ticketCostMeterValue.$text.getMeasuredWidth() + meterDivision1.regX + 10;
            winsText.x = meterDivision1.x - meterDivision1.regX + meterDivision1.$text.getMeasuredWidth() + winsText.regX + 10;
            winsValue.x = winsText.x - winsText.regX + winsText.$text.getMeasuredWidth() + winsValue.regX;
        }
    }

    function fixTicketSelect(gr, prizePointList, normalNumber) {
        var ticketSelectWidth = gr._select.regX * 2;
        var iconNumber = prizePointList.length;
        var originX = gr._select_00.x;
        if (iconNumber === normalNumber) {
            return;
        } else {
            //var scale = gr._ticketCostLevelIcon_0.scaleX;
            var lastTicketIcon = gr['_select_0' + (iconNumber - 1)];
            var iconWidth = Math.round(lastTicketIcon.getBounds().width);
            var len = lastTicketIcon.x + iconWidth - gr._select_00.x;
            var currentLeft = (ticketSelectWidth - len) / 2;
            var diffValue = currentLeft - originX + gr._select_00.regX;
            for (var i = 0; i < iconNumber; i++) {
                gr['_select_0' + i].x = gr['_select_0' + i].x + diffValue;
            }
            for (var j = iconNumber; j < normalNumber; j++) {
                gr['_select_0' + j].visible = false;
            }
        }
    }

    return {
        setTextStyle: setTextStyle,
        randomSort: randomSort,
        fixMeter: fixMeter,
        fixTicketSelect: fixTicketSelect
    };
});