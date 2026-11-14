/* HomeBasket — shop page: search, filter, sort, loading/empty/error states */
(function () {
  "use strict";
  var HB = window.HB;
  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("product-grid"); if (!grid) return;
    var input = document.getElementById("shop-search"), sortSel = document.getElementById("shop-sort"), chips = document.getElementById("category-chips");
    var subGrid = document.getElementById("subcategory-grid");
    var count = document.getElementById("result-count"), empty = document.getElementById("empty-state"), errBox = document.getElementById("error-state");
    var params = new URLSearchParams(window.location.search), products = [];
    var state = {
      q: (params.get("q") || "").trim(),
      cat: HB.getCategory(params.get("category")) ? params.get("category") : "all",
      subcat: HB.getSubcategory(params.get("subcategory")) && HB.getSubcategory(params.get("subcategory")).category === (HB.getCategory(params.get("category")) ? params.get("category") : "") ? params.get("subcategory") : "all",
      sort: ["name-asc", "name-desc", "price-asc", "price-desc"].indexOf(params.get("sort")) > -1 ? params.get("sort") : "name-asc"
    };

    chips.innerHTML = [{ id: "all", name: "All products" }].concat(window.HB_CATEGORIES).map(function (c) {
      return '<option value="' + HB.escapeHtml(c.id) + '"' + (state.cat === c.id ? ' selected' : '') + '>' + HB.escapeHtml(c.name) + '</option>';
    }).join("");
    chips.value = state.cat;

    function renderSubcategories() {
      if (!subGrid) return;
      if (state.cat === "all") {
        subGrid.hidden = true; subGrid.innerHTML = ""; return;
      }
      var cats = HB.getSubcategoriesForCategory(state.cat);
      if (!cats.length) {
        subGrid.hidden = true; subGrid.innerHTML = ""; return;
      }
      var active = state.subcat && HB.getSubcategory(state.subcat) && HB.getSubcategory(state.subcat).category === state.cat ? state.subcat : "all";
      if (active !== state.subcat) state.subcat = "all";
      subGrid.innerHTML = cats.map(function (sub) {
        var href = window.location.pathname + "?category=" + encodeURIComponent(state.cat) + "&subcategory=" + encodeURIComponent(sub.id);
        var image = HB.subcategoryCoverImage ? HB.subcategoryCoverImage(state.cat, sub.id) : (sub.image || "assets/images/hero-photo.jpg");
        return '<a class="subcategory-card' + (sub.id === active ? ' active' : '') + '" href="' + href + '"><div class="subcategory-image"><img src="' + image + '" alt="' + HB.escapeHtml(sub.name) + '" loading="lazy"></div><div class="subcategory-body"><span class="subcategory-kicker">' + HB.escapeHtml(HB.getCategory(state.cat).name) + '</span><h3>' + HB.escapeHtml(sub.name) + '</h3><p>' + HB.escapeHtml(sub.description || "Browse the product range.") + '</p><span class="subcategory-link">View Products <span aria-hidden="true">→</span></span></div></a>';
      }).join("");
      subGrid.hidden = false;
    }

    function filtered() {
      var q = state.q.toLowerCase();
      var list = products.filter(function (p) {
        if (state.cat !== "all" && p.category !== state.cat) return false;
        if (state.subcat !== "all") {
          var sub = HB.productSubcategory(p);
          if (sub !== state.subcat && (p.subcategory || "") !== state.subcat) return false;
        }
        if (!q) return true;
        var cat = HB.getCategory(p.category);
        return (p.name + " " + p.description + " " + p.unit + " " + (cat ? cat.name : "")).toLowerCase().indexOf(q) > -1;
      });
      list.sort(function (a, b) {
        if (state.sort === "name-desc") return b.name.localeCompare(a.name);
        if (state.sort === "price-asc") return a.price - b.price;
        if (state.sort === "price-desc") return b.price - a.price;
        return a.name.localeCompare(b.name) || a.price - b.price;
      });
      return list;
    }
    function render() {
      renderSubcategories();
      var list = filtered();
      grid.innerHTML = list.map(HB.productCard).join("");
      grid.hidden = !list.length; empty.hidden = list.length > 0;
      count.textContent = list.length + (list.length === 1 ? " product" : " products");
      if (chips) chips.value = state.cat;
      input.value = state.q; sortSel.value = state.sort;
      var p = new URLSearchParams();
      if (state.q) p.set("q", state.q); if (state.cat !== "all") p.set("category", state.cat); if (state.subcat !== "all") p.set("subcategory", state.subcat); if (state.sort !== "name-asc") p.set("sort", state.sort);
      try { history.replaceState(null, "", window.location.pathname + (p.toString() ? "?" + p : "")); } catch (e) {}
    }
    function load() {
      errBox.hidden = true; empty.hidden = true; count.textContent = "Loading products…";
      grid.hidden = false; grid.innerHTML = new Array(8).join('<div class="product-card skeleton" aria-hidden="true"></div>');
      HB.data.products.list().then(function (list) { products = list; render(); var pid = params.get("product"); if (pid && HB.getProduct(pid)) HB.showProductDetails(pid); }, function (e) {
        grid.hidden = true; count.textContent = ""; errBox.hidden = false; errBox.querySelector("p").textContent = HB.errMsg(e);
      });
    }
    var timer;
    input.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(function () { state.q = input.value.trim(); render(); }, 150); });
    document.getElementById("shop-search-form").addEventListener("submit", function (e) { e.preventDefault(); state.q = input.value.trim(); render(); });
    sortSel.addEventListener("change", function () { state.sort = sortSel.value; render(); });
    chips.addEventListener("change", function () { state.cat = chips.value || "all"; state.subcat = "all"; render(); });
    document.getElementById("clear-filters").addEventListener("click", function () { state.q = ""; state.cat = "all"; state.subcat = "all"; state.sort = "name-asc"; render(); input.focus(); });
    document.getElementById("retry-load").addEventListener("click", load);
    HB.bindProductCards(grid);
    load();
  });
})();
