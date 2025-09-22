import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/router/app_routes.dart';
import '../../../data/providers/data_providers.dart';
import '../../../data/models/user.dart';
import 'role_switcher.dart';

class HeaderNavigation extends StatefulWidget implements PreferredSizeWidget {
  const HeaderNavigation({Key? key}) : super(key: key);

  @override
  State<HeaderNavigation> createState() => _HeaderNavigationState();

  @override
  Size get preferredSize => const Size.fromHeight(72);
}

class _HeaderNavigationState extends State<HeaderNavigation> {
  final ScrollController _scrollController = ScrollController();
  bool _isScrolled = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.hasClients) {
      final isScrolled = _scrollController.offset > 0;
      if (isScrolled != _isScrolled) {
        setState(() {
          _isScrolled = isScrolled;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 72,
      decoration: BoxDecoration(
        color: _isScrolled 
            ? AppColors.background
            : AppColors.background.withOpacity(0.95),
        border: Border(
          bottom: BorderSide(
            color: AppColors.border,
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Row(
            children: [
              _buildLogo(context),
              const Spacer(),
              if (MediaQuery.of(context).size.width >= 850)
                Expanded(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      _buildDesktopMenu(context),
                      const SizedBox(width: 16),
                      Consumer<AuthProvider>(
                        builder: (context, authProvider, child) {
                          final user = authProvider.currentUser;
                          if (user?.canProvideServices == true) {
                            return Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                RoleSwitcher(showIcon: false),
                                const SizedBox(width: 16),
                              ],
                            );
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                      _buildAuthButtons(context),
                    ],
                  ),
                )
              else
                _buildMobileMenuButton(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLogo(BuildContext context) {
    return InkWell(
      onTap: () => context.go('/'),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Text(
          'Insidelab',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
            fontFamily: 'Inter',
          ),
        ),
      ),
    );
  }

  Widget _buildDesktopMenu(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    // Adjust menu items based on available width
    if (screenWidth < 950) {
      return Flexible(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(child: _buildNavItem(context, 'Labs', '/search')),
            const SizedBox(width: 8),
            Flexible(child: _buildNavItem(context, 'Services', '/services')),
          ],
        ),
      );
    } else if (screenWidth < 1100) {
      return Flexible(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(child: _buildNavItem(context, 'Labs', '/search')),
            const SizedBox(width: 12),
            Flexible(child: _buildNavItem(context, 'Marketplace', '/marketplace')),
            const SizedBox(width: 12),
            Flexible(child: _buildNavItem(context, 'Services', '/services')),
          ],
        ),
      );
    }

    return Flexible(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(child: _buildNavItem(context, 'Labs', '/search')),
          const SizedBox(width: 16),
          Flexible(child: _buildNavItem(context, 'Marketplace', '/marketplace')),
          const SizedBox(width: 16),
          Flexible(child: _buildNavItem(context, 'Services', '/services')),
          const SizedBox(width: 16),
          Flexible(child: _buildNavItem(context, 'Success Stories', '/')),
        ],
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, String title, String route) {
    return InkWell(
      onTap: () => context.go(route),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
        ),
      ),
    );
  }

  Widget _buildAuthButtons(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        if (authProvider.isAuthenticated) {
          return _buildUserMenu(context, authProvider);
        } else {
          return Row(
            children: [
              TextButton(
                onPressed: () => context.go('/sign-in'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
                child: const Text(
                  'Log In',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: () => context.go('/sign-up'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.buttonPrimary,
                  foregroundColor: AppColors.buttonText,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Sign Up',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          );
        }
      },
    );
  }

  Widget _buildUserMenu(BuildContext context, AuthProvider authProvider) {
    final user = authProvider.currentUser;
    
    return PopupMenuButton<String>(
      offset: const Offset(0, 40),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: AppColors.primary,
                  child: Text(
                    user?.email.substring(0, 1).toUpperCase() ?? 'U',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
                if (user?.isVerified == true)
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      child: const Icon(
                        Icons.check,
                        size: 6,
                        color: Colors.white,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  user?.displayName ?? 'User',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (user?.isVerified == true)
                  Text(
                    user!.verificationBadge,
                    style: TextStyle(
                      fontSize: 10,
                      color: AppColors.success,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 4),
            const Icon(Icons.keyboard_arrow_down, size: 20),
          ],
        ),
      ),
      onSelected: (value) async {
        switch (value) {
          case 'profile':
            context.go('/profile');
            break;
          case 'my_reviews':
            context.go('/profile/my-reviews');
            break;
          case 'verification':
            context.go('/verification');
            break;
          case 'provider_dashboard':
            context.go('/provider/dashboard');
            break;
          case 'my_services':
            context.go('/provider/services');
            break;
          case 'earnings':
            context.go('/provider/earnings');
            break;
          case 'switch_to_seeker':
            _showRoleSwitchDialog(context, UserRole.seeker);
            break;
          case 'switch_to_provider':
            _showRoleSwitchDialog(context, UserRole.provider);
            break;
          case 'logout':
            await authProvider.signOut();
            if (context.mounted) {
              context.go('/');
            }
            break;
        }
      },
      itemBuilder: (context) => _buildMenuItems(user),
    );
  }

  List<PopupMenuEntry<String>> _buildMenuItems(User? user) {
    List<PopupMenuEntry<String>> items = [];
    
    // Profile section
    items.addAll([
      const PopupMenuItem(
        value: 'profile',
        child: Row(
          children: [
            Icon(Icons.person, size: 20),
            SizedBox(width: 8),
            Text('My Profile'),
          ],
        ),
      ),
      const PopupMenuItem(
        value: 'my_reviews',
        child: Row(
          children: [
            Icon(Icons.rate_review, size: 20),
            SizedBox(width: 8),
            Text('My Reviews'),
          ],
        ),
      ),
    ]);

    // Verification section
    if (user?.isVerified != true) {
      items.add(
        const PopupMenuItem(
          value: 'verification',
          child: Row(
            children: [
              Icon(Icons.verified_user, size: 20),
              SizedBox(width: 8),
              Text('Get Verified'),
            ],
          ),
        ),
      );
    }

    // Provider section (if verified)
    if (user?.canProvideServices == true) {
      items.addAll([
        const PopupMenuDivider(),
        PopupMenuItem(
          enabled: false,
          child: Text(
            'SERVICE PROVIDER',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
        ),
        const PopupMenuItem(
          value: 'provider_dashboard',
          child: Row(
            children: [
              Icon(Icons.dashboard, size: 20),
              SizedBox(width: 8),
              Text('Provider Dashboard'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: 'my_services',
          child: Row(
            children: [
              Icon(Icons.work, size: 20),
              SizedBox(width: 8),
              Text('My Services'),
            ],
          ),
        ),
        const PopupMenuItem(
          value: 'earnings',
          child: Row(
            children: [
              Icon(Icons.account_balance_wallet, size: 20),
              SizedBox(width: 8),
              Text('Earnings'),
            ],
          ),
        ),
      ]);
    }

    // Role switching (if verified and has multiple roles)
    if (user?.isVerified == true && user?.roles.length == 1) {
      items.addAll([
        const PopupMenuDivider(),
        if (user!.hasRole(UserRole.seeker))
          const PopupMenuItem(
            value: 'switch_to_provider',
            child: Row(
              children: [
                Icon(Icons.swap_horiz, size: 20),
                SizedBox(width: 8),
                Text('Become Service Provider'),
              ],
            ),
          ),
        if (user.hasRole(UserRole.provider))
          const PopupMenuItem(
            value: 'switch_to_seeker',
            child: Row(
              children: [
                Icon(Icons.swap_horiz, size: 20),
                SizedBox(width: 8),
                Text('Browse as Student'),
              ],
            ),
          ),
      ]);
    }

    // Logout
    items.addAll([
      const PopupMenuDivider(),
      const PopupMenuItem(
        value: 'logout',
        child: Row(
          children: [
            Icon(Icons.logout, size: 20),
            SizedBox(width: 8),
            Text('Sign Out'),
          ],
        ),
      ),
    ]);

    return items;
  }

  void _showRoleSwitchDialog(BuildContext context, UserRole targetRole) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          targetRole == UserRole.provider 
            ? 'Switch to Service Provider Mode'
            : 'Switch to Student Mode',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              targetRole == UserRole.provider
                ? 'You\'ll be able to offer services like mock interviews and CV reviews, manage your availability, and earn money.'
                : 'You\'ll browse as a student looking for services, reviews, and guidance.',
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 16),
            if (targetRole == UserRole.provider)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.success.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.verified, color: AppColors.success, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Verification confirmed! You can start offering services.',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.success,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement role switching logic
              Navigator.pop(context);
              // Navigate to appropriate dashboard
              if (targetRole == UserRole.provider) {
                context.go('/provider/dashboard');
              } else {
                context.go('/');
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: Text(
              targetRole == UserRole.provider ? 'Start Providing' : 'Browse Services'
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileMenuButton(BuildContext context) {
    return IconButton(
      onPressed: () => _showMobileMenu(context),
      icon: const Icon(
        Icons.menu,
        size: 24,
        color: AppColors.textPrimary,
      ),
    );
  }

  void _showMobileMenu(BuildContext context) {
    showDialog(
      context: context,
      barrierColor: Colors.black54,
      builder: (context) => Dialog.fullscreen(
        child: Container(
          color: AppColors.background,
          child: SafeArea(
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(24),
                  child: Row(
                    children: [
                      _buildLogo(context),
                      const Spacer(),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(
                          Icons.close,
                          size: 24,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
                // Menu Items
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildMobileNavItem(context, 'Labs', '/search'),
                        _buildMobileNavItem(context, 'Services', '/services'),
                        _buildMobileNavItem(context, 'Success Stories', '/'),
                        _buildMobileNavItem(context, 'Mock Interview', '/services/mock-interview'),
                        const SizedBox(height: 32),
                        Consumer<AuthProvider>(
                          builder: (context, authProvider, child) {
                            if (!authProvider.isAuthenticated) {
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  SizedBox(
                                    width: double.infinity,
                                    child: TextButton(
                                      onPressed: () {
                                        Navigator.pop(context);
                                        context.go('/sign-in');
                                      },
                                      child: const Text(
                                        'Log In',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton(
                                      onPressed: () {
                                        Navigator.pop(context);
                                        context.go('/sign-up');
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.buttonPrimary,
                                        foregroundColor: AppColors.buttonText,
                                        padding: const EdgeInsets.symmetric(vertical: 16),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                      ),
                                      child: const Text(
                                        'Sign Up',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            } else {
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildMobileNavItem(context, 'My Profile', '/profile'),
                                  _buildMobileNavItem(context, 'My Reviews', '/profile/my-reviews'),
                                  const SizedBox(height: 16),
                                  SizedBox(
                                    width: double.infinity,
                                    child: OutlinedButton(
                                      onPressed: () async {
                                        await authProvider.signOut();
                                        if (context.mounted) {
                                          context.go('/');
                                        }
                                      },
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: AppColors.error,
                                        side: BorderSide(color: AppColors.error),
                                        padding: const EdgeInsets.symmetric(vertical: 16),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                      ),
                                      child: const Text(
                                        'Sign Out',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMobileNavItem(BuildContext context, String title, String route) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          Navigator.pop(context);
          context.go(route);
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }
}