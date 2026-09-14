document.addEventListener("DOMContentLoaded", function () {

    console.log("Anomaly page loaded.");


    // =====================================================
    // LOAD ANOMALY DATA
    // =====================================================

    fetch("/api/anomalies")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Could not load anomaly data."
                );
            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Anomaly summary:",
                data
            );


            if (!data || data.length === 0) {
                console.warn(
                    "No anomaly summary data."
                );
                return;
            }


            // -------------------------------------------------
            // FIND NORMAL / ANOMALY ROWS
            // -------------------------------------------------

            let normalRow = null;

            let anomalyRow = null;


            data.forEach(row => {

                const text =
                    JSON.stringify(row).toLowerCase();


                if (
                    text.includes("normal")
                ) {
                    normalRow = row;
                }

                if (
                    text.includes("anomaly") ||
                    text.includes("potential")
                ) {
                    anomalyRow = row;
                }

            });


            // -------------------------------------------------
            // HELPER
            // -------------------------------------------------

            function findCount(row) {

                if (!row) {
                    return 0;
                }


                return Number(
                    row.Count ??
                    row.Transaction_Count ??
                    row.Anomaly_Count ??
                    row.Records ??
                    row.Total_Transactions ??
                    0
                );

            }


            const normalCount =
                findCount(normalRow);


            const anomalyCount =
                findCount(anomalyRow);


            const total =
                normalCount + anomalyCount;


            // -------------------------------------------------
            // UPDATE KPI
            // -------------------------------------------------

            document.getElementById(
                "totalTransactions"
            ).textContent =
                total.toLocaleString();


            document.getElementById(
                "normalTransactions"
            ).textContent =
                normalCount.toLocaleString();


            document.getElementById(
                "potentialAnomalies"
            ).textContent =
                anomalyCount.toLocaleString();


            // -------------------------------------------------
            // PIE CHART
            // -------------------------------------------------

            Plotly.newPlot(

                "anomalyDistributionChart",

                [
                    {
                        labels: [
                            "Normal",
                            "Potential Anomaly"
                        ],

                        values: [
                            normalCount,
                            anomalyCount
                        ],

                        type: "pie",

                        hole: 0.45,

                        textinfo: "label+percent"
                    }
                ],

                {

                    title:
                        "Normal vs Potential Anomaly",

                    margin: {
                        t: 60,
                        l: 30,
                        r: 30,
                        b: 30
                    },

                    paper_bgcolor: "rgba(0,0,0,0)",

                    plot_bgcolor: "rgba(0,0,0,0)"
                },

                {
                    responsive: true,

                    displayModeBar: false
                }

            );

        })

        .catch(error => {

            console.error(
                "Anomaly data error:",
                error
            );

        });


    // =====================================================
    // LOAD METRICS
    // =====================================================

    fetch("/api/anomalies/metrics")

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Could not load anomaly metrics."
                );
            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Anomaly metrics:",
                data
            );


            // -------------------------------------------------
            // UPDATE METRICS
            // -------------------------------------------------

            document.getElementById(
                "precisionScore"
            ).textContent =
                (Number(data.precision) * 100)
                    .toFixed(2) + "%";


            document.getElementById(
                "recallScore"
            ).textContent =
                (Number(data.recall) * 100)
                    .toFixed(2) + "%";


            document.getElementById(
                "f1Score"
            ).textContent =
                (Number(data.f1_score) * 100)
                    .toFixed(2) + "%";


            document.getElementById(
                "metricF1Score"
            ).textContent =
                (Number(data.f1_score) * 100)
                    .toFixed(2) + "%";


            // -------------------------------------------------
            // CONFUSION MATRIX VALUES
            // -------------------------------------------------

            [
                ["trueNegative", data.true_negative],
                ["falsePositive", data.false_positive],
                ["falseNegative", data.false_negative],
                ["truePositive", data.true_positive]
            ].forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) element.textContent = Number(value).toLocaleString();
            });


            // -------------------------------------------------
            // CONFUSION MATRIX CHART
            // -------------------------------------------------

            Plotly.newPlot(

                "confusionMatrixChart",

                [
                    {
                        z: [
                            [
                                data.true_negative,
                                data.false_positive
                            ],

                            [
                                data.false_negative,
                                data.true_positive
                            ]
                        ],

                        x: [
                            "Predicted Normal",
                            "Predicted Anomaly"
                        ],

                        y: [
                            "Actual Normal",
                            "Actual Anomaly"
                        ],

                        type: "heatmap",

                        text: [
                            [
                                data.true_negative,
                                data.false_positive
                            ],

                            [
                                data.false_negative,
                                data.true_positive
                            ]
                        ],

                        texttemplate: "%{text}",

                        hovertemplate:
                            "Count: %{z}<extra></extra>"
                    }
                ],

                {

                    xaxis: {
                        title: "Predicted label",
                        side: "top"
                    },

                    yaxis: {
                        title: "Actual label",
                        autorange: "reversed"
                    },

                    margin: {
                        t: 30,
                        l: 100,
                        r: 20,
                        b: 70
                    },

                    paper_bgcolor: "rgba(0,0,0,0)",
                    plot_bgcolor: "rgba(0,0,0,0)",
                    font: { family: "Manrope", color: "#152323" },
                    coloraxis: { colorscale: [[0, "#d7efea"], [1, "#0d766e"]] }
                },

                {
                    responsive: true,

                    displayModeBar: false
                }

            );

        })

        .catch(error => {

            console.error(
                "Anomaly metrics error:",
                error
            );

        });

});