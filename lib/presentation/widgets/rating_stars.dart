
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
  }
}