Warning: truncated output (original token count: 127490)
Total output lines: 12165

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "./api";
import CadastroPessoas from "./CadastroPessoas.jsx";
import ReceitasProducao from "./ReceitasProducao.jsx";
import ComprasCotacoes from "./ComprasCotacoes.jsx";
import EntregasMotos from "./EntregasMotos.jsx";
import {
  LayoutDashboard, Package, FlaskConical, ChefHat, ShoppingCart,
  Truck, Users, UserCircle2, Wallet, BarChart3, Settings, Plug,
  Search, Bell, Sun, Moon, ChevronDown, TrendingUp, TrendingDown,
  AlertTriangle, Clock, ArrowUpRight, ArrowDownRight, Plus, Filter,
  MoreHorizontal, CheckCircle2, PauseCircle, Loader2, Boxes,
  FileText, XCircle, CircleDollarSign, PackageCheck, Trophy, Send, Star,
  Bike, MapPin, Upload, FileCode2, ScanLine
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// Marca — brasão estilizado (coroa + escudo + grinalda), herda currentColor
// ---------------------------------------------------------------------------
function BrandCrest({ size = 40, className }) {
  const arm = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <path d="M35 20 L40 29 L50 16 L60 29 L65 20 L61 33 L39 33 Z" fill="currentColor" />
      <rect x="37" y="33" width="26" height="3.5" rx="1" fill="currentColor" />
      <path d="M31 38 H69 V58 C69 73 58 82 50 89 C42 82 31 73 31 58 Z" fill="none" stroke="currentColor" strokeWidth="3" />
      <line x1="50" y1="38" x2="50" y2="89" stroke="currentColor" strokeWidth="2" />
      <text x="50" y="67" textAnchor="middle" fontSize="24" fontWeight="700" fill="currentColor" fontFamily="Georgia, serif">P</text>
      {arm.map(i => (
        <ellipse key={"l" + i} cx={27 - i * 3.2} cy={48 + i * 7.4} rx="4.2" ry="2.3"
          fill="currentColor" transform={`rotate(${-18 - i * 9} ${27 - i * 3.2} ${48 + i * 7.4})`} />
      ))}
      {arm.map(i => (
        <ellipse key={"r" + i} cx={73 + i * 3.2} cy={48 + i * 7.4} rx="4.2" ry="2.3"
          fill="currentColor" transform={`rotate(${18 + i * 9} ${73 + i * 3.2} ${48 + i * 7.4})`} />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Mock data — Império das Parmegianas (delivery)
// ---------------------------------------------------------------------------

const revenueTrend = [
  { mes: "Jan", receita: 68, custo: 41 },
  { mes: "Fev", receita: 74, custo: 44 },
  { mes: "Mar", receita: 79, custo: 47 },
  { mes: "Abr", receita: 86, custo: 51 },
  { mes: "Mai", receita: 92, custo: 54 },
  { mes: "Jun", receita: 101, custo: 58 },
];

const preparoSemana = [
  { dia: "Seg", porcoes: 84 }, { dia: "Ter", porcoes: 96 }, { dia: "Qua", porcoes: 78 },
  { dia: "Qui", porcoes: 112 }, { dia: "Sex", porcoes: 168 }, { dia: "Sáb", porcoes: 204 },
];

const margemData = [
  { name: "Custo", value: 51, color: "#94A3B8" },
  { name: "Margem", value: 49, color: "#7A1420" },
];

const initialMovs = [
  { tipo: "saida", desc: "Pedido #2214 — Parmegiana de Frango", qtd: "-3 porções", hora: "há 8 min" },
  { tipo: "entrada", desc: "Compra recebida — Contra-filé Bovino", qtd: "+40 kg", hora: "há 35 min" },
  { tipo: "producao", desc: "Preparo finalizado — Molho de Tomate Artesanal", qtd: "+18 L", hora: "há 1h" },
  { tipo: "saida", desc: "Pedido #2213 — Parmegiana Bovina + Fritas", qtd: "-2 porções", hora: "há 1h20" },
];

const initialEstoque = [
  {
    "cod": "2065049",
    "nome": "CIFAO DE AGUA GASEIFICADA",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "l",
    "status": "pendente",
    "codigoBarras": "9266",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918833",
    "nome": "COCA 2 LITROS",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "16",
    "ncm": "22021000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918837",
    "nome": "COCA 600ML",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "12",
    "ncm": "22021000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918841",
    "nome": "COCA LATA",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "8",
    "ncm": "22021000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918836",
    "nome": "COCA ZERO 600ML",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "13",
    "ncm": "22021000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918840",
    "nome": "COCA ZERO LATA",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9",
    "ncm": "22021000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918834",
    "nome": "GUARANÁ ANTÁRCTICA ZERO 600ML",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "15",
    "ncm": "22021000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918838",
    "nome": "GUARANÁ ANTÁRCTICA ZERO LATA",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "11",
    "ncm": "22021000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918808",
    "nome": "GUARANÁ ANTÁRTICA 1L",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9415",
    "ncm": "22021000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3296857",
    "nome": "GUARANÁ ZERO 1L",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9394",
    "ncm": "22021000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918829",
    "nome": "SUCO DEL VALLE (UVA)",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "21",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3688034",
    "nome": "VINHO BRANCO",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "ml",
    "status": "pendente",
    "codigoBarras": "9402",
    "ncm": "10063021",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2065054",
    "nome": "XAROPE FRUTAS VERMELHAS",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "l",
    "status": "pendente",
    "codigoBarras": "9260",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2065051",
    "nome": "XAROPE FRUTAS VERMELHAS SEM AÇUCAR",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "l",
    "status": "pendente",
    "codigoBarras": "9263",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2065025",
    "nome": "XAROPE MAÇÃ VERDE",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "l",
    "status": "pendente",
    "codigoBarras": "9300",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2670754",
    "nome": "XAROPE PINK LIMONADE",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "l",
    "status": "pendente",
    "codigoBarras": "9180",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918831",
    "nome": "ÁGUA SEM GÁS",
    "cat": "Bebidas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "19",
    "ncm": "22021000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411227",
    "nome": "ALMONDEGA",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9127",
    "ncm": "16025000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411124",
    "nome": "BACON",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 37.4,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "963",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3175357",
    "nome": "BACON CRU",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9372",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411133",
    "nome": "CALABRESA",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 30.16,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "969",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411151",
    "nome": "FILÉ DE FRANGO",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 3.09,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "983",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411153",
    "nome": "FILÉ DE TILÁPIA CRU",
    "cat": "Carnes",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "984",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411154",
    "nome": "FILÉ MIGNON",
    "cat": "Carnes",
    "qtd": 5,
    "min": 0,
    "custo": 70.49,
    "un": "un",
    "status": "ok",
    "codigoBarras": "985",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411156",
    "nome": "FRANGO DESFIADO",
    "cat": "Carnes",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "986",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2930214",
    "nome": "PEITO DE FRANGO",
    "cat": "Carnes",
    "qtd": 44.12,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "9338",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411183",
    "nome": "PEPPERONI",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 66.99,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9106",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411187",
    "nome": "PERDA CORTE FILÉ DE FRANGO",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9108",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411188",
    "nome": "PERDA CORTE FILÉ MIGNON",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9109",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3102247",
    "nome": "PERDA TILÁPIA",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9357",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411200",
    "nome": "PRESUNTO",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 20.9,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9115",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411196",
    "nome": "PRÉ PREPARO FRANGO PIZZA",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 1.88,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9112",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411198",
    "nome": "PRÉ PREPARO STROGO FRANGO",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 3.25,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9114",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411123",
    "nome": "STROGONOFF MIGNON CRU",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "962",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3062287",
    "nome": "TILÁPIA EMPANADA",
    "cat": "Carnes",
    "qtd": 0,
    "min": 0,
    "custo": 45.41,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9346",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411129",
    "nome": "CAIXA G",
    "cat": "Embalagens",
    "qtd": 4,
    "min": 0,
    "custo": 3.59,
    "un": "un",
    "status": "ok",
    "codigoBarras": "966",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411128",
    "nome": "CAIXA P",
    "cat": "Embalagens",
    "qtd": 5,
    "min": 0,
    "custo": 2.51,
    "un": "un",
    "status": "ok",
    "codigoBarras": "965",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411131",
    "nome": "CAIXA PIZZA G",
    "cat": "Embalagens",
    "qtd": 0,
    "min": 0,
    "custo": 1.93,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "968",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411130",
    "nome": "CAIXA PIZZA P",
    "cat": "Embalagens",
    "qtd": 0,
    "min": 0,
    "custo": 0.99,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "967",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2065122",
    "nome": "GARRAFINHAS SODA",
    "cat": "Embalagens",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9172",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411162",
    "nome": "LACRE CAIXA",
    "cat": "Embalagens",
    "qtd": 5,
    "min": 0,
    "custo": 0.1,
    "un": "un",
    "status": "ok",
    "codigoBarras": "990",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411169",
    "nome": "MARMITEX D6",
    "cat": "Embalagens",
    "qtd": 5,
    "min": 0,
    "custo": 0.39,
    "un": "un",
    "status": "ok",
    "codigoBarras": "994",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411171",
    "nome": "MARMITEX D7",
    "cat": "Embalagens",
    "qtd": 5,
    "min": 0,
    "custo": 0.57,
    "un": "un",
    "status": "ok",
    "codigoBarras": "995",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411172",
    "nome": "MARMITEX D8",
    "cat": "Embalagens",
    "qtd": 5,
    "min": 0,
    "custo": 1.44,
    "un": "un",
    "status": "ok",
    "codigoBarras": "996",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411191",
    "nome": "PLÁSTICO FILME",
    "cat": "Embalagens",
    "qtd": 5,
    "min": 0,
    "custo": 0.12,
    "un": "mt",
    "status": "ok",
    "codigoBarras": "9110",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2065087",
    "nome": "SACO 10X15",
    "cat": "Embalagens",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9227",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2065090",
    "nome": "SACO 3KG",
    "cat": "Embalagens",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9224",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2065007",
    "nome": "SACO 5KG",
    "cat": "Embalagens",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9160",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2065131",
    "nome": "SACO BATATA 12X20",
    "cat": "Embalagens",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "ok",
    "codigoBarras": "970",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2065127",
    "nome": "SACO BATATA 15X25",
    "cat": "Embalagens",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "ok",
    "codigoBarras": "9165",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411209",
    "nome": "SACO G",
    "cat": "Embalagens",
    "qtd": 5,
    "min": 0,
    "custo": 0.67,
    "un": "un",
    "status": "ok",
    "codigoBarras": "9121",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3167795",
    "nome": "TAMPA SODA",
    "cat": "Embalagens",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9371",
    "ncm": "39235000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411105",
    "nome": "ABOBRINHA CRU",
    "cat": "Hortifruti",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "951",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3061333",
    "nome": "ABOBRINHA EMPANADA",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 1.87,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9345",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411108",
    "nome": "ALHO",
    "cat": "Hortifruti",
    "qtd": 3,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "952",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411111",
    "nome": "ALHO CONGELADO",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "953",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3688048",
    "nome": "ALHO PORÓ",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9403",
    "ncm": "07039090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3688049",
    "nome": "ALHO PORÓ CARAMELIZADO",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9404",
    "ncm": "07039090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411126",
    "nome": "BRÓCOLIS",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 8.69,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "964",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3223941",
    "nome": "BRÓCOLIS CRU",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9380",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411140",
    "nome": "CEBOLA BRANCA",
    "cat": "Hortifruti",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "973",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411141",
    "nome": "CEBOLA ROXA",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 8.99,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "974",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411142",
    "nome": "CHAMPIGNON",
    "cat": "Hortifruti",
    "qtd": 5,
    "min": 0,
    "custo": 21.89,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "975",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918813",
    "nome": "LIMÃO SICILIANO (ZERO)",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "44",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3688123",
    "nome": "LIMÃO SICILIANO EM PÓ",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "g",
    "status": "pendente",
    "codigoBarras": "9414",
    "ncm": "21069029",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411213",
    "nome": "SALSA MAÇO",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9123",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3251165",
    "nome": "TORTA DE LIMÃO",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9387",
    "ncm": "19012090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2065050",
    "nome": "XAROPE LIMAO SICILIANO SEM AÇUCAR",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "l",
    "status": "pendente",
    "codigoBarras": "9265",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2065052",
    "nome": "XAROPE LIMÃO SICILIANO",
    "cat": "Hortifruti",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "l",
    "status": "pendente",
    "codigoBarras": "9262",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918820",
    "nome": "BROWNIE DOCE DE LEITE",
    "cat": "Laticínios",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "935",
    "ncm": "19059090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411146",
    "nome": "CREME DE LEITE",
    "cat": "Laticínios",
    "qtd": 5,
    "min": 0,
    "custo": 13.19,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "979",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411159",
    "nome": "GORGONZOLA",
    "cat": "Laticínios",
    "qtd": 0,
    "min": 0,
    "custo": 51.39,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "988",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411164",
    "nome": "LEITE",
    "cat": "Laticínios",
    "qtd": 1,
    "min": 0,
    "custo": 0,
    "un": "l",
    "status": "ok",
    "codigoBarras": "991",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3750454",
    "nome": "MANTEIGA COM SAL",
    "cat": "Laticínios",
    "qtd": 0,
    "min": 0,
    "custo": 33.48,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "7896066769738",
    "ncm": "04051000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411168",
    "nome": "MARGARINA",
    "cat": "Laticínios",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "993",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3303838",
    "nome": "MIX DE QUEIJOS",
    "cat": "Laticínios",
    "qtd": 0,
    "min": 0,
    "custo": 2.2,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9395",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411178",
    "nome": "MUSSARELA",
    "cat": "Laticínios",
    "qtd": 5000,
    "min": 0,
    "custo": 0.05,
    "un": "g",
    "status": "ok",
    "codigoBarras": "9101",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411181",
    "nome": "OVO",
    "cat": "Laticínios",
    "qtd": 19,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "ok",
    "codigoBarras": "9104",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411182",
    "nome": "PARMESÃO",
    "cat": "Laticínios",
    "qtd": 5000,
    "min": 0,
    "custo": 0.04,
    "un": "g",
    "status": "ok",
    "codigoBarras": "9105",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411203",
    "nome": "REQUEIJÃO",
    "cat": "Laticínios",
    "qtd": 5,
    "min": 0,
    "custo": 28.08,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "9117",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411113",
    "nome": "ARROZ",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "954",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3688028",
    "nome": "ARROZ ARBÓREO",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9401",
    "ncm": "10063021",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411121",
    "nome": "AZEITONA PRETA COM CAROÇO",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 38.55,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "1000",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411243",
    "nome": "AZEITONA PRETA FATIADA",
    "cat": "Mercearia",
    "qtd": 5,
    "min": 0,
    "custo": 27.14,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "9128",
    "ncm": "20057000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918843",
    "nome": "BATATA CROCANTE (G)",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 3.67,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "6",
    "ncm": "20052000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918844",
    "nome": "BATATA CROCANTE (M)",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 2.28,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "5",
    "ncm": "20052000",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411136",
    "nome": "CALDO DE CARNE",
    "cat": "Mercearia",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "ok",
    "codigoBarras": "971",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411138",
    "nome": "CALDO DE GALINHA",
    "cat": "Mercearia",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "ok",
    "codigoBarras": "972",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3688065",
    "nome": "CALDO DE LEGUMES",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "g",
    "status": "pendente",
    "codigoBarras": "9405",
    "ncm": "21041011",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2948210",
    "nome": "CATUPIRY",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 37.29,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9342",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411143",
    "nome": "CHIPS",
    "cat": "Mercearia",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "cx",
    "status": "ok",
    "codigoBarras": "976",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411144",
    "nome": "COLORAU",
    "cat": "Mercearia",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "977",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411148",
    "nome": "FARINHA DE ROSCA",
    "cat": "Mercearia",
    "qtd": 4.949,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "981",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411150",
    "nome": "FARINHA DE TRIGO",
    "cat": "Mercearia",
    "qtd": 1.4,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "982",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2741496",
    "nome": "GORDURA VEGETAL",
    "cat": "Mercearia",
    "qtd": 5,
    "min": 0,
    "custo": 12.02,
    "un": "l",
    "status": "ok",
    "codigoBarras": "9307",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411161",
    "nome": "KATCHUP",
    "cat": "Mercearia",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "989",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411175",
    "nome": "MASSA PIZZA G",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 7.05,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "998",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411174",
    "nome": "MASSA PIZZA P",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 3.8,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "997",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918811",
    "nome": "MAÇA VERDE",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "47",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3261865",
    "nome": "MOLHO BRANCO",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "7891132001903",
    "ncm": "21039091",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411176",
    "nome": "MOLHO DE TOMATE",
    "cat": "Mercearia",
    "qtd": 5,
    "min": 0,
    "custo": 13.14,
    "un": "l",
    "status": "ok",
    "codigoBarras": "999",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411177",
    "nome": "MOSTARDA",
    "cat": "Mercearia",
    "qtd": 5,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "9100",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411180",
    "nome": "ORÉGANO",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 23.06,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9103",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411211",
    "nome": "SAL",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9122",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411215",
    "nome": "SAQUINHO BATATA",
    "cat": "Mercearia",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9124",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411145",
    "nome": "SPAGHETTI CRU",
    "cat": "Mercearia",
    "qtd": 4.5,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "978",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411179",
    "nome": "ÓLEO",
    "cat": "Mercearia",
    "qtd": 3.56,
    "min": 0,
    "custo": 0,
    "un": "l",
    "status": "ok",
    "codigoBarras": "9102",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411202",
    "nome": "ARROZ PRONTO",
    "cat": "Pré-preparos",
    "qtd": 9.76,
    "min": 0,
    "custo": 2.27,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "9116",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3688068",
    "nome": "CALDO DE LEGUMES PRONTO",
    "cat": "Pré-preparos",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "l",
    "status": "pendente",
    "codigoBarras": "9406",
    "ncm": "2104101",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411166",
    "nome": "MACARRÃO SPAGHETTI",
    "cat": "Pré-preparos",
    "qtd": 0,
    "min": 0,
    "custo": 1.41,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "992",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411147",
    "nome": "MISTURINHA",
    "cat": "Pré-preparos",
    "qtd": 2.235,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "980",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3265267",
    "nome": "MOLHO BRANCO PRONTO",
    "cat": "Pré-preparos",
    "qtd": 0,
    "min": 0,
    "custo": 6.54,
    "un": "kg",
    "status": "pendente",
    "codigoBarras": "9392",
    "ncm": "21039091",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3688026",
    "nome": "PRÉ PREPARO ARROZ ARBÓREO",
    "cat": "Pré-preparos",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9400",
    "ncm": "10063021",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411192",
    "nome": "PRÉ PREPARO CARNE SPAGHETTI",
    "cat": "Pré-preparos",
    "qtd": 0,
    "min": 0,
    "custo": 38.78,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9111",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411197",
    "nome": "PRÉ PREPARO STROGO CARNE",
    "cat": "Pré-preparos",
    "qtd": 0,
    "min": 0,
    "custo": 6.29,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9113",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "2411217",
    "nome": "TEMPERO",
    "cat": "Pré-preparos",
    "qtd": 10.552,
    "min": 0,
    "custo": 0,
    "un": "kg",
    "status": "ok",
    "codigoBarras": "9125",
    "ncm": "21069090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "3094280",
    "nome": "BROWNIE DE NINHO",
    "cat": "Sobremesas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "9355",
    "ncm": "19059090",
    "fonte": "produtos.pdf"
  },
  {
    "cod": "1918819",
    "nome": "BROWNIE NUTELLA",
    "cat": "Sobremesas",
    "qtd": 0,
    "min": 0,
    "custo": 0,
    "un": "un",
    "status": "pendente",
    "codigoBarras": "937",
    "ncm": "19059090",
    "fonte": "produtos.pdf"
  }
];

const initialReceitas = [
  {
    "id": "REC-14732",
    "codigoReceita": "14732",
    "produtoCod": "2411202",
    "produto": "ARROZ PRONTO",
    "rendimento": 22.0,
    "un": "kg",
    "categoria": "Guarnições",
    "insumos": [
      {
        "cod": "2411113",
        "nome": "ARROZ",
        "qtd": 5.0,
        "un": "kg"
      },
      {
        "cod": "2411179",
        "nome": "ÓLEO",
        "qtd": 0.36,
        "un": "l"
      },
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.3,
        "un": "kg"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14733",
    "codigoReceita": "14733",
    "produtoCod": "2411217",
    "produto": "TEMPERO",
    "rendimento": 9.85,
    "un": "kg",
    "categoria": "Temperos",
    "insumos": [
      {
        "cod": "2411111",
        "nome": "ALHO CONGELADO",
        "qtd": 1.0,
        "un": "kg"
      },
      {
        "cod": "2411211",
        "nome": "SAL",
        "qtd": 8.0,
        "un": "kg"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14735",
    "codigoReceita": "14735",
    "produtoCod": "2411147",
    "produto": "MISTURINHA",
    "rendimento": 2.05,
    "un": "kg",
    "categoria": "Empanamento",
    "insumos": [
      {
        "cod": "2411164",
        "nome": "LEITE",
        "qtd": 1.0,
        "un": "l"
      },
      {
        "cod": "2411150",
        "nome": "FARINHA DE TRIGO",
        "qtd": 0.91,
        "un": "kg"
      },
      {
        "cod": "2411181",
        "nome": "OVO",
        "qtd": 3.0,
        "un": "un"
      },
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.03,
        "un": "kg"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14736",
    "codigoReceita": "14736",
    "produtoCod": "2411151",
    "produto": "FILÉ DE FRANGO",
    "rendimento": 9.0,
    "un": "un",
    "categoria": "Empanados",
    "insumos": [
      {
        "cod": "2930214",
        "nome": "PEITO DE FRANGO",
        "qtd": 1.3,
        "un": "kg"
      },
      {
        "cod": "2411147",
        "nome": "MISTURINHA",
        "qtd": 0.55,
        "un": "kg"
      },
      {
        "cod": "2411148",
        "nome": "FARINHA DE ROSCA",
        "qtd": 0.75,
        "un": "kg"
      },
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.02,
        "un": "kg"
      },
      {
        "cod": "2065127",
        "nome": "SACO BATATA 15X25",
        "qtd": 9.0,
        "un": "un"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14737",
    "codigoReceita": "14737",
    "produtoCod": "3061333",
    "produto": "ABOBRINHA EMPANADA",
    "rendimento": 6.0,
    "un": "un",
    "categoria": "Empanados",
    "insumos": [
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.2,
        "un": "kg"
      },
      {
        "cod": "2411105",
        "nome": "ABOBRINHA CRU",
        "qtd": 1.0,
        "un": "kg"
      },
      {
        "cod": "2411147",
        "nome": "MISTURINHA",
        "qtd": 0.45,
        "un": "kg"
      },
      {
        "cod": "2411148",
        "nome": "FARINHA DE ROSCA",
        "qtd": 0.6,
        "un": "kg"
      },
      {
        "cod": "2065127",
        "nome": "SACO BATATA 15X25",
        "qtd": 6.0,
        "un": "un"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14738",
    "codigoReceita": "14738",
    "produtoCod": "2411198",
    "produto": "PRÉ PREPARO STROGO FRANGO",
    "rendimento": 6.0,
    "un": "un",
    "categoria": "Pré-preparos",
    "insumos": [
      {
        "cod": "2411168",
        "nome": "MARGARINA",
        "qtd": 0.05,
        "un": "kg"
      },
      {
        "cod": "2411144",
        "nome": "COLORAU",
        "qtd": 0.01,
        "un": "kg"
      },
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.02,
        "un": "kg"
      },
      {
        "cod": "2411161",
        "nome": "KATCHUP",
        "qtd": 0.03,
        "un": "kg"
      },
      {
        "cod": "2411177",
        "nome": "MOSTARDA",
        "qtd": 0.02,
        "un": "kg"
      },
      {
        "cod": "2411138",
        "nome": "CALDO DE GALINHA",
        "qtd": 0.66,
        "un": "un"
      },
      {
        "cod": "2930214",
        "nome": "PEITO DE FRANGO",
        "qtd": 1.3,
        "un": "kg"
      },
      {
        "cod": "2065131",
        "nome": "SACO BATATA 12X20",
        "qtd": 6.0,
        "un": "un"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14739",
    "codigoReceita": "14739",
    "produtoCod": "2411197",
    "produto": "PRÉ PREPARO STROGO CARNE",
    "rendimento": 6.0,
    "un": "un",
    "categoria": "Pré-preparos",
    "insumos": [
      {
        "cod": "2411168",
        "nome": "MARGARINA",
        "qtd": 0.05,
        "un": "kg"
      },
      {
        "cod": "2411144",
        "nome": "COLORAU",
        "qtd": 0.01,
        "un": "kg"
      },
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.02,
        "un": "kg"
      },
      {
        "cod": "2411123",
        "nome": "STROGONOFF MIGNON CRU",
        "qtd": 1.1,
        "un": "kg"
      },
      {
        "cod": "2411136",
        "nome": "CALDO DE CARNE",
        "qtd": 0.66,
        "un": "un"
      },
      {
        "cod": "2411161",
        "nome": "KATCHUP",
        "qtd": 0.03,
        "un": "kg"
      },
      {
        "cod": "2411177",
        "nome": "MOSTARDA",
        "qtd": 0.02,
        "un": "kg"
      },
      {
        "cod": "2065131",
        "nome": "SACO BATATA 12X20",
        "qtd": 6.0,
        "un": "un"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14740",
    "codigoReceita": "14740",
    "produtoCod": "2411196",
    "produto": "PRÉ PREPARO FRANGO PIZZA",
    "rendimento": 20.0,
    "un": "un",
    "categoria": "Pré-preparos",
    "insumos": [
      {
        "cod": "2411144",
        "nome": "COLORAU",
        "qtd": 0.11,
        "un": "kg"
      },
      {
        "cod": "2411138",
        "nome": "CALDO DE GALINHA",
        "qtd": 1.0,
        "un": "un"
      },
      {
        "cod": "2411156",
        "nome": "FRANGO DESFIADO",
        "qtd": 1.0,
        "un": "kg"
      },
      {
        "cod": "2411179",
        "nome": "ÓLEO",
        "qtd": 0.12,
        "un": "l"
      },
      {
        "cod": "2065087",
        "nome": "SACO 10X15",
        "qtd": 20.0,
        "un": "un"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14741",
    "codigoReceita": "14741",
    "produtoCod": "2411192",
    "produto": "PRÉ PREPARO CARNE SPAGHETTI",
    "rendimento": 13.0,
    "un": "un",
    "categoria": "Pré-preparos",
    "insumos": [
      {
        "cod": "2411179",
        "nome": "ÓLEO",
        "qtd": 0.12,
        "un": "l"
      },
      {
        "cod": "2411123",
        "nome": "STROGONOFF MIGNON CRU",
        "qtd": 1.1,
        "un": "kg"
      },
      {
        "cod": "2411144",
        "nome": "COLORAU",
        "qtd": 0.01,
        "un": "kg"
      },
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.01,
        "un": "kg"
      },
      {
        "cod": "2411213",
        "nome": "SALSA MAÇO",
        "qtd": 0.01,
        "un": "kg"
      },
      {
        "cod": "2411140",
        "nome": "CEBOLA BRANCA",
        "qtd": 0.11,
        "un": "kg"
      },
      {
        "cod": "2411108",
        "nome": "ALHO",
        "qtd": 0.02,
        "un": "kg"
      },
      {
        "cod": "2411136",
        "nome": "CALDO DE CARNE",
        "qtd": 1.0,
        "un": "un"
      },
      {
        "cod": "2065087",
        "nome": "SACO 10X15",
        "qtd": 13.0,
        "un": "un"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14742",
    "codigoReceita": "14742",
    "produtoCod": "2411166",
    "produto": "MACARRÃO SPAGHETTI",
    "rendimento": 7.0,
    "un": "un",
    "categoria": "Pré-preparos",
    "insumos": [
      {
        "cod": "2411179",
        "nome": "ÓLEO",
        "qtd": 0.06,
        "un": "l"
      },
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.05,
        "un": "kg"
      },
      {
        "cod": "2411145",
        "nome": "SPAGHETTI CRU",
        "qtd": 0.5,
        "un": "kg"
      },
      {
        "cod": "2065127",
        "nome": "SACO BATATA 15X25",
        "qtd": 7.0,
        "un": "un"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14747",
    "codigoReceita": "14747",
    "produtoCod": "3062287",
    "produto": "TILÁPIA EMPANADA",
    "rendimento": 6.0,
    "un": "un",
    "categoria": "Empanados",
    "insumos": [
      {
        "cod": "2411153",
        "nome": "FILÉ DE TILÁPIA CRU",
        "qtd": 1.1,
        "un": "kg"
      },
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.02,
        "un": "kg"
      },
      {
        "cod": "2411148",
        "nome": "FARINHA DE ROSCA",
        "qtd": 0.06,
        "un": "kg"
      },
      {
        "cod": "2065131",
        "nome": "SACO BATATA 12X20",
        "qtd": 6.0,
        "un": "un"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14814",
    "codigoReceita": "14814",
    "produtoCod": "1918844",
    "produto": "BATATA CROCANTE (M)",
    "rendimento": 60.0,
    "un": "un",
    "categoria": "Batatas",
    "insumos": [
      {
        "cod": "2065131",
        "nome": "SACO BATATA 12X20",
        "qtd": 60.0,
        "un": "un"
      },
      {
        "cod": "2411143",
        "nome": "CHIPS",
        "qtd": 1.0,
        "un": "cx"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-14815",
    "codigoReceita": "14815",
    "produtoCod": "1918843",
    "produto": "BATATA CROCANTE (G)",
    "rendimento": 37.0,
    "un": "un",
    "categoria": "Batatas",
    "insumos": [
      {
        "cod": "2065127",
        "nome": "SACO BATATA 15X25",
        "qtd": 37.0,
        "un": "un"
      },
      {
        "cod": "2411143",
        "nome": "CHIPS",
        "qtd": 1.0,
        "un": "cx"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-15922",
    "codigoReceita": "15922",
    "produtoCod": "2411124",
    "produto": "BACON",
    "rendimento": 0.63,
    "un": "kg",
    "categoria": "Pré-preparos",
    "insumos": [
      {
        "cod": "3175357",
        "nome": "BACON CRU",
        "qtd": 1.0,
        "un": "kg"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-16239",
    "codigoReceita": "16239",
    "produtoCod": "2411126",
    "produto": "BRÓCOLIS",
    "rendimento": 0.75,
    "un": "kg",
    "categoria": "Pré-preparos",
    "insumos": [
      {
        "cod": "3223941",
        "nome": "BRÓCOLIS CRU",
        "qtd": 1.0,
        "un": "kg"
      },
      {
        "cod": "2065087",
        "nome": "SACO 10X15",
        "qtd": 18.0,
        "un": "un"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-16706",
    "codigoReceita": "16706",
    "produtoCod": "3265267",
    "produto": "MOLHO BRANCO PRONTO",
    "rendimento": 1.1,
    "un": "kg",
    "categoria": "Molhos",
    "insumos": [
      {
        "cod": "3261865",
        "nome": "MOLHO BRANCO",
        "qtd": 0.1,
        "un": "kg"
      },
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.0,
        "un": "kg"
      },
      {
        "cod": "2411164",
        "nome": "LEITE",
        "qtd": 1.0,
        "un": "l"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-16981",
    "codigoReceita": "16981",
    "produtoCod": "3303838",
    "produto": "MIX DE QUEIJOS",
    "rendimento": 1.0,
    "un": "un",
    "categoria": "Queijos",
    "insumos": [
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 40.0,
        "un": "g"
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 20.0,
        "un": "g"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-18881",
    "codigoReceita": "18881",
    "produtoCod": "2411202",
    "produto": "ARROZ PRONTO",
    "rendimento": 5.5,
    "un": "kg",
    "categoria": "Guarnições",
    "insumos": [
      {
        "cod": "2411113",
        "nome": "ARROZ",
        "qtd": 2.5,
        "un": "kg"
      },
      {
        "cod": "2411179",
        "nome": "ÓLEO",
        "qtd": 0.18,
        "un": "l"
      },
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.15,
        "un": "kg"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-19771",
    "codigoReceita": "19771",
    "produtoCod": "3688026",
    "produto": "PRÉ PREPARO ARROZ ARBÓREO",
    "rendimento": 11.0,
    "un": "un",
    "categoria": "Risotos",
    "insumos": [
      {
        "cod": "2411168",
        "nome": "MARGARINA",
        "qtd": 0.1,
        "un": "kg"
      },
      {
        "cod": "2411141",
        "nome": "CEBOLA ROXA",
        "qtd": 0.18,
        "un": "kg"
      },
      {
        "cod": "3688028",
        "nome": "ARROZ ARBÓREO",
        "qtd": 1.0,
        "un": "kg"
      },
      {
        "cod": "3688034",
        "nome": "VINHO BRANCO",
        "qtd": 375.0,
        "un": "ml"
      },
      {
        "cod": "2411217",
        "nome": "TEMPERO",
        "qtd": 0.45,
        "un": "kg"
      }
    ],
    "fonte": "receitas.pdf",
    "revisaoPendente": "Relatório imprime ARROZ ARBÓREO/11 KG; vinculado ao SKU de pré-preparo em 11 UN para uso nas fichas de risoto."
  },
  {
    "id": "REC-19772",
    "codigoReceita": "19772",
    "produtoCod": "3688049",
    "produto": "ALHO PORÓ CARAMELIZADO",
    "rendimento": 10.0,
    "un": "un",
    "categoria": "Risotos",
    "insumos": [
      {
        "cod": "3688048",
        "nome": "ALHO PORÓ",
        "qtd": 0.2,
        "un": "kg"
      },
      {
        "cod": "2065087",
        "nome": "SACO 10X15",
        "qtd": 10.0,
        "un": "un"
      }
    ],
    "fonte": "receitas.pdf"
  },
  {
    "id": "REC-19773",
    "codigoReceita": "19773",
    "produtoCod": "3688068",
    "produto": "CALDO DE LEGUMES PRONTO",
    "rendimento": 5.0,
    "un": "l",
    "categoria": "Risotos",
    "insumos": [
      {
        "cod": "3688065",
        "nome": "CALDO DE LEGUMES",
        "qtd": 40.0,
        "un": "g"
      }
    ],
    "fonte": "receitas.pdf"
  }
];

const fichasTecnicas = [
  {
    "id": "FT-1918798",
    "codigoSichef": "1918798",
    "prato": "PARMA ABOBRINHA (INDIVIDUAL)",
    "preco": 37.99,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2741496",
        "nome": "GORDURA VEGETAL",
        "qtd": 0.04,
        "un": "l",
        "custoFonte": 12.02
      },
      {
        "cod": "2411169",
        "nome": "MARMITEX D6",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.39
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.025,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "3303838",
        "nome": "MIX DE QUEIJOS",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.2
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.5,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "1918844",
        "nome": "BATATA CROCANTE (M)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.28
      },
      {
        "cod": "3061333",
        "nome": "ABOBRINHA EMPANADA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.87
      },
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.18,
        "un": "kg",
        "custoFonte": 2.27
      },
      {
        "cod": "2411128",
        "nome": "CAIXA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.51
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf",
    "observacao": "PDF informa gordura fora do padrão; operação confirmou o mesmo padrão das demais parmegianas."
  },
  {
    "id": "FT-1918825",
    "codigoSichef": "1918825",
    "prato": "PARMA ABOBRINHA (PARA 2)",
    "preco": 72.99,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "3061333",
        "nome": "ABOBRINHA EMPANADA",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 1.87
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.5,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411172",
        "nome": "MARMITEX D8",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.44
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.5,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411129",
        "nome": "CAIXA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.59
      },
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.36,
        "un": "kg",
        "custoFonte": 2.27
      },
      {
        "cod": "1918843",
        "nome": "BATATA CROCANTE (G)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.67
      },
      {
        "cod": "2741496",
        "nome": "GORDURA VEGETAL",
        "qtd": 0.07,
        "un": "l",
        "custoFonte": 12.02
      },
      {
        "cod": "3303838",
        "nome": "MIX DE QUEIJOS",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 2.2
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf",
    "observacao": "PDF informa gordura fora do padrão; operação confirmou o mesmo padrão das demais parmegianas."
  },
  {
    "id": "FT-1918802",
    "codigoSichef": "1918802",
    "prato": "STROGONOFF CARNE (PARA 1)",
    "preco": 41.99,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411142",
        "nome": "CHAMPIGNON",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 21.89
      },
      {
        "cod": "1918844",
        "nome": "BATATA CROCANTE (M)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.28
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      },
      {
        "cod": "2411197",
        "nome": "PRÉ PREPARO STROGO CARNE",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 6.29
      },
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.18,
        "un": "kg",
        "custoFonte": 2.27
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.5,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411169",
        "nome": "MARMITEX D6",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 0.39
      },
      {
        "cod": "2411203",
        "nome": "REQUEIJÃO",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 28.08
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.07,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411146",
        "nome": "CREME DE LEITE",
        "qtd": 0.06,
        "un": "kg",
        "custoFonte": 13.19
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-1918824",
    "codigoSichef": "1918824",
    "prato": "STROGONOFF CARNE (PARA 2)",
    "preco": 73.99,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411146",
        "nome": "CREME DE LEITE",
        "qtd": 0.11,
        "un": "kg",
        "custoFonte": 13.19
      },
      {
        "cod": "2411142",
        "nome": "CHAMPIGNON",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 21.89
      },
      {
        "cod": "1918843",
        "nome": "BATATA CROCANTE (G)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.67
      },
      {
        "cod": "2411197",
        "nome": "PRÉ PREPARO STROGO CARNE",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 6.29
      },
      {
        "cod": "2411169",
        "nome": "MARMITEX D6",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.39
      },
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.36,
        "un": "kg",
        "custoFonte": 2.27
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.6,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.15,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411203",
        "nome": "REQUEIJÃO",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 28.08
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-1918797",
    "codigoSichef": "1918797",
    "prato": "STROGONOFF FRANGO (PARA 1)",
    "preco": 29.99,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411169",
        "nome": "MARMITEX D6",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 0.39
      },
      {
        "cod": "2411142",
        "nome": "CHAMPIGNON",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 21.89
      },
      {
        "cod": "2411203",
        "nome": "REQUEIJÃO",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 28.08
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.5,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.18,
        "un": "kg",
        "custoFonte": 2.27
      },
      {
        "cod": "2411198",
        "nome": "PRÉ PREPARO STROGO FRANGO",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.25
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      },
      {
        "cod": "1918844",
        "nome": "BATATA CROCANTE (M)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.28
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.07,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411146",
        "nome": "CREME DE LEITE",
        "qtd": 0.06,
        "un": "kg",
        "custoFonte": 13.19
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-1918823",
    "codigoSichef": "1918823",
    "prato": "STROGONOFF FRANGO (PARA 2)",
    "preco": 58.99,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "1918843",
        "nome": "BATATA CROCANTE (G)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.67
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.6,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.15,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411142",
        "nome": "CHAMPIGNON",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 21.89
      },
      {
        "cod": "2411169",
        "nome": "MARMITEX D6",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.39
      },
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.36,
        "un": "kg",
        "custoFonte": 2.27
      },
      {
        "cod": "2411203",
        "nome": "REQUEIJÃO",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 28.08
      },
      {
        "cod": "2411198",
        "nome": "PRÉ PREPARO STROGO FRANGO",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 3.25
      },
      {
        "cod": "2411146",
        "nome": "CREME DE LEITE",
        "qtd": 0.11,
        "un": "kg",
        "custoFonte": 13.19
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-1918818",
    "codigoSichef": "1918818",
    "prato": "PARMA TILÁPIA (INDIVIDUAL)",
    "preco": 55.99,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.5,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411128",
        "nome": "CAIXA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.51
      },
      {
        "cod": "2411169",
        "nome": "MARMITEX D6",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.39
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.25,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2741496",
        "nome": "GORDURA VEGETAL",
        "qtd": 0.037,
        "un": "l",
        "custoFonte": 12.02
      },
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.18,
        "un": "kg",
        "custoFonte": 2.27
      },
      {
        "cod": "3062287",
        "nome": "TILÁPIA EMPANADA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 45.41
      },
      {
        "cod": "1918844",
        "nome": "BATATA CROCANTE (M)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.28
      },
      {
        "cod": "3303838",
        "nome": "MIX DE QUEIJOS",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.2
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-1918826",
    "codigoSichef": "1918826",
    "prato": "PARMA TILÁPIA (PARA 2)",
    "preco": 0,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411172",
        "nome": "MARMITEX D8",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.44
      },
      {
        "cod": "3303838",
        "nome": "MIX DE QUEIJOS",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 2.2
      },
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.36,
        "un": "kg",
        "custoFonte": 2.27
      },
      {
        "cod": "2741496",
        "nome": "GORDURA VEGETAL",
        "qtd": 0.074,
        "un": "l",
        "custoFonte": 12.02
      },
      {
        "cod": "3062287",
        "nome": "TILÁPIA EMPANADA",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 45.41
      },
      {
        "cod": "1918843",
        "nome": "BATATA CROCANTE (G)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.67
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.5,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411129",
        "nome": "CAIXA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.59
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.5,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-1918803",
    "codigoSichef": "1918803",
    "prato": "PARMA MIGNON (INDIVIDUAL)",
    "preco": 59.99,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "1918844",
        "nome": "BATATA CROCANTE (M)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.28
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.25,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2741496",
        "nome": "GORDURA VEGETAL",
        "qtd": 0.037,
        "un": "l",
        "custoFonte": 12.02
      },
      {
        "cod": "2411128",
        "nome": "CAIXA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.51
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411154",
        "nome": "FILÉ MIGNON",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 70.49
      },
      {
        "cod": "2411169",
        "nome": "MARMITEX D6",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.39
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.5,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.18,
        "un": "kg",
        "custoFonte": 2.27
      },
      {
        "cod": "3303838",
        "nome": "MIX DE QUEIJOS",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.2
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf",
    "observacao": "PDF informa 0,370 L; operação confirmou o padrão das parmegianas individuais (0,037 L)."
  },
  {
    "id": "FT-1918799",
    "codigoSichef": "1918799",
    "prato": "PARMA MIGNON (PARA 2)",
    "preco": 0,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411172",
        "nome": "MARMITEX D8",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.44
      },
      {
        "cod": "2411154",
        "nome": "FILÉ MIGNON",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 70.49
      },
      {
        "cod": "2741496",
        "nome": "GORDURA VEGETAL",
        "qtd": 0.074,
        "un": "l",
        "custoFonte": 12.02
      },
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.36,
        "un": "kg",
        "custoFonte": 2.27
      },
      {
        "cod": "1918843",
        "nome": "BATATA CROCANTE (G)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.67
      },
      {
        "cod": "3303838",
        "nome": "MIX DE QUEIJOS",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 2.2
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.5,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411129",
        "nome": "CAIXA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.59
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.6,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-1918805",
    "codigoSichef": "1918805",
    "prato": "PARMA FRANGO (PARA 1)",
    "preco": 44.99,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411128",
        "nome": "CAIXA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.51
      },
      {
        "cod": "2411169",
        "nome": "MARMITEX D6",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.39
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.25,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "1918844",
        "nome": "BATATA CROCANTE (M)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.28
      },
      {
        "cod": "2741496",
        "nome": "GORDURA VEGETAL",
        "qtd": 0.04,
        "un": "l",
        "custoFonte": 12.02
      },
      {
        "cod": "3303838",
        "nome": "MIX DE QUEIJOS",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 2.2
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.5,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411151",
        "nome": "FILÉ DE FRANGO",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.09
      },
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.18,
        "un": "kg",
        "custoFonte": 2.27
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-1918801",
    "codigoSichef": "1918801",
    "prato": "PARMA FRANGO (PARA 2)",
    "preco": 86.99,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.36,
        "un": "kg",
        "custoFonte": 2.27
      },
      {
        "cod": "2411129",
        "nome": "CAIXA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.59
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.6,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411172",
        "nome": "MARMITEX D8",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.44
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411151",
        "nome": "FILÉ DE FRANGO",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 3.09
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.5,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "1918843",
        "nome": "BATATA CROCANTE (G)",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.67
      },
      {
        "cod": "2741496",
        "nome": "GORDURA VEGETAL",
        "qtd": 0.07,
        "un": "l",
        "custoFonte": 12.02
      },
      {
        "cod": "3303838",
        "nome": "MIX DE QUEIJOS",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 2.2
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-2108328",
    "codigoSichef": "2108328",
    "prato": "SPAGHETTI A BOLONHESA",
    "preco": 24.9,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.4,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.25,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411243",
        "nome": "AZEITONA PRETA FATIADA",
        "qtd": 0.015,
        "un": "kg",
        "custoFonte": 27.14
      },
      {
        "cod": "2411166",
        "nome": "MACARRÃO SPAGHETTI",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.41
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 25.0,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "2411192",
        "nome": "PRÉ PREPARO CARNE SPAGHETTI",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 38.78
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-3265211",
    "codigoSichef": "3265211",
    "prato": "SPAGHETTI AOS QUEIJOS",
    "preco": 34.9,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 25.0,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "2411166",
        "nome": "MACARRÃO SPAGHETTI",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.41
      },
      {
        "cod": "2411159",
        "nome": "GORGONZOLA",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 51.39
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.4,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "3265267",
        "nome": "MOLHO BRANCO PRONTO",
        "qtd": 0.264,
        "un": "kg",
        "custoFonte": 6.54
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-2893049",
    "codigoSichef": "2893049",
    "prato": "SPAGHETTI AO SUGO",
    "preco": 24.9,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 25.0,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "2411166",
        "nome": "MACARRÃO SPAGHETTI",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.41
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.4,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.25,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411243",
        "nome": "AZEITONA PRETA FATIADA",
        "qtd": 0.015,
        "un": "kg",
        "custoFonte": 27.14
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-3265212",
    "codigoSichef": "3265212",
    "prato": "SPAGHETTI CREMOSO COM BRÓCOLIS E BACON",
    "preco": 38.9,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411126",
        "nome": "BRÓCOLIS",
        "qtd": 0.05,
        "un": "kg",
        "custoFonte": 8.69
      },
      {
        "cod": "3265267",
        "nome": "MOLHO BRANCO PRONTO",
        "qtd": 0.264,
        "un": "kg",
        "custoFonte": 6.54
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 25.0,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "2411124",
        "nome": "BACON",
        "qtd": 0.05,
        "un": "kg",
        "custoFonte": 37.4
      },
      {
        "cod": "2411166",
        "nome": "MACARRÃO SPAGHETTI",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.41
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.4,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-3265216",
    "codigoSichef": "3265216",
    "prato": "SPAGHETTI DO CHEF",
    "preco": 34.9,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411198",
        "nome": "PRÉ PREPARO STROGO FRANGO",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.25
      },
      {
        "cod": "2411166",
        "nome": "MACARRÃO SPAGHETTI",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.41
      },
      {
        "cod": "3265267",
        "nome": "MOLHO BRANCO PRONTO",
        "qtd": 0.264,
        "un": "kg",
        "custoFonte": 6.54
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.4,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 25.0,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf",
    "nomeSichef": "SPAGHETTI ROSÉ COM FRANGO",
    "observacao": "No SiChef aparece como Spaghetti Rosé com Frango."
  },
  {
    "id": "FT-2912541",
    "codigoSichef": "2912541",
    "prato": "SPAGUETTI AO MIGNON",
    "preco": 0.0,
    "categoria": "Pratos Imperial",
    "insumos": [
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.25,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411243",
        "nome": "AZEITONA PRETA FATIADA",
        "qtd": 0.015,
        "un": "kg",
        "custoFonte": 27.14
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 25.0,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "2411166",
        "nome": "MACARRÃO SPAGHETTI",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.41
      },
      {
        "cod": "2411197",
        "nome": "PRÉ PREPARO STROGO CARNE",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 6.29
      },
      {
        "cod": "2411191",
        "nome": "PLÁSTICO FILME",
        "qtd": 0.5,
        "un": "mt",
        "custoFonte": 0.12
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      }
    ],
    "fonte": "Listar_composicao_poduto_16-07-2026_11-48-51.pdf"
  },
  {
    "id": "FT-2630260",
    "codigoSichef": "2630260",
    "prato": "1/2 BRASILEIRA",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.0005,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411200",
        "nome": "PRESUNTO",
        "qtd": 0.1,
        "un": "kg",
        "custoFonte": 20.9
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.15,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.06,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2630250",
    "codigoSichef": "2630250",
    "prato": "1/2 BROCOLIS E BACON",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411126",
        "nome": "BRÓCOLIS",
        "qtd": 0.06,
        "un": "kg",
        "custoFonte": 8.69
      },
      {
        "cod": "2411124",
        "nome": "BACON",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 37.4
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.06,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.15,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.0005,
        "un": "kg",
        "custoFonte": 23.06
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2630249",
    "codigoSichef": "2630249",
    "prato": "1/2 CALABRESA COM MUÇAREÇA",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.06,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411133",
        "nome": "CALABRESA",
        "qtd": 0.08,
        "un": "kg",
        "custoFonte": 30.16
      },
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.0005,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411141",
        "nome": "CEBOLA ROXA",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 8.99
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.15,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 7.05
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2630255",
    "codigoSichef": "2630255",
    "prato": "1/2 FÍLE AOS QUEIJOS",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411159",
        "nome": "GORGONZOLA",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 51.39
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.06,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.15,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.0005,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411197",
        "nome": "PRÉ PREPARO STROGO CARNE",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 6.29
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2630252",
    "codigoSichef": "2630252",
    "prato": "1/2 FRANGO COM MUÇARELA",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411196",
        "nome": "PRÉ PREPARO FRANGO PIZZA",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 1.88
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.06,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.0005,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.15,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 38.55
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2630251",
    "codigoSichef": "2630251",
    "prato": "1/2 FRANGO E BACON",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.15,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411124",
        "nome": "BACON",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 37.4
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.0005,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.06,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411196",
        "nome": "PRÉ PREPARO FRANGO PIZZA",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 1.88
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2630253",
    "codigoSichef": "2630253",
    "prato": "1/2 PEPPERONI",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411183",
        "nome": "PEPPERONI",
        "qtd": 0.06,
        "un": "kg",
        "custoFonte": 66.99
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.15,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.0005,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.06,
        "un": "l",
        "custoFonte": 13.14
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2630254",
    "codigoSichef": "2630254",
    "prato": "1/2 TRÊS QUEIJOS",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.0005,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.06,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.15,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 0.03,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "2411159",
        "nome": "GORGONZOLA",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 51.39
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485964",
    "codigoSichef": "2485964",
    "prato": "BRASILEIRA GRANDE",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.12,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.3,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411200",
        "nome": "PRESUNTO",
        "qtd": 0.16,
        "un": "kg",
        "custoFonte": 20.9
      },
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.001,
        "un": "kg",
        "custoFonte": 23.06
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2178434",
    "codigoSichef": "2178434",
    "prato": "BRASILEIRA INDIVIDUAL",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.001,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411200",
        "nome": "PRESUNTO",
        "qtd": 0.05,
        "un": "kg",
        "custoFonte": 20.9
      },
      {
        "cod": "2411130",
        "nome": "CAIXA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.99
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411174",
        "nome": "MASSA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.8
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.03,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.09,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.01,
        "un": "kg",
        "custoFonte": 38.55
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485965",
    "codigoSichef": "2485965",
    "prato": "BROCOLIS E BACON GRANDE",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411124",
        "nome": "BACON",
        "qtd": 0.06,
        "un": "kg",
        "custoFonte": 37.4
      },
      {
        "cod": "2411126",
        "nome": "BRÓCOLIS",
        "qtd": 0.12,
        "un": "kg",
        "custoFonte": 8.69
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.12,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.001,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.3,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 38.55
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2178438",
    "codigoSichef": "2178438",
    "prato": "BROCOLIS E BACON IMPERIAL",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411203",
        "nome": "REQUEIJÃO",
        "qtd": 0.06,
        "un": "kg",
        "custoFonte": 28.08
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.03,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.09,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.01,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.001,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411130",
        "nome": "CAIXA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.99
      },
      {
        "cod": "2411174",
        "nome": "MASSA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.8
      },
      {
        "cod": "2411124",
        "nome": "BACON",
        "qtd": 0.03,
        "un": "kg",
        "custoFonte": 37.4
      },
      {
        "cod": "2411126",
        "nome": "BRÓCOLIS",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 8.69
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485966",
    "codigoSichef": "2485966",
    "prato": "BROCOLIS E BACON INDIVIDUAL",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.001,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.01,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411130",
        "nome": "CAIXA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.99
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.03,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411126",
        "nome": "BRÓCOLIS",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 8.69
      },
      {
        "cod": "2411124",
        "nome": "BACON",
        "qtd": 0.03,
        "un": "kg",
        "custoFonte": 37.4
      },
      {
        "cod": "2411174",
        "nome": "MASSA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.8
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.09,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485961",
    "codigoSichef": "2485961",
    "prato": "CALABRESA COM MUÇARELA GRANDE",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.3,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411141",
        "nome": "CEBOLA ROXA",
        "qtd": 0.05,
        "un": "kg",
        "custoFonte": 8.99
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.12,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411133",
        "nome": "CALABRESA",
        "qtd": 0.16,
        "un": "kg",
        "custoFonte": 30.16
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.001,
        "un": "kg",
        "custoFonte": 23.06
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485962",
    "codigoSichef": "2485962",
    "prato": "CALABRESA COM MUÇARELA INDIVIDUAL",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.001,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411133",
        "nome": "CALABRESA",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 30.16
      },
      {
        "cod": "2411141",
        "nome": "CEBOLA ROXA",
        "qtd": 0.01,
        "un": "kg",
        "custoFonte": 8.99
  …77490 tokens truncated…assName={cx("rounded-xl border px-3 py-2 text-xs",feedback.tone==="green"?"border-emerald-200 bg-emerald-50 text-emerald-700":feedback.tone==="red"?"border-rose-200 bg-rose-50 text-rose-700":"border-amber-200 bg-amber-50 text-amber-700")}>{feedback.text}</div>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5"><label className="text-xs text-slate-500">Phone Number ID<input value={formulario.phoneNumberId} onChange={e=>alterar("phoneNumberId",e.target.value)} placeholder="Ex.: 123456789012345" className={campo}/></label><label className="text-xs text-slate-500">Vers&atilde;o da Graph API<input value={formulario.graphVersion} onChange={e=>alterar("graphVersion",e.target.value)} placeholder="v24.0" className={campo}/></label><label className="text-xs text-slate-500">Template aprovado<input value={formulario.templateName} onChange={e=>alterar("templateName",e.target.value)} className={campo}/></label><label className="text-xs text-slate-500">Template do pedido PDF<input value={formulario.pedidoTemplateName} onChange={e=>alterar("pedidoTemplateName",e.target.value)} className={campo}/></label><label className="text-xs text-slate-500">Idioma do template<input value={formulario.templateLanguage} onChange={e=>alterar("templateLanguage",e.target.value)} className={campo}/></label></div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3"><label className="text-xs text-slate-500">Token permanente da Meta<input type="password" value={formulario.accessToken} onChange={e=>alterar("accessToken",e.target.value)} placeholder={status?.possuiAccessToken?"Salvo - deixe vazio para manter":"Cole o token permanente"} autoComplete="new-password" className={campo}/></label><label className="text-xs text-slate-500">Verify Token do webhook<input type="password" value={formulario.verifyToken} onChange={e=>alterar("verifyToken",e.target.value)} placeholder={status?.possuiVerifyToken?"Salvo - deixe vazio para manter":"Crie um token seguro"} autoComplete="new-password" className={campo}/></label><label className="text-xs text-slate-500">App Secret<input type="password" value={formulario.appSecret} onChange={e=>alterar("appSecret",e.target.value)} placeholder={status?.possuiAppSecret?"Salvo - deixe vazio para manter":"App Secret da Meta"} autoComplete="new-password" className={campo}/></label></div>
      <label className="block text-xs text-slate-500">URL de callback do webhook<div className="mt-1.5 flex gap-2"><input readOnly value={status?.webhookUrl||"Dispon\u00edvel ap\u00f3s conectar a API"} className={campo.replace("mt-1.5 ","")+" font-mono text-xs"}/><button onClick={()=>navigator.clipboard?.writeText(status?.webhookUrl||"")} disabled={!status?.webhookUrl} className="rounded-xl border border-slate-300 px-3 text-xs font-semibold disabled:opacity-40">Copiar</button></div></label>
      <div className="flex flex-wrap items-center gap-2"><button onClick={salvar} disabled={carregando||apiStatus!=="online"} className="rounded-xl bg-[#7A1420] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40">{carregando?"Processando...":salvo?"Atualizar configura\u00e7\u00e3o":"Salvar configura\u00e7\u00e3o"}</button><button onClick={verificar} disabled={carregando||!salvo} className="rounded-xl border border-emerald-400 px-4 py-2.5 text-sm font-medium text-emerald-700 disabled:opacity-40">Testar na Meta</button>{salvo&&<button onClick={remover} disabled={carregando} className="px-2 py-2.5 text-xs text-rose-600 hover:underline">Remover</button>}<span className="text-[11px] text-slate-400">{status?.fonte==="render"?"Credencial carregada do Render":status?.atualizadoEm?"Atualizada em "+new Date(status.atualizadoEm).toLocaleString("pt-BR"):""}</span></div>
    </div>
  </Card>;
}

function ConfiguracoesIntegracoes({ apiStatus }) {
  const [credenciais, setCredenciais] = useState({});
  const [formularios, setFormularios] = useState(() => Object.fromEntries(
    PLATAFORMAS_INTEGRACAO.map(plataforma => [plataforma.key, { identificador: "", token: "" }])
  ));
  const [feedbacks, setFeedbacks] = useState({});
  const [guiasAbertos, setGuiasAbertos] = useState({});
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      try {
        if (apiStatus === "online") {
          const resposta = await api.getCredenciaisIntegracao();
          if (ativo) setCredenciais(Object.fromEntries(resposta.data.map(item => [item.plataforma, item])));
        } else if (ativo) {
          setCredenciais(lerCredenciaisLocais());
        }
      } catch (error) {
        if (ativo) setFeedbacks(prev => ({ ...prev, geral: { tone: "red", text: error?.message || "Não foi possível carregar as credenciais." } }));
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, [apiStatus]);

  function alterarFormulario(plataforma, campo, valor) {
    setFormularios(prev => ({ ...prev, [plataforma]: { ...prev[plataforma], [campo]: valor } }));
  }

  async function salvar(plataforma) {
    const formulario = formularios[plataforma];
    if (!formulario.token || formulario.token.trim().length < 8) {
      setFeedbacks(prev => ({ ...prev, [plataforma]: { tone: "red", text: "Cole um token ou chave com pelo menos 8 caracteres." } }));
      return;
    }
    setFeedbacks(prev => ({ ...prev, [plataforma]: { tone: "amber", text: "Protegendo credencial…" } }));
    try {
      let item;
      if (apiStatus === "online") {
        item = await api.salvarCredencialIntegracao(plataforma, { identificador: formulario.identificador || undefined, token: formulario.token });
      } else {
        const segredo = await cifrarCredencialLocal(formulario.token.trim());
        item = {
          plataforma,
          identificador: formulario.identificador || null,
          possuiCredencial: true,
          atualizadoEm: new Date().toISOString(),
          verificadoEm: null,
          protecaoLocal: true,
          ...segredo,
        };
        const novas = { ...credenciais, [plataforma]: item };
        salvarCredenciaisLocais(novas);
      }
      setCredenciais(prev => ({ ...prev, [plataforma]: item }));
      setFormularios(prev => ({ ...prev, [plataforma]: { identificador: item.identificador || "", token: "" } }));
      setFeedbacks(prev => ({ ...prev, [plataforma]: { tone: "green", text: apiStatus === "online" ? "Credencial criptografada e salva na API." : "Credencial criptografada para esta sessão do navegador." } }));
    } catch (error) {
      setFeedbacks(prev => ({ ...prev, [plataforma]: { tone: "red", text: error?.message || "Não foi possível salvar a credencial." } }));
    }
  }

  async function verificar(plataforma) {
    const itemAtual = credenciais[plataforma];
    if (!itemAtual?.possuiCredencial) return;
    setFeedbacks(prev => ({ ...prev, [plataforma]: { tone: "amber", text: "Verificando proteção…" } }));
    try {
      let verificadoEm;
      if (apiStatus === "online") {
        const resposta = await api.verificarCredencialIntegracao(plataforma);
        verificadoEm = resposta.verificadoEm;
      } else {
        const disponivel = await verificarCredencialLocal(itemAtual);
        if (!disponivel) throw new Error("A credencial local não está disponível.");
        verificadoEm = new Date().toISOString();
        const novas = { ...credenciais, [plataforma]: { ...itemAtual, verificadoEm } };
        salvarCredenciaisLocais(novas);
      }
      setCredenciais(prev => ({ ...prev, [plataforma]: { ...prev[plataforma], verificadoEm } }));
      const mensagem = plataforma === "google-maps"
        ? "Google Maps Routes API conectada e testada com sucesso."
        : "Credencial protegida e disponível. A API externa ainda não foi acionada.";
      setFeedbacks(prev => ({ ...prev, [plataforma]: { tone: "green", text: mensagem } }));
    } catch (error) {
      setFeedbacks(prev => ({ ...prev, [plataforma]: { tone: "red", text: error?.message || "A credencial não pôde ser verificada." } }));
    }
  }

  async function remover(plataforma) {
    try {
      if (apiStatus === "online") await api.removerCredencialIntegracao(plataforma);
      const novas = { ...credenciais };
      delete novas[plataforma];
      if (apiStatus !== "online") salvarCredenciaisLocais(novas);
      setCredenciais(novas);
      setFormularios(prev => ({ ...prev, [plataforma]: { identificador: "", token: "" } }));
      setFeedbacks(prev => ({ ...prev, [plataforma]: { tone: "green", text: "Credencial removida." } }));
    } catch (error) {
      setFeedbacks(prev => ({ ...prev, [plataforma]: { tone: "red", text: error?.message || "Não foi possível remover a credencial." } }));
    }
  }

  const cadastradas = Object.values(credenciais).filter(item => item?.possuiCredencial).length;
  const formatarData = valor => valor ? new Date(valor).toLocaleString("pt-BR") : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Configurações</h2><p className="text-sm text-slate-500 dark:text-slate-400">Integrações de vendas, mapas e credenciais das plataformas</p></div>
        <Badge tone={cadastradas ? "green" : "slate"}>{carregando ? "Carregando…" : `${cadastradas} de ${PLATAFORMAS_INTEGRACAO.length} credenciais cadastradas`}</Badge>
      </div>

      <Card className="p-4 sm:p-5 border-emerald-200 dark:border-emerald-500/20">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0"><CheckCircle2 size={18} /></div>
          <div><div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Cadastro protegido</div><p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">O token é criptografado antes de ser salvo e nunca volta a aparecer na tela. A verificação confirma que a credencial está protegida e disponível; a importação automática só será ativada depois da validação da API e dos webhooks de cada plataforma.</p>{apiStatus !== "online" && <p className="text-[11px] text-amber-600 dark:text-amber-300 mt-2">API do ERP indisponível: a proteção atual vale apenas para esta sessão do navegador.</p>}</div>
        </div>
      </Card>

      <WhatsappMetaConfiguracao apiStatus={apiStatus} />

      {feedbacks.geral && <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300 px-4 py-3 text-sm">{feedbacks.geral.text}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {PLATAFORMAS_INTEGRACAO.map(plataforma => {
          const Icon = plataforma.icon;
          const item = credenciais[plataforma.key];
          const salvo = Boolean(item?.possuiCredencial);
          const feedback = feedbacks[plataforma.key];
          const formulario = formularios[plataforma.key];
          const ehGoogleMaps = plataforma.key === "google-maps";
          return (
            <Card key={plataforma.key} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0"><div className="w-10 h-10 rounded-xl bg-[#7A1420] text-white flex items-center justify-center shrink-0"><Icon size={18} /></div><div><div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold text-slate-900 dark:text-white">{plataforma.nome}</h3><Badge tone="brand">{plataforma.selo}</Badge></div><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plataforma.descricao}</p></div></div>
                <Badge tone={salvo ? "green" : "slate"}>{salvo ? "Credencial salva" : "Não configurada"}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                <label className="text-xs text-slate-500 dark:text-slate-400">{ehGoogleMaps ? "Nome do projeto Google Cloud (opcional)" : "Código da empresa / loja (opcional)"}<input value={formulario.identificador} onChange={e => alterarFormulario(plataforma.key, "identificador", e.target.value)} placeholder="Opcional" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
                <label className="text-xs text-slate-500 dark:text-slate-400">{ehGoogleMaps ? "Chave da Routes API" : "Token / chave de API"}<input type="password" value={formulario.token} onChange={e => alterarFormulario(plataforma.key, "token", e.target.value)} placeholder={salvo ? "Cole uma nova chave para substituir" : ehGoogleMaps ? "Cole a chave do Google Maps" : "Cole o token aqui"} autoComplete="new-password" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
              </div>

              {salvo && <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-3"><CheckCircle2 size={11} className="inline mr-1" />Protegida · atualizada em {formatarData(item.atualizadoEm)}{item.verificadoEm ? ` · verificada em ${formatarData(item.verificadoEm)}` : ""}</div>}
              {feedback && <div className={cx("mt-3 rounded-xl border px-3 py-2 text-xs", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300")}>{feedback.text}</div>}

              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => salvar(plataforma.key)} className="rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2.5">{salvo ? "Atualizar credencial" : "Salvar credencial"}</button>
                <button onClick={() => verificar(plataforma.key)} disabled={!salvo} className="rounded-xl border border-slate-300 dark:border-slate-600 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-sm font-medium px-4 py-2.5">Verificar</button>
                <button onClick={() => setGuiasAbertos(prev => ({ ...prev, [plataforma.key]: !prev[plataforma.key] }))} className="rounded-xl border border-amber-400/60 text-amber-700 dark:text-amber-300 text-sm font-medium px-4 py-2.5">Como ativar a API</button>
              </div>
              {guiasAbertos[plataforma.key] && <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3 text-xs text-slate-500 dark:text-slate-300">{ehGoogleMaps ? "No Google Cloud, ative a Routes API, crie uma chave restrita somente a essa API, cole a chave acima e clique em Verificar. A chave ficará criptografada no ERP." : <>Solicite a chave no painel administrativo da {plataforma.nome}, cadastre a URL de webhook fornecida pelo ERP e valide primeiro em ambiente de homologação. O recebimento automático permanece desligado até essa etapa.</>}</div>}
              {salvo && <button onClick={() => remover(plataforma.key)} className="mt-4 text-xs text-rose-600 dark:text-rose-400 hover:underline"><XCircle size={12} className="inline mr-1" />Remover</button>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
function EmBreve({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
        <Loader2 size={22} className="text-[#7A1420] dark:text-red-400" />
      </div>
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">{label}</h3>
      <p className="text-sm text-slate-400 max-w-xs">Este módulo entra no próximo pacote do protótipo — dá pra priorizar quando quiser.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fornecedores
// ---------------------------------------------------------------------------

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [fornecedorEdit, setFornecedorEdit] = useState(null);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);

  const carregarFornecedores = async () => {
    setLoading(true);
    try {
      const data = await api.getFornecedores({ busca });
      setFornecedores(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarFornecedores(); }, [busca]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dados = Object.fromEntries(formData);

    try {
      if (fornecedorEdit?.id) {
        await api.atualizarFornecedor(fornecedorEdit.id, dados);
      } else {
        await api.cadastrarFornecedor(dados);
      }
      setModalAberto(false);
      carregarFornecedores();
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    }
  };

  const handleDesativar = async (id) => {
    if (!confirm("Tem certeza que deseja desativar este fornecedor?")) return;
    try {
      await api.desativarFornecedor(id);
      carregarFornecedores();
      setFornecedorSelecionado(null);
    } catch (e) {
      alert("Erro: " + e.message);
    }
  };

  const verDetalhes = async (id) => {
    setLoading(true);
    try {
      const data = await api.getFornecedor(id);
      setFornecedorSelecionado(data);
    } catch (e) {
      alert("Erro ao carregar detalhes");
    } finally {
      setLoading(false);
    }
  };

  if (fornecedorSelecionado) {
    const f = fornecedorSelecionado;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setFornecedorSelecionado(null)} className="p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800 text-slate-500">
              <ChevronDown className="rotate-90" size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {f.nome} {!f.ativo && <Badge tone="red">Inativo</Badge>}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {f.cnpj ? `CNPJ: ${f.cnpj}` : 'Sem CNPJ'} • {f.email || 'Sem e-mail'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setFornecedorEdit(f); setModalAberto(true); }} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Editar</button>
            {f.ativo && <button onClick={() => handleDesativar(f.id)} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20">Desativar</button>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPI label="Total em Compras (NFe)" value={f.notasFiscais?.length || 0} icon={FileText} />
          <KPI label="Compras Manuais" value={f.comprasManuais?.length || 0} icon={ShoppingCart} />
          <KPI label="Pedidos de Compra" value={f.pedidos?.length || 0} icon={Truck} />
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Histórico Recente</h3>
          <div className="space-y-4">
            {f.notasFiscais?.map(nf => (
              <div key={nf.id} className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Nota Fiscal (XML)</div>
                  <div className="text-xs text-slate-500">Chave: {nf.chave}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">R$ {Number(nf.valorTotal).toFixed(2)}</div>
                  <div className="text-xs text-slate-500">{new Date(nf.criadoEm).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {f.comprasManuais?.map(c => (
              <div key={c.id} className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Compra Manual</div>
                  <div className="text-xs text-slate-500">{c.insumo?.nome} ({c.quantidade} {c.insumo?.unidadeMedida})</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">R$ {(Number(c.custoUnitario) * Number(c.quantidade)).toFixed(2)}</div>
                  <div className="text-xs text-slate-500">{new Date(c.criadoEm).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
            {(!f.notasFiscais?.length && !f.comprasManuais?.length) && (
              <div className="text-center py-8 text-slate-500 text-sm">Nenhum histórico encontrado para este fornecedor.</div>
            )}
          </div>
        </Card>

        {modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Editar Fornecedor</h3>
                <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
              </div>
              <form onSubmit={handleSalvar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                  <input name="nome" required defaultValue={f.nome} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#7A1420] focus:ring-1 focus:ring-[#7A1420] outline-none transition-all dark:text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ</label>
                    <input name="cnpj" defaultValue={f.cnpj || ""} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#7A1420] focus:ring-1 focus:ring-[#7A1420] outline-none transition-all dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                    <input name="telefone" defaultValue={f.telefone || ""} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#7A1420] focus:ring-1 focus:ring-[#7A1420] outline-none transition-all dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                  <input type="email" name="email" defaultValue={f.email || ""} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#7A1420] focus:ring-1 focus:ring-[#7A1420] outline-none transition-all dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço</label>
                  <input name="endereco" defaultValue={f.endereco || ""} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#7A1420] focus:ring-1 focus:ring-[#7A1420] outline-none transition-all dark:text-white" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setModalAberto(false)} className="flex-1 h-10 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancelar</button>
                  <button type="submit" className="flex-1 h-10 rounded-lg bg-[#7A1420] text-white font-medium hover:bg-[#630f18]">Salvar</button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Fornecedores</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gestão de parceiros e histórico de compras</p>
        </div>
        <button onClick={() => { setFornecedorEdit(null); setModalAberto(true); }} className="h-10 px-4 bg-[#7A1420] text-white rounded-xl text-sm font-medium hover:bg-[#630f18] flex items-center justify-center gap-2 shadow-sm shadow-red-900/20 transition-colors">
          <Plus size={18} /> Novo Fornecedor
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
             type="text"
             placeholder="Buscar por nome ou CNPJ..."
             value={busca}
             onChange={e => setBusca(e.target.value)}
             className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 focus:border-[#7A1420] focus:ring-1 focus:ring-[#7A1420] outline-none transition-all text-sm dark:text-white shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fornecedores.map(f => (
          <Card key={f.id} className="p-5 flex flex-col gap-4 cursor-pointer hover:border-[#7A1420]/30 transition-colors group" onClick={() => verDetalhes(f.id)}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-[#7A1420] dark:group-hover:text-red-400 transition-colors">{f.nome}</h3>
                <p className="text-xs text-slate-500 mt-1">{f.cnpj ? `CNPJ: ${f.cnpj}` : 'Sem CNPJ'}</p>
              </div>
              {!f.ativo && <Badge tone="red">Inativo</Badge>}
              {f.ativo && <Badge tone="green">Ativo</Badge>}
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500">{f.telefone || f.email || 'Sem contato salvo'}</span>
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-red-50 dark:group-hover:bg-red-500/10 group-hover:text-[#7A1420] dark:group-hover:text-red-400 transition-colors">
                <ArrowUpRight size={16} />
              </div>
            </div>
          </Card>
        ))}
        {fornecedores.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
            Nenhum fornecedor encontrado.
          </div>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Novo Fornecedor</h3>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                <input name="nome" required className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#7A1420] focus:ring-1 focus:ring-[#7A1420] outline-none transition-all dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ</label>
                  <input name="cnpj" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#7A1420] focus:ring-1 focus:ring-[#7A1420] outline-none transition-all dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                  <input name="telefone" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#7A1420] focus:ring-1 focus:ring-[#7A1420] outline-none transition-all dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                <input type="email" name="email" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#7A1420] focus:ring-1 focus:ring-[#7A1420] outline-none transition-all dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço</label>
                <input name="endereco" className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#7A1420] focus:ring-1 focus:ring-[#7A1420] outline-none transition-all dark:text-white" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 h-10 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancelar</button>
                <button type="submit" className="flex-1 h-10 rounded-lg bg-[#7A1420] text-white font-medium hover:bg-[#630f18]">Salvar</button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function ImperialERP() {
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState("dashboard");
  const [abaReceitas, setAbaReceitas] = useState("producao");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [estoqueItens, setEstoqueItens] = useState(() => {
    try {
      const salvos = JSON.parse(localStorage.getItem("imperial.stockItems.v2") || "null");
      if (Array.isArray(salvos) && salvos.length) return salvos.map(item => ({ ...item, status: statusFor(item.qtd, item.min) }));
    } catch {
      // Tenta o formato anterior abaixo.
    }
    let personalizados = [];
    try { personalizados = JSON.parse(localStorage.getItem("imperial.customStockItems.v1") || "[]"); }
    catch { personalizados = []; }
    const codigos = new Set(initialEstoque.map(item => item.cod));
    return [...initialEstoque, ...personalizados.filter(item => !codigos.has(item.cod))].map(item => ({ ...item, status: statusFor(item.qtd, item.min) }));
  });
  const [fichas, setFichas] = useState(() => {
    try {
      const salvas = JSON.parse(localStorage.getItem("imperial.technicalSheets.v1") || "null");
      return Array.isArray(salvas) && salvas.length ? salvas : fichasTecnicas;
    } catch {
      return fichasTecnicas;
    }
  });
  const [produtos, setProdutos] = useState(() => {
    const mapa = new Map();
    fichasTecnicas.forEach(ficha => {
      mapa.set(normalizeTxt(ficha.prato), {
        id: ficha.produtoId || ("PROD-" + ficha.id),
        nome: ficha.prato,
        categoria: ficha.categoria || "Imperial",
        preco: Number(ficha.preco || 0),
        estoqueCod: "",
        ativo: true,
      });
    });
    initialEstoque.filter(item => normalizeTxt(item.cat) === "bebidas").forEach(item => {
      const chave = normalizeTxt(item.nome);
      if (!mapa.has(chave)) mapa.set(chave, {
        id: "PROD-" + item.cod,
        nome: item.nome,
        categoria: item.cat,
        preco: 0,
        estoqueCod: item.cod,
        ativo: true,
      });
    });
    const base = Array.from(mapa.values());
    try {
      const salvos = JSON.parse(localStorage.getItem("imperial.products.v1") || "null");
      if (!Array.isArray(salvos) || !salvos.length) return base;
      const porId = new Map(base.map(item => [item.id, item]));
      salvos.forEach(item => porId.set(item.id, item));
      return Array.from(porId.values());
    } catch {
      return base;
    }
  });
  const [categoriasProduto, setCategoriasProduto] = useState(() => {
    const nomesBase = [...fichasTecnicas.map(ficha => ficha.categoria), ...initialEstoque.map(item => item.cat), "Bebidas", "Imperial"]
      .filter(Boolean)
      .filter((nome, indice, lista) => lista.findIndex(item => normalizeTxt(item) === normalizeTxt(nome)) === indice)
      .map((nome, indice) => ({ id: "CAT-" + String(indice + 1).padStart(3, "0"), nome, ativo: true }));
    try {
      const salvas = JSON.parse(localStorage.getItem("imperial.productCategories.v1") || "null");
      return Array.isArray(salvas) && salvas.length ? salvas : nomesBase;
    } catch {
      return nomesBase;
    }
  });
  const [movs, setMovs] = useState(initialMovs);
  const [historicoMovimentosEstoque, setHistoricoMovimentosEstoque] = useState([]);
  const [historicoManual, setHistoricoManual] = useState([]);
  const [contasPagar, setContasPagar] = useState(initialContasPagar);
  const [historicoBoleto, setHistoricoBoleto] = useState([]);
  const [historicoXml, setHistoricoXml] = useState([]);
  const [ordens, setOrdens] = useState(initialOrdensPreparo);
  const [pedidosVenda, setPedidosVenda] = useState([]);
  const [pedidosVendaCarregando, setPedidosVendaCarregando] = useState(false);
  const [pedidosVendaErro, setPedidosVendaErro] = useState("");
  const [caixas, setCaixas] = useState(initialCaixas);
  const [movimentosCaixa, setMovimentosCaixa] = useState(initialMovimentosCaixa);
  const [entregadores, setEntregadores] = useState(() => {
    try {
      const salvos = JSON.parse(localStorage.getItem("imperial.deliveryPeople.v1") || "null");
      return Array.isArray(salvos) ? salvos : initialEntregadores;
    } catch {
      return initialEntregadores;
    }
  });
  const [empresasEntrega, setEmpresasEntrega] = useState(() => {
    const padrao = [...new Set([
      ...initialEntregadores.map(item => item.tipo),
      ...initialTarifasMoto.flatMap(item => Object.keys(item.valores || {})),
      "Particular",
      "Frota Imperial",
    ])];
    try {
      const salvas = JSON.parse(localStorage.getItem("imperial.deliveryCompanies.v1") || "null");
      return Array.isArray(salvas) && salvas.length ? [...new Set([...padrao, ...salvas])] : padrao;
    } catch {
      return padrao;
    }
  });
  const [tarifasMoto, setTarifasMoto] = useState(() => {
    try {
      const salvas = JSON.parse(localStorage.getItem("imperial.deliveryRates.v1") || "null");
      return Array.isArray(salvas) && salvas.length ? salvas : initialTarifasMoto;
    } catch {
      return initialTarifasMoto;
    }
  });
  const [corridas, setCorridas] = useState(() => {
    try {
      const salvas = JSON.parse(localStorage.getItem("imperial.deliveryRuns.v1") || "null");
      return Array.isArray(salvas) ? salvas : initialCorridas;
    } catch {
      return initialCorridas;
    }
  });
  const [errosOperacionais, setErrosOperacionais] = useState(initialErrosOperacionais);
  const [cancelamentos, setCancelamentos] = useState(initialCancelamentos);
  const [fechamentosDiarios, setFechamentosDiarios] = useState(initialFechamentosDiarios);
  const [dadosPlataformas, setDadosPlataformas] = useState(resumoPlataformasDiario);
  const [mapeamentosSichef, setMapeamentosSichef] = useState(initialMapeamentosSichef);
  const [importacoesSichef, setImportacoesSichef] = useState([]);
  const [apiStatus, setApiStatus] = useState(api.enabled ? "connecting" : "demo");

  async function syncFromApi() {
    if (!api.enabled) return;
    try {
      await api.ensureSession();
      const [insumos, movimentacoes, pagar] = await Promise.all([
        api.getInsumos(), api.getMovimentacoes(), api.getContasPagar(),
      ]);
      setEstoqueItens(insumos.data);
      setMovs(movimentacoes.data.map(m => ({ ...m, hora: "sincronizado" })));
      setContasPagar(pagar.data.map(c => ({
        ...c,
        valor: Number(c.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      })));
      setApiStatus("online");
    } catch (error) {
      console.warn("API indisponível; mantendo dados locais de demonstração.", error);
      setApiStatus("error");
    }
  }

  useEffect(() => { syncFromApi(); }, []);
  useEffect(() => { if (active === "estoque") syncFromApi(); }, [active]);
  useEffect(() => { if (active === "vendas") syncPedidosVenda(); }, [active]);
  useEffect(() => {
    if (apiStatus !== "online") return;
    const pendentes = fichas.filter(ficha => String(ficha.id).startsWith("FT-MAN-") && !ficha.backendId);
    if (!pendentes.length) return;
    let cancelado = false;
    (async () => {
      for (const ficha of pendentes) {
        try {
          const salva = await salvarFichaNoServidor(ficha);
          if (!cancelado) {
            setFichas(prev => salvarCadastroLocal(
              "imperial.technicalSheets.v1",
              prev.map(item => item.id === ficha.id ? { ...item, id: salva.id, backendId: salva.id } : item),
            ));
          }
        } catch (error) {
          console.warn("Não foi possível sincronizar a ficha técnica manual.", error);
        }
      }
    })();
    return () => { cancelado = true; };
  }, [apiStatus, fichas, estoqueItens, produtos]);

  async function syncPedidosVenda() {
    if (!api.enabled) return;
    setPedidosVendaCarregando(true);
    setPedidosVendaErro("");
    try {
      await api.ensureSession();
      const resposta = await api.getPedidosVenda();
      setPedidosVenda(Array.isArray(resposta?.data) ? resposta.data : []);
    } catch (error) {
      setPedidosVendaErro(error?.message || "Não foi possível carregar os pedidos reais.");
    } finally {
      setPedidosVendaCarregando(false);
    }
  }

  function persistirItensEstoquePersonalizados(itens) {
    try {
      localStorage.setItem("imperial.stockItems.v2", JSON.stringify(itens));
      localStorage.setItem("imperial.customStockItems.v1", JSON.stringify(itens.filter(item => item.cadastroManual)));
    } catch {
      // O cadastro continua disponível durante a sessão mesmo sem armazenamento local.
    }
    return itens;
  }

  async function handleCadastrarInsumo(dados) {
    const codigo = (dados.codigo || ("INS-" + Date.now().toString(36))).trim().toUpperCase();
    if (estoqueItens.some(item => item.cod.toUpperCase() === codigo)) return { tone: "red", text: "Já existe um item com este código." };
    if (estoqueItens.some(item => normalizeTxt(item.nome) === normalizeTxt(dados.nome))) return { tone: "red", text: "Já existe um item com este nome no estoque." };

    let novoItem;
    if (apiStatus === "online") {
      try {
        novoItem = await api.cadastrarInsumo({ ...dados, codigo });
      } catch (error) {
        return { tone: "red", text: error?.message || "Não foi possível cadastrar o item no servidor." };
      }
    } else {
      novoItem = {
        cod: codigo,
        nome: dados.nome.trim().toUpperCase(),
        cat: dados.categoria.trim(),
        un: dados.unidade,
        qtd: dados.quantidade,
        min: dados.estoqueMinimo,
        custo: dados.custoUnitario,
        cadastroManual: true,
      };
    }
    novoItem = { ...novoItem, status: statusFor(novoItem.qtd, novoItem.min) };
    setEstoqueItens(prev => persistirItensEstoquePersonalizados([...prev, novoItem].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))));
    return { tone: "green", text: novoItem.nome + " cadastrado no estoque com o código " + novoItem.cod + ".", item: novoItem };
  }
  async function handleAtualizarInsumo(codigo, dados) {
    const atual = estoqueItens.find(item => item.cod === codigo);
    if (!atual) return { tone: "red", text: "Item de estoque não encontrado." };
    if (estoqueItens.some(item => item.cod !== codigo && normalizeTxt(item.nome) === normalizeTxt(dados.nome))) {
      return { tone: "red", text: "Já existe outro item com este nome no estoque." };
    }
    let itemAtualizado;
    if (apiStatus === "online") {
      try {
        itemAtualizado = await api.atualizarInsumo(codigo, dados);
      } catch (error) {
        return { tone: "red", text: error?.message || "Não foi possível atualizar o item no servidor." };
      }
    } else {
      itemAtualizado = {
        ...atual,
        nome: dados.nome.trim().toUpperCase(),
        cat: dados.categoria.trim(),
        un: dados.unidade,
        qtd: dados.quantidade,
        min: dados.estoqueMinimo,
        custo: dados.custoUnitario,
      };
    }
    itemAtualizado = { ...itemAtualizado, cadastroManual: atual.cadastroManual, status: statusFor(itemAtualizado.qtd, itemAtualizado.min) };
    setEstoqueItens(prev => persistirItensEstoquePersonalizados(
      prev.map(item => item.cod === codigo ? itemAtualizado : item).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    ));

    const produtosLigados = produtos.filter(produto => produto.estoqueCod === codigo);
    if (produtosLigados.length) {
      const idsLigados = new Set(produtosLigados.map(produto => produto.id));
      setProdutos(prev => salvarCadastroLocal(
        "imperial.products.v1",
        prev.map(produto => produto.estoqueCod === codigo
          ? { ...produto, nome: itemAtualizado.nome, categoria: itemAtualizado.cat }
          : produto),
      ));
      setFichas(prev => salvarCadastroLocal(
        "imperial.technicalSheets.v1",
        prev.map(ficha => idsLigados.has(ficha.produtoId)
          ? { ...ficha, prato: itemAtualizado.nome, categoria: itemAtualizado.cat }
          : ficha),
      ));
    }
    return { tone: "green", text: itemAtualizado.nome + " atualizado no estoque e no catálogo.", item: itemAtualizado };
  }
  async function handleExcluirInsumo(codigo) {
    const item = estoqueItens.find(estoque => estoque.cod === codigo);
    if (!item) return { tone: "red", text: "Item de estoque não encontrado." };
    const fichasQueUsam = fichas.filter(ficha => ficha.insumos.some(insumo => insumo.cod === codigo));
    const receitasQueUsam = initialReceitas.filter(receita => receita.insumos.some(insumo => insumo.cod === codigo));
    const produtosLigados = produtos.filter(produto => produto.estoqueCod === codigo);
    const produtoComFicha = produtosLigados.find(produto => fichas.some(ficha => ficha.produtoId === produto.id || normalizeTxt(ficha.prato) === normalizeTxt(produto.nome)));
    if (fichasQueUsam.length || receitasQueUsam.length || produtoComFicha) {
      const exemplos = [...new Set([...fichasQueUsam.map(ficha => ficha.prato), ...receitasQueUsam.map(receita => receita.produto), ...(produtoComFicha ? [produtoComFicha.nome] : [])])].slice(0, 3);
      return { tone: "red", text: "Não é possível excluir " + item.nome + " porque ele está sendo usado em ficha técnica: " + exemplos.join(", ") + ". Remova-o das fichas primeiro." };
    }
    if (apiStatus === "online") {
      try {
        await api.excluirInsumo(codigo);
      } catch (error) {
        return { tone: "red", text: error?.message || "Não foi possível excluir o item no servidor." };
      }
    }
    setEstoqueItens(prev => persistirItensEstoquePersonalizados(prev.filter(estoque => estoque.cod !== codigo)));
    if (produtosLigados.length) {
      const ids = new Set(produtosLigados.map(produto => produto.id));
      setProdutos(prev => salvarCadastroLocal("imperial.products.v1", prev.filter(produto => !ids.has(produto.id))));
    }
    return { tone: "green", text: item.nome + " excluído do estoque" + (produtosLigados.length ? " e do catálogo." : ".") };
  }

  async function handleExcluirProduto(produtoId) {
    const produto = produtos.find(item => item.id === produtoId);
    if (!produto) return { tone: "red", text: "Produto não encontrado." };
    const ficha = fichas.find(item => item.produtoId === produto.id || normalizeTxt(item.prato) === normalizeTxt(produto.nome));
    if (ficha) return { tone: "red", text: "Não é possível excluir " + produto.nome + " porque existe uma ficha técnica vinculada. Exclua ou desvincule a ficha primeiro." };
    if (produto.estoqueCod) return handleExcluirInsumo(produto.estoqueCod);
    setProdutos(prev => salvarCadastroLocal("imperial.products.v1", prev.filter(item => item.id !== produtoId)));
    return { tone: "green", text: produto.nome + " excluído do catálogo." };
  }
  async function handleAcertarEstoque(codigo, quantidadeCorreta) {
    const item = estoqueItens.find(estoque => estoque.cod === codigo);
    if (!item) return { tone: "red", text: "Item de estoque não encontrado." };
    if (!Number.isFinite(quantidadeCorreta) || quantidadeCorreta < 0) return { tone: "red", text: "Informe uma quantidade válida para o inventário." };
    if (quantidadeCorreta === item.qtd) return { tone: "green", text: item.nome + " já estava com a quantidade correta." };
    const diferenca = quantidadeCorreta - item.qtd;
    const resultado = await handleAtualizarInsumo(codigo, {
      nome: item.nome,
      categoria: item.cat,
      unidade: item.un,
      quantidade: quantidadeCorreta,
      estoqueMinimo: item.min,
      custoUnitario: item.custo,
    });
    if (resultado.tone !== "green") return resultado;
    const horario = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const registro = {
      id: "AJUSTE-EST-" + Date.now().toString(36).toUpperCase(),
      tipo: "ajuste",
      cod: item.cod,
      nome: resultado.item?.nome || item.nome,
      quantidade: Math.abs(diferenca),
      diferenca,
      saldoAnterior: item.qtd,
      saldoPosterior: quantidadeCorreta,
      custo: null,
      un: item.un,
      motivo: "Acerto de inventário",
      responsavel: "Alana",
      hora: "hoje " + horario,
    };
    setHistoricoMovimentosEstoque(prev => [registro, ...prev]);
    setMovs(prev => [{ tipo: "ajuste", desc: "Acerto de inventário — " + item.nome, qtd: item.qtd.toLocaleString("pt-BR") + " → " + quantidadeCorreta.toLocaleString("pt-BR") + " " + item.un, hora: "agora mesmo" }, ...prev]);
    return { tone: "green", text: item.nome + " acertado de " + item.qtd.toLocaleString("pt-BR") + " para " + quantidadeCorreta.toLocaleString("pt-BR") + " " + item.un + ". Diferença registrada: " + (diferenca > 0 ? "+" : "") + diferenca.toLocaleString("pt-BR") + "." };
  }
  async function handleAtualizarEstoqueMinimo(codigo, minimo) {
    const item = estoqueItens.find(i => i.cod === codigo);
    if (!item) return { tone: "red", text: "Item de estoque não encontrado." };
    setEstoqueItens(prev => persistirItensEstoquePersonalizados(prev.map(i => i.cod === codigo ? { ...i, min: minimo, status: statusFor(i.qtd, minimo) } : i)));
    if (apiStatus === "online") {
      try {
        await api.atualizarEstoqueMinimo(codigo, minimo);
      } catch (error) {
        setApiStatus("error");
        return { tone: "red", text: error?.message || "O mínimo foi atualizado localmente, mas não foi salvo no servidor." };
      }
    }
    return { tone: "green", text: `Estoque mínimo de ${item.nome} atualizado para ${minimo.toLocaleString("pt-BR")} ${item.un}.` };
  }

  function handleRegistrarCompraManual(entrada) {
    setEstoqueItens(prev => prev.map(it =>
      it.cod === entrada.insumoCod
        ? { ...it, qtd: it.qtd + entrada.quantidade, status: statusFor(it.qtd + entrada.quantidade, it.min) }
        : it
    ));
    setMovs(prev => [
      { tipo: "entrada", desc: `Compra manual (sem nota) — ${entrada.insumoNome}${entrada.fornecedor ? " · " + entrada.fornecedor : ""}`, qtd: `+${entrada.quantidade} ${entrada.un}`, hora: "agora mesmo" },
      ...prev,
    ]);
    setHistoricoManual(prev => [entrada, ...prev]);
    if (apiStatus === "online") {
      api.compraManual({
        insumoCodigo: entrada.insumoCod,
        quantidade: entrada.quantidade,
        custoUnitario: entrada.custo,
        fornecedor: entrada.fornecedor,
        formaPagamento: entrada.pagamento,
        observacao: entrada.obs || undefined,
      }).then(syncFromApi).catch(() => setApiStatus("error"));
    }
  }

  async function handleMovimentarEstoqueManual({ tipo, cod, quantidade, custo, motivo, responsavel }) {
    const item = estoqueItens.find(i => i.cod === cod);
    if (!item) return { tone: "red", text: "Selecione um produto válido." };
    if (!quantidade || quantidade <= 0) return { tone: "red", text: "Informe uma quantidade maior que zero." };
    if (tipo === "entrada" && (!Number.isFinite(custo) || custo <= 0)) return { tone: "red", text: "Informe um preço de custo maior que zero para a entrada." };
    if (!motivo) return { tone: "red", text: "Informe o motivo da movimentação." };
    if (!responsavel) return { tone: "red", text: "Informe o responsável pela movimentação." };
    if (tipo === "saida" && quantidade > item.qtd) return { tone: "red", text: "A saída excede o saldo de " + item.qtd.toLocaleString("pt-BR") + " " + item.un + "." };

    if (apiStatus === "online") {
      try {
        await api.registrarMovimentacaoEstoque({
          tipo,
          insumoCodigo: cod,
          quantidade,
          ...(tipo === "entrada" ? { custoUnitario: custo } : {}),
          motivo,
          responsavel,
        });
      } catch (error) {
        return { tone: "red", text: error?.message || "Não foi possível salvar a movimentação no servidor." };
      }
    }

    const sinal = tipo === "entrada" ? 1 : -1;
    const novaQtd = item.qtd + sinal * quantidade;
    const novoCusto = tipo === "entrada" ? custo : item.custo;
    setEstoqueItens(prev => prev.map(i => i.cod === cod ? { ...i, qtd: novaQtd, custo: novoCusto, status: statusFor(novaQtd, i.min) } : i));
    const horario = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const registro = { id: "MOV-EST-" + String(historicoMovimentosEstoque.length + 1).padStart(4, "0"), tipo, cod, nome: item.nome, quantidade, custo: tipo === "entrada" ? custo : null, un: item.un, motivo, responsavel, hora: "hoje " + horario };
    setHistoricoMovimentosEstoque(prev => [registro, ...prev]);
    setMovs(prev => [{ tipo, desc: (tipo === "entrada" ? "Entrada" : "Saída") + " manual — " + item.nome + " · " + motivo, qtd: (tipo === "entrada" ? "+" : "-") + quantidade + " " + item.un, hora: "agora mesmo" }, ...prev]);
    return { tone: "green", text: (tipo === "entrada" ? "Entrada" : "Saída") + " de " + quantidade.toLocaleString("pt-BR") + " " + item.un + " registrada para " + item.nome + (tipo === "entrada" ? " com custo de " + custo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) + "." : ".") };
  }
  function salvarCadastroLocal(chave, lista) {
    try {
      localStorage.setItem(chave, JSON.stringify(lista));
    } catch {
      // Mantém as alterações disponíveis durante a sessão.
    }
    return lista;
  }

  async function handleSalvarProduto(dados) {
    if (!dados.nome) return { tone: "red", text: "Informe o nome do produto." };
    if (!dados.categoria) return { tone: "red", text: "Selecione a categoria do produto." };
    if (produtos.some(produto => produto.id !== dados.id && normalizeTxt(produto.nome) === normalizeTxt(dados.nome))) {
      return { tone: "red", text: "Já existe um produto com este nome." };
    }
    let nomeSincronizado = dados.nome.trim();
    let categoriaSincronizada = dados.categoria;
    if (dados.id && dados.estoqueCod) {
      const itemLigado = estoqueItens.find(item => item.cod === dados.estoqueCod);
      if (itemLigado && (normalizeTxt(itemLigado.nome) !== normalizeTxt(nomeSincronizado) || normalizeTxt(itemLigado.cat) !== normalizeTxt(categoriaSincronizada))) {
        const resultadoEstoque = await handleAtualizarInsumo(itemLigado.cod, {
          nome: nomeSincronizado,
          categoria: categoriaSincronizada,
          unidade: itemLigado.un,
          quantidade: itemLigado.qtd,
          estoqueMinimo: itemLigado.min,
          custoUnitario: itemLigado.custo,
        });
        if (resultadoEstoque.tone !== "green") return resultadoEstoque;
        nomeSincronizado = resultadoEstoque.item?.nome || nomeSincronizado;
        categoriaSincronizada = resultadoEstoque.item?.cat || categoriaSincronizada;
      }
    }
    const produto = {
      id: dados.id || ("PROD-MAN-" + Date.now().toString(36).toUpperCase()),
      nome: nomeSincronizado,
      categoria: categoriaSincronizada,
      preco: Number(dados.preco || 0),
      estoqueCod: dados.estoqueCod || "",
      ativo: dados.ativo !== false,
    };
    setProdutos(prev => salvarCadastroLocal(
      "imperial.products.v1",
      (dados.id ? prev.map(item => item.id === dados.id ? produto : item) : [produto, ...prev])
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    ));
    if (dados.id) {
      setFichas(prev => salvarCadastroLocal(
        "imperial.technicalSheets.v1",
        prev.map(ficha => ficha.produtoId === dados.id
          ? { ...ficha, prato: produto.nome, categoria: produto.categoria, preco: produto.preco }
          : ficha),
      ));
    }
    return { tone: "green", text: produto.nome + (dados.id ? " atualizado no catálogo e no estoque." : " cadastrado sem exigir ficha técnica.") };
  }
  function handleSalvarCategoria(dados) {
    const nome = dados.nome.trim();
    if (!nome) return { tone: "red", text: "Informe o nome da categoria." };
    if (categoriasProduto.some(categoria => categoria.id !== dados.id && normalizeTxt(categoria.nome) === normalizeTxt(nome))) {
      return { tone: "red", text: "Já existe uma categoria com este nome." };
    }
    const categoriaAnterior = categoriasProduto.find(item => item.id === dados.id);
    const categoria = {
      id: dados.id || ("CAT-MAN-" + Date.now().toString(36).toUpperCase()),
      nome,
      ativo: dados.ativo !== false,
    };
    setCategoriasProduto(prev => salvarCadastroLocal(
      "imperial.productCategories.v1",
      (dados.id ? prev.map(item => item.id === dados.id ? categoria : item) : [categoria, ...prev])
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    ));
    if (categoriaAnterior && normalizeTxt(categoriaAnterior.nome) !== normalizeTxt(categoria.nome)) {
      setProdutos(prev => salvarCadastroLocal(
        "imperial.products.v1",
        prev.map(produto => normalizeTxt(produto.categoria) === normalizeTxt(categoriaAnterior.nome) ? { ...produto, categoria: categoria.nome } : produto),
      ));
      setFichas(prev => salvarCadastroLocal(
        "imperial.technicalSheets.v1",
        prev.map(ficha => normalizeTxt(ficha.categoria) === normalizeTxt(categoriaAnterior.nome) ? { ...ficha, categoria: categoria.nome } : ficha),
      ));
    }
    return { tone: "green", text: "Categoria " + categoria.nome + (dados.id ? " atualizada." : " cadastrada.") };
  }

  async function salvarFichaNoServidor(dados) {
    const produto = produtos.find(item => item.id === dados.produtoId)
      || produtos.find(item => normalizeTxt(item.nome) === normalizeTxt(dados.prato));
    const produtoFinal = estoqueItens.find(item => item.cod === produto?.estoqueCod)
      || estoqueItens.find(item => normalizeTxt(item.nome) === normalizeTxt(dados.prato));
    if (!produtoFinal?.id) {
      throw new Error("Vincule o produto da ficha a um item ativo do estoque antes de salvar.");
    }
    const itens = dados.insumos.map((insumo) => {
      const itemEstoque = estoqueItens.find(item => item.cod === insumo.cod);
      if (!itemEstoque?.id) throw new Error("O insumo " + insumo.nome + " ainda não está sincronizado com o estoque.");
      return {
        insumoId: itemEstoque.id,
        nome: insumo.nome,
        quantidade: Number(insumo.qtd),
        unidade: insumo.un,
        custoUnitario: Number(itemEstoque.custo || 0),
      };
    });
    const nome = dados.nomeSichef?.trim() || dados.prato.trim();
    const consulta = await api.getReceitas({ busca: nome, status: "todos", limit: 200 });
    const receitas = Array.isArray(consulta?.data) ? consulta.data : [];
    const existente = receitas.find(receita => receita.produtoFinalId === produtoFinal.id)
      || receitas.find(receita => normalizeTxt(receita.nome) === normalizeTxt(nome));
    const payload = {
      nome,
      produtoFinalId: produtoFinal.id,
      categoria: dados.categoria || produtoFinal.cat,
      rendimento: 1,
      unidadeRendimento: produtoFinal.un || "un",
      observacoes: "Ficha técnica de venda sincronizada pelo ERP.",
      ativo: true,
      itens,
    };
    const salva = existente
      ? api.atualizarReceita(existente.id, payload)
      : api.cadastrarReceita(payload);
    const resultado = await salva;
    await api.reprocessarPedidosIfood();
    return resultado;
  }

  async function handleSalvarFicha(dados) {
    if (!dados.produtoId || !dados.prato) return { tone: "red", text: "Selecione o produto da ficha técnica." };
    if (!dados.insumos.length) return { tone: "red", text: "Adicione pelo menos um insumo à ficha técnica." };
    if (fichas.some(ficha => ficha.id !== dados.id && (ficha.produtoId === dados.produtoId || normalizeTxt(ficha.prato) === normalizeTxt(dados.prato)))) {
      return { tone: "red", text: "Este produto já possui uma ficha técnica." };
    }
    let salvaNoServidor = null;
    if (apiStatus === "online") {
      try {
        salvaNoServidor = await salvarFichaNoServidor(dados);
      } catch (error) {
        return { tone: "red", text: error?.message || "Não foi possível salvar a ficha técnica no servidor." };
      }
    }
    if (dados.id) {
      setFichas(prev => salvarCadastroLocal(
        "imperial.technicalSheets.v1",
        prev.map(ficha => ficha.id === dados.id
          ? { ...ficha, ...dados, ...(salvaNoServidor ? { id: salvaNoServidor.id, backendId: salvaNoServidor.id } : {}), revisaoPendente: null, observacao: "Ficha atualizada manualmente no ERP." }
          : ficha),
      ));
      return { tone: "green", text: "Ficha técnica de " + dados.prato + " atualizada." };
    }
    const nova = {
      id: "FT-MAN-" + Date.now().toString(36).toUpperCase(),
      ...dados,
      ...(salvaNoServidor ? { id: salvaNoServidor.id, backendId: salvaNoServidor.id } : {}),
      revisaoPendente: null,
      observacao: "Ficha cadastrada manualmente no ERP.",
    };
    setFichas(prev => salvarCadastroLocal("imperial.technicalSheets.v1", [nova, ...prev]));
    return { tone: "green", text: "Ficha técnica de " + nova.prato + " cadastrada com " + nova.insumos.length + " insumo(s)." };
  }
  function handleRegistrarBoleto(entrada) {
    setEstoqueItens(prev => prev.map(it =>
      it.cod === entrada.insumoCod
        ? { ...it, qtd: it.qtd + entrada.quantidade, status: statusFor(it.qtd + entrada.quantidade, it.min) }
        : it
    ));
    setMovs(prev => [
      { tipo: "entrada", desc: `Entrada por boleto — ${entrada.insumoNome} · ${entrada.fornecedor}`, qtd: `+${entrada.quantidade} ${entrada.un}`, hora: "agora mesmo" },
      ...prev,
    ]);
    setContasPagar(prev => [
      { desc: `Boleto — ${entrada.fornecedor} (${entrada.insumoNome})`, venc: new Date(entrada.vencimento + "T00:00:00").toLocaleDateString("pt-BR"), valor: `R$ ${entrada.valor.toFixed(2)}`, status: "aberto" },
      ...prev,
    ]);
    setHistoricoBoleto(prev => [entrada, ...prev]);
    if (apiStatus === "online") {
      api.entradaBoleto({
        insumoCodigo: entrada.insumoCod,
        quantidade: entrada.quantidade,
        fornecedor: entrada.fornecedor,
        linhaDigitavel: entrada.linhaDigitavel || undefined,
        valor: entrada.valor,
        vencimento: entrada.vencimento,
      }).then(syncFromApi).catch(() => setApiStatus("error"));
    }
  }

  function handleRegistrarXml(nota) {
    if (nota.chave && historicoXml.some(h => h.chave === nota.chave)) {
      return { tone: "red", text: "Esta NF-e já foi importada. Nenhuma entrada foi duplicada." };
    }
    setEstoqueItens(prev => prev.map(it => {
      const match = nota.itens.find(ni => ni.cod === it.cod);
      if (!match) return it;
      const novaQtd = it.qtd + match.qCom;
      return { ...it, qtd: novaQtd, status: statusFor(novaQtd, it.min) };
    }));

    setMovs(prev => [
      ...nota.itens.map(it => ({
        tipo: "entrada",
        desc: `Entrada por XML NF-e — ${it.xProd} · ${nota.fornecedor}`,
        qtd: `+${it.qCom} ${it.uCom}`,
        hora: "agora mesmo",
      })),
      ...prev,
    ]);

    if (nota.duplicatas.length > 0) {
      setContasPagar(prev => [
        ...nota.duplicatas.map((d, i) => ({
          desc: `NF-e ${nota.fornecedor} — parcela ${d.nDup || i + 1}`,
          venc: d.dVenc ? new Date(d.dVenc + "T00:00:00").toLocaleDateString("pt-BR") : "A definir",
          valor: `R$ ${d.vDup.toFixed(2)}`,
          status: "aberto",
        })),
        ...prev,
      ]);
    } else {
      setContasPagar(prev => [
        { desc: `NF-e ${nota.fornecedor}`, venc: "A definir", valor: `R$ ${nota.vNF.toFixed(2)}`, status: "aberto" },
        ...prev,
      ]);
    }

    setHistoricoXml(prev => [nota, ...prev]);
    if (apiStatus === "online") {
      api.entradaXml({
        chave: nota.chave || `SEM-CHAVE-${Date.now()}`,
        fornecedor: nota.fornecedor || "Fornecedor não identificado",
        cnpj: nota.cnpj || undefined,
        valorTotal: nota.vNF,
        itens: nota.itens.map(it => ({
          insumoCodigo: it.cod,
          codigoProduto: it.cProd || undefined,
          descricao: it.xProd,
          unidade: it.uCom,
          quantidade: it.qCom,
          valorUnitario: it.vUnCom,
        })),
        duplicatas: nota.duplicatas.map(d => ({
          numero: d.nDup || undefined,
          vencimento: d.dVenc || undefined,
          valor: d.vDup,
        })),
      }).then(syncFromApi).catch(() => setApiStatus("error"));
    }
    return { tone: "green", text: `${nota.itens.length} item(ns) da NF-e foram lançados no estoque.` };
  }

  function handleCriarOrdem({ receitaId, lotes, responsavel }) {
    const receita = initialReceitas.find(r => r.id === receitaId);
    if (!receita) return;
    const sequencia = 502 + ordens.length;
    setOrdens(prev => [{
      id: `PR-${String(sequencia).padStart(4, "0")}`,
      receitaId,
      produto: receita.produto,
      lotes,
      qtd: receita.rendimento * lotes,
      un: receita.un,
      resp: responsavel,
      status: "aguardando",
      criadaEm: "agora mesmo",
    }, ...prev]);
  }

  function handleAvancarOrdem(ordemId) {
    const ordem = ordens.find(o => o.id === ordemId);
    if (!ordem) return { tone: "red", text: "Ordem de produção não encontrada." };

    if (ordem.status === "aguardando") {
      setOrdens(prev => prev.map(o => o.id === ordemId ? { ...o, status: "producao" } : o));
      return { tone: "green", text: `${ordem.id} iniciada. Os insumos serão movimentados somente na conclusão.` };
    }

    if (ordem.status !== "producao") {
      return { tone: "amber", text: "Esta ordem já foi concluída." };
    }

    const receita = initialReceitas.find(r => r.id === ordem.receitaId);
    if (!receita) return { tone: "red", text: "A receita vinculada à ordem não foi encontrada." };

    const necessidades = receita.insumos.map(insumo => {
      const item = estoqueItens.find(i => i.cod === insumo.cod);
      return { ...insumo, necessario: insumo.qtd * ordem.lotes, disponivel: item?.qtd ?? 0 };
    });
    const faltas = necessidades.filter(i => i.disponivel < i.necessario);
    if (faltas.length) {
      const resumo = faltas.map(i => `${i.nome}: faltam ${(i.necessario - i.disponivel).toLocaleString("pt-BR")} ${i.un}`).join("; ");
      return { tone: "red", text: `Estoque insuficiente. ${resumo}.` };
    }

    const quantidadeProduzida = receita.rendimento * ordem.lotes;
    setEstoqueItens(prev => prev.map(item => {
      const consumo = necessidades.find(i => i.cod === item.cod)?.necessario ?? 0;
      const entrada = item.cod === receita.produtoCod ? quantidadeProduzida : 0;
      const novaQtd = item.qtd - consumo + entrada;
      return consumo || entrada ? { ...item, qtd: novaQtd, status: statusFor(novaQtd, item.min) } : item;
    }));

    const agora = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setOrdens(prev => prev.map(o => o.id === ordemId ? { ...o, status: "concluidas", concluidaEm: `hoje ${agora}` } : o));
    setMovs(prev => [
      { tipo: "producao", desc: `Produção concluída — ${receita.produto} · ${ordem.id}`, qtd: `+${quantidadeProduzida} ${receita.un}`, hora: "agora mesmo" },
      ...necessidades.map(i => ({ tipo: "saida", desc: `Consumo de produção — ${i.nome} · ${ordem.id}`, qtd: `-${i.necessario} ${i.un}`, hora: "agora mesmo" })),
      ...prev,
    ]);

    return { tone: "green", text: `${ordem.id} concluída: ${quantidadeProduzida.toLocaleString("pt-BR")} ${receita.un} entraram no estoque e todos os insumos foram baixados.` };
  }

  function handleAbrirCaixa({ responsavel, turno, saldoInicial }) {
    if (caixas.some(c => c.status === "aberto")) {
      return { tone: "red", text: "Já existe um caixa aberto. Feche o turno atual antes de abrir outro." };
    }
    const novoId = `CX-${String(914 + caixas.length).padStart(4, "0")}`;
    const horario = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setCaixas(prev => [{ id: novoId, responsavel, turno, saldoInicial, abertoEm: `hoje ${horario}`, status: "aberto" }, ...prev]);
    return { tone: "green", text: `${novoId} aberto para ${responsavel} no turno ${turno}, com saldo inicial de ${saldoInicial.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.` };
  }

  function handleMovimentarCaixa({ tipo, descricao, valor }) {
    const caixa = caixas.find(c => c.status === "aberto");
    if (!caixa) return { tone: "red", text: "Abra um caixa antes de registrar movimentos." };
    const movimentoTeste = { tipo, valor };
    const saldoAtual = saldoCalculadoCaixa(caixa, movimentosCaixa);
    if (valorAssinadoCaixa(movimentoTeste) < 0 && valor > saldoAtual) {
      return { tone: "red", text: `O movimento excede o saldo disponível de ${saldoAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.` };
    }
    const horario = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const referencia = { entrada: "Entrada", saida: "Saída", suprimento: "Suprimento", sangria: "Sangria", troco: "Troco" }[tipo];
    const novo = { id: `MC-${4201 + movimentosCaixa.length}`, caixaId: caixa.id, tipo, descricao, referencia, valor, hora: `hoje ${horario}`, responsavel: caixa.responsavel };
    setMovimentosCaixa(prev => [novo, ...prev]);
    return { tone: "green", text: `${referencia} de ${valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} registrada no ${caixa.id}.` };
  }

  function handleFecharCaixa({ saldoContado, observacao }) {
    const caixa = caixas.find(c => c.status === "aberto");
    if (!caixa) return { tone: "red", text: "Não existe caixa aberto para fechar." };
    const saldoSistema = saldoCalculadoCaixa(caixa, movimentosCaixa);
    const diferenca = saldoContado - saldoSistema;
    const horario = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setCaixas(prev => prev.map(c => c.id === caixa.id ? { ...c, status: "fechado", fechadoEm: `hoje ${horario}`, saldoSistema, saldoContado, diferenca, observacao: observacao || (diferenca === 0 ? "Fechamento conferido." : "Diferença sem justificativa informada.") } : c));
    const textoDiferenca = diferenca === 0 ? "sem diferença" : `com diferença de ${diferenca.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
    return { tone: "green", text: `${caixa.id} fechado ${textoDiferenca}. O registro ficou disponível no histórico.` };
  }

  function handleCadastrarEntregador({ nome, telefone, tipo }) {
    const jaExiste = entregadores.some(e => normalizeTxt(e.nome) === normalizeTxt(nome) && e.tipo === tipo);
    if (jaExiste) return { tone: "red", text: `Já existe um entregador com esse nome vinculado à ${tipo}.` };
    const novo = { id: `ENT-${Date.now()}`, nome, telefone, tipo, ativo: true };
    setEntregadores(prev => salvarCadastroLocal("imperial.deliveryPeople.v1", [...prev, novo]));
    return { tone: "green", text: `${nome} cadastrado na empresa ${tipo}.` };
  }

  function handleAtualizarEntregador({ id, nome, telefone, tipo, ativo }) {
    const atual = entregadores.find(item => item.id === id);
    if (!atual) return { tone: "red", text: "Entregador não encontrado." };
    const duplicado = entregadores.some(item =>
      item.id !== id
      && normalizeTxt(item.nome) === normalizeTxt(nome)
      && normalizeTxt(item.tipo) === normalizeTxt(tipo)
    );
    if (duplicado) return { tone: "red", text: `Já existe um entregador com esse nome vinculado à ${tipo}.` };
    const atualizado = { ...atual, nome, telefone, tipo, ativo: Boolean(ativo) };
    setEntregadores(prev => salvarCadastroLocal(
      "imperial.deliveryPeople.v1",
      prev.map(item => item.id === id ? atualizado : item),
    ));
    return { tone: "green", text: `${nome} foi ${atual.ativo !== Boolean(ativo) ? (ativo ? "ativado" : "inativado") : "atualizado"}.` };
  }

  function handleExcluirEntregador(id) {
    const entregador = entregadores.find(item => item.id === id);
    if (!entregador) return { tone: "red", text: "Entregador não encontrado." };
    if (corridas.some(corrida => corrida.entregadorId === id)) {
      return { tone: "amber", text: `${entregador.nome} possui corridas no histórico. Para preservar os relatórios, coloque-o como inativo.` };
    }
    setEntregadores(prev => salvarCadastroLocal(
      "imperial.deliveryPeople.v1",
      prev.filter(item => item.id !== id),
    ));
    return { tone: "green", text: `${entregador.nome} foi excluído.` };
  }

  function handleCadastrarEmpresa(nome) {
    const duplicada = empresasEntrega.some(item => normalizeTxt(item) === normalizeTxt(nome));
    if (duplicada) return { tone: "red", text: "Esta empresa já está cadastrada." };
    setEmpresasEntrega(prev => salvarCadastroLocal(
      "imperial.deliveryCompanies.v1",
      [...prev, nome],
    ));
    return { tone: "green", text: `${nome} foi adicionada às empresas prestadoras.` };
  }

  function handleLancarLoteCorridas({ entregador, itens }) {
    const caixa = caixas.find(c => c.status === "aberto");
    if (!caixa) return { tone: "red", text: "Não há caixa aberto para lançar o acerto das motos." };
    if (!entregador || !itens.length) return { tone: "red", text: "Informe o entregador e adicione pelo menos uma corrida." };
    const total = itens.reduce((soma, item) => soma + item.valor, 0);
    const resultadoCaixa = handleMovimentarCaixa({
      tipo: "saida",
      descricao: `${itens.length} corrida(s) — ${entregador.nome} / ${entregador.tipo}`,
      valor: total,
    });
    if (resultadoCaixa.tone !== "green") return resultadoCaixa;
    const horario = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const loteId = `MOTO-${String(1 + new Set(corridas.map(c => c.loteId).filter(Boolean)).size).padStart(4, "0")}`;
    const novasCorridas = itens.map((item, index) => ({
      id: `COR-${String(4001 + corridas.length + index).padStart(4, "0")}`,
      loteId,
      pedido: item.pedido,
      entregadorId: entregador.id,
      entregador: entregador.nome,
      empresa: entregador.tipo,
      bairro: item.bairro,
      valor: item.valor,
      lancadaEm: `hoje ${horario}`,
      dataLancamento: new Date().toISOString(),
      status: "paga",
      caixaId: caixa.id,
      origemValor: item.origemValor || "tabela",
      avulso: Boolean(entregador.avulso),
    }));
    setCorridas(prev => salvarCadastroLocal("imperial.deliveryRuns.v1", [...novasCorridas, ...prev]));
    return { tone: "green", text: `${loteId}: ${itens.length} corrida(s) de ${entregador.nome}, total de ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}, lançadas no ${caixa.id}.` };
  }

  function handleConcluirEntregaLogistica({ pedido, entregador, custo }) {
    const existente = corridas.find(corrida => corrida.pedidoLogisticaId === pedido.id);
    if (existente) {
      return { tone: "green", text: `${pedido.codigoPedido} já estava concluído e registrado nos relatórios.` };
    }

    const valor = Number(custo || 0);
    if (!entregador || valor <= 0) {
      return { tone: "red", text: "A entrega precisa de entregador e custo maior que zero." };
    }

    const caixa = caixas.find(item => item.status === "aberto");
    let caixaId = null;
    if (caixa) {
      const resultadoCaixa = handleMovimentarCaixa({
        tipo: "saida",
        descricao: `Entrega ${entregador.tipo || "Frota Imperial"} — ${pedido.codigoPedido} — ${entregador.nome}`,
        valor,
      });
      if (resultadoCaixa.tone === "red") return resultadoCaixa;
      caixaId = caixa.id;
    }

    const agora = new Date();
    const horario = agora.toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const corrida = {
      id: `COR-LOG-${Date.now()}`,
      loteId: `LOG-${pedido.id}`,
      pedido: pedido.codigoPedido,
      pedidoLogisticaId: pedido.id,
      entregadorId: entregador.id,
      entregador: entregador.nome,
      empresa: entregador.tipo || "Frota Imperial",
      bairro: pedido.bairro,
      valor,
      distanciaKm: Number(pedido.distanciaKm || 0),
      valorPedido: Number(pedido.valorPedido || 0),
      taxaCliente: Number(pedido.taxaEntregaCliente || 0),
      origem: "CENTRAL_LOGISTICA",
      origemValor: pedido.origemValor || "quilometro",
      lancadaEm: `hoje ${horario}`,
      dataLancamento: agora.toISOString(),
      status: caixaId ? "paga" : "pendente_pagamento",
      caixaId,
    };
    setCorridas(prev => salvarCadastroLocal("imperial.deliveryRuns.v1", [corrida, ...prev]));
    return caixaId
      ? { tone: "green", text: `${pedido.codigoPedido} entregue por ${entregador.nome}; custo de ${valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} registrado no ${caixaId}.` }
      : { tone: "amber", text: `${pedido.codigoPedido} entregue e registrado com pagamento pendente porque não há caixa aberto.` };
  }

  function handleSalvarTarifa({ bairroOriginal, bairro, valores }) {
    if (!bairro) return { tone: "red", text: "Informe o nome do bairro ou destino." };
    if (!Object.keys(valores).length) return { tone: "red", text: "Informe o preço da Moto City ou da ZUPT." };
    const duplicado = tarifasMoto.some(t => normalizeTxt(t.bairro) === normalizeTxt(bairro) && t.bairro !== bairroOriginal);
    if (duplicado) return { tone: "red", text: "Este bairro já está cadastrado. Use a opção Editar na tabela." };

    const salvarLista = novas => {
      const ordenadas = novas.sort((a, b) => a.bairro.localeCompare(b.bairro, "pt-BR"));
      localStorage.setItem("imperial.deliveryRates.v1", JSON.stringify(ordenadas));
      return ordenadas;
    };

    if (bairroOriginal) {
      setTarifasMoto(prev => salvarLista(prev.map(t => t.bairro === bairroOriginal ? { bairro, valores } : t)));
      return { tone: "green", text: bairro + " atualizado e salvo na tabela de bairros." };
    }
    setTarifasMoto(prev => salvarLista([...prev, { bairro, valores }]));
    return { tone: "green", text: bairro + " adicionado e salvo na tabela de bairros." };
  }
  function handleRegistrarErro(erro) {
    const horario = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const novo = { id: `ERR-${String(122 + errosOperacionais.length + 1).padStart(4, "0")}`, dataHora: `hoje ${horario}`, ...erro };
    setErrosOperacionais(prev => [novo, ...prev]);
    return { tone: "green", text: `${novo.id} registrado para a equipe ${erro.equipe}.` };
  }

  function handleRegistrarCancelamento(dados) {
    const ficha = fichas.find(f => f.id === dados.fichaId);
    const qtdPerdida = ficha ? dados.qtdPerdida : 0;
    const necessidades = ficha ? ficha.insumos.map(insumo => {
      const item = estoqueItens.find(i => i.cod === insumo.cod);
      return { ...insumo, necessario: insumo.qtd * qtdPerdida, disponivel: item?.qtd ?? 0 };
    }) : [];
    const faltas = necessidades.filter(i => i.disponivel < i.necessario);
    if (faltas.length) {
      const resumo = faltas.map(i => `${i.nome}: faltam ${(i.necessario - i.disponivel).toLocaleString("pt-BR")} ${i.un}`).join("; ");
      return { tone: "red", text: `A perda não foi registrada porque o estoque está inconsistente. ${resumo}.` };
    }

    const impactoCaixa = dados.estorno + dados.taxaExtra;
    if (dados.debitarCaixa && impactoCaixa > 0) {
      const caixa = caixas.find(c => c.status === "aberto");
      if (!caixa) return { tone: "red", text: "Não há caixa aberto para lançar o estorno e a taxa extra." };
      const saldo = saldoCalculadoCaixa(caixa, movimentosCaixa);
      if (impactoCaixa > saldo) return { tone: "red", text: `O impacto de ${impactoCaixa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} excede o saldo disponível no caixa.` };
    }

    const perdaProduto = ficha ? custoFicha(ficha, estoqueItens) * qtdPerdida : 0;
    const prejuizoFinal = calcularPrejuizo({ taxaExtra: dados.taxaExtra, estorno: dados.estorno, recuperado: dados.recuperado, perdaProduto });
    let caixaId;
    if (dados.debitarCaixa && impactoCaixa > 0) {
      const caixa = caixas.find(c => c.status === "aberto");
      const resultadoCaixa = handleMovimentarCaixa({ tipo: "saida", descricao: `Estorno/taxa — ${dados.motivo}`, valor: impactoCaixa });
      if (resultadoCaixa.tone !== "green") return resultadoCaixa;
      caixaId = caixa?.id;
    }

    if (necessidades.length) {
      setEstoqueItens(prev => prev.map(item => {
        const baixa = necessidades.find(i => i.cod === item.cod)?.necessario ?? 0;
        if (!baixa) return item;
        const novaQtd = item.qtd - baixa;
        return { ...item, qtd: novaQtd, status: statusFor(novaQtd, item.min) };
      }));
      setMovs(prev => [
        ...necessidades.map(i => ({ tipo: "saida", desc: `Perda operacional — ${i.nome} · ${dados.motivo}`, qtd: `-${i.necessario} ${i.un}`, hora: "agora mesmo" })),
        ...prev,
      ]);
    }

    const horario = new Date().toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const novo = {
      id: `CAN-${String(47 + cancelamentos.length + 1).padStart(4, "0")}`,
      dataHora: `hoje ${horario}`,
      turno: dados.turno,
      motivo: dados.motivo,
      responsavelArea: dados.responsavelArea,
      valorPedido: dados.valorPedido,
      clienteFicou: dados.clienteFicou,
      solucionado: dados.solucionado,
      taxaExtra: dados.taxaExtra,
      estorno: dados.estorno,
      recuperado: dados.recuperado,
      perdaProduto,
      prejuizoFinal,
      observacao: dados.observacao,
      fichaId: ficha?.id,
      qtdPerdida,
      caixaId,
    };
    setCancelamentos(prev => [novo, ...prev]);
    return { tone: "green", text: `${novo.id} registrado com prejuízo final de ${prejuizoFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}${caixaId ? ` e impacto lançado no ${caixaId}` : ""}.` };
  }

  function handleFecharDia({ data, turno, responsavel }) {
    if (!data) return { tone: "red", text: "Informe a data do fechamento." };
    if (fechamentosDiarios.some(f => f.data === data && f.turno === turno)) {
      return { tone: "red", text: "Já existe um fechamento para esta data e turno." };
    }
    const caixaAberto = caixas.find(c => c.status === "aberto");
    if (caixaAberto) return { tone: "red", text: `Feche o ${caixaAberto.id} antes de concluir o fechamento diário.` };
    const abertas = ordens.filter(o => o.status !== "concluidas");
    if (abertas.length) return { tone: "red", text: `Finalize as ${abertas.length} ordens de produção abertas antes do fechamento.` };

    const dadosDoTurno = dadosPlataformas.filter(p => p.data === data && p.turno === turno);
    const faturamento = dadosDoTurno.reduce((s, p) => s + p.faturamento, 0);
    const pedidos = dadosDoTurno.reduce((s, p) => s + p.pedidos, 0);
    const caixaFechado = caixas.find(c => c.status === "fechado" && c.turno === turno) ?? caixas.find(c => c.status === "fechado");
    const novoId = `FEC-${String(148 + fechamentosDiarios.length).padStart(4, "0")}`;
    const novo = {
      id: novoId,
      data,
      turno,
      criadoEm: new Date().toLocaleString("pt-BR"),
      responsavel,
      resumo: {
        faturamento,
        pedidos,
        ticketMedio: pedidos ? faturamento / pedidos : 0,
        taxasEntrega: dadosDoTurno.reduce((s, p) => s + p.taxasEntrega, 0),
        gastoMotos: corridas.reduce((s, c) => s + c.valor, 0),
        prejuizo: cancelamentos.reduce((s, c) => s + c.prejuizoFinal, 0),
        erros: errosOperacionais.length,
        producaoFinalizada: ordens.filter(o => o.status === "concluidas").reduce((s, o) => s + o.qtd, 0),
        saldoCaixa: caixaFechado?.saldoContado ?? caixaFechado?.saldoSistema ?? 0,
      },
      estoque: estoqueItens.map(i => ({ cod: i.cod, nome: i.nome, qtd: i.qtd, un: i.un, status: i.status })),
    };
    setFechamentosDiarios(prev => [novo, ...prev]);
    return { tone: "green", text: `${novoId} concluído. Indicadores e ${novo.estoque.length} saldos de estoque foram congelados.`, id: novoId };
  }

  function handleMapearProdutoSichef(codigo, mapeamento) {
    setMapeamentosSichef(prev => ({ ...prev, [codigo]: mapeamento }));
  }

  function calcularBaixasSichef(produtos) {
    const baixas = new Map();
    const somar = (cod, qtd) => baixas.set(cod, (baixas.get(cod) || 0) + qtd);
    for (const produto of produtos) {
      const mapeamento = mapeamentosSichef[produto.codigo];
      if (!mapeamento || mapeamento.tipo === "pendente") throw new Error(`O código ${produto.codigo} ainda não foi configurado.`);
      if (["ignorar", "agrupador"].includes(mapeamento.tipo)) continue;
      if (mapeamento.tipo === "ficha") {
        const ficha = fichas.find(f => f.id === mapeamento.refId);
        if (!ficha) throw new Error(`A ficha vinculada ao código ${produto.codigo} não existe.`);
        ficha.insumos.forEach(insumo => somar(insumo.cod, insumo.qtd * produto.quantidade));
      } else if (mapeamento.tipo === "estoque") {
        const item = estoqueItens.find(i => i.cod === mapeamento.refId);
        if (!item) throw new Error(`O item de estoque vinculado ao código ${produto.codigo} não existe.`);
        const unRelatorio = normalizeTxt(produto.unidade).replace("unidade", "un");
        const unEstoque = normalizeTxt(item.un).replace("unidade", "un");
        if (unRelatorio && unEstoque && unRelatorio !== unEstoque) throw new Error(`${produto.nome}: unidade ${produto.unidade} incompatível com ${item.un} no estoque.`);
        somar(item.cod, produto.quantidade);
      }
    }
    return Array.from(baixas, ([cod, qtd]) => ({ cod, qtd }));
  }

  function handleConfirmarImportacao(preview, { substituirPeriodo }) {
    const duplicada = importacoesSichef.find(i => i.status === "processada" && i.hash === preview.hash);
    if (duplicada) return { tone: "red", text: `Este arquivo já foi processado na importação ${duplicada.id}.` };
    const anterior = importacoesSichef.find(i => i.status === "processada" && i.tipo === preview.tipo && i.periodo.chave === preview.periodo.chave);
    if (anterior && !substituirPeriodo) return { tone: "red", text: `O período já foi processado em ${anterior.id}. Marque a opção de substituição para reprocessar.` };

    const novoId = `IMP-${String(importacoesSichef.length + 1).padStart(4, "0")}`;
    const baseRegistro = {
      id: novoId,
      tipo: preview.tipo,
      arquivo: preview.arquivo,
      hash: preview.hash,
      periodo: preview.periodo,
      processadaEm: new Date().toLocaleString("pt-BR"),
      status: "processada",
      registros: preview.tipo === "produtos" ? preview.produtos.length : preview.plataformas.length,
    };

    if (preview.tipo === "produtos") {
      let novasBaixas;
      try {
        novasBaixas = calcularBaixasSichef(preview.produtos);
      } catch (err) {
        return { tone: "red", text: err?.message || "Não foi possível calcular a baixa de estoque." };
      }
      const baixasAnteriores = new Map((anterior?.baixas || []).map(b => [b.cod, b.qtd]));
      const codigos = new Set([...novasBaixas.map(b => b.cod), ...baixasAnteriores.keys()]);
      const deltas = Array.from(codigos, cod => ({ cod, qtd: (novasBaixas.find(b => b.cod === cod)?.qtd || 0) - (baixasAnteriores.get(cod) || 0) })).filter(d => Math.abs(d.qtd) > 0.0000001);
      const faltas = deltas.filter(d => d.qtd > 0).map(d => {
        const item = estoqueItens.find(i => i.cod === d.cod);
        return { ...d, item, falta: d.qtd - (item?.qtd || 0) };
      }).filter(d => !d.item || d.falta > 0.0000001);
      if (faltas.length) {
        const resumo = faltas.map(f => `${f.item?.nome || f.cod}: faltam ${Math.max(0, f.falta).toLocaleString("pt-BR")} ${f.item?.un || ""}`).join("; ");
        return { tone: "red", text: `A importação foi bloqueada por estoque insuficiente. ${resumo}.` };
      }

      setEstoqueItens(prev => prev.map(item => {
        const delta = deltas.find(d => d.cod === item.cod)?.qtd || 0;
        if (!delta) return item;
        const novaQtd = item.qtd - delta;
        return { ...item, qtd: novaQtd, status: statusFor(novaQtd, item.min) };
      }));
      setMovs(prev => [
        ...deltas.map(delta => {
          const item = estoqueItens.find(i => i.cod === delta.cod);
          return { tipo: delta.qtd > 0 ? "saida" : "entrada", desc: `${anterior ? "Reprocessamento" : "Importação"} SiChef — ${item?.nome || delta.cod} · ${preview.periodo.inicio} a ${preview.periodo.fim}`, qtd: `${delta.qtd > 0 ? "-" : "+"}${Math.abs(delta.qtd).toLocaleString("pt-BR")} ${item?.un || ""}`, hora: "agora mesmo" };
        }),
        ...prev,
      ]);
      const novoRegistro = { ...baseRegistro, baixas: novasBaixas, totalVendas: preview.totalVendas, desconto: preview.desconto };
      setImportacoesSichef(prev => [novoRegistro, ...prev.map(i => i.id === anterior?.id ? { ...i, status: "substituida", substituidaPor: novoId } : i)]);
      return { tone: "green", text: `${novoId} processada: ${preview.produtos.length} códigos e ${novasBaixas.length} itens de estoque movimentados${anterior ? `, substituindo ${anterior.id}` : ""}.` };
    }

    const dataInicio = dataBrParaIso(preview.periodo.inicio);
    const novasLinhas = preview.plataformas.map(p => ({ ...p, data: dataInicio, dataFim: dataBrParaIso(preview.periodo.fim), turno: preview.periodo.turno, origemImportacaoId: novoId }));
    setDadosPlataformas(prev => [
      ...novasLinhas,
      ...prev.filter(p => !anterior || p.origemImportacaoId !== anterior.id),
    ]);
    const novoRegistro = { ...baseRegistro, resumoPlataformas: preview.plataformas };
    setImportacoesSichef(prev => [novoRegistro, ...prev.map(i => i.id === anterior?.id ? { ...i, status: "substituida", substituidaPor: novoId } : i)]);
    const pedidos = preview.plataformas.reduce((s, p) => s + p.pedidos, 0);
    return { tone: "green", text: `${novoId} processada: ${pedidos} pedidos de ${preview.plataformas.length} plataformas atualizaram o dashboard. Nenhum movimento de caixa foi criado.` };
  }

  const activeMeta = NAV.find(n => n.key === active);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-[720px] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex font-sans">

        {/* Sidebar */}
        <aside className={cx(
          "fixed lg:static z-30 inset-y-0 left-0 w-64 bg-[#3D0007] dark:bg-[#2B0005] text-red-100/80 flex flex-col transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
            <BrandCrest size={32} className="text-white shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-white tracking-tight leading-tight truncate">Império das Parmegianas</div>
              <div className="text-[10px] text-red-200/60 tracking-wide">IMPERIAL ERP</div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col gap-0.5">
            {NAV.map(item => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { setActive(item.key); setSidebarOpen(false); }}
                  className={cx(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors relative",
                    isActive ? "bg-[#7A1420] text-white" : "hover:bg-white/5 text-red-100/70"
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                  {!READY.includes(item.key) && !isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/20" />
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white">RS</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">Rafael Souza</div>
                <div className="text-[11px] text-red-200/60 truncate">Administrador</div>
              </div>
              <ChevronDown size={14} className="text-red-200/50" />
            </div>
          </div>
        </aside>

        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-20 lg:hidden" />}

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 flex items-center justify-between px-4 sm:px-6 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500">☰</button>
              <div className="min-w-0">
                <h1 className="font-semibold text-slate-900 dark:text-white leading-tight truncate">{activeMeta?.label}</h1>
                <p className="text-xs text-slate-400 hidden sm:block">Império das Parmegianas · Delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 w-56">
                <Search size={14} className="text-slate-400" />
                <input placeholder="Buscar no sistema..." className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400" />
              </div>
              <button className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-300">
                <Bell size={16} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
              </button>
              <button onClick={() => setDark(d => !d)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-300">
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {apiStatus !== "online" && (
              <div className={cx(
                "mb-4 rounded-xl border px-4 py-2.5 text-xs",
                apiStatus === "connecting"
                  ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                  : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
              )}>
                {apiStatus === "connecting"
                  ? "Conectando ao servidor…"
                  : apiStatus === "error"
                    ? "Servidor indisponível — dados locais mantidos. Verifique a API e tente recarregar."
                    : "Modo demonstração ativo — configure VITE_API_URL para persistir os dados no PostgreSQL."}
              </div>
            )}
            {active === "dashboard" && <Dashboard movs={movs} estoqueItens={estoqueItens} />}
            {active === "estoque" && <Estoque itens={estoqueItens} onMovimentar={handleMovimentarEstoqueManual} historicoMovimentos={historicoMovimentosEstoque} onRegistrarXml={handleRegistrarXml} historicoXml={historicoXml} onAtualizarMinimo={handleAtualizarEstoqueMinimo} onAcertarEstoque={handleAcertarEstoque} onExcluirItem={handleExcluirInsumo} onCadastrarItem={handleCadastrarInsumo} />}
{active === "receitas" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-700/40 w-fit">
                  <button onClick={() => setAbaReceitas("producao")} className={cx("rounded-lg px-4 py-2 text-sm font-medium", abaReceitas === "producao" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500")}>Receitas e ordens de preparo</button>
                  <button onClick={() => setAbaReceitas("cadastros")} className={cx("rounded-lg px-4 py-2 text-sm font-medium", abaReceitas === "cadastros" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500")}>Produtos, itens e fichas de venda</button>
                </div>
                {abaReceitas === "cadastros" ? (
                  <Receitas
                    receitas={initialReceitas}
                    produtos={produtos}
                    categorias={categoriasProduto}
                    fichas={fichas}
                    estoqueItens={estoqueItens}
                    onCadastrarItem={handleCadastrarInsumo}
                    onAtualizarItem={handleAtualizarInsumo}
                    onExcluirProduto={handleExcluirProduto}
                    onSalvarProduto={handleSalvarProduto}
                    onSalvarCategoria={handleSalvarCategoria}
                    onSalvarFicha={handleSalvarFicha}
                  />
                ) : <ReceitasProducao onEstoqueAlterado={syncFromApi} />}
              </div>
            )}
            {active === "vendas" && <Vendas pedidos={pedidosVenda} carregando={pedidosVendaCarregando} erro={pedidosVendaErro} onAtualizar={syncPedidosVenda} />}
            {active === "entregas" && (
              <EntregasMotos
                entregadores={entregadores}
                empresas={empresasEntrega}
                tarifas={tarifasMoto}
                corridas={corridas}
                caixaAberto={caixas.find(c => c.status === "aberto")}
                onCadastrar={handleCadastrarEntregador}
                onAtualizar={handleAtualizarEntregador}
                onExcluir={handleExcluirEntregador}
                onCadastrarEmpresa={handleCadastrarEmpresa}
                onConcluirEntrega={handleConcluirEntregaLogistica}
                onLancarLote={handleLancarLoteCorridas}
                onSalvarTarifa={handleSalvarTarifa}
              />
            )}
            {active === "operacional" && <Operacional erros={errosOperacionais} cancelamentos={cancelamentos} fichas={fichas} estoqueItens={estoqueItens} caixaAberto={caixas.find(c => c.status === "aberto")} onRegistrarErro={handleRegistrarErro} onRegistrarCancelamento={handleRegistrarCancelamento} />}
            {active === "caixa" && <Caixa caixas={caixas} movimentos={movimentosCaixa} onAbrir={handleAbrirCaixa} onMovimentar={handleMovimentarCaixa} onFechar={handleFecharCaixa} />}
            {active === "compras" && (
              <Compras
                estoqueItens={estoqueItens}
                apiStatus={apiStatus}
                onAtualizarMinimo={handleAtualizarEstoqueMinimo}
                onRegistrarCompraManual={handleRegistrarCompraManual}
                historicoManual={historicoManual}
                onRegistrarBoleto={handleRegistrarBoleto}
                historicoBoleto={historicoBoleto}
                onRegistrarXml={handleRegistrarXml}
                historicoXml={historicoXml}
              />
            )}
            {active === "usuarios" && <CadastroPessoas />}
            {active === "financeiro" && <Financeiro contasPagar={contasPagar} />}
            {active === "relatorios" && <RelatoriosOperacionais plataformas={dadosPlataformas} corridas={corridas} cancelamentos={cancelamentos} erros={errosOperacionais} ordens={ordens} caixas={caixas} estoqueItens={estoqueItens} fechamentos={fechamentosDiarios} onFecharDia={handleFecharDia} />}
            {active === "integracoes" && <CentralImportacoes estoqueItens={estoqueItens} fichas={fichas} mapeamentos={mapeamentosSichef} importacoes={importacoesSichef} onMapear={handleMapearProdutoSichef} onConfirmar={handleConfirmarImportacao} />}
            {active === "config" && <ConfiguracoesIntegracoes apiStatus={apiStatus} />}
            {!READY.includes(active) && <EmBreve label={activeMeta?.label} />}
          </main>
        </div>
      </div>
    </div>
  );
}
