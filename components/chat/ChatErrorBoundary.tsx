"use client";
import { Component, type ReactNode } from "react";

/**
 * Fängt Fehler beim Anzeigen eines einzelnen Chats ab (z. B. aus einer beschädigten Import-Datei): Statt einer
 * weißen Seite erscheint ein Hinweis, Seitenleiste und Eingabe bleiben nutzbar. Mit neuem `key` (anderer Chat)
 * beginnt die Anzeige von vorn.
 */
export class ChatErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Chat konnte nicht angezeigt werden", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
