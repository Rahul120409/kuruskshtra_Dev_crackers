"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Store,
  Users,
  Scissors,
  Sparkles,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  Plus,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Flame,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Edit,
  Trash2,
  XCircle,
  Eye,
  LogOut,
  LogIn,
  UserCheck,
  Coffee,
  CircleDot,
  ArrowRight,
  Zap,
  Sun,
  Moon,
  Star,
  MessageSquareHeart,
} from "lucide-react";

import {
  QueueTokenData,
  AppointmentData,
  StylistData,
  getLiveQueue,
  callQueueTokenApi,
  startQueueServiceApi,
  completeQueueServiceApi,
  joinQueueApi,
  getSalonAppointments,
  updateAppointmentStatusApi,
  createAppointmentApi,
  getAllStylistsApi,
  updateStylistStatusApi,
  markTokenLateApi,
  lateCheckInTokenApi,
  markAppointmentLateApi,
} from "../services/salonOperations";
import { queueWebSocket } from "../../services/websocketService";

import { getAllSalons, updateSalonApi, SalonData } from "../services/salon";
import {
  StyleTypeData,
  SpecificStyleData,
  getAllStyleTypesApi,
  createStyleTypeApi,
  getAllSpecificStylesApi,
  createSpecificStyleApi,
  updateSpecificStyleApi,
  deleteSpecificStyleApi,
} from "../services/styleService";
import {
  SalonStaffData,
  getAllSalonStaffApi,
  createSalonStaffApi,
  updateSalonStaffApi,
  updateSalonStaffStatusApi,
  deleteSalonStaffApi,
} from "../services/salonStaffService";

