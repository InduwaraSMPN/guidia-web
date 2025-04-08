# Guidia Color System

This document explains how to use the color system in the Guidia application.

## Color Variables

The color system is built using CSS variables and Tailwind CSS. All colors are defined as HSL values in the `:root` selector in `src/index.css` and are available as Tailwind classes.

### Light and Dark Mode

The color system supports both light and dark modes. The variables are defined in the `:root` selector for light mode and in the `.dark` selector for dark mode.

## Using Colors in Components

### Tailwind Classes

You can use the colors directly in your components using Tailwind classes:

```jsx
// Using brand colors
<div className="bg-brand text-white">Primary Brand</div>
<div className="bg-brand-light">Lighter Brand</div>
<div className="bg-brand-darker">Darker Brand</div>

// Using secondary colors
<div className="bg-teal text-white">Teal</div>
<div className="bg-teal-light">Lighter Teal</div>

// Using neutral colors
<div className="text-neutral-900">Dark Text</div>
<div className="text-neutral-500">Medium Text</div>
<div className="bg-neutral-100">Light Background</div>

// Using accent colors
<div className="bg-gold">Gold Accent</div>
<div className="bg-indigo">Indigo Accent</div>
<div className="bg-purple">Purple Accent</div>

// Using functional colors
<div className="bg-success text-white">Success</div>
<div className="bg-warning">Warning</div>
<div className="bg-error text-white">Error</div>
<div className="bg-info text-white">Info</div>
```

### CSS Variables

You can also use the CSS variables directly in your CSS:

```css
.my-element {
  background-color: hsl(var(--brand));
  color: white;
}

.my-element-hover:hover {
  background-color: hsl(var(--brand-light));
}
```

## Color Palette

### Brand Colors (Burgundy)

- `--brand`: #800020 (Primary brand color)
- `--brand-light`: #A01F3D (Lighter burgundy)
- `--brand-lighter`: #C03C59 (Even lighter burgundy)
- `--brand-dark`: #600018 (Darker burgundy)
- `--brand-darker`: #400010 (Very dark burgundy)

### Secondary Colors (Teal)

- `--secondary`: #008066 (Teal)
- `--secondary-light`: #1A9980 (Lighter teal)
- `--secondary-lighter`: #33B299 (Even lighter teal)
- `--secondary-dark`: #006B55 (Darker teal)
- `--secondary-darker`: #004D3D (Very dark teal)

### Neutral Colors

- `--neutral-50`: #FFFFFF (White)
- `--neutral-100`: #F9F9F9 (Off-white)
- `--neutral-200`: #E5E7EB (Light gray)
- `--neutral-300`: #D1D5DB (Light-medium gray)
- `--neutral-400`: #9CA3AF (Medium gray)
- `--neutral-500`: #6B7280 (Medium-dark gray)
- `--neutral-600`: #4B5563 (Dark gray)
- `--neutral-700`: #374151 (Very dark gray)
- `--neutral-800`: #1F2937 (Almost black)
- `--neutral-900`: #111827 (Black)

### Accent Colors

- `--accent-gold`: #D4A017 (Gold)
- `--accent-indigo`: #4F46E5 (Indigo)
- `--accent-purple`: #8B5CF6 (Purple)

### Functional Colors

- `--success`: #10B981 (Green)
- `--warning`: #F59E0B (Amber)
- `--error`: #EF4444 (Red)
- `--info`: #3B82F6 (Blue)

## Usage Guidelines

### Text Colors

- Use `text-foreground` for primary text
- Use `text-neutral-500` for secondary/muted text
- Use `text-brand` for emphasis or links

### Background Colors

- Use `bg-background` for page backgrounds
- Use `bg-card` for cards, modals, and other UI containers
- Use `bg-brand` for primary buttons and important UI elements
- Use `bg-teal` for secondary actions

### Borders

- Use `border-border` for standard borders
- Use `border-brand` for emphasis or focus states

## Dark Mode

To enable dark mode, add the `dark` class to the `html` element:

```jsx
// Example using a dark mode toggle
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
};

<button onClick={toggleDarkMode}>Toggle Dark Mode</button>
```

In dark mode, all colors will automatically adjust to their dark mode variants.
