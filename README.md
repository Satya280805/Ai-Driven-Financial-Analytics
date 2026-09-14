# AI-Driven Financial Analytics using SAP S/4HANA (FICO)

## 📌 Project Overview

**AI-Driven Financial Analytics using SAP S/4HANA (FICO)** is a Data Science and Machine Learning project designed to analyze enterprise-style financial data and generate actionable financial insights.

The project combines:

- **SAP S/4HANA FICO concepts** for enterprise financial context 
- **Python** for data processing and analytics 
- **Machine Learning** for expense forecasting and anomaly detection 
- **Power BI** for business intelligence and visualization 
- **Flask** for a web-based analytics application 

The primary focus of the project is **Data Science and AI**, while SAP FICO provides the enterprise financial context in which the analysis is performed.

> **Important:** The dataset used in this project is synthetically generated. It contains fields designed to represent common enterprise financial concepts associated with SAP FICO. The project does not claim that the dataset was extracted directly from a live SAP S/4HANA production system.

---

## 🎯 Problem Statement

Large organizations generate significant amounts of financial transaction data involving revenues, expenses, budgets, vendors, invoices, departments, cost centers, and profit centers.

Analyzing such data manually can make it difficult to:

-  Identify financial trends 
-  Monitor expenses against budgets 
-  Understand departmental spending 
-  Forecast future expenses 
-  Detect unusual financial transactions 
-  Support timely financial decision-making 

This project addresses these challenges by developing an end-to-end **AI-driven financial analytics pipeline**.

---

## 🎯 Objectives

1.  Analyze enterprise-style financial transaction data. 
2.  Perform data cleaning and preprocessing. 
3.  Conduct Exploratory Data Analysis (EDA). 
4.  Engineer financial and time-based features. 
5.  Analyze revenue, expenses, budgets, departments, and account categories. 
6.  Develop an expense forecasting model. 
7.  Forecast monthly expenses for 2026. 
8.  Detect potentially anomalous financial transactions. 
9.  Evaluate Machine Learning models using suitable metrics. 
10.  Develop interactive financial dashboards using Power BI. 
11.  Develop a Flask-based web application for financial analytics. 
12.  Present insights in a form useful for financial decision support. 

---

# 🏗️ System Architecture



```
                 SAP S/4HANA + FICO
                         │
             Enterprise Financial Context
                         │
                         ▼
                Financial Dataset
                         │
                         ▼
                  Python Pipeline
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
 Data Preprocessing     EDA       Feature Engineering
        │                │                │
        └────────────────┼────────────────┘
                         ▼
              Financial Analytics
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
        Forecasting           Anomaly Detection
             │                       │
             └───────────┬───────────┘
                         ▼
                  Financial Insights
                    /           \
                   ▼             ▼
              Power BI         Flask
                   \             /
                    └─────┬─────┘
                          ▼
              Decision Support
```

### One-Line Project Flow

**SAP FICO Financial Context → Data Processing → Financial Analytics → Machine Learning → Power BI + Flask → Financial Insights**

---

# 🏢 SAP FICO Context

SAP S/4HANA FICO is used in the project as the **enterprise financial context**.

## FI – Financial Accounting

Examples include:

-  Financial transactions 
-  Revenue 
-  Expenses 
-  Invoices 
-  Payments 
-  Taxes 
-  Vendors 
-  Company codes 

## CO – Controlling

Examples include:

-  Cost centers 
-  Profit centers 
-  Departments 
-  Budgets 
-  Cost analysis 
-  Profitability analysis 

## SAP HANA

SAP HANA represents the underlying high-performance data platform associated with SAP S/4HANA. In the proposed architecture, enterprise financial data can be made available for analytical processing before being consumed by the Python Data Science pipeline.

---

# 🔗 Dataset and SAP FICO Concept Mapping

