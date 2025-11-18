// presentation/screens/lab_detail/widgets/recruitment_status_widget.dart
import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../data/models/lab.dart';
import '../../../widgets/common/card_widget.dart';

class RecruitmentStatusWidget extends StatelessWidget {
  final Lab lab;

  const RecruitmentStatusWidget({
    Key? key,
    required this.lab,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (lab.recruitmentStatus == null) return const SizedBox.shrink();

    final status = lab.recruitmentStatus!;

    return CardWidget(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const CardTitle(
                title: 'Recruitment Status',
              ),
              if (status.lastUpdated != null)
                Text(
                  'Updated ${_formatDate(status.lastUpdated!)}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textTertiary,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          _buildRecruitmentItem('PhD Students', status.isRecruitingPhD),
          _buildRecruitmentItem('Postdocs', status.isRecruitingPostdoc),
          _buildRecruitmentItem('Undergraduate Interns', status.isRecruitingIntern),
          if (status.notes != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.info.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, size: 16, color: AppColors.info),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      status.notes!,
                      style: const TextStyle(fontSize: 14),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildRecruitmentItem(String position, bool isRecruiting) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(
            isRecruiting ? Icons.check_circle : Icons.cancel,
            color: isRecruiting ? AppColors.success : AppColors.textTertiary,
            size: 20,
          ),
          const SizedBox(width: 12),
          Text(
            position,
            style: const TextStyle(fontSize: 16),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: isRecruiting
                  ? AppColors.success.withOpacity(0.1)
                  : AppColors.textTertiary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              isRecruiting ? 'Open' : 'Closed',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isRecruiting ? AppColors.success : AppColors.textTertiary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 30) {
      final months = (difference.inDays / 30).floor();
      return '$months month${months > 1 ? 's' : ''} ago';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
    } else {
      return 'Today';
    }
  }
}