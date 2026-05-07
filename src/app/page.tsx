"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Brain,
  BarChart3,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Search,
  Bell,
  BellRing,
  Eye,
  EyeOff,
  GraduationCap,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Ship,
  Radar as RadarIcon,
  FileText,
  ChevronRight,
  Clock,
  Star,
  Award,
  XCircle,
  Save,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

/* ─── Types ─────────────────────────────────────────────────── */
interface KPIs {
  total: number;
  activos: number;
  enRiesgo: number;
  criticos: number;
  alertasActivas: number;
  alertasUrgentes: number;
  promedioGeneral: number;
  asistenciaPromedio: number;
}

interface Estudiante {
  id: string;
  grado: string;
  nombreCompleto: string;
  especialidad: string;
  programa: string;
  cohorte: string;
  correo: string;
  estado: string;
  notaPromedio: number;
  asistenciaPct: number;
  interaccionesLMS: number;
  riesgos: Riesgo[];
  alertas: Alerta[];
}

interface Riesgo {
  id: string;
  tipoRiesgo: string;
  nivelRiesgo: string;
  puntuacion: number;
  descripcion: string;
  estado: string;
}

interface Alerta {
  id: string;
  tipoAlerta: string;
  prioridad: string;
  mensaje: string;
  recomendacion: string;
  fechaCreacion: string;
  leida: boolean;
  resuelta: boolean;
  estudiante?: { nombreCompleto: string; grado: string; especialidad: string; programa: string };
}

interface EficaciaData {
  id: string;
  periodo: string;
  metrica: string;
  valor: number;
  meta: number;
  unidad: string;
}

interface DashboardData {
  kpis: KPIs;
  distribucionEstado: { estado: string; _count: { id: number } }[];
  distribucionPrograma: { programa: string; _count: { id: number }; _avg: { notaPromedio: number | null; asistenciaPct: number | null } }[];
  distribucionEspecialidad: { especialidad: string; _count: { id: number } }[];
  alertasPorTipo: { tipoAlerta: string; _count: { id: number } }[];
  riesgosPorTipo: { tipoRiesgo: string; _count: { id: number }; _avg: { puntuacion: number | null } }[];
  tendenciaSemanal: EficaciaData[];
  tendenciaPromedio: EficaciaData[];
  rendimientoTop5: { nombreCompleto: string; grado: string; notaPromedio: number; asistenciaPct: number; especialidad: string }[];
  rendimientoBajo5: { nombreCompleto: string; grado: string; notaPromedio: number; asistenciaPct: number; especialidad: string }[];
}

/* ─── Constants ─────────────────────────────────────────────── */
const COLORS_PIE = ["#22c55e", "#f59e0b", "#ef4444", "#6b7280"];
const NAVY_COLORS = ["#102a43", "#243b53", "#334e68", "#486581", "#627d98"];

const prioridadColors: Record<string, string> = {
  Urgente: "bg-danger-500 text-white",
  Alta: "bg-warning-500 text-white",
  Media: "bg-info-500 text-white",
  Baja: "bg-navy-400 text-white",
};

const estadoColors: Record<string, string> = {
  Activo: "bg-success-500/15 text-success-500 border-success-500/30",
  "En Riesgo": "bg-warning-500/15 text-warning-500 border-warning-500/30",
  Crítico: "bg-danger-500/15 text-danger-500 border-danger-500/30",
  Retirado: "bg-gray-400/15 text-gray-500 border-gray-400/30",
};

const nivelRiesgoColors: Record<string, string> = {
  Bajo: "text-success-500",
  Medio: "text-warning-500",
  Alto: "text-orange-500",
  Crítico: "text-danger-500",
};

