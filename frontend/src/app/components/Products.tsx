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

const AsyncProductImage = ({ product, language, themeMode }: any) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const urlsToTry = [
      `https://www.themealdb.com/images/ingredients/${encodeURIComponent(product.name.en)}.png`,
      `https://spoonacular.com/cdn/ingredients_250x250/${encodeURIComponent(product.name.en.toLowerCase().replace(/ /g, '-'))}.jpg`,
      `https://spoonacular.com/cdn/ingredients_250x250/${encodeURIComponent(product.name.en.toLowerCase().split(' ')[0])}.jpg`
    ];

    const tryImage = async (index: number) => {
      if (!isMounted) return;
      if (index >= urlsToTry.length) {
        // Try Wikipedia as the ultimate fallback for rare items
        try {
           const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(product.name.en.split(' (')[0])}&prop=pageimages&format=json&pithumbsize=250&origin=*`);
           const data = await res.json();
           const pages = data?.query?.pages;
           if (pages && isMounted) {
             const key = Object.keys(pages)[0];
             if (key !== '-1' && pages[key]?.thumbnail?.source) {
               setImgUrl(pages[key].thumbnail.source);
               return;
             }
           }
        } catch (e) {
           console.error("Wikipedia image fetch failed", e);
        }
        if (isMounted) setError(true);
        return;
      }

      const img = new Image();
      img.onload = () => { if (isMounted) setImgUrl(urlsToTry[index]); };
      img.onerror = () => tryImage(index + 1);
      img.src = urlsToTry[index];
    };

    setImgUrl(null);
    setError(false);
    tryImage(0);

    return () => { isMounted = false; };
  }, [product.name.en]);

  if (error || !imgUrl) {
    return (
      <Typography sx={{ position: 'absolute', fontSize: error ? 100 : 120, opacity: error ? 1 : 0.2, filter: error ? 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))' : 'blur(4px)', transform: error ? 'scale(1)' : 'scale(1.2)', transition: 'all 0.5s', zIndex: 1 }}>
        {product.emoji}
      </Typography>
    );
  }

  return (
    <>
       <Typography sx={{ position: 'absolute', fontSize: 120, opacity: 0.1, filter: 'blur(4px)', transform: 'scale(1.2)', zIndex: 0 }}>
         {product.emoji}
       </Typography>
       <Box 
         component="img"
         src={imgUrl} 
         alt={product.name[language as keyof typeof product.name]}
         sx={{ 
            width: 140, height: 140, objectFit: 'contain', position: 'relative', zIndex: 1, 
            mixBlendMode: themeMode === 'dark' ? 'normal' : 'multiply',
            filter: themeMode === 'dark' ? 'drop-shadow(0 12px 16px rgba(0,0,0,0.5))' : 'drop-shadow(0 12px 16px rgba(0,0,0,0.1))',
            animation: 'fadeIn 0.5s ease-out',
            '@keyframes fadeIn': { from: { opacity: 0, transform: 'scale(0.9)' }, to: { opacity: 1, transform: 'scale(1)' } }
         }} 
       />
    </>
  );
};

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
                {t.filters}
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
          <Typography variant="overline" sx={{ display: 'block', fontWeight: 800, letterSpacing: 2 }}>{t.loadingProducts}</Typography>
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
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        borderRadius: 3,
                        bgcolor: theme.palette.background.paper,
                        boxShadow: theme.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                        position: 'relative',
                        '&:hover': { 
                           transform: 'translateY(-6px)',
                           boxShadow: theme.palette.mode === 'dark' ? '0 12px 32px rgba(0,0,0,0.6)' : '0 12px 32px rgba(99,102,241,0.15)' 
                        }
                      }}
                    >
                      {/* Image/Emoji Area */}
                      <Box 
                        sx={{ 
                          height: 160, 
                          position: 'relative', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.15)} 0%, ${alpha(theme.palette.secondary.light, 0.15)} 100%)`, 
                          overflow: 'hidden'
                        }}
                      >
                         <AsyncProductImage product={product} language={language} themeMode={theme.palette.mode} />
                         
                         {/* Status Chip overlay */}
                         <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                           <Chip
                             label={info?.text}
                             size="small"
                             sx={{ 
                                bgcolor: info?.color === 'success' ? alpha(theme.palette.success.main, 0.9) : info?.color === 'warning' ? alpha(theme.palette.warning.main, 0.9) : alpha(theme.palette.error.main, 0.9), 
                                color: '#fff', 
                                height: 24, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', px: 1,
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,255,255,0.2)'
                             }}
                           />
                         </Box>
                      </Box>
                      
                      <CardContent sx={{ p: 2.5, pt: 3, position: 'relative' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 2, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.name[language] || product.name['uz']}
                        </Typography>

                        <Stack direction="row" spacing={2} divider={<Box sx={{ width: '1px', bgcolor: 'divider' }} />}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', fontSize: 9, textTransform: 'uppercase' }}>Glycemic Index</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900, color: info?.color ? `${info.color}.main` : 'text.primary' }}>{product.gi}</Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', fontSize: 9, textTransform: 'uppercase' }}>Glycemic Load</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 900, color: 'text.primary' }}>{product.gl}</Typography>
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
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{t.noProductsFound}</Typography>
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
            <Box sx={{ bgcolor: 'background.paper' }}>
              {/* Header */}
              <Box sx={{ p: 3, pb: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                   <Box sx={{ fontSize: 40 }}>{selectedProduct.emoji}</Box>
                   <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                        {selectedProduct.name[language] || selectedProduct.name['uz']}
                      </Typography>
                      <Box sx={{ 
                        display: 'inline-block', 
                        px: 1.5, py: 0.3, 
                        bgcolor: info?.color === 'success' ? alpha(theme.palette.success.main, 0.1) : info?.color === 'warning' ? alpha(theme.palette.warning.main, 0.1) : 'background.default',
                        color: info?.color === 'success' ? 'success.main' : info?.color === 'warning' ? 'warning.main' : 'text.secondary',
                        borderRadius: 1, fontSize: 12, fontWeight: 700 
                      }}>
                        {info?.text}
                      </Box>
                   </Box>
                </Stack>
                <IconButton onClick={() => setSelectedProduct(null)} size="small" sx={{ bgcolor: 'background.default' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <DialogContent sx={{ p: 3 }}>
                {/* GI and GL Cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, height: '100%' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 2 }}>{t.giLabel}</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>{selectedProduct.gi}</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.secondary.main, 0.05), border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`, height: '100%' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 2 }}>{t.glLabel}</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main' }}>{selectedProduct.gl}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Nutrition Grid */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>{t.nutritionInfo100g}</Typography>
                <Grid container spacing={1.5} sx={{ mb: 4 }}>
                   {[
                     { label: t.kcal, val: `${cal} kcal` },
                     { label: t.carbsLabel, val: `${carb}g` },
                     { label: t.sugarLabelShort, val: `${sugar}g` },
                     { label: t.fiberLabelShort, val: `${fiber}g` },
                     { label: t.proteinLabel, val: `${prot}g` },
                     { label: t.fatLabel, val: `${fat}g` },
                   ].map((item, i) => (
                     <Grid size={{ xs: 4 }} key={i}>
                       <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default', height: '100%' }}>
                         <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1, fontSize: 10 }}>{item.label}</Typography>
                         <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{item.val}</Typography>
                       </Box>
                     </Grid>
                   ))}
                </Grid>

                {/* Carbohydrate Distribution */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>{t.carbsDistribution}</Typography>
                <Stack spacing={3} sx={{ mb: 4 }}>
                   <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Shakar</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>{sugar}g</Typography>
                      </Box>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'background.default', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: carb > 0 ? `${(sugar / carb) * 100}%` : 0, bgcolor: theme.palette.error.main }} />
                      </Box>
                   </Box>
                   <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>Tola</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>{fiber}g</Typography>
                      </Box>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'background.default', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: carb > 0 ? `${(fiber / carb) * 100}%` : 0, bgcolor: theme.palette.success.main }} />
                      </Box>
                   </Box>
                </Stack>

                {/* Main Nutrients Stacked Bar */}
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>{t.mainNutrients}</Typography>
                <Box sx={{ mb: 4 }}>
                   <Box sx={{ height: 24, borderRadius: 12, bgcolor: 'background.default', overflow: 'hidden', display: 'flex', mb: 2 }}>
                      {total > 0 ? (
                        <>
                          <Box sx={{ height: '100%', width: `${carbPct}%`, bgcolor: theme.palette.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>
                            {carbPct > 10 ? `${Math.round(carbPct)}%` : ''}
                          </Box>
                          <Box sx={{ height: '100%', width: `${protPct}%`, bgcolor: theme.palette.error.main, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>
                            {protPct > 10 ? `${Math.round(protPct)}%` : ''}
                          </Box>
                          <Box sx={{ height: '100%', width: `${fatPct}%`, bgcolor: theme.palette.warning.main, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>
                            {fatPct > 10 ? `${Math.round(fatPct)}%` : ''}
                          </Box>
                        </>
                      ) : (
                        <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: 10 }}>{t.noData}</Box>
                      )}
                   </Box>
                   <Stack direction="row" spacing={3} justifyContent="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t.carbsLabel}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t.proteinLabel}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.warning.main }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{t.fatLabel}</Typography>
                      </Stack>
                   </Stack>
                </Box>

                {/* Advice Section */}
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
                   <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.mode === 'dark' ? 'info.light' : 'info.dark', mb: 1.5 }}>{t.detailedAdvice}</Typography>
                   <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? 'info.light' : 'info.dark', lineHeight: 1.6, fontWeight: 500 }}>
                      {selectedProduct.advice?.[language] || selectedProduct.advice?.['uz'] || t.noAdviceAvailable}
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
