// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'security_settings_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

SecuritySettingsModel _$SecuritySettingsModelFromJson(
  Map<String, dynamic> json,
) {
  return _SecuritySettingsModel.fromJson(json);
}

/// @nodoc
mixin _$SecuritySettingsModel {
  bool get enableFingerprint => throw _privateConstructorUsedError;
  bool get enableFaceUnlock => throw _privateConstructorUsedError;
  bool get requireAuthOnAppOpen => throw _privateConstructorUsedError;
  bool get requireAuthBeforeSensitiveData => throw _privateConstructorUsedError;
  int get autoLockInactivitySeconds => throw _privateConstructorUsedError;
  String? get appPin => throw _privateConstructorUsedError;

  /// Serializes this SecuritySettingsModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SecuritySettingsModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SecuritySettingsModelCopyWith<SecuritySettingsModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SecuritySettingsModelCopyWith<$Res> {
  factory $SecuritySettingsModelCopyWith(
    SecuritySettingsModel value,
    $Res Function(SecuritySettingsModel) then,
  ) = _$SecuritySettingsModelCopyWithImpl<$Res, SecuritySettingsModel>;
  @useResult
  $Res call({
    bool enableFingerprint,
    bool enableFaceUnlock,
    bool requireAuthOnAppOpen,
    bool requireAuthBeforeSensitiveData,
    int autoLockInactivitySeconds,
    String? appPin,
  });
}

/// @nodoc
class _$SecuritySettingsModelCopyWithImpl<
  $Res,
  $Val extends SecuritySettingsModel
