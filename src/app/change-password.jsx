import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { changePassword } from "@/features/account/accountApi";
import { colors, spacing } from "@/theme/tokens";

export default function ChangePasswordScreen() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const update = (key) => (v) => {
    setForm((p) => ({ ...p, [key]: v }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  async function handleSave() {
    const e = {};
    if (!form.current) e.current = "현재 비밀번호를 입력해 주세요.";
    if (form.next.length < 6) e.next = "새 비밀번호는 6자 이상이어야 해요.";
    else if (form.next === form.current)
      e.next = "지금과 다른 비밀번호를 입력해 주세요.";
    if (form.confirm !== form.next) e.confirm = "새 비밀번호가 서로 달라요.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await changePassword(user.email, form.current, form.next);
      Alert.alert("비밀번호를 바꿨어요", "", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (err) {
      setSaving(false);
      Alert.alert(err.message);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "비밀번호 변경",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <AppText style={{ color: colors.gray600 }}>취소</AppText>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TextField
          label="현재 비밀번호"
          value={form.current}
          onChangeText={update("current")}
          secureTextEntry
          textContentType="password"
          error={errors.current}
        />
        <TextField
          label="새 비밀번호"
          value={form.next}
          onChangeText={update("next")}
          placeholder="6자 이상"
          secureTextEntry
          textContentType="newPassword"
          error={errors.next}
        />
        <TextField
          label="새 비밀번호 확인"
          value={form.confirm}
          onChangeText={update("confirm")}
          secureTextEntry
          textContentType="newPassword"
          error={errors.confirm}
        />
        <Button title="변경하기" onPress={handleSave} loading={saving} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, gap: spacing.lg },
});
