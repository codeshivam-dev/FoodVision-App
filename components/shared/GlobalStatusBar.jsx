import { StatusBar } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function GlobalStatusBar() {
  const { theme, isDark } = useTheme();

  return (
    <StatusBar
      barStyle={isDark ? "light-content" : "dark-content"}
      backgroundColor={theme.colors.background}
    />
  );
}