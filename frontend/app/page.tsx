"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
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
  Stack
} from "@mui/material";
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  Healing as HealingIcon,
  Place as PlaceIcon,
  Emergency as EmergencyIcon,
  Refresh as RefreshIcon,
  MedicalInformation as MedIcon
} from "@mui/icons-material";

// グラフィカルで視認性の高いテーマ作成
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // 信頼感のあるブルー
    },
    secondary: {
      main: '#388e3c', // 医療・救急を想起させるグリーン
    },
    error: {
      main: '#d32f2f', // 警告
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
    },
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '10px 24px',
          fontWeight: 700,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
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

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [casualties, setCasualties] = useState<Casualty[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

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
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            p: 2
          }}
        >
          <Container maxWidth="xs">
            <Paper elevation={24} sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
              <Avatar sx={{ m: '0 auto 16px', bgcolor: 'secondary.main', width: 64, height: 64 }}>
                <HospitalIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" gutterBottom color="primary" sx={{ letterSpacing: -1 }}>
                LAX MEDIC
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
                傷病者管理・医療記録システム
              </Typography>

              <form onSubmit={handleLogin}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="表示名 (例: おにし)"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="共有パスワード"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MedIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    required
                  />
                  {loginError && (
                    <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                      {loginError}
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    endIcon={<LoginIcon />}
                    sx={{ py: 2, fontSize: '1.1rem' }}
                  >
                    ログイン
                  </Button>
                </Stack>
              </form>
              <Typography variant="caption" sx={{ display: 'block', mt: 4, color: 'text.disabled', fontWeight: 700 }}>
                FOR INTERNAL USE ONLY
              </Typography>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)', bgcolor: 'white', color: 'text.primary' }}>
          <Toolbar>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 32, height: 32 }}>L</Avatar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, letterSpacing: -0.5 }}>
              LAX MEDIC <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary', ml: 1, fontSize: '0.9rem' }}>DASHBOARD</Box>
            </Typography>
            <Typography variant="body2" sx={{ mr: 2, fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
              {userName}
            </Typography>
            <IconButton color="error" onClick={() => setIsLoggedIn(false)} size="small" sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <Grid container spacing={4}>
            {/* 登録セクション */}
            <Grid item xs={12} lg={4}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AddIcon color="primary" /> 新規対応記録
              </Typography>
              <Card sx={{ p: 1 }}>
                <CardContent>
                  <form onSubmit={handleCreate}>
                    <Stack spacing={2}>
                      <TextField label="患者名" fullWidth required value={newRecord.patient_name} onChange={e => setNewRecord({ ...newRecord, patient_name: e.target.value })} size="small" />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField label="大学名" fullWidth value={newRecord.university} onChange={e => setNewRecord({ ...newRecord, university: e.target.value })} size="small" />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="学年" fullWidth value={newRecord.grade} onChange={e => setNewRecord({ ...newRecord, grade: e.target.value })} size="small" />
                        </Grid>
                      </Grid>
                      <TextField label="場所・状況" fullWidth multiline rows={2} value={newRecord.location_detail} onChange={e => setNewRecord({ ...newRecord, location_detail: e.target.value })} size="small" placeholder="例: グラウンドB 接触により転倒" />
                      <TextField label="負傷の詳細" fullWidth multiline rows={3} value={newRecord.injury_detail} onChange={e => setNewRecord({ ...newRecord, injury_detail: e.target.value })} size="small" />
                      <TextField label="処置内容" fullWidth multiline rows={3} value={newRecord.treatment} onChange={e => setNewRecord({ ...newRecord, treatment: e.target.value })} size="small" color="secondary" />
                      <TextField label="搬送・受診要否" fullWidth value={newRecord.transport_needed} onChange={e => setNewRecord({ ...newRecord, transport_needed: e.target.value })} size="small" />
                      <TextField label="備考" fullWidth value={newRecord.remarks} onChange={e => setNewRecord({ ...newRecord, remarks: e.target.value })} size="small" />

                      <Button type="submit" variant="contained" color="secondary" fullWidth startIcon={<AddIcon />}>
                        保存
                      </Button>
                    </Stack>
                  </form>
                </CardContent>
              </Card>
            </Grid>

            {/* 一覧セクション */}
            <Grid item xs={12} lg={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon color="primary" /> 記録履歴
                </Typography>
                <IconButton onClick={fetchCasualties} disabled={loading} size="small">
                  <RefreshIcon sx={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
                </IconButton>
              </Box>

              {fetchError && (
                <Alert severity="error" sx={{ mb: 4 }}>{fetchError}</Alert>
              )}

              <Stack spacing={2}>
                {casualties.map((c) => (
                  <Card key={c.id}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                            {c.patient_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            {c.university} {c.grade}
                          </Typography>
                        </Box>
                        <Chip
                          label={new Date(c.occurred_at).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          size="small"
                        />
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 800, display: 'block' }}>状況</Typography>
                            <Typography variant="body2">{c.location_detail || "---"}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 800, display: 'block' }}>負傷詳細</Typography>
                            <Typography variant="body2">{c.injury_detail}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 1.5, bgcolor: 'secondary.light', color: 'white' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <HealingIcon fontSize="inherit" /> 処置
                            </Typography>
                            <Typography variant="body2">{c.treatment}</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          icon={<HospitalIcon />}
                          label={c.transport_needed || "搬送不要"}
                          color={c.transport_needed?.includes("要") ? "error" : "default"}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          対応者: {c.responder}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {casualties.length === 0 && !loading && (
                  <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed grey' }}>
                    <Typography color="text.secondary">記録はありません</Typography>
                  </Paper>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Container>
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
