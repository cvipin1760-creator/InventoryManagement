import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('stockpilot_offline.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path, 
      version: 2, 
      onCreate: _createDB,
      onUpgrade: _upgradeDB,
    );
  }

  Future _upgradeDB(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      await db.execute('''
        CREATE TABLE IF NOT EXISTS offline_bills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          billData TEXT NOT NULL,
          createdAt TEXT NOT NULL
        )
      ''');
    }
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE offline_bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        billData TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    ''');
  }

  Future<int> insertOfflineBill(Map<String, dynamic> billData) async {
    final db = await instance.database;
    return await db.insert('offline_bills', {
      'billData': json.encode(billData),
      'createdAt': DateTime.now().toIso8601String(),
    });
  }

  Future<List<Map<String, dynamic>>> getOfflineBills() async {
    final db = await instance.database;
    final result = await db.query('offline_bills', orderBy: 'createdAt ASC');
    
    return result.map((row) {
      return {
        'id': row['id'],
        'billData': json.decode(row['billData'] as String),
        'createdAt': row['createdAt'],
      };
    }).toList();
  }

  Future<int> deleteOfflineBill(int id) async {
    final db = await instance.database;
    return await db.delete('offline_bills', where: 'id = ?', whereArgs: [id]);
  }
}
