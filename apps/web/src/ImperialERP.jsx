"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "./api";
import CadastroPessoas from "./CadastroPessoas.jsx";
import ReceitasProducao from "./ReceitasProducao.jsx";
import ComprasCotacoes from "./ComprasCotacoes.jsx";
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
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.03,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411174",
        "nome": "MASSA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.8
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
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.01,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.09,
        "un": "g",
        "custoFonte": 0.05
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2771497",
    "codigoSichef": "2771497",
    "prato": "COM CATUPIRY G",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2948210",
        "nome": "CATUPIRY",
        "qtd": 0.25,
        "un": "kg",
        "custoFonte": 37.29
      }
    ],
    "fonte": "pizza.pdf"
  },
  {
    "id": "FT-2771499",
    "codigoSichef": "2771499",
    "prato": "COM CATUPIRY P",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2948210",
        "nome": "CATUPIRY",
        "qtd": 0.15,
        "un": "kg",
        "custoFonte": 37.29
      }
    ],
    "fonte": "pizza.pdf"
  },
  {
    "id": "FT-2485990",
    "codigoSichef": "2485990",
    "prato": "FÍLE AOS QUEIJOS GRANDE",
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
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411159",
        "nome": "GORGONZOLA",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 51.39
      },
      {
        "cod": "2411197",
        "nome": "PRÉ PREPARO STROGO CARNE",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 6.29
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
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.03,
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
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 0.1
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485996",
    "codigoSichef": "2485996",
    "prato": "FILÉ AOS QUEIJOS INDIVIDUAL",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411159",
        "nome": "GORGONZOLA",
        "qtd": 0.01,
        "un": "kg",
        "custoFonte": 51.39
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
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.09,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.03,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411174",
        "nome": "MASSA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.8
      },
      {
        "cod": "2411197",
        "nome": "PRÉ PREPARO STROGO CARNE",
        "qtd": 0.5,
        "un": "un",
        "custoFonte": 6.29
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485973",
    "codigoSichef": "2485973",
    "prato": "FRANGO COM MUÇARELA GRANDE",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.03,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
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
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.001,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.12,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411196",
        "nome": "PRÉ PREPARO FRANGO PIZZA",
        "qtd": 4.0,
        "un": "un",
        "custoFonte": 1.88
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.3,
        "un": "g",
        "custoFonte": 0.05
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485977",
    "codigoSichef": "2485977",
    "prato": "FRANGO COM MUÇARELA INDIVIDUAL",
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
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.1
      },
      {
        "cod": "2411196",
        "nome": "PRÉ PREPARO FRANGO PIZZA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.88
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
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485967",
    "codigoSichef": "2485967",
    "prato": "FRANGO E BACON GRANDE",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.18,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 7.05
      },
      {
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.05,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.24,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411124",
        "nome": "BACON",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 37.4
      },
      {
        "cod": "2411196",
        "nome": "PRÉ PREPARO FRANGO PIZZA",
        "qtd": 4.0,
        "un": "un",
        "custoFonte": 1.88
      },
      {
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 0.1
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
    "id": "FT-2485969",
    "codigoSichef": "2485969",
    "prato": "FRANGO E BACON INDIVIDUAL",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411174",
        "nome": "MASSA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.8
      },
      {
        "cod": "2411130",
        "nome": "CAIXA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.99
      },
      {
        "cod": "2411180",
        "nome": "ORÉGANO",
        "qtd": 0.001,
        "un": "kg",
        "custoFonte": 23.06
      },
      {
        "cod": "2411124",
        "nome": "BACON",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 37.4
      },
      {
        "cod": "2411196",
        "nome": "PRÉ PREPARO FRANGO PIZZA",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.88
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.01,
        "un": "kg",
        "custoFonte": 38.55
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
      },
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.03,
        "un": "l",
        "custoFonte": 13.14
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485986",
    "codigoSichef": "2485986",
    "prato": "PEPPERONI GRANDE",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411183",
        "nome": "PEPPERONI",
        "qtd": 0.08,
        "un": "kg",
        "custoFonte": 66.99
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.05,
        "un": "kg",
        "custoFonte": 38.55
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
        "qtd": 0.12,
        "un": "g",
        "custoFonte": 0.05
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
        "cod": "2411131",
        "nome": "CAIXA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 1.93
      },
      {
        "cod": "2411175",
        "nome": "MASSA PIZZA G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 7.05
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485987",
    "codigoSichef": "2485987",
    "prato": "PEPPERONI INDIVIDUAL",
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
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.03,
        "un": "l",
        "custoFonte": 13.14
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
        "cod": "2411183",
        "nome": "PEPPERONI",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 66.99
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.01,
        "un": "kg",
        "custoFonte": 38.55
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.06,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411174",
        "nome": "MASSA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.8
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485982",
    "codigoSichef": "2485982",
    "prato": "TRÊS QUEIJOS GRANDE",
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
        "cod": "2411162",
        "nome": "LACRE CAIXA",
        "qtd": 1.0,
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
        "cod": "2411159",
        "nome": "GORGONZOLA",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 51.39
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 0.06,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.12,
        "un": "g",
        "custoFonte": 0.05
      },
      {
        "cod": "2411121",
        "nome": "AZEITONA PRETA COM CAROÇO",
        "qtd": 0.05,
        "un": "kg",
        "custoFonte": 38.55
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-2485985",
    "codigoSichef": "2485985",
    "prato": "TRÊS QUEIJOS INDIVIDUAL",
    "preco": 0.0,
    "categoria": "Pizzas",
    "insumos": [
      {
        "cod": "2411176",
        "nome": "MOLHO DE TOMATE",
        "qtd": 0.03,
        "un": "l",
        "custoFonte": 13.14
      },
      {
        "cod": "2411174",
        "nome": "MASSA PIZZA P",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 3.8
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
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 0.03,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "2411159",
        "nome": "GORGONZOLA",
        "qtd": 0.01,
        "un": "kg",
        "custoFonte": 51.39
      },
      {
        "cod": "2411178",
        "nome": "MUSSARELA",
        "qtd": 0.03,
        "un": "g",
        "custoFonte": 0.05
      },
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
      }
    ],
    "fonte": "pizza.pdf",
    "observacao": "Orégano padronizado pela operação: 1 g por pizza inteira e 0,5 g por meia pizza."
  },
  {
    "id": "FT-3688103",
    "codigoSichef": "3688103",
    "prato": "RISOTO AOS QUEIJOS",
    "preco": 0.0,
    "categoria": "Risotos",
    "insumos": [
      {
        "cod": "3750454",
        "nome": "MANTEIGA COM SAL",
        "qtd": 0.03,
        "un": "kg",
        "custoFonte": 33.48
      },
      {
        "cod": "3688026",
        "nome": "PRÉ PREPARO ARROZ ARBÓREO",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.0
      },
      {
        "cod": "3688068",
        "nome": "CALDO DE LEGUMES PRONTO",
        "qtd": 0.24,
        "un": "l",
        "custoFonte": 0.0
      },
      {
        "cod": "3303838",
        "nome": "MIX DE QUEIJOS",
        "qtd": 2.0,
        "un": "un",
        "custoFonte": 2.2
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 10.0,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      }
    ],
    "fonte": "risotos.pdf"
  },
  {
    "id": "FT-3688083",
    "codigoSichef": "3688083",
    "prato": "RISOTO DE ALHO PORÓ",
    "preco": 0.0,
    "categoria": "Risotos",
    "insumos": [
      {
        "cod": "3688026",
        "nome": "PRÉ PREPARO ARROZ ARBÓREO",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.0
      },
      {
        "cod": "3688068",
        "nome": "CALDO DE LEGUMES PRONTO",
        "qtd": 0.24,
        "un": "l",
        "custoFonte": 0.0
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 20.0,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "3688048",
        "nome": "ALHO PORÓ",
        "qtd": 0.01,
        "un": "kg",
        "custoFonte": 0.0
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      },
      {
        "cod": "3750454",
        "nome": "MANTEIGA COM SAL",
        "qtd": 0.03,
        "un": "kg",
        "custoFonte": 33.48
      },
      {
        "cod": "3688049",
        "nome": "ALHO PORÓ CARAMELIZADO",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.0
      }
    ],
    "fonte": "risotos.pdf"
  },
  {
    "id": "FT-3688118",
    "codigoSichef": "3688118",
    "prato": "RISOTO DE BRÓCOLIS E BACON",
    "preco": 0.0,
    "categoria": "Risotos",
    "insumos": [
      {
        "cod": "3750454",
        "nome": "MANTEIGA COM SAL",
        "qtd": 0.03,
        "un": "kg",
        "custoFonte": 33.48
      },
      {
        "cod": "3688026",
        "nome": "PRÉ PREPARO ARROZ ARBÓREO",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.0
      },
      {
        "cod": "2411124",
        "nome": "BACON",
        "qtd": 0.03,
        "un": "kg",
        "custoFonte": 37.4
      },
      {
        "cod": "3688068",
        "nome": "CALDO DE LEGUMES PRONTO",
        "qtd": 0.24,
        "un": "l",
        "custoFonte": 0.0
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 20.0,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "2411126",
        "nome": "BRÓCOLIS",
        "qtd": 0.04,
        "un": "kg",
        "custoFonte": 8.69
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      }
    ],
    "fonte": "risotos.pdf"
  },
  {
    "id": "FT-3688098",
    "codigoSichef": "3688098",
    "prato": "RISOTO DE FILÉ MIGNON COM PARMESÃO",
    "preco": 0.0,
    "categoria": "Risotos",
    "insumos": [
      {
        "cod": "2411197",
        "nome": "PRÉ PREPARO STROGO CARNE",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 6.29
      },
      {
        "cod": "3688026",
        "nome": "PRÉ PREPARO ARROZ ARBÓREO",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.0
      },
      {
        "cod": "3688068",
        "nome": "CALDO DE LEGUMES PRONTO",
        "qtd": 0.24,
        "un": "l",
        "custoFonte": 0.0
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
        "cod": "3750454",
        "nome": "MANTEIGA COM SAL",
        "qtd": 0.03,
        "un": "kg",
        "custoFonte": 33.48
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 20.0,
        "un": "g",
        "custoFonte": 0.04
      }
    ],
    "fonte": "risotos.pdf"
  },
  {
    "id": "FT-3688075",
    "codigoSichef": "3688075",
    "prato": "RISOTO DE LIMÃO SICILIANO",
    "preco": 0.0,
    "categoria": "Risotos",
    "insumos": [
      {
        "cod": "2411171",
        "nome": "MARMITEX D7",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.57
      },
      {
        "cod": "3688026",
        "nome": "PRÉ PREPARO ARROZ ARBÓREO",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.0
      },
      {
        "cod": "3688068",
        "nome": "CALDO DE LEGUMES PRONTO",
        "qtd": 0.24,
        "un": "l",
        "custoFonte": 0.0
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 20.0,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "3688123",
        "nome": "LIMÃO SICILIANO EM PÓ",
        "qtd": 4.0,
        "un": "g",
        "custoFonte": 0.0
      },
      {
        "cod": "2411209",
        "nome": "SACO G",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.67
      },
      {
        "cod": "3750454",
        "nome": "MANTEIGA COM SAL",
        "qtd": 0.03,
        "un": "kg",
        "custoFonte": 33.48
      }
    ],
    "fonte": "risotos.pdf"
  },
  {
    "id": "FT-3688111",
    "codigoSichef": "3688111",
    "prato": "RISOTO DE LIMÃO SICILIANO COM FILÉ MIGNON",
    "preco": 0.0,
    "categoria": "Risotos",
    "insumos": [
      {
        "cod": "3688026",
        "nome": "PRÉ PREPARO ARROZ ARBÓREO",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 0.0
      },
      {
        "cod": "3688068",
        "nome": "CALDO DE LEGUMES PRONTO",
        "qtd": 0.24,
        "un": "l",
        "custoFonte": 0.0
      },
      {
        "cod": "2411197",
        "nome": "PRÉ PREPARO STROGO CARNE",
        "qtd": 1.0,
        "un": "un",
        "custoFonte": 6.29
      },
      {
        "cod": "2411182",
        "nome": "PARMESÃO",
        "qtd": 20.0,
        "un": "g",
        "custoFonte": 0.04
      },
      {
        "cod": "3688123",
        "nome": "LIMÃO SICILIANO EM PÓ",
        "qtd": 4.0,
        "un": "g",
        "custoFonte": 0.0
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
        "cod": "3750454",
        "nome": "MANTEIGA COM SAL",
        "qtd": 0.02,
        "un": "kg",
        "custoFonte": 33.48
      }
    ],
    "fonte": "risotos.pdf",
    "observacao": "PDF informa 0,980 kg; operação confirmou 20 g (0,020 kg)."
  },
  {
    "id": "FT-1918842",
    "codigoSichef": "1918842",
    "prato": "ARROZ EXTRA (180G)",
    "preco": 0,
    "categoria": "Adicionais",
    "fonte": "Regra operacional",
    "insumos": [
      {
        "cod": "2411202",
        "nome": "ARROZ PRONTO",
        "qtd": 0.18,
        "un": "kg"
      }
    ]
  },
  {
    "id": "FT-1918845",
    "codigoSichef": "1918845",
    "prato": "QUEIJO EM DOBRO NA PARMA",
    "preco": 0,
    "categoria": "Adicionais",
    "fonte": "Regra operacional",
    "observacao": "Extra confirmado: baixa 1 Mix de Queijos.",
    "insumos": [
      {
        "cod": "3303838",
        "nome": "MIX DE QUEIJOS",
        "qtd": 1,
        "un": "un"
      }
    ]
  },
  {
    "id": "FT-2065022",
    "codigoSichef": "2065022",
    "prato": "QUEIJO EM DOBRO (PARA 2)",
    "preco": 0,
    "categoria": "Adicionais",
    "fonte": "Regra operacional",
    "observacao": "Extra confirmado: baixa 2 Mix de Queijos.",
    "insumos": [
      {
        "cod": "3303838",
        "nome": "MIX DE QUEIJOS",
        "qtd": 2,
        "un": "un"
      }
    ]
  }
];

function statusFor(qtd, min) {
  if (!min || min <= 0) return "pendente";
  if (qtd <= 0) return "critico";
  if (qtd < min * 0.5) return "critico";
  if (qtd < min) return "baixo";
  return "ok";
}

const initialOrdensPreparo = [
  { id: "PR-0501", receitaId: "REC-14732", produto: "ARROZ PRONTO", lotes: 1, qtd: 22, un: "kg", resp: "Cozinha 1", status: "aguardando", criadaEm: "hoje 18:40" },
  { id: "PR-0500", receitaId: "REC-14738", produto: "PRÉ PREPARO STROGO FRANGO", lotes: 1, qtd: 6, un: "un", resp: "Dona Ivone", status: "producao", criadaEm: "hoje 17:55" },
  { id: "PR-0498", receitaId: "REC-14742", produto: "MACARRÃO SPAGHETTI", lotes: 2, qtd: 14, un: "un", resp: "Cozinha 1", status: "concluidas", criadaEm: "hoje 15:20", concluidaEm: "hoje 16:05" },
];

const pedidosVenda = [
  { id: "#2214", cliente: "João Pedro Alves — Bairro Centro", valor: "R$ 62,90", pagamento: "Pix", status: "em_preparo", data: "hoje 19:42" },
  { id: "#2213", cliente: "Marina Costa — Jd. das Flores", valor: "R$ 78,40", pagamento: "Cartão", status: "saiu_entrega", data: "hoje 19:31" },
  { id: "#2212", cliente: "Distribuidora iFood (repasse)", valor: "R$ 341,20", pagamento: "App", status: "entregue", data: "hoje 18:55" },
  { id: "#2211", cliente: "Carlos Eduardo — Vila Nova", valor: "R$ 45,00", pagamento: "Dinheiro", status: "cancelado", data: "hoje 18:20" },
];

const fluxoCaixa = [
  { dia: "26/06", saldo: 8.2 }, { dia: "27/06", saldo: 9.1 }, { dia: "28/06", saldo: 7.8 },
  { dia: "29/06", saldo: 10.4 }, { dia: "30/06", saldo: 13.9 }, { dia: "01/07", saldo: 15.2 }, { dia: "02/07", saldo: 14.6 },
];

const initialContasPagar = [
  { desc: "Boi Manso Distribuidora — Carnes", venc: "05/07", valor: "R$ 3.240,00", status: "aberto" },
  { desc: "Aluguel cozinha industrial", venc: "10/07", valor: "R$ 2.800,00", status: "aberto" },
  { desc: "Botijões de gás GLP", venc: "28/06", valor: "R$ 640,00", status: "atrasado" },
];

const contasReceber = [
  { desc: "Repasse iFood — semana 26", venc: "07/07", valor: "R$ 2.180,00", status: "aberto" },
  { desc: "Repasse Rappi — semana 26", venc: "07/07", valor: "R$ 940,00", status: "aberto" },
  { desc: "Contrato corporativo — Marmitas Empresa XP", venc: "30/06", valor: "R$ 1.120,00", status: "atrasado" },
];

const initialCaixas = [
  { id: "CX-0916", responsavel: "Alana", turno: "Noturno", abertoEm: "hoje 17:42", saldoInicial: 284.3, status: "aberto" },
  { id: "CX-0915", responsavel: "Adenilton", turno: "Matutino", abertoEm: "ontem 10:58", fechadoEm: "ontem 16:07", saldoInicial: 357.3, saldoSistema: 411.2, saldoContado: 409.2, diferenca: -2, status: "fechado", observacao: "Diferença registrada na conferência." },
  { id: "CX-0914", responsavel: "Gustavo", turno: "Noturno", abertoEm: "14/07 17:35", fechadoEm: "14/07 22:41", saldoInicial: 344.3, saldoSistema: 357.3, saldoContado: 357.3, diferenca: 0, status: "fechado", observacao: "Fechamento conferido." },
];

const initialMovimentosCaixa = [
  { id: "MC-4206", caixaId: "CX-0916", tipo: "saida", descricao: "Corrida #2214 — Wellington / Moto Imperial", referencia: "Moto", valor: 8, hora: "hoje 19:48", responsavel: "Alana" },
  { id: "MC-4205", caixaId: "CX-0916", tipo: "saida", descricao: "Corrida #2212 — Moto City", referencia: "Moto", valor: 24, hora: "hoje 19:02", responsavel: "Alana" },
  { id: "MC-4204", caixaId: "CX-0916", tipo: "entrada", descricao: "Venda em dinheiro — Pedido #2214", referencia: "Venda", valor: 100, hora: "hoje 19:42", responsavel: "Alana" },
  { id: "MC-4203", caixaId: "CX-0916", tipo: "troco", descricao: "Troco — Pedido #2214", referencia: "Troco", valor: 8.5, hora: "hoje 19:43", responsavel: "Alana" },
  { id: "MC-4202", caixaId: "CX-0916", tipo: "sangria", descricao: "Sangria para cofre", referencia: "Sangria", valor: 120, hora: "hoje 19:10", responsavel: "Alana" },
  { id: "MC-4201", caixaId: "CX-0916", tipo: "suprimento", descricao: "Reforço para troco", referencia: "Suprimento", valor: 50, hora: "hoje 18:05", responsavel: "Alana" },
];

function valorAssinadoCaixa(movimento) {
  return ["entrada", "suprimento"].includes(movimento.tipo) ? movimento.valor : -movimento.valor;
}

function saldoCalculadoCaixa(caixa, movimentos) {
  if (!caixa) return 0;
  return caixa.saldoInicial + movimentos.filter(m => m.caixaId === caixa.id).reduce((total, m) => total + valorAssinadoCaixa(m), 0);
}

const initialEntregadores = [
  { id: "ENT-001", nome: "Motoboy ZUPT", telefone: "", tipo: "Zupt", ativo: true },
  { id: "ENT-002", nome: "Motoboy Moto City", telefone: "", tipo: "Moto City", ativo: true },
];

const initialTarifasMoto = [
  {
    "bairro": "ACACIAS JD.",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "AEROPORTO JD.",
    "valores": {
      "Moto City": 18,
      "Zupt": 18
    }
  },
  {
    "bairro": "ALCOA (PORTARIA)",
    "valores": {
      "Moto City": 20,
      "Zupt": 22
    }
  },
  {
    "bairro": "ALCOA(CLUBE)",
    "valores": {
      "Moto City": 14,
      "Zupt": 12
    }
  },
  {
    "bairro": "ALTO DA BELA VISTA",
    "valores": {
      "Moto City": 24,
      "Zupt": 25
    }
  },
  {
    "bairro": "AMARILLYS JD.",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "AMÉRICA JD.",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "ANHAGUERA",
    "valores": {
      "Moto City": 10,
      "Zupt": 12
    }
  },
  {
    "bairro": "APARECIDA",
    "valores": {
      "Moto City": 9,
      "Zupt": 10
    }
  },
  {
    "bairro": "AUGUSTO ALMEIDA",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "AZALÉIAS JD.",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "BANDEIRANTES JD.",
    "valores": {
      "Moto City": 13,
      "Zupt": 13
    }
  },
  {
    "bairro": "BELA VISTA",
    "valores": {
      "Moto City": 9,
      "Zupt": 10
    }
  },
  {
    "bairro": "BELVEDERE",
    "valores": {
      "Moto City": 14,
      "Zupt": 13
    }
  },
  {
    "bairro": "BEM BASTOS",
    "valores": {
      "Moto City": 11,
      "Zupt": 12
    }
  },
  {
    "bairro": "BIANUCCI",
    "valores": {
      "Moto City": 11,
      "Zupt": 12
    }
  },
  {
    "bairro": "BOA ESPERANÇA",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "BORTOLAN",
    "valores": {
      "Moto City": 22,
      "Zupt": 22
    }
  },
  {
    "bairro": "BRASIL JD.",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "CACHOEIRINHA",
    "valores": {
      "Moto City": 20,
      "Zupt": 20
    }
  },
  {
    "bairro": "CAIO JUNQUEIRA",
    "valores": {
      "Moto City": 11,
      "Zupt": 12
    }
  },
  {
    "bairro": "CAMPO AROEIRAS",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "CAMPO CACHOEIRA",
    "valores": {
      "Moto City": 30,
      "Zupt": 30
    }
  },
  {
    "bairro": "CAMPO DAS ANTAS",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "CAMPOS ELÍSEOS",
    "valores": {
      "Moto City": 15,
      "Zupt": 15
    }
  },
  {
    "bairro": "CAROLINA JD.",
    "valores": {
      "Moto City": 12,
      "Zupt": 13
    }
  },
  {
    "bairro": "CARRETÃO",
    "valores": {
      "Moto City": 20,
      "Zupt": 21
    }
  },
  {
    "bairro": "CASCATA DAS ANTAS",
    "valores": {
      "Moto City": 25,
      "Zupt": 35
    }
  },
  {
    "bairro": "CASCATINHA",
    "valores": {
      "Moto City": 9,
      "Zupt": 10
    }
  },
  {
    "bairro": "CASSINO",
    "valores": {
      "Moto City": 27,
      "Zupt": 27
    }
  },
  {
    "bairro": "CBA",
    "valores": {
      "Moto City": 28,
      "Zupt": 32
    }
  },
  {
    "bairro": "CEMITÉRIO PARQUE",
    "valores": {
      "Moto City": 20,
      "Zupt": 22
    }
  },
  {
    "bairro": "CENTENÁRIO",
    "valores": {
      "Moto City": 11,
      "Zupt": 13
    }
  },
  {
    "bairro": "CENTREVILLE",
    "valores": {
      "Moto City": 14,
      "Zupt": 13
    }
  },
  {
    "bairro": "CENTRO",
    "valores": {
      "Moto City": 8,
      "Zupt": 8
    }
  },
  {
    "bairro": "CHAC. ALVORADA",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "CHAC. DOS CRAVOS",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "CHAC. POÇ. CALDAS",
    "valores": {
      "Moto City": 20,
      "Zupt": 22
    }
  },
  {
    "bairro": "CHAC. S. FRANCISCO",
    "valores": {
      "Moto City": 22,
      "Zupt": 25
    }
  },
  {
    "bairro": "CHAC. STA BÁRBARA",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "CHAC. STO. ANTÔNIO",
    "valores": {
      "Moto City": 27,
      "Zupt": 28
    }
  },
  {
    "bairro": "COLINAS DO SUL",
    "valores": {
      "Moto City": 12,
      "Zupt": 13
    }
  },
  {
    "bairro": "COLINAS JD.",
    "valores": {
      "Moto City": 12,
      "Zupt": 13
    }
  },
  {
    "bairro": "CONJ. HABITACIONAL",
    "valores": {
      "Moto City": 18,
      "Zupt": 18
    }
  },
  {
    "bairro": "CONTORNO JD.",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "CORREGO DANTAS",
    "valores": {
      "Moto City": 30,
      "Zupt": 30
    }
  },
  {
    "bairro": "COUNTRY CLUB",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "CRISTO",
    "valores": {
      "Moto City": 15,
      "Zupt": 16
    }
  },
  {
    "bairro": "CURIMBABA MIN",
    "valores": {
      "Moto City": 32,
      "Zupt": 32
    }
  },
  {
    "bairro": "DANIELE JD.",
    "valores": {
      "Moto City": 15,
      "Zupt": 14
    }
  },
  {
    "bairro": "DANONE",
    "valores": {
      "Moto City": 20,
      "Zupt": 22
    }
  },
  {
    "bairro": "DANONE BABY",
    "valores": {
      "Moto City": 32,
      "Zupt": 35
    }
  },
  {
    "bairro": "DEL REY JD.",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "DIST. INDUSTRIAL",
    "valores": {
      "Moto City": 32,
      "Zupt": 35
    }
  },
  {
    "bairro": "DOM BOSCO",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "DR OTTONI",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "ELISABETH JD.",
    "valores": {
      "Moto City": 14,
      "Zupt": 13
    }
  },
  {
    "bairro": "ELVIRA DIAS",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "ESMERALDA",
    "valores": {
      "Moto City": 14,
      "Zupt": 13
    }
  },
  {
    "bairro": "EST.P.DE CALDAS",
    "valores": {
      "Moto City": 16,
      "Zupt": 16
    }
  },
  {
    "bairro": "EST.SÃO JOSÉ",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "ESTADOS JD.",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "EUROPA",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "FAZENDA",
    "valores": {
      "Moto City": 22,
      "Zupt": 22
    }
  },
  {
    "bairro": "FERRERO",
    "valores": {
      "Moto City": 22,
      "Zupt": 22
    }
  },
  {
    "bairro": "FILIPINO JD.",
    "valores": {
      "Moto City": 9,
      "Zupt": 10
    }
  },
  {
    "bairro": "FLORENZA JD.",
    "valores": {
      "Moto City": 14,
      "Zupt": 15
    }
  },
  {
    "bairro": "FORMOSA JD.",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "FRIGONOSSA",
    "valores": {
      "Moto City": 30,
      "Zupt": 32
    }
  },
  {
    "bairro": "FROOTY",
    "valores": {
      "Moto City": 32,
      "Zupt": 35
    }
  },
  {
    "bairro": "FUNCIONÁRIOS",
    "valores": {
      "Moto City": 9,
      "Zupt": 10
    }
  },
  {
    "bairro": "FURNAS",
    "valores": {
      "Moto City": 15,
      "Zupt": 17
    }
  },
  {
    "bairro": "GAMA CRUZ",
    "valores": {
      "Moto City": 11,
      "Zupt": 11
    }
  },
  {
    "bairro": "GINÁSIO JD.",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "GOLDEN",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "GOLF CLUB",
    "valores": {
      "Moto City": 35,
      "Zupt": 35
    }
  },
  {
    "bairro": "GREENVILLE",
    "valores": {
      "Moto City": 11,
      "Zupt": 12
    }
  },
  {
    "bairro": "HORTÊNCIA JD",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "IF SUL DE MINAS",
    "valores": {
      "Moto City": 15,
      "Zupt": 14
    }
  },
  {
    "bairro": "INB",
    "valores": {
      "Moto City": 30,
      "Zupt": 35
    }
  },
  {
    "bairro": "IPÊ JD.",
    "valores": {
      "Moto City": 11,
      "Zupt": 12
    }
  },
  {
    "bairro": "ITAMARATY 1,2,3,4",
    "valores": {
      "Moto City": 18,
      "Zupt": 18
    }
  },
  {
    "bairro": "ITAMARATY 5",
    "valores": {
      "Moto City": 18,
      "Zupt": 19
    }
  },
  {
    "bairro": "JOSÉ CARLOS",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "KENNEDY",
    "valores": {
      "Moto City": 18,
      "Zupt": 18
    }
  },
  {
    "bairro": "LORENZETTI",
    "valores": {
      "Moto City": 25,
      "Zupt": 25
    }
  },
  {
    "bairro": "M.DOS PÁSSAROS",
    "valores": {
      "Moto City": 32,
      "Zupt": 32
    }
  },
  {
    "bairro": "MANACÁS",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "MARÇAL SANTOS",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "MARCO DIVISÓRIO",
    "valores": {
      "Moto City": 38,
      "Zupt": 35
    }
  },
  {
    "bairro": "MARGARITA MORALES",
    "valores": {
      "Moto City": 20,
      "Zupt": 19
    }
  },
  {
    "bairro": "MARIA IMACULADA",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "MG FIBRAS",
    "valores": {
      "Zupt": 32
    }
  },
  {
    "bairro": "MONJOLINHO",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "MONREALE",
    "valores": {
      "Moto City": 22,
      "Zupt": 22
    }
  },
  {
    "bairro": "MONTE ALMO",
    "valores": {
      "Moto City": 10,
      "Zupt": 11
    }
  },
  {
    "bairro": "MONTE VERDE",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "MOR. DAS FLORES",
    "valores": {
      "Moto City": 32,
      "Zupt": 32
    }
  },
  {
    "bairro": "MORUMBI",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "NASCENTES DA SERRA",
    "valores": {
      "Moto City": 22,
      "Zupt": 22
    }
  },
  {
    "bairro": "NEONUTRI",
    "valores": {
      "Moto City": 32,
      "Zupt": 22
    }
  },
  {
    "bairro": "NOTRE DAME",
    "valores": {
      "Zupt": 14
    }
  },
  {
    "bairro": "NOVA APARECIDA",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "NOVA AURORA",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "NOVO MUNDO JD.",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "PARAÍSO JD.",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "PHELPS / PRYSMIAN",
    "valores": {
      "Moto City": 17,
      "Zupt": 17
    }
  },
  {
    "bairro": "PHILADELPHIA JD.",
    "valores": {
      "Moto City": 14,
      "Zupt": 15
    }
  },
  {
    "bairro": "PLANALTO JD.",
    "valores": {
      "Moto City": 9,
      "Zupt": 10
    }
  },
  {
    "bairro": "POÇOS DE CALDAS",
    "valores": {
      "Moto City": 16
    }
  },
  {
    "bairro": "POL. RODOVIÁRIA",
    "valores": {
      "Zupt": 28
    }
  },
  {
    "bairro": "PQ. DAS NAÇÕES",
    "valores": {
      "Moto City": 17,
      "Zupt": 18
    }
  },
  {
    "bairro": "PQ. ESPERANÇA",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "PQ. PINHEIROS",
    "valores": {
      "Moto City": 18,
      "Zupt": 18
    }
  },
  {
    "bairro": "PQ. SAN CARLO",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "PRAIA DO SOL (BAIRRO)",
    "valores": {
      "Moto City": 22,
      "Zupt": 25
    }
  },
  {
    "bairro": "PRAIA DO SOL (HOTEL)",
    "valores": {
      "Moto City": 22,
      "Zupt": 22
    }
  },
  {
    "bairro": "PRIMAVERA",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "PUC",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "QUISSISANA JD.",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "R. CAMPO ALEGRE",
    "valores": {
      "Moto City": 35,
      "Zupt": 35
    }
  },
  {
    "bairro": "R. COLINAS SUL",
    "valores": {
      "Moto City": 12,
      "Zupt": 13
    }
  },
  {
    "bairro": "R. MANTIQUEIRA",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "REGINA JD.",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "RES GREEN VILLE",
    "valores": {
      "Zupt": 11
    }
  },
  {
    "bairro": "RES. BERNARDO",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "RES. PAINEIRAS",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "RES. PITANGUEIRAS",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "RES. SUMMER VILLE",
    "valores": {
      "Moto City": 11,
      "Zupt": 11
    }
  },
  {
    "bairro": "RES. TORRE",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "RES. VEREDAS",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "RODOVIÁRIA",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "SANTA ÂNGELA",
    "valores": {
      "Moto City": 11,
      "Zupt": 10
    }
  },
  {
    "bairro": "SANTA AUGUSTA",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "SANTA CASA",
    "valores": {
      "Moto City": 10,
      "Zupt": 12
    }
  },
  {
    "bairro": "SANTA CLARA",
    "valores": {
      "Moto City": 14,
      "Zupt": 15
    }
  },
  {
    "bairro": "SANTA EMÍLIA",
    "valores": {
      "Moto City": 10,
      "Zupt": 11
    }
  },
  {
    "bairro": "SANTA HELENA",
    "valores": {
      "Moto City": 14,
      "Zupt": 12
    }
  },
  {
    "bairro": "SANTA LÚCIA (BAIRRO)",
    "valores": {
      "Moto City": 11,
      "Zupt": 11
    }
  },
  {
    "bairro": "SANTA LÚCIA (EMPRESA)",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "SANTA MARGARIDA",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "SANTA MARIA",
    "valores": {
      "Moto City": 11,
      "Zupt": 11
    }
  },
  {
    "bairro": "SANTA RITA",
    "valores": {
      "Moto City": 10,
      "Zupt": 12
    }
  },
  {
    "bairro": "SANTA ROSÁLIA",
    "valores": {
      "Moto City": 12,
      "Zupt": 17
    }
  },
  {
    "bairro": "SANTA TEREZA",
    "valores": {
      "Moto City": 17,
      "Zupt": 11
    }
  },
  {
    "bairro": "SANTO ANDRÉ",
    "valores": {
      "Moto City": 11,
      "Zupt": 10
    }
  },
  {
    "bairro": "SÃO BENEDITO",
    "valores": {
      "Moto City": 9,
      "Zupt": 10
    }
  },
  {
    "bairro": "SÃO BENTO",
    "valores": {
      "Moto City": 17,
      "Zupt": 17
    }
  },
  {
    "bairro": "SÃO CONRADO",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "SÃO DOMINGOS",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "SÃO GERALDO",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "SÃO JOÃO",
    "valores": {
      "Moto City": 10,
      "Zupt": 11
    }
  },
  {
    "bairro": "SÃO JORGE",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "SÃO JOSÉ",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "SÃO PAULO",
    "valores": {
      "Moto City": 10,
      "Zupt": 11
    }
  },
  {
    "bairro": "SÃO SEBASTIÃO",
    "valores": {
      "Moto City": 18,
      "Zupt": 19
    }
  },
  {
    "bairro": "SHOPPING",
    "valores": {
      "Moto City": 14,
      "Zupt": 15
    }
  },
  {
    "bairro": "TAXA MÁQUININHA",
    "valores": {
      "Moto City": 1,
      "Zupt": 1
    }
  },
  {
    "bairro": "THERMAS",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "TIRADENTES",
    "valores": {
      "Moto City": 17,
      "Zupt": 17
    }
  },
  {
    "bairro": "TREVO POLÍCIA",
    "valores": {
      "Moto City": 22,
      "Zupt": 22
    }
  },
  {
    "bairro": "UNICESUMAR",
    "valores": {
      "Zupt": 10
    }
  },
  {
    "bairro": "UNIFAL",
    "valores": {
      "Moto City": 28,
      "Zupt": 35
    }
  },
  {
    "bairro": "UNIFENAS",
    "valores": {
      "Moto City": 18,
      "Zupt": 18
    }
  },
  {
    "bairro": "UNIMED",
    "valores": {
      "Moto City": 13,
      "Zupt": 13
    }
  },
  {
    "bairro": "UPA",
    "valores": {
      "Moto City": 12,
      "Zupt": 10
    }
  },
  {
    "bairro": "VALE DAS ANTAS",
    "valores": {
      "Moto City": 16,
      "Zupt": 17
    }
  },
  {
    "bairro": "VALE DO SOL",
    "valores": {
      "Moto City": 30,
      "Zupt": 15
    }
  },
  {
    "bairro": "VARANDAS DO SOL",
    "valores": {
      "Moto City": 25,
      "Zupt": 25
    }
  },
  {
    "bairro": "VÉU DAS NOIVAS",
    "valores": {
      "Moto City": 15,
      "Zupt": 15
    }
  },
  {
    "bairro": "VILA CRUZ",
    "valores": {
      "Moto City": 11,
      "Zupt": 11
    }
  },
  {
    "bairro": "VILA FLORA",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "VILA GUAPORÉ",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "VILA LÍDER",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "VILA MATILDE",
    "valores": {
      "Moto City": 17,
      "Zupt": 19
    }
  },
  {
    "bairro": "VILA MENEZES",
    "valores": {
      "Moto City": 11,
      "Zupt": 12
    }
  },
  {
    "bairro": "VILA NOVA",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "VILA OLÍMPICA",
    "valores": {
      "Moto City": 15,
      "Zupt": 14
    }
  },
  {
    "bairro": "VILA RABELO",
    "valores": {
      "Moto City": 26,
      "Zupt": 26
    }
  },
  {
    "bairro": "VILA RICA",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "VILA TOGNI",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "VILLAGE",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "VILLAGE SÃO LUIZ",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "VILLE DE FRANCE",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "VITÓRIA JD.",
    "valores": {
      "Moto City": 12,
      "Zupt": 12
    }
  },
  {
    "bairro": "VIVALDI LEITE",
    "valores": {
      "Moto City": 10,
      "Zupt": 10
    }
  },
  {
    "bairro": "WALTER WORD",
    "valores": {
      "Moto City": 14,
      "Zupt": 14
    }
  },
  {
    "bairro": "YORIN",
    "valores": {
      "Moto City": 28,
      "Zupt": 32
    }
  },
  {
    "bairro": "ZONA LESTE",
    "valores": {
      "Moto City": 15,
      "Zupt": 15
    }
  }
];

