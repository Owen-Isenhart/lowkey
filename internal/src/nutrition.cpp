#include "nutrition.hpp"
#include <iostream>
#include <fstream>
#include <nlohmann/json.hpp>
#include <iomanip>

using json = nlohmann::json;

void run_nutrition_generator(const std::string& recipe_file) {
    std::cout << "--- Nutritional Label Generator ---\n";
    std::cout << "Reading recipe from: " << recipe_file << "\n";

    std::ifstream f(recipe_file);
    if (!f.is_open()) {
        std::cerr << "Error: Could not open recipe file " << recipe_file << "\n";
        return;
    }

    try {
        json data = json::parse(f);
        
        std::cout << "\n===================================\n";
        std::cout << "         Nutrition Facts\n";
        std::cout << "===================================\n";
        std::cout << "Recipe Name: " << data.value("name", "Unknown") << "\n";
        std::cout << "Version: " << data.value("version", "Unknown") << "\n";
        std::cout << "Serving Size: " << data.value("total_volume_oz", 0.0) << " fl oz\n";
        std::cout << "===================================\n";

        double total_calories = 0.0;
        double total_carbs = 0.0;
        double total_sugar = 0.0;
        double total_sodium = 0.0;

        if (data.contains("ingredients") && data["ingredients"].is_array()) {
            for (const auto& ing : data["ingredients"]) {
                double amount = ing.value("amount", 0.0);
                std::string unit = ing.value("unit", "units");
                
                // Assuming nutrition is provided per 100g, and amounts are in mg/g
                // Let's normalize amount to grams for calculation if it is in mg
                double amount_in_g = amount;
                if (unit == "mg") {
                    amount_in_g = amount / 1000.0;
                }

                if (ing.contains("nutrition_per_100g")) {
                    auto nut = ing["nutrition_per_100g"];
                    
                    // Ratio of this ingredient relative to 100g
                    double ratio = amount_in_g / 100.0;

                    total_calories += nut.value("calories", 0.0) * ratio;
                    total_carbs += nut.value("carbs_g", 0.0) * ratio;
                    total_sugar += nut.value("sugar_g", 0.0) * ratio;
                    total_sodium += nut.value("sodium_mg", 0.0) * ratio;
                }
            }
        }

        std::cout << std::fixed << std::setprecision(1);
        std::cout << "Calories: " << total_calories << " kcal\n";
        std::cout << "-----------------------------------\n";
        std::cout << "Total Carbohydrate: " << total_carbs << " g\n";
        std::cout << "  Total Sugars: " << total_sugar << " g\n";
        std::cout << "Sodium: " << total_sodium << " mg\n";
        std::cout << "===================================\n";

    } catch (const json::exception& e) {
        std::cerr << "JSON Parsing Error: " << e.what() << "\n";
    }
}
