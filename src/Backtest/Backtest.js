const getCoinsInformation = require("../Connector/CoinsInformation");
const getIndicator = require("./../../src/Indicators/Indicator");
const configuration = require("../../config.json");
const { ChandelierExit } = require("technicalindicators");



class Backtest {

    #coinsInfo = getCoinsInformation();

    #indicator = getIndicator();

    #modulesFunctions = {};


    constructor(configurationParam) {
        this.pair = configurationParam.pair;
        this.initfrom = configuration.test.initPeriod
        this.priceReBuy = null;
        this.operaciones = 0;
        this.rentabilidad = 0;
        this.rentabilidadMovimiento = 0;
        this.currentObject = {};
        this.sobreventasNum = 0;
        this.priceSell = 0;
        this.#modulesFunctions = configurationParam.modulesFunctions;
        this.sumaVelas = 0;
        this.results = {};
        this.verbose = false;
    }


    async init() {
        const current = this;
        let velas = 0;
        let ventaHecha = false;
        await this.#coinsInfo.getHistoricalData(current.pair, configuration.analize.asset.temporality).then(async function (data) {
            for (let index = current.initfrom; index < data.length; index++) {
                const currentDataPeriod = data.slice(0, index + 1);
                current.#indicator.setData(currentDataPeriod);
                const currentPrice = currentDataPeriod[currentDataPeriod.length - 1]["close"];
                //const currentPriceHigh = currentDataPeriod[currentDataPeriod.length - 1]["high"];
                const currentPriceLow = currentDataPeriod[currentDataPeriod.length - 1]["low"];
                current.currentObject = currentDataPeriod[currentDataPeriod.length - 1];

                if(ventaHecha == true) {
                    /*console.log(currentDataPeriod[currentDataPeriod.length - 1]);
                    console.log(current.priceSell);
                    console.log(current.priceReBuy);
                    exit();*/
                    velas++;
                }

                if(current.priceReBuy != null  && current.priceReBuy >= currentPriceLow) {
                    if(current.verbose === true) {
                        console.log({
                            "priceRebuy": current.priceReBuy,
                            "rentabilidad": current.rentabilidadMovimiento,
                            "priceSell": current.priceSell,
                            "velas": velas
                        });
                    }                   
                    current.sumaVelas = current.sumaVelas + velas;
                    current.priceReBuy = null;
                    current.rentabilidad += current.rentabilidadMovimiento;
                    current.operaciones++;
                    velas = 0;
                    ventaHecha = false;
                   
                }   

                if(current.isUpperShell()) {         
                    current.sobreventasNum++;                      
                    if(current.priceReBuy == null) {
                        current.priceSell = currentPrice;
                        current.priceReBuy = current.priceToRebuy(currentPrice);
                        console.log("******");
                        console.log(current);
                        velas++;
                        ventaHecha = true;
                    }                       
                } 

                
            }
          
            let candlesFromOperation = 0;
            if(current.operaciones > 0) {
                candlesFromOperation = current.sumaVelas / current.operaciones;
            }
            current.results = {
                "pair": current.pair,
                "oversold": current.sobreventasNum,
                "operations": current.operaciones,
                "rentability": current.rentabilidad,
                "candles from operation": candlesFromOperation,
                "velas pendientes": velas
            }
            if(current.verbose === true) {
                console.table(current.results);
            }            
        });    
        return current.results;    
    }

    getResults() {
        return this.results;
    }

    isUpperShell() {       
        return this.#modulesFunctions.isUpperSellFunction(this.#indicator);
    }

    priceToRebuy(priceClose) {
        let rentabilidadMovimiento = configuration.analize.asset.profit;      
        this.rentabilidadMovimiento = rentabilidadMovimiento;
        return priceClose - (priceClose * rentabilidadMovimiento);
    
    }



}

module.exports = Backtest;

