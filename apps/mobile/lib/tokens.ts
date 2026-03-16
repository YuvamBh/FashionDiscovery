export const colors = {
  bg: { primary: '#0A0A0A', elevated: '#111111', overlay: '#1A1A1A' },
  text: { primary: '#F0EDE8', secondary: '#9A9693', tertiary: '#4A4846', inverse: '#0A0A0A' },
  border: { subtle: '#1E1E1E', default: '#2A2A2A', strong: '#3D3D3D' },
  white: {
    a10: 'rgba(240,237,232,0.10)',
    a15: 'rgba(240,237,232,0.15)',
    a20: 'rgba(240,237,232,0.20)',
    a40: 'rgba(240,237,232,0.40)',
    a60: 'rgba(240,237,232,0.60)',
  },
  black: {
    a40: 'rgba(0,0,0,0.40)',
    a60: 'rgba(0,0,0,0.60)',
    a80: 'rgba(0,0,0,0.80)',
  }
} as const;

export const fonts = {
  display: 'Syne_700Bold',
  displayMedium: 'Syne_600SemiBold',
  displayLight: 'Syne_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold'
} as const;

export const size = { xs:11, sm:13, base:15, md:17, lg:20, xl:24, xxl:32, xxxl:40, hero:56 } as const;

export const tracking = { tight:-1, normal:0, wide:1, wider:2, widest:3 } as const;

export const space = { 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 7:28, 8:32, 10:40, 12:48, 14:56, 16:64 } as const;

export const radius = { sm:4, md:8, lg:12, full:9999 } as const;

export const spring = {
  gentle: { damping:20, stiffness:90, mass:1 },
  card: { damping:25, stiffness:100, mass:1.2 }
} as const;
