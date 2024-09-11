import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import { Button } from '@mui/material'

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function LineChartPro() {
  const [chartType, setChartType] = useState<'business' | 'product'>('business');

  const businessData = {
    labels: ['회사 A', '회사 B', '회사 C', '회사 D', '회사 E', '회사 F', '회사 G'],
    datasets: [
      {
        label: '사업회원별 온실가스 저감효과',
        data: [
          6.12345e-03,
          7.67891e-03,
          5.65432e-03,
          8.23456e-03,
          6.54321e-03,
          9.87654e-03,
          7.45678e-03,
        ],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const productData = {
    labels: ['제품군 1', '제품군 2', '제품군 3', '제품군 4', '제품군 5', '제품군 6', '제품군 7'],
    datasets: [
      {
        label: '제품군별 온실가스 저감효과',
        data: [
          7.12345e-03,
          5.23456e-03,
          9.54321e-03,
          6.98765e-03,
          8.65432e-03,
          7.43210e-03,
          6.32109e-03,
        ],
        borderColor: 'rgba(153,102,255,1)',
        backgroundColor: 'rgba(153,102,255,0.2)',
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.raw !== null) {
              label += Number(context.raw).toExponential(2);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (tickValue: string | number) {
            if (typeof tickValue === 'number') {
              return tickValue.toExponential(2);
            }
            return tickValue;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '360px' }}>  {/* 동일한 크기 적용 */}
      <div>
        <Button onClick={() => setChartType('business')}>사업회원별 그래프</Button>
        <Button onClick={() => setChartType('product')}>제품군별 그래프</Button>
      </div>
      <div style={{ height: '310px', width: '100%' }}>  {/* 동일한 높이 */}
        {chartType === 'business' ? (
          <Line data={businessData} options={options} />
        ) : (
          <Line data={productData} options={options} />
        )}
      </div>
    </div>
  );
}