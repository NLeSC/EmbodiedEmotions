(function() {
  'use strict';

  function SubwayChartController($scope, $element, d3, dc, NdxService, colorbrewer, HelperFunctions, Messagebus) {

    this.initializeChart = function() {
      var subwayChart = dc.subwayChart('#'+$element[0].children[0].attributes.id.value);

      //The dimension for the subwayChart. We use time for x and group for y,
      //and bin everything in the same group number and day.
      var subwayDimension = NdxService.buildDimension(function(d) {
        var time = d3.time.format('%Y%m%d').parse(d.time);
        var uniqueActors = HelperFunctions.determineUniqueActors(d);

        return [time, uniqueActors];
      });

      var subwayGroup = subwayDimension.group().reduce(
        //Add something to our temporary collection
        function(p, v) {
          p.count = p.count + 1;

          //Sum label values over all events fitting this time and group.
          if (v.labels) {
            v.labels.forEach(function(l) {
              p.labels[l] = (p.labels[l] || 0) + 1;
            });
          }
          //  else {
          //   p.labels.none = (p.labels.none || 0) + 1;
          // }

          p.groups[v.groupName] = (p.groups[v.groupName] || 0) + 1;

          //Push mentions over all events fitting this time and group.
          v.mentions.forEach(function(m) {
            p.mentions.push(m);
          });

          return p;
        },
        //Remove something from our temporary collection, (basically do
        //everything in the add step, but then in reverse).
        function(p, v) {
          p.count = p.count - 1;

          if (v.labels) {
            v.labels.forEach(function(l) {
              p.labels[l] = (p.labels[l] || 0) - 1;
            });
          }
          // else {
          //   p.labels.none = (p.labels.none || 0) - 1;
          // }

          p.groups[v.groupName] = (p.groups[v.groupName] || 0) + 1;

          //Push mentions over all events fitting this time and group.
          v.mentions.forEach(function(m) {
            p.mentions.pop(m);
          });

          return p;
        },
        //Set up the inital data structure.
        function() {
          return {
            count: 0,
            labels: {},
            groups: {},
            mentions: []
          };
        }
      );

      var uniqueActors = HelperFunctions.getUniqueActors();
      // subwayGroup.all().map(function(d) {
      //   d.key[1].forEach(function(key) {
      //     if (uniqueActors.indexOf(key) < 0) {
      //       uniqueActors.push(key);
      //     }
      //   });
      // });


      //Set up the
      subwayChart
      //Sizes in pixels
        .width(parseInt($element[0].getClientRects()[1].width, 10))
        .height(400)
        .margins({
          top: 10,
          right: 0,
          bottom: 20,
          left: 75
        })

      //Bind data
      .dimension(subwayDimension)
        .group(subwayGroup)

      .filterHandler(HelperFunctions.customDefaultFilterHandler.bind(subwayChart))

      //The time this chart takes to do its animations.
      .transitionDuration(1500)

      //x Axis
      .x(d3.time.scale())
        .elasticX(true)
        .xAxisPadding(2000)
        .keyAccessor(function(p) {
          //The time of this event
          return p.key[0];
        })

      //y Axis
      .y(d3.scale.ordinal()
          .domain((function() {
            return uniqueActors;
          })())
        )
        .valueAccessor(function(p) {
          return p.key[1];
        })

      //Radius of the bubble
      .r(d3.scale.linear())
        .elasticRadius(true)
        .radiusValueAccessor(function(p) {
          if (p.value.count > 0) {
            return p.key[1].length;
          } else {
            return 0;
          }
        })
        .minRadius(5)
        .maxBubbleRelativeSize(0.015)

      //Use the color scheme of the groupRowChart
      .colors(HelperFunctions.getActorColors())
      .colorAccessor(function(d) {
        return d;
      })

      //Labels printed just above the bubbles
      .renderLabel(true)
        .minRadiusWithLabel(0)
        .label(function(p) {
          var mostImportantGroup;
          var scoreOfMostImportantGroup = -1;
          //Get the most important label (highest climax score)
          var groups = Object.keys(p.value.groups);
          groups.forEach(function(g) {
            if (p.value.groups[g] > scoreOfMostImportantGroup) {
              mostImportantGroup = g;
              scoreOfMostImportantGroup = p.value.groups[g];
            }
          });
          return mostImportantGroup.toString(); //p.key;
        })

      //Information on hover
      .renderTitle(true)
        .title(function(p) {
          //Get the groupName
          var groupString = '';
          var groups = Object.keys(p.value.groups);
          groups.forEach(function(g) {
            groupString += g + '\n';
          });

          //Get the actors
          var actors = p.key[1];
          var actorString = '';
          actors.forEach(function(a) {
            actorString += a + '\n';
          });

          //Get the labels
          var labelString = '';
          var labels = Object.keys(p.value.labels);
          labels.forEach(function(l) {
            labelString += l + '\n';
          });

          var titleString =
            '\n---Emotion-------\n' +
            groupString +
            '\n---Body Parts-------\n' +
            actorString +
            '\n---Labels-------\n' +
            labelString +
            '\n---Mentions-----\n' +
            HelperFunctions.mentionToTxt(p.value);
          return titleString;
        }.bind(this));

      //A hack to make the customBubbleChart filter out 0-value bubbles while determining the x-axis range
      dc.override(subwayChart, 'xAxisMin', function() {
        var min = d3.min(subwayChart.data(), function(e) {
          if (subwayChart.radiusValueAccessor()(e) > 0) {
            return subwayChart.keyAccessor()(e);
          }
        });
        return dc.utils.subtract(min, subwayChart.xAxisPadding());
      });

      dc.override(subwayChart, 'xAxisMax', function() {
        var max = d3.max(subwayChart.data(), function(e) {
          if (subwayChart.radiusValueAccessor()(e) > 0) {
            return subwayChart.keyAccessor()(e);
          }
        });
        return dc.utils.add(max, subwayChart.xAxisPadding());
      });

      //A hack to make the bubbleChart accept ordinal values on the y Axis
      dc.override(subwayChart, '_prepareYAxis', function(g) {
        this.__prepareYAxis(g);
        this.y().rangeBands([this.yAxisHeight(), 0], 0, 1);
      });

      dc.override(subwayChart, 'getColor', function(d) {
        return HelperFunctions.getActorColors()(d);
      });

      // dc.override(subwayChart, 'fadeDeselectedArea', function() {
      //   if (subwayChart.hasFilter()) {
      //     subwayChart.selectAll('g.' + subwayChart.BUBBLE_NODE_CLASS).each(function(d) {
      //       if (subwayChart.isSelectedNode(d)) {
      //         subwayChart.highlightSelected(this);
      //       } else {
      //         subwayChart.fadeDeselected(this);
      //       }
      //     });
      //   } else {
      //     subwayChart.selectAll('g.' + subwayChart.BUBBLE_NODE_CLASS).each(function() {
      //       subwayChart.resetHighlight(this);
      //     });
      //   }
      // });

      //Disable the onClick handler for this chart
      dc.override(subwayChart, 'onClick', function() {
      });

      subwayChart.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.subwaychart').controller('SubwayChartController', SubwayChartController);
})();
