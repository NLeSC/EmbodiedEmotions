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
        uniqueActors = HelperFunctions.determineUniqueActors(d);

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
          var actors = Object.keys(v.actors);
          actors.forEach(function(actor) {
            p[actor] = (p[actor] || 0) + v.climax;
          });

          return p;
        },
        function(p, v) {
          var actors = Object.keys(v.actors);
          actors.forEach(function(actor) {
            p[actor] = (p[actor] || 0) - v.climax;
          });

          return p;
        },
        function() {
          return {};
        }
      );

      var concatenatedActors = [];//HelperFunctions.getUniqueActors();
      actorsGroup.all().map(function(d) {
        concatenatedActors = concatenatedActors.concat(Object.keys(d.value));
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

      function sel_stack(actor) {
        return function(d) {
          if (d.value[actor] !== undefined) {
            var total = 0;
            Object.keys(d.value).forEach(function(a) {
              total += d.value[a]
            });
            return d.value[actor] / total;
          } else {
            return 0;
          }
        };
      }

      //Set up the
      stackedAreaChart
      .renderArea(true)

      //Sizes in pixels
      .width(parseInt($element[0].getClientRects()[1].width, 10))
      .height(300)
      .margins({
        top: 10,
        right: 0,
        bottom: 20,
        left: 0
      })
      //The time this chart takes to do its animations.
      .transitionDuration(1500)

      //Bind data
      .dimension(timeDimension)

      .x(d3.time.scale().domain([timeMin, timeMax]))
      // .y(d3.scale.linear().domain([0,50]))
      .elasticY(true)

      .renderDataPoints(true)
      .renderHorizontalGridLines(true)

      .legend(dc.legend().x(10).y(10).itemHeight(6).gap(1))
      .brushOn(false)

      .group(actorsGroup, uniqueActors[0], sel_stack(uniqueActors[0]))
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
        stackedAreaChart.stack(actorsGroup, uniqueActors[i], sel_stack(uniqueActors[i]));
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
          stackedAreaChart.x(d3.time.scale().domain([minDate, maxDate]));
        } else {
          stackedAreaChart.x(d3.time.scale().domain([timeMin, timeMax]));
        }

        stackedAreaChart.render();
      });
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.areachart').controller('AreachartController', AreachartController);
})();
