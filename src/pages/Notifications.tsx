const Notifications = () => {
  return (
    <div className="px-5 pt-8">
      <h1 className="text-xl font-bold text-primary">Notifications</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Stay updated with the latest alerts about your appointments, test results, and reminders.
      </p>

      <div className="flex flex-col items-center justify-center py-20">
        <h3 className="mb-1 text-base font-bold text-primary">No notifications</h3>
        <p className="text-center text-xs text-muted-foreground">
          You have no notifications at the moment.
        </p>
      </div>
    </div>
  );
};

export default Notifications;
