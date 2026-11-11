"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, MessageCircle, Truck, X, Trash2 } from "lucide-react";
import { Order, OrderStatus } from "@/lib/types";
import { formatCustomerWhatsAppNumber } from "@/lib/config";

const showVal = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined) return "-";
  const str = String(val).trim();
  return str === "" ? "-" : str;
};

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onMarkAsPaid: (orderId: string) => void;
  onOpenTracking: (order: Order) => void;
  getWhatsAppMessage: (order: Order) => string;
}

export function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  onMarkAsPaid,
  onOpenTracking,
  getWhatsAppMessage,
}: OrderDetailModalProps) {
  const formattedCreatedAt =
    order.createdAt && !isNaN(new Date(order.createdAt).getTime())
      ? new Date(order.createdAt).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  const waUrl = `https://wa.me/${formatCustomerWhatsAppNumber(order.phone || "")}?text=${encodeURIComponent(
    getWhatsAppMessage(order)
  )}`;

  const itemsList = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="fixed inset-0 z-50 bg-[#1C130E]/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FDFBF7] rounded-xl max-w-2xl w-full p-5 sm:p-7 space-y-5 border border-[#E8DEC8] shadow-2xl relative my-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-stone-500 hover:text-[#211612] hover:bg-[#FAF6EE]"
          aria-label="Close order details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8DEC8] pr-12">
          <div>
            <span className="text-[11px] font-bold text-[#A87B28] uppercase tracking-wider font-mono">
              Order Detail
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#211612] break-all">
              #{showVal(order.orderNumber)}
            </h3>
            <p className="text-[11px] text-[#3D2C24]/70 font-mono mt-0.5">
              Created: {formattedCreatedAt}
            </p>
          </div>
          <span className="text-xs font-bold bg-[#FAF6EE] text-[#211612] px-3 py-1.5 rounded-md border border-[#E8DEC8]">
            {showVal(order.orderStatus)}
          </span>
        </div>

        {/* All Customer & Supabase Metadata Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#E8DEC8] space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#A87B28] pb-1">
              Customer & Delivery
            </h4>
            <p className="break-words">
              <strong>customer_name:</strong> {showVal(order.customerName)}
            </p>
            <p className="break-all">
              <strong>phone:</strong> {showVal(order.phone)}
            </p>
            <p className="break-all">
              <strong>email:</strong> {showVal(order.email)}
            </p>
            <p className="break-words">
              <strong>address:</strong> {showVal(order.address)}
            </p>
            <p className="break-words">
              <strong>landmark:</strong> {showVal(order.landmark)}
            </p>
            <p>
              <strong>city:</strong> {showVal(order.city)}
            </p>
            <p>
              <strong>state:</strong> {showVal(order.state)}
            </p>
            <p>
              <strong>pincode:</strong> {showVal(order.pincode)}
            </p>
          </div>

          <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#E8DEC8] space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#A87B28] pb-1">
              Payment & Record Info
            </h4>
            <p className="break-all font-mono text-[11px]">
              <strong>id:</strong> {showVal(order.id)}
            </p>
            <p className="font-mono text-[11px]">
              <strong>order_number:</strong> {showVal(order.orderNumber)}
            </p>
            <p>
              <strong>payment_method:</strong> {showVal(order.paymentMethod)}
            </p>
            <p>
              <strong>payment_status:</strong> {showVal(order.paymentStatus)}
            </p>
            <p className="font-mono text-[#A87B28] font-bold break-all">
              <strong>UTR:</strong> {showVal(order.utr)}
            </p>
            <p>
              <strong>order_status:</strong> {showVal(order.orderStatus)}
            </p>
            <p>
              <strong>coupon_code:</strong> {showVal(order.couponCode)}
            </p>
            <p className="break-all font-mono text-[11px]">
              <strong>user_id:</strong> {showVal(order.userId)}
            </p>
            <p>
              <strong>courier_name:</strong> {showVal(order.courierName)}
            </p>
            <p className="font-mono">
              <strong>tracking_number:</strong> {showVal(order.trackingNumber)}
            </p>
            {order.notes && (
              <p className="break-words">
                <strong>notes:</strong> {showVal(order.notes)}
              </p>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#211612] uppercase tracking-wider">
            Ordered Items ({itemsList.length})
          </h4>
          {itemsList.length === 0 ? (
            <div className="text-xs text-stone-500 bg-[#FAF6EE] p-3 rounded-xl border border-[#E8DEC8]">
              -
            </div>
          ) : (
            <div className="space-y-2">
              {itemsList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 text-xs p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DEC8]"
                >
                  <div>
                    <span className="font-bold text-[#211612]">{showVal(item.name)}</span>
                    <span className="text-[#3D2C24]/70 block text-[11px]">
                      Size: {showVal(item.size)} • Qty: {item.quantity ?? 1} × ₹{item.price ?? 0}
                    </span>
                  </div>
                  <span className="font-bold text-[#211612] shrink-0">
                    ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Totals Breakdown */}
        <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#E8DEC8] text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#3D2C24]/80">subtotal</span>
            <span className="font-semibold">₹{Number(order.subtotal) || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#3D2C24]/80">shipping</span>
            <span className="font-semibold">₹{Number(order.shipping) || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#3D2C24]/80">
              discount {order.couponCode ? `(${order.couponCode})` : ""}
            </span>
            <span className="font-semibold">-₹{Number(order.discount) || 0}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#E8DEC8] text-sm font-bold text-[#211612]">
            <span>total</span>
            <span className="font-serif">₹{Number(order.total) || 0}</span>
          </div>
        </div>

        {/* Interactive Actions */}
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <select
              value={order.orderStatus || "New"}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              aria-label="Update order status"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF6EE] text-xs font-bold text-[#211612]"
            >
              <option value="New">Status: New</option>
              <option value="Packed">Status: Packed</option>
              <option value="Shipped">Status: Shipped</option>
              <option value="Delivered">Status: Delivered</option>
            </select>

            <button
              type="button"
              onClick={() => onOpenTracking(order)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-[#FAF6EE] hover:bg-[#EFE8DD] text-[#211612] border border-[#E8DEC8] font-bold text-xs flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4 text-[#A87B28]" />
              <span>Courier / Tracking</span>
            </button>
          </div>

          {order.paymentStatus !== "Paid" && (
            <button
              type="button"
              onClick={() => onMarkAsPaid(order.id)}
              className="w-full min-h-[44px] py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Mark Payment as Paid</span>
            </button>
          )}

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] py-3 px-6 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp Customer</span>
          </a>
        </div>
      </div>
    </div>
  );
}

interface CourierTrackingModalProps {
  order: Order;
  onClose: () => void;
  onSave: (orderId: string, trackingNumber: string, courierName: string) => Promise<void>;
}

export function CourierTrackingModal({ order, onClose, onSave }: CourierTrackingModalProps) {
  const [courierName, setCourierName] = useState(order.courierName || "BlueDart Express");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCourierName(order.courierName || "BlueDart Express");
    setTrackingNumber(order.trackingNumber || "");
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(order.id, trackingNumber.trim(), courierName.trim() || "BlueDart Express");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C130E]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-xl max-w-md w-full p-5 sm:p-6 space-y-4 border border-[#E8DEC8] shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-500 hover:text-[#211612]"
          aria-label="Close tracking dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A87B28]">
            Dispatch Consignment
          </span>
          <h3 className="font-serif text-xl font-bold text-[#211612]">
            Courier & Tracking (#{showVal(order.orderNumber)})
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-[#211612] block">Courier Partner</label>
            <input
              type="text"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="BlueDart Express, Delhivery, India Post..."
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-[#211612] block">AWB / Tracking Number</label>
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking code"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#E8DEC8] bg-[#FAF6EE] text-[#211612] font-mono"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-lg border border-[#E8DEC8] text-stone-600 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-lg bg-[#211612] hover:bg-[#1C130E] text-[#FAF6EE] font-bold disabled:opacity-50"
            >
              {saving ? "Saving..." : "Mark Shipped"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ConfirmDeleteModalProps {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDeleteModal({
  title,
  message,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C130E]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-xl max-w-sm w-full p-5 sm:p-6 space-y-4 border border-[#E8DEC8] shadow-2xl">
        <div className="flex items-center gap-2.5 text-red-700">
          <Trash2 className="w-5 h-5 shrink-0" />
          <h3 className="font-serif text-lg font-bold">{title}</h3>
        </div>
        <p className="text-xs text-[#3D2C24] leading-relaxed">{message}</p>
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-lg border border-[#E8DEC8] text-stone-700 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleConfirm}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50"
          >
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

