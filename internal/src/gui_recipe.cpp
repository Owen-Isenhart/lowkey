#include "imgui.h"
#include <nlohmann/json.hpp>
#include <fstream>
#include <string>

using json = nlohmann::json;

void RenderRecipeTool() {
    // Set default position and size (Left side of a 1280x720 window)
    ImGui::SetNextWindowPos(ImVec2(20, 540), ImGuiCond_FirstUseEver);
    ImGui::SetNextWindowSize(ImVec2(780, 340), ImGuiCond_FirstUseEver);

    ImGui::Begin("Recipe Inspector (Cost & Nutrition)");

    // Just require the name now, default to "STABLE"
    static char recipe_name[256] = "STABLE";
    ImGui::InputText("Recipe Name", recipe_name, IM_ARRAYSIZE(recipe_name));

    static json recipe_data;
    static std::string error_msg;
    static bool loaded = false;

    if (ImGui::Button("Load Recipe")) {
        std::string filename(recipe_name);
        
        // Auto-append .json if the user forgot it
        if (filename.find(".json") == std::string::npos) {
            filename += ".json";
        }

        // Smart Pathing: Check both common execution directories
        std::string path_from_build = "../../recipes/" + filename;
        std::string path_from_internal = "../recipes/" + filename;
        
        std::ifstream f(path_from_build);
        if (!f.is_open()) {
            f.open(path_from_internal); // Fallback
        }

        if (f.is_open()) {
            try {
                recipe_data = json::parse(f);
                loaded = true;
                error_msg = "";
            } catch (const json::exception& e) {
                error_msg = std::string("JSON Parse Error: ") + e.what();
                loaded = false;
            }
        } else {
            error_msg = "Could not find file: " + filename;
            loaded = false;
        }
    }

    if (!error_msg.empty()) {
        ImGui::TextColored(ImVec4(1, 0.2f, 0.2f, 1), "%s", error_msg.c_str());
    }

    if (loaded) {
        ImGui::Separator();
        ImGui::Text("Recipe: %s (%s)", 
            recipe_data.value("name", "Unknown").c_str(), 
            recipe_data.value("version", "Unknown").c_str());
        
        double total_volume = recipe_data.value("total_volume_oz", 0.0);
        ImGui::Text("Volume: %.2f oz", total_volume);

        double total_cost = 0.0;
        double total_calories = 0.0;
        
        if (ImGui::BeginTable("Ingredients", 4, ImGuiTableFlags_Borders | ImGuiTableFlags_RowBg)) {
            ImGui::TableSetupColumn("Ingredient");
            ImGui::TableSetupColumn("Amount");
            ImGui::TableSetupColumn("Cost");
            ImGui::TableSetupColumn("Cals");
            ImGui::TableHeadersRow();

            if (recipe_data.contains("ingredients")) {
                for (auto& ing : recipe_data["ingredients"]) {
                    ImGui::TableNextRow();
                    
                    std::string name = ing.value("name", "Unknown");
                    double amount = ing.value("amount", 0.0);
                    std::string unit = ing.value("unit", "g");
                    
                    double cost_per_bulk = ing.value("cost_per_bulk", 0.0);
                    double bulk_amount = ing.value("bulk_amount", 1.0);
                    double ing_cost = (cost_per_bulk / bulk_amount) * amount;
                    total_cost += ing_cost;

                    ImGui::TableSetColumnIndex(0); ImGui::Text("%s", name.c_str());
                    ImGui::TableSetColumnIndex(1); ImGui::Text("%.2f %s", amount, unit.c_str());
                    ImGui::TableSetColumnIndex(2); ImGui::Text("$%.3f", ing_cost);
                    
                    ImGui::TableSetColumnIndex(3); 
                    if (ing.contains("nutrition_per_100g")) {
                        double cals = ing["nutrition_per_100g"].value("calories", 0.0) * (amount / 100.0);
                        total_calories += cals;
                        ImGui::Text("%.1f", cals);
                    }
                }
            }
            ImGui::EndTable();
        }

        ImGui::Separator();
        ImGui::Text("Total Cost: $%.2f ($%.3f / oz)", total_cost, total_cost / total_volume);
        ImGui::Text("Total Calories: %.1f kcal", total_calories);
    }

    ImGui::End();
}