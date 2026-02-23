"use client";

import { useEffect, useState } from "react";

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
      setLoginError("Connection error");
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
        setFetchError("Failed to fetch data");
      }
    } catch (err) {
      setFetchError("Connection error");
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
        alert("Registration failed: " + errorData.error);
      }
    } catch (err) {
      alert("Registration failed");
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-950 text-white font-sans">
        <div className="w-full max-w-sm p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Lax Medic Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">表示名 (例: おにし)</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">共有パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Password"
                required
              />
            </div>
            {loginError && <p className="text-red-400 text-sm animate-pulse">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold transition shadow-lg shadow-blue-600/20 active:scale-95"
            >
              ログイン
            </button>
          </form>
          <p className="mt-8 text-xs text-center text-slate-500 italic">
            合宿用 傷病者管理システム
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Lax Medic Dashboard
            </h1>
            <p className="text-sm text-slate-500">傷病者対応記録・管理</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium">{userName} としてログイン中</span>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-xs text-red-400 hover:text-red-300 transition"
            >
              ログアウト
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 登録フォーム */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h2 className="text-xl font-bold mb-6 text-emerald-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">＋</span>
                新規対応記録
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 ml-1">患者名</label>
                    <input type="text" placeholder="名前" className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-emerald-500 transition" value={newRecord.patient_name} onChange={e => setNewRecord({ ...newRecord, patient_name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 ml-1">大学名</label>
                    <input type="text" placeholder="○○大学" className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-emerald-500 transition" value={newRecord.university} onChange={e => setNewRecord({ ...newRecord, university: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 ml-1">学年</label>
                    <input type="text" placeholder="3年" className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-emerald-500 transition" value={newRecord.grade} onChange={e => setNewRecord({ ...newRecord, grade: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 ml-1">場所・状況</label>
                    <input type="text" placeholder="第1グラウンド 転倒" className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-emerald-500 transition" value={newRecord.location_detail} onChange={e => setNewRecord({ ...newRecord, location_detail: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 ml-1">負傷の詳細</label>
                  <textarea placeholder="右足首の捻挫など" className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-emerald-500 transition h-20 resize-none" value={newRecord.injury_detail} onChange={e => setNewRecord({ ...newRecord, injury_detail: e.target.value })}></textarea>
                </div>
                <div>
                  <label className="text-xs text-slate-500 ml-1">処置内容</label>
                  <textarea placeholder="RICE処置済み" className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-emerald-500 transition h-20 resize-none" value={newRecord.treatment} onChange={e => setNewRecord({ ...newRecord, treatment: e.target.value })}></textarea>
                </div>
                <div>
                  <label className="text-xs text-slate-500 ml-1">受診の必要性</label>
                  <input type="text" placeholder="要受診 / 不要" className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 outline-none focus:border-emerald-500 transition" value={newRecord.transport_needed} onChange={e => setNewRecord({ ...newRecord, transport_needed: e.target.value })} />
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition shadow-lg shadow-emerald-600/20 active:scale-95 focus:ring-2 focus:ring-emerald-500">
                  記録を保存する
                </button>
              </form>
            </div>
          </aside>

          {/* 一覧表示 */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                対応状況一覧
              </h2>
              <button
                onClick={fetchCasualties}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                disabled={loading}
              >
                {loading ? "更新中..." : "↺ 最新に更新"}
              </button>
            </div>

            {fetchError && (
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-sm">
                エラー: {fetchError}
              </div>
            )}

            <div className="grid gap-4">
              {casualties.map((c) => (
                <div key={c.id} className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/40 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                        {c.patient_name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {c.university} {c.grade} | {c.position || "未設定"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">
                        {new Date(c.occurred_at).toLocaleString('ja-JP', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">地点・状況</p>
                        <p className="text-slate-200">{c.location_detail || "---"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">受診要否</p>
                        <p className={c.transport_needed?.includes("要") ? "text-red-400 font-bold" : "text-emerald-400"}>
                          {c.transport_needed || "---"}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">受傷詳細</p>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{c.injury_detail}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-400/5 border border-emerald-400/10">
                      <p className="text-xs text-emerald-500/70 font-bold uppercase tracking-wider mb-1">実施処置</p>
                      <p className="text-sm text-emerald-100 whitespace-pre-wrap">{c.treatment}</p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500">
                      <div className="flex gap-4">
                        <span>連絡先: {c.staff_contact || "なし"}</span>
                      </div>
                      <span className="italic">対応責任者: {c.responder}</span>
                    </div>
                  </div>
                </div>
              ))}

              {casualties.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white/2 border border-dashed border-white/10 rounded-2xl">
                  <span className="text-4xl mb-2">📋</span>
                  <p>まだ記録がありません。左のフォームから登録してください。</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
