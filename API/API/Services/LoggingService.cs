using API.Data;
using API.Models;

namespace API.Services
{
    public interface ILoggingService
    {
        void LogEvent(string message, string category, int triggeredBy, string oldValue = null, string newValue = null);
        void LogError(string error, string errorMessage, string controller);
    }

    public class LoggingService : ILoggingService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LoggingService> _logger;

        public LoggingService(ApplicationDbContext context, ILogger<LoggingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public void LogEvent(string message, string category, int triggeredBy, string oldValue = null, string newValue = null)
        {
            try
            {
                var eventLog = new EventLog
                {
                    Event = message ?? string.Empty,
                    Category = category ?? string.Empty,
                    EventTriggeredBy = triggeredBy,
                    OldValue = oldValue ?? string.Empty,
                    NewValue = newValue ?? string.Empty,
                    LoggedAt = TimeZoneInfo.ConvertTime(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("India Standard Time"))
                };

                _context.EventLogs.Add(eventLog);
                _context.SaveChanges();

                _logger.LogInformation("Event logged: {Message} by user {TriggeredBy}", message, triggeredBy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log event: {Message}", message);
            }
        }

        public void LogError(string error, string errorMessage, string controller)
        {
            try
            {
                var errorLog = new ErrorLog
                {
                    Error = error,
                    Message = errorMessage,
                    OccuranceSpace = controller,
                    LoggedAt = TimeZoneInfo.ConvertTime(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("India Standard Time"))
                };

                _context.ErrorLogs.Add(errorLog);
                _context.SaveChanges();

                _logger.LogError("Error logged: {Error} in {Controller}", error, controller);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log error: {Error}", error);
            }
        }
    }
}
