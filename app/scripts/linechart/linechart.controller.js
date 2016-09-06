(function() {
  'use strict';

  function LinechartController($element, $attrs, d3, dc, colorbrewer, NdxService, HelperFunctions, Messagebus) {
    var ctrl = this;
    var bodyparts = [];

    ctrl.jsonFieldToChart = $attrs.jsonFieldToChart;

    this.initializeChart = function() {
      var composite = dc.compositeChart($element[0].children[0]);

      var timeMin = undefined;
      var timeMax = undefined;
      var dimension = NdxService.buildDimension(function(d) {
        var time = d3.time.format('%Y%m%d').parse(d.time);

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

      var group = dimension.group().reduce(
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

      var concatArray = [];//HelperFunctions.getUniqueActors();
      var totals = {};
      group.all().map(function(d) {
        var keys = Object.keys(d.value);
        totals[d.key] = 0;
        keys.forEach(function(k) {
          totals[d.key] += d.value[k];
        });

        concatArray = concatArray.concat(keys);
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
      var ordinalGroup = arrayUnique(concatArray);

      var colors = d3.scale.ordinal().range(HelperFunctions.getOrdinalColors());

      var lineCharts = [];
      ordinalGroup.forEach(function(actor, i) {
        lineCharts[i] = dc.lineChart(composite)
          .interpolate('step-before')
          .colors(function() {
            return colors(actor);
          })

          .dimension(dimension)
          .group(group, actor)
          .valueAccessor(function(d) {
            // var total = totals[d.key];
            return d.value[actor] || 0;// / total || 0;
          });
      });

      composite
        .width(parseInt($element[0].getClientRects()[1].width, 10))
        .height(400)
        .margins({
          top: 10,
          right: 0,
          bottom: 20,
          left: 300
        })
        .transitionDuration(1500)

        .x(d3.time.scale().domain([d3.time.year.offset(timeMin, -5), d3.time.year.offset(timeMax, 5)]))
        // .y(d3.scale.linear().domain([0,1]))
        .elasticY(true)
        .brushOn(false)
        .legend(dc.legend()
                .x(10)
                .y(10)
                .itemHeight(6)
                .gap(1)
                // .legendText(function(d) {
                //   return d;
                // })
              )

        .compose(lineCharts);

      composite.render();

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
          composite.x(d3.time.scale().domain([d3.time.year.offset(minDate, -5), d3.time.year.offset(maxDate, 5)]))
        } else {
          composite.x(d3.time.scale().domain([d3.time.year.offset(timeMin, -5), d3.time.year.offset(timeMax, 5)]))
        }

        composite.redraw();
      });
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.charts').controller('LinechartController', LinechartController);
})();
