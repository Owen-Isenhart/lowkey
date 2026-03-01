#include "imgui.h"
#include <vector>
#include <string>
#include <algorithm>
#include <iostream>
#include <fstream>
#include <filesystem>
#include <sstream>
#include <ctime>
#include <iomanip>
#include <cstring>

namespace fs = std::filesystem;

struct Factor {
    char name[64];
    char levels[3][64];
    
    Factor() {
        memset(name, 0, sizeof(name));
        memset(levels, 0, sizeof(levels));
        strcpy(name, "New Ingredient");
        strcpy(levels[0], "Low");
        strcpy(levels[1], "Med");
        strcpy(levels[2], "High");
    }
};

// --- Core Math for Dynamic Orthogonal Arrays ---
int GetTrialCount(int num_factors) {
    if (num_factors <= 4) return 9;
    if (num_factors <= 13) return 27;
    return 0; // Out of bounds for this 3-level tool
}

std::vector<std::vector<int>> GenerateOA(int num_factors) {
    int trials = GetTrialCount(num_factors);
    std::vector<std::vector<int>> matrix(trials, std::vector<int>(num_factors, 0));

    if (trials == 9) {
        // Standard L9 Orthogonal Array
        const int L9[9][4] = {
            {0,0,0,0}, {0,1,1,1}, {0,2,2,2},
            {1,0,1,2}, {1,1,2,0}, {1,2,0,1},
            {2,0,2,1}, {2,1,0,2}, {2,2,1,0}
        };
        for (int i = 0; i < 9; ++i) {
            for (int j = 0; j < num_factors; ++j) {
                matrix[i][j] = L9[i][j];
            }
        }
    } else if (trials == 27) {
        // Dynamic generation of an L27 (3^13) Orthogonal Array using GF(3) modulo arithmetic
        for (int i = 0; i < 27; ++i) {
            int c1 = i / 9;
            int c2 = (i / 3) % 3;
            int c3 = i % 3;
            
            std::vector<int> cols(13);
            cols[0] = c1;
            cols[1] = c2;
            cols[2] = c3;
            cols[3] = (c1 + c2) % 3;
            cols[4] = (c1 + 2 * c2) % 3;
            cols[5] = (c1 + c3) % 3;
            cols[6] = (c1 + 2 * c3) % 3;
            cols[7] = (c2 + c3) % 3;
            cols[8] = (c2 + 2 * c3) % 3;
            cols[9] = (c1 + c2 + c3) % 3;
            cols[10] = (c1 + c2 + 2 * c3) % 3;
            cols[11] = (c1 + 2 * c2 + c3) % 3;
            cols[12] = (c1 + 2 * c2 + 2 * c3) % 3;

            for (int j = 0; j < num_factors; ++j) {
                matrix[i][j] = cols[j];
            }
        }
    }
    return matrix;
}

// Helper: Split CSV line by commas
std::vector<std::string> SplitCSVLine(const std::string& line) {
    std::vector<std::string> result;
    std::stringstream ss(line);
    std::string item;
    while (std::getline(ss, item, ',')) {
        result.push_back(item);
    }
    return result;
}

// Helper: Dynamic CSV Loader
void LoadCSVData(const std::string& filepath, std::vector<Factor>& factors, std::vector<float>& scores) {
    std::ifstream file(filepath);
    if (!file.is_open()) return;
    
    std::string line;
    if (!std::getline(file, line)) return; // Read header
    
    auto headers = SplitCSVLine(line);
    if (headers.size() < 4) return; // Min required columns: Timestamp, Trial_Num, Factor1, Score

    int num_factors = headers.size() - 3;
    factors.resize(num_factors);
    
    for (int i = 0; i < num_factors; ++i) {
        strncpy(factors[i].name, headers[2 + i].c_str(), 63);
    }

    int expected_trials = GetTrialCount(num_factors);
    scores.assign(expected_trials, 0.0f);
    auto matrix = GenerateOA(num_factors);

    std::vector<std::string> all_lines;
    while (std::getline(file, line)) {
        if (!line.empty()) all_lines.push_back(line);
    }

    // Grab the most recent batch of trials
    int start_idx = std::max(0, (int)all_lines.size() - expected_trials);
    int score_idx = 0;
    
    for (int i = start_idx; i < all_lines.size() && score_idx < expected_trials; ++i) {
        auto cols = SplitCSVLine(all_lines[i]);
        if (cols.size() >= 3 + num_factors) {
            for(int f = 0; f < num_factors; f++) {
                int level_idx = matrix[score_idx][f];
                strncpy(factors[f].levels[level_idx], cols[2 + f].c_str(), 63);
            }
            try {
                scores[score_idx] = std::stof(cols.back());
            } catch (...) {
                scores[score_idx] = 0.0f;
            }
        }
        score_idx++;
    }
}

