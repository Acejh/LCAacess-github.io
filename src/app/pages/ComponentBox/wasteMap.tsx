import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Waste {
  id: number;
  title: string;
}

const WasteMap: React.FC<{ onWasteChange: (waste: Waste | null) => void }> = ({ onWasteChange }) => {
  const [data, setData] = useState<Waste[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Waste[]>('https://lcaapi.acess.co.kr/Wastes/');
        setData(response.data);
      } catch (error) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Wastes</h1>
      <ul>
        {data.map(item => (
          <li key={item.id} onClick={() => onWasteChange(item)}>
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WasteMap;