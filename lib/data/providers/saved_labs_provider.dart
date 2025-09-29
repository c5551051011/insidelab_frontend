// data/providers/saved_labs_provider.dart
import 'package:flutter/material.dart';
import '../models/lab.dart';
import '../../services/saved_labs_service.dart';

class SavedLabsProvider extends ChangeNotifier {
  List<LabInterest> _labInterests = [];
  Set<String> _interestedLabIds = {};
  Map<LabInterestType, List<LabInterest>> _interestsByType = {};
  bool _isLoading = false;
  bool _hasLoadedInterests = false;
  String? _error;

  // Getters
  List<LabInterest> get labInterests => _labInterests;
  Set<String> get interestedLabIds => _interestedLabIds;
  Map<LabInterestType, List<LabInterest>> get interestsByType => _interestsByType;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasLoadedInterests => _hasLoadedInterests;

  int get totalInterestCount => _labInterests.length;

  /// Get interests by type
  List<LabInterest> getInterestsByType(LabInterestType type) {
    return _interestsByType[type] ?? [];
  }

  /// Check if a lab has any interest
  bool isLabInterested(String labId) {
    return _interestedLabIds.contains(labId);
  }

  /// Get the interest for a specific lab
  LabInterest? getLabInterest(String labId) {
    try {
      return _labInterests.firstWhere(
        (interest) => interest.labId.toString() == labId,
      );
    } catch (e) {
      return null;
    }
  }

  /// Legacy getter for backward compatibility
  @deprecated
  List<Lab> get savedLabs => [];

  @deprecated
  Set<String> get savedLabIds => _interestedLabIds;

  @deprecated
  bool get hasLoadedSavedIds => _hasLoadedInterests;

  @deprecated
  int get savedLabCount => _labInterests.length;

  /// Check if a lab is saved (legacy method)
  @deprecated
  bool isLabSaved(String labId) {
    return isLabInterested(labId);
  }

  /// Load all lab interests
  Future<void> loadLabInterests() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _labInterests = await SavedLabsService.getLabInterests();
      _interestedLabIds = _labInterests.map((interest) => interest.labId.toString()).toSet();
      _groupInterestsByType();
      _hasLoadedInterests = true;
    } catch (e) {
      _error = e.toString();
      _labInterests = [];
      _interestedLabIds = {};
      _interestsByType = {};
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load only the interested lab IDs for efficient checking
  Future<void> loadInterestedLabIds() async {
    if (_hasLoadedInterests) return;

    try {
      _interestedLabIds = await SavedLabsService.getInterestedLabIds();
      _hasLoadedInterests = true;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _interestedLabIds = {};
    }
  }

  /// Group interests by type
  void _groupInterestsByType() {
    _interestsByType.clear();
    for (final interest in _labInterests) {
      _interestsByType.putIfAbsent(interest.interestType, () => []).add(interest);
    }
  }

  /// Legacy methods for backward compatibility
  @deprecated
  Future<void> loadSavedLabs() async {
    await loadLabInterests();
  }

  @deprecated
  Future<void> loadSavedLabIds() async {
    await loadInterestedLabIds();
  }

  /// Add or update lab interest
  Future<bool> addLabInterest(
    String labId, {
    LabInterestType interestType = LabInterestType.general,
    String? notes,
  }) async {
    try {
      final result = await SavedLabsService.toggleLabInterest(
        labId,
        interestType: interestType,
        notes: notes,
      );

      if (result != null) {
        // Update local state
        _interestedLabIds.add(labId);

        // Remove existing interest for this lab if any
        _labInterests.removeWhere((interest) => interest.labId.toString() == labId);

        // Add new interest
        _labInterests.insert(0, result);

        _groupInterestsByType();
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Remove lab interest
  Future<bool> removeLabInterest(String labId) async {
    try {
      final success = await SavedLabsService.removeLabInterest(labId);
      if (success) {
        _interestedLabIds.remove(labId);
        _labInterests.removeWhere((interest) => interest.labId.toString() == labId);
        _groupInterestsByType();
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Update interest type for a lab
  Future<bool> updateInterestType(String labId, LabInterestType newType, {String? notes}) async {
    try {
      final currentInterest = getLabInterest(labId);
      if (currentInterest == null) return false;

      final result = await SavedLabsService.toggleLabInterest(
        labId,
        interestType: newType,
        notes: notes ?? currentInterest.notes,
      );

      if (result != null) {
        // Update local state
        _labInterests.removeWhere((interest) => interest.labId.toString() == labId);
        _labInterests.insert(0, result);
        _groupInterestsByType();
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  /// Legacy methods for backward compatibility
  @deprecated
  Future<bool> saveLab(Lab lab) async {
    return await addLabInterest(lab.id);
  }

  @deprecated
  Future<bool> unsaveLab(String labId) async {
    return await removeLabInterest(labId);
  }

  @deprecated
  Future<bool> toggleLabSave(Lab lab) async {
    final isCurrentlyInterested = isLabInterested(lab.id);

    if (isCurrentlyInterested) {
      return await removeLabInterest(lab.id);
    } else {
      return await addLabInterest(lab.id);
    }
  }

  /// Remove a lab interest (for UI operations)
  void removeLabInterestLocal(String labId) {
    _interestedLabIds.remove(labId);
    _labInterests.removeWhere((interest) => interest.labId.toString() == labId);
    _groupInterestsByType();
    notifyListeners();
  }

  /// Clear all lab interests (for logout)
  void clearLabInterests() {
    _labInterests.clear();
    _interestedLabIds.clear();
    _interestsByType.clear();
    _hasLoadedInterests = false;
    _error = null;
    notifyListeners();
  }

  /// Refresh lab interests data
  Future<void> refreshLabInterests() async {
    _hasLoadedInterests = false;
    await loadLabInterests();
  }

  /// Clear error message
  void clearError() {
    _error = null;
    notifyListeners();
  }

  /// Legacy methods for backward compatibility
  @deprecated
  void removeSavedLab(String labId) {
    removeLabInterestLocal(labId);
  }

  @deprecated
  void clearSavedLabs() {
    clearLabInterests();
  }

  @deprecated
  Future<void> refreshSavedLabs() async {
    await refreshLabInterests();
  }
}