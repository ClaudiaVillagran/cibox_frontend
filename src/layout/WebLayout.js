import { View } from "react-native";
import WebHeader from "../components/WebHeader";
import { colors } from "../constants/theme";

export default function WebLayout({ children }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WebHeader />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}