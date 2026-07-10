class AuditTask {
  final int? id;
  final String location;
  final String scheduledDate;
  final String status;
  final String? notes;

  AuditTask({
    this.id,
    required this.location,
    required this.scheduledDate,
    required this.status,
    this.notes,
  });

  factory AuditTask.fromJson(Map<String, dynamic> json) {
    return AuditTask(
      id: json['id'],
      location: json['location'],
      scheduledDate: json['scheduledDate'],
      status: json['status'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'location': location,
      'scheduledDate': scheduledDate,
      'status': status,
      if (notes != null) 'notes': notes,
    };
  }
}
