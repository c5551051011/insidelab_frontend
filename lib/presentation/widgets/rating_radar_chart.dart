
/*
// presentation/widgets/radar_chart_widget.dart
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/constants/app_colors.dart';
import 'dart:math' as math;

class RatingRadarChart extends StatelessWidget {
  final Map<String, double> ratings;
  final double size;
  final bool showLabels;

  const RatingRadarChart({
    Key? key,
    required this.ratings,
    this.size = 200,
    this.showLabels = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final dataPoints = ratings.entries.toList();
    final angleStep = (2 * math.pi) / dataPoints.length;

    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: RadarChartPainter(
          dataPoints: dataPoints,
          angleStep: angleStep,
          showLabels: showLabels,
        ),
      ),
    );
  }
}

class RadarChartPainter extends CustomPainter {
  final List<MapEntry<String, double>> dataPoints;
  final double angleStep;
  final bool showLabels;

  RadarChartPainter({
    required this.dataPoints,
    required this.angleStep,
    required this.showLabels,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width * 0.35;

    // Draw grid lines
    final gridPaint = Paint()
      ..color = AppColors.border
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    // Draw concentric hexagons
    for (int i = 1; i <= 5; i++) {
      final gridRadius = radius * (i / 5);
      _drawPolygon(canvas, center, gridRadius, dataPoints.length, gridPaint);
    }

    // Draw axis lines
    for (int i = 0; i < dataPoints.length; i++) {
      final angle = i * angleStep - math.pi / 2;
      final endPoint = Offset(
        center.dx + radius * math.cos(angle),
        center.dy + radius * math.sin(angle),
      );
      canvas.drawLine(center, endPoint, gridPaint);
    }

    // Draw data polygon
    final dataPaint = Paint()
      ..color = AppColors.primary.withOpacity(0.3)
      ..style = PaintingStyle.fill;

    final dataStrokePaint = Paint()
      ..color = AppColors.primary
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final path = Path();
    for (int i = 0; i < dataPoints.length; i++) {
      final angle = i * angleStep - math.pi / 2;
      final value = dataPoints[i].value / 5; // Normalize to 0-1
      final point = Offset(
        center.dx + radius * value * math.cos(angle),
        center.dy + radius * value * math.sin(angle),
      );

      if (i == 0) {
        path.moveTo(point.dx, point.dy);
      } else {
        path.lineTo(point.dx, point.dy);
      }
    }
    path.close();

    canvas.drawPath(path, dataPaint);
    canvas.drawPath(path, dataStrokePaint);

    // Draw data points
    final pointPaint = Paint()
      ..color = AppColors.primary
      ..style = PaintingStyle.fill;

    for (int i = 0; i < dataPoints.length; i++) {
      final angle = i * angleStep - math.pi / 2;
      final value = dataPoints[i].value / 5;
      final point = Offset(
        center.dx + radius * value * math.cos(angle),
        center.dy + radius * value * math.sin(angle),
      );
      canvas.drawCircle(point, 4, pointPaint);
    }

    // Draw labels
    if (showLabels) {
      final textPainter = TextPainter(
        textDirection: TextDirection.ltr,
      );

      for (int i = 0; i < dataPoints.length; i++) {
        final angle = i * angleStep - math.pi / 2;
        final labelRadius = radius + 20;
        final labelPoint = Offset(
          center.dx + labelRadius * math.cos(angle),
          center.dy + labelRadius * math.sin(angle),
        );

        textPainter.text = TextSpan(
          text: '${dataPoints[i].key}\n${dataPoints[i].value.toStringAsFixed(1)}',
          style: const TextStyle(
            fontSize: 10,
            color: AppColors.textSecondary,
          ),
        );
        textPainter.layout();

        // Adjust label position based on angle
        double offsetX = -textPainter.width / 2;
        double offsetY = -textPainter.height / 2;

        textPainter.paint(
          canvas,
          Offset(labelPoint.dx + offsetX, labelPoint.dy + offsetY),
        );
      }
    }
  }

  void _drawPolygon(Canvas canvas, Offset center, double radius, int sides, Paint paint) {
    final path = Path();
    for (int i = 0; i < sides; i++) {
      final angle = i * angleStep - math.pi / 2;
      final point = Offset(
        center.dx + radius * math.cos(angle),
        center.dy + radius * math.sin(angle),
      );

      if (i == 0) {
        path.moveTo(point.dx, point.dy);
      } else {
        path.lineTo(point.dx, point.dy);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
*/