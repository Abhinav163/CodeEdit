import { extendTheme } from "@chakra-ui/react"; // Corrected import path

// App fonts
const fonts = {
  heading: `'Poppins', sans-serif`,
  body: `'Poppins', sans-serif`,
  mono: `'Fira Code', monospace`,
};

// App initial color mode
const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

// Create the theme
const theme = extendTheme({ fonts, config });

export default theme;
