# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run build` - Clean build and compile TypeScript to dist/
- `npm run typecheck` - Type check without emitting files
- `npm run dev` - Build and run the server in development mode
- `npm run watch` - Watch mode for continuous compilation during development
- `npm start` - Run the compiled server from dist/

### Testing and Validation
- `npm run test-build` - Run typecheck and build, confirm all checks pass
- `npm run quick-check` - Fast typecheck with skipLibCheck
- `npm run lint` - TypeScript compilation serves as linting (no separate linter)

### Utilities
- `npm run clean` - Remove dist/ directory
- `npm run verify` - No-op placeholder for verify step

## Architecture

This is a **Model Context Protocol (MCP) server** that provides Wikipedia search and content retrieval capabilities through 6 main tools:

### Core Components

**WikipediaServer Class** (`src/index.ts:15-120`)
- Handles rate limiting with configurable delays (default 1s between requests)
- Manages API configuration via environment variables
- Implements proper User-Agent headers and timeout handling
- Uses MediaWiki Action API exclusively for all operations
- Includes case-insensitive title search fallback using search API

**MCP Tools Registration** (`src/index.ts:131-353`)
- `search_wikipedia`: Search articles with query and optional limit
- `get_summary`: Get page summary with extract and metadata (with case-insensitive fallback)
- `get_article`: Retrieve full article content of pages (with case-insensitive fallback)
- `get_sections`: Get page section outline/table of contents (with case-insensitive fallback)
- `get_links`: Get links from page to other Wikipedia articles (with case-insensitive fallback)
- `get_related_topics`: Get related links and categories from a page with summaries (with case-insensitive fallback)

### Configuration

Environment variables for customization:
- `WIKIPEDIA_USER_AGENT`: Custom user agent (default includes contact info)
- `WIKIPEDIA_LANGUAGE`: Wikipedia language edition (default: "en")
- `WIKIPEDIA_REQUEST_DELAY`: Rate limiting delay in ms (default: 1000)
- `WIKIPEDIA_TIMEOUT`: Request timeout in ms (default: 30000)

### API Integration

The server uses the **MediaWiki Action API** exclusively (`/w/api.php`) for all operations:
- **Search**: `action=query&list=search` for article search
- **Summary**: `action=query&prop=extracts|pageimages|coordinates` for page summaries  
- **Content**: `action=query&prop=extracts` for full article content
- **Sections**: `action=parse&prop=sections` for page section outline
- **Links**: `action=query&prop=links` for page links
- **Related Topics**: `action=query&prop=links|categories` for related links and categories

Rate limiting is automatically enforced to respect Wikipedia's guidelines with configurable delays between requests.

## Case Sensitivity Handling

The server now handles case sensitivity issues automatically:
- If a direct title lookup fails, it uses the search API to find the correct title
- This resolves issues with variations like 'anwar ibrahim' vs 'Anwar Ibrahim'
- Applies to `get_summary`, `get_article`, `get_sections`, `get_links`, and `get_related_topics` functions

## Important Notes

- This is an **ES Module** project (`"type": "module"` in package.json)
- Strict TypeScript configuration with comprehensive error checking
- No separate testing framework configured
- Uses `@modelcontextprotocol/sdk` for MCP server implementation
- Built for Node.js 18+ with proper shebang for CLI usage