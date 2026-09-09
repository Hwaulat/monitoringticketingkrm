import { useState, useRef, useEffect } from "react"
import heroImg from "./assets/hero.jpg"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts"
// v2 — Inter + design system

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "login" | "home" | "scan" | "create_ticket" | "ticket_detail" | "tickets" | "dashboard" | "profile"
type TicketStatus = "open" | "in_progress" | "on_hold" | "closed"
type Priority = "low" | "normal" | "high" | "urgent"
type DamageType = "body" | "interior" | "electrical" | "mechanical" | "paint" | "other"
type UpdateType = "created" | "started" | "updated" | "hold" | "resumed" | "closed"

interface TicketUpdate {
  id: string
  timestamp: Date
  authorName: string
  note: string
  type: UpdateType
}
interface RepairTicket {
  id: string
  ticketNo: string
  cabinCode: string
  cabinModel: string
  createdAt: Date
  createdByName: string
  damageType: DamageType
  description: string
  priority: Priority
  status: TicketStatus
  assignedToName?: string
  startedAt?: Date
  closedAt?: Date
  closureNotes?: string
  durationSeconds?: number
  updates: TicketUpdate[]
}
interface ScannedCabin {
  code: string
  model: string
}
interface User {
  id: string
  nik: string
  name: string
  department: string
}

// ─── Tokens ──────────────────────────────────────────────────────────────────
const T = {
  dark: "#111827",
  dark2: "#1f2937",
  bg: "#f9f9f9",
  card: "#ffffff",
  blue: "#f97316",
  blueL: "#fff7ed",
  blueB: "#fed7aa",
  orange: "#2563eb",
  orangeL: "#eff6ff",
  orangeB: "#bfdbfe",
  green: "#16a34a",
  greenL: "#f0fdf4",
  greenB: "#bbf7d0",
  red: "#dc2626",
  redL: "#fef2f2",
  redB: "#fecaca",
  amber: "#d97706",
  amberL: "#fffbeb",
  amberB: "#fde68a",
  violet: "#7c3aed",
  violetL: "#f5f3ff",
  text: "#111827",
  sub: "#6b7280",
  muted: "#9ca3af",
  border: "#e5e7eb",
  borderL: "#f3f4f6",
  shadow: "0 1.75px 4px -1px rgba(15,17,20,0.10)",
  shadow2: "0 4px 20px rgba(15,17,20,0.14)",
}

