var request = require('request');
var fs = require('fs');
var xml2js = require('xml2js');
var async = require('async');
var _ = require('lodash');
var glob = require('glob');

module.exports = function (apos, argv, callback) {

  var self = apos.modules['apostrophe-svg-sprites'];
  var maps = self.options.maps;
  var req = apos.tasks.getReq();

  return async.eachSeries(maps, function (map, callback) {
    return async.waterfall([
      async.apply(loadMap, map),
      parseMap,
      evaluateForUpsert
    ], callback);
  }, callback);

  function loadMap(map, callback) {

    var pattern = /(http(s)?)/gi;
    var xml;

    if (pattern.test(map.file)) {
      // file is a full url, load it via `request` module
      return request(map.file, function (err, res, body) {
        if (err) {
          console.log(err);
        }
        callback(null, body, map)
      });

    } else {
      var path = apos.rootDir + '/lib/modules/apostrophe-svg-sprites/public/' + map.file;
      if (path.includes('*')) {
        return glob(path, function (err, files) {
          if (files.length) {

            var temp = map.file.split('/');
            temp[temp.length - 1] = files[0].split('/')[files[0].split('/').length - 1];
            map.file = temp.join('/');

            return fs.readFile(files[0], function (err, data) {
              if (err) {
                console.log(err);
                return false;
              }

              map.file = apos.assets.assetUrl('/modules/my-apostrophe-svg-sprites/' + map.file);
              callback(null, data, map)
            });
          }
        });
      } else {
        if (fileExists(path)) {
          map.file = apos.assets.assetUrl('/modules/my-apostrophe-svg-sprites/' + map.file);
          return fs.readFile(path, function (err, data) {
            if (err) {
              console.log(err);
              return false;
            }
            return callback(null, data, map)
          });
        }
      }
    }
  };

  function parseMap(xml, map, callback) {

    var svgs = [];
    return xml2js.parseString(xml, function (err, result) {

      var symbols = findInObj(result, 'symbol');

      if (!symbols.length) {
        console.log('Could not find an array of <symbol> elements in map ' + map.label);
        return false;
      }

      if (symbols[0] && symbols[0].symbol) {
        symbols = symbols[0].symbol;
      } else {
        console.log('Error occured parsing array of symbols in map ' + map.label);
        return false;
      }

      symbols.forEach(function (symbol) {
        if (symbol.$.id) {
          svgs.push({
            symbol: symbol.$,
            file: map.file
          });
        } else {
          console.log('SVG is malformed or has no ID property');
        }
      });

      callback(null, svgs);

    });
  }

  function evaluateForUpsert(svgs, callback) {
    return async.eachSeries(svgs, function (svg, callback) {
      return self.find(req, {
        id: svg.symbol.id
      }, {}).toArray(function (err, docs) {
        if (err) {
          return callback(err);
        }

        if (docs.length) {
          // i have a doc, update it
          return updatePiece(docs[0], svg, callback);
        } else {
          // i don't have a doc, insert it
          return insertPiece(svg, callback);
        }
      });
    }, callback);
  };

  function insertPiece(svg, callback) {
    console.log('INSERTING ' + svg.symbol.id);
    var piece = self.newInstance();

    if (svg.symbol.title) {
      piece.title = apos.launder.string(svg.symbol.title);
    } else {
      piece.title = apos.launder.string(svg.symbol.id);
    }

    piece.id = svg.symbol.id;
    piece.file = svg.file;

    return self.insert(req, piece, {
      permissions: false
    }, callback);

  };

  function updatePiece(doc, svg, callback) {
    console.log('UPDATING ' + svg.symbol.id);
    var updateFields = {};

    if (svg.symbol.title) {
      updateFields.title = apos.launder.string(svg.symbol.title);
    } else {
      updateFields.title = apos.launder.string(svg.symbol.id);
    }

    updateFields.file = svg.file

    return self.update({
      _id: doc._id
    }, updateFields, {
      permissions: false
    }, callback);
  }

  function fileExists(path) {
    if (fs.existsSync(path)) {
      return true
    } else {
      return false;
    }
  };

  function findInObj(obj, key) {

    if (_.has(obj, key))
      return [obj];
    return _.flatten(_.map(obj, function (v) {
      return typeof v == "object" ? findInObj(v, key) : [];
    }), true);
  };
};
