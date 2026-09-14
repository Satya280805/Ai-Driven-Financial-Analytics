document.addEventListener("DOMContentLoaded", function () {

    loadDashboardKpis();
    loadRevenueExpenseChart();

    loadDepartmentChart();

    loadBudgetChart();

});

async function loadDashboardKpis() {
    try {
        const response = await fetch("/api/kpis");
        const data = await response.json();
        const currency = value => {
            const amount = Number(value || 0);
            if (amount >= 1000000000) return "₹" + (amount / 1000000000).toFixed(2) + "B";
            if (amount >= 1000000) return "₹" + (amount / 1000000).toFixed(2) + "M";
            return "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
        };
        const values = {
            totalTransactions: Number(data.total_transactions || 0).toLocaleString(),
            totalRevenue: currency(data.total_revenue),
            totalExpense: currency(data.total_expense),
            potentialAnomalies: Number(data.potential_anomalies || 0).toLocaleString()
        };
        document.querySelectorAll(".dashboard-kpi").forEach(card => {
            const target = card.dataset.kpi;
            if (values[target]) card.querySelector(".kpi-value").textContent = values[target];
        });
    } catch (error) {
        console.error("Dashboard KPI error:", error);
    }
}



/* =====================================================
   REVENUE VS EXPENSE
   ===================================================== */

async function loadRevenueExpenseChart() {

    try {

        const response =
            await fetch("/api/monthly-summary");

        const data =
            await response.json();


        if (data.error) {

            console.error(data.error);

            return;

        }


        const revenue = {

            x: data.months,

            y: data.revenue,

            type: "scatter",

            mode: "lines+markers",

            name: "Revenue",

            line: {
                width: 3
            },

            marker: {
                size: 6
            }

        };


        const expense = {

            x: data.months,

            y: data.expense,

            type: "scatter",

            mode: "lines+markers",

            name: "Expense",

            line: {
                width: 3
            },

            marker: {
                size: 6
            }

        };


        const layout = {

            height: 320,

            margin: {
                l: 50,
                r: 20,
                t: 10,
                b: 45
            },

            paper_bgcolor: "rgba(0,0,0,0)",

            plot_bgcolor: "rgba(0,0,0,0)",

            font: {
                family: "Inter"
            },

            xaxis: {
                title: "",
                gridcolor: "#f1f5f9"
            },

            yaxis: {
                title: "Amount",
                gridcolor: "#f1f5f9"
            },

            legend: {
                orientation: "h",
                y: 1.1
            }

        };


        Plotly.newPlot(
            "revenueExpenseChart",
            [revenue, expense],
            layout,
            {
                responsive: true,
                displayModeBar: false
            }
        );

    }

    catch (error) {

        console.error(
            "Revenue/Expense chart error:",
            error
        );

    }

}



/* =====================================================
   DEPARTMENT EXPENSE
   ===================================================== */

async function loadDepartmentChart() {

    try {

        const response =
            await fetch("/api/department-summary");

        const data =
            await response.json();


        if (data.error) {

            console.error(data.error);

            return;

        }


        const trace = {

            x: data.departments,

            y: data.expenses,

            type: "bar",

            marker: {
                line: {
                    width: 0
                }
            }

        };


        const layout = {

            height: 320,

            margin: {
                l: 50,
                r: 20,
                t: 10,
                b: 80
            },

            paper_bgcolor: "rgba(0,0,0,0)",

            plot_bgcolor: "rgba(0,0,0,0)",

            font: {
                family: "Inter"
            },

            xaxis: {
                title: "",
                tickangle: -35
            },

            yaxis: {
                title: "Expense",
                gridcolor: "#f1f5f9"
            }

        };


        Plotly.newPlot(
            "departmentChart",
            [trace],
            layout,
            {
                responsive: true,
                displayModeBar: false
            }
        );

    }

    catch (error) {

        console.error(
            "Department chart error:",
            error
        );

    }

}



/* =====================================================
   BUDGET
   ===================================================== */

async function loadBudgetChart() {

    try {

        const response =
            await fetch("/api/budget-summary");

        const data =
            await response.json();


        if (data.error) {

            console.error(data.error);

            return;

        }


        const actual = {

            x: data.years,

            y: data.actual,

            type: "bar",

            name: "Actual Expense"

        };


        const budget = {

            x: data.years,

            y: data.budget,

            type: "bar",

            name: "Budget"

        };


        const layout = {

            height: 320,

            barmode: "group",

            margin: {
                l: 50,
                r: 20,
                t: 10,
                b: 45
            },

            paper_bgcolor: "rgba(0,0,0,0)",

            plot_bgcolor: "rgba(0,0,0,0)",

            font: {
                family: "Inter"
            },

            xaxis: {
                title: "Year"
            },

            yaxis: {
                title: "Amount",
                gridcolor: "#f1f5f9"
            },

            legend: {
                orientation: "h",
                y: 1.1
            }

        };


        Plotly.newPlot(
            "budgetChart",
            [actual, budget],
            layout,
            {
                responsive: true,
                displayModeBar: false
            }
        );

    }

    catch (error) {

        console.error(
            "Budget chart error:",
            error
        );

    }

}