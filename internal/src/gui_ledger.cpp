#include "imgui.h"
#include <fstream>
#include <string>
#include <vector>
#include <filesystem>

namespace fs = std::filesystem;

void RenderLedgerTool() {
    ImGui::SetNextWindowPos(ImVec2(820, 540), ImGuiCond_FirstUseEver);
    ImGui::SetNextWindowSize(ImVec2(600, 340), ImGuiCond_FirstUseEver);
    ImGui::Begin("Iteration Ledger");

    static char version[64] = "v1.0.x";
    static char notes[256] = "";
    static std::vector<std::string> log_entries;
    static bool loaded = false;

    std::string dir_path = "../results/ledger";
    std::string filepath = dir_path + "/ledger.txt";

    // Load existing entries once
    if (!loaded) {
        std::error_code ec;
        if (!fs::exists(dir_path, ec)) {
            fs::create_directories(dir_path, ec);
        }

        std::ifstream f(filepath);
        std::string line;
        if (f.is_open()) {
            while (std::getline(f, line)) {
                log_entries.push_back(line);
            }
        }
        loaded = true;
    }

    ImGui::InputText("Version", version, IM_ARRAYSIZE(version));
    ImGui::InputText("Notes", notes, IM_ARRAYSIZE(notes));

    if (ImGui::Button("Add Feedback")) {
        std::string entry = "Version: " + std::string(version) + " | Notes: " + std::string(notes);
        log_entries.push_back(entry);
        
        std::ofstream f(filepath, std::ios::app);
        f << entry << "\n";
        
        notes[0] = '\0'; // Clear input
    }

    ImGui::Separator();
    ImGui::BeginChild("LogRegion", ImVec2(0, 0), true);
    for (const auto& entry : log_entries) {
        ImGui::TextWrapped("%s", entry.c_str());
    }
    ImGui::EndChild();

    ImGui::End();
}