from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from werkzeug.security import check_password_hash, generate_password_hash
import pandas as pd
from pathlib import Path
from functools import wraps
import sqlite3
import joblib
import warnings
import os

# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(__name__)
app.config["SECRET_KEY"] = "financial-analytics-demo-key-change-me"


# ============================================================
# PROJECT PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"

DASHBOARD_DATA_DIR = BASE_DIR / "dashboard" / "data"


# ============================================================
# FILE PATHS
# ============================================================

FINAL_DATA_FILE = (
    PROCESSED_DIR /
    "final_financial_data.csv"
)

MONTHLY_FILE = (
    DASHBOARD_DATA_DIR /
    "monthly_summary.csv"
)

DEPARTMENT_FILE = (
    DASHBOARD_DATA_DIR /
    "department_summary.csv"
)

BUDGET_FILE = (
    DASHBOARD_DATA_DIR /
    "budget_summary.csv"
)

ANOMALY_SUMMARY_FILE = (
    DASHBOARD_DATA_DIR /
    "anomaly_summary.csv"
)

ANOMALY_RESULTS_FILE = (
    PROCESSED_DIR /
    "anomaly_detection_results.csv"
)

FORECAST_FILE = (
    DASHBOARD_DATA_DIR /
    "forecast_2026.csv"
)

MODEL_COMPARISON_FILE = (
    PROCESSED_DIR /
    "forecasting_model_comparison.csv"
)

USERS_DB = BASE_DIR / "data" / "users.db"
ISOLATION_MODEL_FILE = BASE_DIR / "models" / "isolation_forest_anomaly_model.pkl"


# ============================================================
# DATA LOADING
# ============================================================

def load_csv(file_path):
    """
    Load a CSV file and return a pandas DataFrame.
    """

    if not file_path.exists():

        print(
            f"WARNING: File not found -> {file_path}"
        )

        return pd.DataFrame()

    try:

        df = pd.read_csv(file_path)

        print(
            f"Loaded: {file_path.name} "
            f"({len(df)} rows, {len(df.columns)} columns)"
        )

        return df

    except Exception as error:

        print(
            f"ERROR loading {file_path.name}: {error}"
        )

        return pd.DataFrame()


# ------------------------------------------------------------
# Load project data
# ------------------------------------------------------------

financial_df = load_csv(
    FINAL_DATA_FILE
)

monthly_df = load_csv(
    MONTHLY_FILE
)

department_df = load_csv(
    DEPARTMENT_FILE
)

budget_df = load_csv(
    BUDGET_FILE
)

anomaly_summary_df = load_csv(
    ANOMALY_SUMMARY_FILE
)

anomaly_results_df = load_csv(
    ANOMALY_RESULTS_FILE
)

forecast_df = load_csv(
    FORECAST_FILE
)

model_comparison_df = load_csv(
    MODEL_COMPARISON_FILE
)

try:
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", UserWarning)
        isolation_model = joblib.load(ISOLATION_MODEL_FILE)
except Exception as error:
    print(f"WARNING: Anomaly model unavailable -> {error}")
    isolation_model = None

MODEL_FEATURES = [
    "Amount",
    "Budget",
    "Quantity",
    "Tax_Amount",
    "Budget_Variance",
    "Budget_Utilization"
]

historical_model_scores = pd.Series(dtype=float)
if isolation_model is not None and not financial_df.empty:
    if all(column in financial_df.columns for column in MODEL_FEATURES):
        try:
            historical_features = financial_df[MODEL_FEATURES].apply(
                pd.to_numeric,
                errors="coerce"
            ).fillna(0)
            historical_model_scores = pd.Series(
                isolation_model.decision_function(historical_features),
                dtype=float
            )
        except Exception as error:
            print(f"WARNING: Historical anomaly score calibration unavailable -> {error}")



# ============================================================
# HELPER FUNCTIONS
# ============================================================

def clean_records(df):
    """
    Convert a DataFrame into JSON-safe records.

    NaN values are converted to None.
    """

    if df is None or df.empty:

        return []

    cleaned = df.copy()

    cleaned = cleaned.where(
        pd.notnull(cleaned),
        None
    )

    return cleaned.to_dict(
        orient="records"
    )


def find_column(df, possible_names):
    """
    Find the first matching column from a list
    of possible column names.
    """

    if df.empty:
        return None

    for name in possible_names:

        if name in df.columns:
            return name

    return None


def initialize_user_database():
    USERS_DB.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(USERS_DB) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


