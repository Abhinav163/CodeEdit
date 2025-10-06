import { extendTheme } from "@chakra-ui/react";

const fonts = {
  heading: `'Fira Code', monospace`,
  body: `'Fira Code', monospace`,
  mono: `'Fira Code', monospace`,
};

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  fonts,
  config,
  colors: {
    brand: {
      50: "#e6fffa",
      100: "#b2f5ea",
      200: "#81e6d9",
      300: "#4fd1c5",
      400: "#38b2ac",
      500: "#319795",
      600: "#2c7a7b",
      700: "#285e61",
      800: "#234e52",
      900: "#1d4044",
    },
    neon: {
      500: "#39FF14",
    },
  },
  components: {
    Button: {
      baseStyle: {
        _hover: {
          transform: "scale(1.05)",
          boxShadow: "0 0 10px #39FF14, 0 0 20px #39FF14, 0 0 30px #39FF14",
        },
      },
    },
  },
});

export default theme;
