import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormControl, FormControlProps } from '@mui/material';
import { SxProps, Theme } from '@mui/system';
import { Grid, Chip, Typography } from '@mui/material';

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
  onProductChange: (product: string[]) => void;
  onProductListChange?: (products: Product[]) => void;
  selectedProducts?: string[]; // 선택된 제품의 itemCode 목록
  sx?: SxProps<Theme>;
}

const UseProduct: React.FC<UseProductProps> = ({
  onProductChange,
  onProductListChange,
  selectedProducts = [],
  sx,
  ...rest
}) => {
  const [products, setProducts] = useState<Product[]>([]);

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

  const handleProductToggle = (itemCode: string) => {
    let updatedSelectedProducts;
    if (selectedProducts.includes(itemCode)) {
      updatedSelectedProducts = selectedProducts.filter(code => code !== itemCode);
    } else {
      updatedSelectedProducts = [...selectedProducts, itemCode];
    }
    onProductChange(updatedSelectedProducts);
  };

  const handleSelectAll = (categoryProducts: Product[]) => {
    const allSelected = categoryProducts.every(product => selectedProducts.includes(product.itemCode));
    let updatedSelectedProducts;

    if (allSelected) {
      // 모든 제품이 선택된 상태라면, 선택 해제
      updatedSelectedProducts = selectedProducts.filter(
        code => !categoryProducts.some(product => product.itemCode === code)
      );
    } else {
      // 모든 제품을 선택
      const newSelections = categoryProducts
        .filter(product => !selectedProducts.includes(product.itemCode))
        .map(product => product.itemCode);
      updatedSelectedProducts = [...selectedProducts, ...newSelections];
    }

    onProductChange(updatedSelectedProducts);
  };

  // categoryName에 따라 제품을 그룹화
  const groupedProducts = products.reduce((groups, product) => {
    const { categoryName } = product;
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }
    groups[categoryName].push(product);
    return groups;
  }, {} as Record<string, Product[]>);

  return (
    <FormControl sx={{ width: '100%', ...sx }} {...rest}>
      {Object.keys(groupedProducts).map(categoryName => {
        const categoryProducts = groupedProducts[categoryName];
        const allSelected = categoryProducts.every(product => selectedProducts.includes(product.itemCode));

        return (
          <div key={categoryName} style={{ marginBottom: '6px' }}>
            <Typography variant="h6" gutterBottom >
              {categoryName}
              <Chip
                label="All"
                onClick={() => handleSelectAll(categoryProducts)}
                style={{
                  marginLeft: '8px',
                  backgroundColor: allSelected ? '#1976d2' : '#e0e0e0',
                  color: allSelected ? '#fff' : '#000',
                  cursor: 'pointer',
                }}
              />
            </Typography>
            <Grid container spacing={1}>
              {categoryProducts.map(product => (
                <Grid item key={product.itemCode}>
                  <Chip
                    label={product.itemName}
                    onClick={() => handleProductToggle(product.itemCode)}
                    style={{
                      backgroundColor: selectedProducts.includes(product.itemCode) ? '#1976d2' : '#e0e0e0',
                      color: selectedProducts.includes(product.itemCode) ? '#fff' : '#000',
                      cursor: 'pointer',
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </div>
        );
      })}
    </FormControl>
  );
};

export default UseProduct;