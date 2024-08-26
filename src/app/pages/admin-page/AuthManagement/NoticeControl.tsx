import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface Notice {
  id: number;
  title: string;
  content: string;
  readCount: number;
  createdBy: string;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
  boardFiles?: UploadedFile[]; 
}

interface UploadedFile {
  id: number;
  fileName: string;
}

export function NoticeControl() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchContent, setSearchContent] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentNoticeId, setCurrentNoticeId] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/Boards', {
        params: {
          title: searchTitle,
          content: searchContent,
          page: page,
          pageSize: pageSize,
        },
      });
      setNotices(response.data.list);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('공지사항을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTitle, searchContent, page, pageSize]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('https://lcaapi.acess.co.kr/Boards/Files', formData);
            setUploadedFiles((prevFiles) => [
                ...prevFiles,
                { id: response.data.boardFileId, fileName: file.name },
            ]);
        } catch (error) {
            console.error('파일 업로드에 실패했습니다:', error);
        }
    };

    acceptedFiles.forEach((file: File) => uploadFile(file));
}, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDeleteFile = async (fileId: number) => {
    try {
      await axios.delete(`https://lcaapi.acess.co.kr/Boards/files/${fileId}`);
      setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error('파일 삭제에 실패했습니다:', error);
    }
  };

  const handleDownloadFile = async (fileId: number) => {
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/Boards/Files/${fileId}`, {
        responseType: 'blob', 
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'downloaded_file'; 

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+?)($|;|\s)/);
        if (filenameMatch?.[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        } else {
          const simpleFilenameMatch = contentDisposition.match(/filename="?(.+?)($|;|\s)"/);
          if (simpleFilenameMatch?.[1]) {
            filename = simpleFilenameMatch[1];
          }
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); 
      link.href = url;
    
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
    
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleCreateNotice = async () => {
    const newNotice = {
        title: newTitle,
        content: editorContent,
        readCount: 0,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        updatedBy: null,
        updatedAt: null,
        boardFileIds: uploadedFiles.map((file) => file.id), // 업로드된 파일의 id를 배열로 저장
    };

    try {
        if (editMode && currentNoticeId) {
            await axios.put(`https://lcaapi.acess.co.kr/Boards/${currentNoticeId}`, newNotice);
        } else {
            await axios.post('https://lcaapi.acess.co.kr/Boards', newNotice);
        }
        fetchNotices();
        handleClose();
    } catch (error) {
        console.error('공지사항을 등록하는데 실패했습니다:', error);
        alert('공지사항 등록에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleSearch = () => {
    setSearchTitle(title);
    setSearchContent(content);
  };

  const handleEditNotice = async (noticeId: number) => {
    try {
        const response = await axios.get(`https://lcaapi.acess.co.kr/Boards/${noticeId}`);
        const noticeData = response.data;

        setNewTitle(noticeData.title);
        setEditorContent(noticeData.content);
        setCurrentNoticeId(noticeData.id);
        setEditMode(true);
        setOpen(true);

        if (noticeData.boardFiles && noticeData.boardFiles.length > 0) {
            const uploadedFilesFromNotice = noticeData.boardFiles.map((file: UploadedFile) => ({
                id: file.id,
                fileName: file.fileName,
            }));
            setUploadedFiles(uploadedFilesFromNotice);
        } else {
            setUploadedFiles([]);
        }
    } catch (error) {
        console.error('공지사항을 불러오는데 실패했습니다:', error);
        alert('공지사항을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
};

const handleDeleteNotice = async (noticeId: number) => {
  try {
    const notice = notices.find((n) => n.id === noticeId);
    if (notice?.boardFiles) {
      for (const file of notice.boardFiles) {
        await axios.delete(`https://lcaapi.acess.co.kr/Boards/files/${file.id}`);
      }
    }

    await axios.delete(`https://lcaapi.acess.co.kr/Boards/${noticeId}`);
    fetchNotices();
  } catch (error) {
    console.error('공지사항을 삭제하는데 실패했습니다:', error);
    alert('공지사항 삭제에 실패했습니다. 다시 시도해 주세요.');
  }
};

  const handleViewNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedNotice(null);
  };

  const handleClickOpen = () => {
    setNewTitle('');
    setEditorContent('');
    setUploadedFiles([]);
    setCurrentNoticeId(null);
    setEditMode(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewTitle('');
    setEditorContent('');
    setUploadedFiles([]);
    setCurrentNoticeId(null);
    setEditMode(false);
  };

  return (
    <div className="notice-control-container" style={{ padding: '0 30px' }}>
      <div className="search-container" style={{ 
        display: 'flex', 
        position: 'sticky', 
        top: 70, 
        backgroundColor: '#fff', 
        zIndex: 1, 
        paddingTop: '10px', 
        paddingBottom: '10px',
        marginBottom: '20px'
      }}>
        <TextField
          label="제목 검색"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: '10px', height: '40px' }} 
            InputProps={{
              style: { height: '100%' }
            }}
        />
        <TextField
          label="내용 검색"
          variant="outlined"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ marginRight: '10px', height: '40px' }} 
            InputProps={{
              style: { height: '100%' }
            }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          style={{ marginRight: '10px' }}
        >
          검색
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleClickOpen}
        >
          공지사항 등록
        </Button>
      </div>
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <>
          <ul className="notice-list">
            {notices.map((notice) => (
              <li key={notice.id}>
                <div style={{ position: 'relative', paddingRight: '120px' }}>
                  <h3
                    style={{ cursor: 'pointer', color: 'blue' }}
                    onClick={() => handleViewNotice(notice)}
                  >
                    {notice.title}
                  </h3>
                  <p 
                    dangerouslySetInnerHTML={{ __html: notice.content }} 
                    style={{
                      maxWidth: '1420px',
                      maxHeight: '20px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  />
                  <small>
                    작성자: {notice.updatedBy}
                  </small><br></br>
                  <small>
                    작성일: {new Date(notice.createdAt).toLocaleString()}
                  </small><br></br>
                  <small>
                    조회수: {notice.readCount}
                  </small>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditNotice(notice.id)}
                      style={{ marginRight: '10px' }}
                    >
                      수정
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDeleteNotice(notice.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="pagination">
            {[...Array(Math.ceil(totalCount / pageSize)).keys()].map((_, index) => (
              <Button
                key={index + 1}
                variant="outlined"
                onClick={() => setPage(index + 1)}
                disabled={page === index + 1}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? '공지사항 수정' : '공지사항 등록'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="제목"
            fullWidth
            variant="outlined"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div
            {...getRootProps()}
            style={{
              border: '2px dashed #ccc',
              padding: '20px',
              textAlign: 'center',
              marginTop: '20px',
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>파일을 여기에 놓으세요...</p>
            ) : (
              <p>파일을 이곳에 드래그하거나 클릭하여 업로드하세요</p>
            )}
          </div>

          <ul style={{ listStyleType: 'none', padding: 0, marginTop: '10px' }}>
            {uploadedFiles.map((file) => (
              <li
                key={file.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '5px',
                }}
              >
                <span>{file.fileName}</span>
                <div>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleDownloadFile(file.id)}
                    style={{ marginRight: '5px' }}
                  >
                    다운로드
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleDeleteFile(file.id)}
                  >
                    삭제
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <Editor
            apiKey="9zl5qs174m0vih0esbpkdf0mpqfm37icq8slipyokw72q33w"
            value={editorContent}
            init={{
              height: 500,
              menubar: false,
              plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount',
              ],
              toolbar:
                'undo redo | formatselect | bold italic backcolor | \
                alignleft aligncenter alignright alignjustify | \
                bullist numlist outdent indent | removeformat | help',
            }}
            onEditorChange={(newContent) => setEditorContent(newContent)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateNotice} color="primary">
            {editMode ? '수정' : '등록'}
          </Button>
          <Button onClick={handleClose} color="secondary">
            취소
          </Button>
        </DialogActions>
      </Dialog>
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