
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

  const handleFilterToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFilters(!showFilters);
  };

  const updateFilter = (key: keyof GadgetFilters, value: any) => {
    // Convert "all" values back to undefined for the filter
    const filterValue = value === 'all' ? undefined : value;
    onFilter({ ...filters, [key]: filterValue });
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
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 z-10" />
          <Input
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search gadgets, brands, categories..."
            className="pl-10 pr-28 md:pr-32 h-11 md:h-12 text-sm md:text-base border border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent rounded-lg bg-white shadow-sm"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1 md:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFilterToggle}
              className={`px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm flex items-center gap-1 border ${showFilters ? 'bg-accent text-white border-accent' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            >
              <Filter className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              className="bg-accent hover:bg-accent/90 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm flex items-center gap-1"
            >
              <Search className="w-3 h-3 md:w-4 md:h-4 sm:hidden" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg relative z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base">Filters</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-500 hover:text-red-700 text-xs md:text-sm"
              >
                <X className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Category Filter */}
            <div className="relative z-50">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={filters.category || 'all'} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger className="text-xs md:text-sm bg-white border-gray-300">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg z-[100]">
                  <SelectItem value="all" className="hover:bg-gray-100">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="hover:bg-gray-100">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div className="relative z-50">
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Brand</label>
              <Select value={filters.brand || 'all'} onValueChange={(value) => updateFilter('brand', value)}>
                <SelectTrigger className="text-xs md:text-sm bg-white border-gray-300">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg z-[100]">
                  <SelectItem value="all" className="hover:bg-gray-100">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand} className="hover:bg-gray-100">
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <Input
                type="number"
                placeholder="UGX 0"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="text-xs md:text-sm bg-white border-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <Input
                type="number"
                placeholder="UGX 9,999,999"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="text-xs md:text-sm bg-white border-gray-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GadgetSearch;
