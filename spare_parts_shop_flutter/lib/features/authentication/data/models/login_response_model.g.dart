// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'login_response_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LoginResponseModelImpl _$$LoginResponseModelImplFromJson(
  Map<String, dynamic> json,
) => _$LoginResponseModelImpl(
  userId: (json['userId'] as num?)?.toInt(),
  token: json['token'] as String?,
  username: json['username'] as String?,
  role: json['role'] as String?,
  businessId: (json['businessId'] as num?)?.toInt(),
  features: json['features'] == null
      ? null
      : FeaturePermissionsModel.fromJson(
          json['features'] as Map<String, dynamic>,
        ),
  message: json['message'] as String?,
);

Map<String, dynamic> _$$LoginResponseModelImplToJson(
  _$LoginResponseModelImpl instance,
) => <String, dynamic>{
  'userId': instance.userId,
  'token': instance.token,
  'username': instance.username,
  'role': instance.role,
  'businessId': instance.businessId,
  'features': instance.features,
  'message': instance.message,
};
