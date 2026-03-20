namespace POS.Repository.Utils;

/// <summary>
/// Pagination parameters for list queries.
/// </summary>
public class PageFilter
{
    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 20;
}
