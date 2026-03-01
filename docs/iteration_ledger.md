# Iteration Ledger

The **Iteration Ledger** is a lightweight logging tool meant to document subjective feedback and notes across different formulation versions.

## How to Use

1. **Version Field:** Enter the current version of the recipe you are testing (e.g., `v1.0.1` or `STABLE-v2`).
2. **Notes Field:** Enter free-form feedback regarding the recipe (e.g., "Too tart, needs less citric acid" or "Perfect balance of earthy tones").
3. **Add Feedback Button:** Click to commit the version and notes to the ledger.

## Data Storage

The tool appends the submitted feedback to a plain text file located at `results/ledger/ledger.txt` (relative to the `internal/` directory). 

The logged entries appear in the UI's scrollable region below the input fields, allowing you to review historical notes while iterating on new versions.
