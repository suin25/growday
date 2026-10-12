import AppText from "@/components/ui/AppText";
import { colors, radius, spacing } from "@/theme/tokens";
import { StyleSheet, View } from "react-native";

// 큰 숫자 하나 + 설명. 차트보다 숫자 하나가 더 잘 읽힐 때 써요.
export default function StatTile({ label, value, sub, color }) {
  return (
    <View style={styles.tile}>
      <View style={styles.labelRow}>
        {color && <View style={[styles.dot, { backgroundColor: color }]} />}
        <AppText variant="caption">{label}</AppText>
      </View>
      <AppText style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </AppText>
      {sub && <AppText style={styles.sub}>{sub}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: spacing.md,
    gap: 2,
    backgroundColor: colors.white,
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  value: { fontSize: 20, fontWeight: "700", color: colors.gray900 },
  sub: { fontSize: 11, color: colors.gray500 },
});
