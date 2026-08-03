module.exports = {
  theme: {
    extend: {
      keyframes: {
        slideFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        slideFadeIn: 'slideFadeIn 0.5s cubic-bezier(.4,2,.3,1)',
      },
    },
  },
} 