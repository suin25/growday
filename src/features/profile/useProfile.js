import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

// 내 프로필(닉네임)을 DB에서 불러오는 커스텀 훅.
// 데이터를 다룰 땐 항상 data / loading / error 세 가지를 세트로 관리해요.
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: dbError } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .maybeSingle(); // 0개 또는 1개 행 (없으면 에러 대신 null)
    setProfile(data);
    setError(dbError);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, loading, error, reload: load };
}
