// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'security_settings_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SecuritySettingsModelImpl _$$SecuritySettingsModelImplFromJson(
  Map<String, dynamic> json,
) => _$SecuritySettingsModelImpl(
  enableFingerprint: json['enableFingerprint'] as bool? ?? false,
  enableFaceUnlock: json['enableFaceUnlock'] as bool? ?? false,
  requireAuthOnAppOpen: json['requireAuthOnAppOpen'] as bool? ?? false,
  requireAuthBeforeSensitiveData:
      json['requireAuthBeforeSensitiveData'] as bool? ?? false,
  autoLockInactivitySeconds:
      (json['autoLockInactivitySeconds'] as num?)?.toInt() ?? 30,
  appPin: json['appPin'] as String?,
);

Map<String, dynamic> _$$SecuritySettingsModelImplToJson(
  _$SecuritySettingsModelImpl instance,
) => <String, dynamic>{
  'enableFingerprint': instance.enableFingerprint,
  'enableFaceUnlock': instance.enableFaceUnlock,
  'requireAuthOnAppOpen': instance.requireAuthOnAppOpen,
  'requireAuthBeforeSensitiveData': instance.requireAuthBeforeSensitiveData,
  'autoLockInactivitySeconds': instance.autoLockInactivitySeconds,
  'appPin': instance.appPin,
};
