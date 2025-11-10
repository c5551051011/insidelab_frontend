import React, { useState, useEffect } from 'react';
import { colors, spacing } from '../theme';
import { UniversityService } from '../services/universityService';
import { ReviewService } from '../services/reviewService';
import { DropdownField } from './Dropdown';
import { useBreakpoint } from '../hooks/useBreakpoint';
import Modal from './Modal';

const UniversityDepartmentSelector = ({
  selectedUniversityId,
  selectedUniversityName,
  selectedUniversityDepartmentId,
  onUniversitySelected,
  onDepartmentSelected,
  isRequired = true,
  layout = 'responsive' // 'responsive' (default), 'vertical', 'horizontal'
}) => {
  const { isMobile } = useBreakpoint();
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [showAddUniversity, setShowAddUniversity] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);

  useEffect(() => {
    loadUniversities();
  }, []);

  useEffect(() => {
    if (selectedUniversityId) {
      loadDepartments(selectedUniversityId);
    } else {
      setDepartments([]);
    }
  }, [selectedUniversityId]);

  const loadUniversities = async () => {
    setLoadingUniversities(true);
    try {
      const universitiesList = await UniversityService.getAllUniversities();
      // Remove duplicates by ID
      const uniqueUniversities = universitiesList.filter((uni, index, arr) =>
        arr.findIndex(u => u.id === uni.id) === index
      );
      setUniversities(uniqueUniversities);
    } catch (error) {
      console.error('Error loading universities:', error);
    } finally {
      setLoadingUniversities(false);
    }
  };

  const loadDepartments = async (universityId) => {
    setLoadingDepartments(true);
    setDepartments([]);
    try {
      const departmentsList = await UniversityService.getDepartmentsByUniversity(universityId);

      // Process departments from university-specific endpoint
      // Keep both university_department_id (id) and actual department_id (department)
      const processedDepartments = departmentsList.map((dept) => ({
        id: String(dept.id), // This is university_department_id
        department: dept.department, // This is the actual department_id for API calls
        name: dept.name || dept.department_name,
        department_name: dept.name || dept.department_name
      }));

      setDepartments(processedDepartments);
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleUniversityChange = (e) => {
    const value = e.target.value;
    console.log('University change - selected value:', value);
    console.log('Available universities:', universities.map(u => ({ id: u.id, name: u.name })));

    if (value === '___ADD_NEW_UNIVERSITY___') {
      setShowAddUniversity(true);
      return;
    }

    if (value) {
      const university = universities.find(u => String(u.id) === String(value));
      console.log('Found university:', university);
      if (university) {
        console.log('Calling onUniversitySelected with:', value, university.name);
        onUniversitySelected(value, university.name);
      } else {
        console.log('University not found for value:', value);
      }
    }
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;

    if (value === '___ADD_NEW___') {
      setShowAddDepartment(true);
      return;
    }

    if (value) {
      const department = departments.find(d => d.id === value);
      if (department) {
        // Pass the department object along with id and name for proper department_id handling
        onDepartmentSelected(value, department.department_name || department.name, department);
      }
    }
  };

  const handleAddUniversity = async (universityData) => {
    try {
      console.log('📝 handleAddUniversity called with:', universityData);
      const newUniversity = await UniversityService.addUniversity(universityData);
      console.log('✅ University added successfully:', newUniversity);

      // Add the new university to the current list (no full reload)
      setUniversities(prev => [...prev, newUniversity]);

      // Auto-select the new university
      console.log('📋 Auto-selecting new university:', newUniversity.id, newUniversity.name || newUniversity.university_name);
      onUniversitySelected(
        newUniversity.id,
        newUniversity.name || newUniversity.university_name || universityData.name
      );

      // Close the modal
      setShowAddUniversity(false);
      console.log('🎉 University addition completed - no page refresh needed');
    } catch (error) {
      console.error('❌ Error in handleAddUniversity:', error);
      alert(`Failed to add university: ${error.message}`);
    }
  };

  const handleAddDepartment = async (departmentData) => {
    try {
      // Check if department already exists
      const existingDepartment = departments.find(dept => {
        const deptName = dept?.department_name || dept?.name || '';
        return deptName === departmentData.name;
      });

      if (existingDepartment) {
        onDepartmentSelected(existingDepartment.id, existingDepartment.department_name || existingDepartment.name);
        setShowAddDepartment(false);
        return;
      }

      // Add new department
      const response = await ReviewService.addDepartment(selectedUniversityId, {
        department_name: departmentData.name
      });

      const newDepartment = {
        id: response?.id || response?.department?.id || Date.now().toString(),
        name: response?.department_name || response?.name || departmentData.name,
        department_name: response?.department_name || response?.name || departmentData.name
      };

      setDepartments(prev => [...prev, newDepartment]);
      onDepartmentSelected(newDepartment.id, newDepartment.department_name || newDepartment.name);
      setShowAddDepartment(false);
    } catch (error) {
      console.error('Error adding department:', error);
      alert('Failed to add department. Please try again.');
    }
  };

  // Determine layout style
  const getLayoutStyle = () => {
    if (layout === 'horizontal') {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: spacing[4]
      };
    } else if (layout === 'vertical') {
      return {
        display: 'flex',
        flexDirection: 'column'
      };
    } else { // responsive
      return {
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: spacing[4]
      };
    }
  };

  return (
    <div style={getLayoutStyle()}>
      {/* University Selection */}
      <DropdownField
        label="University"
        value={selectedUniversityId}
        onChange={handleUniversityChange}
        options={[
          ...universities.map(university => ({
            value: university.id,
            label: `${university.name} - ${university.city || university.country || ''}`
          })),
          {
            value: "___ADD_NEW_UNIVERSITY___",
            label: "+ Add New University",
            style: { fontStyle: 'italic', color: colors.primary }
          }
        ]}
        placeholder="Select your university or add new"
        loading={loadingUniversities}
        required={isRequired}
      />

      {/* Department Selection */}
      <DropdownField
        label="Department"
        value={selectedUniversityDepartmentId}
        onChange={handleDepartmentChange}
        options={[
          ...departments.map(department => ({
            value: department.id,
            label: department.department_name || department.name
          })),
          ...(selectedUniversityId ? [{
            value: "___ADD_NEW___",
            label: "+ Add New Department",
            style: { fontStyle: 'italic', color: colors.primary }
          }] : [])
        ]}
        placeholder={
          !selectedUniversityId
            ? 'Select a university first'
            : 'Select your department or add new'
        }
        disabled={!selectedUniversityId}
        loading={loadingDepartments}
        required={isRequired}
      />

      {/* Add University Modal */}
      {showAddUniversity && (
        <AddUniversityModal
          onAdd={handleAddUniversity}
          onCancel={() => setShowAddUniversity(false)}
        />
      )}

      {/* Add Department Modal */}
      {showAddDepartment && (
        <AddDepartmentModal
          selectedUniversityName={selectedUniversityName}
          onAdd={handleAddDepartment}
          onCancel={() => setShowAddDepartment(false)}
        />
      )}
    </div>
  );
};

