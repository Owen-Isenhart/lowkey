#ifndef LOWKEY_TAGUCHI_HPP
#define LOWKEY_TAGUCHI_HPP

#include <string>
#include <vector>
#include <array>

namespace lowkey {

    // Defined inside the namespace to avoid naming conflicts
    struct Factor {
        std::string name;
        std::array<std::string, 3> levels; 
    };

    // This is the entry point your main CLI will call
    void run_L9_analysis();

} // namespace lowkey

#endif // LOWKEY_TAGUCHI_HPP