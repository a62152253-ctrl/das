import React, { useState } from 'react';
import { Building2, MapPin, Briefcase, Link as LinkIcon, Phone, Mail, FileText, CheckCircle2, ArrowRight, ArrowLeft, Building, Hash, Loader2, ImagePlus, X } from 'lucide-react';
import { AuthView } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getFirebaseDb, getFirebaseAuth } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface Props {
  onNavigate: (view: AuthView) => void;
}

export function CompanyProfileForm({ onNavigate }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [serviceInput, setServiceInput] = useState('');
  const [services, setServices] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    companyName: '',
    nip: '',
    description: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    socialLinks: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const addService = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (serviceInput.trim() !== '' && !services.includes(serviceInput.trim())) {
        setServices([...services, serviceInput.trim()]);
      }
      setServiceInput('');
    }
  };

  const removeService = (serviceToRemove: string) => {
    setServices(services.filter(s => s !== serviceToRemove));
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
    } else {
      setLoading(true);
      setError(null);
      try {
        const auth = await getFirebaseAuth();
        const db = await getFirebaseDb();
        const user = auth.currentUser;
        if (!user) throw new Error("No user logged in");
        
        await setDoc(doc(db, 'companies', user.uid), {
          ...formData,
          services: services.join(', '),
          visibilityPackage: 'free',
          lat: 52.5360,
          lng: 17.5950,
          createdAt: serverTimestamp()
        });
        
        localStorage.setItem('has_company_profile_' + user.uid, 'true');
        console.log('Company Profile Submitted', formData);
        onNavigate('dashboard-company');
      } catch (err: any) {
        console.error('Error saving company profile:', err);
        setError(err.message || 'Failed to save profile');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Company Profile</h1>
          <p className="text-slate-500 text-sm">Stand out by providing comprehensive details about your business.</p>
        </motion.div>
        
        {/* Advanced Progress Bar */}
        <div className="mt-8 flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0" 
            initial={{ width: 0 }}
            animate={{ width: `${((step - 1) / 2) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          ></motion.div>
          
          {[1, 2, 3].map((item) => (
            <motion.div 
              key={item} 
              initial={false}
              animate={{ 
                scale: step === item ? 1.1 : 1,
                backgroundColor: step >= item ? '#2563eb' : '#ffffff',
                borderColor: step >= item ? '#2563eb' : '#e2e8f0',
                color: step >= item ? '#ffffff' : '#94a3b8'
              }}
              className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 shadow-sm transition-colors duration-300"
            >
              {step > item ? <CheckCircle2 className="w-4 h-4" /> : item}
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
          <span className={step >= 1 ? 'text-blue-600' : ''}>Essentials</span>
          <span className={`text-center ${step >= 2 ? 'text-blue-600' : ''}`}>Location</span>
          <span className={`text-right ${step >= 3 ? 'text-blue-600' : ''}`}>Services</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50/80 backdrop-blur-sm text-red-600 p-4 rounded-xl text-sm border border-red-100 mb-6 flex items-center"
            >
              <span className="font-semibold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200/60 shadow-sm p-6 sm:p-8 rounded-2xl">
                <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-slate-100">
                  <div className="w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group">
                    <ImagePlus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Logo</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Company Identity</h3>
                    <p className="text-sm text-slate-500">Upload your logo and set up your core brand details.</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label htmlFor="companyName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Company Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Building className="h-4 w-4" />
                      </div>
                      <input
                        id="companyName"
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="Acme Corporation Ltd."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="nip" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tax ID (NIP)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Hash className="h-4 w-4" />
                      </div>
                      <input
                        id="nip"
                        type="text"
                        required
                        value={formData.nip}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="123-456-78-90"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">About the Company</label>
                    <div className="relative group">
                      <div className="absolute top-3.5 left-3.5 flex items-start pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                      <textarea
                        id="description"
                        required
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                        placeholder="Tell us what makes your company unique..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200/60 shadow-sm p-6 sm:p-8 rounded-2xl">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Location & Contact</h3>
                  <p className="text-sm text-slate-500">Where can clients find you?</p>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Street Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <input
                        id="address"
                        type="text"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="123 Innovation Drive"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="city" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">City</label>
                      <input
                        id="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="Warsaw"
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Postal Code</label>
                      <input
                        id="postalCode"
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="00-001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                          <Phone className="h-4 w-4" />
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          placeholder="+48 123 456 789"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Business Email</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          placeholder="contact@acme.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200/60 shadow-sm p-6 sm:p-8 rounded-2xl">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Services & Digital</h3>
                  <p className="text-sm text-slate-500">What do you offer and where can people find you?</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Services Offered</label>
                    <div className="relative group mb-3">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={serviceInput}
                        onChange={(e) => setServiceInput(e.target.value)}
                        onKeyDown={addService}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        placeholder="Type a service and press Enter"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {services.map((service) => (
                          <motion.span
                            key={service}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold shadow-sm"
                          >
                            {service}
                            <button
                              type="button"
                              onClick={() => removeService(service)}
                              className="ml-2 text-blue-400 hover:text-blue-600 focus:outline-none"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      {services.length === 0 && (
                        <span className="text-sm text-slate-400 italic">No services added yet.</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 space-y-5">
                    <div>
                      <label htmlFor="website" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Website (Optional)</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                          <LinkIcon className="h-4 w-4" />
                        </div>
                        <input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          placeholder="https://acme.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="socialLinks" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">LinkedIn Profile (Optional)</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                          <LinkIcon className="h-4 w-4" />
                        </div>
                        <input
                          id="socialLinks"
                          type="text"
                          value={formData.socialLinks}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          placeholder="linkedin.com/company/acme"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-6 mt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center px-6 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          ) : (
            <div></div> // Empty div to keep Next button on the right
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="group relative flex items-center px-8 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (step === 3 ? 'Complete Profile' : 'Continue')}
              {step < 3 && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
