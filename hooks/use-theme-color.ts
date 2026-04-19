import { Colors } from "@/constants/theme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light,
) {
  const theme = "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // We use a type assertion here to satisfy TS
    return (Colors[theme] as any)[colorName];
  }
}
