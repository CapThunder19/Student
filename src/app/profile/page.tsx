'use client';

import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Award, BookOpen, Edit2, X, Save, Loader2, Camera } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const PAGE_BG = 'bg-[#FDF9F1] text-[#1A1A1A]';
const CARD = 'bg-white border-2 border-[#1A1A1A] rounded-3xl shadow-[4px_4px_0_0_#1A1A1A]';
const SUBTLE_CARD = 'bg-[#FFF7E7] border-2 border-[#1A1A1A] rounded-2xl shadow-[3px_3px_0_0_#1A1A1A]';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    major: '',
    year: '',
    phone: '',
    location: '',
    gpa: '',
    profilePhoto: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditForm({
          name: data.name || '',
          major: data.major || '',
          year: data.year || '',
          phone: data.phone || '',
          location: data.location || '',
          gpa: data.gpa || '',
          profilePhoto: data.profilePhoto || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic image validation
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      // Check size (e.g. max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large (max 5MB)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditForm(prev => ({ ...prev, profilePhoto: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${PAGE_BG}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${PAGE_BG}`}>
        <p className="text-sm text-[#7C6A58] px-4 py-2 rounded-2xl border-2 border-[#1A1A1A] bg-[#FFF7E7] shadow-[3px_3px_0_0_#1A1A1A]">
          Profile not found.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${PAGE_BG}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left Column: Picture and Summary */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${CARD} overflow-hidden`}
          >
            <div className="h-24 bg-[#FFF1DA] border-b-2 border-[#1A1A1A] relative">
               <div className="absolute inset-x-0 bottom-[-40px] flex justify-center">
                  <div className="relative group shrink-0 w-24 h-24 rounded-full bg-[#FEF3C7] border-2 border-[#1A1A1A] p-1 shadow-[3px_3px_0_0_#1A1A1A]">
                    <motion.div
                      whileHover={{ scale: isEditing ? 1.02 : 1.05 }}
                      className="w-full h-full rounded-full bg-[#F97316] flex items-center justify-center text-3xl overflow-hidden shadow-[2px_2px_0_0_#1A1A1A] text-[#1A1A1A]"
                    >
                      {editForm.profilePhoto || profile.profilePhoto ? (
                        <img
                          src={isEditing ? editForm.profilePhoto : profile.profilePhoto}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>👩‍🎓</span>
                      )}
                    </motion.div>
                    
                    {isEditing && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-[#1A1A1A] text-white p-1.5 rounded-full shadow-[2px_2px_0_0_#1A1A1A] hover:bg-[#4B5563] transition"
                        title="Upload Photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
               </div>
            </div>
            
                <div className="pt-14 pb-6 px-6 text-center">
               {isEditing ? (
                  <input
                    type="text"
                  className="w-full text-center text-xl font-bold bg-white border-2 border-[#1A1A1A] rounded-xl mb-2 py-1 outline-none"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                  />
               ) : (
                 <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
               )}
               
               <div className="text-[#7C6A58] text-sm mb-4">
                 {isEditing ? (
                   <input
                     type="text"
                     className="w-full text-center bg-white border-2 border-[#1A1A1A] rounded-xl px-2 py-1 text-xs outline-none"
                     placeholder="e.g. Computer Science"
                     value={editForm.major}
                     onChange={e => setEditForm({...editForm, major: e.target.value})}
                   />
                 ) : (
                   <p>{profile.major || 'Undecided'}</p>
                 )}
               </div>

                {isEditing ? (
                  <div className="flex gap-2 justify-center mb-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#22C55E] border-2 border-[#1A1A1A] text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1 shadow-[3px_3px_0_0_#1A1A1A] disabled:opacity-70"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(false)}
                      className="bg-white border-2 border-[#1A1A1A] text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1 shadow-[3px_3px_0_0_#1A1A1A]"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-[#F97316] text-[#1A1A1A] font-semibold text-sm py-2 rounded-full flex items-center justify-center gap-2 mb-4 border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A]"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                )}

              <div className="flex justify-between items-center bg-[#FFF7E7] border-2 border-[#1A1A1A] rounded-2xl text-sm mb-2 text-left px-3 py-2 shadow-[2px_2px_0_0_#1A1A1A]">
                <div className="text-[#7C6A58]">Year</div>
                 <div className="font-semibold">{isEditing ? (
                  <input type="text" className="bg-white border-2 border-[#1A1A1A] w-16 text-right px-1 rounded-xl outline-none text-sm" value={editForm.year} onChange={e=>setEditForm({...editForm, year: e.target.value})} />
                 ) : (profile.year || '-')}</div>
               </div>
              <div className="flex justify-between items-center bg-[#FFF7E7] border-2 border-[#1A1A1A] rounded-2xl text-sm text-left px-3 py-2 shadow-[2px_2px_0_0_#1A1A1A]">
                <div className="text-[#7C6A58]">GPA</div>
                 <div className="font-semibold">{isEditing ? (
                  <input type="text" className="bg-white border-2 border-[#1A1A1A] w-16 text-right px-1 rounded-xl outline-none text-sm" value={editForm.gpa} onChange={e=>setEditForm({...editForm, gpa: e.target.value})} />
                 ) : (profile.gpa || '-')}</div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Info and activity */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${CARD} p-7`}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F97316] border-2 border-[#1A1A1A] shadow-[2px_2px_0_0_#1A1A1A]">
                <User className="w-4 h-4 text-[#1A1A1A]" />
              </span>
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className={`${SUBTLE_CARD} flex items-center gap-4 p-3`}>
                <Mail className="w-5 h-5 text-[#1A1A1A] shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-[#7C6A58] mb-0.5">Email (Cannot be changed)</p>
                  <p className="font-medium truncate">{profile.email}</p>
                </div>
              </div>

              <div className={`${SUBTLE_CARD} flex items-center gap-4 p-3`}>
                <Phone className="w-5 h-5 text-[#1A1A1A] shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-[#7C6A58] mb-0.5">Phone Number</p>
                  {isEditing ? (
                     <input type="text" className="bg-white border-2 border-[#1A1A1A] w-full px-2 py-1 rounded-xl outline-none text-sm" value={editForm.phone} onChange={e=>setEditForm({...editForm, phone: e.target.value})} placeholder="+1 234 567 8900" />
                  ) : (
                     <p className="font-medium truncate">{profile.phone || 'Not added yet'}</p>
                  )}
                </div>
              </div>

              <div className={`${SUBTLE_CARD} flex items-center gap-4 p-3`}>
                <MapPin className="w-5 h-5 text-[#1A1A1A] shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-[#7C6A58] mb-0.5">Location</p>
                  {isEditing ? (
                     <input type="text" className="bg-white border-2 border-[#1A1A1A] w-full px-2 py-1 rounded-xl outline-none text-sm" value={editForm.location} onChange={e=>setEditForm({...editForm, location: e.target.value})} placeholder="City, State" />
                  ) : (
                     <p className="font-medium truncate">{profile.location || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`${CARD} p-6 relative overflow-hidden bg-[#DBEAFE]`}
              >
                <BookOpen className="w-20 h-20 text-[#1D4ED8]/10 absolute right-[-10px] bottom-[-10px]" />
                <p className="text-sm text-[#1D4ED8] font-medium mb-1">Courses Enrolled</p>
                <p className="text-4xl font-bold text-[#1A1A1A] mb-2">{profile.coursesEnrolled || '0'}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className={`${CARD} p-6 relative overflow-hidden bg-[#FFE4E6]`}
              >
                <Award className="w-20 h-20 text-[#BE123C]/10 absolute right-[-10px] bottom-[-10px]" />
                <p className="text-sm text-[#BE123C] font-medium mb-1">Achievements</p>
                <p className="text-4xl font-bold text-[#1A1A1A] mb-2">{profile.achievements || '0'}</p>
              </motion.div>
          </div>
          
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${CARD} p-7`}
          >
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {['Joined the student platform', 'Updated profile information'].map((activity, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className={`${SUBTLE_CARD} flex items-center gap-4 p-4`}
                >
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full shrink-0"></div>
                  <p>{activity}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
