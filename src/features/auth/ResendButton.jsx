import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import AppText from "@/components/ui/AppText";
import { colors } from "@/theme/tokens";

// "코드 다시 받기" 버튼. 누른 뒤 60초 동안은 다시 못 눌러요 (메일 폭탄 방지)
export default function ResendButton({
  onResend,
  cooldown = 60,
  startCooling = false,
}) {
  const [left, setLeft] = useState(startCooling ? cooldown : 0);
  const [sending, setSending] = useState(false);

  // 1초마다 남은 시간 줄이기
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  async function handlePress() {
    setSending(true);
    try {
      await onResend();
      setLeft(cooldown);
    } finally {
      setSending(false);
    }
  }

  const disabled = left > 0 || sending;
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
    >
      <AppText
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: disabled ? colors.gray300 : colors.primary600,
        }}
      >
        {sending
          ? "보내는 중…"
          : left > 0
            ? `코드 다시 받기 (${left}초)`
            : "코드 다시 받기"}
      </AppText>
    </Pressable>
  );
}
