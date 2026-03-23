'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import {
  Home, MapPin, Filter, Users, Plus, X, Eye, Phone, Star,
  BedDouble, Bath, Wifi, CheckCircle, Clock, ChevronDown, ChevronUp,
  Search, Loader2, RefreshCw, Map as MapIcon, List,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/HousingMap'), { ssr: false });

interface PG {
  id: string;
  _id?: string;
  name: string;
  type: 'pg' | 'flat' | 'hostel';
  area: string;
  address: string;
  price: number;
  beds: number;
  bathrooms: number;
  floor: string;
  furnishing: 'furnished' | 'semi-furnished' | 'unfurnished';
  amenities: string[];
  rules: string;
  genderPreference: 'male' | 'female' | 'any';
  verified: boolean;
  availableFrom: string;
  latitude: number;
  longitude: number;
  description: string;
  contact: string;
  ownerName: string;
  createdAt?: string;
}

const AMENITY_OPTIONS = [
  'WiFi', 'AC', 'Geyser', 'Meals', 'Parking', 'Laundry',
  'Gym', 'Security', 'CCTV', 'Power Backup', 'Housekeeping', 'TV',
];

const TYPE_COLORS: Record<string, string> = {
  pg: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  flat: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  hostel: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

const FURNISHING_LABEL: Record<string, string> = {
  furnished: '🛋️ Furnished',
  'semi-furnished': '🪑 Semi-Furnished',
  unfurnished: '📦 Unfurnished',
};

const GENDER_LABEL: Record<string, string> = {
  male: '♂ Male',
  female: '♀ Female',
  any: '⚥ Any',
};

export default function HousingPage() {
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState([1000, 30000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPG, setSelectedPG] = useState<PG | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [listings, setListings] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedPGId, setSelectedPGId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [mapExpanded, setMapExpanded] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pickingMode, setPickingMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'pg',
    area: '',
    address: '',
    price: 8000,
    beds: 1,
    bathrooms: 1,
    floor: '',
    furnishing: 'unfurnished',
    amenities: [] as string[],
    rules: '',
    genderPreference: 'any',
    availableFrom: '',
    description: '',
    contact: '',
    ownerName: '',
    latitude: 12.9716,
    longitude: 77.5946,
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.set('type', filterType);
      params.set('minPrice', priceRange[0].toString());
      params.set('maxPrice', priceRange[1].toString());
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/housing?${params}`);
      const json = await res.json();
      if (json.success) {
        setListings(
          json.data.map((pg: PG & { _id?: string }) => ({
            ...pg,
            id: pg._id || pg.id,
          }))
        );
      } else {
        setError(json.error || 'Failed to load listings');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filterType, priceRange, searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(fetchListings, 300);
    return () => clearTimeout(timeout);
  }, [fetchListings]);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (pickingMode) {
        setPickedLocation({ lat, lng });
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      }
    },
    [pickingMode]
  );

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleAddPG = async () => {
    if (!formData.name || !formData.area || !formData.contact) {
      setError('Please fill in Name, Area, and Contact fields.');
      return;
    }
    if (!pickedLocation) {
      setError('Please click on the map to set the PG location.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/housing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: pickedLocation.lat,
          longitude: pickedLocation.lng,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setPickedLocation(null);
        setPickingMode(false);
        setFormData({
          name: '', type: 'pg', area: '', address: '', price: 8000,
          beds: 1, bathrooms: 1, floor: '', furnishing: 'unfurnished',
          amenities: [], rules: '', genderPreference: 'any',
          availableFrom: '', description: '', contact: '', ownerName: '',
          latitude: 12.9716, longitude: 77.5946,
        });
        await fetchListings();
      } else {
        setError(json.error || 'Failed to add listing');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (listing: PG) => {
    setSelectedPG(listing);
    setSelectedPGId(listing.id);
    setShowDetailsModal(true);
  };

  const stats = {
    total: listings.length,
    verified: listings.filter((l) => l.verified).length,
    avgPrice: listings.length > 0
      ? Math.round(listings.reduce((a, b) => a + b.price, 0) / listings.length)
      : 0,
  };

  const mapHeight = mapExpanded ? 'h-[600px]' : 'h-96';

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/15 border border-orange-500/30">
              <Home className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Housing</h1>
              <p className="text-slate-400 text-xs">Find PG, flat or hostel near your college</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="hidden sm:flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              {(['split', 'map', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    viewMode === mode
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'split' ? <span className="flex items-center gap-1"><MapIcon className="w-3.5 h-3.5" /> Split</span>
                    : mode === 'map' ? <span className="flex items-center gap-1"><MapIcon className="w-3.5 h-3.5" /> Map</span>
                    : <span className="flex items-center gap-1"><List className="w-3.5 h-3.5" /> List</span>}
                </button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setShowAddModal(true); setPickingMode(false); setPickedLocation(null); }}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-green-900/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Add PG
            </motion.button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Available', value: stats.total, color: 'text-white' },
              { label: 'Verified', value: stats.verified, color: 'text-green-400' },
              { label: 'Avg Price', value: stats.avgPrice > 0 ? `₹${stats.avgPrice.toLocaleString()}` : '—', color: 'text-orange-400' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-slate-400 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-6 bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-5 py-4 text-white font-semibold hover:bg-slate-700/30 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-400" /> Filters
              </span>
              {showFilters ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-1 grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-700/50">
                    <div>
                      <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-wider">Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="pg">PG</option>
                        <option value="flat">Flat</option>
                        <option value="hostel">Hostel</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-wider">
                        Price Range: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                      </label>
                      <input
                        type="range" min={1000} max={50000} step={500}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full accent-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-wider">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Area, name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-700 text-white rounded-lg pl-9 pr-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error */}
          {error && !showAddModal && (
            <div className="mb-4 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between">
              {error}
              <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Map Section */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
                <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-orange-400" /> Map
                  <span className="text-slate-500 font-normal">({listings.length} listings)</span>
                </span>
                <button
                  onClick={() => setMapExpanded(!mapExpanded)}
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  {mapExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Collapse</> : <><ChevronDown className="w-3.5 h-3.5" /> Expand</>}
                </button>
              </div>
              <div className={`${mapHeight} transition-all duration-300 relative`}>
                <Map
                  listings={listings}
                  selectedPGId={selectedPGId}
                  onMarkerClick={(pg) => {
                    setSelectedPGId(pg.id);
                    setSelectedPG(pg as PG);
                    setShowDetailsModal(true);
                  }}
                />
              </div>
              <div className="px-4 py-2 border-t border-slate-700/50 flex items-center gap-3 flex-wrap text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> PG</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Flat</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Hostel</span>
                <span className="text-slate-600 ml-auto">Click a pin for details</span>
              </div>
            </motion.div>
          )}

          {/* Listings */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  Available Listings
                  {!loading && <span className="text-slate-500 font-normal text-sm ml-2">({listings.length})</span>}
                </h2>
                <button
                  onClick={fetchListings}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                  <Home className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No listings found</p>
                  <p className="text-slate-500 text-sm mt-1">Try adjusting filters or be the first to add one!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {listings.map((listing, idx) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                      onClick={() => { setSelectedPGId(listing.id); }}
                      className={`bg-slate-800/70 border rounded-xl overflow-hidden cursor-pointer transition-all group hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 ${
                        selectedPGId === listing.id ? 'border-orange-500/60 shadow-lg shadow-orange-900/20' : 'border-slate-700/50 hover:border-slate-600/70'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="p-4 pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-md font-semibold capitalize ${TYPE_COLORS[listing.type]}`}>
                                {listing.type}
                              </span>
                              {listing.verified && (
                                <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                                  <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                              )}
                            </div>
                            <h3 className="text-white font-bold text-base truncate">{listing.name}</h3>
                            <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{listing.address || listing.area}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <div className="text-xl font-bold text-white">₹{listing.price.toLocaleString()}</div>
                            <div className="text-slate-400 text-xs">/month</div>
                          </div>
                        </div>

                        {/* Quick Info Row */}
                        <div className="flex items-center gap-3 text-slate-400 text-xs py-2 border-y border-slate-700/50">
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-3.5 h-3.5" /> {listing.beds} bed{listing.beds > 1 ? 's' : ''}
                          </span>
                          {listing.bathrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bath className="w-3.5 h-3.5" /> {listing.bathrooms} bath
                            </span>
                          )}
                          <span className="text-slate-500">{GENDER_LABEL[listing.genderPreference] || '⚥ Any'}</span>
                          {listing.furnishing && (
                            <span className="ml-auto text-slate-500 text-xs truncate">
                              {listing.furnishing === 'furnished' ? '🛋️' : listing.furnishing === 'semi-furnished' ? '🪑' : '📦'}
                            </span>
                          )}
                        </div>

                        {/* Amenities */}
                        {listing.amenities && listing.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {listing.amenities.slice(0, 4).map((a) => (
                              <span key={a} className="text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-md">
                                {a}
                              </span>
                            ))}
                            {listing.amenities.length > 4 && (
                              <span className="text-xs text-slate-500 px-2 py-0.5">+{listing.amenities.length - 4} more</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="px-4 py-3 bg-slate-900/40 border-t border-slate-700/40 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Clock className="w-3 h-3" />
                          {listing.availableFrom ? `From ${listing.availableFrom}` : 'Available now'}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={(e) => { e.stopPropagation(); handleViewDetails(listing); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Add PG Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowAddModal(false); setPickingMode(false); setPickedLocation(null); setError(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-500/15 rounded-lg">
                    <Plus className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Add New Listing</h2>
                </div>
                <button
                  onClick={() => { setShowAddModal(false); setPickingMode(false); setPickedLocation(null); setError(''); }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body – scrollable */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {error && (
                  <div className="px-4 py-2.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                    <X className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                {/* Section: Basic Info */}
                <div>
                  <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Basic Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-slate-400 text-xs mb-1 block">Listing Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Sunrise PG for Girls"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="pg">PG</option>
                        <option value="flat">Flat</option>
                        <option value="hostel">Hostel</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Gender Preference</label>
                      <select
                        value={formData.genderPreference}
                        onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="any">Any</option>
                        <option value="male">Male Only</option>
                        <option value="female">Female Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Area / Locality *</label>
                      <input
                        type="text"
                        placeholder="e.g. Indiranagar"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Full Address</label>
                      <input
                        type="text"
                        placeholder="Street address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Pricing & Room */}
                <div>
                  <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Pricing & Room</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Price (₹/mo) *</label>
                      <input
                        type="number"
                        min={500}
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Beds</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.beds}
                        onChange={(e) => setFormData({ ...formData, beds: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Bathrooms</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Floor</label>
                      <input
                        type="text"
                        placeholder="e.g. 2nd"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-slate-400 text-xs mb-1 block">Furnishing</label>
                      <select
                        value={formData.furnishing}
                        onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="furnished">Furnished</option>
                        <option value="semi-furnished">Semi-Furnished</option>
                        <option value="unfurnished">Unfurnished</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-slate-400 text-xs mb-1 block">Available From</label>
                      <input
                        type="date"
                        value={formData.availableFrom}
                        onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Amenities */}
                <div>
                  <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {AMENITY_OPTIONS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          formData.amenities.includes(a)
                            ? 'bg-orange-500/25 border-orange-500/60 text-orange-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {a === 'WiFi' ? '📶' : a === 'AC' ? '❄️' : a === 'Meals' ? '🍽️' : a === 'Parking' ? '🅿️' : a === 'Gym' ? '💪' : a === 'Security' ? '🔒' : '✓'} {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Location – map picker */}
                <div>
                  <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Location on Map *</h3>
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700">
                      <span className="text-xs text-slate-400">
                        {pickedLocation
                          ? `📍 ${pickedLocation.lat.toFixed(5)}, ${pickedLocation.lng.toFixed(5)}`
                          : 'No location selected — click on the map to pin'}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setPickingMode((prev) => !prev); }}
                        className={`text-xs px-3 py-1 rounded-lg font-semibold border transition-all ${
                          pickingMode
                            ? 'bg-green-500/20 border-green-500/50 text-green-400'
                            : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {pickingMode ? '✅ Picking Location…' : '📌 Click to Pick'}
                      </button>
                    </div>
                    <div className="h-56 relative">
                      <Map
                        listings={[]}
                        onMapClick={handleMapClick}
                        pickedLocation={pickedLocation}
                      />
                      {!pickingMode && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                          <span className="bg-slate-900/80 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-700">
                            Enable picking mode to click on map
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section: Description & Contact */}
                <div>
                  <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Description & Contact</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe the property, nearby landmarks, rules, etc."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">House Rules</label>
                      <input
                        type="text"
                        placeholder="e.g. No smoking, No pets, Guests allowed"
                        value={formData.rules}
                        onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">Owner / Contact Name</label>
                        <input
                          type="text"
                          placeholder="Owner's name"
                          value={formData.ownerName}
                          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">Phone Number *</label>
                        <input
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.contact}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-800 shrink-0 flex items-center gap-3">
                <button
                  onClick={() => { setShowAddModal(false); setPickingMode(false); setPickedLocation(null); setError(''); }}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddPG}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-green-900/30 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : <><Plus className="w-4 h-4" /> Add Listing</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Details Modal ── */}
      <AnimatePresence>
        {showDetailsModal && selectedPG && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowDetailsModal(false); setSelectedPGId(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl"
            >
              {/* Detail Header */}
              <div
                className={`px-6 py-5 border-b border-slate-800 shrink-0 ${
                  selectedPG.type === 'pg'
                    ? 'bg-orange-950/40'
                    : selectedPG.type === 'flat'
                    ? 'bg-blue-950/40'
                    : 'bg-purple-950/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-bold capitalize ${TYPE_COLORS[selectedPG.type]}`}>
                        {selectedPG.type}
                      </span>
                      {selectedPG.verified && (
                        <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedPG.name}</h2>
                    <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedPG.address || selectedPG.area}
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowDetailsModal(false); setSelectedPGId(null); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-2 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-3 text-3xl font-bold text-white">
                  ₹{selectedPG.price.toLocaleString()}
                  <span className="text-base font-normal text-slate-400">/month</span>
                </div>
              </div>

              {/* Detail Body */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {/* Quick stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Beds', value: `${selectedPG.beds} bed${selectedPG.beds > 1 ? 's' : ''}`, icon: <BedDouble className="w-4 h-4" /> },
                    { label: 'Bathrooms', value: `${selectedPG.bathrooms || 1}`, icon: <Bath className="w-4 h-4" /> },
                    { label: 'Furnishing', value: FURNISHING_LABEL[selectedPG.furnishing] || FURNISHING_LABEL.unfurnished, icon: <Star className="w-4 h-4" /> },
                    { label: 'Gender', value: GENDER_LABEL[selectedPG.genderPreference] || '⚥ Any', icon: <Users className="w-4 h-4" /> },
                    { label: 'Floor', value: selectedPG.floor || '—', icon: <Home className="w-4 h-4" /> },
                    { label: 'Available', value: selectedPG.availableFrom || 'Immediately', icon: <Clock className="w-4 h-4" /> },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                        {item.icon} {item.label}
                      </div>
                      <div className="text-white text-sm font-semibold">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Amenities */}
                {selectedPG.amenities && selectedPG.amenities.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2.5">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPG.amenities.map((a) => (
                        <span key={a} className="flex items-center gap-1 text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg">
                          <Wifi className="w-3 h-3 text-orange-400" /> {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedPG.description && (
                  <div>
                    <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Description</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedPG.description}</p>
                  </div>
                )}

                {/* Rules */}
                {selectedPG.rules && (
                  <div>
                    <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">House Rules</h4>
                    <p className="text-slate-300 text-sm">{selectedPG.rules}</p>
                  </div>
                )}

                {/* Map snippet */}
                <div>
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">Location</h4>
                  <div className="rounded-xl overflow-hidden border border-slate-700 h-48">
                    <Map
                      listings={[selectedPG]}
                      selectedPGId={selectedPG.id}
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 font-mono">
                    {selectedPG.latitude.toFixed(5)}, {selectedPG.longitude.toFixed(5)}
                  </p>
                </div>

                {/* Contact */}
                {selectedPG.contact && (
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      {selectedPG.ownerName && (
                        <p className="text-slate-400 text-xs mb-0.5">Owner: {selectedPG.ownerName}</p>
                      )}
                      <p className="text-white font-bold text-lg">{selectedPG.contact}</p>
                    </div>
                    <a
                      href={`tel:${selectedPG.contact}`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 text-green-400 font-semibold rounded-xl text-sm transition-colors"
                    >
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
