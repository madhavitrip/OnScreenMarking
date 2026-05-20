using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using API.Data;
using API.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace API.Middleware
{
    public class LoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<LoggingMiddleware> _logger;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger, IServiceScopeFactory serviceScopeFactory)
        {
            _next = next;
            _logger = logger;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only log POST, PUT, PATCH requests
            if (!ShouldLogRequest(context.Request.Method))
            {
                await _next(context);
                return;
            }

            // Special handling for Login endpoint (no token required)
            bool isLoginEndpoint = context.Request.Path.StartsWithSegments("/api/auth/login", StringComparison.OrdinalIgnoreCase);

            // Get user ID from Bearer token (not required for login)
            var userId = GetUserIdFromToken(context);

            // For non-login endpoints, skip logging if no token
            if (!isLoginEndpoint && userId == null)
            {
                await _next(context);
                return;
            }

            // Capture request body for logging
            var originalBodyStream = context.Response.Body;
            var requestBody = await ReadRequestBodyAsync(context.Request);

            try
            {
                // Create a new memory stream for the response
                using var responseBody = new MemoryStream();
                context.Response.Body = responseBody;

                // Continue to the next middleware
                await _next(context);

                // Read response body
                var responseBodyText = await ReadResponseBodyAsync(responseBody);

                // For login endpoint, extract userId from response
                if (isLoginEndpoint && userId == null)
                {
                    userId = ExtractUserIdFromLoginResponse(responseBodyText);
                }

                // Log successful event (only if we have a userId)
                if (userId.HasValue)
                {
                    await LogEventAsync(context, userId.Value, requestBody, responseBodyText, context.Response.StatusCode, isLoginEndpoint);
                }

                // Copy the response back to the original stream
                responseBody.Seek(0, SeekOrigin.Begin);
                await responseBody.CopyToAsync(originalBodyStream);
            }
            catch (Exception ex)
            {
                // Log error
                await LogErrorAsync(context, ex);

                // Restore the original response body stream
                context.Response.Body = originalBodyStream;
                throw;
            }
            finally
            {
                context.Response.Body = originalBodyStream;
            }
        }

        private static bool ShouldLogRequest(string method)
        {
            return method.Equals("POST", StringComparison.OrdinalIgnoreCase) ||
                   method.Equals("PUT", StringComparison.OrdinalIgnoreCase) ||
                   method.Equals("PATCH", StringComparison.OrdinalIgnoreCase);
        }

        private static int? GetUserIdFromToken(HttpContext context)
        {
            try
            {
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (authHeader == null || !authHeader.StartsWith("Bearer "))
                    return null;

                var token = authHeader.Substring("Bearer ".Length).Trim();
                var handler = new JwtSecurityTokenHandler();

                if (!handler.CanReadToken(token))
                    return null;

                var jsonToken = handler.ReadJwtToken(token);

                // Try to get user ID from different possible claim types
                var userIdClaim = jsonToken.Claims.FirstOrDefault(c =>
                    c.Type == ClaimTypes.NameIdentifier ||
                    c.Type == "sub" ||
                    c.Type == "userId" ||
                    c.Type == "id" ||
                    c.Type == ClaimTypes.Name);

                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    return userId;
                }

                return null;
            }
            catch (Exception)
            {
                return null;
            }
        }

        private static async Task<string> ReadRequestBodyAsync(HttpRequest request)
        {
            try
            {
                request.EnableBuffering();
                var buffer = new byte[Convert.ToInt32(request.ContentLength ?? 0)];
                await request.Body.ReadAsync(buffer, 0, buffer.Length);
                var bodyAsText = Encoding.UTF8.GetString(buffer);
                request.Body.Position = 0;
                return bodyAsText;
            }
            catch
            {
                return string.Empty;
            }
        }

        private static async Task<string> ReadResponseBodyAsync(MemoryStream responseBody)
        {
            try
            {
                responseBody.Seek(0, SeekOrigin.Begin);
                var responseBodyText = await new StreamReader(responseBody).ReadToEndAsync();
                responseBody.Seek(0, SeekOrigin.Begin);
                return responseBodyText;
            }
            catch
            {
                return string.Empty;
            }
        }

        private async Task LogEventAsync(HttpContext context, int userId, string requestBody, string responseBody, int statusCode, bool isLoginEndpoint = false)
        {
            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var loggingService = scope.ServiceProvider.GetRequiredService<ILoggingService>();

                var controllerName = GetControllerName(context);
                var actionName = GetActionName(context);
                var method = context.Request.Method;
                var path = context.Request.Path;
                var eventMessage = $"{method} {path} - {controllerName}.{actionName}";

                // For successful requests, log the event
                if (statusCode >= 200 && statusCode < 300)
                {
                    string oldValue = null;
                    string newValue = null;

                    if (isLoginEndpoint)
                    {
                        oldValue = null;
                        newValue = SanitizeRequestBody(requestBody);
                    }
                    else if (method.Equals("POST", StringComparison.OrdinalIgnoreCase))
                    {
                        oldValue = null;
                        newValue = SanitizeRequestBody(responseBody);
                    }
                    else if (method.Equals("PUT", StringComparison.OrdinalIgnoreCase) ||
                             method.Equals("PATCH", StringComparison.OrdinalIgnoreCase))
                    {
                        oldValue = await GetOldValueFromDatabase(context, controllerName);
                        newValue = SanitizeRequestBody(requestBody);
                    }

                    loggingService.LogEvent(
                        message: eventMessage,
                        category: controllerName,
                        triggeredBy: userId,
                        oldValue: oldValue,
                        newValue: newValue);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log event for user {UserId}", userId);
            }
        }

        private async Task LogErrorAsync(HttpContext context, Exception exception)
        {
            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var loggingService = scope.ServiceProvider.GetRequiredService<ILoggingService>();

                var controllerName = GetControllerName(context);
                var actionName = GetActionName(context);
                var method = context.Request.Method;
                var path = context.Request.Path;
                var errorLocation = $"{controllerName}.{actionName}";
                var errorMessage = $"{method} {path} - {exception.Message}";

                loggingService.LogError(
                    error: exception.GetType().Name,
                    errorMessage: errorMessage,
                    controller: errorLocation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log error");
            }
        }

        private static string GetControllerName(HttpContext context)
        {
            try
            {
                var routeData = context.GetRouteData();
                return routeData?.Values["controller"]?.ToString() ?? "Unknown";
            }
            catch
            {
                return "Unknown";
            }
        }

        private static string GetActionName(HttpContext context)
        {
            try
            {
                var routeData = context.GetRouteData();
                return routeData?.Values["action"]?.ToString() ?? "Unknown";
            }
            catch
            {
                return "Unknown";
            }
        }

        private static string SanitizeRequestBody(string requestBody)
        {
            try
            {
                if (string.IsNullOrEmpty(requestBody))
                    return null;

                // Limit the size of logged request body
                if (requestBody.Length > 1000)
                {
                    requestBody = requestBody.Substring(0, 1000) + "... [truncated]";
                }

                // Try to parse as JSON and remove sensitive fields
                try
                {
                    var jsonDoc = JsonDocument.Parse(requestBody);
                    var sanitized = SanitizeJsonElement(jsonDoc.RootElement);
                    return JsonSerializer.Serialize(sanitized);
                }
                catch
                {
                    return requestBody;
                }
            }
            catch
            {
                return "[Error reading request body]";
            }
        }

        private static object SanitizeJsonElement(JsonElement element)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Object:
                    var obj = new Dictionary<string, object>();
                    foreach (var property in element.EnumerateObject())
                    {
                        if (IsSensitiveField(property.Name))
                        {
                            obj[property.Name] = "[HIDDEN]";
                        }
                        else
                        {
                            obj[property.Name] = SanitizeJsonElement(property.Value);
                        }
                    }
                    return obj;

                case JsonValueKind.Array:
                    return element.EnumerateArray().Select(SanitizeJsonElement).ToArray();

                case JsonValueKind.String:
                    return element.GetString();

                case JsonValueKind.Number:
                    return element.TryGetInt32(out int intValue) ? intValue : element.GetDouble();

                case JsonValueKind.True:
                case JsonValueKind.False:
                    return element.GetBoolean();

                case JsonValueKind.Null:
                    return null;

                default:
                    return element.ToString();
            }
        }

        private static bool IsSensitiveField(string fieldName)
        {
            var sensitiveFields = new[]
            {
                "password", "pwd", "pass", "secret", "token", "key", "auth",
                "temppassword", "permpassword", "hashedotp", "otp", "autogeneratedpassword"
            };

            return sensitiveFields.Any(field =>
                fieldName.Contains(field, StringComparison.OrdinalIgnoreCase));
        }

        private static int? ExtractUserIdFromLoginResponse(string responseBody)
        {
            try
            {
                if (string.IsNullOrEmpty(responseBody))
                    return null;

                var jsonDoc = JsonDocument.Parse(responseBody);

                if (jsonDoc.RootElement.TryGetProperty("user", out JsonElement userElement))
                {
                    if (userElement.TryGetProperty("id", out JsonElement idElement) ||
                        userElement.TryGetProperty("Id", out idElement))
                    {
                        if (idElement.TryGetInt32(out int userId))
                        {
                            return userId;
                        }
                    }
                }

                return null;
            }
            catch
            {
                return null;
            }
        }

        private async Task<string> GetOldValueFromDatabase(HttpContext context, string controllerName)
        {
            try
            {
                var pathSegments = context.Request.Path.Value?.Split('/', StringSplitOptions.RemoveEmptyEntries);
                if (pathSegments == null || pathSegments.Length < 3)
                    return null;

                int id = 0;
                bool idFound = false;

                for (int i = pathSegments.Length - 1; i >= 0; i--)
                {
                    if (int.TryParse(pathSegments[i], out id))
                    {
                        idFound = true;
                        break;
                    }
                }

                if (!idFound)
                    return null;

                using var scope = _serviceScopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                // Map controller names to their corresponding entities
                var normalizedControllerName = controllerName.ToLowerInvariant();

                object entity = normalizedControllerName switch
                {
                    "user" => await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id),
                    "paper" => await dbContext.Papers.AsNoTracking().FirstOrDefaultAsync(x => x.PaperId == id),
                    "script" => await dbContext.Scripts.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id),
                    "marking" => await dbContext.Markings.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id),
                    _ => null
                };

                if (entity == null)
                    return null;

                var options = new JsonSerializerOptions
                {
                    WriteIndented = false,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
                };

                var serializedEntity = JsonSerializer.Serialize(entity, options);
                return SanitizeRequestBody(serializedEntity);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to get old value from database for controller {ControllerName}", controllerName);
                return null;
            }
        }
    }
}