/* ─── Main Component ────────────────────────────────────────── */
export default function NavIADashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [eficacia, setEficacia] = useState<EficaciaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("all");
  const [filterPrograma, setFilterPrograma] = useState("all");
  const [showNewStudentDialog, setShowNewStudentDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    grado: "",
    nombreCompleto: "",
    especialidad: "",
    programa: "",
    cohorte: "2026-I",
    correo: "",
  });
  const [selectedAlerta, setSelectedAlerta] = useState<Alerta | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, estRes, alertRes, efRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/estudiantes"),
        fetch("/api/alertas"),
        fetch("/api/eficacia"),
      ]);
      const dash = await dashRes.json();
      const est = await estRes.json();
      const alert = await alertRes.json();
      const ef = await efRes.json();
      setDashboardData(dash);
      setEstudiantes(est);
      setAlertas(alert);
      setEficacia(ef);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkAlertaLeida = async (id: string) => {
    try {
      await fetch("/api/alertas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, leida: true }),
      });
      setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, leida: true } : a)));
    } catch (err) {
      console.error("Error marking alerta:", err);
    }
  };

  const handleMarkAlertaResuelta = async (id: string) => {
    try {
      await fetch("/api/alertas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, resuelta: true }),
      });
      setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, resuelta: true } : a)));
    } catch (err) {
      console.error("Error resolving alerta:", err);
    }
  };

  const handleCreateStudent = async () => {
    try {
      const res = await fetch("/api/estudiantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      if (res.ok) {
        setShowNewStudentDialog(false);
        setNewStudent({ grado: "", nombreCompleto: "", especialidad: "", programa: "", cohorte: "2026-I", correo: "" });
        fetchData();
      }
    } catch (err) {
      console.error("Error creating student:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen nav-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Ship className="w-16 h-16 text-navy-300 animate-pulse mx-auto" />
            <RadarIcon className="w-8 h-8 text-gold-400 absolute -top-1 -right-1 animate-pulse-slow" />
          </div>
          <p className="text-navy-200 text-lg font-medium">Cargando sistema NAV-IA...</p>
          <div className="w-48 h-1 bg-navy-700 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gold-400 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: "60%" }} />
          </div>
        </div>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || {} as KPIs;
  const noLeidas = alertas.filter((a) => !a.leida).length;
  const urgentes = alertas.filter((a) => a.prioridad === "Urgente" && !a.leida).length;

  /* Filtered estudiantes */
  const filteredEstudiantes = estudiantes.filter((e) => {
    const matchSearch =
      e.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === "all" || e.estado === filterEstado;
    const matchPrograma = filterPrograma === "all" || e.programa === filterPrograma;
    return matchSearch && matchEstado && matchPrograma;
  });

  const estudiantesEnRiesgo = estudiantes.filter(
    (e) => e.estado === "En Riesgo" || e.estado === "Crítico"
  );

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* ─── Header ────────────────────────────────────── */}
      <header className="nav-gradient text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image src="/nav-ia-logo.png" alt="NAV-IA Logo" width={40} height={40} className="rounded" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wide">NAV-IA</h1>
                <p className="text-xs text-navy-300 -mt-0.5">Sistema de Alerta Temprana</p>
              </div>
              <Separator orientation="vertical" className="h-8 bg-navy-600 mx-2 hidden sm:block" />
              <p className="text-xs text-navy-300 hidden sm:block">Escuela de Posgrado · Armada Boliviana</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-navy-200 hover:text-white hover:bg-navy-700 relative"
                  onClick={() => setActiveTab("alertas")}
                >
                  <BellRing className="w-5 h-5" />
                  {urgentes > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {urgentes}
                    </span>
                  )}
                  {noLeidas > 0 && urgentes === 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-400 text-navy-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                      {noLeidas}
                    </span>
                  )}
                </Button>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-navy-700/50 rounded-lg px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                <span className="text-xs text-navy-200">IA Activa</span>
              </div>
              <Button variant="ghost" size="icon" className="text-navy-200 hover:text-white hover:bg-navy-700" onClick={fetchData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Navigation Tabs ────────────────────────────── */}
      <div className="bg-white border-b border-navy-100 shadow-sm sticky top-16 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent h-auto p-0 gap-0 w-full overflow-x-auto">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-navy-700 data-[state=active]:bg-navy-50 data-[state=active]:text-navy-900 data-[state=active]:shadow-none text-navy-500 hover:text-navy-700 hover:bg-navy-50/50 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm font-medium">Panel de Control</span>
              </TabsTrigger>
              <TabsTrigger
                value="riesgos"
                className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-danger-500 data-[state=active]:bg-danger-500/5 data-[state=active]:text-danger-500 data-[state=active]:shadow-none text-navy-500 hover:text-navy-700 hover:bg-navy-50/50 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="text-sm font-medium">Estudiantes en Riesgo</span>
                {(kpis.enRiesgo || 0) + (kpis.criticos || 0) > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                    {(kpis.enRiesgo || 0) + (kpis.criticos || 0)}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="incorporacion"
                className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-success-500 data-[state=active]:bg-success-500/5 data-[state=active]:text-success-500 data-[state=active]:shadow-none text-navy-500 hover:text-navy-700 hover:bg-navy-50/50 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium">Incorporación</span>
              </TabsTrigger>
              <TabsTrigger
                value="alertas"
                className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-gold-400 data-[state=active]:bg-gold-400/5 data-[state=active]:text-gold-500 data-[state=active]:shadow-none text-navy-500 hover:text-navy-700 hover:bg-navy-50/50 transition-all"
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">Alertas IA</span>
                {noLeidas > 0 && (
                  <Badge className="bg-gold-400 text-navy-900 text-[10px] px-1.5 py-0 h-4">
                    {noLeidas}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="eficacia"
                className="flex items-center gap-2 px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-navy-500 data-[state=active]:bg-navy-500/5 data-[state=active]:text-navy-600 data-[state=active]:shadow-none text-navy-500 hover:text-navy-700 hover:bg-navy-50/50 transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">Reporte de Eficacia</span>
              </TabsTrigger>
            </TabsList>

            {/* ─── TAB 1: PANEL DE CONTROL ───────────────── */}
            <TabsContent value="dashboard" className="mt-0">
              <div className="py-6 space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="card-glow border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-navy-500 font-medium uppercase tracking-wider">Total Cursantes</p>
                          <p className="text-2xl font-bold text-navy-900 mt-1">{kpis.total}</p>
                          <p className="text-xs text-navy-500 mt-1">Cohorte 2026-I</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-navy-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="card-glow-success border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-navy-500 font-medium uppercase tracking-wider">En Riesgo</p>
                          <p className="text-2xl font-bold text-danger-500 mt-1">{(kpis.enRiesgo || 0) + (kpis.criticos || 0)}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-danger-500" />
                            <p className="text-xs text-danger-500">Requieren atención</p>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-danger-500/10 flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-danger-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="card-glow border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-navy-500 font-medium uppercase tracking-wider">Promedio General</p>
                          <p className="text-2xl font-bold text-navy-900 mt-1">{(kpis.promedioGeneral || 0).toFixed(1)}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <ArrowUpRight className="w-3 h-3 text-success-500" />
                            <p className="text-xs text-success-500">+2.3 pts vs anterior</p>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center">
                          <Target className="w-6 h-6 text-navy-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="card-glow-warning border-none">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-navy-500 font-medium uppercase tracking-wider">Alertas Activas</p>
                          <p className="text-2xl font-bold text-gold-500 mt-1">{kpis.alertasActivas}</p>
                          <p className="text-xs text-navy-500 mt-1">{urgentes} urgentes</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center">
                          <Bell className="w-6 h-6 text-gold-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Secondary KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="border-none bg-gradient-to-r from-navy-900 to-navy-800 text-white">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center">
                        <Users className="w-5 h-5 text-navy-200" />
                      </div>
                      <div>
                        <p className="text-navy-300 text-xs font-medium">Activos</p>
                        <p className="text-xl font-bold">{kpis.activos}</p>
                      </div>
                      <div className="ml-auto">
                        <Progress value={((kpis.activos || 0) / (kpis.total || 1)) * 100} className="w-16 h-2 [&>div]:bg-success-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-gradient-to-r from-navy-900 to-navy-800 text-white">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-navy-200" />
                      </div>
                      <div>
                        <p className="text-navy-300 text-xs font-medium">Asistencia Prom.</p>
                        <p className="text-xl font-bold">{(kpis.asistenciaPromedio || 0).toFixed(0)}%</p>
                      </div>
                      <div className="ml-auto">
                        <Progress value={kpis.asistenciaPromedio || 0} className="w-16 h-2 [&>div]:bg-gold-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-gradient-to-r from-navy-900 to-navy-800 text-white">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-danger-500" />
                      </div>
                      <div>
                        <p className="text-navy-300 text-xs font-medium">Críticos</p>
                        <p className="text-xl font-bold text-danger-500">{kpis.criticos}</p>
                      </div>
                      <div className="ml-auto">
                        <Progress value={((kpis.criticos || 0) / (kpis.total || 1)) * 100} className="w-16 h-2 [&>div]:bg-danger-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Distribution Chart */}
                  <Card className="border-none card-glow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-navy-600" />
                        Distribución de Estudiantes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={(dashboardData?.distribucionEstado || []).map((d) => ({
                                name: d.estado,
                                value: d._count.id,
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {(dashboardData?.distribucionEstado || []).map((_, i) => (
                                <Cell key={`cell-${i}`} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              formatter={(value: string) => <span className="text-xs text-navy-600">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trend Desercion */}
                  <Card className="border-none card-glow lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-success-500" />
                        Tendencia de Deserción vs Promedio General
                      </CardTitle>
                      <CardDescription>Evolución semanal del cohorte 2026-I</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={(dashboardData?.tendenciaSemanal || []).map((d, i) => ({
                            ...d,
                            promedio: dashboardData?.tendenciaPromedio[i]?.valor || 0,
                            metaDesercion: d.meta,
                            metaPromedio: dashboardData?.tendenciaPromedio[i]?.meta || 0,
                          }))}>
                            <defs>
                              <linearGradient id="colorDesercion" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorPromedio" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2ec" />
                            <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#627d98" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#627d98" }} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                            <Legend formatter={(value: string) => <span className="text-xs text-navy-600">{value}</span>} />
                            <Area type="monotone" dataKey="valor" name="Deserción (%)" stroke="#ef4444" fill="url(#colorDesercion)" strokeWidth={2} />
                            <Line type="monotone" dataKey="metaDesercion" name="Meta Deserción" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                            <Area type="monotone" dataKey="promedio" name="Promedio (pts)" stroke="#22c55e" fill="url(#colorPromedio)" strokeWidth={2} />
                            <Line type="monotone" dataKey="metaPromedio" name="Meta Promedio" stroke="#22c55e" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Programa Performance */}
                  <Card className="border-none card-glow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-navy-600" />
                        Rendimiento por Programa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={(dashboardData?.distribucionPrograma || []).map((d) => ({
                            name: d.programa.length > 20 ? d.programa.substring(0, 20) + "..." : d.programa,
                            fullName: d.programa,
                            promedio: d._avg.notaPromedio || 0,
                            estudiantes: d._count.id,
                          }))} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2ec" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#627d98" }} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#627d98" }} width={130} />
                            <Tooltip
                              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                              formatter={(value: number, name: string) => [name === "promedio" ? `${value.toFixed(1)} pts` : value, name === "promedio" ? "Promedio" : "Estudiantes"]}
                            />
                            <Bar dataKey="promedio" fill="#334e68" radius={[0, 4, 4, 0]} barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Radar */}
                  <Card className="border-none card-glow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                        <RadarIcon className="w-4 h-4 text-navy-600" />
                        Mapa de Riesgos por Categoría
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={(dashboardData?.riesgosPorTipo || []).map((d) => ({
                            tipo: d.tipoRiesgo,
                            cantidad: d._count.id,
                            puntuacion: Math.round(d._avg.puntuacion || 0),
                          }))}>
                            <PolarGrid stroke="#d9e2ec" />
                            <PolarAngleAxis dataKey="tipo" tick={{ fontSize: 10, fill: "#627d98" }} />
                            <PolarRadiusAxis tick={{ fontSize: 10, fill: "#627d98" }} />
                            <Radar name="Casos" dataKey="cantidad" stroke="#334e68" fill="#334e68" fillOpacity={0.2} />
                            <Radar name="Puntuación Prom." dataKey="puntuacion" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                            <Legend formatter={(value: string) => <span className="text-xs text-navy-600">{value}</span>} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top & Bottom performers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-none card-glow-success">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                        <Star className="w-4 h-4 text-gold-400" />
                        Mejor Rendimiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {(dashboardData?.rendimientoTop5 || []).map((e, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-success-500/5 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center">
                              <span className="text-xs font-bold text-navy-700">{i + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-navy-800 truncate">{e.nombreCompleto}</p>
                              <p className="text-xs text-navy-500">{e.grado} · {e.especialidad}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-success-500">{e.notaPromedio.toFixed(1)}</p>
                              <p className="text-xs text-navy-400">{e.asistenciaPct.toFixed(0)}% asist.</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none card-glow-danger">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-danger-500" />
                        Mayor Riesgo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {(dashboardData?.rendimientoBajo5 || []).map((e, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-danger-500/5 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-danger-500/10 flex items-center justify-center">
                              <span className="text-xs font-bold text-danger-500">{i + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-navy-800 truncate">{e.nombreCompleto}</p>
                              <p className="text-xs text-navy-500">{e.grado} · {e.especialidad}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-danger-500">{e.notaPromedio.toFixed(1)}</p>
                              <p className="text-xs text-navy-400">{e.asistenciaPct.toFixed(0)}% asist.</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* ─── TAB 2: ESTUDIANTES EN RIESGO ──────────── */}
            <TabsContent value="riesgos" className="mt-0">
              <div className="py-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="border-none bg-danger-500/5">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-danger-500/10 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-danger-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-danger-500">{kpis.criticos}</p>
                        <p className="text-xs text-navy-600 font-medium">Estado Crítico</p>
                        <p className="text-[10px] text-navy-400">Intervención inmediata requerida</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-warning-500/5">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-warning-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-warning-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-warning-500">{kpis.enRiesgo}</p>
                        <p className="text-xs text-navy-600 font-medium">En Riesgo</p>
                        <p className="text-[10px] text-navy-400">Monitoreo intensivo</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-info-500/5">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-info-500/10 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6 text-info-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-info-500">
                          {estudiantesEnRiesgo.reduce((acc, e) => acc + (e.riesgos?.length || 0), 0)}
                        </p>
                        <p className="text-xs text-navy-600 font-medium">Riesgos Detectados</p>
                        <p className="text-[10px] text-navy-400">Total acumulado por la IA</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Students at Risk List */}
                <Card className="border-none card-glow">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-navy-800 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-danger-500" />
                      Flota de Estudiantes en Riesgo
                    </CardTitle>
                    <CardDescription>
                      Listado completo de oficiales cursantes con alertas de riesgo activas, ordenados por nivel de severidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[600px] scrollbar-thin">
                      <div className="space-y-4">
                        {estudiantesEnRiesgo.length === 0 ? (
                          <div className="text-center py-12 text-navy-400">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success-500" />
                            <p className="text-sm font-medium">No hay estudiantes en riesgo</p>
                            <p className="text-xs">Todos los cursantes se encuentran en estado activo</p>
                          </div>
                        ) : (
                          estudiantesEnRiesgo.map((est) => (
                            <div
                              key={est.id}
                              className={`p-4 rounded-xl border ${
                                est.estado === "Crítico"
                                  ? "border-danger-500/30 bg-danger-500/5 card-glow-danger"
                                  : "border-warning-500/30 bg-warning-500/5 card-glow-warning"
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex items-center gap-3 flex-1">
                                  <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                      est.estado === "Crítico" ? "bg-danger-500/10" : "bg-warning-500/10"
                                    }`}
                                  >
                                    <Users className={`w-5 h-5 ${est.estado === "Crítico" ? "text-danger-500" : "text-warning-500"}`} />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-navy-800">{est.nombreCompleto}</p>
                                    <p className="text-xs text-navy-500">
                                      {est.grado} · {est.especialidad}
                                    </p>
                                    <p className="text-xs text-navy-400">{est.programa}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                  <Badge variant="outline" className={estadoColors[est.estado]}>
                                    {est.estado === "Crítico" ? (
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                    ) : (
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                    )}
                                    {est.estado}
                                  </Badge>
                                  <div className="text-center">
                                    <p className="text-xs text-navy-400">Promedio</p>
                                    <p className={`text-sm font-bold ${est.notaPromedio < 60 ? "text-danger-500" : "text-warning-500"}`}>
                                      {est.notaPromedio.toFixed(1)}
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-navy-400">Asistencia</p>
                                    <p className={`text-sm font-bold ${est.asistenciaPct < 70 ? "text-danger-500" : "text-warning-500"}`}>
                                      {est.asistenciaPct.toFixed(0)}%
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-navy-400">LMS</p>
                                    <p className="text-sm font-bold text-navy-700">{est.interaccionesLMS}</p>
                                  </div>
                                </div>
                              </div>
                              {/* Risk Details */}
                              {est.riesgos && est.riesgos.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-navy-100">
                                  <p className="text-xs font-semibold text-navy-600 mb-2 flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" />
                                    Riesgos Identificados ({est.riesgos.length})
                                  </p>
                                  <div className="space-y-2">
                                    {est.riesgos.map((riesgo) => (
                                      <div key={riesgo.id} className="flex items-start gap-2 p-2 bg-white/60 rounded-lg">
                                        <div
                                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                            riesgo.nivelRiesgo === "Crítico"
                                              ? "bg-danger-500"
                                              : riesgo.nivelRiesgo === "Alto"
                                              ? "bg-warning-500"
                                              : "bg-navy-400"
                                          }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                              {riesgo.tipoRiesgo}
                                            </Badge>
                                            <span className={`text-[10px] font-bold ${nivelRiesgoColors[riesgo.nivelRiesgo] || "text-navy-600"}`}>
                                              {riesgo.nivelRiesgo} ({riesgo.puntuacion.toFixed(0)}/100)
                                            </span>
                                          </div>
                                          <p className="text-xs text-navy-600 mt-0.5">{riesgo.descripcion}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0">
                                          {riesgo.estado}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ─── TAB 3: INCORPORACIÓN ──────────────────── */}
            <TabsContent value="incorporacion" className="mt-0">
              <div className="py-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Add Student Form */}
                  <Card className="border-none card-glow lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-navy-800 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-success-500" />
                        Incorporar Nuevo Cursante
                      </CardTitle>
                      <CardDescription>
                        Registre un nuevo oficial al sistema NAV-IA para monitoreo y análisis de riesgo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-navy-700">Grado Militar</Label>
                          <Select value={newStudent.grado} onValueChange={(v) => setNewStudent({ ...newStudent, grado: v })}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Seleccionar grado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Capitán de Fragata">Capitán de Fragata</SelectItem>
                              <SelectItem value="Capitán de Corbeta">Capitán de Corbeta</SelectItem>
                              <SelectItem value="Teniente de Navío">Teniente de Navío</SelectItem>
                              <SelectItem value="Teniente de Fragata">Teniente de Fragata</SelectItem>
                              <SelectItem value="Alférez de Navío">Alférez de Navío</SelectItem>
                              <SelectItem value="Alférez de Fragata">Alférez de Fragata</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-navy-700">Nombre Completo *</Label>
                          <Input
                            className="bg-white"
                            placeholder="Ej: Juan Pérez Mamani"
                            value={newStudent.nombreCompleto}
                            onChange={(e) => setNewStudent({ ...newStudent, nombreCompleto: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-navy-700">Especialidad</Label>
                          <Select value={newStudent.especialidad} onValueChange={(v) => setNewStudent({ ...newStudent, especialidad: v })}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Seleccionar especialidad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ingeniería de Sistemas">Ingeniería de Sistemas</SelectItem>
                              <SelectItem value="Logística Militar">Logística Militar</SelectItem>
                              <SelectItem value="Comunicaciones">Comunicaciones</SelectItem>
                              <SelectItem value="Inteligencia Artificial">Inteligencia Artificial</SelectItem>
                              <SelectItem value="Ingeniería Eléctrica">Ingeniería Eléctrica</SelectItem>
                              <SelectItem value="Derecho Militar">Derecho Militar</SelectItem>
                              <SelectItem value="Navegación">Navegación</SelectItem>
                              <SelectItem value="Mecánica Naval">Mecánica Naval</SelectItem>
                              <SelectItem value="Estrategia Militar">Estrategia Militar</SelectItem>
                              <SelectItem value="Medicina Naval">Medicina Naval</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-navy-700">Programa de Posgrado</Label>
                          <Select value={newStudent.programa} onValueChange={(v) => setNewStudent({ ...newStudent, programa: v })}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Seleccionar programa" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Maestría en Ciberseguridad Naval">Maestría en Ciberseguridad Naval</SelectItem>
                              <SelectItem value="Diplomado en Gestión Estratégica">Diplomado en Gestión Estratégica</SelectItem>
                              <SelectItem value="Especialización en IA Aplicada">Especialización en IA Aplicada</SelectItem>
                              <SelectItem value="Diplomado en Tecnologías Digitales">Diplomado en Tecnologías Digitales</SelectItem>
                              <SelectItem value="Maestría en Gestión Pública">Maestría en Gestión Pública</SelectItem>
                              <SelectItem value="Especialización en Mantenimiento Industrial">Especialización en Mantenimiento Industrial</SelectItem>
                              <SelectItem value="Maestría en Derecho Internacional">Maestría en Derecho Internacional</SelectItem>
                              <SelectItem value="Diplomado en Tecnología y Defensa">Diplomado en Tecnología y Defensa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-navy-700">Cohorte</Label>
                          <Select value={newStudent.cohorte} onValueChange={(v) => setNewStudent({ ...newStudent, cohorte: v })}>
                            <SelectTrigger className="bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2026-I">2026-I</SelectItem>
                              <SelectItem value="2026-II">2026-II</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-navy-700">Correo Electrónico *</Label>
                          <Input
                            className="bg-white"
                            placeholder="oficial@armada.bo"
                            type="email"
                            value={newStudent.correo}
                            onChange={(e) => setNewStudent({ ...newStudent, correo: e.target.value })}
                          />
                        </div>
                        <Button
                          className="w-full bg-navy-800 hover:bg-navy-900 text-white"
                          onClick={handleCreateStudent}
                          disabled={!newStudent.nombreCompleto || !newStudent.correo}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Incorporar al Sistema
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Student Directory */}
                  <Card className="border-none card-glow lg:col-span-2">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-base font-semibold text-navy-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-navy-600" />
                            Directorio de Cursantes
                          </CardTitle>
                          <CardDescription>{filteredEstudiantes.length} de {estudiantes.length} estudiantes</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                            <Input
                              className="pl-9 bg-white w-48"
                              placeholder="Buscar..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          <Select value={filterEstado} onValueChange={setFilterEstado}>
                            <SelectTrigger className="w-36 bg-white">
                              <Filter className="w-4 h-4 mr-1" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="Activo">Activo</SelectItem>
                              <SelectItem value="En Riesgo">En Riesgo</SelectItem>
                              <SelectItem value="Crítico">Crítico</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="max-h-[550px] scrollbar-thin">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-navy-50/50 hover:bg-navy-50/50">
                              <TableHead className="text-xs font-semibold text-navy-600">Oficial</TableHead>
                              <TableHead className="text-xs font-semibold text-navy-600 hidden md:table-cell">Programa</TableHead>
                              <TableHead className="text-xs font-semibold text-navy-600">Estado</TableHead>
                              <TableHead className="text-xs font-semibold text-navy-600 text-right">Promedio</TableHead>
                              <TableHead className="text-xs font-semibold text-navy-600 text-right hidden sm:table-cell">Asistencia</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredEstudiantes.map((est) => (
                              <TableRow key={est.id} className="hover:bg-navy-50/30">
                                <TableCell>
                                  <div>
                                    <p className="text-sm font-medium text-navy-800">{est.nombreCompleto}</p>
                                    <p className="text-xs text-navy-400">{est.grado}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <p className="text-xs text-navy-600 max-w-[180px] truncate">{est.programa}</p>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={estadoColors[est.estado]}>
                                    {est.estado}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className={`text-sm font-semibold ${est.notaPromedio >= 80 ? "text-success-500" : est.notaPromedio >= 60 ? "text-warning-500" : "text-danger-500"}`}>
                                    {est.notaPromedio.toFixed(1)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right hidden sm:table-cell">
                                  <div className="flex items-center justify-end gap-2">
                                    <Progress value={est.asistenciaPct} className="w-12 h-1.5 [&>div]:bg-navy-600" />
                                    <span className="text-xs text-navy-600">{est.asistenciaPct.toFixed(0)}%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* ─── TAB 4: ALERTAS IA ─────────────────────── */}
            <TabsContent value="alertas" className="mt-0">
              <div className="py-6 space-y-6">
                {/* AI Status */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <Card className="border-none nav-gradient text-white">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-gold-400" />
                      </div>
                      <div>
                        <p className="text-navy-300 text-[10px] uppercase tracking-wider">Motor IA</p>
                        <p className="text-sm font-bold">Transformer + LSTM</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-danger-500/5">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-danger-500">{alertas.filter((a) => a.prioridad === "Urgente" && !a.leida).length}</p>
                      <p className="text-xs text-navy-600">Urgentes Sin Leer</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-warning-500/5">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-warning-500">{noLeidas}</p>
                      <p className="text-xs text-navy-600">Total No Leídas</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-success-500/5">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-success-500">{alertas.filter((a) => a.resuelta).length}</p>
                      <p className="text-xs text-navy-600">Resueltas</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Alert Chart */}
                <Card className="border-none card-glow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-navy-600" />
                      Distribución de Alertas por Tipo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={(dashboardData?.alertasPorTipo || []).map((d) => ({
                          tipo: d.tipoAlerta,
                          cantidad: d._count.id,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d9e2ec" />
                          <XAxis dataKey="tipo" tick={{ fontSize: 11, fill: "#627d98" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#627d98" }} allowDecimals={false} />
                          <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                          <Bar dataKey="cantidad" name="Alertas" radius={[4, 4, 0, 0]}>
                            {(dashboardData?.alertasPorTipo || []).map((_, i) => (
                              <Cell key={`cell-${i}`} fill={NAVY_COLORS[i % NAVY_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Alert List */}
                <Card className="border-none card-glow">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-navy-800 flex items-center gap-2">
                      <BellRing className="w-5 h-5 text-gold-500" />
                      Centro de Alertas IA
                    </CardTitle>
                    <CardDescription>
                      Alertas generadas por el modelo de inteligencia artificial basadas en análisis predictivo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[500px] scrollbar-thin">
                      <div className="space-y-3">
                        {alertas.map((alerta) => (
                          <div
                            key={alerta.id}
                            className={`p-4 rounded-xl border transition-all ${
                              alerta.leida
                                ? "bg-white/50 border-navy-100"
                                : alerta.prioridad === "Urgente"
                                ? "bg-danger-500/5 border-danger-500/30 card-glow-danger"
                                : "bg-gold-400/5 border-gold-400/30"
                            } ${alerta.resuelta ? "opacity-60" : ""}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                alerta.prioridad === "Urgente" ? "bg-danger-500/10" :
                                alerta.prioridad === "Alta" ? "bg-warning-500/10" :
                                alerta.prioridad === "Media" ? "bg-info-500/10" : "bg-navy-100"
                              }`}>
                                {alerta.prioridad === "Urgente" ? (
                                  <AlertCircle className="w-5 h-5 text-danger-500" />
                                ) : alerta.prioridad === "Alta" ? (
                                  <AlertTriangle className="w-5 h-5 text-warning-500" />
                                ) : (
                                  <Bell className="w-5 h-5 text-info-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <Badge className={prioridadColors[alerta.prioridad]}>{alerta.prioridad}</Badge>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{alerta.tipoAlerta}</Badge>
                                  {alerta.resuelta && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-success-500/10 text-success-500 border-success-500/30">
                                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                                      Resuelta
                                    </Badge>
                                  )}
                                  {!alerta.leida && (
                                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                                  )}
                                </div>
                                {alerta.estudiante && (
                                  <p className="text-xs text-navy-500 mb-1">
                                    <strong>{alerta.estudiante.grado} {alerta.estudiante.nombreCompleto}</strong> · {alerta.estudiante.programa}
                                  </p>
                                )}
                                <p className="text-sm text-navy-700">{alerta.mensaje}</p>
                                <div className="mt-2 p-2 bg-navy-50/50 rounded-lg">
                                  <p className="text-xs font-semibold text-navy-600 flex items-center gap-1">
                                    <Brain className="w-3 h-3 text-gold-500" />
                                    Recomendación IA:
                                  </p>
                                  <p className="text-xs text-navy-600 mt-0.5">{alerta.recomendacion}</p>
                                </div>
                                <p className="text-[10px] text-navy-400 mt-1.5 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(alerta.fechaCreacion).toLocaleString("es-BO", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1 flex-shrink-0">
                                {!alerta.leida && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-navy-400 hover:text-navy-700"
                                    onClick={() => handleMarkAlertaLeida(alerta.id)}
                                    title="Marcar como leída"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                {!alerta.resuelta && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-navy-400 hover:text-success-500"
                                    onClick={() => handleMarkAlertaResuelta(alerta.id)}
                                    title="Marcar como resuelta"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ─── TAB 5: REPORTE DE EFICACIA ────────────── */}
            <TabsContent value="eficacia" className="mt-0">
              <div className="py-6 space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-none bg-gradient-to-br from-success-500/10 to-success-500/5">
                    <CardContent className="p-4 text-center">
                      <Award className="w-8 h-8 text-success-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-success-500">
                        {eficacia.find((e) => e.metrica === "Tasa Deserción" && e.valor <= e.meta) ? "META CUMPLIDA" : "EN PROGRESO"}
                      </p>
                      <p className="text-xs text-navy-600 mt-1">Tasa de Deserción</p>
                      <p className="text-xs text-navy-400">Meta: ≤ 5% | Actual: {eficacia.find((e) => e.metrica === "Tasa Deserción" && e.periodo === "Sem. 6")?.valor || 0}%</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-gradient-to-br from-success-500/10 to-success-500/5">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 text-success-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-success-500">
                        {eficacia.find((e) => e.metrica === "Promedio General" && e.valor >= e.meta) ? "META CUMPLIDA" : "EN PROGRESO"}
                      </p>
                      <p className="text-xs text-navy-600 mt-1">Promedio General</p>
                      <p className="text-xs text-navy-400">Meta: ≥ 80 pts | Actual: {eficacia.find((e) => e.metrica === "Promedio General" && e.periodo === "Sem. 6")?.valor || 0} pts</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-gradient-to-br from-success-500/10 to-success-500/5">
                    <CardContent className="p-4 text-center">
                      <CheckCircle2 className="w-8 h-8 text-success-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-success-500">
                        {eficacia.find((e) => e.metrica === "Alertas Resueltas" && e.valor >= e.meta) ? "META CUMPLIDA" : "EN PROGRESO"}
                      </p>
                      <p className="text-xs text-navy-600 mt-1">Alertas Resueltas</p>
                      <p className="text-xs text-navy-400">Meta: ≥ 80% | Actual: {eficacia.find((e) => e.metrica === "Alertas Resueltas" && e.periodo === "Sem. 6")?.valor || 0}%</p>
                    </CardContent>
                  </Card>
                  <Card className="border-none bg-gradient-to-br from-success-500/10 to-success-500/5">
                    <CardContent className="p-4 text-center">
                      <Activity className="w-8 h-8 text-success-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-success-500">
                        {eficacia.find((e) => e.metrica === "Asistencia Promedio" && e.valor >= e.meta) ? "META CUMPLIDA" : "EN PROGRESO"}
                      </p>
                      <p className="text-xs text-navy-600 mt-1">Asistencia Promedio</p>
                      <p className="text-xs text-navy-400">Meta: ≥ 90% | Actual: {eficacia.find((e) => e.metrica === "Asistencia Promedio" && e.periodo === "Sem. 6")?.valor || 0}%</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Eficacia General */}
                  <Card className="border-none card-glow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-success-500" />
                        Evolución de Tasa de Deserción
                      </CardTitle>
                      <CardDescription>Comparativa semanal contra meta establecida</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={eficacia.filter((e) => e.metrica === "Tasa Deserción")}>
                            <defs>
                              <linearGradient id="colorDesEfic" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2ec" />
                            <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#627d98" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#627d98" }} domain={[0, 10]} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                            <Legend formatter={(value: string) => <span className="text-xs text-navy-600">{value}</span>} />
                            <Area type="monotone" dataKey="valor" name="Deserción (%)" stroke="#ef4444" fill="url(#colorDesEfic)" strokeWidth={2} />
                            <Line type="monotone" dataKey="meta" name="Meta (%)" stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Promedio Evolution */}
                  <Card className="border-none card-glow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-success-500" />
                        Evolución del Promedio General
                      </CardTitle>
                      <CardDescription>Progresión semanal contra meta de excelencia</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={eficacia.filter((e) => e.metrica === "Promedio General")}>
                            <defs>
                              <linearGradient id="colorPromEfic" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2ec" />
                            <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#627d98" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#627d98" }} domain={[60, 100]} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                            <Legend formatter={(value: string) => <span className="text-xs text-navy-600">{value}</span>} />
                            <Area type="monotone" dataKey="valor" name="Promedio (pts)" stroke="#334e68" fill="url(#colorPromEfic)" strokeWidth={2} />
                            <Line type="monotone" dataKey="meta" name="Meta (pts)" stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alertas Resueltas */}
                  <Card className="border-none card-glow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success-500" />
                        Tasa de Alertas Resueltas
                      </CardTitle>
                      <CardDescription>Eficacia en la atención de alertas generadas por la IA</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={eficacia.filter((e) => e.metrica === "Alertas Resueltas")}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2ec" />
                            <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#627d98" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#627d98" }} domain={[0, 100]} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                            <Legend formatter={(value: string) => <span className="text-xs text-navy-600">{value}</span>} />
                            <Bar dataKey="valor" name="Resueltas (%)" fill="#334e68" radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="meta" name="Meta (%)" stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Asistencia Evolution */}
                  <Card className="border-none card-glow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-navy-800 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-navy-600" />
                        Evolución de Asistencia Promedio
                      </CardTitle>
                      <CardDescription>Seguimiento semanal del índice de asistencia</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={eficacia.filter((e) => e.metrica === "Asistencia Promedio")}>
                            <defs>
                              <linearGradient id="colorAsisEfic" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d9e2ec" />
                            <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#627d98" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#627d98" }} domain={[70, 100]} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                            <Legend formatter={(value: string) => <span className="text-xs text-navy-600">{value}</span>} />
                            <Area type="monotone" dataKey="valor" name="Asistencia (%)" stroke="#0ea5e9" fill="url(#colorAsisEfic)" strokeWidth={2} />
                            <Line type="monotone" dataKey="meta" name="Meta (%)" stroke="#22c55e" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Data Table */}
                <Card className="border-none card-glow">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-navy-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-navy-600" />
                      Tabla Detallada de Métricas
                    </CardTitle>
                    <CardDescription>Resumen numérico completo del período de evaluación</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[400px] scrollbar-thin">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-navy-50/50 hover:bg-navy-50/50">
                            <TableHead className="text-xs font-semibold text-navy-600">Período</TableHead>
                            <TableHead className="text-xs font-semibold text-navy-600">Métrica</TableHead>
                            <TableHead className="text-xs font-semibold text-navy-600 text-right">Valor</TableHead>
                            <TableHead className="text-xs font-semibold text-navy-600 text-right">Meta</TableHead>
                            <TableHead className="text-xs font-semibold text-navy-600 text-right">Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {eficacia.map((e) => {
                            const achieved = e.metrica === "Tasa Deserción" ? e.valor <= e.meta : e.valor >= e.meta;
                            return (
                              <TableRow key={e.id} className="hover:bg-navy-50/30">
                                <TableCell className="text-sm text-navy-700 font-medium">{e.periodo}</TableCell>
                                <TableCell className="text-sm text-navy-600">{e.metrica}</TableCell>
                                <TableCell className="text-sm text-navy-800 font-bold text-right">{e.valor} {e.unidad}</TableCell>
                                <TableCell className="text-sm text-navy-500 text-right">{e.meta} {e.unidad}</TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="outline" className={achieved ? "bg-success-500/10 text-success-500 border-success-500/30" : "bg-danger-500/10 text-danger-500 border-danger-500/30"}>
                                    {achieved ? (
                                      <><CheckCircle2 className="w-3 h-3 mr-1" />Cumplido</>
                                    ) : (
                                      <><ArrowDownRight className="w-3 h-3 mr-1" />Pendiente</>
                                    )}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="bg-navy-900 text-navy-300 mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Image src="/nav-ia-logo.png" alt="NAV-IA" width={20} height={20} className="rounded opacity-60" />
              <span className="text-xs">NAV-IA · Sistema de Alerta Temprana y Retroalimentación Adaptativa</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span>Escuela de Posgrado · Armada Boliviana</span>
              <span className="text-navy-500">|</span>
              <span>Ciclo Académico 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
