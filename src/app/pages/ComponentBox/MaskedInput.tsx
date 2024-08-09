// import React from 'react';
// import Cleave from 'cleave.js/react';
// import { TextField, TextFieldProps } from '@mui/material';

// interface MaskedInputProps {
//   options: CleaveOptions;
//   label: string;
//   value: string;
//   onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
// }

// const MaskedInputComponent: React.FC<MaskedInputProps & TextFieldProps> = ({ options, label, value, onChange, ...props }) => {
//   return (
//     <Cleave
//       value={value}
//       options={options}
//       onChange={onChange}
//       render={({ inputProps }) => (
//         <TextField
//           {...(inputProps as TextFieldProps)}
//           {...props}
//           label={label}
//           fullWidth
//         />
//       )}
//     />
//   );
// };

// export default MaskedInputComponent;