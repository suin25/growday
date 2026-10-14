// 타이머 종료 알림 (expo-notifications의 "로컬 알림")
// - 폰 안에서만 예약하고 울리는 알림이에요. 서버나 푸시 토큰을 쓰지 않아요.
// - 알림 권한은 사용자가 처음 타이머를 시작할 때 한 번 물어봐요. 거절해도 타이머는 그대로 동작해요.
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const supported = Platform.OS === "ios" || Platform.OS === "android";

// 앱이 화면에 떠 있을 때도 알림 배너를 보여줘요 (다른 탭을 보고 있어도 끝난 걸 알 수 있게)
if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// 권한이 있으면 true. 아직 안 물어봤으면 이때 물어봐요.
export async function ensureNotificationPermission() {
  if (!supported) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
  } catch {
    return false;
  }
}

// endAt(시각)에 알림 예약 → 알림 id (실패하거나 권한이 없으면 null)
export async function scheduleAt(endAt, title, body) {
  if (!supported) return null;
  try {
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) return null;
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(endAt),
      },
    });
  } catch {
    return null;
  }
}

export async function cancelScheduled(id) {
  if (!supported || !id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // 이미 울렸거나 없는 알림이면 무시
  }
}

// 로그아웃할 때: 이 앱이 예약해 둔 알림을 모두 취소 (다음 사용자에게 울리지 않게)
export async function cancelAllScheduled() {
  if (!supported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
