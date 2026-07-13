import 'package:freezed_annotation/freezed_annotation.dart';

part 'security_settings_model.freezed.dart';
part 'security_settings_model.g.dart';

@freezed
class SecuritySettingsModel with _$SecuritySettingsModel {
  const factory SecuritySettingsModel({
    @Default(false) bool enableFingerprint,
    @Default(false) bool enableFaceUnlock,
    @Default(false) bool requireAuthOnAppOpen,
    @Default(false) bool requireAuthBeforeSensitiveData,
    @Default(30) int autoLockInactivitySeconds,
    String? appPin,
  }) = _SecuritySettingsModel;

  factory SecuritySettingsModel.fromJson(Map<String, dynamic> json) =>
      _$SecuritySettingsModelFromJson(json);
}
