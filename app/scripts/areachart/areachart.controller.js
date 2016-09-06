(function() {
  'use strict';

  function AreachartController($element, d3, dc, colorbrewer, NdxService, HelperFunctions, Messagebus) {
    var bodyparts = [];

    this.initializeChart = function() {
      var stackedAreaChart = dc.lineChart('#' + $element[0].children[0].attributes.id.value);
      // var volumeChart = dc.barChart('#' + $element[0].children[0].attributes.id.value + '-volume');
      var timeMin = undefined;
      var timeMax = undefined;

      //The dimension for the stackedAreaChart. We use time for x and group for y,
      //and bin everything in the same group number and day.
      var timeDimension = NdxService.buildDimension(function(d) {
        var time = d3.time.format('%Y%m%d').parse(d.time);
        // uniqueActors = HelperFunctions.determineUniqueActors(d);

        if (timeMin && timeMax) {
          if (time < timeMin) {
            timeMin = time;
          }
          if (time > timeMax) {
            timeMax = time;
          }
        } else {
          timeMin = time;
          timeMax = time;
        }

        return time;
      });

      var actorsGroup = timeDimension.group().reduce(
        function(p, v) {
          var keys = Object.keys(v.actors);
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

          return p;
        },
        function(p, v) {
          var keys = Object.keys(v.actors);
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

          return p;
        },
        function() {
          return {};
        }
      );

      var concatenatedActors = [];//HelperFunctions.getUniqueActors();
      var totals = {};
      actorsGroup.all().map(function(d) {
        var keys = Object.keys(d.value);
        totals[d.key] = 0;
        keys.forEach(function(k) {
          totals[d.key] += d.value[k];
        });

        concatenatedActors = concatenatedActors.concat(keys);
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
      var uniqueActors = arrayUnique(concatenatedActors);

      function selectStack(actor) {
        return function(d) {
          if (d.value[actor] !== undefined) {
            var total = totals[d.key];
            return d.value[actor] / total;
          } else {
            return 0;
          }
        };
      }

      //Set up the
      stackedAreaChart
      .renderArea(true)
      .interpolate('step-before')

      //Sizes in pixels
      .width(parseInt($element[0].getClientRects()[1].width, 10))
      .height(400)
      .margins({
        top: 10,
        right: 0,
        bottom: 20,
        left: 300
      })
      //The time this chart takes to do its animations.
      .transitionDuration(1500)

      //Bind data
      .dimension(timeDimension)

      .x(d3.time.scale().domain([d3.time.year.offset(timeMin, -5), d3.time.year.offset(timeMax, 5)]))
      .xAxisPadding(2000)
      .y(d3.scale.linear().domain([0,1]))
      .elasticY(false)

      .renderDataPoints(false)
      .renderHorizontalGridLines(true)

      .legend(dc.legend().x(10).y(10).itemHeight(6).gap(1))
      .brushOn(false)

      .group(actorsGroup, uniqueActors[0], selectStack(uniqueActors[0]))
      // .valueAccessor(function(d) {
      //   return d.value.value;
      // })
      // .stack(groups[1].value, groups[1].key, function(d) {
      //   return d.value.value;
      // })
      // .stack(groups[2].value, groups[2].key, function(d) {
      //   return d.value.value;
      // })

      .colors(d3.scale.ordinal().range(HelperFunctions.getOrdinalColors()))

      for(var i = 1; i<uniqueActors.length; ++i) {
        stackedAreaChart.stack(actorsGroup, uniqueActors[i], selectStack(uniqueActors[i]));
      }

      // dc.override(stackedAreaChart, 'onClick', onClickOverride);
      stackedAreaChart.render();

      Messagebus.subscribe('newFilterEvent', function(event, filterData) {
        var minDate;
        var maxDate;

        if (filterData[0].filters) {
          filterData[0].filters().forEach(function(f) {
            if (f.filterType === 'RangedTwoDimensionalFilter') {
              minDate = f[0][0];
              maxDate = f[1][0];
            }
          });
        }

        if (minDate && maxDate) {
          stackedAreaChart.x(d3.time.scale().domain([d3.time.year.offset(minDate, -5), d3.time.year.offset(maxDate, 5)]))
        } else {
          stackedAreaChart.x(d3.time.scale().domain([d3.time.year.offset(timeMin, -5), d3.time.year.offset(timeMax, 5)]))
        }

        stackedAreaChart.redraw();
      });
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.areachart').controller('AreachartController', AreachartController);
})();
