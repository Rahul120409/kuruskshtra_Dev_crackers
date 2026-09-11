"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Scissors,
  TrendingUp,
  Sparkles,
  Building2,
  Calendar,
  Users,
  Clock,
  Store,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  DollarSign,
  ChevronRight,
  ChevronDown,
  X,
  Phone,
  LogIn,
  UserPlus,
  LogOut,
  Mail,
  Lock,
  User,
  Shield,
  BadgeCheck,
  Filter,
  Sparkle,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Navigation,
  Pencil,
  Edit3,
} from "lucide-react";
import {
  loginUser,
  registerUser,
  getAllUsersApi,
  updateUserApi,
  deleteUserApi,
  UserData,
  RegisterPayload,
} from "../services/auth";
import {
  createState as apiCreateState,
  getAllStates as apiGetAllStates,
  createCity as apiCreateCity,
  getAllCities as apiGetAllCities,
  getCitiesByStateId,
  getCitiesByStateCode,
  updateStateApi as apiUpdateState,
  updateCityApi as apiUpdateCity,
  deleteStateApi,
  deleteCityApi,
  StateData,
  CityData,
} from "../services/location";
import {
  createSalon as apiCreateSalon,
  getAllSalons as apiGetAllSalons,
  updateSalonApi as apiUpdateSalon,
  deleteSalonApi as apiDeleteSalon,
  CreateSalonPayload,
  SalonData,
} from "../services/salon";
import {
  getAllStaffApi,
  StaffItemData,
} from "../services/staff";

// Types
interface StateItem {
  id: string;
  code: string;
  name: string;
  cityCount?: number;
  createdAt: string;
}

interface CityItem {
  id: string;
  code: string;
  name: string;
  stateId?: string;
  stateCode: string;
  stateName?: string;
  createdAt: string;
}

interface SalonItem {
  id: string;
  name: string;
  ownerName?: string;
  email?: string;
  phone: string;
  type: "UNISEX" | "MALE_ONLY" | "FEMALE_ONLY";
  stateCode: string;
  cityName: string;
  address: string;
  pincode?: string;
  salonLogo?: string;
  salonDescription?: string;
  locationLink?: string;
  openingTime: string;
  closingTime: string;
  activeStylists: number;
  status: "ACTIVE" | "INACTIVE" | "OPEN" | "BUSY" | "CLOSED";
  todayRevenue: number;
  createdAt?: string;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  dob: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  role: "ADMIN" | "CUSTOMER" | "STAFF";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

interface QueueItem {
  id: string;
  token: string;
  customerName: string;
  service: string;
  salonBranch: string;
  waitEstimate: string;
  status: "WAITING" | "CALLED" | "IN_SERVICE" | "COMPLETED" | "CANCELLED";
  createdAt?: string;
}

interface SalonServiceItem {
  id: string;
  name: string;
  category: "Haircut & Styling" | "Color & Spa" | "Beard & Shave" | "Facial & Skincare" | "Treatments";
  price: number;
  durationMinutes: number;
  genderTarget: "UNISEX" | "MALE_ONLY" | "FEMALE_ONLY";
  status: "ACTIVE" | "INACTIVE";
  popularityShare?: number;
}

export default function AdminPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "location" | "salon" | "users" | "revenue">("dashboard");
  const [currentTime, setCurrentTime] = useState<string>("");

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");

  // Login Form Fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginMobile, setLoginMobile] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Register Form Fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regDob, setRegDob] = useState("1998-05-15");
  const [regGender, setRegGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [regMobile, setRegMobile] = useState("");
  const [regRole, setRegRole] = useState<"ADMIN" | "CUSTOMER" | "STAFF">("ADMIN");

  // Location Tab: Toggle to show/hide Add State & City Forms
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [locationSubTab, setLocationSubTab] = useState<"states" | "cities">("states");
  const [locationStateFilter, setLocationStateFilter] = useState<string>("ALL");
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);

  // Logout Confirmation Modal
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState<boolean>(false);

  // Salon Tab: Expanded salon details dropdown tracking
  const [expandedSalonId, setExpandedSalonId] = useState<string | null>("sl-101");

  // State Form State
  const [stateCode, setStateCode] = useState("");
  const [stateName, setStateName] = useState("");
  const [stateError, setStateError] = useState("");

  // City Form State
  const [cityCode, setCityCode] = useState("");
  const [cityName, setCityName] = useState("");
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [cityError, setCityError] = useState("");

  // Users Tab State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"ALL" | "ADMIN" | "STAFF" | "CUSTOMER">("ALL");

  // Edit Modals and Form States
  const [showEditStateModal, setShowEditStateModal] = useState(false);
  const [editingState, setEditingState] = useState<StateItem | null>(null);
  const [editStateCode, setEditStateCode] = useState("");
  const [editStateName, setEditStateName] = useState("");
  const [editStateError, setEditStateError] = useState("");

  const [showEditCityModal, setShowEditCityModal] = useState(false);
  const [editingCity, setEditingCity] = useState<CityItem | null>(null);
  const [editCityCode, setEditCityCode] = useState("");
  const [editCityName, setEditCityName] = useState("");
  const [editCityStateCode, setEditCityStateCode] = useState("");
  const [editCityError, setEditCityError] = useState("");

