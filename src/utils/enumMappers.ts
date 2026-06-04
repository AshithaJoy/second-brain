export function mapPostTypeToBackend(type: string): string {
  return type.toUpperCase();
}

export function mapPostTypeToFrontend(type: string): string {
  return type.toUpperCase();
}

export function mapPostStatusToBackend(status: string): string {
  return status.toUpperCase();
}

export function mapPostStatusToFrontend(status: string): string {
  return status.toUpperCase();
}

export function mapCollabStatusToBackend(status: string): string {
  const map: Record<string, string> = {
    "dream brand": "DREAM_BRAND",
    "reached out": "REACHED_OUT",
    "replied": "REPLIED",
    "discussing": "DISCUSSING",
    "booked": "BOOKED",
    "completed": "COMPLETED",
    "ghosted 😭": "GHOSTED"
  };
  return map[status] || "DREAM_BRAND";
}

export function mapCollabStatusToFrontend(status: string): string {
  const map: Record<string, string> = {
    "DREAM_BRAND": "dream brand",
    "REACHED_OUT": "reached out",
    "REPLIED": "replied",
    "DISCUSSING": "discussing",
    "BOOKED": "booked",
    "COMPLETED": "completed",
    "GHOSTED": "ghosted 😭"
  };
  return map[status] || "dream brand";
}

export function mapPaymentStatusToBackend(status: string): string {
  const map: Record<string, string> = {
    "unpaid": "UNPAID",
    "invoice sent": "INVOICE_SENT",
    "paid": "PAID"
  };
  return map[status] || "UNPAID";
}

export function mapPaymentStatusToFrontend(status: string): string {
  const map: Record<string, string> = {
    "UNPAID": "unpaid",
    "INVOICE_SENT": "invoice sent",
    "PAID": "paid"
  };
  return map[status] || "unpaid";
}
