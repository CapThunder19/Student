'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Phone,
  MessageSquare,
  MapPin,
  Users,
  Shield,
  CheckCircle,
  X,
  Plus,
  Trash2,
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

const DEFAULT_CONTACTS: EmergencyContact[] = [
  { id: '1', name: 'Mom', phone: '+91 9876543210', relation: 'Parent' },
  { id: '2', name: 'Dad', phone: '+91 8765432109', relation: 'Parent' },
  { id: '3', name: 'College Security', phone: '+91 7654321098', relation: 'Security' },
];

const SAFETY_TIPS = [
  'Stay calm and assess the situation.',
  'Move to a safe, well-lit, and populated area.',
  'Avoid sharing your live location publicly.',
  'Call your emergency contact or dial 112 (National Emergency).',
];

export default function SOSPage() {
  const [sosActivated, setSosActivated] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_CONTACTS;
    const stored = localStorage.getItem('sos_contacts');
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore parse errors */ }
    }
    return DEFAULT_CONTACTS;
  });
  const [showAddContact, setShowAddContact] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!activating) return;
    if (countdown <= 0) {
      const t = setTimeout(() => {
        setSosActivated(true);
        setActivating(false);
      }, 0);
      return () => clearTimeout(t);
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [activating, countdown]);

  const handleSOSPress = () => {
    setCountdown(3);
    setActivating(true);
  };

  const handleCancel = () => {
    setActivating(false);
    setSosActivated(false);
    setCountdown(3);
  };

  const handleAddContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const updated = [
      ...contacts,
      { id: Date.now().toString(), name: newName.trim(), phone: newPhone.trim(), relation: newRelation.trim() || 'Contact' },
    ];
    setContacts(updated);
    localStorage.setItem('sos_contacts', JSON.stringify(updated));
    setNewName('');
    setNewPhone('');
    setNewRelation('');
    setShowAddContact(false);
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    localStorage.setItem('sos_contacts', JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 px-8 py-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">SOS Emergency</h1>
            <p className="text-slate-400 text-sm">Quick access to emergency help</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-8 space-y-8">

          {/* SOS Button */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <AnimatePresence mode="wait">
              {sosActivated ? (
                <motion.div
                  key="activated"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-full bg-red-900 border border-red-500 rounded-2xl p-8 text-center"
                >
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3 animate-pulse" />
                  <h2 className="text-2xl font-bold text-white mb-2">🆘 SOS Activated!</h2>
                  <p className="text-red-300 mb-6">
                    Emergency alert sent to all your contacts. Help is on the way.
                  </p>
                  <div className="space-y-2 mb-6">
                    {contacts.map((c) => (
                      <div key={c.id} className="flex items-center justify-between bg-red-950 rounded-lg px-4 py-2 text-sm">
                        <span className="text-white font-semibold">{c.name}</span>
                        <span className="text-red-300 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Notified
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Cancel SOS
                  </button>
                </motion.div>
              ) : activating ? (
                <motion.div
                  key="activating"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full bg-orange-950 border border-orange-500 rounded-2xl p-8 text-center"
                >
                  <p className="text-orange-300 text-lg font-semibold mb-2">Activating SOS in…</p>
                  <p className="text-white text-6xl font-black mb-4">{countdown}</p>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 mx-auto"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="idle"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSOSPress}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-8 px-8 rounded-2xl shadow-2xl flex items-center justify-center gap-4 text-2xl"
                >
                  <AlertTriangle className="w-8 h-8 animate-pulse" />
                  🆘 PRESS FOR EMERGENCY SOS
                  <Phone className="w-8 h-8" />
                </motion.button>
              )}
            </AnimatePresence>
            {!sosActivated && !activating && (
              <p className="text-slate-500 text-xs mt-3">Press button — activates after 3-second countdown</p>
            )}
          </motion.section>

          {/* Quick Dial */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-400" /> Quick Dial
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: '112', desc: 'National Emergency', icon: '🚨' },
                { label: '100', desc: 'Police', icon: '👮' },
                { label: '102', desc: 'Ambulance', icon: '🚑' },
                { label: '101', desc: 'Fire', icon: '🔥' },
                { label: '1091', desc: "Women's Helpline", icon: '👩' },
                { label: '1098', desc: "Child Helpline", icon: '🧒' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={`tel:${item.label}`}
                  className="bg-slate-800 border border-slate-700 hover:border-red-500 hover:bg-slate-750 rounded-xl p-4 text-center transition-all group"
                >
                  <p className="text-2xl mb-1">{item.icon}</p>
                  <p className="text-white font-black text-lg group-hover:text-red-400 transition-colors">{item.label}</p>
                  <p className="text-slate-400 text-xs">{item.desc}</p>
                </a>
              ))}
            </div>
          </motion.section>

          {/* Emergency Contacts */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> Emergency Contacts
              </h2>
              <button
                onClick={() => setShowAddContact(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 bg-opacity-20 flex items-center justify-center text-blue-400 font-bold text-sm">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{contact.name}</p>
                      <p className="text-slate-400 text-xs">{contact.relation} · {contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`sms:${contact.phone}`}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      title="Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2 bg-slate-700 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Safety Tips */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" /> Safety Tips
            </h2>
            <div className="bg-slate-800 border border-slate-700 rounded-xl divide-y divide-slate-700">
              {SAFETY_TIPS.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4">
                  <MapPin className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  <p className="text-slate-300 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Add Emergency Contact</h3>
                <button onClick={() => setShowAddContact(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Mom"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-1">Relation (optional)</label>
                  <input
                    type="text"
                    value={newRelation}
                    onChange={(e) => setNewRelation(e.target.value)}
                    placeholder="e.g. Parent, Friend"
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="p-5 border-t border-slate-700 flex gap-3">
                <button
                  onClick={() => setShowAddContact(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  disabled={!newName.trim() || !newPhone.trim()}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
