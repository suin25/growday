import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { emptyForm, formToLog, isSameForm, logToForm } from "./logForm";
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
