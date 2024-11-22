import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Ad_Dashboard.css";
import { NoticeList } from "./NoticeList";
// import { LineChart } from './TotalLineChart'; 
// import { LineChartPro } from './LineChartPro';
import { DashboardTable } from "./DashboardTable"; 

export function Ad_Dashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authData = localStorage.getItem("kt-auth-react-v");
    if (authData) {
      const parsedAuthData = JSON.parse(authData);
      if (parsedAuthData.userInfo?.role === "Admin") {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate("/NoticeControl");
    } else {
      alert("관리자만 접근할 수 있습니다.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* <div className="graph-section">
        <div className="graph-box">
          <h2>총 온실가스 저감효과 그래프 (연도별)</h2>
          <LineChart /> 
        </div>
        <div className="graph-box">
          <h2>사업회원별 및 제품군별 온실가스 저감효과 그래프 (연도별)</h2>
          <LineChartPro /> 
        </div>
      </div> */}
      {isAdmin && (
        <div className="table-section">
          <h2>LCA 결과 테이블</h2>
          <DashboardTable />
        </div>
      )}

      {/* 오른쪽 공지사항/알림 섹션 (3) */}
      <div className="info-section">
        <div className="announcement-section">
          <NoticeList isAdmin={isAdmin} handleAdminClick={handleAdminClick} />
        </div>

        <div className="notification-section">
          <h2>알림</h2>
        </div>
      </div>
    </div>
  );
}