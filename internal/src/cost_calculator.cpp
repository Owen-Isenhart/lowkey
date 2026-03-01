#include "cost_calculator.hpp"
#include <iostream>
#include <fstream>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

void run_cost_calculator(const std::string& recipe_file) {
    std::cout << "--- Cost-per-Ounce Calculator ---\n";
    std::cout << "Reading recipe from: " << recipe_file << "\n";

    std::ifstream f(recipe_file);
    if (!f.is_open()) {
        std::cerr << "Error: Could not open recipe file " << recipe_file << "\n";
        return;
    }

    try {
        json data = json::parse(f);
        double total_volume_oz = data.value("total_volume_oz", 0.0);
        
        if (total_volume_oz <= 0.0) {
             std::cerr << "Error: Invalid total_volume_oz in recipe.\n";
             return;
        }

        std::cout << "Recipe Name: " << data.value("name", "Unknown") << "\n";
        std::cout << "Version: " << data.value("version", "Unknown") << "\n";
        std::cout << "Total Volume: " << total_volume_oz << " oz\n\n";

        double total_cost = 0.0;
        
        if (data.contains("ingredients") && data["ingredients"].is_array()) {
            for (const auto& ing : data["ingredients"]) {
                std::string name = ing.value("name", "Unknown Ingredient");
                double amount = ing.value("amount", 0.0);
                std::string unit = ing.value("unit", "units");
                
                double cost_per_bulk = ing.value("cost_per_bulk", 0.0);
                double bulk_amount = ing.value("bulk_amount", 1.0); // Avoid division by zero
                
                double cost_per_unit = cost_per_bulk / bulk_amount;
                double ingredient_cost = cost_per_unit * amount;
                
                total_cost += ingredient_cost;

                std::cout << "- " << name << ": " << amount << " " << unit << " -> $" << ingredient_cost << "\n";
            }
        }

        double cost_per_ounce = total_cost / total_volume_oz;

        std::cout << "\n-----------------------------------\n";
        std::cout << "Total Recipe Cost: $" << total_cost << "\n";
        std::cout << "Cost Per Ounce:    $" << cost_per_ounce << " / oz\n";
        std::cout << "-----------------------------------\n";

    } catch (const json::exception& e) {
        std::cerr << "JSON Parsing Error: " << e.what() << "\n";
    }
}
