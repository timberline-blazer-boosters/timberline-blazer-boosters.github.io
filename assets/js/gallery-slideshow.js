(function () {
  var slideshowEl = document.getElementById("gallery-slideshow");
  if (!slideshowEl) return;

  var PHOTOPRISM_URL = slideshowEl.getAttribute("data-photoprism-url") || "https://photos.tlblazers.com";
  var SHARE_TOKEN = (slideshowEl.getAttribute("data-share-token") || "").trim();
  var ROTATION_INTERVAL = 6000;
  var statusEl = document.getElementById("gallery-status");
  var albumId = new URLSearchParams(window.location.search).get("id");
  var galleries = window.GalleryData ? window.GalleryData.load() : null;

  if (albumId && window.GalleryData) {
    var found = window.GalleryData.findAlbum(galleries, albumId);

    if (!found) {
      var indexUrl = slideshowEl.getAttribute("data-gallery-index") || "/gallery/";
      if (statusEl) {
        statusEl.innerHTML = 'That album was not found. <a href="' + indexUrl + '">All galleries</a>.';
      }
      return;
    }

    var album = found.album;
    if (album.token) SHARE_TOKEN = String(album.token).trim();
    if (galleries.photoprism_url) {
      PHOTOPRISM_URL = galleries.photoprism_url;
    }
    slideshowEl.setAttribute("data-share-token", SHARE_TOKEN);
    slideshowEl.setAttribute("data-photoprism-url", PHOTOPRISM_URL);

    var titleEl = document.querySelector(".post-title");
    if (titleEl) titleEl.textContent = album.title;
    document.title = album.title;

    var firstSlide = document.getElementById("gallery-layer-1");
    if (firstSlide) firstSlide.alt = album.title + " gallery photo";

    var backEl = document.getElementById("gallery-back");
    if (backEl && found.group) {
      var groupUrl = slideshowEl.getAttribute("data-group-url") || "/gallery/group/";
      backEl.innerHTML = '<a href="' + (slideshowEl.getAttribute("data-gallery-index") || "/gallery/") + '">All galleries</a> · <a href="' + groupUrl + "?id=" + encodeURIComponent(found.group.slug) + '">' + found.group.title + "</a>";
    }
  }

  var photos = [];
  var currentIndex = 0;
  var activeLayer = 1;
  var rotateTimer = null;

  var layer1 = document.getElementById("gallery-layer-1");
  var layer2 = document.getElementById("gallery-layer-2");
  var prevBtn = document.getElementById("gallery-prev");
  var nextBtn = document.getElementById("gallery-next");

  function photoHash(photo) {
    if (photo.Hash) return photo.Hash;
    if (photo.Files && photo.Files[0] && photo.Files[0].Hash) return photo.Files[0].Hash;
    return "";
  }

  function isPortraitPhoto(photo, img) {
    if (img && img.naturalHeight > img.naturalWidth) return true;
    if (photo && photo.Portrait) return true;

    var file = photo && photo.Files && photo.Files[0] ? photo.Files[0] : photo;
    var orientation = (file && file.Orientation) || (photo && photo.Orientation) || 1;
    var rotated = orientation === 5 || orientation === 6 || orientation === 7 || orientation === 8;
    var width = (file && file.Width) || (photo && photo.Width) || 0;
    var height = (file && file.Height) || (photo && photo.Height) || 0;

    if (width && height) {
      if (rotated ? width > height : height > width) return true;
    }

    if (file && file.AspectRatio && file.AspectRatio < 1) return true;

    return false;
  }

  function setFrame(photo, img) {
    slideshowEl.classList.toggle("is-portrait", isPortraitPhoto(photo, img));
  }

  function albumLink(label) {
    return '<a href="' + PHOTOPRISM_URL + "/s/" + SHARE_TOKEN + '">' + label + "</a>";
  }

  function shareUid(share) {
    if (!share) return "";
    if (typeof share === "string") return share;
    return share.uid || share.UID || share.ShareUID || share.album || "";
  }

  function asPhotoList(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.photos)) return data.photos;
    if (data && Array.isArray(data.Documents)) return data.Documents;
    return [];
  }

  async function fetchAlbumPhotos() {
    if (!SHARE_TOKEN) {
      statusEl.innerHTML = "This gallery is missing a share token.";
      return;
    }

    try {
      var sessionRes = await fetch(PHOTOPRISM_URL + "/api/v1/session", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: SHARE_TOKEN })
      });

      if (!sessionRes.ok) {
        throw new Error("session:" + sessionRes.status);
      }

      var session = await sessionRes.json();
      var sessionId = session.id || session.access_token || session.session_id;
      var cfg = session.config || {};
      var previewToken = cfg.previewToken || cfg.preview_token || "public";
      var shares = session.data && session.data.shares;
      var albumUid = shareUid(shares && shares[0]);

      function requestPhotos(uid) {
        var photosUrl = new URL("/api/v1/photos", PHOTOPRISM_URL);
        photosUrl.searchParams.set("count", "100");
        photosUrl.searchParams.set("merged", "true");
        photosUrl.searchParams.set("order", "newest");
        if (uid) photosUrl.searchParams.set("album", uid);
        return fetch(photosUrl.toString(), {
          headers: {
            Accept: "application/json",
            "X-Session-ID": sessionId
          }
        });
      }

      var photosRes = await requestPhotos(albumUid);
      if (!photosRes.ok && albumUid) {
        photosRes = await requestPhotos("");
      }

      if (!photosRes.ok) {
        throw new Error("photos:" + photosRes.status);
      }

      var data = asPhotoList(await photosRes.json());
      if (!data.length && albumUid) {
        photosRes = await requestPhotos("");
        if (photosRes.ok) data = asPhotoList(await photosRes.json());
      }
      photos = data
        .map(function (photo) {
          var hash = photoHash(photo);
          if (!hash) return null;
          return {
            photo: photo,
            url: PHOTOPRISM_URL + "/api/v1/t/" + hash + "/" + previewToken + "/fit_2048"
          };
        })
        .filter(Boolean);

      if (photos.length > 0) {
        showSlide(0, true);
        prevBtn.addEventListener("click", function () {
          showSlide(currentIndex - 1);
          startAutoplay();
        });
        nextBtn.addEventListener("click", function () {
          showSlide(currentIndex + 1);
          startAutoplay();
        });
        document.addEventListener("keydown", function (event) {
          if (slideshowEl.hidden) return;
          if (event.key === "ArrowLeft") {
            showSlide(currentIndex - 1);
            startAutoplay();
          } else if (event.key === "ArrowRight") {
            showSlide(currentIndex + 1);
            startAutoplay();
          }
        });
      } else {
        statusEl.innerHTML = "No photos found. " + albumLink("Open the album") + ".";
      }
    } catch (error) {
      console.error("Failed to load photos from PhotoPrism:", error);
      var detail = "";
      if (error && String(error.message).indexOf("session:40") === 0) {
        detail = " PhotoPrism rejected the share token. Each album needs its own unique token, with no share password.";
      } else if (error && String(error.message).indexOf("photos:40") === 0) {
        detail = " The share opened, but PhotoPrism blocked the photo list.";
      }
      statusEl.innerHTML = "Could not load the gallery here. " + albumLink("View photos on PhotoPrism") + "." + detail;
    }
  }

  function showSlide(index, reveal) {
    if (!photos.length) return;
    currentIndex = (index + photos.length) % photos.length;
    var item = photos[currentIndex];
    var nextUrl = item.url;
    var currentLayer = activeLayer === 1 ? layer1 : layer2;
    var nextLayer = activeLayer === 1 ? layer2 : layer1;

    setFrame(item.photo);

    var img = new Image();
    img.src = nextUrl;
    img.onerror = function () {
      if (reveal && statusEl) {
        statusEl.hidden = false;
        statusEl.innerHTML = "Could not display the photo. " + albumLink("View photos on PhotoPrism") + ".";
      }
    };
    img.onload = function () {
      setFrame(item.photo, img);

      nextLayer.src = nextUrl;
      nextLayer.classList.add("active");
      currentLayer.classList.remove("active");
      activeLayer = activeLayer === 1 ? 2 : 1;

      if (reveal) {
        statusEl.hidden = true;
        slideshowEl.hidden = false;
        startAutoplay();
      }
    };
  }

  function startAutoplay() {
    if (rotateTimer) {
      clearInterval(rotateTimer);
    }
    rotateTimer = setInterval(function () {
      showSlide(currentIndex + 1);
    }, ROTATION_INTERVAL);
  }

  fetchAlbumPhotos();
})();
