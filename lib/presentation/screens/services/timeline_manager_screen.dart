import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/providers/data_providers.dart';
import '../../../data/models/booking.dart';
import '../../widgets/common/header_navigation.dart';

class TimelineManagerScreen extends StatefulWidget {
  const TimelineManagerScreen({Key? key}) : super(key: key);

  @override
  State<TimelineManagerScreen> createState() => _TimelineManagerScreenState();
}

class _TimelineManagerScreenState extends State<TimelineManagerScreen> {
  List<ApplicationDeadline> _applications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadApplications();
  }

  void _loadApplications() async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    // Mock application deadlines
    _applications = [
      ApplicationDeadline(
        id: 'app1',
        userId: 'current_user',
        universityName: 'Stanford University',
        programName: 'PhD in Computer Science',
        deadline: DateTime.now().add(Duration(days: 45)),
        status: 'in_progress',
        requirements: [
          'Statement of Purpose',
          'CV/Resume',
          'Letters of Recommendation (3)',
          'Transcripts',
          'GRE Scores',
          'TOEFL Scores',
          'Writing Sample'
        ],
        completedRequirements: {
          'Statement of Purpose': false,
          'CV/Resume': true,
          'Letters of Recommendation (3)': false,
          'Transcripts': true,
          'GRE Scores': true,
          'TOEFL Scores': false,
          'Writing Sample': false,
        },
        notes: 'Focus on AI/ML research area. Contact Prof. Johnson about research opportunities.',
      ),
      ApplicationDeadline(
        id: 'app2',
        userId: 'current_user',
        universityName: 'MIT',
        programName: 'PhD in Electrical Engineering',
        deadline: DateTime.now().add(Duration(days: 60)),
        status: 'not_started',
        requirements: [
          'Statement of Purpose',
          'CV/Resume',
          'Letters of Recommendation (3)',
          'Transcripts',
          'GRE Scores',
          'Research Statement'
        ],
        completedRequirements: {
          'Statement of Purpose': false,
          'CV/Resume': true,
          'Letters of Recommendation (3)': false,
          'Transcripts': false,
          'GRE Scores': true,
          'Research Statement': false,
        },
      ),
      ApplicationDeadline(
        id: 'app3',
        userId: 'current_user',
        universityName: 'UC Berkeley',
        programName: 'PhD in Computer Science',
        deadline: DateTime.now().add(Duration(days: 30)),
        status: 'in_progress',
        requirements: [
          'Statement of Purpose',
          'CV/Resume',
          'Letters of Recommendation (3)',
          'Transcripts',
          'GRE Scores'
        ],
        completedRequirements: {
          'Statement of Purpose': true,
          'CV/Resume': true,
          'Letters of Recommendation (3)': true,
          'Transcripts': true,
          'GRE Scores': true,
        },
      ),
    ];

    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderNavigation(),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                children: [
                  _buildHeader(),
                  _buildOverview(),
                  _buildApplicationsList(),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addNewApplication,
        backgroundColor: AppColors.primary,
        icon: Icon(Icons.add),
        label: Text('Add Application'),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary.withOpacity(0.1), Colors.transparent],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '📅 Application Timeline Manager',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Stay organized and never miss a deadline. Track your progress across all graduate school applications.',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverview() {
    final upcomingDeadlines = _applications
        .where((app) => app.deadline.isAfter(DateTime.now()) && 
                       app.deadline.isBefore(DateTime.now().add(Duration(days: 30))))
        .length;
    
    final totalProgress = _applications.map((app) {
      final completed = app.completedRequirements.values.where((done) => done).length;
      return completed / app.completedRequirements.length;
    }).reduce((a, b) => a + b) / _applications.length;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildOverviewStat('${_applications.length}', 'Total Applications'),
              _buildOverviewStat('$upcomingDeadlines', 'Due This Month'),
              _buildOverviewStat('${(totalProgress * 100).toInt()}%', 'Avg Progress'),
            ],
          ),
          const SizedBox(height: 16),
          LinearProgressIndicator(
            value: totalProgress,
            backgroundColor: Colors.white.withOpacity(0.3),
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
          const SizedBox(height: 8),
          Text(
            'Overall Progress: ${(totalProgress * 100).toInt()}%',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewStat(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildApplicationsList() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Your Applications',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          ..._applications.map((app) => _buildApplicationCard(app)),
        ],
      ),
    );
  }

  Widget _buildApplicationCard(ApplicationDeadline application) {
    final daysLeft = application.deadline.difference(DateTime.now()).inDays;
    final completed = application.completedRequirements.values.where((done) => done).length;
    final total = application.completedRequirements.length;
    final progress = completed / total;
    
    Color deadlineColor;
    if (daysLeft <= 7) {
      deadlineColor = AppColors.error;
    } else if (daysLeft <= 30) {
      deadlineColor = Colors.orange;
    } else {
      deadlineColor = AppColors.success;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      child: ExpansionTile(
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: deadlineColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                '$daysLeft',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: deadlineColor,
                ),
              ),
              Text(
                'days',
                style: TextStyle(
                  fontSize: 10,
                  color: deadlineColor,
                ),
              ),
            ],
          ),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              application.universityName,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              application.programName,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: Colors.grey[300],
                    valueColor: AlwaysStoppedAnimation<Color>(
                      progress == 1.0 ? AppColors.success : AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '$completed/$total',
                  style: TextStyle(fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Due: ${_formatDate(application.deadline)}',
              style: TextStyle(
                fontSize: 12,
                color: deadlineColor,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Requirements Checklist',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                ...application.completedRequirements.entries.map((entry) =>
                  _buildRequirementItem(application.id, entry.key, entry.value)
                ),
                if (application.notes != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.info.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Notes',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppColors.info,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          application.notes!,
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _editApplication(application),
                        icon: Icon(Icons.edit, size: 16),
                        label: Text('Edit'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _setReminder(application),
                        icon: Icon(Icons.notifications, size: 16),
                        label: Text('Set Reminder'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRequirementItem(String appId, String requirement, bool isCompleted) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Checkbox(
            value: isCompleted,
            onChanged: (value) {
              setState(() {
                final appIndex = _applications.indexWhere((app) => app.id == appId);
                if (appIndex != -1) {
                  _applications[appIndex].completedRequirements[requirement] = value ?? false;
                }
              });
            },
          ),
          Expanded(
            child: Text(
              requirement,
              style: TextStyle(
                fontSize: 14,
                color: isCompleted ? AppColors.textSecondary : AppColors.textPrimary,
                decoration: isCompleted ? TextDecoration.lineThrough : null,
              ),
            ),
          ),
          if (!isCompleted && (requirement.contains('CV') || requirement.contains('Statement')))
            TextButton(
              onPressed: () => _getHelp(requirement),
              child: Text('Get Help', style: TextStyle(fontSize: 12)),
            ),
        ],
      ),
    );
  }

  void _addNewApplication() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Add New Application'),
        content: Text('This feature will allow you to add new graduate school applications to track.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Coming Soon'),
          ),
        ],
      ),
    );
  }

  void _editApplication(ApplicationDeadline application) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Edit Application'),
        content: Text('Edit details for ${application.universityName}'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Coming Soon'),
          ),
        ],
      ),
    );
  }

  void _setReminder(ApplicationDeadline application) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: Icon(Icons.notifications, color: AppColors.primary),
        title: Text('Reminder Set!'),
        content: Text('You\'ll receive notifications about upcoming deadlines for ${application.universityName}.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Great!'),
          ),
        ],
      ),
    );
  }

  void _getHelp(String requirement) {
    String route = '/application-services';
    if (requirement.contains('CV')) {
      route = '/cv-review';
    } else if (requirement.contains('Statement')) {
      route = '/sop-editing';
    }
    
    Navigator.pushNamed(context, route);
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}