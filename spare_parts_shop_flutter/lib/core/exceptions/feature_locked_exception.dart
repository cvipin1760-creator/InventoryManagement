class FeatureLockedException implements Exception {
  final String message;
  final String? moduleCode;

  FeatureLockedException([this.message = "Feature locked", this.moduleCode]);

  @override
  String toString() => "FeatureLockedException: $message (Module: $moduleCode)";
}
