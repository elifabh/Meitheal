"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import {
    LayoutDashboard, History, Settings, User, X,
    Clock, AlertTriangle, Leaf, UtensilsCrossed,
    Wifi, WifiOff, Map, ChevronRight, Package, BellRing
} from "lucide-react";

// Dynamically import Leaflet Map to prevent SSR crashing
const RescueMap = dynamic(() => import("../../components/RescueMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-emerald-50 rounded-2xl">
            <div className="skeleton w-full h-full rounded-2xl min-h-[400px]" />
        </div>
    ),
});

// Types matching the FastAPI backend payload
export interface FoodRescue {
    id: string;
    business_name: string;
    business_location: { lat: number; lng: number };
    extracted_food: string;
    allergens: string[];
    diet_type: string[];
    urgency_level: string;
    pin_color: string;
    status: string;
    created_at: string;
}

// ─── Sidebar Nav Links ─────────────────────────────────────────────────────────
const navLinks = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Map, label: "Map View", active: false },
    { icon: History, label: "History", active: false },
    { icon: Settings, label: "Settings", active: false },
];

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between">
                <div className="skeleton h-4 w-32 rounded-lg" />
                <div className="skeleton h-3 w-10 rounded-lg" />
            </div>
            <div className="skeleton h-3 w-full rounded-lg" />
            <div className="skeleton h-3 w-3/4 rounded-lg" />
            <div className="flex justify-between pt-2">
                <div className="skeleton h-6 w-16 rounded-lg" />
                <div className="skeleton h-8 w-20 rounded-xl" />
            </div>
        </div>
    );
}