function getInitials(name: string): string {
  if (!name) return "CL";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function SalonPortal() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "appointments" | "queue" | "salon_details" | "stylists" | "salon_staff"
  >("dashboard");

  // Theme State: Dark / Light Mode
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("salonflow_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("salonflow_theme", next);
  };

  // Global State
  const [currentUser, setCurrentUser] = useState<{ id?: string; name?: string; email?: string; role?: string } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [selectedSalonId, setSelectedSalonId] = useState<string>("sl-baner-01");
  const [salonsList, setSalonsList] = useState<SalonData[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Load authenticated staff user from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("salonflow_user") || localStorage.getItem("salonflow_auth_user");
      if (raw) {
        setCurrentUser(JSON.parse(raw));
      }
    } catch (e) {
      console.warn("Could not load user in salon portal:", e);
    }
  }, []);

  // Active Salon Details State
  const [activeSalon, setActiveSalon] = useState<SalonData>({
    id: "sl-baner-01",
    salonName: "Style Studio & Spa — Baner Flagship",
    ownerName: "Rahul Sharma",
    phoneNumber: "+91 98765 43210",
    email: "stylestudio.baner@gmail.com",
    salonAddress: "High Street, Baner, Pune",
    city: "Pune",
    pincode: "411045",
    salonLogo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500",
    salonDescription: "Premium unisex salon offering bespoke haircuts, beard styling, balayage, and AI hairstyle consultations.",
    locationLink: "https://maps.google.com/?q=Baner+Pune+Style+Studio",
    openingTime: "09:00",
    closingTime: "21:00",
    status: "ACTIVE",
    type: "UNISEX",
    activeStylists: 4,
    todayRevenue: 48500,
  });

  // Edit Salon Details Form State
  const [editSalonForm, setEditSalonForm] = useState<Partial<SalonData>>({});
  const [isSavingSalon, setIsSavingSalon] = useState(false);

  // Live Queue State (Dynamic from Backend API)
  const [queueTokens, setQueueTokens] = useState<QueueTokenData[]>([]);

  // Appointments State (Dynamic from Backend API)
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);

  // Stylists State
  const [stylists, setStylists] = useState<StylistData[]>([
    {
      id: "sty-01",
      name: "Pooja Varma",
      phone: "+91 98231 11223",
      email: "pooja.v@stylestudio.in",
      specialization: "Master Hair Colorist & Balayage",
      status: "BUSY",
      experienceYears: 7,
      rating: 4.9,
      completedToday: 5,
      currentClient: "Aarav Sharma (Token #101)",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      shiftHours: "09:00 AM - 06:00 PM",
    },
    {
      id: "sty-02",
      name: "Sameer Joshi",
      phone: "+91 97664 22334",
      email: "sameer.j@stylestudio.in",
      specialization: "Beard Sculptor & Precision Low-Fade",
      status: "BUSY",
      experienceYears: 5,
      rating: 4.8,
      completedToday: 7,
      currentClient: "Vikram Malhotra (Token #102)",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      shiftHours: "10:00 AM - 07:00 PM",
    },
    {
      id: "sty-03",
      name: "Kavita Nair",
      phone: "+91 99220 33445",
      email: "kavita.n@stylestudio.in",
      specialization: "Dermatology & Radiance Skincare",
      status: "AVAILABLE",
      experienceYears: 6,
      rating: 4.95,
      completedToday: 4,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
      shiftHours: "09:00 AM - 06:00 PM",
    },
    {
      id: "sty-04",
      name: "Arjun Rao",
      phone: "+91 98112 99887",
      email: "arjun.r@stylestudio.in",
      specialization: "Classic Texture Styling & Head Massages",
      status: "BREAK",
      experienceYears: 4,
      rating: 4.75,
      completedToday: 6,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
      shiftHours: "12:00 PM - 09:00 PM",
    },
  ]);

  // Modals
  const [showAddWalkinModal, setShowAddWalkinModal] = useState(false);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showAddStylistModal, setShowAddStylistModal] = useState(false);
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
  const [showEditStylistModal, setShowEditStylistModal] = useState(false);
  const [selectedTokenForAi, setSelectedTokenForAi] = useState<QueueTokenData | null>(null);

  // Walk-in Form State
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinService, setWalkinService] = useState("Signature AI Haircut & Styling");
  const [walkinStylist, setWalkinStylist] = useState("");
  const [walkinStyle, setWalkinStyle] = useState("Textured Crop");

  // New Appointment Form State
  const [newAptName, setNewAptName] = useState("");
  const [newAptPhone, setNewAptPhone] = useState("");
  const [newAptEmail, setNewAptEmail] = useState("");
  const [newAptService, setNewAptService] = useState("Signature AI Haircut & Styling");
  const [newAptStylist, setNewAptStylist] = useState("Pooja Varma");
  const [newAptDate, setNewAptDate] = useState("Today");
  const [newAptTime, setNewAptTime] = useState("17:00");
  const [newAptNotes, setNewAptNotes] = useState("");

  // Edit Appointment Form State
  const [editingApt, setEditingApt] = useState<AppointmentData | null>(null);
  const [editAptStatus, setEditAptStatus] = useState<AppointmentData["status"]>("CONFIRMED");
  const [editAptStylist, setEditAptStylist] = useState("");
  const [editAptTime, setEditAptTime] = useState("");

  // New Stylist Form State
  const [newStylistName, setNewStylistName] = useState("");
  const [newStylistPhone, setNewStylistPhone] = useState("");
  const [newStylistEmail, setNewStylistEmail] = useState("");
  const [newStylistSpecialization, setNewStylistSpecialization] = useState("Senior Hair Stylist");
  const [newStylistExp, setNewStylistExp] = useState("4");
  const [newStylistShift, setNewStylistShift] = useState("09:00 AM - 06:00 PM");

  // Edit Stylist Form State
  const [editingStylist, setEditingStylist] = useState<StylistData | null>(null);
  const [editStylistName, setEditStylistName] = useState("");
  const [editStylistPhone, setEditStylistPhone] = useState("");
  const [editStylistSpecialization, setEditStylistSpecialization] = useState("");
  const [editStylistStatus, setEditStylistStatus] = useState<StylistData["status"]>("AVAILABLE");
  const [editStylistShift, setEditStylistShift] = useState("");

  // Search and Filters
  const [queueSearch, setQueueSearch] = useState("");
  const [aptSearch, setAptSearch] = useState("");
  const [aptStatusFilter, setAptStatusFilter] = useState("ALL");

  // Sub-tabs in Hairstylists Details Tab: "roster" | "types" | "specific"
  const [stylistSubTab, setStylistSubTab] = useState<"roster" | "types" | "specific">("roster");

  // Hairstyle State & Catalog
  const [styleTypes, setStyleTypes] = useState<StyleTypeData[]>([
    {
      id: "st-1",
      name: "Haircut & Styling",
      code: "HAIRCUT",
      description: "Classic, fade, textured, layers, and modern precision haircuts for all face shapes.",
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500",
      specificStyleCount: 3,
    },
    {
      id: "st-2",
      name: "Beard & Grooming",
      code: "BEARD",
      description: "Beard sculpting, hot towel shave, sharp line detailing, and beard care therapies.",
      imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500",
      specificStyleCount: 1,
    },
    {
      id: "st-3",
      name: "Hair Coloring & Highlights",
      code: "COLOR",
      description: "Global fashion color, balayage, ombre, sun-kissed highlights, and root touch-ups.",
      imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500",
      specificStyleCount: 1,
    },
    {
      id: "st-4",
      name: "Facial & Skin Care",
      code: "FACIAL",
      description: "Deep cleanse, hydra-glow, charcoal de-tan, and anti-aging dermatology treatments.",
      imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500",
      specificStyleCount: 0,
    },
    {
      id: "st-5",
      name: "Hair Spa & Therapy",
      code: "THERAPY",
      description: "Keratin smooth gloss, botox hair therapy, organic scalp detox, and moisture lock.",
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500",
      specificStyleCount: 1,
    },
  ]);

  const [specificStyles, setSpecificStyles] = useState<SpecificStyleData[]>([
    {
      id: "sp-1",
      styleTypeId: "st-1",
      styleTypeName: "Haircut & Styling",
      styleTypeCode: "HAIRCUT",
      name: "Textured Crop Fade",
      code: "textured_crop_fade",
      price: 650,
      durationMinutes: 40,
      suitableFaceShapes: "Oval, Square, Round",
      suitableHairTypes: "Straight, Wavy, Thick",
      status: "ACTIVE",
      description: "Modern low skin fade with textured top fringe, styled with matte clay.",
      imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500",
    },
    {
      id: "sp-2",
      styleTypeId: "st-1",
      styleTypeName: "Haircut & Styling",
      styleTypeCode: "HAIRCUT",
      name: "French Crop with High Taper",
      code: "french_crop",
      price: 550,
      durationMinutes: 35,
      suitableFaceShapes: "Oval, Oblong, Diamond",
      suitableHairTypes: "Wavy, Straight",
      status: "ACTIVE",
      description: "Neat blunt fringe with clean tapered sides and natural finish.",
      imageUrl: "https://images.unsplash.com/photo-1517832606589-7629c33971a6?w=500",
    },
    {
      id: "sp-3",
      styleTypeId: "st-1",
      styleTypeName: "Haircut & Styling",
      styleTypeCode: "HAIRCUT",
      name: "Curtain Bangs Layered Cut",
      code: "curtain_bangs",
      price: 850,
      durationMinutes: 50,
      suitableFaceShapes: "Heart, Oval, Round",
      suitableHairTypes: "Fine, Medium, Wavy",
      status: "ACTIVE",
      description: "Face-framing soft layers with 70s inspired curtain fringe styling.",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
    },
    {
      id: "sp-4",
      styleTypeId: "st-2",
      styleTypeName: "Beard & Grooming",
      styleTypeCode: "BEARD",
      name: "Royal Beard Sculpt & Fade",
      code: "royal_beard_sculpt",
      price: 450,
      durationMinutes: 30,
      suitableFaceShapes: "Round, Oval, Square",
      suitableHairTypes: "Coarse, Thick",
      status: "ACTIVE",
      description: "Cheek line razor edging, jawline tapering, hot towel infused with organic beard oil.",
      imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500",
    },
    {
      id: "sp-5",
      styleTypeId: "st-3",
      styleTypeName: "Hair Coloring & Highlights",
      styleTypeCode: "COLOR",
      name: "Sun-Kissed Caramel Balayage",
      code: "caramel_balayage",
      price: 3200,
      durationMinutes: 120,
      suitableFaceShapes: "All Face Shapes",
      suitableHairTypes: "Straight, Wavy, Curly",
      status: "ACTIVE",
      description: "Hand-painted natural graduation of warm caramel tones with gloss shine.",
      imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500",
    },
    {
      id: "sp-6",
      styleTypeId: "st-5",
      styleTypeName: "Hair Spa & Therapy",
      styleTypeCode: "THERAPY",
      name: "Keratin Smooth Gloss Therapy",
      code: "keratin_smooth",
      price: 3500,
      durationMinutes: 90,
      suitableFaceShapes: "All Shapes",
      suitableHairTypes: "Frizzy, Damaged, Curly",
      status: "ACTIVE",
      description: "Formaldehyde-free smoothing treatment providing 3 months of frizz-free shine.",
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500",
    },
  ]);

  // Hairstyle filters & search
  const [styleTypeSearch, setStyleTypeSearch] = useState("");
  const [specificStyleSearch, setSpecificStyleSearch] = useState("");
  const [specificStyleFilterType, setSpecificStyleFilterType] = useState("ALL");

  // Hairstyle Modals
  const [showAddStyleTypeModal, setShowAddStyleTypeModal] = useState(false);
  const [newStyleTypeName, setNewStyleTypeName] = useState("");
  const [newStyleTypeCode, setNewStyleTypeCode] = useState("");
  const [newStyleTypeDesc, setNewStyleTypeDesc] = useState("");
  const [newStyleTypeImage, setNewStyleTypeImage] = useState("");

  const [showAddSpecificStyleModal, setShowAddSpecificStyleModal] = useState(false);
  const [newSpecificStyleTypeId, setNewSpecificStyleTypeId] = useState("");
  const [newSpecificStyleName, setNewSpecificStyleName] = useState("");
  const [newSpecificStyleCode, setNewSpecificStyleCode] = useState("");
  const [newSpecificStylePrice, setNewSpecificStylePrice] = useState<number>(650);
  const [newSpecificStyleDuration, setNewSpecificStyleDuration] = useState<number>(45);
  const [newSpecificStyleFaceShapes, setNewSpecificStyleFaceShapes] = useState("Oval, Square, Round");
  const [newSpecificStyleHairTypes, setNewSpecificStyleHairTypes] = useState("Straight, Wavy, Thick");
  const [newSpecificStyleDesc, setNewSpecificStyleDesc] = useState("");
  const [newSpecificStyleImage, setNewSpecificStyleImage] = useState("");

  const [showEditSpecificStyleModal, setShowEditSpecificStyleModal] = useState(false);
  const [editingSpecificStyle, setEditingSpecificStyle] = useState<SpecificStyleData | null>(null);
  const [editSpecificStyleName, setEditSpecificStyleName] = useState("");
  const [editSpecificStylePrice, setEditSpecificStylePrice] = useState<number>(650);
  const [editSpecificStyleDuration, setEditSpecificStyleDuration] = useState<number>(45);
  const [editSpecificStyleFaceShapes, setEditSpecificStyleFaceShapes] = useState("");
  const [editSpecificStyleHairTypes, setEditSpecificStyleHairTypes] = useState("");
  const [editSpecificStyleDesc, setEditSpecificStyleDesc] = useState("");
  const [editSpecificStyleImage, setEditSpecificStyleImage] = useState("");
  const [editSpecificStyleStatus, setEditSpecificStyleStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  // ========================= SALON STAFF STATE (salon_staff table) =========================
  const [salonStaffList, setSalonStaffList] = useState<SalonStaffData[]>([
    {
      id: "stf-01",
      salonId: "sl-baner-01",
      name: "Pooja Varma",
      email: "pooja.varma@stylestudio.in",
      phone: "+91 98231 11223",
      specialization: "Senior Hair Stylist & Balayage Specialist",
      status: "AVAILABLE",
      experienceYears: 4,
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    },
    {
      id: "stf-02",
      salonId: "sl-baner-01",
      name: "Sameer Joshi",
      email: "sameer.j@stylestudio.in",
      phone: "+91 97664 22334",
      specialization: "Master Barber & Beard Sculptor",
      status: "BUSY",
      experienceYears: 5,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
    },
    {
      id: "stf-03",
      salonId: "sl-baner-01",
      name: "Kavita Nair",
      email: "kavita.n@stylestudio.in",
      phone: "+91 99220 33445",
      specialization: "Dermatology & Radiance Skincare",
      status: "AVAILABLE",
      experienceYears: 6,
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300",
    },
    {
      id: "stf-04",
      salonId: "sl-baner-01",
      name: "Arjun Rao",
      email: "arjun.r@stylestudio.in",
      phone: "+91 98112 99887",
      specialization: "Classic Texture Styling & Head Massages",
      status: "BREAK",
      experienceYears: 4,
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
    },
  ]);
  const [isLoadingSalonStaff, setIsLoadingSalonStaff] = useState<boolean>(false);
  const [salonStaffSearch, setSalonStaffSearch] = useState<string>("");

  // Modals
  const [showAddSalonStaffModal, setShowAddSalonStaffModal] = useState<boolean>(false);
  const [showEditSalonStaffModal, setShowEditSalonStaffModal] = useState<boolean>(false);
  const [editingSalonStaff, setEditingSalonStaff] = useState<SalonStaffData | null>(null);

  // New Salon Staff Form State
  const [newSalonStaffName, setNewSalonStaffName] = useState<string>("");
  const [newSalonStaffEmail, setNewSalonStaffEmail] = useState<string>("");
  const [newSalonStaffPhone, setNewSalonStaffPhone] = useState<string>("");
  const [newSalonStaffSpecialization, setNewSalonStaffSpecialization] = useState<string>("Senior Hair Stylist");
  const [newSalonStaffStatus, setNewSalonStaffStatus] = useState<"AVAILABLE" | "BUSY" | "BREAK" | "OFFLINE">("AVAILABLE");
  const [newSalonStaffExp, setNewSalonStaffExp] = useState<number>(3);
  const [newSalonStaffImage, setNewSalonStaffImage] = useState<string>("");
  const [isCreatingSalonStaff, setIsCreatingSalonStaff] = useState<boolean>(false);

  // Edit Salon Staff Form State
  const [editSalonStaffName, setEditSalonStaffName] = useState<string>("");
  const [editSalonStaffEmail, setEditSalonStaffEmail] = useState<string>("");
  const [editSalonStaffPhone, setEditSalonStaffPhone] = useState<string>("");
  const [editSalonStaffSpecialization, setEditSalonStaffSpecialization] = useState<string>("");
  const [editSalonStaffStatus, setEditSalonStaffStatus] = useState<"AVAILABLE" | "BUSY" | "BREAK" | "OFFLINE">("AVAILABLE");
  const [editSalonStaffExp, setEditSalonStaffExp] = useState<number>(3);
  const [editSalonStaffImage, setEditSalonStaffImage] = useState<string>("");
  const [isUpdatingSalonStaff, setIsUpdatingSalonStaff] = useState<boolean>(false);

  // Fetch Style Types and Specific Styles from Backend
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const typesRes = await getAllStyleTypesApi();
        if (typesRes.data && typesRes.data.length > 0) {
          setStyleTypes(typesRes.data);
        }
      } catch (err) {
        console.warn("Could not load backend style types:", err);
      }

      try {
        const stylesRes = await getAllSpecificStylesApi();
        if (stylesRes.data && stylesRes.data.length > 0) {
          setSpecificStyles(stylesRes.data);
        }
      } catch (err) {
        console.warn("Could not load backend specific styles:", err);
      }
    };
    fetchStyles();
  }, []);

  // Fetch Salon Staff from Backend API: GET /api/salon-staff (salon_staff table)
  const loadSalonStaff = async () => {
    setIsLoadingSalonStaff(true);
    try {
      const res = await getAllSalonStaffApi(activeSalon.id);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSalonStaffList(res.data);
      }
    } catch (err) {
      console.warn("Could not load salon staff from backend API:", err);
    } finally {
      setIsLoadingSalonStaff(false);
    }
  };

  useEffect(() => {
    loadSalonStaff();
  }, [activeSalon.id]);

  // Toast Helper
  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync edit form on activeSalon load
  useEffect(() => {
    setEditSalonForm({
      salonName: activeSalon.salonName,
      ownerName: activeSalon.ownerName,
      phoneNumber: activeSalon.phoneNumber,
      email: activeSalon.email,
      salonAddress: activeSalon.salonAddress,
      city: activeSalon.city,
      pincode: activeSalon.pincode,
      openingTime: activeSalon.openingTime,
      closingTime: activeSalon.closingTime,
      salonDescription: activeSalon.salonDescription,
      locationLink: activeSalon.locationLink,
      type: activeSalon.type,
      salonLogo: activeSalon.salonLogo,
    });
  }, [activeSalon]);

  // Load backend live queue for the active salon
  const fetchLiveSalonQueue = async (targetSalonId?: string) => {
    const sId = targetSalonId || activeSalon.id || selectedSalonId;
    if (!sId || sId.startsWith("sl-")) return;
    try {
      const res = await getLiveQueue(sId);
      if (res.data && res.data.activeQueue) {
        setQueueTokens(res.data.activeQueue);
      }
    } catch (e) {
      console.warn("Could not refresh live queue in salon panel:", e);
    }
  };

  // Load backend appointments for the active salon
  const fetchSalonAppointments = async (targetSalonId?: string) => {
    const sId = targetSalonId || activeSalon.id || selectedSalonId;
    if (!sId || sId.startsWith("sl-")) return;
    try {
      const res = await getSalonAppointments(sId);
      if (res.data && Array.isArray(res.data)) {
        setAppointments(res.data);
      }
    } catch (e) {
      console.warn("Could not load salon appointments:", e);
    }
  };

  // Load backend data if available
  useEffect(() => {
    getAllSalons()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setSalonsList(res.data);
          const current = res.data.find((s) => s.id === selectedSalonId) || res.data[0];
          if (current) {
            setActiveSalon((prev) => ({ ...prev, ...current }));
            if (selectedSalonId !== current.id) {
              setSelectedSalonId(current.id);
            }
            fetchLiveSalonQueue(current.id);
            fetchSalonAppointments(current.id);
          }
        }
      })
      .catch(() => { });
  }, [selectedSalonId]);

  // Real-time WebSocket connection for live Queue & Appointments (No page refresh needed)
  useEffect(() => {
    const sId = activeSalon.id || selectedSalonId;
    if (!sId || sId.startsWith("sl-")) return;

    fetchLiveSalonQueue(sId);
    fetchSalonAppointments(sId);

    const unsubscribe = queueWebSocket.subscribeToSalon(sId, (data) => {
      if (data && Array.isArray(data.activeQueue)) {
        setQueueTokens(data.activeQueue);
      }
      setActiveSalon((prev) => ({
        ...prev,
        totalWaiting: typeof data.totalWaiting === "number" ? data.totalWaiting : prev.totalWaiting,
        currentServingTokenNumber: data.currentServingTokenNumber !== undefined ? data.currentServingTokenNumber : prev.currentServingTokenNumber,
      }));
      fetchSalonAppointments(sId);
    });

    return () => {
      unsubscribe();
    };
  }, [activeSalon.id, selectedSalonId]);

  // ========================= QUEUE ACTIONS =========================
  const handleCallNext = async (token: QueueTokenData) => {
    // When a higher token is called (e.g. #7), check if any earlier waiting tokens (e.g. #6) were not arrived
    const skippedTokens: QueueTokenData[] = [];
    setQueueTokens((prev) =>
      prev.map((t) => {
        if (t.id === token.id) {
          return { ...t, status: "CALLED", calledAt: "Just now" };
        }
        // If lower token number was still WAITING when higher token is called, mark as LATE / ON_HOLD
        if (t.tokenNumber < token.tokenNumber && t.status === "WAITING") {
          skippedTokens.push(t);
          return { ...t, status: "LATE" as const };
        }
        return t;
      })
    );

    if (skippedTokens.length > 0) {
      const nums = skippedTokens.map((s) => `#${s.tokenNumber}`).join(", ");
      showToast(`Token ${nums} skipped & marked LATE / ON HOLD (Client not in lobby).`, "info");
      for (const st of skippedTokens) {
        markTokenLateApi(st.id).catch(() => {});
      }
    }

    showToast(`Token #${token.tokenNumber} (${token.customerName}) has been CALLED to the station!`);
    await callQueueTokenApi(token.id);
    fetchLiveSalonQueue();
  };

  const handleMarkTokenLate = async (token: QueueTokenData) => {
    setQueueTokens((prev) =>
      prev.map((t) => (t.id === token.id ? { ...t, status: "LATE" as const } : t))
    );
    showToast(`Token #${token.tokenNumber} (${token.customerName}) marked as LATE / ON HOLD.`, "info");
    await markTokenLateApi(token.id);
    fetchLiveSalonQueue();
  };

  const handleLateCheckIn = async (token: QueueTokenData) => {
    setQueueTokens((prev) =>
      prev.map((t) => (t.id === token.id ? { ...t, status: "WAITING" as const, position: 1 } : t))
    );
    showToast(`Late Check-in complete for Token #${token.tokenNumber} (${token.customerName})! Placed as Priority Next.`, "success");
    await lateCheckInTokenApi(token.id);
    fetchLiveSalonQueue();
  };

  const handleStartService = async (token: QueueTokenData) => {
    setQueueTokens((prev) =>
      prev.map((t) => (t.id === token.id ? { ...t, status: "IN_SERVICE", startedAt: "Just now" } : t))
    );
    showToast(`Service started for Token #${token.tokenNumber}! Client in chair.`);
    await startQueueServiceApi(token.id);
    fetchLiveSalonQueue();
  };

  const handleCompleteService = async (token: QueueTokenData) => {
    setQueueTokens((prev) => prev.filter((t) => t.id !== token.id));
    setActiveSalon((prev) => ({
      ...prev,
      todayRevenue: (prev.todayRevenue || 0) + token.servicePrice,
    }));
    showToast(`Token #${token.tokenNumber} completed! Added ₹${token.servicePrice} to today's revenue.`);
    await completeQueueServiceApi(token.id);
    fetchLiveSalonQueue();
  };

  const handleCancelToken = (tokenId: string, tokenNum: number) => {
    if (!window.confirm(`Cancel Token #${tokenNum}?`)) return;
    setQueueTokens((prev) => prev.filter((t) => t.id !== tokenId));
    showToast(`Token #${tokenNum} cancelled.`, "info");
  };

  const handleAddWalkinToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) {
      showToast("Please enter customer name", "error");
      return;
    }

    const priceMap: Record<string, number> = {
      "Signature AI Haircut & Styling": 650,
      "Balayage Color & Hair Spa Treatment": 2200,
      "Royal Beard Sculpture & Detailing": 450,
      "Hydra Radiance Facial & De-tan": 1800,
      "Keratin Smooth Gloss Therapy": 3500,
    };

    const targetSalonId = activeSalon.id || selectedSalonId;
    setShowAddWalkinModal(false);
    showToast(`Issuing walk-in ticket for ${walkinName}...`, "info");

    const res = await joinQueueApi({
      salonId: targetSalonId,
      customerName: walkinName.trim(),
      customerPhone: walkinPhone.trim() || "9800000000",
      serviceName: walkinService,
      servicePrice: priceMap[walkinService] || 650,
      staffName: walkinStylist || "Next Available Stylist",
      source: "OFFLINE",
    });

    setWalkinName("");
    setWalkinPhone("");

    if (res.data && res.data.tokenNumber) {
      showToast(`Walk-in Token #${res.data.tokenNumber} issued successfully!`);
    } else {
      showToast(`Walk-in ticket added to queue.`);
    }

    fetchLiveSalonQueue();
  };

  // ========================= APPOINTMENT ACTIONS =========================
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAptName.trim() || !newAptPhone.trim()) {
      showToast("Please provide customer name and phone", "error");
      return;
    }

    const priceMap: Record<string, number> = {
      "Signature AI Haircut & Styling": 650,
      "Balayage Color & Hair Spa Treatment": 2200,
      "Royal Beard Sculpture & Detailing": 450,
      "Hydra Radiance Facial & De-tan": 1800,
      "Keratin Smooth Gloss Therapy": 3500,
    };

    const targetSalonId = activeSalon.id || selectedSalonId;
    const custName = newAptName.trim();
    setShowAddAppointmentModal(false);
    showToast(`Booking appointment for ${custName}...`, "info");

    await createAppointmentApi({
      salonId: targetSalonId,
      customerName: custName,
      customerPhone: newAptPhone.trim(),
      customerEmail: newAptEmail.trim() || undefined,
      serviceName: newAptService,
      servicePrice: priceMap[newAptService] || 650,
      stylistName: newAptStylist,
      appointmentDate: newAptDate,
      appointmentTime: newAptTime,
      source: "WALK_IN",
      notes: newAptNotes.trim() || undefined,
    });

    setNewAptName("");
    setNewAptPhone("");
    setNewAptEmail("");
    setNewAptNotes("");
    showToast(`Appointment booked successfully for ${custName}!`);
    fetchSalonAppointments();
  };

  const handleCheckInAppointment = async (apt: AppointmentData) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apt.id ? { ...a, status: "CHECKED_IN" } : a))
    );

    showToast(`Checking in ${apt.customerName}...`, "info");
    await updateAppointmentStatusApi(apt.id, "CHECKED_IN");

    const res = await joinQueueApi({
      salonId: activeSalon.id || selectedSalonId,
      customerName: apt.customerName,
      customerPhone: apt.customerPhone,
      serviceName: apt.serviceName,
      servicePrice: apt.servicePrice,
      staffName: apt.stylistName,
      source: "ONLINE",
    });

    if (res.data && res.data.tokenNumber) {
      showToast(`Checked in ${apt.customerName}! Issued Token #${res.data.tokenNumber} in Live Queue.`);
    } else {
      showToast(`Checked in ${apt.customerName} successfully!`);
    }

    fetchLiveSalonQueue();
    fetchSalonAppointments();
  };

  const handleMarkAppointmentLate = async (apt: AppointmentData) => {
    try {
      setAppointments((prev) =>
        prev.map((a) => (a.id === apt.id ? { ...a, status: "LATE" as any } : a))
      );
      showToast(`Marked ${apt.customerName} as Late arrival.`, "info");
      await markAppointmentLateApi(apt.id);
      fetchSalonAppointments();
    } catch (e) {
      console.warn("Could not mark appointment as late:", e);
    }
  };

  const handleOpenEditApt = (apt: AppointmentData) => {
    setEditingApt(apt);
    setEditAptStatus(apt.status);
    setEditAptStylist(apt.stylistName);
    setEditAptTime(apt.appointmentTime);
    setShowEditAppointmentModal(true);
  };

  const handleSaveEditApt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApt) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === editingApt.id
          ? {
              ...a,
              status: editAptStatus,
              stylistName: editAptStylist,
              appointmentTime: editAptTime,
            }
          : a
      )
    );

    setShowEditAppointmentModal(false);
    showToast(`Appointment status for ${editingApt.customerName} updated to ${editAptStatus}.`);
    await updateAppointmentStatusApi(editingApt.id, editAptStatus);
    fetchSalonAppointments();
  };

  const handleDeleteApt = (id: string) => {
    if (!window.confirm("Are you sure you want to remove this appointment?")) return;
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    showToast("Appointment removed.", "info");
  };

  // ========================= STYLIST ACTIONS =========================
  const handleAddStylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStylistName.trim()) {
      showToast("Please enter stylist name", "error");
      return;
    }

    const newSty: StylistData = {
      id: `sty-${Date.now()}`,
      name: newStylistName.trim(),
      phone: newStylistPhone.trim() || "+91 98000 11111",
      email: newStylistEmail.trim() || "stylist@stylestudio.in",
      specialization: newStylistSpecialization,
      status: "AVAILABLE",
      experienceYears: Number(newStylistExp) || 3,
      rating: 5.0,
      completedToday: 0,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
      shiftHours: newStylistShift,
    };

    setStylists((prev) => [...prev, newSty]);
    setShowAddStylistModal(false);
    setNewStylistName("");
    setNewStylistPhone("");
    setNewStylistEmail("");
    showToast(`Stylist ${newSty.name} added to the team!`);
  };

  const handleToggleStylistStatus = async (stylistId: string, currentStatus: StylistData["status"]) => {
    const nextStatusMap: Record<StylistData["status"], StylistData["status"]> = {
      AVAILABLE: "BUSY",
      BUSY: "BREAK",
      BREAK: "OFFLINE",
      OFFLINE: "AVAILABLE",
    };
    const nextStatus = nextStatusMap[currentStatus];

    setStylists((prev) =>
      prev.map((s) => (s.id === stylistId ? { ...s, status: nextStatus } : s))
    );
    showToast(`Stylist status updated to ${nextStatus}`);
    await updateStylistStatusApi(stylistId, nextStatus);
  };

  const handleOpenEditStylist = (sty: StylistData) => {
    setEditingStylist(sty);
    setEditStylistName(sty.name);
    setEditStylistPhone(sty.phone);
    setEditStylistSpecialization(sty.specialization);
    setEditStylistStatus(sty.status);
    setEditStylistShift(sty.shiftHours);
    setShowEditStylistModal(true);
  };

  const handleSaveEditStylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStylist) return;

    setStylists((prev) =>
      prev.map((s) =>
        s.id === editingStylist.id
          ? {
            ...s,
            name: editStylistName,
            phone: editStylistPhone,
            specialization: editStylistSpecialization,
            status: editStylistStatus,
            shiftHours: editStylistShift,
          }
          : s
      )
    );
    setShowEditStylistModal(false);
    showToast(`Stylist details updated for ${editStylistName}!`);
  };

  const handleDeleteStylist = (id: string, name: string) => {
    if (!window.confirm(`Remove stylist ${name} from roster?`)) return;
    setStylists((prev) => prev.filter((s) => s.id !== id));
    showToast(`Stylist ${name} removed from roster.`, "info");
  };

  // ========================= SALON DETAILS ACTIONS =========================
  const handleSaveSalonDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSalon(true);

    const updated: SalonData = {
      ...activeSalon,
      ...editSalonForm,
      salonName: editSalonForm.salonName || activeSalon.salonName,
      ownerName: editSalonForm.ownerName || activeSalon.ownerName,
      phoneNumber: editSalonForm.phoneNumber || activeSalon.phoneNumber,
      email: editSalonForm.email || activeSalon.email,
      salonAddress: editSalonForm.salonAddress || activeSalon.salonAddress,
      city: editSalonForm.city || activeSalon.city,
      pincode: editSalonForm.pincode || activeSalon.pincode,
      openingTime: editSalonForm.openingTime || activeSalon.openingTime,
      closingTime: editSalonForm.closingTime || activeSalon.closingTime,
      salonDescription: editSalonForm.salonDescription || activeSalon.salonDescription,
      locationLink: editSalonForm.locationLink || activeSalon.locationLink,
    };

    setActiveSalon(updated);
    setIsSavingSalon(false);
    showToast("Salon profile and operational details updated successfully!");

    try {
      await updateSalonApi(activeSalon.id, {
        salonName: updated.salonName,
        ownerName: updated.ownerName,
        phoneNumber: updated.phoneNumber,
        email: updated.email,
        salonAddress: updated.salonAddress,
        city: updated.city,
        pincode: updated.pincode,
        openingTime: updated.openingTime,
        closingTime: updated.closingTime,
        salonDescription: updated.salonDescription || "",
        locationLink: updated.locationLink || "",
      });
    } catch {
      // Handled locally
    }
  };

  // Computed KPIs
  const inServiceTokens = queueTokens.filter((t) => t.status === "IN_SERVICE");
  const waitingTokens = queueTokens.filter((t) => t.status === "WAITING" || t.status === "CALLED");
  const availableStylists = stylists.filter((s) => s.status === "AVAILABLE").length;
  const busyStylists = stylists.filter((s) => s.status === "BUSY").length;
  const totalCompletedAppointments = appointments.filter((a) => a.status === "COMPLETED").length;
  const totalUpcomingAppointments = appointments.filter((a) => a.status === "CONFIRMED" || a.status === "CHECKED_IN").length;

  // LLD Wait Time Formula: sum expected durations ÷ available staff
  const avgWaitTime = availableStylists > 0
    ? Math.round((waitingTokens.length * 20) / Math.max(availableStylists + busyStylists, 1))
    : waitingTokens.length * 20;

  // ========================= HAIRSTYLE ACTIONS =========================
  const handleCreateStyleType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStyleTypeName.trim() || !newStyleTypeCode.trim()) {
      showToast("Please provide Style Type Name and Code", "error");
      return;
    }

    const newType: StyleTypeData = {
      id: `st-${Date.now()}`,
      name: newStyleTypeName.trim(),
      code: newStyleTypeCode.trim().toUpperCase(),
      description: newStyleTypeDesc.trim() || "Bespoke professional styling services.",
      imageUrl: newStyleTypeImage.trim() || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500",
      specificStyleCount: 0,
    };

    setStyleTypes((prev) => [...prev, newType]);
    setShowAddStyleTypeModal(false);
    setNewStyleTypeName("");
    setNewStyleTypeCode("");
    setNewStyleTypeDesc("");
    setNewStyleTypeImage("");
    showToast(`Style Type "${newType.name}" added successfully!`);

    try {
      await createStyleTypeApi({
        name: newType.name,
        code: newType.code,
        description: newType.description,
        imageUrl: newType.imageUrl,
      });
    } catch (err) {
      console.warn("API error creating style type:", err);
    }
  };

  const handleCreateSpecificStyle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecificStyleName.trim() || !newSpecificStyleTypeId) {
      showToast("Please enter style name and select a Style Type", "error");
      return;
    }

    const matchedType = styleTypes.find((t) => t.id === newSpecificStyleTypeId);
    const newStyle: SpecificStyleData = {
      id: `sp-${Date.now()}`,
      styleTypeId: newSpecificStyleTypeId,
      styleTypeName: matchedType?.name || "Styling",
      styleTypeCode: matchedType?.code || "STYLE",
      name: newSpecificStyleName.trim(),
      code: newSpecificStyleCode.trim() || newSpecificStyleName.toLowerCase().replace(/\s+/g, "_"),
      price: Number(newSpecificStylePrice) || 650,
      durationMinutes: Number(newSpecificStyleDuration) || 45,
      suitableFaceShapes: newSpecificStyleFaceShapes.trim() || "Oval, Square, Round",
      suitableHairTypes: newSpecificStyleHairTypes.trim() || "Straight, Wavy, Thick",
      description: newSpecificStyleDesc.trim() || "Precision customized salon cut and styling.",
      imageUrl: newSpecificStyleImage.trim() || matchedType?.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500",
      status: "ACTIVE",
    };

    setSpecificStyles((prev) => [newStyle, ...prev]);
    setShowAddSpecificStyleModal(false);
    setNewSpecificStyleName("");
    setNewSpecificStyleCode("");
    setNewSpecificStylePrice(650);
    setNewSpecificStyleDuration(45);
    setNewSpecificStyleFaceShapes("Oval, Square, Round");
    setNewSpecificStyleHairTypes("Straight, Wavy, Thick");
    setNewSpecificStyleDesc("");
    setNewSpecificStyleImage("");
    showToast(`Specific Style "${newStyle.name}" added to catalog!`);

    try {
      await createSpecificStyleApi({
        styleTypeId: newStyle.styleTypeId,
        name: newStyle.name,
        code: newStyle.code,
        price: newStyle.price,
        durationMinutes: newStyle.durationMinutes,
        suitableFaceShapes: newStyle.suitableFaceShapes,
        suitableHairTypes: newStyle.suitableHairTypes,
        description: newStyle.description,
        imageUrl: newStyle.imageUrl,
      });
    } catch (err) {
      console.warn("API error creating specific style:", err);
    }
  };

  const handleToggleSpecificStyleStatus = async (style: SpecificStyleData) => {
    const nextStatus: "ACTIVE" | "INACTIVE" = style.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setSpecificStyles((prev) =>
      prev.map((s) => (s.id === style.id ? { ...s, status: nextStatus } : s))
    );
    showToast(`Style "${style.name}" set to ${nextStatus}!`);
    try {
      await updateSpecificStyleApi(style.id, { status: nextStatus });
    } catch (err) {
      console.warn("API error updating style status:", err);
    }
  };

  const handleOpenEditSpecificStyle = (style: SpecificStyleData) => {
    setEditingSpecificStyle(style);
    setEditSpecificStyleName(style.name);
    setEditSpecificStylePrice(style.price);
    setEditSpecificStyleDuration(style.durationMinutes);
    setEditSpecificStyleFaceShapes(style.suitableFaceShapes || "Oval, Round");
    setEditSpecificStyleHairTypes(style.suitableHairTypes || "Straight, Wavy");
    setEditSpecificStyleDesc(style.description || "");
    setEditSpecificStyleImage(style.imageUrl || "");
    setEditSpecificStyleStatus(style.status || "ACTIVE");
    setShowEditSpecificStyleModal(true);
  };

  const handleSaveEditSpecificStyle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpecificStyle) return;

    setSpecificStyles((prev) =>
      prev.map((s) =>
        s.id === editingSpecificStyle.id
          ? {
            ...s,
            name: editSpecificStyleName,
            price: Number(editSpecificStylePrice),
            durationMinutes: Number(editSpecificStyleDuration),
            suitableFaceShapes: editSpecificStyleFaceShapes,
            suitableHairTypes: editSpecificStyleHairTypes,
            description: editSpecificStyleDesc,
            imageUrl: editSpecificStyleImage,
            status: editSpecificStyleStatus,
          }
          : s
      )
    );
    setShowEditSpecificStyleModal(false);
    showToast(`Style "${editSpecificStyleName}" updated successfully!`);

    try {
      await updateSpecificStyleApi(editingSpecificStyle.id, {
        name: editSpecificStyleName,
        price: Number(editSpecificStylePrice),
        durationMinutes: Number(editSpecificStyleDuration),
        suitableFaceShapes: editSpecificStyleFaceShapes,
        suitableHairTypes: editSpecificStyleHairTypes,
        description: editSpecificStyleDesc,
        imageUrl: editSpecificStyleImage,
        status: editSpecificStyleStatus,
      });
    } catch (err) {
      console.warn("API error updating specific style:", err);
    }
  };

  const handleDeleteSpecificStyle = async (id: string, name: string) => {
    if (!window.confirm(`Delete style "${name}" from catalog?`)) return;
    setSpecificStyles((prev) => prev.filter((s) => s.id !== id));
    showToast(`Style "${name}" removed from catalog.`, "info");
    try {
      await deleteSpecificStyleApi(id);
    } catch (err) {
      console.warn("API error deleting specific style:", err);
    }
  };

  // ========================= SALON STAFF ACTIONS (salon_staff table) =========================
  const handleCreateSalonStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalonStaffName.trim() || !newSalonStaffSpecialization.trim()) {
      showToast("Please provide staff name and specialization", "error");
      return;
    }
    setIsCreatingSalonStaff(true);
    try {
      const res = await createSalonStaffApi({
        salonId: activeSalon.id,
        name: newSalonStaffName.trim(),
        email: newSalonStaffEmail.trim() || undefined,
        phone: newSalonStaffPhone.trim() || "+91 98000 00000",
        specialization: newSalonStaffSpecialization.trim(),
        status: newSalonStaffStatus,
        experienceYears: Number(newSalonStaffExp) || 3,
        profileImage: newSalonStaffImage.trim() || undefined,
      });

      const staffName = newSalonStaffName.trim();
      if (res.data && res.data.id) {
        setSalonStaffList((prev) => [res.data, ...prev.filter((s) => s.id !== res.data.id)]);
      }
      setShowAddSalonStaffModal(false);
      setNewSalonStaffName("");
      setNewSalonStaffEmail("");
      setNewSalonStaffPhone("");
      setNewSalonStaffSpecialization("Senior Hair Stylist");
      setNewSalonStaffStatus("AVAILABLE");
      setNewSalonStaffExp(3);
      setNewSalonStaffImage("");
      showToast(`Salon staff "${staffName}" saved to database successfully!`);
      await loadSalonStaff();
    } catch (err: any) {
      console.error("Failed to save salon staff in database:", err);
      showToast(err.message || "Failed to create salon staff", "error");
    } finally {
      setIsCreatingSalonStaff(false);
    }
  };

  const handleOpenEditSalonStaff = (staff: SalonStaffData) => {
    setEditingSalonStaff(staff);
    setEditSalonStaffName(staff.name || "");
    setEditSalonStaffEmail(staff.email || "");
    setEditSalonStaffPhone(staff.phone || "");
    setEditSalonStaffSpecialization(staff.specialization || "Hair Stylist");
    setEditSalonStaffStatus(staff.status || "AVAILABLE");
    setEditSalonStaffExp(staff.experienceYears || 3);
    setEditSalonStaffImage(staff.profileImage || "");
    setShowEditSalonStaffModal(true);
  };

  const handleSaveEditSalonStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSalonStaff) return;
    setIsUpdatingSalonStaff(true);
    try {
      await updateSalonStaffApi(editingSalonStaff.id, {
        name: editSalonStaffName.trim(),
        email: editSalonStaffEmail.trim(),
        phone: editSalonStaffPhone.trim(),
        specialization: editSalonStaffSpecialization.trim(),
        status: editSalonStaffStatus,
        experienceYears: Number(editSalonStaffExp) || 3,
        profileImage: editSalonStaffImage.trim() || undefined,
      });

      setSalonStaffList((prev) =>
        prev.map((s) =>
          s.id === editingSalonStaff.id
            ? {
                ...s,
                name: editSalonStaffName.trim(),
                email: editSalonStaffEmail.trim(),
                phone: editSalonStaffPhone.trim(),
                specialization: editSalonStaffSpecialization.trim(),
                status: editSalonStaffStatus,
                experienceYears: Number(editSalonStaffExp) || 3,
                profileImage: editSalonStaffImage.trim() || undefined,
              }
            : s
        )
      );
      setShowEditSalonStaffModal(false);
      showToast(`Salon staff "${editSalonStaffName}" updated successfully!`);
    } catch (err: any) {
      setSalonStaffList((prev) =>
        prev.map((s) =>
          s.id === editingSalonStaff.id
            ? {
                ...s,
                name: editSalonStaffName.trim(),
                email: editSalonStaffEmail.trim(),
                phone: editSalonStaffPhone.trim(),
                specialization: editSalonStaffSpecialization.trim(),
                status: editSalonStaffStatus,
                experienceYears: Number(editSalonStaffExp) || 3,
                profileImage: editSalonStaffImage.trim() || undefined,
              }
            : s
        )
      );
      setShowEditSalonStaffModal(false);
      showToast(`Salon staff updated`);
    } finally {
      setIsUpdatingSalonStaff(false);
    }
  };

  const handleUpdateSalonStaffStatus = async (staff: SalonStaffData, newStatus: "AVAILABLE" | "BUSY" | "BREAK" | "OFFLINE") => {
    setSalonStaffList((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, status: newStatus } : s))
    );
    showToast(`${staff.name} status set to ${newStatus}`);
    try {
      await updateSalonStaffStatusApi(staff.id, newStatus);
    } catch (err) {
      console.warn("Update status error:", err);
    }
  };

  const handleDeleteSalonStaff = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove salon staff member "${name}"?`)) return;
    setSalonStaffList((prev) => prev.filter((s) => s.id !== id));
    showToast(`Salon staff "${name}" removed.`, "info");
    try {
      await deleteSalonStaffApi(id);
    } catch (err) {
      console.warn("Delete salon staff API error:", err);
    }
  };

  // Filtered lists
  const filteredQueue = queueTokens.filter(
    (t) =>
      t.customerName.toLowerCase().includes(queueSearch.toLowerCase()) ||
      t.tokenNumber.toString().includes(queueSearch) ||
      t.serviceName.toLowerCase().includes(queueSearch.toLowerCase())
  );

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.customerName.toLowerCase().includes(aptSearch.toLowerCase()) ||
      a.customerPhone.includes(aptSearch) ||
      a.serviceName.toLowerCase().includes(aptSearch.toLowerCase());
    const matchesStatus = aptStatusFilter === "ALL" || a.status === aptStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredStyleTypes = styleTypes.filter((t) =>
    t.name.toLowerCase().includes(styleTypeSearch.toLowerCase()) ||
    t.code.toLowerCase().includes(styleTypeSearch.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(styleTypeSearch.toLowerCase()))
  );

  const filteredSpecificStyles = specificStyles.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(specificStyleSearch.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(specificStyleSearch.toLowerCase())) ||
      (s.suitableFaceShapes && s.suitableFaceShapes.toLowerCase().includes(specificStyleSearch.toLowerCase())) ||
      (s.suitableHairTypes && s.suitableHairTypes.toLowerCase().includes(specificStyleSearch.toLowerCase()));
    const matchesType = specificStyleFilterType === "ALL" || s.styleTypeId === specificStyleFilterType;
    return matchesSearch && matchesType;
  });

  const filteredSalonStaff = salonStaffList.filter((st) => {
    const search = salonStaffSearch.toLowerCase();
    return (
      st.name.toLowerCase().includes(search) ||
      (st.email && st.email.toLowerCase().includes(search)) ||
      (st.phone && st.phone.toLowerCase().includes(search)) ||
      (st.specialization && st.specialization.toLowerCase().includes(search)) ||
      (st.status && st.status.toLowerCase().includes(search))
    );
  });

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${theme === "dark"
      ? "bg-[#090b10] text-zinc-100 selection:bg-amber-500/30 selection:text-amber-200"
      : "bg-slate-100 text-slate-900 selection:bg-amber-500/20 selection:text-amber-900"
      }`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 border ${toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : toastMessage.type === "error"
                ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
                : "bg-amber-950/90 border-amber-500/40 text-amber-200"
              }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : toastMessage.type === "error" ? (
              <XCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            )}
            <span className="text-sm font-medium tracking-wide">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Global Top Bar */}
      <header className={`h-14 px-4 flex items-center justify-between z-30 shrink-0 border-b transition-colors ${theme === "dark"
        ? "bg-[#0d1017] border-[#1f2533]"
        : "bg-white border-slate-200 shadow-sm"
        }`}>
        <div className="flex items-center gap-3 text-xs">
          <div className={`flex items-center gap-2 pr-3 border-r ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
            }`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-extrabold shadow-md shadow-amber-500/20">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <span className={`font-black tracking-tight text-sm ${theme === "dark" ? "text-white" : "text-slate-900"
                }`}>SalonFlow</span>
              <span className="text-[10px] uppercase font-bold text-amber-500 ml-1 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                Salon Panel
              </span>
            </div>
          </div>

          {/* Active Branch Selector Dropdown */}
          <div className="flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            {salonsList && salonsList.length > 1 ? (
              <select
                value={activeSalon.id}
                onChange={(e) => {
                  const targetId = e.target.value;
                  const selected = salonsList.find((s) => s.id === targetId);
                  if (selected) {
                    setActiveSalon(selected);
                    setSelectedSalonId(selected.id);
                    setAppointments([]);
                    setQueueTokens([]);
                    fetchLiveSalonQueue(selected.id);
                    fetchSalonAppointments(selected.id);
                    showToast(`Switched view to salon: ${selected.salonName}`);
                  }
                }}
                className={`text-xs font-bold rounded-lg px-2.5 py-1 border outline-none cursor-pointer ${
                  theme === "dark"
                    ? "bg-[#141926] border-[#2b364d] text-white focus:border-amber-400"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500"
                }`}
              >
                {salonsList.map((sl) => (
                  <option
                    key={sl.id}
                    value={sl.id}
                    className={theme === "dark" ? "bg-[#141926] text-white" : "bg-white text-slate-900"}
                  >
                    {sl.salonName} ({sl.city || "Pune"})
                  </option>
                ))}
              </select>
            ) : (
              <span className={`font-semibold text-xs ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                {activeSalon.salonName}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                const nextStatus = activeSalon.status === "ACTIVE" || activeSalon.status === "OPEN" ? "INACTIVE" : "ACTIVE";
                setActiveSalon((prev) => ({ ...prev, status: nextStatus }));
                showToast(`Salon status set to ${nextStatus}`, "success");
              }}
              className={`text-[10px] px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 font-mono font-bold cursor-pointer transition-all ${activeSalon.status === "ACTIVE" || activeSalon.status === "OPEN"
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25"
                }`}
              title="Click to toggle salon active / inactive status"
            >
              <span className={`w-2 h-2 rounded-full ${activeSalon.status === "ACTIVE" || activeSalon.status === "OPEN" ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`} />
              <span>{activeSalon.status === "ACTIVE" || activeSalon.status === "OPEN" ? "ACTIVE" : "INACTIVE"}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${theme === "dark"
              ? "bg-[#171d2b] hover:bg-[#20283b] border-[#2b364d] text-amber-300 hover:text-amber-200"
              : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-700 hover:text-amber-800 shadow-sm"
              }`}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-bold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline font-bold">Dark</span>
              </>
            )}
          </button>

          {/* Quick Issue Token */}
          <button
            onClick={() => setShowAddWalkinModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Token</span>
          </button>

          {/* Logged-In Staff Profile & Logout */}
          {currentUser ? (
            <div className={`flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl border ${theme === "dark" ? "bg-[#141926] border-amber-500/30 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
              }`}>
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold block">{currentUser.name}</span>
                <span className="text-[10px] text-amber-500 font-mono font-bold uppercase">{currentUser.role || "STAFF"}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="px-2 py-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Sign out of staff session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className={`w-64 border-r p-4 flex flex-col justify-between shrink-0 hidden md:flex transition-colors ${theme === "dark"
          ? "bg-[#0d1017] border-[#1f2533]"
          : "bg-white border-slate-200 shadow-sm"
          }`}>
          <div className="space-y-6">
            <div>
              <div className={`text-[11px] font-bold tracking-wider uppercase px-3 mb-2 ${theme === "dark" ? "text-zinc-500" : "text-slate-400"
                }`}>
                Salon Operations
              </div>
              <nav className="space-y-1">
                {[
                  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: `${queueTokens.length} Active` },
                  { id: "appointments", label: "Appointments", icon: Calendar, badge: `${appointments.length}` },
                  { id: "queue", label: "Live Queue Tab", icon: Layers, badge: `${waitingTokens.length} Wait` },
                  { id: "salon_details", label: "Salon Details", icon: Store },
                  { id: "stylists", label: "Hairstylists Details", icon: Users, badge: `${stylists.length}` },
                  { id: "salon_staff", label: "Salon Staff", icon: UserCheck, badge: `${salonStaffList.length}` },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isActive
                        ? theme === "dark"
                          ? "bg-amber-400/10 text-amber-300 border border-amber-400/30 shadow-sm shadow-amber-400/10"
                          : "bg-amber-50 text-amber-800 border border-amber-300 font-bold shadow-sm"
                        : theme === "dark"
                          ? "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-amber-500" : theme === "dark" ? "text-zinc-400" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive
                            ? theme === "dark"
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold"
                              : "bg-amber-100 text-amber-800 border border-amber-300 font-bold"
                            : theme === "dark"
                              ? "bg-white/5 text-zinc-400"
                              : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* AI Intelligence Live Insight Box */}
            <div className={`p-4 rounded-2xl space-y-2.5 transition-colors ${theme === "dark"
              ? "bg-gradient-to-br from-amber-500/10 via-[#131824] to-[#121622] border border-amber-500/30"
              : "bg-gradient-to-br from-amber-50 via-white to-amber-100/50 border border-amber-300 shadow-sm"
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Congestion Engine</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${theme === "dark" ? "bg-amber-400/20 text-amber-300" : "bg-amber-100 text-amber-800"
                  }`}>
                  {avgWaitTime}m Est.
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${theme === "dark" ? "text-zinc-300" : "text-slate-600"
                }`}>
                {waitingTokens.length > 2
                  ? `High walk-in congestion detected. Move 1 stylist from break to Haircut station to reduce wait.`
                  : `Queue running smoothly with ${availableStylists} available stylists. Optimal flow.`}
              </p>
              <div className={`pt-1 flex items-center justify-between text-[10px] font-mono ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                }`}>
                <span>Stylist Capacity:</span>
                <span className="text-emerald-500 font-bold">{Math.round((busyStylists / Math.max(stylists.length, 1)) * 100)}% Utilized</span>
              </div>
            </div>
          </div>

          {/* Branch Footer Info */}
          <div className={`p-3 rounded-xl border text-xs space-y-1 ${theme === "dark"
            ? "bg-[#121622] border-[#232a3b]"
            : "bg-slate-50 border-slate-200"
            }`}>
            <div className={`font-semibold truncate ${theme === "dark" ? "text-white" : "text-slate-800"
              }`}>{activeSalon.salonName}</div>
            <div className={`text-[11px] flex items-center gap-1 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
              }`}>
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{activeSalon.openingTime} - {activeSalon.closingTime}</span>
            </div>
          </div>
        </aside>

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Mobile Tab Selector */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-2 scrollbar-none">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "appointments", label: "Appointments", icon: Calendar },
              { id: "queue", label: "Live Queue", icon: Layers },
              { id: "salon_details", label: "Salon Details", icon: Store },
              { id: "stylists", label: "Hairstylists", icon: Users },
              { id: "salon_staff", label: "Salon Staff", icon: UserCheck },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${activeTab === t.id
                  ? "bg-amber-400 text-black font-bold shadow-sm"
                  : theme === "dark"
                    ? "bg-[#141926] text-zinc-300 border border-[#232a3b]"
                    : "bg-slate-100 text-slate-700 border border-slate-300"
                  }`}
              >
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* =========================================================================
              TAB 1: DASHBOARD
             ========================================================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>Salon Operations Overview</h1>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    Real-time queue monitoring, stylist utilization, and instant walk-in intake.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddWalkinModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Issue Walk-in Token</span>
                  </button>
                  <button
                    onClick={() => setShowAddAppointmentModal(true)}
                    className={`px-4 py-2 rounded-xl border font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors ${theme === "dark"
                      ? "bg-[#182030] hover:bg-[#222b3f] border-[#2e3a52] text-white"
                      : "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm"
                      }`}
                  >
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>New Booking</span>
                  </button>
                </div>
              </div>

              {/* Top Operational Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-2xl border relative overflow-hidden transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <div className={`flex items-center justify-between text-xs mb-2 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    <span className="font-semibold uppercase tracking-wider">In-Chair Clients</span>
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Scissors className="w-4 h-4" />
                    </span>
                  </div>
                  <div className={`text-3xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>{inServiceTokens.length}</div>
                  <div className={`text-xs font-semibold mt-2 flex items-center gap-1 ${theme === "dark" ? "text-emerald-400" : "text-emerald-700"
                    }`}>
                    <CircleDot className="w-3 h-3 animate-ping" />
                    <span>Active Services in progress</span>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <div className={`flex items-center justify-between text-xs mb-2 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    <span className="font-semibold uppercase tracking-wider">Waiting Queue</span>
                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>
                  <div className={`text-3xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>{waitingTokens.length}</div>
                  <div className={`text-xs font-semibold mt-2 flex items-center gap-1 ${theme === "dark" ? "text-amber-400" : "text-amber-700"
                    }`}>
                    <span>Est. Wait: ~{avgWaitTime} mins</span>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <div className={`flex items-center justify-between text-xs mb-2 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    <span className="font-semibold uppercase tracking-wider">Today's Revenue</span>
                    <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  </div>
                  <div className={`text-3xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                    ₹{activeSalon.todayRevenue?.toLocaleString() || "48,500"}
                  </div>
                  <div className={`text-xs font-semibold mt-2 flex items-center gap-1 ${theme === "dark" ? "text-purple-400" : "text-purple-700"
                    }`}>
                    <span>+18.4% vs last Thursday</span>
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <div className={`flex items-center justify-between text-xs mb-2 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    <span className="font-semibold uppercase tracking-wider">Stylist Roster</span>
                    <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <div className={`text-3xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                    {availableStylists} <span className={`text-base font-normal ${theme === "dark" ? "text-zinc-500" : "text-slate-400"}`}>/ {stylists.length} Free</span>
                  </div>
                  <div className={`text-xs font-semibold mt-2 flex items-center gap-1 ${theme === "dark" ? "text-blue-400" : "text-blue-700"
                    }`}>
                    <span>{busyStylists} Busy with clients</span>
                  </div>
                </div>
              </div>

              {/* Quick Walk-in Form + Live Stream Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Instant Walk-in Form Card */}
                <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${theme === "dark" ? "bg-[#121622] border-amber-500/30" : "bg-white border-amber-300 shadow-sm"
                  }`}>
                  <div className={`flex items-center gap-2 border-b pb-3 ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                    }`}>
                    <Zap className="w-5 h-5 text-amber-500" />
                    <div>
                      <h3 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                        }`}>Instant Walk-in Intake</h3>
                      <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                        }`}>Fast token generation for reception desk</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddWalkinToken} className="space-y-3.5 text-xs">
                    <div>
                      <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                        }`}>Customer Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Siddharth Verma"
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                          ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                          : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                          }`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                        }`}>Mobile Number (For SMS/Notify)</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={walkinPhone}
                        onChange={(e) => setWalkinPhone(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                          ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                          : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                          }`}
                      />
                    </div>

                    <div>
                      <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                        }`}>Service Selection *</label>
                      <select
                        value={walkinService}
                        onChange={(e) => setWalkinService(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-colors ${theme === "dark"
                          ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                          : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                          }`}
                      >
                        <option value="Signature AI Haircut & Styling">Signature AI Haircut &amp; Styling (₹650)</option>
                        <option value="Balayage Color & Hair Spa Treatment">Balayage Color &amp; Hair Spa (₹2200)</option>
                        <option value="Royal Beard Sculpture & Detailing">Royal Beard Sculpture (₹450)</option>
                        <option value="Hydra Radiance Facial & De-tan">Hydra Radiance Facial (₹1800)</option>
                        <option value="Keratin Smooth Gloss Therapy">Keratin Smooth Gloss (₹3500)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                        }`}>Preferred Stylist (Optional)</label>
                      <select
                        value={walkinStylist}
                        onChange={(e) => setWalkinStylist(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                          ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                          : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                          }`}
                      >
                        <option value="">Next Available Stylist</option>
                        {stylists.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} ({s.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer pt-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Issue Token &amp; Notify</span>
                    </button>
                  </form>
                </div>

                {/* Live In-Chair & Next In Line Board */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border space-y-4 transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                    }`}>
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-500" />
                      <h3 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                        }`}>Live Station Operations</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("queue")}
                      className="text-xs text-amber-600 hover:text-amber-500 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Full Queue Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {queueTokens.slice(0, 4).map((token) => (
                      <div
                        key={token.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${theme === "dark"
                          ? "bg-[#171d2a] border-[#263147]"
                          : "bg-slate-50/90 border-slate-200 shadow-sm"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center font-mono font-bold ${theme === "dark"
                            ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                            : "bg-amber-50 border-amber-300 text-amber-800"
                            }`}>
                            <span className={`text-[10px] ${theme === "dark" ? "text-zinc-400" : "text-amber-700/80"}`}>TOKEN</span>
                            <span className="text-base leading-none">#{token.tokenNumber}</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm ${theme === "dark" ? "text-white" : "text-slate-900"
                                }`}>{token.customerName}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${token.status === "IN_SERVICE"
                                  ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                                  : token.status === "CALLED"
                                    ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse"
                                    : "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                                  }`}
                              >
                                {token.status}
                              </span>
                            </div>
                            <div className={`text-xs mt-0.5 ${theme === "dark" ? "text-zinc-400" : "text-slate-600"
                              }`}>
                              {token.serviceName} • <span className={theme === "dark" ? "text-zinc-300 font-medium" : "text-slate-800 font-semibold"}>Stylist: {token.staffName}</span>
                            </div>
                            {token.aiRecommendation && (
                              <div className={`text-[11px] flex items-center gap-1 mt-1 font-medium ${theme === "dark" ? "text-amber-400/90" : "text-amber-800 font-semibold"
                                }`}>
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span>AI Style: {token.aiRecommendation.selectedHairstyle} ({token.aiRecommendation.matchScore}% Match)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Fast Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {token.status === "WAITING" && (
                            <button
                              onClick={() => handleCallNext(token)}
                              className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-700 dark:text-amber-300 border border-amber-400/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call Next</span>
                            </button>
                          )}
                          {token.status === "CALLED" && (
                            <button
                              onClick={() => handleStartService(token)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3" />
                              <span>Seat &amp; Start</span>
                            </button>
                          )}
                          {token.status === "IN_SERVICE" && (
                            <button
                              onClick={() => handleCompleteService(token)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-900/20 flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Complete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: APPOINTMENTS TAB
             ========================================================================= */}
          {activeTab === "appointments" && (
            <div className="max-w-[1520px] mx-auto space-y-8 animate-fadeIn">
              {/* HeaderSection */}
              <header className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        {activeSalon.salonName}
                      </span>
                      <span className="text-xs text-slate-400">• Branch-Specific Appointments</span>
                    </div>
                    <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                      {activeSalon.salonName} Appointments Book
                    </h1>
                    <p className={`text-sm sm:text-base font-normal tracking-wide mt-0.5 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                      Independent appointment roster and slot check-ins for {activeSalon.salonName} only.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddAppointmentModal(true)}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Appointment</span>
                  </button>
                </div>
              </header>

              {/* ControlsToolbar */}
              <section className={`mb-8 p-3 sm:p-4 rounded-2xl border transition-colors ${theme === "dark"
                ? "bg-[#0f1622]/90 border-[#192436]/70 shadow-2xl shadow-black/40 backdrop-blur-md"
                : "bg-white border-slate-200 shadow-sm"
                }`}>
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                  {/* Search Input Bar */}
                  <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      className={`w-full rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/70 transition-all font-sans ${theme === "dark"
                        ? "bg-[#070a0f]/60 border border-[#1f2d42]/80 text-slate-200 placeholder-slate-500 shadow-inner"
                        : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white shadow-inner"
                        }`}
                      placeholder="Search by client, phone, or service..."
                      type="text"
                      value={aptSearch}
                      onChange={(e) => setAptSearch(e.target.value)}
                    />
                  </div>

                  {/* Filter Pills List */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                    {["ALL", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"].map((status) => {
                      const isActive = aptStatusFilter === status;
                      return (
                        <button
                          key={status}
                          onClick={() => setAptStatusFilter(status)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${isActive
                            ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 font-extrabold"
                            : theme === "dark"
                              ? "text-slate-400 hover:text-slate-200 hover:bg-[#192436]/50 border border-transparent hover:border-[#1f2d42]"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                            }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Salon Reviews & Rating Summary KPI Strip */}
              {(() => {
                const ratedApts = appointments.filter((a) => a.rating != null && a.rating > 0);
                const avg = ratedApts.length > 0
                  ? (ratedApts.reduce((sum, a) => sum + (a.rating || 0), 0) / ratedApts.length).toFixed(1)
                  : "5.0";
                const totalFeedbacks = appointments.filter((a) => !!a.feedback).length;

                return (
                  <div className={`p-4 rounded-2xl border transition-colors flex flex-wrap items-center justify-between gap-4 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-amber-500/10 via-[#0f1622] to-amber-500/5 border-amber-500/20 shadow-lg"
                      : "bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-amber-200 shadow-sm"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 fill-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-extrabold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                            {avg} / 5.0
                          </span>
                          <span className="text-xs text-amber-400 font-semibold flex items-center gap-0.5">
                            {"★".repeat(Math.min(5, Math.max(1, Math.round(Number(avg)))))}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Overall Customer Rating ({ratedApts.length} rated bookings, {totalFeedbacks} text feedbacks)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className={`px-3 py-1.5 rounded-lg border ${theme === "dark" ? "bg-slate-900/60 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
                        <span className="text-slate-400">Fulfilled: </span>
                        <strong className="text-emerald-400">{appointments.filter((a) => a.status === "COMPLETED").length}</strong>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg border ${theme === "dark" ? "bg-slate-900/60 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
                        <span className="text-slate-400">Cancelled: </span>
                        <strong className="text-rose-400">{appointments.filter((a) => a.status === "CANCELLED").length}</strong>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg border ${theme === "dark" ? "bg-slate-900/60 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
                        <span className="text-slate-400">Customer Reviews: </span>
                        <strong className="text-amber-400">{totalFeedbacks}</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* AppointmentsGrid / Horizontal Rows */}
              <main className="flex flex-col gap-3">
                {filteredAppointments.map((apt) => {
                  const initials = getInitials(apt.customerName);

                  // Dynamic color indicator bar
                  const leftBorderClass =
                    apt.status === "CHECKED_IN"
                      ? "bg-gradient-to-b from-emerald-500 via-teal-400 to-emerald-600"
                      : apt.status === "CONFIRMED"
                        ? "bg-gradient-to-b from-sky-500 via-blue-500 to-cyan-400"
                        : apt.status === "COMPLETED"
                          ? "bg-gradient-to-b from-slate-600 via-slate-500 to-slate-700"
                          : "bg-gradient-to-b from-rose-600 via-rose-500 to-rose-700";

                  // Monogram styling
                  const monogramClass =
                    theme === "dark"
                      ? apt.status === "CHECKED_IN"
                        ? "bg-gradient-to-br from-amber-400/20 via-[#141d2b] to-amber-600/30 border-2 border-amber-500/40 text-amber-300"
                        : apt.status === "CONFIRMED"
                          ? "bg-gradient-to-br from-sky-400/20 via-[#141d2b] to-sky-600/30 border-2 border-sky-500/40 text-sky-300"
                          : "bg-gradient-to-br from-slate-500/20 via-[#141d2b] to-slate-700/40 border-2 border-slate-600/40 text-slate-300"
                      : apt.status === "CHECKED_IN"
                        ? "bg-amber-100 border-2 border-amber-400 text-amber-900 font-bold"
                        : apt.status === "CONFIRMED"
                          ? "bg-sky-100 border-2 border-sky-400 text-sky-900 font-bold"
                          : "bg-slate-100 border-2 border-slate-300 text-slate-700 font-bold";

                  return (
                    <article
                      key={apt.id}
                      className={`border transition-all duration-300 rounded-xl p-3 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 group relative overflow-hidden ${theme === "dark"
                        ? "bg-gradient-to-r from-[#131926]/90 via-[#0f1622]/90 to-[#0c101a]/90 border-white/10 hover:border-amber-500/40 shadow-lg hover:shadow-xl backdrop-blur-md"
                        : "bg-white border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md"
                        }`}
                    >
                      {/* Left Status Color Line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${leftBorderClass}`}></div>

                      <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 xl:gap-6 flex-1 min-w-0 pl-1">
                        {/* 1. Time & Status */}
                        <div className="flex flex-row xl:flex-col items-start gap-1.5 shrink-0 min-w-[130px]">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-wider shadow-sm whitespace-nowrap ${theme === "dark"
                            ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                            : "text-amber-800 bg-amber-50 border border-amber-300 font-bold"
                            }`}>
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            {apt.appointmentDate.toUpperCase()} • {apt.appointmentTime}
                          </span>

                          {apt.status === "CHECKED_IN" && (
                            <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              CHECKED_IN
                            </span>
                          )}
                          {apt.status === "CONFIRMED" && (
                            <span className="bg-blue-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                              CONFIRMED
                            </span>
                          )}
                          {apt.status === "COMPLETED" && (
                            <span className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                              COMPLETED
                            </span>
                          )}
                          {apt.status === "CANCELLED" && (
                            <span className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              CANCELLED
                            </span>
                          )}
                          {apt.status === "LATE" && (
                            <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              LATE ARRIVAL
                            </span>
                          )}
                        </div>

                        {/* 2. Client Monogram + Name + Phone */}
                        <div className="flex items-center gap-3 shrink-0 min-w-[200px]">
                          <div className={`w-9 h-9 rounded-full ${monogramClass} flex items-center justify-center font-bold text-xs shadow-inner shrink-0`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h3 className={`font-semibold text-base tracking-tight truncate transition-colors ${theme === "dark"
                              ? "text-white group-hover:text-amber-300"
                              : "text-slate-900 group-hover:text-amber-700"
                              }`}>
                              {apt.customerName}
                            </h3>
                            <div className={`text-xs flex items-center gap-1.5 mt-0.5 ${theme === "dark" ? "text-slate-400" : "text-slate-500"
                              }`}>
                              <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span>{apt.customerPhone}</span>
                            </div>
                          </div>
                        </div>

                        {/* 3. Service Title + Stylist */}
                        <div className="min-w-0 flex-1">
                          <p className={`font-medium text-sm leading-snug truncate ${theme === "dark" ? "text-white" : "text-slate-900"
                            }`}>
                            {apt.serviceName}
                          </p>
                          <div className={`flex items-center gap-1.5 mt-0.5 text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"
                            }`}>
                            <Scissors className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Stylist: <strong className={theme === "dark" ? "text-slate-200 font-medium" : "text-slate-900 font-semibold"}>{apt.stylistName}</strong></span>
                          </div>
                        </div>

                        {/* 4. Customer note badge/quote AND Rating Review */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {apt.notes ? (
                            <div className={`hidden md:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs italic max-w-[240px] border-l-2 shrink-0 ${theme === "dark"
                              ? "bg-[#0a0e17]/70 border border-white/5 border-l-amber-500/40 text-slate-400"
                              : "bg-amber-50/80 border border-amber-200 border-l-amber-500 text-slate-700"
                              }`}>
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <p className="truncate">"{apt.notes}"</p>
                            </div>
                          ) : null}

                          {(apt.rating || apt.feedback) ? (
                            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs border max-w-[320px] shrink-0 ${theme === "dark"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                              : "bg-amber-50 border-amber-300 text-amber-900"
                              }`}>
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                              <div className="min-w-0">
                                <span className="font-bold">{apt.rating ? `${apt.rating}.0★` : 'Review'}:</span>{" "}
                                <span className="italic truncate">{apt.feedback || 'Customer Rated'}</span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Right side: Price + Actions & Queue CTA */}
                      <div className={`flex items-center justify-between xl:justify-end gap-4 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 ${theme === "dark" ? "border-white/5" : "border-slate-100"
                        }`}>
                        {/* 5. Price Tag */}
                        <span className={`font-bold text-base tracking-tight px-3 py-1 rounded-lg border shadow-sm shrink-0 font-mono ${theme === "dark"
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                          : "text-amber-800 bg-amber-50 border-amber-300 font-extrabold"
                          }`}>
                          ₹{apt.servicePrice}
                        </span>

                        {/* Status Action Badge */}
                        {apt.status === "CHECKED_IN" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                            <Check className="w-3.5 h-3.5" />
                            In Service Ready
                          </span>
                        )}

                        {apt.status === "CONFIRMED" && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleCheckInAppointment(apt)}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium px-3.5 py-1.5 rounded-lg shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] transition flex items-center gap-1.5 text-xs shrink-0 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Check-In to Queue
                            </button>
                            <button
                              onClick={() => handleMarkAppointmentLate(apt)}
                              className="border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 shrink-0 cursor-pointer"
                              title="Mark customer as Late arrival"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Mark Late</span>
                            </button>
                          </div>
                        )}

                        {apt.status === "LATE" && (
                          <button
                            onClick={() => handleCheckInAppointment(apt)}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg shadow-md transition flex items-center gap-1.5 text-xs shrink-0 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Late Check-In
                          </button>
                        )}

                        {apt.status === "COMPLETED" && (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${theme === "dark"
                            ? "bg-slate-800/60 text-slate-400 border border-slate-700/60"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}>
                            <Check className="w-3.5 h-3.5" />
                            Fulfilled
                          </span>
                        )}

                        {apt.status === "CANCELLED" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                            <XCircle className="w-3.5 h-3.5" />
                            Cancelled
                          </span>
                        )}

                        {/* Edit / Delete Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditApt(apt)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${theme === "dark"
                              ? "bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
                              }`}
                            title="Edit Appointment"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteApt(apt.id)}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${theme === "dark"
                              ? "bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                              : "bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200"
                              }`}
                            title="Delete Appointment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </main>
            </div>
          )}

          {/* =========================================================================
              TAB 3: LIVE QUEUE TAB
             ========================================================================= */}
          {activeTab === "queue" && (
            <div className="max-w-7xl mx-auto space-y-7 animate-fadeIn">
              {/* HeaderSection */}
              <header className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 transition-colors ${theme === "dark" ? "border-white/[0.06]" : "border-slate-200"
                }`}>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></span>
                    <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"
                      }`}>
                      Live Queue &amp; State Machine
                    </h1>
                  </div>
                  <p className={`mt-2 text-sm tracking-wide flex items-center gap-2 flex-wrap ${theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}>
                    <span>Manage client workflow transitions:</span>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${theme === "dark"
                      ? "bg-slate-800/80 text-slate-300 border-slate-700/50"
                      : "bg-slate-200 text-slate-800 border-slate-300 font-bold"
                      }`}>
                      WAITING
                    </span>
                    <span className="text-slate-400 text-xs font-bold">→</span>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${theme === "dark"
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      : "bg-amber-100 text-amber-800 border-amber-300 font-bold"
                      }`}>
                      CALLED
                    </span>
                    <span className="text-slate-400 text-xs font-bold">→</span>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${theme === "dark"
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                      : "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                      }`}>
                      IN_SERVICE
                    </span>
                    <span className="text-slate-400 text-xs font-bold">→</span>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded border ${theme === "dark"
                      ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                      : "bg-indigo-100 text-indigo-800 border-indigo-300 font-bold"
                      }`}>
                      COMPLETED
                    </span>
                  </p>
                </div>

                {/* Real-time operational indicator */}
                <div className={`flex items-center gap-3 text-xs font-medium px-3.5 py-2 rounded-xl self-start md:self-auto transition-colors border ${theme === "dark"
                  ? "text-slate-400 bg-[#0b0f19]/90 border-white/10 backdrop-blur-md"
                  : "text-slate-700 bg-white border-slate-200 shadow-sm"
                  }`}>
                  <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>System Status:</span>
                  <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync Active
                  </span>
                </div>
              </header>

              {/* TopMetricsSummary */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Metric 1: Waiting in Lobby */}
                <div className={`transition duration-300 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group border ${theme === "dark"
                  ? "bg-[#0b0f19]/60 border-white/10 hover:border-amber-500/30 backdrop-blur-md"
                  : "bg-white border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md"
                  }`}>
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-500 to-amber-600"></div>
                  <div className={`w-13 h-13 p-3.5 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${theme === "dark"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-amber-50 border-amber-200 text-amber-600"
                    }`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}>Waiting in Lobby</span>
                    <h2 className={`text-2xl font-bold tracking-tight mt-0.5 ${theme === "dark" ? "text-white" : "text-slate-900"
                      }`}>{waitingTokens.length} Clients</h2>
                  </div>
                </div>

                {/* Metric 2: Currently in Service */}
                <div className={`transition duration-300 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group border ${theme === "dark"
                  ? "bg-[#0b0f19]/60 border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_25px_-4px_rgba(16,185,129,0.25)] backdrop-blur-md"
                  : "bg-white border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md"
                  }`}>
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500"></div>
                  <div className={`w-13 h-13 p-3.5 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${theme === "dark"
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                    : "bg-emerald-50 border-emerald-200 text-emerald-600"
                    }`}>
                    <Scissors className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-emerald-400/90" : "text-emerald-700"
                      }`}>Currently in Service</span>
                    <h2 className={`text-2xl font-bold tracking-tight mt-0.5 ${theme === "dark" ? "text-white" : "text-slate-900"
                      }`}>{inServiceTokens.length} In-Chair</h2>
                  </div>
                </div>

                {/* Metric 3: AI Congestion Index */}
                <div className={`transition duration-300 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden group border ${theme === "dark"
                  ? "bg-[#0b0f19]/60 border-purple-500/20 hover:border-purple-500/40 backdrop-blur-md"
                  : "bg-white border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md"
                  }`}>
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                  <div className={`w-13 h-13 p-3.5 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${theme === "dark"
                    ? "bg-purple-500/10 border-purple-500/25 text-purple-400"
                    : "bg-purple-50 border-purple-200 text-purple-600"
                    }`}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}>AI Congestion Index</span>
                    <h2 className={`text-2xl font-bold tracking-tight mt-0.5 ${theme === "dark" ? "text-white" : "text-slate-900"
                      }`}>~{avgWaitTime} Mins Delay</h2>
                  </div>
                </div>
              </section>

              {/* LiveQueueTokensList */}
              <section className="space-y-4 pt-2">
                {filteredQueue.map((token) => {
                  const isCalled = token.status === "CALLED";
                  const isInService = token.status === "IN_SERVICE";
                  const isWaiting = token.status === "WAITING";
                  const isLate = token.status === "LATE" || token.status === "ON_HOLD" || (token.status as string) === "NO_SHOW";

                  // Card border and background styling
                  const cardBorderClass =
                    theme === "dark"
                      ? isInService
                        ? "border-2 border-emerald-500/40 shadow-[0_0_25px_-4px_rgba(16,185,129,0.25)] bg-[#0b0f19]/80"
                        : isCalled
                          ? "border border-amber-500/30 hover:border-amber-500/50 bg-[#0b0f19]/70"
                          : isLate
                            ? "border border-orange-500/40 hover:border-orange-500/60 bg-[#140e0a]/80"
                            : "border border-white/10 hover:border-white/20 bg-[#0b0f19]/60"
                      : isInService
                        ? "border-2 border-emerald-400 bg-white shadow-md"
                        : isCalled
                          ? "border border-amber-300 hover:border-amber-400 bg-white shadow-sm"
                          : isLate
                            ? "border border-orange-300 hover:border-orange-400 bg-orange-50/40 shadow-sm"
                            : "border border-slate-200 hover:border-slate-300 bg-white shadow-sm";

                  // Token Identifier box styling
                  const tokenBoxClass =
                    theme === "dark"
                      ? isInService
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
                        : isCalled
                          ? "bg-[#172033]/90 border-amber-500/30 text-amber-400"
                          : isLate
                            ? "bg-orange-950/40 border-orange-500/40 text-orange-400"
                            : "bg-[#172033]/90 border-blue-500/30 text-blue-400"
                      : isInService
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : isCalled
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : isLate
                            ? "bg-orange-100 border-orange-300 text-orange-800"
                            : "bg-blue-50 border-blue-300 text-blue-700";

                  return (
                    <article
                      key={token.id}
                      className={`transition duration-300 rounded-2xl p-5 lg:p-6 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-5 relative overflow-hidden ${cardBorderClass}`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 xl:w-2/5">
                        {/* Token Number Identifier */}
                        <div className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-xl border text-center shadow-inner ${tokenBoxClass}`}>
                          <span className={`text-[10px] font-bold tracking-widest uppercase ${theme === "dark" ? "text-slate-400" : "text-slate-500 font-extrabold"
                            }`}>TOKEN</span>
                          <span className="text-xl font-extrabold mt-0.5">#{token.tokenNumber}</span>
                        </div>

                        {/* Customer Identity & Service Detail */}
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className={`text-lg font-bold tracking-tight truncate ${theme === "dark" ? "text-white" : "text-slate-900"
                              }`}>{token.customerName}</h3>

                            {isCalled && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 uppercase">
                                CALLED
                              </span>
                            )}

                            {isInService && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                IN_SERVICE
                              </span>
                            )}

                            {isWaiting && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-blue-500/15 border border-blue-500/35 text-blue-600 dark:text-blue-400 uppercase">
                                WAITING
                              </span>
                            )}

                            {isLate && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-orange-500/20 border border-orange-500/40 text-orange-400 uppercase">
                                <Clock className="w-3 h-3 text-orange-400" />
                                LATE / ON HOLD
                              </span>
                            )}

                            <span className={`text-xs font-mono ${theme === "dark" ? "text-slate-400" : "text-slate-500"
                              }`}>Issued at: {token.createdAt}</span>
                          </div>

                          <p className={`text-xs font-medium flex flex-wrap items-center gap-1.5 ${theme === "dark" ? "text-slate-300" : "text-slate-700"
                            }`}>
                            <span className={theme === "dark" ? "text-slate-200" : "text-slate-900 font-semibold"}>{token.serviceName}</span>
                            <span className={theme === "dark" ? "text-slate-600" : "text-slate-400"}>•</span>
                            <span className={theme === "dark" ? "text-slate-400" : "text-slate-600"}>Stylist: <strong className={theme === "dark" ? "text-slate-200 font-semibold" : "text-slate-900 font-bold"}>{token.staffName}</strong></span>
                            <span className={theme === "dark" ? "text-slate-600" : "text-slate-400"}>•</span>
                            <span className={`font-bold font-mono ${theme === "dark" ? "text-emerald-400" : "text-emerald-700 font-extrabold"
                              }`}>₹{token.servicePrice}</span>
                          </p>
                        </div>
                      </div>

                      {/* AI Match & Recommendation Capsule */}
                      {token.aiRecommendation ? (
                        <div className={`xl:w-2/5 border rounded-xl p-3.5 flex flex-col justify-center space-y-1 transition-colors ${theme === "dark"
                          ? isInService
                            ? "bg-[#111726]/80 border-emerald-500/20"
                            : "bg-[#111726]/70 border-white/[0.08]"
                          : isInService
                            ? "bg-emerald-50/60 border-emerald-200"
                            : "bg-slate-50 border-slate-200"
                          }`}>
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-bold flex items-center gap-1.5 ${theme === "dark"
                              ? isInService ? "text-emerald-300" : "text-amber-300"
                              : isInService ? "text-emerald-800" : "text-amber-800"
                              }`}>
                              <Sparkles className={`w-3.5 h-3.5 ${isInService ? "text-emerald-500" : "text-amber-500"
                                }`} />
                              AI Match: {token.aiRecommendation.selectedHairstyle}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${theme === "dark"
                              ? isInService
                                ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-emerald-100 border-emerald-300 text-emerald-800"
                              }`}>
                              {token.aiRecommendation.matchScore}% Compatibility
                            </span>
                          </div>
                          <p className={`text-[11px] leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"
                            }`}>
                            {token.aiRecommendation.reason} (Face: {token.aiRecommendation.faceShape}, Hair: {token.aiRecommendation.hairType})
                          </p>
                        </div>
                      ) : (
                        <div className="xl:w-2/5"></div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 justify-end xl:w-1/4 flex-shrink-0">
                        {isWaiting && (
                          <>
                            <button
                              onClick={() => handleCallNext(token)}
                              className="flex-1 xl:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all duration-200 cursor-pointer"
                              type="button"
                              title="Call customer to chair"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-950" />
                              <span>Call Next</span>
                            </button>
                            <button
                              onClick={() => handleMarkTokenLate(token)}
                              className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                theme === "dark"
                                  ? "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30 text-orange-300"
                                  : "bg-orange-50 hover:bg-orange-100 border-orange-300 text-orange-800"
                              }`}
                              type="button"
                              title="Customer not in lobby? Mark late / put on hold so next client is called without deleting ticket"
                            >
                              <span>Skip (Late)</span>
                            </button>
                          </>
                        )}

                        {isLate && (
                          <button
                            onClick={() => handleLateCheckIn(token)}
                            className="flex-1 xl:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-md shadow-orange-500/20 transition-all duration-200 cursor-pointer"
                            type="button"
                            title="Customer has arrived! Check them in as next in line"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Late Check-in</span>
                          </button>
                        )}

                        {isCalled && (
                          <button
                            onClick={() => handleStartService(token)}
                            className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-md transition-all duration-200 cursor-pointer"
                            type="button"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Start Service</span>
                          </button>
                        )}

                        {isInService && (
                          <button
                            onClick={() => handleCompleteService(token)}
                            className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
                            type="button"
                          >
                            <Check className="w-4 h-4" />
                            <span>Complete &amp; Bill</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleCancelToken(token.id, token.tokenNumber)}
                          aria-label={`Delete Token ${token.tokenNumber}`}
                          className={`p-2.5 rounded-xl border transition duration-200 cursor-pointer ${theme === "dark"
                            ? "bg-[#172033]/80 hover:bg-red-500/20 border-white/10 hover:border-red-500/40 text-slate-400 hover:text-red-300"
                            : "bg-slate-100 hover:bg-red-50 border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 shadow-sm"
                            }`}
                          type="button"
                          title="Delete Token"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>
            </div>
          )}

          {/* =========================================================================
              TAB 4: SALON DETAILS TAB
             ========================================================================= */}
          {activeTab === "salon_details" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>Salon Branch Profile &amp; Settings</h1>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    Manage store identity, GPS map link, timings, and customer-facing contact information.
                  </p>
                </div>
                <span className={`text-xs px-3 py-1.5 rounded-xl border font-semibold self-start sm:self-auto ${theme === "dark"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
                  }`}>
                  Status: {activeSalon.status || "ACTIVE"}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Preview Card */}
                <div className={`p-6 rounded-2xl border space-y-4 transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <div className={`w-full h-48 rounded-xl overflow-hidden relative border ${theme === "dark" ? "border-[#252e42]" : "border-slate-200"
                    }`}>
                    <img
                      src={activeSalon.salonLogo || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500"}
                      alt="Salon"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                      <div>
                        <div className="text-xs uppercase tracking-wider font-bold text-amber-400">
                          {activeSalon.type || "UNISEX"} SALON
                        </div>
                        <h3 className="text-lg font-black text-white leading-tight">{activeSalon.salonName}</h3>
                      </div>
                    </div>
                  </div>

                  <div className={`space-y-2.5 text-xs ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{activeSalon.salonAddress}, {activeSalon.city} - {activeSalon.pincode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{activeSalon.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{activeSalon.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Daily: {activeSalon.openingTime} - {activeSalon.closingTime}</span>
                    </div>
                  </div>

                  {activeSalon.locationLink && (
                    <a
                      href={activeSalon.locationLink}
                      target="_blank"
                      rel="noreferrer"
                      className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${theme === "dark"
                        ? "bg-[#182030] hover:bg-[#222b3f] text-amber-400"
                        : "bg-slate-100 hover:bg-slate-200 text-amber-800 border border-slate-200 shadow-sm"
                        }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Open on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Edit Salon Details Form */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <h3 className={`text-base font-bold mb-4 pb-3 border-b ${theme === "dark" ? "text-white border-[#232a3b]" : "text-slate-900 border-slate-200"
                    }`}>
                    Edit Salon Details &amp; Metadata
                  </h3>

                  <form onSubmit={handleSaveSalonDetails} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                          }`}>Salon Name *</label>
                        <input
                          type="text"
                          value={editSalonForm.salonName || ""}
                          onChange={(e) => setEditSalonForm({ ...editSalonForm, salonName: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                            ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                            : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                            }`}
                          required
                        />
                      </div>

                      <div>
                        <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                          }`}>Owner / Manager Name *</label>
                        <input
                          type="text"
                          value={editSalonForm.ownerName || ""}
                          onChange={(e) => setEditSalonForm({ ...editSalonForm, ownerName: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                            ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                            : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                            }`}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                          }`}>Contact Phone *</label>
                        <input
                          type="tel"
                          value={editSalonForm.phoneNumber || ""}
                          onChange={(e) => setEditSalonForm({ ...editSalonForm, phoneNumber: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                            ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                            : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                            }`}
                          required
                        />
                      </div>

                      <div>
                        <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                          }`}>Official Email *</label>
                        <input
                          type="email"
                          value={editSalonForm.email || ""}
                          onChange={(e) => setEditSalonForm({ ...editSalonForm, email: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                            ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                            : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                            }`}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                        }`}>Physical Address *</label>
                      <input
                        type="text"
                        value={editSalonForm.salonAddress || ""}
                        onChange={(e) => setEditSalonForm({ ...editSalonForm, salonAddress: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                          ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                          : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                          }`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                          }`}>City *</label>
                        <input
                          type="text"
                          value={editSalonForm.city || ""}
                          onChange={(e) => setEditSalonForm({ ...editSalonForm, city: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                            ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                            : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                            }`}
                          required
                        />
                      </div>

                      <div>
                        <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                          }`}>Pincode *</label>
                        <input
                          type="text"
                          value={editSalonForm.pincode || ""}
                          onChange={(e) => setEditSalonForm({ ...editSalonForm, pincode: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                            ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                            : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                            }`}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                          }`}>Opening Time *</label>
                        <input
                          type="time"
                          value={editSalonForm.openingTime || "09:00"}
                          onChange={(e) => setEditSalonForm({ ...editSalonForm, openingTime: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                            ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                            : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                            }`}
                          required
                        />
                      </div>

                      <div>
                        <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                          }`}>Closing Time *</label>
                        <input
                          type="time"
                          value={editSalonForm.closingTime || "21:00"}
                          onChange={(e) => setEditSalonForm({ ...editSalonForm, closingTime: e.target.value })}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                            ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                            : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                            }`}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                        }`}>Google Maps Link</label>
                      <input
                        type="url"
                        placeholder="https://maps.google.com/?q=..."
                        value={editSalonForm.locationLink || ""}
                        onChange={(e) => setEditSalonForm({ ...editSalonForm, locationLink: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                          ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                          : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                          }`}
                      />
                    </div>

                    <div>
                      <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                        }`}>Salon Description</label>
                      <textarea
                        rows={3}
                        value={editSalonForm.salonDescription || ""}
                        onChange={(e) => setEditSalonForm({ ...editSalonForm, salonDescription: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none transition-colors ${theme === "dark"
                          ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                          : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                          }`}
                      />
                    </div>

                    {/* Active / Inactive Status Selector in Salon Portal */}
                    <div>
                      <label className={`block font-semibold mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                        }`}>Salon Operating Status</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setEditSalonForm({ ...editSalonForm, status: "ACTIVE" })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${(editSalonForm.status || activeSalon.status) === "ACTIVE" || (editSalonForm.status || activeSalon.status) === "OPEN"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                            : theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-zinc-400" : "bg-slate-100 border-slate-300 text-slate-500"
                            }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditSalonForm({ ...editSalonForm, status: "INACTIVE" })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${(editSalonForm.status || activeSalon.status) === "INACTIVE" || (editSalonForm.status || activeSalon.status) === "CLOSED"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10"
                            : theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-zinc-400" : "bg-slate-100 border-slate-300 text-slate-500"
                            }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          <span>Inactive</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingSalon}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Salon Details</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: HAIRSTYLISTS DETAILS TAB (WITH SUB-TABS: ROSTER, STYLE TYPE, SPECIFIC STYLE)
             ========================================================================= */}
          {activeTab === "stylists" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Title & Dynamic Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                    {stylistSubTab === "roster" && "Hairstylists & Staff Roster"}
                    {stylistSubTab === "types" && "Hairstyle Master Categories & Types"}
                    {stylistSubTab === "specific" && "Specific Hairstyles & Catalog"}
                  </h1>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    {stylistSubTab === "roster" && "Monitor live chair availability, switch stylist statuses, and manage performance ratings."}
                    {stylistSubTab === "types" && "Manage master style types, category codes, banner previews, and linked styles."}
                    {stylistSubTab === "specific" && "Manage bespoke hairstyle cuts, pricing, duration, active status, and AI facial recommendations."}
                  </p>
                </div>
                <div>
                  {stylistSubTab === "roster" && (
                    <button
                      onClick={() => setShowAddStylistModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 flex items-center gap-2 cursor-pointer self-start sm:self-auto transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New Hairstylist</span>
                    </button>
                  )}
                  {stylistSubTab === "types" && (
                    <button
                      onClick={() => setShowAddStyleTypeModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 flex items-center gap-2 cursor-pointer self-start sm:self-auto transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Style Type</span>
                    </button>
                  )}
                  {stylistSubTab === "specific" && (
                    <button
                      onClick={() => setShowAddSpecificStyleModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 flex items-center gap-2 cursor-pointer self-start sm:self-auto transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Specific Style</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Tabs Switcher Bar */}
              <div className={`p-1.5 rounded-2xl border flex flex-wrap sm:flex-nowrap items-center gap-2 max-w-xl ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-slate-200/80 border-slate-300"
                }`}>
                <button
                  type="button"
                  onClick={() => setStylistSubTab("roster")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${stylistSubTab === "roster"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20"
                      : theme === "dark"
                        ? "text-zinc-400 hover:text-white hover:bg-white/5"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Hairstylists</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${stylistSubTab === "roster" ? "bg-black/20 text-black" : theme === "dark" ? "bg-white/10 text-zinc-300" : "bg-slate-300 text-slate-700"
                    }`}>
                    {stylists.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStylistSubTab("types")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${stylistSubTab === "types"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20"
                      : theme === "dark"
                        ? "text-zinc-400 hover:text-white hover:bg-white/5"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Style Type</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${stylistSubTab === "types" ? "bg-black/20 text-black" : theme === "dark" ? "bg-white/10 text-zinc-300" : "bg-slate-300 text-slate-700"
                    }`}>
                    {styleTypes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStylistSubTab("specific")}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${stylistSubTab === "specific"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20"
                      : theme === "dark"
                        ? "text-zinc-400 hover:text-white hover:bg-white/5"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                >
                  <Scissors className="w-4 h-4" />
                  <span>Specific Style</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${stylistSubTab === "specific" ? "bg-black/20 text-black" : theme === "dark" ? "bg-white/10 text-zinc-300" : "bg-slate-300 text-slate-700"
                    }`}>
                    {specificStyles.length}
                  </span>
                </button>
              </div>

              {/* ==================== SUB-TAB 1: HAIRSTYLISTS ROSTER ==================== */}
              {stylistSubTab === "roster" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Stylists Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {stylists.map((stylist) => (
                      <div
                        key={stylist.id}
                        className={`p-5 rounded-2xl border transition-all space-y-4 relative flex flex-col justify-between ${theme === "dark"
                          ? "bg-[#121622] border-[#232a3b] hover:border-amber-500/30"
                          : "bg-white border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-md"
                          }`}
                      >
                        <div className="space-y-3">
                          {/* Avatar & Status Header */}
                          <div className="flex items-start justify-between">
                            <div className="relative">
                              <img
                                src={stylist.avatarUrl}
                                alt={stylist.name}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/30"
                              />
                              <span
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${theme === "dark" ? "border-[#121622]" : "border-white"
                                  } ${stylist.status === "AVAILABLE"
                                    ? "bg-emerald-500"
                                    : stylist.status === "BUSY"
                                      ? "bg-rose-500"
                                      : stylist.status === "BREAK"
                                        ? "bg-amber-500"
                                        : "bg-slate-400"
                                  }`}
                              />
                            </div>

                            {/* Status Toggle Badge */}
                            <button
                              onClick={() => handleToggleStylistStatus(stylist.id, stylist.status)}
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full cursor-pointer transition-all ${stylist.status === "AVAILABLE"
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                                : stylist.status === "BUSY"
                                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                                  : stylist.status === "BREAK"
                                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                                    : "bg-slate-200 text-slate-600 dark:bg-zinc-700/40 dark:text-zinc-400"
                                }`}
                              title="Click to toggle status"
                            >
                              {stylist.status} ↻
                            </button>
                          </div>

                          {/* Name & Specialization */}
                          <div>
                            <h4 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                              }`}>{stylist.name}</h4>
                            <p className={`text-xs font-semibold ${theme === "dark" ? "text-amber-400" : "text-amber-700"
                              }`}>{stylist.specialization}</p>
                            <div className={`text-[11px] mt-1 flex items-center gap-1 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                              }`}>
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{stylist.shiftHours}</span>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className={`grid grid-cols-2 gap-2 p-2.5 rounded-xl border text-center ${theme === "dark"
                            ? "bg-[#171d2b] border-[#232a3b]"
                            : "bg-slate-50 border-slate-200"
                            }`}>
                            <div>
                              <div className={`text-[10px] uppercase font-semibold ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                                }`}>Today's Cuts</div>
                              <div className={`text-sm font-bold font-mono ${theme === "dark" ? "text-white" : "text-slate-900"
                                }`}>{stylist.completedToday} Clients</div>
                            </div>
                            <div>
                              <div className={`text-[10px] uppercase font-semibold ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                                }`}>Rating</div>
                              <div className={`text-sm font-bold font-mono ${theme === "dark" ? "text-amber-300" : "text-amber-800"
                                }`}>★ {stylist.rating}</div>
                            </div>
                          </div>

                          {stylist.currentClient && (
                            <div className={`p-2 rounded-lg border text-[11px] ${theme === "dark"
                              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                              : "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                              }`}>
                              <strong>Active Client:</strong> {stylist.currentClient}
                            </div>
                          )}
                        </div>

                        {/* Action Bar */}
                        <div className={`pt-3 border-t flex items-center justify-between ${theme === "dark" ? "border-[#1f2637] text-zinc-400" : "border-slate-200 text-slate-500"
                          }`}>
                          <div className="text-[11px] font-mono">{stylist.experienceYears}y Exp</div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditStylist(stylist)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === "dark"
                                ? "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
                                }`}
                              title="Edit Stylist"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStylist(stylist.id, stylist.name)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === "dark"
                                ? "bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300"
                                : "bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200"
                                }`}
                              title="Remove Stylist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================== SUB-TAB 2: STYLE TYPE ==================== */}
              {stylistSubTab === "types" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Search Bar */}
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                    }`}>
                    <div className="relative w-full sm:w-96">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search style type by name or code..."
                        value={styleTypeSearch}
                        onChange={(e) => setStyleTypeSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none transition-colors ${theme === "dark"
                            ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                            : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                          }`}
                      />
                    </div>
                    <div className="text-xs text-zinc-400">
                      Showing <strong className={theme === "dark" ? "text-amber-400" : "text-amber-700"}>{filteredStyleTypes.length}</strong> Master Style Types
                    </div>
                  </div>

                  {/* Style Types Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStyleTypes.map((type) => {
                      const count = specificStyles.filter((s) => s.styleTypeId === type.id).length;
                      return (
                        <div
                          key={type.id}
                          className={`rounded-2xl border overflow-hidden transition-all flex flex-col justify-between group ${theme === "dark"
                              ? "bg-[#121622] border-[#232a3b] hover:border-amber-500/40"
                              : "bg-white border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md"
                            }`}
                        >
                          {/* Image Banner */}
                          <div className="h-44 w-full relative overflow-hidden bg-zinc-900">
                            <img
                              src={type.imageUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500"}
                              alt={type.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute top-3 left-3">
                              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-400 border border-amber-400/30">
                                {type.code}
                              </span>
                            </div>
                            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                              <h3 className="text-lg font-black text-white leading-tight drop-shadow-md">{type.name}</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold font-mono shadow-md">
                                {count} Styles
                              </span>
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                            <p className={`text-xs leading-relaxed ${theme === "dark" ? "text-zinc-300" : "text-slate-600"
                              }`}>
                              {type.description || "Bespoke styling service category."}
                            </p>

                            <div className={`pt-3 border-t flex items-center justify-between ${theme === "dark" ? "border-[#1f2637]" : "border-slate-200"
                              }`}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSpecificStyleFilterType(type.id);
                                  setStylistSubTab("specific");
                                }}
                                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer group-hover:translate-x-1 transition-transform"
                              >
                                <span>View Specific Styles</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[11px] font-mono text-zinc-500">ID: {type.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ==================== SUB-TAB 3: SPECIFIC STYLE ==================== */}
              {stylistSubTab === "specific" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Filters and Search Bar */}
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                    }`}>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
                      <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Search specific style, face shape, hair type..."
                          value={specificStyleSearch}
                          onChange={(e) => setSpecificStyleSearch(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none transition-colors ${theme === "dark"
                              ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                              : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                            }`}
                        />
                      </div>

                      {/* Style Type Filter Dropdown */}
                      <div className="w-full sm:w-60">
                        <select
                          value={specificStyleFilterType}
                          onChange={(e) => setSpecificStyleFilterType(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none transition-colors ${theme === "dark"
                              ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                              : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                            }`}
                        >
                          <option value="ALL">All Style Types ({specificStyles.length})</option>
                          {styleTypes.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 whitespace-nowrap">
                      Showing <strong className={theme === "dark" ? "text-amber-400" : "text-amber-700"}>{filteredSpecificStyles.length}</strong> specific styles
                    </div>
                  </div>

                  {/* Specific Styles Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSpecificStyles.map((style) => {
                      const matchedType = styleTypes.find((t) => t.id === style.styleTypeId);
                      return (
                        <div
                          key={style.id}
                          className={`rounded-2xl border overflow-hidden transition-all flex flex-col justify-between ${theme === "dark"
                              ? "bg-[#121622] border-[#232a3b] hover:border-amber-500/30"
                              : "bg-white border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-md"
                            }`}
                        >
                          {/* Image & Badges */}
                          <div className="h-48 w-full relative overflow-hidden bg-zinc-900">
                            <img
                              src={style.imageUrl || matchedType?.imageUrl || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500"}
                              alt={style.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-400/90 text-black shadow-md font-mono">
                                {matchedType?.name || style.styleTypeName || "Style"}
                              </span>
                            </div>

                            <div className="absolute top-3 right-3">
                              <button
                                type="button"
                                onClick={() => handleToggleSpecificStyleStatus(style)}
                                className={`text-[10px] px-2.5 py-1 rounded-full border font-bold cursor-pointer transition-all flex items-center gap-1.5 backdrop-blur-md ${style.status === "ACTIVE" || !style.status
                                    ? "bg-emerald-500/80 text-emerald-100 border-emerald-300 hover:bg-emerald-500"
                                    : "bg-rose-500/80 text-rose-100 border-rose-300 hover:bg-rose-500"
                                  }`}
                                title="Click to toggle status"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${style.status === "ACTIVE" || !style.status ? "bg-white animate-pulse" : "bg-white"}`} />
                                <span>{style.status || "ACTIVE"}</span>
                              </button>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                              <div>
                                <h3 className="text-base font-black text-white leading-tight drop-shadow-md">{style.name}</h3>
                                <div className="text-[10px] text-amber-300 font-mono mt-0.5">Code: {style.code || "standard"}</div>
                              </div>
                              <div className="text-right">
                                <span className="text-base font-black text-amber-400 font-mono block leading-none">₹{style.price}</span>
                                <span className="text-[10px] text-zinc-300 font-mono mt-0.5 block">{style.durationMinutes} mins</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Content & AI Attributes */}
                          <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                            <p className={`text-xs leading-relaxed ${theme === "dark" ? "text-zinc-300" : "text-slate-600"
                              }`}>
                              {style.description || "Precision customized salon cut and styling tailored for your face."}
                            </p>

                            {/* AI Recommendations: Suitable Face & Hair */}
                            <div className={`p-3 rounded-xl border space-y-2 text-[11px] ${theme === "dark" ? "bg-[#181e2b] border-[#252e42]" : "bg-slate-50 border-slate-200"
                              }`}>
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <strong className={theme === "dark" ? "text-zinc-200" : "text-slate-800"}>Face Shapes:</strong>
                                <span className="text-amber-400 font-medium truncate">{style.suitableFaceShapes || "Oval, Square, Round"}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Scissors className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <strong className={theme === "dark" ? "text-zinc-200" : "text-slate-800"}>Hair Types:</strong>
                                <span className="text-emerald-400 font-medium truncate">{style.suitableHairTypes || "Straight, Wavy, Thick"}</span>
                              </div>
                            </div>

                            {/* Action Bar */}
                            <div className={`pt-3 border-t flex items-center justify-between ${theme === "dark" ? "border-[#1f2637] text-zinc-400" : "border-slate-200 text-slate-500"
                              }`}>
                              <span className="text-[11px] font-mono text-zinc-500">ID: {style.id.slice(0, 8)}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditSpecificStyle(style)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === "dark"
                                      ? "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
                                    }`}
                                  title="Edit Style"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSpecificStyle(style.id, style.name)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === "dark"
                                      ? "bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300"
                                      : "bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200"
                                    }`}
                                  title="Remove Style"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 6: SALON STAFF DIRECTORY (API: /api/salon-staff — table: salon_staff)
             ========================================================================= */}
          {activeTab === "salon_staff" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Title & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                    Salon Staff Management
                  </h1>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    Manage duty shifts, specialization roles, status &amp; contact records stored in <span className="font-mono text-amber-500">salon_staff</span> table (<span className="font-mono text-amber-500">GET /api/salon-staff</span>).
                  </p>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <button
                    onClick={loadSalonStaff}
                    disabled={isLoadingSalonStaff}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${theme === "dark"
                      ? "bg-[#182030] hover:bg-[#222b3f] border-[#2e3a52] text-zinc-300 hover:text-white"
                      : "bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm"
                      }`}
                    title="Reload salon staff from backend"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isLoadingSalonStaff ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => setShowAddSalonStaffModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Salon Staff</span>
                  </button>
                </div>
              </div>

              {/* Salon Staff Overview Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <div className={`flex items-center justify-between text-xs mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    <span className="font-semibold uppercase tracking-wider">Total Staff</span>
                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                      <UserCheck className="w-4 h-4" />
                    </span>
                  </div>
                  <div className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>{salonStaffList.length}</div>
                  <div className="text-[11px] font-semibold mt-1 text-amber-500">
                    salon_staff records
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <div className={`flex items-center justify-between text-xs mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    <span className="font-semibold uppercase tracking-wider">Available</span>
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <div className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                    {salonStaffList.filter((s) => s.status === "AVAILABLE").length}
                  </div>
                  <div className="text-[11px] font-semibold mt-1 text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Ready for Clients</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <div className={`flex items-center justify-between text-xs mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    <span className="font-semibold uppercase tracking-wider">In Service (Busy)</span>
                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                      <Scissors className="w-4 h-4" />
                    </span>
                  </div>
                  <div className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                    {salonStaffList.filter((s) => s.status === "BUSY").length}
                  </div>
                  <div className={`text-[11px] mt-1 ${theme === "dark" ? "text-amber-400" : "text-amber-700"}`}>
                    Occupied with appointments
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border transition-colors ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                  <div className={`flex items-center justify-between text-xs mb-1.5 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                    <span className="font-semibold uppercase tracking-wider">On Break / Offline</span>
                    <span className="p-1.5 rounded-lg bg-zinc-500/10 text-zinc-400">
                      <Coffee className="w-4 h-4" />
                    </span>
                  </div>
                  <div className={`text-2xl font-black tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                    {salonStaffList.filter((s) => s.status === "BREAK" || s.status === "OFFLINE").length}
                  </div>
                  <div className={`text-[11px] mt-1 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                    Currently unavailable
                  </div>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                }`}>
                <div className="relative w-full sm:w-80">
                  <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-zinc-400" : "text-slate-400"
                    }`} />
                  <input
                    type="text"
                    placeholder="Search salon staff by name, phone, or specialization..."
                    value={salonStaffSearch}
                    onChange={(e) => setSalonStaffSearch(e.target.value)}
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl text-xs focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                  <span className={`font-mono text-[11px] ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                    Showing <strong className={theme === "dark" ? "text-white" : "text-slate-800"}>{filteredSalonStaff.length}</strong> of {salonStaffList.length} staff
                  </span>
                </div>
              </div>

              {/* Salon Staff Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSalonStaff.map((staff) => {
                  const initials = getInitials(staff.name);
                  return (
                    <div
                      key={staff.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${theme === "dark"
                        ? "bg-[#121622] border-[#232a3b] hover:border-amber-500/30"
                        : "bg-white border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-md"
                        }`}
                    >
                      <div>
                        {/* Avatar & Specialization Header */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            {staff.profileImage ? (
                              <img
                                src={staff.profileImage}
                                alt={staff.name}
                                className="w-12 h-12 rounded-2xl object-cover border border-amber-500/30"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-extrabold flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
                                {initials}
                              </div>
                            )}
                            <div>
                              <h3 className={`text-base font-bold leading-tight ${theme === "dark" ? "text-white" : "text-slate-900"
                                }`}>
                                {staff.name}
                              </h3>
                              <span className="inline-block mt-0.5 text-xs text-amber-500 font-semibold truncate max-w-[180px]">
                                {staff.specialization}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditSalonStaff(staff)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === "dark"
                                ? "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200"
                                }`}
                              title="Edit Salon Staff"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSalonStaff(staff.id, staff.name)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === "dark"
                                ? "bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300"
                                : "bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200"
                                }`}
                              title="Remove Salon Staff"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Status Toggle Bar */}
                        <div className="flex items-center gap-1.5 mb-3.5">
                          {(["AVAILABLE", "BUSY", "BREAK", "OFFLINE"] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateSalonStaffStatus(staff, st)}
                              className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${staff.status === st
                                ? st === "AVAILABLE"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                                  : st === "BUSY"
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                                    : st === "BREAK"
                                      ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                                      : "bg-rose-500/20 text-rose-300 border-rose-500/50"
                                : theme === "dark"
                                  ? "bg-white/5 text-zinc-400 border-transparent hover:bg-white/10"
                                  : "bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200"
                                }`}
                            >
                              {st === "AVAILABLE" ? "Free" : st === "BUSY" ? "Busy" : st === "BREAK" ? "Break" : "Off"}
                            </button>
                          ))}
                        </div>

                        {/* Contact & Experience Details */}
                        <div className={`space-y-2 text-xs mb-4 ${theme === "dark" ? "text-zinc-300" : "text-slate-600"
                          }`}>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{staff.phone || "+91 98000 00000"}</span>
                          </div>
                          {staff.email && (
                            <div className="flex items-center gap-2 truncate">
                              <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="truncate">{staff.email}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <span className={theme === "dark" ? "text-zinc-400" : "text-slate-500"}>Experience:</span>
                            <span className="font-semibold text-amber-400">{staff.experienceYears || 3} Years</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Badge & UUID */}
                      <div className={`pt-3 border-t flex items-center justify-between text-[10px] font-mono ${theme === "dark" ? "border-[#1f2637] text-zinc-500" : "border-slate-200 text-slate-400"
                        }`}>
                        <span>ID: {staff.id.length > 12 ? `${staff.id.slice(0, 10)}...` : staff.id}</span>
                        <span className="flex items-center gap-1 font-sans font-semibold text-amber-400">
                          salon_staff
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSalonStaff.length === 0 && (
                <div className={`p-12 text-center rounded-2xl border ${theme === "dark" ? "bg-[#121622] border-[#232a3b] text-zinc-400" : "bg-white border-slate-200 text-slate-500"
                  }`}>
                  <UserCheck className="w-12 h-12 mx-auto text-amber-500/40 mb-3" />
                  <h3 className="text-base font-bold text-white mb-1">No Salon Staff Found</h3>
                  <p className="text-xs mb-4">No staff members in salon_staff matched "{salonStaffSearch}".</p>
                  <button
                    onClick={() => setSalonStaffSearch("")}
                    className="px-4 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Clear Search Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ======================= ADD WALKIN TOKEN MODAL ======================= */}
      {showAddWalkinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 transition-colors ${theme === "dark"
            ? "bg-[#121622] border-amber-500/40 text-white"
            : "bg-white border-amber-400 text-slate-900 shadow-2xl"
            }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>Issue Walk-in Queue Token</h3>
              </div>
              <button
                onClick={() => setShowAddWalkinModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWalkinToken} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sameer Kulkarni"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Customer Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98231 00000"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Service Selection *</label>
                <select
                  value={walkinService}
                  onChange={(e) => setWalkinService(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                >
                  <option value="Signature AI Haircut & Styling">Signature AI Haircut &amp; Styling (₹650)</option>
                  <option value="Balayage Color & Hair Spa Treatment">Balayage Color &amp; Hair Spa (₹2200)</option>
                  <option value="Royal Beard Sculpture & Detailing">Royal Beard Sculpture (₹450)</option>
                  <option value="Hydra Radiance Facial & De-tan">Hydra Radiance Facial (₹1800)</option>
                  <option value="Keratin Smooth Gloss Therapy">Keratin Smooth Gloss (₹3500)</option>
                </select>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Assigned Hairstylist</label>
                <select
                  value={walkinStylist}
                  onChange={(e) => setWalkinStylist(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                >
                  <option value="">Next Available Stylist</option>
                  {stylists.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                }`}>
                <button
                  type="button"
                  onClick={() => setShowAddWalkinModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${theme === "dark"
                    ? "bg-white/5 text-zinc-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer hover:from-amber-300 hover:to-amber-400"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ADD APPOINTMENT MODAL ======================= */}
      {showAddAppointmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 transition-colors ${theme === "dark"
            ? "bg-[#121622] border-amber-500/40 text-white"
            : "bg-white border-amber-400 text-slate-900 shadow-2xl"
            }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>Book New Appointment</h3>
              </div>
              <button
                onClick={() => setShowAddAppointmentModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAppointment} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rohini Patil"
                  value={newAptName}
                  onChange={(e) => setNewAptName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newAptPhone}
                    onChange={(e) => setNewAptPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Time Slot *</label>
                  <input
                    type="time"
                    value={newAptTime}
                    onChange={(e) => setNewAptTime(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Service *</label>
                <select
                  value={newAptService}
                  onChange={(e) => setNewAptService(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                >
                  <option value="Signature AI Haircut & Styling">Signature AI Haircut &amp; Styling (₹650)</option>
                  <option value="Balayage Color & Hair Spa Treatment">Balayage Color &amp; Hair Spa (₹2200)</option>
                  <option value="Royal Beard Sculpture & Detailing">Royal Beard Sculpture (₹450)</option>
                  <option value="Hydra Radiance Facial & De-tan">Hydra Radiance Facial (₹1800)</option>
                  <option value="Keratin Smooth Gloss Therapy">Keratin Smooth Gloss (₹3500)</option>
                </select>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Select Stylist *</label>
                <select
                  value={newAptStylist}
                  onChange={(e) => setNewAptStylist(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                >
                  {stylists.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Special Notes / Requests</label>
                <input
                  type="text"
                  placeholder="e.g. Prefers organic products"
                  value={newAptNotes}
                  onChange={(e) => setNewAptNotes(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                }`}>
                <button
                  type="button"
                  onClick={() => setShowAddAppointmentModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${theme === "dark"
                    ? "bg-white/5 text-zinc-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer hover:from-amber-300 hover:to-amber-400"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT APPOINTMENT MODAL ======================= */}
      {showEditAppointmentModal && editingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 transition-colors ${theme === "dark"
            ? "bg-[#121622] border-amber-500/40 text-white"
            : "bg-white border-amber-400 text-slate-900 shadow-2xl"
            }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>Edit Appointment</h3>
              </div>
              <button
                onClick={() => setShowEditAppointmentModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditApt} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Customer</label>
                <input
                  type="text"
                  value={editingApt.customerName}
                  disabled
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm ${theme === "dark"
                    ? "bg-[#141924] border border-[#232a3b] text-zinc-400"
                    : "bg-slate-100 border border-slate-200 text-slate-500"
                    }`}
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Status</label>
                <select
                  value={editAptStatus}
                  onChange={(e) => setEditAptStatus(e.target.value as any)}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none font-bold ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-amber-300 focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-amber-800 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CHECKED_IN">CHECKED_IN</option>
                  <option value="IN_SERVICE">IN_SERVICE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Assigned Stylist</label>
                <select
                  value={editAptStylist}
                  onChange={(e) => setEditAptStylist(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                >
                  {stylists.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Time Slot</label>
                <input
                  type="text"
                  value={editAptTime}
                  onChange={(e) => setEditAptTime(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                }`}>
                <button
                  type="button"
                  onClick={() => setShowEditAppointmentModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${theme === "dark"
                    ? "bg-white/5 text-zinc-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer hover:from-amber-300 hover:to-amber-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ADD STYLIST MODAL ======================= */}
      {showAddStylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 transition-colors ${theme === "dark"
            ? "bg-[#121622] border-amber-500/40 text-white"
            : "bg-white border-amber-400 text-slate-900 shadow-2xl"
            }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>Add New Hairstylist</h3>
              </div>
              <button
                onClick={() => setShowAddStylistModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStylist} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Alok Roy"
                  value={newStylistName}
                  onChange={(e) => setNewStylistName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Phone *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={newStylistPhone}
                    onChange={(e) => setNewStylistPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Experience (Years)</label>
                  <input
                    type="number"
                    placeholder="4"
                    value={newStylistExp}
                    onChange={(e) => setNewStylistExp(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Specialization *</label>
                <input
                  type="text"
                  placeholder="e.g. Master Colorist, Fade Specialist"
                  value={newStylistSpecialization}
                  onChange={(e) => setNewStylistSpecialization(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Shift Timings</label>
                <input
                  type="text"
                  placeholder="09:00 AM - 06:00 PM"
                  value={newStylistShift}
                  onChange={(e) => setNewStylistShift(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                }`}>
                <button
                  type="button"
                  onClick={() => setShowAddStylistModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${theme === "dark"
                    ? "bg-white/5 text-zinc-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer hover:from-amber-300 hover:to-amber-400"
                >
                  Add Stylist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT STYLIST MODAL ======================= */}
      {showEditStylistModal && editingStylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 transition-colors ${theme === "dark"
            ? "bg-[#121622] border-amber-500/40 text-white"
            : "bg-white border-amber-400 text-slate-900 shadow-2xl"
            }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>Edit Stylist Profile</h3>
              </div>
              <button
                onClick={() => setShowEditStylistModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStylist} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Full Name</label>
                <input
                  type="text"
                  value={editStylistName}
                  onChange={(e) => setEditStylistName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Specialization</label>
                <input
                  type="text"
                  value={editStylistSpecialization}
                  onChange={(e) => setEditStylistSpecialization(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Status</label>
                  <select
                    value={editStylistStatus}
                    onChange={(e) => setEditStylistStatus(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none font-bold ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-emerald-400 focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-emerald-700 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BUSY">BUSY</option>
                    <option value="BREAK">BREAK</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Shift Timings</label>
                  <input
                    type="text"
                    value={editStylistShift}
                    onChange={(e) => setEditStylistShift(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                }`}>
                <button
                  type="button"
                  onClick={() => setShowEditStylistModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${theme === "dark"
                    ? "bg-white/5 text-zinc-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer hover:from-amber-300 hover:to-amber-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ======================= ADD STYLE TYPE MODAL ======================= */}
      {showAddStyleTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 transition-colors ${theme === "dark"
            ? "bg-[#121622] border-amber-500/40 text-white"
            : "bg-white border-amber-400 text-slate-900 shadow-2xl"
            }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>Create New Style Type Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStyleTypeModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStyleType} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Style Type Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Haircut & Styling"
                    value={newStyleTypeName}
                    onChange={(e) => {
                      setNewStyleTypeName(e.target.value);
                      if (!newStyleTypeCode) {
                        setNewStyleTypeCode(e.target.value.toUpperCase().replace(/\s+/g, "_").slice(0, 15));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Type Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. HAIRCUT"
                    value={newStyleTypeCode}
                    onChange={(e) => setNewStyleTypeCode(e.target.value.toUpperCase())}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-amber-300 focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-amber-800 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newStyleTypeImage}
                  onChange={(e) => setNewStyleTypeImage(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
                {/* Image Presets */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { name: "Haircut", url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500" },
                    { name: "Beard", url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500" },
                    { name: "Color", url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500" },
                    { name: "Facial", url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500" },
                    { name: "Spa", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500" },
                  ].map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setNewStyleTypeImage(p.url)}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-semibold cursor-pointer ${newStyleTypeImage === p.url
                        ? "bg-amber-400 text-black border-amber-400 font-bold"
                        : theme === "dark"
                          ? "bg-white/5 border-white/10 text-zinc-300 hover:text-white"
                          : "bg-slate-100 border-slate-300 text-slate-700"
                        }`}
                    >
                      {p.name} Preset
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Category Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the services and styles under this type..."
                  value={newStyleTypeDesc}
                  onChange={(e) => setNewStyleTypeDesc(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                }`}>
                <button
                  type="button"
                  onClick={() => setShowAddStyleTypeModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${theme === "dark"
                    ? "bg-white/5 text-zinc-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer hover:from-amber-300 hover:to-amber-400"
                >
                  Save Style Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ADD SPECIFIC STYLE MODAL ======================= */}
      {showAddSpecificStyleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-colors ${theme === "dark"
            ? "bg-[#121622] border-amber-500/40 text-white"
            : "bg-white border-amber-400 text-slate-900 shadow-2xl"
            }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>Add New Specific Hairstyle</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSpecificStyleModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSpecificStyle} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Master Style Type Category *</label>
                <select
                  value={newSpecificStyleTypeId}
                  onChange={(e) => setNewSpecificStyleTypeId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-amber-300 focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-amber-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                  required
                >
                  <option value="">-- Choose Style Type --</option>
                  {styleTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Specific Style Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Textured Crop Fade"
                    value={newSpecificStyleName}
                    onChange={(e) => {
                      setNewSpecificStyleName(e.target.value);
                      if (!newSpecificStyleCode) {
                        setNewSpecificStyleCode(e.target.value.toLowerCase().replace(/\s+/g, "_"));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Style Code</label>
                  <input
                    type="text"
                    placeholder="e.g. textured_crop_fade"
                    value={newSpecificStyleCode}
                    onChange={(e) => setNewSpecificStyleCode(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Standard Price (₹) *</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={newSpecificStylePrice}
                    onChange={(e) => setNewSpecificStylePrice(Number(e.target.value))}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-amber-400 focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-amber-700 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Duration (Minutes) *</label>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={newSpecificStyleDuration}
                    onChange={(e) => setNewSpecificStyleDuration(Number(e.target.value))}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Suitable Face Shapes</label>
                  <input
                    type="text"
                    placeholder="e.g. Oval, Square, Round"
                    value={newSpecificStyleFaceShapes}
                    onChange={(e) => setNewSpecificStyleFaceShapes(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Suitable Hair Types</label>
                  <input
                    type="text"
                    placeholder="e.g. Straight, Wavy, Thick"
                    value={newSpecificStyleHairTypes}
                    onChange={(e) => setNewSpecificStyleHairTypes(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Style Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newSpecificStyleImage}
                  onChange={(e) => setNewSpecificStyleImage(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Style Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed cutting technique, styling notes, and care instructions..."
                  value={newSpecificStyleDesc}
                  onChange={(e) => setNewSpecificStyleDesc(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                }`}>
                <button
                  type="button"
                  onClick={() => setShowAddSpecificStyleModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${theme === "dark"
                    ? "bg-white/5 text-zinc-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer hover:from-amber-300 hover:to-amber-400"
                >
                  Add Style to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT SPECIFIC STYLE MODAL ======================= */}
      {showEditSpecificStyleModal && editingSpecificStyle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-colors ${theme === "dark"
            ? "bg-[#121622] border-amber-500/40 text-white"
            : "bg-white border-amber-400 text-slate-900 shadow-2xl"
            }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>Edit Hairstyle Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditSpecificStyleModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSpecificStyle} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Style Name</label>
                  <input
                    type="text"
                    value={editSpecificStyleName}
                    onChange={(e) => setEditSpecificStyleName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Operating Status</label>
                  <select
                    value={editSpecificStyleStatus}
                    onChange={(e) => setEditSpecificStyleStatus(e.target.value as any)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-emerald-400 focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-emerald-800 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Price (₹)</label>
                  <input
                    type="number"
                    value={editSpecificStylePrice}
                    onChange={(e) => setEditSpecificStylePrice(Number(e.target.value))}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-amber-400 focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-amber-700 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Duration (Minutes)</label>
                  <input
                    type="number"
                    value={editSpecificStyleDuration}
                    onChange={(e) => setEditSpecificStyleDuration(Number(e.target.value))}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Suitable Face Shapes</label>
                  <input
                    type="text"
                    value={editSpecificStyleFaceShapes}
                    onChange={(e) => setEditSpecificStyleFaceShapes(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Suitable Hair Types</label>
                  <input
                    type="text"
                    value={editSpecificStyleHairTypes}
                    onChange={(e) => setEditSpecificStyleHairTypes(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Image URL</label>
                <input
                  type="url"
                  value={editSpecificStyleImage}
                  onChange={(e) => setEditSpecificStyleImage(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Description</label>
                <textarea
                  rows={3}
                  value={editSpecificStyleDesc}
                  onChange={(e) => setEditSpecificStyleDesc(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                }`}>
                <button
                  type="button"
                  onClick={() => setShowEditSpecificStyleModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${theme === "dark"
                    ? "bg-white/5 text-zinc-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer hover:from-amber-300 hover:to-amber-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ADD SALON STAFF MODAL (salon_staff table) ======================= */}
      {showAddSalonStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-colors ${theme === "dark"
            ? "bg-[#121622] border-amber-500/40 text-white"
            : "bg-white border-amber-400 text-slate-900 shadow-2xl"
            }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>Add Salon Staff</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSalonStaffModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSalonStaff} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Staff Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rohini Patil"
                  value={newSalonStaffName}
                  onChange={(e) => setNewSalonStaffName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Specialization / Role *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Hair Stylist, Master Barber, Esthetician"
                  value={newSalonStaffSpecialization}
                  onChange={(e) => setNewSalonStaffSpecialization(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Contact Phone *</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newSalonStaffPhone}
                    onChange={(e) => setNewSalonStaffPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="staff@stylestudio.in"
                    value={newSalonStaffEmail}
                    onChange={(e) => setNewSalonStaffEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Initial Status</label>
                  <select
                    value={newSalonStaffStatus}
                    onChange={(e) => setNewSalonStaffStatus(e.target.value as any)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-emerald-400 focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-emerald-800 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  >
                    <option value="AVAILABLE">AVAILABLE (Free)</option>
                    <option value="BUSY">BUSY (In Service)</option>
                    <option value="BREAK">BREAK</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={newSalonStaffExp}
                    onChange={(e) => setNewSalonStaffExp(Number(e.target.value))}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Profile Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newSalonStaffImage}
                  onChange={(e) => setNewSalonStaffImage(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                }`}>
                <button
                  type="button"
                  onClick={() => setShowAddSalonStaffModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${theme === "dark"
                    ? "bg-white/5 text-zinc-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSalonStaff}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer hover:from-amber-300 hover:to-amber-400 flex items-center gap-2"
                >
                  {isCreatingSalonStaff && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save to salon_staff</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT SALON STAFF MODAL ======================= */}
      {showEditSalonStaffModal && editingSalonStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-colors ${theme === "dark"
            ? "bg-[#121622] border-amber-500/40 text-white"
            : "bg-white border-amber-400 text-slate-900 shadow-2xl"
            }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>Edit Salon Staff</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditSalonStaffModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                  }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSalonStaff} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Staff Name *</label>
                <input
                  type="text"
                  value={editSalonStaffName}
                  onChange={(e) => setEditSalonStaffName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Specialization / Role *</label>
                <input
                  type="text"
                  value={editSalonStaffSpecialization}
                  onChange={(e) => setEditSalonStaffSpecialization(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Contact Phone</label>
                  <input
                    type="tel"
                    value={editSalonStaffPhone}
                    onChange={(e) => setEditSalonStaffPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Email Address</label>
                  <input
                    type="email"
                    value={editSalonStaffEmail}
                    onChange={(e) => setEditSalonStaffEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Status</label>
                  <select
                    value={editSalonStaffStatus}
                    onChange={(e) => setEditSalonStaffStatus(e.target.value as any)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-emerald-400 focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-emerald-800 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  >
                    <option value="AVAILABLE">AVAILABLE (Free)</option>
                    <option value="BUSY">BUSY (In Service)</option>
                    <option value="BREAK">BREAK</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={editSalonStaffExp}
                    onChange={(e) => setEditSalonStaffExp(Number(e.target.value))}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none transition-colors ${theme === "dark"
                      ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Profile Photo URL</label>
                <input
                  type="url"
                  value={editSalonStaffImage}
                  onChange={(e) => setEditSalonStaffImage(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${theme === "dark"
                    ? "bg-[#181e2b] border border-[#2b354b] text-white focus:border-amber-400"
                    : "bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-amber-500 shadow-inner"
                    }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                }`}>
                <button
                  type="button"
                  onClick={() => setShowEditSalonStaffModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${theme === "dark"
                    ? "bg-white/5 text-zinc-300 hover:text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                    }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingSalonStaff}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer hover:from-amber-300 hover:to-amber-400 flex items-center gap-2"
                >
                  {isUpdatingSalonStaff && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= LOGOUT CONFIRMATION MODAL ======================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className={`border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center ${theme === "dark" ? "bg-[#121622] border-amber-500/40 text-white" : "bg-white border-slate-300 text-slate-900 shadow-2xl"
            }`}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold tracking-tight">Are you sure to logout?</h3>
              <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                You will be signed out from your Staff / Salon Portal session.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className={`py-2.5 px-4 rounded-xl border font-medium text-xs transition-colors cursor-pointer ${theme === "dark" ? "bg-[#1a202d] hover:bg-[#222b3d] border-[#2d384e] text-zinc-300 hover:text-white" : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700"
                  }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("salonflow_token");
                  localStorage.removeItem("salonflow_user");
                  localStorage.removeItem("salonflow_auth_token");
                  localStorage.removeItem("salonflow_auth_user");
                  setShowLogoutModal(false);
                  window.location.href = "/login";
                }}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Yes, Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
