(function () {
  var listEl = document.getElementById("gallery-group-albums");
  if (!listEl || !window.GalleryData) return;

  var data = window.GalleryData.load();
  var groupId = new URLSearchParams(window.location.search).get("id");
  var group = window.GalleryData.findGroup(data, groupId);
  var indexUrl = listEl.getAttribute("data-gallery-index") || "/gallery/";

  if (!group) {
    listEl.innerHTML = 'That season was not found. <a href="' + indexUrl + '">All galleries</a>.';
    return;
  }

  var titleEl = document.querySelector(".post-title");
  if (titleEl) titleEl.textContent = group.title;
  document.title = group.title;

  var albums = window.GalleryData.albumsIn(group);
  if (!albums.length) {
    listEl.textContent = "No albums in this season yet.";
    return;
  }

  listEl.innerHTML = "";
  for (var i = 0; i < albums.length; i += 1) {
    var link = document.createElement("a");
    link.className = "outline-button";
    link.href = listEl.getAttribute("data-album-url") + "?id=" + encodeURIComponent(albums[i].slug);
    link.textContent = albums[i].title;
    listEl.appendChild(link);
  }
})();
