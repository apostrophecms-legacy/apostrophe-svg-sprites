var _ = require('lodash');

module.exports = {
  moogBundle: {
    modules: ['apostrophe-svg-sprites-widgets'],
    directory: 'lib/modules'
  },

  name: 'apostrophe-svg-sprites',
  extend: 'apostrophe-pieces',
  alias: 'svg-sprites',
  label: 'SVG Sprite',
  pluralLabel: 'SVG Sprites',
  perPage: 20,
  manageViews: ['grid', 'list'],
  searchable: false,
  insertViaUpload: false,

  beforeConstruct: function (self, options) {

    var mapChoices = _.map(options.maps, function (map) {
      return { label: map.label, value: map.file }
    });

    options.addFields = [
      {
        name: 'id',
        label: 'ID',
        type: 'string',
        help: 'ID of the <symbol> element in the map',
        required: true
      },
      {
        name: 'file',
        label: 'Map',
        type: 'select',
        choices: mapChoices,
        required: true
      }
    ].concat(options.addFields || []);

    var mainFieldNames = _.map(options.addFields, function (field) {
      return field.name
    });

    mainFieldNames.unshift('title');

    options.arrangeFields = [
      {
        name: 'main',
        label: 'Main Fields',
        fields: mainFieldNames
      },
      {
        name: 'admin',
        label: 'Admin',
        fields: ['slug', 'published', 'tags']
      }
    ].concat(options.arrangeFields || []);
  },

  construct: function (self, options) {
    self.pushAsset('stylesheet', 'apos-sprites', { when: 'user' });
    self.pushAsset('script', 'editor-modal', { when: 'user' });

    self.import = require('./lib/import.js');
  },

  afterConstruct: function (self) {
    self.apos.tasks.add(self.__meta.name, 'import', 'Imports sprites from provided SVG maps as pieces', self.import);

  },

};
