(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("supplier-application-form");
    if (!form) return;

    var currentStep = 1;
    var entryCounter = 0;
    var objectUrls = {};
    var panels = Array.from(form.querySelectorAll("[data-step-panel]"));
    var progressItems = Array.from(form.querySelectorAll("[data-progress-step]"));
    var stepCount = document.getElementById("supplier-step-count");
    var submitButton = document.getElementById("supplier-submit-button");
    var submitError = document.getElementById("supplier-application-error");
    var categoryWrap = document.getElementById("supplier-categories");
    var productGroups = document.getElementById("supplier-category-products");
    var units = [
      "Kilograms (kg)", "Grams (g)", "Tonnes", "Bags", "Cartons", "Pieces",
      "Crates", "Litres", "Bottles", "Packs", "Dozens"
    ];
    var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    function setError(id, message) {
      var error = document.getElementById(id);
      if (error) error.textContent = message || "";
    }

    function fieldError(control) {
      if (control.type === "checkbox" && !control.checked) return "Please confirm this before continuing.";
      if (control.type === "number") {
        if (control.value === "") return "Enter a quantity.";
        if (!control.validity.valid) return "Enter a valid quantity.";
      } else if (!String(control.value || "").trim()) {
        return "This field is required.";
      }
      if (control.id === "phone") {
        var digits = control.value.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 15) return "Enter a valid phone or WhatsApp number.";
      }
      if (control.type === "email" && !control.validity.valid) return "Enter a valid email address.";
      return "";
    }

    function clearPanelErrors(panel) {
      panel.querySelectorAll("[data-error-id]").forEach(function (control) {
        control.removeAttribute("aria-invalid");
        setError(control.getAttribute("data-error-id"), "");
      });
      panel.querySelectorAll(".supplier-product-entry").forEach(function (entry) {
        entry.classList.remove("has-error");
        entry.querySelectorAll(".availability-days input").forEach(function (checkbox) { checkbox.removeAttribute("aria-invalid"); });
        setError(entry.getAttribute("data-day-error"), "");
      });
      panel.querySelectorAll(".supplier-category-products-group").forEach(function (group) {
        setError(group.getAttribute("data-product-error"), "");
      });
      setError("err-productCategories", "");
    }

    function validateProduct(entry) {
      var valid = true;
      entry.classList.remove("has-error");
      entry.querySelectorAll('[data-required="true"]:not([hidden])').forEach(function (control) {
        if (control.closest("[hidden]")) return;
        var message = fieldError(control);
        if (message) {
          control.setAttribute("aria-invalid", "true");
          setError(control.getAttribute("data-error-id"), message);
          valid = false;
        } else {
          control.removeAttribute("aria-invalid");
          setError(control.getAttribute("data-error-id"), "");
        }
      });
      var price = entry.querySelector(".product-price");
      if (price.value !== "" && !price.validity.valid) {
        price.setAttribute("aria-invalid", "true");
        setError(price.getAttribute("data-error-id"), "Enter a price greater than zero, or leave this optional field blank.");
        valid = false;
      }
      var availability = entry.querySelector(".product-availability");
      var selectedDays = entry.querySelectorAll('.availability-days input[type="checkbox"]:checked');
      if (availability.value === "specific-days" && !selectedDays.length) {
        entry.classList.add("has-error");
        setError(entry.getAttribute("data-day-error"), "Select at least one available day.");
        var firstDay = entry.querySelector(".availability-days input");
        firstDay.setAttribute("aria-invalid", "true");
        if (valid) firstDay.focus();
        valid = false;
      } else {
        setError(entry.getAttribute("data-day-error"), "");
      }
      if (!valid) entry.classList.add("has-error");
      return valid;
    }

    function validateStep(step) {
      var panel = form.querySelector('[data-step-panel="' + step + '"]');
      if (!panel) return true;
      clearPanelErrors(panel);
      var invalidControls = [];
      panel.querySelectorAll("[required], [data-required='true']").forEach(function (control) {
        if (control.closest(".supplier-product-entry")) return;
        var message = fieldError(control);
        if (message) {
          control.setAttribute("aria-invalid", "true");
          setError(control.getAttribute("data-error-id"), message);
          invalidControls.push(control);
        }
      });

      if (step === 2) {
        var selected = selectedCategories();
        if (!selected.length) {
          setError("err-productCategories", "Select at least one product category.");
          var firstCategory = categoryWrap.querySelector("input");
          if (firstCategory) invalidControls.push(firstCategory);
        }
        selected.forEach(function (category) {
          var group = productGroups.querySelector('.supplier-category-products-group[data-category="' + category.id + '"]');
          var entries = group.querySelectorAll(".supplier-product-entry");
          if (!entries.length) {
            setError(group.getAttribute("data-product-error"), "Select at least one product in this category.");
            var firstProduct = group.querySelector(".category-product-option-control");
            if (firstProduct) invalidControls.push(firstProduct);
          }
          entries.forEach(function (entry) {
            if (!validateProduct(entry)) {
              var firstInvalid = entry.querySelector('[aria-invalid="true"]');
              if (firstInvalid) invalidControls.push(firstInvalid);
            }
          });
        });
      }
      if (invalidControls.length) {
        invalidControls[0].focus();
        return false;
      }
      return true;
    }

    function showStep(step, focusHeading) {
      currentStep = step;
      panels.forEach(function (panel) {
        panel.hidden = Number(panel.getAttribute("data-step-panel")) !== step;
      });
      progressItems.forEach(function (item) {
        var itemStep = Number(item.getAttribute("data-progress-step"));
        item.classList.toggle("is-current", itemStep === step);
        item.classList.toggle("is-complete", itemStep < step);
        if (itemStep === step) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
      stepCount.textContent = "Step " + step + " of 3";
      if (step === 3) renderReview();
      if (focusHeading) {
        var heading = form.querySelector('[data-step-panel="' + step + '"] h3');
        if (heading) heading.focus();
        form.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      }
    }

    function addText(parent, tagName, className, text) {
      var element = document.createElement(tagName);
      if (className) element.className = className;
      element.textContent = text;
      parent.appendChild(element);
      return element;
    }

    function esc(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
      });
    }

    function value(id) {
      var field = document.getElementById(id);
      return field ? String(field.value || "").trim() : "";
    }

    function selectedCategories() {
      return Array.from(categoryWrap.querySelectorAll('input[name="productCategories"]:checked')).map(function (checkbox) {
        return { id: checkbox.value, name: checkbox.getAttribute("data-label") };
      });
    }

    function selectedDays(entry) {
      return Array.from(entry.querySelectorAll('.availability-days input[type="checkbox"]:checked')).map(function (checkbox) {
        return checkbox.value;
      });
    }

    function productLabel(entry) {
      return productName(entry);
    }

    function productName(entry) {
      if (entry.getAttribute("data-product-id") === "__other__") return entry.querySelector(".product-other").value.trim();
      return entry.getAttribute("data-product-name") || "";
    }

    function productUnit(entry) {
      var unitSelect = entry.querySelector(".product-unit");
      return unitSelect.value === "__other__" ? entry.querySelector(".product-unit-other").value.trim() : unitSelect.value;
    }

    function productSummary(entry) {
      var capacityType = entry.querySelector(".product-capacity").value;
      var capacity = capacityType;
      if (capacityType === "custom") {
        capacity = entry.querySelector(".product-capacity-custom").value + " " + (productUnit(entry) || "units");
      } else {
        capacity = entry.querySelector(".product-capacity option:checked").textContent;
      }
      var availability = entry.querySelector(".product-availability").value;
      var availabilityLabels = {
        daily: "Available daily",
        weekly: "Available weekly",
        "specific-days": "Available on specific days",
        seasonal: "Seasonal availability",
        "on-request": "Available on request",
        unavailable: "Currently unavailable"
      };
      availability = availabilityLabels[availability] || availability;
      if (entry.querySelector(".product-availability").value === "specific-days") availability += ": " + selectedDays(entry).join(", ");
      var price = entry.querySelector(".product-price").value;
      var moqUnitValue = entry.querySelector(".product-moq-unit").value;
      var moqUnit = moqUnitValue === "__product_unit__"
        ? (productUnit(entry) || "product unit")
        : (moqUnitValue === "__other__" ? entry.querySelector(".product-moq-unit-other").value.trim() : moqUnitValue);
      return [
        ["Product", productLabel(entry)],
        ["Supply capacity", capacity],
        ["Unit", productUnit(entry)],
        ["Availability", availability],
        ["Minimum order", entry.querySelector(".product-moq").value + " " + moqUnit],
        ["Indicative wholesale price", price ? "₦" + Number(price).toLocaleString("en-NG") + " per " + (productUnit(entry) || "unit") : "Not provided"]
      ];
    }

    function renderReview() {
      var summary = document.getElementById("supplier-review-summary");
      summary.textContent = "";
      var groups = [
        {
          title: "Business information",
          step: 1,
          items: [
            ["Business name", value("businessName")],
            ["Contact person", value("contactPerson")],
            ["Phone / WhatsApp", value("phone")],
            ["Email", value("email")],
            ["Business address", value("businessAddress")],
            ["Operating area", value("location")],
            ["Business type", value("businessType")]
          ]
        },
        {
          title: "Fulfilment & payment",
          step: 2,
          items: [
            ["Fulfilment", value("supplierFulfilment")],
            ["Payment terms", value("supplierPaymentTerms")],
            ["Additional information", value("description")]
          ]
        },
        {
          title: "Verification",
          step: 3,
          items: [
            ["Store photograph", fileName("storeExterior")],
            ["Products / inventory photograph", fileName("inventoryPhotos")],
            ["Business location confirmed", document.getElementById("locationConfirmation").checked ? "Confirmed" : "Not confirmed"],
            ["Supplier policies & review process", document.getElementById("declaration").checked ? "Agreed" : "Not agreed"]
          ]
        }
      ];

      groups.forEach(function (group) {
        var section = document.createElement("section");
        section.className = "review-group";
        var heading = document.createElement("div");
        heading.className = "review-group-heading";
        addText(heading, "h5", "", group.title);
        if (group.step < 3) {
          var edit = document.createElement("button");
          edit.type = "button";
          edit.className = "link-btn review-edit";
          edit.setAttribute("data-edit-step", String(group.step));
          edit.textContent = "Edit";
          heading.appendChild(edit);
        }
        section.appendChild(heading);
        var list = document.createElement("dl");
        list.className = "review-items";
        group.items.forEach(function (item) {
          var row = document.createElement("div");
          addText(row, "dt", "", item[0]);
          addText(row, "dd", "", item[1] || "Not provided");
          list.appendChild(row);
        });
        section.appendChild(list);
        summary.appendChild(section);
      });

      selectedCategories().forEach(function (category) {
        var section = document.createElement("section");
        section.className = "review-group review-products-group";
        addText(section, "h5", "review-category-title", category.name);
        productGroups.querySelectorAll('.supplier-category-products-group[data-category="' + category.id + '"] .supplier-product-entry').forEach(function (entry, index) {
          var product = document.createElement("div");
          product.className = "review-product";
          addText(product, "h6", "", "Product " + (index + 1) + ": " + (productLabel(entry) || "Not selected"));
          var dl = document.createElement("dl");
          dl.className = "review-items";
          productSummary(entry).slice(1).forEach(function (item) {
            var row = document.createElement("div");
            addText(row, "dt", "", item[0]);
            addText(row, "dd", "", item[1] || "Not provided");
            dl.appendChild(row);
          });
          product.appendChild(dl);
          section.appendChild(product);
        });
        var edit = document.createElement("button");
        edit.type = "button";
        edit.className = "link-btn review-edit";
        edit.setAttribute("data-edit-step", "2");
        edit.textContent = "Edit products";
        section.appendChild(edit);
        summary.appendChild(section);
      });
    }

    function fileName(inputId) {
      var input = document.getElementById(inputId);
      return input && input.files && input.files[0] ? input.files[0].name : "";
    }

    function createCategorySelector() {
      (window.HB_CATEGORIES || []).forEach(function (category, index) {
        var label = document.createElement("label");
        label.className = "supplier-category-card";
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "productCategories";
        checkbox.value = category.id;
        checkbox.id = "supplier-category-" + index;
        checkbox.setAttribute("data-label", category.name);
        var text = document.createElement("span");
        text.textContent = category.name;
        label.htmlFor = checkbox.id;
        label.appendChild(checkbox);
        label.appendChild(text);
        categoryWrap.appendChild(label);
      });
    }

    function optionMarkup(items, placeholder) {
      return '<option value="">' + esc(placeholder) + "</option>" + items.map(function (item) {
        return '<option value="' + esc(item.value) + '">' + esc(item.label) + "</option>";
      }).join("");
    }

    function addProductEntry(group, product) {
      entryCounter += 1;
      var key = "supplier-product-" + entryCounter;
      var productUnits = units.slice();
      if (product.unit && productUnits.indexOf(product.unit) === -1) productUnits.unshift(product.unit);
      var entry = document.createElement("article");
      entry.className = "supplier-product-entry";
      entry.setAttribute("data-entry-id", key);
      entry.setAttribute("data-day-error", key + "-days-error");
      entry.setAttribute("data-product-id", product.id);
      entry.setAttribute("data-product-name", product.name);
      entry.innerHTML =
        '<div class="supplier-product-entry-heading"><div><span class="step-kicker">SUPPLY ITEM</span><h5></h5></div>' +
        '<button type="button" class="link-btn supplier-remove-product" aria-label="Remove this product">Remove</button></div>' +
        '<div class="supplier-field-grid">' +
        '<div class="field field-span product-other-wrap" hidden><label for="' + key + '-other">Product name <span class="required-mark" aria-hidden="true">*</span></label>' +
        '<input id="' + key + '-other" class="product-other" type="text" maxlength="160" placeholder="Enter the product name" data-required="true" data-error-id="' + key + '-other-error" aria-describedby="' + key + '-other-error"><p class="field-error" id="' + key + '-other-error" role="alert"></p></div>' +
        '<div class="field"><label for="' + key + '-capacity">Supply capacity <span class="required-mark" aria-hidden="true">*</span></label>' +
        '<select id="' + key + '-capacity" class="product-capacity" data-required="true" data-error-id="' + key + '-capacity-error" aria-describedby="' + key + '-capacity-error">' +
        optionMarkup([{value:"small",label:"Small-scale supply"},{value:"medium",label:"Medium-scale supply"},{value:"large",label:"Large-scale supply"},{value:"custom",label:"Custom capacity"}], "Choose capacity") +
        '</select><p class="field-error" id="' + key + '-capacity-error" role="alert"></p></div>' +
        '<div class="field product-capacity-custom-wrap" hidden><label for="' + key + '-capacity-custom">Your actual capacity <span class="required-mark" aria-hidden="true">*</span></label>' +
        '<input id="' + key + '-capacity-custom" class="product-capacity-custom" type="number" min="0.01" step="any" inputmode="decimal" placeholder="Quantity per supply period" data-required="true" data-error-id="' + key + '-capacity-custom-error" aria-describedby="' + key + '-capacity-custom-error"><p class="field-error" id="' + key + '-capacity-custom-error" role="alert"></p></div>' +
        '<div class="field"><label for="' + key + '-unit">Unit of measurement <span class="required-mark" aria-hidden="true">*</span></label>' +
        '<select id="' + key + '-unit" class="product-unit" data-required="true" data-error-id="' + key + '-unit-error" aria-describedby="' + key + '-unit-error">' +
        optionMarkup(productUnits.map(function (unit) { return {value:unit,label:unit}; }), "Choose a unit") +
        '<option value="__other__">Other — specify</option></select><p class="field-error" id="' + key + '-unit-error" role="alert"></p></div>' +
        '<div class="field product-unit-other-wrap" hidden><label for="' + key + '-unit-other">Specify unit <span class="required-mark" aria-hidden="true">*</span></label>' +
        '<input id="' + key + '-unit-other" class="product-unit-other" type="text" maxlength="60" placeholder="Enter a unit" data-required="true" data-error-id="' + key + '-unit-other-error" aria-describedby="' + key + '-unit-other-error"><p class="field-error" id="' + key + '-unit-other-error" role="alert"></p></div>' +
        '<div class="field"><label for="' + key + '-availability">Availability <span class="required-mark" aria-hidden="true">*</span></label>' +
        '<select id="' + key + '-availability" class="product-availability" data-required="true" data-error-id="' + key + '-availability-error" aria-describedby="' + key + '-availability-error">' +
        optionMarkup([{value:"daily",label:"Available daily"},{value:"weekly",label:"Available weekly"},{value:"specific-days",label:"Available on specific days"},{value:"seasonal",label:"Seasonal availability"},{value:"on-request",label:"Available on request"},{value:"unavailable",label:"Currently unavailable"}], "Choose availability") +
        '</select><p class="field-error" id="' + key + '-availability-error" role="alert"></p></div>' +
        '<fieldset class="field field-span availability-days" hidden><legend>Available days <span class="required-mark" aria-hidden="true">*</span></legend>' +
        '<div class="supplier-days-grid">' + days.map(function (day) { return '<label><input type="checkbox" value="' + day + '"><span>' + day.slice(0, 3) + '</span></label>'; }).join("") +
        '</div><p class="field-error" id="' + key + '-days-error" role="alert"></p></fieldset>' +
        '<div class="field"><label for="' + key + '-moq">Minimum order quantity <span class="required-mark" aria-hidden="true">*</span></label>' +
        '<input id="' + key + '-moq" class="product-moq" type="number" min="0" step="any" inputmode="decimal" placeholder="Enter quantity (0 = no minimum)" data-required="true" data-error-id="' + key + '-moq-error" aria-describedby="' + key + '-moq-hint ' + key + '-moq-error">' +
        '<p class="field-hint" id="' + key + '-moq-hint">Enter your actual minimum quantity; use 0 if there is no minimum.</p><p class="field-error" id="' + key + '-moq-error" role="alert"></p></div>' +
        '<div class="field"><label for="' + key + '-moq-unit">MOQ unit <span class="required-mark" aria-hidden="true">*</span></label>' +
        '<select id="' + key + '-moq-unit" class="product-moq-unit" data-required="true" data-error-id="' + key + '-moq-unit-error" aria-describedby="' + key + '-moq-unit-error">' +
        '<option value="__product_unit__">Same as product unit</option>' + units.map(function (unit) { return '<option value="' + esc(unit) + '">' + esc(unit) + '</option>'; }).join("") +
        '<option value="__other__">Other — specify</option></select><p class="field-error" id="' + key + '-moq-unit-error" role="alert"></p></div>' +
        '<div class="field product-moq-unit-other-wrap" hidden><label for="' + key + '-moq-unit-other">Specify MOQ unit <span class="required-mark" aria-hidden="true">*</span></label>' +
        '<input id="' + key + '-moq-unit-other" class="product-moq-unit-other" type="text" maxlength="60" placeholder="Enter a unit" data-required="true" data-error-id="' + key + '-moq-unit-other-error" aria-describedby="' + key + '-moq-unit-other-error"><p class="field-error" id="' + key + '-moq-unit-other-error" role="alert"></p></div>' +
        '<div class="field field-span"><label for="' + key + '-price">Indicative wholesale price in Nigerian Naira <span class="optional">(optional)</span></label>' +
        '<div class="supplier-price-input"><span aria-hidden="true">₦</span><input id="' + key + '-price" class="product-price" type="number" min="0.01" step="any" inputmode="decimal" placeholder="e.g. 75000" data-error-id="' + key + '-price-error" aria-describedby="' + key + '-price-hint ' + key + '-price-error"></div>' +
        '<p class="field-hint" id="' + key + '-price-hint">Your indicative wholesale price per selected unit — not HomeBasket’s customer selling price. Prices can be updated through future supplier profile management.</p><p class="field-error" id="' + key + '-price-error" role="alert"></p></div>' +
        '</div>';
      entry.querySelector(".supplier-product-entry-heading h5").textContent = product.name;
      updateConditionalFields(entry);
      group.querySelector(".supplier-product-list").appendChild(entry);
    }

    function syncCategories() {
      var selected = selectedCategories();
      var ids = selected.map(function (category) { return category.id; });
      Array.from(productGroups.querySelectorAll(".supplier-category-products-group")).forEach(function (group) {
        group.hidden = ids.indexOf(group.getAttribute("data-category")) === -1;
      });
      selected.forEach(function (category) {
        var existing = productGroups.querySelector('.supplier-category-products-group[data-category="' + category.id + '"]');
        if (existing) return;
        var group = document.createElement("section");
        group.className = "supplier-category-products-group";
        group.setAttribute("data-category", category.id);
        group.setAttribute("data-product-error", "supplier-products-" + category.id + "-error");
        group.innerHTML = '<div class="supplier-category-products-heading"><div><span class="step-kicker">CATEGORY</span><h4>' + esc(category.name) + '</h4><p>Select all the products you supply under this category. Each selection adds its own price, unit and supply details.</p></div></div>' +
          '<div class="supplier-product-picker"><label for="supplier-product-search-' + esc(category.id) + '">Find a product</label>' +
          '<input id="supplier-product-search-' + esc(category.id) + '" class="category-product-search" type="search" placeholder="Type to filter products" autocomplete="off" aria-describedby="supplier-product-search-message-' + esc(category.id) + '">' +
          '<div class="category-product-options" role="group" aria-label="' + esc(category.name) + ' products"></div>' +
          '<p class="field-hint category-product-search-message" id="supplier-product-search-message-' + esc(category.id) + '" role="status" aria-live="polite"></p>' +
          '<p class="field-hint category-product-count" aria-live="polite"></p>' +
          '<p class="field-error" id="supplier-products-' + esc(category.id) + '-error" role="alert"></p></div>' +
          '<div class="supplier-product-list"></div>';
        var options = group.querySelector(".category-product-options");
        var categoryProducts = (window.HB_PRODUCTS || []).filter(function (product) { return product.category === category.id; });
        categoryProducts.forEach(function (product, index) {
          var label = document.createElement("label");
          label.className = "category-product-option";
          var checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "category-product-option-control";
          checkbox.value = product.id;
          checkbox.id = "supplier-category-product-" + category.id + "-" + index;
          var text = document.createElement("span");
          text.textContent = product.name + " — " + product.unit;
          label.htmlFor = checkbox.id;
          label.appendChild(checkbox);
          label.appendChild(text);
          options.appendChild(label);
        });
        var otherLabel = document.createElement("label");
        otherLabel.className = "category-product-option";
        var otherCheckbox = document.createElement("input");
        otherCheckbox.type = "checkbox";
        otherCheckbox.className = "category-product-option-control";
        otherCheckbox.value = "__other__";
        otherCheckbox.id = "supplier-category-product-" + category.id + "-other";
        var otherText = document.createElement("span");
        otherText.textContent = "Other — enter a product";
        otherLabel.htmlFor = otherCheckbox.id;
        otherLabel.appendChild(otherCheckbox);
        otherLabel.appendChild(otherText);
        options.appendChild(otherLabel);
        productGroups.appendChild(group);
        syncCategoryProducts(group, category);
      });
      setError("err-productCategories", "");
      renderReview();
    }

    function syncCategoryProducts(group, category) {
      var selectedIds = Array.from(group.querySelectorAll(".category-product-option-control:checked")).map(function (checkbox) {
        return checkbox.value;
      });
      var entries = Array.from(group.querySelectorAll(".supplier-product-entry"));
      entries.forEach(function (entry) {
        if (selectedIds.indexOf(entry.getAttribute("data-product-id")) === -1) entry.remove();
      });
      selectedIds.forEach(function (productId) {
        var exists = group.querySelector('.supplier-product-entry[data-product-id="' + productId + '"]');
        if (exists) return;
        var product = productId === "__other__"
          ? { id: "__other__", name: "Other product" }
          : (window.HB_PRODUCTS || []).find(function (item) { return item.id === productId && item.category === category.id; });
        if (product) addProductEntry(group, product);
      });
      group.querySelector(".category-product-count").textContent = selectedIds.length
        ? selectedIds.length + (selectedIds.length === 1 ? " product selected" : " products selected")
        : "Select all products you supply in this category.";
      setError(group.getAttribute("data-product-error"), "");
      renderReview();
    }

    function filterCategoryProducts(group, query) {
      var normalized = query.trim().toLowerCase();
      var visibleCount = 0;
      group.querySelectorAll(".category-product-option").forEach(function (option) {
        var matches = !normalized || option.textContent.toLowerCase().indexOf(normalized) !== -1;
        option.hidden = !matches;
        if (matches) visibleCount += 1;
      });
      group.querySelector(".category-product-search-message").textContent = normalized && !visibleCount
        ? "No matching product found in this category."
        : normalized ? visibleCount + (visibleCount === 1 ? " matching product." : " matching products.") : "";
    }

    function updateProductEntryHeading(entry) {
      var heading = entry.querySelector(".supplier-product-entry-heading h5");
      if (entry.getAttribute("data-product-id") === "__other__") {
        heading.textContent = entry.querySelector(".product-other").value.trim() || "Other product";
      } else {
        heading.textContent = entry.getAttribute("data-product-name") || "Product details";
      }
    }

    function updateConditionalFields(entry) {
      var capacity = entry.querySelector(".product-capacity");
      var capacityWrap = entry.querySelector(".product-capacity-custom-wrap");
      var capacityInput = entry.querySelector(".product-capacity-custom");
      capacityWrap.hidden = capacity.value !== "custom";
      capacityInput.disabled = capacityWrap.hidden;

      var isOtherProduct = entry.getAttribute("data-product-id") === "__other__";
      var otherWrap = entry.querySelector(".product-other-wrap");
      var otherInput = entry.querySelector(".product-other");
      otherWrap.hidden = !isOtherProduct;
      otherInput.disabled = otherWrap.hidden;

      var unit = entry.querySelector(".product-unit");
      var unitWrap = entry.querySelector(".product-unit-other-wrap");
      var unitInput = entry.querySelector(".product-unit-other");
      unitWrap.hidden = unit.value !== "__other__";
      unitInput.disabled = unitWrap.hidden;

      var moqUnit = entry.querySelector(".product-moq-unit");
      var moqOtherWrap = entry.querySelector(".product-moq-unit-other-wrap");
      var moqOtherInput = entry.querySelector(".product-moq-unit-other");
      moqOtherWrap.hidden = moqUnit.value !== "__other__";
      moqOtherInput.disabled = moqOtherWrap.hidden;

      var availability = entry.querySelector(".product-availability");
      var dayWrap = entry.querySelector(".availability-days");
      dayWrap.hidden = availability.value !== "specific-days";
      dayWrap.querySelectorAll("input").forEach(function (checkbox) { checkbox.disabled = dayWrap.hidden; });
    }

    function buildProductPayload(entry, category) {
      var capacityType = entry.querySelector(".product-capacity").value;
      var productId = entry.getAttribute("data-product-id");
      var unitSelect = entry.querySelector(".product-unit");
      var moqUnitSelect = entry.querySelector(".product-moq-unit");
      var price = entry.querySelector(".product-price").value;
      return {
        categoryId: category.id,
        categoryName: category.name,
        productId: productId !== "__other__" ? productId : null,
        productName: productName(entry),
        catalogueUnit: productId !== "__other__"
          ? ((window.HB_PRODUCTS || []).find(function (item) { return item.id === productId; }) || {}).unit || null
          : null,
        supplyCapacity: {
          scale: capacityType,
          quantity: capacityType === "custom" ? Number(entry.querySelector(".product-capacity-custom").value) : null,
          unit: unitSelect.value === "__other__" ? entry.querySelector(".product-unit-other").value.trim() : unitSelect.value
        },
        unitOfMeasurement: unitSelect.value === "__other__" ? entry.querySelector(".product-unit-other").value.trim() : unitSelect.value,
        availability: entry.querySelector(".product-availability").value,
        availableDays: entry.querySelector(".product-availability").value === "specific-days" ? selectedDays(entry) : [],
        minimumOrderQuantity: {
          quantity: Number(entry.querySelector(".product-moq").value),
          unit: moqUnitSelect.value === "__product_unit__"
            ? (unitSelect.value === "__other__" ? entry.querySelector(".product-unit-other").value.trim() : unitSelect.value)
            : (moqUnitSelect.value === "__other__" ? entry.querySelector(".product-moq-unit-other").value.trim() : moqUnitSelect.value)
        },
        indicativeWholesalePrice: price === "" ? null : Number(price),
        currency: "NGN"
      };
    }

    function buildPayload() {
      var categories = selectedCategories();
      var products = [];
      categories.forEach(function (category) {
        productGroups.querySelectorAll('.supplier-category-products-group[data-category="' + category.id + '"] .supplier-product-entry').forEach(function (entry) {
          products.push(buildProductPayload(entry, category));
        });
      });
      function photo(inputId) {
        var input = document.getElementById(inputId);
        return input && input.files && input.files[0] ? [input.files[0]] : [];
      }
      return {
        schemaVersion: 1,
        businessName: value("businessName"),
        contactPerson: value("contactPerson"),
        phone: value("phone"),
        email: value("email"),
        businessAddress: value("businessAddress"),
        location: value("location"),
        businessType: value("businessType"),
        productCategories: categories.map(function (category) { return category.id; }),
        products: products,
        description: value("description"),
        fulfilment: value("supplierFulfilment"),
        paymentTerms: value("supplierPaymentTerms"),
        locationConfirmation: document.getElementById("locationConfirmation").checked,
        declaration: document.getElementById("declaration").checked,
        photos: {
          exterior: photo("storeExterior"),
          interior: [],
          inventory: photo("inventoryPhotos")
        }
      };
    }

    function fileName(inputId) {
      var input = document.getElementById(inputId);
      return input && input.files && input.files[0] ? input.files[0].name : "";
    }

    function clearFilePreview(input) {
      var preview = document.getElementById(input.getAttribute("data-preview"));
      if (objectUrls[input.id]) {
        URL.revokeObjectURL(objectUrls[input.id]);
        delete objectUrls[input.id];
      }
      input.value = "";
      if (preview) {
        preview.hidden = true;
        var image = preview.querySelector("img");
        if (image) image.removeAttribute("src");
        var name = preview.querySelector(".supplier-preview-name");
        if (name) name.textContent = "";
      }
      var label = form.querySelector('label[for="' + input.id + '"]');
      if (label) label.textContent = "Choose a photo";
      setError(input.getAttribute("data-error-id"), "");
      input.removeAttribute("aria-invalid");
      renderReview();
    }

    function setupFilePreviews() {
      form.querySelectorAll('input[type="file"][data-preview]').forEach(function (input) {
        input.addEventListener("change", function () {
          setError(input.getAttribute("data-error-id"), "");
          input.removeAttribute("aria-invalid");
          var file = input.files && input.files[0];
          var preview = document.getElementById(input.getAttribute("data-preview"));
          if (!file || !preview) {
            renderReview();
            return;
          }
          if (!file.type || file.type.indexOf("image/") !== 0) {
            clearFilePreview(input);
            setError(input.getAttribute("data-error-id"), "Choose an image file.");
            input.setAttribute("aria-invalid", "true");
            return;
          }
          if (objectUrls[input.id]) URL.revokeObjectURL(objectUrls[input.id]);
          objectUrls[input.id] = URL.createObjectURL(file);
          preview.querySelector("img").src = objectUrls[input.id];
          preview.querySelector(".supplier-preview-name").textContent = file.name;
          preview.hidden = false;
          var label = form.querySelector('label[for="' + input.id + '"]');
          if (label) label.textContent = "Replace photo";
          renderReview();
        });
      });
    }

    function showSubmissionError(message) {
      submitError.textContent = message;
      submitError.focus();
      submitError.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    createCategorySelector();
    setupFilePreviews();
    var integrationStatus = document.getElementById("supplier-integration-status");
    if (typeof window.HB_SUPPLIER_APPLICATION_SUBMIT === "function") {
      integrationStatus.textContent = "Your application and attached photos will be sent to the connected submission service for administrator review.";
    } else {
      integrationStatus.textContent = "Online submission and secure photo storage are not connected yet. Photos are previewed only in this browser; your application is not sent or saved.";
    }

    form.addEventListener("click", function (event) {
      var continueButton = event.target.closest("[data-continue]");
      if (continueButton) {
        if (validateStep(currentStep)) showStep(currentStep + 1, true);
        return;
      }
      var backButton = event.target.closest("[data-back]");
      if (backButton) {
        showStep(Math.max(1, currentStep - 1), true);
        return;
      }
      var editButton = event.target.closest("[data-edit-step]");
      if (editButton) {
        showStep(Number(editButton.getAttribute("data-edit-step")), true);
        return;
      }
      var removeButton = event.target.closest(".supplier-remove-product");
      if (removeButton) {
        var entry = removeButton.closest(".supplier-product-entry");
        var productGroup = entry.closest(".supplier-category-products-group");
        var productId = entry.getAttribute("data-product-id");
        var option = Array.from(productGroup.querySelectorAll(".category-product-option-control")).find(function (checkbox) {
          return checkbox.value === productId;
        });
        if (option) {
          option.checked = false;
          var category = (window.HB_CATEGORIES || []).find(function (item) { return item.id === productGroup.getAttribute("data-category"); });
          if (category) syncCategoryProducts(productGroup, category);
        }
        return;
      }
      var removePhoto = event.target.closest("[data-remove-file]");
      if (removePhoto) clearFilePreview(document.getElementById(removePhoto.getAttribute("data-remove-file")));
    });

    form.addEventListener("change", function (event) {
      var control = event.target;
      if (control.name === "productCategories") {
        syncCategories();
        return;
      }
      if (control.matches(".category-product-option-control")) {
        var selectedGroup = control.closest(".supplier-category-products-group");
        var selectedCategory = (window.HB_CATEGORIES || []).find(function (item) {
          return item.id === selectedGroup.getAttribute("data-category");
        });
        if (selectedCategory) syncCategoryProducts(selectedGroup, selectedCategory);
        return;
      }
      if (control.closest(".supplier-product-entry")) {
        var productEntry = control.closest(".supplier-product-entry");
        updateConditionalFields(productEntry);
        updateProductEntryHeading(productEntry);
        if (control.closest(".availability-days")) {
          var hasSelectedDay = productEntry.querySelector(".availability-days input:checked");
          if (hasSelectedDay) {
            setError(productEntry.getAttribute("data-day-error"), "");
            productEntry.querySelectorAll(".availability-days input").forEach(function (checkbox) { checkbox.removeAttribute("aria-invalid"); });
          }
        }
        if (control.matches(".product-availability") && control.value !== "specific-days") {
          setError(productEntry.getAttribute("data-day-error"), "");
          productEntry.querySelectorAll(".availability-days input").forEach(function (checkbox) { checkbox.removeAttribute("aria-invalid"); });
        }
        renderReview();
      }
      if (control.getAttribute("data-error-id")) {
        control.removeAttribute("aria-invalid");
        setError(control.getAttribute("data-error-id"), "");
      }
      if (submitError.textContent) submitError.textContent = "";
    });

    form.addEventListener("input", function (event) {
      var control = event.target;
      var group = control.closest(".supplier-category-products-group");
      if (group && control.matches(".category-product-search")) {
        filterCategoryProducts(group, control.value);
        return;
      }
      var entry = control.closest(".supplier-product-entry");
      if (entry && control.matches(".product-other")) updateProductEntryHeading(entry);
      if (control.getAttribute("data-error-id") && control.getAttribute("aria-invalid") === "true") {
        control.removeAttribute("aria-invalid");
        setError(control.getAttribute("data-error-id"), "");
      }
      if (submitError.textContent) submitError.textContent = "";
      renderReview();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validateStep(3)) return;
      submitError.textContent = "";

      var submitApplication = window.HB_SUPPLIER_APPLICATION_SUBMIT;
      if (typeof submitApplication !== "function") {
        showSubmissionError("Online submission and secure photo storage are not connected yet. Your application has not been sent or saved. Please contact HomeBasket when online applications become available.");
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Submitting…";
      Promise.resolve().then(function () {
        // The connected backend adapter must resolve with { accepted: true, reference?: string }.
        return submitApplication(buildPayload());
      }).then(function (application) {
        if (!application || typeof application !== "object" || application.accepted !== true) {
          throw new Error("The submission service did not confirm receipt. Your application has not been marked as submitted.");
        }
        var reference = application.reference ? String(application.reference) : "";
        document.getElementById("supplier-application-form").hidden = true;
        document.getElementById("supplier-application-success").hidden = false;
        if (reference) {
          document.getElementById("supplier-application-reference").textContent = reference;
          document.getElementById("supplier-reference-row").hidden = false;
        }
        document.getElementById("supplier-application-success").scrollIntoView({ behavior: "smooth", block: "start" });
      }).catch(function (error) {
        showSubmissionError(error && error.message ? error.message : "The application could not be submitted. Please try again.");
      }).then(function () {
        submitButton.disabled = false;
        submitButton.textContent = "Submit application";
      });
    });

    window.addEventListener("pagehide", function () {
      Object.keys(objectUrls).forEach(function (id) { URL.revokeObjectURL(objectUrls[id]); });
    });
    showStep(1, false);
  });
})();
