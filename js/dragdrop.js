/* ============================================================
   Gridfolio — Drag to reorder sections (dragdrop.js)
   Pointer-based reordering with a ghost element + drop line.
   ============================================================ */

(function () {
  var listEl, dragging = null, ghost = null, dropLine = null, startY = 0, draggingId = null;

  function makeGhost(card) {
    ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    var icon = card.querySelector(".section-icon");
    var title = card.querySelector(".section-title");
    ghost.innerHTML = (icon ? icon.outerHTML : "") + "<span>" + (title ? title.textContent : "Section") + "</span>";
    document.body.appendChild(ghost);
  }

  function makeDropLine() {
    dropLine = document.createElement("li");
    dropLine.className = "drop-line";
  }

  function cardsExcludingDragged() {
    return Array.prototype.slice.call(listEl.querySelectorAll(".section-card"))
      .filter(function (c) { return c !== dragging; });
  }

  function positionGhost(x, y) {
    if (!ghost) return;
    ghost.style.left = (x + 14) + "px";
    ghost.style.top = (y - 10) + "px";
  }

  function updateDropTarget(y) {
    var cards = cardsExcludingDragged();
    var placed = false;
    for (var i = 0; i < cards.length; i++) {
      var rect = cards[i].getBoundingClientRect();
      if (y < rect.top + rect.height / 2) {
        listEl.insertBefore(dropLine, cards[i]);
        placed = true;
        break;
      }
    }
    if (!placed) listEl.appendChild(dropLine);
  }

  function onPointerMove(e) {
    if (!dragging) return;
    var y = e.clientY, x = e.clientX;
    positionGhost(x, y);
    updateDropTarget(y);
  }

  function commitOrder() {
    // figure new order from DOM: where is the drop line relative to remaining cards
    var nodes = Array.prototype.slice.call(listEl.children);
    var order = [];
    nodes.forEach(function (n) {
      if (n === dropLine) { order.push(draggingId); }
      else if (n.classList && n.classList.contains("section-card") && n !== dragging) {
        order.push(n.dataset.sid);
      }
    });
    // if drop line wasn't reached (edge), ensure dragging id included
    if (order.indexOf(draggingId) === -1) order.push(draggingId);

    window.GF_Store.update(function (st) {
      var map = {};
      st.sections.forEach(function (s) { map[s.id] = s; });
      st.sections = order.map(function (id) { return map[id]; }).filter(Boolean);
    });
  }

  function endDrag() {
    if (!dragging) return;
    var changed = dropLine && dropLine.parentNode;
    if (changed) commitOrder();

    if (ghost) ghost.remove();
    if (dropLine && dropLine.parentNode) dropLine.remove();
    dragging.classList.remove("dragging");

    ghost = null; dropLine = null;
    var wasId = draggingId;
    dragging = null; draggingId = null;

    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", endDrag);

    // re-render to reflect new order, keep dragged card open state handled by render
    window.GF_Builder.renderSections();
    if (changed) window.GF_toast("Section reordered");
  }

  function onPointerDown(e) {
    var handle = e.target.closest("[data-drag-handle]");
    if (!handle) return;
    e.preventDefault();
    dragging = handle.closest(".section-card");
    if (!dragging) return;
    draggingId = dragging.dataset.sid;
    startY = e.clientY;
    dragging.classList.add("dragging");
    makeGhost(dragging);
    makeDropLine();
    positionGhost(e.clientX, e.clientY);
    updateDropTarget(e.clientY);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", endDrag);
  }

  function init() {
    listEl = document.getElementById("sectionList");
    listEl.addEventListener("pointerdown", onPointerDown);
  }

  window.GF_Drag = { init: init };
})();
