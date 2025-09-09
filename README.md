# Wikipedia MCP Server

A Model Context Protocol (MCP) server for searching and retrieving Wikipedia articles using TypeScript.

## Source
- MediaWiki Action API: https://www.mediawiki.org/wiki/API:Action_API

## Features

- **Search Wikipedia**: Search for articles with customizable result limits
- **Get Page Summary**: Retrieve concise summaries of Wikipedia pages  
- **Get Full Content**: Access complete article content
- **Get Page Sections**: Get section outline/table of contents
- **Get Page Links**: Get links from pages to other Wikipedia articles
- **Rate Limiting**: Built-in request throttling to respect Wikipedia's API limits
- **Configurable**: Environment variable support for customization

## Installation

```bash
npm install
npm run build
```

## Configuration

Configure the server using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `WIKIPEDIA_USER_AGENT` | `Wikipedia-MCP/1.0 (https://github.com/user/wikipedia-mcp; contact@example.com)` | User agent for API requests |
| `WIKIPEDIA_LANGUAGE` | `en` | Wikipedia language edition (en, es, fr, de, etc.) |
| `WIKIPEDIA_REQUEST_DELAY` | `1000` | Delay between requests in milliseconds |
| `WIKIPEDIA_TIMEOUT` | `30000` | Request timeout in milliseconds |

### Example Configuration

```bash
export WIKIPEDIA_USER_AGENT="MyApp/1.0 (https://mywebsite.com; me@mywebsite.com)"
export WIKIPEDIA_LANGUAGE="en"
export WIKIPEDIA_REQUEST_DELAY="1500"
```

## Usage

### As MCP Server

```bash
npm start
```

### Available Tools

1. **search_wikipedia**
   - Search Wikipedia articles
   - Parameters: `query` (string), `limit` (number, optional, default: 10)

2. **get_summary**
   - Get page summary with basic information
   - Parameters: `title` (string)

3. **get_article**
   - Get full article content
   - Parameters: `title` (string)

4. **get_sections**
   - Get page section outline/table of contents
   - Parameters: `title` (string)

5. **get_links**
   - Get links from page to other Wikipedia articles
   - Parameters: `title` (string)

## Development

```bash
# Build and watch for changes
npm run watch

# Clean build directory
npm run clean

# Development mode
npm run dev
```

## API Reference

This server uses the MediaWiki Action API exclusively (`/w/api.php`):
- **Search**: `action=query&list=search` for article search
- **Summary**: `action=query&prop=extracts|pageimages|coordinates` for page summaries
- **Content**: `action=query&prop=extracts` for full article content  
- **Sections**: `action=parse&prop=sections` for page section outline
- **Links**: `action=query&prop=links` for page links

## Rate Limiting

The server implements automatic rate limiting to respect Wikipedia's API guidelines:
- Minimum 1-second delay between requests (configurable)
- Proper User-Agent headers
- Timeout handling

## Error Handling

The server provides detailed error messages for common issues:
- Network timeouts
- Invalid page titles
- API rate limiting
- Server errors

## License

MIT