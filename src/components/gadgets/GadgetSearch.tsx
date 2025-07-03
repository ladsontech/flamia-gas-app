import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { GadgetFilters } from '@/types/gadget';

interface GadgetSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: GadgetFilters) => void;
  searchQuery: string;
  filters: GadgetFilters;
}

const categories = ['Smartphones', 'Laptops', 'Tablets', 'Audio', 'Wearables', 'Gaming'];
const brands = ['Apple', 'Samsung', 'Google', 'Dell', 'Sony', 'Microsoft', 'HP', 'Lenovo'];

const GadgetSearch: React.FC<GadgetSearchProps> = ({
  onSearch,
  onFilter,
  searchQuery,
  filters
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localQuery);
  };

  const updateFilter = (key: keyof GadgetFilters, value: any) => {
    onFilter({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilter({});
    setLocalQuery('');
    onSearch('');
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search gadgets, brands, categories..."
          className="pl-10 pr-20 h-12 text-base border-2 border-gray-200 focus:border-accent"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`${showFilters ? 'bg-accent text-white' : ''}`}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button type="submit" size="sm" className="bg-accent hover:bg-accent/90">
            Search
          </Button>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={filters.category || ''} onValueChange={(value) => updateFilter('category', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <Select value={filters.brand || ''} onValueChange={(value) => updateFilter('brand', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <Input
                type="number"
                placeholder="$0"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <Input
                type="number"
                placeholder="$9999"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GadgetSearch;