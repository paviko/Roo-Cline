import { ToolArgs } from "./types"

export function getSearchAndReplaceDescription(args: ToolArgs): string {
	return `## search_and_replace
Description: Request to perform search and replace operations on a file. Each operation can specify a search pattern (string or regex) and replacement text, with optional line range restrictions and regex flags. Shows a diff preview before applying changes.
Parameters:
- <path>: (required) The path of the file to modify (relative to the current working directory ${args.cwd.toPosix()})
- <operations>: (required) A JSON array of search/replace operations. Each operation is an object with:
    * <search>: (required) The text or pattern to search for as raw string
    * <replace>: (required) The text to replace matches with as raw string
    * <start_line>: (optional) Starting line number for restricted replacement
    * <end_line>: (optional) Ending line number for restricted replacement
    * <use_regex>: (optional) Set to "true" to treat <search> as a regex pattern
    * <ignore_case>: (optional) Set to "true" to ignore case when matching
    * <regex_flags>: (optional) Additional regex flags when use_regex is true
Usage:
<search_and_replace>
<path>File path here</path>
<operations>
<operation>
<search>
text to find
</search>
<replace>
replacment text
</replace>
<start_line>1</start_line>
<end_line>10</end_line>
</operation>
</operations>
</search_and_replace>
Example: Replace "foo" with "bar" in lines 1-10 of example.ts
<search_and_replace>
<path>example.ts</path>
<operations>
<operation>
<search>
foo
</search>
<replace>
bar
</replace>
<start_line>1</start_line>
<end_line>10</end_line>
</operation>
</operations>
</search_and_replace>
Example: Replace all occurrences of "old" with "new" using regex
<search_and_replace>
<path>example.ts</path>
<operations>
<operation>
<search>
old\\w+
</search>
<replace>
new$&
</replace>
<use_regex>true</use_regex>
<ignore_case>true</ignore_case>
</operation>
</operations>
</search_and_replace>`
}
