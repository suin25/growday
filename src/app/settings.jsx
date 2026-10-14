import { useEffect, useState } from "react";
import { openPrivacyPolicy } from "@/lib/links";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Screen from "@/components/ui/Screen";
import Card from "@/components/ui/Card";
import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/features/profile/useProfile";
import { deleteAccount, updateNickname } from "@/features/account/accountApi";
import { colors, spacing } from "@/theme/tokens";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { profile, loading, reload } = useProfile();

  const [nickname, setNickname] = useState("");
  const [nickError, setNickError] = useState(null);
  const [savingNick, setSavingNick] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 프로필을 불러오면 입력칸에 채워요
  useEffect(() => {
    if (profile) setNickname(profile.nickname ?? "");
  }, [profile]);

  const nickChanged = profile && nickname.trim() !== (profile.nickname ?? "");

  async function saveNickname() {
    const v = nickname.trim();
    if (!v) return setNickError("닉네임을 입력해 주세요.");
    if (v.length > 20) return setNickError("닉네임은 20자 이하로 해 주세요.");
    setSavingNick(true);
    try {
      await updateNickname(user.id, v);
      await reload();
      Alert.alert("저장했어요");
    } catch (e) {
      Alert.alert(e.message);
    } finally {
      setSavingNick(false);
    }
  }

  function confirmSignOut() {
    Alert.alert("로그아웃할까요?", "", [
      { text: "취소", style: "cancel" },
      { text: "로그아웃", style: "destructive", onPress: signOut },
    ]);
  }

  // 계정 삭제는 되돌릴 수 없어서, 무엇이 지워지는지 분명히 알려줘요
  function confirmDelete() {
    Alert.alert(
      "계정을 삭제할까요?",
      "목표, 체크 기록, 일일 기록이 모두 영구적으로 삭제되고 되돌릴 수 없어요.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              // 로그인 정보가 사라지면 자동으로 로그인 화면으로 이동해요 (5단계의 Stack.Protected)
            } catch (e) {
              setDeleting(false);
              Alert.alert("삭제하지 못했어요", e.message);
            }
          },
        },
      ],
    );
  }

  return (
    <Screen edges={["bottom"]}>
      <Section title="프로필">
        <Card style={{ gap: spacing.md }}>
          {loading ? (
            <ActivityIndicator style={{ alignSelf: "flex-start" }} />
          ) : (
            <>
              <TextField
                label="닉네임"
                value={nickname}
                onChangeText={(t) => {
                  setNickname(t);
                  setNickError(null);
                }}
                maxLength={20}
                error={nickError}
              />
              <Button
                title="닉네임 저장"
                size="sm"
                onPress={saveNickname}
                loading={savingNick}
                disabled={!nickChanged}
              />
            </>
          )}
        </Card>
      </Section>

      <Section title="계정">
        <Card style={{ paddingVertical: spacing.sm }}>
          <View style={styles.row}>
            <AppText variant="caption">이메일</AppText>
            <AppText style={styles.value} numberOfLines={1}>
              {user?.email}
            </AppText>
          </View>
          <View style={styles.divider} />
          <Pressable
            onPress={() => router.push("/change-password")}
            style={styles.row}
          >
            <AppText>비밀번호 변경</AppText>
            <Ionicons name="chevron-forward" size={18} color={colors.gray300} />
          </Pressable>
        </Card>
      </Section>

      <Section title="정보">
        <Card style={{ paddingVertical: spacing.sm }}>
          <Pressable
            onPress={openPrivacyPolicy}
            style={styles.row}
            accessibilityRole="link"
          >
            <AppText>개인정보처리방침</AppText>
            <Ionicons name="open-outline" size={18} color={colors.gray300} />
          </Pressable>
        </Card>
      </Section>

      <Button title="로그아웃" variant="secondary" onPress={confirmSignOut} />

      <Pressable
        onPress={confirmDelete}
        disabled={deleting}
        hitSlop={8}
        style={styles.deleteBtn}
      >
        {deleting ? (
          <ActivityIndicator color={colors.error} />
        ) : (
          <AppText style={styles.deleteText}>계정 삭제</AppText>
        )}
      </Pressable>
    </Screen>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray500,
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.lg,
    minHeight: 48,
  },
  value: { flexShrink: 1, fontWeight: "500" },
  divider: { height: 1, backgroundColor: colors.gray100 },
  deleteBtn: { alignSelf: "center", paddingVertical: spacing.md },
  deleteText: {
    fontSize: 14,
    color: colors.error,
    textDecorationLine: "underline",
  },
});
