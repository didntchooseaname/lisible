if (__FEATURE_COMMAND_PALETTE__) {
  void import("@/scripts/command-palette");
} else {
  void import("@/scripts/search-modal");
}
