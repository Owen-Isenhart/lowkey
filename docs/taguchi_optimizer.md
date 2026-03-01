# Taguchi Optimizer

The **Taguchi Optimizer** is a tool to systematically design and analyze beverage formulations using Taguchi Methods. It generates Orthogonal Arrays to minimize the number of trials needed to test multiple ingredients at different levels.

## Features

- **Dynamic Orthogonal Arrays:** Automatically selects an L9 (for 1 to 4 factors) or L27 (for 5 to 13 factors) matrix based on the number of ingredients you are testing.
- **Factor Configuration:** Allows adding up to 13 ingredients with 3 variable levels (e.g., Low, Medium, High).
- **Batch Execution & Scoring:** Provides an interactive table outlining the required experimental trials. Once you test a formulation, you can input a qualitative score (1-10).
- **Mean Response Analysis:** Calculates the average score for each ingredient at each of its three levels to determine the optimal formulation.

## Usage Guide

### 1. Data Management (CSV Files)
The tool saves trials and their scores to CSV files in `results/taguchi`.
- **Load Existing:** Select an existing experiment from the dropdown menu to reload factors and previous scores.
- **Create New:** Type a new name in the **New CSV Name** box and click **Create / Select** to begin a fresh experiment.

### 2. Factor Configuration
Define the variables for your experiment.
- Use **+ Add Ingredient** and **- Remove Ingredient** to set the number of factors (max 13).
- In the table, define the **Factor Name** (e.g., `L-Theanine`).
- Provide specific values for **Level 1**, **Level 2**, and **Level 3** (e.g., `100mg`, `200mg`, `400mg`).

*Note: Changing the number of ingredients automatically recalculates the required number of trials (9 or 27).*

### 3. Batch Execution & Scoring
This section tells you exactly what to mix for each trial.
- **Batch #1, #2, etc.:** Each row is a distinct recipe you need to create according to the levels shown.
- **Score (1-10):** After tasting/testing, enter a subjective score for that trial.

### 4. Mean Response Analysis
As you enter scores, this section updates dynamically.
- It calculates the mean score for every ingredient at every level across all trials.
- **Delta:** The difference between the highest and lowest mean score for a factor, indicating how heavily that ingredient impacts the overall outcome.
- **Goal:** To construct the perfect recipe, select the level string that produced the highest mean score for each ingredient.

### 5. Exporting Data
Click **Export / Append to CSV** to save the current matrix, factors, and scores. This appends a new block of data to the CSV with a timestamp for record-keeping.
