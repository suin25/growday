import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";

// 개인정보처리방침 주소 (GitHub Pages에 올린 docs/privacy.html)
// ⚠️ GitHub Pages를 켠 뒤 실제 주소로 바꿔 주세요. 예: https://내아이디.github.io/저장소이름/privacy.html
export const PRIVACY_URL =
  "https://YOUR_GITHUB_ID.github.io/YOUR_REPO/privacy.html";

// 앱 안의 브라우저(iOS는 Safari 화면)로 열어요. 앱을 벗어나지 않고 닫기 버튼으로 돌아올 수 있어요.
export async function openPrivacyPolicy() {
  try {
    await WebBrowser.openBrowserAsync(PRIVACY_URL);
  } catch {
    Alert.alert(
      "페이지를 열지 못했어요",
      "인터넷 연결을 확인하고 다시 시도해 주세요.",
    );
  }
}