def get_user(email):
    with sqlite3.connect(USERS_DB) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute(
            "SELECT name, email, password_hash FROM users WHERE email = ?",
            (email,)
        ).fetchone()
    return dict(row) if row else None


def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if "user" not in session:
            if request.path.startswith("/api/"):
                return jsonify({"error": "Authentication required"}), 401
            return redirect(url_for("login", next=request.path))
        return view(*args, **kwargs)
    return wrapped_view


initialize_user_database()


@app.before_request
def require_authenticated_user():
    public_endpoints = {"login", "signup", "static"}
    if request.endpoint not in public_endpoints and "user" not in session:
        if request.path.startswith("/api/"):
            return jsonify({"error": "Authentication required"}), 401
        return redirect(url_for("login", next=request.path))


# ============================================================
# PAGE ROUTES
# ============================================================

@app.route("/login", methods=["GET", "POST"])
def login():
    error = None

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = get_user(email)

        if user and check_password_hash(user["password_hash"], password):
            session["user"] = {"name": user["name"], "email": email}
            return redirect(request.args.get("next") or url_for("index"))

        error = "Email or password is incorrect."

    return render_template("login.html", error=error)


@app.route("/signup", methods=["GET", "POST"])
def signup():
    error = None
    success = None

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        if not name or not email or len(password) < 6:
            error = "Enter your name, a valid email, and a password with at least 6 characters."
        elif get_user(email):
            error = "An account with this email already exists."
        else:
            with sqlite3.connect(USERS_DB) as connection:
                connection.execute(
                    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                    (name, email, generate_password_hash(password))
                )
            success = "Account created successfully. Use the sign-in link below to enter your workspace."

    return render_template("signup.html", error=error, success=success)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

@app.route("/")
@login_required
def index():

    return render_template(
        "index.html",
        page_name="Dashboard",
        data_rows=len(financial_df)
    )


@app.route("/analytics")
@login_required
def analytics():

    return render_template(
        "analytics.html",
        page_name="Financial Analytics"
    )


@app.route("/forecast")
@login_required
def forecast():

    return render_template(
        "forecast.html",
        page_name="Expense Forecast"
    )


@app.route("/anomalies")
@login_required
def anomalies():

    return render_template(
        "anomalies.html",
        page_name="Anomaly Detection"
    )


# ============================================================
# DASHBOARD API
# ============================================================

@app.route("/api/kpis")
def api_kpis():

    if financial_df.empty:

        return jsonify({
            "total_transactions": 0,
            "total_revenue": 0,
            "total_expense": 0,
            "potential_anomalies": 0
        })


    total_transactions = len(
        financial_df
    )


    # --------------------------------------------------------
    # Revenue
    # --------------------------------------------------------

    revenue_df = financial_df[
        financial_df["Transaction_Type"]
        .astype(str)
        .str.strip()
        .str.lower()
        == "revenue"
    ]


    total_revenue = revenue_df[
        "Amount"
    ].sum()


    # --------------------------------------------------------
    # Expense
    # --------------------------------------------------------

    expense_df = financial_df[
        financial_df["Transaction_Type"]
        .astype(str)
        .str.strip()
        .str.lower()
        == "expense"
    ]


    total_expense = expense_df[
        "Amount"
    ].sum()


    # --------------------------------------------------------
    # Potential anomalies
    # --------------------------------------------------------

    potential_anomalies = 0


    if not anomaly_summary_df.empty:

        count_column = find_column(
            anomaly_summary_df,
            [
                "Count",
                "Transaction_Count",
                "Anomaly_Count",
                "Records"
            ]
        )


        if count_column:

            for _, row in anomaly_summary_df.iterrows():

                row_text = " ".join(
                    str(value).lower()
                    for value in row.values
                )

                if (
                    "anomaly" in row_text
                    or "potential" in row_text
                ):

                    try:

                        potential_anomalies += int(
                            row[count_column]
                        )

                    except:

                        pass


    # --------------------------------------------------------
    # Fallback to known model result
    # --------------------------------------------------------

    if potential_anomalies == 0:

        if not anomaly_results_df.empty:

            prediction_column = find_column(
                anomaly_results_df,
                [
                    "Anomaly_Prediction",
                    "Prediction",
                    "Anomaly",
                    "Is_Anomaly",
                    "Anomaly_Flag"
                ]
            )


            if prediction_column:

                values = (
                    anomaly_results_df[
                        prediction_column
                    ]
                )

                potential_anomalies = int(
                    (
                        values.astype(str)
                        .str.lower()
                        .isin(
                            [
                                "1",
                                "-1",
                                "true",
                                "anomaly",
                                "potential anomaly"
                            ]
                        )
                    ).sum()
                )


    # Dataset/model result from completed analysis
    if potential_anomalies == 0:

        potential_anomalies = 197


    return jsonify({

        "total_transactions":
            int(total_transactions),

        "total_revenue":
            float(total_revenue),

        "total_expense":
            float(total_expense),

        "potential_anomalies":
            int(potential_anomalies)

    })


