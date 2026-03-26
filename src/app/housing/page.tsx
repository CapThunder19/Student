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

const PAGE_BG = "bg-[#FDF9F1] text-[#1A1A1A]";
const CARD = "bg-white border-2 border-[#1A1A1A] rounded-3xl shadow-[4px_4px_0_0_#1A1A1A]";
const SUBTLE_CARD = "bg-[#F8F1E7] border-2 border-[#1A1A1A] rounded-3xl";

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
    <div className={`flex flex-col min-h-screen ${PAGE_BG}`}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FDF1DC] border-b-2 border-[#1A1A1A] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FDE68A] border-2 border-[#1A1A1A] shadow-[3px_3px_0_0_#1A1A1A]">
              <Home className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Housing</h1>
              <p className="text-[#7C6A58] text-xs">Find PG, flat or hostel near your college</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="hidden sm:flex items-center bg-[#FFEBD4] border-2 border-[#1A1A1A] rounded-full overflow-hidden shadow-[3px_3px_0_0_#1A1A1A]">
              {(['split', 'map', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors rounded-full ${
                    viewMode === mode
                      ? 'bg-[#1A1A1A] text-[#FDF9F1]'
                      : 'text-[#1A1A1A] hover:bg-white'
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
              className="px-4 py-2 rounded-full border-2 border-[#1A1A1A] bg-[#22C55E] text-[#1A1A1A] font-semibold flex items-center gap-2 text-sm shadow-[3px_3px_0_0_#1A1A1A] hover:bg-[#4ADE80] transition-all"
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
              { label: 'Available', value: stats.total, accent: 'bg-[#F97316]' },
              { label: 'Verified', value: stats.verified, accent: 'bg-[#22C55E]' },
              { label: 'Avg Price', value: stats.avgPrice > 0 ? `₹${stats.avgPrice.toLocaleString()}` : '—', accent: 'bg-[#6366F1]' },
            ].map((s) => (
              <div key={s.label} className={`${CARD} p-4 flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-[#7C6A58]">{s.label}</p>
                  <span className={`w-2 h-2 rounded-full ${s.accent}`}></span>
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className={`mb-6 ${CARD} overflow-hidden`}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-5 py-4 font-semibold hover:bg-[#FFF1DA] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#1A1A1A]" /> Filters
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
                  <div className="px-5 pb-5 pt-1 grid grid-cols-1 md:grid-cols-3 gap-5 border-t-2 border-[#1A1A1A] bg-[#FFF7E7]">
                    <div>
                      <label className="text-[#7C6A58] text-xs font-semibold block mb-2 uppercase tracking-wider">Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full bg-white rounded-xl px-3 py-2 border-2 border-[#1A1A1A] focus:outline-none text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="pg">PG</option>
                        <option value="flat">Flat</option>
                        <option value="hostel">Hostel</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[#7C6A58] text-xs font-semibold block mb-2 uppercase tracking-wider">
                        Price Range: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                      </label>
                      <input
                        type="range" min={1000} max={50000} step={500}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full accent-[#F97316]"
                      />
                    </div>
                    <div>
                      <label className="text-[#7C6A58] text-xs font-semibold block mb-2 uppercase tracking-wider">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7C6A58]" />
                        <input
                          type="text"
                          placeholder="Area, name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white rounded-xl pl-9 pr-3 py-2 border-2 border-[#1A1A1A] focus:outline-none text-sm placeholder-[#A3A3A3]"
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
            <div className="mb-4 px-4 py-3 rounded-2xl border-2 border-[#1A1A1A] bg-[#FEE2E2] text-[#B91C1C] text-sm flex items-center justify-between shadow-[3px_3px_0_0_#1A1A1A]">
              {error}
              <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Map Section */}
          {(viewMode === 'split' || viewMode === 'map') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 ${CARD} overflow-hidden`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#1A1A1A] bg-[#FFF7E7]">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <MapIcon className="w-4 h-4" /> Map
                  <span className="text-xs text-[#7C6A58] font-normal">({listings.length} listings)</span>
                </span>
                <button
                  onClick={() => setMapExpanded(!mapExpanded)}
                  className="text-xs flex items-center gap-1 text-[#7C6A58] hover:text-[#1A1A1A] transition-colors"
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
              <div className="px-4 py-2 border-t-2 border-[#1A1A1A] flex items-center gap-3 flex-wrap text-xs text-[#7C6A58] bg-[#FFF7E7]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316] inline-block" /> PG</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block" /> Flat</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] inline-block" /> Hostel</span>
                <span className="ml-auto">Click a pin for details</span>
              </div>
            </motion.div>
          )}

          {/* Listings */}
          {(viewMode === 'split' || viewMode === 'list') && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">
                    Available Listings
                    {!loading && <span className="text-[#7C6A58] font-normal text-sm ml-2">({listings.length})</span>}
                  </h2>
                  <p className="text-xs text-[#7C6A58]">Tap a card to sync with the map or open full details.</p>
                </div>
                <button
                  onClick={fetchListings}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border-2 border-[#1A1A1A] bg-white shadow-[2px_2px_0_0_#1A1A1A] hover:bg-[#F3E2CC]"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
                </div>
              ) : listings.length === 0 ? (
                <div className={`${SUBTLE_CARD} text-center py-10 px-6`}>
                  <Home className="w-12 h-12 text-[#A3A3A3] mx-auto mb-3" />
                  <p className="font-semibold">No listings found</p>
                  <p className="text-sm text-[#7C6A58] mt-1">Try adjusting filters or be the first to add one!</p>
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
                      className={`${CARD} overflow-hidden cursor-pointer transition-all group hover:-translate-y-1 ${
                        selectedPGId === listing.id ? 'bg-[#FFF1DA]' : 'bg-white'
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
                                <span className="flex items-center gap-1 text-xs text-[#16A34A] font-semibold">
                                  <CheckCircle className="w-3 h-3" /> Verified
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-base truncate">{listing.name}</h3>
                            <div className="flex items-center gap-1 text-xs mt-0.5 text-[#7C6A58]">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{listing.address || listing.area}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <div className="text-xl font-bold">₹{listing.price.toLocaleString()}</div>
                            <div className="text-xs text-[#7C6A58]">/month</div>
                          </div>
                        </div>

                        {/* Quick Info Row */}
                        <div className="flex items-center gap-3 text-xs py-2 border-y-2 border-[#1A1A1A] bg-[#FFF7E7]">
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-3.5 h-3.5" /> {listing.beds} bed{listing.beds > 1 ? 's' : ''}
                          </span>
                          {listing.bathrooms > 0 && (
                            <span className="flex items-center gap-1">
                              <Bath className="w-3.5 h-3.5" /> {listing.bathrooms} bath
                            </span>
                          )}
                          <span className="text-[#7C6A58]">{GENDER_LABEL[listing.genderPreference] || '⚥ Any'}</span>
                          {listing.furnishing && (
                            <span className="ml-auto text-xs truncate">
                              {listing.furnishing === 'furnished' ? '🛋️' : listing.furnishing === 'semi-furnished' ? '🪑' : '📦'}
                            </span>
                          )}
                        </div>

                        {/* Amenities */}
                        {listing.amenities && listing.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {listing.amenities.slice(0, 4).map((a) => (
                              <span key={a} className="text-xs bg-[#F3E2CC] border border-[#1A1A1A] px-2 py-0.5 rounded-full">
                                {a}
                              </span>
                            ))}
                            {listing.amenities.length > 4 && (
                              <span className="text-xs text-[#7C6A58] px-2 py-0.5">+{listing.amenities.length - 4} more</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="px-4 py-3 bg-[#FFF7E7] border-t-2 border-[#1A1A1A] flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-[#7C6A58]">
                          <Clock className="w-3 h-3" />
                          {listing.availableFrom ? `From ${listing.availableFrom}` : 'Available now'}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={(e) => { e.stopPropagation(); handleViewDetails(listing); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#1A1A1A] bg-[#F97316] text-[#1A1A1A] text-xs font-semibold shadow-[2px_2px_0_0_#1A1A1A] hover:bg-[#FDBA74] transition-colors"
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowAddModal(false); setPickingMode(false); setPickedLocation(null); setError(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${CARD} w-full max-w-2xl max-h-[92vh] flex flex-col bg-white`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#1A1A1A] shrink-0 bg-[#FFF7E7]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl border-2 border-[#1A1A1A] bg-[#22C55E] shadow-[2px_2px_0_0_#1A1A1A]">
                    <Plus className="w-5 h-5 text-[#1A1A1A]" />
                  </div>
                  <h2 className="text-lg font-bold">Add New Listing</h2>
                </div>
                <button
                  onClick={() => { setShowAddModal(false); setPickingMode(false); setPickedLocation(null); setError(''); }}
                  className="p-1.5 rounded-full hover:bg-[#F3E2CC] text-[#1A1A1A] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body – scrollable */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                {error && (
                  <div className="px-4 py-2.5 rounded-2xl border-2 border-[#1A1A1A] bg-[#FEE2E2] text-[#B91C1C] text-sm flex items-center gap-2">
                    <X className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                {/* Section: Basic Info */}
                <div>
                  <h3 className="text-xs font-bold text-[#7C6A58] uppercase tracking-widest mb-3">Basic Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[#7C6A58] text-xs mb-1 block">Listing Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Sunrise PG for Girls"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none placeholder-[#A3A3A3]"
                      />
                    </div>
                    <div>
                      <label className="text-[#7C6A58] text-xs mb-1 block">Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      >
                        <option value="pg">PG</option>
                        <option value="flat">Flat</option>
                        <option value="hostel">Hostel</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[#7C6A58] text-xs mb-1 block">Gender Preference</label>
                      <select
                        value={formData.genderPreference}
                        onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      >
                        <option value="any">Any</option>
                        <option value="male">Male Only</option>
                        <option value="female">Female Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[#7C6A58] text-xs mb-1 block">Area / Locality *</label>
                      <input
                        type="text"
                        placeholder="e.g. Indiranagar"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none placeholder-[#A3A3A3]"
                      />
                    </div>
                    <div>
                      <label className="text-[#7C6A58] text-xs mb-1 block">Full Address</label>
                      <input
                        type="text"
                        placeholder="Street address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none placeholder-[#A3A3A3]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Pricing & Room */}
                <div>
                  <h3 className="text-xs font-bold text-[#7C6A58] uppercase tracking-widest mb-3">Pricing & Room</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[#7C6A58] text-xs mb-1 block">Price (₹/mo) *</label>
                      <input
                        type="number"
                        min={500}
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#7C6A58] text-xs mb-1 block">Beds</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.beds}
                        onChange={(e) => setFormData({ ...formData, beds: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#7C6A58] text-xs mb-1 block">Bathrooms</label>
                      <input
                        type="number"
                        min={1}
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 1 })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#7C6A58] text-xs mb-1 block">Floor</label>
                      <input
                        type="text"
                        placeholder="e.g. 2nd"
                        value={formData.floor}
                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none placeholder-[#A3A3A3]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[#7C6A58] text-xs mb-1 block">Furnishing</label>
                      <select
                        value={formData.furnishing}
                        onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      >
                        <option value="furnished">Furnished</option>
                        <option value="semi-furnished">Semi-Furnished</option>
                        <option value="unfurnished">Unfurnished</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[#7C6A58] text-xs mb-1 block">Available From</label>
                      <input
                        type="date"
                        value={formData.availableFrom}
                        onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Amenities */}
                <div>
                  <h3 className="text-xs font-bold text-[#7C6A58] uppercase tracking-widest mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {AMENITY_OPTIONS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                          formData.amenities.includes(a)
                            ? 'bg-[#F97316] border-[#1A1A1A] text-[#1A1A1A] shadow-[2px_2px_0_0_#1A1A1A]'
                            : 'bg-white border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FFF7E7]'
                        }`}
                      >
                        {a === 'WiFi' ? '📶' : a === 'AC' ? '❄️' : a === 'Meals' ? '🍽️' : a === 'Parking' ? '🅿️' : a === 'Gym' ? '💪' : a === 'Security' ? '🔒' : '✓'} {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Location – map picker */}
                <div>
                  <h3 className="text-xs font-bold text-[#7C6A58] uppercase tracking-widest mb-3">Location on Map *</h3>
                  <div className={`${SUBTLE_CARD} overflow-hidden`}>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-[#1A1A1A] bg-[#FFF7E7]">
                      <span className="text-xs text-[#7C6A58]">
                        {pickedLocation
                          ? `📍 ${pickedLocation.lat.toFixed(5)}, ${pickedLocation.lng.toFixed(5)}`
                          : 'No location selected — click on the map to pin'}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setPickingMode((prev) => !prev); }}
                        className={`text-xs px-3 py-1 rounded-full font-semibold border-2 transition-all ${
                          pickingMode
                            ? 'bg-[#22C55E] border-[#1A1A1A] text-[#1A1A1A] shadow-[2px_2px_0_0_#1A1A1A]'
                            : 'bg-white border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#E5E5E5]'
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
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                          <span className={`${CARD} text-xs px-3 py-2 bg-white`}>
                            Enable picking mode to click on map
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section: Description & Contact */}
                <div>
                  <h3 className="text-xs font-bold text-[#7C6A58] uppercase tracking-widest mb-3">Description & Contact</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[#7C6A58] text-xs mb-1 block">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe the property, nearby landmarks, rules, etc."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none placeholder-[#A3A3A3] resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#7C6A58] text-xs mb-1 block">House Rules</label>
                      <input
                        type="text"
                        placeholder="e.g. No smoking, No pets, Guests allowed"
                        value={formData.rules}
                        onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                        className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none placeholder-[#A3A3A3]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#7C6A58] text-xs mb-1 block">Owner / Contact Name</label>
                        <input
                          type="text"
                          placeholder="Owner's name"
                          value={formData.ownerName}
                          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                          className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none placeholder-[#A3A3A3]"
                        />
                      </div>
                      <div>
                        <label className="text-[#7C6A58] text-xs mb-1 block">Phone Number *</label>
                        <input
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={formData.contact}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                          className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl px-3 py-2.5 text-sm focus:outline-none placeholder-[#A3A3A3]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t-2 border-[#1A1A1A] shrink-0 flex items-center gap-3 bg-[#FFF7E7]">
                <button
                  onClick={() => { setShowAddModal(false); setPickingMode(false); setPickedLocation(null); setError(''); }}
                  className="flex-1 px-4 py-2.5 bg-white hover:bg-[#E5E5E5] border-2 border-[#1A1A1A] text-[#1A1A1A] font-semibold rounded-full shadow-[3px_3px_0_0_#1A1A1A] transition-colors text-sm"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddPG}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-[#22C55E] hover:bg-[#4ADE80] disabled:opacity-50 disabled:cursor-not-allowed text-[#1A1A1A] font-bold rounded-full border-2 border-[#1A1A1A] transition-all text-sm shadow-[3px_3px_0_0_#1A1A1A] flex items-center justify-center gap-2"
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowDetailsModal(false); setSelectedPGId(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${CARD} w-full max-w-lg max-h-[90vh] flex flex-col bg-white`}
            >
              {/* Detail Header */}
              <div className="px-6 py-5 border-b-2 border-[#1A1A1A] shrink-0 bg-[#FFF7E7]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize border-2 border-[#1A1A1A] shadow-[2px_2px_0_0_#1A1A1A] bg-${
                        TYPE_COLORS[selectedPG.type]
                      }/90 text-[#1A1A1A]`}>
                        {selectedPG.type}
                      </span>
                      {selectedPG.verified && (
                        <span className="flex items-center gap-1 text-xs bg-[#22C55E] border-2 border-[#1A1A1A] rounded-full px-2 py-0.5 text-[#1A1A1A] font-semibold shadow-[2px_2px_0_0_#1A1A1A]">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold">{selectedPG.name}</h2>
                    <p className="text-[#7C6A58] text-sm mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedPG.address || selectedPG.area}
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowDetailsModal(false); setSelectedPGId(null); }}
                    className="p-1.5 rounded-full hover:bg-[#F3E2CC] text-[#1A1A1A] transition-colors ml-2 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-3 text-3xl font-bold">
                  ₹{selectedPG.price.toLocaleString()}
                  <span className="text-base font-normal text-[#7C6A58]">/month</span>
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
                    <div key={item.label} className={`${SUBTLE_CARD} p-3`}>
                      <div className="flex items-center gap-2 text-[#7C6A58] text-xs mb-1">
                        {item.icon} {item.label}
                      </div>
                      <div className="text-sm font-semibold text-[#1A1A1A]">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Amenities */}
                {selectedPG.amenities && selectedPG.amenities.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-[#7C6A58] uppercase tracking-widest mb-2.5">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPG.amenities.map((a) => (
                        <span key={a} className="flex items-center gap-1 text-xs bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] px-3 py-1.5 rounded-full shadow-[2px_2px_0_0_#1A1A1A]">
                          <Wifi className="w-3 h-3 text-[#F97316]" /> {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedPG.description && (
                  <div>
                    <h4 className="text-xs font-bold text-[#7C6A58] uppercase tracking-widest mb-2">Description</h4>
                    <p className="text-[#1A1A1A] text-sm leading-relaxed">{selectedPG.description}</p>
                  </div>
                )}

                {/* Rules */}
                {selectedPG.rules && (
                  <div>
                    <h4 className="text-xs font-bold text-[#7C6A58] uppercase tracking-widest mb-2">House Rules</h4>
                    <p className="text-[#1A1A1A] text-sm">{selectedPG.rules}</p>
                  </div>
                )}

                {/* Map snippet */}
                <div>
                  <h4 className="text-xs font-bold text-[#7C6A58] uppercase tracking-widest mb-2">Location</h4>
                  <div className="rounded-xl overflow-hidden border-2 border-[#1A1A1A] h-48 bg-[#FFF7E7]">
                    <Map
                      listings={[selectedPG]}
                      selectedPGId={selectedPG.id}
                    />
                  </div>
                  <p className="text-[#7C6A58] text-xs mt-1.5 font-mono">
                    {selectedPG.latitude.toFixed(5)}, {selectedPG.longitude.toFixed(5)}
                  </p>
                </div>

                {/* Contact */}
                {selectedPG.contact && (
                  <div className={`${SUBTLE_CARD} p-4 flex items-center justify-between`}>
                    <div>
                      {selectedPG.ownerName && (
                        <p className="text-[#7C6A58] text-xs mb-0.5">Owner: {selectedPG.ownerName}</p>
                      )}
                      <p className="text-[#1A1A1A] font-bold text-lg">{selectedPG.contact}</p>
                    </div>
                    <a
                      href={`tel:${selectedPG.contact}`}
                      className="flex items-center gap-2 px-4 py-2 bg-[#22C55E] hover:bg-[#4ADE80] border-2 border-[#1A1A1A] text-[#1A1A1A] font-semibold rounded-full text-sm transition-colors shadow-[3px_3px_0_0_#1A1A1A]"
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
