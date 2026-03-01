# Lowkey Internal Sandbox Tools Overview

The `lowkey_sandbox` is an internal C++ application built with Dear ImGui, GLFW, and OpenGL3. It serves as a unified suite for R&D and beverage formulation. The application provides three primary dockable/floating tools:

1. **Recipe Inspector:** Calculates cost and nutritional information based on recipe JSON files.
2. **Taguchi Optimizer:** Assists with systematic R&D experiments using dynamic Orthogonal Arrays (L9 and L27) and saves results to CSV files.
3. **Iteration Ledger:** A simple tool to track recipe versions and log feedback notes.

## Building and Running

The application is built using CMake and automatically fetches its dependencies (JSON for Modern C++, GLFW, and Dear ImGui) via `FetchContent`.

### Prerequisites
- CMake 3.14 or higher
- C++17 compatible compiler
- OpenGL development libraries (e.g., `libgl1-mesa-dev` on Linux)
- X11 or Wayland development libraries (e.g., `xorg-dev`, `libwayland-dev` on Linux)

### Build Instructions

1. Navigate to the `internal` directory:
   ```bash
   cd /home/oisenhart/projects/lowkey/internal
   ```
2. Create and enter a build directory:
   ```bash
   mkdir build && cd build
   ```
3. Configure with CMake and build:
   ```bash
   cmake ..
   make
   ```
4. Run the executable:
   ```bash
   ./lowkey_sandbox
   ```

## Directory Structure Expectations

The sandbox expects certain directories to exist or be reachable relative to its execution path (typically from `internal/build/` or `internal/`):
- `recipes/`: Where recipe `.json` files are stored. The Recipe Inspector looks in `../../recipes/` and `../recipes/`.
- `results/taguchi/`: Where the Taguchi Optimizer saves and loads its `.csv` experiment files. (Stored relative as `../results/taguchi`).
- `results/ledger/`: Where the Iteration Ledger appends notes to `ledger.txt`. (Stored relative as `../results/ledger`).

The tool uses a dark-themed ImGui interface. Each tool opens in its own window by default, allowing you to use them side-by-side.
