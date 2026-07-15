// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'account_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AccountModelImpl _$$AccountModelImplFromJson(Map<String, dynamic> json) =>
    _$AccountModelImpl(
      id: json['id'] as String,
      token: json['token'] as String,
      refreshToken: json['refreshToken'] as String?,
      username: json['username'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      name: json['name'] as String?,
      businessName: json['businessName'] as String?,
      role: json['role'] as String,
      userId: (json['userId'] as num?)?.toInt(),
      businessId: (json['businessId'] as num?)?.toInt(),
      branchId: (json['branchId'] as num?)?.toInt(),
      configuration: json['configuration'],
      profilePhotoUrl: json['profilePhotoUrl'] as String?,
      isActive: json['isActive'] as bool? ?? false,
    );

Map<String, dynamic> _$$AccountModelImplToJson(_$AccountModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'token': instance.token,
      'refreshToken': instance.refreshToken,
      'username': instance.username,
      'email': instance.email,
      'phone': instance.phone,
      'name': instance.name,
      'businessName': instance.businessName,
      'role': instance.role,
      'userId': instance.userId,
      'businessId': instance.businessId,
      'branchId': instance.branchId,
      'configuration': instance.configuration,
      'profilePhotoUrl': instance.profilePhotoUrl,
      'isActive': instance.isActive,
    };
