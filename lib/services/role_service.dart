// services/role_service.dart
import '../data/models/user.dart';

class RoleService {
  static final RoleService _instance = RoleService._internal();
  factory RoleService() => _instance;
  RoleService._internal();

  // Switch user role
  Future<User> switchRole(User currentUser, UserRole targetRole) async {
    try {
      // Validate role switch
      if (!_canSwitchToRole(currentUser, targetRole)) {
        throw Exception('Cannot switch to ${targetRole.name} role');
      }

      // Update user roles
      final updatedRoles = List<UserRole>.from(currentUser.roles);
      
      if (!updatedRoles.contains(targetRole)) {
        updatedRoles.add(targetRole);
      }

      // Create updated user with new role
      final updatedUser = User(
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        profilePicture: currentUser.profilePicture,
        universityId: currentUser.universityId,
        university: currentUser.university,
        department: currentUser.department,
        position: currentUser.position,
        labName: currentUser.labName,
        advisorName: currentUser.advisorName,
        advisorEmail: currentUser.advisorEmail,
        researchArea: currentUser.researchArea,
        publications: currentUser.publications,
        verificationStatus: currentUser.verificationStatus,
        roles: updatedRoles,
        isLabMember: currentUser.isLabMember,
        verificationDate: currentUser.verificationDate,
        verificationMethod: currentUser.verificationMethod,
        joinedDate: currentUser.joinedDate,
        reviewCount: currentUser.reviewCount,
        helpfulVotes: currentUser.helpfulVotes,
        isServiceProvider: targetRole == UserRole.provider ? true : currentUser.isServiceProvider,
        providerRating: currentUser.providerRating,
        servicesCompleted: currentUser.servicesCompleted,
        serviceTypes: currentUser.serviceTypes,
        bio: currentUser.bio,
        hourlyRate: currentUser.hourlyRate,
        isAvailable: currentUser.isAvailable,
        specialties: currentUser.specialties,
      );

      // Update backend
      await _updateUserRole(updatedUser);
      
      return updatedUser;
    } catch (e) {
      throw Exception('Failed to switch role: $e');
    }
  }

  // Check if user can switch to target role
  bool _canSwitchToRole(User user, UserRole targetRole) {
    switch (targetRole) {
      case UserRole.seeker:
        // Anyone can be a seeker
        return true;
      case UserRole.provider:
        // Must be verified and lab member to be a provider
        return user.canProvideServices;
      case UserRole.admin:
        // Admin role requires special privileges
        return false;
    }
  }

  // Get role-specific features
  Map<String, dynamic> getRoleFeatures(UserRole role) {
    switch (role) {
      case UserRole.seeker:
        return {
          'name': 'Student',
          'description': 'Browse services, reviews, and get guidance',
          'features': [
            'Browse lab reviews',
            'Book mock interviews',
            'Request CV feedback',
            'Access AI tools',
            'Join study groups',
          ],
          'restrictions': [],
        };
      case UserRole.provider:
        return {
          'name': 'Service Provider',
          'description': 'Offer services and earn money helping students',
          'features': [
            'Offer mock interviews',
            'Provide CV feedback',
            'Write lab reviews',
            'Set your own rates',
            'Manage availability',
            'Track earnings',
            'Access provider analytics',
          ],
          'restrictions': [
            'Must maintain good ratings',
            'Subject to quality reviews',
          ],
        };
      case UserRole.admin:
        return {
          'name': 'Administrator',
          'description': 'Manage platform and moderate content',
          'features': [
            'Moderate reviews',
            'Manage users',
            'Access analytics',
            'Handle disputes',
          ],
          'restrictions': [],
        };
    }
  }

  // Get recommended services for user
  List<String> getRecommendedServices(User user) {
    final services = <String>[];
    
    if (user.researchArea?.isNotEmpty == true) {
      services.add('Research-specific mock interviews');
    }
    
    if (user.position?.toLowerCase().contains('phd') == true) {
      services.add('PhD interview preparation');
    }
    
    if (user.publications.isNotEmpty) {
      services.add('Publication discussion sessions');
    }
    
    services.addAll([
      'General mock interviews',
      'CV review and feedback',
      'Lab culture insights',
    ]);
    
    return services;
  }

  // Calculate provider eligibility score
  double calculateProviderScore(User user) {
    double score = 0.0;
    
    // Base verification bonus
    if (user.isVerified) score += 30.0;
    if (user.isLabMember) score += 20.0;
    
    // Experience factors
    score += user.publications.length * 5.0;
    score += (user.reviewCount * 2.0);
    score += (user.helpfulVotes * 1.0);
    
    // Position bonus
    if (user.position?.toLowerCase().contains('phd') == true) {
      score += 15.0;
    } else if (user.position?.toLowerCase().contains('postdoc') == true) {
      score += 25.0;
    }
    
    // Research area specificity
    if (user.researchArea?.isNotEmpty == true) score += 10.0;
    
    return score.clamp(0.0, 100.0);
  }

  // Get provider onboarding steps
  List<Map<String, dynamic>> getProviderOnboardingSteps(User user) {
    return [
      {
        'title': 'Complete Profile',
        'description': 'Add your bio, research interests, and photo',
        'completed': user.bio?.isNotEmpty == true,
        'required': true,
      },
      {
        'title': 'Set Service Types',
        'description': 'Choose which services you want to offer',
        'completed': user.serviceTypes.isNotEmpty,
        'required': true,
      },
      {
        'title': 'Configure Pricing',
        'description': 'Set your hourly rates for different services',
        'completed': user.hourlyRate != null,
        'required': true,
      },
      {
        'title': 'Add Specialties',
        'description': 'List your areas of expertise',
        'completed': user.specialties.isNotEmpty,
        'required': false,
      },
      {
        'title': 'Upload Portfolio',
        'description': 'Add examples of your work or publications',
        'completed': user.publications.isNotEmpty,
        'required': false,
      },
      {
        'title': 'Set Availability',
        'description': 'Configure your working hours and schedule',
        'completed': user.isAvailable,
        'required': true,
      },
    ];
  }

  // Mock API call to update user role
  Future<void> _updateUserRole(User user) async {
    // Simulate API delay
    await Future.delayed(const Duration(milliseconds: 500));
    
    // In a real app, this would make an HTTP request to update the user
    // For now, we'll just simulate success
    print('Updated user role to: ${user.roles.map((r) => r.name).join(', ')}');
  }

  // Get role-specific dashboard route
  String getRoleDashboardRoute(UserRole role) {
    switch (role) {
      case UserRole.seeker:
        return '/';
      case UserRole.provider:
        return '/provider-dashboard';
      case UserRole.admin:
        return '/admin-dashboard';
    }
  }

  // Check if user needs onboarding
  bool needsProviderOnboarding(User user) {
    if (!user.isServiceProvider) return true;
    
    final steps = getProviderOnboardingSteps(user);
    final requiredSteps = steps.where((step) => step['required'] == true);
    final completedRequired = requiredSteps.where((step) => step['completed'] == true);
    
    return completedRequired.length < requiredSteps.length;
  }
}