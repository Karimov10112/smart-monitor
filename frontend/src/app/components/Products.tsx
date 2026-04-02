import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';
import { categories, getProductStatus, Product } from '../data/products';
import { productAPI } from '../utils/api';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Search, Filter, X, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Products() {
  const { language, currentFasting, currentPostMeal } = useApp();
  const t = translations[language];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const { data } = await productAPI.getAll(params);
      setProducts(data.products);
    } catch (err) {
      console.error('Products load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products locally for status (since status depends on current sugar levels)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (selectedStatus !== 'all') {
        const status = getProductStatus(product, currentFasting, currentPostMeal);
        if (status !== selectedStatus) return false;
      }
      return true;
    });
  }, [products, selectedStatus, currentFasting, currentPostMeal]);

  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    filteredProducts.forEach(product => {
      if (!groups[product.category]) groups[product.category] = [];
      groups[product.category].push(product);
    });
    return groups;
  }, [filteredProducts]);

  const getStatusColor = (status: 'safe' | 'caution' | 'avoid') => {
    switch (status) {
      case 'safe': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'caution': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'avoid': return 'bg-rose-50 text-rose-700 border border-rose-100';
    }
  };

  const getStatusText = (status: 'safe' | 'caution' | 'avoid') => {
    switch (status) {
      case 'safe': return t.safe;
      case 'caution': return t.caution;
      case 'avoid': return t.avoid;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input
              placeholder={t.search + '...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${showFilters ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Filter className="w-4 h-4" /> {language === 'uz' ? 'Filtrlar' : 'Фильтры'}
            </button>
            <div className="text-xs font-bold text-slate-400 ml-2">
              {filteredProducts.length} {t.productsCount}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 overflow-hidden">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t.category}</label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-100 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none">
                    <option value="all">{t.allCategories}</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.emoji} {t[cat.nameKey as keyof typeof t] as string}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">{t.status}</label>
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-100 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none">
                    <option value="all">{t.allStatuses}</option>
                    <option value="safe">🟢 {t.safe}</option>
                    <option value="caution">🟡 {t.caution}</option>
                    <option value="avoid">🔴 {t.avoid}</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Loading State */}
      {loading && products.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center opacity-30">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest leading-none">Mahsulotlar yuklanmoqda...</p>
        </div>
      )}

      {/* Products Grid */}
      <div className="space-y-10 pb-10">
        {categories.filter(cat => groupedProducts[cat.id]?.length > 0).map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-2 ml-2">
              <span className="text-2xl">{category.emoji}</span>
              <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                {t[category.nameKey as keyof typeof t] as string}
              </h2>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold ml-2">
                {groupedProducts[category.id].length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedProducts[category.id].map((product) => {
                const status = getProductStatus(product, currentFasting, currentPostMeal);
                return (
                  <motion.div key={product._id || product.id} whileHover={{ y: -4 }}>
                    <Card
                      className="p-5 cursor-pointer bg-white border border-slate-100 hover:shadow-lg transition-all rounded-2xl relative overflow-hidden group"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                          {product.emoji}
                        </div>
                        <Badge className={`${getStatusColor(status)} shadow-none border-none py-1 px-2.5 font-bold text-[10px] uppercase tracking-widest`}>
                          {getStatusText(status)}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-slate-800 mb-2 truncate">
                        {product.name[language] || product.name['uz']}
                      </h3>

                      <div className="flex items-center gap-4 mt-4 py-3 border-t border-slate-50">
                        <div className="text-center flex-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">GI</p>
                          <p className="font-bold text-blue-600">{product.gi}</p>
                        </div>
                        <div className="w-px h-6 bg-slate-100" />
                        <div className="text-center flex-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">GL</p>
                          <p className="font-bold text-purple-600">{product.gl}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center opacity-40">
            <Search className="w-16 h-16 mb-4" />
            <p className="text-lg font-bold">Mahsulot topilmadi</p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-xl p-0 border-none bg-white rounded-3xl overflow-hidden shadow-2xl">
          {selectedProduct && (
            <div className="flex flex-col">
              <div className="p-8 bg-blue-600 text-white relative">
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-5xl shadow-xl">
                    {selectedProduct.emoji}
                  </div>
                  <div>
                    <Badge className="bg-white text-blue-600 font-black text-[10px] uppercase mb-2">
                      {getStatusText(getProductStatus(selectedProduct, currentFasting, currentPostMeal))}
                    </Badge>
                    <DialogTitle className="text-3xl font-black">{selectedProduct.name[language] || selectedProduct.name['uz']}</DialogTitle>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.glycemicIndex}</p>
                    <p className="text-3xl font-black text-blue-600">{selectedProduct.gi}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.glycemicLoad}</p>
                    <p className="text-3xl font-black text-purple-600">{selectedProduct.gl}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Info className="w-5 h-5 text-blue-500" />
                    <h4 className="text-sm font-black uppercase tracking-widest">{t.detailedAdvice}</h4>
                  </div>
                  <p className="text-sm font-medium leading-relaxed opacity-80 italic">
                    "{selectedProduct.advice?.[language] || selectedProduct.advice?.['uz'] || 'Tavsiya mavjud emas'}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
