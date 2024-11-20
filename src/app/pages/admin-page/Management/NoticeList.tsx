import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import './css/NoticeList.css';

interface FileInfo {
  id: number;
  fileName: string;
  fileUrl: string;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  readCount: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  boardFiles: FileInfo[];
}

interface NoticeListProps {
  isAdmin: boolean;
  handleAdminClick: () => void;
}

export function NoticeList({ isAdmin, handleAdminClick }: NoticeListProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);

  // 파일 다운로드 처리
  const handleFileDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/Boards/Files/${fileId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // 다운로드 시 저장할 파일 이름
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // 메모리 해제
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
    }
  };

  // 공지사항 목록 불러오기
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

  // 공지사항 상세보기
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
            <li key={notice.id} className="notice-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ width: '10%', textAlign: 'left' }}>{notice.id}</span>
                <div style={{ flex: 1, paddingLeft: '10px', paddingRight: '10px' }}>
                  <h3 style={{ cursor: 'pointer' }} onClick={() => handleViewNotice(notice.id)}>
                    {notice.title}
                  </h3>
                </div>
                <span style={{ width: '20%', textAlign: 'right', marginRight: '20px', color: '#888' }}>
                  {new Date(notice.createdAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle>{selectedNotice?.title}</DialogTitle>
        <DialogContent>
          {/* 공지 내용 */}
          <div dangerouslySetInnerHTML={{ __html: selectedNotice?.content || '' }} />

          {/* 업데이트 날짜 추가 */}
          {selectedNotice?.updatedAt && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
              <strong>업데이트 날짜:</strong>{' '}
              {new Date(selectedNotice.updatedAt).toLocaleDateString()} {new Date(selectedNotice.updatedAt).toLocaleTimeString()}
            </div>
          )}

          {/* 첨부 파일 */}
          {selectedNotice?.boardFiles && selectedNotice.boardFiles.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4>첨부 파일:</h4>
              <ul>
                {selectedNotice.boardFiles.map((file) => (
                  <li key={file.id}>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleFileDownload(file.id, file.fileName)}
                    >
                      {file.fileName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
