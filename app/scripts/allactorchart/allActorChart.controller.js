(function() {
  'use strict';

  function AllActorChartController($element, d3, dc, NdxService, HelperFunctions, Messagebus) {
    this.initializeChart = function() {
      //A rowChart that shows us the importance of the all actors
      var allActorChart = dc.rowChart('#'+$element[0].children[0].attributes.id.value);

      var allActors = [];

      //Dimension of the list of unique actors present in each event.
      var allActorsDimension = NdxService.buildDimension(function(d) {
        var actors = HelperFunctions.determineUniqueActors(d);
        allActors = allActors.concat(actors)
        return actors;
      });

      //Helper function to get unique elements of an array
      var arrayUnique = function(a) {
        return a.reduce(function(p, c) {
          if (p.indexOf(c) < 0) {
            p.push(c);
          }
          return p;
        }, []);
      };

      var uniqueActors = arrayUnique(allActors);

      HelperFunctions.setUniqueActors(uniqueActors);

      //Custom reduce functions to split events up with multiple keys
      function reduceAdd(p, v) {
        var keys = Object.keys(v.actors);
        // if (keys.length === 0) {
        //   p.none = (p.none || 0) + 1;
        // } else {
          keys.forEach(function(key) {
            var actors = v.actors[key];
            if (Array.isArray(actors)) {
              actors.forEach(function(actor) {
                p[actor] = (p[actor] || 0) + 1;
              });
            } else {
              p[actors] = (p[actors] || 0) + 1;
            }
          });
        // }
        return p;
      }

      function reduceRemove(p, v) {
        var keys = Object.keys(v.actors);
        // if (keys.length === 0) {
        //   p.none = (p.none || 0) - 1;
        // } else {
          keys.forEach(function(key) {
            var actors = v.actors[key];
            if (Array.isArray(actors)) {
              actors.forEach(function(actor) {
                p[actor] = (p[actor] || 0) - 1;
              });
            } else {
              p[actors] = (p[actors] || 0) - 1;
            }
          });
        // }
        return p;
      }

      function reduceInitial() {
        return {};
      }

      //Apply custom reduce
      var allActorsClimaxSum = allActorsDimension.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value();

      //Hack to add the all and top functions again
      allActorsClimaxSum.all = function() {
        var newObject = [];
        for (var key in this) {
          if (this.hasOwnProperty(key) && key !== 'all' && key !== 'top' && key !== 'order') {
            newObject.push({
              key: key,
              value: this[key]
            });
          }
        }
        return newObject;
      };
      allActorsClimaxSum.top = function(n) {
        var newObject = this.all().sort(function(a, b) {
          return b.value - a.value;
        }).slice(0, n);

        return newObject;
      };
      allActorsClimaxSum.order = function(p) {
        return p;
      };

      //Set up the
      allActorChart
      //Size in pixels
        .width(parseInt($element[0].getClientRects()[1].width, 10))
        .height(400)
        .margins({
          top: 10,
          right: 2,
          bottom: 0,
          left: 2
        })

      //Bind data
      .dimension(allActorsDimension)
        .keyAccessor(function(d) {
          return d.key;
        })
        .group(allActorsClimaxSum)
        .valueAccessor(function(d) {
          return d.value;
        })

      //The x Axis
      .x(d3.scale.linear())

      .data(function(d) {
        return d.top(20);
      })

      .colors(d3.scale.category20b().domain(uniqueActors))

      .gap(1)
      .elasticX(true)

      .filterHandler(
        function(dimension, filters) {
          Messagebus.publish('newFilterEvent', [this, filters, dimension]);

          dimension.filter(null);
          if (filters.length === 0) {
            dimension.filter(null);
          } else {
            dimension.filter(function(d) {
              var result = true;
              if (allActorChart.filters() !== null) {
                var currentFilters = allActorChart.filters();
                currentFilters.forEach(function(f) {
                  if (d.indexOf(f) < 0) {
                    result = false;
                  }
                });
              }
              return result;
            });
          }
          return filters;
        }.bind(allActorChart))

      .xAxis().tickValues([]);

      //Set the actor colors in the helperfunctions so we can re-use this color scheme
      HelperFunctions.setActorColors(allActorChart.colors());

      allActorChart.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.allactorchart').controller('AllActorChartController', AllActorChartController);
})();
