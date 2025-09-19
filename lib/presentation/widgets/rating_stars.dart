
// presentation/widgets/rating_stars.dart
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class RatingStars extends StatelessWidget {
  final double rating;
  final double size;
  final Color? color;

  const RatingStars({
    Key? key,
    required this.rating,
    this.size = 20,
    this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final starColor = color ?? AppColors.rating;

    return LayoutBuilder(
      builder: (context, constraints) {
        // Calculate the space needed for 5 stars
        final requiredWidth = size * 5;

        // If we don't have enough space, show a compact version
        if (constraints.maxWidth < requiredWidth && constraints.maxWidth > 0) {
          // Show rating as text with a single star icon
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.star, size: size * 0.8, color: starColor),
              const SizedBox(width: 2),
              Text(
                rating.toStringAsFixed(1),
                style: TextStyle(
                  fontSize: size * 0.7,
                  fontWeight: FontWeight.w600,
                  color: starColor,
                ),
              ),
            ],
          );
        }

        // Normal layout with 5 stars
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(5, (index) {
            if (index < rating.floor()) {
              return Icon(Icons.star, size: size, color: starColor);
            } else if (index < rating) {
              return Icon(Icons.star_half, size: size, color: starColor);
            } else {
              return Icon(Icons.star_border, size: size, color: starColor);
            }
          }),
        );
      },
    );
  }
}