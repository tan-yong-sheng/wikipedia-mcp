# Wikipedia MCP Server

A Model Context Protocol (MCP) server for searching and retrieving Wikipedia articles using TypeScript.

## Quick Start

Make sure to set up your environment variables first:
- `WIKIPEDIA_USER_AGENT` (optional, default: `Wikipedia-MCP/1.0 (https://github.com/user/wikipedia-mcp; contact@example.com)`)
- `WIKIPEDIA_LANGUAGE` (optional, default: 'en')
- `WIKIPEDIA_REQUEST_DELAY` (optional, default: 1000ms)
- `WIKIPEDIA_TIMEOUT` (optional, default: 30000ms)

## Installation

### 1. Using with Claude Desktop

Add the server config to your Claude Desktop configuration file:

#### For NPX Installation from GitHub (on Windows)

```json
"wikipedia-mcp": {
  "command": "cmd",
  "args": [
    "/k",
    "npx",
    "-y",
    "@tan-yong-sheng/wikipedia-mcp"
  ],
  "env": {
    "WIKIPEDIA_USER_AGENT": "MyApp/1.0 (https://mywebsite.com; me@mywebsite.com)",
    "WIKIPEDIA_LANGUAGE": "en",
    "WIKIPEDIA_REQUEST_DELAY": "1000"
  }
}
```

#### For NPX Installation from GitHub (on Linux/macOS)

```json
"wikipedia-mcp": {
  "command": "npx",
  "args": [
    "-y",
    "@tan-yong-sheng/wikipedia-mcp"
  ],
  "env": {
    "WIKIPEDIA_USER_AGENT": "MyApp/1.0 (https://mywebsite.com; me@mywebsite.com)",
    "WIKIPEDIA_LANGUAGE": "en",
    "WIKIPEDIA_REQUEST_DELAY": "1000"
  }
}
```

#### For Development (on Windows/Linux/macOS)

```bash
cd /path/to/wikipedia-mcp
npm run build
```

```json
"wikipedia-mcp": {
  "command": "node",
  "args": [
    "/path/to/wikipedia-mcp/dist/index.js"
  ],
  "env": {
    "WIKIPEDIA_USER_AGENT": "MyApp/1.0 (https://mywebsite.com; me@mywebsite.com)",
    "WIKIPEDIA_LANGUAGE": "en",
    "WIKIPEDIA_REQUEST_DELAY": "1000",
    "WIKIPEDIA_TIMEOUT": "30000"
  }
}
```

Location of the configuration file:
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`
- MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Source**: This server uses the [MediaWiki Action API](https://www.mediawiki.org/wiki/API:Action_API)

## Available Tools

The server provides the following tools for Wikipedia research:

### Search Tools

- `search_wikipedia` - Search Wikipedia articles with customizable result limits
  - Find articles by keyword, topic, or phrase
  - Parameters: query (string), limit (number, optional, default: 10)
  - Returns: Article titles, snippets, page IDs, word counts, sizes, timestamps, and URLs

### Content Retrieval Tools

- `get_summary` - Get concise page summaries with metadata
  - Retrieve article introductions with images and coordinates
  - Parameters: title (string)
  - Returns: Extract, thumbnail image, page ID, URL, and geographic coordinates (if available)

- `get_article` - Get full article content
  - Access complete Wikipedia article text
  - Parameters: title (string)
  - Returns: Full article content with page ID and metadata

### Navigation Tools

- `get_sections` - Get page section outline/table of contents
  - Discover article structure and organization
  - Parameters: title (string)
  - Returns: Hierarchical section listing with numbers and titles

- `get_links` - Get links from page to other Wikipedia articles
  - Explore related articles and references
  - Parameters: title (string)
  - Returns: List of linked Wikipedia articles with URLs

### Discovery Tools

- `get_related_topics` - Get related links and categories from a page with summaries
  - Find topics related to a Wikipedia page through its links and categories
  - Parameters: title (string), limit (number, optional, default: 10)
  - Returns: Related links with summaries and categories, up to specified limit

## Example Queries

### Research & Discovery
- "Search for articles about 'machine learning' and show me the top 5 results"
- "Get a summary of the 'Artificial Intelligence' Wikipedia page"
- "Show me the table of contents for the 'Climate Change' article"
- "Find all the links from the 'Python programming language' page"
- "Get related topics for 'anwar ibrahim' with summaries"

### Content Access
- "Get the full content of the 'Quantum Computing' Wikipedia article"
- "Search for 'renewable energy' and get summaries of the first 3 results"
- "Show me the structure of the 'World War II' article"

### Case-Insensitive Access
- "Get summary for 'anwar ibrahim'" (automatically finds 'Anwar Ibrahim')
- "Get article content for 'quantum computing'" (automatically finds correct capitalization)
- "Get sections for 'climate change'" (works with any case variation)
- "Get links from 'python programming language'" (handles case sensitivity)
- Works with any title variations - the server uses search fallback for exact matches

### Multilingual Research
- "Search French Wikipedia for 'intelligence artificielle'" (set WIKIPEDIA_LANGUAGE=fr)
- "Get the Spanish summary for 'cambio climático'" (set WIKIPEDIA_LANGUAGE=es)

## Configuration

Configure the server using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `WIKIPEDIA_USER_AGENT` | `Wikipedia-MCP/1.0 (https://github.com/tan-yong-sheng/wikipedia-mcp; contact@example.com)` | User agent for API requests |
| `WIKIPEDIA_LANGUAGE` | `en` | Wikipedia language edition (en, es, fr, de, etc.) |
| `WIKIPEDIA_REQUEST_DELAY` | `1000` | Delay between requests in milliseconds |
| `WIKIPEDIA_TIMEOUT` | `30000` | Request timeout in milliseconds |

### Example Configuration

```bash
export WIKIPEDIA_USER_AGENT="MyApp/1.0 (https://mywebsite.com; me@mywebsite.com)"
export WIKIPEDIA_LANGUAGE="en"
export WIKIPEDIA_REQUEST_DELAY="1500"
```

## Features

- **Search Wikipedia**: Search for articles with customizable result limits
- **Get Page Summary**: Retrieve concise summaries of Wikipedia pages  
- **Get Full Content**: Access complete article content
- **Get Page Sections**: Get section outline/table of contents
- **Get Page Links**: Get links from pages to other Wikipedia articles
- **Get Related Topics**: Get related links and categories with summaries
- **Case-Insensitive Access**: Automatic fallback to search API for title variations
- **Rate Limiting**: Built-in request throttling to respect Wikipedia's API limits
- **Configurable**: Environment variable support for customization
- **Multilingual**: Support for all Wikipedia language editions

## API Reference

This server uses the MediaWiki Action API exclusively (`/w/api.php`):
- **Search**: `action=query&list=search` for article search
- **Summary**: `action=query&prop=extracts|pageimages|coordinates` for page summaries
- **Content**: `action=query&prop=extracts` for full article content  
- **Sections**: `action=parse&prop=sections` for page section outline
- **Links**: `action=query&prop=links` for page links
- **Related Topics**: `action=query&prop=links|categories` for related content

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

## Development

If you want to contribute or modify the server:

```bash
# Clone the repository
git clone https://github.com/tan-yong-sheng/wikipedia-mcp.git

# Install dependencies
npm install

# Build the server
npm run build

# For development with auto-rebuild
npm run watch

# Clean build directory
npm run clean

# Development mode
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

MIT