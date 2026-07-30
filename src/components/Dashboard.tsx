import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getFirebaseDb } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Building2, MapPin, Briefcase, Link as LinkIcon, Phone, Mail, 
  FileText, LogOut, Loader2, Sparkles, User as UserIcon, 
  TrendingUp, Users, Star, ArrowRight, Settings, Plus, Bell 
} from 'lucide-react';
import { AuthView } from '../types';
import { motion } from 'motion/react';

interface CompanyData {
  companyName: string;
  nip: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  socialLinks?: string;
  services: string;
}

interface Props {
  onNavigate: (view: AuthView) => void;
}

const StatCard = ({ icon: Icon, label, value, trend, trendUp }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center border border-slate-100">
        <Icon className="w-6 h-6" />
      </div>
      <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
        {trend}
      </div>
    </div>
    <div>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-slate-500 font-medium mt-1">{label}</p>
    </div>
  </motion.div>
);

export function Dashboard({ onNavigate }: Props) {
  const { user, profile, logout } = useAuth();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanyData() {
      if (user && profile?.role === 'firma') {
        try {
          const db = await getFirebaseDb();
          const docRef = doc(db, 'companies', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setCompanyData(docSnap.data() as CompanyData);
          }
        } catch (error) {
          console.error("Error fetching company data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    
    fetchCompanyData();
  }, [user, profile]);

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Fallback for non-firma users
  if (profile?.role !== 'firma') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
            <UserIcon className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome, {profile?.name || 'Client'}!</h1>
          <p className="text-slate-500 mb-8 font-medium">You are successfully authenticated as <br/><span className="text-slate-900 font-bold">{user?.email}</span></p>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full py-4 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-bold rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </motion.div>
      </div>
    );
  }

  // Dashboard for Firma
  return (
    <div className="min-h-screen bg-slate-50 w-full font-sans pb-20">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">Partner Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full flex items-center justify-center transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-px h-8 bg-slate-200 mx-1"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 font-bold rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Hello, {companyData?.companyName || 'Partner'}
            </h1>
            <p className="text-lg text-slate-500 font-medium">Here's what's happening with your business today.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center px-5 py-3 bg-white text-slate-700 hover:bg-slate-50 font-bold rounded-xl shadow-sm border border-slate-200 transition-colors">
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </button>
            <button className="flex items-center px-5 py-3 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl shadow-md shadow-blue-600/20 transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              New Offer
            </button>
          </div>
        </motion.div>

        {/* Stats Bento Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          <StatCard icon={TrendingUp} label="Profile Views (30d)" value="12,450" trend="+14.5%" trendUp={true} />
          <StatCard icon={Users} label="Client Inquiries" value="342" trend="+5.2%" trendUp={true} />
          <StatCard icon={Briefcase} label="Active Projects" value="18" trend="-2.1%" trendUp={false} />
          <StatCard icon={Star} label="Average Rating" value="4.9" trend="+0.1" trendUp={true} />
        </motion.div>

        {companyData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Profile Info */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-8"
            >
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                </div>
                
                <div className="px-8 pb-10 relative">
                  <div className="w-28 h-28 bg-white rounded-3xl p-2 shadow-xl absolute -top-14 border border-slate-100 flex items-center justify-center">
                    <div className="w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center text-slate-800">
                      <Building2 className="w-12 h-12" />
                    </div>
                  </div>
                  
                  <div className="pt-20">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{companyData.companyName}</h2>
                        <p className="text-slate-500 mt-2 flex items-center text-lg font-medium">
                          <MapPin className="w-5 h-5 mr-2 text-slate-400" />
                          {companyData.city}, {companyData.address}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200">
                          <Sparkles className="w-4 h-4 mr-1.5" /> Verified Partner
                        </span>
                        <span className="text-slate-400 text-sm font-medium">
                          NIP: {companyData.nip}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                      <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">About the Company</h3>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {companyData.description || "No description provided. Add one to attract more clients."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Services</h3>
                        <div className="flex flex-wrap gap-2">
                          {companyData.services ? companyData.services.split(',').map((s, idx) => (
                            <span key={idx} className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-200">
                              {s.trim()}
                            </span>
                          )) : (
                            <span className="text-slate-400 italic text-sm">No services listed.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions / Getting Started */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-blue-900/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Grow your visibility</h3>
                    <p className="text-blue-100 font-medium max-w-md">Complete your portfolio with high-quality images and case studies to increase client inquiries by up to 40%.</p>
                  </div>
                  <button className="whitespace-nowrap px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
                    Enhance Profile
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Contact Card */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 mb-6">Contact Details</h3>
                
                <div className="space-y-5">
                  {companyData.phone && (
                    <div className="flex items-center text-slate-700">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-4 border border-slate-100 text-slate-500">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone</div>
                        <div className="font-bold">{companyData.phone}</div>
                      </div>
                    </div>
                  )}
                  {companyData.email && (
                    <div className="flex items-center text-slate-700">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-4 border border-slate-100 text-slate-500">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address</div>
                        <div className="font-bold truncate max-w-[200px]">{companyData.email}</div>
                      </div>
                    </div>
                  )}
                  {companyData.website && (
                    <div className="flex items-center text-slate-700">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mr-4 border border-slate-100 text-slate-500">
                        <LinkIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Website</div>
                        <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">
                          {companyData.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <button className="w-full mt-8 py-3 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold rounded-xl border border-slate-200 transition-colors">
                  Edit Contact Info
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-slate-900">Recent Activity</h3>
                  <button className="text-blue-600 text-sm font-bold hover:underline">View All</button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Profile approved</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Your company profile is now live.</p>
                      <p className="text-xs text-slate-400 mt-1">Just now</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Welcome to Partner Portal</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Account successfully created.</p>
                      <p className="text-xs text-slate-400 mt-1">Today</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-200">
            <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Profile Data Unavailable</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">We couldn't load your company profile data. Please try refreshing the page or contact support.</p>
            <button className="mt-8 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
              Retry Loading
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
