"use client";

import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { useStore } from "@/providers/store-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PROFILE_CARD } from "./profile-shared";
import {
  FIELD_ERROR,
  FIELD_HINT,
  FIELD_LABEL,
  SECTION_TITLE,
  inputClass,
} from "./profile-form-styles";

type ChildState = {
  childName: string;
  childAge: string;
  childGender: string;
};

const EMPTY_CHILD: ChildState = {
  childName: "",
  childAge: "",
  childGender: "",
};

/** 🧸 The optional "your kid" half of the profile info panel. */
export function ChildForm() {
  const { user, updateUser } = useStore();
  const [child, setChild] = useState<ChildState>(EMPTY_CHILD);
  const [errors, setErrors] = useState<Partial<ChildState>>({});

  useEffect(() => {
    if (!user) return;
    setChild({
      childName: user.childName || "",
      childAge: user.childAge || "",
      childGender:
        user.childGender === "دختر" || user.childGender === "پسر"
          ? user.childGender
          : "",
    });
  }, [user]);

  if (!user) return null;

  function validate() {
    const next: Partial<ChildState> = {};
    const age = child.childAge.trim();
    const gender = child.childGender.trim();

    if (age && !/^[0-9۰-۹]{1,2}(\s*(?:سال|ساله|ماه))?$/.test(age)) {
      next.childAge = "سن را ساده بنویسید، مثل ۳ سال.";
    }
    if (gender && gender !== "دختر" && gender !== "پسر") {
      next.childGender = "فقط دختر یا پسر را انتخاب کنید.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function save() {
    if (!validate()) return;
    updateUser({
      childName: child.childName.trim() || undefined,
      childAge: child.childAge.trim() || undefined,
      childGender: child.childGender.trim() || undefined,
    });
    toast.success("اطلاعات کوچولو ذخیره شد ✅");
  }

  return (
    <section className={PROFILE_CARD}>
      <div>
        <h2 className={SECTION_TITLE}>اطلاعات کوچولو</h2>
        <p className="text-navy/70 dark:text-wheat mt-2 text-xs">
          اختیاری است؛ اگر پرش کنید، سایز دقیق‌تری پیشنهاد می‌دهیم.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className={FIELD_LABEL}>نام کوچولو</span>
          <input
            value={child.childName}
            onChange={(event) =>
              setChild((current) => ({
                ...current,
                childName: event.target.value,
              }))
            }
            maxLength={40}
            placeholder="نیلو"
            className={inputClass()}
          />
        </label>

        <label className="space-y-1.5">
          <span className={FIELD_LABEL}>سن تقریبی</span>
          <input
            value={child.childAge}
            onChange={(event) => {
              setChild((current) => ({
                ...current,
                childAge: event.target.value,
              }));
              setErrors((current) => ({ ...current, childAge: undefined }));
            }}
            placeholder="۳ سال"
            className={inputClass(errors.childAge)}
          />
          {errors.childAge ? (
            <p className={FIELD_ERROR}>{errors.childAge}</p>
          ) : (
            <p className={FIELD_HINT}>عدد + سال یا ماه کافی است.</p>
          )}
        </label>

        <label className="space-y-1.5">
          <span className={FIELD_LABEL}>جنسیت</span>
          <Select
            value={child.childGender || undefined}
            onValueChange={(value) => {
              setChild((current) => ({ ...current, childGender: value }));
              setErrors((current) => ({ ...current, childGender: undefined }));
            }}
            dir="rtl"
          >
            <SelectTrigger
              aria-invalid={Boolean(errors.childGender) || undefined}
              className={cn(
                "h-11 bg-transparent shadow-none",
                !errors.childGender && "border-navy/12 dark:border-gold/25",
              )}
            >
              <SelectValue placeholder="انتخاب کنید" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="دختر">دختر</SelectItem>
              <SelectItem value="پسر">پسر</SelectItem>
            </SelectContent>
          </Select>
          {errors.childGender ? (
            <p className={FIELD_ERROR}>{errors.childGender}</p>
          ) : null}
        </label>
      </div>

      <Button type="button" variant="gold" className="h-11 px-7" onClick={save}>
        ذخیره اطلاعات کودک
      </Button>
    </section>
  );
}
