(function () {
  var root = document.getElementById("menu-pdf");
  if (!root) return;

  var url = root.getAttribute("data-pdf");
  var fallback = document.getElementById("menu-pdf-fallback");

  function showFallback() {
    root.innerHTML = "";
    var object = document.createElement("object");
    object.className = "menu-pdf-object";
    object.setAttribute("data", url);
    object.setAttribute("type", "application/pdf");
    var link = document.createElement("a");
    link.className = "outline-button";
    link.href = url;
    link.textContent = "Open the concessions menu (PDF)";
    object.appendChild(link);
    root.appendChild(object);
  }

  if (!window.pdfjsLib || !url) {
    showFallback();
    return;
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  function renderPage(page) {
    var width = root.clientWidth || Math.min(window.innerWidth, 900);
    var unscaled = page.getViewport({ scale: 1 });
    var scale = width / unscaled.width;
    var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    var viewport = page.getViewport({ scale: scale * pixelRatio });
    var canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = "100%";
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Concessions menu page " + page.pageNumber);
    root.appendChild(canvas);
    return page.render({
      canvasContext: canvas.getContext("2d", { alpha: false }),
      viewport: viewport
    }).promise;
  }

  pdfjsLib.getDocument(url).promise.then(function (pdf) {
    if (fallback) fallback.remove();
    var chain = Promise.resolve();
    for (var n = 1; n <= pdf.numPages; n += 1) {
      chain = chain.then(function (pageNumber) {
        return function () {
          return pdf.getPage(pageNumber).then(renderPage);
        };
      }(n));
    }
    return chain;
  }).catch(showFallback);
})();
