import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Ad_Dashboard.css";
import { NoticeList } from "./NoticeList";
import { DashboardTable } from "./DashboardTable";
import { Notification } from "./Notification";

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
    <div className={`dashboard-container ${isAdmin ? "admin-view" : "user-view"}`}>
      {isAdmin && (
        <div className="table-section">
          <h2>LCA 결과 테이블</h2>
          <DashboardTable />
        </div>
      )}

      <div className="info-section">
        <div className="announcement-section">
          <NoticeList isAdmin={isAdmin} handleAdminClick={handleAdminClick} />
        </div>

        <div className="notification-section">
          <h2>알림</h2>
          <Notification />
        </div>
      </div>
    </div>
  );
}