const initialCorridas = [
  { id: "COR-4001", loteId: "MOTO-0001", pedido: "#2210", entregadorId: "ENT-001", entregador: "Motoboy ZUPT", empresa: "Zupt", bairro: "APARECIDA", valor: 10, lancadaEm: "hoje 18:24", status: "paga", caixaId: "CX-0916" },
  { id: "COR-4002", loteId: "MOTO-0001", pedido: "#2211", entregadorId: "ENT-001", entregador: "Motoboy ZUPT", empresa: "Zupt", bairro: "ACACIAS JD.", valor: 12, lancadaEm: "hoje 18:24", status: "paga", caixaId: "CX-0916" },
];

function tarifaDaCorrida(tarifas, empresa, bairro) {
  return tarifas.find(t => t.bairro === bairro)?.valores?.[empresa] ?? null;
}

const initialErrosOperacionais = [
  { id: "ERR-0124", dataHora: "hoje 19:18", equipe: "Cozinha", tipo: "Tempo de preparo", descricao: "Pedido ultrapassou o tempo padrão", tempoPreparo: 42, tempoEntrega: 31, usuario: "Alana", turno: "Noturno" },
  { id: "ERR-0123", dataHora: "hoje 18:36", equipe: "Moto", tipo: "Atraso na coleta", descricao: "Entregador aguardou liberação do pedido", tempoPreparo: 34, tempoEntrega: 46, usuario: "Gustavo", turno: "Noturno" },
  { id: "ERR-0122", dataHora: "ontem 14:12", equipe: "Atendimento", tipo: "Endereço incorreto", descricao: "Número do endereço não confirmado", tempoPreparo: 22, tempoEntrega: 58, usuario: "Adenilton", turno: "Matutino" },
];

const initialCancelamentos = [
  { id: "CAN-0048", dataHora: "hoje 18:52", turno: "Noturno", motivo: "Cliente não localizado", responsavelArea: "Cliente", valorPedido: 44.99, clienteFicou: false, solucionado: true, taxaExtra: 8, estorno: 0, recuperado: 36, perdaProduto: 15.38, prejuizoFinal: 0, observacao: "Parte do valor recuperada pela plataforma", fichaId: "FT-1918805", qtdPerdida: 1, caixaId: "CX-0916" },
  { id: "CAN-0047", dataHora: "ontem 20:14", turno: "Noturno", motivo: "Problema na qualidade", responsavelArea: "Cozinha", valorPedido: 59.99, clienteFicou: true, solucionado: true, taxaExtra: 0, estorno: 59.99, recuperado: 0, perdaProduto: 82.78, prejuizoFinal: 142.77, observacao: "Pedido refeito e cliente atendido", fichaId: "FT-1918803", qtdPerdida: 1 },
];

const resumoPlataformasDiario = [
  { data: "2026-07-16", turno: "Noturno", plataforma: "99food", pedidos: 21, vendas: 1300.12, taxasEntrega: 154.52, faturamento: 1454.64 },
  { data: "2026-07-16", turno: "Noturno", plataforma: "Cardápio Web", pedidos: 9, vendas: 613.87, taxasEntrega: 41.95, faturamento: 655.82 },
  { data: "2026-07-16", turno: "Noturno", plataforma: "iFood", pedidos: 42, vendas: 2665.51, taxasEntrega: 403.24, faturamento: 3068.75 },
  { data: "2026-07-16", turno: "Noturno", plataforma: "iFood Pizza", pedidos: 4, vendas: 277.59, taxasEntrega: 2.97, faturamento: 280.56 },
  { data: "2026-07-16", turno: "Noturno", plataforma: "Neemo", pedidos: 1, vendas: 46.98, taxasEntrega: 7.99, faturamento: 54.97 },
];

const initialFechamentosDiarios = [
  {
    id: "FEC-0148", data: "2026-07-14", turno: "Noturno", criadoEm: "14/07/2026 22:46", responsavel: "Alana",
    resumo: { faturamento: 5514.74, pedidos: 77, ticketMedio: 71.62, taxasEntrega: 610.67, gastoMotos: 157, prejuizo: 60.41, erros: 2, producaoFinalizada: 62, saldoCaixa: 587.3 },
    estoque: [
      { cod: "2930214", nome: "PEITO DE FRANGO", qtd: 44.12, un: "kg", status: "ok" },
      { cod: "2411178", nome: "MUSSARELA", qtd: 5000, un: "g", status: "ok" },
      { cod: "2411176", nome: "MOLHO DE TOMATE", qtd: 5, un: "l", status: "ok" },
    ],
  },
];

const initialMapeamentosSichef = {
  "1918798": {
    "tipo": "ficha",
    "refId": "FT-1918798"
  },
  "1918825": {
    "tipo": "ficha",
    "refId": "FT-1918825"
  },
  "1918802": {
    "tipo": "ficha",
    "refId": "FT-1918802"
  },
  "1918824": {
    "tipo": "ficha",
    "refId": "FT-1918824"
  },
  "1918797": {
    "tipo": "ficha",
    "refId": "FT-1918797"
  },
  "1918823": {
    "tipo": "ficha",
    "refId": "FT-1918823"
  },
  "1918818": {
    "tipo": "ficha",
    "refId": "FT-1918818"
  },
  "1918826": {
    "tipo": "ficha",
    "refId": "FT-1918826"
  },
  "1918803": {
    "tipo": "ficha",
    "refId": "FT-1918803"
  },
  "1918799": {
    "tipo": "ficha",
    "refId": "FT-1918799"
  },
  "1918805": {
    "tipo": "ficha",
    "refId": "FT-1918805"
  },
  "1918801": {
    "tipo": "ficha",
    "refId": "FT-1918801"
  },
  "2108328": {
    "tipo": "ficha",
    "refId": "FT-2108328"
  },
  "3265211": {
    "tipo": "ficha",
    "refId": "FT-3265211"
  },
  "2893049": {
    "tipo": "ficha",
    "refId": "FT-2893049"
  },
  "3265212": {
    "tipo": "ficha",
    "refId": "FT-3265212"
  },
  "3265216": {
    "tipo": "ficha",
    "refId": "FT-3265216"
  },
  "2912541": {
    "tipo": "ficha",
    "refId": "FT-2912541"
  },
  "2630260": {
    "tipo": "ficha",
    "refId": "FT-2630260"
  },
  "2630250": {
    "tipo": "ficha",
    "refId": "FT-2630250"
  },
  "2630249": {
    "tipo": "ficha",
    "refId": "FT-2630249"
  },
  "2630255": {
    "tipo": "ficha",
    "refId": "FT-2630255"
  },
  "2630252": {
    "tipo": "ficha",
    "refId": "FT-2630252"
  },
  "2630251": {
    "tipo": "ficha",
    "refId": "FT-2630251"
  },
  "2630253": {
    "tipo": "ficha",
    "refId": "FT-2630253"
  },
  "2630254": {
    "tipo": "ficha",
    "refId": "FT-2630254"
  },
  "2485964": {
    "tipo": "ficha",
    "refId": "FT-2485964"
  },
  "2178434": {
    "tipo": "ficha",
    "refId": "FT-2178434"
  },
  "2485965": {
    "tipo": "ficha",
    "refId": "FT-2485965"
  },
  "2178438": {
    "tipo": "ficha",
    "refId": "FT-2178438"
  },
  "2485966": {
    "tipo": "ficha",
    "refId": "FT-2485966"
  },
  "2485961": {
    "tipo": "ficha",
    "refId": "FT-2485961"
  },
  "2485962": {
    "tipo": "ficha",
    "refId": "FT-2485962"
  },
  "2771497": {
    "tipo": "ficha",
    "refId": "FT-2771497"
  },
  "2771499": {
    "tipo": "ficha",
    "refId": "FT-2771499"
  },
  "2485990": {
    "tipo": "ficha",
    "refId": "FT-2485990"
  },
  "2485996": {
    "tipo": "ficha",
    "refId": "FT-2485996"
  },
  "2485973": {
    "tipo": "ficha",
    "refId": "FT-2485973"
  },
  "2485977": {
    "tipo": "ficha",
    "refId": "FT-2485977"
  },
  "2485967": {
    "tipo": "ficha",
    "refId": "FT-2485967"
  },
  "2485969": {
    "tipo": "ficha",
    "refId": "FT-2485969"
  },
  "2485986": {
    "tipo": "ficha",
    "refId": "FT-2485986"
  },
  "2485987": {
    "tipo": "ficha",
    "refId": "FT-2485987"
  },
  "2485982": {
    "tipo": "ficha",
    "refId": "FT-2485982"
  },
  "2485985": {
    "tipo": "ficha",
    "refId": "FT-2485985"
  },
  "3688103": {
    "tipo": "ficha",
    "refId": "FT-3688103"
  },
  "3688083": {
    "tipo": "ficha",
    "refId": "FT-3688083"
  },
  "3688118": {
    "tipo": "ficha",
    "refId": "FT-3688118"
  },
  "3688098": {
    "tipo": "ficha",
    "refId": "FT-3688098"
  },
  "3688075": {
    "tipo": "ficha",
    "refId": "FT-3688075"
  },
  "3688111": {
    "tipo": "ficha",
    "refId": "FT-3688111"
  },
  "1918842": {
    "tipo": "ficha",
    "refId": "FT-1918842"
  },
  "1918845": {
    "tipo": "ficha",
    "refId": "FT-1918845"
  },
  "2065022": {
    "tipo": "ficha",
    "refId": "FT-2065022"
  },
  "3094280": {
    "tipo": "estoque",
    "refId": "3094280"
  },
  "1918837": {
    "tipo": "estoque",
    "refId": "1918837"
  },
  "1918829": {
    "tipo": "estoque",
    "refId": "1918829"
  },
  "1918834": {
    "tipo": "estoque",
    "refId": "1918834"
  },
  "1918819": {
    "tipo": "estoque",
    "refId": "1918819"
  },
  "1918843": {
    "tipo": "estoque",
    "refId": "1918843"
  },
  "3251165": {
    "tipo": "estoque",
    "refId": "3251165"
  },
  "1918820": {
    "tipo": "estoque",
    "refId": "1918820"
  },
  "1918831": {
    "tipo": "estoque",
    "refId": "1918831"
  },
  "1918836": {
    "tipo": "estoque",
    "refId": "1918836"
  },
  "1918808": {
    "tipo": "estoque",
    "refId": "1918808"
  },
  "1918838": {
    "tipo": "estoque",
    "refId": "1918838"
  },
  "1918841": {
    "tipo": "estoque",
    "refId": "1918841"
  },
  "1918844": {
    "tipo": "estoque",
    "refId": "1918844"
  },
  "1918813": {
    "tipo": "estoque",
    "refId": "1918813"
  },
  "3296857": {
    "tipo": "estoque",
    "refId": "3296857"
  },
  "1918811": {
    "tipo": "estoque",
    "refId": "1918811"
  },
  "1918833": {
    "tipo": "estoque",
    "refId": "1918833"
  },
  "1918840": {
    "tipo": "estoque",
    "refId": "1918840"
  },
  "1918520": {
    "tipo": "ignorar",
    "refId": ""
  },
  "3156839": {
    "tipo": "ignorar",
    "refId": ""
  },
  "2684745": {
    "tipo": "ignorar",
    "refId": ""
  },
  "1918815": {
    "tipo": "ignorar",
    "refId": ""
  },
  "3242535": {
    "tipo": "ignorar",
    "refId": ""
  },
  "1918521": {
    "tipo": "ignorar",
    "refId": ""
  },
  "3219691": {
    "tipo": "ignorar",
    "refId": ""
  },
  "1918519": {
    "tipo": "ignorar",
    "refId": ""
  }
};

function dataBrParaIso(data) {
  const [dia, mes, ano] = String(data || "").split("/");
  return dia && mes && ano ? `${ano}-${mes}-${dia}` : "";
}

function extrairPeriodoSichef(texto) {
  const datas = String(texto || "").match(/\d{2}\/\d{2}\/\d{4}/g) || [];
  const turnoOriginal = String(texto || "").match(/TURNO\s+([^\n\r]+)/i)?.[1]?.trim() || "NÃO INFORMADO";
  const turno = /n[aã]o informado/i.test(turnoOriginal) ? "Integral" : turnoOriginal.charAt(0).toUpperCase() + turnoOriginal.slice(1).toLowerCase();
  return { inicio: datas[0] || "", fim: datas[1] || datas[0] || "", turno, turnoOriginal, chave: `${datas[0] || "sem-data"}_${datas[1] || datas[0] || "sem-data"}_${turno}` };
}

