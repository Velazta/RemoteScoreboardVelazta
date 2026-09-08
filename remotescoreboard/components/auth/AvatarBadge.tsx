import React from "react";
import Image from "next/image";

export default function AvatarBadge() {
  return (
    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
      <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-b from-[#999999] via-[#4d4d4d] to-[#262626] shadow-xl">
        <div className="w-full h-full rounded-full bg-[#161616] flex items-center justify-center overflow-hidden border border-white/10">
          <Image
            src="/images/auth/simo-logo.png"
            alt="Avatar"
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
