const fs = require('fs');
const path = require('path');

// Template for updating category pages with filters
const updatePageTemplate = (filePath, categoryName, productType, filterMappings) => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Add ProductFilters import
  const updatedContent = content
    .replace(
      /import { get\w+, \w+ } from '@\/lib\/category-api';\nimport Link from 'next\/link';/,
      `import { get${productType}, ${productType} } from '@/lib/category-api';\nimport ProductFilters from '@/components/ProductFilters';\nimport Link from 'next/link';`
    )
    .replace(
      /const \[products, setProducts\] = useState<\w+\[\]>\(\[\]\);\n  const \[loading, setLoading\] = useState\(true\);/,
      `const [products, setProducts] = useState<${productType}[]>([]);\n  const [filteredProducts, setFilteredProducts] = useState<${productType}[]>([]);\n  const [loading, setLoading] = useState(true);`
    )
    .replace(
      /setProducts\([^)]+\);/,
      `setProducts(${categoryName.toLowerCase()});\n        setFilteredProducts(${categoryName.toLowerCase()});`
    )
    .replace(
      /load\w+\(\);\n  }, \[\]\);/,
      `load${productType}();\n  }, []);\n\n  const handleFiltersChange = (filters: Record<string, string[]>) => {\n    let filtered = [...products];\n\n    // Apply filters\n    Object.entries(filters).forEach(([filterName, selectedValues]) => {\n      if (selectedValues.length > 0) {\n        filtered = filtered.filter(product => {\n          switch (filterName) {\n${filterMappings.map(([filterName, fieldName]) => 
            `            case '${filterName}':\n              return selectedValues.includes(product.${fieldName} || '');`
        ).join('\n')}\n            default:\n              return true;\n          }\n        });\n      }\n    });\n\n    setFilteredProducts(filtered);\n  };`
    )
    .replace(
      /{products\.length === 0 \?/,
      '{filteredProducts.length === 0 ?'
    )
    .replace(
      /{products\.map\(/,
      '{filteredProducts.map('
    )
    .replace(
      /No \w+ found\./,
      `{products.length === 0 ? 'No ${categoryName.toLowerCase()} found.' : 'No ${categoryName.toLowerCase()} match your filters.'}`
    )
    .replace(
      /<\/div>\n        ) : \(\n          <motion\.div/,
      `</div>\n                {products.length > 0 && (\n                  <p className="text-gray-400 text-sm mt-2">\n                    Try adjusting your filters to see more results.\n                  </p>\n                )}\n              </div>\n            ) : (\n              <div className="mb-6">\n                <p className="text-gray-600">\n                  Showing {filteredProducts.length} of {products.length} ${categoryName.toLowerCase()}\n                </p>\n              </div>\n            )}\n            \n            {filteredProducts.length > 0 && (\n              <motion.div`
    )
    .replace(
      /className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"/,
      'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"'
    )
    .replace(
      /<\/motion\.div>\n        )}\n      <\/div>/,
      `</motion.div>\n            )}\n          </div>\n        </div>\n      </div>`
    )
    .replace(
      /{products\.length === 0 \?/,
      '{filteredProducts.length === 0 ?'
    )
    .replace(
      /{products\.map\(/,
      '{filteredProducts.map('
    );

  // Add the filters sidebar
  const finalContent = updatedContent.replace(
    /{products\.length === 0 \?/,
    `<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">\n          {/* Filters Sidebar */}\n          <div className="lg:col-span-1">\n            <ProductFilters \n              category="${categoryName.toLowerCase()}" \n              onFiltersChange={handleFiltersChange}\n              className="sticky top-8"\n            />\n          </div>\n\n          {/* Products Grid */}\n          <div className="lg:col-span-3">\n            {filteredProducts.length === 0 ?`
  );

  fs.writeFileSync(filePath, finalContent);
  console.log(`Updated ${filePath}`);
};

// Define the pages to update
const pagesToUpdate = [
  {
    filePath: 'app/oils/page.tsx',
    categoryName: 'oils',
    productType: 'Oil',
    filterMappings: [
      ['Type', 'oil_type'],
      ['Base Ingredient', 'carrier_oil'],
      ['Concern', 'application_area'],
      ['Formulation', 'extraction_method']
    ]
  },
  {
    filePath: 'app/beard-care/page.tsx',
    categoryName: 'beard-care',
    productType: 'BeardCare',
    filterMappings: [
      ['Product Type', 'product_type'],
      ['Beard Type', 'beard_length'],
      ['Fragrance', 'hold_strength'],
      ['Concern', 'hold_strength']
    ]
  },
  {
    filePath: 'app/shampoos/page.tsx',
    categoryName: 'shampoos',
    productType: 'Shampoo',
    filterMappings: [
      ['Hair Type', 'hair_type'],
      ['Concern', 'hair_concern'],
      ['Ingredient', 'sulfate_free'],
      ['Formulation', 'sulfate_free']
    ]
  },
  {
    filePath: 'app/roll-ons/page.tsx',
    categoryName: 'roll-ons',
    productType: 'RollOn',
    filterMappings: [
      ['Purpose', 'roll_on_type'],
      ['Main Ingredient', 'concentration'],
      ['Formulation', 'concentration'],
      ['Usage Area', 'concentration']
    ]
  },
  {
    filePath: 'app/elixirs/page.tsx',
    categoryName: 'elixirs',
    productType: 'Elixir',
    filterMappings: [
      ['Purpose', 'elixir_type'],
      ['Main Ingredient', 'dosage'],
      ['Form', 'dosage'],
      ['Formulation', 'alcohol_free']
    ]
  }
];

// Update all pages
pagesToUpdate.forEach(page => {
  try {
    updatePageTemplate(page.filePath, page.categoryName, page.productType, page.filterMappings);
  } catch (error) {
    console.error(`Error updating ${page.filePath}:`, error.message);
  }
});

console.log('All pages updated with filters!');








