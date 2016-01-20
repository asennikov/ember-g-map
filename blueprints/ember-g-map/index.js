module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackageToProject([
      { name: 'markerclustererplus', target: '~2.1.4' }
    ]);
  }
};
