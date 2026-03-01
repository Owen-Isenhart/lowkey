#include <iostream>
#include <string>
#include "taguchi.hpp"

// Placeholder function headers for your other sandbox features
void run_cost_calculator(const std::string& file) { std::cout << "Calculating cost for " << file << "...\n"; }
void run_nutrition_generator(const std::string& file) { std::cout << "Generating label for " << file << "...\n"; }
void run_ledger() { std::cout << "Opening Ledger...\n"; }

void print_help() {
    std::cout << "Lowkey Internal Sandbox Tool\n";
    std::cout << "Usage: sandbox [command] [args...]\n\n";
    std::cout << "Commands:\n";
    std::cout << "  taguchi                  Run the Taguchi L9 array calculator\n";
    std::cout << "  cost [recipe.json]       Run the cost-per-ounce calculator\n";
    std::cout << "  nutrition [recipe.json]  Generate a nutritional label\n";
    std::cout << "  ledger                   Open the iteration ledger\n";
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        print_help();
        return 1;
    }

    std::string command = argv[1];

    if (command == "taguchi") {
        lowkey::run_L9_analysis();
    } else if (command == "cost") {
        if (argc < 3) {
            std::cerr << "Error: cost calculator requires a recipe json file.\n";
            return 1;
        }
        run_cost_calculator(argv[2]);
    } else if (command == "nutrition") {
        if (argc < 3) {
             std::cerr << "Error: nutrition generator requires a recipe json file.\n";
             return 1;
        }
        run_nutrition_generator(argv[2]);
    } else if (command == "ledger") {
        run_ledger();
    } else {
        std::cout << "Unknown command: " << command << "\n";
        print_help();
        return 1;
    }

    return 0;
}