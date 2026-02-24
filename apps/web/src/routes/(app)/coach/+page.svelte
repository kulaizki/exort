<script lang="ts">
	import { tick } from 'svelte';
	import { deserialize } from '$app/forms';
	import { Markdown, ThinkingIndicator } from '$lib/features/coach';

	let { data } = $props();

	type ChatMessage = { id: string; role: 'USER' | 'ASSISTANT'; content: string; createdAt: string };
	type ChatSession = { id: string; title?: string; createdAt: string; messages?: ChatMessage[] };

	let sessions = $state<ChatSession[]>(data.sessions ?? []);
	let activeSessionId = $state<string | null>(null);
	let messages = $state<ChatMessage[]>([]);
	let input = $state('');
	let loading = $state(false);
	let showSessions = $state(false);
	let messagesEnd = $state<HTMLDivElement>();
	let textareaEl: HTMLTextAreaElement;

	// Streaming state
	let streamingMessageId = $state<string | null>(null);
	let activeToolCall = $state<string | null>(null);

	async function callAction<T = Record<string, unknown>>(action: string, fields: Record<string, string> = {}): Promise<T | null> {
		const formData = new FormData();
		for (const [key, value] of Object.entries(fields)) {
			formData.set(key, value);
		}
		const res = await fetch(`?/${action}`, { method: 'POST', body: formData });
		const result = deserialize(await res.text());
		if (result.type === 'success') return result.data as T;
		return null;
	}

	async function scrollToBottom() {
		await tick();
		messagesEnd?.scrollIntoView({ behavior: 'smooth' });
	}

	function resizeTextarea() {
		if (!textareaEl) return;
		if (input) {
			textareaEl.style.height = '48px';
			textareaEl.style.height = `${Math.min(textareaEl.scrollHeight, 120)}px`;
		} else {
			textareaEl.style.height = '48px';
		}
	}

	async function ensureSession(): Promise<string | null> {
		if (activeSessionId) return activeSessionId;
		const result = await callAction<{ session: ChatSession }>('createSession');
		if (!result?.session) return null;
		sessions = [result.session, ...sessions];
		activeSessionId = result.session.id;
		return result.session.id;
	}

	async function selectSession(id: string) {
		activeSessionId = id;
		const result = await callAction<{ messages: ChatMessage[] }>('loadMessages', { sessionId: id });
		messages = result?.messages ?? [];
		showSessions = false;
		scrollToBottom();
	}

	async function newChat() {
		activeSessionId = null;
		messages = [];
		showSessions = false;
	}

	async function deleteSession(id: string) {
		await callAction('deleteSession', { sessionId: id });
		sessions = sessions.filter((s) => s.id !== id);
		if (activeSessionId === id) {
			activeSessionId = null;
			messages = [];
		}
	}

	async function sendMessage() {
		if (!input.trim() || loading) return;

		const content = input.trim();
		input = '';
		loading = true;
		if (textareaEl) textareaEl.style.height = '48px';

		const sessionId = await ensureSession();
		if (!sessionId) {
			loading = false;
			return;
		}

		// Add user message
		messages = [...messages, { id: crypto.randomUUID(), role: 'USER', content, createdAt: new Date().toISOString() }];
		scrollToBottom();

		const isFirstMessage = messages.length === 1;

		// Add empty assistant message for streaming
		const assistantId = crypto.randomUUID();
		messages = [...messages, { id: assistantId, role: 'ASSISTANT', content: '', createdAt: new Date().toISOString() }];
		streamingMessageId = assistantId;
		scrollToBottom();

		try {
			const response = await fetch('/coach/stream', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId, content })
			});

			if (!response.ok || !response.body) throw new Error('Stream failed');

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop()!;

				for (const line of lines) {
					if (!line.startsWith('data: ')) continue;
					const raw = line.slice(6);
					if (raw === '[DONE]') continue;

					try {
						const event = JSON.parse(raw);

						if (event.type === 'text') {
							messages = messages.map((m) =>
								m.id === assistantId
									? { ...m, content: m.content + event.content }
									: m
							);
							activeToolCall = null;
							scrollToBottom();
						} else if (event.type === 'tool_call') {
							activeToolCall = event.label;
						} else if (event.type === 'tool_result') {
							activeToolCall = null;
						}
					} catch {
						// skip malformed events
					}
				}
			}
		} catch {
			messages = messages.map((m) =>
				m.id === assistantId
					? { ...m, content: m.content || 'Sorry, something went wrong. Please try again.' }
					: m
			);
		} finally {
			loading = false;
			streamingMessageId = null;
			activeToolCall = null;

			// Refresh sessions for auto-generated title
			if (isFirstMessage) {
				setTimeout(async () => {
					const res = await callAction<{ sessions: ChatSession[] }>('loadSessions');
					if (res?.sessions) sessions = res.sessions;
				}, 2000);
			}
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	async function handleSuggestedPrompt(prompt: string) {
		input = prompt;
		await sendMessage();
	}

	const suggestedPrompts = [
		'What are my biggest weaknesses?',
		'How can I improve my endgame?',
		'Analyze my opening repertoire',
		'What patterns lead to my blunders?'
	];

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function formatTime(dateStr: string) {
		return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
	}
</script>

<svelte:head>
	<title>coach — exort</title>
</svelte:head>

<div class="flex h-[calc(100dvh-3.5rem)] lg:h-screen">
	<!-- Chat area -->
	<div class="flex flex-1 flex-col">
		<!-- Chat header -->
		<div class="flex shrink-0 items-center justify-between px-4 py-2.5">
			<div class="flex items-center gap-2">
				<svg class="h-4 w-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
				<span class="text-sm font-medium text-neutral-200">Coach</span>
			</div>
			<div class="flex items-center gap-1.5">
				<button
					onclick={newChat}
					class="cursor-pointer rounded-sm p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-gold"
					aria-label="New chat"
					title="New chat"
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
				</button>
				<button
					onclick={() => (showSessions = !showSessions)}
					class="cursor-pointer rounded-sm p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200
						{showSessions ? 'bg-neutral-800 text-neutral-200' : ''}"
					aria-label="Toggle history"
					title="Chat history"
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
				</button>
			</div>
		</div>

		<!-- Messages -->
		<div class="custom-scrollbar flex-1 overflow-y-auto">
			<div class="mx-auto max-w-4xl px-4 py-6">
				{#if messages.length === 0}
					<!-- Empty state -->
					<div class="flex flex-col items-center justify-center pt-[15vh] text-center">
						<div class="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
							<svg class="h-7 w-7 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
						</div>
						<h2 class="text-xl font-semibold text-neutral-200">Chess Coach</h2>
						<p class="mt-2 max-w-xs text-sm text-neutral-500">
							Get personalized coaching based on your game history, accuracy trends, and common mistakes
						</p>

						<div class="mt-8 flex flex-wrap justify-center gap-2">
							{#each suggestedPrompts as prompt (prompt)}
								<button
									onclick={() => handleSuggestedPrompt(prompt)}
									class="cursor-pointer rounded-sm border border-neutral-700 bg-neutral-800/50 px-3 py-2 text-xs text-neutral-300 transition-colors hover:border-gold/30 hover:bg-neutral-800 sm:text-sm"
								>
									{prompt}
								</button>
							{/each}
						</div>
					</div>
				{:else}
					<!-- Message list -->
					<div class="space-y-6">
						{#each messages as msg (msg.id)}
							{@const isUser = msg.role === 'USER'}
							{@const isStreaming = msg.id === streamingMessageId}
							<div class="flex gap-3 {isUser ? 'flex-row-reverse' : 'flex-row'}">
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm
										{isUser ? 'bg-gold' : 'bg-neutral-800'}"
								>
									{#if isUser}
										<svg class="h-4 w-4 text-neutral-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
									{:else}
										<svg class="h-4 w-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
									{/if}
								</div>

								<div class="space-y-1 {isUser ? 'flex max-w-[85%] flex-col items-end' : 'min-w-0 max-w-[90%]'}">
									<div class="flex items-center gap-2">
										<span class="text-xs font-medium text-neutral-500">{isUser ? 'You' : 'Coach'}</span>
										<span class="text-xs text-neutral-600">{formatTime(msg.createdAt)}</span>
									</div>
									<div
										class="rounded-sm px-4 py-3 text-sm
											{isUser ? 'bg-gold/10 text-neutral-200' : 'border border-neutral-800 bg-neutral-900 text-neutral-300'}"
									>
										{#if isUser}
											<p class="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
										{:else if isStreaming && !msg.content}
											<ThinkingIndicator label={activeToolCall} />
										{:else if isStreaming}
											<Markdown content={msg.content} />
											<span class="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-gold/60"></span>
										{:else}
											<Markdown content={msg.content} />
										{/if}
									</div>
								</div>
							</div>
						{/each}

						<div bind:this={messagesEnd}></div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Input area (always visible) -->
		<div class="shrink-0 border-t border-neutral-800">
			<div class="mx-auto max-w-4xl px-4 pt-3">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						sendMessage();
					}}
				>
					<div class="flex items-end rounded-sm border border-neutral-700 bg-neutral-800 transition-colors focus-within:border-gold">
						<textarea
							bind:this={textareaEl}
							bind:value={input}
							oninput={resizeTextarea}
							onkeydown={handleKeydown}
							placeholder="Ask your chess coach..."
							rows={1}
							disabled={loading}
							style="height: 48px"
							class="min-h-[48px] max-h-[120px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none disabled:opacity-50"
						></textarea>
						<button
							type="submit"
							disabled={!input.trim() || loading}
							class="m-1.5 cursor-pointer rounded-sm bg-gold p-2 text-neutral-950 transition-all hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-30"
						>
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
							<span class="sr-only">Send message</span>
						</button>
					</div>
					<p class="mt-2 hidden pb-3 text-center text-xs text-neutral-600 sm:block">
						Press Enter to send, Shift+Enter for new line
					</p>
					<div class="pb-3 sm:hidden"></div>
				</form>
			</div>
		</div>
	</div>

	<!-- Session panel (right side) -->
	<div
		class="shrink-0 overflow-hidden border-l border-neutral-800 transition-[width] duration-300 ease-in-out
			{showSessions ? 'w-full lg:w-72' : 'w-0 border-l-0'}"
	>
		<div class="flex h-full w-full flex-col bg-neutral-950 lg:w-72">
			<div class="flex items-center justify-between p-3">
				<p class="text-xs font-medium uppercase tracking-wider text-neutral-500">History</p>
				<button
					onclick={() => (showSessions = false)}
					class="cursor-pointer rounded-sm p-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 lg:hidden"
					aria-label="Close history"
				>
					<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				</button>
			</div>

			<div class="custom-scrollbar flex-1 overflow-y-auto p-2">
				<div class="space-y-0.5">
					{#each sessions as session (session.id)}
						<div
							class="group flex w-full items-center rounded-sm text-sm transition-colors
								{activeSessionId === session.id ? 'bg-gold/10 text-gold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}"
						>
							<button
								onclick={() => selectSession(session.id)}
								class="min-w-0 flex-1 cursor-pointer px-3 py-2 text-left"
							>
								<p class="truncate">{session.title || 'Untitled'}</p>
								<p class="text-xs text-neutral-600">{formatDate(session.createdAt)}</p>
							</button>
							<button
								onclick={() => deleteSession(session.id)}
								class="mr-2 shrink-0 cursor-pointer text-neutral-700 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
								aria-label="Delete conversation"
							>
								<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
							</button>
						</div>
					{/each}

					{#if sessions.length === 0}
						<p class="px-3 py-6 text-center text-xs text-neutral-600">No conversations yet</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
