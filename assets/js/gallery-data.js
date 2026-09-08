window.GalleryData = {
  load: function () {
    if (window.GALLERY_ALBUMS) return window.GALLERY_ALBUMS;
    var dataEl = document.getElementById("gallery-albums-data");
    if (!dataEl) return null;
    try {
      return JSON.parse(dataEl.textContent);
    } catch (error) {
      return null;
    }
  },

  isPublished: function (item) {
    return item && item.published !== false;
  },

  groups: function (data) {
    var groups = (data && data.groups) || [];
    var visible = [];
    for (var i = 0; i < groups.length; i += 1) {
      if (this.isPublished(groups[i])) visible.push(groups[i]);
    }
    return visible;
  },

  findGroup: function (data, slug) {
    var groups = this.groups(data);
    for (var i = 0; i < groups.length; i += 1) {
      if (groups[i].slug === slug) return groups[i];
    }
    return null;
  },

  albumsIn: function (group) {
    var albums = (group && group.albums) || [];
    var visible = [];
    for (var i = 0; i < albums.length; i += 1) {
      if (this.isPublished(albums[i])) visible.push(albums[i]);
    }
    return visible;
  },

  findAlbum: function (data, slug) {
    var groups = this.groups(data);
    var g;
    var albums;
    var i;
    for (g = 0; g < groups.length; g += 1) {
      albums = this.albumsIn(groups[g]);
      for (i = 0; i < albums.length; i += 1) {
        if (albums[i].slug === slug) {
          return { album: albums[i], group: groups[g] };
        }
      }
    }

    var flat = (data && data.albums) || [];
    for (i = 0; i < flat.length; i += 1) {
      if (this.isPublished(flat[i]) && flat[i].slug === slug) {
        return { album: flat[i], group: null };
      }
    }

    return null;
  }
};