// Type scale
const TS = {
  xs: { fontSize: 11, lineHeight: "16px" },
  sm: { fontSize: 12, lineHeight: "18px" },
  base: { fontSize: 13, lineHeight: "20px" },
  md: { fontSize: 14, lineHeight: "22px" },
  lg: { fontSize: 16, lineHeight: "24px" },
  xl: { fontSize: 18, lineHeight: "28px" },
  "2xl": { fontSize: 22, lineHeight: "32px" },
  "3xl": { fontSize: 28, lineHeight: "36px" },
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ME: User = {
  id: "u-001",
  nik: "240315",
  name: "Rizal Firmansyah",
  department: "Body Repair",
}
const td = (h: number, m: number) => {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}
let _counter = 5
const newNo = () =>
  `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-00${_counter++}`

const MOCK_TICKETS: RepairTicket[] = [
  {
    id: "t-001",
    ticketNo: "TKT-20240909-001",
    cabinCode: "CB-A0412",
    cabinModel: "Dyna 130 HT",
    createdAt: td(7, 10),
    createdByName: "Rizal Firmansyah",
    damageType: "body",
    description: "Dent on left front door, needs straightening and repainting.",
    priority: "high",
    status: "closed",
    assignedToName: "Rizal Firmansyah",
    startedAt: td(7, 15),
    closedAt: td(8, 5),
    durationSeconds: 3000,
    closureNotes: "Repair finished, paint matches.",
    updates: [
      {
        id: "u1",
        timestamp: td(7, 10),
        authorName: "Rizal Firmansyah",
        note: "Ticket created after scanning cabin CB-A0412.",
        type: "created",
      },
      {
        id: "u2",
        timestamp: td(7, 15),
        authorName: "Rizal Firmansyah",
        note: "Started straightening work.",
        type: "started",
      },
      {
        id: "u3",
        timestamp: td(7, 40),
        authorName: "Rizal Firmansyah",
        note: "Straightening finished, proceeding to putty.",
        type: "updated",
      },
      {
        id: "u4",
        timestamp: td(8, 5),
        authorName: "Rizal Firmansyah",
        note: "Repair finished, paint matches.",
        type: "closed",
      },
    ],
  },
  {
    id: "t-002",
    ticketNo: "TKT-20240909-002",
    cabinCode: "CB-B0091",
    cabinModel: "Dyna 110 ST",
    createdAt: td(8, 18),
    createdByName: "Rizal Firmansyah",
    damageType: "paint",
    description: "Paint peeled on cabin roof, needs repaint area ± 30x20 cm.",
    priority: "normal",
    status: "closed",
    assignedToName: "Rizal Firmansyah",
    startedAt: td(8, 22),
    closedAt: td(9, 48),
    durationSeconds: 5160,
    closureNotes: "Repaint finished, area cleaned.",
    updates: [
      {
        id: "u5",
        timestamp: td(8, 18),
        authorName: "Rizal Firmansyah",
        note: "Ticket created.",
        type: "created",
      },
      {
        id: "u6",
        timestamp: td(8, 22),
        authorName: "Rizal Firmansyah",
        note: "Started cleaning and masking area.",
        type: "started",
      },
      {
        id: "u7",
        timestamp: td(9, 10),
        authorName: "Rizal Firmansyah",
        note: "Primer applied, waiting to dry.",
        type: "updated",
      },
      {
        id: "u8",
        timestamp: td(9, 48),
        authorName: "Rizal Firmansyah",
        note: "Repaint finished.",
        type: "closed",
      },
    ],
  },
  {
    id: "t-003",
    ticketNo: "TKT-20240909-003",
    cabinCode: "CB-C0204",
    cabinModel: "Hilux SR5",
    createdAt: td(10, 3),
    createdByName: "Rizal Firmansyah",
    damageType: "interior",
    description: "Driver seat torn in middle, needs re-upholstery.",
    priority: "normal",
    status: "in_progress",
    assignedToName: "Rizal Firmansyah",
    startedAt: td(10, 10),
    updates: [
      {
        id: "u9",
        timestamp: td(10, 3),
        authorName: "Rizal Firmansyah",
        note: "Ticket created after scanning cabin.",
        type: "created",
      },
      {
        id: "u10",
        timestamp: td(10, 10),
        authorName: "Rizal Firmansyah",
        note: "Started seat re-upholstery.",
        type: "started",
      },
      {
        id: "u11",
        timestamp: td(10, 45),
        authorName: "Rizal Firmansyah",
        note: "Old layer removed, waiting for new material.",
        type: "updated",
      },
    ],
  },
  {
    id: "t-004",
    ticketNo: "TKT-20240909-004",
    cabinCode: "CB-D0087",
    cabinModel: "Fortuner TRD",
    createdAt: td(9, 0),
    createdByName: "Bayu Santoso",
    damageType: "electrical",
    description: "AC not cold, compressor needs checking.",
    priority: "urgent",
    status: "on_hold",
    assignedToName: "Bayu Santoso",
    startedAt: td(9, 10),
    updates: [
      {
        id: "u12",
        timestamp: td(9, 0),
        authorName: "Bayu Santoso",
        note: "Ticket created.",
        type: "created",
      },
      {
        id: "u13",
        timestamp: td(9, 10),
        authorName: "Bayu Santoso",
        note: "Started AC system diagnosis.",
        type: "started",
      },
      {
        id: "u14",
        timestamp: td(9, 50),
        authorName: "Bayu Santoso",
        note: "Waiting for compressor spare part from warehouse.",
        type: "hold",
      },
    ],
  },
]

const DAILY_TREND = [
  { day: "Mon", count: 14 },
  { day: "Tue", count: 18 },
  { day: "Wed", count: 11 },
  { day: "Thu", count: 20 },
  { day: "Fri", count: 16 },
  { day: "Sat", count: 8 },
  { day: "Today", count: 3 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDur = (s: number) => {
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}
const fmtTime = (d: Date) =>
  d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
const fmtDate = (d: Date) =>
  d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
const fmtShort = (d: Date) =>
  d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
const elapsed = (s: Date) =>
  fmtDur(Math.floor((Date.now() - s.getTime()) / 1000))

const DAMAGE_LABELS: Record<DamageType, string> = {
  body: "Body",
  interior: "Interior",
  electrical: "Electrical",
  mechanical: "Mechanical",
  paint: "Paint",
  other: "Other",
}

const STATUS_CFG: Record<TicketStatus, {
  label: string
  color: string
  bg: string
  dot: string
}> = {
  open: { label: "Open", color: T.blue, bg: T.blueL, dot: T.blue },
  in_progress: {
    label: "In Progress",
    color: T.orange,
    bg: T.orangeL,
    dot: T.orange,
  },
  on_hold: { label: "On Hold", color: T.amber, bg: T.amberL, dot: T.amber },
  closed: { label: "Closed", color: T.green, bg: T.greenL, dot: T.green },
}

const PRIORITY_CFG: Record<Priority, {
  label: string
  color: string
  bg: string
}> = {
  low: { label: "Low", color: T.sub, bg: "#f3f4f6" },
  normal: { label: "Normal", color: T.blue, bg: T.blueL },
  high: { label: "High", color: T.amber, bg: T.amberL },
  urgent: { label: "Urgent", color: T.red, bg: T.redL },
}

const UPDATE_DOT: Record<UpdateType, string> = {
  created: T.blue,
  started: T.orange,
  updated: T.sub,
  hold: T.amber,
  resumed: T.violet,
  closed: T.green,
}
const UPDATE_LABEL: Record<UpdateType, string> = {
  created: "Ticket Created",
  started: "Started Work",
  updated: "Progress Update",
  hold: "On Hold",
  resumed: "Resumed",
  closed: "Ticket Closed",
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Scan: ({ s = 24 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" strokeWidth="2.2" />
    </svg>
  ),
  Ticket: ({ s = 22 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  ),
  Grid: ({ s = 22 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  User: ({ s = 22 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Bell: ({ s = 20 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Arrow: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Chev: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Check: ({ s = 18 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Plus: ({ s = 20 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Play: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Pause: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="6" y1="4" x2="6" y2="20" />
      <line x1="18" y1="4" x2="18" y2="20" />
    </svg>
  ),
  X: ({ s = 18 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Pin: ({ s = 13 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Wrench: ({ s = 13 }: { s?: number }) => (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({
  children,
  style,
  onClick,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.card,
        borderRadius: 16,
        boxShadow: T.shadow,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// Section header matching image-2 style
function SectionHd({
  title,
  count,
  action,
  onAction,
}: {
  title: string
  count?: number
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex justify-between items-center mb-3">
      <p style={{ ...TS.md, fontWeight: 600, color: T.text }}>{title}</p>
      <button
        onClick={onAction}
        className="flex items-center gap-1.5 transition-opacity active:opacity-60"
      >
        {action && (
          <span style={{ ...TS.xs, fontWeight: 500, color: T.sub }}>
            {action}
          </span>
        )}
        {count !== undefined && (
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white"
            style={{ ...TS.xs, background: T.orange }}
          >
            {count}
          </span>
        )}
        {(action || count !== undefined) && (
          <span style={{ color: T.sub }}>
            <Ic.Chev />
          </span>
        )}
      </button>
    </div>
  )
}

// Status badge with dot — image-2 style
function StatusDot({ status }: { status: TicketStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ ...TS.xs, fontWeight: 600, color: c.color, background: c.bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: c.dot }}
      />
      {c.label}
    </span>
  )
}

function PriorityPill({ priority }: { priority: Priority }) {
  const c = PRIORITY_CFG[priority]
  return (
    <span
      className="px-2 py-0.5 rounded-full"
      style={{ ...TS.xs, fontWeight: 600, color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  )
}

function BackBtn({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity active:opacity-50"
      style={{ background: T.card, boxShadow: T.shadow, color: T.text }}
    >
      <Ic.Arrow />
    </button>
  )
}

// ─── Ticket row — image-2 list item style (colored left bar) ────────────────

function TicketRow({
  ticket,
  onClick,
}: {
  ticket: RepairTicket
  onClick: () => void
}) {
  const barColor =
    ticket.status === "closed"
      ? T.green
      : ticket.status === "in_progress"
        ? T.orange
        : ticket.status === "on_hold"
          ? T.amber
          : T.blue
  const isActive = ticket.status === "in_progress"
  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-opacity active:opacity-70 mb-3"
    >
      <Card style={{ padding: 0, overflow: "hidden", display: "flex" }}>
        {/* Left accent bar */}
        <div
          style={{
            width: 4,
            background: barColor,
            flexShrink: 0,
            borderRadius: "16px 0 0 16px",
          }}
        />
        <div className="flex-1 px-4 py-3.5">
          <div className="flex justify-between items-start mb-1.5">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${barColor}18` }}
              >
                <span style={{ color: barColor }}>
                  <Ic.Wrench s={13} />
                </span>
              </div>
              <div>
                <p
                  className="leading-tight"
                  style={{ ...TS.md, fontWeight: 700, color: T.text }}
                >
                  {ticket.cabinCode}
                </p>
                <p style={{ ...TS.xs, color: T.sub }}>{ticket.cabinModel}</p>
              </div>
            </div>
            <StatusDot status={ticket.status} />
          </div>
          <p
            className="mb-2 line-clamp-1"
            style={{ ...TS.xs, color: T.muted, paddingLeft: 36 }}
          >
            {DAMAGE_LABELS[ticket.damageType]} — {ticket.description}
          </p>
          <div
            className="flex items-center justify-between"
            style={{ paddingLeft: 36 }}
          >
            <div className="flex items-center gap-1" style={{ color: T.muted }}>
              <Ic.Pin s={11} />
              <span style={{ ...TS.xs }}>
                {fmtShort(ticket.createdAt)}, {fmtTime(ticket.createdAt)}
              </span>
            </div>
            {isActive && ticket.startedAt && (
              <span style={{ ...TS.xs, fontWeight: 600, color: T.orange }}>
                ⏱ {elapsed(ticket.startedAt)}
              </span>
            )}
            {ticket.status === "closed" && ticket.durationSeconds && (
              <span style={{ ...TS.xs, fontWeight: 600, color: T.green }}>
                {fmtDur(ticket.durationSeconds)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </button>
  )
}

// Activity card — image-2 "Today's Updates" style
function ActivityCard({ ticket }: { ticket: RepairTicket }) {
  const lastUpdate = ticket.updates[ticket.updates.length - 1]
  const isPreventive =
    ticket.damageType === "mechanical" || ticket.damageType === "electrical"
  const pillColor = isPreventive ? T.orange : T.blue
  const pillBg = isPreventive ? T.orangeL : T.blueL
  const pillLabel = isPreventive ? "Preventive" : "Repair"
  return (
    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
      {/* Top: category pill + date */}
      <div className="flex justify-between items-center px-4 pt-3.5 pb-2">
        <span
          className="px-3 py-1 rounded-full"
          style={{
            ...TS.xs,
            fontWeight: 700,
            color: pillColor,
            background: pillBg,
          }}
        >
          {pillLabel}
        </span>
        <span style={{ ...TS.xs, color: T.muted }}>
          {fmtDate(lastUpdate.timestamp)}, {fmtTime(lastUpdate.timestamp)}
        </span>
      </div>
      {/* Body */}
      <div className="flex gap-3 px-4 pb-3">
        {/* Placeholder image */}
        <div
          className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: `${pillColor}15` }}
        >
          <Ic.Wrench s={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Ic.Wrench s={12} />
            <p style={{ ...TS.sm, fontWeight: 600, color: T.text }}>
              {ticket.cabinCode} – {ticket.cabinModel}
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 mb-1"
            style={{ color: T.sub }}
          >
            <Ic.Pin s={12} />
            <p style={{ ...TS.xs }}>
              {ticket.damageType === "body"
                ? "Line A"
                : ticket.damageType === "paint"
                  ? "Line B"
                  : "Line C"}
            </p>
          </div>
          <p style={{ ...TS.xs, color: T.sub }}>
            {lastUpdate.note.slice(0, 70)}
            {lastUpdate.note.length > 70 ? "…" : ""}
          </p>
        </div>
      </div>
      {/* Footer: user + status */}
      <div
        className="flex justify-between items-center px-4 py-2.5"
        style={{ borderTop: `1px solid ${T.borderL}` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white"
            style={{ ...TS.xs, background: T.orange }}
          >
            {ticket.createdByName[0]}
          </div>
          <span style={{ ...TS.xs, color: T.sub }}>{ticket.createdByName}</span>
        </div>
        <StatusDot status={ticket.status} />
      </div>
    </Card>
  )
}

// ─── Scan Screen ──────────────────────────────────────────────────────────────
function ScanScreen({
  onBack,
  tickets,
  onCabinScanned,
}: {
  onBack: () => void
  tickets: RepairTicket[]
  onCabinScanned: (c: ScannedCabin, e: RepairTicket | null) => void
}) {
  const [phase, setPhase] = useState<"idle" | "scanning" | "detected">("idle")
  const [countdown, setCountdown] = useState(3)
  const [cabin, setCabin] = useState<ScannedCabin | null>(null)
  const [existing, setExisting] = useState<RepairTicket | null>(null)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)
  const CABINS = [
    { code: "CB-A0412", model: "Dyna 130 HT" },
    { code: "CB-B0091", model: "Dyna 110 ST" },
    { code: "CB-E0055", model: "Hilux SR5" },
    { code: "CB-F0033", model: "Fortuner TRD" },
    { code: "CB-G0021", model: "Dyna 130 HT" },
  ]

  function startScan() {
    setPhase("scanning")
    setCountdown(3)
    let c = 3
    ref.current = setInterval(() => {
      c--
      setCountdown(c)
      if (c <= 0) {
        clearInterval(ref.current!)
        const p = CABINS[Math.floor(Math.random() * CABINS.length)]
        const open =
          tickets.find(
            (t) => t.cabinCode === p.code && t.status !== "closed",
          ) || null
        setCabin(p)
        setExisting(open)
        setPhase("detected")
      }
    }, 1000)
  }
  useEffect(
    () => () => {
      if (ref.current) clearInterval(ref.current)
    },
    [],
  )

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-4 flex items-center gap-3"
        style={{ background: T.card, boxShadow: T.shadow }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: T.bg, color: T.text }}
        >
          <Ic.Arrow />
        </button>
        <p style={{ ...TS.lg, fontWeight: 600, color: T.text }}>Scan Cabin</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 gap-8">
        {phase === "idle" && (
          <>
            <Card
              style={{
                width: 220,
                height: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {[
                ["top-3 left-3 border-t-2 border-l-2"],
                ["top-3 right-3 border-t-2 border-r-2"],
                ["bottom-3 left-3 border-b-2 border-l-2"],
                ["bottom-3 right-3 border-b-2 border-r-2"],
              ].map(([cls], i) => (
                <div
                  key={i}
                  className={`absolute ${cls} w-7 h-7 rounded-sm`}
                  style={{ borderColor: T.orange }}
                />
              ))}
              <div className="text-center" style={{ color: T.muted }}>
                <Ic.Scan s={52} />
                <p className="mt-3" style={{ ...TS.xs }}>
                  Point camera
                </p>
              </div>
            </Card>
            <div className="text-center">
              <p style={{ ...TS.md, fontWeight: 600, color: T.text }}>
                Scan cabin barcode tag
              </p>
              <p className="mt-1" style={{ ...TS.sm, color: T.muted }}>
                Camera will read QR/barcode on cabin
              </p>
            </div>
            <button
              onClick={startScan}
              className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80"
              style={{
                ...TS.md,
                fontWeight: 700,
                background: T.orange,
                boxShadow: `0 6px 20px ${T.orange}55`,
              }}
            >
              Start Scan
            </button>
          </>
        )}
        {phase === "scanning" && (
          <>
            <Card
              style={{
                width: 220,
                height: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2.5px solid ${T.orange}`,
              }}
            >
              <div className="text-center">
                <p
                  className="font-light"
                  style={{ fontSize: 64, lineHeight: "72px", color: T.orange }}
                >
                  {countdown}
                </p>
                <p className="mt-2" style={{ ...TS.sm, color: T.muted }}>
                  Detecting...
                </p>
              </div>
            </Card>
            <p style={{ ...TS.sm, color: T.muted }}>Hold camera steady</p>
          </>
        )}
        {phase === "detected" && cabin && (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ background: T.green }}
              >
                <Ic.Check s={12} />
              </span>
              <p style={{ ...TS.sm, fontWeight: 600, color: T.green }}>
                Cabin detected
              </p>
            </div>
            <Card style={{ padding: 20 }}>
              <p
                className="mb-2 uppercase tracking-widest"
                style={{ ...TS.xs, fontWeight: 600, color: T.muted }}
              >
                Cabin Information
              </p>
              <p style={{ ...TS["2xl"], fontWeight: 700, color: T.text }}>
                {cabin.code}
              </p>
              <p className="mt-0.5" style={{ ...TS.sm, color: T.sub }}>
                {cabin.model}
              </p>
            </Card>
            {existing ? (
              <>
                <div
                  className="rounded-2xl p-4 flex gap-3"
                  style={{
                    background: T.amberL,
                    border: `1px solid ${T.amberB}`,
                  }}
                >
                  <span style={{ color: T.amber, flexShrink: 0 }}>
                    <Ic.Wrench s={16} />
                  </span>
                  <div>
                    <p style={{ ...TS.sm, fontWeight: 600, color: T.amber }}>
                      Active ticket found
                    </p>
                    <p className="mt-0.5" style={{ ...TS.xs, color: T.sub }}>
                      {existing.ticketNo} · {STATUS_CFG[existing.status].label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onCabinScanned(cabin, existing)}
                  className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80"
                  style={{ ...TS.md, fontWeight: 700, background: T.orange }}
                >
                  View Active Ticket
                </button>
              </>
            ) : (
              <>
                <div
                  className="rounded-2xl p-4 flex gap-3"
                  style={{
                    background: T.greenL,
                    border: `1px solid ${T.greenB}`,
                  }}
                >
                  <span style={{ color: T.green }}>
                    <Ic.Check s={16} />
                  </span>
                  <p style={{ ...TS.sm, color: T.sub }}>
                    No active ticket. Create new repair ticket.
                  </p>
                </div>
                <button
                  onClick={() => onCabinScanned(cabin, null)}
                  className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80"
                  style={{
                    ...TS.md,
                    fontWeight: 700,
                    background: T.orange,
                    boxShadow: `0 6px 20px ${T.orange}55`,
                  }}
                >
                  Create Repair Ticket
                </button>
              </>
            )}
            <button
              onClick={() => setPhase("idle")}
              className="w-full py-3.5 rounded-2xl transition-opacity active:opacity-60"
              style={{
                ...TS.sm,
                fontWeight: 600,
                background: T.card,
                boxShadow: T.shadow,
                color: T.sub,
              }}
            >
              Scan Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Create Ticket Screen ─────────────────────────────────────────────────────
function CreateTicketScreen({
  cabin,
  onBack,
  onCreated,
}: {
  cabin: ScannedCabin
  onBack: () => void
  onCreated: (t: RepairTicket) => void
}) {
  const [damageType, setDamageType] = useState<DamageType>("body")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("normal")
  const [error, setError] = useState("")
  const damageOpts: DamageType[] = [
    "body",
    "paint",
    "interior",
    "electrical",
    "mechanical",
    "other",
  ]
  const priorityOpts: Priority[] = ["low", "normal", "high", "urgent"]

  function submit() {
    if (!description.trim()) {
      setError("Damage description is required.")
      return
    }
    const now = new Date()
    const ticket: RepairTicket = {
      id: `t-${Date.now()}`,
      ticketNo: newNo(),
      cabinCode: cabin.code,
      cabinModel: cabin.model,
      createdAt: now,
      createdByName: ME.name,
      damageType,
      description: description.trim(),
      priority,
      status: "open",
      updates: [
        {
          id: `u-${Date.now()}`,
          timestamp: now,
          authorName: ME.name,
          note: `Ticket created after scanning cabin ${cabin.code}.`,
          type: "created",
        },
      ],
    }
    onCreated(ticket)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div
        className="px-5 pt-12 pb-4 flex items-center gap-3"
        style={{ background: T.card, boxShadow: T.shadow }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: T.bg, color: T.text }}
        >
          <Ic.Arrow />
        </button>
        <div>
          <p style={{ ...TS.lg, fontWeight: 600, color: T.text }}>
            Create Repair Ticket
          </p>
          <p style={{ ...TS.xs, color: T.muted }}>
            {cabin.code} · {cabin.model}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {/* Cabin info card */}
        <Card
          style={{
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: T.orangeL }}
          >
            <span style={{ color: T.orange }}>
              <Ic.Scan s={18} />
            </span>
          </div>
          <div className="flex-1">
            <p style={{ ...TS.md, fontWeight: 700, color: T.text }}>
              {cabin.code}
            </p>
            <p style={{ ...TS.sm, color: T.sub }}>{cabin.model}</p>
          </div>
          <span
            className="px-2.5 py-1 rounded-full"
            style={{
              ...TS.xs,
              fontWeight: 700,
              background: T.orangeL,
              color: T.orange,
            }}
          >
            New
          </span>
        </Card>

        {/* Jenis kerusakan */}
        <div>
          <p
            className="mb-2.5 uppercase tracking-wide"
            style={{ ...TS.xs, fontWeight: 600, color: T.sub }}
          >
            Damage Type
          </p>
          <div className="grid grid-cols-3 gap-2">
            {damageOpts.map((d) => (
              <button
                key={d}
                onClick={() => setDamageType(d)}
                className="py-2.5 rounded-xl transition-all active:scale-95"
                style={{
                  ...TS.xs,
                  fontWeight: 600,
                  background: damageType === d ? T.orange : T.card,
                  color: damageType === d ? "#fff" : T.sub,
                  boxShadow:
                    damageType === d ? `0 4px 12px ${T.orange}44` : T.shadow,
                }}
              >
                {DAMAGE_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <p
            className="mb-2.5 uppercase tracking-wide"
            style={{ ...TS.xs, fontWeight: 600, color: T.sub }}
          >
            Priority
          </p>
          <div className="grid grid-cols-4 gap-2">
            {priorityOpts.map((p) => {
              const c = PRIORITY_CFG[p]
              const sel = priority === p
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className="py-2.5 rounded-xl transition-all active:scale-95"
                  style={{
                    ...TS.xs,
                    fontWeight: 700,
                    background: sel ? c.color : T.card,
                    color: sel ? "#fff" : c.color,
                    boxShadow: sel ? `0 4px 12px ${c.color}44` : T.shadow,
                  }}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <p
            className="mb-2.5 uppercase tracking-wide"
            style={{ ...TS.xs, fontWeight: 600, color: T.sub }}
          >
            Damage Description
          </p>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setError("")
            }}
            placeholder="Describe the damage found…"
            rows={4}
            className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none resize-none"
            style={{
              background: T.card,
              border: `1.5px solid ${error ? T.red : T.border}`,
              color: T.text,
              boxShadow: T.shadow,
            }}
          />
          {error && (
            <p
              className="mt-1.5"
              style={{ ...TS.xs, fontWeight: 500, color: T.red }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Assigned */}
        <div>
          <p
            className="mb-2.5 uppercase tracking-wide"
            style={{ ...TS.xs, fontWeight: 600, color: T.sub }}
          >
            Assigned to
          </p>
          <Card
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
              style={{ ...TS.sm, background: T.orange }}
            >
              {ME.name[0]}
            </div>
            <div className="flex-1">
              <p style={{ ...TS.sm, fontWeight: 600, color: T.text }}>
                {ME.name}
              </p>
              <p style={{ ...TS.xs, color: T.muted }}>{ME.department}</p>
            </div>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                ...TS.xs,
                fontWeight: 700,
                background: T.orangeL,
                color: T.orange,
              }}
            >
              Me
            </span>
          </Card>
        </div>

        <button
          onClick={submit}
          className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80"
          style={{
            ...TS.md,
            fontWeight: 700,
            background: T.orange,
            boxShadow: `0 6px 20px ${T.orange}55`,
          }}
        >
          Create Repair Ticket
        </button>
      </div>
    </div>
  )
}

// ─── Ticket Detail Screen ─────────────────────────────────────────────────────
function TicketDetailScreen({
  ticket,
  onBack,
  onUpdate,
}: {
  ticket: RepairTicket
  onBack: () => void
  onUpdate: (t: RepairTicket) => void
}) {
  const [showUpdate, setShowUpdate] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [updateNote, setUpdateNote] = useState("")
  const [closeNote, setCloseNote] = useState("")
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 10000)
    return () => clearInterval(t)
  }, [])

  function startRepair() {
    const now = new Date()
    onUpdate({
      ...ticket,
      status: "in_progress",
      assignedToName: ME.name,
      startedAt: now,
      updates: [
        ...ticket.updates,
        {
          id: `u-${Date.now()}`,
          timestamp: now,
          authorName: ME.name,
          note: "Work started.",
          type: "started",
        },
      ],
    })
  }
  function addUpdate() {
    if (!updateNote.trim()) return
    const now = new Date()
    onUpdate({
      ...ticket,
      updates: [
        ...ticket.updates,
        {
          id: `u-${Date.now()}`,
          timestamp: now,
          authorName: ME.name,
          note: updateNote.trim(),
          type: "updated",
        },
      ],
    })
    setUpdateNote("")
    setShowUpdate(false)
  }
  function holdTicket() {
    const now = new Date()
    onUpdate({
      ...ticket,
      status: "on_hold",
      updates: [
        ...ticket.updates,
        {
          id: `u-${Date.now()}`,
          timestamp: now,
          authorName: ME.name,
          note: "Work temporarily on hold.",
          type: "hold",
        },
      ],
    })
  }
  function resumeTicket() {
    const now = new Date()
    onUpdate({
      ...ticket,
      status: "in_progress",
      updates: [
        ...ticket.updates,
        {
          id: `u-${Date.now()}`,
          timestamp: now,
          authorName: ME.name,
          note: "Work resumed.",
          type: "resumed",
        },
      ],
    })
  }
  function closeTicket() {
    if (!closeNote.trim()) return
    const now = new Date()
    const dur = ticket.startedAt
      ? Math.round((now.getTime() - ticket.startedAt.getTime()) / 1000)
      : 0
    onUpdate({
      ...ticket,
      status: "closed",
      closedAt: now,
      closureNotes: closeNote.trim(),
      durationSeconds: dur,
      updates: [
        ...ticket.updates,
        {
          id: `u-${Date.now()}`,
          timestamp: now,
          authorName: ME.name,
          note: closeNote.trim(),
          type: "closed",
        },
      ],
    })
    setCloseNote("")
    setShowClose(false)
  }

  const { status } = ticket
  const barColor =
    status === "closed"
      ? T.green
      : status === "in_progress"
        ? T.orange
        : status === "on_hold"
          ? T.amber
          : T.blue

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-4"
        style={{ background: T.card, boxShadow: T.shadow }}
      >
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: T.bg, color: T.text }}
          >
            <Ic.Arrow />
          </button>
          <div className="flex-1 min-w-0">
            <p style={{ ...TS.lg, fontWeight: 700, color: T.text }}>
              {ticket.cabinCode}
            </p>
            <p style={{ ...TS.xs, color: T.muted }}>{ticket.ticketNo}</p>
          </div>
          <StatusDot status={status} />
        </div>
        <div className="flex gap-2 flex-wrap pl-12">
          <span
            className="px-2.5 py-0.5 rounded-full"
            style={{ ...TS.xs, background: T.borderL, color: T.sub }}
          >
            {ticket.cabinModel}
          </span>
          <span
            className="px-2.5 py-0.5 rounded-full"
            style={{ ...TS.xs, background: T.borderL, color: T.sub }}
          >
            {DAMAGE_LABELS[ticket.damageType]}
          </span>
          <PriorityPill priority={ticket.priority} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Description card */}
        <div className="px-4 py-4">
          <Card style={{ padding: 16, borderLeft: `4px solid ${barColor}` }}>
            <p
              className="mb-1.5 uppercase tracking-wide"
              style={{ ...TS.xs, fontWeight: 600, color: T.muted }}
            >
              Damage Description
            </p>
            <p style={{ ...TS.sm, color: T.sub, lineHeight: 1.65 }}>
              {ticket.description}
            </p>
          </Card>
        </div>

        {/* Time stats */}
        <div className="px-4 mb-4">
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div
              className="grid grid-cols-3 divide-x"
              style={{ borderColor: T.borderL }}
            >
              {[
                ["Created", fmtTime(ticket.createdAt)],
                ["Start", ticket.startedAt ? fmtTime(ticket.startedAt) : "—"],
                status === "in_progress" && ticket.startedAt
                  ? ["Ongoing", elapsed(ticket.startedAt)]
                  : [
                      "Duration",
                      ticket.durationSeconds
                        ? fmtDur(ticket.durationSeconds)
                        : "—",
                    ],
              ].map(([l, v], i) => (
                <div
                  key={i}
                  className="px-3 py-3.5 text-center"
                  style={{
                    borderRight: i < 2 ? `1px solid ${T.borderL}` : undefined,
                  }}
                >
                  <p className="mb-1" style={{ ...TS.xs, color: T.muted }}>
                    {l}
                  </p>
                  <p
                    style={{
                      ...TS.xs,
                      fontWeight: 700,
                      color:
                        i === 2 && status === "in_progress" ? T.orange : T.text,
                    }}
                  >
                    {v}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Action buttons */}
        {status !== "closed" && (
          <div className="px-4 mb-4">
            <div className="flex gap-2 flex-wrap">
              {status === "open" && (
                <button
                  onClick={startRepair}
                  className="flex-1 py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80"
                  style={{
                    ...TS.md,
                    fontWeight: 700,
                    background: T.orange,
                    boxShadow: `0 4px 12px ${T.orange}44`,
                  }}
                >
                  <Ic.Play />
                  Start Repair
                </button>
              )}
              {status === "in_progress" && (
                <>
                  <button
                    onClick={() => setShowUpdate(true)}
                    className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-opacity active:opacity-80"
                    style={{
                      ...TS.sm,
                      fontWeight: 600,
                      background: T.card,
                      boxShadow: T.shadow,
                      color: T.text,
                    }}
                  >
                    <Ic.Plus s={15} />
                    Update
                  </button>
                  <button
                    onClick={holdTicket}
                    className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-opacity active:opacity-80"
                    style={{
                      ...TS.sm,
                      fontWeight: 600,
                      background: T.amberL,
                      border: `1px solid ${T.amberB}`,
                      color: T.amber,
                    }}
                  >
                    <Ic.Pause />
                    Hold
                  </button>
                  <button
                    onClick={() => setShowClose(true)}
                    className="w-full py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80 mt-1"
                    style={{
                      ...TS.md,
                      fontWeight: 700,
                      background: T.green,
                      boxShadow: `0 4px 12px ${T.green}44`,
                    }}
                  >
                    <Ic.Check />
                    Close Ticket
                  </button>
                </>
              )}
              {status === "on_hold" && (
                <>
                  <button
                    onClick={resumeTicket}
                    className="flex-1 py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80"
                    style={{ ...TS.md, fontWeight: 700, background: T.orange }}
                  >
                    <Ic.Play />
                    Resume
                  </button>
                  <button
                    onClick={() => setShowClose(true)}
                    className="flex-1 py-3.5 rounded-2xl text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80"
                    style={{ ...TS.md, fontWeight: 700, background: T.green }}
                  >
                    <Ic.Check />
                    Selesai
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Closure note */}
        {status === "closed" && ticket.closureNotes && (
          <div className="px-4 mb-4">
            <Card
              style={{
                padding: 16,
                background: T.greenL,
                border: `1px solid ${T.greenB}`,
              }}
            >
              <p
                className="mb-1"
                style={{ ...TS.xs, fontWeight: 700, color: T.green }}
              >
                Closure Notes
              </p>
              <p style={{ ...TS.sm, color: T.sub }}>{ticket.closureNotes}</p>
            </Card>
          </div>
        )}

        {/* Timeline */}
        <div className="px-4 pb-5">
          <p
            className="mb-3 uppercase tracking-wider"
            style={{ ...TS.xs, fontWeight: 700, color: T.sub }}
          >
            Ticket History
          </p>
          <div className="relative pl-5">
            <div
              className="absolute left-2 top-2 bottom-2 w-px"
              style={{ background: T.border }}
            />
            {[...ticket.updates].reverse().map((u, i) => (
              <div key={u.id} className="relative mb-3">
                <div
                  className="absolute -left-3 top-2 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ background: UPDATE_DOT[u.type] }}
                />
                <Card style={{ padding: "12px 14px" }}>
                  <div className="flex justify-between items-center mb-1">
                    <p
                      style={{
                        ...TS.xs,
                        fontWeight: 700,
                        color: UPDATE_DOT[u.type],
                      }}
                    >
                      {UPDATE_LABEL[u.type]}
                    </p>
                    <p style={{ ...TS.xs, color: T.muted }}>
                      {fmtTime(u.timestamp)}
                    </p>
                  </div>
                  <p style={{ ...TS.sm, color: T.sub }}>{u.note}</p>
                  <p className="mt-1" style={{ ...TS.xs, color: T.muted }}>
                    {u.authorName}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Update modal */}
      {showUpdate && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="rounded-t-3xl p-5 space-y-4"
            style={{ background: T.card }}
          >
            <div className="flex justify-between items-center">
              <p style={{ ...TS.md, fontWeight: 700, color: T.text }}>
                Add Progress Update
              </p>
              <button
                onClick={() => setShowUpdate(false)}
                style={{ color: T.muted }}
              >
                <Ic.X s={20} />
              </button>
            </div>
            <textarea
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
              placeholder="Describe current repair progress…"
              rows={4}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
              style={{
                background: T.bg,
                border: `1.5px solid ${T.border}`,
                color: T.text,
              }}
            />
            <button
              onClick={addUpdate}
              className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80"
              style={{ ...TS.md, fontWeight: 700, background: T.orange }}
            >
              Save Update
            </button>
          </div>
        </div>
      )}

      {/* Close modal */}
      {showClose && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="rounded-t-3xl p-5 space-y-4"
            style={{ background: T.card }}
          >
            <div className="flex justify-between items-center">
              <p style={{ ...TS.md, fontWeight: 700, color: T.text }}>
                Close Ticket Perbaikan
              </p>
              <button
                onClick={() => setShowClose(false)}
                style={{ color: T.muted }}
              >
                <Ic.X s={20} />
              </button>
            </div>
            <p style={{ ...TS.sm, color: T.sub }}>
              Add closure notes and confirm repair completion.
            </p>
            <textarea
              value={closeNote}
              onChange={(e) => setCloseNote(e.target.value)}
              placeholder="Repair results, final cabin condition…"
              rows={4}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
              style={{
                background: T.bg,
                border: `1.5px solid ${T.border}`,
                color: T.text,
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowClose(false)}
                className="flex-1 py-4 rounded-2xl transition-opacity active:opacity-60"
                style={{
                  ...TS.sm,
                  fontWeight: 600,
                  background: T.bg,
                  border: `1px solid ${T.border}`,
                  color: T.sub,
                }}
              >
                Cancel
              </button>
              <button
                onClick={closeTicket}
                className="py-4 px-6 rounded-2xl text-white transition-opacity active:opacity-80"
                style={{
                  ...TS.md,
                  fontWeight: 700,
                  background: closeNote.trim() ? T.green : "#ccc",
                  flex: 2,
                }}
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tickets List Screen ──────────────────────────────────────────────────────
function TicketsScreen({
  tickets,
  onDetail,
}: {
  tickets: RepairTicket[]
  onDetail: (t: RepairTicket) => void
}) {
  const [filter, setFilter] = useState<TicketStatus | "all">("all")
  const filters: [TicketStatus | "all", string][] = [
    ["all", "All"],
    ["open", "Open"],
    ["in_progress", "In Progress"],
    ["on_hold", "Hold"],
    ["closed", "Closed"],
  ]
  const shown = [
    ...(filter === "all"
      ? tickets
      : tickets.filter((t) => t.status === filter)),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-4"
        style={{ background: T.card, boxShadow: T.shadow }}
      >
        <p style={{ ...TS.xs, color: T.muted }}>All tickets</p>
        <p style={{ ...TS.xl, fontWeight: 700, color: T.text }}>
          Repair Tickets
        </p>
      </div>

      {/* Filter pills */}
      <div
        className="px-4 py-3"
        style={{ background: T.card, boxShadow: T.shadow }}
      >
        <div
          className="flex gap-2 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: "none" }}
        >
          {filters.map(([key, label]) => {
            const cnt =
              key === "all"
                ? tickets.length
                : tickets.filter((t) => t.status === key).length
            const sel = filter === key
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all"
                style={{
                  ...TS.xs,
                  fontWeight: 600,
                  background: sel ? T.orange : T.bg,
                  color: sel ? "#fff" : T.sub,
                }}
              >
                {label}
                {cnt > 0 && (
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-white"
                    style={{
                      fontSize: 10,
                      background: sel ? `rgba(255,255,255,0.3)` : T.muted,
                    }}
                  >
                    {cnt}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {shown.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-40 gap-2"
            style={{ color: T.muted }}
          >
            <Ic.Ticket s={36} />
            <p style={{ ...TS.sm }}>No tickets</p>
          </div>
        ) : (
          shown.map((t) => (
            <TicketRow key={t.id} ticket={t} onClick={() => onDetail(t)} />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
function DashboardScreen({ tickets }: { tickets: RepairTicket[] }) {
  const closed = tickets.filter((t) => t.status === "closed")
  const inProg = tickets.filter((t) => t.status === "in_progress")
  const onHold = tickets.filter((t) => t.status === "on_hold")
  const avgDurSec = closed.filter((t) => t.durationSeconds).length
    ? Math.round(
        closed.reduce((a, t) => a + (t.durationSeconds ?? 0), 0) /
          closed.filter((t) => t.durationSeconds).length,
      )
    : 0

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-4"
        style={{ background: T.card, boxShadow: T.shadow }}
      >
        <p style={{ ...TS.xs, color: T.muted }}>Today's Summary</p>
        <p style={{ ...TS.xl, fontWeight: 700, color: T.text }}>Dashboard</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {/* Two KPI cards — image-2 style */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div
            className="rounded-2xl p-4"
            style={{ background: T.blue, boxShadow: `0 6px 20px ${T.blue}44` }}
          >
            <p
              className="mb-2"
              style={{
                ...TS.xs,
                fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Tiket Selesai
            </p>
            <p style={{ ...TS["3xl"], fontWeight: 700, color: "#fff" }}>
              {closed.length}
            </p>
            <p
              className="mt-1"
              style={{ ...TS.xs, color: "rgba(255,255,255,0.6)" }}
            >
              Hari ini
            </p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{
              background: T.orange,
              boxShadow: `0 6px 20px ${T.orange}44`,
            }}
          >
            <p
              className="mb-2"
              style={{
                ...TS.xs,
                fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Sedang Dikerjakan
            </p>
            <p style={{ ...TS["3xl"], fontWeight: 700, color: "#fff" }}>
              {inProg.length}
            </p>
            <p
              className="mt-1"
              style={{ ...TS.xs, color: "rgba(255,255,255,0.6)" }}
            >
              In progress
            </p>
          </div>
        </div>

        {/* Secondary KPI row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "On Hold", value: onHold.length, color: T.amber },
            {
              label: "Average",
              value: avgDurSec ? fmtDur(avgDurSec) : "—",
              color: T.green,
            },
            { label: "Total", value: tickets.length, color: T.violet },
          ].map(({ label, value, color }) => (
            <Card
              key={label}
              style={{ padding: "12px 10px", textAlign: "center" }}
            >
              <p
                className="leading-none"
                style={{ ...TS.xl, fontWeight: 700, color }}
              >
                {value}
              </p>
              <p className="mt-1.5" style={{ ...TS.xs, color: T.muted }}>
                {label}
              </p>
            </Card>
          ))}
        </div>

        {/* Trend chart */}
        <div className="mb-5">
          <Card
            style={{
              padding: "16px",
              border: `1px solid ${T.borderL}`,
              boxShadow: "none",
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <p style={{ ...TS.md, fontWeight: 600, color: T.text }}>
                Closed Tickets Trend — 7 Days
              </p>
              <div className="flex items-center gap-3">
                {/* Toggle */}
                <div
                  style={{
                    background: "#3b82f6",
                    borderRadius: "99px",
                    padding: "3px 3px 3px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 600,
                    }}
                  >
                    Bar
                  </span>
                  <div
                    style={{
                      background: "#fff",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                {/* View All */}
                <button
                  style={{
                    color: "#3b82f6",
                    fontSize: "12px",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    background: "none",
                    border: "none",
                  }}
                >
                  View All{" "}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Dropdowns */}
            <div className="flex gap-3 mt-4 mb-6">
              <div
                className="flex-1 flex justify-between items-center px-3 py-2 rounded-lg"
                style={{ border: `1px solid ${T.border}` }}
              >
                <span style={{ ...TS.sm, color: T.text }}>All Types</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <div
                className="flex-1 flex justify-between items-center px-3 py-2 rounded-lg"
                style={{ border: `1px solid ${T.border}` }}
              >
                <span style={{ ...TS.sm, color: T.text }}>This Week</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Chart */}
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={DAILY_TREND}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={T.borderL}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 11,
                      fill: T.sub,
                      fontFamily: "'Inter', sans-serif",
                    }}
                    axisLine={{ stroke: T.borderL }}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: T.sub,
                      fontFamily: "'Inter', sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Ticket Quantity",
                      angle: -90,
                      position: "insideLeft",
                      fill: T.sub,
                      fontSize: 11,
                      dy: 40,
                    }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div
                            style={{
                              background: "#4b5563",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              color: "#fff",
                              position: "relative",
                              transform: "translateY(-10px)",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              minWidth: "100px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                marginBottom: "6px",
                              }}
                            >
                              {label}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <div
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  background: "#38bdf8",
                                  borderRadius: "2px",
                                }}
                              />
                              <p style={{ fontSize: "11px" }}>
                                Total : {payload[0].value}
                              </p>
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                bottom: "-6px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: 0,
                                height: 0,
                                borderLeft: "6px solid transparent",
                                borderRight: "6px solid transparent",
                                borderTop: "6px solid #4b5563",
                              }}
                            />
                          </div>
                        )
                      }
                      return null
                    }}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#38bdf8"
                    radius={[2, 2, 0, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* By damage */}
        <div className="mb-4">
          <SectionHd title="Per Damage Type" />
          <Card>
            {([
              "body",
              "paint",
              "interior",
              "electrical",
              "mechanical",
            ] as DamageType[]).map((d, i, arr) => {
              const cnt = tickets.filter((t) => t.damageType === d).length
              const max = Math.max(
                ...arr.map(
                  (x) => tickets.filter((t) => t.damageType === x).length,
                ),
                1,
              )
              return (
                <div
                  key={d}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    borderBottom:
                      i < arr.length - 1 ? `1px solid ${T.borderL}` : undefined,
                  }}
                >
                  <p
                    className="w-20 flex-shrink-0"
                    style={{ ...TS.sm, color: T.sub }}
                  >
                    {DAMAGE_LABELS[d]}
                  </p>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: T.borderL }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(cnt / max) * 100}%`,
                        background: T.orange,
                      }}
                    />
                  </div>
                  <p
                    className="w-4 text-right flex-shrink-0"
                    style={{ ...TS.sm, fontWeight: 700, color: T.orange }}
                  >
                    {cnt}
                  </p>
                </div>
              )
            })}
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({
  tickets,
  onScan,
  onTicketDetail,
  onAllTickets,
}: {
  tickets: RepairTicket[]
  onScan: () => void
  onTicketDetail: (t: RepairTicket) => void
  onAllTickets: () => void
}) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 30000)
    return () => clearInterval(t)
  }, [])

  const now2 = new Date()
  const hour = now2.getHours()
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"
  const myTickets = tickets.filter(
    (t) => t.createdByName === ME.name || t.assignedToName === ME.name,
  )
  const myActive = myTickets.filter(
    (t) => t.status === "in_progress" || t.status === "on_hold",
  )
  const myClosed = myTickets.filter((t) => t.status === "closed")
  const recentUpdates = [...tickets]
    .sort(
      (a, b) =>
        b.updates[b.updates.length - 1].timestamp.getTime() -
        a.updates[a.updates.length - 1].timestamp.getTime(),
    )
    .slice(0, 3)

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Header — version 8 white style */}
      <div
        className="px-5 pt-12 pb-3 flex justify-between items-center"
        style={{ background: T.card }}
      >
        <div>
          <p style={{ ...TS.sm, color: T.sub }}>{greeting},</p>
          <p
            className="leading-tight"
            style={{ ...TS.lg, fontWeight: 700, color: T.text }}
          >
            {ME.name.split(" ")[0]}!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: T.bg, color: T.sub }}
          >
            <Ic.Bell s={18} />
          </button>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white"
            style={{ ...TS.sm, background: T.orange }}
          >
            {ME.name[0]}
          </div>
        </div>
      </div>

      {/* 3 KPI cards — version 8 style */}
      <div
        className="px-4 py-4 mb-1"
        style={{ background: T.card, boxShadow: T.shadow }}
      >
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Closed",
              value: myClosed.length,
              sub: "by me",
              color: T.green,
            },
            {
              label: "Aktif",
              value: myActive.length,
              sub: "in progress",
              color: T.orange,
            },
            {
              label: "Total",
              value: myTickets.length,
              sub: "my tickets",
              color: T.blue,
            },
          ].map(({ label, value, sub, color }) => (
            <Card key={label} style={{ padding: "12px 10px" }}>
              <p
                className="leading-none"
                style={{ ...TS["2xl"], fontWeight: 700, color }}
              >
                {value}
              </p>
              <p
                className="mt-2 leading-tight"
                style={{ ...TS.xs, fontWeight: 600, color: T.text }}
              >
                {label}
              </p>
              <p className="mt-0.5" style={{ ...TS.xs, color: T.muted }}>
                {sub}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Today's tickets — image-2 "Today's Jobs" style */}
        <div className="mb-5">
          <SectionHd
            title="Today's Tickets"
            count={myActive.length}
            action="See all"
            onAction={onAllTickets}
          />
          {myActive.length === 0 ? (
            <Card style={{ padding: 20, textAlign: "center" }}>
              <p style={{ ...TS.sm, color: T.muted }}>No tickets aktif</p>
            </Card>
          ) : (
            myActive.map((t) => (
              <TicketRow
                key={t.id}
                ticket={t}
                onClick={() => onTicketDetail(t)}
              />
            ))
          )}
        </div>

        {/* Today's updates — image-2 "Today's Updates" style */}
        <div>
          <SectionHd
            title="Today's Updates"
            count={recentUpdates.length}
            action="See all"
            onAction={onAllTickets}
          />
          {recentUpdates.map((t) => (
            <ActivityCard key={t.id} ticket={t} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Profil Screen ────────────────────────────────────────────────────────────
function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div
        className="px-5 pt-12 pb-4"
        style={{ background: T.card, boxShadow: T.shadow }}
      >
        <p style={{ ...TS.xs, color: T.muted }}>Akun saya</p>
        <p style={{ ...TS.xl, fontWeight: 700, color: T.text }}>Profil</p>
      </div>
      <div className="px-4 py-5 space-y-4">
        <Card
          style={{
            padding: 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
            style={{ ...TS.xl, background: T.orange }}
          >
            {ME.name[0]}
          </div>
          <div>
            <p style={{ ...TS.md, fontWeight: 700, color: T.text }}>
              {ME.name}
            </p>
            <p style={{ ...TS.sm, color: T.sub }}>{ME.department}</p>
            <p className="mt-0.5" style={{ ...TS.xs, color: T.muted }}>
              NIK {ME.nik}
            </p>
          </div>
        </Card>
        <Card>
          {[
            ["NIK", ME.nik],
            ["Departemen", ME.department],
            ["Role", "Manpower"],
            ["Status", "Aktif"],
            ["Versi App", "1.0.0"],
          ].map(([l, v], i, arr) => (
            <div
              key={l}
              className="flex justify-between items-center px-5 py-3.5"
              style={{
                borderBottom:
                  i < arr.length - 1 ? `1px solid ${T.borderL}` : undefined,
              }}
            >
              <span style={{ ...TS.sm, color: T.muted }}>{l}</span>
              <span style={{ ...TS.sm, fontWeight: 600, color: T.text }}>
                {v}
              </span>
            </div>
          ))}
        </Card>
        <button
          onClick={onLogout}
          className="w-full py-4 rounded-2xl transition-opacity active:opacity-70"
          style={{
            ...TS.sm,
            fontWeight: 600,
            background: T.redL,
            border: `1px solid ${T.redB}`,
            color: T.red,
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [nik, setNik] = useState("")
  const [pin, setPin] = useState("")
  const [err, setErr] = useState("")
  function submit(e: React.FormEvent) {
    e.preventDefault()
    nik === "240315" && pin === "1234"
      ? onLogin()
      : setErr("Invalid NIK or PIN.")
  }
  return (
    <div className="flex flex-col h-full" style={{ background: "#f8faff" }}>
      <div
        className="flex-1 flex flex-col"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Full-width Illustration */}
        <div className="flex-1 w-full" style={{ position: "relative", zIndex: 1 }}>
          <img
            src={heroImg}
            alt="Cabin Track with RFID"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60px",
              background: "linear-gradient(to bottom, rgba(248, 250, 255, 0) 0%, #f8faff 100%)",
              zIndex: 2,
            }}
          />
        </div>


      </div>
      <div
        className="px-5 pb-10 pt-6"
        style={{
          background: T.card,
          boxShadow: "0 -2px 20px rgba(15,17,20,0.08)",
        }}
      >
        <form onSubmit={submit} className="space-y-4">
          <p
            className="mb-4 leading-tight"
            style={{ ...TS["xl"], fontWeight: 700, color: T.text }}
          >
            Login with your Account
          </p>
          <div>
            <label
              className="block mb-2 uppercase tracking-wide"
              style={{ ...TS.xs, fontWeight: 600, color: T.sub }}
            >
              NIK
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={nik}
              placeholder="Enter your NIK"
              onChange={(e) => {
                setNik(e.target.value)
                setErr("")
              }}
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
              style={{
                background: T.bg,
                border: `1.5px solid ${err ? T.red : T.border}`,
                color: T.text,
              }}
            />
          </div>
          <div>
            <label
              className="block mb-2 uppercase tracking-wide"
              style={{ ...TS.xs, fontWeight: 600, color: T.sub }}
            >
              PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              placeholder="••••"
              onChange={(e) => {
                setPin(e.target.value)
                setErr("")
              }}
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
              style={{
                background: T.bg,
                border: `1.5px solid ${err ? T.red : T.border}`,
                color: T.text,
                letterSpacing: "0.5em",
              }}
            />
          </div>
          {err && (
            <p style={{ ...TS.xs, fontWeight: 500, color: T.red }}>{err}</p>
          )}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl text-white transition-opacity active:opacity-80 mt-2"
            style={{
              ...TS.md,
              fontWeight: 700,
              background: T.orange,
              boxShadow: `0 6px 16px ${T.orange}44`,
            }}
          >
            Login
          </button>
        </form>
        <p className="text-center mt-4" style={{ ...TS.xs, color: T.muted }}>
          Demo: 240315 / 1234
        </p>
      </div>
    </div>
  )
}

// ─── Bottom Nav — FAB scan style (image-3) ────────────────────────────────────
function BottomNav({
  active,
  onChange,
  onScan,
}: {
  active: Screen
  onChange: (s: Screen) => void
  onScan: () => void
}) {
  const tabs = [
    { id: "home" as Screen, label: "Home", icon: <Ic.Ticket s={22} /> },
    { id: "tickets" as Screen, label: "Tickets", icon: <Ic.Ticket s={22} /> },
    // center = FAB
    { id: "dashboard" as Screen, label: "Dashboard", icon: <Ic.Grid s={22} /> },
    { id: "profile" as Screen, label: "Profile", icon: <Ic.User s={22} /> },
  ]
  return (
    <div
      className="relative flex items-center"
      style={{
        background: T.card,
        boxShadow: "0 -1.75px 4px -1px rgba(15,17,20,0.08)",
        paddingBottom: 4,
      }}
    >
      {/* Left two tabs */}
      {tabs.slice(0, 2).map((t) => {
        const on = active === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-opacity active:opacity-60"
          >
            <span style={{ color: on ? T.orange : T.muted }}>
              {t.icon === tabs[0].icon ? (
                <Ic.Ticket s={22} />
              ) : (
                <Ic.Ticket s={22} />
              )}
            </span>
            <span
              style={{
                ...TS.xs,
                fontWeight: 600,
                color: on ? T.orange : T.muted,
              }}
            >
              {t.label}
            </span>
            {on && (
              <div
                className="w-4 h-0.5 rounded-full"
                style={{ background: T.orange }}
              />
            )}
          </button>
        )
      })}

      {/* FAB — scan button center */}
      <div
        className="flex-shrink-0 flex flex-col items-center"
        style={{ width: 64 }}
      >
        <button
          onClick={onScan}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-90 -mt-5"
          style={{
            background: T.orange,
            boxShadow: `0 6px 20px ${T.orange}66`,
          }}
        >
          <Ic.Scan s={24} />
        </button>
        <span
          className="mt-0.5"
          style={{ ...TS.xs, fontWeight: 600, color: T.orange }}
        >
          Scan
        </span>
      </div>

      {/* Right two tabs */}
      {tabs.slice(2).map((t) => {
        const on = active === t.id
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-opacity active:opacity-60"
          >
            <span style={{ color: on ? T.orange : T.muted }}>
              {t.id === "dashboard" ? <Ic.Grid s={22} /> : <Ic.User s={22} />}
            </span>
            <span
              style={{
                ...TS.xs,
                fontWeight: 600,
                color: on ? T.orange : T.muted,
              }}
            >
              {t.label}
            </span>
            {on && (
              <div
                className="w-4 h-0.5 rounded-full"
                style={{ background: T.orange }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────
const FRAME: React.CSSProperties = {
  background: T.card,
  borderRadius: 44,
  overflow: "hidden",
  boxShadow: "0 0 0 1px #e0e0e0, 0 40px 100px rgba(0,0,0,0.22)",
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [screen, setScreen] = useState<Screen>("home")
  const [tickets, setTickets] = useState<RepairTicket[]>(MOCK_TICKETS)
  const [scannedCabin, setScannedCabin] = useState<ScannedCabin | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(
    null,
  )

  function handleCabinScanned(
    cabin: ScannedCabin,
    existing: RepairTicket | null,
  ) {
    setScannedCabin(cabin)
    if (existing) {
      setSelectedTicket(existing)
      setScreen("ticket_detail")
    } else {
      setScreen("create_ticket")
    }
  }
  function handleTicketCreated(t: RepairTicket) {
    setTickets((p) => [t, ...p])
    setSelectedTicket(t)
    setScreen("ticket_detail")
  }
  function handleTicketUpdated(t: RepairTicket) {
    setTickets((p) => p.map((x) => (x.id === t.id ? t : x)))
    setSelectedTicket(t)
  }
  function goTo(s: Screen) {
    setScreen(s)
    setSelectedTicket(null)
    setScannedCabin(null)
  }

  const phoneClass =
    "relative w-full max-w-sm h-full max-h-[812px] flex flex-col"
  const wrapStyle = { background: "#d0d0d0" }

  if (!loggedIn)
    return (
      <div
        className="size-full flex items-center justify-center"
        style={wrapStyle}
      >
        <div className={phoneClass} style={FRAME}>
          <LoginScreen onLogin={() => setLoggedIn(true)} />
        </div>
      </div>
    )

  const showNav = !["scan", "create_ticket", "ticket_detail"].includes(screen)
  const navActive = ([
    "home",
    "tickets",
    "dashboard",
    "profile",
  ] as Screen[]).includes(screen)
    ? screen
    : "home"

  return (
    <div
      className="size-full flex items-center justify-center"
      style={wrapStyle}
    >
      <div className={phoneClass} style={FRAME}>
        <div className="flex-1 overflow-hidden relative">
          {screen === "home" && (
            <HomeScreen
              tickets={tickets}
              onScan={() => setScreen("scan")}
              onTicketDetail={(t) => {
                setSelectedTicket(t)
                setScreen("ticket_detail")
              }}
              onAllTickets={() => setScreen("tickets")}
            />
          )}
          {screen === "scan" && (
            <ScanScreen
              onBack={() => setScreen("home")}
              tickets={tickets}
              onCabinScanned={handleCabinScanned}
            />
          )}
          {screen === "create_ticket" && scannedCabin && (
            <CreateTicketScreen
              cabin={scannedCabin}
              onBack={() => setScreen("scan")}
              onCreated={handleTicketCreated}
            />
          )}
          {screen === "ticket_detail" && selectedTicket && (
            <TicketDetailScreen
              ticket={
                tickets.find((t) => t.id === selectedTicket.id) ??
                selectedTicket
              }
              onBack={() => setScreen("tickets")}
              onUpdate={handleTicketUpdated}
            />
          )}
          {screen === "tickets" && (
            <TicketsScreen
              tickets={tickets}
              onDetail={(t) => {
                setSelectedTicket(t)
                setScreen("ticket_detail")
              }}
            />
          )}
          {screen === "dashboard" && <DashboardScreen tickets={tickets} />}
          {screen === "profile" && (
            <ProfileScreen onLogout={() => setLoggedIn(false)} />
          )}
        </div>
        {showNav && (
          <BottomNav
            active={navActive}
            onChange={goTo}
            onScan={() => setScreen("scan")}
          />
        )}
      </div>
    </div>
  )
}
