// main.dart
import 'package:flutter/material.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  usePathUrlStrategy(); // Remove # from URLs on web
  runApp(const InsideLabApp());
}
