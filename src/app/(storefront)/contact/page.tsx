import { Intro } from "@/components/shared/intro";
import { Map } from "./map";
import { Form } from "./form";
import { BRAND } from "@/lib/constants";
import { Clock, MapPin, Phone } from "lucide-react";


export default function ContactPage() {
  return (
    <>
<Intro crumb="تماس با ما" kicker="گالری و پشتیبانی" title="کنارتان هستیم" lead="برای سایز، سفارش و استایل پیام بدهید یا به گالری ولیعصر سر بزنید." />
        <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-5xl grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Info ico={MapPin} k="آدرس" v={BRAND.address} />
            <Info ico={Phone} k="تلفن" v={BRAND.phoneFa} ltr />
            <Info ico={Clock} k="ساعت" v="شنبه تا پنجشنبه، ۹ صبح تا ۹ شب" />
            <Map />
          </div>
          <Form />
        </div>
    </>
        );
}

function Info({ ico: Icon, k, v, ltr }: { ico: typeof MapPin; k: string; v: string; ltr?: boolean }) {
  return (
    <div className="lux-card flex items-start gap-3 p-4 hover:translate-y-0">
      <span className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-xs font-black text-gold dark:text-gold-glow">{k}</p>
        <p className="mt-1 font-bold text-navy dark:text-ivory" dir={ltr ? "ltr" : undefined}>
          {v}
        </p>
      </div>
    </div>
  );
}
