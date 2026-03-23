'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Camera,
  MessageSquare,
  Shield,
  Zap,
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

interface SafeRoute {
  id: string;
  from: string;
  to: string;
  checkInInterval: number;
  contacts: EmergencyContact[];
  status: 'active' | 'paused';
  nextCheckIn: string;
}

export default function SafeCommutePage() {
  const [routes, setRoutes] = useState<SafeRoute[]>([
    {
      id: '1',
      from: 'Hostel A',
      to: 'Library',
      checkInInterval: 10,
      contacts: [
        { id: '1', name: 'Mom', phone: '+91 9876543210' },
        { id: '2', name: 'Best Friend', phone: '+91 8765432109' },
        { id: '3', name: 'Security', phone: '+91 7654321098' },
      ],
      status: 'active',
      nextCheckIn: '2:15 PM',
    },
  ]);

  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);

  const handleCheckIn = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      console.log('✅ Check-in confirmed!');
      console.log(`📱 Alerts sent to: ${route.contacts.map(c => c.name).join(', ')}`);
    }
    setSelectedRoute(null);
    setCheckInNotes('');
    setHasPhoto(false);
    setHasVoice(false);
  };

  const handleEmergency = () => {
    console.log('🆘 SOS ACTIVATED! All emergency contacts notified.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 px-8 py-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Safe Commute</h1>
            <p className="text-slate-400 text-sm">Real-time tracking & emergency alerts</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Emergency SOS Button */}
          <motion.button
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEmergency}
            className="w-full mb-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-6 px-8 rounded-xl shadow-2xl flex items-center justify-center gap-3"
          >
            <AlertTriangle className="w-7 h-7 animate-pulse" />
            <span className="text-lg">🆘 EMERGENCY SOS</span>
            <Phone className="w-7 h-7" />
          </motion.button>

          {/* Active Routes */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Active Routes</h2>

            <div className="space-y-4">
              {routes.map((route, idx) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 hover:bg-slate-750 transition-all"
                >
                  {/* Route Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-bold text-white">
                          {route.from} → {route.to}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Every {route.checkInInterval} min
                        </span>
                        <span>Next: {route.nextCheckIn}</span>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-green-600 bg-opacity-20 text-green-400 rounded-lg text-sm font-bold">
                      ● ACTIVE
                    </span>
                  </div>

                  {/* Check-In Form */}
                  {selectedRoute === route.id ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-700 bg-opacity-30 border border-slate-600 rounded-lg p-4 mb-4 space-y-3"
                    >
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        Check-In
                      </h4>

                      <textarea
                        placeholder="Any safety concerns? (optional)"
                        value={checkInNotes}
                        onChange={e => setCheckInNotes(e.target.value)}
                        className="w-full bg-slate-600 text-white placeholder-slate-500 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={hasPhoto}
                            onChange={e => setHasPhoto(e.target.checked)}
                            className="rounded"
                          />
                          <Camera className="w-4 h-4" />
                          <span className="text-sm">Attach Photo</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={hasVoice}
                            onChange={e => setHasVoice(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">🎤 Voice Clip</span>
                        </label>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleCheckIn(route.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm
                        </button>
                        <button
                          onClick={() => setSelectedRoute(null)}
                          className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setSelectedRoute(route.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold mb-4"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Check-In Now
                    </button>
                  )}

                  {/* Emergency Contacts */}
                  <div className="pt-4 border-t border-slate-700">
                    <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      Emergency Contacts
                    </h4>
                    <div className="space-y-2">
                      {route.contacts.map(contact => (
                        <div key={contact.id} className="flex items-center justify-between bg-slate-700 bg-opacity-30 rounded-lg p-3">
                          <div>
                            <p className="text-white text-sm font-semibold">{contact.name}</p>
                            <p className="text-slate-400 text-xs">{contact.phone}</p>
                          </div>
                          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold">
                            Alert
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                      📍 Live GPS
                    </button>
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                      🗺️ Safe Routes
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Features Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Safety Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '⏰', title: 'Late Alerts', desc: 'Auto WhatsApp to contacts' },
                { icon: '📸', title: 'Photo + Voice', desc: 'Attach multimedia evidence' },
                { icon: '📍', title: 'Live GPS', desc: 'Real-time location' },
                { icon: '🛣️', title: 'Safe Routes', desc: 'Pre-defined safe paths' },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.08 }}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 hover:bg-slate-750 transition-all"
                >
                  <p className="text-4xl mb-3">{feature.icon}</p>
                  <h3 className="text-white font-bold text-sm mb-1">{feature.title}</h3>
                  <p className="text-slate-400 text-xs">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
