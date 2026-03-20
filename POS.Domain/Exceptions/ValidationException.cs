namespace POS.Domain.Exceptions;

/// <summary>
/// Thrown when input validation fails.
/// </summary>
public class ValidationException : Exception
{
    public ValidationException(string message) : base(message)
    {
    }
}