// Add University Modal Component
const AddUniversityModal = ({ onAdd, onCancel }) => {
  const [universityData, setUniversityData] = useState({
    name: '',
    website: '',
    country: '',
    state: '',
    city: '',
    ranking: null
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!universityData.name.trim() || !universityData.website.trim()) {
      alert('Please fill in university name and website');
      return;
    }

    setLoading(true);

    try {
      await onAdd(universityData);
    } catch (error) {
      alert(`Failed to add university: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onCancel} maxWidth="500px" maxHeight="80vh">
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: spacing[6],
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[4],
        fontFamily: 'Inter'
      }}>
        Add New University
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2],
            fontFamily: 'Inter'
          }}>
            University Name *
          </label>
          <input
            type="text"
            placeholder="e.g., Stanford University"
            value={universityData.name}
            onChange={(e) => setUniversityData(prev => ({ ...prev, name: e.target.value }))}
            required
            style={{
              width: '100%',
              height: '48px',
              padding: `0 ${spacing[3]}`,
              fontSize: '14px',
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: colors.background,
              color: colors.textPrimary,
              fontFamily: 'Inter'
            }}
          />
        </div>

        <div style={{ marginBottom: spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2],
            fontFamily: 'Inter'
          }}>
            Website *
          </label>
          <input
            type="text"
            placeholder="e.g., https://www.stanford.edu"
            value={universityData.website}
            onChange={(e) => setUniversityData(prev => ({ ...prev, website: e.target.value }))}
            required
            style={{
              width: '100%',
              height: '48px',
              padding: `0 ${spacing[3]}`,
              fontSize: '14px',
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: colors.background,
              color: colors.textPrimary,
              fontFamily: 'Inter'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3], marginBottom: spacing[4] }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              Country
            </label>
            <input
              type="text"
              placeholder="e.g., United States"
              value={universityData.country}
              onChange={(e) => setUniversityData(prev => ({ ...prev, country: e.target.value }))}
              style={{
                width: '100%',
                height: '48px',
                padding: `0 ${spacing[3]}`,
                fontSize: '14px',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: colors.background,
                color: colors.textPrimary,
                fontFamily: 'Inter'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textPrimary,
              marginBottom: spacing[2],
              fontFamily: 'Inter'
            }}>
              State/Province
            </label>
            <input
              type="text"
              placeholder="e.g., California"
              value={universityData.state}
              onChange={(e) => setUniversityData(prev => ({ ...prev, state: e.target.value }))}
              style={{
                width: '100%',
                height: '48px',
                padding: `0 ${spacing[3]}`,
                fontSize: '14px',
                border: `2px solid ${colors.border}`,
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: colors.background,
                color: colors.textPrimary,
                fontFamily: 'Inter'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2],
            fontFamily: 'Inter'
          }}>
            City
          </label>
          <input
            type="text"
            placeholder="e.g., Stanford"
            value={universityData.city}
            onChange={(e) => setUniversityData(prev => ({ ...prev, city: e.target.value }))}
            style={{
              width: '100%',
              height: '48px',
              padding: `0 ${spacing[3]}`,
              fontSize: '14px',
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: colors.background,
              color: colors.textPrimary,
              fontFamily: 'Inter'
            }}
          />
        </div>

        <div style={{ marginBottom: spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2],
            fontFamily: 'Inter'
          }}>
            Ranking (Optional)
          </label>
          <input
            type="number"
            placeholder="e.g., 100"
            value={universityData.ranking || ''}
            onChange={(e) => setUniversityData(prev => ({
              ...prev,
              ranking: e.target.value ? parseInt(e.target.value) : null
            }))}
            style={{
              width: '100%',
              height: '48px',
              padding: `0 ${spacing[3]}`,
              fontSize: '14px',
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: colors.background,
              color: colors.textPrimary,
              fontFamily: 'Inter'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: spacing[3], justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'Inter'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: loading ? colors.textTertiary : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter'
            }}
          >
            {loading ? 'Adding...' : 'Add University'}
          </button>
        </div>
      </form>
      </div>
    </Modal>
  );
};

// Add Department Modal Component
const AddDepartmentModal = ({ selectedUniversityName, onAdd, onCancel }) => {
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentName.trim()) {
      alert('Please enter department name');
      return;
    }

    setLoading(true);
    try {
      await onAdd({ name: departmentName.trim() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onCancel} maxWidth="400px">
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: spacing[6],
        maxWidth: '400px',
        width: '100%'
      }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing[4],
        fontFamily: 'Inter'
      }}>
        Add New Department
      </h3>

      <p style={{
        fontSize: '14px',
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: spacing[4],
        fontFamily: 'Inter'
      }}>
        University: {selectedUniversityName}
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: spacing[4] }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing[2],
            fontFamily: 'Inter'
          }}>
            Department Name *
          </label>
          <input
            type="text"
            placeholder="e.g., Computer Science"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            required
            style={{
              width: '100%',
              height: '48px',
              padding: `0 ${spacing[3]}`,
              fontSize: '14px',
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: colors.background,
              color: colors.textPrimary,
              fontFamily: 'Inter'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: spacing[3], justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: 'transparent',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'Inter'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: loading ? colors.textTertiary : colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter'
            }}
          >
            {loading ? 'Adding...' : 'Add Department'}
          </button>
        </div>
      </form>
      </div>
    </Modal>
  );
};

export default UniversityDepartmentSelector;
