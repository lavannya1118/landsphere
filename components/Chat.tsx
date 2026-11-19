'use client';

import {useEffect, useRef, useState} from 'react';
import {Bot, Mic, Plus, Send, Volume2, X} from 'lucide-react';
import {useStore} from '@/lib/store';
import {Language, useLanguage} from '@/lib/language';

type ChatMessage = {r: 'user' | 'ai'; t: string};
type RecognitionResult = {results: ArrayLike<ArrayLike<{transcript: string}>>};
type SpeechRecognitionLike = {
  lang: string;
  onresult: ((event: RecognitionResult) => void) | null;
  start: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

export function ChatBody({lang}: {lang: Language}) {
  const {t} = useLanguage();
  const [messages, setMessages] = useStore<ChatMessage[]>(
    `chat_${lang}`,
    [{r: 'ai', t: t('chatGreeting')}],
  );
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({behavior: 'smooth', block: 'end'});
  }, [messages, busy]);

  const send = async (text = question) => {
    if (!text.trim() || busy) return;

    const updatedMessages = [...messages, {r: 'user' as const, t: text.trim()}];
    setMessages(updatedMessages);
    setQuestion('');
    setBusy(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({messages: updatedMessages.slice(-10), lang}),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        const errorMessage =
          data &&
          typeof data === 'object' &&
          'error' in data &&
          typeof data.error === 'string'
            ? data.error
            : t('chatError');
        throw new Error(errorMessage);
      }

      if (
        !data ||
        typeof data !== 'object' ||
        !('reply' in data) ||
        typeof data.reply !== 'string'
      ) {
        throw new Error(t('chatError'));
      }

      setMessages([...updatedMessages, {r: 'ai', t: data.reply}]);
    } catch (error) {
      console.error('Chat request failed.', error);
      setMessages([
        ...updatedMessages,
        {r: 'ai', t: error instanceof Error ? error.message : t('chatError')},
      ]);
    } finally {
      setBusy(false);
    }
  };

  const startNewChat = () => {
    setQuestion('');
    setMessages([{r: 'ai', t: t('chatGreeting')}]);
  };

  const startVoiceInput = () => {
    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      alert(t('voiceUnavailable'));
      return;
    }

    const recognition = new Recognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
    recognition.onresult = event => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) void send(transcript);
    };
    recognition.start();
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
    speechSynthesis.speak(utterance);
  };

  const suggestions = [t('suggestFind'), t('suggestExtract'), t('suggestDispute')];
  const isNewConversation = messages.every(message => message.r === 'ai');

  return (
    <div className="flex h-full min-h-0 flex-col" lang={lang}>
      <header className="flex items-center justify-between gap-3 border-b border-sage px-4 py-3 dark:border-white/10">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald/10 text-emerald">
            <Bot size={20} aria-hidden="true"/>
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-semibold">LandSphere Chat</h1>
            <p className="text-xs text-slate-500 dark:text-sage">{t('chatNotice')}</p>
          </div>
        </div>
        <button
          type="button"
          className="btn !px-3 !py-2"
          onClick={startNewChat}
          disabled={busy}
          aria-label={t('newChat')}
          title={t('newChat')}
        >
          <Plus size={16} aria-hidden="true"/>
          <span className="hidden sm:inline">{t('newChat')}</span>
        </button>
      </header>

      <div
        className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.r}-${index}`}
            className={`flex ${message.r === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.r === 'user'
                  ? 'bg-navy text-white'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-sage'
              }`}
            >
              {message.r === 'ai' && (
                <p className="mb-1 text-[11px] font-semibold text-emerald">LandSphere Chat</p>
              )}
              <p className="whitespace-pre-wrap break-words">{message.t}</p>
              {message.r === 'ai' && (
                <button
                  type="button"
                  aria-label={t('speakAnswer')}
                  title={t('speakAnswer')}
                  onClick={() => speak(message.t)}
                  className="mt-2 inline-flex items-center gap-1 text-xs opacity-70 hover:opacity-100"
                >
                  <Volume2 size={13} aria-hidden="true"/>
                  {t('speakAnswer')}
                </button>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div role="status" className="flex items-center gap-2 text-sm text-slate-500 dark:text-sage">
            <span className="size-2 animate-bounce rounded-full bg-emerald"/>
            {t('thinking')}
          </div>
        )}

        {isNewConversation && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map(suggestion => (
              <button
                key={suggestion}
                type="button"
                disabled={busy}
                onClick={() => void send(suggestion)}
                className="rounded-full border border-sage px-3 py-2 text-xs transition hover:border-emerald hover:text-emerald dark:border-white/15"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <div ref={end}/>
      </div>

      <div className="border-t border-sage p-3 dark:border-white/10">
        <div className="flex items-end gap-2">
          <textarea
            lang={lang}
            maxLength={4000}
            rows={1}
            className="inp min-h-11 max-h-32 resize-y"
            value={question}
            onChange={event => setQuestion(event.currentTarget.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void send();
              }
            }}
            placeholder={t('chatPlaceholder')}
            aria-label={t('chatPlaceholder')}
          />
          <button
            type="button"
            aria-label={t('voiceInput')}
            title={t('voiceInput')}
            className="btn"
            disabled={busy}
            onClick={startVoiceInput}
          >
            <Mic size={16} aria-hidden="true"/>
          </button>
          <button
            type="button"
            aria-label={t('send')}
            title={t('send')}
            className="btn2"
            disabled={busy || !question.trim()}
            onClick={() => void send()}
          >
            <Send size={16} aria-hidden="true"/>
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-500 dark:text-sage">
          {t('chatNotice')}
        </p>
      </div>
    </div>
  );
}

export default function Chat() {
  const [open, setOpen] = useState(false);
  const {language, t} = useLanguage();

  return (
    <>
      <button
        type="button"
        aria-label={open ? t('closeChat') : t('openChat')}
        aria-expanded={open}
        aria-controls="chat-panel"
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 rounded-full bg-emerald p-4 text-white shadow-lg"
      >
        {open ? <X aria-hidden="true"/> : <Bot aria-hidden="true"/>}
      </button>
      {open && (
        <aside
          id="chat-panel"
          aria-label={t('chat')}
          className="fixed bottom-20 right-5 z-50 flex h-[30rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-sage bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950"
        >
          <ChatBody lang={language} key={language}/>
        </aside>
      )}
    </>
  );
}
