import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormControl, FormControlProps } from '@mui/material';
import { SxProps, Theme } from '@mui/system';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Popper, { PopperProps } from '@mui/material/Popper';

export interface Product {
  id: number;
  categoryCode: string;
  categoryName: string;
  midItemCode: string;
  midItemName: string;
  itemCode: string;
  itemName: string;
}

interface UseProductProps extends FormControlProps {
  onProductChange: (product: Product | null) => void;
  onProductListChange?: (products: Product[]) => void; 
  showAllOption?: boolean;
  sx?: SxProps<Theme>;
  selectSx?: SxProps<Theme>;
  selectedProduct?: Product | null;
}

const CustomPopper = (props: PopperProps) => {
  return <Popper {...props} placement="top-start" />;
};

const UseProduct: React.FC<UseProductProps> = ({ onProductChange, onProductListChange, sx, selectSx, ...rest }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    axios.get('https://lcaapi.acess.co.kr/Items')
      .then(response => {
        setProducts(response.data);
        if (onProductListChange) {
          onProductListChange(response.data); 
        }
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, [onProductListChange]);

  const handleProductChange = (_: React.SyntheticEvent, value: Product | null) => {
    onProductChange(value);
    setInputValue(''); 
  };

  const handleInputChange = (_: React.SyntheticEvent, value: string) => {
    setInputValue(value);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = (_: React.SyntheticEvent, reason: string) => {
    if (reason === 'blur') {
      setOpen(false);
    }
  };

  return (
    <FormControl sx={{ width: '100%', ...sx }} {...rest}>
      <Autocomplete
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        options={products}
        getOptionLabel={(option) => option.itemName}
        onChange={handleProductChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="제품 선택"
            variant="outlined"
            sx={selectSx}
          />
        )}
        PopperComponent={CustomPopper}
        ListboxProps={{
          style: {
            maxHeight: 260,
          },
        }}
      />
    </FormControl>
  );
};

export default UseProduct;