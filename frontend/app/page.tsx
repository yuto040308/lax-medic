"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  Paper,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Fab,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Logout as LogoutIcon,
  Add as AddIcon,
  LocalHospital as HospitalIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  FilterAlt as FilterAltIcon,
  Clear as ClearIcon
} from "@mui/icons-material";

// グラフィカルで視認性の高いテーマ作成
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#388e3c',
    },
    error: {
      main: '#d32f2f',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

interface Casualty {
  id?: string;
  occurred_at: string;
  patient_name: string;
  university: string;
  grade: string;
  position: string;
  location_detail: string;
  injury_detail: string;
  treatment: string;
  transport_needed: string;
  staff_contact: string;
  responder: string;
  remarks: string;
}

interface Filters {
  patient_name: string;
  university: string;
  grade: string;
  location_detail: string;
  injury_detail: string;
  treatment: string;
  transport_needed: string;
  responder: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [casualties, setCasualties] = useState<Casualty[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // 詳細フィルタの状態
  const [filters, setFilters] = useState<Filters>({
    patient_name: "",
    university: "",
    grade: "",
    location_detail: "",
    injury_detail: "",
    treatment: "",
    transport_needed: "",
    responder: "",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [newRecord, setNewRecord] = useState<Casualty>({
    occurred_at: "",
    patient_name: "",
    university: "",
    grade: "",
    position: "",
    location_detail: "",
    injury_detail: "",
    treatment: "",
    transport_needed: "",
    staff_contact: "",
    responder: "",
    remarks: "",
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    if (isLoggedIn) {
      fetchCasualties();
    }
  }, [isLoggedIn]);

  // カラム別フィルタリングロジック
  const filteredCasualties = useMemo(() => {
    return casualties.filter((c) => {
      return (
        c.patient_name.toLowerCase().includes(filters.patient_name.toLowerCase()) &&
        c.university.toLowerCase().includes(filters.university.toLowerCase()) &&
        c.grade.toLowerCase().includes(filters.grade.toLowerCase()) &&
        c.location_detail.toLowerCase().includes(filters.location_detail.toLowerCase()) &&
        c.injury_detail.toLowerCase().includes(filters.injury_detail.toLowerCase()) &&
        c.treatment.toLowerCase().includes(filters.treatment.toLowerCase()) &&
        (c.transport_needed || "").toLowerCase().includes(filters.transport_needed.toLowerCase()) &&
        c.responder.toLowerCase().includes(filters.responder.toLowerCase())
      );
    });
  }, [casualties, filters]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, password }),
      });
      if (res.ok) {
        setIsLoggedIn(true);
      } else {
        const errorData = await res.json();
        setLoginError(errorData.error || "Login failed");
      }
    } catch (err) {
      setLoginError("Connection error. Is backend running?");
    }
  };

  const fetchCasualties = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch(`${apiBaseUrl}/api/casualties`);
      if (res.ok) {
        const data = await res.json();
        setCasualties(data || []);
      } else {
        setFetchError("Failed to fetch records from database.");
      }
    } catch (err) {
      setFetchError("Network error: Cannot reach the backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBaseUrl}/api/casualties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newRecord, responder: userName }),
      });
      if (res.ok) {
        setOpenDialog(false);
        fetchCasualties();
        setNewRecord({
          occurred_at: "",
          patient_name: "",
          university: "",
          grade: "",
          position: "",
          location_detail: "",
          injury_detail: "",
          treatment: "",
          transport_needed: "",
          staff_contact: "",
          responder: "",
          remarks: "",
        });
      } else {
        const errorData = await res.json();
        alert("Error: " + errorData.error);
      }
    } catch (err) {
      alert("Network error while saving record.");
    }
  };

  const clearFilters = () => {
    setFilters({
      patient_name: "",
      university: "",
      grade: "",
      location_detail: "",
      injury_detail: "",
      treatment: "",
      transport_needed: "",
      responder: "",
    });
  };

  // ログイン画面
  if (!isLoggedIn) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            p: 2
          }}
        >
          <Container maxWidth="xs">
            <Paper elevation={24} sx={{ p: 4, borderRadius: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
              <Avatar sx={{ m: '0 auto 16px', bgcolor: 'primary.main', width: 64, height: 64 }}>
                <HospitalIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" gutterBottom color="text.primary">
                LAX MEDIC
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
                MEDICAL CARE SYSTEM
              </Typography>

              <form onSubmit={handleLogin}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="名前 (例: 田中)"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label="パスワード"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {loginError && (
                    <Alert severity="error" variant="filled">
                      {loginError}
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ py: 1.5 }}
                  >
                    ログイン
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  // メインダッシュボード
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 32, height: 32 }}>L</Avatar>
              <Typography variant="h6" component="div">
                LAX MEDIC DASHBOARD
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                新規対応
              </Button>
              <IconButton onClick={fetchCasualties} disabled={loading}>
                <RefreshIcon sx={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
              </IconButton>
              <IconButton color="default" onClick={() => setIsLoggedIn(false)}>
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* 詳細検索エリア */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <FilterAltIcon color="primary" />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                詳細検索・絞り込み
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                disabled={Object.values(filters).every(v => v === "")}
              >
                検索クリア
              </Button>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth size="small" label="患者名"
                  value={filters.patient_name}
                  onChange={(e) => setFilters({ ...filters, patient_name: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth size="small" label="大学名"
                  value={filters.university}
                  onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                <TextField
                  fullWidth size="small" label="学年"
                  value={filters.grade}
                  onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4.5 }}>
                <TextField
                  fullWidth size="small" label="場所・状況"
                  value={filters.location_detail}
                  onChange={(e) => setFilters({ ...filters, location_detail: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth size="small" label="負傷詳細"
                  value={filters.injury_detail}
                  onChange={(e) => setFilters({ ...filters, injury_detail: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth size="small" label="処置内容"
                  value={filters.treatment}
                  onChange={(e) => setFilters({ ...filters, treatment: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth size="small" label="搬送要否"
                  value={filters.transport_needed}
                  onChange={(e) => setFilters({ ...filters, transport_needed: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth size="small" label="対応者"
                  value={filters.responder}
                  onChange={(e) => setFilters({ ...filters, responder: e.target.value })}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* 一覧テーブル */}
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                検索結果: {filteredCasualties.length}件 / 全 {casualties.length}件
              </Typography>
            </Box>

            <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
              <Table stickyHeader size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, minWidth: 100, bgcolor: 'grey.100' }}>時間</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 120, bgcolor: 'grey.100' }}>患者名</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 150, bgcolor: 'grey.100' }}>大学・学年</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 200, bgcolor: 'grey.100' }}>場所・状況</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 250, bgcolor: 'grey.100' }}>負傷詳細</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 250, bgcolor: 'grey.100' }}>処置内容</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 130, bgcolor: 'grey.100' }}>搬送要否</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 100, bgcolor: 'grey.100' }}>対応者</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCasualties.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontSize: '0.875rem' }}>
                        {new Date(c.occurred_at).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{c.patient_name}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Chip label={c.university} size="small" variant="outlined" />
                          <Chip label={c.grade} size="small" variant="outlined" />
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                        {c.location_detail}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{c.injury_detail}</TableCell>
                      <TableCell>
                        <Box sx={{ p: 1, bgcolor: 'secondary.light', color: 'white', borderRadius: 1, fontSize: '0.875rem' }}>
                          {c.treatment}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {c.transport_needed?.includes("要") ? (
                          <Chip label={c.transport_needed} color="error" size="small" variant="filled" />
                        ) : (
                          <Typography variant="caption" color="text.secondary">{c.transport_needed || "不要"}</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.responder}</TableCell>
                    </TableRow>
                  ))}
                  {filteredCasualties.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                        <Typography color="text.secondary">条件に一致する記録が見つかりません</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>

        {/* モバイル用追加ボタン */}
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 32, right: 32, display: { md: 'none' } }}
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon />
        </Fab>

        {/* 新規追加ダイアログ */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <form onSubmit={handleCreate}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              新規対応記録の作成
              <IconButton onClick={() => setOpenDialog(false)} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField label="患者名" fullWidth required value={newRecord.patient_name} onChange={e => setNewRecord({ ...newRecord, patient_name: e.target.value })} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField label="大学名" fullWidth value={newRecord.university} onChange={e => setNewRecord({ ...newRecord, university: e.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField label="学年" fullWidth value={newRecord.grade} onChange={e => setNewRecord({ ...newRecord, grade: e.target.value })} />
                  </Grid>
                </Grid>
                <TextField label="受傷場所・状況" fullWidth multiline rows={2} value={newRecord.location_detail} onChange={e => setNewRecord({ ...newRecord, location_detail: e.target.value })} placeholder="例: グラウンドB、ゴール前で接触" />
                <TextField label="負傷の詳細" fullWidth multiline rows={3} value={newRecord.injury_detail} onChange={e => setNewRecord({ ...newRecord, injury_detail: e.target.value })} />
                <TextField label="処置内容" fullWidth multiline rows={3} value={newRecord.treatment} onChange={e => setNewRecord({ ...newRecord, treatment: e.target.value })} color="secondary" />
                <TextField label="搬送・受診の要否" fullWidth value={newRecord.transport_needed} onChange={e => setNewRecord({ ...newRecord, transport_needed: e.target.value })} placeholder="例: 要病院受診、緊急搬送" />
                <TextField label="備考" fullWidth value={newRecord.remarks} onChange={e => setNewRecord({ ...newRecord, remarks: e.target.value })} />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenDialog(false)}>キャンセル</Button>
              <Button type="submit" variant="contained" color="primary">保存する</Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </ThemeProvider>
  );
}
