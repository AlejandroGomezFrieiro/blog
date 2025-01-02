import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4.0 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
    configuration: {
        pageTitle: "🪴 A quantum garden",
        pageTitleSuffix: "",
        enableSPA: true,
        enablePopovers: true,
        analytics: {
            provider: "plausible",
        },
        locale: "en-US",
        baseUrl: "alejandrogomezfrieiro.github.io",
        ignorePatterns: ["private", "templates", ".obsidian"],
        defaultDateType: "created",
        generateSocialImages: false,
        theme: {
            fontOrigin: "googleFonts",
            cdnCaching: true,
            typography: {
                header: "DM Serif Display",
                body: "Bricolage Grotesque",
                code: "JetBrains Mono",
            },
            colors: {
                lightMode: {
                    light: "#faf8f8",
                    lightgray: "#e5e5e5",
                    gray: "#b8b8b8",
                    darkgray: "#4e4e4e",
                    dark: "#2b2b2b",
                    secondary: "#284b63",
                    tertiary: "#84a59d",
                    highlight: "rgba(143, 159, 169, 0.15)",
                    textHighlight: "#fff23688",
                },
                darkMode: {
                    light: "#303446", //Background, main color
                    lightgray: "#414559", // search bar and borders
                    gray: "#303446",
                    darkgray: "#c6d0f5", // Main text
                    dark: "#a6d189", // Headers, text highlight green
                    secondary: "#e78284", // Links
                    tertiary: "#babbf1",
                    highlight: "#232634", // Tags, text highlight
                    textHighlight: "#232634", // Markdown highlight
                },
            },
        },
    },
    plugins: {
        transformers: [
            Plugin.FrontMatter(),
            Plugin.CreatedModifiedDate({
                priority: ["frontmatter", "filesystem"],
            }),
            Plugin.SyntaxHighlighting({
                theme: {
                    light: "github-light",
                    dark: "github-dark",
                },
                keepBackground: false,
            }),
            Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
            Plugin.GitHubFlavoredMarkdown(),
            Plugin.TableOfContents(),
            Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
            Plugin.Description(),
            Plugin.Latex({ renderEngine: "katex" }),
        ],
        filters: [Plugin.RemoveDrafts()],
        emitters: [
            Plugin.AliasRedirects(),
            Plugin.ComponentResources(),
            Plugin.ContentPage(),
            Plugin.FolderPage(),
            Plugin.TagPage(),
            Plugin.ContentIndex({
                enableSiteMap: true,
                enableRSS: true,
            }),
            Plugin.Assets(),
            Plugin.Static(),
            Plugin.NotFoundPage(),
        ],
    },
}

export default config
