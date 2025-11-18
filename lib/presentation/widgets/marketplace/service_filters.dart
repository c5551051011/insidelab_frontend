// presentation/widgets/marketplace/service_filters.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/service.dart';

class ServiceFilters extends StatefulWidget {
  final ServiceFilter filter;
  final Function(ServiceFilter) onFilterChanged;
  final bool isCompact;

  const ServiceFilters({
    Key? key,
    required this.filter,
    required this.onFilterChanged,
    this.isCompact = false,
  }) : super(key: key);

  @override
  State<ServiceFilters> createState() => _ServiceFiltersState();
}

class _ServiceFiltersState extends State<ServiceFilters> {
  late ServiceFilter _currentFilter;
  final RangeValues _priceRange = const RangeValues(0, 500);
  double _minRating = 0.0;

  @override
  void initState() {
    super.initState();
    _currentFilter = widget.filter;
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isCompact) {
      return _buildCompactFilters();
    }
    return _buildFullFilters();
  }

  Widget _buildFullFilters() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Filters',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 24),
          _buildServiceTypeFilter(),
          const SizedBox(height: 24),
          _buildPriceFilter(),
          const SizedBox(height: 24),
          _buildRatingFilter(),
          const SizedBox(height: 24),
          _buildAvailabilityFilter(),
          const SizedBox(height: 24),
          _buildDurationFilter(),
          const SizedBox(height: 80), // Extra padding at bottom
        ],
      ),
    );
  }

  Widget _buildCompactFilters() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _buildServiceTypeFilterCompact()),
            const SizedBox(width: 16),
            Expanded(child: _buildPriceFilterCompact()),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(child: _buildRatingFilterCompact()),
            const SizedBox(width: 16),
            Expanded(child: _buildAvailabilityFilterCompact()),
          ],
        ),
      ],
    );
  }

  Widget _buildServiceTypeFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Service Type',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        ...ServiceType.values.take(4).map((type) => CheckboxListTile(
          title: Text(
            _getServiceTypeDisplayName(type),
            style: const TextStyle(fontSize: 14),
          ),
          value: _currentFilter.types.contains(type),
          onChanged: (value) {
            final newTypes = Set<ServiceType>.from(_currentFilter.types);
            if (value == true) {
              newTypes.add(type);
            } else {
              newTypes.remove(type);
            }
            _updateFilter(_currentFilter.copyWith(types: newTypes));
          },
          dense: true,
          contentPadding: EdgeInsets.zero,
          controlAffinity: ListTileControlAffinity.leading,
        )),
        if (ServiceType.values.length > 4)
          TextButton(
            onPressed: () {
              // TODO: Show more service types in a dialog
            },
            child: Text(
              '+${ServiceType.values.length - 4} more',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.primary,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildServiceTypeFilterCompact() {
    return DropdownButtonFormField<ServiceType?>(
      decoration: const InputDecoration(
        labelText: 'Service Type',
        border: OutlineInputBorder(),
        isDense: true,
      ),
      value: _currentFilter.types.isEmpty ? null : _currentFilter.types.first,
      items: [
        const DropdownMenuItem(value: null, child: Text('All Types')),
        ...ServiceType.values.map((type) => DropdownMenuItem(
          value: type,
          child: Text(_getServiceTypeDisplayName(type)),
        )),
      ],
      onChanged: (value) {
        final newTypes = value != null ? {value} : <ServiceType>{};
        _updateFilter(_currentFilter.copyWith(types: newTypes));
      },
    );
  }

  Widget _buildPriceFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Price Range',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        RangeSlider(
          values: RangeValues(
            _currentFilter.minPrice ?? 0,
            _currentFilter.maxPrice ?? 500,
          ),
          min: 0,
          max: 500,
          divisions: 10,
          labels: RangeLabels(
            '\$${(_currentFilter.minPrice ?? 0).toInt()}',
            '\$${(_currentFilter.maxPrice ?? 500).toInt()}',
          ),
          onChanged: (values) {
            _updateFilter(_currentFilter.copyWith(
              minPrice: values.start == 0 ? null : values.start,
              maxPrice: values.end == 500 ? null : values.end,
            ));
          },
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('\$0', style: TextStyle(color: AppColors.textSecondary)),
            Text('\$500+', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      ],
    );
  }

  Widget _buildPriceFilterCompact() {
    return Row(
      children: [
        Expanded(
          child: TextFormField(
            decoration: const InputDecoration(
              labelText: 'Min Price',
              border: OutlineInputBorder(),
              isDense: true,
              prefixText: '\$',
            ),
            keyboardType: TextInputType.number,
            initialValue: _currentFilter.minPrice?.toInt().toString() ?? '',
            onChanged: (value) {
              final price = double.tryParse(value);
              _updateFilter(_currentFilter.copyWith(minPrice: price));
            },
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: TextFormField(
            decoration: const InputDecoration(
              labelText: 'Max Price',
              border: OutlineInputBorder(),
              isDense: true,
              prefixText: '\$',
            ),
            keyboardType: TextInputType.number,
            initialValue: _currentFilter.maxPrice?.toInt().toString() ?? '',
            onChanged: (value) {
              final price = double.tryParse(value);
              _updateFilter(_currentFilter.copyWith(maxPrice: price));
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRatingFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Minimum Rating',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [4.0, 4.5, 5.0].map((rating) => InkWell(
            onTap: () {
              final newRating = _currentFilter.minRating == rating ? null : rating;
              _updateFilter(_currentFilter.copyWith(minRating: newRating));
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: _currentFilter.minRating == rating 
                    ? AppColors.primary 
                    : Colors.transparent,
                border: Border.all(
                  color: _currentFilter.minRating == rating 
                      ? AppColors.primary 
                      : AppColors.border,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.star,
                    color: _currentFilter.minRating == rating 
                        ? Colors.white 
                        : Colors.amber,
                    size: 16,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${rating.toString()}+',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: _currentFilter.minRating == rating 
                          ? Colors.white 
                          : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          )).toList(),
        ),
      ],
    );
  }

  Widget _buildRatingFilterCompact() {
    return DropdownButtonFormField<double?>(
      decoration: const InputDecoration(
        labelText: 'Min Rating',
        border: OutlineInputBorder(),
        isDense: true,
      ),
      value: _currentFilter.minRating,
      items: [
        const DropdownMenuItem(value: null, child: Text('Any Rating')),
        ...const [1.0, 2.0, 3.0, 4.0, 4.5].map((rating) => DropdownMenuItem(
          value: rating,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.star, color: Colors.amber, size: 16),
              const SizedBox(width: 4),
              Text('${rating.toString()}+'),
            ],
          ),
        )),
      ],
      onChanged: (value) {
        _updateFilter(_currentFilter.copyWith(minRating: value));
      },
    );
  }

  Widget _buildAvailabilityFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Availability',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        CheckboxListTile(
          title: const Text('Available now'),
          subtitle: const Text('Can start within 24 hours'),
          value: _currentFilter.onlyAvailableNow,
          onChanged: (value) {
            _updateFilter(_currentFilter.copyWith(onlyAvailableNow: value ?? false));
          },
          dense: true,
          contentPadding: EdgeInsets.zero,
          controlAffinity: ListTileControlAffinity.leading,
        ),
      ],
    );
  }

  Widget _buildAvailabilityFilterCompact() {
    return CheckboxListTile(
      title: const Text('Available Now'),
      value: _currentFilter.onlyAvailableNow,
      onChanged: (value) {
        _updateFilter(_currentFilter.copyWith(onlyAvailableNow: value ?? false));
      },
      dense: true,
      contentPadding: EdgeInsets.zero,
      controlAffinity: ListTileControlAffinity.leading,
    );
  }

  Widget _buildDurationFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Session Duration',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        ...SessionDuration.values.map((duration) => RadioListTile<SessionDuration?>(
          title: Text(_getDurationDisplayName(duration)),
          value: duration,
          groupValue: _currentFilter.preferredDuration,
          onChanged: (value) {
            final newDuration = value == _currentFilter.preferredDuration ? null : value;
            _updateFilter(_currentFilter.copyWith(preferredDuration: newDuration));
          },
          dense: true,
          contentPadding: EdgeInsets.zero,
        )),
      ],
    );
  }

  void _updateFilter(ServiceFilter newFilter) {
    setState(() {
      _currentFilter = newFilter;
    });
    widget.onFilterChanged(newFilter);
  }

  String _getServiceTypeDisplayName(ServiceType type) {
    switch (type) {
      case ServiceType.mockInterview:
        return 'Mock Interview';
      case ServiceType.cvReview:
        return 'CV Review';
      case ServiceType.sopEditing:
        return 'SOP Editing';
      case ServiceType.mentorship:
        return 'Mentorship';
      case ServiceType.researchGuidance:
        return 'Research Guidance';
      case ServiceType.applicationReview:
        return 'Application Review';
      case ServiceType.custom:
        return 'Custom Service';
    }
  }

  String _getDurationDisplayName(SessionDuration duration) {
    switch (duration) {
      case SessionDuration.thirtyMinutes:
        return '30 minutes';
      case SessionDuration.sixtyMinutes:
        return '60 minutes';
      case SessionDuration.ninetyMinutes:
        return '90 minutes';
      case SessionDuration.twoHours:
        return '2 hours';
    }
  }
}