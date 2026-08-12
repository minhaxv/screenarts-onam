// ═══════════════════════════════════════════════════
// SCREENARTS ONAM — Mock Product Data
// ═══════════════════════════════════════════════════

export const TSHIRT_COLOURS = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#1A1A2E' },
  { id: 'cream', name: 'Cream', hex: '#FDF5E6' },
  { id: 'green', name: 'Kerala Green', hex: '#2D6A4F' },
  { id: 'gold', name: 'Kasavu Gold', hex: '#D4A843' },
  { id: 'maroon', name: 'Deep Maroon', hex: '#7B2D3B' },
  { id: 'navy', name: 'Navy', hex: '#1E3A5F' },
  { id: 'grey', name: 'Ash Grey', hex: '#9CA3AF' },
  { id: 'orange', name: 'Warm Orange', hex: '#E8772E' },
  { id: 'yellow', name: 'Soft Yellow', hex: '#FDE68A' },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

export const KIDS_SIZES = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'];

export const PRINT_RATIOS = [
  { id: '1:1', name: '1:1 Square', dims: '10 x 10 cm (Pocket / Emblem)', icon: '⬛' },
  { id: '4:5', name: '4:5 Portrait', dims: '20 x 25 cm (Standard Chest)', icon: '📱' },
  { id: '3:4', name: '3:4 Classic', dims: '21 x 29.7 cm (A4 Medium)', icon: '📄' },
  { id: 'A3', name: 'A3 Maxi', dims: '30 x 42 cm (Full Oversized)', icon: '📜' },
  { id: '16:9', name: '16:9 Banner', dims: '28 x 15 cm (Chest Banner)', icon: '🎞️' },
];

export const PRINT_LOCATIONS = [
  { id: 'front', name: 'Front Center', icon: '🎯' },
  { id: 'back', name: 'Back Center', icon: '↩️' },
  { id: 'left-chest', name: 'Left Chest', icon: '❤️' },
  { id: 'full-front', name: 'Full Front', icon: '📐' },
];

export const CATEGORIES = [
  { id: 'men', name: 'Men', slug: 'men', tagline: 'Bold Onam styles for men' },
  { id: 'women', name: 'Women', slug: 'women', tagline: 'Elegant Onam fashion' },
  { id: 'kids', name: 'Kids', slug: 'kids', tagline: 'Fun prints for little ones' },
  { id: 'couples', name: 'Couples', slug: 'couples', tagline: 'Matching Onam looks' },
  { id: 'family', name: 'Family', slug: 'family', tagline: 'Coordinated family tees' },
  { id: 'college', name: 'College & Teams', slug: 'college', tagline: 'Squad goals this Onam' },
];

export const DESIGN_FILTERS = [
  'All', 'Malayalam', 'Funny', 'Minimal', 'Mahabali', 
  'Kerala', 'Family', 'Couple', 'Kids', 'College'
];

export const products = [];

export const designs = [
  { id: 'd1', name: 'Maveli Returns', tags: ['Mahabali', 'Funny'], preview: '👑' },
  { id: 'd2', name: 'Pookalam Pattern', tags: ['Kerala', 'Minimal'], preview: '🌸' },
  { id: 'd3', name: 'Thiruvathira Dance', tags: ['Kerala', 'Family'], preview: '💃' },
  { id: 'd4', name: 'Kerala Script', tags: ['Malayalam'], preview: '✍️' },
  { id: 'd5', name: 'Onasadya Plate', tags: ['Funny', 'Kerala'], preview: '🍛' },
  { id: 'd6', name: 'Vallam Kali', tags: ['Kerala', 'Minimal'], preview: '🚣' },
  { id: 'd7', name: 'Njan Malayali', tags: ['Malayalam', 'Funny'], preview: '🌴' },
  { id: 'd8', name: 'Couple Goals', tags: ['Couple'], preview: '💕' },
  { id: 'd9', name: 'Family Vibes', tags: ['Family'], preview: '👨‍👩‍👧‍👦' },
  { id: 'd10', name: 'College Squad', tags: ['College', 'Funny'], preview: '🎓' },
  { id: 'd11', name: 'Elephant Art', tags: ['Kerala', 'Minimal'], preview: '🐘' },
  { id: 'd12', name: 'Banana Leaf', tags: ['Kerala', 'Funny'], preview: '🌿' },
  { id: 'd13', name: 'Kathakali Face', tags: ['Kerala', 'Minimal'], preview: '🎭' },
  { id: 'd14', name: 'Kids Maveli', tags: ['Kids', 'Mahabali'], preview: '🧒' },
  { id: 'd15', name: 'Onam Meme', tags: ['Funny', 'Malayalam'], preview: '😂' },
  { id: 'd16', name: 'Minimalist Banana', tags: ['Minimal', 'Kerala'], preview: '🍌' },
];

export const BULK_PRICING = [
  { min: 5, max: 10, price: 399, label: '5–10 pcs' },
  { min: 11, max: 25, price: 349, label: '11–25 pcs' },
  { min: 26, max: 50, price: 299, label: '26–50 pcs' },
  { min: 51, max: 100, price: 269, label: '51–100 pcs' },
  { min: 101, max: 9999, price: 249, label: '100+ pcs' },
];

export const SIZE_CHART = {
  headers: ['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'],
  rows: [
    ['XS', '34', '25', '15'],
    ['S', '36', '26', '16'],
    ['M', '38', '27', '17'],
    ['L', '40', '28', '18'],
    ['XL', '42', '29', '19'],
    ['XXL', '44', '30', '20'],
    ['3XL', '46', '31', '21'],
  ],
};

export const KIDS_SIZE_CHART = {
  headers: ['Kid Size (Age)', 'Chest (in)', 'Length (in)'],
  rows: [
    ['2-3 Years', '24', '16'],
    ['4-5 Years', '26', '18'],
    ['6-7 Years', '28', '20'],
    ['8-9 Years', '30', '22'],
    ['10-11 Years', '32', '23'],
    ['12-13 Years', '34', '24'],
  ],
};

export const formatPrice = (price) => `₹${price}`;
