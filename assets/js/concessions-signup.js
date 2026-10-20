(function () {
  var eventsEl = document.getElementById("concessions-events-json");
  var form = document.getElementById("concessions-signup-form");
  var cancelForm = document.getElementById("concessions-cancel-form");
  var params = new URLSearchParams(window.location.search);
  var events = {};
  var maxPeople = 9;

  if (eventsEl) {
    try {
      events = JSON.parse(eventsEl.textContent || "{}");
    } catch (err) {
      events = {};
    }
  }

  function formatDate(value) {
    if (!value) return "";
    var parts = String(value).split("-");
    if (parts.length !== 3) return value;
    var dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(dt.getTime())) return value;
    return dt.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  }

  function show(el) {
    if (el) el.hidden = false;
  }

  function hide(el) {
    if (el) el.hidden = true;
  }

  if (form) {
    var slugInput = document.getElementById("signup-event-slug");
    var summary = document.getElementById("signup-event-summary");
    var closed = document.getElementById("signup-closed");
    var missing = document.getElementById("signup-missing");
    var list = document.getElementById("signup-event-list");
    var email = document.getElementById("signup-email");
    var peopleList = document.getElementById("signup-people-list");
    var addBtn = document.getElementById("signup-add-person");
    var personTemplate = document.getElementById("signup-person-template");
    var slug = params.get("event") || "";
    var event = events[slug];

    function personRows() {
      return peopleList ? peopleList.querySelectorAll(".concessions-person") : [];
    }

    function addPersonRow() {
      if (!personTemplate || !peopleList || personRows().length >= maxPeople) return;
      var node = personTemplate.content.firstElementChild.cloneNode(true);
      var remove = node.querySelector(".concessions-remove-person");
      if (remove) {
        remove.addEventListener("click", function () {
          node.remove();
        });
      }
      peopleList.appendChild(node);
      var nameInput = node.querySelector(".person-name");
      if (nameInput) nameInput.focus();
    }

    if (addBtn) {
      addBtn.addEventListener("click", addPersonRow);
    }

    form.addEventListener("submit", function () {
      var rows = personRows();
      var extras = [];
      var firstName = "";
      var firstAdult = false;
      for (var i = 0; i < rows.length; i += 1) {
        var nameInput = rows[i].querySelector(".person-name");
        var adultInput = rows[i].querySelector(".person-adult");
        var name = nameInput ? String(nameInput.value || "").trim() : "";
        if (!name) continue;
        var isAdult = !!(adultInput && adultInput.checked);
        if (i === 0) {
          firstName = name;
          firstAdult = isAdult;
        } else {
          extras.push(isAdult ? name + " (adult)" : name);
        }
      }
      var people = (firstName ? 1 : 0) + extras.length;
      document.getElementById("signup-adult-name").value = firstName;
      document.getElementById("signup-adult-flag").value = firstAdult ? "true" : "false";
      document.getElementById("signup-students").value = String(extras.length);
      document.getElementById("signup-student-names").value = extras.join("\n");
      document.getElementById("signup-people").value = String(people || 1);
      try {
        sessionStorage.setItem("concessionsSignupEmail", email ? email.value : "");
        sessionStorage.setItem("concessionsSignupName", firstName);
        sessionStorage.setItem("concessionsSignupEvent", slug);
      } catch (err) {}
    });

    if (event) {
      slugInput.value = slug;
      var titleInput = document.getElementById("signup-event-title");
      if (titleInput) titleInput.value = event.title || "";
      var dateInput = document.getElementById("signup-event-date");
      if (dateInput) dateInput.value = formatDate(event.date);
      summary.textContent =
        event.title +
        " — " +
        formatDate(event.date) +
        " " +
        event.start +
        "–" +
        event.end +
        " · " +
        event.spots_left +
        " of " +
        event.roster_need +
        " spots left";
      show(summary);
      if (Number(event.spots_left) > 0) {
        show(form);
      } else {
        show(closed);
      }
    } else {
      show(missing);
      var slugs = Object.keys(events);
      if (slugs.length && list) {
        slugs.forEach(function (key) {
          var item = events[key];
          var li = document.createElement("li");
          var href = window.location.pathname + "?event=" + encodeURIComponent(key);
          if (Number(item.spots_left) > 0) {
            li.innerHTML =
              '<a href="' +
              href +
              '">' +
              item.title +
              "</a> — " +
              formatDate(item.date) +
              " · " +
              item.spots_left +
              " spots left";
          } else {
            li.textContent = item.title + " — " + formatDate(item.date) + " · full";
          }
          list.appendChild(li);
        });
        show(list);
      }
    }
  }

  if (cancelForm) {
    var tokenInput = document.getElementById("cancel-token");
    var cancelMissing = document.getElementById("cancel-missing");
    var submit = document.getElementById("cancel-submit");
    var token = params.get("token") || "";
    if (token) {
      tokenInput.value = token;
      show(cancelForm);
      cancelForm.addEventListener("submit", function () {
        if (submit) {
          submit.disabled = true;
          submit.textContent = "Removing…";
        }
      });
    } else {
      show(cancelMissing);
    }
  }

  var thanksCancel = document.getElementById("thanks-cancel-wrap");
  if (thanksCancel) {
    var token = params.get("token") || "";
    var status = params.get("status") || "";
    var signed = document.getElementById("thanks-signed");
    var cancelled = document.getElementById("thanks-cancelled");
    var cancelLink = document.getElementById("thanks-cancel-link");
    if (status === "cancelled") {
      hide(signed);
      show(cancelled);
      hide(thanksCancel);
    } else if (token && cancelLink) {
      var cancelUrl =
        window.location.origin +
        "/events/concessions-cancel/?token=" +
        encodeURIComponent(token);
      cancelLink.href = cancelUrl;
      cancelLink.textContent = cancelUrl;
      show(thanksCancel);
    }
  }
})();
