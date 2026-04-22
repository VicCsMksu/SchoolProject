// Maps a session value string to its end hour (24h)
const SESSION_END_HOURS: Record<string, number> = {
  "8:00 AM – 10:00 AM": 10,
  "10:00 AM – 12:00 PM": 12,
  "2:00 PM – 4:00 PM": 16,
  "4:00 PM – 6:00 PM": 18,
};

// Returns true if the appointment session has ended
export function isSessionPast(
  appointmentDate: string,
  appointmentTime: string,
): boolean {
  const endHour = SESSION_END_HOURS[appointmentTime];
  if (!endHour || !appointmentDate) return false;

  const now = new Date();
  const sessionEnd = new Date(appointmentDate);
  // Use local noon as date anchor to avoid timezone day-shift issues
  sessionEnd.setHours(endHour, 0, 0, 0);

  return now > sessionEnd;
}

// Returns the derived display status for the patient side
export function getDerivedStatus(
  status: string,
  appointmentDate: string,
  appointmentTime: string,
): string {
  if (status === "Cancelled") return "Cancelled";
  if (status === "Approved" && isSessionPast(appointmentDate, appointmentTime)) {
    return "Completed";
  }
  if (status === "Rescheduled" && isSessionPast(appointmentDate, appointmentTime)) {
    return "Completed";
  }
  return status;
}

// Returns the derived status for the admin side
export function getAdminDerivedStatus(
  status: string,
  appointmentDate: string,
  appointmentTime: string,
): string {
  if (status === "Cancelled") return "Cancelled";
  if (
    status === "Approved" &&
    isSessionPast(appointmentDate, appointmentTime)
  ) {
    return "Completed";
  }
  return status;
}
