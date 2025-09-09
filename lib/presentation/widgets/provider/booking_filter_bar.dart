// presentation/widgets/provider/booking_filter_bar.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class BookingFilterBar extends StatelessWidget {
  final String sortBy;
  final Function(String) onSortChanged;
  final Function(Map<String, dynamic>) onFilterChanged;

  const BookingFilterBar({
    Key? key,
    required this.sortBy,
    required this.onSortChanged,
    required this.onFilterChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          _buildSortDropdown(),
          const SizedBox(width: 16),
          _buildDateFilter(),
          const SizedBox(width: 16),
          _buildAmountFilter(),
          const Spacer(),
          _buildSearchField(),
        ],
      ),
    );
  }

  Widget _buildSortDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButton<String>(
        value: sortBy,
        underline: const SizedBox(),
        icon: Icon(Icons.keyboard_arrow_down, color: AppColors.textSecondary),
        items: const [
          DropdownMenuItem(value: 'date_desc', child: Text('Latest First')),
          DropdownMenuItem(value: 'date_asc', child: Text('Oldest First')),
          DropdownMenuItem(value: 'amount_desc', child: Text('Highest Amount')),
          DropdownMenuItem(value: 'amount_asc', child: Text('Lowest Amount')),
        ],
        onChanged: (value) {
          if (value != null) onSortChanged(value);
        },
      ),
    );
  }

  Widget _buildDateFilter() {
    return OutlinedButton.icon(
      onPressed: () => _showDateFilter(),
      icon: const Icon(Icons.date_range, size: 16),
      label: const Text('Date Range'),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
    );
  }

  Widget _buildAmountFilter() {
    return OutlinedButton.icon(
      onPressed: () => _showAmountFilter(),
      icon: const Icon(Icons.attach_money, size: 16),
      label: const Text('Amount'),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
    );
  }

  Widget _buildSearchField() {
    return SizedBox(
      width: 200,
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search bookings...',
          hintStyle: TextStyle(color: AppColors.textSecondary),
          prefixIcon: Icon(Icons.search, color: AppColors.textSecondary),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide(color: AppColors.border),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          isDense: true,
        ),
        onChanged: (value) {
          onFilterChanged({'search': value});
        },
      ),
    );
  }

  void _showDateFilter() {
    // TODO: Implement date range picker
  }

  void _showAmountFilter() {
    // TODO: Implement amount range picker
  }
}