(function () {
    "use strict";

    var storageKey = "diego-theme";
    var initialTheme = getInitialTheme();

    document.documentElement.dataset.theme = initialTheme;

    function getInitialTheme() {
        try {
            var savedTheme = window.localStorage.getItem(storageKey);
            if (savedTheme === "light" || savedTheme === "dark") {
                return savedTheme;
            }
        } catch (error) {
            // Browsers can block localStorage in private or restricted contexts.
        }

        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    function storeTheme(theme) {
        try {
            window.localStorage.setItem(storageKey, theme);
        } catch (error) {
            // The selected theme still applies for the current page.
        }
    }

    function sunIcon() {
        return '<svg aria-hidden="true" class="icon" fill="none" height="18" viewBox="0 0 24 24" width="18">' +
            '<g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8">' +
            '<circle cx="12" cy="12" r="4"></circle>' +
            '<path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>' +
            '</g></svg>';
    }

    function moonIcon() {
        return '<svg aria-hidden="true" class="icon" fill="none" height="18" viewBox="0 0 24 24" width="18">' +
            '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" stroke="currentColor" ' +
            'stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg>';
    }

    function applyTheme(theme, persist) {
        var isLight = theme === "light";
        document.documentElement.dataset.theme = theme;

        document.querySelectorAll(".theme-toggle").forEach(function (button) {
            var icon = button.querySelector(".theme-icon");
            var label = button.querySelector("span:last-child");

            button.setAttribute("aria-label", isLight ? "Ativar modo escuro" : "Ativar modo claro");
            if (icon) {
                icon.innerHTML = isLight ? moonIcon() : sunIcon();
            }
            if (label) {
                label.textContent = isLight ? "Escuro" : "Claro";
            }
        });

        if (persist) {
            storeTheme(theme);
        }
    }

    function setupThemeToggle() {
        applyTheme(initialTheme, false);

        document.querySelectorAll(".theme-toggle").forEach(function (button) {
            button.addEventListener("click", function () {
                var nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
                applyTheme(nextTheme, true);
            });
        });
    }

    function normalizeText(value) {
        return value
            .toLocaleLowerCase("pt-BR")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    function setupArchiveFilters() {
        var input = document.querySelector(".archive-search input");
        var buttons = Array.prototype.slice.call(document.querySelectorAll(".year-filter button"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".archive-grid .archive-card"));
        var resultLine = document.querySelector(".archive-result-line");
        var count = resultLine ? resultLine.querySelector("strong") : null;
        var countLabel = resultLine ? resultLine.querySelector("span") : null;
        var grid = document.querySelector(".archive-grid");

        if (!input || !buttons.length || !cards.length || !grid || !count || !countLabel) {
            return;
        }

        var activeYear = "Todos";
        var emptyState = document.createElement("div");
        emptyState.className = "archive-empty";
        emptyState.hidden = true;
        emptyState.innerHTML = "<strong>Nenhuma história apareceu por aqui</strong>" +
            "<p>Tente outro termo ou escolha um período diferente.</p>";
        grid.insertAdjacentElement("afterend", emptyState);

        function filterCards() {
            var query = normalizeText(input.value);
            var visibleCards = cards.filter(function (card) {
                var time = card.querySelector("time");
                var date = time ? time.getAttribute("datetime") || "" : "";
                var matchesYear = activeYear === "Todos" || date.indexOf(activeYear + "-") === 0;
                var matchesText = !query || normalizeText(card.textContent).indexOf(query) !== -1;
                var visible = matchesYear && matchesText;

                card.hidden = !visible;
                return visible;
            });

            visibleCards.forEach(function (card, index) {
                var sequence = card.querySelector(".archive-sequence");
                if (sequence) {
                    sequence.textContent = String(visibleCards.length - index).padStart(2, "0");
                }
            });

            count.textContent = String(visibleCards.length);
            countLabel.textContent = visibleCards.length === 1
                ? "história encontrada"
                : "histórias encontradas";
            grid.hidden = visibleCards.length === 0;
            emptyState.hidden = visibleCards.length !== 0;
        }

        input.addEventListener("input", filterCards);
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeYear = button.textContent.trim();
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                filterCards();
            });
        });
    }

    function initialize() {
        setupThemeToggle();
        setupArchiveFilters();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
})();