async function sha256Arquivo(buffer) {
  if (!globalThis.crypto?.subtle) {
    let hash = 2166136261;
    for (const byte of new Uint8Array(buffer)) hash = Math.imul(hash ^ byte, 16777619);
    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}-${buffer.byteLength}`;
  }
  const digest = await globalThis.crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function lerRelatorioSichef(file) {
  const buffer = await file.arrayBuffer();
  const hash = await sha256Arquivo(buffer);
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const linhas = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });
  const titulo = String(linhas?.[0]?.[0] || "").trim();
  const periodo = extrairPeriodoSichef(linhas?.[1]?.[0]);

  if (/vendas por produto/i.test(titulo)) {
    const agrupados = new Map();
    let totalVendas = 0;
    let desconto = 0;
    for (const linha of linhas.slice(2)) {
      const rotulo = String(linha?.[0] || "").trim();
      const match = rotulo.match(/^(\d+)\s*-\s*(.+)$/);
      if (match) {
        const [, codigo, nome] = match;
        const atual = agrupados.get(codigo) || { codigo, nome: nome.trim(), quantidade: 0, unidade: String(linha?.[2] || "UN"), ocorrencias: 0 };
        atual.quantidade += Number(linha?.[1]) || 0;
        atual.ocorrencias += 1;
        agrupados.set(codigo, atual);
      }
      if (String(linha?.[3] || "").trim().toLowerCase() === "total") totalVendas = Number(linha?.[4]) || 0;
      if (String(linha?.[3] || "").trim().toLowerCase() === "desconto") desconto = Number(linha?.[4]) || 0;
    }
    if (!agrupados.size) throw new Error("Nenhum produto válido foi encontrado no relatório.");
    return { tipo: "produtos", arquivo: file.name, hash, periodo, produtos: Array.from(agrupados.values()), totalVendas, desconto, linhasOriginais: linhas.length };
  }

  if (/vendas por tipo de pedido/i.test(titulo)) {
    const plataformas = linhas.slice(3).filter(linha => {
      const nome = String(linha?.[0] || "").trim();
      return nome && nome.includes(" - ") && !nome.toUpperCase().startsWith("TOTAL");
    }).map(linha => ({
      plataforma: String(linha[0]).split(" - ")[0].trim(),
      descricaoOriginal: String(linha[0]).trim(),
      vendas: Number(linha[2]) || 0,
      taxasServico: Number(linha[4]) || 0,
      taxasEntrega: Number(linha[5]) || 0,
      faturamento: Number(linha[7]) || 0,
      pedidos: Number(linha[8]) || 0,
      ticketMedio: Number(linha[10]) || 0,
    }));
    if (!plataformas.length) throw new Error("Nenhuma plataforma válida foi encontrada no relatório.");
    return { tipo: "plataformas", arquivo: file.name, hash, periodo, plataformas, linhasOriginais: linhas.length };
  }

  throw new Error("O arquivo não corresponde aos relatórios de produtos ou plataformas do SiChef.");
}

function custoFicha(ficha, estoqueItens) {
  return ficha ? custoDaComposicao(ficha.insumos, estoqueItens) : 0;
}

function calcularPrejuizo({ taxaExtra = 0, estorno = 0, recuperado = 0, perdaProduto = 0 }) {
  return Math.max(0, taxaExtra + estorno + perdaProduto - recuperado);
}

const pedidosCompra = [
  { id: "PC-0231", fornecedor: "Boi Manso Distribuidora", itens: "Contra-filé Bovino, Filé de Frango", valor: "R$ 4.820,00", status: "recebido", data: "28/06" },
  { id: "PC-0232", fornecedor: "Laticínios Vale Verde", itens: "Queijo Muçarela (60kg)", valor: "R$ 1.920,00", status: "parcial", data: "30/06" },
  { id: "PC-0233", fornecedor: "Embalagens Sul Delivery", itens: "Marmitas 500ml (10.000 un)", valor: "R$ 7.800,00", status: "pendente", data: "01/07" },
  { id: "PC-0234", fornecedor: "Boi Manso Distribuidora", itens: "Farinha de Rosca (100kg)", valor: "R$ 680,00", status: "cancelado", data: "01/07" },
];

const cotacoes = [
  {
    id: "COT-0088",
    item: "Contra-filé Bovino",
    quantidade: 100,
    unidade: "kg",
    estoqueAtual: 18,
    estoqueMinimo: 30,
    aberta: "28/06",
    status: "respondida",
    fornecedores: [
      { nome: "Boi Manso Distribuidora", preco: 34.5, prazo: 2, frete: 80, formaPagamento: "Boleto 30 dias", impostoIncluso: true, origemResposta: "WHATSAPP" },
      { nome: "Frigorífico Central", preco: 32.9, prazo: 4, frete: 40, formaPagamento: "PIX à vista", impostoIncluso: false, origemResposta: "WHATSAPP" },
      { nome: "Carnes Premium Ltda", preco: 35.8, prazo: 1, frete: 0, formaPagamento: "Boleto 28 dias", impostoIncluso: true, origemResposta: "MANUAL" },
    ],
  },
  {
    id: "COT-0089",
    item: "Embalagem Marmita 500ml",
    quantidade: 20000,
    unidade: "un",
    estoqueAtual: 3200,
    estoqueMinimo: 5000,
    aberta: "30/06",
    status: "respondida",
    fornecedores: [
      { nome: "Embalagens Sul Delivery", preco: 0.78, prazo: 5, frete: 220, formaPagamento: "Boleto 30/60 dias", impostoIncluso: true, origemResposta: "WHATSAPP" },
      { nome: "PackFood Embalagens", preco: 0.71, prazo: 7, frete: 150, formaPagamento: "Boleto 30 dias", impostoIncluso: false, origemResposta: "WHATSAPP" },
    ],
  },
  {
    id: "COT-0090",
    item: "Queijo Muçarela",
    quantidade: 150,
    unidade: "kg",
    estoqueAtual: 22,
    estoqueMinimo: 40,
    aberta: "01/07",
    status: "aguardando",
    fornecedores: [
      { nome: "Laticínios Vale Verde", preco: null, prazo: null, frete: null, condicoes: null, formaPagamento: null, impostoIncluso: null, origemResposta: null },
      { nome: "Laticínios Serra Azul", preco: null, prazo: null, frete: null, condicoes: null, formaPagamento: null, impostoIncluso: null, origemResposta: null },
      { nome: "Queijaria Bom Sabor", preco: null, prazo: null, frete: null, condicoes: null, formaPagamento: null, impostoIncluso: null, origemResposta: null },
    ],
  },
];

function scoreFornecedor(f, quantidade = 1) {
  if (f.preco == null) return Infinity;
  return Number(f.preco) * Number(quantidade || 1) + Number(f.frete || 0);
}
function normalizeTxt(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function guessInsumoCod(xProd, estoqueItens) {
  const x = normalizeTxt(xProd);
  const match = estoqueItens.find(i => {
    const n = normalizeTxt(i.nome);
    return x.includes(n) || n.includes(x);
  });
  return match?.cod ?? "";
}

function parseNFeXML(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");
  if (xml.getElementsByTagName("parsererror").length) {
    throw new Error("XML inválido ou mal formatado.");
  }
  const getTag = (parent, tag) => parent?.getElementsByTagName(tag)?.[0]?.textContent ?? "";

  const emit = xml.getElementsByTagName("emit")[0];
  const fornecedor = emit ? getTag(emit, "xNome") : "";
  const cnpj = emit ? getTag(emit, "CNPJ") : "";

  const detEls = Array.from(xml.getElementsByTagName("det"));
  if (detEls.length === 0) throw new Error("Nenhum item (tag <det>) encontrado no XML.");

  const itens = detEls.map(det => {
    const prod = det.getElementsByTagName("prod")[0];
    return {
      cProd: getTag(prod, "cProd"),
      xProd: getTag(prod, "xProd"),
      qCom: parseFloat(getTag(prod, "qCom").replace(",", ".")) || 0,
      uCom: getTag(prod, "uCom"),
      vUnCom: parseFloat(getTag(prod, "vUnCom").replace(",", ".")) || 0,
    };
  });

  const total = xml.getElementsByTagName("ICMSTot")[0];
  const vNF = total ? parseFloat(getTag(total, "vNF").replace(",", ".")) || 0 : 0;

  const duplicatas = Array.from(xml.getElementsByTagName("dup")).map(d => ({
    nDup: getTag(d, "nDup"),
    dVenc: getTag(d, "dVenc"),
    vDup: parseFloat(getTag(d, "vDup").replace(",", ".")) || 0,
  }));

  const infNFe = xml.getElementsByTagName("infNFe")[0];
  const chaveRaw = infNFe?.getAttribute("Id") || "";
  const chave = chaveRaw.replace(/^NFe/, "");

  return { fornecedor, cnpj, itens, vNF, duplicatas, chave };
}

const cadeiaValor = [
  { label: "Compras", value: "R$ 15,3k", icon: Truck, sub: "4 pedidos abertos" },
  { label: "Estoque", value: "R$ 22,8k", icon: Boxes, sub: "48 insumos ativos" },
  { label: "Cozinha", value: "4 preparos", icon: ChefHat, sub: "2 em andamento" },
  { label: "Vendas", value: "R$ 101,4k", icon: Bike, sub: "este mês" },
  { label: "Financeiro", value: "R$ 3,1k", icon: Wallet, sub: "a receber (7d)" },
];

// ---------------------------------------------------------------------------

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "estoque", label: "Estoque", icon: Package },
  { key: "receitas", label: "Receitas de Produção", icon: FlaskConical },
  { key: "producao", label: "Cozinha / Preparo", icon: ChefHat },
  { key: "compras", label: "Compras", icon: Truck },
  { key: "usuarios", label: "Usuários", icon: Users },
  { key: "vendas", label: "Pedidos / Vendas", icon: ShoppingCart },
  { key: "entregas", label: "Motos / Entregas", icon: Bike },
  { key: "operacional", label: "Erros / Cancelamentos", icon: AlertTriangle },
  { key: "caixa", label: "Caixa / Turnos", icon: CircleDollarSign },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "financeiro", label: "Financeiro", icon: Wallet },
  { key: "relatorios", label: "Relatórios", icon: BarChart3 },
  { key: "usuarios", label: "Usuários", icon: UserCircle2 },
  { key: "integracoes", label: "Central de Importações", icon: Upload },
  { key: "config", label: "Configurações", icon: Settings },
];

const READY = ["dashboard", "estoque", "receitas", "producao", "vendas", "compras", "usuarios", "entregas", "operacional", "caixa", "financeiro", "relatorios", "integracoes", "config"];

function cx(...a) { return a.filter(Boolean).join(" "); }

function Badge({ tone = "slate", children }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    red: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    brand: "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300",
  };
  return <span className={cx("px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap", tones[tone])}>{children}</span>;
}

function Card({ className, children }) {
  return (
    <div className={cx(
      "rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
      "dark:border-slate-700/60 dark:bg-slate-800/60",
      className
    )}>
      {children}
    </div>
  );
}

function KPI({ label, value, delta, positive, icon: Icon }) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <Icon size={16} className="text-[#7A1420] dark:text-red-400" />
        </div>
      </div>
      <div className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{value}</div>
      <div className={cx("flex items-center gap-1 text-xs font-medium", positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
        {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        {delta}
      </div>
    </Card>
  );
}

function ValueChain() {
  return (
    <Card className="p-5 md:p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Cadeia de valor em tempo real</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rastreabilidade entre compras, estoque, cozinha, vendas e financeiro</p>
        </div>
        <Badge tone="brand">
          <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#7A1420] animate-pulse" /> ao vivo</span>
        </Badge>
      </div>
      <div className="flex items-center min-w-[720px]">
        {cadeiaValor.map((node, i) => (
          <React.Fragment key={node.label}>
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="relative w-12 h-12 rounded-xl bg-[#4A0A10] dark:bg-[#7A1420] flex items-center justify-center">
                <node.icon size={20} className="text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-800" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{node.value}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{node.label}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">{node.sub}</div>
              </div>
            </div>
            {i < cadeiaValor.length - 1 && (
              <div className="flex-1 h-px relative -mt-9 mx-1">
                <div className="absolute inset-0 border-t-2 border-dashed border-slate-200 dark:border-slate-600" />
                <div className="absolute inset-0 border-t-2 border-[#7A1420] origin-left animate-[flow_2.4s_linear_infinite]" style={{ width: "40%" }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <style>{`@keyframes flow { 0% { width: 0%; opacity: 0.9 } 90% { opacity: 0.9 } 100% { width: 100%; opacity: 0 } }`}</style>
    </Card>
  );
}

function Dashboard({ movs, estoqueItens }) {
  const valorEstoque = estoqueItens.reduce((total, item) => total + item.qtd * item.custo, 0);
  const itensAtencao = estoqueItens.filter(item => item.status !== "ok").slice(0, 3);
  return (
    <div className="flex flex-col gap-5">
      <ValueChain />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Valor em estoque" value={valorEstoque.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} delta={`${estoqueItens.length} itens cadastrados no SiChef`} positive icon={Boxes} />
        <KPI label="Faturamento (mês)" value="R$ 101.400" delta="+9,4% vs mês anterior" positive icon={TrendingUp} />
        <KPI label="Margem média" value="49,1%" delta="+1,8 p.p. vs mês anterior" positive icon={BarChart3} />
        <KPI label="Preparado hoje" value="204 porções" delta="Sexta e sábado em alta" positive icon={ChefHat} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Receita x Custo</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Últimos 6 meses, em milhares (R$)</p>
            </div>
            <Badge tone="slate">2026</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueTrend} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="rec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7A1420" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7A1420" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Area type="monotone" dataKey="custo" stroke="#94A3B8" fill="transparent" strokeWidth={2} strokeDasharray="4 3" />
              <Area type="monotone" dataKey="receita" stroke="#7A1420" fill="url(#rec)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Margem consolidada</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Custo vs. margem líquida</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={margemData} dataKey="value" innerRadius={52} outerRadius={72} paddingAngle={3}>
                {margemData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {margemData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.name} {d.value}%
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Últimas movimentações</h3>
            <button className="text-xs text-[#7A1420] dark:text-red-400 font-medium hover:underline">Ver todas</button>
          </div>
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700/60">
            {movs.slice(0, 4).map((m, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={cx("w-8 h-8 rounded-lg flex items-center justify-center",
                    m.tipo === "entrada" ? "bg-emerald-50 dark:bg-emerald-500/10" :
                    m.tipo === "saida" ? "bg-rose-50 dark:bg-rose-500/10" : "bg-red-50 dark:bg-red-500/10")}>
                    {m.tipo === "entrada" ? <ArrowDownRight size={14} className="text-emerald-600 dark:text-emerald-400" /> :
                     m.tipo === "saida" ? <ArrowUpRight size={14} className="text-rose-600 dark:text-rose-400" /> :
                     <ChefHat size={14} className="text-[#7A1420] dark:text-red-400" />}
                  </div>
                  <div>
                    <div className="text-sm text-slate-800 dark:text-slate-200">{m.desc}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1"><Clock size={10} /> {m.hora}</div>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.qtd}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Estoque a conferir</h3>
          </div>
          <div className="flex flex-col gap-3">
            {itensAtencao.length === 0 && <p className="text-xs text-emerald-600 dark:text-emerald-400">Nenhum item em situação crítica.</p>}
            {itensAtencao.map((e, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300">{e.nome}</span>
                  <span className="text-slate-400 text-xs">{e.qtd.toLocaleString("pt-BR")} {e.un}{e.min > 0 ? ` / mín. ${e.min}` : " · saldo inicial pendente"}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${e.min > 0 ? Math.min(100, (e.qtd / e.min) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function EstoqueSaldos({ itens, onMovimentar, onXml, onAtualizarMinimo, onAcertarEstoque, onExcluirItem, onCadastrarItem }) {
  const [q, setQ] = useState("");
  const [minimosEdicao, setMinimosEdicao] = useState({});
  const [salvandoMinimo, setSalvandoMinimo] = useState(null);
  const [feedbackItem, setFeedbackItem] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);
  const [acertoItem, setAcertoItem] = useState(null);
  const [quantidadeContada, setQuantidadeContada] = useState("");
  const [salvandoAcerto, setSalvandoAcerto] = useState(false);
  const [itemExcluir, setItemExcluir] = useState(null);
  const [excluindoItem, setExcluindoItem] = useState(false);
  const [novoItemAberto, setNovoItemAberto] = useState(false);
  const [novoItem, setNovoItem] = useState({ codigo: "", nome: "", categoria: "", unidade: "un", quantidade: "0", minimo: "0", custo: "0" });
  const [salvandoNovoItem, setSalvandoNovoItem] = useState(false);
  const filtered = useMemo(() =>
    itens.filter(p => p.nome.toLowerCase().includes(q.toLowerCase()) || p.cod.toLowerCase().includes(q.toLowerCase())),
  [q, itens]);
  const valorTotal = useMemo(() => itens.reduce((total, item) => total + item.qtd * item.custo, 0), [itens]);

  const statusTone = { ok: "green", atencao: "amber", baixo: "amber", critico: "red", pendente: "slate" };
  const statusLabel = { ok: "Normal", atencao: "Atenção", baixo: "Baixo", critico: "Crítico", pendente: "Mínimo não definido" };

  function abrirAcerto(item) {
    setAcertoItem(item);
    setQuantidadeContada(String(item.qtd).replace(".", ","));
    setMenuAberto(null);
    setFeedbackItem(null);
  }

  async function salvarAcerto(e) {
    e.preventDefault();
    const quantidade = Number(String(quantidadeContada).replace(",", "."));
    if (!Number.isFinite(quantidade) || quantidade < 0) {
      setFeedbackItem({ tone: "red", text: "Informe uma quantidade contada válida, igual ou maior que zero." });
      return;
    }
    setSalvandoAcerto(true);
    try {
      const resultado = await onAcertarEstoque(acertoItem.cod, quantidade);
      setFeedbackItem(resultado);
      if (resultado.tone === "green") {
        setAcertoItem(null);
        setQuantidadeContada("");
      }
    } finally {
      setSalvandoAcerto(false);
    }
  }
  async function confirmarExclusaoItem() {
    setExcluindoItem(true);
    try {
      const resultado = await onExcluirItem(itemExcluir.cod);
      setFeedbackItem(resultado);
      if (resultado.tone === "green") setItemExcluir(null);
    } finally {
      setExcluindoItem(false);
    }
  }
  async function salvarMinimo(item) {
    const minimo = Number(String(minimosEdicao[item.cod] ?? item.min ?? "").replace(",", "."));
    if (!Number.isFinite(minimo) || minimo < 0) {
      setFeedbackItem({ tone: "red", text: "Informe um estoque mínimo válido, igual ou maior que zero." });
      return;
    }
    setSalvandoMinimo(item.cod);
    try {
      const resultado = await onAtualizarMinimo(item.cod, minimo);
      setFeedbackItem(resultado);
      if (resultado.tone === "green") {
        setMinimosEdicao(prev => {
          const proximo = { ...prev };
          delete proximo[item.cod];
          return proximo;
        });
      }
    } finally {
      setSalvandoMinimo(null);
    }
  }

  async function salvarNovoItemEstoque(e) {
    e.preventDefault();
    if (novoItem.nome.trim().length < 2 || !novoItem.categoria.trim()) {
      setFeedbackItem({ tone: "red", text: "Informe nome e categoria do item." });
      return;
    }
    const numero = valor => Number(String(valor || "0").replace(",", ".")) || 0;
    setSalvandoNovoItem(true);
    try {
      const resultado = await onCadastrarItem({
        codigo: novoItem.codigo.trim(),
        nome: novoItem.nome.trim(),
        categoria: novoItem.categoria.trim(),
        unidade: novoItem.unidade,
        quantidade: numero(novoItem.quantidade),
        estoqueMinimo: numero(novoItem.minimo),
        custoUnitario: numero(novoItem.custo),
      });
      setFeedbackItem(resultado);
      if (resultado.tone === "green") {
        setNovoItem({ codigo: "", nome: "", categoria: "", unidade: "un", quantidade: "0", minimo: "0", custo: "0" });
        setNovoItemAberto(false);
      }
    } finally {
      setSalvandoNovoItem(false);
    }
  }
  function editarMinimo(item) {
    setMinimosEdicao(prev => ({ ...prev, [item.cod]: prev[item.cod] ?? item.min ?? 0 }));
    setMenuAberto(null);
    setTimeout(() => document.getElementById("minimo-" + item.cod)?.focus(), 0);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Estoque</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{itens.length} itens ativos · {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} em valor total</p>
        </div>
        <div className="flex flex-wrap gap-2"><button onClick={() => setNovoItemAberto(true)} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"><Plus size={15} /> Novo item</button><button onClick={onXml} className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium px-4 py-2 rounded-xl"><FileCode2 size={15} /> Entrada por XML</button><button onClick={() => onMovimentar()} className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"><Plus size={15} /> Entrada / saída</button></div>
      </div>

      {novoItemAberto && <Card className="p-5 border-emerald-200 dark:border-emerald-500/30"><div className="mb-4"><h3 className="font-semibold text-slate-900 dark:text-white">Adicionar item ao estoque</h3><p className="text-xs text-slate-400 mt-1">O item ficará disponível imediatamente para Estoque, Compras e fichas técnicas.</p></div><form onSubmit={salvarNovoItemEstoque} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><label className="text-xs text-slate-500">Código (opcional)<input value={novoItem.codigo} onChange={e => setNovoItem(prev => ({ ...prev, codigo: e.target.value }))} placeholder="Automático" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800" /></label><label className="text-xs text-slate-500 sm:col-span-2">Nome do item<input autoFocus required value={novoItem.nome} onChange={e => setNovoItem(prev => ({ ...prev, nome: e.target.value }))} placeholder="Ex.: Queijo mussarela" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800" /></label><label className="text-xs text-slate-500">Categoria<input required value={novoItem.categoria} onChange={e => setNovoItem(prev => ({ ...prev, categoria: e.target.value }))} placeholder="Ex.: Composição" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800" /></label><label className="text-xs text-slate-500">Unidade<select value={novoItem.unidade} onChange={e => setNovoItem(prev => ({ ...prev, unidade: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800"><option value="un">Unidade (un)</option><option value="kg">Quilograma (kg)</option><option value="g">Grama (g)</option><option value="l">Litro (l)</option><option value="ml">Mililitro (ml)</option><option value="cx">Caixa (cx)</option></select></label><label className="text-xs text-slate-500">Saldo inicial<input inputMode="decimal" value={novoItem.quantidade} onChange={e => setNovoItem(prev => ({ ...prev, quantidade: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800" /></label><label className="text-xs text-slate-500">Estoque mínimo<input inputMode="decimal" value={novoItem.minimo} onChange={e => setNovoItem(prev => ({ ...prev, minimo: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800" /></label><label className="text-xs text-slate-500">Custo unitário (R$)<input inputMode="decimal" value={novoItem.custo} onChange={e => setNovoItem(prev => ({ ...prev, custo: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800" /></label><div className="flex items-end justify-end gap-2 sm:col-span-2 xl:col-span-4"><button type="button" onClick={() => setNovoItemAberto(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-600">Cancelar</button><button disabled={salvandoNovoItem} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{salvandoNovoItem ? "Salvando..." : "Cadastrar item"}</button></div></form></Card>}
      {acertoItem && <Card className="p-5 border-sky-200 dark:border-sky-500/30"><div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"><div><div className="flex items-center gap-2"><ScanLine size={18} className="text-sky-600" /><h3 className="font-semibold text-slate-900 dark:text-white">Acerto de estoque</h3></div><p className="text-xs text-slate-400 mt-1">{acertoItem.nome} · saldo do sistema: {acertoItem.qtd.toLocaleString("pt-BR")} {acertoItem.un}</p></div><form onSubmit={salvarAcerto} className="flex flex-col sm:flex-row sm:items-end gap-3"><label className="text-xs text-slate-500">Quantidade contada no inventário<input autoFocus inputMode="decimal" value={quantidadeContada} onChange={e => setQuantidadeContada(e.target.value)} className="mt-1 w-full sm:w-52 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label><div className="text-xs text-slate-500 sm:pb-3">Diferença: {(Number(String(quantidadeContada).replace(",", ".")) - acertoItem.qtd || 0).toLocaleString("pt-BR")} {acertoItem.un}</div><button type="button" onClick={() => setAcertoItem(null)} className="rounded-xl border border-slate-200 dark:border-slate-600 text-sm px-4 py-2.5">Cancelar</button><button disabled={salvandoAcerto} className="rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5">{salvandoAcerto ? "Salvando..." : "Confirmar acerto"}</button></form></div></Card>}
      {itemExcluir && <Card className="p-5 border-rose-200 dark:border-rose-500/30"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h3 className="font-semibold text-rose-700 dark:text-rose-300">Excluir item do estoque?</h3><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{itemExcluir.nome} · {itemExcluir.cod}. Esta ação também remove o produto ligado ao catálogo. Itens usados em fichas técnicas serão protegidos.</p></div><div className="flex gap-2"><button type="button" onClick={() => setItemExcluir(null)} className="rounded-xl border border-slate-200 dark:border-slate-600 text-sm px-4 py-2.5">Cancelar</button><button type="button" disabled={excluindoItem} onClick={confirmarExclusaoItem} className="rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5">{excluindoItem ? "Excluindo..." : "Confirmar exclusão"}</button></div></div></Card>}
      <Card className="p-4">
        {feedbackItem && <div className={cx("mb-4 rounded-xl border px-3 py-2 text-sm", feedbackItem.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300")}>{feedbackItem.text}</div>}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nome ou código..." className="bg-transparent outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
          </div>
          <button className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm px-3.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40"><Filter size={14} /> Filtros</button>
        </div>

        <div className="overflow-x-auto -mx-4">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                <th className="py-2.5 px-4 font-medium">Código</th>
                <th className="py-2.5 px-4 font-medium">Insumo</th>
                <th className="py-2.5 px-4 font-medium">Categoria</th>
                <th className="py-2.5 px-4 font-medium text-right">Qtd.</th>
                <th className="py-2.5 px-4 font-medium">Estoque mínimo</th>
                <th className="py-2.5 px-4 font-medium">Un.</th>
                <th className="py-2.5 px-4 font-medium text-right">Custo</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.cod} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                  <td className="py-3 px-4 text-slate-400 font-mono text-xs">{p.cod}</td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">{p.nome}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{p.cat}</td>
                  <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">{p.qtd.toLocaleString("pt-BR")}</td>
                  <td className="py-3 px-4">{Object.prototype.hasOwnProperty.call(minimosEdicao, p.cod) ? <div className="flex items-center gap-2"><input id={"minimo-" + p.cod} inputMode="decimal" aria-label={"Estoque mínimo de " + p.nome} value={minimosEdicao[p.cod] ?? ""} onChange={e => setMinimosEdicao(prev => ({ ...prev, [p.cod]: e.target.value }))} className="w-20 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-right text-sm" /><button type="button" disabled={salvandoMinimo === p.cod} onClick={() => salvarMinimo(p)} className="rounded-lg border border-[#7A1420] text-[#7A1420] disabled:opacity-40 text-xs font-medium px-2.5 py-1.5">{salvandoMinimo === p.cod ? "..." : "Confirmar"}</button><button type="button" onClick={() => setMinimosEdicao(prev => { const proximo = { ...prev }; delete proximo[p.cod]; return proximo; })} className="text-xs text-slate-400">Cancelar</button></div> : Number(p.min) > 0 ? <span className="font-medium text-slate-700 dark:text-slate-200">{Number(p.min).toLocaleString("pt-BR")}</span> : <span className="text-xs text-slate-400">Não definido</span>}</td>
                  <td className="py-3 px-4 text-slate-400">{p.un}</td>
                  <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">{Number(p.custo || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                  <td className="py-3 px-4"><Badge tone={statusTone[statusFor(p.qtd, p.min)]}>{statusLabel[statusFor(p.qtd, p.min)]}</Badge></td>
                  <td className="py-3 px-4 text-right relative"><button type="button" aria-label={"Ações de " + p.nome} onClick={() => setMenuAberto(menuAberto === p.cod ? null : p.cod)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"><MoreHorizontal size={16} className="text-slate-500" /></button>{menuAberto === p.cod && <div className="absolute z-30 right-4 top-10 w-48 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl p-1 text-left"><button type="button" onClick={() => editarMinimo(p)} className="w-full rounded-lg px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700">Editar estoque mínimo</button><button type="button" onClick={() => abrirAcerto(p)} className="w-full rounded-lg px-3 py-2 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-500/10">Acerto de estoque</button><button type="button" onClick={() => { setMenuAberto(null); setItemExcluir(p); setFeedbackItem(null); }} className="w-full rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">Excluir item</button><button type="button" onClick={() => { setMenuAberto(null); onMovimentar(p.cod); }} className="w-full rounded-lg px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700">Movimentar item</button></div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
          <span>Mostrando {filtered.length} de {itens.length} insumos</span>
          <div className="flex gap-1">{[1, 2, 3].map(n => <button key={n} className={cx("w-7 h-7 rounded-lg", n === 1 ? "bg-[#7A1420] text-white" : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500")}>{n}</button>)}</div>
        </div>
      </Card>
    </div>
  );
}
function MovimentacaoEstoqueManual({ itens, historico, onRegistrar, codigoInicial }) {
  const itemInicial = itens.find(i => i.cod === codigoInicial) || itens[0];
  const [tipo, setTipo] = useState("entrada");
  const [cod, setCod] = useState(itemInicial?.cod ?? "");
  const [quantidade, setQuantidade] = useState("");
  const [custo, setCusto] = useState(String(itemInicial?.custo ?? 0).replace(".", ","));
  const [motivo, setMotivo] = useState("");
  const [responsavel, setResponsavel] = useState("Alana");
  const [feedback, setFeedback] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const item = itens.find(i => i.cod === cod);
  const numero = valor => Number(String(valor || "").replace(",", ".")) || 0;

  useEffect(() => {
    if (!codigoInicial) return;
    const selecionado = itens.find(i => i.cod === codigoInicial);
    if (selecionado) {
      setCod(selecionado.cod);
      setCusto(String(selecionado.custo ?? 0).replace(".", ","));
    }
  }, [codigoInicial]);

  function selecionarProduto(codigo) {
    setCod(codigo);
    const selecionado = itens.find(i => i.cod === codigo);
    setCusto(String(selecionado?.custo ?? 0).replace(".", ","));
  }

  async function registrar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const resultado = await onRegistrar({ tipo, cod, quantidade: numero(quantidade), custo: tipo === "entrada" ? numero(custo) : null, motivo: motivo.trim(), responsavel: responsavel.trim() });
      setFeedback(resultado);
      if (resultado.tone === "green") {
        setQuantidade("");
        setMotivo("");
      }
    } finally {
      setSalvando(false);
    }
  }

  return <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4">
    <Card className="p-5">
      <div className="mb-4"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Movimentar estoque</h3><p className="text-xs text-slate-400 mt-0.5">Entradas e saídas ficam registradas com motivo, responsável e custo</p></div>
      {feedback && <div className={cx("mb-4 rounded-xl border px-3 py-2 text-sm", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300")}>{feedback.text}</div>}
      <form onSubmit={registrar} className="flex flex-col gap-3">
        <label className="text-xs text-slate-500">Tipo<select value={tipo} onChange={e => setTipo(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm"><option value="entrada">Entrada</option><option value="saida">Saída</option></select></label>
        <label className="text-xs text-slate-500">Produto<select value={cod} onChange={e => selecionarProduto(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm">{itens.map(i => <option key={i.cod} value={i.cod}>{i.nome} · {i.qtd.toLocaleString("pt-BR")} {i.un}</option>)}</select></label>
        <label className="text-xs text-slate-500">Quantidade ({item?.un ?? "un"})<input inputMode="decimal" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="0" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label>
        {tipo === "entrada" && <label className="text-xs text-slate-500">Preço de custo unitário (R$)<input inputMode="decimal" value={custo} onChange={e => setCusto(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /><span className="block mt-1 text-[11px] text-slate-400">Este valor atualizará o custo atual do item.</span></label>}
        <label className="text-xs text-slate-500">Motivo<input value={motivo} onChange={e => setMotivo(e.target.value)} placeholder={tipo === "entrada" ? "Compra, devolução, ajuste..." : "Perda, consumo, ajuste..."} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs text-slate-500">Responsável<input value={responsavel} onChange={e => setResponsavel(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label>
        <button disabled={salvando} className={cx("rounded-xl text-white text-sm font-medium px-5 py-2.5 disabled:opacity-50", tipo === "entrada" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#7A1420] hover:bg-[#611018]")}>{salvando ? "Salvando..." : tipo === "entrada" ? "Confirmar entrada" : "Confirmar saída"}</button>
      </form>
    </Card>
    <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Histórico manual</h3><p className="text-xs text-slate-400 mt-0.5">Auditoria das alterações realizadas nesta tela</p></div>{historico.length ? <div className="overflow-x-auto"><table className="w-full text-sm min-w-[820px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Hora</th><th className="py-2.5 px-4 font-medium">Tipo</th><th className="py-2.5 px-4 font-medium">Produto</th><th className="py-2.5 px-4 font-medium text-right">Quantidade</th><th className="py-2.5 px-4 font-medium text-right">Custo unit.</th><th className="py-2.5 px-4 font-medium">Motivo</th><th className="py-2.5 px-4 font-medium">Responsável</th></tr></thead><tbody>{historico.map(h => <tr key={h.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 text-slate-400">{h.hora}</td><td className="py-3 px-4"><Badge tone={h.tipo === "ajuste" ? "amber" : h.tipo === "entrada" ? "green" : "red"}>{h.tipo === "ajuste" ? "Acerto" : h.tipo === "entrada" ? "Entrada" : "Saída"}</Badge></td><td className="py-3 px-4 font-medium">{h.nome}</td><td className={cx("py-3 px-4 text-right font-medium", h.tipo === "ajuste" ? "text-sky-600" : h.tipo === "entrada" ? "text-emerald-600" : "text-rose-600")}>{h.tipo === "ajuste" ? h.saldoAnterior.toLocaleString("pt-BR") + " → " + h.saldoPosterior.toLocaleString("pt-BR") + " " + h.un : (h.tipo === "entrada" ? "+" : "−") + h.quantidade.toLocaleString("pt-BR") + " " + h.un}</td><td className="py-3 px-4 text-right text-slate-500">{h.custo == null ? "—" : Number(h.custo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td><td className="py-3 px-4 text-slate-500">{h.motivo}</td><td className="py-3 px-4 text-slate-500">{h.responsavel}</td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-sm text-slate-400">Nenhuma movimentação manual registrada.</div>}</Card>
  </div>;
}
function Estoque({ itens, onMovimentar, historicoMovimentos, onRegistrarXml, historicoXml, onAtualizarMinimo, onAcertarEstoque, onExcluirItem, onCadastrarItem }) {
  const [tab, setTab] = useState("saldos");
  const [codigoMovimentacao, setCodigoMovimentacao] = useState("");
  return <div className="flex flex-col gap-4">
    <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">{[["saldos", "Saldos"], ["manual", "Entrada / saída manual"], ["xml", "Entrada por XML NF-e"]].map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={cx("px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap", tab === key ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>{label}</button>)}</div>
    {tab === "saldos" && <EstoqueSaldos itens={itens} onMovimentar={codigo => { setCodigoMovimentacao(codigo || ""); setTab("manual"); }} onXml={() => setTab("xml")} onAtualizarMinimo={onAtualizarMinimo} onAcertarEstoque={onAcertarEstoque} onExcluirItem={onExcluirItem} onCadastrarItem={onCadastrarItem} />}
    {tab === "manual" && <MovimentacaoEstoqueManual itens={itens} historico={historicoMovimentos} onRegistrar={onMovimentar} codigoInicial={codigoMovimentacao} />}
    {tab === "xml" && <EntradaXML estoqueItens={itens} onRegistrar={onRegistrarXml} historico={historicoXml} />}
  </div>;
}

function custoDaComposicao(composicao, estoqueItens) {
  return composicao.reduce((total, insumo) => {
    const item = estoqueItens.find(i => i.cod === insumo.cod);
    return total + (item?.custo ?? 0) * insumo.qtd;
  }, 0);
}

function Receitas({ receitas, produtos, categorias, fichas, estoqueItens, onCadastrarItem, onAtualizarItem, onExcluirProduto, onSalvarProduto, onSalvarCategoria, onSalvarFicha }) {
  const [tab, setTab] = useState("produtos");
  const [selecionado, setSelecionado] = useState(receitas[0]?.id ?? "");
  const [buscaProduto, setBuscaProduto] = useState("");
  const [produtoForm, setProdutoForm] = useState({ id: null, nome: "", categoria: "", preco: "", estoqueCod: "", ativo: true });
  const [novoItem, setNovoItem] = useState({ codigo: "", nome: "", categoria: "", unidade: "un", quantidade: "0", minimo: "0", custo: "0", venda: true, precoVenda: "" });
  const [salvandoItem, setSalvandoItem] = useState(false);
  const [itemEditandoCod, setItemEditandoCod] = useState(null);
  const [menuProdutoAberto, setMenuProdutoAberto] = useState(null);
  const [produtoExcluir, setProdutoExcluir] = useState(null);
  const [excluindoProduto, setExcluindoProduto] = useState(false);
  const [categoriaForm, setCategoriaForm] = useState({ id: null, nome: "", ativo: true });
  const [fichaEditandoId, setFichaEditandoId] = useState(null);
  const [produtoFichaId, setProdutoFichaId] = useState(produtos[0]?.id ?? "");
  const [nomeSichef, setNomeSichef] = useState("");
  const [insumoCod, setInsumoCod] = useState(estoqueItens[0]?.cod ?? "");
  const [qtdInsumo, setQtdInsumo] = useState("");
  const [insumosFicha, setInsumosFicha] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const numero = valor => Number(String(valor || "").replace(",", ".")) || 0;
  const dinheiro = valor => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const receitaAtual = receitas.find(r => r.id === selecionado) ?? receitas[0];
  const produtoFicha = produtos.find(produto => produto.id === produtoFichaId);
  const produtosFiltrados = produtos.filter(produto => normalizeTxt(produto.nome + " " + produto.categoria).includes(normalizeTxt(buscaProduto)));
  const fichaDoProduto = produto => fichas.find(ficha => ficha.produtoId === produto.id || normalizeTxt(ficha.prato) === normalizeTxt(produto.nome));
  const produtosElegiveisFicha = fichaEditandoId ? produtos : produtos.filter(produto => !fichaDoProduto(produto));
  const categoriasDisponiveis = categorias.filter(categoria => categoria.ativo !== false || categoria.nome === produtoForm.categoria);

  function abrirNovoItem() {
    setItemEditandoCod(null);
    setMenuProdutoAberto(null);
    setProdutoForm({ id: null, nome: "", categoria: "", preco: "", estoqueCod: "", ativo: true });
    setNovoItem({ codigo: "", nome: "", categoria: categorias.find(categoria => categoria.ativo !== false)?.nome || "", unidade: "un", quantidade: "0", minimo: "0", custo: "0", venda: true, precoVenda: "" });
    setTab("novo_item");
    setFeedback(null);
  }

  function editarProduto(produto) {
    setItemEditandoCod(null);
    setMenuProdutoAberto(null);
    setProdutoForm({ id: produto.id, nome: produto.nome, categoria: produto.categoria, preco: String(produto.preco || "").replace(".", ","), estoqueCod: produto.estoqueCod || "", ativo: produto.ativo !== false });
    setTab("novo_item");
    setFeedback({ tone: "amber", text: "Editando o produto " + produto.nome + "." });
  }

  function editarItem(produto) {
    const item = estoqueItens.find(estoque => estoque.cod === produto.estoqueCod);
    if (!item) {
      setMenuProdutoAberto(null);
      setFeedback({ tone: "red", text: "Este produto ainda não está vinculado a um item do estoque." });
      return;
    }
    setItemEditandoCod(item.cod);
    setMenuProdutoAberto(null);
    setProdutoForm({ id: produto.id, nome: produto.nome, categoria: produto.categoria, preco: String(produto.preco || "").replace(".", ","), estoqueCod: item.cod, ativo: produto.ativo !== false });
    setNovoItem({ codigo: item.cod, nome: item.nome, categoria: item.cat, unidade: item.un, quantidade: String(item.qtd).replace(".", ","), minimo: String(item.min).replace(".", ","), custo: String(item.custo).replace(".", ","), venda: produto.ativo !== false, precoVenda: String(produto.preco || "").replace(".", ",") });
    setTab("novo_item");
    setFeedback({ tone: "amber", text: "Editando o item " + item.nome + ". As alterações serão sincronizadas com o catálogo." });
  }
  async function confirmarExclusaoProduto() {
    setExcluindoProduto(true);
    try {
      const resultado = await onExcluirProduto(produtoExcluir.id);
      setFeedback(resultado);
      if (resultado.tone === "green") setProdutoExcluir(null);
    } finally {
      setExcluindoProduto(false);
    }
  }
  async function salvarNovoItem(e) {
    e.preventDefault();
    if (novoItem.nome.trim().length < 2) {
      setFeedback({ tone: "red", text: "Informe o nome do item." });
      return;
    }
    if (!novoItem.categoria) {
      setFeedback({ tone: "red", text: "Selecione a categoria do item." });
      return;
    }
    const dadosEstoque = {
      nome: novoItem.nome.trim(),
      categoria: novoItem.categoria,
      unidade: novoItem.unidade,
      quantidade: numero(novoItem.quantidade),
      estoqueMinimo: numero(novoItem.minimo),
      custoUnitario: numero(novoItem.custo),
    };
    setSalvandoItem(true);
    try {
      const resultadoEstoque = itemEditandoCod
        ? await onAtualizarItem(itemEditandoCod, dadosEstoque)
        : await onCadastrarItem({ codigo: novoItem.codigo.trim(), ...dadosEstoque });
      if (resultadoEstoque.tone !== "green") {
        setFeedback(resultadoEstoque);
        return;
      }
      const itemSalvo = resultadoEstoque.item;
      if (itemEditandoCod && produtoForm.id) {
        const resultadoProduto = await onSalvarProduto({
          id: produtoForm.id,
          nome: itemSalvo?.nome || novoItem.nome.trim(),
          categoria: itemSalvo?.cat || novoItem.categoria,
          preco: numero(novoItem.precoVenda),
          estoqueCod: itemEditandoCod,
          ativo: novoItem.venda,
        });
        if (resultadoProduto.tone !== "green") {
          setFeedback({ tone: "amber", text: resultadoEstoque.text + " Porém, o catálogo informou: " + resultadoProduto.text });
          return;
        }
      } else if (novoItem.venda) {
        const resultadoProduto = await onSalvarProduto({
          id: null,
          nome: itemSalvo?.nome || novoItem.nome.trim(),
          categoria: itemSalvo?.cat || novoItem.categoria,
          preco: numero(novoItem.precoVenda),
          estoqueCod: itemSalvo?.cod || novoItem.codigo.trim().toUpperCase(),
          ativo: true,
        });
        if (resultadoProduto.tone !== "green") {
          setFeedback({ tone: "amber", text: resultadoEstoque.text + " Porém, o catálogo informou: " + resultadoProduto.text });
          return;
        }
      }
      setFeedback({ tone: "green", text: itemEditandoCod ? resultadoEstoque.text : resultadoEstoque.text + (novoItem.venda ? " Também foi incluído no catálogo, sem exigir ficha técnica." : "") });
      setItemEditandoCod(null);
      setProdutoForm({ id: null, nome: "", categoria: "", preco: "", estoqueCod: "", ativo: true });
      setNovoItem({ codigo: "", nome: "", categoria: categorias.find(categoria => categoria.ativo !== false)?.nome || "", unidade: "un", quantidade: "0", minimo: "0", custo: "0", venda: true, precoVenda: "" });
      setTab("produtos");
    } finally {
      setSalvandoItem(false);
    }
  }

  async function salvarProduto(e) {
    e.preventDefault();
    const resultado = await onSalvarProduto({ ...produtoForm, nome: produtoForm.nome.trim(), preco: numero(produtoForm.preco) });
    setFeedback(resultado);
    if (resultado.tone === "green") {
      setProdutoForm({ id: null, nome: "", categoria: "", preco: "", estoqueCod: "", ativo: true });
      setTab("produtos");
    }
  }

  function abrirNovaCategoria() {
    setCategoriaForm({ id: null, nome: "", ativo: true });
    setTab("categorias");
    setFeedback(null);
  }

  function editarCategoria(categoria) {
    setCategoriaForm({ id: categoria.id, nome: categoria.nome, ativo: categoria.ativo !== false });
    setTab("categorias");
    setFeedback({ tone: "amber", text: "Editando a categoria " + categoria.nome + "." });
  }

  function salvarCategoria(e) {
    e.preventDefault();
    const resultado = onSalvarCategoria({ ...categoriaForm, nome: categoriaForm.nome.trim() });
    setFeedback(resultado);
    if (resultado.tone === "green") setCategoriaForm({ id: null, nome: "", ativo: true });
  }

  function abrirNovaFicha() {
    const candidato = produtos.find(produto => !fichaDoProduto(produto));
    setFichaEditandoId(null);
    setProdutoFichaId(candidato?.id || "");
    setNomeSichef("");
    setInsumosFicha([]);
    setTab("editor_ficha");
    setFeedback(candidato ? null : { tone: "amber", text: "Todos os produtos cadastrados já possuem ficha técnica." });
  }

  function editarFicha(ficha) {
    const produto = produtos.find(item => item.id === ficha.produtoId) || produtos.find(item => normalizeTxt(item.nome) === normalizeTxt(ficha.prato));
    setFichaEditandoId(ficha.id);
    setProdutoFichaId(produto?.id || "");
    setNomeSichef(ficha.nomeSichef || "");
    setInsumosFicha(ficha.insumos.map(item => ({ ...item })));
    setTab("editor_ficha");
    setFeedback({ tone: "amber", text: "Editando a ficha técnica de " + ficha.prato + "." });
  }

  function adicionarInsumoFicha() {
    const item = estoqueItens.find(i => i.cod === insumoCod);
    const quantidade = numero(qtdInsumo);
    if (!item || quantidade <= 0) {
      setFeedback({ tone: "red", text: "Selecione o insumo e informe uma quantidade maior que zero." });
      return;
    }
    setInsumosFicha(prev => {
      const existente = prev.find(i => i.cod === item.cod);
      return existente ? prev.map(i => i.cod === item.cod ? { ...i, qtd: i.qtd + quantidade } : i) : [...prev, { cod: item.cod, nome: item.nome, qtd: quantidade, un: item.un }];
    });
    setQtdInsumo("");
    setFeedback(null);
  }

  function salvarFicha(e) {
    e.preventDefault();
    if (!produtoFicha) {
      setFeedback({ tone: "red", text: "Selecione o produto da ficha técnica." });
      return;
    }
    const resultado = onSalvarFicha({
      id: fichaEditandoId,
      produtoId: produtoFicha.id,
      prato: produtoFicha.nome,
      categoria: produtoFicha.categoria,
      nomeSichef: nomeSichef.trim(),
      preco: produtoFicha.preco,
      insumos: insumosFicha,
    });
    setFeedback(resultado);
    if (resultado.tone === "green") {
      setFichaEditandoId(null);
      setInsumosFicha([]);
      setNomeSichef("");
      setTab("fichas");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Produtos, categorias e fichas técnicas</h2><p className="text-sm text-slate-500 dark:text-slate-400">O produto é cadastrado primeiro. A ficha técnica só é criada quando houver composição.</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={abrirNovaCategoria} className="flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium px-4 py-2 rounded-xl"><Plus size={15} /> Nova categoria</button><button onClick={abrirNovoItem} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl"><Plus size={15} /> Novo item</button><button onClick={abrirNovaFicha} className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2 rounded-xl"><Plus size={15} /> Nova ficha</button></div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {[["produtos", "Produtos"], ["novo_item", itemEditandoCod ? "Editar item" : produtoForm.id ? "Editar produto" : "Adicionar item"], ["categorias", "Categorias"], ["fichas", "Fichas técnicas"], ["editor_ficha", fichaEditandoId ? "Editar ficha" : "Cadastrar ficha"], ["producao", "Receitas de produção"]].map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={cx("px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap", tab === key ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>{label}</button>)}
      </div>

      {feedback && <div className={cx("rounded-xl border px-4 py-3 text-sm", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300")}>{feedback.text}</div>}

      {produtoExcluir && <Card className="p-5 border-rose-200 dark:border-rose-500/30"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h3 className="font-semibold text-rose-700 dark:text-rose-300">Excluir item do catálogo?</h3><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{produtoExcluir.nome}. Se houver estoque direto, o item também será removido do estoque. Produtos com ficha técnica serão protegidos.</p></div><div className="flex gap-2"><button type="button" onClick={() => setProdutoExcluir(null)} className="rounded-xl border border-slate-200 dark:border-slate-600 text-sm px-4 py-2.5">Cancelar</button><button type="button" disabled={excluindoProduto} onClick={confirmarExclusaoProduto} className="rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5">{excluindoProduto ? "Excluindo..." : "Confirmar exclusão"}</button></div></div></Card>}
      {tab === "produtos" && <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h3 className="font-semibold text-slate-900 dark:text-white">Catálogo de produtos</h3><p className="text-xs text-slate-400">{produtos.length} produtos · {fichas.length} com ficha técnica · {produtos.filter(produto => !fichaDoProduto(produto)).length} sem ficha</p></div><div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2"><Search size={14} className="text-slate-400" /><input value={buscaProduto} onChange={e => setBuscaProduto(e.target.value)} placeholder="Buscar produto..." className="bg-transparent outline-none text-sm w-48" /></div></div><div className="overflow-x-auto"><table className="w-full text-sm min-w-[860px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Código</th><th className="py-2.5 px-4 font-medium">Produto</th><th className="py-2.5 px-4 font-medium">Categoria</th><th className="py-2.5 px-4 font-medium text-right">Preço</th><th className="py-2.5 px-4 font-medium">Estoque</th><th className="py-2.5 px-4 font-medium">Ficha técnica</th><th className="py-2.5 px-4 font-medium">Status</th><th className="py-2.5 px-4"></th></tr></thead><tbody>{produtosFiltrados.map(produto => { const itemEstoque = estoqueItens.find(item => item.cod === produto.estoqueCod); const ficha = fichaDoProduto(produto); return <tr key={produto.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-mono text-xs text-slate-400">{produto.id}</td><td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{produto.nome}</td><td className="py-3 px-4 text-slate-500">{produto.categoria}</td><td className="py-3 px-4 text-right font-medium">{produto.preco > 0 ? dinheiro(produto.preco) : "A definir"}</td><td className="py-3 px-4 text-slate-500">{itemEstoque ? <div><div className="text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Estoque direto</div><div className="font-medium text-slate-700 dark:text-slate-200">{itemEstoque.qtd.toLocaleString("pt-BR")} {itemEstoque.un}</div><div className="text-[11px] text-slate-400">Mín. {Number(itemEstoque.min || 0).toLocaleString("pt-BR")} · custo {dinheiro(itemEstoque.custo)}</div></div> : ficha ? <div><div className="text-xs font-medium text-sky-700 dark:text-sky-300">Baixa pela ficha técnica</div><div className="text-[11px] text-slate-400">{ficha.insumos.length} insumo(s) controlado(s)</div></div> : <Badge tone="amber">Estoque não configurado</Badge>}</td><td className="py-3 px-4"><Badge tone={ficha ? "green" : "slate"}>{ficha ? "Com ficha" : "Sem ficha"}</Badge></td><td className="py-3 px-4"><Badge tone={produto.ativo !== false ? "green" : "slate"}>{produto.ativo !== false ? "Ativo" : "Inativo"}</Badge></td><td className="py-3 px-4 text-right"><div className="relative inline-block"><button type="button" aria-label={"Ações de " + produto.nome} onClick={() => setMenuProdutoAberto(menuProdutoAberto === produto.id ? null : produto.id)} className="rounded-lg border border-slate-200 dark:border-slate-600 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700"><MoreHorizontal size={17} className="text-slate-500" /></button>{menuProdutoAberto === produto.id && <div className="absolute z-40 right-0 top-9 w-48 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl p-1 text-left">{itemEstoque ? <button type="button" onClick={() => editarItem(produto)} className="w-full rounded-lg px-3 py-2 text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-500/10">Editar item</button> : <div className="px-3 py-2 text-[11px] text-slate-400">{ficha ? "Estoque controlado pela ficha técnica" : "Estoque ainda não configurado"}</div>}<button type="button" onClick={() => editarProduto(produto)} className="w-full rounded-lg px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700">Editar produto</button>{ficha && <button type="button" onClick={() => { setMenuProdutoAberto(null); editarFicha(ficha); }} className="w-full rounded-lg px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700">Editar ficha técnica</button>}<button type="button" onClick={() => { setMenuProdutoAberto(null); setProdutoExcluir(produto); setFeedback(null); }} className="w-full rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">Excluir item</button></div>}</div></td></tr>; })}</tbody></table></div></Card>}

      {tab === "novo_item" && (produtoForm.id && !itemEditandoCod ? <Card className="p-5 border-amber-200 dark:border-amber-500/30"><div className="mb-5"><h3 className="font-semibold text-slate-900 dark:text-white">Editar produto do catálogo</h3><p className="text-xs text-slate-400 mt-0.5">Aqui você altera os dados de venda. O saldo e o mínimo continuam sendo controlados no estoque.</p></div><form onSubmit={salvarProduto} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"><label className="text-xs text-slate-500 sm:col-span-2">Nome do produto<input autoFocus value={produtoForm.nome} onChange={e => setProdutoForm(prev => ({ ...prev, nome: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label><label className="text-xs text-slate-500">Categoria<select value={produtoForm.categoria} onChange={e => setProdutoForm(prev => ({ ...prev, categoria: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm"><option value="">Selecione</option>{categoriasDisponiveis.map(categoria => <option key={categoria.id} value={categoria.nome}>{categoria.nome}{categoria.ativo === false ? " (inativa)" : ""}</option>)}</select></label><label className="text-xs text-slate-500">Preço de venda (R$)<input inputMode="decimal" value={produtoForm.preco} onChange={e => setProdutoForm(prev => ({ ...prev, preco: e.target.value }))} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label><label className="text-xs text-slate-500 sm:col-span-2">Item vinculado ao estoque<select value={produtoForm.estoqueCod} onChange={e => setProdutoForm(prev => ({ ...prev, estoqueCod: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm"><option value="">Sem estoque direto (ficha técnica ou serviço)</option>{estoqueItens.map(item => <option key={item.cod} value={item.cod}>{item.nome} · {item.qtd.toLocaleString("pt-BR")} {item.un}</option>)}</select></label><label className="text-xs text-slate-500 flex items-center gap-2 pt-6"><input type="checkbox" checked={produtoForm.ativo} onChange={e => setProdutoForm(prev => ({ ...prev, ativo: e.target.checked }))} className="accent-[#7A1420]" />Produto ativo para venda</label><div className="flex justify-end gap-2 sm:col-span-2 xl:col-span-4"><button type="button" onClick={() => { setProdutoForm({ id: null, nome: "", categoria: "", preco: "", estoqueCod: "", ativo: true }); setTab("produtos"); }} className="rounded-xl border border-slate-200 dark:border-slate-600 text-sm px-4 py-2.5">Cancelar</button><button className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-5 py-2.5">Salvar alteração</button></div></form></Card> : <Card className="p-5 border-emerald-200 dark:border-emerald-500/30"><div className="mb-5"><h3 className="font-semibold text-slate-900 dark:text-white">{itemEditandoCod ? "Editar item" : "Adicionar novo item"}</h3><p className="text-xs text-slate-400 mt-0.5">{itemEditandoCod ? "Estoque e catálogo estão vinculados: nome, categoria e saldo serão sincronizados." : "O item entra no estoque com saldo, mínimo e custo. Se for vendido, também pode entrar no catálogo sem ficha técnica."}</p></div><form onSubmit={salvarNovoItem} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"><label className="text-xs text-slate-500">{itemEditandoCod ? "Código" : "Código (opcional)"}<input readOnly={Boolean(itemEditandoCod)} value={novoItem.codigo} onChange={e => setNovoItem(prev => ({ ...prev, codigo: e.target.value }))} placeholder="Automático" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm uppercase" /></label><label className="text-xs text-slate-500 sm:col-span-1 xl:col-span-2">Nome do item<input autoFocus value={novoItem.nome} onChange={e => setNovoItem(prev => ({ ...prev, nome: e.target.value }))} placeholder="Ex.: Água mineral 500 ml" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label><label className="text-xs text-slate-500">Categoria<select value={novoItem.categoria} onChange={e => setNovoItem(prev => ({ ...prev, categoria: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm"><option value="">Selecione</option>{categorias.filter(categoria => categoria.ativo !== false).map(categoria => <option key={categoria.id} value={categoria.nome}>{categoria.nome}</option>)}</select></label><label className="text-xs text-slate-500">Unidade<select value={novoItem.unidade} onChange={e => setNovoItem(prev => ({ ...prev, unidade: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm"><option value="un">Unidade (un)</option><option value="kg">Quilograma (kg)</option><option value="g">Grama (g)</option><option value="l">Litro (l)</option><option value="ml">Mililitro (ml)</option><option value="pct">Pacote (pct)</option><option value="cx">Caixa (cx)</option></select></label><label className="text-xs text-slate-500">{itemEditandoCod ? "Quantidade correta" : "Saldo inicial"}<input inputMode="decimal" value={novoItem.quantidade} onChange={e => setNovoItem(prev => ({ ...prev, quantidade: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label><label className="text-xs text-slate-500">Estoque mínimo<input inputMode="decimal" value={novoItem.minimo} onChange={e => setNovoItem(prev => ({ ...prev, minimo: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label><label className="text-xs text-slate-500">Preço de custo (R$)<input inputMode="decimal" value={novoItem.custo} onChange={e => setNovoItem(prev => ({ ...prev, custo: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label><label className="text-xs text-slate-500 flex items-center gap-2 pt-6"><input type="checkbox" checked={novoItem.venda} onChange={e => setNovoItem(prev => ({ ...prev, venda: e.target.checked }))} className="accent-[#7A1420]" />Também é produto de venda</label>{novoItem.venda && <label className="text-xs text-slate-500">Preço de venda (R$)<input inputMode="decimal" value={novoItem.precoVenda} onChange={e => setNovoItem(prev => ({ ...prev, precoVenda: e.target.value }))} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label>}<div className="flex justify-end gap-2 sm:col-span-2 xl:col-span-4"><button type="button" onClick={() => { setItemEditandoCod(null); setProdutoForm({ id: null, nome: "", categoria: "", preco: "", estoqueCod: "", ativo: true }); setTab("produtos"); }} className="rounded-xl border border-slate-200 dark:border-slate-600 text-sm px-4 py-2.5">Cancelar</button><button disabled={salvandoItem} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5">{salvandoItem ? "Salvando..." : itemEditandoCod ? "Salvar alterações" : "Cadastrar item"}</button></div></form></Card>)}
      {tab === "categorias" && <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4"><Card className="p-5"><h3 className="font-semibold text-slate-900 dark:text-white">{categoriaForm.id ? "Editar categoria" : "Adicionar categoria"}</h3><p className="text-xs text-slate-400 mt-0.5 mb-4">Use categorias para organizar o catálogo e os relatórios.</p><form onSubmit={salvarCategoria} className="flex flex-col gap-3"><label className="text-xs text-slate-500">Nome da categoria<input autoFocus value={categoriaForm.nome} onChange={e => setCategoriaForm(prev => ({ ...prev, nome: e.target.value }))} placeholder="Ex.: Bebidas" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label><label className="text-xs text-slate-500 flex items-center gap-2"><input type="checkbox" checked={categoriaForm.ativo} onChange={e => setCategoriaForm(prev => ({ ...prev, ativo: e.target.checked }))} className="accent-[#7A1420]" />Categoria ativa</label><div className="flex gap-2"><button type="button" onClick={() => setCategoriaForm({ id: null, nome: "", ativo: true })} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 text-sm px-4 py-2.5">Limpar</button><button className="flex-1 rounded-xl bg-[#7A1420] text-white text-sm font-medium px-4 py-2.5">Salvar</button></div></form></Card><Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white">Categorias cadastradas</h3><p className="text-xs text-slate-400">{categorias.length} categorias disponíveis</p></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4">Categoria</th><th className="py-2.5 px-4 text-right">Produtos</th><th className="py-2.5 px-4">Status</th><th className="py-2.5 px-4"></th></tr></thead><tbody>{categorias.map(categoria => <tr key={categoria.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-medium">{categoria.nome}<div className="text-[11px] font-mono text-slate-400">{categoria.id}</div></td><td className="py-3 px-4 text-right">{produtos.filter(produto => normalizeTxt(produto.categoria) === normalizeTxt(categoria.nome)).length}</td><td className="py-3 px-4"><Badge tone={categoria.ativo !== false ? "green" : "slate"}>{categoria.ativo !== false ? "Ativa" : "Inativa"}</Badge></td><td className="py-3 px-4 text-right"><button type="button" onClick={() => editarCategoria(categoria)} className="rounded-lg border border-[#7A1420]/30 text-[#7A1420] dark:text-red-300 text-xs font-medium px-3 py-1.5">Editar</button></td></tr>)}</tbody></table></div></Card></div>}

      {tab === "fichas" && <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{fichas.map(ficha => { const custo = custoDaComposicao(ficha.insumos, estoqueItens); const margem = ficha.preco > 0 ? ((ficha.preco - custo) / ficha.preco) * 100 : null; return <Card key={ficha.id} className="p-5"><div className="flex items-start justify-between gap-3 mb-4"><div><div className="text-xs font-mono text-slate-400">{ficha.id} · {ficha.categoria}</div><h3 className="font-semibold text-slate-900 dark:text-white">{ficha.prato}</h3>{ficha.nomeSichef && <div className="text-[11px] text-slate-400 mt-0.5">No SiChef: {ficha.nomeSichef}</div>}</div><div className="flex items-center gap-2">{margem == null ? <Badge tone="slate">Preço pendente</Badge> : <Badge tone={margem >= 45 ? "green" : "amber"}>Margem {margem.toFixed(1)}%</Badge>}<button type="button" onClick={() => editarFicha(ficha)} className="rounded-lg border border-[#7A1420]/30 text-[#7A1420] dark:text-red-300 text-xs font-medium px-3 py-1.5">Editar</button></div></div><div className="grid grid-cols-3 gap-2 mb-4 text-center"><div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-2"><div className="text-[10px] text-slate-400 uppercase">Venda</div><div className="text-sm font-semibold">{ficha.preco > 0 ? dinheiro(ficha.preco) : "A definir"}</div></div><div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-2"><div className="text-[10px] text-slate-400 uppercase">Custo</div><div className="text-sm font-semibold">{dinheiro(custo)}</div></div><div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-2"><div className="text-[10px] text-slate-400 uppercase">CMV</div><div className="text-sm font-semibold">{ficha.preco > 0 ? ((custo / ficha.preco) * 100).toFixed(1) + "%" : "—"}</div></div></div><div className="flex flex-col gap-2">{ficha.insumos.map(item => <div key={item.cod} className="flex items-center justify-between text-sm border-b border-slate-100 dark:border-slate-700/50 pb-2"><span className="text-slate-600 dark:text-slate-300">{item.nome}</span><span className="text-slate-400">{item.qtd.toLocaleString("pt-BR")} {item.un}</span></div>)}</div></Card>; })}</div>}

      {tab === "editor_ficha" && <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4"><Card className="p-5"><div className="mb-4"><h3 className="font-semibold text-slate-900 dark:text-white">{fichaEditandoId ? "Editar ficha técnica" : "Cadastrar ficha técnica"}</h3><p className="text-xs text-slate-400 mt-0.5">Selecione um produto já cadastrado. Nem todo produto precisa ter ficha.</p></div><form onSubmit={salvarFicha} className="flex flex-col gap-3"><label className="text-xs text-slate-500">Produto<select value={produtoFichaId} onChange={e => setProdutoFichaId(e.target.value)} disabled={Boolean(fichaEditandoId)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm disabled:opacity-60"><option value="">Selecione</option>{produtosElegiveisFicha.map(produto => <option key={produto.id} value={produto.id}>{produto.nome}</option>)}</select></label>{produtoFicha && <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 px-3 py-2 text-xs text-slate-500"><div>Categoria: {produtoFicha.categoria}</div><div>Preço de venda: {produtoFicha.preco > 0 ? dinheiro(produtoFicha.preco) : "A definir"}</div></div>}<label className="text-xs text-slate-500">Nome no SiChef (opcional)<input value={nomeSichef} onChange={e => setNomeSichef(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setTab("fichas")} className="rounded-xl border border-slate-200 dark:border-slate-600 text-sm px-4 py-2.5">Cancelar</button><button className="rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-5 py-2.5">{fichaEditandoId ? "Salvar alteração" : "Salvar ficha"}</button></div></form></Card><div className="flex flex-col gap-4"><Card className="p-5"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Adicionar insumo</h3><p className="text-xs text-slate-400 mt-0.5 mb-4">Use a mesma unidade cadastrada no estoque</p><div className="grid grid-cols-1 sm:grid-cols-[1fr_150px_auto] gap-3 items-end"><label className="text-xs text-slate-500">Insumo<select value={insumoCod} onChange={e => setInsumoCod(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm">{estoqueItens.map(item => <option key={item.cod} value={item.cod}>{item.nome} ({item.un})</option>)}</select></label><label className="text-xs text-slate-500">Quantidade<input inputMode="decimal" value={qtdInsumo} onChange={e => setQtdInsumo(e.target.value)} placeholder="0" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" /></label><button type="button" onClick={adicionarInsumoFicha} className="rounded-xl border border-[#7A1420] text-[#7A1420] dark:text-red-300 text-sm font-medium px-4 py-2.5"><Plus size={15} className="inline mr-1" />Adicionar</button></div></Card><Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Composição da ficha</h3><p className="text-xs text-slate-400">{insumosFicha.length} insumo(s) · custo {dinheiro(custoDaComposicao(insumosFicha, estoqueItens))}</p></div>{insumosFicha.length ? <div className="overflow-x-auto"><table className="w-full text-sm min-w-[520px]"><tbody>{insumosFicha.map(item => <tr key={item.cod} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-medium">{item.nome}<div className="font-mono text-[11px] text-slate-400">{item.cod}</div></td><td className="py-3 px-4 text-right">{item.qtd.toLocaleString("pt-BR")} {item.un}</td><td className="py-3 px-4 text-right"><button type="button" onClick={() => setInsumosFicha(prev => prev.filter(x => x.cod !== item.cod))} className="text-xs text-rose-500">Remover</button></td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-sm text-slate-400">Nenhum insumo adicionado.</div>}</Card></div></div>}

      {tab === "producao" && receitaAtual && <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4"><Card className="p-3 flex flex-col gap-2">{receitas.map(receita => <button key={receita.id} onClick={() => setSelecionado(receita.id)} className={cx("text-left p-3 rounded-xl border", selecionado === receita.id ? "border-[#7A1420] bg-red-50 dark:bg-red-500/10" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/30")}><div className="flex items-center justify-between"><span className="text-sm font-semibold">{receita.produto}</span><Badge tone="slate">{receita.id}</Badge></div><div className="text-xs text-slate-400 mt-1">Rende {receita.rendimento} {receita.un}</div></button>)}</Card><Card className="overflow-hidden"><div className="p-5 border-b border-slate-100 dark:border-slate-700"><div className="font-mono text-xs text-slate-400">{receitaAtual.id}</div><h3 className="font-semibold text-slate-900 dark:text-white">{receitaAtual.produto}</h3><p className="text-xs text-slate-400">{receitaAtual.categoria} · rendimento {receitaAtual.rendimento} {receitaAtual.un} · custo do lote {dinheiro(custoDaComposicao(receitaAtual.insumos, estoqueItens))}</p></div><div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b"><th className="py-2.5 px-5">Insumo</th><th className="py-2.5 px-5 text-right">Necessário</th><th className="py-2.5 px-5 text-right">Disponível</th><th className="py-2.5 px-5">Situação</th></tr></thead><tbody>{receitaAtual.insumos.map(insumo => { const item = estoqueItens.find(estoque => estoque.cod === insumo.cod); const disponivel = item?.qtd || 0; return <tr key={insumo.cod} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-5 font-medium">{insumo.nome}</td><td className="py-3 px-5 text-right">{insumo.qtd.toLocaleString("pt-BR")} {insumo.un}</td><td className="py-3 px-5 text-right">{disponivel.toLocaleString("pt-BR")} {item?.un}</td><td className="py-3 px-5"><Badge tone={disponivel >= insumo.qtd ? "green" : "red"}>{disponivel >= insumo.qtd ? "Disponível" : "Repor"}</Badge></td></tr>; })}</tbody></table></div></Card></div>}
    </div>
  );
}function OPCard({ op, kind, onAvancar }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-slate-400">{op.id}</span>
        {kind === "producao" && <Loader2 size={13} className="text-[#7A1420] animate-spin" />}
        {kind === "concluidas" && <CheckCircle2 size={14} className="text-emerald-500" />}
        {kind === "aguardando" && <PauseCircle size={14} className="text-slate-400" />}
      </div>
      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{op.produto}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{op.qtd} {op.un} · {op.resp}</div>
      <div className="text-[11px] text-slate-400 mt-1">{op.lotes} {op.lotes === 1 ? "lote" : "lotes"} · {op.criadaEm}</div>
      {kind === "producao" && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-[#7A1420] rounded-full w-2/3" />
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Produção em andamento</div>
        </div>
      )}
      {kind !== "concluidas" && <button onClick={() => onAvancar(op.id)} className="mt-3 w-full rounded-lg bg-[#7A1420] hover:bg-[#611018] text-white text-xs font-medium py-2 transition-colors">{kind === "aguardando" ? "Iniciar produção" : "Concluir e movimentar estoque"}</button>}
      {kind === "concluidas" && <div className="text-[11px] text-emerald-500 mt-3">Estoque movimentado · {op.concluidaEm ?? "hoje"}</div>}
    </Card>
  );
}

function Producao({ receitas, estoqueItens, ordens, onCriarOrdem, onAvancarOrdem }) {
  const [formOpen, setFormOpen] = useState(false);
  const [receitaId, setReceitaId] = useState(receitas[0]?.id ?? "");
  const [lotes, setLotes] = useState("1");
  const [responsavel, setResponsavel] = useState("Cozinha 1");
  const [feedback, setFeedback] = useState(null);
  const receita = receitas.find(r => r.id === receitaId);
  const qtdLotes = Math.max(1, Number(lotes) || 1);
  const necessidades = (receita?.insumos ?? []).map(insumo => {
    const item = estoqueItens.find(i => i.cod === insumo.cod);
    const necessario = insumo.qtd * qtdLotes;
    return { ...insumo, necessario, disponivel: item?.qtd ?? 0 };
  });
  const podeProduzir = necessidades.every(i => i.disponivel >= i.necessario);

  const cols = [
    { key: "aguardando", label: "Aguardando", data: ordens.filter(o => o.status === "aguardando") },
    { key: "producao", label: "Em preparo", data: ordens.filter(o => o.status === "producao") },
    { key: "concluidas", label: "Concluídos hoje", data: ordens.filter(o => o.status === "concluidas") },
  ];

  function criarOrdem(e) {
    e.preventDefault();
    if (!receita) return;
    onCriarOrdem({ receitaId, lotes: qtdLotes, responsavel });
    setFeedback({ tone: podeProduzir ? "green" : "amber", text: podeProduzir ? "Ordem criada e pronta para iniciar." : "Ordem criada, mas há insumos que precisam ser repostos antes da conclusão." });
    setFormOpen(false);
  }

  function avancar(id) {
    const resultado = onAvancarOrdem(id);
    setFeedback(resultado);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Cozinha / Preparo</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{ordens.filter(o => o.status !== "concluidas").length} ordens abertas · baixa automática ao concluir</p>
        </div>
        <button onClick={() => setFormOpen(v => !v)} className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <Plus size={15} /> Nova ordem de preparo
        </button>
      </div>

      {feedback && <div className={cx("rounded-xl border px-4 py-3 text-sm", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300")}>{feedback.text}</div>}

      {formOpen && <Card className="p-5">
        <form onSubmit={criarOrdem} className="grid grid-cols-1 lg:grid-cols-[1.3fr_.6fr_1fr_auto] gap-3 items-end">
          <label className="text-xs text-slate-500">Receita
            <select value={receitaId} onChange={e => setReceitaId(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]">{receitas.map(r => <option key={r.id} value={r.id}>{r.produto} — {r.rendimento} {r.un}</option>)}</select>
          </label>
          <label className="text-xs text-slate-500">Lotes
            <input type="number" min="1" step="1" value={lotes} onChange={e => setLotes(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" />
          </label>
          <label className="text-xs text-slate-500">Responsável
            <input value={responsavel} onChange={e => setResponsavel(e.target.value)} required className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" />
          </label>
          <button className="rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-5 py-2.5">Criar ordem</button>
        </form>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">{necessidades.map(i => <div key={i.cod} className="rounded-xl bg-slate-50 dark:bg-slate-700/30 px-3 py-2 flex items-center justify-between gap-2 text-xs"><span className="text-slate-600 dark:text-slate-300">{i.nome}</span><span className={i.disponivel >= i.necessario ? "text-emerald-500" : "text-rose-500"}>{i.necessario.toLocaleString("pt-BR")} / {i.disponivel.toLocaleString("pt-BR")} {i.un}</span></div>)}</div>
      </Card>}

      <Card className="p-5">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={preparoSemana}>
            <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Bar dataKey="porcoes" fill="#7A1420" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cols.map(col => (
          <div key={col.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{col.label}</h3>
              <Badge tone="slate">{col.data.length}</Badge>
            </div>
            {col.data.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-5 text-center text-xs text-slate-400">Nenhuma ordem</div>}
            {col.data.map(op => <OPCard key={op.id} op={op} kind={col.key} onAvancar={avancar} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function Vendas() {
  const statusTone = { entregue: "green", em_preparo: "amber", saiu_entrega: "brand", cancelado: "red" };
  const statusLabel = { entregue: "Entregue", em_preparo: "Em preparo", saiu_entrega: "Saiu p/ entrega", cancelado: "Cancelado" };
  const statusIcon = { entregue: CheckCircle2, em_preparo: ChefHat, saiu_entrega: Bike, cancelado: XCircle };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Pedidos / Vendas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">R$ 101.400,00 faturados este mês</p>
        </div>
        <button className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <Plus size={15} /> Novo pedido
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Pedidos (mês)" value="1.842" delta="+120 vs mês anterior" positive icon={ShoppingCart} />
        <KPI label="Ticket médio" value="R$ 55,10" delta="+2,1%" positive icon={TrendingUp} />
        <KPI label="Tempo médio de entrega" value="34 min" delta="-4 min vs média" positive icon={Bike} />
        <KPI label="Cancelamentos" value="1,8%" delta="-0,3 p.p." positive icon={TrendingDown} />
      </div>

      <Card className="p-4">
        <div className="overflow-x-auto -mx-4">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                <th className="py-2.5 px-4 font-medium">Pedido</th>
                <th className="py-2.5 px-4 font-medium">Cliente / Endereço</th>
                <th className="py-2.5 px-4 font-medium text-right">Valor</th>
                <th className="py-2.5 px-4 font-medium">Pagamento</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Hora</th>
              </tr>
            </thead>
            <tbody>
              {pedidosVenda.map(v => {
                const Icon = statusIcon[v.status];
                return (
                  <tr key={v.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">{v.id}</td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                      <span className="inline-flex items-center gap-1.5"><MapPin size={12} className="text-slate-400" />{v.cliente}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">{v.valor}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{v.pagamento}</td>
                    <td className="py-3 px-4">
                      <Badge tone={statusTone[v.status]}><span className="inline-flex items-center gap-1"><Icon size={11} /> {statusLabel[v.status]}</span></Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{v.data}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Financeiro({ contasPagar }) {
  const [tab, setTab] = useState("pagar");
  const rows = tab === "pagar" ? contasPagar : contasReceber;
  const statusTone = { aberto: "brand", atrasado: "red", pago: "green" };
  const statusLabel = { aberto: "Em aberto", atrasado: "Atrasado", pago: "Pago" };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Financeiro</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Saldo atual em caixa: R$ 14.600,00</p>
        </div>
        <button className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <Plus size={15} /> Novo lançamento
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="A receber (7d)" value="R$ 3.100" delta="3 títulos em aberto" positive icon={ArrowDownRight} />
        <KPI label="A pagar (7d)" value="R$ 6.680" delta="3 títulos em aberto" positive={false} icon={ArrowUpRight} />
        <KPI label="Saldo projetado" value="R$ 11.020" delta="+5,4% vs semana anterior" positive icon={CircleDollarSign} />
        <KPI label="DRE — Lucro líquido" value="R$ 41.200" delta="Margem de 40,6%" positive icon={Wallet} />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Fluxo de caixa</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Saldo diário, em milhares (R$) — últimos 7 dias</p>
          </div>
          <Badge tone="slate">7 dias</Badge>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={fluxoCaixa} margin={{ left: -20, right: 10 }}>
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Line type="monotone" dataKey="saldo" stroke="#7A1420" strokeWidth={2.5} dot={{ r: 3, fill: "#7A1420" }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-1 mb-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl p-1 w-fit">
          <button onClick={() => setTab("pagar")} className={cx("px-4 py-1.5 rounded-lg text-sm font-medium transition-colors", tab === "pagar" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500")}>Contas a pagar</button>
          <button onClick={() => setTab("receber")} className={cx("px-4 py-1.5 rounded-lg text-sm font-medium transition-colors", tab === "receber" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500")}>Contas a receber</button>
        </div>
        <div className="overflow-x-auto -mx-4">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                <th className="py-2.5 px-4 font-medium">Descrição</th>
                <th className="py-2.5 px-4 font-medium">Vencimento</th>
                <th className="py-2.5 px-4 font-medium text-right">Valor</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/60 dark:hover:bg-slate-700/20">
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">{r.desc}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{r.venc}</td>
                  <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">{r.valor}</td>
                  <td className="py-3 px-4"><Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Caixa({ caixas, movimentos, onAbrir, onMovimentar, onFechar }) {
  const [tab, setTab] = useState("operacao");
  const [responsavel, setResponsavel] = useState("Alana");
  const [turno, setTurno] = useState("Matutino");
  const [saldoInicial, setSaldoInicial] = useState("");
  const [tipo, setTipo] = useState("suprimento");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [saldoContado, setSaldoContado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [feedback, setFeedback] = useState(null);

  const caixaAberto = caixas.find(c => c.status === "aberto");
  const saldoSistema = saldoCalculadoCaixa(caixaAberto, movimentos);
  const movimentosAtuais = caixaAberto ? movimentos.filter(m => m.caixaId === caixaAberto.id) : [];
  const entradas = movimentosAtuais.filter(m => valorAssinadoCaixa(m) > 0).reduce((t, m) => t + m.valor, 0);
  const saidas = movimentosAtuais.filter(m => valorAssinadoCaixa(m) < 0).reduce((t, m) => t + m.valor, 0);
  const contado = Number(String(saldoContado).replace(",", ".")) || 0;
  const diferencaPreview = contado - saldoSistema;
  const dinheiro = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function abrirCaixa(e) {
    e.preventDefault();
    const inicial = Number(String(saldoInicial).replace(",", "."));
    if (!responsavel.trim() || Number.isNaN(inicial) || inicial < 0) {
      setFeedback({ tone: "red", text: "Informe o responsável e um saldo inicial válido." });
      return;
    }
    const resultado = onAbrir({ responsavel: responsavel.trim(), turno, saldoInicial: inicial });
    setFeedback(resultado);
    if (resultado.tone === "green") setSaldoInicial("");
  }

  function registrarMovimento(e) {
    e.preventDefault();
    const valorNumero = Number(String(valor).replace(",", "."));
    if (!descricao.trim() || !valorNumero || valorNumero <= 0) {
      setFeedback({ tone: "red", text: "Informe uma descrição e um valor maior que zero." });
      return;
    }
    const resultado = onMovimentar({ tipo, descricao: descricao.trim(), valor: valorNumero });
    setFeedback(resultado);
    if (resultado.tone === "green") { setDescricao(""); setValor(""); }
  }

  function fecharCaixa(e) {
    e.preventDefault();
    if (saldoContado === "" || contado < 0) {
      setFeedback({ tone: "red", text: "Informe o valor contado antes de fechar o caixa." });
      return;
    }
    const resultado = onFechar({ saldoContado: contado, observacao: observacao.trim() });
    setFeedback(resultado);
    if (resultado.tone === "green") { setSaldoContado(""); setObservacao(""); setTab("historico"); }
  }

  const tipoLabel = { entrada: "Entrada", saida: "Saída", suprimento: "Suprimento", sangria: "Sangria", troco: "Troco" };
  const tipoTone = { entrada: "green", suprimento: "green", saida: "red", sangria: "red", troco: "amber" };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Caixa e turnos</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Abertura, movimentações, conferência e fechamento auditável</p>
        </div>
        <Badge tone={caixaAberto ? "green" : "slate"}><span className="inline-flex items-center gap-1.5"><span className={cx("w-1.5 h-1.5 rounded-full", caixaAberto ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />{caixaAberto ? `${caixaAberto.id} aberto` : "Nenhum caixa aberto"}</span></Badge>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        <button onClick={() => setTab("operacao")} className={cx("px-4 py-2.5 text-sm font-medium border-b-2", tab === "operacao" ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>Operação atual</button>
        <button onClick={() => setTab("historico")} className={cx("px-4 py-2.5 text-sm font-medium border-b-2", tab === "historico" ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>Histórico de turnos</button>
      </div>

      {feedback && <div className={cx("rounded-xl border px-4 py-3 text-sm", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300")}>{feedback.text}</div>}

      {tab === "operacao" && !caixaAberto && (
        <Card className="p-5 max-w-3xl">
          <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center"><CircleDollarSign size={19} className="text-[#7A1420] dark:text-red-300" /></div><div><h3 className="font-semibold text-slate-900 dark:text-white">Abrir novo caixa</h3><p className="text-xs text-slate-400">Apenas um turno pode permanecer aberto por vez</p></div></div>
          <form onSubmit={abrirCaixa} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-xs text-slate-500">Responsável<input value={responsavel} onChange={e => setResponsavel(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
            <label className="text-xs text-slate-500">Turno<select value={turno} onChange={e => setTurno(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]"><option>Matutino</option><option>Noturno</option><option>Integral</option></select></label>
            <label className="text-xs text-slate-500 sm:col-span-2">Saldo inicial (R$)<input inputMode="decimal" value={saldoInicial} onChange={e => setSaldoInicial(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
            <button className="sm:col-span-2 rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-5 py-2.5">Confirmar abertura</button>
          </form>
        </Card>
      )}

      {tab === "operacao" && caixaAberto && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI label="Saldo inicial" value={dinheiro(caixaAberto.saldoInicial)} delta={`${caixaAberto.turno} · ${caixaAberto.responsavel}`} positive icon={Wallet} />
            <KPI label="Entradas" value={dinheiro(entradas)} delta={`${movimentosAtuais.filter(m => valorAssinadoCaixa(m) > 0).length} lançamentos`} positive icon={ArrowDownRight} />
            <KPI label="Saídas" value={dinheiro(saidas)} delta={`${movimentosAtuais.filter(m => valorAssinadoCaixa(m) < 0).length} lançamentos`} positive={false} icon={ArrowUpRight} />
            <KPI label="Saldo do sistema" value={dinheiro(saldoSistema)} delta="Atualizado em tempo real" positive icon={CircleDollarSign} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Novo movimento</h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-4">Suprimentos aumentam o saldo; sangrias, saídas e trocos reduzem</p>
              <form onSubmit={registrarMovimento} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-xs text-slate-500">Tipo<select value={tipo} onChange={e => setTipo(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]"><option value="suprimento">Suprimento</option><option value="sangria">Sangria</option><option value="entrada">Outra entrada</option><option value="saida">Outra saída</option><option value="troco">Troco</option></select></label>
                <label className="text-xs text-slate-500">Valor (R$)<input inputMode="decimal" value={valor} onChange={e => setValor(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
                <label className="text-xs text-slate-500 sm:col-span-2">Descrição<input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Motivo ou referência do lançamento" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
                <button className="sm:col-span-2 rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-5 py-2.5">Registrar movimento</button>
              </form>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Conferência e fechamento</h3>
              <p className="text-xs text-slate-400 mt-0.5 mb-4">Conte o dinheiro físico; a diferença será registrada no histórico</p>
              <form onSubmit={fecharCaixa} className="flex flex-col gap-3">
                <label className="text-xs text-slate-500">Saldo contado (R$)<input inputMode="decimal" value={saldoContado} onChange={e => setSaldoContado(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
                <div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3"><div className="text-[10px] uppercase text-slate-400">Esperado</div><div className="font-semibold text-sm mt-0.5">{dinheiro(saldoSistema)}</div></div><div className={cx("rounded-xl p-3", diferencaPreview === 0 ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-amber-50 dark:bg-amber-500/10")}><div className="text-[10px] uppercase text-slate-400">Diferença</div><div className={cx("font-semibold text-sm mt-0.5", diferencaPreview === 0 ? "text-emerald-600" : "text-amber-600")}>{dinheiro(diferencaPreview)}</div></div></div>
                <label className="text-xs text-slate-500">Observação<textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows={2} placeholder="Justificativa da diferença, se houver" className="mt-1 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
                <button className="rounded-xl border border-[#7A1420] text-[#7A1420] dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-medium px-5 py-2.5">Conferir e fechar caixa</button>
              </form>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Movimentos do turno</h3></div>
            <div className="overflow-x-auto"><table className="w-full text-sm min-w-[680px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Hora</th><th className="py-2.5 px-4 font-medium">Tipo</th><th className="py-2.5 px-4 font-medium">Descrição</th><th className="py-2.5 px-4 font-medium">Responsável</th><th className="py-2.5 px-4 font-medium text-right">Valor</th></tr></thead><tbody>{movimentosAtuais.map(m => <tr key={m.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 text-slate-400">{m.hora}</td><td className="py-3 px-4"><Badge tone={tipoTone[m.tipo]}>{tipoLabel[m.tipo]}</Badge></td><td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{m.descricao}</td><td className="py-3 px-4 text-slate-500">{m.responsavel}</td><td className={cx("py-3 px-4 text-right font-medium", valorAssinadoCaixa(m) > 0 ? "text-emerald-600" : "text-rose-600")}>{valorAssinadoCaixa(m) > 0 ? "+" : "−"}{dinheiro(m.valor)}</td></tr>)}</tbody></table></div>
          </Card>
        </>
      )}

      {tab === "historico" && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Histórico de aberturas e fechamentos</h3><p className="text-xs text-slate-400 mt-0.5">Diferenças permanecem registradas para auditoria</p></div>
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[820px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Caixa</th><th className="py-2.5 px-4 font-medium">Responsável</th><th className="py-2.5 px-4 font-medium">Turno</th><th className="py-2.5 px-4 font-medium">Abertura</th><th className="py-2.5 px-4 font-medium">Fechamento</th><th className="py-2.5 px-4 font-medium text-right">Sistema</th><th className="py-2.5 px-4 font-medium text-right">Contado</th><th className="py-2.5 px-4 font-medium text-right">Diferença</th><th className="py-2.5 px-4 font-medium">Status</th></tr></thead><tbody>{caixas.map(c => {
            const sistema = c.status === "aberto" ? saldoCalculadoCaixa(c, movimentos) : c.saldoSistema;
            return <tr key={c.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-mono text-xs text-slate-400">{c.id}</td><td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{c.responsavel}</td><td className="py-3 px-4 text-slate-500">{c.turno}</td><td className="py-3 px-4 text-slate-500">{c.abertoEm}</td><td className="py-3 px-4 text-slate-500">{c.fechadoEm ?? "—"}</td><td className="py-3 px-4 text-right">{dinheiro(sistema ?? 0)}</td><td className="py-3 px-4 text-right">{c.saldoContado == null ? "—" : dinheiro(c.saldoContado)}</td><td className={cx("py-3 px-4 text-right font-medium", !c.diferenca ? "text-emerald-600" : "text-amber-600")}>{c.diferenca == null ? "—" : dinheiro(c.diferenca)}</td><td className="py-3 px-4"><Badge tone={c.status === "aberto" ? "green" : "slate"}>{c.status === "aberto" ? "Aberto" : "Fechado"}</Badge></td></tr>;
          })}</tbody></table></div>
        </Card>
      )}
    </div>
  );
}

function Entregas({ entregadores, tarifas, corridas, caixaAberto, onCadastrar, onLancarLote, onSalvarTarifa }) {
  const [tab, setTab] = useState("corridas");
  const [entregadorId, setEntregadorId] = useState(entregadores[0]?.id ?? "");
  const [bairro, setBairro] = useState(tarifas[0]?.bairro ?? "");
  const [pedido, setPedido] = useState("");
  const [lista, setLista] = useState([]);
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoTipo, setNovoTipo] = useState("Zupt");
  const [buscaTarifa, setBuscaTarifa] = useState("");
  const [bairroOriginal, setBairroOriginal] = useState(null);
  const [bairroCadastro, setBairroCadastro] = useState("");
  const [valorMotoCity, setValorMotoCity] = useState("");
  const [valorZupt, setValorZupt] = useState("");
  const [feedback, setFeedback] = useState(null);

  const entregador = entregadores.find(e => e.id === entregadorId);
  const valorTabela = tarifaDaCorrida(tarifas, entregador?.tipo, bairro);
  const totalLista = lista.reduce((total, item) => total + item.valor, 0);
  const totalHoje = corridas.reduce((total, corrida) => total + corrida.valor, 0);
  const dinheiro = valor => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const numero = valor => Number(String(valor || "").replace(",", ".")) || 0;

  const resumoEntregadores = useMemo(() => {
    const grupos = new Map();
    corridas.forEach(corrida => {
      const chave = `${corrida.entregadorId}|${corrida.empresa}`;
      const atual = grupos.get(chave) ?? { entregador: corrida.entregador, empresa: corrida.empresa, corridas: 0, total: 0, lotes: new Set() };
      atual.corridas += 1;
      atual.total += corrida.valor;
      if (corrida.loteId) atual.lotes.add(corrida.loteId);
      grupos.set(chave, atual);
    });
    return Array.from(grupos.values()).map(item => ({ ...item, lotes: item.lotes.size })).sort((a, b) => b.total - a.total);
  }, [corridas]);

  const tarifasFiltradas = useMemo(() => {
    const busca = normalizeTxt(buscaTarifa);
    return busca ? tarifas.filter(t => normalizeTxt(t.bairro).includes(busca)) : tarifas;
  }, [tarifas, buscaTarifa]);

  function trocarEntregador(id) {
    if (lista.length) {
      setFeedback({ tone: "amber", text: "Finalize ou limpe a lista atual antes de trocar o entregador." });
      return;
    }
    setEntregadorId(id);
  }

  function adicionarCorrida(e) {
    e.preventDefault();
    if (!entregador || !bairro || valorTabela == null || valorTabela <= 0) {
      setFeedback({ tone: "red", text: "Selecione o entregador e um bairro com preço cadastrado para a empresa." });
      return;
    }
    const item = {
      id: `ITEM-${Date.now()}-${lista.length + 1}`,
      pedido: pedido.trim() || "Sem número",
      bairro,
      valor: valorTabela,
    };
    setLista(prev => [...prev, item]);
    setPedido("");
    setFeedback({ tone: "green", text: `${bairro} adicionado à lista de ${entregador.nome}.` });
  }

  function finalizarLista() {
    if (!lista.length) {
      setFeedback({ tone: "red", text: "Adicione pelo menos um bairro antes de confirmar." });
      return;
    }
    const resultado = onLancarLote({ entregador, itens: lista });
    setFeedback(resultado);
    if (resultado.tone === "green") setLista([]);
  }

  function cadastrarEntregador(e) {
    e.preventDefault();
    if (!novoNome.trim()) {
      setFeedback({ tone: "red", text: "Informe o nome do entregador." });
      return;
    }
    const resultado = onCadastrar({ nome: novoNome.trim(), telefone: novoTelefone.trim(), tipo: novoTipo });
    setFeedback(resultado);
    if (resultado.tone === "green") {
      setNovoNome("");
      setNovoTelefone("");
    }
  }

  function editarTarifa(tarifa) {
    setBairroOriginal(tarifa.bairro);
    setBairroCadastro(tarifa.bairro);
    setValorMotoCity(tarifa.valores["Moto City"] ?? "");
    setValorZupt(tarifa.valores.Zupt ?? "");
    setFeedback({ tone: "amber", text: "Editando " + tarifa.bairro + ". Altere os valores e clique em Salvar alteração." });
    setTab("tarifas");
    setTimeout(() => {
      document.getElementById("editor-tarifa-bairro")?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("bairro-tarifa")?.focus();
    }, 0);
  }
  function limparTarifa() {
    setBairroOriginal(null);
    setBairroCadastro("");
    setValorMotoCity("");
    setValorZupt("");
  }

  function salvarTarifa(e) {
    e.preventDefault();
    const valores = {};
    if (numero(valorMotoCity) > 0) valores["Moto City"] = numero(valorMotoCity);
    if (numero(valorZupt) > 0) valores.Zupt = numero(valorZupt);
    const resultado = onSalvarTarifa({ bairroOriginal, bairro: bairroCadastro.trim(), valores });
    setFeedback(resultado);
    if (resultado.tone === "green") limparTarifa();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Motos e entregas</h2><p className="text-sm text-slate-500 dark:text-slate-400">ZUPT e Moto City: corridas agrupadas por entregador e lançadas no caixa</p></div>
        <div className="flex items-center gap-2"><Badge tone={caixaAberto ? "green" : "amber"}>{caixaAberto ? `${caixaAberto.id} disponível` : "Caixa fechado"}</Badge><button onClick={() => setTab("corridas")} className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2 rounded-xl"><Plus size={15} /> Nova lista</button></div>
      </div>

      <div className="rounded-xl border border-sky-200 bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-200 px-4 py-3 text-sm flex items-start gap-2">
        <Bike size={16} className="mt-0.5 shrink-0" /><span><strong>Movery:</strong> as demais entregas continuam administradas pelo aplicativo. Nesta tela entram somente as corridas externas da ZUPT e da Moto City.</span>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {[["corridas", "Corridas e acertos"], ["entregadores", "Entregadores"], ["tarifas", "Tabela de bairros"]].map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={cx("px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap", tab === key ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>{label}</button>)}
      </div>

      {feedback && <div className={cx("rounded-xl border px-4 py-3 text-sm", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300")}>{feedback.text}</div>}

      {tab === "corridas" && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Corridas" value={String(corridas.length)} delta="Lançamentos individuais" positive icon={Bike} />
          <KPI label="Custo de motos" value={dinheiro(totalHoje)} delta="Saídas no caixa" positive={false} icon={CircleDollarSign} />
          <KPI label="Entregadores" value={String(resumoEntregadores.length)} delta="No período" positive icon={Users} />
          <KPI label="Custo médio" value={dinheiro(corridas.length ? totalHoje / corridas.length : 0)} delta="Por corrida" positive icon={BarChart3} />
        </div>

        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4"><div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center"><Bike size={17} className="text-[#7A1420] dark:text-red-300" /></div><div><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Montar lista do entregador</h3><p className="text-xs text-slate-400">Adicione quantas corridas forem necessárias; o caixa recebe uma única saída pelo total</p></div></div>
          <form onSubmit={adicionarCorrida} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_1fr_auto] gap-3 items-end">
            <label className="text-xs text-slate-500">Entregador / empresa<select value={entregadorId} onChange={e => trocarEntregador(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]">{entregadores.filter(e => e.ativo).map(e => <option key={e.id} value={e.id}>{e.nome} — {e.tipo}</option>)}</select></label>
            <label className="text-xs text-slate-500">Bairro / destino<select value={bairro} onChange={e => setBairro(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]">{tarifas.map(t => <option key={t.bairro}>{t.bairro}</option>)}</select></label>
            <label className="text-xs text-slate-500">Pedido (opcional)<input value={pedido} onChange={e => setPedido(e.target.value)} placeholder="#0000" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
            <div className="flex items-end gap-2"><div className="min-w-[112px] rounded-xl bg-slate-50 dark:bg-slate-700/30 px-3 py-2.5"><div className="text-[10px] uppercase text-slate-400">Preço</div><div className="text-sm font-semibold text-[#7A1420] dark:text-red-300">{valorTabela == null ? "—" : dinheiro(valorTabela)}</div></div><button className="rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2.5 whitespace-nowrap"><Plus size={15} className="inline mr-1" />Adicionar</button></div>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Lista aberta · {entregador?.nome ?? "Selecione um entregador"}</h3><p className="text-xs text-slate-400 mt-0.5">{lista.length} corrida(s) · {entregador?.tipo ?? "—"}</p></div><div className="text-right"><div className="text-[10px] uppercase text-slate-400">Total a lançar</div><div className="text-lg font-semibold text-[#7A1420] dark:text-red-300">{dinheiro(totalLista)}</div></div></div>
          {lista.length ? <><div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">#</th><th className="py-2.5 px-4 font-medium">Pedido</th><th className="py-2.5 px-4 font-medium">Bairro</th><th className="py-2.5 px-4 font-medium text-right">Valor</th><th className="py-2.5 px-4"></th></tr></thead><tbody>{lista.map((item, index) => <tr key={item.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 text-slate-400">{index + 1}</td><td className="py-3 px-4 font-medium">{item.pedido}</td><td className="py-3 px-4 text-slate-500"><span className="inline-flex items-center gap-1"><MapPin size={12} />{item.bairro}</span></td><td className="py-3 px-4 text-right font-medium">{dinheiro(item.valor)}</td><td className="py-3 px-4 text-right"><button onClick={() => setLista(prev => prev.filter(i => i.id !== item.id))} className="text-rose-500 hover:text-rose-700 text-xs">Remover</button></td></tr>)}</tbody></table></div><div className="p-4 flex flex-col sm:flex-row justify-end gap-2"><button onClick={() => setLista([])} className="rounded-xl border border-slate-200 dark:border-slate-600 text-sm px-4 py-2.5">Limpar lista</button><button onClick={finalizarLista} disabled={!caixaAberto} className="rounded-xl bg-[#7A1420] disabled:opacity-40 hover:bg-[#611018] text-white text-sm font-medium px-5 py-2.5">Lançar {dinheiro(totalLista)} no caixa em nome de {entregador?.nome}</button></div></> : <div className="p-8 text-center text-sm text-slate-400">Adicione os bairros atendidos por este entregador.</div>}
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Resumo por entregador</h3><p className="text-xs text-slate-400 mt-0.5">Acumulado por nome e empresa prestadora</p></div><div className="overflow-x-auto"><table className="w-full text-sm min-w-[500px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Entregador</th><th className="py-2.5 px-4 font-medium">Empresa</th><th className="py-2.5 px-4 font-medium text-right">Corridas</th><th className="py-2.5 px-4 font-medium text-right">Total</th></tr></thead><tbody>{resumoEntregadores.map(item => <tr key={`${item.entregador}-${item.empresa}`} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-medium">{item.entregador}</td><td className="py-3 px-4"><Badge tone="brand">{item.empresa}</Badge></td><td className="py-3 px-4 text-right">{item.corridas}</td><td className="py-3 px-4 text-right font-semibold">{dinheiro(item.total)}</td></tr>)}</tbody></table></div></Card>
          <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Histórico de corridas</h3></div><div className="overflow-x-auto max-h-[360px]"><table className="w-full text-sm min-w-[620px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Lote</th><th className="py-2.5 px-4 font-medium">Entregador</th><th className="py-2.5 px-4 font-medium">Bairro</th><th className="py-2.5 px-4 font-medium text-right">Valor</th><th className="py-2.5 px-4 font-medium">Caixa</th></tr></thead><tbody>{corridas.map(c => <tr key={c.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-mono text-xs text-slate-400">{c.loteId ?? c.id}</td><td className="py-3 px-4"><div className="font-medium">{c.entregador}</div><div className="text-xs text-slate-400">{c.empresa}</div></td><td className="py-3 px-4 text-slate-500">{c.bairro}</td><td className="py-3 px-4 text-right font-medium">{dinheiro(c.valor)}</td><td className="py-3 px-4"><Badge tone="green">{c.caixaId ?? "Pago"}</Badge></td></tr>)}</tbody></table></div></Card>
        </div>
      </>}

      {tab === "entregadores" && <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
        <Card className="p-5"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Cadastrar entregador</h3><p className="text-xs text-slate-400 mt-0.5 mb-4">Vincule o nome à empresa que presta o serviço</p><form onSubmit={cadastrarEntregador} className="flex flex-col gap-3"><label className="text-xs text-slate-500">Nome do entregador<input value={novoNome} onChange={e => setNovoNome(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label><label className="text-xs text-slate-500">Telefone<input value={novoTelefone} onChange={e => setNovoTelefone(e.target.value)} placeholder="(35) 99999-9999" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label><label className="text-xs text-slate-500">Empresa prestadora<select value={novoTipo} onChange={e => setNovoTipo(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]"><option>Zupt</option><option>Moto City</option></select></label><button className="rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-5 py-2.5">Salvar entregador</button></form></Card>
        <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Base de entregadores externos</h3></div><div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Nome</th><th className="py-2.5 px-4 font-medium">Telefone</th><th className="py-2.5 px-4 font-medium">Empresa</th><th className="py-2.5 px-4 font-medium">Status</th></tr></thead><tbody>{entregadores.map(e => <tr key={e.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4"><div className="font-medium text-slate-800 dark:text-slate-200">{e.nome}</div><div className="font-mono text-[11px] text-slate-400">{e.id}</div></td><td className="py-3 px-4 text-slate-500">{e.telefone || "—"}</td><td className="py-3 px-4"><Badge tone="brand">{e.tipo}</Badge></td><td className="py-3 px-4"><Badge tone={e.ativo ? "green" : "slate"}>{e.ativo ? "Ativo" : "Inativo"}</Badge></td></tr>)}</tbody></table></div></Card>
      </div>}

      {tab === "tarifas" && <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
        <div id="editor-tarifa-bairro">
        <Card className="p-5"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">{bairroOriginal ? "Editar bairro" : "Adicionar bairro"}</h3><p className="text-xs text-slate-400 mt-0.5 mb-4">Informe pelo menos um preço; o outro poderá ser incluído depois</p><form onSubmit={salvarTarifa} className="flex flex-col gap-3"><label className="text-xs text-slate-500">Bairro / destino<input id="bairro-tarifa" value={bairroCadastro} onChange={e => setBairroCadastro(e.target.value)} placeholder="Nome do bairro" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label><label className="text-xs text-slate-500">Moto City (R$)<input inputMode="decimal" value={valorMotoCity} onChange={e => setValorMotoCity(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label><label className="text-xs text-slate-500">ZUPT (R$)<input inputMode="decimal" value={valorZupt} onChange={e => setValorZupt(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label><div className="grid grid-cols-2 gap-2"><button className="rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2.5">{bairroOriginal ? "Salvar alteração" : "Adicionar bairro"}</button><button type="button" onClick={limparTarifa} className="rounded-xl border border-slate-200 dark:border-slate-600 text-sm px-4 py-2.5">{bairroOriginal ? "Cancelar edição" : "Limpar"}</button></div></form></Card>
        </div>
        <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Tabela comparativa por bairro</h3><p className="text-xs text-slate-400 mt-0.5">{tarifas.length} destinos importados das tabelas ZUPT e Moto City</p></div><div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2"><Search size={14} className="text-slate-400" /><input value={buscaTarifa} onChange={e => setBuscaTarifa(e.target.value)} placeholder="Buscar bairro..." className="bg-transparent outline-none text-sm w-44" /></div></div><div className="overflow-x-auto max-h-[640px]"><table className="w-full text-sm min-w-[620px]"><thead className="sticky top-0 bg-white dark:bg-slate-800 z-10"><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Bairro / destino</th><th className="py-2.5 px-4 font-medium text-right">Moto City</th><th className="py-2.5 px-4 font-medium text-right">ZUPT</th><th className="py-2.5 px-4 font-medium text-right">Melhor valor</th><th className="py-2.5 px-4"></th></tr></thead><tbody>{tarifasFiltradas.map(t => { const disponiveis = Object.values(t.valores).filter(v => Number(v) > 0); const menor = disponiveis.length ? Math.min(...disponiveis) : null; return <tr key={t.bairro} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{t.bairro}</td>{["Moto City", "Zupt"].map(empresa => <td key={empresa} className={cx("py-3 px-4 text-right", t.valores[empresa] === menor ? "text-emerald-600 font-semibold" : "text-slate-500")}>{t.valores[empresa] ? dinheiro(t.valores[empresa]) : "—"}</td>)}<td className="py-3 px-4 text-right">{menor == null ? "—" : <Badge tone="green">{dinheiro(menor)}</Badge>}</td><td className="py-3 px-4 text-right"><button type="button" onClick={() => editarTarifa(t)} className="rounded-lg border border-[#7A1420]/30 bg-red-50 dark:bg-red-500/10 text-[#7A1420] dark:text-red-300 text-xs font-medium px-3 py-1.5 hover:bg-red-100 dark:hover:bg-red-500/20">Editar</button></td></tr>; })}</tbody></table></div></Card>
      </div>}
    </div>
  );
}

function Operacional({ erros, cancelamentos, fichas, estoqueItens, caixaAberto, onRegistrarErro, onRegistrarCancelamento }) {
  const [tab, setTab] = useState("cancelamentos");
  const [turno, setTurno] = useState("Noturno");
  const [motivo, setMotivo] = useState("Cliente não localizado");
  const [responsavelArea, setResponsavelArea] = useState("Cliente");
  const [valorPedido, setValorPedido] = useState("");
  const [clienteFicou, setClienteFicou] = useState("SIM");
  const [solucionado, setSolucionado] = useState("SIM");
  const [taxaExtra, setTaxaExtra] = useState("");
  const [estorno, setEstorno] = useState("");
  const [recuperado, setRecuperado] = useState("");
  const [fichaId, setFichaId] = useState("");
  const [qtdPerdida, setQtdPerdida] = useState("1");
  const [observacao, setObservacao] = useState("");
  const [debitarCaixa, setDebitarCaixa] = useState(true);
  const [equipe, setEquipe] = useState("Cozinha");
  const [tipoErro, setTipoErro] = useState("");
  const [descricaoErro, setDescricaoErro] = useState("");
  const [tempoPreparo, setTempoPreparo] = useState("");
  const [tempoEntrega, setTempoEntrega] = useState("");
  const [usuario, setUsuario] = useState("Alana");
  const [turnoErro, setTurnoErro] = useState("Noturno");
  const [feedback, setFeedback] = useState(null);

  const numero = valor => Number(String(valor || 0).replace(",", ".")) || 0;
  const ficha = fichas.find(f => f.id === fichaId);
  const quantidadePerdida = Math.max(0, numero(qtdPerdida));
  const perdaProduto = custoFicha(ficha, estoqueItens) * quantidadePerdida;
  const valoresCancelamento = { taxaExtra: numero(taxaExtra), estorno: numero(estorno), recuperado: numero(recuperado), perdaProduto };
  const prejuizoPreview = calcularPrejuizo(valoresCancelamento);
  const dinheiro = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const prejuizoTotal = cancelamentos.reduce((t, c) => t + c.prejuizoFinal, 0);
  const recuperadoTotal = cancelamentos.reduce((t, c) => t + c.recuperado, 0);

  function registrarCancelamento(e) {
    e.preventDefault();
    if (!motivo || !responsavelArea || !numero(valorPedido)) {
      setFeedback({ tone: "red", text: "Informe motivo, responsável e valor do pedido." });
      return;
    }
    const resultado = onRegistrarCancelamento({
      turno, motivo, responsavelArea, valorPedido: numero(valorPedido), clienteFicou: clienteFicou === "SIM", solucionado: solucionado === "SIM",
      ...valoresCancelamento, fichaId: ficha?.id ?? null, qtdPerdida: ficha ? quantidadePerdida : 0, observacao: observacao.trim(), debitarCaixa,
    });
    setFeedback(resultado);
    if (resultado.tone === "green") {
      setValorPedido(""); setTaxaExtra(""); setEstorno(""); setRecuperado(""); setFichaId(""); setQtdPerdida("1"); setObservacao("");
    }
  }

  function registrarErro(e) {
    e.preventDefault();
    if (!tipoErro.trim() || !descricaoErro.trim() || !usuario.trim()) {
      setFeedback({ tone: "red", text: "Informe tipo, descrição e usuário responsável pelo registro." });
      return;
    }
    const resultado = onRegistrarErro({ equipe, tipo: tipoErro.trim(), descricao: descricaoErro.trim(), tempoPreparo: numero(tempoPreparo), tempoEntrega: numero(tempoEntrega), usuario: usuario.trim(), turno: turnoErro });
    setFeedback(resultado);
    if (resultado.tone === "green") { setTipoErro(""); setDescricaoErro(""); setTempoPreparo(""); setTempoEntrega(""); }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Controle operacional</h2><p className="text-sm text-slate-500 dark:text-slate-400">Erros, cancelamentos, perdas, recuperação e responsáveis</p></div>
        <Badge tone={caixaAberto ? "green" : "amber"}>{caixaAberto ? `${caixaAberto.id} disponível para estornos` : "Caixa fechado"}</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Cancelamentos" value={String(cancelamentos.length)} delta="Registros no período" positive={false} icon={XCircle} />
        <KPI label="Prejuízo apurado" value={dinheiro(prejuizoTotal)} delta="Nunca abaixo de zero" positive={false} icon={TrendingDown} />
        <KPI label="Valor recuperado" value={dinheiro(recuperadoTotal)} delta="Compensações e recuperações" positive icon={TrendingUp} />
        <KPI label="Erros registrados" value={String(erros.length)} delta={`${erros.filter(e => e.equipe === "Cozinha").length} relacionados à cozinha`} positive={false} icon={AlertTriangle} />
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <button onClick={() => setTab("cancelamentos")} className={cx("px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap", tab === "cancelamentos" ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>Cancelamentos e perdas</button>
        <button onClick={() => setTab("erros")} className={cx("px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap", tab === "erros" ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>Erros operacionais</button>
      </div>

      {feedback && <div className={cx("rounded-xl border px-4 py-3 text-sm", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300")}>{feedback.text}</div>}

      {tab === "cancelamentos" && <>
        <Card className="p-5">
          <div className="mb-4"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Registrar cancelamento</h3><p className="text-xs text-slate-400 mt-0.5">A baixa do produto e o lançamento financeiro são validados antes de salvar</p></div>
          <form onSubmit={registrarCancelamento} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <label className="text-xs text-slate-500">Turno<select value={turno} onChange={e => setTurno(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]"><option>Matutino</option><option>Noturno</option><option>Integral</option></select></label>
            <label className="text-xs text-slate-500">Motivo<select value={motivo} onChange={e => setMotivo(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]"><option>Cliente não localizado</option><option>Problema na qualidade</option><option>Prato errado</option><option>Pedido duplicado</option><option>Atraso excessivo</option><option>Outro</option></select></label>
            <label className="text-xs text-slate-500">Responsável principal<select value={responsavelArea} onChange={e => setResponsavelArea(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]"><option>Cliente</option><option>Cozinha</option><option>Moto</option><option>Atendimento</option><option>Plataforma</option></select></label>
            <label className="text-xs text-slate-500">Valor do pedido (R$)<input inputMode="decimal" value={valorPedido} onChange={e => setValorPedido(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
            <label className="text-xs text-slate-500">Cliente permaneceu?<select value={clienteFicou} onChange={e => setClienteFicou(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]"><option>SIM</option><option>NÃO</option></select></label>
            <label className="text-xs text-slate-500">Foi solucionado?<select value={solucionado} onChange={e => setSolucionado(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]"><option>SIM</option><option>NÃO</option></select></label>
            <label className="text-xs text-slate-500">Taxa extra (R$)<input inputMode="decimal" value={taxaExtra} onChange={e => setTaxaExtra(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
            <label className="text-xs text-slate-500">Estorno (R$)<input inputMode="decimal" value={estorno} onChange={e => setEstorno(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
            <label className="text-xs text-slate-500">Valor recuperado (R$)<input inputMode="decimal" value={recuperado} onChange={e => setRecuperado(e.target.value)} placeholder="0,00" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
            <label className="text-xs text-slate-500">Produto perdido<select value={fichaId} onChange={e => setFichaId(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]"><option value="">Sem perda de produto</option>{fichas.map(f => <option key={f.id} value={f.id}>{f.prato}</option>)}</select></label>
            <label className="text-xs text-slate-500">Quantidade perdida<input type="number" min="0" step="1" disabled={!ficha} value={qtdPerdida} onChange={e => setQtdPerdida(e.target.value)} className="mt-1 w-full disabled:opacity-50 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-700/30 px-3 py-2.5"><div className="text-[10px] uppercase text-slate-400">Perda de produto</div><div className="text-sm font-semibold text-rose-600">{dinheiro(perdaProduto)}</div></div>
            <label className="text-xs text-slate-500 sm:col-span-2 xl:col-span-4">Observação<textarea value={observacao} onChange={e => setObservacao(e.target.value)} rows={2} className="mt-1 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
            <label className="sm:col-span-2 xl:col-span-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" checked={debitarCaixa} onChange={e => setDebitarCaixa(e.target.checked)} className="accent-[#7A1420]" />Lançar estorno e taxa extra no caixa aberto</label>
            <div className="sm:col-span-2 xl:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-2"><div className="rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3"><div className="text-[10px] uppercase text-slate-400">Estorno + taxa</div><div className="font-semibold text-sm">{dinheiro(valoresCancelamento.estorno + valoresCancelamento.taxaExtra)}</div></div><div className="rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3"><div className="text-[10px] uppercase text-slate-400">Produto perdido</div><div className="font-semibold text-sm">{dinheiro(perdaProduto)}</div></div><div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-3"><div className="text-[10px] uppercase text-slate-400">Recuperado</div><div className="font-semibold text-sm text-emerald-600">− {dinheiro(valoresCancelamento.recuperado)}</div></div><div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 p-3"><div className="text-[10px] uppercase text-slate-400">Prejuízo final</div><div className="font-semibold text-sm text-rose-600">{dinheiro(prejuizoPreview)}</div></div></div>
            <button className="sm:col-span-2 xl:col-span-4 rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-5 py-2.5">Validar e registrar cancelamento</button>
          </form>
        </Card>

        <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Histórico de cancelamentos</h3></div><div className="overflow-x-auto"><table className="w-full text-sm min-w-[1050px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Registro</th><th className="py-2.5 px-4 font-medium">Motivo</th><th className="py-2.5 px-4 font-medium">Responsável</th><th className="py-2.5 px-4 font-medium">Turno</th><th className="py-2.5 px-4 font-medium text-right">Pedido</th><th className="py-2.5 px-4 font-medium text-right">Estorno/taxa</th><th className="py-2.5 px-4 font-medium text-right">Produto</th><th className="py-2.5 px-4 font-medium text-right">Recuperado</th><th className="py-2.5 px-4 font-medium text-right">Prejuízo</th><th className="py-2.5 px-4 font-medium">Status</th></tr></thead><tbody>{cancelamentos.map(c => <tr key={c.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4"><div className="font-mono text-xs text-slate-400">{c.id}</div><div className="text-[11px] text-slate-400">{c.dataHora}</div></td><td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{c.motivo}</td><td className="py-3 px-4 text-slate-500">{c.responsavelArea}</td><td className="py-3 px-4 text-slate-500">{c.turno}</td><td className="py-3 px-4 text-right">{dinheiro(c.valorPedido)}</td><td className="py-3 px-4 text-right">{dinheiro(c.estorno + c.taxaExtra)}</td><td className="py-3 px-4 text-right">{dinheiro(c.perdaProduto)}</td><td className="py-3 px-4 text-right text-emerald-600">{dinheiro(c.recuperado)}</td><td className="py-3 px-4 text-right font-semibold text-rose-600">{dinheiro(c.prejuizoFinal)}</td><td className="py-3 px-4"><Badge tone={c.solucionado ? "green" : "red"}>{c.solucionado ? "Solucionado" : "Pendente"}</Badge></td></tr>)}</tbody></table></div></Card>
      </>}

      {tab === "erros" && <>
        <Card className="p-5"><div className="mb-4"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Registrar erro operacional</h3><p className="text-xs text-slate-400 mt-0.5">Use tempos em minutos para comparar cozinha e entrega</p></div><form onSubmit={registrarErro} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"><label className="text-xs text-slate-500">Equipe<select value={equipe} onChange={e => setEquipe(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]"><option>Cozinha</option><option>Moto</option><option>Atendimento</option><option>Plataforma</option><option>Outro</option></select></label><label className="text-xs text-slate-500">Turno<select value={turnoErro} onChange={e => setTurnoErro(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]"><option>Matutino</option><option>Noturno</option><option>Integral</option></select></label><label className="text-xs text-slate-500">Tipo do erro<input value={tipoErro} onChange={e => setTipoErro(e.target.value)} placeholder="Ex.: prato errado" className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label><label className="text-xs text-slate-500">Usuário<input value={usuario} onChange={e => setUsuario(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label><label className="text-xs text-slate-500">Preparo (min)<input type="number" min="0" value={tempoPreparo} onChange={e => setTempoPreparo(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label><label className="text-xs text-slate-500">Entrega (min)<input type="number" min="0" value={tempoEntrega} onChange={e => setTempoEntrega(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label><label className="text-xs text-slate-500 sm:col-span-2">Descrição<input value={descricaoErro} onChange={e => setDescricaoErro(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label><button className="sm:col-span-2 xl:col-span-4 rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-5 py-2.5">Registrar erro</button></form></Card>
        <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Histórico de erros</h3></div><div className="overflow-x-auto"><table className="w-full text-sm min-w-[850px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Registro</th><th className="py-2.5 px-4 font-medium">Equipe</th><th className="py-2.5 px-4 font-medium">Tipo</th><th className="py-2.5 px-4 font-medium">Descrição</th><th className="py-2.5 px-4 font-medium text-right">Preparo</th><th className="py-2.5 px-4 font-medium text-right">Entrega</th><th className="py-2.5 px-4 font-medium">Usuário</th><th className="py-2.5 px-4 font-medium">Turno</th></tr></thead><tbody>{erros.map(e => <tr key={e.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4"><div className="font-mono text-xs text-slate-400">{e.id}</div><div className="text-[11px] text-slate-400">{e.dataHora}</div></td><td className="py-3 px-4"><Badge tone={e.equipe === "Cozinha" ? "red" : e.equipe === "Moto" ? "amber" : "slate"}>{e.equipe}</Badge></td><td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{e.tipo}</td><td className="py-3 px-4 text-slate-500 max-w-[260px]">{e.descricao}</td><td className="py-3 px-4 text-right">{e.tempoPreparo || "—"}{e.tempoPreparo ? " min" : ""}</td><td className="py-3 px-4 text-right">{e.tempoEntrega || "—"}{e.tempoEntrega ? " min" : ""}</td><td className="py-3 px-4 text-slate-500">{e.usuario}</td><td className="py-3 px-4 text-slate-500">{e.turno}</td></tr>)}</tbody></table></div></Card>
      </>}
    </div>
  );
}

function RelatoriosOperacionais({ plataformas, corridas, cancelamentos, erros, ordens, caixas, estoqueItens, fechamentos, onFecharDia }) {
  const agoraLocal = new Date();
  const hoje = `${agoraLocal.getFullYear()}-${String(agoraLocal.getMonth() + 1).padStart(2, "0")}-${String(agoraLocal.getDate()).padStart(2, "0")}`;
  const [tab, setTab] = useState("diario");
  const [data, setData] = useState(hoje);
  const [turno, setTurno] = useState("Noturno");
  const [responsavel, setResponsavel] = useState("Alana");
  const [feedback, setFeedback] = useState(null);
  const [fechamentoSelecionado, setFechamentoSelecionado] = useState(fechamentos[0]?.id ?? "");

  const plataformasFiltradas = plataformas.filter(p => p.data === data && p.turno === turno);
  const total = (campo, dados = plataformasFiltradas) => dados.reduce((soma, item) => soma + (item[campo] || 0), 0);
  const faturamento = total("faturamento");
  const pedidos = total("pedidos");
  const taxasEntrega = total("taxasEntrega");
  const ticketMedio = pedidos ? faturamento / pedidos : 0;
  const gastoMotos = corridas.reduce((soma, corrida) => soma + corrida.valor, 0);
  const prejuizo = cancelamentos.reduce((soma, cancelamento) => soma + cancelamento.prejuizoFinal, 0);
  const producaoFinalizada = ordens.filter(o => o.status === "concluidas").reduce((soma, o) => soma + o.qtd, 0);
  const ordensAbertas = ordens.filter(o => o.status !== "concluidas");
  const caixaAberto = caixas.find(c => c.status === "aberto");
  const ultimoCaixaFechado = caixas.find(c => c.status === "fechado" && c.turno === turno) ?? caixas.find(c => c.status === "fechado");
  const estoqueCritico = estoqueItens.filter(i => i.status === "critico" || i.status === "baixo");
  const podeFechar = !caixaAberto && ordensAbertas.length === 0;
  const fechamentoAtual = fechamentos.find(f => f.id === fechamentoSelecionado) ?? fechamentos[0];
  const dinheiro = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function fecharDia() {
    const resultado = onFecharDia({ data, turno, responsavel: responsavel.trim() || "Responsável não informado" });
    setFeedback(resultado);
    if (resultado.tone === "green") { setTab("historico"); setFechamentoSelecionado(resultado.id); }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Fechamento e dashboard diário</h2><p className="text-sm text-slate-500 dark:text-slate-400">Visão consolidada de vendas, caixa, motos, produção, perdas e estoque</p></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <label className="text-[11px] text-slate-500">Data<input type="date" value={data} onChange={e => setData(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-[#7A1420]" /></label>
          <label className="text-[11px] text-slate-500">Turno<select value={turno} onChange={e => setTurno(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-[#7A1420]"><option>Matutino</option><option>Noturno</option><option>Integral</option></select></label>
          <label className="text-[11px] text-slate-500 col-span-2 sm:col-span-1">Responsável<input value={responsavel} onChange={e => setResponsavel(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none focus:border-[#7A1420]" /></label>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {[["diario", "Dashboard diário"], ["fechamento", "Realizar fechamento"], ["historico", "Histórico"]].map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={cx("px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap", tab === key ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>{label}</button>)}
      </div>

      {feedback && <div className={cx("rounded-xl border px-4 py-3 text-sm", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300")}>{feedback.text}</div>}

      {tab === "diario" && <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Faturamento" value={dinheiro(faturamento)} delta={`${pedidos} pedidos`} positive icon={TrendingUp} />
          <KPI label="Ticket médio" value={dinheiro(ticketMedio)} delta={`${plataformasFiltradas.length} plataformas`} positive icon={ShoppingCart} />
          <KPI label="Gasto com motos" value={dinheiro(gastoMotos)} delta={`${corridas.length} corridas`} positive={false} icon={Bike} />
          <KPI label="Prejuízo operacional" value={dinheiro(prejuizo)} delta={`${cancelamentos.length} cancelamentos`} positive={false} icon={AlertTriangle} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="p-5 xl:col-span-2"><div className="flex items-center justify-between mb-4"><div><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Faturamento por plataforma</h3><p className="text-xs text-slate-400 mt-0.5">Dados filtrados pela data e turno selecionados</p></div><Badge tone="slate">{data} · {turno}</Badge></div>{plataformasFiltradas.length ? <ResponsiveContainer width="100%" height={230}><BarChart data={plataformasFiltradas}><XAxis dataKey="plataforma" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip formatter={value => dinheiro(value)} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }} /><Bar dataKey="faturamento" fill="#7A1420" radius={[6, 6, 0, 0]} barSize={32} /></BarChart></ResponsiveContainer> : <div className="h-[230px] flex items-center justify-center text-sm text-slate-400">Nenhum dado importado para esta data e turno.</div>}</Card>
          <Card className="p-5"><h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Saúde operacional</h3><div className="flex flex-col gap-3"><div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3"><span className="text-sm text-slate-500">Taxas de entrega</span><span className="font-semibold text-sm">{dinheiro(taxasEntrega)}</span></div><div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3"><span className="text-sm text-slate-500">Produção concluída</span><span className="font-semibold text-sm">{producaoFinalizada.toLocaleString("pt-BR")} un.</span></div><div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3"><span className="text-sm text-slate-500">Erros operacionais</span><Badge tone={erros.length ? "amber" : "green"}>{erros.length}</Badge></div><div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3"><span className="text-sm text-slate-500">Estoque baixo/crítico</span><Badge tone={estoqueCritico.length ? "red" : "green"}>{estoqueCritico.length}</Badge></div><div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3"><span className="text-sm text-slate-500">Status do fechamento</span><Badge tone={podeFechar ? "green" : "amber"}>{podeFechar ? "Pronto" : "Pendências"}</Badge></div></div></Card>
        </div>

        <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Resumo por plataforma</h3></div><div className="overflow-x-auto"><table className="w-full text-sm min-w-[680px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Plataforma</th><th className="py-2.5 px-4 font-medium text-right">Pedidos</th><th className="py-2.5 px-4 font-medium text-right">Vendas</th><th className="py-2.5 px-4 font-medium text-right">Taxas entrega</th><th className="py-2.5 px-4 font-medium text-right">Faturamento</th><th className="py-2.5 px-4 font-medium text-right">Ticket médio</th></tr></thead><tbody>{plataformasFiltradas.map(p => <tr key={`${p.data}-${p.turno}-${p.plataforma}`} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{p.plataforma}</td><td className="py-3 px-4 text-right">{p.pedidos}</td><td className="py-3 px-4 text-right">{dinheiro(p.vendas)}</td><td className="py-3 px-4 text-right">{dinheiro(p.taxasEntrega)}</td><td className="py-3 px-4 text-right font-semibold">{dinheiro(p.faturamento)}</td><td className="py-3 px-4 text-right">{dinheiro(p.pedidos ? p.faturamento / p.pedidos : 0)}</td></tr>)}</tbody><tfoot><tr className="bg-slate-50 dark:bg-slate-700/30 font-semibold"><td className="py-3 px-4">TOTAL</td><td className="py-3 px-4 text-right">{pedidos}</td><td className="py-3 px-4 text-right">{dinheiro(total("vendas"))}</td><td className="py-3 px-4 text-right">{dinheiro(taxasEntrega)}</td><td className="py-3 px-4 text-right">{dinheiro(faturamento)}</td><td className="py-3 px-4 text-right">{dinheiro(ticketMedio)}</td></tr></tfoot></table></div></Card>
      </>}

      {tab === "fechamento" && <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-3"><div className={cx("w-10 h-10 rounded-xl flex items-center justify-center", caixaAberto ? "bg-amber-50 dark:bg-amber-500/10" : "bg-emerald-50 dark:bg-emerald-500/10")}>{caixaAberto ? <Clock size={18} className="text-amber-500" /> : <CheckCircle2 size={18} className="text-emerald-500" />}</div><div><div className="text-sm font-semibold">Caixa do turno</div><div className="text-xs text-slate-400">{caixaAberto ? `${caixaAberto.id} ainda está aberto` : `Fechado · ${ultimoCaixaFechado?.id ?? "sem registro"}`}</div></div></Card>
          <Card className="p-4 flex items-center gap-3"><div className={cx("w-10 h-10 rounded-xl flex items-center justify-center", ordensAbertas.length ? "bg-amber-50 dark:bg-amber-500/10" : "bg-emerald-50 dark:bg-emerald-500/10")}>{ordensAbertas.length ? <Loader2 size={18} className="text-amber-500" /> : <CheckCircle2 size={18} className="text-emerald-500" />}</div><div><div className="text-sm font-semibold">Produção</div><div className="text-xs text-slate-400">{ordensAbertas.length ? `${ordensAbertas.length} ordens ainda abertas` : "Todas as ordens concluídas"}</div></div></Card>
          <Card className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center"><Boxes size={18} className="text-[#7A1420] dark:text-red-300" /></div><div><div className="text-sm font-semibold">Fotografia do estoque</div><div className="text-xs text-slate-400">{estoqueItens.length} itens serão congelados</div></div></Card>
        </div>

        {!podeFechar && <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300 px-4 py-3 text-sm">Finalize o caixa e todas as ordens de produção antes de realizar o fechamento diário.</div>}

        <Card className="p-5"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><h3 className="font-semibold text-slate-900 dark:text-white">Fechamento de {new Date(data + "T00:00:00").toLocaleDateString("pt-BR")} · {turno}</h3><p className="text-xs text-slate-400 mt-1">O fechamento salvará os indicadores e as quantidades atuais como uma fotografia que não muda com lançamentos futuros.</p></div><button onClick={fecharDia} className={cx("rounded-xl text-white text-sm font-medium px-6 py-3 whitespace-nowrap", podeFechar ? "bg-[#7A1420] hover:bg-[#611018]" : "bg-slate-400 cursor-not-allowed")}>Validar e concluir fechamento</button></div></Card>

        <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between"><div><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Prévia do estoque final</h3><p className="text-xs text-slate-400 mt-0.5">Valores que serão gravados no fechamento</p></div><Badge tone={estoqueCritico.length ? "red" : "green"}>{estoqueCritico.length} alertas</Badge></div><div className="overflow-x-auto max-h-[420px]"><table className="w-full text-sm min-w-[620px]"><thead className="sticky top-0 bg-white dark:bg-slate-800"><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Código</th><th className="py-2.5 px-4 font-medium">Item</th><th className="py-2.5 px-4 font-medium text-right">Estoque final</th><th className="py-2.5 px-4 font-medium">Unidade</th><th className="py-2.5 px-4 font-medium">Status</th></tr></thead><tbody>{estoqueItens.map(i => <tr key={i.cod} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-mono text-xs text-slate-400">{i.cod}</td><td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{i.nome}</td><td className="py-3 px-4 text-right">{i.qtd.toLocaleString("pt-BR")}</td><td className="py-3 px-4 text-slate-400">{i.un}</td><td className="py-3 px-4"><Badge tone={i.status === "ok" ? "green" : i.status === "critico" ? "red" : "amber"}>{i.status === "ok" ? "Normal" : i.status === "critico" ? "Crítico" : "Baixo"}</Badge></td></tr>)}</tbody></table></div></Card>
      </>}

      {tab === "historico" && <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-4">
        <Card className="p-3 flex flex-col gap-2 h-fit">{fechamentos.map(f => <button key={f.id} onClick={() => setFechamentoSelecionado(f.id)} className={cx("text-left rounded-xl border p-3 transition-colors", fechamentoAtual?.id === f.id ? "border-[#7A1420] bg-red-50 dark:bg-red-500/10" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/30")}><div className="flex items-center justify-between"><span className="font-mono text-xs text-slate-400">{f.id}</span><Badge tone="green">Fechado</Badge></div><div className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-2">{new Date(f.data + "T00:00:00").toLocaleDateString("pt-BR")} · {f.turno}</div><div className="text-xs text-slate-400 mt-0.5">{f.responsavel} · {dinheiro(f.resumo.faturamento)}</div></button>)}</Card>
        {fechamentoAtual ? <div className="flex flex-col gap-4"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><KPI label="Faturamento" value={dinheiro(fechamentoAtual.resumo.faturamento)} delta={`${fechamentoAtual.resumo.pedidos} pedidos`} positive icon={TrendingUp} /><KPI label="Ticket médio" value={dinheiro(fechamentoAtual.resumo.ticketMedio)} delta={fechamentoAtual.turno} positive icon={ShoppingCart} /><KPI label="Motos" value={dinheiro(fechamentoAtual.resumo.gastoMotos)} delta="Fotografia do fechamento" positive={false} icon={Bike} /><KPI label="Prejuízo" value={dinheiro(fechamentoAtual.resumo.prejuizo)} delta={`${fechamentoAtual.resumo.erros} erros`} positive={false} icon={AlertTriangle} /></div><Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-sm">Estoque congelado em {fechamentoAtual.criadoEm}</h3></div><div className="overflow-x-auto"><table className="w-full text-sm min-w-[520px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Código</th><th className="py-2.5 px-4 font-medium">Item</th><th className="py-2.5 px-4 font-medium text-right">Quantidade</th><th className="py-2.5 px-4 font-medium">Status</th></tr></thead><tbody>{fechamentoAtual.estoque.map(i => <tr key={i.cod} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-mono text-xs text-slate-400">{i.cod}</td><td className="py-3 px-4 font-medium">{i.nome}</td><td className="py-3 px-4 text-right">{i.qtd.toLocaleString("pt-BR")} {i.un}</td><td className="py-3 px-4"><Badge tone={i.status === "ok" ? "green" : i.status === "critico" ? "red" : "amber"}>{i.status}</Badge></td></tr>)}</tbody></table></div></Card></div> : <Card className="p-10 text-center text-slate-400">Nenhum fechamento selecionado.</Card>}
      </div>}
    </div>
  );
}

function CotacaoCard({ cot }) {
  const respondidas = cot.fornecedores.filter(f => f.preco != null);
  const melhorIdx = useMemo(() => {
    let melhor = -1;
    cot.fornecedores.forEach((fornecedor, indice) => {
      if (fornecedor.preco == null) return;
      if (melhor < 0 || scoreFornecedor(fornecedor, cot.quantidade) < scoreFornecedor(cot.fornecedores[melhor], cot.quantidade)) melhor = indice;
    });
    return melhor;
  }, [cot]);
  const dinheiro = valor => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400">{cot.id}</span>
            <Badge tone={respondidas.length ? "green" : "amber"}>{respondidas.length} de {cot.fornecedores.length} responderam</Badge>
            <Badge tone="brand">Status automático via WhatsApp</Badge>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mt-1">{cot.item}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Solicitação aberta em {cot.aberta} · fornecedores acompanhados individualmente</p>
        </div>
        {respondidas.length < cot.fornecedores.length && (
          <button className="flex items-center gap-1.5 text-xs font-medium text-[#7A1420] dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-lg px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 whitespace-nowrap">
            <Send size={12} /> Reenviar pendentes
          </button>
        )}
      </div>

      <div className="overflow-x-auto -mx-5">
        <table className="w-full text-sm min-w-[1120px]">
          <thead>
            <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
              <th className="py-2 px-5 font-medium">Status</th>
              <th className="py-2 px-5 font-medium">Fornecedor</th>
              <th className="py-2 px-5 font-medium text-right">Preço/un.</th>
              <th className="py-2 px-5 font-medium text-right">Frete</th>
              <th className="py-2 px-5 font-medium">Imposto</th>
              <th className="py-2 px-5 font-medium">Forma de pagamento</th>
              <th className="py-2 px-5 font-medium text-right">Entrega</th>
              <th className="py-2 px-5 font-medium text-right">Custo total</th>
              <th className="py-2 px-5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {cot.fornecedores.map((f, i) => {
              const respondeu = f.preco != null;
              const statusResposta = !respondeu ? "Aguardando automática" : f.origemResposta === "WHATSAPP" ? "Respondido automático" : f.origemResposta === "MANUAL" ? "Respondido manual" : "Respondido";
              return (
                <tr key={f.id || f.nome} className={cx("border-b border-slate-50 dark:border-slate-700/50", i === melhorIdx && "bg-emerald-50/60 dark:bg-emerald-500/5")}>
                  <td className="py-3 px-5"><Badge tone={respondeu ? "green" : "amber"}>{statusResposta}</Badge></td>
                  <td className="py-3 px-5 text-slate-800 dark:text-slate-200 font-medium">{f.nome}</td>
                  <td className="py-3 px-5 text-right text-slate-700 dark:text-slate-300">{respondeu ? dinheiro(f.preco) : "—"}</td>
                  <td className="py-3 px-5 text-right text-slate-500 dark:text-slate-400">{!respondeu ? "—" : Number(f.frete || 0) === 0 ? "Grátis" : dinheiro(f.frete)}</td>
                  <td className="py-3 px-5">{!respondeu ? "—" : f.impostoIncluso == null ? <Badge tone="amber">Não informado</Badge> : <Badge tone={f.impostoIncluso ? "green" : "red"}>{f.impostoIncluso ? "Incluso" : "Não incluso"}</Badge>}</td>
                  <td className="py-3 px-5 text-slate-500 dark:text-slate-400">{respondeu ? (f.formaPagamento || f.condicoes || "Não informado") : "—"}</td>
                  <td className="py-3 px-5 text-right text-slate-500 dark:text-slate-400">{respondeu && f.prazo != null ? f.prazo + " dias" : "—"}</td>
                  <td className="py-3 px-5 text-right font-semibold">{respondeu ? dinheiro(scoreFornecedor(f, cot.quantidade)) : "—"}</td>
                  <td className="py-3 px-5 text-right">{i === melhorIdx && <Badge tone="green"><span className="inline-flex items-center gap-1"><Trophy size={11} /> Menor custo</span></Badge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {melhorIdx >= 0 && (
        <div className="flex justify-end mt-4">
          <button className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-colors">
            <CheckCircle2 size={13} /> Gerar pedido de compra com {cot.fornecedores[melhorIdx].nome}
          </button>
        </div>
      )}
    </Card>
  );
}
function CotacaoResumo({ cotacao, onEnviar }) {
  const respondidas = cotacao.fornecedores.filter(f => f.preco != null).sort((a, b) => scoreFornecedor(a, cotacao.quantidade) - scoreFornecedor(b, cotacao.quantidade));
  const melhor = respondidas[0];
  const total = melhor ? scoreFornecedor(melhor, cotacao.quantidade) : null;
  const dinheiro = valor => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div><div className="flex items-center gap-2 flex-wrap"><span className="font-mono text-xs text-slate-400">{cotacao.id}</span><Badge tone={melhor ? "green" : "amber"}>{melhor ? "Menor custo calculado" : "Aguardando respostas"}</Badge><Badge tone="brand">{respondidas.length} de {cotacao.fornecedores.length} responderam</Badge></div><div className="font-semibold text-sm text-slate-900 dark:text-white mt-1">{cotacao.item} · {Number(cotacao.quantidade).toLocaleString("pt-BR")} {cotacao.unidade}</div><div className="text-xs text-slate-400">Saldo {Number(cotacao.estoqueAtual || 0).toLocaleString("pt-BR")} · mínimo {Number(cotacao.estoqueMinimo || 0).toLocaleString("pt-BR")}</div></div>
        <div className="flex items-center gap-3 flex-wrap"><div className="text-right"><div className="text-[10px] uppercase text-slate-400">Menor custo total</div><div className="font-semibold text-sm">{total == null ? "—" : dinheiro(total)}</div></div><button onClick={() => onEnviar(cotacao)} className="rounded-xl border border-[#7A1420] text-[#7A1420] dark:text-red-300 text-xs font-medium px-3 py-2"><Send size={12} className="inline mr-1" />WhatsApp</button></div>
      </div>
      <CotacaoCard cot={cotacao} />
    </div>
  );
}
function CotacoesInteligentes({ estoqueItens, apiStatus }) {
  const [lista, setLista] = useState(cotacoes);
  const [selecionados, setSelecionados] = useState({});
  const [fornecedoresApi, setFornecedoresApi] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [novoFornecedorNome, setNovoFornecedorNome] = useState("");
  const [novoFornecedorTelefone, setNovoFornecedorTelefone] = useState("");
  const [fornecedoresLocais, setFornecedoresLocais] = useState(() => {
    try { return JSON.parse(localStorage.getItem("imperial.quoteSuppliers.v1") || "[]"); }
    catch { return []; }
  });
  const dinheiro = valor => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const alertas = useMemo(() => estoqueItens.filter(i => Number(i.min) > 0 && Number(i.qtd) <= Number(i.min)).map(i => ({ ...i, comprar: Math.max(0, Number(i.min) - Number(i.qtd)), estimado: Math.max(0, Number(i.min) - Number(i.qtd)) * Number(i.custo || 0) })).sort((a, b) => a.qtd / a.min - b.qtd / b.min), [estoqueItens]);
  const estimado = alertas.reduce((total, item) => total + item.estimado, 0);

  useEffect(() => {
    if (apiStatus !== "online") return;
    let ativo = true;
    async function atualizar() {
      try {
        const painel = await api.getPainelCotacoes();
        if (!ativo) return;
        setFornecedoresApi(painel.fornecedores || []);
        if (painel.cotacoes?.length) setLista(painel.cotacoes.map(c => ({ id: c.codigo, item: c.item, quantidade: c.quantidade, unidade: c.unidade, estoqueAtual: c.estoqueAtual, estoqueMinimo: c.estoqueMinimo, aberta: new Date(c.criadoEm).toLocaleDateString("pt-BR"), status: c.status, fornecedores: c.propostas.map(p => ({ id: p.id, nome: p.fornecedor, preco: p.precoUnitario, prazo: p.prazoDias, frete: p.frete, condicoes: p.condicoes, formaPagamento: p.formaPagamento || p.condicoes, impostoIncluso: p.impostoIncluso, origemResposta: p.origemResposta, respondidaEm: p.respondidaEm })) })));
      } catch (error) { if (ativo) setFeedback({ tone: "red", text: error?.message || "Falha ao atualizar cotações." }); }
    }
    atualizar();
    const timer = setInterval(atualizar, 10000);
    return () => { ativo = false; clearInterval(timer); };
  }, [apiStatus]);

  async function cadastrarFornecedor(e) {
    e.preventDefault();
    const telefone = novoFornecedorTelefone.replace(/\D/g, "");
    if (novoFornecedorNome.trim().length < 3 || telefone.length < 10) { setFeedback({ tone: "red", text: "Informe o nome e o WhatsApp do fornecedor com DDD." }); return; }
    try {
      let fornecedor;
      if (apiStatus === "online") {
        fornecedor = await api.cadastrarFornecedorCotacao({ nome: novoFornecedorNome.trim(), telefone });
        setFornecedoresApi(prev => [...prev.filter(item => item.id !== fornecedor.id), fornecedor].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      } else {
        fornecedor = { id: `LOCAL-${Date.now()}`, nome: novoFornecedorNome.trim(), telefone };
        const novos = [...fornecedoresLocais, fornecedor];
        setFornecedoresLocais(novos);
        localStorage.setItem("imperial.quoteSuppliers.v1", JSON.stringify(novos));
      }
      setNovoFornecedorNome(""); setNovoFornecedorTelefone("");
      setFeedback({ tone: "green", text: `${fornecedor.nome} disponível para as próximas cotações.` });
    } catch (error) { setFeedback({ tone: "red", text: error?.message || "Não foi possível cadastrar o fornecedor." }); }
  }
  async function gerar() {
    const itens = alertas.filter(i => selecionados[i.cod]);
    if (!itens.length) { setFeedback({ tone: "red", text: "Selecione ao menos um item para cotar." }); return; }
    try {
      let novas;
      if (apiStatus === "online") {
        if (!fornecedoresApi.length) throw new Error("Cadastre fornecedores ativos antes de abrir a cotação.");
        const respostas = [];
        for (const item of itens) respostas.push(await api.criarCotacaoInteligente({ insumoCodigo: item.cod, quantidade: item.comprar, fornecedorIds: fornecedoresApi.map(f => f.id) }));
        novas = respostas.map(c => ({ id: c.codigo, item: c.item, quantidade: c.quantidade, unidade: c.unidade, estoqueAtual: c.estoqueAtual, estoqueMinimo: c.estoqueMinimo, aberta: new Date(c.criadoEm).toLocaleDateString("pt-BR"), status: c.status, fornecedores: c.propostas.map(p => ({ id: p.id, nome: p.fornecedor, preco: p.precoUnitario, prazo: p.prazoDias, frete: p.frete, condicoes: p.condicoes, formaPagamento: p.formaPagamento || p.condicoes, impostoIncluso: p.impostoIncluso, origemResposta: p.origemResposta, respondidaEm: p.respondidaEm })) }));
      } else {
        if (!fornecedoresLocais.length) throw new Error("Cadastre ao menos um fornecedor com WhatsApp antes de abrir a cotação.");
        novas = itens.map((item, index) => ({ id: `COT-LOCAL-${Date.now() + index}`, item: item.nome, quantidade: item.comprar, unidade: item.un, estoqueAtual: item.qtd, estoqueMinimo: item.min, aberta: "agora", status: "aguardando", fornecedores: fornecedoresLocais.map(fornecedor => ({ id: fornecedor.id, nome: fornecedor.nome, preco: null, prazo: null, frete: null, condicoes: null, formaPagamento: null, impostoIncluso: null, origemResposta: null })) }));
      }
      setLista(prev => [...novas, ...prev]); setSelecionados({}); setFeedback({ tone: "green", text: `${novas.length} cotação(ões) criada(s) com os dados do estoque.` });
    } catch (error) { setFeedback({ tone: "red", text: error?.message || "Não foi possível criar a cotação." }); }
  }

  async function enviar(cotacao) {
    if (apiStatus !== "online" || cotacao.id.startsWith("COT-LOCAL")) { setFeedback({ tone: "amber", text: "Envio real bloqueado até a API, os fornecedores e a credencial oficial do WhatsApp estarem configurados." }); return; }
    try { const resposta = await api.enviarCotacaoWhatsapp(cotacao.id); const enviadas = resposta.resultados.filter(r => r.enviada).length; setFeedback({ tone: enviadas ? "green" : "red", text: `${enviadas} de ${resposta.resultados.length} mensagens enviadas.` }); }
    catch (error) { setFeedback({ tone: "red", text: error?.message || "Falha no envio pelo WhatsApp." }); }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h3 className="font-semibold text-slate-900 dark:text-white">Compras inteligentes em tempo real</h3><p className="text-xs text-slate-500 dark:text-slate-400">Estoque mínimo → WhatsApp → respostas dos fornecedores → menor custo total</p></div><Badge tone={apiStatus === "online" ? "green" : "amber"}>{apiStatus === "online" ? "Atualização a cada 10s" : "Simulação local"}</Badge></div>
      {feedback && <div className={cx("rounded-xl border px-4 py-3 text-sm", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300")}>{feedback.text}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><KPI label="Fornecedores" value={String((apiStatus === "online" ? fornecedoresApi : fornecedoresLocais).length)} delta="Consultados por WhatsApp" positive icon={Truck} /><KPI label="Abaixo do mínimo" value={String(alertas.length)} delta="Saldo menor ou igual ao mínimo" positive={alertas.length === 0} icon={AlertTriangle} /><KPI label="Reposição estimada" value={dinheiro(estimado)} delta="Custo atual de referência" positive icon={Wallet} /><KPI label="Cotações abertas" value={String(lista.length)} delta="Sem movimentar o caixa" positive icon={Trophy} /></div>

      <Card className="p-4"><div className="flex flex-col lg:flex-row lg:items-end gap-3"><div className="flex-1"><h4 className="font-semibold text-sm">Fornecedores para cotação</h4><p className="text-xs text-slate-400 mt-0.5">O número será usado somente no envio autorizado da solicitação</p></div><form onSubmit={cadastrarFornecedor} className="flex flex-col sm:flex-row gap-2"><input value={novoFornecedorNome} onChange={e => setNovoFornecedorNome(e.target.value)} placeholder="Nome do fornecedor" className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" /><input value={novoFornecedorTelefone} onChange={e => setNovoFornecedorTelefone(e.target.value)} placeholder="WhatsApp com DDD" className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm" /><button className="rounded-xl bg-[#7A1420] text-white text-sm font-medium px-4 py-2">Cadastrar</button></form></div><div className="flex flex-wrap gap-2 mt-3">{(apiStatus === "online" ? fornecedoresApi : fornecedoresLocais).length ? (apiStatus === "online" ? fornecedoresApi : fornecedoresLocais).map(f => <Badge key={f.id} tone={f.telefone ? "green" : "amber"}>{f.nome} · {f.telefone || "sem WhatsApp"}</Badge>) : <span className="text-xs text-slate-400">Nenhum fornecedor cadastrado.</span>}</div></Card>

      <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h4 className="font-semibold text-sm">Itens abaixo do estoque mínimo</h4><p className="text-xs text-slate-400">Comprar somente a diferença necessária para atingir o mínimo definido no Estoque</p></div><button onClick={gerar} disabled={!alertas.length} className="rounded-xl bg-[#7A1420] disabled:opacity-40 text-white text-sm font-medium px-4 py-2"><Send size={13} className="inline mr-1" />Gerar cotação</button></div>{alertas.length ? <div className="overflow-x-auto"><table className="w-full text-sm min-w-[760px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b"><th className="p-3"></th><th className="p-3">Item</th><th className="p-3 text-right">Atual</th><th className="p-3 text-right">Mínimo</th><th className="p-3 text-right">Comprar</th><th className="p-3 text-right">Estimado</th></tr></thead><tbody>{alertas.map(item => <tr key={item.cod} className="border-b border-slate-50 dark:border-slate-700/50"><td className="p-3"><input type="checkbox" checked={Boolean(selecionados[item.cod])} onChange={e => setSelecionados(prev => ({ ...prev, [item.cod]: e.target.checked }))} className="accent-[#7A1420]" /></td><td className="p-3 font-medium">{item.nome}<div className="font-mono text-[11px] text-slate-400">{item.cod}</div></td><td className="p-3 text-right">{item.qtd} {item.un}</td><td className="p-3 text-right">{item.min} {item.un}</td><td className="p-3 text-right font-semibold">{item.comprar.toLocaleString("pt-BR")} {item.un}</td><td className="p-3 text-right">{dinheiro(item.estimado)}</td></tr>)}</tbody></table></div> : <div className="p-8 text-center text-sm text-slate-400">Nenhum item está abaixo do estoque mínimo definido na aba Estoque.</div>}</Card>


      <div className="flex items-center justify-between"><div><h4 className="font-semibold text-sm">Cotações e respostas</h4><p className="text-xs text-slate-400">O webhook interpreta preço, frete, prazo e pagamento</p></div><Badge tone="brand">Menor custo = quantidade × preço + frete</Badge></div>
      <div className="flex flex-col gap-4">{lista.map(c => <CotacaoResumo key={c.id} cotacao={c} onEnviar={enviar} />)}</div>
    </div>
  );
}
function Cotacoes() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Solicitações de cotação</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">A melhor proposta é destacada automaticamente por preço, frete e prazo</p>
        </div>
        <button className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <Plus size={15} /> Nova cotação
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center"><Clock size={16} className="text-amber-500" /></div>
          <div><div className="text-lg font-semibold text-slate-900 dark:text-white">1</div><div className="text-xs text-slate-500 dark:text-slate-400">Aguardando resposta</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 size={16} className="text-emerald-500" /></div>
          <div><div className="text-lg font-semibold text-slate-900 dark:text-white">2</div><div className="text-xs text-slate-500 dark:text-slate-400">Respondidas</div></div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center"><Star size={16} className="text-[#7A1420]" /></div>
          <div><div className="text-lg font-semibold text-slate-900 dark:text-white">R$ 0,07</div><div className="text-xs text-slate-500 dark:text-slate-400">Economia média por un.</div></div>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        {cotacoes.map(c => <CotacaoCard key={c.id} cot={c} />)}
      </div>
    </div>
  );
}

function CompraManual({ estoqueItens, onRegistrar, historico }) {
  const [insumoCod, setInsumoCod] = useState(estoqueItens[0]?.cod ?? "");
  const [quantidade, setQuantidade] = useState("");
  const [custo, setCusto] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [pagamento, setPagamento] = useState("Dinheiro");
  const [obs, setObs] = useState("");
  const [feedback, setFeedback] = useState(null);

  const insumo = estoqueItens.find(i => i.cod === insumoCod);

  function handleSubmit(e) {
    e.preventDefault();
    const qtdNum = parseFloat(quantidade);
    if (!insumo || !qtdNum || qtdNum <= 0) return;
    const custoNum = custo ? parseFloat(custo) : insumo.custo;
    onRegistrar({
      insumoCod: insumo.cod,
      insumoNome: insumo.nome,
      un: insumo.un,
      quantidade: qtdNum,
      custo: custoNum,
      fornecedor: fornecedor || "Fornecedor avulso (sem cadastro)",
      pagamento,
      obs,
    });
    setFeedback({ nome: insumo.nome, qtd: qtdNum, un: insumo.un });
    setQuantidade(""); setCusto(""); setFornecedor(""); setObs("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Compra manual (sem nota fiscal)</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Para compras feitas direto no balcão, sem pedido formal — a entrada cai direto no estoque e no histórico de movimentações</p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-2.5 rounded-xl">
          <CheckCircle2 size={15} />
          Estoque atualizado: +{feedback.qtd} {feedback.un} de {feedback.nome}
        </div>
      )}

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Insumo</label>
            <select value={insumoCod} onChange={e => setInsumoCod(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-200">
              {estoqueItens.map(i => <option key={i.cod} value={i.cod}>{i.nome} ({i.cod})</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Quantidade {insumo ? `(${insumo.un})` : ""}</label>
            <input type="number" step="0.01" min="0" required value={quantidade} onChange={e => setQuantidade(e.target.value)}
              placeholder="Ex: 10"
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Custo unitário (R$)</label>
            <input type="number" step="0.01" min="0" value={custo} onChange={e => setCusto(e.target.value)}
              placeholder={insumo ? `Padrão: R$ ${insumo.custo.toFixed(2)}` : ""}
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Fornecedor / origem</label>
            <input type="text" value={fornecedor} onChange={e => setFornecedor(e.target.value)}
              placeholder="Ex: Açougue do bairro"
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Forma de pagamento</label>
            <select value={pagamento} onChange={e => setPagamento(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-200">
              <option>Dinheiro</option>
              <option>Pix</option>
              <option>Cartão</option>
              <option>Outro</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Observação (opcional)</label>
            <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
              placeholder="Ex: comprado direto com o produtor, sem nota"
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 resize-none" />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between gap-3 mt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5"><AlertTriangle size={12} className="text-amber-500" /> Lançada como entrada sem nota fiscal vinculada</span>
            <button type="submit" className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
              <Plus size={15} /> Registrar entrada no estoque
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-4">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 px-1">Histórico de compras manuais</h4>
        {historico.length === 0 ? (
          <p className="text-sm text-slate-400 px-1 py-4 text-center">Nenhuma compra manual registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                  <th className="py-2.5 px-4 font-medium">Insumo</th>
                  <th className="py-2.5 px-4 font-medium text-right">Qtd.</th>
                  <th className="py-2.5 px-4 font-medium text-right">Valor total</th>
                  <th className="py-2.5 px-4 font-medium">Fornecedor</th>
                  <th className="py-2.5 px-4 font-medium">Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">{h.insumoNome}</td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">{h.quantidade} {h.un}</td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">R$ {(h.quantidade * h.custo).toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{h.fornecedor}</td>
                    <td className="py-3 px-4"><Badge tone="brand">{h.pagamento}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function EntradaBoleto({ estoqueItens, onRegistrar, historico }) {
  const [insumoCod, setInsumoCod] = useState(estoqueItens[0]?.cod ?? "");
  const [quantidade, setQuantidade] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [linhaDigitavel, setLinhaDigitavel] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [feedback, setFeedback] = useState(null);

  const insumo = estoqueItens.find(i => i.cod === insumoCod);

  function handleSubmit(e) {
    e.preventDefault();
    const qtdNum = parseFloat(quantidade);
    const valorNum = parseFloat(valor);
    if (!insumo || !qtdNum || qtdNum <= 0 || !valorNum || !fornecedor || !vencimento) return;
    onRegistrar({
      insumoCod: insumo.cod,
      insumoNome: insumo.nome,
      un: insumo.un,
      quantidade: qtdNum,
      valor: valorNum,
      fornecedor,
      linhaDigitavel,
      vencimento,
    });
    setFeedback({ nome: insumo.nome, qtd: qtdNum, un: insumo.un, valor: valorNum, venc: vencimento });
    setQuantidade(""); setValor(""); setFornecedor(""); setLinhaDigitavel(""); setVencimento("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Entrada por boleto</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Compra recebida com boleto (sem XML de NF-e) — dá entrada no estoque e já gera a conta a pagar no Financeiro</p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-2.5 rounded-xl">
          <CheckCircle2 size={15} />
          Estoque atualizado (+{feedback.qtd} {feedback.un} de {feedback.nome}) e conta a pagar de R$ {feedback.valor.toFixed(2)} criada para {feedback.venc}
        </div>
      )}

      <Card className="p-5">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Insumo</label>
            <select value={insumoCod} onChange={e => setInsumoCod(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-200">
              {estoqueItens.map(i => <option key={i.cod} value={i.cod}>{i.nome} ({i.cod})</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Quantidade recebida {insumo ? `(${insumo.un})` : ""}</label>
            <input type="number" step="0.01" min="0" required value={quantidade} onChange={e => setQuantidade(e.target.value)}
              placeholder="Ex: 50"
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Fornecedor</label>
            <input type="text" required value={fornecedor} onChange={e => setFornecedor(e.target.value)}
              placeholder="Ex: Boi Manso Distribuidora"
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Linha digitável do boleto (opcional)</label>
            <input type="text" value={linhaDigitavel} onChange={e => setLinhaDigitavel(e.target.value)}
              placeholder="00000.00000 00000.000000 00000.000000 0 00000000000000"
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm font-mono outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Valor do boleto (R$)</label>
            <input type="number" step="0.01" min="0" required value={valor} onChange={e => setValor(e.target.value)}
              placeholder="Ex: 1920.00"
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Vencimento</label>
            <input type="date" required value={vencimento} onChange={e => setVencimento(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-200" />
          </div>

          <div className="sm:col-span-2 flex items-center justify-between gap-3 mt-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5"><FileText size={12} className="text-[#7A1420]" /> Gera entrada de estoque + lançamento em Contas a Pagar</span>
            <button type="submit" className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
              <Plus size={15} /> Registrar entrada por boleto
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-4">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 px-1">Histórico de entradas por boleto</h4>
        {historico.length === 0 ? (
          <p className="text-sm text-slate-400 px-1 py-4 text-center">Nenhuma entrada por boleto registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                  <th className="py-2.5 px-4 font-medium">Insumo</th>
                  <th className="py-2.5 px-4 font-medium text-right">Qtd.</th>
                  <th className="py-2.5 px-4 font-medium text-right">Valor</th>
                  <th className="py-2.5 px-4 font-medium">Fornecedor</th>
                  <th className="py-2.5 px-4 font-medium">Vencimento</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">{h.insumoNome}</td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">{h.quantidade} {h.un}</td>
                    <td className="py-3 px-4 text-right text-slate-700 dark:text-slate-300">R$ {h.valor.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{h.fornecedor}</td>
                    <td className="py-3 px-4"><Badge tone="brand">{new Date(h.vencimento + "T00:00:00").toLocaleDateString("pt-BR")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function EntradaXML({ estoqueItens, onRegistrar, historico }) {
  const [rawXml, setRawXml] = useState("");
  const [parsed, setParsed] = useState(null);
  const [mapeamento, setMapeamento] = useState([]); // [{ incluir, cod }]
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = React.useRef(null);

  function processar(texto) {
    setError("");
    setFeedback(null);
    try {
      const data = parseNFeXML(texto);
      setParsed(data);
      setMapeamento(data.itens.map(it => {
        const cod = guessInsumoCod(it.xProd, estoqueItens);
        return { incluir: !!cod, cod };
      }));
    } catch (err) {
      setParsed(null);
      setError(err.message || "Não foi possível ler este XML.");
    }
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setRawXml(ev.target.result); processar(ev.target.result); };
    reader.readAsText(file);
  }

  function updateMap(idx, patch) {
    setMapeamento(prev => prev.map((m, i) => i === idx ? { ...m, ...patch } : m));
  }

  function handleConfirm() {
    const itensParaEntrada = parsed.itens
      .map((it, i) => ({ ...it, ...mapeamento[i] }))
      .filter(it => it.incluir && it.cod);
    if (itensParaEntrada.length === 0) return;
    const resultado = onRegistrar({
      chave: parsed.chave,
      fornecedor: parsed.fornecedor,
      vNF: parsed.vNF,
      duplicatas: parsed.duplicatas,
      itens: itensParaEntrada,
    });
    if (resultado?.tone === "red") {
      setError(resultado.text);
      return;
    }
    setFeedback({ qtdItens: itensParaEntrada.length, fornecedor: parsed.fornecedor, vNF: parsed.vNF });
    setParsed(null); setRawXml(""); setMapeamento([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Entrada por XML (NF-e)</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Importe o XML da nota — fornecedor, itens, quantidades e parcelas do boleto são lidos automaticamente, sem digitar nada</p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-2.5 rounded-xl">
          <CheckCircle2 size={15} />
          {feedback.qtdItens} item(ns) de {feedback.fornecedor} lançados no estoque · nota de R$ {feedback.vNF.toFixed(2)}
        </div>
      )}

      {!parsed && (
        <Card className="p-6 flex flex-col items-center justify-center gap-3 border-dashed">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <FileCode2 size={22} className="text-[#7A1420] dark:text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Selecione o arquivo XML da NF-e</p>
            <p className="text-xs text-slate-400 mt-0.5">Formato padrão da SEFAZ, com tags &lt;det&gt;, &lt;emit&gt; e &lt;dup&gt;</p>
          </div>
          <label className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer">
            <Upload size={15} /> Escolher arquivo .xml
            <input ref={fileInputRef} type="file" accept=".xml,text/xml" onChange={handleFile} className="hidden" />
          </label>

          <div className="w-full mt-2">
            <div className="text-xs text-slate-500 dark:text-slate-300 text-center font-medium">ou cole/digite o conteúdo do XML aqui</div>
            <textarea
              value={rawXml}
              onChange={e => setRawXml(e.target.value)}
              rows={5}
              placeholder="<nfeProc>...</nfeProc>"
              className="w-full mt-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl px-3 py-2 text-xs font-mono outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 resize-none"
            />
            <button
              onClick={() => processar(rawXml)}
              disabled={!rawXml.trim()}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#7A1420] dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-lg px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ScanLine size={13} /> Processar XML colado
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-lg w-full">
              <AlertTriangle size={13} /> {error}
            </div>
          )}
        </Card>
      )}

      {parsed && (
        <>
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{parsed.fornecedor || "Fornecedor não identificado"}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{parsed.chave || "chave de acesso não encontrada"}</div>
              </div>
              <Badge tone="brand">Valor total da nota: R$ {parsed.vNF.toFixed(2)}</Badge>
            </div>

            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                    <th className="py-2 px-5 font-medium"></th>
                    <th className="py-2 px-5 font-medium">Produto na nota</th>
                    <th className="py-2 px-5 font-medium text-right">Qtd.</th>
                    <th className="py-2 px-5 font-medium text-right">Vlr. unit.</th>
                    <th className="py-2 px-5 font-medium">Vincular ao insumo</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.itens.map((it, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50">
                      <td className="py-3 px-5">
                        <input type="checkbox" checked={mapeamento[i]?.incluir ?? false}
                          onChange={e => updateMap(i, { incluir: e.target.checked })}
                          className="w-4 h-4 accent-[#7A1420]" />
                      </td>
                      <td className="py-3 px-5 text-slate-800 dark:text-slate-200 font-medium">{it.xProd}</td>
                      <td className="py-3 px-5 text-right text-slate-700 dark:text-slate-300">{it.qCom} {it.uCom}</td>
                      <td className="py-3 px-5 text-right text-slate-500 dark:text-slate-400">R$ {it.vUnCom.toFixed(2)}</td>
                      <td className="py-3 px-5">
                        <select
                          value={mapeamento[i]?.cod ?? ""}
                          onChange={e => updateMap(i, { cod: e.target.value, incluir: !!e.target.value })}
                          className="bg-slate-50 dark:bg-slate-700/40 rounded-lg px-2 py-1.5 text-xs outline-none text-slate-700 dark:text-slate-200 max-w-[200px]"
                        >
                          <option value="">— não vincular —</option>
                          {estoqueItens.map(e => <option key={e.cod} value={e.cod}>{e.nome}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 px-1">Itens sem correspondência no cadastro vêm desmarcados — vincule manualmente ou deixe de fora da entrada.</p>
          </Card>

          <Card className="p-5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Contas a pagar geradas</h4>
            {parsed.duplicatas.length > 0 ? (
              <div className="flex flex-col gap-2">
                {parsed.duplicatas.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-700/30 rounded-xl px-4 py-2.5">
                    <span className="text-slate-600 dark:text-slate-300">Parcela {d.nDup || i + 1} · vence {new Date(d.dVenc + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">R$ {d.vDup.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma duplicata (fatura/boleto) encontrada no XML — será lançado um único título de R$ {parsed.vNF.toFixed(2)} em Contas a Pagar, com vencimento a definir.</p>
            )}
          </Card>

          <div className="flex justify-end gap-2">
            <button onClick={() => { setParsed(null); setRawXml(""); }} className="text-sm text-slate-500 dark:text-slate-400 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/40">Cancelar</button>
            <button onClick={handleConfirm} className="flex items-center gap-1.5 bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              <CheckCircle2 size={15} /> Dar entrada no estoque
            </button>
          </div>
        </>
      )}

      <Card className="p-4">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 px-1">Histórico de notas importadas</h4>
        {historico.length === 0 ? (
          <p className="text-sm text-slate-400 px-1 py-4 text-center">Nenhuma NF-e importada ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {historico.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-700/30 rounded-xl px-4 py-2.5">
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">{h.fornecedor || "Fornecedor não identificado"}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{h.chave}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-700 dark:text-slate-300">R$ {h.vNF.toFixed(2)}</div>
                  <div className="text-[11px] text-slate-400">{h.itens.length} item(ns)</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function PainelReposicaoCompras({ estoqueItens }) {
  const alertas = useMemo(() => estoqueItens
    .filter(item => Number(item.min) > 0 && Number(item.qtd) <= Number(item.min))
    .map(item => ({ ...item, comprar: Math.max(0, Number(item.min) - Number(item.qtd)) }))
    .sort((a, b) => (Number(a.qtd) / Number(a.min)) - (Number(b.qtd) / Number(b.min))), [estoqueItens]);

  return (
    <Card className="overflow-hidden border-amber-200 dark:border-amber-500/30">
      <div className="p-4 border-b border-amber-100 dark:border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle size={15} className="text-amber-600" /> Estoque mínimo conectado às Compras</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Saldo atual e mínimo vêm da mesma lista do módulo Estoque.</p>
        </div>
        <Badge tone={alertas.length ? "amber" : "green"}>{alertas.length ? `${alertas.length} item(ns) para repor` : "Tudo acima do mínimo"}</Badge>
      </div>
      {alertas.length ? (
        <div className="overflow-x-auto"><table className="w-full text-sm min-w-[680px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="p-3">Item</th><th className="p-3">Categoria</th><th className="p-3 text-right">Atual</th><th className="p-3 text-right">Mínimo</th><th className="p-3 text-right">Sugestão de compra</th></tr></thead><tbody>{alertas.map(item => <tr key={item.cod} className="border-b border-slate-50 dark:border-slate-700/50"><td className="p-3 font-medium">{item.nome}<div className="font-mono text-[11px] text-slate-400">{item.cod}</div></td><td className="p-3 text-slate-500">{item.cat || "—"}</td><td className="p-3 text-right">{Number(item.qtd).toLocaleString("pt-BR")} {item.un}</td><td className="p-3 text-right font-medium">{Number(item.min).toLocaleString("pt-BR")} {item.un}</td><td className="p-3 text-right font-semibold text-[#7A1420]">{item.comprar.toLocaleString("pt-BR")} {item.un}</td></tr>)}</tbody></table></div>
      ) : <div className="p-6 text-center text-sm text-slate-400">Nenhum item abaixo do mínimo definido no Estoque.</div>}
    </Card>
  );
}
function Compras({ estoqueItens, apiStatus, onAtualizarMinimo, onRegistrarCompraManual, historicoManual, onRegistrarBoleto, historicoBoleto, onRegistrarXml, historicoXml }) {
  const [tab, setTab] = useState("cotacoes");
  const gestao = ["cotacoes", "pedidos", "recebimentos", "historico", "configuracoes"];
  const abas = [["cotacoes","Cota&ccedil;&otilde;es"],["pedidos","Pedidos de Compra"],["recebimentos","Recebimentos"],["historico","Hist&oacute;rico de Pedidos"],["configuracoes","Configura&ccedil;&otilde;es"],["manual","Compra manual"],["boleto","Entrada por boleto"],["xml","Entrada por XML"]];
  return <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Compras</h2><p className="text-sm text-slate-500">Cota&ccedil;&atilde;o por WhatsApp, pedidos, recebimento e estoque em um &uacute;nico fluxo.</p></div></div>
    <div className="overflow-x-auto"><div className="flex min-w-max items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-700/40">{abas.map(([chave,rotulo])=><button key={chave} onClick={()=>setTab(chave)} className={cx("rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap",tab===chave?"bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white":"text-slate-500")} dangerouslySetInnerHTML={{__html:rotulo}}/>)}</div></div>
    {gestao.includes(tab)&&<ComprasCotacoes aba={tab} apiStatus={apiStatus}/>}
    {tab==="manual"&&<CompraManual estoqueItens={estoqueItens} onRegistrar={onRegistrarCompraManual} historico={historicoManual}/>}
    {tab==="boleto"&&<EntradaBoleto estoqueItens={estoqueItens} onRegistrar={onRegistrarBoleto} historico={historicoBoleto}/>}
    {tab==="xml"&&<EntradaXML estoqueItens={estoqueItens} onRegistrar={onRegistrarXml} historico={historicoXml}/>}
  </div>;
}

function CentralImportacoes({ estoqueItens, fichas, mapeamentos, importacoes, onMapear, onConfirmar }) {
  const [tab, setTab] = useState("nova");
  const [tipoEsperado, setTipoEsperado] = useState("produtos");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [substituirPeriodo, setSubstituirPeriodo] = useState(false);
  const dinheiro = v => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const conflitoPeriodo = preview && importacoes.some(i => i.status === "processada" && i.tipo === preview.tipo && i.periodo?.chave === preview.periodo.chave);
  const produtosPendentes = preview?.tipo === "produtos" ? preview.produtos.filter(p => !mapeamentos[p.codigo] || mapeamentos[p.codigo].tipo === "pendente") : [];
  const produtosMapeados = preview?.tipo === "produtos" ? preview.produtos.length - produtosPendentes.length : 0;

  async function selecionarArquivo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError(""); setFeedback(null); setPreview(null); setSubstituirPeriodo(false);
    try {
      const resultado = await lerRelatorioSichef(file);
      if (resultado.tipo !== tipoEsperado) throw new Error(`Este arquivo é um relatório de ${resultado.tipo === "produtos" ? "produtos" : "plataformas"}. Selecione o tipo correto antes de importar.`);
      setPreview(resultado);
    } catch (err) {
      setError(err?.message || "Não foi possível ler o arquivo.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  function alterarMapeamento(codigo, valor) {
    const [tipo, refId = ""] = valor.split(":");
    onMapear(codigo, { tipo, refId });
  }

  function confirmar() {
    if (!preview) return;
    const resultado = onConfirmar(preview, { substituirPeriodo });
    setFeedback(resultado);
    if (resultado.tone === "green") { setPreview(null); setSubstituirPeriodo(false); setTab("historico"); }
  }

  function rotuloMapeamento(mapeamento) {
    if (!mapeamento || mapeamento.tipo === "pendente") return "Pendente";
    if (mapeamento.tipo === "ignorar") return "Ignorar — sem estoque";
    if (mapeamento.tipo === "agrupador") return "Agrupador — usar componentes";
    if (mapeamento.tipo === "ficha") return fichas.find(f => f.id === mapeamento.refId)?.prato || "Ficha não encontrada";
    return estoqueItens.find(i => i.cod === mapeamento.refId)?.nome || "Item não encontrado";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Central de Importações</h2><p className="text-sm text-slate-500 dark:text-slate-400">Relatórios do SiChef para estoque e análise por plataforma</p></div><Badge tone="brand"><span className="inline-flex items-center gap-1.5"><ScanLine size={12} /> Caixa não é movimentado</span></Badge></div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700"><button onClick={() => setTab("nova")} className={cx("px-4 py-2.5 text-sm font-medium border-b-2", tab === "nova" ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>Nova importação</button><button onClick={() => setTab("historico")} className={cx("px-4 py-2.5 text-sm font-medium border-b-2", tab === "historico" ? "border-[#7A1420] text-[#7A1420] dark:text-red-300" : "border-transparent text-slate-400")}>Histórico</button></div>

      {feedback && <div className={cx("rounded-xl border px-4 py-3 text-sm", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300")}>{feedback.text}</div>}

      {tab === "nova" && <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[{ key: "produtos", icon: Package, titulo: "Vendas por produto", texto: "Agrupa códigos e quantidades para baixar fichas técnicas e produtos de estoque." }, { key: "plataformas", icon: BarChart3, titulo: "Vendas por plataforma", texto: "Atualiza pedidos, faturamento, taxas e ticket médio apenas para análise." }].map(opcao => <button key={opcao.key} onClick={() => { setTipoEsperado(opcao.key); setPreview(null); setError(""); }} className={cx("text-left rounded-2xl border p-5 transition-colors", tipoEsperado === opcao.key ? "border-[#7A1420] bg-red-50 dark:bg-red-500/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-slate-300")}><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-[#7A1420] text-white flex items-center justify-center shrink-0"><opcao.icon size={18} /></div><div><div className="font-semibold text-slate-900 dark:text-white">{opcao.titulo}</div><div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{opcao.texto}</div></div></div></button>)}
        </div>

        <Card className="p-6 border-dashed">
          <label className="flex flex-col items-center justify-center text-center gap-3 cursor-pointer py-5"><div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center"><Upload size={21} className="text-[#7A1420] dark:text-red-300" /></div><div><div className="font-semibold text-slate-800 dark:text-slate-200">{loading ? "Lendo relatório..." : `Selecionar relatório de ${tipoEsperado === "produtos" ? "produtos" : "plataformas"}`}</div><div className="text-xs text-slate-400 mt-1">Arquivos .xlsx ou .xls exportados pelo SiChef</div></div><input type="file" accept=".xlsx,.xls" onChange={selecionarArquivo} disabled={loading} className="hidden" /><span className="rounded-xl bg-[#7A1420] text-white text-sm font-medium px-5 py-2.5">{loading ? "Processando" : "Escolher arquivo"}</span></label>
        </Card>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300 px-4 py-3 text-sm">{error}</div>}

        {preview && <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Card className="p-4"><div className="text-xs text-slate-400">Arquivo</div><div className="text-sm font-semibold mt-1 truncate" title={preview.arquivo}>{preview.arquivo}</div></Card><Card className="p-4"><div className="text-xs text-slate-400">Período</div><div className="text-sm font-semibold mt-1">{preview.periodo.inicio} a {preview.periodo.fim}</div></Card><Card className="p-4"><div className="text-xs text-slate-400">Tipo</div><div className="text-sm font-semibold mt-1">{preview.tipo === "produtos" ? "Baixa de estoque" : "Análise de plataformas"}</div></Card><Card className="p-4"><div className="text-xs text-slate-400">Situação</div><div className="mt-1"><Badge tone={conflitoPeriodo ? "amber" : "green"}>{conflitoPeriodo ? "Período já importado" : "Novo período"}</Badge></div></Card></div>

          {preview.tipo === "produtos" && <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Prévia e mapeamento de produtos</h3><p className="text-xs text-slate-400 mt-0.5">{preview.produtos.length} códigos únicos · {produtosMapeados} configurados · {produtosPendentes.length} pendentes</p></div><div className="flex gap-2"><Badge tone="slate">Vendas {dinheiro(preview.totalVendas)}</Badge><Badge tone="amber">Desconto {dinheiro(preview.desconto)}</Badge></div></div><div className="overflow-auto max-h-[520px]"><table className="w-full text-sm min-w-[900px]"><thead className="sticky top-0 bg-white dark:bg-slate-800 z-10"><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Código SiChef</th><th className="py-2.5 px-4 font-medium">Produto</th><th className="py-2.5 px-4 font-medium text-right">Quantidade</th><th className="py-2.5 px-4 font-medium text-right">Ocorrências</th><th className="py-2.5 px-4 font-medium">Destino no ERP</th></tr></thead><tbody>{preview.produtos.map(produto => { const map = mapeamentos[produto.codigo] || { tipo: "pendente", refId: "" }; return <tr key={produto.codigo} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-mono text-xs text-slate-400">{produto.codigo}</td><td className="py-3 px-4"><div className="font-medium text-slate-800 dark:text-slate-200">{produto.nome}</div><div className="text-[11px] text-slate-400">{rotuloMapeamento(map)}</div></td><td className="py-3 px-4 text-right font-medium">{produto.quantidade.toLocaleString("pt-BR")} {produto.unidade}</td><td className="py-3 px-4 text-right text-slate-400">{produto.ocorrencias}</td><td className="py-3 px-4"><select value={`${map.tipo}:${map.refId || ""}`} onChange={e => alterarMapeamento(produto.codigo, e.target.value)} className={cx("w-full rounded-xl border bg-white dark:bg-slate-800 px-3 py-2 text-xs outline-none", map.tipo === "pendente" ? "border-amber-300 dark:border-amber-500" : "border-slate-200 dark:border-slate-600")}><option value="pendente:">Pendente — não processar</option><option value="ignorar:">Ignorar — sem efeito no estoque</option><option value="agrupador:">Agrupador — usar componentes</option><optgroup label="Fichas técnicas">{fichas.map(f => <option key={f.id} value={`ficha:${f.id}`}>{f.prato}</option>)}</optgroup><optgroup label="Estoque direto">{estoqueItens.map(i => <option key={i.cod} value={`estoque:${i.cod}`}>{i.nome} ({i.un})</option>)}</optgroup></select></td></tr>; })}</tbody></table></div></Card>}

          {preview.tipo === "plataformas" && <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Prévia por plataforma</h3><p className="text-xs text-slate-400 mt-0.5">Nenhuma linha será lançada no caixa</p></div><div className="overflow-x-auto"><table className="w-full text-sm min-w-[760px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Plataforma</th><th className="py-2.5 px-4 font-medium text-right">Pedidos</th><th className="py-2.5 px-4 font-medium text-right">Vendas</th><th className="py-2.5 px-4 font-medium text-right">Taxa entrega</th><th className="py-2.5 px-4 font-medium text-right">Total</th><th className="py-2.5 px-4 font-medium text-right">Ticket</th></tr></thead><tbody>{preview.plataformas.map(p => <tr key={p.descricaoOriginal} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{p.plataforma}</td><td className="py-3 px-4 text-right">{p.pedidos}</td><td className="py-3 px-4 text-right">{dinheiro(p.vendas)}</td><td className="py-3 px-4 text-right">{dinheiro(p.taxasEntrega)}</td><td className="py-3 px-4 text-right font-semibold">{dinheiro(p.faturamento)}</td><td className="py-3 px-4 text-right">{dinheiro(p.pedidos ? p.faturamento / p.pedidos : 0)}</td></tr>)}</tbody></table></div></Card>}

          {conflitoPeriodo && <label className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300 px-4 py-3 text-sm flex items-center gap-2"><input type="checkbox" checked={substituirPeriodo} onChange={e => setSubstituirPeriodo(e.target.checked)} className="accent-[#7A1420]" />Substituir a importação anterior deste período e aplicar apenas a diferença</label>}

          {produtosPendentes.length > 0 && preview.tipo === "produtos" && <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300 px-4 py-3 text-sm">Configure todos os {produtosPendentes.length} códigos pendentes. A baixa não será aplicada parcialmente.</div>}

          <button onClick={confirmar} className="rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-6 py-3">{preview.tipo === "produtos" ? "Validar e aplicar baixa de estoque" : "Confirmar atualização do dashboard"}</button>
        </>}
      </>}

      {tab === "historico" && <Card className="overflow-hidden"><div className="p-4 border-b border-slate-100 dark:border-slate-700"><h3 className="font-semibold text-slate-900 dark:text-white text-sm">Histórico de importações</h3><p className="text-xs text-slate-400 mt-0.5">Arquivos processados e versões substituídas</p></div>{importacoes.length ? <div className="overflow-x-auto"><table className="w-full text-sm min-w-[820px]"><thead><tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700"><th className="py-2.5 px-4 font-medium">Importação</th><th className="py-2.5 px-4 font-medium">Tipo</th><th className="py-2.5 px-4 font-medium">Arquivo</th><th className="py-2.5 px-4 font-medium">Período</th><th className="py-2.5 px-4 font-medium text-right">Registros</th><th className="py-2.5 px-4 font-medium">Processada em</th><th className="py-2.5 px-4 font-medium">Status</th></tr></thead><tbody>{importacoes.map(i => <tr key={i.id} className="border-b border-slate-50 dark:border-slate-700/50"><td className="py-3 px-4 font-mono text-xs text-slate-400">{i.id}</td><td className="py-3 px-4"><Badge tone="brand">{i.tipo === "produtos" ? "Produtos" : "Plataformas"}</Badge></td><td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-[260px] truncate" title={i.arquivo}>{i.arquivo}</td><td className="py-3 px-4 text-slate-500">{i.periodo.inicio} a {i.periodo.fim}</td><td className="py-3 px-4 text-right">{i.registros}</td><td className="py-3 px-4 text-slate-500">{i.processadaEm}</td><td className="py-3 px-4"><Badge tone={i.status === "processada" ? "green" : "slate"}>{i.status === "processada" ? "Processada" : "Substituída"}</Badge></td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-sm text-slate-400">Nenhuma importação processada ainda.</div>}</Card>}
    </div>
  );
}

const PLATAFORMAS_INTEGRACAO = [
  { key: "sichef", nome: "SiChef", selo: "Prioridade 1", icon: ScanLine, descricao: "Fonte principal recomendada para centralizar os pedidos e evitar duplicidade entre os canais." },
  { key: "cardapio-web", nome: "Cardápio Web", selo: "Canal próprio", icon: ShoppingCart, descricao: "Recebe pedidos do cardápio online e alimenta estoque, produtos vendidos e indicadores do canal próprio." },
  { key: "ifood", nome: "iFood", selo: "Marketplace", icon: Bike, descricao: "Prepara a conexão de pedidos, cancelamentos, taxas e repasses do iFood." },
  { key: "rappi", nome: "Rappi", selo: "Marketplace", icon: Truck, descricao: "Prepara a conexão de pedidos, entregas, cancelamentos e repasses do Rappi." },
];

const CREDENCIAIS_LOCAIS_KEY = "imperial.integrationCredentials.v1";
const CHAVE_LOCAL_KEY = "imperial.integrationSessionKey.v1";

function bytesParaBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function base64ParaBytes(valor) {
  return Uint8Array.from(atob(valor), caractere => caractere.charCodeAt(0));
}

async function chaveCriptograficaLocal() {
  let material = sessionStorage.getItem(CHAVE_LOCAL_KEY);
  if (!material) {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    material = bytesParaBase64(bytes);
    sessionStorage.setItem(CHAVE_LOCAL_KEY, material);
  }
  return crypto.subtle.importKey("raw", base64ParaBytes(material), { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function cifrarCredencialLocal(token) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const chave = await chaveCriptograficaLocal();
  const segredo = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, chave, new TextEncoder().encode(token));
  return { segredoLocal: bytesParaBase64(segredo), ivLocal: bytesParaBase64(iv) };
}

async function verificarCredencialLocal(credencial) {
  const chave = await chaveCriptograficaLocal();
  const aberto = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ParaBytes(credencial.ivLocal) },
    chave,
    base64ParaBytes(credencial.segredoLocal),
  );
  return new TextDecoder().decode(aberto).length > 0;
}

function lerCredenciaisLocais() {
  try { return JSON.parse(localStorage.getItem(CREDENCIAIS_LOCAIS_KEY) || "{}"); }
  catch { return {}; }
}

function salvarCredenciaisLocais(credenciais) {
  localStorage.setItem(CREDENCIAIS_LOCAIS_KEY, JSON.stringify(credenciais));
}

const WHATSAPP_META_INICIAL = { phoneNumberId: "", graphVersion: "v24.0", templateName: "cotacao_fornecedor", templateLanguage: "pt_BR", accessToken: "", verifyToken: "", appSecret: "" };

function WhatsappMetaConfiguracao({ apiStatus }) {
  const [status, setStatus] = useState(null);
  const [formulario, setFormulario] = useState(WHATSAPP_META_INICIAL);
  const [feedback, setFeedback] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [guiaAberto, setGuiaAberto] = useState(false);

  function aplicarStatus(item) {
    setStatus(item);
    setFormulario(prev => ({ ...prev, phoneNumberId: item.phoneNumberId || "", graphVersion: item.graphVersion || "v24.0", templateName: item.templateName || "cotacao_fornecedor", templateLanguage: item.templateLanguage || "pt_BR", accessToken: "", verifyToken: "", appSecret: "" }));
  }

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      if (apiStatus !== "online") return;
      setCarregando(true);
      try { const item = await api.getWhatsappMeta(); if (ativo) aplicarStatus(item); }
      catch (error) { if (ativo) setFeedback({ tone: "red", text: error?.message || "N\u00e3o foi poss\u00edvel consultar a API do WhatsApp." }); }
      finally { if (ativo) setCarregando(false); }
    }
    carregar();
    return () => { ativo = false; };
  }, [apiStatus]);

  function alterar(campo, valor) { setFormulario(prev => ({ ...prev, [campo]: valor })); }

  async function salvar() {
    if (apiStatus !== "online") { setFeedback({ tone: "red", text: "Conecte a API do ERP antes de configurar o WhatsApp." }); return; }
    if (!formulario.phoneNumberId.trim() || !formulario.graphVersion.trim() || !formulario.templateName.trim() || !formulario.templateLanguage.trim()) { setFeedback({ tone: "red", text: "Preencha o Phone Number ID, vers\u00e3o, template e idioma." }); return; }
    if (!status?.configurada && (!formulario.accessToken.trim() || !formulario.verifyToken.trim() || !formulario.appSecret.trim())) { setFeedback({ tone: "red", text: "Na primeira configura\u00e7\u00e3o, informe o token permanente, o Verify Token e o App Secret." }); return; }
    setCarregando(true);setFeedback({ tone: "amber", text: "Criptografando e salvando a configura\u00e7\u00e3o..." });
    try {
      const payload = { phoneNumberId: formulario.phoneNumberId.trim(), graphVersion: formulario.graphVersion.trim(), templateName: formulario.templateName.trim(), templateLanguage: formulario.templateLanguage.trim(), ...(formulario.accessToken.trim()?{accessToken:formulario.accessToken.trim()}:{}), ...(formulario.verifyToken.trim()?{verifyToken:formulario.verifyToken.trim()}:{}), ...(formulario.appSecret.trim()?{appSecret:formulario.appSecret.trim()}:{}) };
      const item = await api.salvarWhatsappMeta(payload); aplicarStatus(item); setFeedback({ tone: "green", text: "Configura\u00e7\u00e3o salva com criptografia. Agora use Testar na Meta." });
    } catch (error) { setFeedback({ tone: "red", text: error?.message || "N\u00e3o foi poss\u00edvel salvar a configura\u00e7\u00e3o." }); }
    finally { setCarregando(false); }
  }

  async function verificar() {
    setCarregando(true);setFeedback({ tone: "amber", text: "Consultando o n\u00famero diretamente na Meta..." });
    try { const resposta = await api.verificarWhatsappMeta(); setStatus(prev => ({ ...prev, verificadoEm: resposta.verificadoEm })); setFeedback({ tone: "green", text: "Meta conectada" + (resposta.numero ? " ao n\u00famero " + resposta.numero : "") + (resposta.nomeVerificado ? " (" + resposta.nomeVerificado + ")" : "") + "." }); }
    catch (error) { setFeedback({ tone: "red", text: error?.message || "A Meta n\u00e3o aceitou essa configura\u00e7\u00e3o." }); }
    finally { setCarregando(false); }
  }

  async function remover() {
    if (!window.confirm("Remover a configura\u00e7\u00e3o da API oficial do WhatsApp?")) return;
    setCarregando(true);
    try { await api.removerWhatsappMeta(); aplicarStatus({ configurada:false, phoneNumberId:"", graphVersion:"v24.0", templateName:"cotacao_fornecedor", templateLanguage:"pt_BR", webhookUrl:status?.webhookUrl }); setFeedback({ tone:"green", text:"Configura\u00e7\u00e3o do WhatsApp removida." }); }
    catch (error) { setFeedback({ tone:"red", text:error?.message || "N\u00e3o foi poss\u00edvel remover a configura\u00e7\u00e3o." }); }
    finally { setCarregando(false); }
  }

  const salvo = Boolean(status?.configurada);
  const verificado = Boolean(status?.verificadoEm);
  const campo = "mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]";
  return <Card className="overflow-hidden border-emerald-200 dark:border-emerald-500/20">
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5 dark:border-slate-700"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white"><Send size={19}/></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">WhatsApp Cloud API - Meta</h3><Badge tone={verificado?"green":salvo?"amber":"slate"}>{verificado?"API verificada":salvo?"Configura\u00e7\u00e3o salva":"N\u00e3o configurada"}</Badge></div><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Envia a cota&ccedil;&atilde;o aos fornecedores pelo WhatsApp oficial e protege os tokens do webhook.</p></div></div><button onClick={()=>setGuiaAberto(prev=>!prev)} className="w-fit rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">{guiaAberto?"Fechar orienta\u00e7\u00f5es":"Como configurar"}</button></div>
    {guiaAberto&&<div className="border-b border-emerald-100 bg-emerald-50/70 p-4 text-xs text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"><ol className="list-decimal space-y-1 pl-4"><li>No Meta for Developers, abra WhatsApp &gt; Configura&ccedil;&atilde;o da API e copie o Phone Number ID.</li><li>Gere um token permanente de usu&aacute;rio do sistema com permiss&atilde;o para WhatsApp.</li><li>Em Webhooks, use a URL abaixo e informe o mesmo Verify Token cadastrado aqui.</li><li>Cadastre e aprove o template informado, com os dados da cota&ccedil;&atilde;o e bot&atilde;o para o formul&aacute;rio.</li></ol></div>}
    <div className="space-y-4 p-4 sm:p-5">
      {feedback&&<div className={cx("rounded-xl border px-3 py-2 text-xs",feedback.tone==="green"?"border-emerald-200 bg-emerald-50 text-emerald-700":feedback.tone==="red"?"border-rose-200 bg-rose-50 text-rose-700":"border-amber-200 bg-amber-50 text-amber-700")}>{feedback.text}</div>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"><label className="text-xs text-slate-500">Phone Number ID<input value={formulario.phoneNumberId} onChange={e=>alterar("phoneNumberId",e.target.value)} placeholder="Ex.: 123456789012345" className={campo}/></label><label className="text-xs text-slate-500">Vers&atilde;o da Graph API<input value={formulario.graphVersion} onChange={e=>alterar("graphVersion",e.target.value)} placeholder="v24.0" className={campo}/></label><label className="text-xs text-slate-500">Template aprovado<input value={formulario.templateName} onChange={e=>alterar("templateName",e.target.value)} className={campo}/></label><label className="text-xs text-slate-500">Idioma do template<input value={formulario.templateLanguage} onChange={e=>alterar("templateLanguage",e.target.value)} className={campo}/></label></div>
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
      setFeedbacks(prev => ({ ...prev, [plataforma]: { tone: "green", text: "Credencial protegida e disponível. A API externa ainda não foi acionada." } }));
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
        <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Configurações</h2><p className="text-sm text-slate-500 dark:text-slate-400">Integrações de vendas e credenciais das plataformas</p></div>
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
          return (
            <Card key={plataforma.key} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0"><div className="w-10 h-10 rounded-xl bg-[#7A1420] text-white flex items-center justify-center shrink-0"><Icon size={18} /></div><div><div className="flex items-center gap-2 flex-wrap"><h3 className="font-semibold text-slate-900 dark:text-white">{plataforma.nome}</h3><Badge tone="brand">{plataforma.selo}</Badge></div><p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plataforma.descricao}</p></div></div>
                <Badge tone={salvo ? "green" : "slate"}>{salvo ? "Credencial salva" : "Não configurada"}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                <label className="text-xs text-slate-500 dark:text-slate-400">Código da empresa / loja (opcional)<input value={formulario.identificador} onChange={e => alterarFormulario(plataforma.key, "identificador", e.target.value)} placeholder="Opcional" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
                <label className="text-xs text-slate-500 dark:text-slate-400">Token / chave de API<input type="password" value={formulario.token} onChange={e => alterarFormulario(plataforma.key, "token", e.target.value)} placeholder={salvo ? "Cole um novo token para substituir" : "Cole o token aqui"} autoComplete="new-password" className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-[#7A1420]" /></label>
              </div>

              {salvo && <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-3"><CheckCircle2 size={11} className="inline mr-1" />Protegida · atualizada em {formatarData(item.atualizadoEm)}{item.verificadoEm ? ` · verificada em ${formatarData(item.verificadoEm)}` : ""}</div>}
              {feedback && <div className={cx("mt-3 rounded-xl border px-3 py-2 text-xs", feedback.tone === "green" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300" : feedback.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300")}>{feedback.text}</div>}

              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => salvar(plataforma.key)} className="rounded-xl bg-[#7A1420] hover:bg-[#611018] text-white text-sm font-medium px-4 py-2.5">{salvo ? "Atualizar credencial" : "Salvar credencial"}</button>
                <button onClick={() => verificar(plataforma.key)} disabled={!salvo} className="rounded-xl border border-slate-300 dark:border-slate-600 disabled:opacity-40 text-slate-700 dark:text-slate-200 text-sm font-medium px-4 py-2.5">Verificar</button>
                <button onClick={() => setGuiasAbertos(prev => ({ ...prev, [plataforma.key]: !prev[plataforma.key] }))} className="rounded-xl border border-amber-400/60 text-amber-700 dark:text-amber-300 text-sm font-medium px-4 py-2.5">Como ativar a API</button>
              </div>
              {guiasAbertos[plataforma.key] && <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3 text-xs text-slate-500 dark:text-slate-300">Solicite a chave no painel administrativo da {plataforma.nome}, cadastre a URL de webhook fornecida pelo ERP e valide primeiro em ambiente de homologação. O recebimento automático permanece desligado até essa etapa.</div>}
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
  const [abaReceitas, setAbaReceitas] = useState("cadastros");
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
  const [caixas, setCaixas] = useState(initialCaixas);
  const [movimentosCaixa, setMovimentosCaixa] = useState(initialMovimentosCaixa);
  const [entregadores, setEntregadores] = useState(initialEntregadores);
  const [tarifasMoto, setTarifasMoto] = useState(() => {
    try {
      const salvas = JSON.parse(localStorage.getItem("imperial.deliveryRates.v1") || "null");
      return Array.isArray(salvas) && salvas.length ? salvas : initialTarifasMoto;
    } catch {
      return initialTarifasMoto;
    }
  });
  const [corridas, setCorridas] = useState(initialCorridas);
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

  function handleSalvarFicha(dados) {
    if (!dados.produtoId || !dados.prato) return { tone: "red", text: "Selecione o produto da ficha técnica." };
    if (!dados.insumos.length) return { tone: "red", text: "Adicione pelo menos um insumo à ficha técnica." };
    if (fichas.some(ficha => ficha.id !== dados.id && (ficha.produtoId === dados.produtoId || normalizeTxt(ficha.prato) === normalizeTxt(dados.prato)))) {
      return { tone: "red", text: "Este produto já possui uma ficha técnica." };
    }
    if (dados.id) {
      setFichas(prev => salvarCadastroLocal(
        "imperial.technicalSheets.v1",
        prev.map(ficha => ficha.id === dados.id
          ? { ...ficha, ...dados, revisaoPendente: null, observacao: "Ficha atualizada manualmente no ERP." }
          : ficha),
      ));
      return { tone: "green", text: "Ficha técnica de " + dados.prato + " atualizada." };
    }
    const nova = {
      id: "FT-MAN-" + Date.now().toString(36).toUpperCase(),
      ...dados,
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
    const novo = { id: `ENT-${String(entregadores.length + 1).padStart(3, "0")}`, nome, telefone, tipo, ativo: true };
    setEntregadores(prev => [...prev, novo]);
    return { tone: "green", text: `${nome} cadastrado na empresa ${tipo}.` };
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
      status: "paga",
      caixaId: caixa.id,
    }));
    setCorridas(prev => [...novasCorridas, ...prev]);
    return { tone: "green", text: `${loteId}: ${itens.length} corrida(s) de ${entregador.nome}, total de ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}, lançadas no ${caixa.id}.` };
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
                  <button onClick={() => setAbaReceitas("cadastros")} className={cx("rounded-lg px-4 py-2 text-sm font-medium", abaReceitas === "cadastros" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500")}>Produtos, itens e fichas técnicas</button>
                  <button onClick={() => setAbaReceitas("producao")} className={cx("rounded-lg px-4 py-2 text-sm font-medium", abaReceitas === "producao" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500")}>Receitas de produção</button>
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
                ) : <ReceitasProducao />}
              </div>
            )}
            {active === "producao" && <Producao receitas={initialReceitas} estoqueItens={estoqueItens} ordens={ordens} onCriarOrdem={handleCriarOrdem} onAvancarOrdem={handleAvancarOrdem} />}
            {active === "vendas" && <Vendas />}
            {active === "entregas" && <Entregas entregadores={entregadores} tarifas={tarifasMoto} corridas={corridas} caixaAberto={caixas.find(c => c.status === "aberto")} onCadastrar={handleCadastrarEntregador} onLancarLote={handleLancarLoteCorridas} onSalvarTarifa={handleSalvarTarifa} />}
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
