# brcktrckr

A LEGO brick set inventory analyzer that helps calculate the value of individual pieces within a set using market data from BrickLink.

## What This Application Does

**brcktrckr** allows users to search for LEGO sets by set number and displays detailed inventory information for each piece, including calculated valuation metrics based on sales and stock data. The application computes custom metrics to help determine piece value:

- **Staple**: Ratio of sold quantity to stock quantity (indicates demand vs supply)
- **Hotness**: Ratio of sold units to stock units (market velocity indicator)
- **Value Multiply**: Staple × Hotness (combined market strength)
- **Piece Time Value**: Average sold price × Staple × Hotness
- **Total Value**: Quantity × Piece Time Value

## Project Structure

```
brcktrckr/
├── app/
│   ├── page.tsx              # Main search and inventory display page
│   ├── layout.tsx            # Root layout with font configuration
│   ├── globals.css           # Global styles (TailwindCSS)
│   ├── set-look/
│   │   └── page.tsx          # Inventory search page
│   └── set-rank/
│       └── page.tsx          # Set ranking page
├── utils/
│   └── supabase/
│       └── client.ts         # Supabase client configuration
├── public/                   # Static assets
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── next.config.ts            # Next.js configuration
└── eslint.config.mjs         # ESLint configuration
```

## Key Components

### `app/page.tsx` (Main Application)

This is the core of the application. It implements:

**State Management:**
- Search input and matched set data
- Inventory records with enriched valuation metrics
- Sorting configuration (column, direction)
- Error states (set not found, missing inventory)

**Data Flow:**
1. User enters set number and clicks "Go"
2. Calls `get_set` RPC to Supabase to find matching set
3. Calls `get_inventory` RPC to retrieve all pieces in that set
4. Enriches each inventory row with calculated metrics (Staple, Hotness, etc.)
5. Displays sortable table with all piece information

**Key Features:**
- Client-side sorting by any column (ascending/descending)
- Lazy-loaded BrickLink piece images
- Calculated total value sum for the entire set
- Responsive table with sticky header

**TypeScript Interfaces:**
- `SetRecord`: Set metadata (number, name, theme)
- `InventoryRecord`: Piece data with all BrickLink metrics

### `utils/supabase/client.ts`

Creates the Supabase client instance used for database queries. Requires environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### `app/layout.tsx`

Root layout that:
- Configures Geist and Geist Mono fonts from Google Fonts
- Sets up global CSS variables for font usage
- Applies antialiasing to text

### `app/set-look/page.tsx`

Placeholder page showing "Coming Soon" with gradient background.

## Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **React**: 19.1.0 (client-side interactivity)
- **Database**: Supabase with custom RPC functions
- **Styling**: TailwindCSS 4.0
- **TypeScript**: Full type safety
- **Build Tool**: Turbopack (Next.js's Rust-based bundler)

## Important Database Functions

The application relies on two Supabase RPC functions:

1. **`get_set(search_number)`**: Returns set information matching the provided set number
2. **`get_inventory(set_number)`**: Returns all inventory items for a specific set with BrickLink pricing data

## Running the Application

```bash
npm run dev    # Start development server with Turbopack
npm run build  # Production build
npm run start  # Start production server
```

Access the application at `http://localhost:3000`

## Environment Setup

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
