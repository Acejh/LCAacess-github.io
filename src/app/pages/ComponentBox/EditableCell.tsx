import React, { useState } from 'react';
import { TextField } from '@mui/material';

interface EditableCellProps {
  value: number;
  facilityId: number;
  month: string;
  year: number;
  onSave: (newValue: number) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(parseFloat(e.target.value));
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (editValue !== value) {
        onSave(editValue);
      }
    }
  };

  return isEditing ? (
    <TextField
      value={editValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      fullWidth
      InputProps={{
        endAdornment: <span style={{ marginLeft: '5px' }}>시간/월</span>,
      }}
    />
  ) : (
    <div onDoubleClick={handleDoubleClick} style={{ cursor: 'pointer' }}>
      {editValue} 시간/월
    </div>
  );
};

export default EditableCell;