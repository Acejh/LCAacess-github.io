import React, { useState } from 'react';
import { TextField } from '@mui/material';
import numeral from 'numeral';

type EditableCellProps = {
  value: number;
  rowIndex: number;
  columnId: string;
  updateData: (rowIndex: number, columnId: string, value: number) => void;
};

const EditableCell: React.FC<EditableCellProps> = ({ value, rowIndex, columnId, updateData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [cellValue, setCellValue] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCellValue(parseFloat(event.target.value));
  };

  const handleBlur = () => {
    setIsEditing(false);
    updateData(rowIndex, columnId, cellValue);
  };

  return isEditing ? (
    <TextField
      value={cellValue}
      onChange={handleChange}
      onBlur={handleBlur}
      autoFocus
      inputProps={{ style: { textAlign: 'right' } }}
    />
  ) : (
    <div onDoubleClick={handleDoubleClick}>
      {numeral(value).format('0,0.00000')}
    </div>
  );
};

export default EditableCell;