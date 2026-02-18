<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	type ChatMessage = { id: string; role: 'USER' | 'ASSISTANT'; content: string; createdAt: string };
	type ChatSession = { id: string; title?: string; createdAt: string; messages?: ChatMessage[] };

	let sessions = $state<ChatSession[]>(data.sessions ?? []);
	let activeSessionId = $state<string | null>(null);
	let messages = $state<ChatMessage[]>([]);
	let input = $state('');
	let loading = $state(false);
	let showSessions = $state(true);

	const token = $derived(data.token);

	async function apiFetch(path: string, options?: RequestInit) {
		const res = await fetch(`http://localhost:3001${path}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				...options?.headers
			}
		});
		return res.json();
	}

	async function createSession() {
		const session = await apiFetch('/chat/sessions', {
			method: 'POST',
			body: JSON.stringify({ title: 'New conversation' })
		});
		sessions = [session, ...sessions];
		await selectSession(session.id);
	}

	async function selectSession(id: string) {
		activeSessionId = id;
		const data = await apiFetch(`/chat/sessions/${id}/messages`);
		messages = data ?? [];
		showSessions = false;
	}

	async function deleteSession(id: string) {
		await apiFetch(`/chat/sessions/${id}`, { method: 'DELETE' });
		sessions = sessions.filter((s) => s.id !== id);
		if (activeSessionId === id) {
			activeSessionId = null;
			messages = [];
		}
	}

	async function sendMessage() {
		if (!input.trim() || !activeSessionId || loading) return;

		const content = input.trim();
		input = '';
		loading = true;

		messages = [...messages, { id: crypto.randomUUID(), role: 'USER', content, createdAt: new Date().toISOString() }];

		try {
			const result = await apiFetch(`/chat/sessions/${activeSessionId}/messages`, {
				method: 'POST',
				body: JSON.stringify({ content })
			});

			if (result?.assistantMessage) {
				messages = [...messages, result.assistantMessage];
			}
		} catch {
			messages = [...messages, { id: crypto.randomUUID(), role: 'ASSISTANT', content: 'Sorry, something went wrong. Please try again.', createdAt: new Date().toISOString() }];
		} finally {
			loading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	const suggestedPrompts = [
		'What are my biggest weaknesses?',
		'How can I improve my endgame?',
		'Analyze my opening repertoire',
		'What patterns lead to my blunders?'
	];

	function formatTime(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>coach — exort</title>
</svelte:head>

<div class="flex h-[calc(100vh-theme(spacing.20))] flex-col lg:h-[calc(100vh-theme(spacing.12))]">
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-neutral-800 pb-4">
		<div class="flex items-center gap-3">
			<button
				onclick={() => (showSessions = !showSessions)}
				class="cursor-pointer rounded-sm p-1.5 text-neutral-400 transition-colors hover:text-neutral-200 lg:hidden"
				aria-label="Toggle sessions"
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
			</button>
			<div>
				<h1 class="text-lg font-semibold text-neutral-200">Coach</h1>
				<p class="text-sm text-neutral-500">AI-powered chess coaching</p>
			</div>
		</div>
		<button
			onclick={createSession}
			class="cursor-pointer rounded-sm bg-gold px-3 py-1.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-gold-light"
		>
			New Chat
		</button>
	</div>

	<!-- Main area -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Session list -->
		<div class="w-full shrink-0 overflow-y-auto border-r border-neutral-800 lg:w-56 {showSessions ? 'block' : 'hidden lg:block'}">
			<div class="space-y-0.5 p-2">
				{#each sessions as session}
					<div class="flex w-full items-center justify-between rounded-sm text-sm transition-colors {activeSessionId === session.id ? 'bg-gold/10 text-gold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}">
						<button
							onclick={() => selectSession(session.id)}
							class="min-w-0 flex-1 cursor-pointer px-3 py-2 text-left"
						>
							<p class="truncate">{session.title || 'Untitled'}</p>
							<p class="text-xs text-neutral-600">{formatTime(session.createdAt)}</p>
						</button>
						<button
							onclick={() => deleteSession(session.id)}
							class="mr-2 shrink-0 cursor-pointer text-neutral-600 transition-colors hover:text-red-400"
							aria-label="Delete session"
						>
							<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
						</button>
					</div>
				{/each}

				{#if sessions.length === 0}
					<p class="px-3 py-4 text-center text-xs text-neutral-500">No conversations yet</p>
				{/if}
			</div>
		</div>

		<!-- Chat area -->
		<div class="flex flex-1 flex-col {showSessions ? 'hidden lg:flex' : 'flex'}">
			{#if activeSessionId}
				<!-- Messages -->
				<div class="flex-1 space-y-4 overflow-y-auto p-4">
					{#each messages as msg}
						<div class="flex {msg.role === 'USER' ? 'justify-end' : 'justify-start'}">
							<div class="max-w-[80%] rounded-sm px-4 py-2.5 {msg.role === 'USER' ? 'bg-gold/10 text-neutral-200' : 'border border-neutral-800 bg-neutral-900 text-neutral-300'}">
								<p class="whitespace-pre-wrap text-sm">{msg.content}</p>
							</div>
						</div>
					{/each}

					{#if loading}
						<div class="flex justify-start">
							<div class="rounded-sm border border-neutral-800 bg-neutral-900 px-4 py-2.5">
								<div class="flex gap-1">
									<span class="h-2 w-2 animate-bounce rounded-full bg-neutral-500" style="animation-delay: 0ms"></span>
									<span class="h-2 w-2 animate-bounce rounded-full bg-neutral-500" style="animation-delay: 150ms"></span>
									<span class="h-2 w-2 animate-bounce rounded-full bg-neutral-500" style="animation-delay: 300ms"></span>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Input -->
				<div class="border-t border-neutral-800 p-4">
					<div class="flex gap-2">
						<textarea
							bind:value={input}
							onkeydown={handleKeydown}
							placeholder="Ask your chess coach..."
							rows={1}
							class="flex-1 resize-none rounded-sm border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:border-gold focus:outline-none"
						></textarea>
						<button
							onclick={sendMessage}
							disabled={!input.trim() || loading}
							class="cursor-pointer rounded-sm bg-gold px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
						>
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
						<span class="sr-only">Send message</span>
						</button>
					</div>
				</div>
			{:else}
				<!-- Empty state with suggested prompts -->
				<div class="flex flex-1 flex-col items-center justify-center p-6 text-center">
					<div class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
						<svg class="h-8 w-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
					</div>
					<h2 class="text-lg font-semibold text-neutral-200">Chess Coach</h2>
					<p class="mt-2 max-w-sm text-sm text-neutral-500">
						Get personalized coaching based on your game history, accuracy trends, and common mistakes.
					</p>
					<div class="mt-6 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
						{#each suggestedPrompts as prompt}
							<button
								onclick={async () => { await createSession(); input = prompt; await sendMessage(); }}
								class="cursor-pointer rounded-sm border border-neutral-700 bg-neutral-800 px-4 py-3 text-left text-sm text-neutral-300 transition-colors hover:border-gold/30 hover:bg-neutral-700"
							>
								{prompt}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
