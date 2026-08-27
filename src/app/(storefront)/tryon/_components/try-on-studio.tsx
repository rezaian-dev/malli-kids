"use client";

import { useTryOn } from "../_hooks/use-try-on";
import { TryOnPreview } from "./try-on-preview";
import { TryOnControls } from "./try-on-controls";

export function Studio() {
  const tryOn = useTryOn();

  return (
    <div className="xs:px-4 container mx-auto grid w-full max-w-6xl gap-8 px-3 sm:px-5 lg:grid-cols-2 lg:px-7">
      <TryOnPreview
        person={tryOn.person}
        result={tryOn.result}
        phase={tryOn.phase}
        garment={tryOn.garment}
        fileRef={tryOn.fileRef}
        onUpload={tryOn.onUpload}
        onRunTryOn={tryOn.runTryOn}
        onPickSample={tryOn.pickSample}
      />
      <TryOnControls
        garment={tryOn.garment}
        onGarmentChange={tryOn.setGarment}
        height={tryOn.height}
        onHeightChange={tryOn.setHeight}
        size={tryOn.size}
      />
    </div>
  );
}