| Dataset Field | Enterprise / SAP FICO Concept |
| ------------------------------------------ | ------------------------------- |
| Transaction\_ID                            | Financial transaction reference |
| Transaction\_Date                          | Posting / transaction date      |
| Company\_Code                              | Company Code                    |
| Cost\_Center                               | Cost Center                     |
| Profit\_Center                             | Profit Center                   |
| Account\_Category                          | Financial account/category      |
| Transaction\_Type                          | Revenue / Expense               |
| Amount                                     | Transaction amount              |
| Budget                                     | Budget / planning value         |
| Payment\_Status                            | Payment status                  |
| Invoice\_ID                                | Invoice / reference             |
| Vendor\_ID                                 | Vendor                          |
| Department                                 | Organizational dimension        |
| Currency                                   | Transaction currency            |
| Tax\_Amount                                | Tax amount                      |
| Profit                                     | Profit-related measure          |
| Approval\_Status                           | Approval / workflow status      |
| Anomaly\_Indicator                         | Reference anomaly label         |

---

# 📊 Dataset

The project uses a synthetically generated enterprise-style financial transaction dataset.

## Dataset Summary

- **Transactions:** 9,802 
- **Features before feature engineering:** 20 
- **Features after feature engineering:** 25 
- **Time period:** 2021–2025 
- **Currency:** INR 
- **Transaction Types:** Revenue and Expense 
- **Reference anomaly records:** 195 

## Dataset Columns



```
Transaction_ID
Transaction_Date
Company_Code
Cost_Center
Profit_Center
Account_Category
Transaction_Type
Amount
Budget
Payment_Status
Description
Quantity
Department
Currency
Invoice_ID
Vendor_ID
Tax_Amount
Profit
Approval_Status
Anomaly_Indicator
```

---

# 🧹 Data Preprocessing

The raw dataset was processed before performing analytics and Machine Learning.

## Steps Performed

1.  Loaded the financial transaction dataset using pandas. 
2.  Inspected data types and dataset structure. 
3.  Checked missing values. 
4.  Checked duplicate transaction IDs. 
5.  Standardized categorical values. 
6.  Removed unnecessary whitespace from categorical fields. 
7.  Standardized company codes. 
8.  Converted transaction dates into proper datetime format. 
9.  Handled missing Quantity values using median imputation. 
10.  Preserved meaningful missing values in fields such as Invoice\_ID, Vendor\_ID, and Profit. 

## Missing-Value Handling

The remaining missing values have business meaning:

- **Invoice\_ID:** 2,153 missing 
- **Vendor\_ID:** 4,695 missing 
- **Profit:** 8,255 missing 

Profit is missing for expense transactions in the generated dataset, so it was not artificially filled.

---

# ⚙️ Feature Engineering

The following features were created:

### Year

Extracted from the transaction date.

### Month

Extracted from the transaction date.

### Quarter

Extracted from the transaction date.

### Budget Variance



```
Budget Variance = Amount - Budget
```

A positive value indicates that the transaction amount is above the corresponding budget value.

### Budget Utilization



```
Budget Utilization = (Amount / Budget) × 100
```

These features support financial analysis and Machine Learning.

---

# 📈 Exploratory Data Analysis

EDA was performed to understand the structure and behavior of the financial data.

## Analysis Included

-  Transaction type distribution 
-  Amount distribution 
-  Expense and revenue analysis 
-  Payment status distribution 
-  Anomaly distribution 
-  Missing-value analysis 
-  Statistical summaries 
-  Outlier analysis 
-  Department-wise expenses 
-  Account-category expenses 
-  Year-wise financial trends 
-  Budget utilization 

---

# 💰 Financial Analytics

## Overall Financial Summary

| Metric | Value |
| ----------------------- | -------- |
| Total Transactions      | 9,802    |
| Total Revenue           | ₹993.38M |
| Total Expense           | ₹1.64B   |
| Expense Budget          | ₹1.61B   |
| Available Profit Values | ₹288.14M |
| Reference Anomalies     | 195      |

> The Profit value represents the available Profit field in the dataset. It should not be interpreted as `Revenue − Expense`, because Profit is missing for expense transactions.

---

# 📅 Year-Wise Expense and Revenue

| Year | Expense | Revenue |
| ------------------ | -------- | -------- |
| 2021               | ₹244.92M | ₹144.37M |
| 2022               | ₹279.28M | ₹153.64M |
| 2023               | ₹321.62M | ₹189.62M |
| 2024               | ₹369.50M | ₹231.05M |
| 2025               | ₹429.15M | ₹274.70M |

