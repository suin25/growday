import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// 내 프로필(닉네임)을 DB에서 불러오는 커스텀 훅.
// 데이터를 다룰 땐 항상 data / loading / error 세 가지를 세트로 관리해요.
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadedOnce = useRef(false);

  const load = useCallback(async () => {
    if (!user) return;
    if (!loadedOnce.current) setLoading(true); // 처음에만 로딩 표시 (다시 불러올 땐 깜빡이지 않게)
    const { data, error: dbError } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .maybeSingle(); // 0개 또는 1개 행 (없으면 에러 대신 null)
    setProfile(data);
    setError(dbError);
    setLoading(false);
    loadedOnce.current = true;
  }, [user]);

  // 화면이 보일 때마다 다시 불러와요
  // (설정에서 닉네임을 바꾸고 홈으로 돌아오면 바로 반영되게)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { profile, loading, error, reload: load };
}
