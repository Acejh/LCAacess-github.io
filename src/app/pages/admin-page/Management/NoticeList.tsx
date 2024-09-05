import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import './css/NoticeList.css';

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

interface NoticeListProps {
  isAdmin: boolean; // NoticeListProps에 isAdmin 포함
  handleAdminClick: () => void;
}

export function NoticeList({ isAdmin, handleAdminClick }: NoticeListProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="notice-list-container">
      <div className="sticky-header">
        <h2 style={{ cursor: 'pointer' }} onClick={handleAdminClick}>
          공지사항 {isAdmin ? '(관리자)' : ''}
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
                  onClick={() => handleViewNotice(notice.id)}
                >
                  {notice.title}
                </h3>
              </div>
            </li>
          ))}
        </ul>
      )}
  
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