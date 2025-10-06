
// presentation/screens/lab_detail/widgets/lab_header.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/router/app_routes.dart';
import '../../../../data/models/lab.dart';
import '../../../../data/providers/saved_labs_provider.dart';
import '../../../../data/providers/data_providers.dart';
import '../../../widgets/enhanced_bookmark_button.dart';
import '../../../widgets/rating_stars.dart';

class LabHeader extends StatelessWidget {
  final Lab lab;

  const LabHeader({
    Key? key,
    required this.lab,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      decoration: const BoxDecoration(
        gradient: AppColors.primaryGradient,
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(
              child: Row(
                children: [
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF3b82f6), Color(0xFF1d4ed8)],
                      ),
                      borderRadius: BorderRadius.circular(35),
                    ),
                    child: Center(
                      child: Text(
                        lab.professorName.split(' ').map((name) => name.isNotEmpty ? name[0] : '').take(2).join().toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 28,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            lab.professorName,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            lab.name,
                            style: const TextStyle(
                              fontSize: 16,
                              color: Colors.white70,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${lab.universityName} • ${lab.department}',
                            style: const TextStyle(
                              fontSize: 13,
                              color: Colors.white70,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          if (lab.researchAreas.isNotEmpty)
                            ConstrainedBox(
                              constraints: const BoxConstraints(maxHeight: 30),
                              child: SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: Row(
                                  children: lab.researchAreas.take(1).map((area) {
                                    return Container(
                                      margin: const EdgeInsets.only(right: 4),
                                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            Colors.white.withOpacity(0.25),
                                            Colors.white.withOpacity(0.15),
                                          ],
                                        ),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: Colors.white.withOpacity(0.4), width: 1),
                                      ),
                                      child: Text(
                                        area,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 10,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 130,
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            lab.overallRating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          RatingStars(rating: lab.overallRating, size: 12),
                          const SizedBox(height: 4),
                          Text(
                            '${lab.reviewCount} reviews',
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 16),
                          // Write Review button
                          ElevatedButton(
                            onPressed: () {
                              AppRoutes.goToWriteReview(context, labId: lab.id);
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF10b981),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              minimumSize: const Size(110, 32),
                            ),
                            child: const Text(
                              'Write Review',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Enhanced save button
                  Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      EnhancedBookmarkButton(
                        labId: lab.id,
                        size: 24,
                        activeColor: Colors.white,
                        inactiveColor: Colors.white70,
                        showDropdown: true,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

}