>
    implements $SecuritySettingsModelCopyWith<$Res> {
  _$SecuritySettingsModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SecuritySettingsModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? enableFingerprint = null,
    Object? enableFaceUnlock = null,
    Object? requireAuthOnAppOpen = null,
    Object? requireAuthBeforeSensitiveData = null,
    Object? autoLockInactivitySeconds = null,
    Object? appPin = freezed,
  }) {
    return _then(
      _value.copyWith(
            enableFingerprint: null == enableFingerprint
                ? _value.enableFingerprint
                : enableFingerprint // ignore: cast_nullable_to_non_nullable
                      as bool,
            enableFaceUnlock: null == enableFaceUnlock
                ? _value.enableFaceUnlock
                : enableFaceUnlock // ignore: cast_nullable_to_non_nullable
                      as bool,
            requireAuthOnAppOpen: null == requireAuthOnAppOpen
                ? _value.requireAuthOnAppOpen
                : requireAuthOnAppOpen // ignore: cast_nullable_to_non_nullable
                      as bool,
            requireAuthBeforeSensitiveData:
                null == requireAuthBeforeSensitiveData
                ? _value.requireAuthBeforeSensitiveData
                : requireAuthBeforeSensitiveData // ignore: cast_nullable_to_non_nullable
                      as bool,
            autoLockInactivitySeconds: null == autoLockInactivitySeconds
                ? _value.autoLockInactivitySeconds
                : autoLockInactivitySeconds // ignore: cast_nullable_to_non_nullable
                      as int,
            appPin: freezed == appPin
                ? _value.appPin
                : appPin // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SecuritySettingsModelImplCopyWith<$Res>
    implements $SecuritySettingsModelCopyWith<$Res> {
  factory _$$SecuritySettingsModelImplCopyWith(
    _$SecuritySettingsModelImpl value,
    $Res Function(_$SecuritySettingsModelImpl) then,
  ) = __$$SecuritySettingsModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    bool enableFingerprint,
    bool enableFaceUnlock,
    bool requireAuthOnAppOpen,
    bool requireAuthBeforeSensitiveData,
    int autoLockInactivitySeconds,
    String? appPin,
  });
}

/// @nodoc
class __$$SecuritySettingsModelImplCopyWithImpl<$Res>
    extends
        _$SecuritySettingsModelCopyWithImpl<$Res, _$SecuritySettingsModelImpl>
    implements _$$SecuritySettingsModelImplCopyWith<$Res> {
  __$$SecuritySettingsModelImplCopyWithImpl(
    _$SecuritySettingsModelImpl _value,
    $Res Function(_$SecuritySettingsModelImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SecuritySettingsModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? enableFingerprint = null,
    Object? enableFaceUnlock = null,
    Object? requireAuthOnAppOpen = null,
    Object? requireAuthBeforeSensitiveData = null,
    Object? autoLockInactivitySeconds = null,
    Object? appPin = freezed,
  }) {
    return _then(
      _$SecuritySettingsModelImpl(
        enableFingerprint: null == enableFingerprint
            ? _value.enableFingerprint
            : enableFingerprint // ignore: cast_nullable_to_non_nullable
                  as bool,
        enableFaceUnlock: null == enableFaceUnlock
            ? _value.enableFaceUnlock
            : enableFaceUnlock // ignore: cast_nullable_to_non_nullable
                  as bool,
        requireAuthOnAppOpen: null == requireAuthOnAppOpen
            ? _value.requireAuthOnAppOpen
            : requireAuthOnAppOpen // ignore: cast_nullable_to_non_nullable
                  as bool,
        requireAuthBeforeSensitiveData: null == requireAuthBeforeSensitiveData
            ? _value.requireAuthBeforeSensitiveData
            : requireAuthBeforeSensitiveData // ignore: cast_nullable_to_non_nullable
                  as bool,
        autoLockInactivitySeconds: null == autoLockInactivitySeconds
            ? _value.autoLockInactivitySeconds
            : autoLockInactivitySeconds // ignore: cast_nullable_to_non_nullable
                  as int,
        appPin: freezed == appPin
            ? _value.appPin
            : appPin // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SecuritySettingsModelImpl implements _SecuritySettingsModel {
  const _$SecuritySettingsModelImpl({
    this.enableFingerprint = false,
    this.enableFaceUnlock = false,
    this.requireAuthOnAppOpen = false,
    this.requireAuthBeforeSensitiveData = false,
    this.autoLockInactivitySeconds = 30,
    this.appPin,
  });

  factory _$SecuritySettingsModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$SecuritySettingsModelImplFromJson(json);

  @override
  @JsonKey()
  final bool enableFingerprint;
  @override
  @JsonKey()
  final bool enableFaceUnlock;
  @override
  @JsonKey()
  final bool requireAuthOnAppOpen;
  @override
  @JsonKey()
  final bool requireAuthBeforeSensitiveData;
  @override
  @JsonKey()
  final int autoLockInactivitySeconds;
  @override
  final String? appPin;

  @override
  String toString() {
    return 'SecuritySettingsModel(enableFingerprint: $enableFingerprint, enableFaceUnlock: $enableFaceUnlock, requireAuthOnAppOpen: $requireAuthOnAppOpen, requireAuthBeforeSensitiveData: $requireAuthBeforeSensitiveData, autoLockInactivitySeconds: $autoLockInactivitySeconds, appPin: $appPin)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SecuritySettingsModelImpl &&
            (identical(other.enableFingerprint, enableFingerprint) ||
                other.enableFingerprint == enableFingerprint) &&
            (identical(other.enableFaceUnlock, enableFaceUnlock) ||
                other.enableFaceUnlock == enableFaceUnlock) &&
            (identical(other.requireAuthOnAppOpen, requireAuthOnAppOpen) ||
                other.requireAuthOnAppOpen == requireAuthOnAppOpen) &&
            (identical(
                  other.requireAuthBeforeSensitiveData,
                  requireAuthBeforeSensitiveData,
                ) ||
                other.requireAuthBeforeSensitiveData ==
                    requireAuthBeforeSensitiveData) &&
            (identical(
                  other.autoLockInactivitySeconds,
                  autoLockInactivitySeconds,
                ) ||
                other.autoLockInactivitySeconds == autoLockInactivitySeconds) &&
            (identical(other.appPin, appPin) || other.appPin == appPin));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    enableFingerprint,
    enableFaceUnlock,
    requireAuthOnAppOpen,
    requireAuthBeforeSensitiveData,
    autoLockInactivitySeconds,
    appPin,
  );

  /// Create a copy of SecuritySettingsModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SecuritySettingsModelImplCopyWith<_$SecuritySettingsModelImpl>
  get copyWith =>
      __$$SecuritySettingsModelImplCopyWithImpl<_$SecuritySettingsModelImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$SecuritySettingsModelImplToJson(this);
  }
}

abstract class _SecuritySettingsModel implements SecuritySettingsModel {
  const factory _SecuritySettingsModel({
    final bool enableFingerprint,
    final bool enableFaceUnlock,
    final bool requireAuthOnAppOpen,
    final bool requireAuthBeforeSensitiveData,
    final int autoLockInactivitySeconds,
    final String? appPin,
  }) = _$SecuritySettingsModelImpl;

  factory _SecuritySettingsModel.fromJson(Map<String, dynamic> json) =
      _$SecuritySettingsModelImpl.fromJson;

  @override
  bool get enableFingerprint;
  @override
  bool get enableFaceUnlock;
  @override
  bool get requireAuthOnAppOpen;
  @override
  bool get requireAuthBeforeSensitiveData;
  @override
  int get autoLockInactivitySeconds;
  @override
  String? get appPin;

  /// Create a copy of SecuritySettingsModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SecuritySettingsModelImplCopyWith<_$SecuritySettingsModelImpl>
  get copyWith => throw _privateConstructorUsedError;
}
