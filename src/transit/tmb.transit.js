/**
 * @classdesc
 *
 * Module to use TMB API Transit services
 */

'use strict';

var Transit = function(http) {

    var linies = function(linia) {

        var info = function() {
            return http.get("transit/linies/" + (linia || ''));
        };

        return  {
            info: info
        }
    };

    linies.metro = function(linia) {
        var info = function() {
            return http.get("transit/linies/metro/" + (linia || ''));
        };

        var estacions = function(estacio) {

            function icones(estacions) {
                estacions.features.forEach(function(estacio) {
                    var base = "//dl.dropboxusercontent.com/u/2368219/tmb_pictos/";
                    var p = estacio.properties;
                    p.icona = base + p.PICTO + ".png";
                });
                return estacions;
            }

            var estacions = http.get("transit/linies/metro/" + linia + '/estacions/' + (estacio || '')).then(icones);

            Object.defineProperties(estacions, {
                corresp: {
                    get: function() {
                        return http.get("transit/linies/metro/" + linia + '/estacions/' + (estacio || '') + '/corresp');
                    }
                }
            });

            estacions.accessos = function(acces) {
                return http.get("transit/linies/metro/" + linia + '/estacions/' + (estacio || '') + '/accessos/' + (acces || ''));
            };

            return estacions;
        };

        return {
            info: info,
            estacions: estacions
        }

    };

    linies.bus = function(linia) {
        var info = function() {
            return http.get("transit/linies/bus/" + (linia || ''));
        };

        var parades = function(parada) {

            function icones(parades) {
                parades.features.forEach(function(parada) {
                    var p = parada.properties;
                    var size = "19";
                    var bg_color = p.COLOR_REC;
                    var fg_color = "FFFFFF"; // White
                    var text = p.NOM_LINIA;
                    p.icona = "http://placehold.it/" + size + "/" + bg_color + "/" + fg_color + "?text=" + text;
                });
                return parades;
            }

            var parades = http.get("transit/linies/bus/" + linia + '/parades/' + (parada || '')).then(icones);

            Object.defineProperties(parades, {
                anada: {
                    get: function() {
                        return this.then(filtraParades.bind(this, "A"));
                    }
                },
                tornada: {
                    get: function() {
                        return this.then(filtraParades.bind(this, "T"));
                    }
                },
                corresp: {
                    get: function() {
                        return http.get("transit/linies/bus/" + linia + '/parades/' + (parada || '') + '/corresp');
                    }
                }
            });
            return parades;
        };

        var filtraParades = function(sentit, parades) {
            var newParades = {
                type: parades.features.type,
                crs: parades.features.crs
            };

            newParades.features = parades.features.slice(0).filter(function(feature) {
                return feature.properties.SENTIT == sentit;
            }).sort(function(f1, f2) {
                return f1.properties.ORDRE - f2.properties.ORDRE;
            });

            newParades.totalFeatures = newParades.features.length;

            return newParades;
        };

        return {
            info: info,
            parades: parades
        }
    };

    return {
        linies: linies
    };
};

module.exports = Transit;