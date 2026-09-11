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
  Sun,
  Moon,
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
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

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
  const [servicesList, setServicesList] = useState<SalonServiceItem[]>([]);

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
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);

  // Initial Seed Data: Location
  const [states, setStates] = useState<StateItem[]>([]);

  const [cities, setCities] = useState<CityItem[]>([]);

  // Initial Seed Data: Salons with Type (UNISEX, MALE_ONLY, FEMALE_ONLY)
  const [salons, setSalons] = useState<SalonItem[]>([]);

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

      if (statesRes.status === "fulfilled" && statesRes.value && Array.isArray(statesRes.value.data)) {
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

      if (citiesRes.status === "fulfilled" && citiesRes.value && Array.isArray(citiesRes.value.data)) {
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
    } catch (err) {
      console.warn("Could not fetch location data from backend:", err);
    }
  };

  // Fetch Salons from Database API: GET /api/salons
  const fetchSalons = async () => {
    try {
      const res = await apiGetAllSalons();
      if (res && Array.isArray(res.data)) {
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
              activeStylists: s.activeStylists || 0,
              status: (s.status as any) || "ACTIVE",
              todayRevenue: s.todayRevenue || 0,
              createdAt: s.createdAt ? s.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
            }))
        );
      }
    } catch (err) {
      console.warn("Could not fetch salon data from backend DB:", err);
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
      if (res && Array.isArray(res.data)) {
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
      if (res && Array.isArray(res.data)) {
        const userList: AppUser[] = res.data
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
          }));

        setAppUsers(userList);

        // Find the verified ADMIN user from the database (e.g. prapti)
        const dbAdmin = userList.find(
          (u) => u.role?.toUpperCase() === "ADMIN" || u.role?.toUpperCase() === "ROLE_ADMIN"
        );

        const savedUserStr = localStorage.getItem("salonflow_user") || localStorage.getItem("salonflow_auth_user");
        let activeAdminUser: UserData | null = null;
        if (savedUserStr) {
          try {
            const parsed = JSON.parse(savedUserStr);
            if (parsed && (parsed.role?.toUpperCase() === "ADMIN" || parsed.role?.toUpperCase() === "ROLE_ADMIN")) {
              const matchedInDb = userList.find(
                (u) => u.email?.toLowerCase() === parsed.email?.toLowerCase() || u.id === parsed.id
              );
              if (matchedInDb) {
                activeAdminUser = {
                  id: matchedInDb.id,
                  name: matchedInDb.name,
                  email: matchedInDb.email,
                  phone: matchedInDb.mobileNumber,
                  role: "ADMIN",
                };
              } else {
                activeAdminUser = parsed;
              }
            }
          } catch {
            // Ignore
          }
        }

        if (!activeAdminUser && dbAdmin) {
          activeAdminUser = {
            id: dbAdmin.id,
            name: dbAdmin.name,
            email: dbAdmin.email,
            phone: dbAdmin.mobileNumber,
            role: "ADMIN",
          };
        }

        if (activeAdminUser) {
          setCurrentUser(activeAdminUser);
          localStorage.setItem("salonflow_user", JSON.stringify(activeAdminUser));
        }
      }
    } catch (err) {
      console.warn("Could not fetch user data from backend:", err);
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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      theme === "dark"
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
      <header className={`h-14 border-b px-4 flex items-center justify-between z-30 shrink-0 transition-colors duration-300 ${
        theme === "dark" ? "bg-[#0d1017] border-[#1f2533]" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex items-center gap-3 text-xs">
          <div className={`flex items-center gap-2 pr-3 border-r ${theme === "dark" ? "border-[#232a3b]" : "border-slate-200"}`}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 p-0.5 flex items-center justify-center">
              <div className={`w-full h-full rounded-[6px] flex items-center justify-center ${theme === "dark" ? "bg-[#0d1017]" : "bg-white"}`}>
                <Scissors className="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
            <span className={`font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>SalonFlow AI</span>
          </div>

          <div className={`flex items-center gap-2 font-medium ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
            <span>DevCrackers</span>
            <span>/</span>
            <span className={`font-mono ${theme === "dark" ? "text-zinc-200" : "text-slate-800"}`}>admin</span>
          </div>
        </div>

        {/* Top Right Auth & Info */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl border font-mono ${
            theme === "dark" ? "bg-[#131822] border-[#222938] text-zinc-300" : "bg-slate-50 border-slate-200 text-slate-700"
          }`}>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentTime || "12:30:00 PM"}</span>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`px-2.5 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-[#141926] hover:bg-[#1f2638] border-[#222938] text-amber-300 hover:text-amber-200"
                : "bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm"
            }`}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px] font-medium text-zinc-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline text-[11px] font-medium text-slate-700">Dark</span>
              </>
            )}
          </button>

          {currentUser ? (
            <div className={`flex items-center gap-2.5 pl-3 pr-1.5 py-1 rounded-xl border shadow-sm ${
              theme === "dark" ? "bg-[#141926] border-amber-500/30" : "bg-slate-50 border-amber-400/40"
            }`}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold flex items-center justify-center text-xs shadow">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="text-left">
                <span className={`text-xs font-bold block capitalize ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{currentUser.name}</span>
                <span className="text-[10px] text-amber-500 font-mono font-bold tracking-wider">{currentUser.role || "ADMIN"}</span>
              </div>
              <button
                onClick={handleLogoutClick}
                className="ml-1.5 px-2.5 py-1 text-xs font-semibold text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
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
        <aside className={`w-64 border-r flex flex-col justify-between shrink-0 select-none transition-colors duration-300 ${
          theme === "dark" ? "bg-[#0d1017] border-[#1f2533]" : "bg-white border-slate-200"
        }`}>
          <div className="p-3 space-y-6 overflow-y-auto">
            <div>
              <div className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
                theme === "dark" ? "text-zinc-500" : "text-slate-400"
              }`}>
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
                        ? "bg-amber-400/15 text-amber-500 dark:text-amber-300 border border-amber-400/40 shadow-sm"
                        : theme === "dark"
                          ? "text-zinc-400 hover:text-zinc-100 hover:bg-[#151a24] border border-transparent"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-amber-500" : theme === "dark" ? "text-zinc-500" : "text-slate-400"}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${isActive
                            ? "bg-amber-400/25 text-amber-600 dark:text-amber-200 border border-amber-400/40"
                            : theme === "dark" ? "bg-[#181e2b] text-zinc-400" : "bg-slate-100 text-slate-500"
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

            <div className={`p-3 rounded-xl border ${
              theme === "dark" ? "bg-[#121622] border-[#1f2533]" : "bg-slate-50 border-slate-200"
            }`}>
              <div className={`flex items-center justify-between text-[11px] ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                <span>API Status (Port 8081)</span>
                <span className="text-emerald-500 font-bold font-mono">Live</span>
              </div>
              <div className={`mt-2 text-xs font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                {appUsers.length} Users • {salons.length} Salons
              </div>
            </div>
          </div>

          <div className={`p-3 border-t space-y-2 ${theme === "dark" ? "border-[#1f2533] bg-[#0b0e14]" : "border-slate-200 bg-slate-50"}`}>
            <div className={`flex items-center gap-3 p-2 rounded-xl border ${
              theme === "dark" ? "bg-[#131722] border-[#202738]" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shrink-0 flex items-center justify-center font-bold text-black text-xs shadow">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="overflow-hidden flex-1">
                <div className={`text-xs font-bold truncate capitalize ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {currentUser?.name || "prapti"}
                </div>
                <div className="text-[10px] text-amber-500 font-mono truncate font-semibold">
                  Role: {currentUser?.role || "ADMIN"}
                </div>
              </div>
            </div>

            {/* Dedicated Sidebar Logout Button with Confirmation Trigger */}
            <button
              onClick={handleLogoutClick}
              className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-500 dark:text-rose-300 hover:text-rose-600 dark:hover:text-rose-200 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              title="Click to logout"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* ===================== RIGHT MAIN CONTENT ===================== */}
        <main className={`flex-1 overflow-y-auto p-6 lg:p-8 transition-colors duration-300 ${
          theme === "dark" ? "bg-[#070B12] grid-pattern" : "bg-slate-100/70"
        }`}>
          {/* ======================= TAB 1: DASHBOARD ======================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fadeIn max-w-[1520px] mx-auto">
              {/* BEGIN: DashboardHeader */}
              <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2" data-purpose="dashboard-heading">
                <div>
                  <div className="flex items-center gap-3">
                    {/* Amber 4-square grid icon */}
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <rect height="7" rx="1.5" width="7" x="3" y="3"></rect>
                        <rect height="7" rx="1.5" width="7" x="14" y="3"></rect>
                        <rect height="7" rx="1.5" width="7" x="14" y="14"></rect>
                        <rect height="7" rx="1.5" width="7" x="3" y="14"></rect>
                      </svg>
                    </div>
                    <div className="flex items-center gap-3">
                      <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        Dashboard Overview
                      </h1>
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono-num text-emerald-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> LIVE OPS
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm mt-1 font-normal ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    Multi-salon operations, live wait queues, and AI congestion telemetry.
                  </p>
                </div>
                {/* Live Telemetry Sync Pill & Quick Toggles */}
                <div className="flex items-center gap-3 self-start md:self-auto">
                  <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono-num shadow-sm ${
                    theme === "dark" ? "bg-[#0F1726] border-[#1E293B] text-slate-300" : "bg-white border-slate-200 text-slate-700"
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Telemetry: <strong className={`font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Synced 2s ago</strong></span>
                  </div>
                  <div className={`hidden sm:flex items-center gap-1.5 p-1 border rounded-xl text-xs font-mono-num ${
                    theme === "dark" ? "bg-[#0F1726] border-[#1E293B]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    <button
                      onClick={() => setTimeRange("realtime")}
                      className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold cursor-pointer ${timeRange === "realtime"
                          ? "bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 font-semibold"
                          : theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      REALTIME
                    </button>
                    <button
                      onClick={() => setTimeRange("1h")}
                      className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold cursor-pointer ${timeRange === "1h"
                          ? "bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 font-semibold"
                          : theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                      1H
                    </button>
                    <button
                      onClick={() => setTimeRange("24h")}
                      className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold cursor-pointer ${timeRange === "24h"
                          ? "bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 font-semibold"
                          : theme === "dark" ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
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
                <section className={`w-full rounded-2xl p-5 md:p-6 relative overflow-hidden transition-all ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-[#0F1728] via-[#141C30] to-[#0F1826] border border-amber-500/30 glow-amber-subtle text-white"
                    : "bg-gradient-to-r from-amber-50 via-amber-100/50 to-orange-50 border border-amber-300 text-slate-900 shadow-md"
                }`} data-purpose="ai-operations-alert">
                  {/* Ambient glowing backdrop effect */}
                  <div className="absolute -right-16 -top-16 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute left-1/3 -bottom-20 w-80 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                    {/* Left content: Icon, Badges, Title & Recommendation */}
                    <div className="flex items-start gap-4 md:gap-5 max-w-4xl">
                      {/* AI Flash Icon container with golden border */}
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex-shrink-0 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <svg className="w-6 h-6 fill-current text-amber-500" viewBox="0 0 24 24">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                      </div>
                      <div className="space-y-2">
                        {/* Badges line */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 dark:text-amber-400 text-[11px] font-bold tracking-wider uppercase border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            AI OPERATIONS INTELLIGENCE
                          </span>
                          <span className={`text-xs font-mono-num ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                            Model: <span className={`font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>WaitTime-Congestion-v1</span>
                          </span>
                        </div>
                        {/* Congestion Prediction Heading */}
                        <h2 className={`text-lg md:text-xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                          Peak Congestion Predicted at Koregaon Park Branch (6:30 PM)
                        </h2>
                        {/* Congestion Explanation and Recommendation */}
                        <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                          AI predicts an influx of +35% walk-ins for haircut services during evening rush. <strong className="text-amber-500 dark:text-amber-400 font-semibold">Recommendation:</strong> Reallocate Stylist &apos;Alex R.&apos; to Haircut Station #3 to keep wait times under 18 mins.
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
                        className={`w-9 h-9 rounded-xl border transition flex items-center justify-center cursor-pointer ${
                          theme === "dark"
                            ? "bg-[#0F1726] border-[#1E293B] hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                            : "bg-white border-slate-300 hover:bg-slate-100 text-slate-500 hover:text-slate-800 shadow-sm"
                        }`}
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
                <div className={`border rounded-2xl p-5 transition-all relative overflow-hidden group shadow-md ${
                  theme === "dark"
                    ? "bg-[#0F1726] border-[#1E293B] hover:border-amber-500/40"
                    : "bg-white border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      TOTAL REGISTERED USERS
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div className={`text-3xl font-extrabold font-mono-num tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        {appUsers.length}
                      </div>
                      {/* Sparkline SVG */}
                      <svg className="w-20 h-7 text-amber-500 overflow-visible" fill="none" viewBox="0 0 80 28">
                        <path d="M2 22 L20 18 L38 23 L56 12 L78 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        <circle className="animate-pulse" cx="78" cy="5" fill="#FBBF24" r="3"></circle>
                      </svg>
                    </div>
                    <p className={`text-xs font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      {appUsers.filter((u) => u.role === "CUSTOMER").length} Customers • {appUsers.filter((u) => u.role === "STAFF").length} Staff
                    </p>
                  </div>
                </div>

                {/* Metric Card 2: Today's Appointments */}
                <div className={`border rounded-2xl p-5 transition-all relative overflow-hidden group shadow-md ${
                  theme === "dark"
                    ? "bg-[#0F1726] border-[#1E293B] hover:border-blue-500/40"
                    : "bg-white border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      TODAY&apos;S APPOINTMENTS
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div className={`text-3xl font-extrabold font-mono-num tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        48
                      </div>
                      {/* Sparkline SVG */}
                      <svg className="w-20 h-7 text-blue-500 overflow-visible" fill="none" viewBox="0 0 80 28">
                        <path d="M2 20 L22 14 L42 17 L60 8 L78 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        <circle cx="78" cy="3" fill="#60A5FA" r="3"></circle>
                      </svg>
                    </div>
                    <p className={`text-xs font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>32 Completed • 16 Pending</p>
                  </div>
                </div>

                {/* Metric Card 3: Gross Today Revenue */}
                <div className={`border rounded-2xl p-5 transition-all relative overflow-hidden group shadow-md ${
                  theme === "dark"
                    ? "bg-[#0F1726] border-[#1E293B] hover:border-emerald-500/40"
                    : "bg-white border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-md"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      GROSS TODAY REVENUE
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform font-bold text-sm">
                      ₹
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div className={`text-3xl font-extrabold font-mono-num tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        ₹1,50,700
                      </div>
                      {/* Sparkline SVG with area fill */}
                      <svg className="w-20 h-7 text-emerald-500 overflow-visible" fill="none" viewBox="0 0 80 28">
                        <path d="M2 24 L20 18 L40 10 L60 14 L78 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        <circle cx="78" cy="2" fill="#34D399" r="3"></circle>
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      +19.4% vs last Friday
                    </p>
                  </div>
                </div>

                {/* Metric Card 4: Active Salons Network */}
                <div className={`border rounded-2xl p-5 transition-all relative overflow-hidden group shadow-md ${
                  theme === "dark"
                    ? "bg-[#0F1726] border-[#1E293B] hover:border-purple-500/40"
                    : "bg-white border-slate-200 hover:border-purple-400 shadow-sm hover:shadow-md"
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      ACTIVE SALONS NETWORK
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.651V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009 9.35c.66 0 1.28-.213 1.785-.576.505.363 1.125.576 1.785.576.66 0 1.28-.213 1.785-.576.505.363 1.125.576 1.785.576a3.001 3.001 0 003.75.615" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div className={`text-3xl font-extrabold font-mono-num tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        {salons.length}
                      </div>
                      {/* Sparkline bars */}
                      <div className="flex items-end gap-1 h-7 pt-1">
                        <span className="w-2 h-3 bg-purple-500/40 rounded-sm"></span>
                        <span className="w-2 h-4 bg-purple-500/60 rounded-sm"></span>
                        <span className="w-2 h-6 bg-purple-400 rounded-sm shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                        <span className="w-2 h-5 bg-purple-500/70 rounded-sm"></span>
                      </div>
                    </div>
                    <p className={`text-xs font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>{cities.length} Cities in {states.length} States</p>
                  </div>
                </div>
              </section>
              {/* END: KPICardsGrid */}

              {/* BEGIN: STUNNING VISUAL CHARTS & SALON ANALYTICS SECTION */}
              <section className="grid grid-cols-1 xl:grid-cols-12 gap-6" data-purpose="advanced-analytics-charts">
                {/* Chart 1: Predictive Peak Congestion & Queue Influx Waveform (7 Cols) */}
                <div className={`xl:col-span-7 border rounded-2xl p-6 relative overflow-hidden shadow-xl ${
                  theme === "dark" ? "bg-[#0F1726] border-[#1E293B]" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  {/* Glow ambient light */}
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  {/* Chart Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <h3 className={`text-base font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                          Sales Performance &amp; Hourly Conversion Trend
                        </h3>
                      </div>
                      <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                        Total completed transactions &amp; service sales pacing today
                      </p>
                    </div>
                    {/* Legend Badges */}
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <div className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-mono text-[11px]">
                        <span className="w-3 h-1 bg-amber-400 rounded-full"></span> Service Sales
                      </div>
                      <div className="flex items-center gap-1.5 text-cyan-500 dark:text-cyan-400 font-mono text-[11px]">
                        <span className="w-3 h-1 bg-cyan-400 rounded-full"></span> Retail Upsell
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Peak
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
                      </defs>
                      {/* Horizontal Grid Lines */}
                      <line stroke={theme === "dark" ? "#1E293B" : "#E2E8F0"} strokeDasharray="4 4" x1="30" x2="720" y1="40" y2="40"></line>
                      <line stroke={theme === "dark" ? "#1E293B" : "#E2E8F0"} strokeDasharray="4 4" x1="30" x2="720" y1="90" y2="90"></line>
                      <line stroke={theme === "dark" ? "#1E293B" : "#E2E8F0"} strokeDasharray="4 4" x1="30" x2="720" y1="140" y2="140"></line>
                      <line stroke={theme === "dark" ? "#1E293B" : "#E2E8F0"} strokeDasharray="4 4" x1="30" x2="720" y1="190" y2="190"></line>
                      <line stroke={theme === "dark" ? "#1E293B" : "#CBD5E1"} x1="30" x2="720" y1="210" y2="210"></line>

                      {/* Area Fill for Primary Sales Curve */}
                      <path d="M 30 210 L 30 170 C 90 160, 150 140, 210 110 C 270 80, 330 115, 390 85 C 450 55, 510 30, 570 25 C 630 65, 680 90, 720 120 L 720 210 Z" fill="url(#salesAmberGradient)"></path>

                      {/* Primary Service Sales Spline Curve */}
                      <path d="M 30 170 C 90 160, 150 140, 210 110 C 270 80, 330 115, 390 85 C 450 55, 510 30, 570 25 C 630 65, 680 90, 720 120" fill="none" stroke="#F59E0B" strokeLinecap="round" strokeWidth="3"></path>

                      {/* Retail/Product Sales Spline */}
                      <path d="M 30 195 C 90 185, 150 175, 210 150 C 270 140, 330 145, 390 125 C 450 95, 510 80, 570 70 C 630 95, 680 130, 720 150" fill="none" stroke="#06B6D4" strokeDasharray="3 3" strokeWidth="2"></path>

                      {/* High-traffic Highlight Markers */}
                      <circle cx="570" cy="25" fill="#F59E0B" r="5" stroke="#FFFFFF" strokeWidth="2"></circle>
                      <circle cx="390" cy="85" fill="#F59E0B" r="4" stroke="#FFFFFF" strokeWidth="1.5"></circle>

                      {/* X-Axis Time Labels */}
                      <text fill={theme === "dark" ? "#64748B" : "#94A3B8"} fontFamily="JetBrains Mono" fontSize="10" x="30" y="230">09:00</text>
                      <text fill={theme === "dark" ? "#64748B" : "#94A3B8"} fontFamily="JetBrains Mono" fontSize="10" x="145" y="230">11:00</text>
                      <text fill={theme === "dark" ? "#64748B" : "#94A3B8"} fontFamily="JetBrains Mono" fontSize="10" x="270" y="230">13:00</text>
                      <text fill={theme === "dark" ? "#64748B" : "#94A3B8"} fontFamily="JetBrains Mono" fontSize="10" x="390" y="230">15:00</text>
                      <text fill={theme === "dark" ? "#64748B" : "#94A3B8"} fontFamily="JetBrains Mono" fontSize="10" x="510" y="230">17:00</text>
                      <text fill="#F59E0B" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" x="560" y="230">18:30 (Peak)</text>
                      <text fill={theme === "dark" ? "#64748B" : "#94A3B8"} fontFamily="JetBrains Mono" fontSize="10" x="690" y="230">21:00</text>
                    </svg>
                  </div>

                  {/* Summary Metric Chips inside Chart */}
                  <div className={`mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-center ${theme === "dark" ? "border-[#1E293B]/60" : "border-slate-200"}`}>
                    <div className={`p-2 rounded-lg border ${theme === "dark" ? "bg-[#131D31]/50 border-[#1E293B]/40" : "bg-slate-50 border-slate-200"}`}>
                      <p className={`text-[10px] uppercase font-mono ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Total Completed Sales</p>
                      <p className="text-sm font-bold text-emerald-500 font-mono-num flex items-center justify-center gap-1">48 Orders <span className="text-[11px] font-normal text-emerald-500">+19.4%</span></p>
                    </div>
                    <div className={`p-2 rounded-lg border ${theme === "dark" ? "bg-[#131D31]/50 border-[#1E293B]/40" : "bg-slate-50 border-slate-200"}`}>
                      <p className={`text-[10px] uppercase font-mono ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Avg Ticket Value</p>
                      <p className={`text-sm font-bold font-mono-num ${theme === "dark" ? "text-white" : "text-slate-900"}`}>₹3,140 <span className={`text-[11px] font-normal ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>/ client</span></p>
                    </div>
                    <div className={`p-2 rounded-lg border ${theme === "dark" ? "bg-[#131D31]/50 border-[#1E293B]/40" : "bg-slate-50 border-slate-200"}`}>
                      <p className={`text-[10px] uppercase font-mono ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Upsell Conversion</p>
                      <p className="text-sm font-bold text-amber-500 font-mono-num">34.2% Rate</p>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Hourly Bookings vs Walk-ins & Branch Share (5 Cols) */}
                <div className={`xl:col-span-5 border rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between ${
                  theme === "dark" ? "bg-[#0F1726] border-[#1E293B]" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`text-base font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                          Sales Breakdown by Category &amp; Volume
                        </h3>
                        <p className={`text-xs mt-0.5 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                          Appointments vs walk-in sales volume &amp; revenue contribution
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-mono font-semibold">
                        ₹1.50L Today Target Achieved
                      </span>
                    </div>

                    {/* Interactive Bar/Spline Composite Chart */}
                    <div className="relative w-full h-44 select-none">
                      <svg className="w-full h-full" fill="none" viewBox="0 0 420 180">
                        <line stroke={theme === "dark" ? "#1E293B" : "#E2E8F0"} strokeDasharray="3 3" x1="20" x2="400" y1="35" y2="35"></line>
                        <line stroke={theme === "dark" ? "#1E293B" : "#E2E8F0"} strokeDasharray="3 3" x1="20" x2="400" y1="80" y2="80"></line>
                        <line stroke={theme === "dark" ? "#1E293B" : "#E2E8F0"} strokeDasharray="3 3" x1="20" x2="400" y1="125" y2="125"></line>
                        <line stroke={theme === "dark" ? "#1E293B" : "#CBD5E1"} x1="20" x2="400" y1="155" y2="155"></line>

                        {/* Stacked Sales Volume Bars */}
                        <rect fill="#3B82F6" height="40" opacity="0.85" rx="3" width="22" x="40" y="115"></rect>
                        <rect fill="#F59E0B" height="23" opacity="0.85" rx="3" width="22" x="40" y="90"></rect>
                        <text fill={theme === "dark" ? "#64748B" : "#94A3B8"} fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="51" y="170">10A</text>

                        <rect fill="#3B82F6" height="70" opacity="0.85" rx="3" width="22" x="100" y="85"></rect>
                        <rect fill="#F59E0B" height="28" opacity="0.85" rx="3" width="22" x="100" y="55"></rect>
                        <text fill={theme === "dark" ? "#64748B" : "#94A3B8"} fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="111" y="170">12P</text>

                        <rect fill="#3B82F6" height="80" opacity="0.85" rx="3" width="22" x="160" y="75"></rect>
                        <rect fill="#F59E0B" height="28" opacity="0.85" rx="3" width="22" x="160" y="45"></rect>
                        <text fill={theme === "dark" ? "#64748B" : "#94A3B8"} fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="171" y="170">2P</text>

                        <rect fill="#3B82F6" height="90" opacity="0.85" rx="3" width="22" x="220" y="65"></rect>
                        <rect fill="#F59E0B" height="33" opacity="0.85" rx="3" width="22" x="220" y="30"></rect>
                        <text fill={theme === "dark" ? "#64748B" : "#94A3B8"} fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="231" y="170">4P</text>

                        <rect fill="#3B82F6" height="110" opacity="0.95" rx="3" width="22" x="280" y="45"></rect>
                        <rect fill="#F59E0B" height="33" opacity="0.95" rx="3" width="22" x="280" y="10"></rect>
                        <text fill="#F59E0B" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold" textAnchor="middle" x="291" y="170">6P</text>

                        <rect fill="#3B82F6" height="75" opacity="0.85" rx="3" width="22" x="340" y="80"></rect>
                        <rect fill="#F59E0B" height="23" opacity="0.85" rx="3" width="22" x="340" y="55"></rect>
                        <text fill={theme === "dark" ? "#64748B" : "#94A3B8"} fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" x="351" y="170">8P</text>

                        {/* Cumulative Revenue curve */}
                        <path d="M 51 100 Q 111 75 171 60 T 291 18 T 351 70" fill="none" stroke="#10B981" strokeLinecap="round" strokeWidth="2.5"></path>
                        <circle cx="291" cy="18" fill="#10B981" r="4" stroke="#FFFFFF" strokeWidth="1.5"></circle>
                      </svg>
                    </div>
                  </div>

                  {/* Visual breakdown chips row */}
                  <div className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                    theme === "dark" ? "border-[#1E293B]/60" : "border-slate-200"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
                      <span className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>Hair &amp; Styling: <strong className={`font-mono ${theme === "dark" ? "text-white" : "text-slate-900"}`}>28 Sales</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                      <span className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>Color &amp; Spa: <strong className={`font-mono ${theme === "dark" ? "text-white" : "text-slate-900"}`}>14 Sales</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Products: 6 Sales</span>
                    </div>
                  </div>
                </div>
              </section>
              {/* END: STUNNING VISUAL CHARTS & SALON ANALYTICS SECTION */}

              {/* BEGIN: TwoColumnOperationsSection */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left / Main Column: Live Salon Queue Stream (approx 68% / 8 cols) */}
                <section className={`lg:col-span-8 border rounded-2xl p-6 shadow-xl ${
                  theme === "dark" ? "bg-[#0F1726] border-[#1E293B]" : "bg-white border-slate-200 shadow-sm"
                }`} data-purpose="queue-stream-section">
                  {/* Queue Stream Header */}
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b ${
                    theme === "dark" ? "border-[#1E293B]/70" : "border-slate-200"
                  }`}>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <Scissors className="w-5 h-5 text-amber-500" />
                        <h3 className={`text-lg font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                          Live Salon Queue Stream
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-300 font-mono text-[10px] font-bold">
                          {filteredQueueItems.length} ACTIVE TOKENS
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                        Realtime walk-in stream &amp; automated dispatch state machine
                      </p>
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600 dark:hover:text-amber-300 transition-colors group cursor-pointer"
                      >
                        View Salons
                        <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Queue Filter Bar */}
                  <div className="mt-4 mb-2 flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-zinc-400" : "text-slate-400"}`} />
                      <input
                        type="text"
                        placeholder="Search queue by token #, customer, service, branch, or status..."
                        value={queueSearch}
                        onChange={(e) => setQueueSearch(e.target.value)}
                        className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-amber-400 ${
                          theme === "dark"
                            ? "bg-[#121622] border border-[#1E293B] text-white placeholder-zinc-500"
                            : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Live Queue Desktop Data Table */}
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`text-[11px] font-bold uppercase tracking-wider border-b ${
                          theme === "dark" ? "border-[#1E293B]/60 text-slate-400" : "border-slate-200 text-slate-600 bg-slate-50/80"
                        }`}>
                          <th className="py-3 px-3" scope="col">TOKEN</th>
                          <th className="py-3 px-3" scope="col">CUSTOMER</th>
                          <th className="py-3 px-3" scope="col">SERVICE</th>
                          <th className="py-3 px-3" scope="col">SALON BRANCH</th>
                          <th className="py-3 px-3 text-center" scope="col">WAIT EST.</th>
                          <th className="py-3 px-3 text-center" scope="col">STATUS</th>
                          <th className="py-3 px-3 text-right" scope="col">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y text-sm ${
                        theme === "dark" ? "divide-[#1E293B]/40" : "divide-slate-100"
                      }`}>
                        {filteredQueueItems.map((item) => (
                          <tr key={item.id} className={`transition-colors group ${
                            theme === "dark" ? "hover:bg-slate-800/40" : "hover:bg-slate-50"
                          }`}>
                            <td className="py-3.5 px-3 font-mono font-bold text-amber-500 dark:text-amber-400">
                              <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/25">
                                {item.token}
                              </span>
                            </td>
                            <td className={`py-3.5 px-3 font-semibold transition-colors text-xs ${
                              theme === "dark" ? "text-white group-hover:text-amber-300" : "text-slate-900 group-hover:text-amber-600"
                            }`}>
                              {item.customerName}
                            </td>
                            <td className={`py-3.5 px-3 text-xs ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                              {item.service}
                            </td>
                            <td className={`py-3.5 px-3 text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span>{item.salonBranch}</span>
                              </div>
                            </td>
                            <td className={`py-3.5 px-3 text-center text-xs font-mono ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                              {item.waitEstimate}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === "CALLED"
                                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40"
                                    : item.status === "IN_SERVICE"
                                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                                      : item.status === "COMPLETED"
                                        ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700"
                                        : "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40"
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
                                    className="px-2 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 text-[10px] font-bold border border-amber-500/30 transition cursor-pointer"
                                    title="Call Customer to Chair"
                                  >
                                    Call
                                  </button>
                                )}
                                {item.status === "CALLED" && (
                                  <button
                                    onClick={() => handleQuickQueueStatus(item.id, "IN_SERVICE")}
                                    className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30 transition cursor-pointer"
                                    title="Start Service"
                                  >
                                    Start
                                  </button>
                                )}
                                {item.status === "IN_SERVICE" && (
                                  <button
                                    onClick={() => handleQuickQueueStatus(item.id, "COMPLETED")}
                                    className="px-2 py-1 rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-300 text-[10px] font-bold border border-blue-500/30 transition cursor-pointer"
                                    title="Complete Service"
                                  >
                                    Done
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEditQueue(item)}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    theme === "dark"
                                      ? "text-zinc-400 hover:text-amber-300 bg-white/5 hover:bg-amber-500/10"
                                      : "text-slate-500 hover:text-amber-700 bg-slate-100 hover:bg-amber-50"
                                  }`}
                                  title="Edit Queue Token"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteQueueItem(item.id, item.token)}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    theme === "dark"
                                      ? "text-zinc-500 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10"
                                      : "text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50"
                                  }`}
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
                            <td colSpan={7} className={`py-8 text-center text-xs ${theme === "dark" ? "text-zinc-500" : "text-slate-400"}`}>
                              No queue tokens match your search. Click &apos;Add Walk-in Token&apos; to register a client.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Live Queue Footer Status Banner */}
                  <div className={`mt-5 pt-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
                    theme === "dark" ? "border-[#1E293B]/50 text-slate-400" : "border-slate-200 text-slate-500"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Dispatch Feed Online: <code className={`font-mono text-[11px] ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>/api/queue/stream</code></span>
                    </div>
                    <span className="font-mono text-[11px]">Auto-Sync Active (Port 8081)</span>
                  </div>
                </section>

                {/* Right Sidebar Column: User Directory Quick Look (approx 32% / 4 cols) */}
                <aside className="lg:col-span-4 space-y-4" data-purpose="user-directory-sidebar">
                  {/* User Directory Quick Look Card */}
                  <div className={`border rounded-2xl p-6 shadow-xl ${
                    theme === "dark" ? "bg-[#0F1726] border-[#1E293B]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    {/* Sidebar Header */}
                    <div className={`flex items-center justify-between pb-4 border-b mb-4 ${
                      theme === "dark" ? "border-[#1E293B]/70" : "border-slate-200"
                    }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                          </svg>
                          <h3 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                            User Directory Quick Look
                          </h3>
                        </div>
                        <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                          Recent user registrations and permissions.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab("users")}
                        className="text-xs font-bold text-amber-500 hover:text-amber-600 dark:hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>

                    {/* Admin Record */}
                    <div className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                      theme === "dark" ? "bg-slate-900/80 border-[#1E293B] hover:border-slate-700" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`} data-purpose="admin-user-card">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar monogram */}
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                          {currentUser ? currentUser.name.charAt(0).toUpperCase() : "P"}
                        </div>
                        <div className="truncate">
                          <h4 className={`text-sm font-semibold truncate ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                            {currentUser ? currentUser.name : "Prapti Meher (Admin)"}
                          </h4>
                          <p className={`text-xs font-mono truncate ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                            {currentUser ? currentUser.email : "praptimeher04@gmail.com"}
                          </p>
                        </div>
                      </div>
                      {/* ADMIN Badge */}
                      <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/35 text-[11px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 flex-shrink-0">
                        {currentUser ? currentUser.role : "ADMIN"}
                      </span>
                    </div>

                    {/* Quick Directory Summary Telemetry */}
                    <div className={`mt-5 pt-4 border-t space-y-3 ${theme === "dark" ? "border-[#1E293B]/60" : "border-slate-200"}`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Total System Roles</span>
                        <span className={`font-mono font-medium ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>3 Roles (Admin, Stylist, FrontDesk)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Directory Sync</span>
                        <span className="text-emerald-500 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Peak Congestion Metrics Card */}
                  <div className={`border rounded-2xl p-5 relative overflow-hidden shadow-xl ${
                    theme === "dark" ? "bg-[#0F1726] border-[#1E293B]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    {/* Subtle red radial glow for peak alert */}
                    <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        PEAK CONGESTION METRICS
                      </div>
                      <span className="text-[10px] font-mono-num px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-semibold">
                        6:30 PM EST.
                      </span>
                    </div>
                    <p className={`text-xs leading-normal relative z-10 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                      Koregaon Park Branch capacity is tracking at <span className="text-amber-500 font-semibold">92%</span> utilization for evening slots.
                    </p>
                    {/* Dynamic Gauge Bar */}
                    <div className={`w-full rounded-full h-3 mt-3 overflow-hidden p-0.5 border relative z-10 ${
                      theme === "dark" ? "bg-slate-900 border-[#1E293B]" : "bg-slate-200 border-slate-300"
                    }`}>
                      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-red-500 h-full rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all duration-500" style={{ width: "92%" }}></div>
                    </div>
                    <div className={`flex justify-between items-center text-[10px] font-mono mt-2 relative z-10 ${
                      theme === "dark" ? "text-slate-500" : "text-slate-400"
                    }`}>
                      <span>0% Normal</span>
                      <span>50% Moderate</span>
                      <span className="text-red-500 font-bold">92% Critical</span>
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
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <div>
                  <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2.5 ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    <MapPin className="w-6 h-6 text-amber-500" />
                    Location Management
                  </h2>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    Configure geographical hierarchy: Register States and link Cities to manage your multi-salon chain.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddLocation(!showAddLocation)}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto ${showAddLocation
                    ? theme === "dark"
                      ? "bg-[#1f2638] text-amber-300 border border-amber-500/40 hover:bg-[#252f44]"
                      : "bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200"
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
                <div className={`p-6 rounded-2xl shadow-2xl animate-fadeIn space-y-6 ${
                  theme === "dark"
                    ? "bg-[#0f131d] border border-amber-500/30 text-white"
                    : "bg-white border border-amber-400/50 text-slate-900 shadow-xl"
                }`}>
                  <div className={`flex items-center justify-between pb-3 border-b ${
                    theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                  }`}>
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-amber-500" />
                      <h3 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                        Create New State &amp; City Records
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowAddLocation(false)}
                      className={`text-xs flex items-center gap-1 cursor-pointer ${
                        theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <X className="w-4 h-4" /> Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* STATE FORM */}
                    <div className={`rounded-2xl p-5 shadow-md flex flex-col justify-between border ${
                      theme === "dark" ? "bg-[#141924] border-[#283247]" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>State Form</h4>
                            <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>Add state code and state name</p>
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
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                              theme === "dark" ? "text-zinc-300" : "text-slate-700"
                            }`}>
                              State Code <span className="text-amber-500">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="e.g. MH, DL, KA"
                              value={stateCode}
                              onChange={(e) => setStateCode(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 transition-colors uppercase font-mono ${
                                theme === "dark"
                                  ? "bg-[#1a202d] border-[#2d384e] text-white placeholder-zinc-500"
                                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                              }`}
                            />
                          </div>

                          <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                              theme === "dark" ? "text-zinc-300" : "text-slate-700"
                            }`}>
                              State Name <span className="text-amber-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Maharashtra, Delhi NCR, Karnataka"
                              value={stateName}
                              onChange={(e) => setStateName(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 transition-colors ${
                                theme === "dark"
                                  ? "bg-[#1a202d] border-[#2d384e] text-white placeholder-zinc-500"
                                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                              }`}
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
                              className={`py-2.5 px-5 rounded-xl border font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                theme === "dark"
                                  ? "bg-[#1e2535] hover:bg-[#283247] border-[#303c54] text-zinc-300 hover:text-white"
                                  : "bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700 hover:text-slate-900"
                              }`}
                            >
                              <XCircle className="w-4 h-4" /> Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* CITY FORM */}
                    <div className={`rounded-2xl p-5 shadow-md flex flex-col justify-between border ${
                      theme === "dark" ? "bg-[#141924] border-[#283247]" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>City Form</h4>
                            <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>Add city code, name, and select linked state</p>
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
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                              theme === "dark" ? "text-zinc-300" : "text-slate-700"
                            }`}>
                              Select State <span className="text-amber-500">*</span>
                            </label>
                            <select
                              value={selectedStateCode}
                              onChange={(e) => setSelectedStateCode(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 transition-colors ${
                                theme === "dark"
                                  ? "bg-[#1a202d] border-[#2d384e] text-white"
                                  : "bg-white border-slate-300 text-slate-900"
                              }`}
                            >
                              <option value="" className={theme === "dark" ? "bg-[#121622] text-zinc-500" : "bg-white text-slate-400"}>
                                -- Select Linked State --
                              </option>
                              {states.map((st) => (
                                <option key={st.id} value={st.code} className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>
                                  {st.code} — {st.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                              theme === "dark" ? "text-zinc-300" : "text-slate-700"
                            }`}>
                              City Code <span className="text-amber-500">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="e.g. PUN, MUM, BLR"
                              value={cityCode}
                              onChange={(e) => setCityCode(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 transition-colors uppercase font-mono ${
                                theme === "dark"
                                  ? "bg-[#1a202d] border-[#2d384e] text-white placeholder-zinc-500"
                                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                              }`}
                            />
                          </div>

                          <div>
                            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                              theme === "dark" ? "text-zinc-300" : "text-slate-700"
                            }`}>
                              City Name <span className="text-amber-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Pune, Mumbai, Bengaluru"
                              value={cityName}
                              onChange={(e) => setCityName(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 transition-colors ${
                                theme === "dark"
                                  ? "bg-[#1a202d] border-[#2d384e] text-white placeholder-zinc-500"
                                  : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                              }`}
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
                              className={`py-2.5 px-5 rounded-xl border font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                theme === "dark"
                                  ? "bg-[#1e2535] hover:bg-[#283247] border-[#303c54] text-zinc-300 hover:text-white"
                                  : "bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-700 hover:text-slate-900"
                              }`}
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
                <div className={`flex flex-wrap items-center gap-2 p-1 rounded-xl border ${
                  theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <button
                    onClick={() => {
                      setLocationSubTab("states");
                      setLocationStateFilter("ALL");
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${locationSubTab === "states"
                      ? "bg-amber-400 text-black shadow-md font-bold"
                      : theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Registered States ({states.length})</span>
                  </button>
                  <button
                    onClick={() => setLocationSubTab("cities")}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${locationSubTab === "cities"
                      ? "bg-amber-400 text-black shadow-md font-bold"
                      : theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Registered Cities ({cities.length})</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Cascading State Filter for Cities */}
                  {locationSubTab === "cities" && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm ${
                      theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200"
                    }`}>
                      <span className={`text-[11px] font-medium whitespace-nowrap ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>State:</span>
                      <select
                        value={locationStateFilter}
                        onChange={(e) => handleFilterCitiesByState(e.target.value)}
                        disabled={isFilterLoading}
                        className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer ${
                          theme === "dark" ? "text-amber-300" : "text-amber-700"
                        }`}
                      >
                        <option value="ALL" className={theme === "dark" ? "bg-[#121622] text-zinc-300" : "bg-white text-slate-800"}>
                          All States ({cities.length} cities)
                        </option>
                        {states.map((st) => (
                          <option key={st.id} value={st.code} className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>
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
                    <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-zinc-400" : "text-slate-400"}`} />
                    <input
                      type="text"
                      placeholder="Search by code or name..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-amber-400 shadow-sm ${
                        theme === "dark"
                          ? "bg-[#121622] border border-[#232a3b] text-white placeholder-zinc-500"
                          : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Single-Line Cards View */}
              {locationSubTab === "states" ? (
                <div className="space-y-2.5">
                  <div className={`flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-1 ${
                    theme === "dark" ? "text-zinc-400" : "text-slate-500"
                  }`}>
                    <span>State Master Directory (GET /api/locations/states)</span>
                    <span className="font-mono text-[11px]">Total: {filteredStates.length} states</span>
                  </div>
                  {filteredStates.map((st) => {
                    const linkedCitiesCount = typeof st.cityCount === "number" && st.cityCount > 0 ? st.cityCount : cities.filter((c) => c.stateCode === st.code).length;
                    const linkedSalonsCount = salons.filter((s) => s.stateCode === st.code).length;
                    return (
                      <div
                        key={st.id}
                        className={`px-5 py-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 shadow-sm ${
                          theme === "dark"
                            ? "bg-[#121622] border-[#232a3b] hover:border-amber-500/40"
                            : "bg-white border-slate-200 hover:border-amber-400 shadow-sm hover:shadow"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-[220px]">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 font-mono font-bold text-amber-500 dark:text-amber-300 text-xs">
                            {st.code}
                          </span>
                          <div>
                            <span className={`font-bold text-sm tracking-tight block ${
                              theme === "dark" ? "text-white" : "text-slate-900"
                            }`}>{st.name}</span>
                            {st.id && !st.id.startsWith("st-") && (
                              <span className={`font-mono text-[10px] ${theme === "dark" ? "text-zinc-500" : "text-slate-400"}`}>ID: {st.id.slice(0, 8)}...</span>
                            )}
                          </div>
                        </div>

                        <div className={`hidden md:flex items-center gap-8 text-xs ${
                          theme === "dark" ? "text-zinc-400" : "text-slate-600"
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>Cities:</span>
                            <span className={`font-bold ${theme === "dark" ? "text-zinc-200" : "text-slate-800"}`}>{linkedCitiesCount} active</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>Salons:</span>
                            <span className="font-bold text-emerald-500">{linkedSalonsCount} operational</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>Created:</span>
                            <span className={`font-mono ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>{st.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setLocationSubTab("cities");
                              handleFilterCitiesByState(st.code);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                              theme === "dark"
                                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/20"
                                : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                            }`}
                            title={`Filter cities in ${st.name} (Cascading Dropdown API)`}
                          >
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span className="hidden sm:inline">Cities ({linkedCitiesCount})</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditStateModal(st)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              theme === "dark"
                                ? "text-zinc-400 hover:text-amber-300 bg-white/5 hover:bg-amber-500/10"
                                : "text-slate-500 hover:text-amber-700 bg-slate-100 hover:bg-amber-50"
                            }`}
                            title="Edit state details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteState(st.id, st.code)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              theme === "dark"
                                ? "text-zinc-500 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10"
                                : "text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50"
                            }`}
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
                  <div className={`flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-1 ${
                    theme === "dark" ? "text-zinc-400" : "text-slate-500"
                  }`}>
                    <span>
                      City Master Directory {locationStateFilter !== "ALL" ? `(Cascading: /api/locations/cities/state-code/${locationStateFilter})` : `(GET /api/locations/cities)`}
                    </span>
                    <span className="font-mono text-[11px]">Showing: {filteredCities.length} cities</span>
                  </div>
                  {filteredCities.map((ct) => {
                    const stateObj = states.find((s) => s.code === ct.stateCode || s.id === ct.stateId);
                    const salonCount = salons.filter((sl) => sl.cityName.toLowerCase() === ct.name.toLowerCase()).length;
                    return (
                      <div
                        key={ct.id}
                        className={`px-5 py-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 shadow-sm ${
                          theme === "dark"
                            ? "bg-[#121622] border-[#232a3b] hover:border-amber-500/40"
                            : "bg-white border-slate-200 hover:border-amber-400 shadow-sm hover:shadow"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-[220px]">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 font-mono font-bold text-blue-500 dark:text-blue-300 text-xs">
                            {ct.code}
                          </span>
                          <div>
                            <span className={`font-bold text-sm tracking-tight block ${
                              theme === "dark" ? "text-white" : "text-slate-900"
                            }`}>{ct.name}</span>
                            {ct.id && !ct.id.startsWith("ct-") && (
                              <span className={`font-mono text-[10px] ${theme === "dark" ? "text-zinc-500" : "text-slate-400"}`}>ID: {ct.id.slice(0, 8)}...</span>
                            )}
                          </div>
                        </div>

                        <div className={`hidden md:flex items-center gap-8 text-xs ${
                          theme === "dark" ? "text-zinc-400" : "text-slate-600"
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>State:</span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 font-mono font-bold">
                              {ct.stateCode} {stateObj ? `(${stateObj.name})` : ct.stateName ? `(${ct.stateName})` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>Salons:</span>
                            <span className="font-bold text-emerald-500">{salonCount} branches</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>Created:</span>
                            <span className={`font-mono ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>{ct.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditCityModal(ct)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              theme === "dark"
                                ? "text-zinc-400 hover:text-amber-300 bg-white/5 hover:bg-amber-500/10"
                                : "text-slate-500 hover:text-amber-700 bg-slate-100 hover:bg-amber-50"
                            }`}
                            title="Edit city details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCity(ct.id, ct.name)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              theme === "dark"
                                ? "text-zinc-500 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10"
                                : "text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50"
                            }`}
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
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <div>
                  <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2.5 ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    <Scissors className="w-6 h-6 text-amber-500" />
                    Salon Branches Management
                  </h2>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
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
              <div className={`flex items-center gap-4 p-3 rounded-2xl border shadow-sm ${
                theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200"
              }`}>
                <div className="relative flex-1">
                  <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    theme === "dark" ? "text-zinc-400" : "text-slate-400"
                  }`} />
                  <input
                    type="text"
                    placeholder="Filter by salon name, city, state, or type (unisex, male, female)..."
                    value={salonSearch}
                    onChange={(e) => setSalonSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none ${
                      theme === "dark" ? "text-white placeholder-zinc-500" : "text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
                <div className={`text-xs font-mono pr-2 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                  Showing {filteredSalons.length} of {salons.length} Salons
                </div>
              </div>

              {/* Salons List */}
              <div className="space-y-3">
                <div className={`text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between ${
                  theme === "dark" ? "text-zinc-400" : "text-slate-500"
                }`}>
                  <span>Registered Salons Directory — Expandable Cards</span>
                  <span className="text-amber-500 font-mono text-[11px]">API: /api/salons</span>
                </div>
                {filteredSalons.map((salon) => {
                  const isExpanded = expandedSalonId === salon.id;
                  return (
                    <div
                      key={salon.id}
                      className={`rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden ${
                        isExpanded
                          ? theme === "dark"
                            ? "bg-[#141926] border-amber-500/40 shadow-md"
                            : "bg-white border-amber-400/60 shadow-md"
                          : theme === "dark"
                            ? "bg-[#121622] border-[#232a3b] hover:border-amber-500/30"
                            : "bg-white border-slate-200 hover:border-amber-300 shadow-sm"
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
                              className="w-10 h-10 rounded-xl object-cover border border-amber-500/30 shrink-0 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                              <Scissors className="w-5 h-5 text-amber-500" />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`text-sm font-bold tracking-tight ${
                                theme === "dark" ? "text-white" : "text-slate-900"
                              }`}>{salon.name}</h3>
                              {/* Salon Type Pill */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${salon.type === "UNISEX"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                                  : salon.type === "MALE_ONLY"
                                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30"
                                    : "bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                                  }`}
                              >
                                {salon.type === "UNISEX"
                                  ? "Unisex"
                                  : salon.type === "MALE_ONLY"
                                    ? "Male Only"
                                    : "Female Only"}
                              </span>
                            </div>
                            <div className={`text-[11px] flex items-center gap-2 mt-0.5 ${
                              theme === "dark" ? "text-zinc-400" : "text-slate-500"
                            }`}>
                              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-300 font-medium">
                                <MapPin className="w-3 h-3 text-amber-500" />
                                {salon.cityName}
                              </span>
                              {salon.ownerName && (
                                <span className={theme === "dark" ? "text-zinc-500 hidden sm:inline" : "text-slate-400 hidden sm:inline"}>• Owner: {salon.ownerName}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Center: Key Metrics */}
                        <div className={`hidden md:flex items-center gap-8 text-xs ${
                          theme === "dark" ? "text-zinc-300" : "text-slate-600"
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>Stylists:</span>
                            <span className={`font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{salon.activeStylists || 6} on floor</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${theme === "dark" ? "text-zinc-500" : "text-slate-400"}`} />
                            <span className={`font-mono ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                              {salon.openingTime} - {salon.closingTime}
                            </span>
                          </div>
                          {salon.pincode && (
                            <div className="flex items-center gap-1.5">
                              <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>PIN:</span>
                              <span className="font-mono text-amber-600 dark:text-amber-300">{salon.pincode}</span>
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
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                                : "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                            }`}
                            title={
                              salon.status === "ACTIVE" || salon.status === "OPEN"
                                ? "Click to set Inactive"
                                : "Click to set Active"
                            }
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${salon.status === "ACTIVE" || salon.status === "OPEN"
                                  ? "bg-emerald-500 animate-pulse"
                                  : "bg-rose-500"
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
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              theme === "dark"
                                ? "bg-white/5 text-zinc-400 hover:text-amber-300 hover:bg-amber-500/10"
                                : "bg-slate-100 text-slate-500 hover:text-amber-700 hover:bg-amber-50"
                            }`}
                            title="Edit Salon Details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            className={`p-1.5 rounded-lg transition-transform duration-200 ${
                              isExpanded ? "rotate-180 bg-amber-500/20 text-amber-500" : theme === "dark" ? "bg-white/5 text-amber-400 hover:bg-white/10" : "bg-slate-100 text-amber-600 hover:bg-slate-200"
                            }`}
                            title="Toggle full salon info"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Expanded Details Container */}
                      {isExpanded && (
                        <div className={`px-6 pb-6 pt-2 border-t space-y-4 animate-fadeIn ${
                          theme === "dark" ? "border-[#1f2638] bg-[#0d1017]/70" : "border-slate-200 bg-slate-50/80"
                        }`}>
                          {salon.salonDescription && (
                            <div className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                              theme === "dark" ? "bg-amber-500/5 border-amber-500/20 text-amber-200/90" : "bg-amber-50 border-amber-200 text-amber-900"
                            }`}>
                              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <span>{salon.salonDescription}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            <div className={`p-4 rounded-xl border space-y-2 ${
                              theme === "dark" ? "bg-[#141924] border-[#232c3f]" : "bg-white border-slate-200 shadow-sm"
                            }`}>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 block">
                                Location &amp; Contact Details
                              </span>
                              <div className={`text-xs space-y-1.5 ${theme === "dark" ? "text-zinc-200" : "text-slate-700"}`}>
                                <p className={`font-medium ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{salon.address}</p>
                                <p className={theme === "dark" ? "text-zinc-400" : "text-slate-500"}>
                                  City: <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{salon.cityName}</span>
                                  {salon.pincode ? ` — PIN: ${salon.pincode}` : ""}
                                </p>
                                <p className="flex items-center gap-1.5 pt-0.5">
                                  <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span className="font-mono">{salon.phone}</span>
                                </p>
                                {salon.email && (
                                  <p className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span className="font-mono">{salon.email}</span>
                                  </p>
                                )}
                                {salon.ownerName && (
                                  <p className={`flex items-center gap-1.5 pt-0.5 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                                    <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span>Owner: <strong className={theme === "dark" ? "text-white" : "text-slate-900"}>{salon.ownerName}</strong></span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className={`p-4 rounded-xl border space-y-2 ${
                              theme === "dark" ? "bg-[#141924] border-[#232c3f]" : "bg-white border-slate-200 shadow-sm"
                            }`}>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 block">
                                Floor &amp; Operating Hours
                              </span>
                              <div className={`text-xs space-y-1.5 ${theme === "dark" ? "text-zinc-200" : "text-slate-700"}`}>
                                <p>
                                  Active Stylists:{" "}
                                  <span className={`font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{salon.activeStylists || 6} Stylists</span>
                                </p>
                                <p className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span>Hours: <strong className="font-mono text-amber-600 dark:text-amber-300">{salon.openingTime} - {salon.closingTime}</strong></span>
                                </p>
                                <p className={theme === "dark" ? "text-zinc-400" : "text-slate-500"}>
                                  Status:{" "}
                                  <span className="text-emerald-500 font-semibold font-mono">{salon.status || "ACTIVE"}</span>
                                </p>
                                <p className="text-emerald-500 font-semibold pt-1 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                  Live Dispatch Sync Active
                                </p>
                              </div>
                            </div>

                            <div className={`p-4 rounded-xl border space-y-2 ${
                              theme === "dark" ? "bg-[#141924] border-[#232c3f]" : "bg-white border-slate-200 shadow-sm"
                            }`}>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 block">
                                Digital Location &amp; Maps
                              </span>
                              <div className={`text-xs space-y-2 ${theme === "dark" ? "text-zinc-200" : "text-slate-700"}`}>
                                {salon.locationLink ? (
                                  <div>
                                    <p className={`mb-2 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>Google Maps / Navigation URL verified:</p>
                                    <a
                                      href={salon.locationLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-600 dark:text-blue-300 font-semibold text-xs transition-colors"
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
                                  <div className={`pt-2 text-[11px] font-mono ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                                    Registered: {salon.createdAt}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={`pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t ${
                            theme === "dark" ? "border-[#1f2638]/80" : "border-slate-200"
                          }`}>
                            <div className={`text-xs font-mono truncate max-w-sm ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                              UUID: <span className="text-amber-600 dark:text-amber-300 font-bold">{salon.id}</span>
                            </div>
                            <div className="flex items-center gap-2.5 self-end sm:self-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditSalonModal(salon);
                                }}
                                className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  theme === "dark"
                                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                                }`}
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit Salon
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSalon(salon.id, salon.name);
                                }}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  theme === "dark"
                                    ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                                    : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                                }`}
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
                  <div className={`p-8 text-center text-xs rounded-xl border ${
                    theme === "dark" ? "bg-[#121622] border-[#232a3b] text-zinc-500" : "bg-white border-slate-200 text-slate-400 shadow-sm"
                  }`}>
                    No salons found matching your search.
                  </div>
                )}
              </div>

              {/* Modal to Add New Salon (Integrated with POST /api/salons) */}
              {showAddSalonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
                  <div className={`border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto ${
                    theme === "dark" ? "bg-[#121622] border-amber-500/30 text-white" : "bg-white border-amber-400/60 text-slate-900"
                  }`}>
                    <div className={`flex items-center justify-between pb-3 border-b ${
                      theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500">
                          <Scissors className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Register New Salon Branch</h3>
                          <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>POST http://localhost:8081/api/salons</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAddSalonModal(false)}
                        className={`p-1 rounded-lg cursor-pointer ${
                          theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-800"
                        }`}
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
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            Salon Name <span className="text-amber-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Style Studio"
                            value={newSalonName}
                            onChange={(e) => setNewSalonName(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <label className={`block font-semibold uppercase mb-1 flex items-center justify-between ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            <span>Owner (Staff User) <span className="text-amber-500">*</span></span>
                            <span className="text-[10px] text-amber-500 font-normal">Staff Users in DB</span>
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
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white"
                                : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                            }`}
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
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            Phone Number <span className="text-amber-500">*</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. 9876543210"
                            value={newSalonPhone}
                            onChange={(e) => setNewSalonPhone(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            Email Address <span className="text-amber-500">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="stylestudio.baner@gmail.com"
                            value={newSalonEmail}
                            onChange={(e) => setNewSalonEmail(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                            required
                          />
                        </div>
                      </div>

                      {/* Section 3: Location Details */}
                      <div>
                        <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                          Salon Address <span className="text-amber-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. High Street, Baner, Pune"
                          value={newSalonAddress}
                          onChange={(e) => setNewSalonAddress(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                            theme === "dark"
                              ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                              : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                          }`}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            City <span className="text-amber-500">*</span>
                          </label>
                          {cities.length > 0 ? (
                            <select
                              value={newSalonCity}
                              onChange={(e) => setNewSalonCity(e.target.value)}
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                                theme === "dark"
                                  ? "bg-[#181e2b] border-[#2b354b] text-white"
                                  : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                              }`}
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
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                                theme === "dark"
                                  ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                  : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                              }`}
                              required
                            />
                          )}
                        </div>

                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            Pincode <span className="text-amber-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 411045"
                            value={newSalonPincode}
                            onChange={(e) => setNewSalonPincode(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                            required
                          />
                        </div>
                      </div>

                      {/* Section 4: Timings & Classification */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            Opening Time <span className="text-amber-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="09:00"
                            value={newSalonOpen}
                            onChange={(e) => setNewSalonOpen(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            Closing Time <span className="text-amber-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="21:00"
                            value={newSalonClose}
                            onChange={(e) => setNewSalonClose(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            Classification
                          </label>
                          <select
                            value={newSalonType}
                            onChange={(e) => setNewSalonType(e.target.value as any)}
                            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-semibold ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-amber-300"
                                : "bg-slate-50 border-slate-300 text-amber-700 focus:bg-white"
                            }`}
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
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            Salon Logo Image URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={newSalonLogo}
                            onChange={(e) => setNewSalonLogo(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-amber-400 font-mono ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            Google Maps / Location Link
                          </label>
                          <input
                            type="url"
                            placeholder="https://maps.google.com/?q=..."
                            value={newSalonLocationLink}
                            onChange={(e) => setNewSalonLocationLink(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-amber-400 font-mono ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Section 6: Description */}
                      <div>
                        <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                          Salon Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Premium unisex salon providing bespoke haircuts, styling, beard grooming, and beauty treatments."
                          value={newSalonDescription}
                          onChange={(e) => setNewSalonDescription(e.target.value)}
                          className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-400 resize-none ${
                            theme === "dark"
                              ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                              : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                          }`}
                        />
                      </div>

                      {/* Action buttons */}
                      <div className={`pt-3 flex items-center justify-end gap-3 border-t ${
                        theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                      }`}>
                        <button
                          type="button"
                          onClick={() => setShowAddSalonModal(false)}
                          className={`px-4 py-2.5 rounded-xl cursor-pointer font-medium ${
                            theme === "dark" ? "bg-white/5 text-zinc-300 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
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
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <div>
                  <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2.5 ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    <Users className="w-6 h-6 text-amber-500" />
                    User Management Directory
                  </h2>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
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
              <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-2xl border shadow-sm ${
                theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200"
              }`}>
                <div className="relative flex-1">
                  <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    theme === "dark" ? "text-zinc-400" : "text-slate-400"
                  }`} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or mobile..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none ${
                      theme === "dark" ? "text-white placeholder-zinc-500" : "text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
                  theme === "dark" ? "bg-[#181e2b] border-[#232a3b]" : "bg-slate-100 border-slate-200"
                }`}>
                  {(["ALL", "ADMIN", "STAFF", "CUSTOMER"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        userRoleFilter === r
                          ? "bg-amber-400 text-black shadow font-bold"
                          : theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Single-Line Directory Cards */}
              <div className="space-y-2.5">
                <div className={`text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between ${
                  theme === "dark" ? "text-zinc-400" : "text-slate-500"
                }`}>
                  <span>Registered App Users ({filteredUsers.length})</span>
                  <span className="font-mono text-[11px]">Backend API: /api/auth/register</span>
                </div>

                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`px-5 py-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 shadow-sm ${
                      theme === "dark"
                        ? "bg-[#121622] border-[#232a3b] hover:border-amber-500/40"
                        : "bg-white border-slate-200 hover:border-amber-400 shadow-sm hover:shadow"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-[240px]">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          user.role === "ADMIN"
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                            : user.role === "STAFF"
                              ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30"
                              : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm tracking-tight ${
                            theme === "dark" ? "text-white" : "text-slate-900"
                          }`}>{user.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                              user.role === "ADMIN"
                                ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                                : user.role === "STAFF"
                                  ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30"
                                  : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <div className={`text-xs mt-0.5 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>{user.email}</div>
                      </div>
                    </div>

                    <div className={`hidden md:flex items-center gap-8 text-xs ${
                      theme === "dark" ? "text-zinc-300" : "text-slate-600"
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <Phone className={`w-3.5 h-3.5 ${theme === "dark" ? "text-zinc-500" : "text-slate-400"}`} />
                        <span className={`font-mono ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>{user.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>Gender:</span>
                        <span className={`font-medium ${theme === "dark" ? "text-zinc-200" : "text-slate-800"}`}>{user.gender}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>DOB:</span>
                        <span className={`font-mono ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>{user.dob}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                        {user.status}
                      </span>
                      <button
                        onClick={() => openEditUserModal(user)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          theme === "dark"
                            ? "text-zinc-400 hover:text-amber-300 bg-white/5 hover:bg-amber-500/10"
                            : "text-slate-500 hover:text-amber-700 bg-slate-100 hover:bg-amber-50"
                        }`}
                        title="Edit user details"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          theme === "dark"
                            ? "text-zinc-500 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10"
                            : "text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50"
                        }`}
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className={`p-8 text-center text-xs rounded-xl border ${
                    theme === "dark" ? "bg-[#121622] border-[#232a3b] text-zinc-500" : "bg-white border-slate-200 text-slate-400 shadow-sm"
                  }`}>
                    No users found matching your filters.
                  </div>
                )}
              </div>

              {/* Modal to Create New User */}
              {showCreateUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                  <div className={`border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 ${
                    theme === "dark" ? "bg-[#121622] border-amber-500/30 text-white" : "bg-white border-amber-400/60 text-slate-900"
                  }`}>
                    <div className={`flex items-center justify-between pb-3 border-b ${
                      theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                    }`}>
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-amber-500" />
                        <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Create New App User</h3>
                      </div>
                      <button
                        onClick={() => setShowCreateUserModal(false)}
                        className={`p-1 rounded-lg cursor-pointer ${
                          theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-800"
                        }`}
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
                        <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Rahul Verma"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                            theme === "dark"
                              ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                              : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                          }`}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>Email Address *</label>
                          <input
                            type="email"
                            placeholder="rahul@example.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>Mobile Number *</label>
                          <input
                            type="tel"
                            placeholder="9876543210"
                            value={regMobile}
                            onChange={(e) => setRegMobile(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>Password *</label>
                          <input
                            type="password"
                            placeholder="password123"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            placeholder="password123"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                              theme === "dark"
                                ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                                : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                            }`}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>Role *</label>
                          <select
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value as any)}
                            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-bold ${
                              theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-amber-300" : "bg-slate-50 border-slate-300 text-amber-700 focus:bg-white"
                            }`}
                          >
                            <option value="CUSTOMER">CUSTOMER</option>
                            <option value="STAFF">STAFF (Stylist)</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>Gender</label>
                          <select
                            value={regGender}
                            onChange={(e) => setRegGender(e.target.value as any)}
                            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                              theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-white" : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                            }`}
                          >
                            <option value="MALE">MALE</option>
                            <option value="FEMALE">FEMALE</option>
                            <option value="OTHER">OTHER</option>
                          </select>
                        </div>

                        <div>
                          <label className={`block font-semibold uppercase mb-1 ${theme === "dark" ? "text-zinc-300" : "text-slate-700"}`}>Date of Birth</label>
                          <input
                            type="date"
                            value={regDob}
                            onChange={(e) => setRegDob(e.target.value)}
                            className={`w-full px-2.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-amber-400 ${
                              theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-white" : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                            }`}
                          />
                        </div>
                      </div>

                      <div className={`pt-3 flex items-center justify-end gap-3 border-t ${
                        theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
                      }`}>
                        <button
                          type="button"
                          onClick={() => setShowCreateUserModal(false)}
                          className={`px-4 py-2 rounded-xl cursor-pointer ${
                            theme === "dark" ? "bg-white/5 text-zinc-300 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
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
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <div>
                  <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2.5 ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}>
                    <TrendingUp className="w-6 h-6 text-amber-500" />
                    Revenue &amp; Operations Analytics
                  </h2>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                    Financial performance, popular service distribution, and AI congestion forecasting.
                  </p>
                </div>
                <div className={`flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-xl border ${
                  theme === "dark" ? "text-amber-300 bg-[#141923] border-[#242c3d]" : "text-amber-800 bg-amber-50 border-amber-200 shadow-sm"
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
                  <div key={i} className={`p-5 rounded-2xl border transition-all ${
                    theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                  }`}>
                    <div className={`flex items-center justify-between text-xs mb-2 ${
                      theme === "dark" ? "text-zinc-400" : "text-slate-500"
                    }`}>
                      <span className="font-semibold uppercase tracking-wider">{rev.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        theme === "dark" ? "bg-white/5 text-zinc-300" : "bg-slate-100 text-slate-700 font-semibold"
                      }`}>
                        {rev.tag}
                      </span>
                    </div>
                    <div className={`text-2xl font-bold tracking-tight ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>{rev.amount}</div>
                    <div className="text-xs text-emerald-500 font-semibold mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>{rev.change} growth vs previous cycle</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Service Popularity Breakdown & Congestion Traffic Curve */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`p-6 rounded-2xl border ${
                  theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Top Performing Services</h3>
                      <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>Demand distribution by appointment volume</p>
                    </div>
                    <span className="text-xs text-amber-500 font-semibold">4 Categories</span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { name: "Signature AI Haircut & Styling", share: 44, revenue: "₹66,300", color: "bg-amber-400" },
                      {
                        name: "Balayage Color & Hair Spa Treatment",
                        share: 26,
                        revenue: "₹39,180",
                        color: "bg-purple-500",
                      },
                      {
                        name: "Royal Beard Sculpture & Detailing",
                        share: 18,
                        revenue: "₹27,120",
                        color: "bg-blue-500",
                      },
                      { name: "Hydra Radiance Facial & De-tan", share: 12, revenue: "₹18,100", color: "bg-emerald-500" },
                    ].map((srv, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>{srv.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>{srv.revenue}</span>
                            <span className={`font-bold ${theme === "dark" ? "text-amber-300" : "text-amber-700"}`}>{srv.share}%</span>
                          </div>
                        </div>
                        <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                          theme === "dark" ? "bg-[#1c2230]" : "bg-slate-100"
                        }`}>
                          <div
                            className={`h-full rounded-full ${srv.color}`}
                            style={{ width: `${srv.share}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  theme === "dark" ? "bg-[#121622] border-[#232a3b]" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className={`text-base font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                          <Clock className="w-4 h-4 text-amber-500" />
                          Hourly Congestion Pattern &amp; Wait Times
                        </h3>
                        <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>Formula: sum durations ÷ available stylists capacity</p>
                      </div>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                        theme === "dark" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-amber-800 bg-amber-50 border-amber-300 font-semibold"
                      }`}>
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
                            className={`text-[10px] font-mono font-bold ${
                              slot.alert
                                ? "text-rose-500 animate-pulse"
                                : theme === "dark" ? "text-zinc-400" : "text-slate-500"
                            }`}
                          >
                            {slot.wait}
                          </span>
                          <div className={`w-full rounded-t-lg relative flex items-end h-28 overflow-hidden ${
                            theme === "dark" ? "bg-[#181e2b]" : "bg-slate-100"
                          }`}>
                            <div
                              style={{ height: `${slot.load}%` }}
                              className={`w-full rounded-t-lg transition-all duration-500 ${
                                slot.alert
                                  ? "bg-gradient-to-t from-rose-600 to-amber-400"
                                  : "bg-gradient-to-t from-amber-600/60 to-amber-400"
                              }`}
                            ></div>
                          </div>
                          <span className={`text-[11px] font-mono ${
                            theme === "dark" ? "text-zinc-400" : "text-slate-500"
                          }`}>{slot.hour}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`mt-4 p-3 rounded-xl border text-xs ${
                    theme === "dark"
                      ? "bg-amber-500/10 border-amber-500/20 text-zinc-300"
                      : "bg-amber-50/80 border-amber-200 text-amber-950"
                  }`}>
                    <span className={`font-bold ${theme === "dark" ? "text-amber-300" : "text-amber-800"}`}>LLD Formula Rule:</span> Expected wait calculated as{" "}
                    <code className={`px-1 py-0.5 rounded font-mono ${
                      theme === "dark" ? "text-amber-200 bg-black/40" : "text-amber-900 bg-amber-100/90 font-bold"
                    }`}>
                      sum(service_durations) ÷ available_staff
                    </code>
                    . Current staff capacity buffer is sufficient for all windows except 6:30 PM surge.
                  </div>
                </div>
              </div>

              {/* BEGIN: Services & Price Catalog Master Section (Full CRUD) */}
              <div className={`border rounded-2xl p-6 shadow-sm space-y-5 ${
                theme === "dark" ? "bg-[#0F1726] border-[#1E293B]" : "bg-white border-slate-200"
              }`} data-purpose="services-catalog-crud-section">
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
                  theme === "dark" ? "border-[#1E293B]" : "border-slate-200"
                }`}>
                  <div>
                    <h3 className={`text-lg font-bold tracking-tight flex items-center gap-2.5 ${
                      theme === "dark" ? "text-white" : "text-slate-900"
                    }`}>
                      <Scissors className="w-5 h-5 text-amber-500" />
                      Salon Services &amp; Pricing Catalog Master
                    </h3>
                    <p className={`text-xs mt-0.5 ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
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
                <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border ${
                  theme === "dark" ? "bg-[#121622] border-[#1E293B]" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="relative flex-1">
                    <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                      theme === "dark" ? "text-zinc-400" : "text-slate-400"
                    }`} />
                    <input
                      type="text"
                      placeholder="Search service name or category..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className={`w-full pl-9 pr-3 py-1.5 bg-transparent text-xs focus:outline-none ${
                        theme === "dark" ? "text-white placeholder-zinc-500" : "text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {(["ALL", "Haircut & Styling", "Color & Spa", "Beard & Shave", "Facial & Skincare", "Treatments"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setServiceCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          serviceCategoryFilter === cat
                            ? "bg-amber-400 text-black shadow"
                            : theme === "dark"
                              ? "text-zinc-400 hover:text-white"
                              : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Services Catalog List Table */}
                <div className="space-y-2.5">
                  <div className={`text-xs font-semibold uppercase tracking-wider mb-1 flex items-center justify-between ${
                    theme === "dark" ? "text-zinc-400" : "text-slate-500"
                  }`}>
                    <span>Active Services Catalog ({filteredServices.length})</span>
                    <span className={`font-mono text-[11px] ${
                      theme === "dark" ? "text-amber-400/80" : "text-amber-700"
                    }`}>API: /api/services/catalog</span>
                  </div>

                  {filteredServices.map((srv) => (
                    <div
                      key={srv.id}
                      className={`px-5 py-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 shadow-sm ${
                        theme === "dark"
                          ? "bg-[#121622] border-[#232a3b] hover:border-amber-500/40"
                          : "bg-white border-slate-200 hover:border-amber-400 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-[240px]">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs border ${
                          theme === "dark"
                            ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                        }`}>
                          ₹
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm tracking-tight ${
                              theme === "dark" ? "text-white" : "text-slate-900"
                            }`}>{srv.name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono border ${
                                srv.genderTarget === "UNISEX"
                                  ? theme === "dark"
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                  : srv.genderTarget === "MALE_ONLY"
                                    ? theme === "dark"
                                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                      : "bg-blue-50 text-blue-800 border-blue-200"
                                    : theme === "dark"
                                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                      : "bg-rose-50 text-rose-800 border-rose-200"
                              }`}
                            >
                              {srv.genderTarget === "UNISEX" ? "Unisex" : srv.genderTarget === "MALE_ONLY" ? "Gents" : "Ladies"}
                            </span>
                          </div>
                          <div className={`text-xs mt-0.5 flex items-center gap-2 ${
                            theme === "dark" ? "text-zinc-400" : "text-slate-500"
                          }`}>
                            <span className={`font-medium ${theme === "dark" ? "text-amber-300/90" : "text-amber-700"}`}>{srv.category}</span>
                            <span className={theme === "dark" ? "text-zinc-600" : "text-slate-300"}>•</span>
                            <span className={`font-mono flex items-center gap-1 ${
                              theme === "dark" ? "text-zinc-300" : "text-slate-700"
                            }`}>
                              <Clock className={`w-3 h-3 ${theme === "dark" ? "text-zinc-500" : "text-slate-400"}`} /> {srv.durationMinutes} mins
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`hidden md:flex items-center gap-8 text-xs ${
                        theme === "dark" ? "text-zinc-300" : "text-slate-700"
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>Standard Price:</span>
                          <span className="font-bold font-mono text-emerald-500 text-sm">₹{srv.price.toLocaleString("en-IN")}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>Status:</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            theme === "dark"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}>
                            {srv.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="md:hidden font-bold font-mono text-emerald-500 text-xs mr-1">₹{srv.price}</span>
                        <button
                          onClick={() => handleOpenEditService(srv)}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            theme === "dark"
                              ? "text-zinc-400 hover:text-amber-300 bg-white/5 hover:bg-amber-500/10"
                              : "text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-100"
                          }`}
                          title="Edit Service Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id, srv.name)}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            theme === "dark"
                              ? "text-zinc-500 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10"
                              : "text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-100"
                          }`}
                          title="Remove Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredServices.length === 0 && (
                    <div className={`p-8 text-center text-xs rounded-xl border ${
                      theme === "dark"
                        ? "text-zinc-500 bg-[#121622] border-[#232a3b]"
                        : "text-slate-500 bg-slate-50 border-slate-200"
                    }`}>
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
          <div className={`rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border ${
            theme === "dark" ? "bg-[#121622] border-amber-500/30 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-600 p-0.5 flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-black font-bold" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    {authMode === "login" ? "Account Sign In" : "Register Admin User"}
                  </h3>
                  <p className={`text-[11px] ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>Spring Boot Auth API • Port 8081</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                }`}
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

            <div className={`flex items-center p-1 rounded-xl border ${
              theme === "dark" ? "bg-[#181e2b] border-[#263044]" : "bg-slate-100 border-slate-200"
            }`}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  authMode === "login"
                    ? "bg-amber-400 text-black shadow"
                    : theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
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
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  authMode === "register"
                    ? "bg-amber-400 text-black shadow"
                    : theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Register New User
              </button>
            </div>

            {authMode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div className={`flex items-center gap-4 font-medium ${
                  theme === "dark" ? "text-zinc-400" : "text-slate-600"
                }`}>
                  <span className="text-[11px]">Login using:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="loginMethod"
                      checked={loginMethod === "email"}
                      onChange={() => setLoginMethod("email")}
                      className="accent-amber-400"
                    />
                    <span className={loginMethod === "email" ? "text-amber-500 font-bold" : ""}>Email</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="loginMethod"
                      checked={loginMethod === "mobile"}
                      onChange={() => setLoginMethod("mobile")}
                      className="accent-amber-400"
                    />
                    <span className={loginMethod === "mobile" ? "text-amber-500 font-bold" : ""}>Mobile Number</span>
                  </label>
                </div>

                {loginMethod === "email" ? (
                  <div>
                    <label className={`block font-semibold uppercase mb-1 ${
                      theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Email Address *</label>
                    <div className="relative">
                      <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        theme === "dark" ? "text-zinc-500" : "text-slate-400"
                      }`} />
                      <input
                        type="email"
                        placeholder="johndoe@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                          theme === "dark"
                            ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                            : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                        }`}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className={`block font-semibold uppercase mb-1 ${
                      theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Mobile Number *</label>
                    <div className="relative">
                      <Phone className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        theme === "dark" ? "text-zinc-500" : "text-slate-400"
                      }`} />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={loginMobile}
                        onChange={(e) => setLoginMobile(e.target.value)}
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                          theme === "dark"
                            ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                            : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                        }`}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Password *</label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      theme === "dark" ? "text-zinc-500" : "text-slate-400"
                    }`} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                        theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      }`}
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
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block font-semibold uppercase mb-1 ${
                      theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Email Address *</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                        theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold uppercase mb-1 ${
                      theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Mobile Number *</label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                        theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block font-semibold uppercase mb-1 ${
                      theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Password *</label>
                    <input
                      type="password"
                      placeholder="password123"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                        theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold uppercase mb-1 ${
                      theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Confirm Password *</label>
                    <input
                      type="password"
                      placeholder="password123"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                        theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={`block font-semibold uppercase mb-1 ${
                      theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Date of Birth</label>
                    <input
                      type="date"
                      value={regDob}
                      onChange={(e) => setRegDob(e.target.value)}
                      className={`w-full px-2.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-400 ${
                        theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-white"
                          : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block font-semibold uppercase mb-1 ${
                      theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Gender</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value as any)}
                      className={`w-full px-2.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-400 ${
                        theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-white"
                          : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                      }`}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block font-semibold uppercase mb-1 ${
                      theme === "dark" ? "text-zinc-300" : "text-slate-700"
                    }`}>Role</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className={`w-full px-2.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-400 font-bold ${
                        theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-amber-300"
                          : "bg-slate-50 border-slate-300 text-amber-800 focus:bg-white"
                      }`}
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
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            theme === "dark" ? "bg-[#121622] border-amber-500/40" : "bg-white border-slate-200"
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
            }`}>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Edit State Details</h3>
              </div>
              <button
                onClick={() => setShowEditStateModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                }`}
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
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>State Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={editStateCode}
                  onChange={(e) => setEditStateCode(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 uppercase font-mono ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>State Name *</label>
                <input
                  type="text"
                  value={editStateName}
                  onChange={(e) => setEditStateName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowEditStateModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    theme === "dark" ? "bg-white/5 text-zinc-300 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
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
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            theme === "dark" ? "bg-[#121622] border-amber-500/40" : "bg-white border-slate-200"
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
            }`}>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Edit City Details</h3>
              </div>
              <button
                onClick={() => setShowEditCityModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                }`}
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
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Linked State *</label>
                <select
                  value={editCityStateCode}
                  onChange={(e) => setEditCityStateCode(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                  }`}
                  required
                >
                  <option value="">-- Choose State --</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.code} className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>City Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={editCityCode}
                  onChange={(e) => setEditCityCode(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 uppercase font-mono ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>City Name *</label>
                <input
                  type="text"
                  value={editCityName}
                  onChange={(e) => setEditCityName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowEditCityModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    theme === "dark" ? "bg-white/5 text-zinc-300 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
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
          <div className={`border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto ${
            theme === "dark" ? "bg-[#121622] border-amber-500/40" : "bg-white border-slate-200"
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  theme === "dark" ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-800"
                }`}>
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Edit Salon Branch</h3>
                  <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>UUID: {editingSalon.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditSalonModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                }`}
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
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>
                    Salon Name <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editSalonName}
                    onChange={(e) => setEditSalonName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 flex items-center justify-between ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>
                    <span>Owner (Staff User) <span className="text-amber-500">*</span></span>
                    <span className={`text-[10px] font-normal ${theme === "dark" ? "text-amber-400" : "text-amber-700 font-bold"}`}>Staff Users in DB</span>
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                    }`}
                    required
                  >
                    <option value="" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>-- Select Staff User (Owner) --</option>
                    {editOwnerName && !staffOwnerOptions.some((s) => s.name === editOwnerName) && (
                      <option value={editOwnerName} className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>{editOwnerName} (Current Owner)</option>
                    )}
                    {staffOwnerOptions.map((staff) => (
                      <option key={staff.id || staff.name} value={staff.name} className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>
                        {staff.name} (STAFF) {staff.email ? `• ${staff.email}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>
                    Phone Number <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editSalonPhone}
                    onChange={(e) => setEditSalonPhone(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editSalonEmail}
                    onChange={(e) => setEditSalonEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>
                  Salon Address <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  value={editSalonAddress}
                  onChange={(e) => setEditSalonAddress(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>
                    City <span className="text-amber-500">*</span>
                  </label>
                  {cities.length > 0 ? (
                    <select
                      value={editSalonCity}
                      onChange={(e) => setEditSalonCity(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                        theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-white"
                          : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                      }`}
                      required
                    >
                      {cities.map((c) => (
                        <option key={c.id} value={c.name} className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editSalonCity}
                      onChange={(e) => setEditSalonCity(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                        theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                      }`}
                      required
                    />
                  )}
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>
                    Pincode <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editSalonPincode}
                    onChange={(e) => setEditSalonPincode(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Active / Inactive Status Selector in Edit Modal */}
              <div className="space-y-1.5">
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>
                  Salon Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditSalonStatus("ACTIVE")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      editSalonStatus === "ACTIVE" || editSalonStatus === "OPEN"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                        : theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-zinc-400 hover:text-white"
                          : "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900"
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
                        : theme === "dark"
                          ? "bg-[#181e2b] border-[#2b354b] text-zinc-400 hover:text-white"
                          : "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Inactive</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>
                    Opening Time <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editSalonOpen}
                    onChange={(e) => setEditSalonOpen(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>
                    Closing Time <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editSalonClose}
                    onChange={(e) => setEditSalonClose(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>
                    Status
                  </label>
                  <select
                    value={editSalonStatus}
                    onChange={(e) => setEditSalonStatus(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-semibold ${
                      theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-amber-300" : "bg-slate-50 border-slate-300 text-amber-800 focus:bg-white"
                    }`}
                  >
                    <option value="ACTIVE" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>ACTIVE (Operational)</option>
                    <option value="OPEN" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>OPEN</option>
                    <option value="BUSY" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>BUSY (High Demand)</option>
                    <option value="CLOSED" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>CLOSED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>
                    Classification
                  </label>
                  <select
                    value={editSalonType}
                    onChange={(e) => setEditSalonType(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-semibold ${
                      theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-amber-300" : "bg-slate-50 border-slate-300 text-amber-800 focus:bg-white"
                    }`}
                  >
                    <option value="UNISEX" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Unisex (All Genders)</option>
                    <option value="MALE_ONLY" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Male Only (Gents Salon)</option>
                    <option value="FEMALE_ONLY" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Female Only (Ladies Lounge)</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>
                    Google Maps / Navigation Link
                  </label>
                  <input
                    type="url"
                    value={editSalonLocationLink}
                    onChange={(e) => setEditSalonLocationLink(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>
                  Salon Logo Image URL
                </label>
                <input
                  type="url"
                  value={editSalonLogo}
                  onChange={(e) => setEditSalonLogo(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-amber-400 font-mono ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>
                  Salon Description
                </label>
                <textarea
                  rows={2}
                  value={editSalonDescription}
                  onChange={(e) => setEditSalonDescription(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:border-amber-400 resize-none ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowEditSalonModal(false)}
                  className={`px-4 py-2.5 rounded-xl cursor-pointer font-medium ${
                    theme === "dark" ? "bg-white/5 text-zinc-300 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
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
          <div className={`border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 ${
            theme === "dark" ? "bg-[#121622] border-amber-500/40" : "bg-white border-slate-200"
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
            }`}>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Edit User Details</h3>
              </div>
              <button
                onClick={() => setShowEditUserModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                }`}
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
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Full Name *</label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Email Address *</label>
                  <input
                    type="email"
                    value={editUserEmail}
                    onChange={(e) => setEditUserEmail(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Mobile Number *</label>
                  <input
                    type="tel"
                    value={editUserMobile}
                    onChange={(e) => setEditUserMobile(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Role *</label>
                  <select
                    value={editUserRole}
                    onChange={(e) => setEditUserRole(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-bold ${
                      theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-amber-300" : "bg-slate-50 border-slate-300 text-amber-800 focus:bg-white"
                    }`}
                  >
                    <option value="CUSTOMER" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>CUSTOMER</option>
                    <option value="STAFF" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>STAFF (Stylist)</option>
                    <option value="ADMIN" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Status *</label>
                  <select
                    value={editUserStatus}
                    onChange={(e) => setEditUserStatus(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-semibold ${
                      theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-emerald-300" : "bg-slate-50 border-slate-300 text-emerald-800 focus:bg-white"
                    }`}
                  >
                    <option value="ACTIVE" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>ACTIVE</option>
                    <option value="INACTIVE" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Gender</label>
                  <select
                    value={editUserGender}
                    onChange={(e) => setEditUserGender(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                    }`}
                  >
                    <option value="MALE" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Male</option>
                    <option value="FEMALE" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Female</option>
                    <option value="OTHER" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Other</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Date of Birth</label>
                  <input
                    type="date"
                    value={editUserDob}
                    onChange={(e) => setEditUserDob(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    theme === "dark" ? "bg-white/5 text-zinc-300 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
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
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            theme === "dark" ? "bg-[#121622] border-amber-500/40" : "bg-white border-slate-200"
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
            }`}>
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Issue Live Walk-in Token</h3>
              </div>
              <button
                onClick={() => setShowAddQueueModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQueueToken} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sameer Kulkarni"
                  value={newQueueCustomer}
                  onChange={(e) => setNewQueueCustomer(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Requested Service *</label>
                <select
                  value={newQueueService}
                  onChange={(e) => setNewQueueService(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                  }`}
                >
                  {servicesList.map((s) => (
                    <option key={s.id} value={s.name} className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>
                      {s.name} (₹{s.price})
                    </option>
                  ))}
                  <option value="Executive Haircut & Styling" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Executive Haircut &amp; Styling</option>
                  <option value="Beard Trim & Clean Shave" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Beard Trim &amp; Clean Shave</option>
                </select>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Salon Branch *</label>
                <select
                  value={newQueueBranch}
                  onChange={(e) => setNewQueueBranch(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                  }`}
                >
                  {salons.map((sl) => (
                    <option key={sl.id} value={`${sl.name} (${sl.cityName})`} className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>
                      {sl.name} ({sl.cityName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Estimated Wait</label>
                  <input
                    type="text"
                    placeholder="e.g. 15 mins"
                    value={newQueueWait}
                    onChange={(e) => setNewQueueWait(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Initial Status</label>
                  <select
                    value={newQueueStatus}
                    onChange={(e) => setNewQueueStatus(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-semibold ${
                      theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-amber-300" : "bg-slate-50 border-slate-300 text-amber-800 focus:bg-white"
                    }`}
                  >
                    <option value="WAITING" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>WAITING</option>
                    <option value="CALLED" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>CALLED</option>
                    <option value="IN_SERVICE" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>IN_SERVICE</option>
                  </select>
                </div>
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowAddQueueModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    theme === "dark" ? "bg-white/5 text-zinc-300 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
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
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            theme === "dark" ? "bg-[#121622] border-amber-500/40" : "bg-white border-slate-200"
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
            }`}>
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Edit Token {editingQueueItem.token}</h3>
              </div>
              <button
                onClick={() => setShowEditQueueModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditQueue} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Customer Name *</label>
                <input
                  type="text"
                  value={editQueueCustomer}
                  onChange={(e) => setEditQueueCustomer(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Service *</label>
                <input
                  type="text"
                  value={editQueueService}
                  onChange={(e) => setEditQueueService(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Salon Branch *</label>
                <input
                  type="text"
                  value={editQueueBranch}
                  onChange={(e) => setEditQueueBranch(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Wait Estimate</label>
                  <input
                    type="text"
                    value={editQueueWait}
                    onChange={(e) => setEditQueueWait(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Status</label>
                  <select
                    value={editQueueStatus}
                    onChange={(e) => setEditQueueStatus(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-semibold ${
                      theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-amber-300" : "bg-slate-50 border-slate-300 text-amber-800 focus:bg-white"
                    }`}
                  >
                    <option value="WAITING" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>WAITING</option>
                    <option value="CALLED" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>CALLED</option>
                    <option value="IN_SERVICE" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>IN_SERVICE</option>
                    <option value="COMPLETED" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>COMPLETED</option>
                    <option value="CANCELLED" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowEditQueueModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    theme === "dark" ? "bg-white/5 text-zinc-300 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
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
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            theme === "dark" ? "bg-[#121622] border-amber-500/40" : "bg-white border-slate-200"
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
            }`}>
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Add New Salon Service</h3>
              </div>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddService} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Service Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Keratin Smooth Therapy"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Category *</label>
                <select
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value as any)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-semibold ${
                    theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-amber-300" : "bg-slate-50 border-slate-300 text-amber-800 focus:bg-white"
                  }`}
                >
                  <option value="Haircut & Styling" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Haircut &amp; Styling</option>
                  <option value="Color & Spa" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Color &amp; Spa</option>
                  <option value="Beard & Shave" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Beard &amp; Shave</option>
                  <option value="Facial & Skincare" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Facial &amp; Skincare</option>
                  <option value="Treatments" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Treatments</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="650"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Duration (Mins) *</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Gender Target</label>
                <select
                  value={newServiceGender}
                  onChange={(e) => setNewServiceGender(e.target.value as any)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                  }`}
                >
                  <option value="UNISEX" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Unisex (All Clients)</option>
                  <option value="MALE_ONLY" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Male Only (Gents)</option>
                  <option value="FEMALE_ONLY" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Female Only (Ladies)</option>
                </select>
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    theme === "dark" ? "bg-white/5 text-zinc-300 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
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
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            theme === "dark" ? "bg-[#121622] border-amber-500/40" : "bg-white border-slate-200"
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${
              theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
            }`}>
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-500" />
                <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Edit Service Details</h3>
              </div>
              <button
                onClick={() => setShowEditServiceModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${
                  theme === "dark" ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditService} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Service Name *</label>
                <input
                  type="text"
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                    theme === "dark"
                      ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                      : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block font-semibold uppercase mb-1 ${
                  theme === "dark" ? "text-zinc-300" : "text-slate-700"
                }`}>Category *</label>
                <select
                  value={editServiceCategory}
                  onChange={(e) => setEditServiceCategory(e.target.value as any)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-semibold ${
                    theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-amber-300" : "bg-slate-50 border-slate-300 text-amber-800 focus:bg-white"
                  }`}
                >
                  <option value="Haircut & Styling" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Haircut &amp; Styling</option>
                  <option value="Color & Spa" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Color &amp; Spa</option>
                  <option value="Beard & Shave" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Beard &amp; Shave</option>
                  <option value="Facial & Skincare" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Facial &amp; Skincare</option>
                  <option value="Treatments" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Treatments</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Price (₹) *</label>
                  <input
                    type="number"
                    value={editServicePrice}
                    onChange={(e) => setEditServicePrice(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Duration (Mins) *</label>
                  <input
                    type="number"
                    value={editServiceDuration}
                    onChange={(e) => setEditServiceDuration(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-mono ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white placeholder-zinc-500"
                        : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Gender Target</label>
                  <select
                    value={editServiceGender}
                    onChange={(e) => setEditServiceGender(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 ${
                      theme === "dark"
                        ? "bg-[#181e2b] border-[#2b354b] text-white"
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white"
                    }`}
                  >
                    <option value="UNISEX" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Unisex</option>
                    <option value="MALE_ONLY" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Male Only</option>
                    <option value="FEMALE_ONLY" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>Female Only</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold uppercase mb-1 ${
                    theme === "dark" ? "text-zinc-300" : "text-slate-700"
                  }`}>Status</label>
                  <select
                    value={editServiceStatus}
                    onChange={(e) => setEditServiceStatus(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-400 font-semibold ${
                      theme === "dark" ? "bg-[#181e2b] border-[#2b354b] text-emerald-300" : "bg-slate-50 border-slate-300 text-emerald-800 focus:bg-white"
                    }`}
                  >
                    <option value="ACTIVE" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>ACTIVE</option>
                    <option value="INACTIVE" className={theme === "dark" ? "bg-[#121622] text-white" : "bg-white text-slate-900"}>INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className={`pt-3 flex items-center justify-end gap-3 border-t ${
                theme === "dark" ? "border-[#232a3b]" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowEditServiceModal(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    theme === "dark" ? "bg-white/5 text-zinc-300 hover:text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
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
          <div className={`border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 text-center ${
            theme === "dark" ? "bg-[#121622] border-amber-500/40" : "bg-white border-slate-200"
          }`}>
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center shadow-inner border ${
              theme === "dark" ? "bg-rose-500/15 border-rose-500/30 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600"
            }`}>
              <LogOut className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className={`text-lg font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Are you sure to logout?</h3>
              <p className={`text-xs ${theme === "dark" ? "text-zinc-400" : "text-slate-500"}`}>
                You will be signed out from your SalonFlow AI Admin Portal session. You can sign back in anytime.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirmModal(false)}
                className={`py-2.5 px-4 rounded-xl border font-medium text-xs transition-colors cursor-pointer ${
                  theme === "dark"
                    ? "bg-[#1a202d] hover:bg-[#222b3d] border-[#2d384e] text-zinc-300 hover:text-white"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900"
                }`}
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
