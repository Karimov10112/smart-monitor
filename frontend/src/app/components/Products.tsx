import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../utils/translations';
import { categories, getProductStatus, Product } from '../data/products';
import { productAPI } from '../utils/api';

// MUI Components
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  InputAdornment,
  CircularProgress,
  alpha,
  useTheme,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarIcon from '@mui/icons-material/Star';

export function Products() {
  const { language, currentFasting, currentPostMeal } = useApp();
  const theme = useTheme();
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

  const getStatusInfo = (status: 'safe' | 'caution' | 'avoid') => {
    switch (status) {
      case 'safe': return { color: 'success', text: t.safe, icon: '🟢' };
      case 'caution': return { color: 'warning', text: t.caution, icon: '🟡' };
      case 'avoid': return { color: 'error', text: t.avoid, icon: '🔴' };
    }
  };

  return (
    <Box sx={{ spaceY: 3 }}>
      {/* Search and Filters (Official Look) */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              placeholder={t.search + '...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}><CloseIcon fontSize="small" /></IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ bgcolor: 'background.paper' }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                size="small"
                variant={showFilters ? 'contained' : 'outlined'}
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterListIcon fontSize="small" />}
                sx={{ borderRadius: 1.5, fontWeight: 800, textTransform: 'uppercase', fontSize: 10 }}
              >
                {language === 'uz' ? 'Filtrlar' : 'Фильтры'}
              </Button>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', ml: 'auto', textTransform: 'uppercase', letterSpacing: 1 }}>
                {filteredProducts.length} {t.productsCount}
              </Typography>
            </Box>

            {showFilters && (
              <Box sx={{ pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 10, bgcolor: 'background.paper', px: 1 }}>{t.category}</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <MenuItem value="all">{t.allCategories}</MenuItem>
                        {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.emoji} {t[cat.nameKey as keyof typeof t] as string}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 10, bgcolor: 'background.paper', px: 1 }}>{t.status}</InputLabel>
                      <Select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <MenuItem value="all">{t.allStatuses}</MenuItem>
                        <MenuItem value="safe">🟢 {t.safe}</MenuItem>
                        <MenuItem value="caution">🟡 {t.caution}</MenuItem>
                        <MenuItem value="avoid">🔴 {t.avoid}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && products.length === 0 && (
        <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
          <CircularProgress size={30} sx={{ mb: 2 }} />
          <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, letterSpacing: 2 }}>Mahsulotlar yuklanmoqda...</Typography>
        </Box>
      )}

      {/* Products Grid */}
      <Stack spacing={6}>
        {categories.filter(cat => groupedProducts[cat.id]?.length > 0).map((category) => (
          <Box key={category.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, px: 1 }}>
              <Typography variant="h5" sx={{ fontSize: 24, lineHeight: 1 }}>{category.emoji}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                {t[category.nameKey as keyof typeof t] as string}
              </Typography>
              <Chip
                label={groupedProducts[category.id].length}
                size="small"
                sx={{ height: 20, fontSize: 10, fontWeight: 900, ml: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main', border: 'none' }}
              />
            </Box>

            <Grid container spacing={2}>
              {groupedProducts[category.id].map((product) => {
                const status = getProductStatus(product, currentFasting, currentPostMeal);
                const info = getStatusInfo(status);
                return (
                  <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={product._id || product.id}>
                    <Card
                      elevation={0}
                      onClick={() => setSelectedProduct(product)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${theme.palette.primary.main}` }
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ width: 44, height: 44, bgcolor: 'background.default', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                            {product.emoji}
                          </Box>
                          <Chip
                            label={info?.text}
                            size="small"
                            color={info?.color as any}
                            variant="outlined"
                            sx={{ height: 22, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', px: 0.5 }}
                          />
                        </Box>

                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: 'lowercase', '&:first-letter': { textTransform: 'uppercase' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.name[language] || product.name['uz']}
                        </Typography>

                        <Divider sx={{ mb: 1.5, opacity: 0.5 }} />

                        <Stack direction="row" spacing={3}>
                          <Box sx={{ textAlign: 'center', flex: 1 }}>
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', fontSize: 8 }}>GI</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{product.gi}</Typography>
                          </Box>
                          <Box sx={{ width: 1, bgcolor: 'divider' }} />
                          <Box sx={{ textAlign: 'center', flex: 1 }}>
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', fontSize: 8 }}>GL</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>{product.gl}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}

        {!loading && filteredProducts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10, opacity: 0.3 }}>
            <SearchIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Mahsulot topilmadi</Typography>
          </Box>
        )}
      </Stack>

      {/* Product Detail Modal */}
      <Dialog
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        {selectedProduct && (() => {
          const status = getProductStatus(selectedProduct, currentFasting, currentPostMeal);
          const info = getStatusInfo(status);
          
          // Data normalization
          const cal = selectedProduct.calories || selectedProduct.nutrition?.calories || 0;
          const carb = selectedProduct.carbs || selectedProduct.nutrition?.carbs || 0;
          const prot = selectedProduct.protein || selectedProduct.nutrition?.protein || 0;
          const fat = selectedProduct.fats || selectedProduct.nutrition?.fat || 0;
          const sugar = selectedProduct.sugar || selectedProduct.nutrition?.sugar || 0;
          const fiber = selectedProduct.fiber || selectedProduct.nutrition?.fiber || 0;

          // Nutrient Distribution Percentage
          const total = carb + prot + fat;
          const carbPct = total > 0 ? (carb / total) * 100 : 0;
          const protPct = total > 0 ? (prot / total) * 100 : 0;
          const fatPct = total > 0 ? (fat / total) * 100 : 0;

          return (
            <Box sx={{ bgcolor: 'white' }}>
              {/* Header */}
              <Box sx={{ p: 3, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                   <Box sx={{ fontSize: 40 }}>{selectedProduct.emoji}</Box>
                   <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937', mb: 0.5 }}>
                        {selectedProduct.name[language] || selectedProduct.name['uz']}
                      </Typography>
                      <Box sx={{ 
                        display: 'inline-block', 
                        px: 1.5, py: 0.3, 
                        bgcolor: info?.color === 'success' ? '#fef3c7' : info?.color === 'warning' ? '#fee2e2' : '#f3f4f6',
                        color: info?.color === 'success' ? '#d97706' : info?.color === 'warning' ? '#dc2626' : '#4b5563',
                        borderRadius: 1, fontSize: 12, fontWeight: 700 
                      }}>
                        {info?.text}
                      </Box>
                   </Box>
                </Stack>
                <IconButton onClick={() => setSelectedProduct(null)} size="small" sx={{ bgcolor: '#f3f4f6' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <DialogContent sx={{ p: 3 }}>
                {/* GI and GL Cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f0f7ff', border: '1px solid #e0f2fe', height: '100%' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 2 }}>Glikemik indeks</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#2563eb' }}>{selectedProduct.gi}</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#faf5ff', border: '1px solid #f3e8ff', height: '100%' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 2 }}>Glikemik yuk</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#9333ea' }}>{selectedProduct.gl}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Nutrition Grid */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1f2937', mb: 2 }}>Ozuqaviy ma'lumot (100g uchun)</Typography>
                <Grid container spacing={1.5} sx={{ mb: 4 }}>
                   {[
                     { label: 'Kaloriya', val: `${cal} kcal` },
                     { label: 'Uglevodlar', val: `${carb}g` },
                     { label: 'Shakar', val: `${sugar}g` },
                     { label: 'Tola', val: `${fiber}g` },
                     { label: 'Oqsil', val: `${prot}g` },
                     { label: 'Yog\'', val: `${fat}g` },
                   ].map((item, i) => (
                     <Grid size={{ xs: 4 }} key={i}>
                       <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', height: '100%' }}>
                         <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1, fontSize: 10 }}>{item.label}</Typography>
                         <Typography variant="body2" sx={{ fontWeight: 800, color: '#1f2937' }}>{item.val}</Typography>
                       </Box>
                     </Grid>
                   ))}
                </Grid>

                {/* Carbohydrate Distribution */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1f2937', mb: 2 }}>Uglevodlar taqsimoti</Typography>
                <Stack spacing={3} sx={{ mb: 4 }}>
                   <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#4b5563' }}>Shakar</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#1f2937' }}>{sugar}g</Typography>
                      </Box>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: carb > 0 ? `${(sugar / carb) * 100}%` : 0, bgcolor: '#ef4444' }} />
                      </Box>
                   </Box>
                   <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#4b5563' }}>Tola</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#1f2937' }}>{fiber}g</Typography>
                      </Box>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: carb > 0 ? `${(fiber / carb) * 100}%` : 0, bgcolor: '#22c55e' }} />
                      </Box>
                   </Box>
                </Stack>

                {/* Main Nutrients Stacked Bar */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1f2937', mb: 2 }}>Asosiy ozuqa moddalari</Typography>
                <Box sx={{ mb: 4 }}>
                   <Box sx={{ height: 24, borderRadius: 12, bgcolor: '#f3f4f6', overflow: 'hidden', display: 'flex', mb: 2 }}>
                      {total > 0 ? (
                        <>
                          <Box sx={{ height: '100%', width: `${carbPct}%`, bgcolor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>
                            {carbPct > 10 ? `${Math.round(carbPct)}%` : ''}
                          </Box>
                          <Box sx={{ height: '100%', width: `${protPct}%`, bgcolor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>
                            {protPct > 10 ? `${Math.round(protPct)}%` : ''}
                          </Box>
                          <Box sx={{ height: '100%', width: `${fatPct}%`, bgcolor: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>
                            {fatPct > 10 ? `${Math.round(fatPct)}%` : ''}
                          </Box>
                        </>
                      ) : (
                        <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 10 }}>Ma'lumot yo'q</Box>
                      )}
                   </Box>
                   <Stack direction="row" spacing={3} justifyContent="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#4b5563' }}>Uglevodlar</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#4b5563' }}>Oqsil</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#eab308' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#4b5563' }}>Yog'</Typography>
                      </Stack>
                   </Stack>
                </Box>

                {/* Advice Section */}
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f0f9ff' }}>
                   <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0c4a6e', mb: 1.5 }}>Batafsil tavsiya</Typography>
                   <Typography variant="body2" sx={{ color: '#1e3a8a', lineHeight: 1.6, fontWeight: 500 }}>
                      {selectedProduct.advice?.[language] || selectedProduct.advice?.['uz'] || 'Tavsiya mavjud emas'}
                   </Typography>
                </Box>
              </DialogContent>
            </Box>
          );
        })()}
      </Dialog>
    </Box>
  );
}
