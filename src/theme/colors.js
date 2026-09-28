// Χρωματική παλέτα βασισμένη στο logo του CineSuggest:
// Βαθύ navy (#161C2D) + Πορτοκαλί/Κίτρινο accent (#F5A623 -> #FFC857) + Κρεμ φόντο (#FAF7F0)

export const brand = {
  navy: '#161C2D',
  navyLight: '#232B42',
  orange: '#F5A623',
  amber: '#FFC857',
  cream: '#FAF7F0',
  white: '#FFFFFF',
  red: '#E4572E',
  green: '#2ECC71',
};

export const lightTheme = {
  mode: 'light',
  background: brand.cream,
  surface: brand.white,
  surfaceAlt: '#F0ECE1',
  card: brand.white,
  text: brand.navy,
  textSecondary: '#5C6270',
  primary: brand.orange,
  primaryText: brand.navy,
  accent: brand.amber,
  border: '#E4DFD0',
  tabBar: brand.white,
  danger: brand.red,
  success: brand.green,
  statusBar: 'dark',
  chip: '#EFE7D6',
  chipActive: brand.orange,
};

export const darkTheme = {
  mode: 'dark',
  background: brand.navy,
  surface: brand.navyLight,
  surfaceAlt: '#1D2438',
  card: brand.navyLight,
  text: '#F5F2EA',
  textSecondary: '#A9AFC0',
  primary: brand.orange,
  primaryText: brand.navy,
  accent: brand.amber,
  border: '#2C3450',
  tabBar: brand.navyLight,
  danger: '#FF6B5B',
  success: '#4ADE80',
  statusBar: 'light',
  chip: '#232B42',
  chipActive: brand.orange,
};
