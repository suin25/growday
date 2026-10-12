import { colors, spacing } from "@/theme/tokens";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 모든 화면의 바깥 틀.
// SafeAreaView: 아이폰 노치(위)와 홈바(아래)에 내용이 가려지지 않게 여백을 자동으로 넣어줘요.
// edges={['top']}: 아래쪽은 탭 바가 이미 처리해주니까 위쪽만 신경 써요.
// scrollRef: 화면에서 스크롤을 직접 움직이고 싶을 때 넘겨요 (예: 메모 칸 누르면 아래로)
export default function Screen({ children, edges = ["top"], scrollRef }) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {/* automaticallyAdjustKeyboardInsets: 키보드가 올라오면 그만큼 스크롤 영역을 늘려서 입력칸이 안 가려져요 (iOS)
          keyboardShouldPersistTaps="handled": 키보드가 떠 있어도 버튼이 한 번에 눌려요 */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray50 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
});
