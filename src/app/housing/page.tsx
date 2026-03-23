'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Home, MapPin, Filter, Users, Plus, X, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/HousingMap'), { ssr: false });

interface PG {
  id: string;
  name: string;
  type: 'pg' | 'flat' | 'hostel';
  area: string;
  price: number;
  beds: number;
  amenities: string;
  verified: boolean;
  latitude: number;
  longitude: number;
  description?: string;
  contact?: string;
}

export default function HousingPage() {
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState([5000, 25000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPG, setSelectedPG] = useState<PG | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [listings, setListings] = useState<PG[]>([
    { id: '1', name: '1 BHK PG', type: 'pg' as const, area: 'Indiranagar', price: 8000, beds: 1, amenities: 'WiFi, AC, Food', verified: true, latitude: 12.9716, longitude: 77.6412, description: 'Spacious PG with common areas', contact: '+91-9876543210' },
    { id: '2', name: '2 BHK Flat', type: 'flat' as const, area: 'Whitefield', price: 15000, beds: 2, amenities: 'WiFi, Gym, Security', verified: true, latitude: 12.9698, longitude: 77.7499, description: 'Modern flat with excellent amenities', contact: '+91-9876543211' },
    { id: '3', name: '1 BHK Hostel', type: 'hostel' as const, area: 'Marathahalli', price: 6000, beds: 1, amenities: 'Meals, WiFi, Laundry', verified: false, latitude: 12.9352, longitude: 77.6245, description: 'Budget-friendly hostel', contact: '+91-9876543212' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'pg',
    area: '',
    price: 5000,
    beds: 1,
    amenities: '',
    description: '',
    contact: '',
    latitude: 12.9716,
    longitude: 77.6412,
  });

  const filteredListings = listings.filter(listing => {
    const matchesType = filterType === 'all' || listing.type === filterType;
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];
    const matchesSearch = listing.area.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          listing.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesPrice && matchesSearch;
  });

  const handleAddPG = () => {
    if (!formData.name || !formData.area) {
      alert('Please fill in all required fields');
      return;
    }

    const newPG: PG = {
      id: Date.now().toString(),
      name: formData.name,
      type: (formData.type as 'pg' | 'flat' | 'hostel'),
      area: formData.area,
      price: formData.price,
      beds: formData.beds,
      amenities: formData.amenities,
      verified: false,
      latitude: formData.latitude,
      longitude: formData.longitude,
      description: formData.description,
      contact: formData.contact,
    };

    setListings([...listings, newPG]);
    setShowAddModal(false);
    setFormData({
      name: '',
      type: 'pg',
      area: '',
      price: 5000,
      beds: 1,
      amenities: '',
      description: '',
      contact: '',
      latitude: 12.9716,
      longitude: 77.6412,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-600 bg-opacity-20">
              <Home className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Housing</h1>
              <p className="text-slate-400 text-sm">Find your perfect PG, flat or hostel</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add PG
          </motion.button>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-slate-400 text-sm font-semibold block mb-2">Type</label>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Types</option>
                  <option value="pg">PG</option>
                  <option value="flat">Flat</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm font-semibold block mb-2">Price Range</label>
                <input type="range" min="1000" max="50000" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full" />
                <div className="text-white text-sm mt-1">
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm font-semibold block mb-2">Search</label>
                <input type="text" placeholder="Area, location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500" />
              </div>
            </div>
          </motion.div>

          {/* Map and Listings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Map */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden h-96">
              <Map listings={filteredListings} />
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-slate-400 text-sm font-semibold mb-2">Total Available</h3>
                <p className="text-4xl font-bold text-white">{filteredListings.length}</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-slate-400 text-sm font-semibold mb-2">Price Range</h3>
                <p className="text-lg font-bold text-white">₹{priceRange[0]} - ₹{priceRange[1]}</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-slate-400 text-sm font-semibold mb-2">Verified Listings</h3>
                <p className="text-lg font-bold text-green-400">{filteredListings.filter(l => l.verified).length}</p>
              </div>
            </motion.div>
          </div>

          {/* Listings */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Available Listings</h2>
            {filteredListings.length > 0 ? (
              filteredListings.map((listing, idx) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 hover:bg-slate-750 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-lg">{listing.name}</h3>
                        {listing.verified && <span className="px-2 py-1 bg-green-600 bg-opacity-20 text-green-400 text-xs font-bold rounded">✓ Verified</span>}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                        <MapPin className="w-4 h-4" /> {listing.area}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">₹{listing.price}</div>
                      <p className="text-slate-400 text-sm">/month</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 text-sm mb-4 pb-4 border-b border-slate-700">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {listing.beds} bed{listing.beds > 1 ? 's' : ''}
                    </span>
                    <span>•</span>
                    <span>{listing.amenities}</span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedPG(listing);
                      setShowDetailsModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">No listings found matching your criteria</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Add PG Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
                <h2 className="text-xl font-bold text-white">Add New PG</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 flex-1">
                <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="pg">PG</option>
                  <option value="flat">Flat</option>
                  <option value="hostel">Hostel</option>
                </select>
                <input type="text" placeholder="Area" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Beds" value={formData.beds} onChange={e => setFormData({...formData, beds: parseInt(e.target.value)})} className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Amenities" value={formData.amenities} onChange={e => setFormData({...formData, amenities: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="tel" placeholder="Contact" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-slate-700 text-white rounded-lg p-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                
                <button onClick={handleAddPG} className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors mt-4 sticky bottom-0">
                  Add PG
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedPG && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailsModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
                <h2 className="text-xl font-bold text-white">{selectedPG.name}</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 flex-1">
                <div>
                  <p className="text-slate-400 text-sm">Area</p>
                  <p className="text-white font-semibold">{selectedPG.area}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Price</p>
                  <p className="text-2xl font-bold text-white">₹{selectedPG.price}<span className="text-sm text-slate-400">/month</span></p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Beds</p>
                  <p className="text-white font-semibold">{selectedPG.beds}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Amenities</p>
                  <p className="text-white font-semibold">{selectedPG.amenities}</p>
                </div>
                {selectedPG.description && (
                  <div>
                    <p className="text-slate-400 text-sm">Description</p>
                    <p className="text-white">{selectedPG.description}</p>
                  </div>
                )}
                {selectedPG.contact && (
                  <div>
                    <p className="text-slate-400 text-sm">Contact</p>
                    <p className="text-white font-semibold">{selectedPG.contact}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-400 text-sm">Location</p>
                  <p className="text-white font-mono text-xs">{selectedPG.latitude.toFixed(4)}, {selectedPG.longitude.toFixed(4)}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
