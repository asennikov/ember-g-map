module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackageToProject('markerclustererplus', '~2.1.4');
  }
};
