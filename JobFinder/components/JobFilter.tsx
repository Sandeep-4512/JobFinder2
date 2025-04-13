import React from 'react';

interface FilterProps {
  filters: {
    location: string;
    type: string;
    company: string;
  };
  onChange: (filters: FilterProps['filters']) => void;
}

const JobFilter: React.FC<FilterProps> = ({ filters, onChange }) => {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        placeholder="Location"
        value={filters.location}
        onChange={(e) => onChange({ ...filters, location: e.target.value })}
        style={{ marginRight: '10px' }}
      />
      <input
        type="text"
        placeholder="Job Type"
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
        style={{ marginRight: '10px' }}
      />
      <input
        type="text"
        placeholder="Company"
        value={filters.company}
        onChange={(e) => onChange({ ...filters, company: e.target.value })}
      />
    </div>
  );
};

export default JobFilter;
