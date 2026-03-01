#include "ledger.hpp"
#include <iostream>
#include <fstream>
#include <string>

void run_ledger() {
    std::cout << "--- Iteration Ledger ---\n";
    std::cout << "1. Add new iteration feedback\n";
    std::cout << "2. View previous feedback\n";
    std::cout << "Select an option: ";

    int choice;
    if (!(std::cin >> choice)) {
        std::cerr << "Invalid input.\n";
        return;
    }
    std::cin.ignore(); // Consume newline

    const std::string ledger_file = "ledger.txt";

    if (choice == 1) {
        std::ofstream f(ledger_file, std::ios::app);
        if (!f.is_open()) {
            std::cerr << "Error: Could not open " << ledger_file << " for writing.\n";
            return;
        }

        std::cout << "Enter Recipe Version (e.g., v1.0.1-alpha): ";
        std::string version;
        std::getline(std::cin, version);

        std::cout << "Enter Feedback / Notes: ";
        std::string notes;
        std::getline(std::cin, notes);

        f << "Version: " << version << " | Notes: " << notes << "\n";
        std::cout << "Feedback saved to " << ledger_file << "\n";

    } else if (choice == 2) {
        std::ifstream f(ledger_file);
        if (!f.is_open()) {
             std::cout << "No previous feedback found.\n";
             return;
        }

        std::cout << "\n=== Ledger Log ===\n";
        std::string line;
        while (std::getline(f, line)) {
            std::cout << line << "\n";
        }
        std::cout << "==================\n";
    } else {
        std::cerr << "Invalid choice.\n";
    }
}