The dataset shows an overall increase in both expenses and revenue during the five-year period.

---

# 🏢 Department-Wise Expense

| Department | Expense |
| ----------------- | -------- |
| Operations        | ₹347.54M |
| IT                | ₹318.47M |
| Marketing         | ₹265.50M |
| Sales             | ₹232.68M |
| Finance           | ₹199.53M |
| Procurement       | ₹158.51M |
| HR                | ₹63.29M  |
| Administration    | ₹58.95M  |

Operations and IT recorded the highest total expenses in the analyzed dataset.

---

# 📂 Account-Category Analysis

| Account Category | Expense |
| ----------------------- | -------- |
| Procurement             | ₹463.26M |
| Marketing               | ₹263.23M |
| IT                      | ₹239.41M |
| Maintenance             | ₹135.12M |
| Salaries                | ₹129.55M |
| Other                   | ₹123.46M |
| Logistics               | ₹115.93M |
| Travel                  | ₹80.38M  |
| Office Supplies         | ₹50.44M  |
| Utilities               | ₹43.69M  |

Procurement represents the largest expense category in the dataset.

---

# 📊 Budget Analysis

| Year | Actual Expense | Budget | Variance | Utilization |
| ------------------------------------------- | -------- | -------- | -------- | ------- |
| 2021                                        | ₹244.92M | ₹238.36M | +₹6.56M  | 102.75% |
| 2022                                        | ₹279.28M | ₹279.29M | -₹0.01M  | 100.00% |
| 2023                                        | ₹321.62M | ₹316.81M | +₹4.81M  | 101.52% |
| 2024                                        | ₹369.50M | ₹364.91M | +₹4.59M  | 101.26% |
| 2025                                        | ₹429.15M | ₹409.57M | +₹19.58M | 104.78% |

The highest budget utilization occurred in **2025**, where actual expenses exceeded the budget by approximately ₹19.58M.

---

# 🤖 Machine Learning

Two primary Machine Learning tasks were implemented:

1. **Expense Forecasting** 
2. **Anomaly Detection** 

---

# 🔮 Expense Forecasting

The forecasting system predicts monthly expenses based on historical financial patterns.

## Monthly Data

The five-year transaction dataset was aggregated into monthly expense values, producing:

-  60 months of data 
-  January 2021 to December 2025 

## Features

The forecasting model uses:

-  Lag 1 
-  Lag 2 
-  Lag 3 
-  Lag 12 
-  3-month rolling mean 
-  Month 
-  Quarter 

## Train-Test Split

After creating lag features:

-  Training observations: 36 months 
-  Testing observations: 12 months 
-  Test period: 2025 

The time-series structure was preserved instead of randomly shuffling the observations.

---

# 🧠 Forecasting Model Comparison

Three approaches were evaluated:

| Model | MAE | RMSE |
| ----------------- | ---------------- | ---------------- |
| Baseline          | 10,978,071.89    | 13,002,150.47    |
| Random Forest     | 5,613,767.34     | 7,038,432.49     |
| Gradient Boosting | **5,313,363.51** | **6,811,377.10** |

## Selected Model

**Gradient Boosting Regressor** produced the lowest MAE and RMSE among the tested approaches.

The model improved MAE by approximately **51.6% compared with the baseline**.

> The forecasting dataset is relatively small at the monthly level, with only 36 training observations. Therefore, the model results should be interpreted as a project-level demonstration rather than a production-grade forecasting guarantee.

---

# 📅 2026 Expense Forecast

The selected Gradient Boosting model was used recursively to generate monthly expense forecasts for 2026.

| Month | Forecast Expense |
| --------------------- | ------- |
| January               | ₹33.51M |
| February              | ₹36.56M |
| March                 | ₹41.63M |
| April                 | ₹41.01M |
| May                   | ₹38.53M |
| June                  | ₹43.20M |
| July                  | ₹39.43M |
| August                | ₹39.43M |
| September             | ₹43.19M |
| October               | ₹39.39M |
| November              | ₹46.06M |
| December              | ₹48.94M |

