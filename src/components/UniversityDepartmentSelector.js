import React, { useState, useEffect } from 'react';
import { colors, spacing } from '../theme';
import { UniversityService } from '../services/universityService';
import { ReviewService } from '../services/reviewService';

const UniversityDepartmentSelector = ({
  selectedUniversityId,
  selectedUniversityName,
  selectedUniversityDepartmentId,
  onUniversitySelected,
  onDepartmentSelected,
  isRequired = true
}) => {
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
      const processedDepartments = departmentsList.map((dept) => ({
        id: String(dept.id),
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
        onDepartmentSelected(value, department.department_name || department.name);
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

  return (
    <div>
      {/* University Selection */}
      <div style={{ marginBottom: spacing[5] }}>
        <label style={{
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2],
          fontFamily: 'Inter'
        }}>
          University {isRequired && <span style={{ color: colors.error }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedUniversityId || ''}
            onChange={handleUniversityChange}
            style={{
              width: '100%',
              height: '56px',
              padding: `0 ${spacing[4]}`,
              paddingRight: '40px',
              fontSize: '14px',
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: colors.background,
              color: colors.textPrimary,
              fontFamily: 'Inter',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23666' d='m2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '12px'
            }}
          >
            <option value="">Select your university or add new</option>
            {universities.map(university => (
              <option key={university.id} value={university.id}>
                {university.name} - {university.city || university.country || ''}
              </option>
            ))}
            <option value="___ADD_NEW_UNIVERSITY___" style={{ fontStyle: 'italic', color: colors.primary }}>
              + Add New University
            </option>
          </select>
          {loadingUniversities && (
            <div style={{
              position: 'absolute',
              right: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              border: '2px solid transparent',
              borderTop: `2px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
        </div>
        <p style={{
          fontSize: '12px',
          color: colors.textSecondary,
          margin: 0,
          marginTop: spacing[1],
          fontFamily: 'Inter'
        }}>
          Select your university or add new
        </p>
      </div>

      {/* Department Selection */}
      <div style={{ marginBottom: spacing[5] }}>
        <label style={{
          display: 'block',
          fontSize: '16px',
          fontWeight: '600',
          color: colors.textPrimary,
          marginBottom: spacing[2],
          fontFamily: 'Inter'
        }}>
          Department {isRequired && <span style={{ color: colors.error }}>*</span>}
        </label>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedUniversityDepartmentId || ''}
            onChange={handleDepartmentChange}
            disabled={!selectedUniversityId || loadingDepartments}
            style={{
              width: '100%',
              height: '56px',
              padding: `0 ${spacing[4]}`,
              paddingRight: '40px',
              fontSize: '14px',
              border: `2px solid ${colors.border}`,
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: colors.background,
              color: colors.textPrimary,
              fontFamily: 'Inter',
              cursor: selectedUniversityId ? 'pointer' : 'not-allowed',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23666' d='m2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '12px',
              opacity: (!selectedUniversityId || loadingDepartments) ? 0.6 : 1
            }}
          >
            <option value="">
              {!selectedUniversityId
                ? 'Select a university first'
                : loadingDepartments
                  ? 'Loading departments...'
                  : 'Select your department or add new'
              }
            </option>
            {departments.map(department => (
              <option key={department.id} value={department.id}>
                {department.department_name || department.name}
              </option>
            ))}
            {selectedUniversityId && (
              <option value="___ADD_NEW___" style={{ fontStyle: 'italic', color: colors.primary }}>
                + Add New Department
              </option>
            )}
          </select>
          {loadingDepartments && (
            <div style={{
              position: 'absolute',
              right: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              border: '2px solid transparent',
              borderTop: `2px solid ${colors.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
        </div>
        <p style={{
          fontSize: '12px',
          color: colors.textSecondary,
          margin: 0,
          marginTop: spacing[1],
          fontFamily: 'Inter'
        }}>
          {selectedUniversityId
            ? 'Select your department or add new'
            : 'Select a university first'
          }
        </p>
      </div>

      {/* Add University Modal */}
      {showAddUniversity && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing[4]
        }}>
          <AddUniversityModal
            onAdd={handleAddUniversity}
            onCancel={() => setShowAddUniversity(false)}
          />
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDepartment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: spacing[4]
        }}>
          <AddDepartmentModal
            selectedUniversityName={selectedUniversityName}
            onAdd={handleAddDepartment}
            onCancel={() => setShowAddDepartment(false)}
          />
        </div>
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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: spacing[6],
      maxWidth: '500px',
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
  );
};

export default UniversityDepartmentSelector;