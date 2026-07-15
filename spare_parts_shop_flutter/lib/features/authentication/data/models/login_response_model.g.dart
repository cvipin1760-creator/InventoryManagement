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
  branchId: (json['branchId'] as num?)?.toInt(),
  mustChangePassword: json['mustChangePassword'] as bool?,
  configuration: json['configuration'],
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
  'branchId': instance.branchId,
  'mustChangePassword': instance.mustChangePassword,
  'configuration': instance.configuration,
  'message': instance.message,
};
