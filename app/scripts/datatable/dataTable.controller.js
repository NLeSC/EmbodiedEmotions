(function() {
  'use strict';

  function DataTableController($element, d3, dc, NdxService, HelperFunctions, Messagebus) {
    var sourceToHtml = function(d) {
      var result = [];
      var raw = d.mentions;
      raw.forEach(function(mention) {
        var source;
        if (mention.perspective[0]) {
          source = '<div>' + mention.perspective[0].source + '</div>';
        } else {
          source = '';
        }

        if (source) {
          result.push({
            source: source
          });
        }
      });
      var html = '';
      result.forEach(function(phrase) {
        html = '<div>' + phrase.source + '</div>';
      });
      return html;
    };

    var mentionCharToHtml = function(d) {
      var raw = d.mentions;
      var html = '';
      raw.forEach(function(mention) {
        var charStart = parseInt(mention.char[0]);
        var charEnd = parseInt(mention.char[1]);

        html += '<div>' + charStart + ' - ' + charEnd + '</div>';
      });
      return html;
    };

    var mentionToHtml = function(d) {
      var raw = d.mentions;
      var html = '';
      raw.forEach(function(mention) {
        var pre = mention.snippet[0].substring(0, mention.snippet_char[0]);
        var word = mention.snippet[0].substring(mention.snippet_char[0], mention.snippet_char[1]);
        var post = mention.snippet[0].substring(mention.snippet_char[1], mention.snippet[0].length);

        html += '<div>' + pre + '<span class=\'highlighted-mention\'>' + word + '</span>' + post + '</div>';
      }.bind(this));
      return html;
    };

    this.initializeChart = function() {
      var dataTable = dc.dataTable('#' + $element[0].children[0].attributes.id.value);

      //These parameters should make for fairly unique events
      var idDimension = NdxService.buildDimension(function(d) {
        return [d.event];
      });

      // use odd page size to show the effect better
      this.ofs = 0;
      this.pag = 17;
      this.tableDisplay = function() {
        d3.select('#begin').text(this.ofs);
        d3.select('#end').text(this.ofs + this.pag - 1);
        d3.select('#last').attr('disabled', this.ofs - this.pag < 0 ? 'true' : null);
        d3.select('#next').attr('disabled', this.ofs + this.pag >= NdxService.getSize() ? 'true' : null);
        d3.select('#size').text(NdxService.getSize());
      };
      this.tableUpdate = function() {
        dataTable.beginSlice(this.ofs);
        dataTable.endSlice(this.ofs + this.pag);
        this.tableDisplay();
      };
      this.tableNext = function() {
        this.ofs += this.pag;
        this.tableUpdate();
        dataTable.redraw();
      };
      this.tableLast = function() {
        this.ofs -= this.pag;
        this.tableUpdate();
        dataTable.redraw();
      };

      //Set up the
      dataTable
      // .size(10)
      // .width(1200)
        .dimension(idDimension)
        .group(function() {
          return '';
        })
        .showGroups(false)
        .size(Infinity)
        .sortBy(function(d) {
          return d3.time.format('%Y%m%d').parse(d.time);
        })
        .order(d3.ascending)
        .columns([{
          label: '<div class="col_0">Year</div>',
          format: function(d) {
            if (d !== undefined) {
              var time = d3.time.format('%Y%m%d').parse(d.time);
              return '<div class="col_0">' + time.getDate() + '/' + (time.getMonth() + 1) + '/' + time.getFullYear() + '</div>';
            }
          }
        }, {
          label: '<div class="col_1">Source</div>',

          format: function(d) {
            if (d !== undefined) {
              return '<div class="col_1">' + sourceToHtml(d) + '</div>';
            }
          }
        }, {
          label: '<div class="col_2">Emotion</div>',

          format: function(d) {
            if (d !== undefined) {
              return '<div class="col_2">' + d.groupName + '</div>';
            }
          }
        }, {
          label: '<div class="col_3">Char Offset</div>',

          format: function(d) {
            if (d !== undefined) {
              return '<div class="col_3">' + mentionCharToHtml(d) + '</div>';
            }
          }
        }, {
          label: '<div class="col_4">Body Parts</div>',

          format: function(d) {
            if (d !== undefined) {
              var result = '';
              Object.keys(d.actors).forEach(function(key) {
                result += key + ' ';
              });
              return '<div class="col_4">' + result + '</div>';
            }
          }
        // }, {
        //   label: '<div class="col_5">Labels</div>',
        //
        //   format: function(d) {
        //     if (d !== undefined) {
        //       var html = '<div class="col_5">';
        //       if (Array.isArray(d.labels)) {
        //         d.labels.forEach(function(l) {
        //           html += '<div>' + l + '</div>';
        //         });
        //       } else {
        //         html += '<div>' + d.labels + '</div>';
        //       }
        //
        //       return html + '</div>';
        //     }
        //   }
        }, {
          label: '<div class="col_6">Mentions</div>',

          format: function(d) {
            if (d !== undefined) {
              return '<div class="col_6">' + mentionToHtml(d) + '</div>';
            }
          }
        }]);

      this.tableUpdate();
      dataTable.render();
    };

    Messagebus.subscribe('crossfilter ready', function() {
      this.initializeChart();
    }.bind(this));
  }

  angular.module('uncertApp.datatable').controller('DataTableController', DataTableController);
})();
