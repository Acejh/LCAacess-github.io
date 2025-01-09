import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import { getApiUrl } from '../../../../main';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import '../../CSS/SCbar.css';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  Updater,
} from '@tanstack/react-table';

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
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentNoticeId, setCurrentNoticeId] = useState<number | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setNotices([]);
  
    try {
      const response = await axios.get(`${getApiUrl}/Boards`, {
        params: {
          title: searchTitle,
          content: searchContent,
          page: pageIndex + 1,
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
  }, [searchTitle, searchContent, pageIndex, pageSize]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadFile = async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`${getApiUrl}/Boards/Files`, formData);
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
      await axios.delete(`${getApiUrl}/Boards/files/${fileId}`);
      setUploadedFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error('파일 삭제에 실패했습니다:', error);
    }
  };

  const handleDownloadFile = async (fileId: number) => {
    try {
      const response = await axios.get(`${getApiUrl}/Boards/Files/${fileId}`, {
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
    // 공지사항 등록 데이터
    const newNotice = {
      title: newTitle,
      content: editorContent,
      boardFileIds: uploadedFiles.map((file) => file.id), // 파일 ID만 포함
    };
  
    try {
      // 수정 모드인지 확인
      if (editMode && currentNoticeId) {
        await axios.put(`${getApiUrl}/Boards/${currentNoticeId}`, newNotice); // 수정 요청
      } else {
        await axios.post(`${getApiUrl}/Boards`, newNotice); // 등록 요청
      }
      // 공지사항 목록 새로고침
      fetchNotices();
      handleClose(); // 다이얼로그 닫기
    } catch (error) {
      console.error('공지사항 등록에 실패했습니다:', error);
      alert('공지사항 등록에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleSearch = () => {
    setSearchTitle(title);
    setSearchContent(content);
  };

  const handleEditNotice = async (noticeId: number) => {
    try {
      const response = await axios.get(`${getApiUrl}/Boards/${noticeId}`);
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

  const handleViewNotice = async (noticeId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`${getApiUrl}/Boards/${noticeId}`);
      setSelectedNotice(response.data);
      setViewOpen(true);
    } catch (error) {
      console.error('공지사항을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (noticeId: number) => {
    try {
      const notice = notices.find((n) => n.id === noticeId);
      if (notice?.boardFiles) {
        for (const file of notice.boardFiles) {
          await axios.delete(`${getApiUrl}/Boards/files/${file.id}`);
        }
      }

      await axios.delete(`${getApiUrl}/Boards/${noticeId}`);
      fetchNotices();
    } catch (error) {
      console.error('공지사항을 삭제하는데 실패했습니다:', error);
      alert('공지사항 삭제에 실패했습니다. 다시 시도해 주세요.');
    }
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

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedNotice(null);
  };

  const handlePaginationChange = (updater: Updater<{ pageIndex: number; pageSize: number }>) => {
    if (typeof updater === 'function') {
      const newState = updater({ pageIndex, pageSize });
      if (newState.pageIndex !== pageIndex || newState.pageSize !== pageSize) {
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    } else {
      const newPageIndex = updater.pageIndex ?? pageIndex;
      const newPageSize = updater.pageSize ?? pageSize;
      if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
        setPageIndex(newPageIndex);
        setPageSize(newPageSize);
      }
    }
  };

  const columns: ColumnDef<Notice>[] = [
    {
      accessorKey: 'id',
      header: '번호',
      cell: (info) => info.getValue<number>(),
    },
    {
      accessorKey: 'title',
      header: '제목',
      cell: (info) => (
        <Button
          variant="text"
          color="primary"
          onClick={() => handleViewNotice(info.row.original.id)}
        >
          {info.getValue<string>()}
        </Button>
      ),
    },
    { accessorKey: 'createdBy', header: '작성자' },
    {
      accessorKey: 'createdAt',
      header: '작성일',
      cell: (info) => new Date(info.getValue<string>()).toLocaleString(),
    },
    { accessorKey: 'readCount', header: '조회수' },
    {
      accessorKey: 'actions',
      header: '수정/삭제',
      cell: (info) => (
        <>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleEditNotice(info.row.original.id)}
            style={{ marginRight: '10px' }}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => handleDeleteNotice(info.row.original.id)}
          >
            삭제
          </Button>
        </>
      ),
    },
  ];

  const table = useReactTable<Notice>({
    data: notices,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  const renderPageNumbers = () => {
    const startPage = Math.floor(pageIndex / 5) * 5;
    const endPage = Math.min(startPage + 5, table.getPageCount());
  
    return Array.from({ length: endPage - startPage }, (_, i) => startPage + i).map((number) => (
      <Button
        key={number}
        variant={pageIndex === number ? 'contained' : 'outlined'}
        color="primary"
        style={{ marginRight: '5px', minWidth: '30px', padding: '5px' }}
        onClick={() => {
          table.setPageIndex(number);
        }}
      >
        {number + 1}
      </Button>
    ));
  };

  return (
    <div className="notice-control-container" style={{ padding: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        공지사항 관리
      </Typography>
      <div
        className="search-container"
        style={{
          display: 'flex',
          position: 'sticky',
          top: 70,
          backgroundColor: '#fff',
          zIndex: 1,
          paddingTop: '10px',
          paddingBottom: '10px',
          marginBottom: '20px',
        }}
      >
        <TextField
          label="제목 검색"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: '10px', height: '40px' }}
          InputProps={{
            style: { height: '100%' },
          }}
        />
        <TextField
          label="내용 검색"
          variant="outlined"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ marginRight: '10px', height: '40px' }}
          InputProps={{
            style: { height: '100%' },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          style={{ marginRight: '10px' }}
        >
          검색
        </Button>
        <Button variant="contained" color="primary" onClick={handleClickOpen}>
          공지사항 등록
        </Button>
      </div>
      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <>
          <TableContainer
            component={Paper}
            style={{ maxHeight: 545, overflowY: 'auto' }}
            className="custom-scrollbar custom-table"
          >
            <Table stickyHeader>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} style={{ backgroundColor: '#cfcfcf' }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} style={{ textAlign: 'center' }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow key={`${row.id}-${index}`}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={`${cell.id}-${index}`}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} style={{ textAlign: 'center' }}>
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Button onClick={() => table.setPageIndex(pageIndex - 1)} disabled={!table.getCanPreviousPage()} variant="contained" color="primary" style={{ marginRight: '10px' }}>
                이전
              </Button>
              <Button onClick={() => table.setPageIndex(pageIndex + 1)} disabled={!table.getCanNextPage()} variant="contained" color="primary">
                다음
              </Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <Button onClick={() => table.setPageIndex(0)} disabled={pageIndex === 0} variant="contained" color="primary" style={{ marginRight: '10px', minWidth: '30px', padding: '5px', width: 50 }}>
                처음
              </Button>
              <Button onClick={() => table.setPageIndex(Math.max(0, pageIndex - 5))} disabled={pageIndex < 5} variant="contained" color="warning" style={{ marginRight: '15px', minWidth: '30px', padding: '5px' }}>
                -5
              </Button>
              {renderPageNumbers()}
              <Button onClick={() => table.setPageIndex(Math.min(table.getPageCount() - 1, pageIndex + 5))} disabled={pageIndex >= table.getPageCount() - 5} variant="contained" color="warning" style={{ marginLeft: '10px', minWidth: '30px', padding: '5px' }}>
                +5
              </Button>
              <Button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={pageIndex === table.getPageCount() - 1} variant="contained" color="primary" style={{ marginLeft: '10px', minWidth: '30px', padding: '5px', width: 50 }}>
                끝
              </Button>
            </div>
            <div>
              <Typography variant="body1" component="span" style={{ marginRight: '10px' }}>
                페이지 {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </Typography>
              <Select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <MenuItem key={size} value={size}>
                    Show {size}
                  </MenuItem>
                ))}
              </Select>
            </div>
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
          <Typography variant="body1" gutterBottom>
            작성자: {selectedNotice?.createdBy}
          </Typography>
          <Typography variant="body1" gutterBottom>
            작성일: {selectedNotice?.createdAt}
          </Typography>
          <Typography variant="body1" gutterBottom>
            조회수: {selectedNotice?.readCount}
          </Typography>
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