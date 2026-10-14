import { useEffect } from "react";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";

// 이 컴포넌트가 화면에 있는 동안 폰 화면이 자동으로 꺼지지 않게 해요 (타이머가 돌아갈 때만 렌더)
// 지원하지 않는 환경(일부 웹 브라우저 등)에서는 조용히 넘어가요
// tag: 화면마다 다르게 줘야 한쪽이 사라질 때 다른 쪽까지 풀리지 않아요
export default function KeepAwake({ tag }) {
  useEffect(() => {
    activateKeepAwakeAsync(tag).catch(() => {});
    return () => {
      Promise.resolve(deactivateKeepAwake(tag)).catch(() => {});
    };
  }, [tag]);
  return null;
}