// ─── Urgency Badge ─────────────────────────────────────────────────────────────
function UrgencyBadge({ level }: { level: string }) {
    const styles: Record<string, string> = {
        HIGH: "bg-red-50 text-red-700 border border-red-100",
        MEDIUM: "bg-amber-50 text-amber-700 border border-amber-100",
        LOW: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    };
    const labels: Record<string, string> = { HIGH: "Urgent", MEDIUM: "Moderate", LOW: "Low" };
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${styles[level] ?? styles.LOW}`}>
            {labels[level] ?? level}
        </span>
    );
}

function RescueDrawer({ rescue, onClose, onAccept }: { rescue: FoodRescue; onClose: () => void; onAccept: (rescue: FoodRescue) => void; }) {
    const [isAccepted, setIsAccepted] = useState(false);
    const borderColor = rescue.urgency_level === "HIGH" ? "border-red-400" : rescue.urgency_level === "MEDIUM" ? "border-amber-400" : "border-emerald-400";
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

            {/* Drawer panel */}
            <div
                className={`drawer-enter relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border-t-4 ${borderColor} p-6 z-10`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{rescue.business_name}</h2>
                        <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-sm">
                            <Clock size={13} />
                            <span>Reported at {formatTime(rescue.created_at)}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                {/* Food info */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-4 space-y-3">
                    <div className="flex gap-3 items-start">
                        <div className="p-2 bg-emerald-100 rounded-lg shrink-0"><Package size={16} className="text-emerald-700" /></div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Surplus Food</p>
                            <p className="text-slate-800 font-semibold mt-0.5">{rescue.extracted_food}</p>
                        </div>
                    </div>

                    {rescue.allergens.length > 0 && (
                        <div className="flex gap-3 items-start">
                            <div className="p-2 bg-amber-100 rounded-lg shrink-0"><AlertTriangle size={16} className="text-amber-700" /></div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Allergens</p>
                                <p className="text-slate-700 mt-0.5">{rescue.allergens.join(", ")}</p>
                            </div>
                        </div>
                    )}

                    {rescue.diet_type.length > 0 && (
                        <div className="flex gap-3 items-start">
                            <div className="p-2 bg-emerald-100 rounded-lg shrink-0"><Leaf size={16} className="text-emerald-700" /></div>
                            <div>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Diet Type</p>
                                <p className="text-slate-700 mt-0.5">{rescue.diet_type.join(", ")}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Urgency + CTA */}
                <div className="flex items-center justify-between">
                    <UrgencyBadge level={rescue.urgency_level} />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsAccepted(true);
                            if (rescue) onAccept(rescue);
                            setTimeout(() => onClose(), 1500);
                        }}
                        disabled={isAccepted}
                        className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all ${isAccepted
                            ? "bg-slate-200 text-slate-500 shadow-none cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-200"
                            }`}
                    >
                        {isAccepted ? <User size={15} /> : <UtensilsCrossed size={15} />}
                        {isAccepted ? "Mission Accepted" : "Accept Mission"}
                        {!isAccepted && <ChevronRight size={15} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function VolunteerDashboard() {
    const [rescues, setRescues] = useState<FoodRescue[]>([]);
    const [history, setHistory] = useState([
        { id: "h1", spot: "Centra Grand Parade", amount: "12 kg (Bakery)", date: "Yesterday, 18:30" },
        { id: "h2", spot: "Three Fools Coffee", amount: "5 kg (Pastries)", date: "Wed, 17:15" },
        { id: "h3", spot: "English Market - O'Flynns", amount: "8 kg (Produce)", date: "Mon, 16:40" },
    ]);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ title: string; message: string; id: string } | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRescue, setSelectedRescue] = useState<FoodRescue | null>(null);
    const [activeNav, setActiveNav] = useState("Dashboard");
    const wsRef = useRef<WebSocket | null>(null);

    const handleAcceptMission = (e: React.MouseEvent, rescue: FoodRescue) => {
        e.stopPropagation();
        setAcceptingId(rescue.id);

        setTimeout(() => {
            setRescues(prev => prev.filter(r => r.id !== rescue.id));

            const now = new Date();
            const timeString = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            setHistory(prev => [{
                id: rescue.id,
                spot: rescue.business_name,
                amount: rescue.extracted_food,
                date: timeString
            }, ...prev]);

            setAcceptingId(null);
        }, 1200);
    };

    useEffect(() => {
        let reconnectTimeout: NodeJS.Timeout;

        const connectWebSocket = () => {
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/api/ws/rescues";
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => { setIsConnected(true); setIsLoading(false); };

            ws.onmessage = (event) => {
                try {
                    const newRescue: FoodRescue = JSON.parse(event.data);
                    setIsLoading(false);
                    setRescues((prev) => {
                        // Avoid duplicates from pushing multiple times
                        if (prev.find((r) => r.id === newRescue.id)) return prev;

                        // Show Push Notification
                        setNotification({
                            title: newRescue.business_name,
                            message: newRescue.extracted_food,
                            id: newRescue.id
                        });

                        // Auto hide push after 5 seconds
                        setTimeout(() => {
                            setNotification(n => (n?.id === newRescue.id ? null : n));
                        }, 5000);

                        return [newRescue, ...prev];
                    });
                } catch { /* ignore */ }
            };

            ws.onclose = () => {
                setIsConnected(false);
                reconnectTimeout = setTimeout(connectWebSocket, 3000);
            };

            ws.onerror = () => ws.close();
            wsRef.current = ws;
        };

        connectWebSocket();
        // Stop skeleton after 4s even if no data
        const timeout = setTimeout(() => setIsLoading(false), 4000);

        return () => {
            clearTimeout(reconnectTimeout);
            clearTimeout(timeout);
            if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
        };
    }, []);

    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">

            {/* ── Real-time Push Notification Banner ── */}
            {notification && (
                <div className="absolute top-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] z-[999] animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/50 rounded-2xl p-4 flex gap-3.5 items-start cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setNotification(null)}>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 shrink-0 flex items-center justify-center border border-emerald-100 mt-0.5">
                            <BellRing size={18} className="text-emerald-500 animate-[wiggle_1s_ease-in-out_infinite]" />
                        </div>
                        <div className="flex-1 pr-2">
                            <p className="text-[10px] uppercase font-black tracking-wide text-emerald-600 mb-0.5">New Mission Alert</p>
                            <h4 className="font-bold text-slate-800 text-sm">{notification.title}</h4>
                            <p className="text-slate-500 text-xs mt-0.5 leading-snug line-clamp-2">{notification.message}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setNotification(null); }} className="text-slate-300 hover:text-slate-500 transition-colors p-1">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Sidebar ───────────────────────────────────────────────────────── */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 shadow-sm z-10">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <Leaf size={16} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 leading-none">Meitheal</h1>
                            <p className="text-[10px] text-slate-400 mt-0.5">Food Rescue Network</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navLinks.map(({ icon: Icon, label }) => (
                        <button
                            key={label}
                            onClick={() => setActiveNav(label)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeNav === label
                                ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                }`}
                        >
                            <Icon size={17} />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Profile area */}
                <div className="px-4 py-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                            <User size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">Volunteer</p>
                            <p className="text-[11px] text-slate-400">Cork City</p>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" />
                    </div>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden pb-[60px] md:pb-0">

                {/* Top bar */}
                <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">Live Dispatch</h2>
                        <p className="text-xs text-slate-400">Real-time food rescue operations</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${isConnected
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                        {isConnected ? (
                            <>
                                <span className="live-dot w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                <Wifi size={11} />
                                Live
                            </>
                        ) : (
                            <>
                                <WifiOff size={11} />
                                Connecting...
                            </>
                        )}
                    </div>
                </header>

                {/* Content grid */}
                <div className="flex-1 overflow-hidden flex flex-col-reverse sm:flex-row gap-0">
                    {activeNav === "History" ? (
                        <div className="w-full h-full flex flex-col items-center justify-start bg-slate-50 p-4 sm:p-6 overflow-y-auto custom-scrollbar pb-24">
                            <div className="w-full max-w-2xl space-y-6">
                                {/* Header Stats */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                        <History size={28} className="text-emerald-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-800">Your Impact</h3>
                                        <p className="text-slate-500 mt-1 font-medium">You've rescued 14 meals this month across Cork.</p>
                                    </div>
                                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-center shadow-md">
                                        <p className="text-2xl font-black">42<span className="text-sm font-semibold">kg</span></p>
                                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-90">CO2 Offset</p>
                                    </div>
                                </div>

                                {/* Instagram Card */}
                                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-1 rounded-2xl shadow-md">
                                    <div className="bg-white rounded-xl p-5 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                                Share Your Impact
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-1">Generate a custom highlight for <strong>{history[0]?.spot || 'local businesses'}</strong></p>
                                        </div>
                                        <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">
                                            Generate Post
                                        </button>
                                    </div>
                                </div>

                                {/* Past Donations List */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-slate-700 px-2 pt-2">Recent Rescues</h4>

                                    {history.map((item) => (
                                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                                    <Package size={16} className="text-slate-400" />
                                                </div>
                                                <div className="max-w-[160px] sm:max-w-[200px]">
                                                    <p className="font-bold text-sm text-slate-800 line-clamp-1">{item.spot}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.amount}</p>
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md shrink-0 ml-2">{item.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : activeNav === "Settings" ? (
                        <div className="w-full flex flex-col items-center justify-start bg-slate-50 p-4 sm:p-6 overflow-y-auto pb-24 custom-scrollbar">
                            <div className="w-full max-w-2xl space-y-6 mt-4 sm:mt-0">
                                <div className="text-center sm:text-left">
                                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto sm:mx-0 mb-4 text-slate-600 shadow-inner">
                                        <Settings size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Account Preferences</h3>
                                    <p className="text-slate-500 mt-1 text-sm font-medium">Manage alert radius and vehicle routing details here.</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <h4 className="font-semibold text-slate-800 mb-4">Notification Settings</h4>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                                        <div>
                                            <p className="font-medium text-slate-700">Push Notifications</p>
                                            <p className="text-xs text-slate-400">Receive alerts for High Urgency rescues</p>
                                        </div>
                                        <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center px-1 justify-end cursor-pointer transition-colors shadow-inner">
                                            <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium text-slate-700">Email Digest</p>
                                            <p className="text-xs text-slate-400">Weekly summary of your impact</p>
                                        </div>
                                        <div className="w-10 h-6 bg-slate-200 rounded-full flex items-center px-1 justify-start cursor-pointer transition-colors shadow-inner">
                                            <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <h4 className="font-semibold text-slate-800 mb-4">Logistics & Routing</h4>
                                    <div className="space-y-5">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <p className="font-medium text-sm text-slate-700">Max Alert Radius</p>
                                                <p className="text-sm font-bold text-emerald-600">15 km</p>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                                                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <p className="font-medium text-sm text-slate-700 mb-3">Vehicle Type</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                <button className="py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Bicycle</button>
                                                <button className="py-2.5 border-2 border-emerald-500 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-700 shadow-sm transition-colors">Car</button>
                                                <button className="py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Van</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* List Panel */}
                            {/* Hidden entirely on Map View on mobile, otherwise takes bottom 45% of screen on mobile Dashboard */}
                            <div className={`w-full sm:w-80 xl:w-96 shrink-0 flex-col border-t sm:border-t-0 sm:border-r border-slate-100 bg-white z-10 ${activeNav === "Map View" ? "hidden sm:flex" : "flex h-[45dvh] sm:h-auto"}`}>
                                {/* List Header */}
                                <div className="px-5 pt-5 pb-3 border-b border-slate-50 shrink-0 shadow-sm z-20">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-700">Active Rescues</span>
                                        <div className="flex items-center gap-1.5">
                                            {isConnected && rescues.length > 0 && (
                                                <span className="live-dot w-2 h-2 rounded-full bg-red-500 inline-block" />
                                            )}
                                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                                                {rescues.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Scrollable list */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 relative z-10 bg-slate-50/50">
                                    {isLoading ? (
                                        Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                                    ) : rescues.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100 shadow-sm">
                                                <Package size={28} className="text-emerald-400" />
                                            </div>
                                            <p className="text-slate-700 font-bold">All clear!</p>
                                            <p className="text-slate-400 text-xs mt-1">No active rescues right now.</p>
                                        </div>
                                    ) : (
                                        rescues.map((rescue) => {
                                            const borderMap: Record<string, string> = {
                                                HIGH: "border-l-red-500", MEDIUM: "border-l-amber-400", LOW: "border-l-emerald-500"
                                            };
                                            return (
                                                <div
                                                    key={rescue.id}
                                                    onClick={() => setSelectedRescue(rescue)}
                                                    className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-l-4 ${borderMap[rescue.urgency_level] ?? "border-l-slate-300"}`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-semibold text-slate-800 text-sm leading-tight">{rescue.business_name}</h3>
                                                        <span className="text-[11px] text-slate-400 whitespace-nowrap ml-2 font-medium">
                                                            {formatTime(rescue.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3">{rescue.extracted_food}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <UrgencyBadge level={rescue.urgency_level} />
                                                        <button
                                                            onClick={(e) => handleAcceptMission(e, rescue)}
                                                            disabled={acceptingId === rescue.id}
                                                            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm ${acceptingId === rescue.id
                                                                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                                                                : "text-white bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200/50"
                                                                }`}
                                                        >
                                                            {acceptingId === rescue.id ? "Accepted!" : "Accept Mission"}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Map Panel */}
                            {/* Always visible on Dashboard as flex-1 (top half on mobile). Full screen on Map View on mobile. */}
                            <div className="flex-1 relative overflow-hidden bg-slate-100 min-w-0 z-0">
                                {activeNav === "Map View" && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 pointer-events-none flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                                        <span className="text-xs font-bold text-slate-700">Displaying 15km Radius</span>
                                    </div>
                                )}
                                <RescueMap rescues={rescues} onRescueClick={setSelectedRescue} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Mobile Bottom Navigation ─────────────────────────────────────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex items-center justify-around px-2 pb-safe z-40 h-[60px]">
                {navLinks.map(({ icon: Icon, label }) => {
                    const isActive = activeNav === label;
                    return (
                        <button
                            key={label}
                            onClick={() => setActiveNav(label)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            <Icon size={20} className={isActive ? "stroke-[2.5px]" : ""} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* ── Rescue Detail Drawer ─────────────────────────────────────────── */}
            {selectedRescue && (
                <RescueDrawer
                    rescue={selectedRescue}
                    onClose={() => setSelectedRescue(null)}
                    onAccept={(r) => handleAcceptMission({ stopPropagation: () => { } } as React.MouseEvent, r)}
                />
            )}
        </div>
    );
}
