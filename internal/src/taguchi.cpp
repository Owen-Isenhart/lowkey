#include "taguchi.hpp"
#include <iostream>
#include <fstream>
#include <cmath>
#include <iomanip>
#include <algorithm>
#include <filesystem>
#include <ctime>

namespace fs = std::filesystem;

namespace lowkey {

    // Internal helper function to handle the CSV persistence
    void save_to_csv(const std::string& filename, const std::vector<Factor>& factors, const int L9[9][4], const std::vector<double>& scores) {
        bool exists = fs::exists(filename);
        std::ofstream file(filename, std::ios::app);

        if (!exists) {
            // Write CSV Headers if the file is new
            file << "Timestamp,Trial_Num,";
            for (const auto& f : factors) file << f.name << ",";
            file << "Score\n";
        }

        auto now = std::time(nullptr);
        auto tm = *std::localtime(&now);

        for (int i = 0; i < 9; ++i) {
            file << std::put_time(&tm, "%Y-%m-%d %H:%M:%S") << "," << i + 1 << ",";
            for (int j = 0; j < 4; ++j) {
                file << factors[j].levels[L9[i][j]] << ",";
            }
            file << scores[i] << "\n";
        }
        std::cout << "\n[Success] 9 trials appended to " << filename << "\n";
    }

    void run_L9_analysis() {
        std::string csv_file = "lowkey_experiments.csv";
        
        // These are your Independent Variables (Factors) and their 3 Levels
        std::vector<Factor> factors = {
            {"L-Theanine",  {"100mg", "200mg", "400mg"}},
            {"L-Tyrosine",  {"250mg", "500mg", "1000mg"}},
            {"Magnesium",   {"50mg",  "150mg", "300mg"}},
            {"Citric Acid", {"0.5g",  "1.0g",  "1.5g"}}
        };

        // Standard L9 Orthogonal Array Matrix
        const int L9[9][4] = {
            {0,0,0,0}, {0,1,1,1}, {0,2,2,2},
            {1,0,1,2}, {1,1,2,0}, {1,2,0,1},
            {2,0,2,1}, {2,1,0,2}, {2,2,1,0}
        };

        std::vector<double> scores(9);
        std::cout << "--- Lowkey L9 Optimizer: 9 Trials ---\n";

        for (int i = 0; i < 9; ++i) {
            std::cout << "\nBatch #" << i + 1 << " Instructions:\n";
            for (int j = 0; j < 4; ++j) {
                std::cout << "  > " << factors[j].name << ": " << factors[j].levels[L9[i][j]] << "\n";
            }
            std::cout << "Enter Focus/Flavor Score (1-10): ";
            std::cin >> scores[i];
        }

        save_to_csv(csv_file, factors, L9, scores);

        // Analysis: Calculate Mean Response for each Factor level
        std::cout << "\n=== Analysis (Mean Response) ===\n";
        for (int f = 0; f < 4; ++f) {
            double level_means[3] = {0, 0, 0};
            for (int t = 0; t < 9; ++t) level_means[L9[t][f]] += scores[t];
            for (int i = 0; i < 3; ++i) level_means[i] /= 3.0;

            double delta = std::max({level_means[0], level_means[1], level_means[2]}) - 
                           std::min({level_means[0], level_means[1], level_means[2]});

            std::cout << std::left << std::setw(15) << factors[f].name 
                      << " | Delta: " << std::fixed << std::setprecision(2) << delta << "\n";
            std::cout << "  L1: " << level_means[0] << " | L2: " << level_means[1] << " | L3: " << level_means[2] << "\n\n";
        }
    }
} // namespace lowkey