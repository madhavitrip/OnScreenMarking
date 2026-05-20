import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, X, CheckCircle } from 'lucide-react';
import roleService from '../services/roleService';
import PermissionSelector from '../components/RoleManagement/PermissionSelector';
import RoleStatistics from '../components/RoleManagement/RoleStatistics';

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Inline Form States
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formValues, setFormValues] = useState({
    roleName: '',
    description: '',
    hierarchyLevel: 0,
    permissions: []
  });
  
  const [expandedRoles, setExpandedRoles] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch roles and permissions on mount
  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        roleService.getAllRoles(),
        roleService.getAllPermissions()
      ]);
      setRoles(rolesData.data || []);
      setPermissions(permissionsData.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch roles and permissions');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoleClick = () => {
    if (showForm) {
      handleCancelForm();
    } else {
      setEditingRole(null);
      setFormValues({
        roleName: '',
        description: '',
        hierarchyLevel: 0,
        permissions: []
      });
      setError(null);
      setSuccess(null);
      setShowForm(true);
    }
  };

  const handleEditRoleClick = (role) => {
    setEditingRole(role);
    setFormValues({
      roleName: role.roleName,
      description: role.description || '',
      hierarchyLevel: role.hierarchyLevel || 0,
      permissions: role.permissionsList || []
    });
    setError(null);
    setSuccess(null);
    setShowForm(true);
    // Smooth scroll to form container
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRole(null);
    setFormValues({
      roleName: '',
      description: '',
      hierarchyLevel: 0,
      permissions: []
    });
    setError(null);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formValues.roleName.trim()) {
      setError('Role name is required');
      return;
    }

    if (formValues.permissions.length === 0) {
      setError('At least one permission must be selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      if (editingRole) {
        await roleService.updateRole(editingRole.roleId, formValues);
        setSuccess(`Role "${formValues.roleName}" updated successfully`);
      } else {
        await roleService.createRole(formValues);
        setSuccess(`Role "${formValues.roleName}" created successfully`);
      }
      
      setShowForm(false);
      setEditingRole(null);
      await fetchRolesAndPermissions();
    } catch (err) {
      setError(err.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        setSuccess(null);
        setError(null);
        await roleService.deleteRole(roleId);
        setSuccess('Role deleted successfully');
        await fetchRolesAndPermissions();
      } catch (err) {
        setError(err.message || 'Failed to delete role');
      }
    }
  };

  const toggleRoleExpand = (roleId) => {
    const newExpanded = new Set(expandedRoles);
    if (newExpanded.has(roleId)) {
      newExpanded.delete(roleId);
    } else {
      newExpanded.add(roleId);
    }
    setExpandedRoles(newExpanded);
  };

  const filteredRoles = roles.filter(role =>
    role.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Management</h1>
            <p className="text-gray-600">Manage system roles</p>
          </div>
          <button
            onClick={handleAddRoleClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
          >
            {showForm ? 'Cancel' : '+ Add Role'}
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
            <X className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Inline Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-6">
              
              {/* Role Info Box (only for Edit Mode) */}
              {editingRole && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Role ID</p>
                    <p className="font-semibold text-gray-900">{editingRole.roleId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Hierarchy Level</p>
                    <p className="font-semibold text-gray-900">{editingRole.hierarchyLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Status</p>
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        editingRole.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {editingRole.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role Name */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    name="roleName"
                    value={formValues.roleName}
                    onChange={(e) => setFormValues({ ...formValues, roleName: e.target.value })}
                    placeholder="e.g., Admin, Coordinator, Examiner"
                    className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Hierarchy Level */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Hierarchy Level *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formValues.hierarchyLevel}
                    onChange={(e) => setFormValues({ ...formValues, hierarchyLevel: parseInt(e.target.value, 10) || 0 })}
                    placeholder="0"
                    className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  placeholder="Describe the purpose of this role"
                  rows="3"
                  className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Permissions *
                </label>
                <PermissionSelector
                  permissions={permissions}
                  selectedPermissions={formValues.permissions}
                  onChange={(selectedPerms) => setFormValues({ ...formValues, permissions: selectedPerms })}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (editingRole ? 'Save Changes' : 'Create Role')}
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8">
          <RoleStatistics />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          {filteredRoles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No roles found</p>
            </div>
          ) : (
            filteredRoles.map(role => (
              <div key={role.roleId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Role Header */}
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleRoleExpand(role.roleId)}>
                  <div className="flex items-center gap-4 flex-1">
                    <button className="text-gray-400 hover:text-gray-600">
                      {expandedRoles.has(role.roleId) ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                    <div>
                      <h3 className="font-semibold text-gray-900">{role.roleName}</h3>
                      <p className="text-sm text-gray-500">{role.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {role.permissionsList?.length || 0} permissions
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      role.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Role Details (Expanded) */}
                {expandedRoles.has(role.roleId) && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {/* Permissions */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Permissions</h4>
                      {role.permissionsList && role.permissionsList.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {role.permissionsList.map(permission => (
                            <span
                              key={permission}
                              className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 animate-fadeIn"
                            >
                              {permission.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No permissions assigned</p>
                      )}
                    </div>

                    {/* Role Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-600">Hierarchy Level</p>
                        <p className="font-semibold text-gray-900">{role.hierarchyLevel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(role.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Updated</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(role.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRoleClick(role);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(role.roleId);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