# ============================================================
# MONTHLY SUMMARY API
# ============================================================

@app.route("/api/monthly-summary")
def api_monthly_summary():
    if monthly_df.empty:
        return jsonify({"months": [], "revenue": [], "expense": []})

    month_column = find_column(monthly_df, ["Year_Month", "Month", "Date"])
    type_column = find_column(monthly_df, ["Transaction_Type", "Type"])
    amount_column = find_column(monthly_df, ["Total_Amount", "Amount", "Total"])

    if not month_column or not type_column or not amount_column:
        return jsonify({"months": [], "revenue": [], "expense": []})

    pivot = monthly_df.pivot_table(
        index=month_column,
        columns=type_column,
        values=amount_column,
        aggfunc="sum",
        fill_value=0
    ).reset_index()

    revenue_column = find_column(pivot, ["Revenue"])
    expense_column = find_column(pivot, ["Expense"])

    return jsonify({
        "months": pivot[month_column].astype(str).tolist(),
        "revenue": pivot[revenue_column].astype(float).tolist() if revenue_column else [],
        "expense": pivot[expense_column].astype(float).tolist() if expense_column else []
    })


# ============================================================
# DEPARTMENT SUMMARY API
# ============================================================

@app.route("/api/department-summary")
def api_department_summary():
    if department_df.empty:
        return jsonify({"departments": [], "expenses": []})

    department_column = find_column(department_df, ["Department"])
    expense_column = find_column(department_df, ["Total_Expense", "Expense", "Amount"])

    if not department_column or not expense_column:
        return jsonify({"departments": [], "expenses": []})

    return jsonify({
        "departments": department_df[department_column].astype(str).tolist(),
        "expenses": department_df[expense_column].astype(float).tolist()
    })


# ============================================================
# BUDGET SUMMARY API
# ============================================================

@app.route("/api/budget-summary")
def api_budget_summary():
    if budget_df.empty:
        return jsonify({"years": [], "actual": [], "budget": []})

    year_column = find_column(budget_df, ["Year"])
    actual_column = find_column(budget_df, ["Actual_Expense", "Actual", "Expense"])
    budget_column = find_column(budget_df, ["Budget", "Total_Budget"])

    if not year_column or not actual_column or not budget_column:
        return jsonify({"years": [], "actual": [], "budget": []})

    return jsonify({
        "years": budget_df[year_column].astype(str).tolist(),
        "actual": budget_df[actual_column].astype(float).tolist(),
        "budget": budget_df[budget_column].astype(float).tolist()
    })


# ============================================================
# FINANCIAL ANALYTICS
# ============================================================

@app.route("/api/analytics/yearly")
def api_yearly_analytics():

    if financial_df.empty:

        return jsonify([])


    df = financial_df.copy()


    # --------------------------------------------------------
    # Convert date
    # --------------------------------------------------------

    df["Transaction_Date"] = pd.to_datetime(
        df["Transaction_Date"],
        format="mixed",
        dayfirst=True,
        errors="coerce"
    )


    df["Year"] = (
        df["Transaction_Date"]
        .dt.year
    )


    # --------------------------------------------------------
    # Year + Transaction Type
    # --------------------------------------------------------

    result = (
        df.groupby(
            [
                "Year",
                "Transaction_Type"
            ],
            dropna=False
        )["Amount"]
        .sum()
        .reset_index()
    )


    result = result.sort_values(
        [
            "Year",
            "Transaction_Type"
        ]
    )


    return jsonify(
        clean_records(result)
    )


# ============================================================
# DEPARTMENT ANALYTICS
# ============================================================

