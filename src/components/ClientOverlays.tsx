"use client";

import React from "react";
import dynamic from "next/dynamic";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"), { ssr: false });
const AuthModal = dynamic(() => import("@/components/AuthModal"), { ssr: false });

export default function ClientOverlays() {
  return (
    <>
      <CartDrawer />
      <AuthModal />
    </>
  );
}
