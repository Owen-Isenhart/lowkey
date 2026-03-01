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

namespace fs = std::filesystem;

// Switched to char arrays so ImGui can natively edit them
struct Factor {
    char name[64];
    char levels[3][64];
};

static const int L9[9][4] = {
    {0,0,0,0}, {0,1,1,1}, {0,2,2,2},
    {1,0,1,2}, {1,1,2,0}, {1,2,0,1},
    {2,0,2,1}, {2,1,0,2}, {2,2,1,0}
};

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

// Helper: Read a CSV and load the most recent 9 iterations and factor names
void LoadCSVData(const std::string& filepath, Factor factors[4], float scores[9]) {
    std::ifstream file(filepath);
    if (!file.is_open()) return;
    
    std::string line;
    if (!std::getline(file, line)) return; // Read header
    
    auto headers = SplitCSVLine(line);
    if (headers.size() >= 6) {
        strncpy(factors[0].name, headers[2].c_str(), 63);
        strncpy(factors[1].name, headers[3].c_str(), 63);
        strncpy(factors[2].name, headers[4].c_str(), 63);
        strncpy(factors[3].name, headers[5].c_str(), 63);
    }

    std::vector<std::string> all_lines;
    while (std::getline(file, line)) {
        if (!line.empty()) all_lines.push_back(line);
    }

    // Grab the last 9 rows (the most recent iteration batch)
    int start_idx = std::max(0, (int)all_lines.size() - 9);
    int score_idx = 0;
    
    for (int i = start_idx; i < all_lines.size() && score_idx < 9; ++i) {
        auto cols = SplitCSVLine(all_lines[i]);
        if (cols.size() >= 7) {
            // Re-sync UI levels using the L9 array mapping structure
            for(int f = 0; f < 4; f++) {
                int level_idx = L9[score_idx][f];
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
    ImGui::Begin("Taguchi L9 Optimizer");

    // Default configuration
    static Factor factors[4] = {
        {"L-Theanine",  {"100mg", "200mg", "400mg"}},
        {"L-Tyrosine",  {"250mg", "500mg", "1000mg"}},
        {"Magnesium",   {"50mg",  "150mg", "300mg"}},
        {"Citric Acid", {"0.5g",  "1.0g",  "1.5g"}}
    };

    static float scores[9] = {0.0f};
    
    // Directory Management
    std::string dir_path = "../csvs";
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

    if (!init_csvs) {
        refresh_csvs();
        init_csvs = true;
    }

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
    if (ImGui::BeginTable("FactorTable", 4, ImGuiTableFlags_Borders | ImGuiTableFlags_SizingStretchSame)) {
        ImGui::TableSetupColumn("Factor Name");
        ImGui::TableSetupColumn("Level 1");
        ImGui::TableSetupColumn("Level 2");
        ImGui::TableSetupColumn("Level 3");
        ImGui::TableHeadersRow();

        for (int i = 0; i < 4; i++) {
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

    // --- L9 Matrix & Scoring ---
    ImGui::Text("Batch Execution & Scoring");
    if (ImGui::BeginTable("L9 Trials", 6, ImGuiTableFlags_Borders | ImGuiTableFlags_RowBg)) {
        ImGui::TableSetupColumn("Batch");
        for (int i=0; i<4; i++) ImGui::TableSetupColumn(factors[i].name);
        ImGui::TableSetupColumn("Score (1-10)");
        ImGui::TableHeadersRow();

        for (int i = 0; i < 9; i++) {
            ImGui::TableNextRow();
            ImGui::TableSetColumnIndex(0); ImGui::Text("#%d", i + 1);
            
            for (int j = 0; j < 4; j++) {
                ImGui::TableSetColumnIndex(j + 1);
                ImGui::Text("%s", factors[j].levels[L9[i][j]]);
            }
            
            ImGui::TableSetColumnIndex(5);
            ImGui::PushID(i);
            ImGui::SetNextItemWidth(100);
            ImGui::InputFloat("##score", &scores[i], 0.5f, 1.0f, "%.1f");
            ImGui::PopID();
        }
        ImGui::EndTable();
    }

    // --- CSV Export Logic ---
    if (ImGui::Button("Export / Append to CSV")) {
        if (current_csv.empty()) {
            current_csv = "default_experiment.csv";
        }
        std::string filepath = dir_path + "/" + current_csv;
        bool is_new = !fs::exists(filepath);
        
        std::ofstream file(filepath, std::ios::app);
        if (file.is_open()) {
            if (is_new) {
                file << "Timestamp,Trial_Num," 
                     << factors[0].name << "," << factors[1].name << "," 
                     << factors[2].name << "," << factors[3].name << ",Score\n";
            }
            
            auto now = std::time(nullptr);
            auto tm = *std::localtime(&now);
            
            for (int i = 0; i < 9; ++i) {
                file << std::put_time(&tm, "%Y-%m-%d %H:%M:%S") << "," << (i + 1) << ",";
                for (int j = 0; j < 4; ++j) {
                    file << factors[j].levels[L9[i][j]] << ",";
                }
                file << scores[i] << "\n";
            }
            refresh_csvs(); // Ensure the file shows up in the combo box if it was new
        }
    }

    ImGui::Separator();

    // --- Analysis ---
    ImGui::Text("Mean Response Analysis");
    for (int f = 0; f < 4; ++f) {
        float level_means[3] = {0, 0, 0};
        for (int t = 0; t < 9; ++t) level_means[L9[t][f]] += scores[t];
        for (int i = 0; i < 3; ++i) level_means[i] /= 3.0f;

        float max_val = std::max({level_means[0], level_means[1], level_means[2]});
        float min_val = std::min({level_means[0], level_means[1], level_means[2]});
        
        ImGui::Text("%s (Delta: %.2f)", factors[f].name, max_val - min_val);
        ImGui::Text("  L1: %.2f | L2: %.2f | L3: %.2f", level_means[0], level_means[1], level_means[2]);
    }

    ImGui::End();
}