(function(window, document, $, undefined){
    var Y = {//Yota test;
        init: function(){
            Y.getDataProgress = false;
            Y.$ytChCurrency = $('#yt-ch-currency');
            Y.$ytCurSchedule = $('#yt-cur-schedule');
            Y.$ytCurrList = $('#yt-curr-list');
            Y.$ytCurrListSel = $('#yt-curr-list-sel');
            Y.$ytCurRateF = $('#yt-cur-rate-f');
            Y.ytCurrTable = $('#yt-curr-table');
            Y.$input = $('input[name="yt-period"]',Y.$ytCurRateF);
            Y.$ytCurRateF.on('change', function(e){
                if(e.target == Y.$ytCurrListSel[0]){
                    var target = $(e.target),
                        val = $('option:selected', target).val();
                    for(var i = 0; i < Y.config.currencies.length; i++){
                        if(val == Y.config.currencies[i]) return;
                    }
                    Y.$ytCurrList.append($('<li>', {title: Y.currencies[val].name})
                        .append($('<span>', {text: val}))
                        .append($('<strong>', {'class': 'yt-curr-del', text: 'x', 'data-curr': val}))
                        .append($('<em>', {'class': 'yt-curr-color'}).css({'background-color': Y.currencies[val].color})));
                    Y.setConfig({currency: val, add: true});
                }
            });
            Y.$ytCurRateF.on('click', function(e){
                var target = $(e.target),
                    dataCurr = target.attr('data-curr'),
                    name = target.attr('name');
                if(dataCurr){
                    Y.setConfig({currency: dataCurr});
                    target.parent('li').remove();
                    return;
                }
                if(name == 'yt-period'){
                    if(Y.getDataProgress) return;
                    Y.setConfig({period: target.val()});
                }
            });
            Y.scheduleSize = {
                width: Y.$ytCurSchedule.width(),
                height: Y.$ytCurSchedule.height()
            };
            Y.currencies = {};
            Y.currencies.valueLength = 0;
            Y['day'] = {
                dates: [],
                fullLength: 1
            };
            Y['week'] = {
                dates: [],
                fullLength: 0
            };
            Y['month'] = {
                dates: [],
                fullLength: 0
            };
            Y['3months'] = {
                dates: [],
                fullLength: 0
            };
            Y.config = {
                period: 'week',
                currencies: []
            };
            Y.fillDates();
            Y.setConfig({period: 'day'});
            if (Y.$ytCurSchedule[0].getContext){
                Y.shedule = Y.$ytCurSchedule[0].getContext('2d');
            } else {
                console.log('Canvas not supported');
            }
        },
        pad: function (d) {
            return (d < 10) ? '0' + d.toString() : d.toString();
        },
        getRandomInt: function (min, max)
        {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        addCurrSelect: function(){
            for(var curr in Y.currencies) {
                if (!Y.currencies.hasOwnProperty(curr)) continue;
                if(typeof Y.currencies[curr] == 'object'){
                    Y.$ytCurrListSel.append($('<option>',{value: Y.currencies[curr].code, text: Y.currencies[curr].name}));
                }
            }
        },
        clearTable: function(){
            var $thead = $('thead td', Y.ytCurrTable),
                $today = $thead.eq(1),
                $firstDay = $thead.eq(2),
                period = Y.config.period,
                dates = Y[period].dates;
            if(Y.$body) Y.$body.remove();
            $today.text(Y['day'].dates[0].replace(/\//g, '.'));
            $firstDay.text(dates[dates.length -1].replace(/\//g, '.'));
        },
        setTable: function(){
            var period = Y.config.period;
            Y.$body = $('<tbody>');
            if(Y.config.currencies.length){
                for(var i = 0; i < Y.config.currencies.length; i++){
                    var currName = Y.config.currencies[i],
                        currVals = Y.currencies[currName].value;
                    Y.$body.append($('<tr>', {'data-curr': currName})
                        .append($('<td>', {text: currName}))
                        .append($('<td>', {text: currVals[0]}))
                        .append($('<td>', {text: currVals[Y[period].fullLength - 1]}))
                        .append($('<td>', {text: (currVals[0] - currVals[Y[period].fullLength - 1]).toFixed(4)})));
                }
                Y.ytCurrTable.append(Y.$body);
            }
        },
        fillDates: function(){
            var d = new Date(),
                year = d.getFullYear(),
                month = d.getMonth(),
                day = d.getDate(),
                today = new Date(year, month, day),
                dayWeekAgo = new Date(year, month, day -7),
                dayMonthAgo = ((new Date(year, month -1, day)).getDate() == day) ? new Date(year, month -1, day) : new Date(year, month, 0),
                day3MonthsAgo = ((new Date(year, month -3, day)).getDate() == day) ? new Date(year, month -3, day) : new Date(year, month - 2, 0),
                testDay = new Date(year, month, day),
                testDate = day;
            while(testDay.getTime() > day3MonthsAgo.getTime()){
                testDay = new Date(year, month, testDate--);
                Y['3months'].dates.push(Y.pad(testDay.getDate()) + '/' + Y.pad(testDay.getMonth() + 1) + '/' + testDay.getFullYear());
                if(testDay.getTime() == today.getTime()){
                    Y['day'].dates = [].concat(Y['3months'].dates);
                    Y['3months'].dates = [];
                }
                if(testDay.getTime() == dayWeekAgo.getTime()){
                    Y['week'].dates = [].concat(Y['3months'].dates);
                    Y['3months'].dates = [];
                }
                if(testDay.getTime() == dayMonthAgo.getTime()){
                    Y['month'].dates = [].concat(Y['3months'].dates);
                    Y['3months'].dates = [];
                }
            }
            Y['day'].fullLength = 1;
            Y['week'].fullLength = Y['day'].fullLength + Y['week'].dates.length;
            Y['month'].fullLength = Y['week'].fullLength + Y['month'].dates.length;
            Y['3months'].fullLength = Y['month'].fullLength + Y['3months'].dates.length;
        },
        setConfig: function(data){
            Y.clearTable();
            if(data.period) {
                if(Y.getDataProgress) return;
                if(data.period == 'day'){
                    Y.getCurrency('day').done(function(){
                        Y.disabledForm(false);
                        Y.addCurrSelect();
                    });
                    return;
                }
                Y.config.period = data.period;
            }
            if(data.currency){
                if(data.add){
                    Y.config.currencies.push(data.currency);
                }else{
                    for(var i = 0; i < Y.config.currencies.length; i++){
                        if(Y.config.currencies[i] == data.currency) {
                            Y.config.currencies.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            if(Y.getDataProgress) return;
            if(Y.config.currencies.length){
                Y.getCurrency().done(function(){
                    Y.disabledForm(false);
                    Y.setTable();
                    Y.drawNewSchedules();
                });
            }
        },
        disabledForm: function(disable){
           if(disable){
               Y.getDataProgress = true;
               Y.$input.attr("disabled","disabled");
               return;
           }
            Y.getDataProgress = false;
            Y.$input.removeAttr("disabled");

        },
        getCurrency: function(p){
            var def = $.Deferred(),
                period = p || Y.config.period;
            if(Y.currencies.valueLength >= Y[period].fullLength) {
                def.resolve();
                return def;
            }
            Y.disabledForm(true);
            switch(period){
                case 'day':{
                    Y.askServer('day').done(def.resolve);
                    break;
                }
                case 'week':{
                    Y.getCurrency('day').done(function(){
                        Y.askServer('week').done(def.resolve);
                    });
                    break;
                }
                case 'month':{
                    Y.getCurrency('week').done(function(){
                        Y.askServer('month').done(def.resolve);
                    });
                    break;
                }
                case '3months':{
                    Y.getCurrency('month').done(function(){
                        Y.askServer('3months').done(def.resolve);
                    });
                    break;
                }
            }
            return def;
        },
        askServer: function(period){
            var dates = Y[period].dates;
            if(!Y.askServer.dateNum) {
                Y.askServer.def = $.Deferred();
                Y.askServer.dateNum = 0;
            }
            if(Y.askServer.dateNum < dates.length){
                $.get('/cbr.php', {date_req: dates[Y.askServer.dateNum]},function(data){
                    Y.parseCurrencyXML(data);
                    if(period == 'day') return Y.askServer.def.resolve();
                    Y.askServer.dateNum ++;
                    Y.drawNewSchedules();
                    Y.askServer(period);
                }, 'xml');
                return Y.askServer.def
            }
            Y.askServer.dateNum = 0;
            Y.askServer.def.resolve();
        },
        parseCurrencyXML: function(xml){
            var currency;
            Y.currencies.valueLength ++;
            $('Valute', xml).each(function(){
                var that = $(this),
                    charCode = $('CharCode', that).text(),
                    name = $('Name', that).text(),
                    value = $('Value', that).text().replace(',' , '.') * 1;
                if(!currency) currency = charCode;
                if(Y.currencies[charCode]){
                    Y.currencies[charCode].value.push(value);
                    return;
                }
                Y.currencies[charCode] = {
                    code: charCode,
                    name: name,
                    value: [value],
                    color: 'rgb(' + Y.getRandomInt(0, 255) + ',' + Y.getRandomInt(0, 255) + ',' + Y.getRandomInt(0, 255) + ')'
                };
            });
        },
        drawNewSchedules: function(){
            var max = 0,
                min = 1000000,
                maxValue = 0,
                minValue = 1000000,
                heightUnit = 1,
                period = Y.config.period,
                currencies = Y.config.currencies,
                widthUnit = Y.scheduleSize.width / (Y[period].fullLength - 1),
                valueLength = Y[period].fullLength <= Y.currencies.valueLength ? Y[period].fullLength : Y.currencies.valueLength,
                i = 0,
                j = 0;
            Y.shedule.clearRect(0, 0, Y.scheduleSize.width, Y.scheduleSize.height);
            if(!Y.shedule || valueLength <= 1 || !Y.config.currencies.length) return;
            Y.shedule.lineWidth = 2;
            for(i = 0; i < currencies.length; i++){
                for(j = 0; j < valueLength; j++){
                    var value = Y.currencies[currencies[i]].value[j];
                    if(value > maxValue) maxValue = value;
                    if(value < minValue) minValue = value;
                }
                if(maxValue > max) max = maxValue;
                if(minValue < min) min = minValue;
            }
            heightUnit = (Y.scheduleSize.height - 20) / (max - min);
            for(i = 0; i < currencies.length; i++){
                Y.shedule.beginPath();
                Y.shedule.strokeStyle = Y.currencies[currencies[i]].color;
                Y.shedule.moveTo(Y.scheduleSize.width, Y.scheduleSize.height - 10 - (Y.currencies[currencies[i]].value[0] - min) * heightUnit);
                for(j = 1; j < valueLength; j++){
                    Y.shedule.lineTo(Y.scheduleSize.width - j * widthUnit, Y.scheduleSize.height - 10 - (Y.currencies[currencies[i]].value[j] - min) * heightUnit);
                }
                Y.shedule.stroke();
            }
        }
    }
    $(document).ready(Y.init);
    window.yotaTest = Y; //Show code in console for debug;
})(window, document, jQuery);