## 2026 Forecast Summary

- **Total forecast expense:** ₹490.87M 
- **Average monthly forecast:** ₹40.91M 
- **Growth compared with 2025 actual expense:** 14.38% 

---

# 🚨 Anomaly Detection

Anomaly detection was implemented using the **Isolation Forest** algorithm.

## Features Used



```
Amount
Budget
Quantity
Tax_Amount
Budget_Variance
Budget_Utilization
```

## Model Configuration



```
n_estimators = 200
contamination = 0.02
random_state = 42
```

The model identifies transactions with unusual numerical patterns.

> A detected anomaly represents a statistically unusual transaction. It does **not** automatically mean fraud or an incorrect financial transaction.

---

# 📊 Anomaly Detection Results

The model identified:

- **197 potential anomalies** 
- **9,605 normal transactions** 

## Evaluation Against Reference Labels

| Metric | Result |
| ------------ | ------ |
| Precision    | 36.55% |
| Recall       | 36.92% |
| F1-Score     | 36.73% |

## Confusion Matrix

| | Predicted Normal | Predicted Anomaly |
| --------------------------------- | ----- | --- |
| Actual Normal                     | 9,482 | 125 |
| Actual Anomaly                    | 123   | 72  |

The results indicate that the anomaly detector can identify unusual financial patterns, while also showing that further feature engineering and domain-specific rules would be required for a stronger production-level detection system.

---

# 📊 Power BI Dashboard

A Power BI dashboard was developed to provide an interactive business view of the financial analytics results.

## Dashboard Components

-  Revenue vs Expense 
-  Department-wise Expense 
-  Actual Expense vs Budget 
-  2026 Expense Forecast 
-  Anomaly Detection 
-  KPI Cards 

## Key KPIs

-  Total Transactions 
-  Total Revenue 
-  Total Expense 
-  Potential Anomalies 

The Power BI dashboard provides a business-oriented view of the outputs generated by the Data Science pipeline.

---

# 🌐 Flask Web Application

A Flask-based web application was developed as a software interface for the project.

## Main Pages



```
Dashboard
Financial Analytics
Expense Forecast
Anomaly Detection
```

## Backend

Flask provides APIs for:

-  KPI values 
-  Monthly financial summaries 
-  Department summaries 
-  Budget summaries 
-  Financial analytics 
-  Forecast results 
-  Model comparison 
-  Anomaly results 
-  Anomaly evaluation metrics 

## Frontend

The frontend uses:

-  HTML 
-  CSS 
-  JavaScript 
-  Plotly.js 

The browser retrieves analytical data through Flask APIs and renders interactive charts.

---

# 🗂️ Project Structure



```
AI-Driven-Financial-Analytics/
│
├── app.py
│
├── data/
│   ├── raw/
│   │   └── financial_transactions.csv
│   │
│   └── processed/
│       ├── cleaned_financial_data.csv
│       ├── financial_data_features.csv
│       ├── final_financial_data.csv
│       ├── forecasting_model_comparison.csv
│       ├── expense_forecast_2026.csv
│       └── anomaly_detection_results.csv
│
├── sap/
│   ├── abap/
│   ├── fico/
│   └── screenshots/
│
├── python/
│   ├── preprocessing/
│   ├── analysis/
│   └── ml/
│
├── notebooks/
│   ├── 01_Data_Exploration.ipynb
│   ├── 02_Data_Preprocessing.ipynb
│   ├── 03_Feature_Engineering.ipynb
│   ├── 04_Outlier_Analysis.ipynb
│   ├── 05_Financial_Analytics.ipynb
│   ├── 06_Financial_Forecasting.ipynb
│   ├── 07_Forecasting_Models.ipynb
│   ├── 08_Expense_Forecasting_2026.ipynb
│   ├── 09_Anomaly_Detection.ipynb
│   └── 10_Dashboard_Data_Preparation.ipynb
│
├── models/
│   ├── gradient_boosting_expense_model.pkl
│   └── isolation_forest_anomaly_model.pkl
│
├── dashboard/
│   ├── data/
│   │   ├── monthly_summary.csv
│   │   ├── department_summary.csv
│   │   ├── budget_summary.csv
│   │   ├── anomaly_summary.csv
│   │   └── forecast_2026.csv
│   │
│   └── AI_Driven_Financial_Analytics_Dashboard.pbix
│
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── analytics.html
│   ├── forecast.html
│   └── anomalies.html
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── main.js
│       ├── dashboard.js
│       ├── analytics.js
│       ├── forecast.js
│       └── anomalies.js
│
├── requirements.txt
├── README.md
└── .gitignore
```

