#!/bin/bash
files=(
    "src/components/dashboard/PortfolioChart.tsx"
    "src/components/dashboard/PortfolioUniversalChart.tsx"
    "src/components/dashboard/PortfolioCandleChart.tsx"
    "src/components/mutual-funds/AssetAllocationChart.tsx"
    "src/components/mutual-funds/MutualFundChart.tsx"
)
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Found $file"
    fi
done
