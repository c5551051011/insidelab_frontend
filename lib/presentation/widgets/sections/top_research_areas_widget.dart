import 'package:flutter/material.dart';

class TopResearchAreasWidget extends StatelessWidget {
  final List<Map<String, dynamic>>? topResearchAreas;

  const TopResearchAreasWidget({
    Key? key,
    required this.topResearchAreas,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (topResearchAreas == null || topResearchAreas!.isEmpty) {
      return Container();
    }

    // Find max count for bar width calculation
    final maxCount = topResearchAreas!
        .map((area) => area['publication_count'] as int)
        .reduce((a, b) => a > b ? a : b);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFe5e7eb),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  'Top Research Areas',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1f2937),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Column(
              children: topResearchAreas!.asMap().entries.map((entry) {
                final index = entry.key;
                final area = entry.value;
                final name = area['name'] as String;
                final count = area['publication_count'] as int;
                final barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0.0;

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: _buildResearchAreaItem(
                    rank: index + 1,
                    name: name,
                    count: count,
                    barWidth: barWidth,
                    isTop: index == 0,
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResearchAreaItem({
    required int rank,
    required String name,
    required int count,
    required double barWidth,
    required bool isTop,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFf8fafc),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: isTop
                    ? [const Color(0xFFf59e0b), const Color(0xFFd97706)]
                    : [const Color(0xFF3b82f6), const Color(0xFF2563eb)],
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                rank.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1f2937),
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 6,
                        decoration: BoxDecoration(
                          color: const Color(0xFFe5e7eb),
                          borderRadius: BorderRadius.circular(3),
                        ),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: barWidth / 100,
                          child: Container(
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF3b82f6), Color(0xFF2563eb)],
                              ),
                              borderRadius: BorderRadius.circular(3),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 15),
                    Text(
                      '$count paper${count == 1 ? '' : 's'}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF6b7280),
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
}