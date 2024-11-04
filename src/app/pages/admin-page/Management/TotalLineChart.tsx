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
  // 하드코딩된 데이터 (연도별 총 온실가스 저감효과)
  const data = {
    labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: '총 온실가스 저감효과 (연도별)',
        data: [
          6.89946e-03, // 2018
          8.25689e-03, // 2019 (조금 더 크게 설정)
          7.05645e-03, // 2020 (다른 값)
          9.12456e-03, // 2021 (가장 큰 값)
          6.55456e-03, // 2022 (작게 설정)
          8.04567e-03, // 2023
          7.39923e-03, // 2024
        ],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(79, 218, 218, 0.637)',
        fill: true,
        tension: 0.1, // 선을 부드럽게
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 비율 유지를 비활성화하여 전체 너비를 채움
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) { // TooltipItem<'line'> 타입 명시
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.raw !== null) {
              label += Number(context.raw).toExponential(2); // 지수 형식으로 변환
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
              return tickValue.toExponential(2); // Y축에 지수 표기
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