void RenderTaguchiTool() {
    ImGui::SetNextWindowPos(ImVec2(20, 20), ImGuiCond_FirstUseEver);
    ImGui::SetNextWindowSize(ImVec2(1400, 500), ImGuiCond_FirstUseEver);
    ImGui::Begin("Taguchi Optimizer (Dynamic)");

    static std::vector<Factor> factors(4);
    static bool first_run = true;
    if (first_run) {
        strcpy(factors[0].name, "L-Theanine");
        strcpy(factors[0].levels[0], "100mg"); strcpy(factors[0].levels[1], "200mg"); strcpy(factors[0].levels[2], "400mg");
        strcpy(factors[1].name, "L-Tyrosine");
        strcpy(factors[1].levels[0], "250mg"); strcpy(factors[1].levels[1], "500mg"); strcpy(factors[1].levels[2], "1000mg");
        strcpy(factors[2].name, "Magnesium");
        strcpy(factors[2].levels[0], "50mg");  strcpy(factors[2].levels[1], "150mg"); strcpy(factors[2].levels[2], "300mg");
        strcpy(factors[3].name, "Citric Acid");
        strcpy(factors[3].levels[0], "0.5g");  strcpy(factors[3].levels[1], "1.0g");  strcpy(factors[3].levels[2], "1.5g");
        first_run = false;
    }

    int initial_trials = GetTrialCount(factors.size());
    static std::vector<float> scores;
    if (scores.size() != initial_trials) {
        scores.resize(initial_trials, 0.0f);
    }
    
    // Directory Management
    std::string dir_path = "../results/taguchi";
    std::error_code ec;
    if (!fs::exists(dir_path, ec)) {
        fs::create_directories(dir_path, ec);
    }

    static std::string current_csv = "";
    static char new_csv_name[128] = "";
    static std::vector<std::string> csv_files;
    static bool init_csvs = false;

    auto refresh_csvs = [&]() {
        csv_files.clear();
        if (fs::exists(dir_path)) {
            for (const auto& entry : fs::directory_iterator(dir_path)) {
                if (entry.path().extension() == ".csv") {
                    csv_files.push_back(entry.path().filename().string());
                }
            }
        }
    };

    if (!init_csvs) { refresh_csvs(); init_csvs = true; }

    // --- CSV Management UI ---
    ImGui::Text("Data Management");
    if (ImGui::BeginCombo("Existing CSVs", current_csv.empty() ? "--- Select ---" : current_csv.c_str())) {
        for (const auto& f : csv_files) {
            bool is_selected = (current_csv == f);
            if (ImGui::Selectable(f.c_str(), is_selected)) {
                current_csv = f;
                LoadCSVData(dir_path + "/" + current_csv, factors, scores);
            }
            if (is_selected) ImGui::SetItemDefaultFocus();
        }
        ImGui::EndCombo();
    }
    ImGui::SameLine();
    if (ImGui::Button("Refresh")) refresh_csvs();

    ImGui::InputText("New CSV Name", new_csv_name, IM_ARRAYSIZE(new_csv_name));
    ImGui::SameLine();
    if (ImGui::Button("Create / Select")) {
        std::string name(new_csv_name);
        if (!name.empty()) {
            if (name.find(".csv") == std::string::npos) name += ".csv";
            current_csv = name;
            LoadCSVData(dir_path + "/" + current_csv, factors, scores);
            refresh_csvs();
        }
    }
    if (!current_csv.empty()) {
        ImGui::TextColored(ImVec4(0.2f, 1.0f, 0.2f, 1.0f), "Active File: %s", current_csv.c_str());
    }

    ImGui::Separator();

    // --- Factor Editor UI ---
    ImGui::Text("Factor Configuration");
    ImGui::SameLine();
    if (ImGui::Button("+ Add Ingredient") && factors.size() < 13) {
        factors.push_back(Factor());
    }
    ImGui::SameLine();
    if (ImGui::Button("- Remove Ingredient") && factors.size() > 1) {
        factors.pop_back();
    }
    ImGui::SameLine(); ImGui::TextColored(ImVec4(0.5f, 0.5f, 0.5f, 1.0f), "(Count: %zu | Max: 13)", factors.size());

    // CRITICAL FIX: Recalculate trials immediately after factors size changes
    int current_trials = GetTrialCount(factors.size());
    if (scores.size() != current_trials) {
        scores.resize(current_trials, 0.0f);
    }

    if (ImGui::BeginTable("FactorTable", 4, ImGuiTableFlags_Borders | ImGuiTableFlags_SizingStretchSame | ImGuiTableFlags_ScrollY, ImVec2(0, 150))) {
        ImGui::TableSetupColumn("Factor Name");
        ImGui::TableSetupColumn("Level 1");
        ImGui::TableSetupColumn("Level 2");
        ImGui::TableSetupColumn("Level 3");
        ImGui::TableHeadersRow();

        for (int i = 0; i < factors.size(); i++) {
            ImGui::TableNextRow();
            ImGui::TableSetColumnIndex(0);
            ImGui::PushID(i * 10 + 0); ImGui::InputText("##name", factors[i].name, 64); ImGui::PopID();
            
            for (int l = 0; l < 3; l++) {
                ImGui::TableSetColumnIndex(l + 1);
                ImGui::PushID(i * 10 + l + 1); ImGui::InputText("##lvl", factors[i].levels[l], 64); ImGui::PopID();
            }
        }
        ImGui::EndTable();
    }

    ImGui::Separator();

    // --- Dynamic Matrix Execution & Scoring ---
    auto matrix = GenerateOA(factors.size());
    
    ImGui::Text("Batch Execution & Scoring (%d Trials Mode)", current_trials);
    if (ImGui::BeginTable("Trials", factors.size() + 2, ImGuiTableFlags_Borders | ImGuiTableFlags_RowBg | ImGuiTableFlags_ScrollY | ImGuiTableFlags_ScrollX, ImVec2(0, 200))) {
        ImGui::TableSetupColumn("Batch");
        for (int i = 0; i < factors.size(); i++) ImGui::TableSetupColumn(factors[i].name);
        ImGui::TableSetupColumn("Score (1-10)");
        ImGui::TableHeadersRow();

        for (int i = 0; i < current_trials; i++) {
            ImGui::TableNextRow();
            ImGui::TableSetColumnIndex(0); ImGui::Text("#%d", i + 1);
            
            for (int j = 0; j < factors.size(); j++) {
                ImGui::TableSetColumnIndex(j + 1);
                ImGui::Text("%s", factors[j].levels[matrix[i][j]]);
            }
            
            ImGui::TableSetColumnIndex(factors.size() + 1);
            ImGui::PushID(i);
            ImGui::SetNextItemWidth(100);
            ImGui::InputFloat("##score", &scores[i], 0.5f, 1.0f, "%.1f");
            ImGui::PopID();
        }
        ImGui::EndTable();
    }

    // --- CSV Export Logic ---
    if (ImGui::Button("Export / Append to CSV")) {
        if (current_csv.empty()) current_csv = "default_experiment.csv";
        std::string filepath = dir_path + "/" + current_csv;
        bool is_new = !fs::exists(filepath);
        
        std::ofstream file(filepath, std::ios::app);
        if (file.is_open()) {
            if (is_new) {
                file << "Timestamp,Trial_Num,";
                for (int j = 0; j < factors.size(); j++) file << factors[j].name << ",";
                file << "Score\n";
            }
            
            auto now = std::time(nullptr);
            auto tm = *std::localtime(&now);
            
            for (int i = 0; i < current_trials; ++i) {
                file << std::put_time(&tm, "%Y-%m-%d %H:%M:%S") << "," << (i + 1) << ",";
                for (int j = 0; j < factors.size(); ++j) {
                    file << factors[j].levels[matrix[i][j]] << ",";
                }
                file << scores[i] << "\n";
            }
            refresh_csvs();
        }
    }

    ImGui::Separator();

    // --- Dynamic Analysis ---
    ImGui::Text("Mean Response Analysis");
    if (ImGui::BeginChild("AnalysisRegion", ImVec2(0, 0), true)) {
        for (int f = 0; f < factors.size(); ++f) {
            float level_means[3] = {0, 0, 0};
            float level_counts[3] = {0, 0, 0};
            
            for (int t = 0; t < current_trials; ++t) {
                int lvl = matrix[t][f];
                level_means[lvl] += scores[t];
                level_counts[lvl]++;
            }
            
            for (int i = 0; i < 3; ++i) {
                if (level_counts[i] > 0) level_means[i] /= level_counts[i];
            }

            float max_val = std::max({level_means[0], level_means[1], level_means[2]});
            float min_val = std::min({level_means[0], level_means[1], level_means[2]});
            
            ImGui::Text("%s (Delta: %.2f)", factors[f].name, max_val - min_val);
            ImGui::Text("  L1: %.2f | L2: %.2f | L3: %.2f", level_means[0], level_means[1], level_means[2]);
            ImGui::Spacing();
        }
    }
    ImGui::EndChild();

    ImGui::End();
}