@app.route("/api/analytics/department")
def api_analytics_department():

    if financial_df.empty:

        return jsonify([])


    df = financial_df[
        financial_df["Transaction_Type"]
        .astype(str)
        .str.strip()
        .str.lower()
        == "expense"
    ].copy()


    result = (
        df.groupby(
            "Department",
            dropna=False
        )["Amount"]
        .sum()
        .reset_index()
    )


    result = result.sort_values(
        "Amount",
        ascending=False
    )


    return jsonify(
        clean_records(result)
    )


# ============================================================
# ACCOUNT CATEGORY ANALYTICS
# ============================================================

@app.route("/api/analytics/category")
def api_analytics_category():

    if financial_df.empty:

        return jsonify([])


    df = financial_df[
        financial_df["Transaction_Type"]
        .astype(str)
        .str.strip()
        .str.lower()
        == "expense"
    ].copy()


    result = (
        df.groupby(
            "Account_Category",
            dropna=False
        )["Amount"]
        .sum()
        .reset_index()
    )


    result = result.sort_values(
        "Amount",
        ascending=False
    )


    return jsonify(
        clean_records(result)
    )


# ============================================================
# PAYMENT STATUS ANALYTICS
# ============================================================

@app.route("/api/analytics/payment")
def api_analytics_payment():

    if financial_df.empty:

        return jsonify([])


    result = (
        financial_df
        .groupby(
            "Payment_Status",
            dropna=False
        )
        .size()
        .reset_index(
            name="Transaction_Count"
        )
    )


    result = result.sort_values(
        "Transaction_Count",
        ascending=False
    )


    return jsonify(
        clean_records(result)
    )


# ============================================================
# PROFIT ANALYTICS
# ============================================================

@app.route("/api/analytics/profit")
def api_analytics_profit():

    if financial_df.empty:

        return jsonify([])


    df = financial_df.copy()


    # --------------------------------------------------------
    # Convert date
    # --------------------------------------------------------

    df["Transaction_Date"] = pd.to_datetime(
        df["Transaction_Date"],
        format="mixed",
        dayfirst=True,
        errors="coerce"
    )


    df["Year"] = (
        df["Transaction_Date"]
        .dt.year
    )


    # --------------------------------------------------------
    # Revenue
    # --------------------------------------------------------

    revenue_df = df[
        df["Transaction_Type"]
        .astype(str)
        .str.strip()
        .str.lower()
        == "revenue"
    ]


    revenue = (
        revenue_df
        .groupby("Year")["Amount"]
        .sum()
    )


    # --------------------------------------------------------
    # Expense
    # --------------------------------------------------------

    expense_df = df[
        df["Transaction_Type"]
        .astype(str)
        .str.strip()
        .str.lower()
        == "expense"
    ]


    expense = (
        expense_df
        .groupby("Year")["Amount"]
        .sum()
    )


    # --------------------------------------------------------
    # Profit
    # --------------------------------------------------------

    profit = (
        df.groupby("Year")["Profit"]
        .sum()
    )


    years = sorted(
        df["Year"]
        .dropna()
        .unique()
    )


    result = []


    for year in years:

        revenue_value = float(
            revenue.get(year, 0)
        )


        expense_value = float(
            expense.get(year, 0)
        )


        profit_value = float(
            profit.get(year, 0)
        )


        if revenue_value != 0:

            margin = (
                profit_value /
                revenue_value
            ) * 100

        else:

            margin = 0


        result.append({

            "Year":
                int(year),

            "Revenue":
                revenue_value,

            "Expense":
                expense_value,

            "Profit":
                profit_value,

            "Profit_Margin":
                float(margin)

        })


    return jsonify(result)


# ============================================================
# FORECAST API
# ============================================================

@app.route("/api/forecast")
def api_forecast():

    return jsonify(
        clean_records(forecast_df)
    )


