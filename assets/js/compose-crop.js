(function () {
  var OUT_W = 1080;
  var OUT_H = 1350;
  var ZOOM_MIN = 1;
  var ZOOM_MAX = 4;
  var form = document.getElementById("compose-form");
  var input = document.getElementById("compose-image");
  var drop = document.getElementById("compose-drop");
  var frame = document.getElementById("compose-crop-frame");
  var img = document.getElementById("compose-crop-img");
  var hint = document.getElementById("compose-drop-hint");
  var choose = document.getElementById("compose-choose");
  var zoom = document.getElementById("compose-zoom");
  var zoomIn = document.getElementById("compose-zoom-in");
  var zoomOut = document.getElementById("compose-zoom-out");
  var moveUp = document.getElementById("compose-up");
  var moveDown = document.getElementById("compose-down");
  var imagesInput = document.getElementById("compose-images");
  var videoInput = document.getElementById("compose-video");
  var thumbs = document.getElementById("compose-thumbs");
  var videoName = document.getElementById("compose-video-name");
  var mediaType = document.getElementById("compose-media-type");
  var tagsField = document.getElementById("compose-tags");
  var topicField = document.getElementById("compose-topic");
  var hashtagsField = document.getElementById("compose-hashtags");
  var altField = document.getElementById("compose-alt-field");
  var panelImage = document.getElementById("compose-panel-image");
  var panelCarousel = document.getElementById("compose-panel-carousel");
  var panelReel = document.getElementById("compose-panel-reel");

  if (!form || !input || !drop || !frame || !img || !zoom) return;

  var objectUrl = "";
  var panX = 0;
  var panY = 0;
  var scale = 1;
  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  var submitting = false;

  function minScale() {
    if (!img.naturalWidth || !frame.clientWidth || !frame.clientHeight) return 1;
    return Math.max(frame.clientWidth / img.naturalWidth, frame.clientHeight / img.naturalHeight);
  }

  function maxPan() {
    var w = img.naturalWidth * scale;
    var h = img.naturalHeight * scale;
    return {
      x: Math.max(0, (w - frame.clientWidth) / 2),
      y: Math.max(0, (h - frame.clientHeight) / 2)
    };
  }

  function clampPan() {
    var max = maxPan();
    panX = Math.min(max.x, Math.max(-max.x, panX));
    panY = Math.min(max.y, Math.max(-max.y, panY));
  }

  function applyTransform() {
    img.style.transform =
      "translate(-50%, -50%) translate(" + panX + "px, " + panY + "px) scale(" + scale + ")";
  }

  function setControlsEnabled(on) {
    zoom.disabled = !on;
    if (zoomIn) zoomIn.disabled = !on;
    if (zoomOut) zoomOut.disabled = !on;
    if (moveUp) moveUp.disabled = !on;
    if (moveDown) moveDown.disabled = !on;
  }

  function setZoomFromSlider() {
    scale = minScale() * Number(zoom.value);
    clampPan();
    applyTransform();
  }

  function bumpZoom(delta) {
    var next = Number(zoom.value) + delta;
    zoom.value = String(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next)));
    setZoomFromSlider();
  }

  function nudgeY(pixels) {
    panY += pixels;
    clampPan();
    applyTransform();
  }

  function layoutAndApply() {
    void frame.offsetHeight;
    setZoomFromSlider();
  }

  function loadFile(file) {
    if (!file || !file.type || file.type.indexOf("image/") !== 0) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    img.onload = function () {
      frame.hidden = false;
      img.style.width = img.naturalWidth + "px";
      img.style.height = img.naturalHeight + "px";
      panX = 0;
      panY = 0;
      var wide = img.naturalWidth / img.naturalHeight > 0.8;
      zoom.value = wide ? "1.25" : "1.15";
      setControlsEnabled(true);
      hint.textContent = "Use + and − to zoom. Drag the photo, or tap Up / Down, to move it in the frame.";
      choose.textContent = "Choose a different photo";
      requestAnimationFrame(layoutAndApply);
    };
    img.src = objectUrl;
  }

  function cropSource() {
    var s = scale;
    var imgLeft = frame.clientWidth / 2 + panX - (img.naturalWidth * s) / 2;
    var imgTop = frame.clientHeight / 2 + panY - (img.naturalHeight * s) / 2;
    return {
      x: (0 - imgLeft) / s,
      y: (0 - imgTop) / s,
      w: frame.clientWidth / s,
      h: frame.clientHeight / s
    };
  }

  function cropToJpeg(done) {
    var canvas = document.createElement("canvas");
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    var ctx = canvas.getContext("2d");
    var src = cropSource();
    ctx.drawImage(img, src.x, src.y, src.w, src.h, 0, 0, OUT_W, OUT_H);
    canvas.toBlob(
      function (blob) {
        if (!blob) {
          done(null);
          return;
        }
        done(new File([blob], "compose.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9
    );
  }

  choose.addEventListener("click", function () {
    input.click();
  });

  drop.addEventListener("click", function (event) {
    if (event.target === choose || choose.contains(event.target)) return;
    if (!frame.hidden && frame.contains(event.target)) return;
    input.click();
  });

  input.addEventListener("change", function () {
    if (input.files && input.files[0]) loadFile(input.files[0]);
  });

  ["dragenter", "dragover"].forEach(function (type) {
    drop.addEventListener(type, function (event) {
      event.preventDefault();
      drop.classList.add("is-dragover");
    });
  });

  ["dragleave", "drop"].forEach(function (type) {
    drop.addEventListener(type, function () {
      drop.classList.remove("is-dragover");
    });
  });

  drop.addEventListener("drop", function (event) {
    event.preventDefault();
    var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) return;
    try {
      var transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
    } catch (err) {
      /* crop uses the object URL below */
    }
    loadFile(file);
  });

  zoom.addEventListener("input", setZoomFromSlider);

  if (zoomIn) {
    zoomIn.addEventListener("click", function () {
      bumpZoom(0.2);
    });
  }
  if (zoomOut) {
    zoomOut.addEventListener("click", function () {
      bumpZoom(-0.2);
    });
  }
  if (moveUp) {
    moveUp.addEventListener("click", function () {
      nudgeY(-24);
    });
  }
  if (moveDown) {
    moveDown.addEventListener("click", function () {
      nudgeY(24);
    });
  }

  frame.addEventListener("pointerdown", function (event) {
    if (frame.hidden) return;
    event.preventDefault();
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    frame.classList.add("is-dragging");
    if (frame.setPointerCapture) frame.setPointerCapture(event.pointerId);
  });

  frame.addEventListener("pointermove", function (event) {
    if (!dragging) return;
    event.preventDefault();
    panX += event.clientX - lastX;
    panY += event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    clampPan();
    applyTransform();
  });

  function endDrag() {
    dragging = false;
    frame.classList.remove("is-dragging");
  }

  frame.addEventListener("pointerup", endDrag);
  frame.addEventListener("pointercancel", endDrag);

  frame.addEventListener(
    "wheel",
    function (event) {
      if (frame.hidden) return;
      event.preventDefault();
      bumpZoom(event.deltaY < 0 ? 0.12 : -0.12);
    },
    { passive: false }
  );

  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      if (frame.hidden || !img.naturalWidth) return;
      layoutAndApply();
    }).observe(frame);
  }

  function currentKind() {
    var picked = form.querySelector('input[name="media_kind"]:checked');
    return picked ? picked.value : "image";
  }

  function buildTags() {
    var tags = ["news"];
    var topic = topicField && topicField.value ? topicField.value.trim() : "";
    if (topic && tags.indexOf(topic) === -1) tags.push(topic);
    var raw = hashtagsField && hashtagsField.value ? hashtagsField.value : "";
    raw.replace(/#/g, " ").split(/[\s,]+/).forEach(function (part) {
      var t = part.trim().toLowerCase();
      if (t && tags.indexOf(t) === -1) tags.push(t);
    });
    return tags.join(",");
  }

  function syncMode() {
    var kind = currentKind();
    if (mediaType) {
      mediaType.value = kind === "reel" ? "REELS" : kind === "carousel" ? "CAROUSEL" : "IMAGE";
    }
    if (panelImage) panelImage.hidden = kind !== "image";
    if (panelCarousel) panelCarousel.hidden = kind !== "carousel";
    if (panelReel) panelReel.hidden = kind !== "reel";
    input.required = kind === "image";
    if (imagesInput) imagesInput.required = kind === "carousel";
    if (videoInput) videoInput.required = kind === "reel";
    if (altField) altField.hidden = kind === "reel";
  }

  function loadImageFile(file, done) {
    var image = new Image();
    var url = URL.createObjectURL(file);
    image.onload = function () {
      URL.revokeObjectURL(url);
      done(image);
    };
    image.onerror = function () {
      URL.revokeObjectURL(url);
      done(null);
    };
    image.src = url;
  }

  function squareJpeg(file, index, done) {
    loadImageFile(file, function (image) {
      if (!image) {
        done(null);
        return;
      }
      var side = Math.min(image.naturalWidth, image.naturalHeight);
      var sx = (image.naturalWidth - side) / 2;
      var sy = (image.naturalHeight - side) / 2;
      var canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      canvas.getContext("2d").drawImage(image, sx, sy, side, side, 0, 0, 1080, 1080);
      canvas.toBlob(
        function (blob) {
          if (!blob) {
            done(null);
            return;
          }
          done(new File([blob], "compose-" + (index + 1) + ".jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.9
      );
    });
  }

  function convertCarousel(files, done) {
    var out = [];
    var i = 0;
    function next() {
      if (i >= files.length) {
        done(out);
        return;
      }
      squareJpeg(files[i], i, function (file) {
        if (file) out.push(file);
        i += 1;
        next();
      });
    }
    next();
  }

  function renderThumbs(fileList) {
    if (!thumbs) return;
    thumbs.innerHTML = "";
    Array.prototype.forEach.call(fileList, function (file) {
      if (!file.type || file.type.indexOf("image/") !== 0) return;
      var preview = document.createElement("img");
      preview.alt = file.name;
      preview.src = URL.createObjectURL(file);
      thumbs.appendChild(preview);
    });
  }

  function finishSubmit() {
    if (tagsField) tagsField.value = buildTags();
    submitting = true;
    form.submit();
  }

  form.querySelectorAll('input[name="media_kind"]').forEach(function (radio) {
    radio.addEventListener("change", syncMode);
  });
  syncMode();

  if (imagesInput) {
    imagesInput.addEventListener("change", function () {
      renderThumbs(imagesInput.files || []);
    });
  }
  if (videoInput) {
    videoInput.addEventListener("change", function () {
      var file = videoInput.files && videoInput.files[0];
      if (videoName) {
        videoName.textContent = file ? file.name + (file.type === "video/mp4" || /\.mp4$/i.test(file.name) ? "" : " — use an MP4") : "";
      }
    });
  }

  form.addEventListener("submit", function (event) {
    if (submitting) return;
    if (tagsField) tagsField.value = buildTags();
    var kind = currentKind();

    if (kind === "image") {
      if (frame.hidden || !img.naturalWidth) return;
      event.preventDefault();
      cropToJpeg(function (file) {
        if (file) {
          try {
            var transfer = new DataTransfer();
            transfer.items.add(file);
            input.files = transfer.files;
          } catch (err) {
            /* send original */
          }
        }
        finishSubmit();
      });
      return;
    }

    if (kind === "carousel") {
      event.preventDefault();
      var picked = imagesInput && imagesInput.files ? Array.prototype.slice.call(imagesInput.files, 0, 10) : [];
      picked = picked.filter(function (file) {
        return file.type && file.type.indexOf("image/") === 0;
      });
      if (picked.length < 2) {
        window.alert("Choose at least two photos for a carousel.");
        return;
      }
      convertCarousel(picked, function (jpegs) {
        if (!jpegs.length) {
          window.alert("Could not convert those photos to JPEG.");
          return;
        }
        try {
          var transfer = new DataTransfer();
          jpegs.forEach(function (file) {
            transfer.items.add(file);
          });
          imagesInput.files = transfer.files;
        } catch (err) {
          /* send originals */
        }
        finishSubmit();
      });
      return;
    }

    if (kind === "reel") {
      var video = videoInput && videoInput.files && videoInput.files[0];
      if (!video) return;
      if (video.type && video.type !== "video/mp4" && !/\.mp4$/i.test(video.name)) {
        event.preventDefault();
        window.alert("Reels must be an MP4 file.");
      }
    }
  });
})();
