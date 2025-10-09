import 'package:flutter/material.dart';

// ============================================
// 1. 데이터 모델
// ============================================
class MetricData {
  final String icon;
  final String value;
  final String label;
  final String? trend;
  final Color? accentColor;

  const MetricData({
    required this.icon,
    required this.value,
    required this.label,
    this.trend,
    this.accentColor,
  });
}

// ============================================
// 2. 재사용 가능한 메트릭 카드 위젯
// ============================================
class MetricCard extends StatefulWidget {
  final MetricData data;
  final VoidCallback? onTap;

  const MetricCard({
    Key? key,
    required this.data,
    this.onTap,
  }) : super(key: key);

  @override
  State<MetricCard> createState() => _MetricCardState();
}

class _MetricCardState extends State<MetricCard>
    with SingleTickerProviderStateMixin {
  bool _isHovered = false;
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _elevationAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.02,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    ));

    _elevationAnimation = Tween<double>(
      begin: 2.0,
      end: 12.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    ));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleHover(bool isHovered) {
    setState(() {
      _isHovered = isHovered;
    });
    if (isHovered) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
  }

  @override
  Widget build(BuildContext context) {
    final accentColor = widget.data.accentColor ?? const Color(0xFF3B82F6);

    return MouseRegion(
      cursor: widget.onTap != null
          ? SystemMouseCursors.click
          : SystemMouseCursors.basic,
      onEnter: (_) => _handleHover(true),
      onExit: (_) => _handleHover(false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Transform.scale(
              scale: _scaleAnimation.value,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeOutCubic,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _isHovered ? accentColor : Colors.transparent,
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: _isHovered
                          ? accentColor.withOpacity(0.15)
                          : Colors.black.withOpacity(0.05),
                      blurRadius: _elevationAnimation.value,
                      offset: Offset(0, _elevationAnimation.value / 2),
                    ),
                  ],
                ),
                child: child,
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon
                Text(
                  widget.data.icon,
                  style: const TextStyle(fontSize: 24),
                ),
                const SizedBox(height: 8),

                // Value
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    widget.data.value,
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1F2937),
                      height: 1.1,
                    ),
                  ),
                ),
                const SizedBox(height: 4),

                // Label
                Text(
                  widget.data.label,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF6B7280),
                    height: 1.3,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),

                // Trend (optional)
                if (widget.data.trend != null) ...[
                  const SizedBox(height: 6),
                  Flexible(
                    child: Text(
                      widget.data.trend!,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF10B981),
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ============================================
// 3. 반응형 메트릭 그리드
// ============================================
class ResponsiveMetricsGrid extends StatelessWidget {
  final List<MetricData> metrics;
  final Function(int)? onMetricTap;

  const ResponsiveMetricsGrid({
    Key? key,
    required this.metrics,
    this.onMetricTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // 반응형 컬럼 수 및 간격 계산
        int crossAxisCount;
        double spacing;
        double childAspectRatio;

        if (constraints.maxWidth < 600) {
          // Mobile
          crossAxisCount = 2;
          spacing = 12;
          childAspectRatio = 1.0;
        } else if (constraints.maxWidth < 900) {
          // Tablet
          crossAxisCount = 3;
          spacing = 16;
          childAspectRatio = 1.1;
        } else if (constraints.maxWidth < 1200) {
          // Small Desktop
          crossAxisCount = 4;
          spacing = 16;
          childAspectRatio = 1.0;
        } else {
          // Large Desktop
          crossAxisCount = 5;
          spacing = 16;
          childAspectRatio = 0.95;
        }

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: spacing,
            mainAxisSpacing: spacing,
            childAspectRatio: childAspectRatio,
          ),
          itemCount: metrics.length,
          itemBuilder: (context, index) {
            return MetricCard(
              data: metrics[index],
              onTap: onMetricTap != null
                  ? () => onMetricTap!(index)
                  : null,
            );
          },
        );
      },
    );
  }
}