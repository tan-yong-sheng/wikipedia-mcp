#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

interface WikipediaConfig {
  userAgent: string;
  language: string;
  requestDelay: number;
  timeout: number;
}

class WikipediaServer {
  private config: WikipediaConfig;
  private lastRequestTime: number = 0;

  constructor() {
    this.config = {
      userAgent: process.env.WIKIPEDIA_USER_AGENT || 
        "Wikipedia-MCP/1.0 (https://github.com/user/wikipedia-mcp; contact@example.com)",
      language: process.env.WIKIPEDIA_LANGUAGE || "en",
      requestDelay: parseFloat(process.env.WIKIPEDIA_REQUEST_DELAY || "1000"),
      timeout: parseInt(process.env.WIKIPEDIA_TIMEOUT || "30000")
    };
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.config.requestDelay) {
      const delay = this.config.requestDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  async searchWikipedia(query: string, limit: number = 10): Promise<any> {
    await this.rateLimit();
    const url = `https://${this.config.language}.wikipedia.org/w/api.php`;
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: limit.toString(),
      format: 'json'
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`Wikipedia API error: ${data.error.info}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Wikipedia search failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async findCorrectTitle(title: string): Promise<string | null> {
    const searchResults = await this.searchWikipedia(title, 1);
    if (searchResults.query && searchResults.query.search && searchResults.query.search.length > 0) {
      return searchResults.query.search[0].title;
    }
    return null;
  }

  async getPageSummary(title: string): Promise<any> {
    await this.rateLimit();
    const url = `https://${this.config.language}.wikipedia.org/w/api.php`;
    const params = new URLSearchParams({
      action: 'query',
      prop: 'extracts|pageimages|coordinates',
      titles: title,
      exintro: 'true',
      explaintext: 'true',
      piprop: 'thumbnail',
      pithumbsize: '300',
      redirects: 'true',
      format: 'json'
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`Wikipedia API error: ${data.error.info}`);
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to get page summary: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPageContent(title: string): Promise<any> {
    await this.rateLimit();
    const url = `https://${this.config.language}.wikipedia.org/w/api.php`;
    const params = new URLSearchParams({
      action: 'query',
      prop: 'extracts',
      titles: title,
      exintro: 'false',
      explaintext: 'true',
      redirects: 'true',
      format: 'json'
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`Wikipedia API error: ${data.error.info}`);
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to get page content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPageSections(title: string): Promise<any> {
    await this.rateLimit();
    const url = `https://${this.config.language}.wikipedia.org/w/api.php`;
    const params = new URLSearchParams({
      action: 'parse',
      page: title,
      prop: 'sections',
      format: 'json'
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        // Don't throw here - let the MCP handler deal with it for fallback
        return data;
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to get page sections: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getPageLinks(title: string): Promise<any> {
    await this.rateLimit();
    const url = `https://${this.config.language}.wikipedia.org/w/api.php`;
    const params = new URLSearchParams({
      action: 'query',
      prop: 'links',
      titles: title,
      pllimit: '500',
      redirects: 'true',
      format: 'json'
    });

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`Wikipedia API error: ${data.error.info}`);
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to get page links: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getRelatedTopics(title: string): Promise<any> {
    await this.rateLimit();
    const url = `https://${this.config.language}.wikipedia.org/w/api.php`;
    
    try {
      // First get the page links and categories
      const linksParams = new URLSearchParams({
        action: 'query',
        prop: 'links|categories',
        titles: title,
        pllimit: '500',
        cllimit: '500',
        redirects: 'true',
        format: 'json'
      });

      const response = await fetch(`${url}?${linksParams.toString()}`, {
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`Wikipedia API error: ${data.error.info}`);
      }
      
      return data;
    } catch (error) {
      throw new Error(`Failed to get related topics: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

}

const wikipediaServer = new WikipediaServer();

const server = new McpServer({
  name: "wikipedia-server",
  version: "1.0.0",
  description: "MCP server for searching and retrieving Wikipedia articles"
});

// Search Wikipedia tool
server.registerTool(
  "search_wikipedia",
  {
    title: "Search Wikipedia",
    description: "Search Wikipedia articles and return a list of matching pages",
    inputSchema: {
      query: z.string().describe("The search query"),
      limit: z.number().optional().default(10).describe("Maximum number of results (default: 10)")
    }
  },
  async ({ query, limit }) => {
    try {
      const results = await wikipediaServer.searchWikipedia(query, limit);
      
      if (!results.query || !results.query.search || results.query.search.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No Wikipedia articles found for "${query}". Try a different search term or check the spelling.`
            }
          ]
        };
      }

      let response = `# Wikipedia Search Results for "${query}"\n\n`;
      response += `Found ${results.query.search.length} results:\n\n`;
      
      for (const page of results.query.search) {
        response += `## ${page.title}\n`;
        if (page.snippet) {
          response += `**Snippet:** ${page.snippet.replace(/<[^>]*>/g, '')}` + "\n";
        }
        response += `**Page ID:** ${page.pageid}\n`;
        response += `**Word Count:** ${page.wordcount}\n`;
        response += `**Size:** ${page.size} bytes\n`;
        response += `**Last Modified:** ${new Date(page.timestamp).toLocaleDateString()}\n`;
        response += `**URL:** https://${wikipediaServer['config'].language}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}\n\n`;
      }

      return {
        content: [
          {
            type: "text",
            text: response
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching Wikipedia: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Get Wikipedia page summary tool
server.registerTool(
  "get_summary",
  {
    title: "Get Wikipedia Page Summary",
    description: "Get a summary of a specific Wikipedia page",
    inputSchema: {
      title: z.string().describe("The title of the Wikipedia page")
    }
  },
  async ({ title }) => {
    try {
      let summaryData = await wikipediaServer.getPageSummary(title);
      
      // If not found, try searching for correct title
      if (!summaryData.query || !summaryData.query.pages || Object.values(summaryData.query.pages)[0]?.hasOwnProperty('missing')) {
        const correctTitle = await wikipediaServer['findCorrectTitle'](title);
        if (correctTitle) {
          summaryData = await wikipediaServer.getPageSummary(correctTitle);
          title = correctTitle; // Use correct title for response
        }
      }
      
      if (!summaryData.query || !summaryData.query.pages) {
        return {
          content: [
            {
              type: "text",
              text: `No page found for "${title}".`
            }
          ]
        };
      }

      const pages = Object.values(summaryData.query.pages) as any[];
      const page = pages[0];
      
      if (page.missing) {
        return {
          content: [
            {
              type: "text",
              text: `Page "${title}" does not exist.`
            }
          ]
        };
      }

      let response = `# ${page.title}\n\n`;
      
      if (page.thumbnail) {
        response += `![${page.title}](${page.thumbnail.source})\n\n`;
      }
      
      response += `## Summary\n`;
      if (page.extract) {
        response += `${page.extract}\n\n`;
      }
      
      response += `**Page ID:** ${page.pageid}\n`;
      response += `**URL:** https://${wikipediaServer['config'].language}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}\n\n`;
      
      if (page.coordinates && page.coordinates.length > 0) {
        const coord = page.coordinates[0];
        response += `**Coordinates:** ${coord.lat}, ${coord.lon}\n`;
      }

      return {
        content: [
          {
            type: "text",
            text: response
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting Wikipedia page summary: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Get Wikipedia page content tool
server.registerTool(
  "get_article",
  {
    title: "Get Wikipedia Page Content",
    description: "Get the full article content of a specific Wikipedia page",
    inputSchema: {
      title: z.string().describe("The title of the Wikipedia page")
    }
  },
  async ({ title }) => {
    try {
      let contentData = await wikipediaServer.getPageContent(title);
      
      // If not found, try searching for correct title
      if (!contentData.query || !contentData.query.pages || Object.values(contentData.query.pages)[0]?.hasOwnProperty('missing')) {
        const correctTitle = await wikipediaServer['findCorrectTitle'](title);
        if (correctTitle) {
          contentData = await wikipediaServer.getPageContent(correctTitle);
          title = correctTitle; // Use correct title for response
        }
      }
      
      if (!contentData.query || !contentData.query.pages) {
        return {
          content: [
            {
              type: "text",
              text: `No page found for "${title}".`
            }
          ]
        };
      }

      const pages = Object.values(contentData.query.pages) as any[];
      const page = pages[0];
      
      if (page.missing) {
        return {
          content: [
            {
              type: "text",
              text: `Page "${title}" does not exist.`
            }
          ]
        };
      }

      if (!page.extract) {
        return {
          content: [
            {
              type: "text",
              text: `No content available for "${title}".`
            }
          ]
        };
      }

      let response = `# ${page.title}\n\n`;
      response += `**Page ID:** ${page.pageid}\n\n`;
      response += `## Full Article Content\n\n${page.extract}`;

      return {
        content: [
          {
            type: "text",
            text: response
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting Wikipedia page content: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Get Wikipedia page sections tool
server.registerTool(
  "get_sections",
  {
    title: "Get Wikipedia Page Sections",
    description: "Get the section outline/table of contents for a Wikipedia page",
    inputSchema: {
      title: z.string().describe("The title of the Wikipedia page")
    }
  },
  async ({ title }) => {
    try {
      let sections = await wikipediaServer.getPageSections(title);
      
      // If not found, try searching for correct title
      // The parse API returns different error structures than query API
      if (!sections.parse || sections.error) {
        const correctTitle = await wikipediaServer['findCorrectTitle'](title);
        if (correctTitle && correctTitle !== title) {
          sections = await wikipediaServer.getPageSections(correctTitle);
          title = correctTitle; // Use correct title for response
        }
      }
      
      if (!sections.parse || !sections.parse.sections) {
        return {
          content: [
            {
              type: "text",
              text: `No sections found for "${title}". The page may not exist or may not have sections.`
            }
          ]
        };
      }

      let response = `# Sections for "${title}"\n\n`;
      response += `Found ${sections.parse.sections.length} sections:\n\n`;
      
      for (const section of sections.parse.sections) {
        const indent = '  '.repeat(parseInt(section.level) - 1);
        response += `${indent}${section.number} ${section.line}\n`;
      }

      return {
        content: [
          {
            type: "text",
            text: response
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting Wikipedia page sections: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Get Wikipedia page links tool
server.registerTool(
  "get_links",
  {
    title: "Get Wikipedia Page Links",
    description: "Get links from a Wikipedia page to other Wikipedia articles",
    inputSchema: {
      title: z.string().describe("The title of the Wikipedia page")
    }
  },
  async ({ title }) => {
    try {
      let linksData = await wikipediaServer.getPageLinks(title);
      
      // If not found, try searching for correct title
      if (!linksData.query || !linksData.query.pages || Object.values(linksData.query.pages)[0]?.hasOwnProperty('missing')) {
        const correctTitle = await wikipediaServer['findCorrectTitle'](title);
        if (correctTitle) {
          linksData = await wikipediaServer.getPageLinks(correctTitle);
          title = correctTitle; // Use correct title for response
        }
      }
      
      if (!linksData.query || !linksData.query.pages) {
        return {
          content: [
            {
              type: "text",
              text: `No page found for "${title}".`
            }
          ]
        };
      }

      const pages = Object.values(linksData.query.pages) as any[];
      const page = pages[0];
      
      if (!page.links || page.links.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No links found on "${title}".`
            }
          ]
        };
      }

      let response = `# Links from "${title}"\n\n`;
      response += `Found ${page.links.length} links:\n\n`;
      
      for (const link of page.links) {
        response += `- [${link.title}](https://${wikipediaServer['config'].language}.wikipedia.org/wiki/${encodeURIComponent(link.title.replace(/ /g, '_'))})\n`;
      }

      return {
        content: [
          {
            type: "text",
            text: response
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting Wikipedia page links: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);

// Get related topics tool
server.registerTool(
  "get_related_topics",
  {
    title: "Get Related Topics",
    description: "Get related links and categories from a Wikipedia page",
    inputSchema: {
      title: z.string().describe("The title of the Wikipedia page"),
      limit: z.number().optional().default(10).describe("Maximum number of related topics (default: 10)")
    }
  },
  async ({ title, limit }) => {
    try {
      let relatedData = await wikipediaServer.getRelatedTopics(title);
      
      // If not found, try searching for correct title
      if (!relatedData.query || !relatedData.query.pages || Object.values(relatedData.query.pages)[0]?.hasOwnProperty('missing')) {
        const correctTitle = await wikipediaServer['findCorrectTitle'](title);
        if (correctTitle) {
          relatedData = await wikipediaServer.getRelatedTopics(correctTitle);
          title = correctTitle; // Use correct title for response
        }
      }
      
      if (!relatedData.query || !relatedData.query.pages) {
        return {
          content: [
            {
              type: "text",
              text: `No page found for "${title}".`
            }
          ]
        };
      }

      const pages = Object.values(relatedData.query.pages) as any[];
      const page = pages[0];
      
      if (page.missing) {
        return {
          content: [
            {
              type: "text",
              text: `Page "${title}" does not exist.`
            }
          ]
        };
      }

      const related: any[] = [];
      
      // Add related links first (up to limit)
      if (page.links && page.links.length > 0) {
        for (const link of page.links.slice(0, limit)) {
          // Get summary for each link
          try {
            const linkSummary = await wikipediaServer.getPageSummary(link.title);
            if (linkSummary.query && linkSummary.query.pages) {
              const linkPages = Object.values(linkSummary.query.pages) as any[];
              const linkPage = linkPages[0];
              if (!linkPage.missing && linkPage.extract) {
                let summary = linkPage.extract;
                if (summary.length > 200) {
                  summary = summary.substring(0, 200) + "...";
                }
                
                related.push({
                  title: link.title,
                  summary: summary,
                  url: `https://${wikipediaServer['config'].language}.wikipedia.org/wiki/${encodeURIComponent(link.title.replace(/ /g, '_'))}`,
                  type: "link"
                });
              }
            }
          } catch (error) {
            // Skip links that fail to fetch
            continue;
          }
          
          if (related.length >= limit) break;
        }
      }
      
      // Fill remaining slots with categories
      const remaining = limit - related.length;
      if (remaining > 0 && page.categories && page.categories.length > 0) {
        for (const category of page.categories.slice(0, remaining)) {
          const cleanCategory = category.title.replace("Category:", "");
          related.push({
            title: cleanCategory,
            type: "category"
          });
        }
      }

      let response = `# Related Topics for "${title}"\n\n`;
      response += `Found ${related.length} related topics:\n\n`;
      
      for (const item of related) {
        response += `## ${item.title}\n`;
        response += `**Type:** ${item.type}\n`;
        if (item.summary) {
          response += `**Summary:** ${item.summary}\n`;
        }
        if (item.url) {
          response += `**URL:** ${item.url}\n`;
        }
        response += '\n';
      }

      return {
        content: [
          {
            type: "text",
            text: response
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error getting related topics: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  }
);


// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Wikipedia MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});