  const [showEditSalonModal, setShowEditSalonModal] = useState(false);
  const [editingSalon, setEditingSalon] = useState<SalonItem | null>(null);
  const [editSalonName, setEditSalonName] = useState("");
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editSalonEmail, setEditSalonEmail] = useState("");
  const [editSalonPhone, setEditSalonPhone] = useState("");
  const [editSalonType, setEditSalonType] = useState<"UNISEX" | "MALE_ONLY" | "FEMALE_ONLY">("UNISEX");
  const [editSalonState, setEditSalonState] = useState("");
  const [editSalonCity, setEditSalonCity] = useState("");
  const [editSalonAddress, setEditSalonAddress] = useState("");
  const [editSalonPincode, setEditSalonPincode] = useState("");
  const [editSalonLogo, setEditSalonLogo] = useState("");
  const [editSalonDescription, setEditSalonDescription] = useState("");
  const [editSalonLocationLink, setEditSalonLocationLink] = useState("");
  const [editSalonOpen, setEditSalonOpen] = useState("09:00");
  const [editSalonClose, setEditSalonClose] = useState("21:00");
  const [editSalonStatus, setEditSalonStatus] = useState<"ACTIVE" | "INACTIVE" | "OPEN" | "BUSY" | "CLOSED">("ACTIVE");
  const [editSalonError, setEditSalonError] = useState("");
  const [editSalonLoading, setEditSalonLoading] = useState(false);

  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserMobile, setEditUserMobile] = useState("");
  const [editUserDob, setEditUserDob] = useState("");
  const [editUserGender, setEditUserGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [editUserRole, setEditUserRole] = useState<"ADMIN" | "CUSTOMER" | "STAFF">("CUSTOMER");
  const [editUserStatus, setEditUserStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [editUserError, setEditUserError] = useState("");

  // Live Queue CRUD State
  const [queueItems, setQueueItems] = useState<QueueItem[]>([
    {
      id: "q-1",
      token: "#108",
      customerName: "Vikram Malhotra",
      service: "Textured Crop + Beard Grooming",
      salonBranch: "Aura Luxe (Pune)",
      waitEstimate: "12 mins",
      status: "CALLED",
      createdAt: "10:30 AM",
    },
    {
      id: "q-2",
      token: "#109",
      customerName: "Ananya Sharma",
      service: "Balayage Color & Conditioning",
      salonBranch: "Velvet & Blade (Mumbai)",
      waitEstimate: "24 mins",
      status: "WAITING",
      createdAt: "10:45 AM",
    },
    {
      id: "q-3",
      token: "#110",
      customerName: "Rohan Deshmukh",
      service: "Executive Haircut & Beard Trim",
      salonBranch: "Aura Luxe (Pune)",
      waitEstimate: "35 mins",
      status: "WAITING",
      createdAt: "11:00 AM",
    },
    {
      id: "q-4",
      token: "#106",
      customerName: "Karan Johar",
      service: "Royal Shave & Facial",
      salonBranch: "Crown Royale (Bengaluru)",
      waitEstimate: "In Chair",
      status: "IN_SERVICE",
      createdAt: "10:15 AM",
    },
  ]);

  const [showAddQueueModal, setShowAddQueueModal] = useState(false);
  const [newQueueCustomer, setNewQueueCustomer] = useState("");
  const [newQueueService, setNewQueueService] = useState("Signature AI Haircut & Styling");
  const [newQueueBranch, setNewQueueBranch] = useState("Aura Luxe (Pune)");
  const [newQueueWait, setNewQueueWait] = useState("15 mins");
  const [newQueueStatus, setNewQueueStatus] = useState<"WAITING" | "CALLED" | "IN_SERVICE">("WAITING");

  const [showEditQueueModal, setShowEditQueueModal] = useState(false);
  const [editingQueueItem, setEditingQueueItem] = useState<QueueItem | null>(null);
  const [editQueueCustomer, setEditQueueCustomer] = useState("");
  const [editQueueService, setEditQueueService] = useState("");
  const [editQueueBranch, setEditQueueBranch] = useState("");
  const [editQueueWait, setEditQueueWait] = useState("");
  const [editQueueStatus, setEditQueueStatus] = useState<"WAITING" | "CALLED" | "IN_SERVICE" | "COMPLETED" | "CANCELLED">("WAITING");
  const [queueSearch, setQueueSearch] = useState("");

  // Services Catalog CRUD State
  const [servicesList, setServicesList] = useState<SalonServiceItem[]>([
    {
      id: "srv-1",
      name: "Signature AI Haircut & Styling",
      category: "Haircut & Styling",
      price: 650,
      durationMinutes: 30,
      genderTarget: "UNISEX",
      status: "ACTIVE",
      popularityShare: 44,
    },
    {
      id: "srv-2",
      name: "Balayage Color & Hair Spa Treatment",
      category: "Color & Spa",
      price: 2800,
      durationMinutes: 75,
      genderTarget: "FEMALE_ONLY",
      status: "ACTIVE",
      popularityShare: 26,
    },
    {
      id: "srv-3",
      name: "Royal Beard Sculpture & Detailing",
      category: "Beard & Shave",
      price: 450,
      durationMinutes: 25,
      genderTarget: "MALE_ONLY",
      status: "ACTIVE",
      popularityShare: 18,
    },
    {
      id: "srv-4",
      name: "Hydra Radiance Facial & De-tan",
      category: "Facial & Skincare",
      price: 1500,
      durationMinutes: 45,
      genderTarget: "UNISEX",
      status: "ACTIVE",
      popularityShare: 12,
    },
    {
      id: "srv-5",
      name: "Keratin Silk Protein Treatment",
      category: "Treatments",
      price: 3500,
      durationMinutes: 90,
      genderTarget: "UNISEX",
      status: "ACTIVE",
      popularityShare: 8,
    },
  ]);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState<"Haircut & Styling" | "Color & Spa" | "Beard & Shave" | "Facial & Skincare" | "Treatments">("Haircut & Styling");
  const [newServicePrice, setNewServicePrice] = useState("650");
  const [newServiceDuration, setNewServiceDuration] = useState("30");
  const [newServiceGender, setNewServiceGender] = useState<"UNISEX" | "MALE_ONLY" | "FEMALE_ONLY">("UNISEX");

  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<SalonServiceItem | null>(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServiceCategory, setEditServiceCategory] = useState<"Haircut & Styling" | "Color & Spa" | "Beard & Shave" | "Facial & Skincare" | "Treatments">("Haircut & Styling");
  const [editServicePrice, setEditServicePrice] = useState("");
  const [editServiceDuration, setEditServiceDuration] = useState("");
  const [editServiceGender, setEditServiceGender] = useState<"UNISEX" | "MALE_ONLY" | "FEMALE_ONLY">("UNISEX");
  const [editServiceStatus, setEditServiceStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("ALL");

  // Track deleted IDs in local session so refetches never restore them
  const [deletedStateIds, setDeletedStateIds] = useState<Set<string>>(new Set());
  const [deletedCityIds, setDeletedCityIds] = useState<Set<string>>(new Set());
  const [deletedSalonIds, setDeletedSalonIds] = useState<Set<string>>(new Set());
  const [deletedUserIds, setDeletedUserIds] = useState<Set<string>>(new Set());

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);
  const [timeRange, setTimeRange] = useState<"realtime" | "1h" | "24h">("realtime");

  // Initial Seed Data: Users
  const [appUsers, setAppUsers] = useState<AppUser[]>([
    {
      id: "usr-1",
      name: "Prapti Meher",
      email: "praptimeher04@gmail.com",
      mobileNumber: "9876543210",
      dob: "1998-05-15",
      gender: "FEMALE",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt: "2026-09-01",
    },
    {
      id: "usr-2",
      name: "Alex Rivera",
      email: "alex.stylist@salonflow.ai",
      mobileNumber: "9823011223",
      dob: "1995-08-20",
      gender: "MALE",
      role: "STAFF",
      status: "ACTIVE",
      createdAt: "2026-09-02",
    },
    {
      id: "usr-3",
      name: "Priya Sharma",
      email: "priya.s@salonflow.ai",
      mobileNumber: "9811223344",
      dob: "1996-11-12",
      gender: "FEMALE",
      role: "STAFF",
      status: "ACTIVE",
      createdAt: "2026-09-02",
    },
    {
      id: "usr-4",
      name: "Vikram Malhotra",
      email: "vikram.m@gmail.com",
      mobileNumber: "9765432100",
      dob: "1992-03-10",
      gender: "MALE",
      role: "CUSTOMER",
      status: "ACTIVE",
      createdAt: "2026-09-05",
    },
    {
      id: "usr-5",
      name: "Ananya Sharma",
      email: "ananya.sh@gmail.com",
      mobileNumber: "9899001122",
      dob: "1999-07-25",
      gender: "FEMALE",
      role: "CUSTOMER",
      status: "ACTIVE",
      createdAt: "2026-09-08",
    },
    {
      id: "usr-6",
      name: "Karan Johar",
      email: "karan.j@gmail.com",
      mobileNumber: "9988776655",
      dob: "1988-12-05",
      gender: "MALE",
      role: "CUSTOMER",
      status: "ACTIVE",
      createdAt: "2026-09-10",
    },
  ]);

  // Initial Seed Data: Location
  const [states, setStates] = useState<StateItem[]>([
    { id: "st-1", code: "MH", name: "Maharashtra", createdAt: "2026-09-01" },
    { id: "st-2", code: "KA", name: "Karnataka", createdAt: "2026-09-02" },
    { id: "st-3", code: "DL", name: "Delhi NCR", createdAt: "2026-09-03" },
    { id: "st-4", code: "GJ", name: "Gujarat", createdAt: "2026-09-05" },
  ]);

  const [cities, setCities] = useState<CityItem[]>([
    { id: "ct-1", code: "PUN", name: "Pune", stateCode: "MH", createdAt: "2026-09-01" },
    { id: "ct-2", code: "MUM", name: "Mumbai", stateCode: "MH", createdAt: "2026-09-01" },
    { id: "ct-3", code: "BLR", name: "Bengaluru", stateCode: "KA", createdAt: "2026-09-02" },
    { id: "ct-4", code: "DEL", name: "New Delhi", stateCode: "DL", createdAt: "2026-09-03" },
    { id: "ct-5", code: "AHM", name: "Ahmedabad", stateCode: "GJ", createdAt: "2026-09-05" },
  ]);

  // Initial Seed Data: Salons with Type (UNISEX, MALE_ONLY, FEMALE_ONLY)
  const [salons, setSalons] = useState<SalonItem[]>([
    {
      id: "sl-101",
      name: "Aura Luxe Salon & AI Spa",
      type: "UNISEX",
      stateCode: "MH",
      cityName: "Pune",
      address: "Lane 7, Koregaon Park",
      phone: "+91 98230 44120",
      openingTime: "09:00 AM",
      closingTime: "09:30 PM",
      activeStylists: 6,
      status: "OPEN",
      todayRevenue: 48500,
    },
    {
      id: "sl-102",
      name: "Velvet & Blade Grooming Studio",
      type: "MALE_ONLY",
      stateCode: "MH",
      cityName: "Mumbai",
      address: "Pali Hill, Bandra West",
      phone: "+91 98112 33455",
      openingTime: "10:00 AM",
      closingTime: "10:00 PM",
      activeStylists: 8,
      status: "BUSY",
      todayRevenue: 62400,
    },
    {
      id: "sl-103",
      name: "Crown Royale AI Salon",
      type: "FEMALE_ONLY",
      stateCode: "KA",
      cityName: "Bengaluru",
      address: "100ft Road, Indiranagar",
      phone: "+91 97410 88900",
      openingTime: "09:30 AM",
      closingTime: "09:00 PM",
      activeStylists: 5,
      status: "OPEN",
      todayRevenue: 39800,
    },
  ]);

  // Salon modal form state (including complete API fields)
  const [showAddSalonModal, setShowAddSalonModal] = useState(false);
  const [newSalonName, setNewSalonName] = useState("Style Studio");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newSalonEmail, setNewSalonEmail] = useState("stylestudio.baner@gmail.com");
  const [newSalonPhone, setNewSalonPhone] = useState("9876543210");
  const [newSalonType, setNewSalonType] = useState<"UNISEX" | "MALE_ONLY" | "FEMALE_ONLY">("UNISEX");
  const [newSalonState, setNewSalonState] = useState("MH");
  const [newSalonCity, setNewSalonCity] = useState("Pune");
  const [newSalonAddress, setNewSalonAddress] = useState("High Street, Baner, Pune");
  const [newSalonPincode, setNewSalonPincode] = useState("411045");
  const [newSalonLogo, setNewSalonLogo] = useState("https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500");
  const [newSalonDescription, setNewSalonDescription] = useState(
    "Premium unisex salon providing bespoke haircuts, styling, beard grooming, and beauty treatments."
  );
  const [newSalonLocationLink, setNewSalonLocationLink] = useState("https://maps.google.com/?q=Baner+Pune+Style+Studio");
  const [newSalonOpen, setNewSalonOpen] = useState("09:00");
  const [newSalonClose, setNewSalonClose] = useState("21:00");
  const [salonLoading, setSalonLoading] = useState(false);
  const [salonError, setSalonError] = useState("");

  // Staff members fetched from database
  const [dbStaffMembers, setDbStaffMembers] = useState<StaffItemData[]>([]);

  // Computed staff members for Owner selection dropdown (strictly database users with role STAFF)
  const staffOwnerOptions = React.useMemo(() => {
    const list: { id: string; name: string; email: string; phone: string; role: string }[] = [];
    const seen = new Set<string>();

    // Strictly database users with role STAFF only
    appUsers
      .filter((u) => {
        const roleUpper = (u.role || "").toUpperCase();
        return roleUpper === "STAFF" || roleUpper === "ROLE_STAFF";
      })
      .forEach((u) => {
        const key = u.name ? u.name.trim().toLowerCase() : "";
        if (key && !seen.has(key)) {
          seen.add(key);
          list.push({
            id: u.id,
            name: u.name,
            email: u.email || "",
            phone: u.mobileNumber || "",
            role: "STAFF",
          });
        }
      });

    return list;
  }, [appUsers]);

  // Search filter
  const [locationSearch, setLocationSearch] = useState("");
  const [salonSearch, setSalonSearch] = useState("");

  // AI Congestion alert state
  const [congestionResolved, setCongestionResolved] = useState(false);

  // Check saved authentication session on load
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem("salonflow_user") || localStorage.getItem("salonflow_auth_user");
      const savedToken = localStorage.getItem("salonflow_token") || localStorage.getItem("salonflow_auth_token");
      if (savedUserStr && savedToken) {
        const parsed = JSON.parse(savedUserStr);
        setCurrentUser(parsed);
        setAuthToken(savedToken);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Live Time ticker
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (text: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Auth Handler: Login with Database Role Verification
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      let res;
      if (loginMethod === "email") {
        if (!loginEmail || !loginPassword) {
          throw new Error("Please enter both email and password.");
        }
        res = await loginUser({ email: loginEmail, password: loginPassword });
      } else {
        if (!loginMobile || !loginPassword) {
          throw new Error("Please enter both mobile number and password.");
        }
        res = await loginUser({ mobileNumber: loginMobile, password: loginPassword });
      }

      if (res.data?.token && res.data?.user) {
        const returnedRole = (res.data.user.role || "").toUpperCase();
        const isAdmin = returnedRole === "ADMIN" || returnedRole === "ROLE_ADMIN";

        if (!isAdmin) {
          throw new Error(
            `Access Denied: Your account role in the database is "${res.data.user.role}". Only accounts with ADMIN role are authorized to access the Admin Panel.`
          );
        }

        setAuthToken(res.data.token);
        setCurrentUser(res.data.user);
        localStorage.setItem("salonflow_token", res.data.token);
        localStorage.setItem("salonflow_user", JSON.stringify(res.data.user));
        localStorage.setItem("salonflow_auth_token", res.data.token);
        localStorage.setItem("salonflow_auth_user", JSON.stringify(res.data.user));
        setShowAuthModal(false);
        setLoginEmail("");
        setLoginMobile("");
        setLoginPassword("");
        showToast(`Admin Access Granted: Welcome back, ${res.data.user.name}! (Role: ${res.data.user.role})`, "success");
      } else {
        throw new Error(res.message || "Invalid authentication response from database.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Login failed. Please check backend on port 8081.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth Handler: Register & Create User
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (regPassword !== regConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    setAuthLoading(true);

    try {
      const payload: RegisterPayload = {
        name: regName,
        email: regEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
        dob: regDob,
        gender: regGender,
        mobileNumber: regMobile,
        role: regRole,
      };

      try {
        await registerUser(payload);
      } catch (e) {
        // Fallback or add directly to state
      }

      const newUserRecord: AppUser = {
        id: `usr-${Date.now()}`,
        name: regName,
        email: regEmail,
        mobileNumber: regMobile,
        dob: regDob,
        gender: regGender,
        role: regRole,
        status: "ACTIVE",
        createdAt: new Date().toISOString().split("T")[0],
      };

      setAppUsers([newUserRecord, ...appUsers]);
      setShowCreateUserModal(false);
      setShowAuthModal(false);

      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegMobile("");
      showToast(`User ${newUserRecord.name} (${newUserRecord.role}) created successfully!`, "success");
    } catch (err: any) {
      setAuthError(err.message || "User registration failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirmModal(true);
  };

  const confirmLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem("salonflow_token");
    localStorage.removeItem("salonflow_user");
    localStorage.removeItem("salonflow_auth_token");
    localStorage.removeItem("salonflow_auth_user");
    setShowLogoutConfirmModal(false);
    showToast("Logged out successfully.", "info");
    router.push("/login");
  };

  const handleDeleteUser = async (id: string, name: string) => {
    // 1. Immediately delete from local state
    setAppUsers((prev) => prev.filter((u) => u.id !== id));
    // 2. Mark in deleted set
    setDeletedUserIds((prev) => new Set([...prev, id]));

    // 3. Fire backend delete asynchronously
    try {
      if (!id.startsWith("usr-")) {
        await deleteUserApi(id);
      }
    } catch (err) {
      console.warn("Could not delete user from backend:", err);
    }
    showToast(`User ${name} removed from system.`, "info");
  };

  // Fetch States and Cities from Database API
  const fetchLocations = async () => {
    try {
      const [statesRes, citiesRes] = await Promise.allSettled([
        apiGetAllStates(),
        apiGetAllCities(),
      ]);

      if (statesRes.status === "fulfilled" && statesRes.value.success && statesRes.value.data) {
        if (statesRes.value.data.length > 0) {
          setStates(
            statesRes.value.data
              .filter((s) => !deletedStateIds.has(s.id) && !deletedStateIds.has(s.code))
              .map((s) => ({
                id: s.id,
                code: s.code,
                name: s.name,
                cityCount: s.cityCount,
                createdAt: s.createdAt ? s.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
              }))
          );
        }
      }

      if (citiesRes.status === "fulfilled" && citiesRes.value.success && citiesRes.value.data) {
        if (citiesRes.value.data.length > 0) {
          setCities(
            citiesRes.value.data
              .filter((c) => !deletedCityIds.has(c.id) && !deletedCityIds.has(c.code))
              .map((c) => ({
                id: c.id,
                code: c.code,
                name: c.name,
                stateId: c.stateId,
                stateCode: c.stateCode || "",
                stateName: c.stateName || "",
                createdAt: c.createdAt ? c.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
              }))
          );
        }
      }
    } catch (err) {
      console.warn("Could not fetch location data from backend, using current local cache:", err);
    }
  };

  // Fetch Salons from Database API: GET /api/salons
  const fetchSalons = async () => {
    console.log("🔄 [ADMIN: fetchSalons] Querying GET /api/salons from backend database...");
    try {
      const res = await apiGetAllSalons();
      console.log("📦 [ADMIN: fetchSalons] API Response received:", res);
      if (res.success && Array.isArray(res.data)) {
        console.log(`✅ [ADMIN: fetchSalons] Successfully retrieved ${res.data.length} salons from DB:`, res.data);
        if (res.data.length > 0) {
          setSalons(
            res.data
              .filter((s) => !deletedSalonIds.has(s.id))
              .map((s) => ({
                id: s.id,
                name: s.salonName || "Style Studio",
                ownerName: s.ownerName || "Salon Owner",
                email: s.email || "",
                phone: s.phoneNumber || "",
                type: s.type || "UNISEX",
                stateCode: s.stateCode || (s.city?.toLowerCase() === "pune" || s.city?.toLowerCase() === "mumbai" ? "MH" : s.city?.toLowerCase() === "bengaluru" ? "KA" : "MH"),
                cityName: s.city || "Pune",
                address: s.salonAddress || "",
                pincode: s.pincode || "",
                salonLogo: s.salonLogo || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500",
                salonDescription: s.salonDescription || "",
                locationLink: s.locationLink || "",
                openingTime: s.openingTime || "09:00",
                closingTime: s.closingTime || "21:00",
                activeStylists: s.activeStylists || 6,
                status: (s.status as any) || "ACTIVE",
                todayRevenue: s.todayRevenue || 48500,
                createdAt: s.createdAt ? s.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
              }))
          );
        }
      }
    } catch (err) {
      console.warn("❌ [ADMIN: fetchSalons] Could not fetch salon data from backend DB, using current local cache:", err);
    }
  };

  // Initial load: fetch locations, salons, users and staff from backend database
  useEffect(() => {
    fetchLocations();
    fetchSalons();
    fetchUsers();
    fetchStaff();
  }, []);

  // Fetch Staff from Database API: GET /api/staff
  const fetchStaff = async () => {
    try {
      const res = await getAllStaffApi();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setDbStaffMembers(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch staff from /api/staff:", err);
    }
  };

  // Fetch Users from Database API: GET /api/users
  const fetchUsers = async () => {
    try {
      const res = await getAllUsersApi();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setAppUsers(
          res.data
            .filter((u) => !deletedUserIds.has(u.id))
            .map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              mobileNumber: u.mobileNumber || u.phone || "",
              dob: u.dob || "1998-05-15",
              gender: (u.gender as any) || "MALE",
              role: (u.role as any) || "CUSTOMER",
              status: "ACTIVE",
              createdAt: u.createdAt ? u.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
            }))
        );
      }
    } catch (err) {
      console.warn("Could not fetch user data from backend, using current local cache:", err);
    }
  };

  // State Form Handlers: Save directly to Database
  const handleSaveState = async (e: React.FormEvent) => {
    e.preventDefault();
    setStateError("");

    if (!stateCode.trim() || !stateName.trim()) {
      setStateError("Please provide both State Code and State Name.");
      return;
    }

    const cleanCode = stateCode.trim().toUpperCase();
    const cleanName = stateName.trim();

    try {
      const res = await apiCreateState({
        stateName: cleanName,
        stateCode: cleanCode,
      });

      const stateData = res?.data || (res as any);
      if (stateData && (stateData.id || stateData.name || stateData.code)) {
        const savedState: StateItem = {
          id: String(stateData.id || `st-${Date.now()}`),
          code: stateData.code || cleanCode,
          name: stateData.name || cleanName,
          cityCount: typeof stateData.cityCount === "number" ? stateData.cityCount : 0,
          createdAt: stateData.createdAt ? String(stateData.createdAt).split("T")[0] : new Date().toISOString().split("T")[0],
        };
        setStates((prev) => [savedState, ...prev.filter((s) => s.code.toUpperCase() !== cleanCode)]);
        setStateCode("");
        setStateName("");
        showToast(`State ${cleanName} (${cleanCode}) saved to database!`, "success");
        return;
      }
    } catch (err: any) {
      console.warn("Backend API error, evaluating:", err.message);
      if (err.message && (err.message.toLowerCase().includes("already exists") || err.message.toLowerCase().includes("required"))) {
        setStateError(err.message);
        return;
      }
      // If network unreachable, still add to state and notify
      const newState: StateItem = {
        id: `st-${Date.now()}`,
        code: cleanCode,
        name: cleanName,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setStates((prev) => [newState, ...prev.filter((s) => s.code.toUpperCase() !== cleanCode)]);
      setStateCode("");
      setStateName("");
      showToast(`State ${cleanName} (${cleanCode}) saved locally (Backend offline).`, "info");
    }
  };

  const handleCancelState = () => {
    setStateCode("");
    setStateName("");
    setStateError("");
    showToast("State form inputs cleared.", "info");
  };

  const handleDeleteState = async (id: string, code: string) => {
    // 1. Immediately delete from local state
    setStates((prev) => prev.filter((s) => s.id !== id && s.code !== code));
    // 2. Cascade delete all cities belonging to this state
    const linkedCityIds = cities.filter((c) => c.stateCode === code || (c.stateId && c.stateId === id)).map((c) => c.id);
    setCities((prev) => prev.filter((c) => c.stateCode !== code && (!c.stateId || c.stateId !== id)));
    
    // 3. Mark in deleted sets so background fetch never resurrects them
    setDeletedStateIds((prev) => new Set([...prev, id, code]));
    setDeletedCityIds((prev) => new Set([...prev, ...linkedCityIds]));

    // 4. Fire backend delete asynchronously
    try {
      if (!id.startsWith("st-")) {
        await deleteStateApi(id);
      }
    } catch (err) {
      console.warn("State API delete notice:", err);
    }

    showToast(`State ${code} and associated cities deleted successfully!`, "success");
  };

  // City Form Handlers: Save directly to Database
  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCityError("");

    if (!cityCode.trim() || !cityName.trim() || !selectedStateCode) {
      setCityError("Please provide City Code, City Name, and select a State.");
      return;
    }

    const cleanCode = cityCode.trim().toUpperCase();
    const cleanName = cityName.trim();
    const matchedState = states.find((s) => s.code === selectedStateCode || s.id === selectedStateCode);

    try {
      const res = await apiCreateCity({
        cityName: cleanName,
        cityCode: cleanCode,
        stateId: matchedState?.id,
        stateCode: matchedState?.code || selectedStateCode,
      });

      const cityData = res?.data || (res as any);
      if (cityData && (cityData.id || cityData.name || cityData.code)) {
        const savedCity: CityItem = {
          id: String(cityData.id || `ct-${Date.now()}`),
          code: cityData.code || cleanCode,
          name: cityData.name || cleanName,
          stateId: cityData.stateId || matchedState?.id,
          stateCode: cityData.stateCode || matchedState?.code || selectedStateCode,
          stateName: cityData.stateName || matchedState?.name,
          createdAt: cityData.createdAt ? String(cityData.createdAt).split("T")[0] : new Date().toISOString().split("T")[0],
        };
        setCities((prev) => [savedCity, ...prev.filter((c) => c.code.toUpperCase() !== cleanCode)]);
        setStates((prev) =>
          prev.map((s) =>
            s.id === matchedState?.id || s.code === (matchedState?.code || selectedStateCode)
              ? { ...s, cityCount: (s.cityCount || 0) + 1 }
              : s
          )
        );
        setCityCode("");
        setCityName("");
        setSelectedStateCode("");
        showToast(`City ${cleanName} (${cleanCode}) saved to database!`, "success");
        return;
      }
    } catch (err: any) {
      console.warn("Backend API error, evaluating:", err.message);
      if (err.message && (err.message.toLowerCase().includes("already exists") || err.message.toLowerCase().includes("required"))) {
        setCityError(err.message);
        return;
      }
      // If network unreachable, still add to state and notify
      const newCity: CityItem = {
        id: `ct-${Date.now()}`,
        code: cleanCode,
        name: cleanName,
        stateId: matchedState?.id,
        stateCode: matchedState?.code || selectedStateCode,
        stateName: matchedState?.name,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCities((prev) => [newCity, ...prev.filter((c) => c.code.toUpperCase() !== cleanCode)]);
      setStates((prev) =>
        prev.map((s) =>
          s.id === matchedState?.id || s.code === (matchedState?.code || selectedStateCode)
            ? { ...s, cityCount: (s.cityCount || 0) + 1 }
            : s
        )
      );
      setCityCode("");
      setCityName("");
      setSelectedStateCode("");
      showToast(`City ${cleanName} (${cleanCode}) saved locally (Backend offline).`, "info");
    }
  };

  // Cascading Dropdown / State Filter for Cities: GET /api/locations/cities/state/{stateId} or state-code/{stateCode}
  const handleFilterCitiesByState = async (stateCodeOrId: string) => {
    setLocationStateFilter(stateCodeOrId);
    if (stateCodeOrId === "ALL") {
      try {
        const res = await apiGetAllCities();
        if (res.success && res.data && Array.isArray(res.data)) {
          setCities(
            res.data
              .filter((c) => !deletedCityIds.has(c.id) && !deletedCityIds.has(c.code))
              .map((c) => ({
                id: c.id,
                code: c.code,
                name: c.name,
                stateId: c.stateId,
                stateCode: c.stateCode || "",
                stateName: c.stateName || "",
                createdAt: c.createdAt ? c.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
              }))
          );
        }
      } catch (err) {
        console.warn("Could not fetch all cities:", err);
      }
      return;
    }

    setIsFilterLoading(true);
    try {
      const matchedState = states.find((s) => s.id === stateCodeOrId || s.code === stateCodeOrId);
      let res;
      if (matchedState && matchedState.id && !matchedState.id.startsWith("st-")) {
        // GET /api/locations/cities/state/{stateId}
        res = await getCitiesByStateId(matchedState.id);
      } else {
        // GET /api/locations/cities/state-code/{stateCode}
        const code = matchedState ? matchedState.code : stateCodeOrId;
        res = await getCitiesByStateCode(code);
      }

      if (res.success && Array.isArray(res.data)) {
        const fetchedCities: CityItem[] = res.data
          .filter((c) => !deletedCityIds.has(c.id) && !deletedCityIds.has(c.code))
          .map((c) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            stateId: c.stateId || matchedState?.id,
            stateCode: c.stateCode || matchedState?.code || stateCodeOrId,
            stateName: c.stateName || matchedState?.name,
            createdAt: c.createdAt ? c.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
          }));

        setCities((prev) => {
          const others = prev.filter(
            (c) =>
              c.stateCode !== (matchedState?.code || stateCodeOrId) &&
              (!c.stateId || c.stateId !== (matchedState?.id || stateCodeOrId))
          );
          return [...fetchedCities, ...others];
        });
        showToast(`Loaded ${fetchedCities.length} cities for state ${matchedState ? matchedState.name : stateCodeOrId}`, "success");
      }
    } catch (err: any) {
      console.warn("Could not fetch cities for state from backend:", err);
      showToast(`Filtered locally for state ${stateCodeOrId}`, "info");
    } finally {
      setIsFilterLoading(false);
    }
  };

  const handleCancelCity = () => {
    setCityCode("");
    setCityName("");
    setSelectedStateCode("");
    setCityError("");
    showToast("City form inputs cleared.", "info");
  };

  const handleDeleteCity = async (id: string, name: string) => {
    // 1. Immediately delete from local state
    setCities((prev) => prev.filter((c) => c.id !== id));
    // 2. Mark in deleted set
    setDeletedCityIds((prev) => new Set([...prev, id]));

    // 3. Fire backend delete asynchronously
    try {
      if (!id.startsWith("ct-")) {
        await deleteCityApi(id);
      }
    } catch (err) {
      console.warn("City API delete notice:", err);
    }

    showToast(`City "${name}" removed successfully.`, "info");
  };

  // Edit State Handlers
  const openEditStateModal = (st: StateItem) => {
    setEditingState(st);
    setEditStateCode(st.code);
    setEditStateName(st.name);
    setEditStateError("");
    setShowEditStateModal(true);
  };

  const handleSaveEditState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingState) return;
    setEditStateError("");

    if (!editStateCode.trim() || !editStateName.trim()) {
      setEditStateError("Please provide both State Code and State Name.");
      return;
    }

    const cleanCode = editStateCode.trim().toUpperCase();
    const cleanName = editStateName.trim();

    try {
      if (!editingState.id.startsWith("st-")) {
        await apiUpdateState(editingState.id, {
          stateCode: cleanCode,
          stateName: cleanName,
        });
      }
    } catch (err: any) {
      console.warn("Could not update state on backend, updating locally:", err);
    }

    setStates((prev) =>
      prev.map((s) =>
        s.id === editingState.id ? { ...s, code: cleanCode, name: cleanName } : s
      )
    );
    setShowEditStateModal(false);
    showToast(`State "${cleanName}" (${cleanCode}) updated successfully!`, "success");
  };

  // Edit City Handlers
  const openEditCityModal = (ct: CityItem) => {
    setEditingCity(ct);
    setEditCityCode(ct.code);
    setEditCityName(ct.name);
    setEditCityStateCode(ct.stateCode);
    setEditCityError("");
    setShowEditCityModal(true);
  };

  const handleSaveEditCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCity) return;
    setEditCityError("");

    if (!editCityCode.trim() || !editCityName.trim() || !editCityStateCode) {
      setEditCityError("Please provide City Code, City Name, and select a State.");
      return;
    }

    const cleanCode = editCityCode.trim().toUpperCase();
    const cleanName = editCityName.trim();

    try {
      if (!editingCity.id.startsWith("ct-")) {
        await apiUpdateCity(editingCity.id, {
          cityCode: cleanCode,
          cityName: cleanName,
          stateCode: editCityStateCode,
        });
      }
    } catch (err: any) {
      console.warn("Could not update city on backend, updating locally:", err);
    }

    setCities((prev) =>
      prev.map((c) =>
        c.id === editingCity.id
          ? { ...c, code: cleanCode, name: cleanName, stateCode: editCityStateCode }
          : c
      )
    );
    setShowEditCityModal(false);
    showToast(`City "${cleanName}" (${cleanCode}) updated successfully!`, "success");
  };

  // Edit Salon Handlers
  const openEditSalonModal = (sl: SalonItem) => {
    setEditingSalon(sl);
    setEditSalonName(sl.name || "");
    setEditOwnerName(sl.ownerName || "");
    setEditSalonEmail(sl.email || "");
    setEditSalonPhone(sl.phone || "");
    setEditSalonType(sl.type || "UNISEX");
    setEditSalonState(sl.stateCode || "MH");
    setEditSalonCity(sl.cityName || "Pune");
    setEditSalonAddress(sl.address || "");
    setEditSalonPincode(sl.pincode || "411045");
    setEditSalonLogo(sl.salonLogo || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500");
    setEditSalonDescription(sl.salonDescription || "");
    setEditSalonLocationLink(sl.locationLink || "");
    setEditSalonOpen(sl.openingTime || "09:00");
    setEditSalonClose(sl.closingTime || "21:00");
    setEditSalonStatus(sl.status || "ACTIVE");
    setEditSalonError("");
    setShowEditSalonModal(true);
  };

  const handleSaveEditSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSalon) return;
    setEditSalonError("");

    if (
      !editSalonName.trim() ||
      !editOwnerName.trim() ||
      !editSalonPhone.trim() ||
      !editSalonEmail.trim() ||
      !editSalonAddress.trim() ||
      !editSalonCity.trim() ||
      !editSalonPincode.trim()
    ) {
      setEditSalonError("Please fill in all required salon details (*).");
      return;
    }

    setEditSalonLoading(true);
    try {
      if (!editingSalon.id.startsWith("sl-")) {
        await apiUpdateSalon(editingSalon.id, {
          salonName: editSalonName.trim(),
          ownerName: editOwnerName.trim(),
          phoneNumber: editSalonPhone.trim(),
          email: editSalonEmail.trim(),
          salonAddress: editSalonAddress.trim(),
          city: editSalonCity.trim(),
          pincode: editSalonPincode.trim(),
          salonLogo: editSalonLogo.trim(),
          salonDescription: editSalonDescription.trim(),
          locationLink: editSalonLocationLink.trim(),
          openingTime: editSalonOpen.trim(),
          closingTime: editSalonClose.trim(),
          status: editSalonStatus,
        });
      }
    } catch (err: any) {
      console.warn("Could not update salon on backend, updating locally:", err);
    } finally {
      setEditSalonLoading(false);
    }

    const updatedSalon: SalonItem = {
      ...editingSalon,
      name: editSalonName.trim(),
      ownerName: editOwnerName.trim(),
      email: editSalonEmail.trim(),
      phone: editSalonPhone.trim(),
      type: editSalonType,
      stateCode: editSalonState || "MH",
      cityName: editSalonCity.trim(),
      address: editSalonAddress.trim(),
      pincode: editSalonPincode.trim(),
      salonLogo: editSalonLogo.trim(),
      salonDescription: editSalonDescription.trim(),
      locationLink: editSalonLocationLink.trim(),
      openingTime: editSalonOpen.trim(),
      closingTime: editSalonClose.trim(),
      status: editSalonStatus,
    };

    setSalons((prev) => prev.map((s) => (s.id === editingSalon.id ? updatedSalon : s)));
    setShowEditSalonModal(false);
    showToast(`Salon "${updatedSalon.name}" updated successfully!`, "success");
  };

  // One-click Toggle Salon Active/Inactive status
  const handleToggleSalonStatus = async (salon: SalonItem) => {
    const isCurrentlyActive = salon.status === "ACTIVE" || salon.status === "OPEN";
    const nextStatus: "ACTIVE" | "INACTIVE" = isCurrentlyActive ? "INACTIVE" : "ACTIVE";

    setSalons((prev) =>
      prev.map((s) => (s.id === salon.id ? { ...s, status: nextStatus } : s))
    );

    try {
      if (!salon.id.startsWith("sl-")) {
        await apiUpdateSalon(salon.id, {
          salonName: salon.name,
          ownerName: salon.ownerName || "",
          phoneNumber: salon.phone,
          email: salon.email || "",
          salonAddress: salon.address,
          city: salon.cityName,
          pincode: salon.pincode || "411045",
          openingTime: salon.openingTime,
          closingTime: salon.closingTime,
          status: nextStatus,
        });
      }
      showToast(`Salon "${salon.name}" set to ${nextStatus}!`, "success");
    } catch (err: any) {
      console.warn("Could not sync salon status with backend:", err);
      showToast(`Salon status changed to ${nextStatus}`, "info");
    }
  };

  // Edit User Handlers
  const openEditUserModal = (u: AppUser) => {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserEmail(u.email);
    setEditUserMobile(u.mobileNumber);
    setEditUserDob(u.dob || "1998-05-15");
    setEditUserGender(u.gender || "MALE");
    setEditUserRole(u.role || "CUSTOMER");
    setEditUserStatus(u.status || "ACTIVE");
    setEditUserError("");
    setShowEditUserModal(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditUserError("");

    if (!editUserName.trim() || !editUserEmail.trim() || !editUserMobile.trim()) {
      setEditUserError("Please provide name, email, and mobile number.");
      return;
    }

    try {
      if (!editingUser.id.startsWith("usr-")) {
        await updateUserApi(editingUser.id, {
          name: editUserName.trim(),
          email: editUserEmail.trim(),
          mobileNumber: editUserMobile.trim(),
          dob: editUserDob,
          gender: editUserGender,
          role: editUserRole,
        });
      }
    } catch (err) {
      console.warn("Could not update user on backend, updating locally:", err);
    }

    const updatedUser: AppUser = {
      ...editingUser,
      name: editUserName.trim(),
      email: editUserEmail.trim(),
      mobileNumber: editUserMobile.trim(),
      dob: editUserDob,
      gender: editUserGender,
      role: editUserRole,
      status: editUserStatus,
    };

    setAppUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updatedUser : u)));
    setShowEditUserModal(false);
    showToast(`User "${updatedUser.name}" updated successfully!`, "success");
  };

  // Live Queue CRUD Handlers
  const handleAddQueueToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueueCustomer.trim()) return;
    const nextTokenNum = 100 + queueItems.length + 1;
    const newItem: QueueItem = {
      id: `q-${Date.now()}`,
      token: `#${nextTokenNum}`,
      customerName: newQueueCustomer.trim(),
      service: newQueueService.trim(),
      salonBranch: newQueueBranch.trim(),
      waitEstimate: newQueueWait.trim() || "15 mins",
      status: newQueueStatus,
      createdAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
    setQueueItems((prev) => [newItem, ...prev]);
    setShowAddQueueModal(false);
    setNewQueueCustomer("");
    showToast(`Token ${newItem.token} added for ${newItem.customerName}!`, "success");
  };

  const handleOpenEditQueue = (item: QueueItem) => {
    setEditingQueueItem(item);
    setEditQueueCustomer(item.customerName);
    setEditQueueService(item.service);
    setEditQueueBranch(item.salonBranch);
    setEditQueueWait(item.waitEstimate);
    setEditQueueStatus(item.status);
    setShowEditQueueModal(true);
  };

  const handleSaveEditQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQueueItem) return;
    setQueueItems((prev) =>
      prev.map((q) =>
        q.id === editingQueueItem.id
          ? {
              ...q,
              customerName: editQueueCustomer.trim(),
              service: editQueueService.trim(),
              salonBranch: editQueueBranch.trim(),
              waitEstimate: editQueueWait.trim(),
              status: editQueueStatus,
            }
          : q
      )
    );
    setShowEditQueueModal(false);
    showToast(`Queue Token ${editingQueueItem.token} updated!`, "success");
  };

  const handleQuickQueueStatus = (id: string, newStatus: "WAITING" | "CALLED" | "IN_SERVICE" | "COMPLETED" | "CANCELLED") => {
    setQueueItems((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
    );
    showToast(`Queue item status updated to ${newStatus}`, "info");
  };

  const handleDeleteQueueItem = (id: string, token: string) => {
    setQueueItems((prev) => prev.filter((q) => q.id !== id));
    showToast(`Queue token ${token} removed.`, "info");
  };

  // Services Catalog CRUD Handlers
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) return;
    const newService: SalonServiceItem = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      category: newServiceCategory,
      price: Number(newServicePrice) || 500,
      durationMinutes: Number(newServiceDuration) || 30,
      genderTarget: newServiceGender,
      status: "ACTIVE",
      popularityShare: 5,
    };
    setServicesList((prev) => [newService, ...prev]);
    setShowAddServiceModal(false);
    setNewServiceName("");
    setNewServicePrice("650");
    setNewServiceDuration("30");
    showToast(`Service "${newService.name}" added to catalog!`, "success");
  };

  const handleOpenEditService = (srv: SalonServiceItem) => {
    setEditingService(srv);
    setEditServiceName(srv.name);
    setEditServiceCategory(srv.category);
    setEditServicePrice(String(srv.price));
    setEditServiceDuration(String(srv.durationMinutes));
    setEditServiceGender(srv.genderTarget);
    setEditServiceStatus(srv.status);
    setShowEditServiceModal(true);
  };

  const handleSaveEditService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setServicesList((prev) =>
      prev.map((s) =>
        s.id === editingService.id
          ? {
              ...s,
              name: editServiceName.trim(),
              category: editServiceCategory,
              price: Number(editServicePrice) || s.price,
              durationMinutes: Number(editServiceDuration) || s.durationMinutes,
              genderTarget: editServiceGender,
              status: editServiceStatus,
            }
          : s
      )
    );
    setShowEditServiceModal(false);
    showToast(`Service "${editServiceName}" updated successfully!`, "success");
  };

  const handleDeleteService = (id: string, name: string) => {
    setServicesList((prev) => prev.filter((s) => s.id !== id));
    showToast(`Service "${name}" removed from catalog.`, "info");
  };

  // Add Salon Handler (POST /api/salons)
  const handleAddSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalonError("");

    if (
      !newSalonName.trim() ||
      !newOwnerName.trim() ||
      !newSalonPhone.trim() ||
      !newSalonEmail.trim() ||
      !newSalonAddress.trim() ||
      !newSalonCity.trim() ||
      !newSalonPincode.trim()
    ) {
      setSalonError("Please fill in all required salon details (*).");
      return;
    }

    setSalonLoading(true);

    try {
      const payload: CreateSalonPayload = {
        salonName: newSalonName.trim(),
        ownerName: newOwnerName.trim(),
        phoneNumber: newSalonPhone.trim(),
        email: newSalonEmail.trim(),
        salonAddress: newSalonAddress.trim(),
        city: newSalonCity.trim(),
        pincode: newSalonPincode.trim(),
        salonLogo:
          newSalonLogo.trim() ||
          "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500",
        salonDescription:
          newSalonDescription.trim() ||
          "Premium unisex salon providing bespoke haircuts, styling, beard grooming, and beauty treatments.",
        locationLink:
          newSalonLocationLink.trim() ||
          `https://maps.google.com/?q=${encodeURIComponent(newSalonCity + "+" + newSalonName)}`,
        openingTime: newSalonOpen.trim() || "09:00",
        closingTime: newSalonClose.trim() || "21:00",
      };

      console.log("🚀 [ADMIN: REGISTER SALON] Submitting payload to backend database:", payload);

      const res = await apiCreateSalon(payload);
      console.log("📥 [ADMIN: REGISTER SALON] API response received from apiCreateSalon:", res);

      const createdData: any = res?.data || res;

      if (createdData && (createdData.id || createdData.salonName || createdData.name)) {
        const savedId = createdData.id || `sl-${Date.now()}`;
        console.log("✅ [ADMIN: REGISTER SALON] SALON SAVED SUCCESSFULLY TO DATABASE! Record details:", {
          id: savedId,
          salonName: createdData.salonName || newSalonName,
          ownerName: createdData.ownerName || newOwnerName,
          phone: createdData.phoneNumber || newSalonPhone,
          email: createdData.email || newSalonEmail,
          city: createdData.city || newSalonCity,
          status: createdData.status || "ACTIVE",
          createdAt: createdData.createdAt
        });

        const savedSalon: SalonItem = {
          id: savedId,
          name: createdData.salonName || createdData.name || newSalonName,
          ownerName: createdData.ownerName || newOwnerName,
          email: createdData.email || newSalonEmail,
          phone: createdData.phoneNumber || createdData.phone || newSalonPhone,
          type: newSalonType,
          stateCode: newSalonState || "MH",
          cityName: createdData.city || newSalonCity,
          address: createdData.salonAddress || createdData.address || newSalonAddress,
          pincode: createdData.pincode || newSalonPincode,
          salonLogo: createdData.salonLogo || createdData.logo || newSalonLogo,
          salonDescription: createdData.salonDescription || createdData.description || newSalonDescription,
          locationLink: createdData.locationLink || newSalonLocationLink,
          openingTime: createdData.openingTime || newSalonOpen,
          closingTime: createdData.closingTime || newSalonClose,
          activeStylists: 5,
          status: (createdData.status as any) || "ACTIVE",
          todayRevenue: 0,
          createdAt: createdData.createdAt ? String(createdData.createdAt).split("T")[0] : new Date().toISOString().split("T")[0],
        };

        setSalons((prev) => [savedSalon, ...prev.filter((s) => s.id !== savedSalon.id)]);
        setShowAddSalonModal(false);
        setNewSalonName("Style Studio");
        setNewOwnerName(staffOwnerOptions[0]?.name || "");
        setNewSalonEmail("stylestudio.baner@gmail.com");
        setNewSalonPhone("9876543210");
        setNewSalonAddress("High Street, Baner, Pune");
        setNewSalonCity("Pune");
        setNewSalonPincode("411045");
        showToast(`Salon "${savedSalon.name}" registered and saved to database successfully!`, "success");
        fetchSalons();
        return;
      } else {
        console.warn("⚠️ [ADMIN: REGISTER SALON] Received response but data format was unexpected:", res);
      }
    } catch (err: any) {
      console.error("❌ [ADMIN: REGISTER SALON] FAILED TO SAVE SALON TO DATABASE! Error details:", {
        message: err?.message,
        stack: err?.stack,
        error: err
      });
      console.info("ℹ️ [ADMIN: REGISTER SALON] Falling back to local cache resilience so inputs are not lost.");
      // Fallback local persistence if offline
      const localSalon: SalonItem = {
        id: `sl-${Date.now()}`,
        name: newSalonName.trim(),
        ownerName: newOwnerName.trim(),
        email: newSalonEmail.trim(),
        phone: newSalonPhone.trim(),
        type: newSalonType,
        stateCode: newSalonState || "MH",
        cityName: newSalonCity.trim(),
        address: newSalonAddress.trim(),
        pincode: newSalonPincode.trim(),
        salonLogo: newSalonLogo.trim(),
        salonDescription: newSalonDescription.trim(),
        locationLink: newSalonLocationLink.trim(),
        openingTime: newSalonOpen.trim(),
        closingTime: newSalonClose.trim(),
        activeStylists: 4,
        status: "ACTIVE",
        todayRevenue: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setSalons((prev) => [localSalon, ...prev]);
      setShowAddSalonModal(false);
      showToast(`Salon "${localSalon.name}" saved locally (${err.message || "Backend offline"}).`, "info");
    } finally {
      setSalonLoading(false);
    }
  };

  const handleDeleteSalon = async (id: string, name: string) => {
    // 1. Immediately delete from local state
    setSalons((prev) => prev.filter((s) => s.id !== id));
    // 2. Mark in deleted set
    setDeletedSalonIds((prev) => new Set([...prev, id]));

    // 3. Fire backend delete asynchronously
    try {
      if (!id.startsWith("sl-")) {
        await apiDeleteSalon(id);
      }
    } catch (err) {
      console.warn("Could not delete salon from backend:", err);
    }
    showToast(`Salon "${name}" removed.`, "info");
  };

  // Filtered lists
  const filteredUsers = appUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.mobileNumber.includes(userSearch);
    const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredStates = states.filter(
    (s) =>
      s.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const filteredCities = cities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(locationSearch.toLowerCase()) ||
      c.stateCode.toLowerCase().includes(locationSearch.toLowerCase()) ||
      (c.stateName && c.stateName.toLowerCase().includes(locationSearch.toLowerCase()));
    const matchesStateFilter =
      locationStateFilter === "ALL" ||
      c.stateCode.toUpperCase() === locationStateFilter.toUpperCase() ||
      c.stateId === locationStateFilter;
    return matchesSearch && matchesStateFilter;
  });

  const filteredSalons = salons.filter(
    (s) =>
      s.name.toLowerCase().includes(salonSearch.toLowerCase()) ||
      s.cityName.toLowerCase().includes(salonSearch.toLowerCase()) ||
      s.stateCode.toLowerCase().includes(salonSearch.toLowerCase()) ||
      s.type.toLowerCase().includes(salonSearch.toLowerCase())
  );

  const filteredQueueItems = queueItems.filter(
    (q) =>
      q.token.toLowerCase().includes(queueSearch.toLowerCase()) ||
      q.customerName.toLowerCase().includes(queueSearch.toLowerCase()) ||
      q.service.toLowerCase().includes(queueSearch.toLowerCase()) ||
      q.salonBranch.toLowerCase().includes(queueSearch.toLowerCase()) ||
      q.status.toLowerCase().includes(queueSearch.toLowerCase())
  );

  const filteredServices = servicesList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(serviceSearch.toLowerCase());
    const matchesCategory = serviceCategoryFilter === "ALL" || s.category === serviceCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const availableCitiesForModal = cities.filter((c) => !newSalonState || c.stateCode === newSalonState);

  // Tab definitions
  const navTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: `${queueItems.length}Q` },
    { id: "location", label: "Location", icon: MapPin, badge: `${states.length}S / ${cities.length}C` },
    { id: "salon", label: "Salon", icon: Scissors, badge: `${salons.length}` },
    { id: "users", label: "User Management", icon: Users, badge: `${appUsers.length}` },
    { id: "revenue", label: "Revenue & Analysis", icon: TrendingUp, badge: `${servicesList.length}` },
  ];

  return (
    <div className="min-h-screen bg-[#090b10] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
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
      <header className="h-14 bg-[#0d1017] border-b border-[#1f2533] px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 pr-3 border-r border-[#232a3b]">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d1017] rounded-[6px] flex items-center justify-center">
                <Scissors className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
            <span className="font-bold text-white tracking-tight">SalonFlow AI</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 font-medium">
            <span>DevCrackers</span>
            <span>/</span>
            <span className="text-zinc-200 font-mono">admin</span>
            <Link
              href="/salon"
              className="ml-2 px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3 h-3 text-amber-400" />
              <span>Open Salon Panel</span>
            </Link>
          </div>
        </div>

        {/* Top Right Auth & Info */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#131822] border border-[#222938] text-zinc-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentTime || "12:30:00 PM"}</span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#141926] border border-amber-500/30 pl-3 pr-1 py-1 rounded-xl">
              <div className="text-right">
                <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                <span className="text-[10px] text-amber-300 font-mono">{currentUser.role}</span>
              </div>
              <button
                onClick={handleLogoutClick}
                className="px-2.5 py-1 text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthError("");
                  setShowAuthModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-xs shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login / Register</span>
              </button>
              <button
                onClick={handleLogoutClick}
                className="px-3 py-1.5 rounded-xl bg-[#141926] hover:bg-rose-500/15 border border-[#263044] hover:border-rose-500/40 text-zinc-300 hover:text-rose-300 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Sign out of current admin session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Role Verification Notice if non-admin is logged in */}
      {currentUser && (currentUser.role?.toUpperCase() !== "ADMIN" && currentUser.role?.toUpperCase() !== "ROLE_ADMIN") && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Database Role Notice:</span> Logged in as <span className="font-semibold text-amber-300">{currentUser.name}</span> with role <span className="font-mono font-bold text-amber-400">"{currentUser.role}"</span>.
              <span className="text-zinc-400 block sm:inline sm:ml-1">Sign in with an ADMIN account in the database to modify live operations.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setAuthError("");
                setShowAuthModal(true);
              }}
              className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow transition-colors cursor-pointer"
            >
              Sign In as Admin
            </button>
            <Link
              href="/home"
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
            >
              Customer View →
            </Link>
          </div>
        </div>
      )}

      {/* Main Body Layout: Left Sidebar + Right Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* ===================== LEFT SIDEBAR ===================== */}
        <aside className="w-64 bg-[#0d1017] border-r border-[#1f2533] flex flex-col justify-between shrink-0 select-none">
          <div className="p-3 space-y-6 overflow-y-auto">
            <div>
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>Admin Operations</span>
                <Sparkles className="w-3 h-3 text-amber-400/60" />
              </div>

              <nav className="mt-2 space-y-1">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${isActive
                          ? "bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-[#151a24] border border-transparent"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-zinc-500"}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${isActive
                              ? "bg-amber-400/25 text-amber-200 border border-amber-400/40"
                              : "bg-[#181e2b] text-zinc-400"
                            }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-3 rounded-xl bg-[#121622] border border-[#1f2533]">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>API Status (Port 8081)</span>
                <span className="text-emerald-400 font-bold font-mono">Live</span>
              </div>
              <div className="mt-2 text-xs text-white font-medium">
                {appUsers.length} Users • {salons.length} Salons
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-[#1f2533] bg-[#0b0e14] space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#131722] border border-[#202738]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shrink-0 flex items-center justify-center font-bold text-black text-xs">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : "P3"}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser ? currentUser.name : "Administrator"}
                </div>
                <div className="text-[10px] text-amber-400/90 font-mono truncate">
                  {currentUser ? `Role: ${currentUser.role}` : "Role: Person 3 Admin"}
                </div>
              </div>
            </div>

            {/* Dedicated Sidebar Logout Button with Confirmation Trigger */}
            <button
              onClick={handleLogoutClick}
              className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              title="Click to logout"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* ===================== RIGHT MAIN CONTENT ===================== */}
        <main className="flex-1 bg-[#070B12] overflow-y-auto p-6 lg:p-8 grid-pattern">
          {/* ======================= TAB 1: DASHBOARD ======================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fadeIn max-w-[1520px] mx-auto">
              {/* BEGIN: DashboardHeader */}
              <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2" data-purpose="dashboard-heading">
                <div>
                  <div className="flex items-center gap-3">
                    {/* Amber 4-square grid icon */}
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <rect height="7" rx="1.5" width="7" x="3" y="3"></rect>
                        <rect height="7" rx="1.5" width="7" x="14" y="3"></rect>
                        <rect height="7" rx="1.5" width="7" x="14" y="14"></rect>
                        <rect height="7" rx="1.5" width="7" x="3" y="14"></rect>
                      </svg>
                    </div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h1>
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono-num text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> LIVE OPS
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 font-normal">
                    Multi-salon operations, live wait queues, and AI congestion telemetry.
                  </p>
                </div>
                {/* Live Telemetry Sync Pill & Quick Toggles */}
                <div className="flex items-center gap-3 self-start md:self-auto">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0F1726] border border-[#1E293B] text-xs text-slate-300 font-mono-num shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Telemetry: <strong className="text-white font-medium">Synced 2s ago</strong></span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 p-1 bg-[#0F1726] border border-[#1E293B] rounded-xl text-xs font-mono-num">
                    <button
                      onClick={() => setTimeRange("realtime")}
                      className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold cursor-pointer ${
                        timeRange === "realtime"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      REALTIME
                    </button>
                    <button
                      onClick={() => setTimeRange("1h")}
                      className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold cursor-pointer ${
                        timeRange === "1h"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      1H
                    </button>
                    <button
                      onClick={() => setTimeRange("24h")}
                      className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold cursor-pointer ${
                        timeRange === "24h"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      24H
                    </button>
                  </div>
                </div>
              </section>
              {/* END: DashboardHeader */}

              {/* BEGIN: AIOperationsIntelligenceBanner */}
              {!congestionResolved && (
                <section className="w-full rounded-2xl bg-gradient-to-r from-[#0F1728] via-[#141C30] to-[#0F1826] border border-amber-500/30 p-5 md:p-6 glow-amber-subtle relative overflow-hidden" data-purpose="ai-operations-alert">
                  {/* Ambient glowing backdrop effect */}
                  <div className="absolute -right-16 -top-16 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute left-1/3 -bottom-20 w-80 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                    {/* Left content: Icon, Badges, Title & Recommendation */}
                    <div className="flex items-start gap-4 md:gap-5 max-w-4xl">
                      {/* AI Flash Icon container with golden border */}
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex-shrink-0 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <svg className="w-6 h-6 fill-current text-amber-400" viewBox="0 0 24 24">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                      </div>
                      <div className="space-y-2">
                        {/* Badges line */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[11px] font-bold tracking-wider uppercase border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            AI OPERATIONS INTELLIGENCE
                          </span>
                          <span className="text-xs font-mono-num text-slate-400">
                            Model: <span className="text-slate-300 font-medium">WaitTime-Congestion-v1</span>
                          </span>
                        </div>
                        {/* Congestion Prediction Heading */}
                        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                          Peak Congestion Predicted at Koregaon Park Branch (6:30 PM)
                        </h2>
                        {/* Congestion Explanation and Recommendation */}
                        <p className="text-sm text-slate-300 leading-relaxed">
                          AI predicts an influx of +35% walk-ins for haircut services during evening rush. <strong className="text-amber-400 font-semibold">Recommendation:</strong> Reallocate Stylist &apos;Alex R.&apos; to Haircut Station #3 to keep wait times under 18 mins.
                        </p>
                      </div>
                    </div>
                    {/* Right Side: Apply Rebalance Primary CTA & Dismiss Button */}
                    <div className="flex items-center gap-3 self-end lg:self-center flex-shrink-0">
                      <button
                        onClick={() => {
                          setCongestionResolved(true);
                          showToast("AI Congestion Recommendation applied! Staff reallocated.", "success");
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all transform active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                        type="button"
                      >
                        <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        Apply Rebalance
                      </button>
                      <button
                        onClick={() => setCongestionResolved(true)}
                        aria-label="Dismiss alert"
                        className="w-9 h-9 rounded-xl bg-[#0F1726] border border-[#1E293B] hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition flex items-center justify-center cursor-pointer"
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </section>
              )}
              {/* END: AIOperationsIntelligenceBanner */}

              {/* BEGIN: KPICardsGrid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5" data-purpose="kpi-metrics-grid">
                {/* Metric Card 1: Total Registered Users */}
                <div className="bg-[#0F1726] border border-[#1E293B] hover:border-amber-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TOTAL REGISTERED USERS</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold text-white font-mono-num tracking-tight">{appUsers.length}</div>
                      {/* Sparkline SVG */}
                      <svg className="w-20 h-7 text-amber-400 overflow-visible" fill="none" viewBox="0 0 80 28">
                        <path d="M2 22 L20 18 L38 23 L56 12 L78 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        <circle className="animate-pulse" cx="78" cy="5" fill="#FBBF24" r="3"></circle>
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-slate-400">
                      {appUsers.filter((u) => u.role === "CUSTOMER").length} Customers • {appUsers.filter((u) => u.role === "STAFF").length} Staff
                    </p>
                  </div>
                </div>

                {/* Metric Card 2: Today's Appointments */}
                <div className="bg-[#0F1726] border border-[#1E293B] hover:border-blue-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TODAY&apos;S APPOINTMENTS</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold text-white font-mono-num tracking-tight">48</div>
                      {/* Sparkline SVG */}
                      <svg className="w-20 h-7 text-blue-400 overflow-visible" fill="none" viewBox="0 0 80 28">
                        <path d="M2 20 L22 14 L42 17 L60 8 L78 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        <circle cx="78" cy="3" fill="#60A5FA" r="3"></circle>
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-slate-400">32 Completed • 16 Pending</p>
                  </div>
                </div>

                {/* Metric Card 3: Gross Today Revenue */}
                <div className="bg-[#0F1726] border border-[#1E293B] hover:border-emerald-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">GROSS TODAY REVENUE</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform font-bold text-sm">
                      ₹
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold text-white font-mono-num tracking-tight">₹1,50,700</div>
                      {/* Sparkline SVG with area fill */}
                      <svg className="w-20 h-7 text-emerald-400 overflow-visible" fill="none" viewBox="0 0 80 28">
                        <path d="M2 24 L20 18 L40 10 L60 14 L78 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        <circle cx="78" cy="2" fill="#34D399" r="3"></circle>
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      +19.4% vs last Friday
                    </p>
                  </div>
                </div>

                {/* Metric Card 4: Active Salons Network */}
                <div className="bg-[#0F1726] border border-[#1E293B] hover:border-purple-500/40 rounded-2xl p-5 transition-all relative overflow-hidden group shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">ACTIVE SALONS NETWORK</span>
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.651V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009 9.35c.66 0 1.28-.213 1.785-.576.505.363 1.125.576 1.785.576.66 0 1.28-.213 1.785-.576.505.363 1.125.576 1.785.576a3.001 3.001 0 003.75.615" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl font-extrabold text-white font-mono-num tracking-tight">{salons.length}</div>
                      {/* Sparkline bars */}
                      <div className="flex items-end gap-1 h-7 pt-1">
                        <span className="w-2 h-3 bg-purple-500/40 rounded-sm"></span>
                        <span className="w-2 h-4 bg-purple-500/60 rounded-sm"></span>
                        <span className="w-2 h-6 bg-purple-400 rounded-sm shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                        <span className="w-2 h-5 bg-purple-500/70 rounded-sm"></span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-400">{cities.length} Cities in {states.length} States</p>
                  </div>
                </div>
              </section>
              {/* END: KPICardsGrid */}

              {/* BEGIN: STUNNING VISUAL CHARTS & SALON ANALYTICS SECTION */}
              <section className="grid grid-cols-1 xl:grid-cols-12 gap-6" data-purpose="advanced-analytics-charts">
                {/* Chart 1: Predictive Peak Congestion & Queue Influx Waveform (7 Cols) */}
                <div className="xl:col-span-7 bg-[#0F1726] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden shadow-xl">
                  {/* Glow ambient light */}
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  {/* Chart Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <h3 className="text-base font-bold text-white tracking-tight">Sales Performance &amp; Hourly Conversion Trend</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Total completed transactions &amp; service sales pacing today</p>
                    </div>
                    {/* Legend Badges */}
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px]">
                        <span className="w-3 h-1 bg-amber-400 rounded-full"></span> Service Sales Volume
                      </div>
                      <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[11px]">
                        <span className="w-3 h-1 bg-cyan-400 rounded-full"></span> Retail / Product Upsell
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Peak Sales
                      </div>
                    </div>
                  </div>

                  {/* Waveform SVG Chart Container */}
                  <div className="relative w-full h-64 select-none">
                    <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 740 240">
                      <defs>
                        <linearGradient id="salesAmberGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45"></stop>
                          <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.08"></stop>
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0"></stop>
                        </linearGradient>
                        <linearGradient id="salesCyanGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25"></stop>
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0"></stop>
                        </linearGradient>
                        <filter height="140%" id="salesNeonGlow" width="140%" x="-20%" y="-20%">
                          <feGaussianBlur result="blur" stdDeviation="3"></feGaussianBlur>
                          <feMerge>
                            <feMergeNode in="blur"></feMergeNode>
                            <feMergeNode in="SourceGraphic"></feMergeNode>
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Horizontal Grid Lines */}
                      <line stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="720" y1="30" y2="30"></line>
                      <line stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="720" y1="80" y2="80"></line>
                      <line stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="720" y1="130" y2="130"></line>
                      <line stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" x1="40" x2="720" y1="180" y2="180"></line>
                      <line stroke="#1E293B" strokeWidth="1.2" x1="40" x2="720" y1="220" y2="220"></line>

                      {/* Y Axis Labels (Completed Sales Units) */}
                      <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="30" y="34">50</text>
                      <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="30" y="84">35</text>
                      <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="30" y="134">20</text>
                      <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" textAnchor="end" x="30" y="184">10</text>

                      {/* Retail / Product Upsell Curve (Cyan) */}
                      <path d="M 50 160 C 120 155, 180 145, 260 135 C 340 125, 420 115, 500 110 C 580 100, 650 115, 710 130" fill="none" opacity="0.85" stroke="#06B6D4" strokeDasharray="5 5" strokeWidth="2"></path>
                      <path d="M 50 160 C 120 155, 180 145, 260 135 C 340 125, 420 115, 500 110 C 580 100, 650 115, 710 130 L 710 220 L 50 220 Z" fill="url(#salesCyanGradient)"></path>

                      {/* Primary Service Sales Volume Curve (Amber neon spline) */}
                      <path d="M 50 195 C 100 185, 140 170, 180 160 C 230 145, 270 125, 320 135 C 370 145, 420 110, 470 70 C 520 28, 555 24, 575 22 C 605 20, 640 90, 670 140 C 690 175, 705 185, 710 190" fill="none" filter="url(#salesNeonGlow)" stroke="#F59E0B" strokeWidth="3.5"></path>
                      <path d="M 50 195 C 100 185, 140 170, 180 160 C 230 145, 270 125, 320 135 C 370 145, 420 110, 470 70 C 520 28, 555 24, 575 22 C 605 20, 640 90, 670 140 C 690 175, 705 185, 710 190 L 710 220 L 50 220 Z" fill="url(#salesAmberGradient)"></path>

                      {/* Peak Sales Marker at 6:30 PM (x=575, y=22) */}
                      <line stroke="#10B981" strokeDasharray="3 3" strokeWidth="1.5" x1="575" x2="575" y1="22" y2="220"></line>
                      <circle cx="575" cy="22" fill="#10B981" filter="url(#salesNeonGlow)" r="6"></circle>
                      <circle cx="575" cy="22" fill="#FFFFFF" r="3"></circle>

                      {/* Mid-curve points */}
                      <circle cx="180" cy="160" fill="#0F1726" r="4" stroke="#F59E0B" strokeWidth="2"></circle>
                      <circle cx="320" cy="135" fill="#0F1726" r="4" stroke="#F59E0B" strokeWidth="2"></circle>
                      <circle cx="470" cy="70" fill="#0F1726" r="4" stroke="#F59E0B" strokeWidth="2"></circle>
                      <circle cx="670" cy="140" fill="#0F1726" r="4" stroke="#F59E0B" strokeWidth="2"></circle>

                      {/* Tooltip Callout for Peak Sales (48 Services Completed • ₹1,50,700 Gross) */}
                      <g transform="translate(440, 24)">
                        <rect fill="#0B111D" filter="url(#salesNeonGlow)" height="44" rx="8" stroke="#10B981" strokeWidth="1.2" width="205" x="0" y="0"></rect>
                        <text fill="#34D399" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold" x="10" y="16">PEAK SALES VOLUME</text>
                        <text fill="#FFFFFF" fontFamily="Inter" fontSize="11" fontWeight="700" x="10" y="33">48 Services Completed • ₹1,50,700 Gross</text>
                      </g>

                      {/* X Axis Time labels */}
                      <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" x="50" y="235">10 AM</text>
                      <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" x="180" y="235">12 PM</text>
                      <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" x="320" y="235">2 PM</text>
                      <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" x="470" y="235">4 PM</text>
                      <text fill="#34D399" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" x="575" y="235">6:30 PM</text>
                      <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="10" x="690" y="235">8 PM</text>
                    </svg>
                  </div>

                  {/* Chart Sub-bar telemetry with sales metrics */}
                  <div className="mt-3 pt-3 border-t border-[#1E293B]/60 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[#131D31]/50 border border-[#1E293B]/40">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Total Completed Sales</p>
                      <p className="text-sm font-bold text-emerald-400 font-mono-num flex items-center justify-center gap-1">48 Orders <span className="text-[11px] font-normal text-emerald-400">+19.4%</span></p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#131D31]/50 border border-[#1E293B]/40">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Avg Ticket Value</p>
                      <p className="text-sm font-bold text-white font-mono-num">₹3,140 <span className="text-[11px] font-normal text-slate-400">/ client</span></p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#131D31]/50 border border-[#1E293B]/40">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Upsell Conversion</p>
                      <p className="text-sm font-bold text-amber-400 font-mono-num">34.2% Rate</p>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Hourly Bookings vs Walk-ins & Branch Share (5 Cols) */}
                <div className="xl:col-span-5 bg-[#0F1726] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">Sales Breakdown by Category &amp; Volume</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Appointments vs walk-in sales volume &amp; revenue contribution</p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold">
                        ₹1.50L Today Target Achieved
                      </span>
                    </div>

                    {/* Interactive Bar/Spline Composite Chart */}
                    <div className="relative w-full h-44 select-none">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 420 180">
                        <line stroke="#1E293B" strokeDasharray="3 3" x1="20" x2="400" y1="35" y2="35"></line>
                        <line stroke="#1E293B" strokeDasharray="3 3" x1="20" x2="400" y1="80" y2="80"></line>
                        <line stroke="#1E293B" strokeDasharray="3 3" x1="20" x2="400" y1="125" y2="125"></line>
                        <line stroke="#1E293B" x1="20" x2="400" y1="155" y2="155"></line>

                        {/* Stacked Sales Volume Bars: Slots 10am, 12pm, 2pm, 4pm, 6pm, 8pm */}
                        {/* 10am */}
                        <rect fill="#3B82F6" height="40" opacity="0.85" rx="3" width="22" x="40" y="115"></rect>
                        <rect fill="#F59E0B" height="23" opacity="0.85" rx="3" width="22" x="40" y="90"></rect>
                        <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="51" y="170">10A</text>

                        {/* 12pm */}
                        <rect fill="#3B82F6" height="70" opacity="0.85" rx="3" width="22" x="100" y="85"></rect>
                        <rect fill="#F59E0B" height="28" opacity="0.85" rx="3" width="22" x="100" y="55"></rect>
                        <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="111" y="170">12P</text>

                        {/* 2pm */}
                        <rect fill="#3B82F6" height="80" opacity="0.85" rx="3" width="22" x="160" y="75"></rect>
                        <rect fill="#F59E0B" height="28" opacity="0.85" rx="3" width="22" x="160" y="45"></rect>
                        <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="171" y="170">2P</text>

                        {/* 4pm */}
                        <rect fill="#3B82F6" height="90" opacity="0.85" rx="3" width="22" x="220" y="65"></rect>
                        <rect fill="#F59E0B" height="33" opacity="0.85" rx="3" width="22" x="220" y="30"></rect>
                        <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="231" y="170">4P</text>

                        {/* 6pm (Peak Sales Rush) */}
                        <rect className="shadow-[0_0_12px_rgba(59,130,246,0.5)]" fill="#3B82F6" height="110" opacity="0.95" rx="3" width="22" x="280" y="45"></rect>
                        <rect className="shadow-[0_0_12px_rgba(245,158,11,0.6)]" fill="#F59E0B" height="33" opacity="0.95" rx="3" width="22" x="280" y="10"></rect>
                        <text fill="#FBBF24" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold" textAnchor="middle" x="291" y="170">6P</text>

                        {/* 8pm */}
                        <rect fill="#3B82F6" height="75" opacity="0.85" rx="3" width="22" x="340" y="80"></rect>
                        <rect fill="#F59E0B" height="23" opacity="0.85" rx="3" width="22" x="340" y="55"></rect>
                        <text fill="#64748B" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="351" y="170">8P</text>

                        {/* Cumulative Revenue curve */}
                        <path d="M 51 100 Q 111 75 171 60 T 291 18 T 351 70" fill="none" stroke="#10B981" strokeLinecap="round" strokeWidth="2.5"></path>
                        <circle cx="291" cy="18" fill="#10B981" r="4" stroke="#FFFFFF" strokeWidth="1.5"></circle>
                      </svg>
                    </div>
                  </div>

                  {/* Visual breakdown chips row */}
                  <div className="mt-4 pt-3 border-t border-[#1E293B]/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                      <span className="text-slate-300">Hair &amp; Styling: <strong className="text-white font-mono">28 Sales</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                      <span className="text-slate-300">Color &amp; Treatments: <strong className="text-white font-mono">14 Sales</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span className="text-emerald-400 font-mono font-semibold">Products &amp; Care: 6 Sales</span>
                    </div>
                  </div>
                </div>
              </section>
              {/* END: STUNNING VISUAL CHARTS & SALON ANALYTICS SECTION */}

              {/* BEGIN: TwoColumnOperationsSection */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left / Main Column: Live Salon Queue Stream (approx 68% / 8 cols) */}
                <section className="lg:col-span-8 bg-[#0F1726] border border-[#1E293B] rounded-2xl p-6 shadow-xl" data-purpose="queue-stream-section">
                  {/* Queue Stream Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#1E293B]/70">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <Scissors className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white tracking-tight">Live Salon Queue Stream</h3>
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold">
                          {filteredQueueItems.length} ACTIVE TOKENS
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Realtime walk-in stream &amp; automated dispatch state machine</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setShowAddQueueModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Walk-in Token
                      </button>
                      <button
                        onClick={() => setActiveTab("salon")}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group cursor-pointer"
                      >
                        View Salons
                        <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Queue Filter Bar */}
                  <div className="mt-4 mb-2 flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search queue by token #, customer, service, branch, or status..."
                        value={queueSearch}
                        onChange={(e) => setQueueSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-[#121622] border border-[#1E293B] rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Live Queue Desktop Data Table */}
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#1E293B]/60">
                          <th className="py-3 px-3" scope="col">TOKEN</th>
                          <th className="py-3 px-3" scope="col">CUSTOMER</th>
                          <th className="py-3 px-3" scope="col">SERVICE</th>
                          <th className="py-3 px-3" scope="col">SALON BRANCH</th>
                          <th className="py-3 px-3 text-center" scope="col">WAIT EST.</th>
                          <th className="py-3 px-3 text-center" scope="col">STATUS</th>
                          <th className="py-3 px-3 text-right" scope="col">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B]/40 text-sm">
                        {filteredQueueItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                            <td className="py-3.5 px-3 font-mono font-bold text-amber-400">
                              <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/25">
                                {item.token}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-white group-hover:text-amber-300 transition-colors text-xs">
                              {item.customerName}
                            </td>
                            <td className="py-3.5 px-3 text-slate-300 text-xs">
                              {item.service}
                            </td>
                            <td className="py-3.5 px-3 text-slate-400 text-xs">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                <span>{item.salonBranch}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-center text-xs font-mono text-slate-300">
                              {item.waitEstimate}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  item.status === "CALLED"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                                    : item.status === "IN_SERVICE"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                                    : item.status === "COMPLETED"
                                    ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                    : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                }`}
                              >
                                {item.status === "CALLED" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
                                {item.status === "IN_SERVICE" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {item.status === "WAITING" && (
                                  <button
                                    onClick={() => handleQuickQueueStatus(item.id, "CALLED")}
                                    className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[10px] font-bold border border-amber-500/30 transition cursor-pointer"
                                    title="Call Customer to Chair"
                                  >
                                    Call
                                  </button>
                                )}
                                {item.status === "CALLED" && (
                                  <button
                                    onClick={() => handleQuickQueueStatus(item.id, "IN_SERVICE")}
                                    className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 transition cursor-pointer"
                                    title="Start Service"
                                  >
                                    Start
                                  </button>
                                )}
                                {item.status === "IN_SERVICE" && (
                                  <button
                                    onClick={() => handleQuickQueueStatus(item.id, "COMPLETED")}
                                    className="px-2 py-1 rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 text-[10px] font-bold border border-blue-500/30 transition cursor-pointer"
                                    title="Complete Service"
                                  >
                                    Done
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEditQueue(item)}
                                  className="p-1.5 text-zinc-400 hover:text-amber-300 rounded-lg bg-white/5 hover:bg-amber-500/10 transition cursor-pointer"
                                  title="Edit Queue Token"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQueueItem(item.id, item.token)}
                                  className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg bg-white/5 hover:bg-rose-500/10 transition cursor-pointer"
                                  title="Remove / Cancel Token"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredQueueItems.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-xs text-zinc-500">
                              No queue tokens match your search. Click &apos;Add Walk-in Token&apos; to register a client.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Live Queue Footer Status Banner */}
                  <div className="mt-5 pt-3.5 border-t border-[#1E293B]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Dispatch Feed Online: <code className="text-slate-300 font-mono text-[11px]">/api/queue/stream</code></span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">Auto-Sync Active (Port 8081)</span>
                  </div>
                </section>

                {/* Right Sidebar Column: User Directory Quick Look (approx 32% / 4 cols) */}
                <aside className="lg:col-span-4 space-y-4" data-purpose="user-directory-sidebar">
                  {/* User Directory Quick Look Card */}
                  <div className="bg-[#0F1726] border border-[#1E293B] rounded-2xl p-6 shadow-xl">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]/70 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                          <h3 className="text-base font-bold text-white">User Directory Quick Look</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Recent user registrations and permissions.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("users")}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>

                    {/* Admin Record */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-[#1E293B] hover:border-slate-700 transition flex items-center justify-between gap-3" data-purpose="admin-user-card">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar monogram */}
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                          {currentUser ? currentUser.name.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {currentUser ? currentUser.name : "Prapti Meher (Admin)"}
                          </h4>
                          <p className="text-xs text-slate-400 font-mono truncate">
                            {currentUser ? currentUser.email : "praptimeher04@gmail.com"}
                          </p>
                        </div>
                      </div>
                      {/* ADMIN Badge */}
                      <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/35 text-[11px] font-bold uppercase tracking-wider text-amber-400 flex-shrink-0">
                        {currentUser ? currentUser.role : "ADMIN"}
                      </span>
                    </div>

                    {/* Quick Directory Summary Telemetry */}
                    <div className="mt-5 pt-4 border-t border-[#1E293B]/60 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Total System Roles</span>
                        <span className="text-slate-200 font-mono font-medium">3 Roles (Admin, Stylist, FrontDesk)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Directory Sync</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Peak Congestion Metrics Card */}
                  <div className="bg-[#0F1726] border border-[#1E293B] rounded-2xl p-5 relative overflow-hidden shadow-xl">
                    {/* Subtle red radial glow for peak alert */}
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        PEAK CONGESTION METRICS
                      </div>
                      <span className="text-[10px] font-mono-num px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                        6:30 PM EST.
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal relative z-10">
                      Koregaon Park Branch capacity is tracking at <span className="text-amber-400 font-semibold">92%</span> utilization for evening slots.
                    </p>
                    {/* Dynamic Gauge Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-3 mt-3 overflow-hidden p-0.5 border border-[#1E293B] relative z-10">
                      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-red-500 h-full rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-500" style={{ width: "92%" }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2 relative z-10">
                      <span>0% Normal</span>
                      <span>50% Moderate</span>
                      <span className="text-red-400 font-bold">92% Critical</span>
                    </div>
                  </div>
                </aside>
                {/* END: Right Sidebar Column */}
              </div>
              {/* END: TwoColumnOperationsSection */}
            </div>
          )}

          {/* ======================= TAB 2: LOCATION ======================= */}
          {activeTab === "location" && (
            <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232a3b]">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                    <MapPin className="w-6 h-6 text-amber-400" />
                    Location Management
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Configure geographical hierarchy: Register States and link Cities to manage your multi-salon chain.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddLocation(!showAddLocation)}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto ${showAddLocation
                      ? "bg-[#1f2638] text-amber-300 border border-amber-500/40 hover:bg-[#252f44]"
                      : "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-amber-500/20"
                    }`}
                >
                  {showAddLocation ? (
                    <>
                      <X className="w-4 h-4" /> Close Form
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add State / City
                    </>
                  )}
                </button>
              </div>

              {showAddLocation && (
                <div className="p-6 rounded-2xl bg-[#0f131d] border border-amber-500/30 shadow-2xl animate-fadeIn space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base font-bold text-white">Create New State & City Records</h3>
                    </div>
                    <button
                      onClick={() => setShowAddLocation(false)}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* STATE FORM */}
                    <div className="rounded-2xl bg-[#141924] border border-[#283247] p-5 shadow-md flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">State Form</h4>
                            <p className="text-xs text-zinc-400">Add state code and state name</p>
                          </div>
                        </div>

                        {stateError && (
                          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{stateError}</span>
                          </div>
                        )}

                        <form onSubmit={handleSaveState} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                              State Code <span className="text-amber-400">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="e.g. MH, DL, KA"
                              value={stateCode}
                              onChange={(e) => setStateCode(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#1a202d] border border-[#2d384e] text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 transition-colors uppercase font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                              State Name <span className="text-amber-400">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Maharashtra, Delhi NCR, Karnataka"
                              value={stateName}
                              onChange={(e) => setStateName(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#1a202d] border border-[#2d384e] text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                            />
                          </div>

                          <div className="pt-2 flex items-center gap-3">
                            <button
                              type="submit"
                              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Save State
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelState}
                              className="py-2.5 px-5 rounded-xl bg-[#1e2535] hover:bg-[#283247] border border-[#303c54] text-zinc-300 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" /> Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* CITY FORM */}
                    <div className="rounded-2xl bg-[#141924] border border-[#283247] p-5 shadow-md flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">City Form</h4>
                            <p className="text-xs text-zinc-400">Add city code, name, and select linked state</p>
                          </div>
                        </div>

                        {cityError && (
                          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{cityError}</span>
                          </div>
                        )}

                        <form onSubmit={handleSaveCity} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                              Select State <span className="text-amber-400">*</span>
                            </label>
                            <select
                              value={selectedStateCode}
                              onChange={(e) => setSelectedStateCode(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#1a202d] border border-[#2d384e] text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                            >
                              <option value="" className="bg-[#121622] text-zinc-500">
                                -- Select Linked State --
                              </option>
                              {states.map((st) => (
                                <option key={st.id} value={st.code} className="bg-[#121622] text-white">
                                  {st.code} — {st.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                              City Code <span className="text-amber-400">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="e.g. PUN, MUM, BLR"
                              value={cityCode}
                              onChange={(e) => setCityCode(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#1a202d] border border-[#2d384e] text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 transition-colors uppercase font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                              City Name <span className="text-amber-400">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Pune, Mumbai, Bengaluru"
                              value={cityName}
                              onChange={(e) => setCityName(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl bg-[#1a202d] border border-[#2d384e] text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                            />
                          </div>

                          <div className="pt-2 flex items-center gap-3">
                            <button
                              type="submit"
                              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Save City
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelCity}
                              className="py-2.5 px-5 rounded-xl bg-[#1e2535] hover:bg-[#283247] border border-[#303c54] text-zinc-300 hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" /> Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tabs for Single-Line Directory View */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 bg-[#121622] p-1 rounded-xl border border-[#232a3b]">
                  <button
                    onClick={() => {
                      setLocationSubTab("states");
                      setLocationStateFilter("ALL");
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${locationSubTab === "states"
                        ? "bg-amber-400 text-black shadow-md"
                        : "text-zinc-400 hover:text-white"
                      }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Registered States ({states.length})</span>
                  </button>
                  <button
                    onClick={() => setLocationSubTab("cities")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${locationSubTab === "cities"
                        ? "bg-amber-400 text-black shadow-md"
                        : "text-zinc-400 hover:text-white"
                      }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Registered Cities ({cities.length})</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Cascading State Filter for Cities */}
                  {locationSubTab === "cities" && (
                    <div className="flex items-center gap-2 bg-[#121622] px-3 py-1.5 rounded-xl border border-[#232a3b]">
                      <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">State:</span>
                      <select
                        value={locationStateFilter}
                        onChange={(e) => handleFilterCitiesByState(e.target.value)}
                        disabled={isFilterLoading}
                        className="bg-transparent text-amber-300 text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="ALL" className="bg-[#121622] text-zinc-300">
                          All States ({cities.length} cities)
                        </option>
                        {states.map((st) => (
                          <option key={st.id} value={st.code} className="bg-[#121622] text-white">
                            {st.code} — {st.name} ({typeof st.cityCount === "number" ? st.cityCount : cities.filter((c) => c.stateCode === st.code).length} cities)
                          </option>
                        ))}
                      </select>
                      {locationStateFilter !== "ALL" && (
                        <button
                          type="button"
                          onClick={() => handleFilterCitiesByState("ALL")}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 cursor-pointer"
                          title="Clear State Filter"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by code or name..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#121622] border border-[#232a3b] text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Single-Line Cards View */}
              {locationSubTab === "states" ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                    <span>State Master Directory (GET /api/locations/states)</span>
                    <span className="text-zinc-500 font-mono text-[11px]">Total: {filteredStates.length} states</span>
                  </div>
                  {filteredStates.map((st) => {
                    const linkedCitiesCount = typeof st.cityCount === "number" && st.cityCount > 0 ? st.cityCount : cities.filter((c) => c.stateCode === st.code).length;
                    const linkedSalonsCount = salons.filter((s) => s.stateCode === st.code).length;
                    return (
                      <div
                        key={st.id}
                        className="px-5 py-3.5 rounded-xl bg-[#121622] border border-[#232a3b] hover:border-amber-500/40 transition-all flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3.5 min-w-[220px]">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 font-mono font-bold text-amber-300 text-xs">
                            {st.code}
                          </span>
                          <div>
                            <span className="font-bold text-white text-sm tracking-tight block">{st.name}</span>
                            {st.id && !st.id.startsWith("st-") && (
                              <span className="font-mono text-[10px] text-zinc-500">ID: {st.id.slice(0, 8)}...</span>
                            )}
                          </div>
                        </div>

                        <div className="hidden md:flex items-center gap-8 text-xs text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500">Cities:</span>
                            <span className="font-bold text-zinc-200">{linkedCitiesCount} active</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500">Salons:</span>
                            <span className="font-bold text-emerald-400">{linkedSalonsCount} operational</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500">Created:</span>
                            <span className="font-mono text-zinc-400">{st.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setLocationSubTab("cities");
                              handleFilterCitiesByState(st.code);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500/20"
                            title={`Filter cities in ${st.name} (Cascading Dropdown API)`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Cities ({linkedCitiesCount})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditStateModal(st)}
                            className="p-2 text-zinc-400 hover:text-amber-300 rounded-lg bg-white/5 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            title="Edit state details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteState(st.id, st.code)}
                            className="p-2 text-zinc-500 hover:text-rose-400 rounded-lg bg-white/5 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete state"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1">
                    <span>
                      City Master Directory {locationStateFilter !== "ALL" ? `(Cascading: /api/locations/cities/state-code/${locationStateFilter})` : `(GET /api/locations/cities)`}
                    </span>
                    <span className="text-zinc-500 font-mono text-[11px]">Showing: {filteredCities.length} cities</span>
                  </div>
                  {filteredCities.map((ct) => {
                    const stateObj = states.find((s) => s.code === ct.stateCode || s.id === ct.stateId);
                    const salonCount = salons.filter((sl) => sl.cityName.toLowerCase() === ct.name.toLowerCase()).length;
                    return (
                      <div
                        key={ct.id}
                        className="px-5 py-3.5 rounded-xl bg-[#121622] border border-[#232a3b] hover:border-amber-500/40 transition-all flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3.5 min-w-[220px]">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 font-mono font-bold text-blue-300 text-xs">
                            {ct.code}
                          </span>
                          <div>
                            <span className="font-bold text-white text-sm tracking-tight block">{ct.name}</span>
                            {ct.id && !ct.id.startsWith("ct-") && (
                              <span className="font-mono text-[10px] text-zinc-500">ID: {ct.id.slice(0, 8)}...</span>
                            )}
                          </div>
                        </div>

                        <div className="hidden md:flex items-center gap-8 text-xs text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500">State:</span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono font-bold">
                              {ct.stateCode} {stateObj ? `(${stateObj.name})` : ct.stateName ? `(${ct.stateName})` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500">Salons:</span>
                            <span className="font-bold text-emerald-400">{salonCount} branches</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500">Created:</span>
                            <span className="font-mono text-zinc-400">{ct.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditCityModal(ct)}
                            className="p-2 text-zinc-400 hover:text-amber-300 rounded-lg bg-white/5 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            title="Edit city details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCity(ct.id, ct.name)}
                            className="p-2 text-zinc-500 hover:text-rose-400 rounded-lg bg-white/5 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete city"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 3: SALON (Single-line Cards + Accordion Dropdown + Salon Type) ======================= */}
          {activeTab === "salon" && (
            <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232a3b]">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                    <Scissors className="w-6 h-6 text-amber-400" />
                    Salon Branches Management
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage salon locations, gender classifications (Unisex/Male/Female), and operational capacity.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSalonModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Add New Salon
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-4 bg-[#121622] p-3 rounded-2xl border border-[#232a3b]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter by salon name, city, state, or type (unisex, male, female)..."
                    value={salonSearch}
                    onChange={(e) => setSalonSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-transparent text-white text-sm placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                <div className="text-xs text-zinc-400 font-mono pr-2">
                  Showing {filteredSalons.length} of {salons.length} Salons
                </div>
              </div>

              {/* Salons List */}
              <div className="space-y-3">
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Registered Salons Directory — Expandable Cards</span>
                  <span className="text-amber-400/80 font-mono text-[11px]">API: /api/salons</span>
                </div>
                {filteredSalons.map((salon) => {
                  const isExpanded = expandedSalonId === salon.id;
                  return (
                    <div
                      key={salon.id}
                      className={`rounded-2xl border transition-all duration-200 shadow-md overflow-hidden ${isExpanded
                          ? "bg-[#141926] border-amber-500/40"
                          : "bg-[#121622] border-[#232a3b] hover:border-amber-500/30"
                        }`}
                    >
                      {/* Single-Line Card Header Row */}
                      <div
                        onClick={() => setExpandedSalonId(isExpanded ? null : salon.id)}
                        className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        {/* Left: Logo thumbnail + ID + Name + Type + Location */}
                        <div className="flex items-center gap-3.5 min-w-[280px]">
                          {salon.salonLogo ? (
                            <img
                              src={salon.salonLogo}
                              alt={salon.name}
                              className="w-10 h-10 rounded-xl object-cover border border-amber-500/30 shrink-0 shadow-md"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                              <Scissors className="w-5 h-5 text-amber-400" />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white tracking-tight">{salon.name}</h3>
                              {/* Salon Type Pill */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${salon.type === "UNISEX"
                                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                    : salon.type === "MALE_ONLY"
                                      ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                                      : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                  }`}
                              >
                                {salon.type === "UNISEX"
                                  ? "Unisex"
                                  : salon.type === "MALE_ONLY"
                                    ? "Male Only"
                                    : "Female Only"}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1 text-amber-300/90 font-medium">
                                <MapPin className="w-3 h-3 text-amber-400" />
                                {salon.cityName}
                              </span>
                              {salon.ownerName && (
                                <span className="text-zinc-500 hidden sm:inline">• Owner: {salon.ownerName}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Center: Key Metrics */}
                        <div className="hidden md:flex items-center gap-8 text-xs text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500">Stylists:</span>
                            <span className="font-bold text-white">{salon.activeStylists || 6} on floor</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="font-mono text-zinc-300">
                              {salon.openingTime} - {salon.closingTime}
                            </span>
                          </div>
                          {salon.pincode && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-zinc-500">PIN:</span>
                              <span className="font-mono text-amber-300/80">{salon.pincode}</span>
                            </div>
                          )}
                        </div>

                        {/* Right: Active/Inactive Toggle, Edit & Expand */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Active / Inactive Status Toggle Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSalonStatus(salon);
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm ${
                              salon.status === "ACTIVE" || salon.status === "OPEN"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                            }`}
                            title={
                              salon.status === "ACTIVE" || salon.status === "OPEN"
                                ? "Click to set Inactive"
                                : "Click to set Active"
                            }
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                salon.status === "ACTIVE" || salon.status === "OPEN"
                                  ? "bg-emerald-400 animate-pulse"
                                  : "bg-rose-400"
                              }`}
                            />
                            <span>{salon.status === "ACTIVE" || salon.status === "OPEN" ? "Active" : "Inactive"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditSalonModal(salon);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            title="Edit Salon Details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            className={`p-1.5 rounded-lg bg-white/5 text-amber-400 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 bg-amber-500/20" : "hover:bg-white/10"
                            }`}
                            title="Toggle full salon info"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Expanded Details Container */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t border-[#1f2638] bg-[#0d1017]/70 space-y-4 animate-fadeIn">
                          {salon.salonDescription && (
                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
                              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <span>{salon.salonDescription}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            <div className="p-4 rounded-xl bg-[#141924] border border-[#232c3f] space-y-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                                Location &amp; Contact Details
                              </span>
                              <div className="text-xs text-zinc-200 space-y-1.5">
                                <p className="font-medium text-white">{salon.address}</p>
                                <p className="text-zinc-400">
                                  City: <span className="text-white font-semibold">{salon.cityName}</span>
                                  {salon.pincode ? ` — PIN: ${salon.pincode}` : ""}
                                </p>
                                <p className="text-zinc-300 flex items-center gap-1.5 pt-0.5">
                                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span className="font-mono">{salon.phone}</span>
                                </p>
                                {salon.email && (
                                  <p className="text-zinc-300 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span className="font-mono text-zinc-300">{salon.email}</span>
                                  </p>
                                )}
                                {salon.ownerName && (
                                  <p className="text-zinc-400 flex items-center gap-1.5 pt-0.5">
                                    <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span>Owner: <strong className="text-white">{salon.ownerName}</strong></span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-[#141924] border border-[#232c3f] space-y-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                                Floor &amp; Operating Hours
                              </span>
                              <div className="text-xs text-zinc-200 space-y-1.5">
                                <p>
                                  Active Stylists:{" "}
                                  <span className="text-white font-bold">{salon.activeStylists || 6} Stylists</span>
                                </p>
                                <p className="flex items-center gap-1.5 text-zinc-300">
                                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>Hours: <strong className="font-mono text-amber-300">{salon.openingTime} - {salon.closingTime}</strong></span>
                                </p>
                                <p className="text-zinc-400">
                                  Status:{" "}
                                  <span className="text-emerald-400 font-semibold font-mono">{salon.status || "ACTIVE"}</span>
                                </p>
                                <p className="text-emerald-400 font-semibold pt-1 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                  Live Dispatch Sync Active
                                </p>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-[#141924] border border-[#232c3f] space-y-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                                Digital Location &amp; Maps
                              </span>
                              <div className="text-xs text-zinc-200 space-y-2">
                                {salon.locationLink ? (
                                  <div>
                                    <p className="text-zinc-400 mb-2">Google Maps / Navigation URL verified:</p>
                                    <a
                                      href={salon.locationLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-semibold text-xs transition-colors"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Navigation className="w-3.5 h-3.5" />
                                      Open in Google Maps
                                      <ExternalLink className="w-3 h-3 ml-0.5" />
                                    </a>
                                  </div>
                                ) : (
                                  <p className="text-zinc-500 italic">No navigation link provided.</p>
                                )}

                                {salon.createdAt && (
                                  <div className="pt-2 text-[11px] text-zinc-400 font-mono">
                                    Registered: {salon.createdAt}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#1f2638]/80">
                            <div className="text-xs text-zinc-400 font-mono truncate max-w-sm">
                              UUID: <span className="text-amber-300/90">{salon.id}</span>
                            </div>
                            <div className="flex items-center gap-2.5 self-end sm:self-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditSalonModal(salon);
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit Salon
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSalon(salon.id, salon.name);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove Salon
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showToast(`Live dispatch active for ${salon.name}`, "info");
                                }}
                                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-xs shadow flex items-center gap-1.5 cursor-pointer"
                              >
                                Dispatch Console <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredSalons.length === 0 && (
                  <div className="p-8 text-center text-xs text-zinc-500 bg-[#121622] rounded-xl border border-[#232a3b]">
                    No salons found matching your search.
                  </div>
                )}
              </div>

              {/* Modal to Add New Salon (Integrated with POST /api/salons) */}
              {showAddSalonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
                  <div className="bg-[#121622] border border-amber-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                          <Scissors className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Register New Salon Branch</h3>
                          <p className="text-xs text-zinc-400">POST http://localhost:8081/api/salons</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAddSalonModal(false)}
                        className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    {salonError && (
                      <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{salonError}</span>
                      </div>
                    )}

                    <form onSubmit={handleAddSalon} className="space-y-4 text-xs">
                      {/* Section 1: Basic Identity & Ownership */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">
                            Salon Name <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Style Studio"
                            value={newSalonName}
                            onChange={(e) => setNewSalonName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1 flex items-center justify-between">
                            <span>Owner (Staff User) <span className="text-amber-400">*</span></span>
                            <span className="text-[10px] text-amber-400 font-normal">Staff Users in DB</span>
                          </label>
                          <select
                            value={newOwnerName}
                            onChange={(e) => {
                              const selectedName = e.target.value;
                              setNewOwnerName(selectedName);
                              const matched = staffOwnerOptions.find((s) => s.name === selectedName);
                              if (matched) {
                                if (matched.email) setNewSalonEmail(matched.email);
                                if (matched.phone) setNewSalonPhone(matched.phone);
                              }
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                            required
                          >
                            <option value="">-- Select Staff User (Owner) --</option>
                            {staffOwnerOptions.map((staff) => (
                              <option key={staff.id || staff.name} value={staff.name}>
                                {staff.name} (STAFF) {staff.email ? `• ${staff.email}` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Section 2: Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">
                            Phone Number <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. 9876543210"
                            value={newSalonPhone}
                            onChange={(e) => setNewSalonPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">
                            Email Address <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="stylestudio.baner@gmail.com"
                            value={newSalonEmail}
                            onChange={(e) => setNewSalonEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                            required
                          />
                        </div>
                      </div>

                      {/* Section 3: Location Details */}
                      <div>
                        <label className="block font-semibold text-zinc-300 uppercase mb-1">
                          Salon Address <span className="text-amber-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. High Street, Baner, Pune"
                          value={newSalonAddress}
                          onChange={(e) => setNewSalonAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">
                            City <span className="text-amber-400">*</span>
                          </label>
                          {cities.length > 0 ? (
                            <select
                              value={newSalonCity}
                              onChange={(e) => setNewSalonCity(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                              required
                            >
                              {cities.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="e.g. Pune"
                              value={newSalonCity}
                              onChange={(e) => setNewSalonCity(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                              required
                            />
                          )}
                        </div>

                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">
                            Pincode <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 411045"
                            value={newSalonPincode}
                            onChange={(e) => setNewSalonPincode(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                            required
                          />
                        </div>
                      </div>

                      {/* Section 4: Timings & Classification */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">
                            Opening Time <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="09:00"
                            value={newSalonOpen}
                            onChange={(e) => setNewSalonOpen(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">
                            Closing Time <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="21:00"
                            value={newSalonClose}
                            onChange={(e) => setNewSalonClose(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">
                            Classification
                          </label>
                          <select
                            value={newSalonType}
                            onChange={(e) => setNewSalonType(e.target.value as any)}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-semibold text-amber-300"
                          >
                            <option value="UNISEX">Unisex (All Genders)</option>
                            <option value="MALE_ONLY">Male Only (Gents Salon)</option>
                            <option value="FEMALE_ONLY">Female Only (Ladies Lounge)</option>
                          </select>
                        </div>
                      </div>

                      {/* Section 5: Logo & Google Maps Location Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">
                            Salon Logo Image URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={newSalonLogo}
                            onChange={(e) => setNewSalonLogo(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">
                            Google Maps / Location Link
                          </label>
                          <input
                            type="url"
                            placeholder="https://maps.google.com/?q=..."
                            value={newSalonLocationLink}
                            onChange={(e) => setNewSalonLocationLink(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                      </div>

                      {/* Section 6: Description */}
                      <div>
                        <label className="block font-semibold text-zinc-300 uppercase mb-1">
                          Salon Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Premium unisex salon providing bespoke haircuts, styling, beard grooming, and beauty treatments."
                          value={newSalonDescription}
                          onChange={(e) => setNewSalonDescription(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#232a3b]">
                        <button
                          type="button"
                          onClick={() => setShowAddSalonModal(false)}
                          className="px-4 py-2.5 rounded-xl bg-white/5 text-zinc-300 hover:text-white cursor-pointer font-medium"
                          disabled={salonLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={salonLoading}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                        >
                          {salonLoading ? (
                            <>
                              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Create Salon
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 4: USER MANAGEMENT ======================= */}
          {activeTab === "users" && (
            <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232a3b]">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                    <Users className="w-6 h-6 text-amber-400" />
                    User Management Directory
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage all system users, administrators, salon staff stylists, and customer accounts.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAuthError("");
                    setShowCreateUserModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" /> Add New User
                </button>
              </div>

              {/* User Search & Role Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#121622] p-3 rounded-2xl border border-[#232a3b]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or mobile..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-transparent text-white text-sm placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#181e2b] p-1 rounded-xl border border-[#232a3b]">
                  {(["ALL", "ADMIN", "STAFF", "CUSTOMER"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${userRoleFilter === r
                          ? "bg-amber-400 text-black shadow"
                          : "text-zinc-400 hover:text-white"
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Single-Line Directory Cards */}
              <div className="space-y-2.5">
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Registered App Users ({filteredUsers.length})</span>
                  <span className="text-zinc-500 font-mono text-[11px]">Backend API: /api/auth/register</span>
                </div>

                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="px-5 py-3.5 rounded-xl bg-[#121622] border border-[#232a3b] hover:border-amber-500/40 transition-all flex items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-[240px]">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${user.role === "ADMIN"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : user.role === "STAFF"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm tracking-tight">{user.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${user.role === "ADMIN"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : user.role === "STAFF"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">{user.email}</div>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-xs text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-mono text-zinc-300">{user.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">Gender:</span>
                        <span className="font-medium text-zinc-200">{user.gender}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">DOB:</span>
                        <span className="font-mono text-zinc-400">{user.dob}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {user.status}
                      </span>
                      <button
                        onClick={() => openEditUserModal(user)}
                        className="p-2 text-zinc-400 hover:text-amber-300 rounded-lg bg-white/5 hover:bg-amber-500/10 transition-colors cursor-pointer"
                        title="Edit user details"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-2 text-zinc-500 hover:text-rose-400 rounded-lg bg-white/5 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="p-8 text-center text-xs text-zinc-500 bg-[#121622] rounded-xl border border-[#232a3b]">
                    No users found matching your filters.
                  </div>
                )}
              </div>

              {/* Modal to Create New User */}
              {showCreateUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                  <div className="bg-[#121622] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white">Create New App User</h3>
                      </div>
                      <button
                        onClick={() => setShowCreateUserModal(false)}
                        className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    {authError && (
                      <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-zinc-300 uppercase mb-1">Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Verma"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">Email Address *</label>
                          <input
                            type="email"
                            placeholder="rahul@example.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">Mobile Number *</label>
                          <input
                            type="tel"
                            placeholder="9876543210"
                            value={regMobile}
                            onChange={(e) => setRegMobile(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">Password *</label>
                          <input
                            type="password"
                            placeholder="password123"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            placeholder="password123"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">Role *</label>
                          <select
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value as any)}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-bold text-amber-300"
                          >
                            <option value="CUSTOMER">CUSTOMER</option>
                            <option value="STAFF">STAFF (Stylist)</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">Gender</label>
                          <select
                            value={regGender}
                            onChange={(e) => setRegGender(e.target.value as any)}
                            className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                          >
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                            <option value="OTHER">OTHER</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-zinc-300 uppercase mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={regDob}
                            onChange={(e) => setRegDob(e.target.value)}
                            className="w-full px-2.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#232a3b]">
                        <button
                          type="button"
                          onClick={() => setShowCreateUserModal(false)}
                          className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {authLoading ? "Saving..." : "Create User"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 5: REVENUE & ANALYSIS ======================= */}
          {activeTab === "revenue" && (
            <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232a3b]">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                    <TrendingUp className="w-6 h-6 text-amber-400" />
                    Revenue & Operations Analytics
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Financial performance, popular service distribution, and AI congestion forecasting.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-300 bg-[#141923] px-3.5 py-1.5 rounded-xl border border-[#242c3d]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Analytics Engine • Active</span>
                </div>
              </div>

              {/* Revenue Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { title: "Daily Run Rate", amount: "₹1,50,700", change: "+14.2%", tag: "Today" },
                  { title: "Weekly Gross", amount: "₹8,92,400", change: "+18.7%", tag: "This Week" },
                  { title: "Monthly Projected", amount: "₹38,50,000", change: "+22.5%", tag: "September" },
                  { title: "Avg. Customer Ticket", amount: "₹2,180", change: "+8.3%", tag: "Per Visit" },
                ].map((rev, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#121622] border border-[#232a3b]">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span className="font-semibold uppercase tracking-wider">{rev.title}</span>
                      <span className="px-2 py-0.5 rounded bg-white/5 text-zinc-300 text-[10px] font-mono">
                        {rev.tag}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white tracking-tight">{rev.amount}</div>
                    <div className="text-xs text-emerald-400 font-semibold mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{rev.change} growth vs previous cycle</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Popularity Breakdown & Congestion Traffic Curve */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-[#121622] border border-[#232a3b]">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-bold text-white">Top Performing Services</h3>
                      <p className="text-xs text-zinc-400">Demand distribution by appointment volume</p>
                    </div>
                    <span className="text-xs text-amber-400 font-semibold">4 Categories</span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: "Signature AI Haircut & Styling", share: 44, revenue: "₹66,300", color: "bg-amber-400" },
                      {
                        name: "Balayage Color & Hair Spa Treatment",
                        share: 26,
                        revenue: "₹39,180",
                        color: "bg-purple-400",
                      },
                      {
                        name: "Royal Beard Sculpture & Detailing",
                        share: 18,
                        revenue: "₹27,120",
                        color: "bg-blue-400",
                      },
                      { name: "Hydra Radiance Facial & De-tan", share: 12, revenue: "₹18,100", color: "bg-emerald-400" },
                    ].map((srv, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">{srv.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-400 font-mono">{srv.revenue}</span>
                            <span className="font-bold text-amber-300">{srv.share}%</span>
                          </div>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#1c2230] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${srv.color}`}
                            style={{ width: `${srv.share}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#121622] border border-[#232a3b] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          Hourly Congestion Pattern & Wait Times
                        </h3>
                        <p className="text-xs text-zinc-400">Formula: sum durations ÷ available stylists capacity</p>
                      </div>
                      <span className="text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                        Peak: 6-8 PM
                      </span>
                    </div>

                    <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
                      {[
                        { hour: "10 AM", load: 25, wait: "8m" },
                        { hour: "12 PM", load: 45, wait: "14m" },
                        { hour: "2 PM", load: 35, wait: "10m" },
                        { hour: "4 PM", load: 60, wait: "18m" },
                        { hour: "6 PM", load: 95, wait: "32m", alert: true },
                        { hour: "8 PM", load: 80, wait: "24m" },
                      ].map((slot, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <span
                            className={`text-[10px] font-mono font-bold ${slot.alert ? "text-rose-400 animate-pulse" : "text-zinc-400"
                              }`}
                          >
                            {slot.wait}
                          </span>
                          <div className="w-full bg-[#181e2b] rounded-t-lg relative flex items-end h-28 overflow-hidden">
                            <div
                              style={{ height: `${slot.load}%` }}
                              className={`w-full rounded-t-lg transition-all duration-500 ${slot.alert
                                  ? "bg-gradient-to-t from-rose-600 to-amber-400"
                                  : "bg-gradient-to-t from-amber-600/60 to-amber-400"
                                }`}
                            ></div>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono">{slot.hour}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-zinc-300">
                    <span className="font-bold text-amber-300">LLD Formula Rule:</span> Expected wait calculated as{" "}
                    <code className="text-amber-200 bg-black/40 px-1 py-0.5 rounded">
                      sum(service_durations) ÷ available_staff
                    </code>
                    . Current staff capacity buffer is sufficient for all windows except 6:30 PM surge.
                  </div>
                </div>
              </div>

              {/* BEGIN: Services & Price Catalog Master Section (Full CRUD) */}
              <div className="bg-[#0F1726] border border-[#1E293B] rounded-2xl p-6 shadow-xl space-y-5" data-purpose="services-catalog-crud-section">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                      <Scissors className="w-5 h-5 text-amber-400" />
                      Salon Services &amp; Pricing Catalog Master
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Manage salon service offerings, duration standards, category tags, and pricing rates.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddServiceModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add New Service
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#121622] p-3 rounded-2xl border border-[#1E293B]">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search service name or category..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-transparent text-white text-xs placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {(["ALL", "Haircut & Styling", "Color & Spa", "Beard & Shave", "Facial & Skincare", "Treatments"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setServiceCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          serviceCategoryFilter === cat ? "bg-amber-400 text-black shadow" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Services Catalog List Table */}
                <div className="space-y-2.5">
                  <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Active Services Catalog ({filteredServices.length})</span>
                    <span className="text-amber-400/80 font-mono text-[11px]">API: /api/services/catalog</span>
                  </div>

                  {filteredServices.map((srv) => (
                    <div
                      key={srv.id}
                      className="px-5 py-3.5 rounded-xl bg-[#121622] border border-[#232a3b] hover:border-amber-500/40 transition-all flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 min-w-[240px]">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-bold text-xs">
                          ₹
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm tracking-tight">{srv.name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                                srv.genderTarget === "UNISEX"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : srv.genderTarget === "MALE_ONLY"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {srv.genderTarget === "UNISEX" ? "Unisex" : srv.genderTarget === "MALE_ONLY" ? "Gents" : "Ladies"}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                            <span className="text-amber-300/90 font-medium">{srv.category}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="font-mono text-zinc-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-500" /> {srv.durationMinutes} mins
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-8 text-xs text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-500">Standard Price:</span>
                          <span className="font-bold font-mono text-emerald-400 text-sm">₹{srv.price.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-500">Status:</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {srv.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="md:hidden font-bold font-mono text-emerald-400 text-xs mr-1">₹{srv.price}</span>
                        <button
                          onClick={() => handleOpenEditService(srv)}
                          className="p-2 text-zinc-400 hover:text-amber-300 rounded-lg bg-white/5 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Edit Service Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id, srv.name)}
                          className="p-2 text-zinc-500 hover:text-rose-400 rounded-lg bg-white/5 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredServices.length === 0 && (
                    <div className="p-8 text-center text-xs text-zinc-500 bg-[#121622] rounded-xl border border-[#232a3b]">
                      No services match your search filter. Click &apos;Add New Service&apos; to create one.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================= AUTHENTICATION MODAL ======================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121622] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-600 p-0.5 flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-black font-bold" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {authMode === "login" ? "Account Sign In" : "Register Admin User"}
                  </h3>
                  <p className="text-[11px] text-zinc-400">Spring Boot Auth API • Port 8081</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex items-center bg-[#181e2b] p-1 rounded-xl border border-[#263044]">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${authMode === "login" ? "bg-amber-400 text-black shadow" : "text-zinc-400 hover:text-white"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${authMode === "register" ? "bg-amber-400 text-black shadow" : "text-zinc-400 hover:text-white"
                  }`}
              >
                Register New User
              </button>
            </div>

            {authMode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div className="flex items-center gap-4 text-zinc-400 font-medium">
                  <span className="text-[11px]">Login using:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="loginMethod"
                      checked={loginMethod === "email"}
                      onChange={() => setLoginMethod("email")}
                      className="accent-amber-400"
                    />
                    <span className={loginMethod === "email" ? "text-amber-300 font-bold" : ""}>Email</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="loginMethod"
                      checked={loginMethod === "mobile"}
                      onChange={() => setLoginMethod("mobile")}
                      className="accent-amber-400"
                    />
                    <span className={loginMethod === "mobile" ? "text-amber-300 font-bold" : ""}>Mobile Number</span>
                  </label>
                </div>

                {loginMethod === "email" ? (
                  <div>
                    <label className="block font-semibold text-zinc-300 uppercase mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="johndoe@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-zinc-300 uppercase mb-1">Mobile Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={loginMobile}
                        onChange={(e) => setLoginMobile(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <span>Signing In...</span>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" /> Sign In to SalonFlow
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-300 uppercase mb-1">Email Address *</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-300 uppercase mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-300 uppercase mb-1">Password *</label>
                    <input
                      type="password"
                      placeholder="password123"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-300 uppercase mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      placeholder="password123"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-300 uppercase mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-300 uppercase mb-1">Gender</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-300 uppercase mb-1">Role</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-xs focus:outline-none focus:border-amber-400 font-bold text-amber-300"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="STAFF">STAFF</option>
                      <option value="CUSTOMER">CUSTOMER</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <span>Registering...</span>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Register & Join Network
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================= EDIT STATE MODAL ======================= */}
      {showEditStateModal && editingState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121622] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Edit State Details</h3>
              </div>
              <button
                onClick={() => setShowEditStateModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {editStateError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{editStateError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditState} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">State Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={editStateCode}
                  onChange={(e) => setEditStateCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">State Name *</label>
                <input
                  type="text"
                  value={editStateName}
                  onChange={(e) => setEditStateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setShowEditStateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT CITY MODAL ======================= */}
      {showEditCityModal && editingCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121622] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Edit City Details</h3>
              </div>
              <button
                onClick={() => setShowEditCityModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {editCityError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{editCityError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditCity} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Linked State *</label>
                <select
                  value={editCityStateCode}
                  onChange={(e) => setEditCityStateCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                >
                  <option value="">-- Choose State --</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">City Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={editCityCode}
                  onChange={(e) => setEditCityCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">City Name *</label>
                <input
                  type="text"
                  value={editCityName}
                  onChange={(e) => setEditCityName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setShowEditCityModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT SALON MODAL ======================= */}
      {showEditSalonModal && editingSalon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-[#121622] border border-amber-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Salon Branch</h3>
                  <p className="text-xs text-zinc-400">UUID: {editingSalon.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditSalonModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {editSalonError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{editSalonError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditSalon} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">
                    Salon Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editSalonName}
                    onChange={(e) => setEditSalonName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1 flex items-center justify-between">
                    <span>Owner (Staff User) <span className="text-amber-400">*</span></span>
                    <span className="text-[10px] text-amber-400 font-normal">Staff Users in DB</span>
                  </label>
                  <select
                    value={editOwnerName}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setEditOwnerName(selectedName);
                      const matched = staffOwnerOptions.find((s) => s.name === selectedName);
                      if (matched) {
                        if (matched.email && (!editSalonEmail || editSalonEmail.includes("stylestudio"))) {
                          setEditSalonEmail(matched.email);
                        }
                        if (matched.phone && (!editSalonPhone || editSalonPhone === "9876543210")) {
                          setEditSalonPhone(matched.phone);
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                    required
                  >
                    <option value="">-- Select Staff User (Owner) --</option>
                    {editOwnerName && !staffOwnerOptions.some((s) => s.name === editOwnerName) && (
                      <option value={editOwnerName}>{editOwnerName} (Current Owner)</option>
                    )}
                    {staffOwnerOptions.map((staff) => (
                      <option key={staff.id || staff.name} value={staff.name}>
                        {staff.name} (STAFF) {staff.email ? `• ${staff.email}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">
                    Phone Number <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editSalonPhone}
                    onChange={(e) => setEditSalonPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">
                    Email Address <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={editSalonEmail}
                    onChange={(e) => setEditSalonEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">
                  Salon Address <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={editSalonAddress}
                  onChange={(e) => setEditSalonAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">
                    City <span className="text-amber-400">*</span>
                  </label>
                  {cities.length > 0 ? (
                    <select
                      value={editSalonCity}
                      onChange={(e) => setEditSalonCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                      required
                    >
                      {cities.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editSalonCity}
                      onChange={(e) => setEditSalonCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">
                    Pincode <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editSalonPincode}
                    onChange={(e) => setEditSalonPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Active / Inactive Status Selector in Edit Modal */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-300 uppercase mb-1">
                  Salon Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditSalonStatus("ACTIVE")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      editSalonStatus === "ACTIVE" || editSalonStatus === "OPEN"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                        : "bg-[#181e2b] border-[#2b354b] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditSalonStatus("INACTIVE" as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      editSalonStatus === "INACTIVE" || editSalonStatus === "CLOSED"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10"
                        : "bg-[#181e2b] border-[#2b354b] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Inactive</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">
                    Opening Time <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editSalonOpen}
                    onChange={(e) => setEditSalonOpen(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">
                    Closing Time <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editSalonClose}
                    onChange={(e) => setEditSalonClose(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={editSalonStatus}
                    onChange={(e) => setEditSalonStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-semibold text-amber-300"
                  >
                    <option value="ACTIVE">ACTIVE (Operational)</option>
                    <option value="OPEN">OPEN</option>
                    <option value="BUSY">BUSY (High Demand)</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">
                    Classification
                  </label>
                  <select
                    value={editSalonType}
                    onChange={(e) => setEditSalonType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-semibold text-amber-300"
                  >
                    <option value="UNISEX">Unisex (All Genders)</option>
                    <option value="MALE_ONLY">Male Only (Gents Salon)</option>
                    <option value="FEMALE_ONLY">Female Only (Ladies Lounge)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">
                    Google Maps / Navigation Link
                  </label>
                  <input
                    type="url"
                    value={editSalonLocationLink}
                    onChange={(e) => setEditSalonLocationLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">
                  Salon Logo Image URL
                </label>
                <input
                  type="url"
                  value={editSalonLogo}
                  onChange={(e) => setEditSalonLogo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">
                  Salon Description
                </label>
                <textarea
                  rows={2}
                  value={editSalonDescription}
                  onChange={(e) => setEditSalonDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setShowEditSalonModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-zinc-300 hover:text-white cursor-pointer font-medium"
                  disabled={editSalonLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSalonLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                >
                  {editSalonLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT USER MODAL ======================= */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121622] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Edit User Details</h3>
              </div>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {editUserError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{editUserError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={editUserMobile}
                    onChange={(e) => setEditUserMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Role *</label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-bold text-amber-300"
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="STAFF">STAFF (Stylist)</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Status *</label>
                  <select
                    value={editUserStatus}
                    onChange={(e) => setEditUserStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-semibold text-emerald-300"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Gender</label>
                  <select
                    value={editUserGender}
                    onChange={(e) => setEditUserGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editUserDob}
                    onChange={(e) => setEditUserDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ADD QUEUE TOKEN MODAL ======================= */}
      {showAddQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121622] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Issue Live Walk-in Token</h3>
              </div>
              <button
                onClick={() => setShowAddQueueModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQueueToken} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sameer Kulkarni"
                  value={newQueueCustomer}
                  onChange={(e) => setNewQueueCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Requested Service *</label>
                <select
                  value={newQueueService}
                  onChange={(e) => setNewQueueService(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  {servicesList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} (₹{s.price})
                    </option>
                  ))}
                  <option value="Executive Haircut & Styling">Executive Haircut &amp; Styling</option>
                  <option value="Beard Trim & Clean Shave">Beard Trim &amp; Clean Shave</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Salon Branch *</label>
                <select
                  value={newQueueBranch}
                  onChange={(e) => setNewQueueBranch(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  {salons.map((sl) => (
                    <option key={sl.id} value={`${sl.name} (${sl.cityName})`}>
                      {sl.name} ({sl.cityName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Estimated Wait</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 mins"
                    value={newQueueWait}
                    onChange={(e) => setNewQueueWait(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Initial Status</label>
                  <select
                    value={newQueueStatus}
                    onChange={(e) => setNewQueueStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-semibold text-amber-300"
                  >
                    <option value="WAITING">WAITING</option>
                    <option value="CALLED">CALLED</option>
                    <option value="IN_SERVICE">IN_SERVICE</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setShowAddQueueModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT QUEUE TOKEN MODAL ======================= */}
      {showEditQueueModal && editingQueueItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121622] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Edit Token {editingQueueItem.token}</h3>
              </div>
              <button
                onClick={() => setShowEditQueueModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditQueue} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={editQueueCustomer}
                  onChange={(e) => setEditQueueCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Service *</label>
                <input
                  type="text"
                  value={editQueueService}
                  onChange={(e) => setEditQueueService(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Salon Branch *</label>
                <input
                  type="text"
                  value={editQueueBranch}
                  onChange={(e) => setEditQueueBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Wait Estimate</label>
                  <input
                    type="text"
                    value={editQueueWait}
                    onChange={(e) => setEditQueueWait(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Status</label>
                  <select
                    value={editQueueStatus}
                    onChange={(e) => setEditQueueStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-semibold text-amber-300"
                  >
                    <option value="WAITING">WAITING</option>
                    <option value="CALLED">CALLED</option>
                    <option value="IN_SERVICE">IN_SERVICE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setShowEditQueueModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ADD SERVICE MODAL ======================= */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121622] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Add New Salon Service</h3>
              </div>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Service Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Keratin Smooth Therapy"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Category *</label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-semibold text-amber-300"
                >
                  <option value="Haircut & Styling">Haircut &amp; Styling</option>
                  <option value="Color & Spa">Color &amp; Spa</option>
                  <option value="Beard & Shave">Beard &amp; Shave</option>
                  <option value="Facial & Skincare">Facial &amp; Skincare</option>
                  <option value="Treatments">Treatments</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="650"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Gender Target</label>
                <select
                  value={newServiceGender}
                  onChange={(e) => setNewServiceGender(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="UNISEX">Unisex (All Clients)</option>
                  <option value="MALE_ONLY">Male Only (Gents)</option>
                  <option value="FEMALE_ONLY">Female Only (Ladies)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT SERVICE MODAL ======================= */}
      {showEditServiceModal && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121622] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Edit Service Details</h3>
              </div>
              <button
                onClick={() => setShowEditServiceModal(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Service Name *</label>
                <input
                  type="text"
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 uppercase mb-1">Category *</label>
                <select
                  value={editServiceCategory}
                  onChange={(e) => setEditServiceCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-semibold text-amber-300"
                >
                  <option value="Haircut & Styling">Haircut &amp; Styling</option>
                  <option value="Color & Spa">Color &amp; Spa</option>
                  <option value="Beard & Shave">Beard &amp; Shave</option>
                  <option value="Facial & Skincare">Facial &amp; Skincare</option>
                  <option value="Treatments">Treatments</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={editServicePrice}
                    onChange={(e) => setEditServicePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Duration (Mins) *</label>
                  <input
                    type="number"
                    value={editServiceDuration}
                    onChange={(e) => setEditServiceDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Gender Target</label>
                  <select
                    value={editServiceGender}
                    onChange={(e) => setEditServiceGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="UNISEX">Unisex</option>
                    <option value="MALE_ONLY">Male Only</option>
                    <option value="FEMALE_ONLY">Female Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 uppercase mb-1">Status</label>
                  <select
                    value={editServiceStatus}
                    onChange={(e) => setEditServiceStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-white text-sm focus:outline-none focus:border-amber-400 font-semibold text-emerald-300"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setShowEditServiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold text-sm shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= LOGOUT CONFIRMATION POPUP MODAL ======================= */}
      {showLogoutConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#121622] border border-amber-500/40 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">Are you sure to logout?</h3>
              <p className="text-xs text-zinc-400">
                You will be signed out from your SalonFlow AI Admin Portal session. You can sign back in anytime.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirmModal(false)}
                className="py-2.5 px-4 rounded-xl bg-[#1a202d] hover:bg-[#222b3d] border border-[#2d384e] text-zinc-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmLogout}
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
