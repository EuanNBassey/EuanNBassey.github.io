/* Light/dark theme: follows the system setting until the visitor picks one with the nav button. */
(function () {
    var KEY = "theme";
    var root = document.documentElement;
    var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

    function stored() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function system() {
        return mq && mq.matches ? "dark" : "light";
    }
    function apply(t) {
        root.setAttribute("data-theme", t);
        root.style.colorScheme = t;
    }

    apply(stored() || system());

    if (mq && mq.addEventListener) {
        mq.addEventListener("change", function () {
            if (!stored()) { apply(system()); sync(); }
        });
    }

    var SUN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    var MOON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
    var btn;

    function sync() {
        if (!btn) return;
        var dark = root.getAttribute("data-theme") === "dark";
        btn.innerHTML = (dark ? SUN : MOON) + "<span>" + (dark ? "Light" : "Dark") + "</span>";
        btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }

    document.addEventListener("DOMContentLoaded", function () {
        var ul = document.querySelector("nav ul");
        if (!ul) return;
        var li = document.createElement("li");
        li.className = "theme-li";
        btn = document.createElement("button");
        btn.type = "button";
        btn.className = "theme-toggle";
        btn.addEventListener("click", function () {
            var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            try { localStorage.setItem(KEY, next); } catch (e) { /* storage unavailable */ }
            apply(next);
            sync();
            window.dispatchEvent(new Event("themechange"));
        });
        li.appendChild(btn);
        ul.appendChild(li);
        sync();
    });
})();
