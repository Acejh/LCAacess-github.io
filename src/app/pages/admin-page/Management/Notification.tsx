import React, { useEffect, useState } from "react";
import "./css/Notification.css"
import { getApiUrl } from "../../../../main";

interface NotificationMessage {
  message: string;
}

export const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 로컬스토리지에서 companyCode 추출
    const authData = localStorage.getItem("kt-auth-react-v");
    const companyCode = authData ? JSON.parse(authData).userInfo?.companyCode : "";

    // API 요청
    if (companyCode) {
      fetch(`${getApiUrl}/notices?companyCode=${companyCode}`)
      .then((response) => response.json())
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => {
        setError("알림을 불러오는 중 오류가 발생했습니다."); 
        setLoading(false);
      });
    } else {
      setError("회사 코드 정보를 찾을 수 없습니다.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="notification-loading">알림을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className="notification-error">{error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="notification-empty">알림이 없습니다.</div>;
  }

  return (
    <div className="notification-list">
      {notifications.map((notification, index) => (
        <div key={index} className="notification-item">
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
};