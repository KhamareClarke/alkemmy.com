'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Trash2, Upload } from 'lucide-react';
import { Bundle } from '@/lib/supabase';
import { generateSlug, getAllProducts } from '@/lib/admin-api';

interface BundleFormProps {
  bundle?: Bundle | null;
  onSave: (bundleData: Partial<Bundle>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface BundleItem {
  product_id: string;
  quantity: number;
  product_type: string;
}

interface Product {
  id: string;
  title: string;
  category: string;
}

export default function BundleForm({ bundle, onSave, onCancel, loading = false }: BundleFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    images: [] as string[],
    is_active: true,
    is_featured: false,
    is_bestseller: false,
    category: 'bundles',
    tags: [] as string[],
    bundle_items: [] as BundleItem[],
    inventory: '',
    in_stock: true
  });

  const [newImage, setNewImage] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newBundleItem, setNewBundleItem] = useState({
    product_id: '',
    quantity: 1,
    product_type: ''
  });
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (bundle) {
      setFormData({
        title: bundle.title || '',
        slug: bundle.slug || '',
        description: bundle.description || '',
        short_description: bundle.short_description || '',
        price: bundle.price?.toString() || '',
        original_price: bundle.original_price?.toString() || '',
        images: bundle.images || [],
        is_active: bundle.is_active ?? true,
        is_featured: bundle.is_featured ?? false,
        is_bestseller: bundle.is_bestseller ?? false,
        category: bundle.category || 'bundles',
        tags: bundle.tags || [],
        bundle_items: bundle.bundle_items || [],
        inventory: bundle.inventory?.toString() || '',
        in_stock: bundle.in_stock ?? true
      });
    }
  }, [bundle]);

  // Fetch all available products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const products = await getAllProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title' && !bundle) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }));
      setNewImage('');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      // Convert file to base64 so it can be saved to the database
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, base64]
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addBundleItem = () => {
    if (newBundleItem.product_id.trim()) {
      setFormData(prev => ({
        ...prev,
        bundle_items: [...prev.bundle_items, { ...newBundleItem }]
      }));
      setNewBundleItem({
        product_id: '',
        quantity: 1,
        product_type: ''
      });
    }
  };

  const handleProductSelect = (productId: string) => {
    const selectedProduct = availableProducts.find(p => p.id === productId);
    if (selectedProduct) {
      setNewBundleItem(prev => ({
        ...prev,
        product_id: selectedProduct.id,
        product_type: selectedProduct.category
      }));
    }
  };

  const removeBundleItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bundle_items: prev.bundle_items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const bundleData: Partial<Bundle> = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
      inventory: parseInt(formData.inventory) || 0,
      images: formData.images || [],
      bundle_items: formData.bundle_items
    };

    await onSave(bundleData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <CardTitle className="flex items-center justify-between">
            {bundle ? 'Edit Bundle' : 'Add New Bundle'}
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Bundle title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="bundle-slug"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description *</Label>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) => handleInputChange('short_description', e.target.value)}
                placeholder="Brief description for the bundle"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed description of the bundle"
                rows={4}
                required
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price</Label>
                <Input
                  id="original_price"
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) => handleInputChange('original_price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory</Label>
                <Input
                  id="inventory"
                  type="number"
                  value={formData.inventory}
                  onChange={(e) => handleInputChange('inventory', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Images</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* URL Input */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Add by URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="Image URL"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addImage} size="sm" disabled={!newImage.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* File Upload */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Upload Image</Label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploadingImage}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 flex items-center justify-center gap-2"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Choose File
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Bundle image ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-lg border" 
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Tag name"
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bundle Items */}
            <div className="space-y-2">
              <Label>Bundle Items</Label>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <select
                      value={newBundleItem.product_id}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                      disabled={loadingProducts}
                    >
                      <option value="">Select a product...</option>
                      {availableProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.title} ({product.category})
                        </option>
                      ))}
                    </select>
                    {loadingProducts && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D4AF37]"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                    <span className="text-sm text-gray-600 truncate">
                      {availableProducts.find(p => p.id === newBundleItem.product_id)?.title || 'No product selected'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={newBundleItem.quantity}
                      onChange={(e) => setNewBundleItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      placeholder="Qty"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={addBundleItem} 
                      size="sm"
                      disabled={!newBundleItem.product_id}
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.bundle_items.length > 0 && (
                  <div className="space-y-2">
                    {formData.bundle_items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1 text-sm">
                          {availableProducts.find(p => p.id === item.product_id)?.title || `Product ID: ${item.product_id}`} - Qty: {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBundleItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status Switches */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active" className="text-sm">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
                <Label htmlFor="is_featured" className="text-sm">Featured</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_bestseller"
                  checked={formData.is_bestseller}
                  onCheckedChange={(checked) => handleInputChange('is_bestseller', checked)}
                />
                <Label htmlFor="is_bestseller" className="text-sm">Bestseller</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="in_stock"
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => handleInputChange('in_stock', checked)}
                />
                <Label htmlFor="in_stock" className="text-sm">In Stock</Label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : bundle ? 'Update Bundle' : 'Create Bundle'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}