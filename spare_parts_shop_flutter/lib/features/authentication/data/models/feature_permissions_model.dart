import 'package:freezed_annotation/freezed_annotation.dart';

part 'feature_permissions_model.freezed.dart';
part 'feature_permissions_model.g.dart';

@freezed
class FeaturePermissionsModel with _$FeaturePermissionsModel {
  const factory FeaturePermissionsModel({
    @Default(true) bool inventoryEnabled,
    @Default(true) bool billingEnabled,
    @Default(false) bool warrantyEnabled,
    @Default(false) bool emiEnabled,
    @Default(true) bool gstEnabled,
    @Default(false) bool customerPortalEnabled,
    @Default(true) bool reportsEnabled,
    @Default(false) bool whatsappNotificationsEnabled,
    @Default(false) bool smsNotificationsEnabled,
    @Default(false) bool multiUserSupportEnabled,
    @Default(false) bool employeeManagementEnabled,
  }) = _FeaturePermissionsModel;

  factory FeaturePermissionsModel.fromJson(Map<String, dynamic> json) =>
      _$FeaturePermissionsModelFromJson(json);
}
