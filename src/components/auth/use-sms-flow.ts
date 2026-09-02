"use client";

import { useEffect, useState } from "react";
import { useAppForm } from "@/components/form";
import { smsCodeDefaults, smsCodeSchema } from "./schema";

function useCooldown() {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (sec <= 0) return;
    const t = window.setTimeout(() => setSec((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [sec]);
  return { sec, restart: (n = 90) => setSec(n), stop: () => setSec(0) };
}

/** 📲 Shared "send code → lock the phone → verify" flow for the OTP and
 *  register panels. */
export function useSmsFlow() {
  const code = useAppForm({
    schema: smsCodeSchema,
    defaultValues: smsCodeDefaults,
  });
  const cd = useCooldown();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  return {
    code,
    cd,
    phone,
    name,
    sent: phone !== "",
    send(p: string, n = "") {
      setPhone(p);
      setName(n);
      cd.restart();
      code.reset({ ...smsCodeDefaults });
      code.setFocus("code");
    },
    back() {
      setPhone("");
      setName("");
      cd.stop();
      code.reset({ ...smsCodeDefaults });
    },
  };
}

export type SmsFlow = ReturnType<typeof useSmsFlow>;
