import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import axios from 'axios';
import './css/Ad_Dashboard.css';

interface Notice {
  id: number;
  title: string;
  content: string;
  readCount: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  boardFiles: [];
}

export function Ad_Dashboard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/Boards');
      setNotices(response.data.list);
    } catch (error) {
      console.error('공지사항을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();

    const authData = localStorage.getItem('kt-auth-react-v');
    if (authData) {
      const parsedAuthData = JSON.parse(authData);
      if (parsedAuthData.userInfo?.role === 'Admin') {
        setIsAdmin(true);
      }
    }
  }, [fetchNotices]);

  const handleViewNotice = async (noticeId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/Boards/${noticeId}`);
      setSelectedNotice(response.data);
      setViewOpen(true);
    } catch (error) {
      console.error('공지사항을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedNotice(null);
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/NoticeControl');
    } else {
      alert('관리자만 접근할 수 있습니다.');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="graph-section">
        <div className="graph-box">
          <h2>총 온실가스 저감효과 그래프 (연도별)</h2>
          <div className="placeholder">그래프 영역</div>
        </div>
        <div className="graph-box">
          <h2>사업회원별 및 제품군별 온실가스 저감효과 그래프 (연도별)</h2>
          <div className="placeholder">그래프 영역</div>
        </div>
      </div>

      <div className="info-section">
        <div className="notification-section">
          <h2>알림 (실시간 업데이트)</h2>
          <div className="placeholder">알림 내용</div>
        </div>

        <div className="announcement-section">
          <div className="sticky-header">
            <h2 style={{ cursor: 'pointer' }} onClick={handleAdminClick}>
              공지사항
            </h2>
          </div>
          {loading ? (
            <p>로딩 중...</p>
          ) : (
            <ul className="notice-list">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <div style={{ paddingRight: '120px' }}>
                    <h3
                      style={{ cursor: 'pointer', color: 'blue' }}
                      onClick={() => handleViewNotice(notice.id)}
                    >
                      {notice.title}
                    </h3>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle>{selectedNotice?.title}</DialogTitle>
        <DialogContent>
          <div dangerouslySetInnerHTML={{ __html: selectedNotice?.content || '' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}