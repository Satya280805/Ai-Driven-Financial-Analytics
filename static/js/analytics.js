document.addEventListener("DOMContentLoaded", function () {

    console.log("Analytics page loaded.");

    const profitDataPromise = fetch("/api/analytics/profit")
        .then(response => {
            if (!response.ok) throw new Error("Failed to load profit data.");
            return response.json();
        });

    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================

    function formatCurrency(value) {

        if (value === null || value === undefined || isNaN(value)) {
            return "₹0";
        }

        value = Number(value);

        if (Math.abs(value) >= 1000000000) {
            return "₹" + (value / 1000000000).toFixed(2) + "B";
        }

        if (Math.abs(value) >= 1000000) {
            return "₹" + (value / 1000000).toFixed(2) + "M";
        }

        if (Math.abs(value) >= 1000) {
            return "₹" + (value / 1000).toFixed(2) + "K";
        }

        return "₹" + value.toFixed(2);
    }


    // =====================================================
    // LOAD PROFIT / KPI DATA
    // =====================================================

    profitDataPromise

        .then(data => {

            console.log("Profit data:", data);

            if (!data || data.length === 0) {
                console.warn("No profit data available.");
                return;
            }


            // -------------------------------------------------
            // TOTALS
            // -------------------------------------------------

            const totalRevenue = data.reduce(
                (sum, row) => sum + Number(row.Revenue || 0),
                0
            );

            const totalExpense = data.reduce(
                (sum, row) => sum + Number(row.Expense || 0),
                0
            );

            const totalProfit = data.reduce(
                (sum, row) => sum + Number(row.Profit || 0),
                0
            );

            const overallMargin =
                totalRevenue !== 0
                    ? (totalProfit / totalRevenue) * 100
                    : 0;


            // -------------------------------------------------
            // UPDATE KPI CARDS
            // -------------------------------------------------

            document.getElementById("analyticsRevenue").textContent =
                formatCurrency(totalRevenue);

            document.getElementById("analyticsExpense").textContent =
                formatCurrency(totalExpense);

            document.getElementById("analyticsProfit").textContent =
                formatCurrency(totalProfit);

            document.getElementById("analyticsMargin").textContent =
                overallMargin.toFixed(2) + "%";


            // -------------------------------------------------
            // YEARLY PERFORMANCE CHART
            // -------------------------------------------------

            const years = data.map(row => row.Year);

            const revenue = data.map(
                row => Number(row.Revenue || 0)
            );

            const expense = data.map(
                row => Number(row.Expense || 0)
            );


            Plotly.newPlot(
                "yearlyPerformanceChart",

                [
                    {
                        x: years,
                        y: revenue,
                        name: "Revenue",
                        type: "bar"
                    },

                    {
                        x: years,
                        y: expense,
                        name: "Expense",
                        type: "bar"
                    }
                ],

                {
                    title: "Revenue vs Expense by Year",

                    barmode: "group",

                    xaxis: {
                        title: "Year"
                    },

                    yaxis: {
                        title: "Amount (₹)",
                        tickformat: "~s"
                    },

                    legend: {
                        orientation: "h"
                    },

                    margin: {
                        t: 60,
                        l: 80,
                        r: 30,
                        b: 60
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
                "Error loading profit analytics:",
                error
            );

        });


    // =====================================================
    // DEPARTMENT-WISE EXPENSE
    // =====================================================

    fetch("/api/analytics/department")

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load department data.");
            }

            return response.json();
        })

        .then(data => {

            console.log("Department data:", data);


            Plotly.newPlot(
                "departmentExpenseChart",

                [
                    {
                        x: data.map(row => row.Department),
                        y: data.map(row => Number(row.Amount || 0)),
                        type: "bar"
                    }
                ],

                {
                    title: "Expense by Department",

                    xaxis: {
                        title: "Department",
                        tickangle: -30
                    },

                    yaxis: {
                        title: "Expense (₹)",
                        tickformat: "~s"
                    },

                    margin: {
                        t: 60,
                        l: 80,
                        r: 30,
                        b: 100
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
                "Error loading department analytics:",
                error
            );

        });


    // =====================================================
    // ACCOUNT CATEGORY EXPENSE
    // =====================================================

    fetch("/api/analytics/category")

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load category data.");
            }

            return response.json();
        })

        .then(data => {

            console.log("Category data:", data);


            Plotly.newPlot(
                "categoryExpenseChart",

                [
                    {
                        x: data.map(row => row.Account_Category),
                        y: data.map(row => Number(row.Amount || 0)),
                        type: "bar"
                    }
                ],

                {
                    title: "Expense by Account Category",

                    xaxis: {
                        title: "Account Category",
                        tickangle: -45
                    },

                    yaxis: {
                        title: "Expense (₹)",
                        tickformat: "~s"
                    },

                    margin: {
                        t: 60,
                        l: 80,
                        r: 30,
                        b: 140
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
                "Error loading category analytics:",
                error
            );

        });


    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    fetch("/api/analytics/payment")

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load payment data.");
            }

            return response.json();
        })

        .then(data => {

            console.log("Payment data:", data);


            Plotly.newPlot(
                "paymentStatusChart",

                [
                    {
                        labels: data.map(
                            row => row.Payment_Status
                        ),

                        values: data.map(
                            row => Number(
                                row.Transaction_Count || 0
                            )
                        ),

                        type: "pie",

                        hole: 0.45,

                        textinfo: "label+percent"
                    }
                ],

                {
                    title: "Payment Status Distribution",

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
                "Error loading payment analytics:",
                error
            );

        });


    // =====================================================
    // PROFIT + PROFIT MARGIN CHART
    // =====================================================

    profitDataPromise

        .then(data => {

            console.log("Profit chart data:", data);


            const years = data.map(
                row => row.Year
            );

            const profit = data.map(
                row => Number(row.Profit || 0)
            );

            const margin = data.map(
                row => Number(row.Profit_Margin || 0)
            );


            Plotly.newPlot(
                "profitAnalysisChart",

                [

                    {
                        x: years,

                        y: profit,

                        name: "Profit",

                        type: "bar",

                        yaxis: "y"
                    },

                    {
                        x: years,

                        y: margin,

                        name: "Profit Margin",

                        type: "scatter",

                        mode: "lines+markers",

                        yaxis: "y2"
                    }

                ],

                {

                    title: "Profit and Profit Margin",

                    xaxis: {
                        title: "Year"
                    },

                    yaxis: {
                        title: "Profit (₹)",
                        tickformat: "~s"
                    },

                    yaxis2: {

                        title: "Profit Margin (%)",

                        overlaying: "y",

                        side: "right",

                        ticksuffix: "%"
                    },

                    legend: {
                        orientation: "h"
                    },

                    margin: {
                        t: 60,
                        l: 80,
                        r: 80,
                        b: 60
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
                "Error loading profit chart:",
                error
            );

        });

});