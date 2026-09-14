document.addEventListener("DOMContentLoaded", function () {

    console.log("Forecast page loaded.");

    const predictionForm = document.getElementById("predictionForm");
    const predictionResult = document.getElementById("predictionResult");

    document.querySelectorAll(".preset-button").forEach(button => {
        button.addEventListener("click", () => {
            const values = {
                amount: button.dataset.amount,
                budget: button.dataset.budget,
                quantity: button.dataset.quantity,
                tax_amount: button.dataset.tax
            };
            Object.entries(values).forEach(([name, value]) => {
                const input = predictionForm?.elements[name];
                if (input) input.value = value;
            });
            predictionForm?.requestSubmit();
        });
    });

    if (predictionForm && predictionResult) {
        predictionForm.addEventListener("submit", async event => {
            event.preventDefault();
            const submitButton = predictionForm.querySelector("button[type='submit']");
            if (!predictionForm.checkValidity()) {
                predictionForm.reportValidity();
                return;
            }

            predictionResult.className = "prediction-result is-loading";
            predictionResult.textContent = "Scoring this scenario...";
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.querySelector("span").textContent = "...";
            }

            try {
                const response = await fetch("/api/predict/anomaly", {
                    method: "POST",
                    credentials: "same-origin",
                    cache: "no-store",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(Object.fromEntries(new FormData(predictionForm)))
                });
                const responseText = await response.text();
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch {
                    throw new Error(`Prediction service returned an invalid response (${response.status}).`);
                }
                if (!response.ok) throw new Error(result.error || "Prediction failed.");

                const numberOrZero = value => Number.isFinite(Number(value)) ? Number(value) : 0;
                const textOrFallback = (value, fallback) => value || fallback;
                const budgetUtilization = numberOrZero(result.budget_utilization);
                const taxRate = numberOrZero(result.tax_rate);
                const modelScore = numberOrZero(result.model_score);
                const confidence = result.confidence == null ? "Not calibrated" : `${numberOrZero(result.confidence).toFixed(1)}%`;
                const percentile = result.score_percentile == null ? "Not calibrated" : `${numberOrZero(result.score_percentile).toFixed(1)}th percentile`;
                const reasonCodes = Array.isArray(result.reason_codes) ? result.reason_codes.join("; ") : "No additional signals";

                predictionResult.className = `prediction-result ${result.is_anomaly ? "is-warning" : "is-good"}`;
                predictionResult.innerHTML = `
                    <div class="result-heading"><span class="result-icon">${result.is_anomaly ? "!" : "✓"}</span><span><strong>${textOrFallback(result.outcome, "Prediction complete")}</strong><small>${textOrFallback(result.recommendation, "Review the model result before approval.")}</small></span><b class="risk-pill">${textOrFallback(result.risk_level, "Review")}</b></div>
                    <p class="result-explanation">${textOrFallback(result.score_explanation, "The model evaluated this scenario against learned transaction patterns.")} <strong>Signals:</strong> ${reasonCodes}.</p>
                    <div class="result-metrics"><span><small>Budget status</small><b>${textOrFallback(result.budget_status, "Unavailable")}</b></span><span><small>Budget utilization</small><b>${budgetUtilization.toFixed(1)}%</b></span><span><small>Budget variance</small><b>${formatCurrency(result.budget_variance)}</b></span><span><small>Quantity</small><b>${numberOrZero(result.input_quantity).toLocaleString()}</b></span><span><small>Tax rate</small><b>${taxRate.toFixed(1)}%</b></span><span><small>Cost per unit</small><b>${formatCurrency(result.unit_cost)}</b></span><span><small>Historical percentile</small><b>${percentile}</b></span><span><small>Confidence</small><b>${confidence}</b></span><span><small>Model score</small><b>${modelScore.toFixed(3)}</b></span></div>`;
            } catch (error) {
                predictionResult.className = "prediction-result is-warning";
                predictionResult.innerHTML = `<div class="result-heading"><span class="result-icon">!</span><span><strong>Prediction unavailable</strong><small>${error.message}</small></span></div>`;
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.querySelector("span").textContent = "->";
                }
            }
        });
    }


    // =====================================================
    // HELPER
    // =====================================================

    function formatCurrency(value) {

        value = Number(value || 0);

        if (Math.abs(value) >= 1000000000) {
            return "₹" +
                (value / 1000000000).toFixed(2) +
                "B";
        }

        if (Math.abs(value) >= 1000000) {
            return "₹" +
                (value / 1000000).toFixed(2) +
                "M";
        }

        if (Math.abs(value) >= 1000) {
            return "₹" +
                (value / 1000).toFixed(2) +
                "K";
        }

        return "₹" + value.toFixed(2);
    }


    // =====================================================
    // LOAD FORECAST
    // =====================================================

    fetch("/api/forecast")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Could not load forecast data."
                );
            }

            return response.json();
        })

        .then(data => {

            console.log("Forecast data:", data);

            if (!data || data.length === 0) {
                return;
            }


            // -------------------------------------------------
            // DETECT COLUMN NAMES
            // -------------------------------------------------

            console.log(
                "Forecast columns:",
                Object.keys(data[0])
            );


            /*
             * The notebook-generated CSV may use a slightly
             * different name for the forecast column.
             */

            function getMonth(row) {

                return (
                    row.Month ||
                    row.month ||
                    row.Year_Month ||
                    row.Date ||
                    ""
                );
            }


            function getForecast(row) {

                return Number(
                    row.Forecast_Expense ??
                    row.Forecasted_Expense ??
                    row.Forecast ??
                    row.Predicted_Expense ??
                    row.Predicted ??
                    row.Expense ??
                    row.Amount ??
                    0
                );
            }


            const months = data.map(getMonth);

            const values = data.map(getForecast);


            // -------------------------------------------------
            // TOTAL
            // -------------------------------------------------

            const total = values.reduce(
                (sum, value) => sum + value,
                0
            );


            const average =
                values.length > 0
                    ? total / values.length
                    : 0;


            // -------------------------------------------------
            // UPDATE KPIs
            // -------------------------------------------------

            document.getElementById(
                "forecastTotal"
            ).textContent = formatCurrency(total);


            document.getElementById(
                "forecastAverage"
            ).textContent = formatCurrency(average);


            loadForecastSummary(total);


            // -------------------------------------------------
            // FORECAST CHART
            // -------------------------------------------------

            Plotly.newPlot(

                "forecastChart",

                [
                    {
                        x: months,

                        y: values,

                        type: "scatter",

                        mode: "lines+markers",

                        name: "2026 Forecast"
                    }
                ],

                {

                    title:
                        "Monthly Expense Forecast — 2026",

                    xaxis: {
                        title: "Month"
                    },

                    yaxis: {
                        title: "Forecast Expense (₹)",
                        tickformat: "~s"
                    },

                    margin: {
                        t: 60,
                        l: 80,
                        r: 30,
                        b: 70
                    },

                    paper_bgcolor: "rgba(0,0,0,0)",

                    plot_bgcolor: "rgba(0,0,0,0)"
                },

                {
                    responsive: true,

                    displayModeBar: false
                }

            );


            // -------------------------------------------------
            // FORECAST TABLE
            // -------------------------------------------------

            const tableBody =
                document.getElementById(
                    "forecastTableBody"
                );


            tableBody.innerHTML = "";


            data.forEach(row => {

                const tr =
                    document.createElement("tr");


                const monthCell =
                    document.createElement("td");

                monthCell.textContent =
                    getMonth(row);


                const valueCell =
                    document.createElement("td");

                valueCell.textContent =
                    formatCurrency(
                        getForecast(row)
                    );


                tr.appendChild(monthCell);

                tr.appendChild(valueCell);

                tableBody.appendChild(tr);

            });

        })

        .catch(error => {

            console.error(
                "Forecast error:",
                error
            );

        });

    async function loadForecastSummary(forecastTotal) {
        try {
            const response = await fetch("/api/forecast/summary", { cache: "no-store" });
            const summary = await response.json();
            if (!response.ok) throw new Error(summary.error || "Forecast summary unavailable.");

            document.getElementById("forecastTotal").textContent = formatCurrency(summary.forecast_total ?? forecastTotal);
            document.getElementById("forecastAverage").textContent = formatCurrency(summary.forecast_average);
            document.getElementById("forecastGrowth").textContent = summary.growth_percent == null
                ? "n/a"
                : Number(summary.growth_percent).toFixed(2) + "%";
            document.getElementById("selectedModel").textContent = summary.selected_model || "Unavailable";
        } catch (error) {
            console.error("Forecast summary error:", error);
            document.getElementById("forecastGrowth").textContent = "n/a";
            document.getElementById("selectedModel").textContent = "Unavailable";
        }
    }


    // =====================================================
    // MODEL COMPARISON
    // =====================================================

    fetch("/api/forecast/model-comparison")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Could not load model comparison."
                );
            }

            return response.json();
        })

        .then(data => {

            console.log(
                "Model comparison:",
                data
            );


            if (!data || data.length === 0) {
                return;
            }


            const tableBody =
                document.getElementById(
                    "modelComparisonBody"
                );


            tableBody.innerHTML = "";


            data.forEach(row => {

                const keys =
                    Object.keys(row);


                // Try to identify columns dynamically

                const model =
                    row.Model ||
                    row.model ||
                    row.Algorithm ||
                    row.Method ||
                    keys[0];


                const mae =
                    row.MAE ??
                    row.Mae ??
                    row.mae ??
                    0;


                const rmse =
                    row.RMSE ??
                    row.Rmse ??
                    row.rmse ??
                    0;


                const tr =
                    document.createElement("tr");


                const modelCell =
                    document.createElement("td");

                modelCell.textContent =
                    model;


                const maeCell =
                    document.createElement("td");

                maeCell.textContent =
                    formatCurrency(mae);


                const rmseCell =
                    document.createElement("td");

                rmseCell.textContent =
                    formatCurrency(rmse);


                tr.appendChild(modelCell);

                tr.appendChild(maeCell);

                tr.appendChild(rmseCell);


                tableBody.appendChild(tr);

            });

        })

        .catch(error => {

            console.error(
                "Model comparison error:",
                error
            );

        });

});