---

# 🧪 Testing and Validation

## Data Validation

The processed dataset was validated for:

-  Dataset shape 
-  Date range 
-  Duplicate Transaction\_ID values 
-  Missing values 
-  Quantity completeness 
-  Anomaly-label distribution 
-  Budget zero values 
-  Data consistency 

### Validation Results



```
Processed dataset: 9802 × 25
Date range: 2021-01-01 to 2025-12-31
Duplicate Transaction_ID: 0
Budget values equal to zero: 0
Normal reference labels: 9607
Anomaly reference labels: 195
```

## Machine Learning Validation

### Forecasting

Evaluation metrics:

-  MAE 
-  RMSE 

The Gradient Boosting model achieved the lowest values among the tested approaches.

### Anomaly Detection

Evaluation metrics:

-  Precision 
-  Recall 
-  F1-score 
-  Confusion Matrix 

---

# 🌐 Flask Application Testing

The application provides the following main routes:



```
/
 /analytics
 /forecast
 /anomalies
```

API endpoints include:



```
/api/kpis
/api/monthly-summary
/api/department-summary
/api/budget-summary

/api/analytics/yearly
/api/analytics/department
/api/analytics/category
/api/analytics/payment
/api/analytics/profit

/api/forecast
/api/forecast/model-comparison

/api/anomalies
/api/anomalies/results
/api/anomalies/metrics

/api/status
```

---

# 🛠️ Technologies Used

## Programming

-  Python 
-  SQL 
-  HTML 
-  CSS 
-  JavaScript 

## Data Science

-  pandas 
-  NumPy 
-  Matplotlib 
-  Seaborn 
-  Scikit-learn 
-  Jupyter Notebook 

## Machine Learning

-  Random Forest Regressor 
-  Gradient Boosting Regressor 
-  Isolation Forest 

## Visualization

-  Power BI 
-  Plotly.js 
-  Matplotlib 
-  Seaborn 

## Enterprise Context

-  SAP S/4HANA 
-  SAP FICO 
-  SAP HANA concepts 

## Web Development

-  Flask 
-  HTML 
-  CSS 
-  JavaScript 

## Development Tools

-  VS Code 
-  Eclipse with ADT 
-  Git 
-  GitHub 

---

# 📦 Installation

## 1. Clone the Repository



```
git clone <repository-url>
cd AI-Driven-Financial-Analytics
```

## 2. Create a Virtual Environment



```
python -m venv .venv
```

## 3. Activate the Environment

### Windows



```
.venv\Scripts\activate
```

## 4. Install Dependencies



```
pip install -r requirements.txt
```

## 5. Run the Flask Application



```
python app.py
```

Open the application in a browser:



```
http://127.0.0.1:5000
```

---

# 📋 Requirements

The main Python libraries used in the project include:



```
pandas
numpy
matplotlib
seaborn
scikit-learn
jupyter
flask
joblib
```

The complete dependency list is available in:



```
requirements.txt
```

---

# 🔍 Key Findings

1.  Total financial transactions analyzed: **9,802**. 
2.  Total revenue was approximately **₹993.38M**. 
3.  Total expense was approximately **₹1.64B**. 
4.  Expenses increased from **₹244.92M in 2021** to **₹429.15M in 2025**. 
5.  Operations and IT were the highest-spending departments. 
6.  Procurement was the largest expense category. 
7.  2025 expense exceeded its budget by approximately **₹19.58M**. 
8.  Gradient Boosting performed best among the tested forecasting models. 
9.  Forecasted 2026 expense is approximately **₹490.87M**. 
10.  Isolation Forest identified **197 potential anomalies**. 
11.  The anomaly detector achieved an F1-score of **36.73%** against the reference labels. 
12.  Power BI and Flask provide complementary interfaces for financial insights. 