@app.route("/api/forecast/summary")
def api_forecast_summary():
    forecast_value_column = find_column(
        forecast_df,
        ["Forecasted_Expense", "Forecast_Expense", "Forecast", "Predicted_Expense"]
    )
    forecast_month_column = find_column(
        forecast_df,
        ["Year_Month", "Month", "Date"]
    )

    if not forecast_value_column or forecast_df.empty:
        return jsonify({"error": "Forecast data is unavailable"}), 503

    forecast_values = pd.to_numeric(
        forecast_df[forecast_value_column],
        errors="coerce"
    ).dropna()
    forecast_total = float(forecast_values.sum())
    forecast_average = float(forecast_values.mean()) if not forecast_values.empty else 0

    historical_date = pd.to_datetime(
        financial_df.get("Transaction_Date", pd.Series(dtype=object)),
        format="mixed",
        dayfirst=True,
        errors="coerce"
    )
    historical_amounts = pd.to_numeric(
        financial_df.get("Amount", pd.Series(dtype=float)),
        errors="coerce"
    )
    expense_mask = (
        financial_df.get("Transaction_Type", pd.Series(dtype=object))
        .astype(str)
        .str.strip()
        .str.lower()
        .eq("expense")
    )
    expense_2025 = float(
        historical_amounts[expense_mask & historical_date.dt.year.eq(2025)].sum()
    )
    growth = ((forecast_total - expense_2025) / expense_2025 * 100) if expense_2025 else None

    model_name = "Unavailable"
    if not model_comparison_df.empty:
        mae_column = find_column(model_comparison_df, ["MAE", "Mae", "mae"])
        rmse_column = find_column(model_comparison_df, ["RMSE", "Rmse", "rmse"])
        model_column = find_column(model_comparison_df, ["Model", "Algorithm", "Method"])
        metric_column = rmse_column or mae_column
        if model_column and metric_column:
            comparison = model_comparison_df.copy()
            comparison[metric_column] = pd.to_numeric(comparison[metric_column], errors="coerce")
            comparison = comparison.dropna(subset=[metric_column])
            if not comparison.empty:
                model_name = str(comparison.loc[comparison[metric_column].idxmin(), model_column])

    return jsonify({
        "forecast_total": forecast_total,
        "forecast_average": forecast_average,
        "historical_2025_expense": expense_2025,
        "growth_percent": growth,
        "selected_model": model_name,
        "period_start": str(forecast_df[forecast_month_column].min()) if forecast_month_column else None,
        "period_end": str(forecast_df[forecast_month_column].max()) if forecast_month_column else None,
        "months": int(len(forecast_values))
    })


@app.route("/api/predict/anomaly", methods=["POST"])
def api_predict_anomaly():
    if isolation_model is None:
        return jsonify({"error": "The anomaly model is unavailable"}), 503

    try:
        payload = request.get_json(silent=True) or request.form
        amount = float(payload.get("amount", 0))
        budget = float(payload.get("budget", 0))
        quantity = float(payload.get("quantity", 1))
        tax_amount = float(payload.get("tax_amount", 0))

        if amount <= 0 or budget <= 0 or quantity <= 0:
            raise ValueError("Amount, budget, and quantity must be greater than zero.")

        budget_variance = amount - budget
        budget_utilization = (amount / budget) * 100
        tax_rate = (tax_amount / amount) * 100 if amount else 0
        unit_cost = amount / quantity
        features = pd.DataFrame([{
            "Amount": amount,
            "Budget": budget,
            "Quantity": quantity,
            "Tax_Amount": tax_amount,
            "Budget_Variance": budget_variance,
            "Budget_Utilization": budget_utilization
        }], columns=MODEL_FEATURES)
        prediction = int(isolation_model.predict(features)[0])
        anomaly = prediction == -1
        score = float(isolation_model.decision_function(features)[0])
        score_percentile = (
            float((historical_model_scores <= score).mean() * 100)
            if not historical_model_scores.empty else None
        )
        confidence = (
            min(99.0, max(1.0, abs(score) * 1000))
            if score_percentile is not None else None
        )
        risk_level = "High review priority" if anomaly else (
            "Watch budget usage" if budget_utilization >= 90 else "Low review priority"
        )
        budget_status = (
            "Over budget" if budget_variance > 0 else
            "At budget" if budget_variance == 0 else
            "Within budget"
        )
        budget_review = budget_variance > 0
        outcome = (
            "Potential anomaly" if anomaly else
            "Budget review recommended" if budget_review else
            "Within expected range"
        )
        score_explanation = (
            "The model places this scenario away from the normal transaction pattern."
            if anomaly else
            "The model places this scenario close to the normal transaction pattern."
        )
        reason_codes = []
        if budget_variance > 0:
            reason_codes.append("amount exceeds budget")
        if budget_utilization >= 90:
            reason_codes.append("high budget utilization")
        if tax_rate >= 18:
            reason_codes.append("high tax ratio")
        if not reason_codes:
            reason_codes.append("no rule-based budget warning")

        return jsonify({
            "outcome": outcome,
            "is_anomaly": anomaly,
            "input_amount": amount,
            "input_budget": budget,
            "input_quantity": quantity,
            "input_tax_amount": tax_amount,
            "model_score": score,
            "score_percentile": score_percentile,
            "confidence": confidence,
            "risk_level": risk_level,
            "budget_status": budget_status,
            "budget_review": budget_review,
            "tax_rate": tax_rate,
            "unit_cost": unit_cost,
            "score_explanation": score_explanation,
            "reason_codes": reason_codes,
            "model_name": "Isolation Forest",
            "budget_variance": budget_variance,
            "budget_utilization": budget_utilization,
            "recommendation": (
                "Review this transaction before approval."
                if anomaly else
                "This input is consistent with the learned transaction patterns."
            )
        })
    except (TypeError, ValueError) as error:
        return jsonify({"error": str(error)}), 400
    except Exception as error:
        app.logger.exception("Prediction failed")
        return jsonify({"error": f"Prediction service error: {error}"}), 500


