import { colors, radius, spacing } from "@/theme/tokens";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";
import AppText from "./AppText";
import Button from "./Button";

// 로딩 중: 실제 화면 모양과 비슷한 회색 박스(Skeleton)를 보여줘요.
// 빙글빙글 아이콘보다 "곧 내용이 나온다"는 느낌을 줘서 덜 답답해요.
export function SkeletonList({ count = 3 }) {
  return (
    <View style={{ gap: spacing.md }} accessibilityLabel="불러오는 중">
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.skeleton} />
      ))}
    </View>
  );
}

// 오류: 원인 안내 + 다시 시도 버튼
export function ErrorState({ onRetry }) {
  return (
    <View style={styles.error}>
      <Ionicons name="cloud-offline-outline" size={28} color={colors.gray500} />
      <AppText variant="heading" style={{ textAlign: "center" }}>
        불러오지 못했어요
      </AppText>
      <AppText variant="caption" style={{ textAlign: "center" }}>
        인터넷 연결을 확인하고 다시 시도해 주세요.
      </AppText>
      <Button
        title="다시 시도"
        variant="secondary"
        size="sm"
        onPress={onRetry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    height: 56,
    borderRadius: radius.control,
    backgroundColor: colors.gray100,
  },
  error: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
});
