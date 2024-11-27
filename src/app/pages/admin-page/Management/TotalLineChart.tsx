import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';

// Chart.js 모듈 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function LineChart() {
  const data = {
    labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: '제품별 LCA 결과값',
        data: [
          6.89946e-03,
          8.25689e-03,
          7.05645e-03,
          9.12456e-03,
          6.55456e-03,
          8.04567e-03,
          7.39923e-03,
        ],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(79, 218, 218, 0.637)',
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
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
    <div style={{ width: '100%', height: '310px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}