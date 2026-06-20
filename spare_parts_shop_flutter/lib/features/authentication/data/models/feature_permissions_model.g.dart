// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'feature_permissions_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$FeaturePermissionsModelImpl _$$FeaturePermissionsModelImplFromJson(
  Map<String, dynamic> json,
) => _$FeaturePermissionsModelImpl(
  inventoryEnabled: json['inventoryEnabled'] as bool? ?? true,
  billingEnabled: json['billingEnabled'] as bool? ?? true,
  warrantyEnabled: json['warrantyEnabled'] as bool? ?? false,
  emiEnabled: json['emiEnabled'] as bool? ?? false,
  gstEnabled: json['gstEnabled'] as bool? ?? true,
  customerPortalEnabled: json['customerPortalEnabled'] as bool? ?? false,
  reportsEnabled: json['reportsEnabled'] as bool? ?? true,
  whatsappNotificationsEnabled:
      json['whatsappNotificationsEnabled'] as bool? ?? false,
  smsNotificationsEnabled: json['smsNotificationsEnabled'] as bool? ?? false,
  multiUserSupportEnabled: json['multiUserSupportEnabled'] as bool? ?? false,
  employeeManagementEnabled:
      json['employeeManagementEnabled'] as bool? ?? false,
);

Map<String, dynamic> _$$FeaturePermissionsModelImplToJson(
  _$FeaturePermissionsModelImpl instance,
) => <String, dynamic>{
  'inventoryEnabled': instance.inventoryEnabled,
  'billingEnabled': instance.billingEnabled,
  'warrantyEnabled': instance.warrantyEnabled,
  'emiEnabled': instance.emiEnabled,
  'gstEnabled': instance.gstEnabled,
  'customerPortalEnabled': instance.customerPortalEnabled,
  'reportsEnabled': instance.reportsEnabled,
  'whatsappNotificationsEnabled': instance.whatsappNotificationsEnabled,
  'smsNotificationsEnabled': instance.smsNotificationsEnabled,
  'multiUserSupportEnabled': instance.multiUserSupportEnabled,
  'employeeManagementEnabled': instance.employeeManagementEnabled,
};