---

# ⚠️ Limitations

1.  The financial dataset is synthetically generated. 
2.  The dataset does not represent live SAP S/4HANA production data. 
3.  The monthly forecasting dataset contains only 60 months, with 36 training observations after feature engineering. 
4.  Forecasting performance may change with larger real-world datasets. 
5.  Isolation Forest detects statistical irregularities and does not establish fraud. 
6.  Anomaly detection performance can be improved with additional domain-specific features. 
7.  SAP integration is represented through enterprise concepts rather than a live transactional integration. 

---

# 🚀 Future Scope

Future improvements can include:

-  Integration with real SAP S/4HANA financial data 
-  Automated data extraction pipelines 
-  Real-time financial monitoring 
-  Advanced time-series forecasting 
-  Additional Machine Learning models 
-  Improved anomaly detection using domain rules and advanced ML 
-  Explainable AI for financial predictions 
-  Automated financial alerts 
-  Role-based access for the web application 
-  More detailed Power BI reports 
-  Cloud deployment 
-  Automated model retraining 
-  Financial risk prediction 

---

# 👥 Project Team

This is a **team-based major project**.

| Name | Responsibility |
| -------- | ------------------ |
| Kalavalapalli Venkata Sesha Satyanarayana                 | `Project Lead & Coordinator` |
| Kandala Vineetha                | `Data Analysis & Research` |
| Katta Udaya Lakshmi                 | `Machine Learning & Model Evaluation` |
| Kukkala Dileep Babu                 | `Business Intelligence & Visualization` |
| Pinishetty Srinivas                 | `Application Development & Testing` |

---

# 🎓 Academic Information

**Project Type:** Final-Year Project

**Domain:** Data Science, Machine Learning, Financial Analytics

**Enterprise Context:** SAP S/4HANA FICO

**Primary Technologies:** Python, Machine Learning, Power BI, Flask

**Institution:** `Malla Reddy Engineering College`

**Department:** Computer Science and Engineering - Data Science

**Academic Year:** `2026 - 2027`

---

# 📁 Important Files

| File | Purpose |
| ---------------------------------------------- | --------------------------------- |
| `app.py`                                       | Flask backend and API routes      |
| `financial_transactions.csv`                   | Raw financial dataset             |
| `final_financial_data.csv`                     | Final processed dataset           |
| `forecasting_model_comparison.csv`             | Forecasting model evaluation      |
| `expense_forecast_2026.csv`                    | 2026 forecast results             |
| `anomaly_detection_results.csv`                | Transaction-level anomaly results |
| `AI_Driven_Financial_Analytics_Dashboard.pbix` | Power BI dashboard                |
| `requirements.txt`                             | Python dependencies               |

---

# 📌 Conclusion

The project demonstrates how **Data Science and Machine Learning can be applied to enterprise-style financial data within an SAP FICO context**.

The system performs the complete analytical workflow:



```
Data Collection
      ↓
Data Preprocessing
      ↓
Exploratory Data Analysis
      ↓
Feature Engineering
      ↓
Financial Analytics
      ↓
Machine Learning
      ↓
Forecasting + Anomaly Detection
      ↓
Power BI + Flask
      ↓
Financial Insights
      ↓
Decision Support
```

The project combines **enterprise financial concepts, Data Science, Machine Learning, Business Intelligence, and web development** into an end-to-end financial analytics solution.

---

## ⭐ Project Highlights

-  📊 **9,802** financial transactions analyzed 
-  💰 **₹993.38M** revenue analyzed 
-  💸 **₹1.64B** expense analyzed 
-  📈 **2026 expense forecasting** 
-  🤖 **Gradient Boosting** forecasting model 
-  🚨 **Isolation Forest** anomaly detection 
-  📊 **Power BI** financial dashboard 
-  🌐 **Flask** web application 
-  🏢 **SAP S/4HANA FICO** enterprise context 
-  🧠 End-to-end **Data Science pipeline** 

---

## 📜 License

This project is developed for **academic and educational purposes**.

