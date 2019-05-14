apos.define('apostrophe-svg-sprites-editor-modal', {
  extend: 'apostrophe-pieces-editor-modal',
  transition: 'slide',
  construct: function (self, options) {
    self.afterPopulate = function (piece, callback) {
      self.$el.find('[data-apos-svg-sprite-preview-container]').append('<svg><use xlink:href="' + piece.file + '#' + piece.id + '"></use></svg>');
      return setImmediate(callback);
    };
  }
});
