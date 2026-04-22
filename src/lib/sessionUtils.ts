const SESSION_END_HOURS: Record<string, number> = {
  "8:00 AM – 10:00 AM": 10,
  "10:00 AM – 12:00 PM": 12,
  "2:00 PM – 4:00 PM": 16,
  "4:00 PM – 6:00 PM": 18,
};

export function isSessionPast(
  appointmentDate: string,
  appointmentTime: string,
): boolean {
  const endHour = SESSION_END_HOURS[appointmentTime];
  if (!endHour || !appointmentDate) return false;
  const now = new Date();
  const sessionEnd = new Date(appointmentDate);
  sessionEnd.setHours(endHour, 0, 0, 0);
  return now > sessionEnd;
}

export function getDerivedStatus(
  status: string,
  appointmentDate: string,
  appointmentTime: string,
): string {
  if (status === "Cancelled") return "Cancelled";
  if (status === "Pending Reschedule") return "Pending Reschedule";
  if (status === "Reschedule Offered") return "Reschedule Offered";
  if (
    (status === "Approved" || status === "Rescheduled") &&
    isSessionPast(appointmentDate, appointmentTime)
  )
    return "Completed";
  return status;
}

export function getAdminDerivedStatus(
  status: string,
  appointmentDate: string,
  appointmentTime: string,
): string {
  if (status === "Cancelled") return "Cancelled";
  if (status === "Pending Reschedule") return "Pending Reschedule";
  if (status === "Reschedule Offered") return "Reschedule Offered";
  if (
    (status === "Approved" || status === "Rescheduled") &&
    isSessionPast(appointmentDate, appointmentTime)
  )
    return "Completed";
  return status;
}
