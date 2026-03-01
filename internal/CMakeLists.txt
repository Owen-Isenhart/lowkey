cmake_minimum_required(VERSION 3.10)
project(LowkeyInternalTools)

set(CMAKE_CXX_STANDARD 17)

# We will use nlohmann/json for JSON parsing.
# The easiest way is to fetch it via CMake's FetchContent
include(FetchContent)
FetchContent_Declare(json
  URL https://github.com/nlohmann/json/releases/download/v3.11.2/json.tar.xz
)
FetchContent_MakeAvailable(json)

# Add our source files (we'll implement them next)
set(SOURCES
    src/main.cpp
    src/taguchi.cpp
    src/cost_calculator.cpp
    src/nutrition.cpp
    src/ledger.cpp
)

add_executable(sandbox ${SOURCES})

# Link the JSON library
target_link_libraries(sandbox PRIVATE nlohmann_json::nlohmann_json)
