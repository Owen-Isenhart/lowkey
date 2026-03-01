#include "imgui.h"
#include <fstream>
#include <string>
#include <vector>

void RenderLedgerTool() {
    ImGui::SetNextWindowPos(ImVec2(820, 540), ImGuiCond_FirstUseEver);
    ImGui::SetNextWindowSize(ImVec2(600, 340), ImGuiCond_FirstUseEver);
    ImGui::Begin("Iteration Ledger");

    static char version[64] = "v1.0.x";
    static char notes[256] = "";
    static std::vector<std::string> log_entries;
    static bool loaded = false;

    // Load existing entries once
    if (!loaded) {
        std::ifstream f("ledger.txt");
        std::string line;
        while (std::getline(f, line)) {
            log_entries.push_back(line);
        }
        loaded = true;
    }

    ImGui::InputText("Version", version, IM_ARRAYSIZE(version));
    ImGui::InputText("Notes", notes, IM_ARRAYSIZE(notes));

    if (ImGui::Button("Add Feedback")) {
        std::string entry = "Version: " + std::string(version) + " | Notes: " + std::string(notes);
        log_entries.push_back(entry);
        
        std::ofstream f("ledger.txt", std::ios::app);
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