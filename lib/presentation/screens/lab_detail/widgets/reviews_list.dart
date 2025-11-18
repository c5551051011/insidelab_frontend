// presentation/screens/lab_detail/widgets/reviews_list.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../data/models/review.dart';
import '../../../../data/providers/data_providers.dart';
import '../../../widgets/review_card.dart';
import '../../../widgets/common/loading_widget.dart';
import '../../../widgets/common/empty_state_widget.dart';
import '../../../widgets/common/card_widget.dart';

class ReviewsList extends StatefulWidget {
  final String labId;

  const ReviewsList({
    Key? key,
    required this.labId,
  }) : super(key: key);

  @override
  State<ReviewsList> createState() => _ReviewsListState();
}

class _ReviewsListState extends State<ReviewsList> {
  @override
  void initState() {
    super.initState();
    // Load reviews when widget initializes
    Future.microtask(() {
      context.read<ReviewProvider>().loadLabReviews(widget.labId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return CardWidget(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const CardTitle(title: 'Recent Reviews'),
              TextButton(
                onPressed: () {
                  Navigator.pushNamed(
                    context,
                    '/browse-reviews',
                    arguments: {
                      'initialLabId': widget.labId,
                    },
                  );
                },
                child: const Text('View All'),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Consumer<ReviewProvider>(
            builder: (context, reviewProvider, child) {
              final reviews = reviewProvider.getLabReviews(widget.labId);

              if (reviewProvider.isLoading && reviews == null) {
                return const LoadingWidget(
                  message: 'Loading reviews...',
                );
              }

              if (reviewProvider.error != null) {
                return Center(
                  child: Text(
                    'Error loading reviews: ${reviewProvider.error}',
                    style: const TextStyle(color: Colors.red),
                  ),
                );
              }

              if (reviews == null || reviews.isEmpty) {
                return EmptyStateWidget(
                  icon: Icons.rate_review,
                  title: 'No reviews yet',
                  subtitle: 'Be the first to review this lab!',
                  action: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pushNamed(
                        context,
                        '/write-review',
                        arguments: widget.labId,
                      );
                    },
                    icon: const Icon(Icons.edit),
                    label: const Text('Write Review'),
                  ),
                );
              }

              return Column(
                children: reviews.map((review) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: ReviewCard(review: review),
                  );
                }).toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}