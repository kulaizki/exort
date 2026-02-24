<script lang="ts">
  import { marked } from 'marked';

  let { content }: { content: string } = $props();

  const renderer = new marked.Renderer();
  const originalTable = renderer.table.bind(renderer);
  renderer.table = function (token) {
    return `<div class="table-wrapper">${originalTable(token)}</div>`;
  };

  marked.setOptions({ breaks: true, gfm: true, renderer });

  let html = $derived(marked.parse(content) as string);
</script>

<div class="markdown-content text-sm text-neutral-300">
  {@html html}
</div>

<style>
  .markdown-content :global(strong) {
    color: #e5e5e5;
    font-weight: 600;
  }

  .markdown-content :global(p) {
    margin-bottom: 0.75rem;
    line-height: 1.625;
  }

  .markdown-content :global(p:last-child) {
    margin-bottom: 0;
  }

  .markdown-content :global(a) {
    color: #ffb800;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .markdown-content :global(a:hover) {
    color: #ffc933;
  }

  .markdown-content :global(ul) {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .markdown-content :global(ol) {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .markdown-content :global(li) {
    margin-bottom: 0.25rem;
    line-height: 1.625;
  }

  .markdown-content :global(pre) {
    background-color: #171717;
    border: 1px solid #262626;
    border-radius: 4px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.75rem;
    overflow-x: auto;
  }

  .markdown-content :global(pre code) {
    background: none;
    padding: 0;
    font-size: 0.8125rem;
    color: #d4d4d4;
  }

  .markdown-content :global(code) {
    background-color: #262626;
    border-radius: 4px;
    padding: 0.125rem 0.375rem;
    font-size: 0.8125rem;
    color: #d4d4d4;
  }

  .markdown-content :global(.table-wrapper) {
    overflow-x: auto;
    margin-bottom: 0.75rem;
  }

  .markdown-content :global(table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
    white-space: nowrap;
  }

  .markdown-content :global(th) {
    background-color: #1a1a1a;
    border: 1px solid #262626;
    padding: 0.5rem 0.75rem;
    text-align: left;
    font-weight: 600;
    color: #e5e5e5;
  }

  .markdown-content :global(td) {
    border: 1px solid #262626;
    padding: 0.5rem 0.75rem;
  }

  .markdown-content :global(blockquote) {
    border-left: 3px solid #ffb800;
    padding-left: 1rem;
    margin-bottom: 0.75rem;
    color: #a3a3a3;
    font-style: italic;
  }

  .markdown-content :global(h1),
  .markdown-content :global(h2),
  .markdown-content :global(h3),
  .markdown-content :global(h4) {
    color: #e5e5e5;
    font-weight: 600;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
  }

  .markdown-content :global(h1) {
    font-size: 1.25rem;
  }

  .markdown-content :global(h2) {
    font-size: 1.125rem;
  }

  .markdown-content :global(h3) {
    font-size: 1rem;
  }

  .markdown-content :global(hr) {
    border: none;
    border-top: 1px solid #262626;
    margin: 1rem 0;
  }
</style>
