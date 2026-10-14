import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  emptyForm,
  formToLog,
  isSameForm,
  logToForm,
  mergeFresh,
} from "./logForm";
import { fetchLog, saveLog } from "./logsApi";

// 특정 날짜의 기록을 불러오고, 입력값(form)과 저장 기능을 제공하는 훅
export function useDailyLog(date) {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm());
  const [saved, setSaved] = useState(emptyForm()); // 마지막으로 저장된 값 (변경 여부 비교용)
  const [hasRecord, setHasRecord] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  // 최신 값을 콜백 안에서 읽기 위한 ref
  const formRef = useRef(form);
  const savedRef = useRef(saved);
  formRef.current = form;
  savedRef.current = saved;
  const focusedOnce = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const log = await fetchLog(date);
      const f = logToForm(log);
      setForm(f);
      setSaved(f);
      setHasRecord(Boolean(log));
      setErrors({});
    } catch (e) {
      setLoadError(e);
    } finally {
      setLoading(false);
    }
  }, [date]);

  // 날짜가 바뀔 때마다 그 날 기록을 불러와요
  useEffect(() => {
    load();
  }, [load]);

  // 탭으로 다시 돌아올 때: 다른 곳(타이머 등)에서 바뀐 값을 조용히 반영해요
  // 로딩 표시 없이, 사용자가 고치고 있는 칸은 건드리지 않아요
  const refreshQuiet = useCallback(async () => {
    try {
      const log = await fetchLog(date);
      const fresh = logToForm(log);
      setForm(mergeFresh(formRef.current, savedRef.current, fresh));
      setSaved(fresh);
      setHasRecord(Boolean(log));
    } catch {
      // 조용한 새로고침이라 실패해도 그대로 둬요
    }
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      // 처음 화면이 열릴 때는 위의 load()가 불러오니까 건너뛰어요
      if (!focusedOnce.current) {
        focusedOnce.current = true;
        return;
      }
      refreshQuiet();
    }, [refreshQuiet]),
  );

  // 한 칸만 바꾸기 + 그 칸의 오류 메시지 지우기
  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  // 성공하면 true, 입력 오류나 저장 실패면 false (실패 시 error를 throw)
  const save = useCallback(async () => {
    const { values, errors: v } = formToLog(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return false;
    }
    setSaving(true);
    try {
      const log = await saveLog(user.id, date, values);
      const f = logToForm(log);
      setForm(f);
      setSaved(f);
      setHasRecord(Boolean(log));
      return true;
    } finally {
      setSaving(false);
    }
  }, [form, user, date]);

  return {
    form,
    setField,
    errors,
    isDirty: !isSameForm(form, saved),
    hasRecord,
    loading,
    loadError,
    saving,
    save,
    reload: load,
  };
}
