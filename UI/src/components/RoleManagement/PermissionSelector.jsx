import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function PermissionSelector({ permissions, selectedPermissions, onChange }) {
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.split('_')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const togglePermission = (permission) => {
    const newSelected = selectedPermissions.includes(permission)
      ? selectedPermissions.filter(p => p !== permission)
      : [...selectedPermissions, permission];
    onChange(newSelected);
  };

  const toggleCategoryPermissions = (category) => {
    const categoryPermissions = groupedPermissions[category];
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
    
    let newSelected;
    if (allSelected) {
      newSelected = selectedPermissions.filter(p => !categoryPermissions.includes(p));
    } else {
      newSelected = [...new Set([...selectedPermissions, ...categoryPermissions])];
    }
    onChange(newSelected);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'CREATE': 'Create',
      'READ': 'Read',
      'UPDATE': 'Update',
      'DELETE': 'Delete',
      'VIEW': 'View',
      'EXPORT': 'Export',
      'MANAGE': 'Manage'
    };
    return labels[category] || category;
  };

  const getPermissionLabel = (permission) => {
    return permission
      .split('_')
      .slice(1)
      .join(' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-3 border border-gray-300 rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
      {Object.entries(groupedPermissions).map(([category, categoryPerms]) => {
        const allSelected = categoryPerms.every(p => selectedPermissions.includes(p));
        const someSelected = categoryPerms.some(p => selectedPermissions.includes(p));

        return (
          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Category Header */}
            <div
              onClick={() => toggleCategory(category)}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => toggleCategoryPermissions(category)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <ChevronDown
                size={18}
                className={`text-gray-600 transition-transform ${
                  expandedCategories.has(category) ? 'rotate-180' : ''
                }`}
              />
              <span className="font-semibold text-gray-900 flex-1">
                {getCategoryLabel(category)}
              </span>
              <span className="text-sm text-gray-500">
                {categoryPerms.filter(p => selectedPermissions.includes(p)).length}/{categoryPerms.length}
              </span>
            </div>

            {/* Category Permissions */}
            {expandedCategories.has(category) && (
              <div className="p-3 space-y-2 bg-white border-t border-gray-200">
                {categoryPerms.map(permission => (
                  <label
                    key={permission}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      {getPermissionLabel(permission)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">{selectedPermissions.length}</span> permission{selectedPermissions.length !== 1 ? 's' : ''} selected
        </p>
      </div>
    </div>
  );
}
