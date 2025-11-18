// presentation/widgets/common/card_widget.dart
import 'package:flutter/material.dart';

class CardWidget extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final Color? backgroundColor;
  final Color? borderColor;
  final double? borderRadius;
  final List<BoxShadow>? boxShadow;

  const CardWidget({
    Key? key,
    required this.child,
    this.padding,
    this.backgroundColor,
    this.borderColor,
    this.borderRadius,
    this.boxShadow,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding ?? const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: backgroundColor ?? Colors.white,
        borderRadius: BorderRadius.circular(borderRadius ?? 12),
        border: Border.all(
          color: borderColor ?? const Color(0xFFe5e7eb),
        ),
        boxShadow: boxShadow ?? [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}

class CardTitle extends StatelessWidget {
  final String title;
  final String? icon;
  final TextStyle? textStyle;

  const CardTitle({
    Key? key,
    required this.title,
    this.icon,
    this.textStyle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (icon != null) ...[
          Text(
            icon!,
            style: const TextStyle(fontSize: 20),
          ),
          const SizedBox(width: 8),
        ],
        Text(
          title,
          style: textStyle ?? const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1f2937),
          ),
        ),
      ],
    );
  }
}