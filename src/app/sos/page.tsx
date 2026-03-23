'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Phone, MessageSquare, Users, Heart, Headphones } from 'lucide-react';

export default function SOS() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        {/* Critical Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <h1 className="text-4xl font-bold">Emergency Support</h1>
          </div>
          <p className="text-red-100 text-lg">In crisis? Reach out immediately. You're not alone.</p>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {[
            { icon: Phone, label: 'Crisis Hotline', contact: '1-800-273-8255', color: 'from-red-500 to-red-700' },
            { icon: Headphones, label: 'Counseling Center', contact: '+1 (555) 000-1234', color: 'from-pink-500 to-pink-700' },
            { icon: MessageSquare, label: 'Text Support', contact: 'Text HOME to 741741', color: 'from-purple-500 to-pink-500' },
          ].map((contact, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`bg-gradient-to-br ${contact.color} rounded-2xl p-8 text-white shadow-xl cursor-pointer`}
            >
              <contact.icon className="w-12 h-12 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">{contact.label}</h3>
              <p className="text-white/90 text-lg font-semibold">{contact.contact}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Support Resources */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Campus Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Mental Health Support',
                description: 'Free counseling sessions, therapy, and mental wellness programs',
                icon: '🧠',
              },
              {
                title: 'Academic Assistance',
                description: 'Tutoring, study groups, and academic advising services',
                icon: '📚',
              },
              {
                title: 'Financial Aid',
                description: 'Emergency funds, scholarships, and financial counseling',
                icon: '💰',
              },
              {
                title: 'Health Services',
                description: 'Medical care, wellness programs, and health resources',
                icon: '⚕️',
              },
            ].map((resource, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all"
              >
                <div className="text-5xl mb-4">{resource.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{resource.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{resource.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-pink-600 dark:text-pink-400 font-semibold hover:text-pink-700 dark:hover:text-pink-300"
                >
                  Learn More →
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Reach Out To Us</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Your Name"
                className="px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-pink-500"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <textarea
              placeholder="Tell us what's going on... (confidential)"
              rows={5}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-pink-500 resize-none"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Send Message
            </motion.button>
          </form>
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-6">
            Your message is confidential. Response within 24 hours.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