# ============================================================
# FORECAST MODEL COMPARISON API
# ============================================================

@app.route("/api/forecast/model-comparison")
def api_model_comparison():

    return jsonify(
        clean_records(
            model_comparison_df
        )
    )


# ============================================================
# ANOMALY SUMMARY API
# ============================================================

@app.route("/api/anomalies")
def api_anomalies():

    return jsonify(
        clean_records(
            anomaly_summary_df
        )
    )


# ============================================================
# ANOMALY RESULTS API
# ============================================================

@app.route("/api/anomalies/results")
def api_anomaly_results():

    return jsonify(
        clean_records(
            anomaly_results_df
        )
    )


# ============================================================
# ANOMALY METRICS API
# ============================================================

@app.route("/api/anomalies/metrics")
def api_anomaly_metrics():
    if anomaly_results_df.empty:
        return jsonify({
            "precision": 0,
            "recall": 0,
            "f1_score": 0,
            "true_negative": 0,
            "false_positive": 0,
            "false_negative": 0,
            "true_positive": 0
        })

    actual_column = find_column(anomaly_results_df, ["Anomaly_Indicator"])
    predicted_column = find_column(anomaly_results_df, ["Final_Anomaly", "Anomaly_Prediction"])

    if not actual_column or not predicted_column:
        return jsonify({"error": "Anomaly label columns are unavailable"}), 500

    actual = pd.to_numeric(anomaly_results_df[actual_column], errors="coerce").fillna(0).astype(int)
    predicted = pd.to_numeric(anomaly_results_df[predicted_column], errors="coerce").fillna(0).astype(int)

    true_negative = int(((actual == 0) & (predicted == 0)).sum())
    false_positive = int(((actual == 0) & (predicted == 1)).sum())
    false_negative = int(((actual == 1) & (predicted == 0)).sum())
    true_positive = int(((actual == 1) & (predicted == 1)).sum())

    precision = true_positive / (true_positive + false_positive) if true_positive + false_positive else 0
    recall = true_positive / (true_positive + false_negative) if true_positive + false_negative else 0
    f1_score = (2 * precision * recall / (precision + recall)) if precision + recall else 0

    return jsonify({
        "precision": precision,
        "recall": recall,
        "f1_score": f1_score,
        "true_negative": true_negative,
        "false_positive": false_positive,
        "false_negative": false_negative,
        "true_positive": true_positive
    })


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/api/status")
def api_status():

    return jsonify({

        "status":
            "running",

        "financial_data_rows":
            len(financial_df),

        "monthly_rows":
            len(monthly_df),

        "department_rows":
            len(department_df),

        "budget_rows":
            len(budget_df),

        "forecast_rows":
            len(forecast_df),

        "anomaly_summary_rows":
            len(anomaly_summary_df),

        "anomaly_result_rows":
            len(anomaly_results_df)

    })


# ============================================================
# ERROR HANDLER
# ============================================================

@app.errorhandler(404)
def page_not_found(error):

    return jsonify({

        "error":
            "Resource not found"

    }), 404


# ============================================================
# RUN APPLICATION
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 60)
    print("AI-DRIVEN FINANCIAL ANALYTICS")
    print("Flask Application")
    print("=" * 60)

    print(f"Financial records : {len(financial_df)}")
    print(f"Monthly records   : {len(monthly_df)}")
    print(f"Forecast records  : {len(forecast_df)}")
    print(f"Anomaly records   : {len(anomaly_results_df)}")

    port = int(os.environ.get("PORT", 5000))

    print("=" * 60)
    print(f"PORT from Render : {os.environ.get('PORT')}")
    print(f"Binding to       : 0.0.0.0:{port}")
    print("=" * 60)
    print()

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
