'use client';

import { useState } from 'react';
import { AlertCircle, FileText, CheckCircle, Clock, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComplaintSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'academic',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Complaint submitted:', formData);
    setFormData({ title: '', description: '', category: 'academic' });
    setIsExpanded(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 col-span-full hover:shadow-xl transition-all"
    >
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 15 }}
          className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900 dark:to-red-800 rounded-xl flex items-center justify-center shadow-md"
        >
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Report & Complaints</h2>
          <p className="text-slate-500 dark:text-slate-400">Have an issue? We're here to help</p>
        </div>
      </div>

      <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
        Address academic, administrative, or behavioral concerns. Your feedback helps us improve.
      </p>

      {!isExpanded ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            onClick={() => setIsExpanded(true)}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="p-6 rounded-xl text-left transition-all cursor-pointer group bg-red-50 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-slate-600"
          >
            <FileText className="w-8 h-8 mb-3 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:translate-x-1 transition-transform">
              File a Complaint
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Report any issues you're facing</p>
          </motion.button>

          <motion.div className="p-6 rounded-xl text-left cursor-pointer group bg-orange-50 dark:bg-slate-700 hover:bg-orange-100 dark:hover:bg-slate-600">
            <Clock className="w-8 h-8 mb-3 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Track Status</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">View your complaint status</p>
          </motion.div>

          <motion.div className="p-6 rounded-xl text-left cursor-pointer group bg-green-50 dark:bg-slate-700 hover:bg-green-100 dark:hover:bg-slate-600">
            <CheckCircle className="w-8 h-8 mb-3 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">History</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">View past complaints and resolutions</p>
          </motion.div>
        </div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6 bg-slate-50 dark:bg-slate-700 p-8 rounded-xl"
        >
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-3">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            >
              <option value="academic">Academic Issue</option>
              <option value="administrative">Administrative Issue</option>
              <option value="behavioral">Behavioral Concern</option>
              <option value="infrastructure">Infrastructure Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-3">
              Complaint Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief title of your complaint"
              className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-3">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about your complaint"
              rows={4}
              className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              required
            />
          </div>

          <div className="flex gap-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Submit Complaint
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setIsExpanded(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </motion.button>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
}
