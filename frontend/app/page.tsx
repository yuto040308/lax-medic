"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  Divider,
  Paper,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
  InputAdornment,
  Fab,
  Tooltip,
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
  InputBase,
  alpha,
  styled,
  Grid // MUI v5/v6 標準の Grid を使用
} from "@mui/material";
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Search as SearchIcon,
  Healing as HealingIcon,
  Place as PlaceIcon,
  Emergency as EmergencyIcon,
  Refresh as RefreshIcon,
  MedicalInformation as MedIcon,
  FilterList as FilterIcon,
  Close as CloseIcon
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

// 検索バーのカスタムスタイル
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

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

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [casualties, setCasualties] = useState<Casualty[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  // クライアントサイドフィルタリング
  const filteredCasualties = useMemo(() => {
    return casualties.filter((c) => {
      const searchStr = `${c.patient_name} ${c.university} ${c.injury_detail} ${c.treatment} ${c.responder}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [casualties, searchQuery]);

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
              <Typography variant="h6" component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
                LAX MEDIC DASHBOARD
              </Typography>
            </Box>

            <Search>
              <SearchIconWrapper>
                <SearchIcon color="action" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="選手名、大学、怪我の内容で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Search>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{ display: { xs: 'none', md: 'flex' } }}
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
          {/* 一覧テーブル */}
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {searchQuery ? `検索結果: ${filteredCasualties.length}件` : `全記録: ${casualties.length}件`}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterIcon />}
                disabled
              >
                フィルタ
              </Button>
            </Box>

            <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
              <Table stickyHeader size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, minWidth: 100 }}>時間</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 120 }}>患者名</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 150 }}>大学・学年</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 200 }}>場所・状況</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 250 }}>負傷詳細</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 250 }}>処置内容</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 130 }}>搬送要否</TableCell>
                    <TableCell sx={{ fontWeight: 800, minWidth: 100 }}>対応者</TableCell>
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
                        <Typography color="text.secondary">記録が見つかりません</Typography>
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
                  <Grid item xs={6}>
                    <TextField label="大学名" fullWidth value={newRecord.university} onChange={e => setNewRecord({ ...newRecord, university: e.target.value })} />
                  </Grid>
                  <Grid item xs={6}>
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
