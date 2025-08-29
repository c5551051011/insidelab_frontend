// presentation/widgets/common/app_bar_widget.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class InsideLabAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final List<Widget>? actions;
  final bool showBackButton;

  const InsideLabAppBar({
    Key? key,
    this.title,
    this.actions,
    this.showBackButton = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: title != null
          ? Text(title!)
          : const Text(
        '🔬 InsideLab',
        style: TextStyle(
          color: AppColors.primary,
          fontWeight: FontWeight.bold,
        ),
      ),
      leading: showBackButton && Navigator.canPop(context)
          ? IconButton(
        icon: const Icon(Icons.arrow_back_ios),
        onPressed: () => Navigator.pop(context),
      )
          : null,
      actions: actions ??
          [
            TextButton(
              onPressed: () {
                // TODO: Navigate to sign in
              },
              child: const Text('Sign In'),
            ),
            const SizedBox(width: 16),
          ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}


