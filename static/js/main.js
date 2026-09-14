document.addEventListener("DOMContentLoaded", () => {
    const storedTheme = localStorage.getItem("finanalytics-theme") || "light";
    const themeButton = document.querySelector(".theme-toggle");

    document.documentElement.dataset.theme = storedTheme;

    let appliedTheme = null;
    let appliedChartCount = -1;

    const applyChartTheme = () => {
        if (!window.Plotly) return;
        const dark = document.documentElement.dataset.theme === "dark";
        const rootStyles = getComputedStyle(document.documentElement);
        const surface = rootStyles.getPropertyValue("--surface").trim();
        const text = rootStyles.getPropertyValue("--text").trim();
        const line = rootStyles.getPropertyValue("--line").trim();
        const charts = document.querySelectorAll(".js-plotly-plot");
        if (appliedTheme === dark && appliedChartCount === charts.length) return;

        charts.forEach(chart => {
            Plotly.relayout(chart, {
                paper_bgcolor: surface,
                plot_bgcolor: surface,
                "font.color": text,
                "xaxis.gridcolor": line,
                "yaxis.gridcolor": line,
                "xaxis.zerolinecolor": line,
                "yaxis.zerolinecolor": line
            });
        });
        appliedTheme = dark;
        appliedChartCount = charts.length;
    };

    const updateThemeButton = () => {
        if (!themeButton) return;
        const dark = document.documentElement.dataset.theme === "dark";
        themeButton.querySelector(".theme-icon").textContent = dark ? "☾" : "☼";
        themeButton.querySelector(".theme-label").textContent = dark ? "Dark" : "Light";
        applyChartTheme();
    };

    updateThemeButton();
    window.setTimeout(applyChartTheme, 300);

    const chartObserver = new MutationObserver(() => {
        window.requestAnimationFrame(applyChartTheme);
    });
    chartObserver.observe(document.body, { childList: true, subtree: true });

    if (themeButton) {
        themeButton.addEventListener("click", () => {
            const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
            document.documentElement.dataset.theme = nextTheme;
            localStorage.setItem("finanalytics-theme", nextTheme);
            updateThemeButton();
        });
    }

    const sidebar = document.querySelector(".sidebar");
    const menuButton = document.querySelector(".mobile-menu");

    if (sidebar && menuButton) {
        menuButton.addEventListener("click", () => {
            const isOpen = sidebar.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.textContent = isOpen ? "x" : "☰";
        });
    }

    if (sidebar) {
        fetch("/api/status")
            .then(response => response.ok ? response.json() : Promise.reject(response))
            .then(status => {
                const statusLabel = document.querySelector(".data-status");
                if (statusLabel && status.status === "running") {
                    statusLabel.lastChild.textContent = " Data Connected";
                }
            })
            .catch(() => {
                const statusLabel = document.querySelector(".data-status");
                if (statusLabel) statusLabel.lastChild.textContent = " Data Unavailable";
            });
    }
});