cmake_minimum_required(VERSION 3.14)
project(LowkeyInternalTools)

set(CMAKE_CXX_STANDARD 17)

include(FetchContent)

# 1. Fetch JSON
FetchContent_Declare(json URL https://github.com/nlohmann/json/releases/download/v3.11.2/json.tar.xz)
FetchContent_MakeAvailable(json)

# 2. Fetch GLFW
FetchContent_Declare(glfw
    GIT_REPOSITORY https://github.com/glfw/glfw.git
    GIT_TAG 3.3.8
)
set(GLFW_BUILD_DOCS OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(GLFW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(glfw)

# 3. Fetch Dear ImGui
FetchContent_Declare(imgui
    GIT_REPOSITORY https://github.com/ocornut/imgui.git
    GIT_TAG v1.90
)
FetchContent_MakeAvailable(imgui)

# Add ImGui source files
set(IMGUI_DIR ${imgui_SOURCE_DIR})
set(IMGUI_SOURCES
    ${IMGUI_DIR}/imgui.cpp
    ${IMGUI_DIR}/imgui_demo.cpp
    ${IMGUI_DIR}/imgui_draw.cpp
    ${IMGUI_DIR}/imgui_tables.cpp
    ${IMGUI_DIR}/imgui_widgets.cpp
    ${IMGUI_DIR}/backends/imgui_impl_glfw.cpp
    ${IMGUI_DIR}/backends/imgui_impl_opengl3.cpp
)

set(SOURCES
    src/main.cpp
    src/gui_recipe.cpp
    src/gui_taguchi.cpp
    src/gui_ledger.cpp
)

add_executable(lowkey_sandbox ${SOURCES} ${IMGUI_SOURCES})

target_include_directories(lowkey_sandbox PRIVATE 
    ${IMGUI_DIR} 
    ${IMGUI_DIR}/backends
)

target_link_libraries(lowkey_sandbox PRIVATE nlohmann_json::nlohmann_json glfw)

if (UNIX AND NOT APPLE)
    target_link_libraries(lowkey_sandbox PRIVATE GL m dl)
endif()