# Recipe Inspector

The **Recipe Inspector** provides automatic calculation of cost per ounce and nutritional data based on JSON recipe files.

## Loading a Recipe

1. Open the **Recipe Inspector** window in the `lowkey_sandbox` application.
2. Enter the name of the recipe in the **Recipe Name** input field. (e.g., `STABLE`).
   - The `.json` extension is automatically appended if omitted.
3. Click **Load Recipe**.
   - The tool will attempt to load the file from the `recipes/` directory at the project root. If successful, the details will populate the table.
   - If unsuccessful, an error message (colored red) will indicate whether it was a JSON parse error or a missing file error.

## Understanding the Output

When a recipe is successfully loaded, the interface displays:
- **Header info:** Recipe Name, Version, and Total Volume (in oz).
- **Ingredients Table:**
  - **Ingredient Name:** The component added to the drink.
  - **Amount:** The amount to use (e.g., `3.00 g`).
  - **Cost:** The prorated cost of that ingredient based on its bulk price.
  - **Cals:** The calculated calories for the added amount, derived from generic `nutrition_per_100g` data.
- **Totals:**
  - **Total Cost:** Displayed as total dollars and dollars per ounce ($/oz).
  - **Total Calories:** The combined caloric content in kcal.

## JSON Recipe Format

For the tool to correctly parse your recipe, the JSON file must follow this structure:

```json
{
    "name": "Recipe Name",
    "version": "v1.0.0",
    "total_volume_oz": 12.0,
    "ingredients": [
        {
            "name": "Ingredient 1",
            "amount": 2.5,
            "unit": "g",
            "bulk_amount": 1000.0,
            "cost_per_bulk": 45.99,
            "nutrition_per_100g": {
                "calories": 350.0
            }
        }
    ]
}
```

### Key Fields:
- `total_volume_oz`: Critical for calculating the final cost per ounce.
- `bulk_amount` and `cost_per_bulk`: Used together to determine unit cost. The math is `(cost_per_bulk / bulk_amount) * amount`.
- `nutrition_per_100g.calories`: An optional block. If provided, calories are calculated as `(amount / 100.0) * calories_per_100g`.
