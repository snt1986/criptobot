const technicalIndicators = require("technicalindicators");
const tulind = require('tulind');
const cs = require('candlestick');



function getIndicatorMedian(dataIni, data) {
    return new MedianStrategy(dataIni, data);
}

class MedianStrategy {

    #data;

    #dataIni;  

    constructor(dataIni, data) {
        this.#dataIni = dataIni;
        this.#data = data;
    }

    #getSMAForProperty(property, period) {
        const values = this.#data[property];  
        return technicalIndicators.SMA.calculate({period : period, values : values}); 
    }

    getSMAForProperty(property, period) {
        return this.#getSMAForProperty(property, period) ;
    }

    checkPriceUpperSMA(period, distance) {
        const lastCandle = this.#dataIni[this.#dataIni.length - 1];
        const mediaClose = this.#getSMAForProperty("close", period);
        const lastPos = mediaClose.length - 1;

        if(
            lastCandle.close > mediaClose[lastPos] && 
            ((lastCandle.close - mediaClose[lastPos]) / mediaClose[lastPos]) > distance
        
            ) {
                return true;
        }
        return false;

    }   


    checkPriceDownSMA(period, distance) {
        const lastCandle = this.#dataIni[this.#dataIni.length - 1];
        const mediaClose = this.#getSMAForProperty("close", period);
        const lastPos = mediaClose.length - 1;

        if(
            lastCandle.close < mediaClose[lastPos] && 
            ((lastCandle.close - mediaClose[lastPos]) / mediaClose[lastPos]) < distance
        
            ) {
                return true;
        }
        return false;

    }   


    checkPriceMantainsDownSMA(period = 48, numCandles = 10, delay = 0) {
        const mediaClose = this.#getSMAForProperty("close", period);

        for (let j = 1 + delay; j <= numCandles + delay; j++) {
            if(
                mediaClose[mediaClose.length - j] < this.#dataIni[this.#dataIni.length - j].high                
            ) {
                return false;
            }            
        }
        return true;
    }

}

module.exports = {getIndicatorMedian};

